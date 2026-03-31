# `spring-app` 阶段二：任务确认与发布合同补齐

## 目标

- 补齐 `publish-presets / ai/decompose / negotiations/task-confirmation` 的正式主链合同
- 让聊天与记录详情读取真实持久化 `taskConfirmation`
- 为阶段三聊天正式写链提供稳定对象与版本历史

## 结果

- 已新增 `GET /api/ai/publish-presets`
- 已补齐 `POST /api/ai/decompose` 的前台主链字段：`originalBrief / provider / model / modules / schedule / tags / recommendations / matchingPreview`
- 已新增 `POST /api/tasks/{taskId}/negotiations/task-confirmation`
- `taskConfirmation` 当前已持久化到任务实体，并可被聊天房间与记录详情读模型复用
- 已支持 `confirm / request_changes / update / withdraw_update` 四类动作，以及 `changeReview / version / history / budget / period / scheduleNote / scopeNote`

## 验证

- `backend/spring-app`：`mvn -q -Dtest=TaskLifecycleMobileFlowTest test`
- `backend/spring-app`：`mvn -q test`
- `frontend`：`npm run build`
- `frontend_mobile_h5`：`npm run build`

## 已知边界

- 聊天正式写链仍未由 `spring-app` 完整接管，当前阶段只补了任务确认对象与发布辅助合同
- 旧任务在缺少持久化 `taskConfirmation` 时仍保留 legacy fallback，以保证历史数据可读

## 最后一步

- 继续进入阶段三：聊天正式写链
