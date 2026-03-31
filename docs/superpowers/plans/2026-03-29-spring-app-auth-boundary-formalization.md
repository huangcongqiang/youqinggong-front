# 阶段记录：主线 5 / 阶段一 / 鉴权边界正式化

## 阶段目标

把 `spring-app` 当前前台主路径涉及的关键任务接口，统一改成“从 token 解 actor”，并明确前端不再传当前操作者身份。

## 本阶段完成结果

- `TaskLifecycleApiController` 当前已让以下入口统一接收 `Authorization`：
  - 发布任务
  - AI 拆解确认
  - 选人
  - 协商确认
  - 闭环摘要
- `TaskLifecycleApplicationService` 当前已新增 token actor 解析与企业任务归属校验：
  - 企业端关键写链不再信任前端传入的 `publisherUserId / organizationId / businessUserId`
  - 进度、验收、评分写链不再信任前端传入的当前操作者字段
- PC / H5 前端服务层当前已同步移除这些当前操作者字段的出站 payload

## 关键文件

- [TaskLifecycleApiController.java](/Users/huangcongqiang/Desktop/products/youqinggong/backend/spring-app/src/main/java/com/youqinggong/spring/controller/TaskLifecycleApiController.java)
- [TaskLifecycleApplicationService.java](/Users/huangcongqiang/Desktop/products/youqinggong/backend/spring-app/src/main/java/com/youqinggong/spring/service/TaskLifecycleApplicationService.java)
- [TaskLifecycleMobileFlowTest.java](/Users/huangcongqiang/Desktop/products/youqinggong/backend/spring-app/src/test/java/com/youqinggong/spring/controller/TaskLifecycleMobileFlowTest.java)
- [frontend/src/services/api.js](/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/services/api.js)
- [frontend_mobile_h5/src/services/api.js](/Users/huangcongqiang/Desktop/products/youqinggong/frontend_mobile_h5/src/services/api.js)

## 验证

- `cd backend/spring-app && mvn -q -Dtest=TaskLifecycleMobileFlowTest test`
- `cd backend/spring-app && mvn -q test`
- `cd frontend && npm run build`
- `cd frontend_mobile_h5 && npm run build`

## 已知缺口

- `spring-app` 当前仍未补齐正式 `task-confirmation` 写链
- 聊天里的 `taskConfirmation` 当前仍是临时拼装
- `publish-presets` 仍未由 `spring-app` 提供
- `ImApiController / TalentCalendarController` 的 actor 边界还需要继续正式化

## 最后一步

- 继续下一阶段：阶段二“任务确认与发布合同补齐”
