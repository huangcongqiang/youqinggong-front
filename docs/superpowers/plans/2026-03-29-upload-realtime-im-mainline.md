# `文件上传 / 实时事件 / IM 回写正式化` 主线

## 主线目标

把当前“上传只有元信息 / IM 回调只有 demo / 实时主要靠轮询”的状态，推进到：

- 文件有正式上传底座与统一资产索引
- 腾讯 IM 至少具备正式回调 / 回写的第一批闭环
- 关键业务页面具备正式事件链或明确的事件化落点

## 范围

- 正式上传底座
- 腾讯 IM 回调 / 回写正式化
- 腾讯 IM 写链正式化
- 业务实时事件正式化

## 当前活跃阶段

- 阶段一：`正式上传底座` 已完成
- 阶段二：`IM 回调 / 回写正式化` 已完成
- 阶段三：`IM 写链正式化` 已完成
- 阶段四：`业务实时事件正式化` 已完成

## 阶段一结果摘要

- `spring-app` 已补：
  - `POST /api/uploads/presign`
  - `PUT /api/uploads/{uploadId}/binary`
  - `GET /api/uploads/{uploadId}/content`
  - `POST /api/tasks/{taskId}/files`
  - `GET /api/tasks/{taskId}/files`
- `task_files` 当前已经成为聊天附件、协作进度附件和记录详情资产库的统一索引基础
- 前台默认 API 目标切到 `spring-app` 后，上传底座已可作为正式主链第一批能力承接

## 阶段二结果摘要

- 已完成基于 `providerRoomId` 的房间反查
- 已完成基于 `providerMessageId` 的文本 callback 幂等入库
- 已完成 callback 文本消息对 `chat_messages` 的第一批正式回写
- 当前仍未包含 callback 验签、附件 callback、异常重试与完整 IM 写链

## 阶段三结果摘要

- 已完成 `GET /api/im/tencent/config` 的鉴权化、房间感知化
- 已完成后端按 token actor + `roomKey` 回读 `taskRoom / groupId / currentUser / counterpartUser`
- 已完成房间初始化与 IM 配置接口对同一房间真相的对齐
- 前端继续保留腾讯 IM SDK 收发，但不再把建群/加群和成员关系当成系统真相

## 阶段四结果摘要

- `spring-app` 已补 `GET /api/events/stream` 正式 SSE 入口
- PC / H5 当前关键业务页面已切到 `businessEventStream`，对象状态刷新优先走事件流
- `businessEventStream` 当前已补 `CRLF` 帧解析和断流重连
- 任务级事件接收人当前已收口为“发布方 + 已选中人才”，不再广播给仅推荐未选中的人才
- SSE controller 当前已补最小保障测试：`401` 与“已登录可起流”

## 下一阶段

- 切入主线 7 阶段一：`审批 / 财务 / 争议对象与状态机冻结`
- 聊天消息正文继续复用腾讯 IM 实时通道，不在当前主线内回退

## 最后一步

- 当前主线已完成，继续进入主线 7 阶段一：审批 / 财务 / 争议对象与状态机冻结
