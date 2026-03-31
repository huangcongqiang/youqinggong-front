# 主线 7 阶段三：请款最小闭环

## 目标

- 让任务闭环后生成第一批正式 `Claim` 对象
- 让企业端、人才端、后台对同一条请款状态形成一致读模型
- 让请款对象先完成最小可审计闭环，再扩展开票 / 对账 / 结算

## 范围

- `Claim` 对象
- 任务闭环后的请款创建
- 请款状态读模型
- 与记录详情 / 审批中心 / 后台管理的最小关联

## 本阶段最小切片

- 正式持久化 `Claim`
- 任务闭环后生成 claim snapshot
- 提供最小 claim list/detail/action 合同
- 让审批中心和记录详情能够看到 claim 摘要

## 当前状态

- 状态：`已完成`
- 当前结果：
  - `spring-app` 已新增正式 `Claim` 对象、Repository、创建接口与企业审批动作接口
  - 已实现 `POST /api/tasks/{taskId}/claims`
  - 已实现 `POST /api/enterprise/claims/{claimId}/actions`
  - 任务闭环后的请款资格当前按正式任务生命周期判断，不再依赖前端展示态
  - 记录详情当前已补 `claimSummary` 与 `sections.claimSummary`
  - 任务生命周期时间线当前已补 `CLAIM` 事件留痕

## 验证

- `cd backend/spring-app && mvn -q -Dtest=ClaimApiControllerFlowTest,OrderApiControllerTest test`
- `cd backend/spring-app && mvn -q test`

## 风险与缺口

- 当前只完成请款最小闭环，还没有正式开票申请、对账单与结算对象
- `Claim` 当前仍以最小状态集合运行，`UNDER_REVIEW / CANCELLED` 等状态尚未在正式动作链完全承接
- 前台当前主要通过记录详情和后续中心页读模型消费 claim 摘要，专用财务对象页还未形成

## 最后一步

- 继续下一阶段：阶段四 `开票与对账`
