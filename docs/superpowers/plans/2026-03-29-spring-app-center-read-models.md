# `spring-app` 阶段五：中心页读模型补齐

## 目标

- 让通知中心 / 审批中心 / PC 工作台顶部待办优先读取 `spring-app` 的正式读模型
- 补齐 `notificationItems / notificationGroups / 对象锚点 / 任务确认历史摘要` 的正式合同
- 保持 PC / H5 前台当前中心页与对象页回链合同兼容

## 范围

- 企业端工作台 / 审批中心所需中心页读模型
- 人才端工作台 / 通知中心所需中心页读模型
- 对象页锚点字段与返回链所需的最小上下文
- 任务确认历史摘要在中心页层的最小复用

## 当前阶段状态

- 状态：`已完成`
- 当前默认下一步：继续进入阶段六：双跑切换

## 阶段结果

- `spring-app` 的 `GET /api/business` 与 `GET /api/talent` 当前都已直接返回 `attentionHeadline / attentionItems / notificationItems / notificationGroups`
- 企业端与人才端中心页当前都能读取正式通知项，而不再只依赖旧的 `attentionItems` 推导
- 中心页通知项已补齐对象锚点字段，当前至少稳定提供 `taskId / recordId / room`
- 人才端仍保留 `attentionItems` 兼容层，保证 H5 与旧工作台入口不会因为新读模型缺失而直接退化

## 验证

- `cd backend/spring-app && mvn -q -Dtest=PublicCenterReadModelFlowTest test`
- `cd backend/spring-app && mvn -q test`

## 最后一步

- 继续进入阶段六：双跑切换
