# `spring-app` 阶段四：协作与验收写模型正式化

## 目标

- 让 `workspace-feedback / early-completion / cancellation / acceptance` 进入 `spring-app` 正式写模型
- 统一 actor 校验、任务状态流转、协作留痕与验收留痕
- 保持当前前台 `workspace / closure / orders / chat.taskDetail.status` 读模型合同稳定

## 范围

- 企业节点反馈写链
- 提前完成写链与评级闭环
- 取消任务写链
- 验收确认留痕
- 协作 / 验收状态与 `workspace / closure / record` 读模型投影一致性

## 当前阶段状态

- 状态：`已完成`
- 当前默认下一步：继续进入阶段五“中心页读模型补齐”

## 阶段结果

- `workspace-feedback` 当前已从单纯任务 JSON 留痕提升为正式写模型，新增独立持久化表保存节点反馈与 AI 补充说明
- `early-completion / cancellation / acceptance` 当前已统一进入生命周期事件写模型，形成可审计状态历史
- `workspace / closure / orders` 当前已优先读取正式写链投影，在缺失新写模型时才回退 legacy task JSON
- `closure` 当前已直接暴露 `acceptance.note / acceptedAt / accepterUserId`，记录详情与聊天状态也会继续复用这些正式投影
- 保持了当前前台主链合同兼容：旧字段仍继续回写，前台不需要因阶段四切换而改动核心读写路径

## 验证

- `cd backend/spring-app && mvn -q -Dtest=TaskLifecycleMobileFlowTest test`
- `cd backend/spring-app && mvn -q test`

## 最后一步

- 继续进入阶段五：中心页读模型补齐
