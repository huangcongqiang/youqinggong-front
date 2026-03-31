# 主线 8 阶段二：稳定性与可观测性

## 目标

- 补齐前后台在上传、实时事件、IM 回写与关键对象页上的最小可观测性
- 让“失败了什么、在哪里失败、是否可恢复”能被明确追踪，而不是只靠页面现象猜

## 范围

- `spring-app` SSE / 上传 / IM callback 相关服务
- PC / H5 的 `businessEventStream` 与关键错误提示
- 上线前最关键的失败追踪与恢复入口

## 本阶段最小切片

1. 先收 SSE / 前端 `businessEventStream` 的稳定性与观测字段
2. 再补上传与 IM callback 的最小错误追踪和告警留痕
3. 最后冻结“哪些错误已经可观测、哪些仍然只是控制台可见”的清单

## 当前状态

- 状态：`已完成`
- 当前默认下一步：继续进入主线 8 阶段三“上线前通过条件冻结”

## 本阶段完成结果

1. PC / H5 `businessEventStream` 已补 `onStatusChange / onSyncError`，当前可显式观测 `connecting / open / fallback / paused / disposed / disabled`、`transport`、`reason`、`reconnectCount`、`lastConnectedAt`、`lastErrorAt`
2. `spring-app` 的 `BusinessRealtimeEventService` 已补连接建立、完成、超时、异常、广播与发送失败的结构化日志
3. `spring-app` 的 `UploadApplicationService` 已补 `presign / uploadBinary / downloadContent / registerTaskFile / listTaskFiles` 的最小结构化日志
4. `spring-app` 的 `TencentImCallbackService` 已补 `receiveEvent / receiveMessage` 的关键结构化日志，当前能显式追踪 `missing room / duplicate ignored / recorded / sender fallback`
5. 当前阶段最小验证已通过：
   - `node frontend/src/services/businessEventStream.test.js`
   - `node frontend_mobile_h5/src/services/businessEventStream.test.js`
   - `frontend` `npm run build`
   - `frontend_mobile_h5` `npm run build`
   - `backend/spring-app` `mvn -q test`

## 最后一步

- 继续进入主线 8 阶段三：上线前通过条件冻结
