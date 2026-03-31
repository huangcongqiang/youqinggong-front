# 主线 8 阶段一：合同与数据回归

## 目标

- 以真实前台主路径为准，校验 PC / H5 / 后台管理 / `spring-app` 之间的对象合同与状态投影
- 先抓“能破坏主流程”的合同断链，再回补代码和文档

## 范围

- 工作台 / 通知中心 / 审批中心
- 聊天 / 协作空间 / 验收页 / 记录详情
- 审批 / 请款 / 开票 / 对账 / 结算 / 争议 / 风控对象

## 本阶段最小切片

- 先跑企业端审批、争议、记录详情、闭环详情的最小回归链
- 再补 H5 / PC 对同一对象合同的消费一致性检查
- 最后冻结“主路径合同已通过 / 仍阻塞上线”的清单

## 当前状态

- 状态：`已完成`
- 当前默认下一步：继续进入主线 8 阶段二“稳定性与可观测性”

## 本阶段结果

- `spring-app` 的争议 / 审批 / 记录详情 / 闭环详情主链回归已经补齐并通过最小后端回归测试。
- PC 前台聊天页当前已补齐 `approvalId / originApprovalId`，从审批中心进入聊天、再进入记录详情 / 协作空间 / 验收页时，不再丢审批对象锚点。
- H5 聊天详情页当前已接入 `objectPageContext`，返回动作会按 `workspace / record-detail / acceptance / records` 的真实来源回链，而不是一律退回会话列表。
- H5 验收 fallback 合同当前已补齐 `acceptance / claimSummary / invoiceSummary / reconciliationSummary / settlementSummary / disputeSummary` 与 `summary.disputeStatus / disputeOpenedAt`。
- PC / H5 的 `objectPageContext` approval 合同、记录详情 dispute summary view model 合同和两端前台构建当前都已通过。

## 计划回归序列

1. `ClaimApiControllerFlowTest#disputedReconciliationCreatesDisputeAndProjectsRiskSummary`
2. `PublicCenterReadModelFlowTest#enterpriseApprovalCenterShouldExposeDedicatedApprovalContracts`
3. `PublicCenterReadModelFlowTest#businessDashboardShouldExposeNotificationContractsForCurrentEnterprise`
4. `TaskLifecycleMobileFlowTest#acceptancePersistsFormalRecordAndProjectsIntoClosureAndOrderDetail`
5. `TaskLifecycleMobileFlowTest#progressAndWorkspaceFeedbackWriteBackIntoWorkspace`
6. `TaskLifecycleMobileFlowTest#earlyCompletionFlowFeedsWorkspaceAndClosure`
7. `OrderApiControllerTest#orderEndpointsReturn401403404Semantics`

## 本阶段验证

- `node frontend/src/utils/objectPageContext.test.js`
- `node frontend_mobile_h5/src/utils/objectPageContext.test.js`
- `node frontend/src/pages/recordDetailViewModel.test.js`
- `node frontend_mobile_h5/src/pages/recordDetailViewModel.test.js`
- `cd frontend && npm run build`
- `cd frontend_mobile_h5 && npm run build`

## 最后一步

- 继续进入主线 8 阶段二：稳定性与可观测性
