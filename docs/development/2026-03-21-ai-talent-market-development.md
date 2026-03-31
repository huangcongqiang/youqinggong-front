# AI 人才协作市场开发文档

> 2026-03-28 说明：产品需求、流程设计、H5/PC 界面规范与目标架构，已切换到 2026-03-28 的新主文档。本文件只维护当前工程结构、运行方式、开发约定和实现状态，不再承担产品规范正文。

## 1. 开发目标

本文件用于说明当前工程如何继续开发、如何运行、如何扩展，以及后续团队接手时应遵循的约定。

## 1.1 项目维度持续推进规则

当前项目默认按“主线 -> 阶段 -> 切片 -> 下一主线”的方式连续推进。除非用户明确暂停、转向或结束，否则不因单个阶段完成而停住。

对跨度较大的阶段，默认再拆成“切片级执行计划”；每完成一刀后必须把下一刀显式写进文档，而不是只靠会话上下文记忆继续。

当前又新增一条硬门槛：每个切片都必须先完成根 `docs/` 回写、四个 `docs` 副本同步、整端 UI 审查、全量主路径功能回归和阻断项清零，才允许把下一切片标成 `进行中`。

执行规则正文见：

- [项目维度持续推进规则](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-continuous-phase-execution-rules.md)

项目级主线索引与当前默认下一步见：

- [项目主线执行计划](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-project-mainline-execution-plan.md)
- [主线 9 剩余阶段连续执行计划](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-standard-remaining-execution-plan.md)

## 1.2 当前活跃主线登记

- 已完成主线：
  - 文档与规范对齐
  - PC Web 前台收口
  - H5 前台收口
  - `PC / H5` 共享数据层与运行时收口
  - `spring-app + MySQL` 正式主链接管
  - 文件上传 / 实时事件 / IM 回写正式化
  - 审批 / 请款 / 开票 / 对账 / 结算 / 争议主链
  - 上线准备与全链回归
- 当前活跃主线：
  - PC + H5 前台全页 UI 截图评审与改版
- 上一条已完成主线：
  - 达到上线标准
- 当前主线收口结论：
  - 主线 9 当前已完成：阶段七切片二的九组真实主路径、整端 UI 审查、对象页来源链 / 返回链与多跳聊天 / 协作路径回归都已过门
  - 阶段七切片三已完成：最终验收后未再发现必须在上线前关闭的新阻断项；前台大包体积 warning 与 root mock fallback 已降级为非阻断技术债
  - 阶段七切片四已完成：根 `docs/`、四个 `docs` 副本与项目总计划已统一升级为 `正式上线可测`
  - 边界说明：本轮最终浏览器终验使用 `spring-app` 的 H2 本地运行态验证正式链合同与页面承接；部署与上线目标仍以 `spring-app + MySQL` 为准
- 当前默认下一步：
  - `主线 10 阶段二：共享视觉系统与壳层整改，并先推进 H5 企业协作空间的业务态收口，再继续 PC 发布任务与 PC 企业人才广场的组 2 收口`

当前主线 10 的阶段状态：
  - 阶段一已完成：PC/H5 截图基线、评分总表、路由矩阵与跨页问题归纳已建档，当前已锁门户、工作台、聊天 / 协作 / 验收 / 记录详情这批高频页面
  - 阶段二进行中：共享视觉系统与壳层整改已启动，当前正在统一标题层级、卡片密度、按钮 / 标签语义与 PC / H5 首屏壳层
  - 阶段三进行中（PC 组 1 二次截图已完成，组 2 业务页已启动）：门户、注册、企业 / 人才工作台当前都已补到二次截图，工作台第二轮减重已基本稳定；首页和注册页已进入最终过门判断；发布任务与企业人才广场已进入首轮业务页整改
  - 阶段四进行中（H5 组 1 继续、组 2 已启动）：落地页、登录页、注册页与企业 / 人才工作台当前都已补到二次截图，登录页也已完成入口语言压缩与结构收口；企业协作空间与人才任务广场已进入首轮业务页整改，其中协作空间空态已完成一轮收简，人才任务广场已完成“主筛选 + 更多筛选”的第一轮压缩
  - 阶段五待开始：整端 UI 复审、阻断项清零、主线收口

