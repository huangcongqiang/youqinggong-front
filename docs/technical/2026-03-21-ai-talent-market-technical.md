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
- 企业端工作台 / 聊天 / 发布任务 / 人才广场 / 协作空间 / 验收评分
- 人才端工作台 / 聊天 / 任务广场 / 协作空间 / 验收评分
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
- `spring-app` 的协作空间已支持任务切换、节点详情与企业反馈回写，便于企业端在多个任务间快速切换查看
- 聊天列表摘要已补充任务名称、协作对象与阶段，方便从会话层直接理解业务上下文
- 已确认任务仍保留企业端变更入口，任务确认卡继续维护版本与处理历史
- root mock API 已支持“提前完成 -> AI 审核 -> 人才确认 -> 企业 S / A / B 评级 -> 人才给企业评分”的完整闭环
- root mock API 已支持“企业或人才发起取消任务 -> 对方确认 / 拒绝”的双向取消流程
- 首页轮播、企业工作台、人才工作台已开始消费真实评分与评级摘要，而不是只显示静态案例文案
- root mock API 当前通过单仓储串行访问来避免并发请求同时改写内存态任务、房间和会话状态
- root mock API 的 `.local/*.json` 状态文件已改成原子落盘，降低多人同时操作或进程中断时写坏 JSON 的概率
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
- `POST /api/tasks/{taskId}/workspace-feedback`
- `GET /api/tasks/{taskId}/closure`
- `POST /api/tasks/{taskId}/early-completion`
- `POST /api/tasks/{taskId}/cancellation`
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
- `GET /api/messages/task-rooms`
- `POST /api/messages/task-room/initiate`
- `POST /api/messages/task-room/{roomKey}/communication-record`

接口治理补充：

- 详细字段契约、联调顺序、版本策略和文件上传草案，统一见
  [API 详细契约文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-api-contract.md)

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
- 项目沟通页只负责聊天记录与 AI 沟通纪要
- 聊天记录逐条保存，AI 沟通纪要通过显式按钮生成，避免每条消息都触发摘要请求
- AI 沟通纪要在前台通过右侧悬浮入口 + 弹窗查看，不长期占用聊天主区域
- 聊天页支持文本与附件混发，图片在前台直接缩略展示，通用文件以附件卡片展示
- 当腾讯 IM 可用时，文本、图片和文件消息都优先走腾讯 IM；平台继续回写附件索引与房间摘要
- 选中人才后，平台会自动创建带 `taskConfirmation` 状态的协商房间，并把它排到聊天列表最前
- `taskConfirmation` 支持 `待人才确认 / 待企业修改 / 已确认` 三种当前状态，驱动人才确认、人才提修改、企业重新发送
- 历史版本中的旧节点会在企业重发后更新为 `已修改`，新的版本节点进入 `待人才确认` 或 `待企业修改`
- `taskConfirmation` 额外维护 `version + history + period + budget + changeReview`，企业每次重新发送确认单都会升版本；聊天页默认展示“最近处理记录”，并把首次发起确认排除在修改展示之外
- `changeReview` 由 AI 在人才提出修改时生成，包含修改摘要、推荐工期、档期提醒和建议列表，企业端可在当前版本与任务详情中查看
- 企业执行 `update` 时，后端会基于最新版本再次生成 `changeReview`；这次复核会同时参考工期、预算、协作安排和附加说明
- 首页改版、品牌官网、H5 展示、工作台视觉升级等首版任务，在当前实现里应优先收敛到 `3 个 AI 协同工作日`；只有整站重构或多端深度联动时才放宽到 `4 到 5 个 AI 协同工作日`
- 企业端执行 `update` 时，会在原始修改建议基础上再生成一轮 AI 复核结果，用来判断当前版本是否已经基本响应人才反馈
- 当 `taskConfirmation.status=待人才确认` 时，企业端不能继续发送第二个变更；如需回退，先执行撤回当前变更，再重新编辑
- 企业端重新发送后，人才端聊天列表、聊天页和工作台会通过最新系统通知与待确认摘要同步提醒
- 快捷回复按企业端 / 人才端拆开维护，不再共用同一组默认文案
- 协作工作区采用“企业端多任务总览 + 人才端单任务执行台”的双角色结构
- 企业端协作空间先展示任务切换条，再展示阶段节点图；节点建议按任务模块 / 工作日组织
- 点击节点可查看计划交付、人才提交、AI 审核、企业反馈和 AI 补充建议
- 企业端进入协作空间时，主要查看多任务切换、节点进度、人才最新进展、附件和验收入口，不展示人才提交表单
- 聊天页、任务详情和协作空间统一展示当前预算、确认工期、协作安排和人才近期档期摘要，避免用户来回切页确认排期
- 企业反馈支持回写到节点详情，并由 AI 补充解释后再沉淀到节点历史
- 人才端协作空间以“当前任务 -> 执行节奏 -> 提交进展 -> 提交记录 -> 附件 -> AI 建议 -> 验收入口”为主线
- 进度提交接口支持 `stage / supportNeeded / attachmentFiles`
- 聊天页统一采用单列结构：顶部是横向滚动的会话列表，下方是聊天内容与输入区
- 线程容器固定为约 `60vh`，任务确认卡直接作为消息流第一块内容插入同一个滚动容器
- 消息区统一滚动，避免多个滚动层叠加导致内容被裁切
- 用户侧聊天页不展示腾讯 IM 接入状态、内部群组 ID、平台用户 ID 等技术信息
- 从人才详情页进入聊天时，前端先按 `counterpartPlatformUserId` 匹配目标人才；若同一人才存在多个房间，则不自动跳最近房间
- 任务、验收、评价、附件索引必须回写平台
- 协作工作区需要同时覆盖当前任务、执行节奏、进度时间线、附件库、AI 巡检和验收沉淀
- 协作工作区预算为空时，用户侧统一展示“未填写预算”，不要再用“待沟通”代替
- `TaskAiAnalysis.tags` 与推荐建议优先沉淀为任务 / 业务 / 交付标签，推荐内容优先保留国内可用工具与协作方式

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

