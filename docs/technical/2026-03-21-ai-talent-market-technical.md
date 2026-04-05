# AI 人才协作市场技术文档

> 当前口径说明：本文件继续作为“当前实现 / 已定案技术边界”的事实源。目标态蓝图请查看 [2026-03-28-h5-pc-technical-blueprint.md](/Users/huangcongqiang/Desktop/products/youqinggong/docs/plans/2026-03-28-h5-pc-technical-blueprint.md)。

> 2026-03-27 更新：H5 前端已切成独立 mobile-first 项目；默认入口改成 `/auth` 独立登录页，`/landing` 仅保留为次级平台介绍页。`frontend_mobile_h5/src/data/mock.js` 已删除，`recordData.js` 仅保留格式化工具；全局视觉切到高对比深色科技风。H5 通过 `VITE_API_BASE` 指向共享后端 API，本地未配置时默认访问当前主机名下的 `:8080/api`。读接口失败会显式展示错误提示，写接口失败会显式暴露失败态，不再伪装成功。人才注册的专业方向已改成预置 `skills` 多选 + 可选自定义专业，注册阶段就会把结构化标签写入 `talent_profiles.specialties`。

## 1. 技术目标

建立一套可持续扩展的 MVP 技术底座，在当前阶段兼顾：

- 可运行
- 可联调
- 可扩展
- 可迁移到真实生产实现

## 2. 项目结构

