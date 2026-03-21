#!/usr/bin/env python3
import paramiko

HOST = "39.105.18.117"
USER = "root"
PASS = "H4337339h."

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(HOST, username=USER, password=PASS, timeout=15)

def run(label, cmd):
    print(f"\n=== {label} ===")
    _, out, err = c.exec_command(cmd, timeout=30, get_pty=True)
    result = (out.read() + err.read()).decode(errors="replace").strip()
    print(result)
    return result

run("conf.d 目录", "ls -la /etc/nginx/conf.d/")
run("conf.d 内容", "cat /etc/nginx/conf.d/*.conf 2>/dev/null || echo '(无文件)'")
run("sites-available", "ls -la /etc/nginx/sites-available/")
run("sites-available 原 default 内容", "cat /etc/nginx/sites-available/default 2>/dev/null || echo '(无 default)'")
run("/var/www 目录", "ls -la /var/www/ 2>/dev/null || echo '(empty)'")
run("PM2 进程列表", "pm2 list 2>/dev/null || echo 'pm2 not in PATH'")
run("PM2 (full path)", "/root/.nvm/versions/node/$(ls /root/.nvm/versions/node/ 2>/dev/null | tail -1)/bin/pm2 list 2>/dev/null || pm2 list 2>/dev/null || echo 'pm2 not found'")
run("node 进程", "ps aux | grep -E 'node|pm2' | grep -v grep")
run("Port 8090 来源", "ss -tlnp | grep 8090")
run("Port 3001 来源", "ss -tlnp | grep 3001")
run("Port 80 原 default 站点备份", "cat /etc/nginx/sites-available/default 2>/dev/null | head -30 || echo '无 default'")

c.close()

