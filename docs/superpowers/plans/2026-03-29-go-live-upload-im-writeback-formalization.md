# 主线 9 阶段三：上传、IM callback 与附件回写正式化

## 目标

- 把正式上传链、腾讯 IM callback、附件回写和对象页附件读模型继续收口到上线标准
- 清掉仍停留在 demo / 半正式状态的上传与 callback 入口

## 范围

- `spring-app` 上传 presign、二进制落盘、上传完成登记
- 腾讯 IM callback 事件入口、附件回写与幂等
- PC / H5 聊天附件、协作附件、记录详情资产库正式读链

## 当前状态

- 状态：`已完成`
- 当前默认下一步：切入阶段四“实时事件与可观测性升级”

## 本阶段实施项

1. 清理 IM callback demo ack 与附件回写缺口
2. 校验上传链与附件索引合同
3. 补 PC / H5 附件对象页的正式错误消费与回读一致性
4. 用最小回归确认聊天附件、协作附件、记录附件都走正式链

## 本阶段结果

- `TencentImCallbackService.receiveEvent(...)` 当前已移除 demo ack，事件 callback 会返回正式 `eventType / taskId / roomKey / providerMessageId / status / nextStep`
- 腾讯 IM 消息 callback 当前已支持附件 payload 回写，并会同步索引到 `task_files`
- PC / H5 协作进度附件当前已切到 `presign -> binary -> task file register` 正式上传链
- PC / H5 聊天附件当前已在消息发送前先走正式上传会话链，再把 `uploadId / objectKey / downloadUrl` 写入消息附件 payload
- `uploadWorkflow` 轻量测试已补齐真实 `/api/uploads/...` 合同，PC / H5 两端都已通过本地 node 验证

## 完成条件

- 腾讯 IM callback 不再返回 demo 结果
- 附件上传、回写、索引、回读链路统一
- PC / H5 附件读取优先正式链，不再依赖伪造详情 fallback

## 最后一步

- 阶段三已完成；立即进入阶段四“实时事件与可观测性升级”
