# 主线 7 阶段二：审批中心正式化

## 目标

- 让企业端审批中心从“泛事项承接页”进入真正的 `approval list / detail / action` 主链
- 让前端审批中心优先消费 `Approval` 对象，而不是继续复用 `notificationItems`
- 让第一批高频审批对象形成稳定的读写闭环

## 范围

- 企业端审批中心
- `Approval` 第一批读模型
- `Approval` 第一批动作接口
- 审批中心到聊天 / 协作 / 记录 / 验收的对象级回链

## 本阶段最小切片

- `spring-app` 新增 `GET /api/enterprise/approvals`
- `spring-app` 新增 `POST /api/enterprise/approvals/{approvalId}/actions`
- PC 审批中心切到 `approvalHeadline / approvalItems / approvalGroups`
- 第一批审批动作只开放：
  - `confirmations -> APPROVE`
  - `cancellations -> APPROVE / REJECT`

## 当前起点

- 审批中心已有独立入口与三栏骨架
- `Approval` 对象和状态集合已在阶段一冻结
- 前端审批中心仍主要消费 `notificationItems / notificationGroups`

## 阶段结果

- `spring-app` 已补第一批正式审批读模型：
  - `approvalHeadline`
  - `approvalItems`
  - `approvalGroups`
- `spring-app` 已补第一批审批动作写接口：
  - `POST /api/enterprise/approvals/{approvalId}/actions`
- PC 审批中心当前已正式消费 `approvalItems / approvalGroups`
- PC 审批中心当前已把 `approvalId` 纳入对象锚点合同
- 审批中心右侧当前先区分：
  - `审批动作`
  - `对象动作`
- 第一批审批中心只承接：
  - `confirmations`
  - `changes`
  - `reviews`
  - `cancellations`
- `matching / followup` 不再混入审批中心

## 本阶段不做

- 不把 `Claim / Invoice / Reconciliation / Settlement / Dispute` 混入审批中心
- 不在审批中心直接处理 `changes / reviews` 的完整业务写链
- 不把财务对象页提前塞进当前审批中心

## 验证

- `backend/spring-app`：
  - `mvn -q -Dtest=PublicCenterReadModelFlowTest,TaskLifecycleMobileFlowTest test`
- `frontend`：
  - `node frontend/src/services/approvalCenterPayload.test.js`
  - `npm run build`

## 文档同步

- 已更新：
  - `docs/superpowers/plans/2026-03-29-finance-dispute-mainline.md`
  - `docs/superpowers/plans/2026-03-29-project-mainline-execution-plan.md`
  - `docs/development/2026-03-21-ai-talent-market-development.md`
  - `docs/development/2026-03-25-version-status-overview.md`
  - `docs/development/2026-03-25-test-acceptance-checklist.md`
  - `docs/technical/2026-03-21-ai-talent-market-technical.md`
  - `docs/technical/2026-03-21-api-contract.md`
  - `docs/design/2026-03-28-h5-pc-ui-spec.md`

## 风险与边界

- 当前审批中心仍是第一批正式化，不等于完整审批 / 财务主链已经上线
- `changes / reviews` 目前仍以对象页处理为主，不代表后端审批写模型已经完整
- 财务对象与争议对象仍需在后续阶段单独推进

## 最后一步

- 继续进入阶段三：请款最小闭环
