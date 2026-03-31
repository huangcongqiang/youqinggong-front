# 主线 6 阶段二：IM 回调 / 回写第一批

## 目标

先做最小闭环，不一口气把完整 IM 正式化全部塞进这一阶段。

本阶段第一批只承接：

- 根据 `providerRoomId` 反查本地任务房间
- 根据 `providerMessageId` 做消息 callback 幂等
- 把 callback 文本消息正式写回 `chat_messages`
- 为后续真实网关出站写入 `providerMessageId / providerRoomId` 留好合同

## 当前设计约束

- 不再要求 callback 请求直接传 `taskId`
- 优先按 `providerRoomId + providerMessageId` 定位
- `senderUserId` 优先从 IM account / sender account 解析真实平台用户
- 先只处理文本消息 callback

## 当前状态

- 状态：`已完成`

## 阶段结果

- 已完成基于 `providerRoomId` 的任务房间反查
- 已完成基于 `providerMessageId` 的文本 callback 幂等入库
- 已完成腾讯 IM 文本 callback 对 `chat_messages` 的第一批正式回写
- 已完成房间详情对 callback 消息的读回验证

## 当前边界

- 当前仍未包含 callback 验签
- 当前仍未包含附件 callback 回写
- 当前仍未包含异常重试与补偿
- 当前仍未把完整 IM 出站写链纳入本阶段

## 第一批验证目标

- 同一条 `providerMessageId` 重复 callback 不重复入库
- 房间反查失败时返回显式错误，不静默吞掉
- 新消息 callback 入库后，房间详情和房间列表都能读到

## 已完成验证

- `mvn -q -Dtest=TencentImCallbackControllerTest test`
- `mvn -q -Dtest=UploadApiControllerTest,TaskFileIntegrationFlowTest,MessageRoomMobileFlowTest,MessageRoomApiControllerTest,TencentImCallbackControllerTest test`
- `mvn -q test`

## 最后一步

- 继续进入阶段三：IM 写链正式化
