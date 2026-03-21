# AI 人才协作市场部署文档

## 1. 目的

本文件用于指导项目后续部署到 Linux 服务器，覆盖前台、后台管理、Spring Boot 服务、MySQL、Nginx、systemd、日志、回滚和常见排查方式。

当前建议把它作为“开发版 / 预生产 / 正式环境”的统一部署底稿，后续只需要替换域名、账号密码和服务器路径即可。

仓库内已提供模板文件：

- [deploy/README.md](../../deploy/README.md)
- [deploy/env/application-prod.yml.example](../../deploy/env/application-prod.yml.example)
- [deploy/nginx/www.example.com.conf](../../deploy/nginx/www.example.com.conf)
- [deploy/nginx/ops.example.com.conf](../../deploy/nginx/ops.example.com.conf)
- [deploy/nginx/api.example.com.conf](../../deploy/nginx/api.example.com.conf)
- [deploy/systemd/youqinggong-spring.service](../../deploy/systemd/youqinggong-spring.service)
- [deploy/scripts/build-release.sh](../../deploy/scripts/build-release.sh)
- [frontend/.env.production.example](../../.env.production.example)
- [admin/.env.production.example](https://github.com/huangcongqiang/youqinggong-admin/blob/main/.env.production.example)

## 2. 推荐部署结构

推荐使用 3 个子域名，避免前台、后台和 API 的路径互相影响：

- `www.example.com`：前台官网 + 企业端 + 人才端
- `ops.example.com`：后台管理
- `api.example.com`：Spring Boot API

推荐服务划分：

- `frontend`：Vite 构建后静态文件，由 Nginx 托管
- `admin`：Vite 构建后静态文件，由 Nginx 托管
- `backend/spring-app`：Spring Boot 3 服务，由 systemd 托管
- `MySQL 8`：业务数据库
- `Nginx`：反向代理、静态资源、HTTPS

不建议正式环境继续使用根目录 `backend/src/main/java` 的 mock API。  
正式部署应优先使用 `backend/spring-app`。

## 3. 环境假设

默认按以下环境编写：

- 操作系统：Ubuntu 22.04 LTS 或同类 Linux
- JDK：17
- Maven：3.9+
- Node.js：20 LTS
- npm：10+
- MySQL：8.x
- Nginx：1.24+

如果你的服务器版本不同，命令可能有小差异，但整体流程不变。

## 4. 服务器目录建议

建议统一放到 `/srv/youqinggong`：

```text
/srv/youqinggong/
  frontend/                 前台 dist
  admin/                    管理台 dist
  backend/                  Spring Boot jar
  uploads/                  后续附件上传目录
  scripts/                  启停和发布脚本

/etc/youqinggong/
  application-prod.yml      Spring Boot 生产配置

/var/log/youqinggong/
  spring-app.log            应用日志
```

## 5. 首次安装依赖

```bash
sudo apt update
sudo apt install -y nginx mysql-server openjdk-17-jdk maven curl unzip
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

校验版本：

```bash
java -version
mvn -v
node -v
npm -v
mysql --version
nginx -v
```

## 6. 数据库初始化

### 6.1 创建数据库和账号

```sql
CREATE DATABASE youqinggong DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'youqinggong'@'%' IDENTIFIED BY 'replace-with-strong-password';
GRANT ALL PRIVILEGES ON youqinggong.* TO 'youqinggong'@'%';
FLUSH PRIVILEGES;
```

### 6.2 导入表结构和种子数据

```bash
cd /path/to/youqinggong/backend/sql
mysql -u youqinggong -p youqinggong < schema.sql
mysql -u youqinggong -p youqinggong < seed.sql
```

说明：

- `schema.sql` 是表结构
- `seed.sql` 是演示数据
- 正式环境如果不想导入演示数据，只执行 `schema.sql` 即可

## 7. Spring Boot 服务部署

### 7.1 生产构建

```bash
cd backend/spring-app
mvn clean package -DskipTests
```

生成后的 jar 一般在：

```text
backend/spring-app/target/youqinggong-spring-app-0.1.0.jar
```

拷贝到服务器目标目录：

```bash
sudo mkdir -p /srv/youqinggong/backend
sudo cp target/youqinggong-spring-app-0.1.0.jar /srv/youqinggong/backend/app.jar
```

### 7.2 生产配置文件

新建 `/etc/youqinggong/application-prod.yml`：

```yaml
server:
  port: 8080

spring:
  application:
    name: youqinggong-spring-app
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/youqinggong?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
    username: youqinggong
    password: replace-with-strong-password
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        format_sql: false
    show-sql: false

management:
  endpoints:
    web:
      exposure:
        include: health,info

app:
  tencent-im:
    sdk-app-id: 0
    admin-identifier: admin
    user-sig-secret: replace-with-real-secret
    callback-base-url: https://api.example.com/tencent-im/callback
```

说明：

- 不要把生产密码写死在仓库里
- 正式环境建议把数据库密码、腾讯 IM 密钥进一步迁到环境变量或密钥管理系统
- 仓库模板可直接参考 [deploy/env/application-prod.yml.example](../../deploy/env/application-prod.yml.example)

### 7.3 systemd 服务

新建 `/etc/systemd/system/youqinggong-spring.service`：

```ini
[Unit]
Description=YouQingGong Spring Boot Service
After=network.target mysql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/srv/youqinggong/backend
ExecStart=/usr/bin/java -jar /srv/youqinggong/backend/app.jar --spring.config.additional-location=/etc/youqinggong/application-prod.yml
SuccessExitStatus=143
Restart=always
RestartSec=5
StandardOutput=append:/var/log/youqinggong/spring-app.log
StandardError=append:/var/log/youqinggong/spring-app.log

[Install]
WantedBy=multi-user.target
```

启动：

```bash
sudo mkdir -p /var/log/youqinggong
sudo chown -R www-data:www-data /srv/youqinggong /var/log/youqinggong
sudo systemctl daemon-reload
sudo systemctl enable youqinggong-spring
sudo systemctl start youqinggong-spring
sudo systemctl status youqinggong-spring
```

查看日志：

```bash
tail -f /var/log/youqinggong/spring-app.log
```

## 8. 前台部署

### 8.1 生产环境变量

建议在 `frontend/.env.production` 中配置：

```bash
VITE_API_BASE=https://api.example.com/api
```

仓库模板：

- [frontend/.env.production.example](../../.env.production.example)

### 8.2 构建

```bash
cd frontend
npm install
npm run build
```

构建结果在：

```text
frontend/dist
```

发布到服务器：

```bash
sudo mkdir -p /srv/youqinggong/frontend
sudo cp -R dist/* /srv/youqinggong/frontend/
```

## 9. 后台管理部署

### 9.1 生产环境变量

建议在 `admin/.env.production` 中配置：

```bash
VITE_API_BASE=https://api.example.com/api
```

仓库模板：

- [admin/.env.production.example](https://github.com/huangcongqiang/youqinggong-admin/blob/main/.env.production.example)

### 9.2 构建

```bash
cd admin
npm install
npm run build
```

发布到服务器：

```bash
sudo mkdir -p /srv/youqinggong/admin
sudo cp -R dist/* /srv/youqinggong/admin/
```

## 10. Nginx 配置

推荐前台、后台、API 分三个 server block。

仓库模板目录：

- [deploy/nginx](../../deploy/nginx)

### 10.1 前台 `www.example.com`

```nginx
server {
    listen 80;
    server_name www.example.com;

    root /srv/youqinggong/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 10.2 后台管理 `ops.example.com`

```nginx
server {
    listen 80;
    server_name ops.example.com;

    root /srv/youqinggong/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 10.3 API `api.example.com`

```nginx
server {
    listen 80;
    server_name api.example.com;

    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/youqinggong-www.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/youqinggong-ops.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/youqinggong-api.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 11. HTTPS

建议用 Certbot：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d www.example.com -d ops.example.com -d api.example.com
```

完成后验证：

- `https://www.example.com`
- `https://ops.example.com`
- `https://api.example.com/actuator/health`

## 12. 发布顺序建议

正式发布时建议按下面顺序：

1. 备份数据库
2. 发布 Spring Boot 服务
3. 健康检查 API
4. 发布前台静态资源
5. 发布后台静态资源
6. 验证首页、企业端、人才端、后台管理、API 健康检查

如果需要先在本地或 CI 生成一份统一发布包，可以直接使用：

```bash
cd deploy/scripts
bash build-release.sh
```

脚本位置：

- [deploy/scripts/build-release.sh](../../deploy/scripts/build-release.sh)

## 13. 健康检查清单

### API

```bash
curl https://api.example.com/actuator/health
curl https://api.example.com/api/landing
curl https://api.example.com/api/business
curl https://api.example.com/api/talent
curl https://api.example.com/api/talents/marketplace
```

### 前台

- 官网首页是否正常打开
- 企业端入口是否可进入
- 人才端入口是否可进入
- 企业端是否只看人才广场
- 人才端是否只看任务广场

### 后台

- 看板是否可打开
- 用户列表是否可打开
- 任务列表是否可打开
- 风控工单是否可打开

## 14. 回滚方式

### 前台 / 后台

- 保留上一版 `dist` 目录备份
- 发布异常时直接切回上一版静态目录
- `nginx reload` 即可生效

### Spring Boot

- 保留上一版 `app.jar`
- 回滚时替换 jar 后重启服务

```bash
sudo systemctl restart youqinggong-spring
```

### MySQL

- 发布前做一次 `mysqldump`
- 结构变更前先确认回滚 SQL

## 15. 常见问题排查

### 前台打开空白页

优先检查：

- `VITE_API_BASE` 是否正确
- Nginx 是否用了 `try_files ... /index.html`
- 浏览器控制台是否有 404 / CORS / HTTPS 混用问题

### 后台接口 502

优先检查：

- `systemctl status youqinggong-spring`
- `/var/log/youqinggong/spring-app.log`
- `127.0.0.1:8080` 是否在监听

### 数据库连接失败

优先检查：

- `/etc/youqinggong/application-prod.yml`
- MySQL 用户权限
- 服务器防火墙
- `mysql -u youqinggong -p -h 127.0.0.1 youqinggong`

### 静态资源更新后页面没变化

优先检查：

- 是否拷贝到了正确目录
- 是否有 CDN 或浏览器缓存
- 是否真的执行了 `npm run build`

## 16. 当前阶段的部署建议

如果你现在就要把当前项目先部署到测试服务器，建议按下面方式：

- 前台：部署 `frontend`
- 后台：部署 `admin`
- 后端：优先部署 `backend/spring-app`
- 数据库：先导入 `schema.sql`，若需要演示数据再导入 `seed.sql`

如果只是演示页面联调，也可以先部署根目录 mock API。  
但只建议用于演示或测试，不建议作为正式环境长期运行。

## 17. 后续可继续补充的部署项

- Docker / Docker Compose 版本部署文档
- CI/CD 自动发布脚本
- 多环境配置拆分：dev / test / prod
- 对象存储部署方案
- Redis、消息队列、监控告警

## 18. 文档维护建议

后续每次发生以下变化时，建议同步更新本文件：

- 域名结构变化
- 端口变化
- 后端正式入口变化
- 新增文件上传、对象存储、Redis、登录鉴权
- 新增 Docker、CI/CD 或灰度发布方案