当前主线 9 的阶段完成事实：
  - 阶段一已完成：发布任务、AI 拆解确认、选人、协商确认、闭环摘要以及进度 / 验收 / 评分写链的当前 actor 边界已统一从 token 解析，不再信任前端传入的当前操作者字段
  - 阶段二已完成：`spring-app` 已补齐 `GET /api/ai/publish-presets`、`POST /api/ai/decompose` 与 `POST /api/tasks/{taskId}/negotiations/task-confirmation` 的前台主链合同；任务确认卡当前已真实持久化到任务实体，并被聊天房间与记录详情读模型复用
  - 阶段三已完成：聊天会话列表、会话详情、房间定位 / 创建与消息发送主链已切到 `spring-app`，当前前台聊天主路径不再默认依赖 root mock
  - 阶段四已完成：`workspace-feedback / early-completion / cancellation / acceptance` 已进入 `spring-app` 正式写模型；`workspace / closure / orders` 当前优先读取正式写链投影，验收说明与状态历史已有独立持久化留痕
  - 阶段五已完成：`GET /api/business` 与 `GET /api/talent` 当前已补齐 `attentionHeadline / attentionItems / notificationItems / notificationGroups` 正式读模型，通知中心 / 审批中心 / PC 工作台顶部待办已可优先消费
  - 阶段六已完成：本地双跑端口当前已明确为 `root mock:8080 / spring-app:8081`，PC/H5 前端已补统一 API 目标切换层并默认切到 `spring-app`；root mock 当前通过 env、query 与本地缓存继续保留联调 fallback
  - 主线 6 阶段一已完成：`spring-app` 已补正式上传底座，当前已提供 `POST /api/uploads/presign`、`PUT /api/uploads/{uploadId}/binary`、`GET /api/uploads/{uploadId}/content`、`POST /api/tasks/{taskId}/files`、`GET /api/tasks/{taskId}/files`，并把聊天附件、协作进度附件与记录详情资产库统一索引到 `task_files`
  - 主线 6 阶段二已完成：`spring-app` 已完成 `providerRoomId` 房间反查、`providerMessageId` 文本 callback 幂等入库与 `chat_messages` 第一批正式回写；当前仍未包含 callback 验签、附件 callback 与异常重试
  - 主线 6 阶段三已完成：`spring-app` 当前已把 `task -> room -> provider group -> currentUser / counterpartUser` 收口为后端事实源，`GET /api/im/tencent/config` 已成为鉴权后、房间感知的正式配置接口；前端继续保留腾讯 IM SDK 收发，但不再把建群、加群和成员关系当成系统真相
  - 主线 6 阶段四已完成：`spring-app` 当前已补 `GET /api/events/stream` 正式 SSE 入口，PC / H5 的业务状态刷新当前优先走 `businessEventStream`；`CRLF` 帧解析、断流重连、任务级事件接收人边界也已收口，聊天正文继续复用腾讯 IM 实时通道
  - 主线 7 阶段一已完成：`Approval / Claim / Invoice / Reconciliation / Settlement / Dispute / RiskTicket` 的最小对象合同、状态集合与禁止流转边界已冻结到根 `docs/`
  - 主线 7 阶段二已完成：企业端审批中心当前已正式消费 `GET /api/enterprise/approvals` 的 `approvalHeadline / approvalItems / approvalGroups`；第一批高频审批对象已按 `approvalId` 进入 dedicated approval list/detail/action 主链，`matching / followup` 不再混入审批中心，第一批直提动作当前只开放 `confirmations / cancellations`
  - 主线 7 阶段三已完成：`spring-app` 已新增正式 `Claim` 对象、`POST /api/tasks/{taskId}/claims` 与 `POST /api/enterprise/claims/{claimId}/actions`，请款资格当前按正式任务生命周期判断，记录详情已补 `claimSummary` 与 `sections.claimSummary`，任务生命周期已补 `CLAIM` 事件留痕
  - 主线 7 阶段四已完成：`spring-app` 已新增正式 `Invoice / Reconciliation` 对象、`POST /api/claims/{claimId}/invoice` 与 `POST /api/enterprise/reconciliations/{reconciliationId}/actions`；记录详情当前已补 `invoiceSummary / reconciliationSummary`，并按同一条 `claim -> invoice -> reconciliation` 链聚合财务摘要
  - 主线 7 阶段五已完成：`spring-app` 已新增正式 `Settlement` 对象、`POST /api/enterprise/settlements/{settlementId}/actions` 与 `settlementSummary`；对账确认后当前会自动生成 `PENDING_EXECUTION` settlement，记录详情 / 闭环详情 / 时间线也已补齐 `SETTLEMENT` 留痕
  - 主线 7 阶段六已完成：对账异议当前会生成正式 `Dispute` 与 `RiskTicket`；记录详情 / 闭环详情当前已补 `disputeSummary`；后台合规页当前可读取 `targetType=DISPUTE` 的风险工单，后台更新风险工单状态后会同步回写争议状态
  - 主线 8 阶段一已完成：`spring-app` 争议 / 审批 / 记录详情 / 闭环详情的最小合同回归已完成；PC 聊天页已补齐 `approvalId / originApprovalId` 的对象页来源栈；H5 聊天详情页已接入 `objectPageContext` 并按真实来源回链；H5 验收 fallback 合同已补齐 `disputeSummary / claimSummary / invoiceSummary / reconciliationSummary / settlementSummary`
  - 主线 8 阶段二已完成：PC / H5 `businessEventStream` 当前已补 `onStatusChange / onSyncError`，可显式暴露 `connecting / open / fallback / paused / disposed / disabled`、`transport`、`reason`、`reconnectCount`、`lastConnectedAt`、`lastErrorAt`；`spring-app` 的 SSE、上传和腾讯 IM callback 当前也已补最小结构化日志
  - 主线 8 阶段三已完成：`正式上线可测` 的唯一通过条件当前已冻结到版本状态总览、测试清单和后端上线前能力清单
  - 状态边界：当前仍处于“root mock API 演示可测、spring-app 主链部分正式化 + 第一轮终验已通过”的混合态；PC/H5/后台默认主链当前都已切到 `spring-app`
  - 阶段一已完成：`spring-app` 当前已支持 `enterprise / talent / admin` 三类 audience 的正式 `register / login / me / logout`；管理台前端已补最小登录页、登录态存储、路由守卫与退出流程；`/api/admin/*` 当前已强制走正式管理员 token
  - 阶段二已完成：`TaskLifecycleApplicationService` 当前已移除正式写链上的 demo fallback；管理台 `createUserDraft / reviewDecision / createTaskDraft / transitionTask / updateRiskTicket` 当前已切到真实 formal payload / 404；PC 聊天页、协作页、验收页、记录详情页第一批失败消费也已切到“空态 + requestError”
  - 阶段三已完成：`TencentImCallbackService.receiveEvent(...)` 当前已返回正式 callback ack；消息 callback 已支持附件回写与 `task_files` 索引；PC / H5 协作附件已切到 `presign -> binary -> task file register` 正式链，聊天附件也已在发送前先走正式上传会话链
  - 阶段四已完成：`spring-app` 当前已补 `actuator health / readiness`、`businessRealtimeEvent / uploadStorage / tencentImConfig` 三类健康细节；PC / H5 工作台、协作空间、验收页、通知中心、审批中心当前都能显式展示实时事件流状态与 fallback 信息
  - 阶段五已完成：`spring-app` 的 `/api/admin/compliance`、`/api/admin/dashboard`、`/api/admin/users`、`/api/admin/tasks` 当前都已移除对应 demo fallback；后台管理前端与 fallback 也已完成 `organizationPermissions` 对齐
  - 阶段六第一刀已完成：`spring-app` 的 `POST /api/auth/login` 当前已补最小登录失败限流，同一 `audience + mobile/email` 在 10 分钟窗口内连续失败达到阈值后，会返回正式 `429 Too Many Requests`
  - 阶段六第二刀已完成：`spring-app` 的 `POST /api/uploads/presign` 当前已补最小 burst guard，同一账号在 1 分钟窗口内连续申请上传会话达到阈值后，会返回正式 `429 Too Many Requests`
  - 阶段六第三刀已完成：`POST /api/tencent-im/callback/events` 与 `POST /api/tencent-im/callback/messages` 当前已补 callback header/secret 校验，未通过校验时返回正式 `401 Unauthorized`；`POST /api/tasks/publish` 也已补 burst guard，`TencentImConfigHealthIndicator` 当前会暴露 `callbackSecretConfigured`
  - 阶段六第四刀已完成：`GET /actuator/health` 与 `GET /actuator/health/readiness` 当前已补 `requestProtection` 组件，并冻结 `loginRateLimitEnabled / uploadPresignBurstGuardEnabled / publishBurstGuardEnabled / tencentImCallbackProtectionEnabled` 四类保护开关；`businessRealtimeEvent` 当前已补 `emitFailureThreshold / lastConnectAt / lastPublishAt / lastEmitFailureAt`，`uploadStorage` 当前已补 `checkedAt`，`tencentImConfig` 当前已补 `callbackProtectionEnabled`
  - 阶段六第四刀验证已完成：`ActuatorHealthApiControllerTest`、`backend/spring-app` 全量测试、`frontend / frontend_mobile_h5 / admin` 构建、四个子项目仓库 `git diff --check` 与根 `docs/` 副本一致性检查均已通过；本刀未新增前台视觉改动，PC / H5 / 后台管理按界面规范复核后未发现新增 UI 阻断项
  - 阶段六第五刀已完成：部署文档与后端上线前能力清单当前已冻结最小运行手册、回滚动作与慢查询 / 索引关注点；当前明确要求先判断是否打到真实 `spring-app` JSON health，再读取 `requestProtection / businessRealtimeEvent / uploadStorage / tencentImConfig` 的关键信号，不能跳过 readiness 直接靠页面现象猜测
  - 阶段六第五刀验证已完成：`ActuatorHealthApiControllerTest`、`TencentImCallbackControllerTest`、`UploadApiControllerTest#presignReturnsTooManyRequestsAfterRepeatedBurstRequests` 已通过；本刀未新增前台视觉改动，整端 UI 审查复核后未发现新增阻断项
  - 阶段六第六刀已完成：阶段六切片当前已全部收口；`backend/spring-app` 全量测试、`frontend / frontend_mobile_h5 / admin` 构建、四个子项目仓库 `git diff --check` 与根 `docs/` 副本一致性检查均已通过
  - 阶段七第一刀已完成：测试清单、版本状态总览和后端上线前能力清单当前已冻结“正式上线可测”的最终销项清单，并明确每个切片都必须先通过整端 UI 审查和全量主路径功能回归，才允许继续推进
  - 阶段七第二刀已完成：企业 PC、人才 PC、企业 H5、人才 H5、后台管理、`spring-app`、上传链、IM callback、`SSE / readiness / health` 九组真实主路径已全部验收通过；PC 聊天深链白屏、人才 H5 协作页节点渲染异常与 workspace 房间键合同偏差 3 个阻断项也已关闭
  - 阶段七第三刀已完成：最终验收后未发现新的必须上线前关闭阻断项；`MessagesPage` / `element-plus` 大包体积 warning 与 root mock fallback 当前归档为非阻断技术债
  - 阶段七第四刀已完成：项目当前已满足根 `docs/` 冻结的“正式上线可测”标准，主线 9 正式收口

