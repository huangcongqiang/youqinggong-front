# `spring-app + MySQL` 正式主链接管主线

## 主线目标

把当前“root mock API 演示可测 + spring-app 部分正式化”的状态，逐步推进到“前台主路径默认走 `spring-app + MySQL`”。

## 范围

本主线优先处理：

- 正式鉴权边界
- 任务发布与任务确认正式写链
- 聊天正式写链
- 协作 / 验收正式写模型
- 中心页所需读模型
- root mock 与 spring-app 双跑切换

## 不在本轮

- 正式上传链
- SSE / WebSocket 正式事件链
- 腾讯 IM 回调 / 回写正式化
- 审批 / 请款 / 开票 / 对账 / 结算 / 争议对象主链
- 上线前全链回归

## 执行约定

- 默认使用 `superpowers`
- 默认尽量使用 `5` 个 agent
- 每阶段完成后，必须先更新阶段计划、主线总计划、根 `docs/` 和四个子项目 `docs` 副本
- 每阶段最后一步固定写成“继续下一阶段”，不在阶段完成点停住
- 主线收口后立即切入下一条主线

## 当前活跃阶段

- 阶段一：`鉴权边界正式化` 已完成
- 阶段二：`任务确认与发布合同补齐` 已完成
- 阶段三：`聊天正式写链` 已完成
- 阶段四：`协作与验收写模型正式化` 已完成
- 阶段五：`中心页读模型补齐` 已完成
- 阶段六：`双跑切换` 已完成

## 阶段拆分

### 阶段一：鉴权边界正式化

目标：

- 任务、聊天、协作、验收、记录详情相关接口统一从 token 解当前 actor
- 不再信任 body / query 里的当前操作者身份
- 为后续正式任务写链迁移先锁定 actor 边界

状态：`已完成`

阶段结果：

- `spring-app` 的任务发布、AI 分析确认、选人、协商确认、闭环摘要都已改为从 `Authorization` 解析当前企业 actor
- 任务进度、验收、评分写链当前也已取消对 `submitterUserId / accepterUserId / reviewerUserId` 的前端信任
- PC / H5 前台服务层已同步移除这些当前操作者字段的出参依赖，改为后端注入

验证：

- `backend/spring-app`：`mvn -q -Dtest=TaskLifecycleMobileFlowTest test`
- `backend/spring-app`：`mvn -q test`
- `frontend`：`npm run build`
- `frontend_mobile_h5`：`npm run build`

最后一步：

- 继续进入阶段二：任务确认与发布合同补齐

### 阶段二：任务确认与发布合同补齐

目标：

- 补齐 `publish-presets / ai/decompose / negotiations/task-confirmation` 的正式主链合同
- 让聊天里的 `taskConfirmation` 读取真实持久化版本，而不是临时拼装
- 为后续聊天正式写链和中心页读模型提供稳定对象

状态：`已完成`

阶段结果：

- `spring-app` 已补齐 `GET /api/ai/publish-presets` 与 `POST /api/ai/decompose` 的前台主链合同，返回里已稳定提供 `originalBrief / provider / model / modules / schedule / tags / recommendations / matchingPreview`
- `POST /api/tasks/{taskId}/negotiations/task-confirmation` 已进入正式写链，当前支持版本流、修改记录、撤回、预算 / 工期 / 协作安排联动，以及 `changeReview` 持久化
- 聊天房间与记录详情读取的 `taskConfirmation` 当前已优先来自任务持久化 JSON，不再只依赖临时拼装 fallback；旧任务在缺少持久化快照时仍保留 legacy fallback

验证：

- `backend/spring-app`：`mvn -q -Dtest=TaskLifecycleMobileFlowTest test`
- `backend/spring-app`：`mvn -q test`
- `frontend`：`npm run build`
- `frontend_mobile_h5`：`npm run build`

最后一步：

- 继续进入阶段三：聊天正式写链

### 阶段三：聊天正式写链

状态：`已完成`

阶段结果：

- `spring-app` 已正式接管会话列表、房间详情、房间定位 / 创建与消息发送主链
- 前台聊天主路径当前默认以 `spring-app` 持久化数据为准，root mock 聊天降级为联调 fallback
- actor 校验、房间生命周期、消息发送与无房间正式壳层当前已经统一收口

验证：

- `backend/spring-app`：`mvn -q -Dtest=MessageRoomApiControllerTest,MessageRoomMobileFlowTest test`
- `backend/spring-app`：`mvn -q test`

最后一步：

- 继续进入阶段四：协作与验收写模型正式化

### 阶段四：协作与验收写模型正式化

状态：`已完成`

阶段结果：

- `workspace-feedback` 已进入正式写模型，协作节点反馈当前有独立持久化表承接
- `early-completion / cancellation / acceptance` 已进入生命周期事件写模型，形成统一审计留痕
- `workspace / closure / orders` 当前优先读取正式写链投影，前台合同继续保持兼容
- `chat.taskDetail.status`、记录详情与闭环摘要当前已继续复用正式投影，而不只依赖 task JSON 临时拼装

验证：

- `backend/spring-app`：`mvn -q -Dtest=TaskLifecycleMobileFlowTest test`
- `backend/spring-app`：`mvn -q test`

最后一步：

- 继续进入阶段五：中心页读模型补齐

### 阶段五：中心页读模型补齐

状态：`已完成`

阶段结果：

- `GET /api/business` 与 `GET /api/talent` 当前都已补齐正式中心页读模型字段：`attentionHeadline / attentionItems / notificationItems / notificationGroups`
- 中心页通知项当前会直接返回对象锚点，至少包含 `taskId / recordId / room`
- 企业端审批中心、人才端通知中心以及 PC 工作台顶部待办当前都可以直接消费 `spring-app` 正式读模型，而不是继续只靠旧的 `attentionItems`

验证：

- `backend/spring-app`：`mvn -q -Dtest=PublicCenterReadModelFlowTest test`
- `backend/spring-app`：`mvn -q test`

最后一步：

- 继续进入阶段六：双跑切换

### 阶段六：双跑切换

状态：`已完成`

阶段结果：

- 本地双跑端口已明确：root mock backend 继续占 `8080`，`spring-app` 本地默认端口切到 `8081`
- PC / H5 前端当前都已补统一 API 目标切换层，支持 env、query 与本地缓存切换 `mock|spring`
- 在 `VITE_API_BASE` 未显式覆盖时，PC / H5 当前默认 API 目标已切到 `spring-app`
- root mock 仍保留为双跑 fallback，可通过 env、query 与本地缓存显式切回
- 关键验证已完成：
  - `frontend/src/services/apiBase.test.js`
  - `frontend_mobile_h5/src/services/apiBase.test.js`
  - `frontend` `npm run build`
  - `frontend_mobile_h5` `npm run build`
  - `backend/spring-app` `mvn -q -Dtest=UploadApiControllerTest,TaskFileIntegrationFlowTest,MessageRoomMobileFlowTest,MessageRoomApiControllerTest test`

最后一步：

- 回写主线结果并切入下一条主线：文件上传 / 实时事件 / IM 回写正式化
