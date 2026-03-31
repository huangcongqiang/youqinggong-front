# 主线 7 阶段一：审批 / 财务状态冻结

## 目标

- 冻结 `Approval / Claim / Invoice / Reconciliation / Settlement / Dispute / RiskTicket` 的对象合同和状态集合
- 在进入正式写链前，先统一状态名、锚点字段和流转边界
- 避免后续 `spring-app`、PC 中心页、记录详情、聊天右侧上下文各自发明状态语义

## 范围

- 审批中心对象状态
- 请款单 / 发票单 / 对账单 / 结算单状态
- 争议单状态
- 对象与 `task / record / notificationItem / riskTicket` 的关联键
- 前台页面需要消费的最小状态字段

## 本阶段最小切片

- 先冻结状态枚举、状态流转矩阵和禁止流转清单
- 先统一对象级主键和来源链字段，不先做完整写链
- 先覆盖前台中心页、记录详情、聊天右侧上下文的状态消费口径

## 当前起点

- 当前审批中心、通知中心、记录详情、聊天右侧上下文已存在对象锚点和状态展示，但审批 / 财务 / 争议主链仍未形成统一正式状态源
- `spring-app` 已完成任务、聊天、协作、验收、实时事件的前置主链，具备继续补审批 / 财务状态模型的基础
- 当前最大的风险不是缺少页面入口，而是状态词和状态迁移还没有冻结

## 当前状态

- 状态：`已完成`
- 当前默认下一步：继续进入阶段二 `审批中心正式化`

## 阶段结果

- 根文档当前已冻结：
  - `Approval / Claim / Invoice / Reconciliation / Settlement / Dispute / RiskTicket` 的最小公共字段
  - 7 类对象的状态集合
  - 状态迁移边界与禁止约束
- 当前已明确：
  - `RiskTicket` 在后端已有实体雏形，可作为后台升级工单壳复用
  - `Approval` 业务主链对象仍需独立于 onboarding/admin review 语义
  - `Claim / Invoice / Reconciliation / Settlement / Dispute` 在 typed backend layer 基本未开始，需要从冻结态往后实现

## 本阶段不做

- 不直接实现请款、开票、对账、结算的完整后端写链
- 不直接实现争议处理完整流程
- 不先做票据上传、第三方支付或开票外部对接
- 不先做完整后台运营流，只冻结前后台共用状态合同

## 验证

- `Approval / Claim / Invoice / Reconciliation / Settlement / Dispute / RiskTicket` 没有重名异义状态
- 每类对象都明确了 `id + taskId/recordId + status + occurredAt/updatedAt` 的最小合同
- 中心页、记录详情、聊天右侧上下文对状态名称的消费口径已能对齐到根 `docs/`

## 文档同步

- 已更新：
  - `docs/superpowers/plans/2026-03-29-project-mainline-execution-plan.md`
  - `docs/development/2026-03-21-ai-talent-market-development.md`
  - `docs/development/2026-03-25-version-status-overview.md`
  - `docs/technical/2026-03-21-ai-talent-market-technical.md`
  - `docs/technical/2026-03-21-api-contract.md`

## 风险与边界

- 如果这一阶段不先冻结对象状态合同，后续 controller、service 与页面会继续各自发明状态词
- 如果审批域和财务域对象主键不统一，中心页对象级预选和返回链会继续漂移
- 本阶段只解决“状态真相”，不代表财务/争议主链已经正式上线

## 最后一步

- 继续进入阶段二：审批中心正式化