## 2. 当前目录

```text
frontend/
frontend_mobile_h5/
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
- `/register`
- `/enterprise`
- `/enterprise/onboarding`
- `/enterprise/publish`
- `/enterprise/talents`
- `/enterprise/talents/:slug`
- `/enterprise/chat`
- `/enterprise/workspace`
- `/enterprise/acceptance`
- `/talent`
- `/talent/onboarding`
- `/talent/tasks`
- `/talent/profile/:slug`
- `/talent/chat`
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

本地双跑当前约定：

- root mock backend：`http://localhost:8080/api`
- `spring-app`：`http://localhost:8081/api`

PC / H5 前端当前支持以下切换方式：

- `VITE_API_BASE`
- `VITE_API_TARGET=mock|spring`
- `VITE_ROOT_MOCK_API_BASE`
- `VITE_SPRING_API_BASE`
- query：`?apiTarget=mock|spring`
- `localStorage['youqinggong.api.target']`

## 4. 开发约定

### frontend / admin

- 使用 Vue 3 组合式写法
- 页面与组件分层管理
- 样式以 CSS 变量和响应式布局为主
- 优先保留页面结构清晰度，不要堆过多装饰
- 协作相关页面优先保证时间线、附件状态、AI 巡检和信用信息可追踪
- 官网首页只负责介绍、案例、联系方式和角色入口
- 官网首页优先控制在 `Hero / 角色入口 / 核心差异点 / 案例与联系方式` 四段，不再叠加过多解释模块
- 官网首页视觉更接近品牌官网展示页，不直接搬用工作台指标卡与功能清单
- 官网首页布局优先采用单列流式展示，避免桌面端双列内容过多造成视觉膨胀
- 官网首页案例区优先使用“一个轮播区块内切换企业 / 人才案例”的图片化展示方式，不要退回普通列表卡片；轮播舞台高度保持一致，避免切换抖动
- 官网首页继续精修时，优先增加办公氛围图、视觉节点和结果证明，减少长说明句和重复 icon；角色入口优先只保留标题、短描述和动作，不额外叠装饰性图标
- PC 列表页统一按办公端收口：企业端人才广场、人才端任务广场、发单记录、接单记录和后台列表优先使用顶部摘要 + 筛选区 + 行式列表 / 表格 + 详情抽屉 / 右侧上下文 + 批量动作，不再把核心管理场景做成大卡片瀑布
- PC 发单记录 / 接单记录当前已把批量选择、当前页 CSV 导出、本地归档与恢复动作接到工作带，保持“批量工具条 + 行级详情入口”并存，不让批量操作影响详情跳转
- 前台整体视觉优先采用“午夜官网 + 冷静产品面板”方向，减少高饱和霓虹和过密说明文字
- 注册与登录不要再混在官网首页同一块内容里
- 注册优先走独立的单列步骤页
- 登录优先通过弹窗承接
- 企业端与人才端在路由层分开，不要再把两个角色混在一个页面路径里
- 企业端与人才端工作台优先采用“单列总览 + 模块入口卡”的结构，不要再把完整业务详情塞进工作台首页
- 工作台 Hero 优先保留一个主动作、一个次动作
- 工作台主区优先收成 3 张主模块卡，其它信息进入“更多信息”弹窗
- 工作台模块卡优先保留“标题 + 简短摘要 + 1 到 2 条预览 + 主动作”，避免继续膨胀
- PC 工作台顶部待办、通知与审批入口已统一到共享入口层，企业端偏审批式动作，人才端偏确认式动作，避免继续散落在模块卡内部
- 共享待办入口优先只展示高优先级事项：待确认、待修改、待评级、待取消、待回看
- 企业端工作台需要补“发单记录”轻量区，默认按发布时间倒序，卡片只保留任务名、发布时间、预算、状态和入口
- 人才端工作台需要补“接单记录”轻量区，默认按确认时间倒序，卡片只保留任务名、确认时间、预算或收入、状态和入口
- 企业端入驻页优先采用“步骤式单列引导”，把资料上传放在最后一步
- 入驻页整体继续做减法，只保留切换、字段、上传、步骤和提交反馈，不再在页内堆资料清单、账号状态或说明模块
- 发布任务时必须提供预算输入，并同步给任务广场与聊天页任务详情弹窗
- 预算为空时，前端统一展示“未填写预算”
- 企业端发布任务页在“正式发布成功”后，应自动弹出推荐人才弹窗，支持直接选人或跳过
- AI 推荐结果和标签优先国内可用工具与业务 / 交付标签，不再默认展示技术框架标签
- 入驻页文案优先短句表达，避免在表单页堆叠大段说明
- 合作偏好优先使用结构化多选项，不要依赖自由文本
- 资料上传允许“稍后补交”的产品路径，后续可在企业工作台继续补材料
- 当前 mock API 会记录企业入驻提交时的文件元信息与合作偏好
- 企业入驻成功后，前端应直接跳转到企业工作台
- 用户可见状态统一显示中文，不直接展示 `PENDING_REVIEW / NOT_SUBMITTED` 这类内部状态码
- H5 人才详情页继续按轻量对象详情承接，优先展示头像、履历、平台结果、作品和评价
- PC 人才详情页开始按“对象决策页”收口：第一屏先给结论、关键指标和动作，随后承接能力、作品、合作方式和平台表现
- 聊天页与协作工作区拆开，聊天只负责即时沟通，阶段推进留在协作工作区
- H5 聊天页统一采用“会话列表页 + 聊天详情页”的单焦点结构，避免在同一页并存会话列表和消息详情
- 移动端导航统一采用更接近普通 App 的底部 tab bar，而不是悬浮快捷条；顶部收成轻量顶栏，页面主体需为底部导航预留安全区
- H5 聊天已拆成“会话列表页 + 聊天详情页”，移动端不再同屏承载会话列表和消息详情
- H5 聊天页已把附件预览、任务详情、沟通纪要、纪要确认、任务确认操作 5 个底部 sheet 全部拆成异步组件，当前主页面主要保留消息线程、会话切换和 IM 状态逻辑
- H5 聊天详情页已进一步收成“只处理当前会话”，会话列表、搜索和筛选只保留在 `ChatInboxPage`，不再在详情页重复承载两套结构
- 桌面聊天页也已把附件预览、任务详情、沟通纪要、纪要确认、任务确认操作 5 个重弹层全部拆成异步组件，主页面主要保留三栏工作区、消息线程和实时状态逻辑
- H5 企业端 / 人才端工作台主视野优先只保留 3 张主入口卡：聊天、任务/发布、协作；记录入口收进“更多信息”或独立记录页
- H5 企业端 / 人才端工作台已进一步压缩为“待办 + 2 个首屏入口 + 更多信息”，减少模块堆叠
- H5 工作台第一阶段已完成：企业端首屏当前固定为“优先处理 + 项目聊天 + 发布任务 + 更多信息”，人才端首屏固定为“优先处理 + 项目聊天 + 任务广场 + 更多信息”；旧的模块卡和重复摘要已下沉
- H5 协作页主视野优先保留当前任务、节点和主动作；最近记录、历史摘要等次级信息通过 sheet 承接
- H5 协作空间第二阶段已完成：首屏当前固定为“当前任务摘要 + 主动作 + 次动作 + 轻入口 + 当前节点”，多任务切换、任务详情、最近记录与完整节点已下沉到详情层
- H5 协作页已进一步压缩首屏密度：关键节点默认只露出少量高优先节点，其余记录进 sheet 或节点详情
- H5 记录 / 验收详情链第三阶段已完成：记录列表继续保持轻量列表首屏，记录详情首屏当前统一为“结论 + 动作 + 当前状态 + 附件留痕”，验收页首屏当前统一为“当前结论 + 当前唯一待处理动作 + 动作结果”
- H5 记录详情里的补充信息、交付范围、最新留痕、确认历史和过程节点已统一下沉到 `DetailAccordion`；验收页的评级依据、评分反馈、信用影响和过程节点也已统一下沉到 `DetailAccordion`
- H5 对象页第四阶段已完成：聊天详情页已去掉重复摘要层，任务确认卡当前只保留预算、工期、协作安排、档期和主动作，版本历史与更长说明已下沉到任务详情 / 任务确认 sheet；记录详情首屏状态区也已进一步压缩
- H5 聊天第五阶段已完成：`MessagesPage.vue` 当前已把消息展示、附件展示、房间预选、房间摘要 enrich 和刷新节奏判断抽到独立 helper 文件，页面优先保留会话编排、主动作和对象级 UI
- 桌面聊天页开始按“左会话 / 中消息 / 右上下文”收敛，右侧上下文栏承接任务摘要、AI 修改建议和沟通纪要入口
- 桌面聊天页已补来源链与上下文保持：从工作台、通知中心、审批中心、记录详情、协作空间进入聊天时，会保留 `taskId / room / recordId / nodeId / source`，并在页头提供轻量来源提示、消息来源提示与返回来源入口
- 桌面聊天页当前已补“按 `taskId` 反查会话”的兜底；当 URL 没有 `room` 但有 `taskId` 时，会优先定位当前任务房间，而不是直接回到最近会话
- 桌面聊天页右侧当前已补“记录级摘要”：当来源带 `recordId` 时，右栏会继续显示该记录的阶段、金额、评级、最近留痕和查看记录入口，不再只停留在任务确认摘要
- 桌面前台业务页已切到独立工作区壳：左侧业务导航 + 顶部状态条 + 主工作区
- 桌面工作台已从 Hero + 模块卡页面收成“待办 + 桌面摘要 + 主模块卡”的驾驶舱式首页
- 桌面工作台顶部已进一步统一为共享待办入口层：企业端采用“审批式待办”，人才端采用“确认式待办”，通过同一组件承接统计、主次动作和高优先级事项
- 桌面协作空间已继续深化为“左任务切换 / 中主工作区 / 右固定上下文”的桌面工作区，任务动作、节点、执行表单和上下文已按更稳定的工作区层级收口
- 桌面协作空间已补精确锚点：`taskId / nodeId` 不再只停留在 URL 和顶部标签，当前任务 / 当前节点会在工作区内形成真实当前态；刷新、直达 URL 与节点弹窗之间保持同步
- 在协作空间里手动切换任务时，页面会主动清掉旧 `room / recordId / nodeId / source`，避免把上一条来源链错误继承到当前任务
- PC / H5 协作页当前也已统一到共享 `workspacePayload` 归一层：`taskOptions / collaborationNodes / executionChecklist / progressFeed / aiReviewHistory / supportOptions / acceptance` 的清洗合同已对齐；PC 端同时补齐了 `requestError / requestStatus` 失败态消费，不再把 query 失配或写操作失败静默当成功
- PC / H5 记录详情当前已按同一套对象合同消费 `summary + record`，并统一了 `formatMoney / formatDateLabel / formatDateRangeLabel / formatGrade` 这组 formatter；最新进展、AI 审核、评分、交付件、附件与确认历史也已从页面里抽到独立 `recordDetailViewModel`
- PC / H5 当前已补齐镜像维护的 `objectPageContext` helper，统一对象页上下文读取、回链 query 和来源文案；H5 只消费子集字段，PC 使用完整合同
- 新开发约定：对象页上下文 helper 当前按镜像方式维护在 `frontend` 与 `frontend_mobile_h5`，要求导出同名 API、同参数和同返回结构；新增字段先改合同，再双端同步，不允许一端先扩、一端滞后
- 这次收口属于前端对象页 formatter / view model 对齐，不等于记录详情与聊天 / 协作空间 / 验收页的上下文纯函数已经完全共享；这一部分会在当前主线的下一阶段继续推进
- 桌面企业端人才广场已收成“顶部轻总览 + 快速筛选 + 左侧资源目录 + 右侧稳定详情承接”的办公端目录页，不再继续用营销式展示卡片做主结构
- 桌面人才端任务广场已收成“顶部总量 + sticky 筛选工作带 + 左侧任务池 + 右侧详情轨”的任务池工作台，但还未进入真实批量处理阶段
- 桌面发单记录 / 接单记录已收成“摘要条 + sticky 工作带 + 行式列表 + 批量操作骨架 + 详情入口”的办公页方向，不再继续扩张为大卡片瀑布
- 桌面后台列表页也开始同步向办公端列表收口，默认承接筛选、排序、行级操作和抽屉式详情，不再以大表单或大卡片作为主结构
- 桌面发单记录 / 接单记录详情页已开始按“第一屏结论 + 关键结果 + 时间线 + 资产与动作入口”的复盘页方向收口
- 企业端协作空间的中栏当前只承接任务动作与交付节点，右栏承接预算、工期、合作对象、最近提交、最近 AI 审核和任务详情入口
- 人才端协作空间沿用同一桌面壳，主区优先“提交进展 -> 节点 -> 关键动作”，最近记录下沉到侧栏或次级区，不再与执行表单争抢主视野
- PC 待办 / 通知 / 审批入口聚合阶段已经完成：工作台顶部待办已统一到共享入口层，企业端和人才端都已补独立通知中心页，负责继续承接高优先级事项、分组列表与精确跳转
- PC 通知中心数据口径深化阶段已经完成：`GET /api/business` 与 `GET /api/talent` 已补 `notificationItems / notificationGroups`，通知中心页优先消费真实通知项与分组，只在缺失时回退到旧的 `attentionItems`
- PC 企业端审批中心骨架阶段已经完成：企业端新增独立审批中心页，工作台顶部待办主动作和桌面壳审批入口都会进入审批中心；从审批中心进入协作空间和记录详情后，返回链会继续回到审批中心
- PC 待办入口语义收敛阶段已经完成：工作台顶部共享待办入口现在优先消费 `notificationItems / notificationGroups`，只有缺失时才回退到 `attentionItems`；展开区统一改成“补充概览”，不再误导成“查看全部待办”
- 企业端工作台进入审批中心、人才端工作台进入通知中心时，会附带 `group` query 让左侧分组直接落到对应类别；缺少处理入口的数据项在共享待办卡里只展示禁用态，不再静默 fallback 到默认页
- PC 通知 / 审批对象级预选阶段已经完成：工作台顶部待办和模块弹层进入通知中心 / 审批中心时，会继续透传 `itemId / taskId / room / recordId`；中心页收到后会优先选中对应事项，而不是退回当前分组第一条
- PC 通知 / 审批返回链对象级保持阶段已经完成：通知中心 / 审批中心进入聊天、协作空间、记录详情时，会继续保留 `group + itemId + taskId / room / recordId / source`；这些页面点击“返回来源”后，会优先恢复原分组与原对象，`center -> chat/workspace/record -> return` 已闭合
- PC 多跳来源上下文栈阶段已经完成：记录详情、协作空间、验收页当前都按 `source + originSource` 承接导航上下文，其中 `source` 表示直接上一页，`originSource` 表示最终通知中心或审批中心；`center -> chat/workspace/record/acceptance -> return` 已闭合
- PC 首页中心入口合同阶段已经完成：首页共享待办入口、模块弹层入口和首页快捷入口当前统一先进入通知中心或审批中心，不再直接跳聊天、协作空间、记录详情或验收页；首页透传的 `group + itemId / taskId / room / recordId` 只用于中心页预选
- 模块弹层当前只保留“进入中心页”和少量安全的泛入口 secondary 动作；发布任务、任务广场可继续直达，但聊天 / 协作 / 记录详情不再从首页弹层直接保留对象页入口
- `frontend/src/utils/attentionNavigation.js` 已新增为共享 route/anchor helper，统一中心入口 route 构建和模块首选事项选择逻辑，避免企业端 / 人才端各自继续分叉
- 手动切换会话或任务时，前端会主动清掉旧 `itemId / group / source / originSource / tab / room / recordId / nodeId`，避免把上一条工作链错带到当前对象
- 通知中心 / 审批中心的摘要动作、跨中心动作和对象页入口当前也会继续保留对象级锚点，不再只剩“回到某个中心页”这一层
- PC 中心页当前对象动作带阶段已经完成：通知中心 / 审批中心右侧当前对象摘要区当前都会围绕 `selectedItem` 展示对象动作带，按可达性承接聊天、协作空间、记录详情、验收页和次动作入口；顶部摘要高亮也优先跟随当前对象，而不是继续跟着列表前几项漂移
- PC 中心页对象动作合同共享化阶段已经完成：通知中心 / 审批中心右侧动作区当前统一消费共享 helper，动作去重、聊天 / 协作 / 记录 / 验收 canonical route 与对象锚点挂载不再在两个页面里各自分叉
- PC 中心页当前对象稳定态与失效态阶段已经完成：当 URL 显式带 `itemId / taskId / room / recordId` 且当前事项命中失败时，通知中心 / 审批中心当前会进入显式失效态，而不是静默切到无关首项；用户手动切组或手动重新选事项后，失效态会被正确清掉
- PC 中心页失效态安全恢复动作阶段已经完成：通知中心 / 审批中心在当前对象失效时，当前都会补“查看当前分组首项 / 清除当前定位 / 查看全部事项”这类安全恢复动作；恢复动作只在当前分组或当前中心内生效，不再静默跨组替用户跳转
- PC 中心页摘要卡与 footer 动作对齐阶段已经完成：通知中心 / 审批中心在当前对象失效时，顶部摘要卡、右侧空态和底部 footer 当前都统一复用同一组恢复动作，不再出现顶部仍叫“去处理”、底部仍保留对象级动作、右侧却已进入恢复态的分叉语义
- PC 记录详情 / 协作空间 / 验收页回链一致性阶段已经完成：三页当前统一把 `group + itemId + taskId / room / recordId / tab + source / originSource` 当作来源栈；进入下一层时会继承最终来源，返回上一层时不会丢对象锚点；返回按钮文案也会改成“返回聊天 / 返回协作空间 / 返回记录详情 / 返回通知中心 / 返回审批中心”等真实目标；一旦中心页执行恢复动作，后续下游页也只会绑定恢复后的新对象，不再继续带旧失效锚点
- 会话列表采用横向滚动卡片条，长标题和最后一条消息超出后使用省略号
- 会话选中态改为整卡高亮，不再使用竖条强调
- 聊天主区域使用固定高度线程容器，任务确认卡作为消息流第一块内容，和消息保持同层级
- 输入区单独放在消息容器下方，不让任务确认卡或消息列表把发送区挤出视野
- 聊天消息逐条保存，AI 沟通纪要改成用户主动点击“结束本轮沟通并生成纪要”后再生成
- AI 沟通纪要通过聊天头部动作 + 弹窗查看，不要长时间占据聊天主内容区
- 生成纪要前提供确认弹层，生成完成后给用户明确反馈
- 聊天页支持文本 + 附件混发，图片支持缩略图与弹窗放大，通用文件先以附件卡片展示
- 消息展示区需要独立容器包裹，并用固定高度 + 内部滚动的方式保证结构稳定
- 当腾讯 IM 可用时，文本、图片和文件消息优先走腾讯 IM；平台接口负责同步附件索引和房间摘要
- 聊天列表建议提供搜索、状态筛选和状态标签，不让用户在多个任务房间里盲找
- 聊天列表按最近消息时间倒序排列，人才被选中后新协商房间要自动顶到最前
- 企业端选中人才后，要自动创建“待确认任务”状态并同步到聊天页和人才工作台
- 从人才详情页点击“发起聊天”时，如果当前还没有房间，首次发送消息要自动创建房间，不能静默失败
- 人才端聊天页提供“确认任务 / 提出修改”按钮，企业端聊天页提供“修改任务说明并重新发送”入口
- 企业端发起新版本后，在人才未处理前不允许继续发送第二个变更；需要继续调整时先撤回本次变更
- 人才提出修改后，要先生成 AI 修改建议，再展示到企业端当前版本和任务详情里，帮助企业修改工期、预算和协作安排
- 企业重新发送前，要基于最新编辑内容再生成一轮 AI 复核，告诉企业这次修改是否已经基本覆盖人才反馈；企业附加说明也要进入这轮复核
- 首页改版、品牌官网、H5 展示、工作台视觉升级等首版任务，默认按 3 个 AI 协同工作日估算；只有整站重构或多端深度联动时才放宽到 4 到 5 个 AI 协同工作日
- 任务广场和聊天页都需要提供“查看任务详情”弹窗，复用同一份任务详情数据
- 人才端任务广场顶部只保留“当前任务总数”，不再展示待选人才、协商进行中等企业侧指标
- 人才端任务广场筛选统一收成标签、工期、价格、企业评级四组固定项，并保证企业评级真实回到任务卡和任务详情
- 任务确认卡需要保留 `版本号 + 完整历史`，企业每次重新发送都要形成新的版本快照；前台默认按“处理记录”展示，并过滤首次发起确认
- 处理记录默认按 `第 1 版 -> 第 2 版` 顺序展示；旧版本状态更新为“已修改”，新版本保持“待人才确认 / 待企业修改”
- 聊天页、任务详情和协作空间都要能看到当前预算、确认工期、协作安排和人才档期摘要
- 企业端和人才端的快捷回复分开维护，不共用同一组默认文案
- 企业端协作空间优先按“多任务切换 + 节点图 + 节点详情弹窗 + 企业反馈”来设计，不要再按单任务执行页理解
- 协作空间节点建议按任务模块 / 工作日组织，节点详情展示计划交付、实际提交、AI 审核、企业反馈和 AI 补充
- 协作空间的任务级动作统一放在页面顶部：提前完成、取消任务、进入验收与评级
- 提前完成流程必须经过 `企业发起 -> AI 审核 -> 人才确认 -> 企业 S / A / B 评级`
- 取消任务流程必须经过 `一方发起 -> 对方确认或拒绝`
- 人才对企业的合作评分需要回写到首页轮播、企业工作台和人才工作台摘要
- 人才端协作空间改成单列执行台，删除测试文案，主表单只保留完成度、进展说明、需要协助和附件
- 协作空间的记录列表保持单列，优先保证阅读顺序，而不是追求并排信息量
- 协作空间的“查看任务详情”走弹窗，不让人才为了回看预算和交付件跳离当前页面
- 进度提交成功后，前端需要立即把新纪录插入提交记录和附件列表，保证页面反馈及时
- 图片或文件发送较慢时，需要在输入区给出明确 loading，避免重复点击发送
- 聊天页不要展示腾讯 IM 接入状态、内部房间号、平台用户 ID 这类技术字段
- 系统消息只保留真实通知，不要在每次发送后再自动插一条 AI 系统回复
- 消息显示层按消息类型区分：系统居中、对方居左、自己居右
- 后台管理以列表为主，不要在主页面直接堆叠大型表单
- 后台交互优先使用操作栏、弹窗或抽屉处理新增、审核和流转

