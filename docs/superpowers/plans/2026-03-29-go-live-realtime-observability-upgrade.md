# 主线 9 阶段四：实时事件与可观测性升级

## 目标

- 让关键页面实时状态优先走正式事件驱动
- 把健康检查、失败追踪和关键日志补到上线可用口径

## 范围

- `spring-app` SSE、上传、腾讯 IM callback 的健康检查与失败追踪
- PC / H5 `businessEventStream` 的状态可见性与错误消费
- 上线文档里的健康检查、观察项和回归口径同步

## 当前状态

- 状态：`已完成`
- 当前默认下一步：继续进入阶段五“财务、争议、风控与组织权限补缺”

## 本阶段实施项

1. 补 `spring-app` 健康检查 / readiness 视图与关键依赖状态
2. 收口 SSE、上传、腾讯 IM callback 的失败追踪字段与日志口径
3. 校验 PC / H5 事件流状态展示与 fallback 触发条件
4. 用最小回归确认事件优先、轮询兜底、错误可见三条链路

## 完成条件

- `spring-app` 有可用的健康检查 / readiness 入口
- SSE、上传、IM callback 的关键失败路径可追踪
- PC / H5 关键页面能显式区分 `open / fallback / paused / disabled`
- 相关文档与四个 `docs` 副本完成同步

## 本阶段结果

- `spring-app` 已补正式 `actuator health / readiness` 入口，并把 `businessRealtimeEvent / uploadStorage / tencentImConfig` 纳入 readiness 视图。
- `BusinessRealtimeEventService`、`UploadApplicationService` 与 `TencentImCallbackService` 当前都已具备最小结构化日志与健康细节暴露，不再只停留在服务内部状态。
- PC / H5 的工作台、协作空间、验收页、通知中心、审批中心当前都已显式展示 `businessEventStream` 的 `connecting / open / fallback / paused / disabled` 状态，不再把事件流退化隐藏在轮询之下。
- `spring-app` 全量测试、PC 构建与 H5 构建都已重新回归通过，阶段四的实现态、计划态与根文档事实源已同步收口。

## 验证

- `cd backend/spring-app && mvn -q -Dtest=ActuatorHealthApiControllerTest,BusinessEventApiControllerTest test`
- `cd backend/spring-app && mvn -q test`
- `cd frontend && npm run build`
- `cd frontend_mobile_h5 && npm run build`

## 最后一步

- 继续进入主线 9 阶段五：财务、争议、风控与组织权限补缺
