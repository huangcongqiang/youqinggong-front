# AI 人才协作市场开发文档

## 1. 开发目标

本文件用于说明当前工程如何继续开发、如何运行、如何扩展，以及后续团队接手时应遵循的约定。

## 2. 当前目录

```text
frontend/
admin/
backend/
docs/
```

其中 `backend` 再细分为：

```text
backend/src/main/java   当前可运行 mock API
backend/spring-app      Spring Boot 正式服务骨架
backend/sql             schema 与 seed
```

## 3. 本地运行

### frontend

```bash
cd frontend
npm install
npm run dev
```

当前重点页面：

- `/`
- `/enterprise`
- `/enterprise/onboarding`
- `/enterprise/publish`
- `/enterprise/talents`
- `/enterprise/talents/:slug`
- `/enterprise/messages`
- `/enterprise/workspace`
- `/enterprise/acceptance`
- `/talent`
- `/talent/onboarding`
- `/talent/tasks`
- `/talent/profile/:slug`
- `/talent/messages`
- `/talent/workspace`
- `/talent/acceptance`

### admin

```bash
cd admin
npm install
npm run dev
```

### backend

```bash
cd backend
mkdir -p out
javac -encoding UTF-8 -d out $(find src/main/java -name "*.java")
java -cp out com.youqinggong.api.Main
```

### backend/spring-app

```bash
cd backend/spring-app
mvn spring-boot:run
```

## 4. 开发约定

### frontend / admin

- 使用 Vue 3 组合式写法
- 页面与组件分层管理
- 样式以 CSS 变量和响应式布局为主
- 优先保留页面结构清晰度，不要堆过多装饰
- 协作相关页面优先保证时间线、附件状态、AI 巡检和信用信息可追踪
- 官网首页只负责介绍、案例、联系方式和角色入口
- 企业端与人才端在路由层分开，不要再把两个角色混在一个页面路径里
- 后台管理以列表为主，不要在主页面直接堆叠大型表单
- 后台交互优先使用操作栏、弹窗或抽屉处理新增、审核和流转

### backend

- 当前以 mock API 为主
- 后续迁移 Spring Boot 时保持路径不变，减少前端改动
- 数据模型优先和 SQL 保持一致
- `spring-app` 作为未来正式主服务继续扩展
- 当前 `spring-app` 已真实接入的范围：后台管理、入驻、任务生命周期、任务房间预览
- 当前 `spring-app` 仍保留 demo/fallback 的范围：官网展示、企业端工作台、人才端工作台、人才详情、任务广场

## 5. 推荐开发顺序

### 第一阶段

- 接入登录注册
- 完成企业入驻和个人实名认证
- 完成真实任务发布表单
- 完成真实文件上传

说明：

- 真实文件上传的推荐接口草案，已整理到
  [API 详细契约文档](../technical/2026-03-21-api-contract.md)

### 第二阶段

- 接入真实 AI 拆解
- 接入腾讯 IM
- 建立任务房间与消息列表
- 增加验收提醒与互评规则

当前已具备的交付开发版能力：

- 前台官网分流、企业端任务闭环演示、人才端接单闭环演示
- 后台管理审核与任务流转演示
- 风控工单状态操作
- mock API 与 Spring Boot 骨架同路径对齐
- Spring Boot 管理接口已接数据库实体与仓储
- Spring Boot 入驻与任务主链路已接数据库实体与仓储
- Spring Boot 任务房间预览可读取真实房间映射

### 第三阶段

- 支付结算
- 推荐算法
- 风控体系
- 数据看板与运营分析

## 6. 建议的接口开发顺序

详细接口字段、联调顺序和当前落库状态，以
[API 详细契约文档](../technical/2026-03-21-api-contract.md)
为准。

1. 用户与入驻
2. 任务发布
3. AI 拆解确认
4. 人才匹配
5. 协作与里程碑
6. 上传进度
7. 验收与评分
8. 腾讯 IM 消息联动

## 7. 测试建议

### 前端

- 检查 390px 左右移动端布局
- 检查 1440px 宽屏 PC 布局
- 检查页面跳转和接口 fallback
- 检查官网首页到企业端 / 人才端的入口跳转
- 检查企业端只看人才广场、人才端只看任务广场

### 后端

- 校验所有 `/api/*` 路由是否返回 JSON
- 校验 CORS 是否正常
- 校验 `POST /api/ai/decompose` 是否能读取 brief
- 校验 `GET /api/workspace` 和 `GET /api/tasks/{taskId}/closure` 是否能返回协作闭环数据
- 校验 `POST /api/onboarding/*`、`POST /api/tasks/*` 和 `GET /api/messages/task-room` 是否正确落库 / 读库

### 数据模型

- 检查任务与会话是否可映射
- 检查审核、评价、里程碑是否满足后续业务延展

## 8. 协作建议

- 新增页面前先补文档
- 新增核心字段前先同步 SQL
- 接入腾讯 IM 前先确认账号体系与任务房间策略
- 真实 AI 上线前先保留 mock 回退逻辑
- 调整后台交互时，优先保持“列表 -> 操作栏 -> 抽屉 / 弹窗”的统一模式

## 9. 后续交接说明

当前项目适合作为第一版演示底座继续扩展。若后续团队继续开发，建议先阅读以下文档：

1. 需求文档
2. 设计文档
3. 技术文档
4. SQL 表结构
5. 开发文档
