# 2026-03-28 PC 多跳来源上下文栈

## 目标

把 PC Web 的通知中心 / 审批中心来源链，从“单跳对象锚点”升级成“多跳来源栈”，让聊天、协作空间、记录详情、验收页之间可以层层返回，同时还能最终回到原中心页的原分组与原事项。

## 本阶段范围

- [x] 聊天页补齐 `originSource / originItemId / originGroup / originTaskId / originRecordId / originRoom`
- [x] 协作空间补齐 `originSource / originItemId / originGroup / originTaskId / originRecordId / originRoom`
- [x] 记录详情补齐 `originSource / originItemId / originGroup / originTaskId / originRecordId / originRoom`
- [x] 验收页纳入与聊天 / 协作空间 / 记录详情一致的来源栈规则
- [x] 通知中心 / 审批中心的摘要动作与跨中心动作继续保留当前对象锚点
- [x] 手动切换会话时主动清掉旧 `itemId / group / source / originSource / tab / nodeId`
- [x] 手动切换任务时主动清掉旧 `itemId / group / source / originSource / tab / room / recordId / nodeId`
- [x] 根 `docs/` 与四个子项目副本文档同步本阶段结果
- [x] 运行前端 / H5 / 后端验证

## 设计方向

- `source` 只表示“直接上一页”
- `originSource` 表示“最终通知中心或审批中心”
- 对象级锚点继续由 `itemId / group / taskId / room / recordId / nodeId / tab` 承接
- 返回优先级保持为：先回直接上一页，再由上一页按 `itemId -> recordId -> taskId -> group` 恢复原中心对象
- 用户一旦手动切换任务或会话，旧来源链必须立即失效，避免把上一条工作链污染到当前对象

## 本阶段结果

- `center -> chat/workspace/record/acceptance -> return` 已按多跳来源栈正式收口
- 验收页当前也会继承并继续透传 `source + originSource`
- 从通知中心 / 审批中心进入记录详情，再进入协作空间或验收页，返回会优先恢复上一层详情，再回原中心分组与原事项
- 通知中心 / 审批中心页头摘要动作、次动作和跨中心动作，不再丢当前对象锚点

## 后续阶段

- PC 工作台共享待办入口继续收敛到“首页只进中心页，中心页再进对象页”
- 审批、请款、开票、对账、结算正式链路
- 更完整的桌面级批量动作和任务树