```text
frontend/            Vue 3 桌面前台应用
frontend_mobile_h5/  Vue 3 移动端 H5 前台应用
admin/               Vue 3 管理后台
backend/             Java API + SQL
docs/                需求 / 设计 / 技术 / 开发文档
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
- 通过路由层完成企业端与人才端分流
- 当前不再在桌面前台根壳默认挂载移动端底部 tab bar
- `frontend/src/components/MobileDock.vue` 已从桌面端移除，PC 端不再保留移动端底部导航组件
- `frontend/src/App.vue` 已区分门户壳与业务壳：官网继续使用顶部浮层导航，企业端 / 人才端业务页切到独立桌面工作区壳
- 桌面业务壳已补左侧业务导航与顶部状态条，PC 端开始从“门户站”收敛到“桌面驾驶舱”
- 桌面聊天页已开始补右侧上下文栏，用于承接任务摘要、AI 修改建议、沟通纪要和记录级摘要，逐步向三栏工作区收敛
- 桌面协作空间已拆出独立的左侧任务栏组件与右侧上下文面板组件，PC 端开始从“单列协作页”收敛到“左任务切换 / 中主区 / 右详情”
- 企业端协作空间当前主区只保留任务动作与交付节点，右栏承接预算、周期、合作对象、最近提交、最近 AI 审核与详情入口
- 人才端协作空间复用同一桌面壳，但主区优先提交进展、查看节点和处理关键动作，右栏负责企业信息、预算周期与审核摘要
- 桌面聊天页已把附件预览、任务详情、沟通纪要、纪要确认等重弹层拆成异步组件，降低主页面耦合并为后续继续拆分消息页做准备
- H5 聊天页已把附件预览、任务详情、沟通纪要、纪要确认、任务确认操作 5 个底部 sheet 全部拆成异步组件，消息页剩余体积主要集中在线程渲染、任务确认摘要和 IM 事件处理逻辑
- H5 `MessagesPage` 已明确为单会话详情页；会话列表、搜索和筛选已固定由 `ChatInboxPage` 承担，避免一个页面继续混合“列表 + 详情”两套职责
- H5 聊天页当前已把消息展示、附件展示、房间预选与刷新节奏判断拆到 `messageDetailHelpers.js`、`messageLiveRefresh.js`、`messageRoomRuntimeHelpers.js`，页面主文件更聚焦会话编排与实时交互；若后续继续推进，可在此基础上再抽 `useMessageRoomSession`
- 桌面聊天页也已把附件预览、任务详情、沟通纪要、纪要确认、任务确认操作 5 个重弹层全部拆成异步组件，当前剩余体积主要集中在线程渲染、任务确认摘要区和 IM 事件处理逻辑
- PC / H5 记录详情当前也已补齐同构的 formatter / view model 边界：两端各自维护镜像 helper，但合同一致，优先共享对象字段映射而不是在这一阶段就引入跨项目物理共享模块

### frontend_mobile_h5

- Vue 3
- Vue Router
- Vite 4
- mobile-first H5 壳层、底部导航、底部 sheet 与固定动作条

职责：

- frontend_mobile_h5 已收敛为 mobile-first H5，工作台、聊天和协作空间优先用移动端壳层、底部 sheet 和固定动作条承接
- 聊天主路径已拆成“会话列表页 `/enterprise|talent/chat` + 单会话详情页 `/enterprise|talent/chat/room`”
- H5 工作台主视野优先承接“待办 + 3 个主入口”，记录类历史信息收进更多信息和独立记录页
- H5 工作台已进一步收成“待办 + 2 个首屏入口 + 更多信息”，减少首屏模块密度
- H5 协作页把当前任务、关键节点和主动作保留在首屏，最近记录通过 sheet 承接，避免主页面继续堆叠长信息流
- 路由默认先进入 `/auth` 登录页，登录成功后按账号状态分发到企业端或人才端业务页；`/landing` 仅用于平台介绍
- 人才注册页使用预置标签多选 + 自定义专业输入，提交时同时生成 `headline` 与 `skills`
- 视觉层统一使用高对比深色科技风 token，重点提升按钮、正文、弱提示和卡片边界的可读性
- 通过 `VITE_API_BASE` 指向共享后端 API，本地未配置时默认访问当前主机名下的 `:8080/api`
- `frontend_mobile_h5/src/data/mock.js` 已删除，`frontend_mobile_h5/src/pages/recordData.js` 已收成记录格式化工具
- 读接口失败会直接暴露错误提示，写接口失败会直接暴露失败态，不再伪装成功

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

- `frontend_mobile_h5` 当前通过统一 API 目标切换层指向共享后端 API；本地未显式覆盖时默认已切到 `spring-app:8081/api`，root mock 继续通过 env、query 与本地缓存保留 fallback
- 页面数据不再依赖 mock 数据，关键页面改成 mobile-first H5 壳层
- `spring-app` 已让后台管理接口走 JPA Repository + Entity 读写
- `spring-app` 已让企业 / 人才入驻、任务生命周期、任务房间预览走 MySQL 持久化
- `spring-app` 当前已完成任务主链第一批 actor 边界正式化：发布任务、AI 拆解确认、选人、协商确认、闭环摘要以及进度 / 验收 / 评分写链优先从 token 解当前 actor，不再信任前端传入的当前操作者字段
- `spring-app` 已补齐 `GET /api/ai/publish-presets`、`POST /api/ai/decompose` 和 `POST /api/tasks/{taskId}/negotiations/task-confirmation` 的前台主链合同，任务确认当前会真实持久化到任务实体，并被聊天房间 / 记录详情读模型复用
- `spring-app` 已支持 `/auth/register` 在人才注册阶段直接持久化 `skills -> talent_profiles.specialties`
- `spring-app` 已新增人才档期日历读写接口，并让人才端工作台日历优先读 `calendar_availability`
- `spring-app` 已让企业端工作台、人才端工作台、任务广场、人才广场、人才详情和协作空间走“数据库优先 + fallback”
- `spring-app` 的协作空间已支持任务切换、节点详情与企业反馈回写，便于企业端在多个任务间快速切换查看
- `spring-app` 已完成聊天正式写链第一阶段：`chat_conversations / chat_messages / task_im_rooms` 已成为前台主聊天写链默认事实源
- `spring-app` 已完成协作与验收写模型第一阶段：`workspace-feedback / early-completion / cancellation / acceptance` 当前有正式写模型与生命周期事件留痕，`workspace / closure / orders` 优先读取新投影
- `spring-app` 已完成中心页读模型第一阶段：`GET /api/business` 与 `GET /api/talent` 当前都会直接返回 `attentionHeadline / attentionItems / notificationItems / notificationGroups`
- 双跑切换已完成：root mock backend 保持 `8080`，`spring-app` 本地默认端口为 `8081`，PC / H5 默认目标已切到 `spring-app`
- `spring-app` 已完成高风险接口保护第一刀：`POST /api/auth/login` 当前已补最小登录失败限流，同一 `audience + mobile/email` 在 10 分钟窗口内连续失败达到阈值后，会返回正式 `429 Too Many Requests`
- `spring-app` 已完成高风险接口保护第二刀：`POST /api/uploads/presign` 当前已补最小 burst guard，同一 `actorUserId + scene` 在 1 分钟窗口内连续申请上传会话达到阈值后，会返回正式 `429 Too Many Requests`
- `spring-app` 已完成高风险接口保护第三刀：`POST /api/tencent-im/callback/events` 与 `POST /api/tencent-im/callback/messages` 当前已补 callback header/secret 校验，未通过时返回正式 `401 Unauthorized`；`POST /api/tasks/publish` 当前也已补 burst guard，超阈值时返回正式 `429 Too Many Requests`
- 上述高风险保护的正式外部合同当前以 API 契约中的 `POST /tasks/publish`、`POST /tencent-im/callback/events`、`POST /tencent-im/callback/messages`、`GET /actuator/health`、`GET /actuator/health/readiness` 段落为准
- PC / H5 前端当前都已补统一 API 目标切换层，支持 `VITE_API_TARGET=mock|spring`、`VITE_ROOT_MOCK_API_BASE`、`VITE_SPRING_API_BASE`、query `?apiTarget=` 与本地缓存 `youqinggong.api.target`
- 主线 7 阶段六已完成：对账异议当前会生成正式 `Dispute` 与 `RiskTicket`；记录详情 / 闭环详情已补 `disputeSummary`；后台合规页可回读 dispute 关联风险工单，并支持通过风险工单状态回写争议状态
- 主线 9 阶段三已完成：`TencentImCallbackService.receiveEvent(...)` 当前已返回正式 callback ack，消息 callback 也已支持附件 payload 回写与 `task_files` 索引
- 主线 9 阶段四已完成：`spring-app` 当前已补 `GET /actuator/health`、`GET /actuator/health/readiness`，并将 `businessRealtimeEvent / uploadStorage / tencentImConfig` 作为 readiness 健康细节暴露；`tencentImConfig` 当前也会返回 `callbackSecretConfigured`；SSE、上传和腾讯 IM callback 当前也已补最小结构化日志
- 主线 9 阶段六第四刀已完成：`actuator health / readiness` 当前又补 `requestProtection` 组件，冻结 `loginRateLimitEnabled / uploadPresignBurstGuardEnabled / publishBurstGuardEnabled / tencentImCallbackProtectionEnabled` 四类保护开关；`businessRealtimeEvent` 当前已补 `emitFailureThreshold / lastConnectAt / lastPublishAt / lastEmitFailureAt`，`uploadStorage` 当前已补 `checkedAt`，`tencentImConfig` 当前已补 `callbackProtectionEnabled`
- 主线 9 阶段七第一刀已完成：根 `docs/` 当前已冻结“正式上线可测”的最终销项清单；后续上线判断只允许按企业 PC、人才 PC、企业 H5、人才 H5、后台管理、`spring-app`、上传链、IM callback、`SSE / readiness / health` 九组真实主路径逐项验收推进
- 主线 9 阶段七第二刀已完成：九组真实主路径、整端 UI 审查、对象页来源链 / 返回链与更深的聊天 / 协作路径回归都已过门；`GET /actuator/health/readiness` 在线回读结果最新为 `UP`，`businessRealtimeEvent / uploadStorage / tencentImConfig / requestProtection` 四组关键信号当前都可稳定读取
- 主线 9 阶段七第三刀已完成：最终验收后未再发现必须上线前关闭的新阻断项；`MessagesPage` 与 `admin` 构建包体 warning 当前仅作为非阻断技术债继续观察
- 主线 9 阶段七第四刀已完成：项目当前已经达到根 `docs/` 冻结的 `正式上线可测` 标准；`root mock API` 继续保留为演示 / 联调 fallback，不再代表正式默认链路
- PC / H5 当前已把协作进度附件统一到 `presign -> binary -> task file register` 正式上传链；聊天附件也已在消息发送前先走正式上传会话链，再把 `uploadId / objectKey / downloadUrl` 写入消息附件 payload
- 聊天列表摘要已补充任务名称、协作对象与阶段，方便从会话层直接理解业务上下文
- PC / H5 的工作台、协作空间、验收页、通知中心、审批中心当前都已显式消费 `businessEventStream` 状态，用户可直接看到 `connecting / open / fallback / paused / disabled`
- `spring-app` 当前已支持 `enterprise / talent / admin` 三类 audience 的正式 `register / login / me / logout`；`/api/admin/*` 当前强制管理员 token，后台管理的 `dashboard / users / tasks / compliance` 终验也已通过
- 已确认任务仍保留企业端变更入口，任务确认卡继续维护版本与处理历史
- 首页轮播、企业工作台、人才工作台已开始消费真实评分与评级摘要，而不是只显示静态案例文案
- 首页继续往“品牌官网”方向精修时，前台优先使用单列结构、图标化信号和结果证明，不再堆长文本模块
- 读接口失败会显示错误提示，不再假装空态；写接口失败会显式回显失败状态
- 腾讯 IM 页面优先走真实配置，无法连通时展示已同步聊天记录与错误提示，不使用 mock 数据
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

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
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

前端状态约束：

- 读接口失败必须显式显示错误提示，不要只渲染空态
- 写接口失败必须显式显示失败态，不要伪装成功
- 腾讯 IM 相关页面优先走真实配置，连通失败时继续展示已同步聊天记录并提示错误

当前路由分层说明：

- 官网入口：`/`
- 企业端：`/enterprise/*`
- 人才端：`/talent/*`
- 旧路径保留 redirect，减少联调期切换成本

当前双端壳层补充：

- `frontend` 中 `/enterprise/*`、`/talent/*` 已默认运行在桌面业务壳里
- `frontend_mobile_h5` 中 H5 登录后默认进入移动端业务壳，聊天详情与会话列表分路由承接

当前 PC Web 页面上下文补充：

- 当前页面级上下文拆成两层：对象级锚点 `itemId / group / taskId / room / recordId / nodeId / tab`，以及导航来源 `source / originSource`
- 当前已完成的主链是 `center -> chat/workspace/record/acceptance -> return`：通知中心 / 审批中心进入聊天、协作空间、记录详情、验收页时，会继续透传 `group + itemId + taskId / room / recordId / source`，返回时优先恢复原分组与原事项
- 其中 `taskId` 是协作空间和验收页的主定位字段
- `room` 用于聊天与从聊天进入协作空间时保持当前会话
- `recordId` 与 `tab` 用于从记录页进入聊天 / 协作空间后还能返回到正确记录对象与筛选标签
- `itemId + group` 用于通知中心 / 审批中心的对象级预选与返回恢复，是中心页稳定回链的第一优先级
- 当聊天 query 带 `recordId` 时，前端会额外读取对应记录详情接口，在右侧上下文展示记录级摘要；手动切换会话或任务后，应主动清掉旧 `recordId / source / originSource / itemId / group / nodeId / tab`
- `source` 用于标记 immediate source，目前允许值至少包括 `messages / records / record-detail / dashboard-enterprise / dashboard-talent / workspace / notifications / approvals / acceptance`
- `originSource` 用于标记最终通知中心或审批中心；当前已正式服务 `record-detail / workspace / acceptance` 之间的多跳回链
- 第二轮对象页 / 回链补强中，PC 聊天页已修掉记录详情深链进入时因旧房间 enrich helper 引发的白屏；当前 `recordId + room + source` 并存时，消息主区不再因为旧 helper 引用而失效
- PC 记录页当前已把批量选择、当前页 CSV 导出和本地归档整理做成正式前端交互；其中“本地归档”只影响当前工作区视图，不代表后端已具备批量归档接口
- PC 工作台顶部共享待办入口当前优先消费 `notificationItems / notificationGroups`；只有在缺失新通知契约时，才回退到旧的 `attentionItems`
- PC 企业端审批中心与人才端通知中心当前都支持 `group` query 预选左侧分组，便于从工作台顶部待办直接落到对应类别
- 首页路由契约当前已经收口：工作台首页、首页模块弹层和首页快捷入口只负责进入通知中心 / 审批中心，不再直接路由到聊天、协作空间、记录详情或验收页
- `DesktopAttentionHub` 当前把展开区限定为“补充概览”，缺少处理入口的事项只显示禁用态，不再通过默认 fallback 静默跳页
- 工作台顶部待办与模块弹层进入通知中心 / 审批中心时，当前会继续透传 `itemId / taskId / room / recordId`；中心页优先按这些对象级 query 选中对应事项，命中后再必要时切换到正确分组
- 首页传来的 `group + itemId / taskId / room / recordId` 当前只保留“中心页预选”语义；中心页才负责把当前事项继续路由到聊天、协作空间、记录详情和验收页
- 首页模块弹层的 secondary 动作当前只保留发布任务、任务广场这类泛入口；聊天、协作空间、记录详情不再从首页弹层直接保留对象页入口
- `frontend/src/utils/attentionNavigation.js` 当前负责统一中心入口 route 构建与模块语义选项选择，减少企业端 / 人才端工作台各自拼 `group + itemId + taskId / room / recordId` 的重复逻辑
- `itemId` 当前作为通知中心 / 审批中心的对象级定位键；当 `source=notifications / approvals` 时，聊天、协作空间、记录详情也会继续保留 `group + itemId + taskId / room / recordId`
- 通知中心 / 审批中心右侧当前对象摘要区当前都已补统一动作带：动作带只消费当前 `selectedItem` 的 `group + itemId + taskId / room / recordId`，按对象可达性承接聊天、协作空间、记录详情、验收页与次动作入口，不再继续散落在列表行和说明区里
- `frontend/src/utils/attentionNavigation.js` 当前也负责统一中心页对象动作合同：`buildCurrentObjectContextActions()` 用于根据当前对象锚点生成动作带，`dedupeAttentionActions()` 用于去重，通知中心 / 审批中心不再各自复制聊天、协作、记录、验收 canonical route 逻辑
- 中心页当前对象当前已补 `stable / invalid` 两种状态：`stable` 表示当前 `selectedItem` 成功命中对象锚点并可渲染摘要与动作带，`invalid` 表示原对象未命中但仍保留 `group + itemId + taskId + room + recordId + source`，此时页面不能隐式改绑到其他事项
- 中心页 `invalid` 状态当前也补了 `recoveryActions` 口径：恢复动作只允许在当前中心或当前分组内生效，例如 `backToGroupFirst`、`clearCurrentAnchor`、`openAllInCenter`，不得隐式跨组或改绑到其他事项；其中 `backToGroupFirst` 必须用当前分组首项的 `itemId / taskId / room / recordId` 覆盖旧失效锚点，`clearCurrentAnchor` 必须保留 `group / source / originSource`，同时清空旧的 `itemId / taskId / room / recordId`
- 通知中心 / 审批中心当前还要求 `summaryCardActions / footerActions / recoveryActions` 三者在 `invalid` 态下共用同一套恢复合同：顶部摘要卡、右侧空态和底部 footer 都只能暴露中心内恢复动作，不能继续复用 `stable` 态的对象级 CTA
- 记录详情 / 协作空间 / 验收页当前也补成统一回链合同：向下跳转时写入 `source=当前页`，并把 `originSource` 设为 `route.query.originSource || route.query.source`；向上返回时先回 immediate source，再由上一层按 `originSource` 回通知中心或审批中心
- PC 聊天页当前也已补齐 `approvalId / originApprovalId`，从审批中心进入聊天再进入记录详情 / 协作空间 / 验收页时，不再丢审批对象锚点；聊天页自身回审批中心时，也会优先带回 `approvalId + itemId + group + taskId / room / recordId`
- H5 聊天详情页当前已接入 `objectPageContext`，进入来源可按 `workspace / record-detail / acceptance / records` 回链；房间切换时会保留对象页上下文，只更新 `room / taskId`
- 第二轮对象页 / 回链补强中，人才 H5 协作页已补 `workspaceBackRoute / focusedNodeIndex / expectedDeliverablesText`；当前节点编号不再出现 `NaN`，计划交付件也不再直接渲染原始数组
- H5 `buildEmptyTaskClosure()` 当前已补齐 `acceptance / claimSummary / invoiceSummary / reconciliationSummary / settlementSummary / disputeSummary` 与 `summary.disputeStatus / disputeOpenedAt`，避免验收页 fallback 再次出现争议合同缺口
- 三页统一回链时，当前必须继续保留 `group / itemId / taskId / room / recordId / tab / source / originSource`；最终恢复顺序优先按 `itemId -> recordId -> taskId -> group -> source`
- 中心页一旦执行恢复动作，后续聊天 / 协作空间 / 记录详情 / 验收页都必须绑定恢复后的新对象或新上下文；旧失效对象只允许保留在历史来源栈里，不能继续作为当前对象下传
- 当记录详情 / 协作空间 / 验收页继续进入更深一层页面时，`source` 应改成当前页标识，并把 `originSource` 设为 `route.query.originSource || route.query.source`
- 当更深一层页面返回上一详情 / 工作页时，应继续保留 `itemId / group / taskId / room / recordId / tab / source / originSource`，让上一页还能再回通知中心 / 审批中心
- AcceptancePage 当前已经纳入与 RecordDetailPage / WorkspacePage 相同的 `source + originSource` 回链约定
- 当前返回优先级是：`itemId -> recordId -> taskId -> group -> source`
- 当目标页点击“返回来源”时，当前优先恢复 `itemId`；仅在 `itemId` 失效时，才按 `recordId -> taskId -> group` 的顺序回退到更粗粒度的上下文
- `GET /api/workspace` 的 `taskOptions[].roomKey` 当前也已收口为“真实任务房间键”；正式读模型不得再返回 `task-room-*` 这类伪造占位值

当前记录详情对象合同补充：

- 记录详情页当前统一消费 `summary + record` 结构；`summary` 承接顶部摘要，`record` 承接 `task / taskConfirmation / timeline / progressFeed / aiReviewHistory / assetLibrary / reviews / notes / sections`
- 记录详情当前统一的 formatter 合同是 `formatMoney / formatDateLabel / formatDateRangeLabel / formatGrade`
- 记录详情当前统一的展示回退链是：金额 `amountValue|amount`，开始时间 `startAt|startDate`，结束时间 `endAt|endDate`，评级 `rating.value|myGrade`
- 记录详情当前统一的 view model 派生包括：`anchor.recordId / anchor.taskId / anchor.roomKey`、`stageLabel=stage||statusGroup||status`、`latestProgress=progressFeed` 尾项、`latestAiReview=aiReviewHistory` 尾项、`latestReview=reviews` 首项、`deliverables=sections.deliverables`、`confirmationHistory=sections.confirmationHistory`、`assetFiles=assetLibrary`
- PC 与 H5 当前保留的差异主要在页面壳和导航交互；对象字段映射、formatter、展示回退规则以及对象页上下文纯函数已经对齐
- 对象页上下文当前统一采用镜像维护的 `objectPageContext` helper：
  - `readObjectPageContext(routeLike)`：读取并归一 `itemId / group / taskId / recordId / room / nodeId / tab / source / origin*`
  - `resolveImmediateOriginContext(...)`：解析当前对象页的直接来源或显式 origin
  - `buildChildObjectPageContext(...)`：序列化去下一级对象页所需的 query
  - `buildCenterReturnQuery(...)`：为通知中心 / 审批中心构造最小回链 query
  - `labelForObjectPageSource(source)`：统一返回按钮文案语义
- H5 当前只要求稳定支持 `taskId / recordId / room / tab / source` 和最小 origin 子集；PC 继续使用 `itemId / group / nodeId / originSource / originItemId / originGroup / originTaskId / originRecordId / originRoom` 完整对象页上下文合同。

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

当前进度补充：

- `spring-app` 已完成 IM 写链正式化第一阶段：`GET /api/im/tencent/config` 当前按 token actor + `roomKey` 稳定回读 `taskRoom / groupId / currentUser / counterpartUser`，前端房间与成员关系优先以后端任务房间真相为准
- 已完成：业务实时事件正式化第一阶段。`spring-app` 当前已补 `GET /api/events/stream`，PC / H5 关键业务页优先通过 `businessEventStream` 刷新对象状态；事件解析当前已兼容 `CRLF`，断流重新可见时会优先重连；任务级事件当前只会推送给发布方和已选中人才，聊天正文仍继续复用腾讯 IM 实时通道
- 已完成：上线准备主线阶段二“稳定性与可观测性”。PC / H5 `businessEventStream` 当前已补 `onStatusChange / onSyncError` 可观测钩子，运行时可显式暴露 `connecting / open / fallback / paused / disposed / disabled`、`transport`、`reason`、`reconnectCount`、`lastConnectedAt`、`lastErrorAt`
- 已完成：`spring-app` 的 `BusinessRealtimeEventService / UploadApplicationService / TencentImCallbackService` 当前已补最小结构化日志，用于追踪 SSE、上传和 IM callback 的关键成功 / 失败节点
- 已完成：`spring-app` 的 `/api/admin/compliance` 第一刀正式化。当前即使没有 `riskTickets` 也会返回正式 `summary / checks / deliveryBoard`，并新增 `organizationPermissions` 第一批角色边界投影
- 已完成：`spring-app` 的 `/api/admin/dashboard` 与 `/api/admin/users` 第二刀正式化。当前在无待办 / 无风险 / 无活动 / 无待审核对象时，不再回退 demo 队列，而是返回正式空数组或真实投影
- 已完成：`spring-app` 的 `/api/admin/tasks` 第三刀正式化。当前在无任务时，不再整页回退 demo，而是返回正式空 `summary / items / actionQueue`

## 9.1 审批 / 财务 / 争议对象冻结边界

当前主线已切到“审批 / 财务状态冻结”。在进入正式写链前，以下对象先作为技术事实源冻结：

- `Approval`
  - 用途：承接待确认、待修改、待评级、待取消等业务审批对象
  - 最小字段：`approvalId / taskId / recordId / approvalType / status / pendingAudience / actorUserId / occurredAt / updatedAt`
- 当前第一批前台消费结果：
  - 企业端审批中心当前已正式消费 `approvalHeadline / approvalItems / approvalGroups`
  - `approvalId` 当前已成为审批中心首要对象锚点，`taskId / recordId / room` 继续作为跨页上下文锚点
  - 第一批直提动作当前只开放 `confirmations -> APPROVE` 与 `cancellations -> APPROVE / REJECT`
- `Claim`
  - 用途：承接任务闭环后的请款对象
  - 最小字段：`claimId / taskId / recordId / amount / currency / status / requestedBy / occurredAt / updatedAt`
  - 当前进度：`spring-app` 已补最小持久化实体、创建接口、企业审批动作与记录详情摘要
- `Invoice`
  - 用途：承接开票申请与票据状态
  - 最小字段：`invoiceId / claimId / taskId / status / invoiceType / occurredAt / updatedAt`
  - 当前进度：`spring-app` 已补最小持久化实体、开票创建接口、记录详情摘要与 `INVOICE` 生命周期事件
- `Reconciliation`
  - 用途：承接对账对象与差异确认
  - 最小字段：`reconciliationId / claimId / taskId / status / amountSnapshot / occurredAt / updatedAt`
  - 当前进度：`spring-app` 已补最小持久化实体、企业对账动作接口、记录详情摘要与 `RECONCILIATION` 生命周期事件
- `Settlement`
  - 用途：承接结算执行对象
  - 最小字段：`settlementId / claimId / reconciliationId / taskId / amountSnapshot / currency / payoutRatio / status / submittedAt / updatedAt / settledAt`
  - 当前进度：`spring-app` 已补最小持久化实体、企业执行动作接口、`SETTLEMENT` 生命周期事件与 `settlementSummary`
- `Dispute`
  - 用途：承接争议发起、处理与裁决
  - 最小字段：`disputeId / disputeNo / claimId / invoiceId / reconciliationId / taskId / statusCode / openedBy / submittedAt / updatedAt / resolvedAt / riskTicketId`
  - 当前进度：`spring-app` 已补最小持久化实体、对账异议建单、记录详情 / 闭环详情 `disputeSummary` 与后台状态回写
- `RiskTicket`
  - 用途：后台风控 / 争议升级对象
  - 最小字段：`ticketId / ticketNo / targetType / targetId / severity / status / ownerTeam / note / updatedAt`
  - 当前进度：已进入 dispute 升级链第一阶段，被后台合规页与争议读模型消费

冻结原则：

- 对象状态名先冻结，再进入 controller / service / page 实现
- 中心页、记录详情、聊天右侧上下文、后续财务页不得各自发明新状态词
- `taskId / recordId / roomKey / itemId / source / originSource` 继续作为前台对象锚点最小公共上下文

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
- `claims`
- `invoices`
- `reconciliations`
- `settlements`
- `disputes`
- `reviews`
- `calendar_availability`
- `admin_actions`
- `risk_tickets`

设计原则：

- 平台状态以业务数据库为准
- frontend_mobile_h5 不再以 mock 数据作为默认数据源
- IM 只承担会话和消息能力
- IM 主操作面板只面向企业端与人才端，后台不直接承接聊天流程
- 项目沟通页只负责聊天记录与 AI 沟通纪要
- 财务对象当前按 `Claim -> Invoice -> Reconciliation -> Settlement / Dispute -> RiskTicket` 的顺序逐阶段正式化，先冻结对象和读模型，再补完整动作链
- 记录详情中的 `claimSummary / invoiceSummary / reconciliationSummary / settlementSummary / disputeSummary` 当前必须按同一条财务链聚合；不得把不同代际 claim、invoice、reconciliation、settlement 或 dispute 混投到同一条记录摘要里
- 聊天记录逐条保存，AI 沟通纪要通过显式按钮生成，避免每条消息都触发摘要请求
- AI 沟通纪要在前台通过右侧悬浮入口 + 弹窗查看，不长期占用聊天主区域
- 聊天页支持文本与附件混发，图片在前台直接缩略展示，通用文件以附件卡片展示
- 当腾讯 IM 可用时，文本、图片和文件消息都优先走腾讯 IM；平台继续回写附件索引与房间摘要
- 页面优先读取真实腾讯 IM 配置；无法连通时展示已同步聊天记录与错误提示，不使用 mock 消息或 mock 房间
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
- 企业端与人才端工作台当前都补了图标化信任信号与更短的模块摘要，避免高密度说明文案
- 桌面端工作台当前已改成“待办 + 桌面摘要 + 主模块卡”的驾驶舱式首页，不再沿用门户页顶栏 + Hero 的心智
- H5 企业端 / 人才端工作台当前已把首屏压缩到待办与少量主入口，其余入口通过更多信息层承接
- 快捷回复按企业端 / 人才端拆开维护，不再共用同一组默认文案
- 协作工作区采用“企业端多任务总览 + 人才端单任务执行台”的双角色结构
- 企业端协作空间先展示任务切换条，再展示阶段节点图；节点建议按任务模块 / 工作日组织
- 点击节点可查看计划交付、人才提交、AI 审核、企业反馈和 AI 补充建议
- 企业端进入协作空间时，主要查看多任务切换、节点进度、人才最新进展、附件和验收入口，不展示人才提交表单
- 当前桌面协作空间已具备左任务切换栏和右上下文栏，但还没有进一步做到“左任务树 + 批量操作 + 更强节点筛选”这一层
- 聊天页、任务详情和协作空间统一展示当前预算、确认工期、协作安排和人才近期档期摘要，避免用户来回切页确认排期
- 企业反馈支持回写到节点详情，并由 AI 补充解释后再沉淀到节点历史
- 人才端协作空间以“当前任务 -> 执行节奏 -> 提交进展 -> 提交记录 -> 附件 -> AI 建议 -> 验收入口”为主线
- 进度提交接口支持 `stage / supportNeeded / attachmentFiles`
- 聊天页统一采用单列结构：顶部是横向滚动的会话列表，下方是聊天内容与输入区
- 线程容器固定为约 `60vh`，任务确认卡直接作为消息流第一块内容插入同一个滚动容器
- 消息区统一滚动，避免多个滚动层叠加导致内容被裁切
- 输入区保持在消息容器外层的独立底部区域，避免任务确认卡和消息流把发送区挤出视口
- 用户侧聊天页不展示腾讯 IM 接入状态、内部群组 ID、平台用户 ID 等技术信息
- 从人才详情页进入聊天时，前端先按 `counterpartPlatformUserId` 匹配目标人才；若同一人才存在多个房间，则不自动跳最近房间
- 任务、验收、评价、附件索引必须回写平台
- 协作工作区需要同时覆盖当前任务、执行节奏、进度时间线、附件库、AI 巡检和验收沉淀
- 协作工作区预算为空时，用户侧统一展示“未填写预算”，不要再用“待沟通”代替
- `TaskAiAnalysis.tags` 与推荐建议优先沉淀为任务 / 业务 / 交付标签，推荐内容优先保留国内可用工具与协作方式
- 人才侧画像优先沉淀 `skills / portfolioUrls / headline / services / score / responseTime / availability` 这类结构化信号，而不是只存一组扁平展示标签

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

- 当企业端确认 AI 拆解后，平台先基于数据库做“画像召回 + 多信号排序”，默认返回 4 位左右候选人才
- 企业端可直接从推荐名单中选择人才，或手动进入人才广场继续补充筛选
- 当前排序主要参考：任务标签、人才画像标签、可承接服务方向、平台评分、响应速度和档期摘要
- 推荐结果必须附带可解释字段，例如 `matchScore / reason / availability / services`，方便企业理解为什么会推荐这位人才
- 当企业端发起协作并进入需求 / 工期确认阶段时，自动创建任务房间
- 房间与 `task_id` 一一关联
- 系统消息可通过平台和腾讯 IM 双写
- 会话摘要建议随任务主数据同步保存 `taskTitle / counterpartName / stage`
- 任务确认卡允许企业端在已确认后继续发起变更，聊天页只负责展示版本与处理历史，不关闭修改入口
- 当腾讯 IM 连接或发送失败时，页面只展示已同步的历史消息并明确提示错误，禁止继续发送新消息，也不回退 mock 数据
- 聊天结束后再生成 AI 沟通纪要，可减少摘要请求次数，也更符合“按轮次沉淀结论”的协作方式
- `spring-app` 已补正式上传底座第一阶段：上传会话、二进制中转、任务附件登记与任务附件列表已可用
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

- frontend_mobile_h5 已切到 mobile-first H5 页面骨架
- 前台独立注册页与独立登录页入口
- 人才注册支持预置标签多选与自定义专业，并在注册时写入结构化 `skills`
- H5 前端通过 `VITE_API_BASE` 指向共享后端 API
- 前台读写失败态已显式回显
- 后台管理审核队列、任务流转、风控工单操作
- 后台管理列表主视图、操作栏和抽屉交互
- Spring Boot 正式服务骨架
- Spring Boot 注册链路已支持人才标签落库
- Spring Boot 管理接口真实仓储读写
- Spring Boot 入驻接口真实持久化
- Spring Boot 任务生命周期真实持久化
- Spring Boot 任务房间预览真实读库
- Spring Boot 公共展示接口数据库优先读取
- SQL 结构
- SQL seed 数据
- 腾讯 IM 页面优先真实配置，无法连通时展示已同步聊天记录与错误提示
- `frontend_mobile_h5/src/data/mock.js` 已删除，`frontend_mobile_h5/src/pages/recordData.js` 仅保留格式化辅助

未实现：

- 短信 / 邮箱验证码、找回密码与更细粒度风控
- 文件服务的权限控制、审计与生命周期治理
- 真实 AI
- 真实腾讯 IM 的更完整稳定联通、离线提醒与异常重试治理
- 更完整的实时消息与业务事件总线治理
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
