#!/usr/bin/env python3
"""
有轻工 一键部署脚本
流程：本地编译 → 打包 JAR → 上传产物 → 启动服务
Usage: python3 deploy/scripts/deploy.py
"""
import paramiko, os, sys, subprocess, glob, shutil, io

HOST = os.environ.get("YOUQINGGONG_DEPLOY_HOST", "")
USER = os.environ.get("YOUQINGGONG_DEPLOY_USER", "")
PASS = os.environ.get("YOUQINGGONG_DEPLOY_PASSWORD", "")
WORKSPACE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── Nginx 配置（不改动现有 cyxss.xyz / neo-runner） ──────────────────────
NGINX_CONF = """\
server {
    listen 8082;
    server_name _;

    root /srv/youqinggong/frontend;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 10s;
        proxy_read_timeout 30s;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 8081;
    server_name _;

    root /srv/youqinggong/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
"""

# ── 本地构建 ──────────────────────────────────────────────────────────────

def local_run(cmd, cwd, label):
    print(f"\n  $ {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stdout[-500:])
        print(result.stderr[-500:])
        print(f"❌ {label} 失败，退出")
        sys.exit(1)
    return result.stdout

def build_frontend():
    path = os.path.join(WORKSPACE, "frontend")
    local_run("npm install --silent", path, "frontend npm install")
    local_run("npm run build", path, "frontend build")
    dist = os.path.join(path, "dist")
    assert os.path.isdir(dist), "frontend/dist 不存在"
    print("  ✅ frontend/dist 构建完成")
    return dist

def build_admin():
    path = os.path.join(WORKSPACE, "admin")
    local_run("npm install --silent", path, "admin npm install")
    local_run("npm run build", path, "admin build")
    dist = os.path.join(path, "dist")
    assert os.path.isdir(dist), "admin/dist 不存在"
    print("  ✅ admin/dist 构建完成")
    return dist

def build_jar():
    """本地编译 Java → api.jar，不暴露源码到服务器"""
    src_root = os.path.join(WORKSPACE, "backend", "src", "main", "java")
    out_dir  = os.path.join(WORKSPACE, "backend", "build", "classes")
    jar_path = os.path.join(WORKSPACE, "backend", "build", "api.jar")
    os.makedirs(out_dir, exist_ok=True)

    java_files = glob.glob(os.path.join(src_root, "**", "*.java"), recursive=True)
    assert java_files, "没有找到 .java 文件"

    files_arg = " ".join(f'"{f}"' for f in java_files)
    local_run(f"javac -encoding UTF-8 -d \"{out_dir}\" {files_arg}",
              WORKSPACE, "javac 编译")

    local_run(f"jar cfe \"{jar_path}\" com.youqinggong.api.Main -C \"{out_dir}\" .",
              WORKSPACE, "jar 打包")

    assert os.path.isfile(jar_path), "api.jar 未生成"
    size_kb = os.path.getsize(jar_path) // 1024
    print(f"  ✅ api.jar 打包完成（{size_kb} KB）")
    return jar_path

# ── SSH / SFTP 工具 ───────────────────────────────────────────────────────

def connect():
    if not HOST or not USER:
        raise SystemExit("Missing YOUQINGGONG_DEPLOY_HOST or YOUQINGGONG_DEPLOY_USER")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    connect_kwargs = {
        "username": USER,
        "timeout": 15
    }
    if PASS:
        connect_kwargs["password"] = PASS
    c.connect(HOST, **connect_kwargs)
    return c

def ssh_run(client, label, cmd, timeout=60):
    print(f"\n  [{label}] {cmd[:70]}")
    _, out, err = client.exec_command(cmd, timeout=timeout, get_pty=True)
    result = (out.read() + err.read()).decode(errors="replace").strip()
    for line in result.split("\n")[-10:]:
        print("   ", line)
    return result

def upload_dir(sftp, local_dir, remote_dir):
    try:
        sftp.stat(remote_dir)
    except FileNotFoundError:
        sftp.mkdir(remote_dir)
    for item in os.listdir(local_dir):
        lp = os.path.join(local_dir, item)
        rp = remote_dir + "/" + item
        if os.path.isfile(lp):
            sftp.put(lp, rp)
        elif os.path.isdir(lp):
            upload_dir(sftp, lp, rp)

# ── 主流程 ────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("有轻工 一键部署脚本")
    print(f"目标服务器: {HOST}")
    print("=" * 60)

    # ── 第一阶段：本地构建（无需服务器）────────────────────────────────
    print("\n【第一阶段】本地构建")

    print("\n[1/3] 构建前台 frontend...")
    frontend_dist = build_frontend()

    print("\n[2/3] 构建管理后台 admin...")
    admin_dist = build_admin()

    print("\n[3/3] 编译 Java Mock API → api.jar...")
    jar_path = build_jar()

    # ── 第二阶段：上传产物到服务器 ──────────────────────────────────────
    print("\n【第二阶段】上传到服务器")

    print("\n连接服务器...")
    client = connect()
    sftp = client.open_sftp()
    print("  ✅ 连接成功")

    ssh_run(client, "创建目录",
            "mkdir -p /srv/youqinggong/frontend /srv/youqinggong/admin "
            "/srv/youqinggong/backend /var/log/youqinggong")

    print("\n[1/3] 上传 frontend/dist...")
    upload_dir(sftp, frontend_dist, "/srv/youqinggong/frontend")
    print("  ✅ frontend 上传完成")

    print("\n[2/3] 上传 admin/dist...")
    upload_dir(sftp, admin_dist, "/srv/youqinggong/admin")
    print("  ✅ admin 上传完成")

    print("\n[3/3] 上传 api.jar...")
    sftp.put(jar_path, "/srv/youqinggong/backend/api.jar")
    print("  ✅ api.jar 上传完成")

    # ── 第三阶段：配置 Nginx + 启动服务 ─────────────────────────────────
    print("\n【第三阶段】配置 Nginx + 启动服务")

    sftp.putfo(io.BytesIO(NGINX_CONF.encode()),
               "/etc/nginx/sites-available/youqinggong.conf")
    ssh_run(client, "nginx symlink",
            "ln -sf /etc/nginx/sites-available/youqinggong.conf "
            "/etc/nginx/sites-enabled/youqinggong.conf")
    ssh_run(client, "nginx -t", "nginx -t 2>&1")
    ssh_run(client, "nginx reload", "systemctl reload nginx")

    # 停旧进程，启动新的
    ssh_run(client, "停止旧 API",
            "pkill -f 'java.*api.jar' 2>/dev/null; sleep 1; echo done")
    ssh_run(client, "启动 API",
            "nohup java -jar /srv/youqinggong/backend/api.jar "
            "> /var/log/youqinggong/api.log 2>&1 & sleep 2 && echo PID=$!",
            timeout=15)
    ssh_run(client, "验证 API",
            "curl -s http://127.0.0.1:8080/api/landing | head -c 120 && echo ''")
    ssh_run(client, "验证前台",
            "curl -s http://127.0.0.1:8082/ | head -c 80 && echo ''")
    ssh_run(client, "验证后台",
            "curl -s http://127.0.0.1:8081/ | head -c 80 && echo ''")

    sftp.close()
    client.close()

    print("\n" + "=" * 60)
    print("✅ 部署完成！")
    print(f"  前台:    http://{HOST}:8082")
    print(f"  管理后台: http://{HOST}:8081")
    print(f"  API:     http://{HOST}:8080/api/landing")
    print("=" * 60)

if __name__ == "__main__":
    main()
