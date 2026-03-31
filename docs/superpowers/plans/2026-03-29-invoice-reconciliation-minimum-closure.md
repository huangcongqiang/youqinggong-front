# 主线 7 阶段四：开票与对账

## 目标

- 在 `spring-app` 中补齐最小 `Invoice / Reconciliation` 正式对象
- 让企业端、人才端、后台先看到同一份开票 / 对账状态摘要
- 为后续结算执行与争议处理提供稳定财务锚点

## 范围

- `Invoice` 对象
- `Reconciliation` 对象
- 与 `Claim / Task` 的最小关联
- 记录详情 / 审批中心 / 后台管理的最小读模型

## 本阶段最小切片

- 正式持久化 `Invoice`
- 正式持久化 `Reconciliation`
- 提供最小 create / action / summary 合同
- 让记录详情与审批 / 财务读模型能看到开票 / 对账摘要

## 当前状态

- 状态：`已完成`
- 当前结果：
  - `spring-app` 已新增正式 `Invoice / Reconciliation` 对象、Repository、创建接口与企业对账动作接口
  - 已实现 `POST /api/claims/{claimId}/invoice`
  - 已实现 `POST /api/enterprise/reconciliations/{reconciliationId}/actions`
  - 记录详情当前已补 `invoiceSummary / reconciliationSummary` 与对应 `sections.*` 摘要
  - 记录详情财务摘要当前已按同一条 `claim -> invoice -> reconciliation` 链聚合，不再把不同代际对象混投到同一条记录上
  - 已补“提交开票后、待企业对账”的中间态投影断言，保证中间态与最终态都可被订单详情回读

## 验证

- `cd backend/spring-app && mvn -q -Dtest=ClaimApiControllerFlowTest,OrderApiControllerTest test`

## 风险与缺口

- 当前只完成开票 / 对账最小闭环，还没有正式 `Settlement` 出账对象
- `DISPUTED` 分支当前仍未形成可重提或关闭的完整动作链，这会在下一阶段与争议主链一起继续收口
- 当前仍以记录详情和后续中心页读模型消费 `invoiceSummary / reconciliationSummary`，专用财务对象页尚未形成

## 最后一步

- 继续下一阶段：阶段五 `结算执行`