### backend

- 当前以 mock API 为主
- 后续迁移 Spring Boot 时保持路径不变，减少前端改动
- 数据模型优先和 SQL 保持一致
- 当前 mock API 会持久化保存聊天房间状态与聊天记录
- 当前 mock API 仅在显式调用聊天纪要接口时才更新 `communicationRecord`
- 当前 mock API 已支持保存附件元信息；正式文件上传与对象存储后续接入
- `frontend` 已安装 `tim-upload-plugin`，用于让图片与文件消息通过腾讯 IM 上传
- 当前开发版的“实时”能力先用“IM 即时收发 + 关键字段轮询刷新”承接，正式 socket / 实时事件总线放到后续正式服务阶段
- 聊天页当前已按通道状态做自适应刷新：IM 正常时降低轮询频率，fallback 视图保持更高的同步频率
- 桌面前台当前已去掉底部移动 tab bar 壳层，继续按 PC 工作台方向收敛
- 桌面前台已删除未再使用的 `MobileDock` 组件文件，PC 端不再保留移动端底部导航遗留实现
- 企业端工作台、人才任务广场、验收页、协作空间统一补轻量轮询，当前默认约 6 秒刷新一次，并在页面不可见时暂停，避免任务流转后状态停留在旧值
- 企业端与人才端工作台顶部统一增加红点数字待办提醒，优先暴露待确认任务、待修改、待评级和待取消事项
- root mock backend 已增加基础并发保护，当前通过串行化仓储访问来避免多人同时发消息、登录、改任务时的状态互相覆盖
- root mock backend 的本地状态文件已改成原子写，降低联调过程中 `.local/*.json` 被并发写坏的风险
- 验收页当前已按 `taskId` 显式读取，不再依赖默认聊天房间，避免多任务场景串任务
- `spring-app` 作为未来正式主服务继续扩展
- 当前 `spring-app` 已真实接入的范围：后台管理、入驻、任务生命周期、任务房间预览、协作空间反馈接口
- 当前 `spring-app` 已进一步接入：`publish-presets`、AI 拆解、任务确认版本流、聊天房间 / 记录详情里的真实 `taskConfirmation` 读模型
- 当前 `spring-app` 仍保留 demo/fallback 的范围：官网展示、企业端工作台、人才端工作台、人才详情、任务广场

