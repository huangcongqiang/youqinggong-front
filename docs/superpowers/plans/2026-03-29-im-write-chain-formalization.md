# 主线 6 阶段三：IM 写链正式化

## 目标

让 `spring-app` 成为 `task -> room -> provider group -> currentUser/counterpartUser` 的唯一事实源；前端继续保留腾讯 IM SDK 收发，但不再把建群/加群当成系统真相。

## 本阶段最小切片

- 统一后端房间生命周期：任务房间创建、复用、provider room id 回填
- 统一后端用户映射：`imUserId / userSig / groupId / currentUser / counterpartUser`
- `GET /api/im/tencent/config` 变成鉴权后、房间感知的正式配置接口
- 前端继续保留 SDK 收发，但房间与成员关系以后端返回为准

## 当前状态

- 状态：`已完成`

## 阶段结果

- 已完成阶段三第一批 TDD：
  - `MessageRoomApiControllerTest` 新增了 `im/tencent/config` 的鉴权与房间真相断言
  - `MessageRoomApiControllerTest` 新增了“发起房间后，IM 配置接口与房间真相保持一致”的断言
- 已完成最小实现：
  - `GET /api/im/tencent/config` 当前要求带 `Authorization`
  - `spring-app` 当前已按 token actor + `roomKey` 解析 `currentUser / counterpartUser / taskRoom / groupId / taskId`
  - 当前房间与成员关系已优先以后端任务房间映射为准
- 当前阶段结论：
  - `spring-app` 当前已把 `task -> room -> provider group -> currentUser / counterpartUser` 收口为后端事实源
  - 前端继续保留腾讯 IM SDK 收发，但不再把建群、加群和成员关系当成系统真相

## 验证

- `mvn -q -Dtest=MessageRoomApiControllerTest test`
- `mvn -q -Dtest=MessageRoomApiControllerTest,TencentImCallbackControllerTest,MessageRoomMobileFlowTest test`
- `mvn -q test`

## 当前边界

- 本阶段不混入 callback 验签、附件 callback、异常重试
- 本阶段不先重做完整 SSE / WebSocket 实时链
- 本阶段不先把前端 SDK 发消息改成后端代理发送
- 当前仍未解决 `providerMessageId` 数据库级唯一约束、完整 sender 映射和 callback 严格验签

## 下一步

- 已切入主线 6 阶段四：业务实时事件正式化
- 下一阶段优先为聊天业务字段、协作空间、验收页、通知中心 / 审批中心补 SSE/等价后端事件流
- 聊天消息正文继续复用腾讯 IM 实时通道，不在下一阶段重做完整业务 WebSocket 网关

## 验证目标

- 房间初始化与 IM 配置接口返回同一份房间真相
- `groupId / providerRoomId / currentUser / counterpartUser` 可稳定回读
- 前端不再需要自己决定该建哪个群、加谁进群

## 最后一步

- 继续进入阶段四：业务实时事件正式化
