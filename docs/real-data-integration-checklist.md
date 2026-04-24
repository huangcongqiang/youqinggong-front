# React 主前端真实数据接入清单

目标：先不部署，先把 `react-demo` 从 Figma 静态原型推进到真实业务前端。每个页面只有接入真实接口、能使用真实 `taskId / recordId / roomKey` 跑通后，才进入部署验收。

配套文档：

- `react-demo2-ui-sync-guide.md`：说明如何把 `react-demo 2` 的原始 UI 和交互安全同步回 `react-demo`，同时保留主工程的真实数据逻辑。

## 第一阶段：基础数据层

| 模块 | 状态 | 说明 |
| --- | --- | --- |
| API Base | 已完成 | 支持本地 `:8081/api`、线上同源 `/api`、`VITE_API_BASE` / `VITE_SPRING_API_BASE` 覆盖。 |
| Token 存储 | 已完成 | 复用 Vue 生产工程的 `youqinggong.auth.*` localStorage key，方便同域会话迁移。 |
| 请求 envelope | 已完成 | 支持后端 `{ code: 0, data }` 包装和普通 HTTP JSON。 |
| 登录 | 已完成基础接入 | `POST /auth/login` 已接入，登录页新增企业/人才账号选择。 |
| 注册 | 已完成基础接入 | `POST /auth/register` 已接入，注册表单补充真实密码字段。 |
| 恢复会话 | 已完成基础接入 | `GET /auth/me` 已接入，`AuthLayout` 等待会话恢复后再跳转。 |
| 登出 | 已完成基础接入 | `POST /auth/logout` + 清理本地登录态。 |

## 第二阶段：页面数据替换

| 页面/流程 | 当前状态 | 下一步 |
| --- | --- | --- |
| 企业工作台 `/enterprise` | 已完成基础接入 | 指标、提醒、任务卡片、财务摘要已优先读取 `/business` 返回；下一步补更细的审批/验收入口数据。 |
| 人才工作台 `/talent` | 已完成基础接入 | 钱包、进行中协作、推荐任务已优先读取 `/talent` 返回；下一步补收入明细和日历。 |
| 任务广场 `/talent/tasks` | 已完成基础接入 | 已接 `/tasks/marketplace`，支持真实任务状态、搜索、标签筛选、详情弹窗和申请动作。 |
| 发布任务 `/enterprise/publish` | 待接入 | 页面仍是模拟 AI 拆解，需要接 `/ai/publish-presets`、`/tasks/publish`、任务分析确认。 |
| 人才搜索 `/enterprise/talents` | 待接入 | 需要接 `/talents/marketplace`、人才详情、收藏人才列表。 |
| 招聘处理 `/enterprise/recruiting` | 已完成基础接入 | 已接 `/enterprise/recruiting?taskId=`，支持真实申请列表、搜索、状态筛选、邀约面试、拒绝和确认合作。 |
| 工作区 `/enterprise/workspace`、`/talent/workspace` | 已完成基础接入 | 已按 `taskId` 请求 `/workspace?taskId=`，展示真实合同摘要、里程碑、交付物、记录/消息/验收入口。 |
| 消息 `/enterprise/chat`、`/talent/chat` | 已完成基础接入 | 已接 `/messages/task-rooms`、`/messages/task-room/{roomKey}` 和发送消息接口；附件上传入口待迁移。 |
| 验收 `/enterprise/acceptance`、`/talent/acceptance` | 已完成基础接入 | 已基于 `taskId` 读取 `/workspace`、`/tasks/{taskId}/closure`、`/{audience}/orders/{taskId}`；企业端可提交验收与评级，人才端可查看验收/评级并评价企业。 |
| 记录 `/enterprise/records`、`/talent/records` | 已完成基础接入 | 已接 `/{audience}/orders` 和 `/{audience}/orders/{taskId}`，支持筛选、进入工作区/消息/记录详情/结算。 |
| 结算 `/settlement`、`/records/:recordId/settlement` | 已完成基础接入 | 已接订单列表和订单详情中的请款、发票、对账、结算、争议摘要；财务动作按钮仍需继续接写接口。 |
| 附件 | 已完成基础展示 | 工作区、验收、记录详情已读取真实附件 URL 并提供查看/下载；上传、图片弹窗预览、非图片弹窗下载策略还需迁移。 |
| 腾讯 IM | 待接入 | 需要迁移 IM runtime config 和消息同步，不应只显示 REST mock。 |

## 当前明确没通的流程

| 流程 | 断点 |
| --- | --- |
| 验证码登录/注册 | 后端文档当前只定义密码登录注册，React 页面已经标注验证码通道待接入。 |
| 任务申请后企业侧处理 | 已完成基础接入；仍需用真实企业/人才账号跑一遍“申请 -> 邀约 -> 人才确认 -> 企业确认合作”。 |
| 进入工作区后切任务上下文 | 工作区、消息、验收、记录详情、结算已解析 `taskId / roomKey`；还需要真实账号逐条回归。 |
| 人才提交进展后企业端查看 | 工作区、验收、记录详情已读取 `/workspace` 和订单详情中的进展/文件；提交进展表单与上传流程仍待迁移。 |
| 验收完成后的记录/结算联动 | React 页面已读取 `/{audience}/orders`、`/{audience}/orders/{taskId}` 和 closure；仍需继续接请款/开票/对账/结算写接口。 |
| 附件查看/下载 | 已支持真实 URL 跳转/下载；还未做统一弹窗预览。 |

## 推荐验收顺序

1. 登录与恢复会话：企业账号、人才账号都能登录，刷新后不丢身份。
2. 任务与申请闭环：企业发布任务，人才任务广场看到，提交申请，企业招聘处理看到。
3. 合作工作区闭环：企业确认合作后，两端同一个 `taskId/roomKey` 能进入同一个工作区和消息房间。
4. 交付与验收闭环：人才提交进展和附件，企业验收，人才看到状态更新。
5. 记录与结算闭环：验收和评分后，记录详情、请款、开票、对账、结算状态一致。