- 当企业端确认 AI 拆解后，平台先基于数据库推荐 4 位候选人才
- 企业端可直接从推荐名单中选择人才，或手动进入人才广场继续补充筛选
- 当企业端发起协作并进入需求 / 工期确认阶段时，自动创建任务房间
- 房间与 `task_id` 一一关联
- 系统消息可通过平台和腾讯 IM 双写
- 会话摘要建议随任务主数据同步保存 `taskTitle / counterpartName / stage`
- 任务确认卡允许企业端在已确认后继续发起变更，聊天页只负责展示版本与处理历史，不关闭修改入口
- 当腾讯 IM 连接或发送失败时，页面会继续展示已同步的聊天记录，不阻塞任务流程测试
- 聊天结束后再生成 AI 沟通纪要，可减少摘要请求次数，也更符合“按轮次沉淀结论”的协作方式
- 附件二进制当前仍未接入正式上传服务，mock 阶段先保存附件元信息与图片预览地址
- 当前前端已接入 `tim-upload-plugin`，用于让图片和文件消息通过腾讯 IM 上传到 COS
- 当前开发版的“实时”更准确地说是“准实时刷新”：聊天即时收发优先走腾讯 IM，任务确认 / 协作节点 / 工作区摘要通过轮询同步关键字段
- 聊天页轮询已改为“按通道状态自适应”：IM 连接正常时降低轮询频率，避免每个客户端都高频拉取整页摘要
- 企业端工作台、人才任务广场、验收页、协作空间当前统一采用轻量轮询刷新关键状态，默认间隔约 6 秒，并在页面隐藏时暂停

## 8. 安全与隐私

- 身份证、企业材料等敏感资料只允许后台和审核流程访问
- 前台只展示公开资料
- 后续需接入鉴权、权限控制、审计日志和上传校验

## 9. 当前实现边界

已实现：

- 前台官网首页 + 企业端 / 人才端页面骨架
- 前台独立注册页与登录弹窗入口
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
- 轻量 mock 登录注册与前端本地登录态持久化
- root mock API 基础并发保护与本地状态原子写
- 腾讯 IM 接入预留

未实现：

- Spring Boot + MySQL + JWT 正式登录注册
- 文件服务
- 真实 AI
- 真实腾讯 IM
- 实时消息同步
- 公共展示接口完全去 fallback
- 面向大量用户的数据库事务、缓存、队列与实时事件总线

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
