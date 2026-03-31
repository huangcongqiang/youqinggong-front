# 2026-03-28 PC 中心页对象动作合同共享化

## 目标

把通知中心 / 审批中心右侧当前对象动作带从“各页各自拼路由、各页各自去重”收成统一合同，避免后续继续分叉。

## 本阶段范围

- [x] 为中心页对象动作补共享 helper
- [x] 审批中心改为消费共享 helper
- [x] 通知中心改为消费共享 helper
- [x] 动作去重、聊天 / 协作 / 记录 / 验收推导规则统一
- [x] 根 `docs/` 同步“中心页对象动作合同共享化”口径

## 本阶段结果

- `frontend/src/utils/attentionNavigation.js` 当前已补 `buildCurrentObjectContextActions()` 与 `dedupeAttentionActions()`，统一中心页对象动作的锚点、目标路由与去重规则
- 审批中心右侧当前对象动作带已改成消费共享 helper，不再继续在页面内单独维护动作去重和 canonical route
- 通知中心右侧当前对象动作带已改成消费共享 helper，不再继续在页面内单独维护动作去重和 canonical route
- 通知中心 / 审批中心现在只保留各自的页面语义、分组语义和对象选择逻辑；对象动作路由推导已收口到共享导航层

## 设计方向

- 页面只负责提供：
  - 当前 `selectedItem`
  - `primaryAction`
  - 可选 `secondaryAction`
  - 当前 audience
- 共享 helper 负责：
  - 读取当前对象锚点 `group + itemId + taskId / room / recordId`
  - 推导对象动作带
  - 统一去重
  - 统一不同 audience 的 canonical route
- 页面不再各自复制一套 `routeFingerprint / dedupe / chat/workspace/record/acceptance` 推导逻辑

## 预期结果

- 通知中心 / 审批中心的动作带逻辑收口成一套
- 后续若继续补审批动作、已读状态或对象级更多动作，不需要再在两个页面里各改一遍
