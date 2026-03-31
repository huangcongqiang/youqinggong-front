# 主线 9 阶段二：主写链补缺与审计补齐

## 目标

- 补齐 `spring-app` 任务、聊天、协作、验收、记录主写链剩余的 demo / fallback / 审计缺口
- 让关键写操作有稳定的事务边界、操作者留痕和对象级状态历史

## 范围

- 任务发布与 AI 拆解结果回写
- 任务确认版本流与修改建议
- 聊天消息与任务确认卡的持久化一致性
- 协作进展、节点反馈、验收动作、记录页摘要的审计补齐

## 当前状态

- 状态：`已完成`
- 当前默认下一步：继续进入阶段三“上传、IM callback 与附件回写正式化”

## 本阶段实施项

1. 盘点任务、聊天、协作、验收、记录相关写接口的 demo / fallback / actor / 审计缺口
2. 补正式事务边界与操作者留痕
3. 统一对象状态历史与读模型摘要来源
4. 用最小端到端回归确认“发布 -> 选人 -> 聊天 -> 协作 -> 验收 -> 记录”都走正式写链

## 完成条件

- 关键主写链不再依赖临时拼装或 demo 数据
- 任务确认、聊天、协作、验收、记录有一致的审计留痕
- 前台主路径读模型已优先读取正式写链结果

## 本阶段结果

- `TaskLifecycleApplicationService` 已移除正式写链上的不可达 demo fallback，`analysis/confirm / assignments/select / negotiations/confirm / closure` 当前统一走正式 `404 / 403 / 401` 合同，不再保留服务层演示成功残留。
- 管理台正式写链已补齐第一批 formal payload：
  - `createUserDraft(...)` 返回真实创建对象
  - `createTaskDraft(...)` 返回真实创建对象
  - `reviewDecision(...)` 对缺失审核对象返回 `404`
  - `transitionTask(...)` 对缺失任务返回 `404`
  - `updateRiskTicket(...)` 对缺失风控工单返回 `404`
- PC Web 已补第一批正式错误消费：
  - 聊天页 `submitTaskAction` 当前会显式消费 `requestError / FAILED`
  - `workspace / closure / order detail` 的 fallback 已从“完整 mock 详情”切成“空态 + requestError”，不再把正式错误伪装成成功详情
  - 记录详情页、验收页当前已补显式错误卡

## 验证

- `cd backend/spring-app && mvn -q -Dtest=AdminWriteChainFormalizationTest,TaskLifecycleMobileFlowTest test`
- `cd frontend && npm run build`

## 最后一步

- 继续进入主线 9 阶段三：上传、IM callback 与附件回写正式化