## 5. 推荐开发顺序

### 第一阶段

- 补齐正式登录注册
- 完成企业入驻和个人实名认证
- 完成真实任务发布表单
- 完成真实文件上传

说明：

- 真实文件上传的推荐接口草案，已整理到
  [API 详细契约文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-api-contract.md)

### 第二阶段

- 接入真实 AI 拆解
- 接入腾讯 IM
- 建立任务房间与消息列表
- 增加验收提醒与互评规则

当前已具备的交付开发版能力：

- 前台官网分流、企业端任务闭环演示、人才端接单闭环演示
- 前台独立注册页与登录弹窗入口
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
[API 详细契约文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-api-contract.md)
为准。

1. 用户与入驻
2. 任务发布
3. AI 拆解与候选人才推荐
4. 企业端手动补充筛选与选人
5. 协作与里程碑
6. 企业端协作节点反馈
7. 上传进度
8. 验收与评分
9. 腾讯 IM 消息联动

## 7. 测试建议

详细可执行的测试与上线前回归口径，统一以
[测试清单与验收清单](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-test-acceptance-checklist.md)
为准。

### 前端

- 检查 390px 左右移动端布局
- 检查 1440px 宽屏 PC 布局
- 检查页面跳转和接口 fallback
- 检查官网首页到企业端 / 人才端的入口跳转
- 检查首页“注册跳页、登录弹窗”的入口是否正常
- 检查企业端只看人才广场、人才端只看任务广场
- 检查注册页是否保持单列步骤式结构
- 检查企业端 / 人才端工作台是否保持单列总览结构
- 检查企业端总览统计卡的详情弹窗是否展示待办和已完成统计
- 检查企业端发单记录是否按时间倒序展示，并可跳转到任务详情、聊天页和协作空间
- 检查人才端接单记录是否按确认时间倒序展示，并可跳转到任务详情、聊天页和协作空间
- 检查 PC 列表页是否统一向办公端收口：顶部摘要、筛选、行式列表 / 表格、批量动作和详情承接是否齐备
- 检查记录页、人才广场、任务广场是否共用同一套办公端列表 / 目录视觉 primitive，而不是各自保留旧卡片心智
- 检查企业端聊天列表是否显示任务名称、协作对象与阶段
- 检查已确认任务是否仍保留企业端发起变更入口
- 检查企业端协作空间是否能按任务切换，并通过节点弹窗查看人才提交、AI 审核和企业反馈
- 检查协作空间节点是否按任务模块 / 工作日展示，并包含计划交付与 AI 补充解释
- 检查企业端入驻页是否为单列步骤流，最后一步才展示资料上传
- 检查入驻页里的资料状态、审核状态和提交结果是否为中文文案
- 检查“稍后在工作台补交材料”路径是否能正常给出结果提示
- 检查人才详情页的作品轮播、图片弹窗、视频播放和链接跳转
- 检查消息页在腾讯 IM 发送失败时是否继续展示已同步的聊天记录
- 检查 4 组测试房间是否都能正常切换：需求确认、设计反馈、后端联调、验收复盘
- 检查消息页是否只保留聊天和 AI 沟通纪要，不再混入阶段推进内容
- 检查聊天页是否为单列结构：上方列表、下方聊天
- 检查会话列表是否固定高度、支持滚动，并对长文本做省略处理
- 检查协作工作区是否在企业端呈现多任务节点图、在人才端呈现单任务执行台
- 检查协作工作区是否只负责里程碑、进度、附件、AI 巡检和验收

