# 2026-03-28 通知中心数据口径深化

## 目标

把 PC Web 通知中心从“前端根据 attention、任务、记录推导的工作页”，升级成“后端直接提供细粒度通知项与分组”的结构化页面，减少前端猜测逻辑，并为后续审批中心与财务流做数据基础。

## 本阶段范围

- [x] root mock backend 为企业端工作台补 `notificationItems` / `notificationGroups`
- [x] root mock backend 为人才端工作台补 `notificationItems` / `notificationGroups`
- [x] `frontend` 通知中心页优先消费新的通知字段
- [x] `frontend` fallback 契约补齐通知中心所需字段
- [x] 根 `docs/` 与四个子项目副本文档同步本阶段结果
- [x] 运行 `frontend`、`frontend_mobile_h5`、`backend` 验证

## 设计方向

- 后端优先直接返回“单条通知项”，而不是只给聚合桶
- 通知项至少包含：分组键、标题、摘要、时间、入口、上下文、优先级
- 企业端优先承接：确认 / 修改、发布 / 选人、取消 / 异常、验收 / 评级、系统提醒
- 人才端优先承接：任务确认 / 变更、执行协作更新、交付收尾、取消 / 异常
- 前端优先消费真实 `notificationItems`，只有在缺失时才回退到推导逻辑

## 后续阶段

- 审批、请款、开票、对账、结算链路
- 争议处理与风控升级
- 正式通知已读 / 未读与优先级体系

## 本阶段结果

- 企业端与人才端工作台都已补细粒度 `notificationItems / notificationGroups`
- PC Web 通知中心已优先消费后端通知契约，只有缺失字段时才回退到旧的 `attentionItems`
- 根 `docs/` 与四个子项目副本文档已同步
- 已完成 `frontend`、`frontend_mobile_h5`、`backend` 的构建验证
