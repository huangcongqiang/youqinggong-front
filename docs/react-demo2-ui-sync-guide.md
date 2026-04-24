# react-demo / react-demo 2 UI 同步指南

目标：把 `react-demo 2` 作为原始 UI 与交互基线，把 `react-demo` 作为真实数据主工程。后续所有界面更新，优先参考 `react-demo 2` 的视觉与交互，再把这些变化补到 `react-demo`，而不是反过来覆盖主工程的数据逻辑。

## 一句话原则

- `react-demo 2`：原始 UI、原始交互、页面气质、视觉层级的基线。
- `react-demo`：线上主工程，负责真实接口、真实状态、真实路由与真实业务动作。
- 迁移时的正确做法：复制 UI，保留数据。

## 什么时候应该看这份文档

- `react-demo 2` 新增了页面、按钮、卡片、动效、入口、通知样式。
- 需要把原始 Figma 风格重新补回主工程。
- 主工程某个页面被改“重了”，想恢复成原始 UI，但又不能丢掉真实数据。
- 下一次继续做 UI 对齐时，需要快速知道哪些文件能直接参考，哪些不能覆盖。

## 当前项目分工

### `react-demo`

这是当前主前端，负责：

- 登录、恢复会话、登出
- 真实接口请求
- 真实任务、申请、工作区、消息、验收、记录、结算数据
- 附件上传/查看/下载
- 上线路由与部署

### `react-demo 2`

这是原始 UI 参考工程，主要负责：

- 页面排版
- 按钮和卡片的视觉结构
- 侧边栏、头部、提示信息、通知中心等交互样式
- Demo 状态下更顺滑的产品叙事

## 核心同步规则

### 1. 永远不要直接用 `react-demo 2` 覆盖主工程的数据层

以下文件或职责，默认保留 `react-demo` 版本：

- `src/app/store.tsx`
- `src/app/services/api.ts`
- `src/app/services/*`
- `src/app/components/AsyncState.tsx`
- `src/app/components/AttachmentButton.tsx`
- `src/app/pages/RecordDetailsView.tsx`
- `src/app/pages/SettlementView.tsx`

原因：这些文件已经承担真实接口与真实业务状态，直接覆盖很容易把主工程退回 mock。

### 2. 可以优先参考 `react-demo 2` 的内容

以下内容可以把 `react-demo 2` 当作 UI 基线：

- 页面骨架结构
- 头部文案层级
- CTA 按钮位置和样式
- 卡片结构、标签结构、分区标题
- 通知、消息、工作台这类页面的视觉布局
- 入口跳转的产品叙事方式

### 3. UI 迁移时只替换“表现层”，不要替换“数据源”

正确做法：

1. 先打开同名页面，对比 `react-demo` 和 `react-demo 2`
2. 把 `react-demo 2` 的 JSX 结构、className、视觉分区搬到 `react-demo`
3. 保留 `react-demo` 里的真实 `useStore()`、`services/api`、`useEffect`、`searchParams`
4. 把 `react-demo 2` 里的静态数组改造成基于真实数据的渲染
5. 把 mock 文案保留为“空状态兜底”或“无数据时文案”，不要直接当真实数据展示

错误做法：

- 直接整页复制 `react-demo 2` 页面
- 把静态 `notifications`、`messages`、`tasks` 数组直接带进主工程
- 把 `login()` mock 流程覆盖掉真实登录逻辑

## 推荐同步顺序

### 第一批：壳层与核心入口

优先处理这些页面，因为它们决定整体观感与主路径：

- `src/app/Layout.tsx`
- `src/app/pages/Login.tsx`
- `src/app/pages/Home.tsx`
- `src/app/pages/TalentDashboard.tsx`
- `src/app/pages/TalentNotifications.tsx`
- `src/app/pages/ContractChat.tsx`

说明：

- 这一批决定“用户一进来看到什么、怎么进入消息、怎么感知邀约与协作”。
- 即使后面的业务页面还没完全对齐，只要第一批完成，整体感受就会明显回到原始 UI。

### 第二批：人才端主链

- `src/app/pages/TalentOnboarding.tsx`
- `src/app/pages/TaskSquare.tsx`
- `src/app/pages/TaskDetails.tsx`
- `src/app/pages/TaskApply.tsx`
- `src/app/pages/ContractWorkspace.tsx`
- `src/app/pages/TalentAcceptance.tsx`
- `src/app/pages/TalentRecordDetails.tsx`
- `src/app/pages/TalentSettlement.tsx`

说明：

- 这批对应“完善资料 -> 看任务 -> 申请 -> 沟通 -> 确认合作 -> 验收 -> 记录/结算”。

### 第三批：企业端主链

- `src/app/pages/EnterpriseDashboard.tsx`
- `src/app/pages/TaskPublish.tsx`
- `src/app/pages/TalentSearch.tsx`
- `src/app/pages/TalentDetails.tsx`
- `src/app/pages/EnterpriseRecruiting.tsx`
- `src/app/pages/EnterpriseContracts.tsx`
- `src/app/pages/AcceptanceCenter.tsx`
- `src/app/pages/EnterpriseRecordDetails.tsx`
- `src/app/pages/EnterpriseSettlement.tsx`
- `src/app/pages/EnterpriseBilling.tsx`
- `src/app/pages/EnterpriseNotifications.tsx`
- `src/app/pages/EnterpriseAssistant.tsx`

