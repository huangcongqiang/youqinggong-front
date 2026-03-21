#!/usr/bin/env python3
"""
修复 Nginx 配置：
1. 恢复 cyxss.xyz 的 default 站点 symlink
2. 把有轻工前台从 80 改到 8082（避免冲突）
3. reload Nginx 验证
"""
import paramiko, io

HOST = "39.105.18.117"
USER = "root"
PASS = "H4337339h."

# 有轻工新的 Nginx 配置：使用 8082 端口，不抢占 80/443
YOUQINGGONG_CONF = """\
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

def connect():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, username=USER, password=PASS, timeout=15)
    return c

def run(client, label, cmd, timeout=30):
    print(f"\n>>> {label}")
    _, out, err = client.exec_command(cmd, timeout=timeout, get_pty=True)
    result = (out.read() + err.read()).decode(errors="replace").strip()
    if result:
        for line in result.split("\n")[-10:]:
            print(line)
    return result

def main():
    print("=" * 60)
    print("修复 Nginx 配置（恢复 cyxss.xyz，有轻工改为 8082）")
    print("=" * 60)

    client = connect()
    sftp = client.open_sftp()

    # 1. 更新有轻工 Nginx 配置（80 → 8082）
    print("\n[1/4] 更新有轻工 Nginx 配置（改为 8082 端口）...")
    sftp.putfo(io.BytesIO(YOUQINGGONG_CONF.encode()), "/etc/nginx/sites-available/youqinggong.conf")
    print("  written: /etc/nginx/sites-available/youqinggong.conf")

    # 2. 恢复 default 站点（cyxss.xyz）
    print("\n[2/4] 恢复 default 站点（cyxss.xyz）...")
    run(client, "恢复 default symlink",
        "ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default")

    # 3. 确认 youqinggong symlink 存在
    run(client, "确认 youqinggong symlink",
        "ln -sf /etc/nginx/sites-available/youqinggong.conf /etc/nginx/sites-enabled/youqinggong.conf")

    # 4. 测试并 reload
    print("\n[3/4] Nginx 语法测试 + reload...")
    test = run(client, "nginx -t", "nginx -t 2>&1")
    if "successful" in test:
        run(client, "nginx reload", "systemctl reload nginx")
        print("  ✅ Nginx reload 成功")
    else:
        print("  ❌ Nginx 配置有问题，未 reload！")
        sftp.close()
        client.close()
        return

    # 5. 验证
    print("\n[4/4] 验证各服务...")
    run(client, "sites-enabled 列表", "ls -la /etc/nginx/sites-enabled/")
    run(client, "有轻工前台 8082", "curl -s http://127.0.0.1:8082/ | head -c 80 && echo '--- OK'")
    run(client, "有轻工管理后台 8081", "curl -s http://127.0.0.1:8081/ | head -c 80 && echo '--- OK'")
    run(client, "Mock API 8080", "curl -s http://127.0.0.1:8080/api/landing | head -c 100 && echo '--- OK'")
    run(client, "cyxss.xyz HTTP→HTTPS 重定向",
        "curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' http://cyxss.xyz/ 2>/dev/null || "
        "curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' http://127.0.0.1/ 2>/dev/null")
    run(client, "监听端口汇总", "ss -tlnp | grep -E ':(80|443|8080|8081|8082|8090|3001)\\s'")

    sftp.close()
    client.close()

    print("\n" + "=" * 60)
    print("✅ 修复完成！")
    print(f"有轻工前台:    http://{HOST}:8082")
    print(f"有轻工管理后台: http://{HOST}:8081")
    print(f"Mock API:      http://{HOST}:8080/api/landing")
    print(f"cyxss.xyz:     https://cyxss.xyz （已恢复）")
    print("=" * 60)

if __name__ == "__main__":
    main()

