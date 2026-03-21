#!/usr/bin/env python3
"""
有轻工 服务器配置脚本 - 配置 Nginx 并启动 Mock API
Usage: python3 deploy/scripts/configure_server.py
"""
import paramiko, os

HOST = "39.105.18.117"
USER = "root"
PASS = "H4337339h."

NGINX_CONF = """\
server {
    listen 80 default_server;
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

START_API_SH = """\
#!/bin/bash
cd /srv/youqinggong/backend
echo "Compiling Java API..."
mkdir -p out
find src -name "*.java" | xargs javac -encoding UTF-8 -d out 2>&1
echo "Compile done. Starting API..."
pkill -f "com.youqinggong.api.Main" 2>/dev/null || true
sleep 1
nohup java -cp out com.youqinggong.api.Main > /var/log/youqinggong/api.log 2>&1 &
echo "API started, PID=$!"
sleep 2
curl -s http://127.0.0.1:8080/api/landing 2>&1 | head -c 200 && echo ""
echo "API check done"
"""

def connect():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, username=USER, password=PASS, timeout=15)
    return c

def run(client, cmd, timeout=60):
    print(f"\n>>> {cmd[:80]}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=True)
    out = (stdout.read() + stderr.read()).decode(errors="replace").strip()
    for l in out.split("\n")[-15:]:
        print(l)
    return out

def write_remote_file(sftp, remote_path, content):
    import io
    sftp.putfo(io.BytesIO(content.encode()), remote_path)
    print(f"  written: {remote_path}")

def main():
    print("=" * 60)
    print("有轻工 服务器配置脚本")
    print("=" * 60)

    client = connect()
    sftp = client.open_sftp()

    print("\n[1/4] 写入 Nginx 配置...")
    write_remote_file(sftp, "/etc/nginx/sites-available/youqinggong.conf", NGINX_CONF)
    run(client, "rm -f /etc/nginx/sites-enabled/default")
    run(client, "ln -sf /etc/nginx/sites-available/youqinggong.conf /etc/nginx/sites-enabled/youqinggong.conf")
    run(client, "nginx -t && systemctl reload nginx")

    print("\n[2/4] 写入启动脚本...")
    write_remote_file(sftp, "/srv/youqinggong/backend/start_api.sh", START_API_SH)
    run(client, "chmod +x /srv/youqinggong/backend/start_api.sh")

    print("\n[3/4] 编译并启动 Mock API...")
    run(client, "bash /srv/youqinggong/backend/start_api.sh", timeout=60)

    print("\n[4/4] 验证服务...")
    run(client, "curl -s http://127.0.0.1:80/ | head -c 100 && echo '--- frontend OK'")
    run(client, "curl -s http://127.0.0.1:8081/ | head -c 100 && echo '--- admin OK'")
    run(client, "curl -s http://127.0.0.1:8080/api/landing | head -c 200 && echo '--- api OK'")
    run(client, "systemctl status nginx | grep Active")

    sftp.close()
    client.close()

    print("\n" + "=" * 60)
    print("✅ 部署完成！")
    print(f"前台:    http://{HOST}")
    print(f"管理后台: http://{HOST}:8081")
    print(f"API:     http://{HOST}:8080/api/landing")
    print("=" * 60)

if __name__ == "__main__":
    main()

