# `spring-app` 阶段三：聊天正式写链

## 目标

- 让 `spring-app` 正式接管前台主聊天写链
- 统一 actor 校验、任务房间生命周期与消息持久化
- 让 root mock 聊天仅保留联调 fallback 角色

## 范围

- 聊天会话列表与会话详情正式读链
- 房间创建 / 选人后房间生命周期 / 房间定位
- 消息发送正式写链
- `task_im_rooms / chat_conversations / chat_messages` 的正式写入与读取
- 前台聊天主路径与 `spring-app` 合同对齐

## 当前阶段状态

- 状态：`已完成`
- 阶段结果：
  - `spring-app` 当前已正式承接聊天会话列表、会话详情、房间定位 / 创建与消息发送主链
  - `chat_conversations / chat_messages / task_im_rooms` 当前已成为前台主聊天写链默认事实源
  - 消息发送当前已禁止客户端伪造 `SYSTEM` 类型，冻结 / 受限账号也会在房间链路中被拦截
  - 已知任务但尚未持久化房间时，当前返回正式壳层而不是 mock / gateway 预览
- 验证：
  - `cd backend/spring-app && mvn -q -Dtest=MessageRoomApiControllerTest,MessageRoomMobileFlowTest test`
  - `cd backend/spring-app && mvn -q test`
- 已知边界：
  - 腾讯 IM 回调入库、附件正式文件链、摘要回写幂等与异常重试仍留在后续主线 6
  - 当前只是聊天正式写链完成，协作 / 验收写模型仍待下一阶段接管

## 最后一步

- 继续进入阶段四：协作与验收写模型正式化
