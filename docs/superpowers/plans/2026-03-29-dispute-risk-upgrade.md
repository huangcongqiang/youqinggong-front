# 主线 7 阶段六：争议与风控升级

## 目标

- 把对账异议从状态词升级为正式 `Dispute` 对象
- 让后台风控工单与业务争议对象形成稳定映射
- 让记录详情、审批/通知中心与后台看到一致的争议状态

## 范围

- `Dispute` 对象与最小状态机
- `Reconciliation -> Dispute` 自动建单
- `RiskTicket` 与 `Dispute` 的最小联动
- 记录详情 / 后台风控面板的最小争议摘要

## 本阶段最小切片

- `DISPUTE` 动作触发正式 `Dispute` 入库
- 同步创建或更新 `RiskTicket`
- 记录详情可回读 `disputeSummary`
- 后台可处理风险工单并回写争议状态

## 当前状态

- 状态：`已完成`
- 当前默认下一步：切到主线 8 阶段一“合同与数据回归”

## 阶段结果

- `spring-app` 已新增正式 `Dispute` 对象与仓储，`DISPUTE` 对账动作当前会生成或更新争议对象
- `DISPUTE` 动作当前会同步创建或更新 `RiskTicket`，并把 `targetType / targetId` 稳定指向争议对象
- 记录详情当前已补 `disputeSummary`，并继续沿同一条财务链聚合
- 闭环详情当前已补 `summary.disputeStatus / disputeOpenedAt / disputeSummary`，并在 `timeline` 中展示争议处理节点
- 后台合规页当前可回读 `targetType=DISPUTE`、`targetId=dispute-*` 的风险工单
- 后台更新 risk ticket 状态后，当前会同步回写争议对象状态、说明与 `resolvedAt`
- 定向争议链回归和 `backend/spring-app` 全量测试当前都已通过

## 最后一步

- 继续进入主线 8 阶段一：合同与数据回归
