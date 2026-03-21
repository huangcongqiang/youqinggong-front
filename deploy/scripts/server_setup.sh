#!/bin/bash
# 有轻工 server setup script
# Run this on the server as root
set -e

echo "========== [1/6] Update system =========="
apt-get update -y

echo "========== [2/6] Install Nginx =========="
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

echo "========== [3/6] Install Java 17 =========="
apt-get install -y openjdk-17-jdk 2>/dev/null || \
apt-get install -y default-jdk 2>/dev/null || \
(apt-get install -y wget && \
 wget -q https://download.java.net/java/GA/jdk17/0d483333a00540d886ef971547877c2b/35/GPL/openjdk-17_linux-x64_bin.tar.gz -O /tmp/jdk17.tar.gz && \
 tar -xzf /tmp/jdk17.tar.gz -C /opt/ && \
 ln -sf /opt/jdk-17/bin/java /usr/local/bin/java)

java -version

echo "========== [4/6] Create directories =========="
mkdir -p /srv/youqinggong/frontend
mkdir -p /srv/youqinggong/admin
mkdir -p /srv/youqinggong/backend/out
mkdir -p /var/log/youqinggong

echo "========== [5/6] Configure Nginx =========="
cat > /etc/nginx/sites-available/youqinggong.conf << 'NGINXEOF'
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
NGINXEOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/youqinggong.conf /etc/nginx/sites-enabled/youqinggong.conf
nginx -t && systemctl reload nginx

echo "========== [6/6] Setup done =========="
echo "Nginx: OK"
echo "Java: $(java -version 2>&1 | head -1)"
echo "Dirs: /srv/youqinggong/frontend, /srv/youqinggong/admin, /srv/youqinggong/backend"
echo ""
echo "Next: upload frontend/dist → /srv/youqinggong/frontend"
echo "      upload admin/dist   → /srv/youqinggong/admin"
echo "      upload backend java → /srv/youqinggong/backend"

