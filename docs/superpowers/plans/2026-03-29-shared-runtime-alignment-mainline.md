# PC / H5 共享数据层与运行时收口主线

## 主线目标

把 `frontend` 和 `frontend_mobile_h5` 里已经高度相似的运行时纯逻辑、对象页合同和请求层边界收口成同一套结构，减少两端继续分叉。

## 范围

本主线优先处理：

- 认证会话与请求基础层
- 聊天运行时纯 helper
- 协作 payload 与节点模型
- 记录详情 / 对象页数据适配
- 对象页上下文与返回链纯函数合同

## 不在本轮

- `spring-app` 正式主链接管
- 真正的上传 / SSE / WebSocket / IM 回调正式化
- 审批 / 请款 / 开票 / 对账 / 结算 / 争议业务主链
- H5 / PC 页面视觉重做

## 执行约定

- 默认使用 `superpowers`
- 默认尽量使用 `5` 个 agent
- 每阶段完成后，必须先同步根 `docs/` 和四个副本，再进入下一阶段
- 每阶段的最后一步固定写成“继续下一阶段”，不在阶段完成点停住
- 任一时刻只能有一个“进行中”的活跃阶段；阶段收口后立刻切换到下一阶段

## 当前活跃阶段

- 本主线已完成
- 阶段一、阶段二、阶段三、阶段四、阶段五均已完成并完成对应验证

## 阶段拆分

### 阶段一：认证会话与请求基础层对齐

目标：

- 收口 `AUTH_*` 存储、过期判断、持久化、清理的重复逻辑
- 收口 `readJson / writeJson` 这类请求基础层的合同差异
- 明确 PC / H5 在 fallback 与 `requestError` 上的边界

状态：`已完成`

阶段结果：

- PC / H5 已统一 `AUTH_*` 存储、过期判断、持久化与清理逻辑
- PC / H5 的请求基础层已经形成 `authSession + httpClient + api facade` 的同构结构
- 保留了 `services/api` 兼容导出，避免 router/store 在阶段切换中断裂

验证：

- `frontend`：`npm run build`
- `frontend_mobile_h5`：`npm run build`

最后一步：

- 继续进入阶段二：聊天运行时纯 helper 对齐

### 阶段二：聊天运行时纯 helper 对齐

目标：

- 让 PC 端也拥有与 H5 对齐的 `messageDetailHelpers / messageRoomSelection / messageRoomRuntimeHelpers / messageLiveRefresh`
- 收口聊天页内联的纯函数，减少 `MessagesPage.vue` 体积和分叉风险
- 优先统一房间选择、附件类型、消息合并、刷新判断这些纯逻辑

状态：`已完成`

阶段结果：

- PC 端已补齐 `messageDetailHelpers / messageRoomSelection / messageRoomRuntimeHelpers / messageLiveRefresh`
- `MessagesPage.vue` 当前已改为消费纯 helper，页面保留路由、IM、房间切换和交互状态
- 房间选择、消息细节、附件元信息、消息合并和实时刷新门槛已与 H5 保持同构结构

验证：

- `frontend`：`npm run build`

已知技术债：

- PC 聊天页 chunk 体积仍然偏大，后续还需要继续拆运行时与 view model

最后一步：

- 继续进入阶段三：协作 payload 与节点模型对齐

### 阶段三：协作 payload 与节点模型对齐

目标：

- 让 PC 端也采用独立的 `workspacePayload` 归一层
- 统一 `taskOptions / collaborationNodes / progressFeed / aiReviewHistory / acceptance` 的数据清洗逻辑
- 为后续抽 `workspace summary / node detail model` 做准备

状态：`已完成`

阶段结果：

- PC 端已补齐独立的 `workspacePayload` 归一层，并与 H5 保持同构的 `requestError / requestStatus / summary.taskId` 合同
- PC 端已取消 `requestedTaskId` 与返回任务不一致时的企业集合例外，`taskOptions / collaborationNodes / executionChecklist / progressFeed / aiReviewHistory / supportOptions / acceptance` 当前统一在服务层完成稳定数组清洗
- PC 协作页已补 query 失败展示，并对 `submitProgressForm / submitNodeFeedback / submitTaskFlowAction` 三条 mutation 统一消费失败态，不再把失败当成功关闭当前动作

验证：

- `frontend`：`node src/services/workspacePayload.test.js`
- `frontend`：`npm run build`
- `frontend_mobile_h5`：`npm run build`

最后一步：

- 继续进入阶段四：记录详情与对象页 view model 对齐

### 阶段四：记录详情与对象页 view model 对齐

目标：

- 统一记录详情对象的关键字段映射
- 明确 `recordId / taskId / roomKey` 的对象锚点合同
- 把记录详情页的关键 view model 从页面内计算中抽出来

状态：`已完成`

阶段结果：

- PC / H5 记录详情当前都已抽出独立 `recordDetailViewModel`，页面主文件不再内联派生金额、日期、评级、最新留痕、确认历史、标签和附件摘要。
- PC / H5 当前都已引入统一的 `recordFormatters` 合同，`formatMoney / formatDateLabel / formatDateRangeLabel / formatGrade` 口径一致；`recordData.js` 继续只做兼容导出与 fallback 数据承接。
- 记录详情对象当前统一暴露 `anchor.recordId / anchor.taskId / anchor.roomKey`，为下一阶段的对象页上下文合同与回链纯函数抽取提供稳定最小锚点。
- 当前采用的是“镜像 helper + 同合同”方式，而不是跨项目物理共享模块；这一步优先锁定对象合同和页面边界，不在本阶段引入 Vite 跨根目录共享风险。

验证：

- `frontend`：`node src/pages/recordDetailViewModel.test.js`
- `frontend_mobile_h5`：`node src/pages/recordDetailViewModel.test.js`
- `frontend`：`npm run build`
- `frontend_mobile_h5`：`npm run build`
- `frontend`：`git diff --check`
- `frontend_mobile_h5`：`git diff --check`

最后一步：

- 继续进入阶段五：对象页上下文合同与回链纯函数对齐

### 阶段五：对象页上下文合同与回链纯函数对齐

目标：

- 收口 `taskId / recordId / room / nodeId / tab / source / originSource` 这套对象页上下文模型
- 把 `buildCenterReturnQuery / serializeContext / labelForSource` 这类纯函数从页面里抽出来
- 明确 H5 只接其中子集，PC 使用完整合同

状态：`已完成`

阶段结果：

- PC / H5 当前都已新增镜像的 `objectPageContext` helper，统一收口 `normalize / read / origin / child query / center return / source label` 纯函数职责。
- PC 端记录详情、协作空间、验收页已切到同一套对象页上下文合同；H5 端记录详情、协作空间、验收页也已完成同语义子集合同接入。
- 本轮继续采用“镜像 helper + 同合同”的方式，而不是跨项目物理共享模块，避免当前 Vite 双应用直接跨根目录共享带来的构建风险。

验证：

- `frontend`：`node src/utils/objectPageContext.test.js`
- `frontend_mobile_h5`：`node src/utils/objectPageContext.test.js`
- `frontend`：`npm run build`
- `frontend_mobile_h5`：`npm run build`
- `frontend`：`git diff --check`
- `frontend_mobile_h5`：`git diff --check`

最后一步：

- 回写主线结果、同步文档，并继续切入下一条主线：`spring-app + MySQL 正式主链接管`

## 当前下一步

继续切入下一条主线：`spring-app + MySQL 正式主链接管`。
