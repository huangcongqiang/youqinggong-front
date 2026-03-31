# 主线 6 阶段一：正式上传底座

## 目标

先把“文件可上传、可登记、可回读、可下载”的最小正式底座补齐，不把实时事件和 IM 回调混进这一阶段。

## 状态

- 状态：`已完成`

## 阶段结果

- `spring-app` 已新增上传会话实体、仓储和应用服务
- 已提供：
  - `POST /api/uploads/presign`
  - `PUT /api/uploads/{uploadId}/binary`
  - `GET /api/uploads/{uploadId}/content`
  - `POST /api/tasks/{taskId}/files`
  - `GET /api/tasks/{taskId}/files`
- `task_files` 当前已扩展 `mimeType / sourceType / objectKey / uploadSessionId`
- 聊天附件与协作进度附件当前会继续索引到 `task_files`
- 记录详情资产库当前可直接读取 `downloadUrl`

## 本阶段不做

- 对象存储真实 presign
- 上传删除与审计扩展
- SSE / WebSocket
- 腾讯 IM callback / writeback

## 验证

- `backend/spring-app`：`mvn -q -Dtest=UploadApiControllerTest,TaskFileIntegrationFlowTest,MessageRoomMobileFlowTest,MessageRoomApiControllerTest test`

## 最后一步

- 继续进入阶段二：IM 回调 / 回写正式化
