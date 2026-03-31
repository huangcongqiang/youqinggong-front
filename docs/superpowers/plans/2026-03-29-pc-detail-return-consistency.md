# 2026-03-29 PC 记录详情 / 协作空间 / 验收页回链一致性

## 目标

把 PC Web 的记录详情、协作空间、验收页统一到同一套来源栈与回链合同，确保多跳之后仍能按 immediate source 与 originSource 正确返回，而不是掉回默认列表或丢失对象锚点。

## 本阶段范围

- [x] 记录详情补齐 `messages / workspace / acceptance / records` 来源识别
- [x] 协作空间补齐 `messages / records / record-detail / acceptance / dashboard-*` 来源识别
- [x] 验收页补齐 `messages / workspace / record-detail / records` 来源识别
- [x] 三页进入下一层时继续保留 `group + itemId + taskId / room / recordId / tab + source / originSource`
- [x] 三页的返回按钮文案与真实目标保持一致
- [x] 根 `docs/` 同步“详情页 / 协作空间 / 验收页回链一致性”口径

## 设计方向

- immediate source 表示“当前页直接从哪里来”
- originSource 表示“这条链最终应该回到哪里”
- 向下跳转时：
  - `source` 改成当前页
  - `originSource` 继承 `route.query.originSource || route.query.source`
- 向上返回时：
  - 先回 immediate source
  - 再由上一层按 `originSource` 回通知中心或审批中心
- 返回按钮文案不能继续统一写“返回列表 / 返回来源”，应尽量贴合真实目标

## 本阶段结果

- 记录详情当前会把 `messages / workspace / acceptance / records` 识别为可继承来源，并在继续进入聊天、协作空间、验收页时保留 `originSource`
- 协作空间当前也会把 `messages / records / record-detail / acceptance / dashboard-*` 当成直接来源，在多跳返回时优先回 immediate source
- 验收页当前和记录详情、协作空间使用同样的来源栈规则，返回聊天 / 协作空间 / 记录详情 / 中心页时不会再丢失最终来源
- 三页顶部返回按钮当前都已经按真实目标显示，例如“返回聊天”“返回协作空间”“返回记录详情”“返回审批中心”“返回通知中心”
