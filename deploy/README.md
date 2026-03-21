# 部署模板目录

本目录用于存放服务器部署时会直接用到的模板文件。

## 目录说明

- `env/`：生产环境变量和 Spring Boot 配置示例
- `nginx/`：Nginx 站点配置模板
- `systemd/`：Spring Boot 服务守护模板
- `scripts/`：构建和发布辅助脚本

## 推荐使用方式

1. 先阅读 [部署文档](../docs/development/2026-03-21-deployment-guide.md)
2. 再根据实际域名修改 `nginx/*.conf`
3. 根据实际数据库和腾讯 IM 参数修改 `env/application-prod.yml.example`
4. 使用 `scripts/build-release.sh` 生成前台、后台和 Spring Boot 的发布产物
5. 再将构建结果发布到服务器

## 说明

- 所有模板都是示例，不应直接把示例密码用于正式环境
- 正式环境建议把敏感信息迁移到环境变量、密钥平台或 CI/CD Secret
