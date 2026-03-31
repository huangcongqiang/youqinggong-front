# 主线 7 阶段五：结算执行

## 目标

- 把请款、开票、对账结果真正落到正式 `Settlement` 对象与出账状态
- 让企业端、人才端、后台对同一条结算结果形成一致读模型
- 为后续争议处理、风控升级与完整财务审计提供稳定锚点

## 范围

- `Settlement` 对象
- `Reconciliation -> Settlement` 的最小执行动作
- 记录详情 / 闭环详情 / 中心页可消费的最小结算摘要
- 与任务生命周期时间线的最小关联

## 本阶段最小切片

- 正式持久化 `Settlement`
- 对账确认后生成 settlement snapshot
- 提供最小 settlement detail / action / summary 合同
- 让记录详情、闭环详情与后续中心页看到一致的 `settlementSummary`

## 当前状态

- 状态：`已完成`
- 当前结果：
  - `spring-app` 已新增正式 `Settlement` 对象与 `POST /api/enterprise/settlements/{settlementId}/actions`
  - 企业完成对账确认后会自动生成 `PENDING_EXECUTION` 的 settlement，并写入 `SETTLEMENT` 生命周期事件
  - 记录详情与闭环详情当前都已补 `settlementSummary`，并且继续沿同一条 `claim -> invoice -> reconciliation -> settlement` 财务链聚合
  - `Settlement` 最小执行动作当前已支持 `EXECUTE / FAIL`

## 最后一步

- 切到阶段六：争议与风控升级
