# 主线 9 阶段一：认证与权限正式化

## 目标

- 让 `spring-app` 成为正式认证与权限事实源
- 移除前台主流程对 mock 登录态和宽松用户注入的依赖

## 范围

- `spring-app` 登录 / 注册 / `me` / 退出
- 密码哈希与正式凭据存储
- 前台 PC / H5 登录态读取正式化
- 关键接口角色边界与组织权限基础校验

## 当前状态

- 状态：`已完成`
- 当前默认下一步：切入主线 9 阶段二，继续补主写链里剩余的 fallback / demo / 审计缺口

## 本阶段实施项

1. 盘点当前 `spring-app` 已有 auth 能力与缺口，冻结正式 auth 合同
2. 补 `register / login / me / logout` 的正式链路与密码存储方案
3. 让 PC / H5 默认登录态切到 `spring-app`
4. 对前台主链接口做一轮 actor / role / audience / organization 边界校验
5. 用最小端到端回归确认企业端、人才端、后台管理三类身份都能正确隔离

## 本阶段结果

- `spring-app` 当前已支持 `enterprise / talent / admin` 三类 audience 的正式 `register / login / me / logout`
- 管理台前端当前已补最小登录页、登录态存储、路由守卫与退出流程
- `/api/admin/*` 当前必须走正式管理员 token，企业端 / 人才端 token 已不能访问后台管理主接口
- 管理台前端当前已默认切到 `spring-app`，不再裸连旧 `8080` mock API

## 验证

- `backend/spring-app`：`mvn -q -Dtest=AuthApiControllerPersistenceTest,AdminApiControllerAuthTest,ClaimApiControllerFlowTest test`
- `admin`：`npm run build`

## 完成条件

- `spring-app` 已提供正式登录 / 注册 / `me` / 退出
- 前台默认登录态已切到 `spring-app`
- 关键前台接口不再信任前端传入 `userId`
- 企业端 / 人才端 / 管理后台的角色边界清晰

## 最后一步

- 继续进入主线 9 阶段二：主写链补缺与审计补齐
