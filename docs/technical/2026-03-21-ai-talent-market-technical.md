# AI 人才协作市场技术文档

## 1. 技术目标

建立一套可持续扩展的 MVP 技术底座，在当前阶段兼顾：

- 可运行
- 可联调
- 可扩展
- 可迁移到真实生产实现

## 2. 项目结构

```text
frontend/   Vue 3 前台应用
admin/      Vue 3 管理后台
backend/    Java API + SQL
docs/       需求 / 设计 / 技术 / 开发文档
```

## 3. 前端技术方案

### frontend

- Vue 3
- Vue Router
- Vite 4
- 自定义 CSS 变量与响应式布局

职责：

- 官网首页
- 企业端工作台 / 发布任务 / 人才广场 / 项目沟通 / 协作空间 / 验收评分
- 人才端工作台 / 任务广场 / 项目沟通 / 协作空间 / 验收评分
- H5 / PC 响应式适配
- 通过路由层完成企业端与人才端分流

### admin

- Vue 3
- Vue Router
- Vite 4
- Element Plus
- PC 优先布局

职责：

- 经营看板
- 用户管理
- 任务管理
- 审核风控
- 列表主视图 + 右侧操作栏 + 抽屉交互
- 蓝色 / 深蓝 / 白色后台主题

## 4. 后端技术方案

当前实现：

- `backend/src/main/java`：JDK 17 + JDK 自带 `HttpServer`
- `backend/spring-app`：Spring Boot 3 + JPA + MySQL 骨架
- `backend/sql`：数据库结构与种子数据

当前进度补充：

- root mock API 仍承担本机可运行联调职责
- root mock API 已对齐官网首页、企业端 / 人才端分流、企业端推荐人才跳详情和人才广场结构
- `spring-app` 已让后台管理接口走 JPA Repository + Entity 读写
- `spring-app` 已让企业 / 人才入驻、任务生命周期、任务房间预览走 MySQL 持久化
- `spring-app` 已新增人才档期日历读写接口，并让人才端工作台日历优先读 `calendar_availability`
- `spring-app` 已让企业端工作台、人才端工作台、任务广场、人才广场、人才详情和协作空间走“数据库优先 + fallback”
- SQL 已补充 `risk_tickets` 与更完整的审核 / 任务 / 风控 seed 数据

当前这样做的原因：

- 当前机器无 Maven / Gradle
- 可以先快速提供真实可调用接口
- 前端能优先对齐数据结构

后续真实服务承接方式：

- 前台、后台继续调用当前 `/api/*` 路径
- `spring-app` 逐步替换根目录 mock API
- SQL 继续沿用 `schema.sql` 与 `seed.sql`

后续推荐演进：

- Spring Boot
- MyBatis 或 JPA
- MySQL 8
- Redis
- 对象存储

## 5. API 说明

### Frontend 接口

- `GET /api/landing`
- `GET /api/business`
- `GET /api/talent`
- `GET /api/talent/calendar/{userId}`
- `POST /api/talent/calendar`
- `GET /api/talents/marketplace`
- `GET /api/talents/{slug}`
- `GET /api/tasks/marketplace`
- `GET /api/workspace`
- `GET /api/tasks/{taskId}/closure`
- `POST /api/ai/decompose`

当前路由分层说明：

- 官网入口：`/`
- 企业端：`/enterprise/*`
- 人才端：`/talent/*`
- 旧路径保留 redirect，减少联调期切换成本

### Admin 接口

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/tasks`
- `GET /api/admin/compliance`
- `POST /api/admin/reviews/{reviewId}/decision`
- `POST /api/admin/tasks/{taskId}/transition`
- `POST /api/admin/risk-tickets/{ticketId}/status`

### 扩展接口

- `GET /api/im/tencent/config`

接口治理补充：

- 详细字段契约、联调顺序、版本策略和文件上传草案，统一见
  [API 详细契约文档](2026-03-21-api-contract.md)

## 6. 数据模型

核心表：

- `users`
- `organizations`
- `organization_verifications`
- `talent_profiles`
- `tasks`
- `task_ai_analyses`
- `task_assignments`
- `task_negotiations`
- `task_milestones`
- `task_progress_updates`
- `task_files`
- `chat_conversations`
- `chat_messages`
- `task_im_rooms`
- `reviews`
- `calendar_availability`
- `admin_actions`
- `risk_tickets`

设计原则：

- 平台状态以业务数据库为准
- IM 只承担会话和消息能力
- IM 主操作面板只面向企业端与人才端，后台不直接承接聊天流程
- 任务、验收、评价、附件索引必须回写平台
- 协作工作区需要同时覆盖里程碑、进度时间线、附件库、AI 巡检和信用沉淀

## 7. 腾讯 IM 接入策略

### 推荐边界

- 腾讯 IM 负责：
  - 单聊
  - 任务群聊
  - 历史消息
  - 离线推送
  - 会话同步

- 平台负责：
  - 任务状态
  - 里程碑
  - 进度附件索引
  - 验收结果
  - 评分
  - AI 巡检结果
  - 审计摘要与争议留痕

### 推荐接入时机

- 当企业端选择人才并建立协作时，自动创建任务房间
- 房间与 `task_id` 一一关联
- 系统消息可通过平台和腾讯 IM 双写

## 8. 安全与隐私

- 身份证、企业材料等敏感资料只允许后台和审核流程访问
- 前台只展示公开资料
- 后续需接入鉴权、权限控制、审计日志和上传校验

## 9. 当前实现边界

已实现：

- 前台官网首页 + 企业端 / 人才端页面骨架
- 后台管理审核队列、任务流转、风控工单操作
- 后台管理列表主视图、操作栏和抽屉交互
- Java mock API
- Spring Boot 正式服务骨架
- Spring Boot 管理接口真实仓储读写
- Spring Boot 入驻接口真实持久化
- Spring Boot 任务生命周期真实持久化
- Spring Boot 任务房间预览真实读库
- Spring Boot 公共展示接口数据库优先读取
- SQL 结构
- SQL seed 数据
- 腾讯 IM 接入预留

未实现：

- 登录注册
- 文件服务
- 真实 AI
- 真实腾讯 IM
- 实时消息同步
- 公共展示接口完全去 fallback

已形成草案但未落地：

- 文件上传正式接口
- 接口版本与字段变更规则

## 10. 技术债与后续建议

1. 将 `spring-app` 从骨架升级为真实可运行服务
2. 引入统一 DTO / VO / Entity 结构
3. 将 mock 数据迁移到 MySQL
4. 建立文件上传服务与对象存储
5. 接入腾讯 IM SDK 与账号体系
6. 增加自动化测试与 CI