## 页面迁移模板

每次迁移一个页面，按这个模板执行：

### 步骤 1：先找页面职责

确认这个页面属于哪一种：

- 展示页：主要是卡片、列表、标签、文案
- 数据页：有真实请求、筛选、分页、提交动作
- 详情页：依赖 `taskId / recordId / roomKey`
- 表单页：依赖真实提交、上传、审批动作

### 步骤 2：只复制外壳

从 `react-demo 2` 复制这些：

- 顶层布局结构
- 标题、副标题、按钮编排
- 卡片和区块分布
- 视觉类 className

不要直接复制这些：

- mock 数组
- 假延时
- 假登录
- 静态测试金额、时间、状态

### 步骤 3：把 mock 数据替换为真实映射

常见改造方式：

- `const notifications = [...]`
  改成
  `const notifications = asArray(apiPayload.xxx).map(normalizeXxx)`

- `const messages = [...]`
  改成
  `const messages = roomDetail.messages.map(normalizeMessage)`

- `const tasks = [...]`
  改成
  `const tasks = dashboardData.tasks || store.tasks || []`

### 步骤 4：保留真实动作

页面上所有按钮最终都要对应真实动作：

- 登录：真实 `loginWithPassword`
- 发布：真实发布接口
- 邀约/继续沟通：真实生命周期动作
- 消息发送：真实消息接口
- 上传附件：真实 presign / 上传 / 绑定任务
- 验收、评级、请款、开票、对账、结算：真实写接口

### 步骤 5：给无数据状态留原始 UI 风格

如果真实接口暂时没有数据，不要让页面退回生硬的空白块。建议：

- 保留 `react-demo 2` 的文案语气
- 用主工程 `EmptyState / LoadingState / ErrorState`
- 空状态只做视觉兜底，不伪造真实业务记录

## 文件级别建议

### 可以大幅参考 `react-demo 2` 的文件

- `src/app/Layout.tsx`
- `src/app/pages/Login.tsx`
- `src/app/pages/TalentDashboard.tsx`
- `src/app/pages/TalentNotifications.tsx`
- `src/app/pages/ContractChat.tsx`
- `src/app/pages/EnterpriseDashboard.tsx`

### 需要“UI 参考 + 逻辑保留”的文件

- `src/app/pages/TaskPublish.tsx`
- `src/app/pages/TaskDetails.tsx`
- `src/app/pages/TaskApply.tsx`
- `src/app/pages/TalentSearch.tsx`
- `src/app/pages/TalentDetails.tsx`
- `src/app/pages/ContractWorkspace.tsx`
- `src/app/pages/AcceptanceCenter.tsx`
- `src/app/pages/TalentAcceptance.tsx`
- `src/app/pages/EnterpriseRecordDetails.tsx`
- `src/app/pages/TalentRecordDetails.tsx`
- `src/app/pages/EnterpriseSettlement.tsx`
- `src/app/pages/TalentSettlement.tsx`

### 主工程优先，不要被原型覆盖的内容

- 鉴权与恢复会话
- 所有 `services/api.ts` 请求
- 所有真实 `normalize` 逻辑
- 所有附件策略
- 所有 `taskId / recordId / roomKey` 参数处理
- 线上已修复的业务 bug 逻辑

## 以后新增 UI 更新时的推荐流程

当 `react-demo 2` 又有新更新时，按这个顺序处理：

1. 先确定更新影响哪些页面
2. 判断是“纯 UI 变化”还是“新增交互入口”
3. 如果只是纯 UI，直接同步外壳到 `react-demo`
4. 如果新增交互入口，先确认主工程是否已有真实路由与真实数据
5. 如果主工程没有，就先补真实数据和路由，再挂上新 UI
6. 每迁移完一页就执行一次构建

## 每次同步后的最低验收

至少检查以下几点：

- `npm run build` 通过
- 页面不再显示 `react-demo 2` 的 mock 数据
- 页面保留 `react-demo 2` 的原始视觉结构
- 按钮都能跳到真实路由
- `taskId / recordId / roomKey` 上下文没有丢
- 真实接口为空时有正常空状态，不白屏

## 当前建议的工作方式

后续继续补 UI 时，统一按下面的描述执行：

> 以 `react-demo 2` 为原始 UI 基线，把对应页面外观与交互补回 `react-demo`，保留 `react-demo` 当前的真实接口、真实状态、真实跳转和业务修复，不把 mock 数据带回主工程。

## 相关文档

- `react-demo/docs/real-data-integration-checklist.md`

建议配合这份清单一起看：

- `real-data-integration-checklist.md` 负责说明哪些流程已经接入真实数据
- 本文档负责说明以后怎么把 `react-demo 2` 的 UI 安全补回主工程