### 后端

- 校验所有 `/api/*` 路由是否返回 JSON
- 校验 CORS 是否正常
- 校验 `POST /api/ai/decompose` 是否能读取 brief
- 校验 `GET /api/workspace` 和 `GET /api/tasks/{taskId}/closure` 是否能返回协作闭环数据
- 校验 `POST /api/onboarding/*`、`POST /api/tasks/*` 和 `GET /api/messages/task-room` 是否正确落库 / 读库
- 校验 `POST /api/onboarding/business` 在 `deferMaterials=true` 时是否返回 `PENDING_MATERIALS`
- 校验 `GET /api/business` 是否返回统计卡详情字段 `source / todos / doneStats`
- 校验 `GET /api/business` 和 `GET /api/talent` 的 `notificationItems / notificationGroups` 是否返回分组键、标题、摘要、时间、入口和上下文字段；缺失时再回退校验 `attentionItems / taskBoard / activeTasks`
- 校验 `GET /api/talents/{slug}` 是否返回头像、履历、平台结果和作品媒体字段
- 校验 PC Web 从工作台、聊天、记录列表、记录详情进入协作空间时，URL 是否保留 `taskId / room / recordId / source / tab`
- 校验 PC Web 从协作空间进入聊天，再返回协作空间时，`taskId / room / nodeId / source` 是否能稳定回到当前任务和当前节点
- 校验多人同时触发登录、发消息、选人、发起提前完成时，root mock backend 不会出现房间状态和任务状态互相覆盖

### 数据模型

- 检查任务与会话是否可映射
- 检查审核、评价、里程碑是否满足后续业务延展

## 8. 协作建议

- 新增页面前先补文档
- 新增核心字段前先同步 SQL
- 接入腾讯 IM 前先确认账号体系与任务房间策略
- 真实 AI 上线前先保留 mock 回退逻辑
- 调整后台交互时，优先保持“列表 -> 操作栏 -> 抽屉 / 弹窗”的统一模式
- 调整工作台时，优先保持“先总览、再模块入口、最后进入详情页”的信息顺序

## 9. 后续交接说明

当前项目适合作为第一版演示底座继续扩展。若后续团队继续开发，建议先阅读以下文档：

1. 需求文档
2. 设计文档
3. 技术文档
4. SQL 表结构
5. 开发文档
