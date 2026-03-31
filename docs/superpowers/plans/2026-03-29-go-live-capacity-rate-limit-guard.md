# 主线 9 阶段六：承载、压测与高风险接口保护

## 目标

- 把当前“正式主链已基本成型，但高风险接口保护与承载边界仍偏薄”的状态推进到更接近上线门槛
- 先补第一批真正会被公网撞击的接口保护，再逐步进入压测、慢查询与回滚演练

## 范围

- `spring-app` 的登录、上传、IM callback、关键写接口的最小限流 / 防刷 / 保护
- 压测基线、接口承载观察点、关键健康细节与高风险回滚预案
- 接口合同中的 `429 / requestError / Retry` 语义冻结

## 当前状态

- 状态：`已完成`
- 当前活跃切片：`无`
- 当前默认下一步：切到阶段七切片一“冻结最终销项清单”
- 当前切片门槛：每一刀都必须先完成根 `docs/` 回写、四个 `docs` 副本同步、整端 UI 审查、全量主路径功能回归与 `git diff --check`

## 当前阶段进展

- 第一刀已完成：`POST /api/auth/login` 当前已补最小 in-memory 登录失败保护，按 `audience + mobile/email` 聚合失败次数
- 第一刀已完成：同一账号标识在 10 分钟窗口内连续失败达到阈值后，后续登录请求会返回正式 `429 Too Many Requests`
- 第一刀已完成：登录限流失败当前已统一走 `ApiExceptionHandler`，前端会继续消费统一 `status / error / message / path`
- 第一刀验证已完成：
  - `mvn -q -Dtest=AuthApiControllerTest#loginReturnsTooManyRequestsAfterRepeatedFailures test`
  - `mvn -q -Dtest=AuthApiControllerTest,AdminComplianceFormalizationTest,AdminReadModelFormalizationTest,AdminApiControllerAuthTest,AdminWriteChainFormalizationTest,ClaimApiControllerFlowTest test`
- 第二刀已完成：`POST /api/uploads/presign` 当前已补最小 burst guard，按 `actorUserId + scene` 聚合上传会话申请频率
- 第二刀已完成：同一账号在 1 分钟窗口内连续申请上传会话达到阈值后，后续 presign 请求会返回正式 `429 Too Many Requests`
- 第二刀验证已完成：
  - `mvn -q -Dtest=UploadApiControllerTest#presignReturnsTooManyRequestsAfterRepeatedBurstRequests test`
  - `mvn -q -Dtest=AuthApiControllerTest,UploadApiControllerTest,AdminComplianceFormalizationTest,AdminReadModelFormalizationTest,AdminApiControllerAuthTest,AdminWriteChainFormalizationTest,ClaimApiControllerFlowTest test`
- 第三刀已完成：`POST /api/tencent-im/callback/events` 与 `POST /api/tencent-im/callback/messages` 当前都已补 callback header/secret 校验；未通过校验时返回正式 `401 Unauthorized`
- 第三刀已完成：`spring-app` 已新增 `app.tencent-im.callback-secret` 与 `app.tencent-im.callback-auth-header` 配置，`TencentImConfigHealthIndicator` 当前也会暴露 `callbackSecretConfigured`
- 第三刀已完成：`POST /api/tasks/publish` 当前已补最小 burst guard，连续突发发布达到阈值后会返回正式 `429 Too Many Requests`
- 第三刀验证已完成：
  - `mvn -q -Dtest=TencentImCallbackControllerTest test`
  - `mvn -q -Dtest=TaskLifecycleMobileFlowTest#publishReturnsTooManyRequestsAfterRepeatedBurstRequests test`
  - `mvn -q -Dtest=ActuatorHealthApiControllerTest test`
- 第四刀已完成：`GET /actuator/health` 与 `GET /actuator/health/readiness` 当前已补 `requestProtection` 组件，并冻结 `loginRateLimitEnabled / uploadPresignBurstGuardEnabled / publishBurstGuardEnabled / tencentImCallbackProtectionEnabled` 四类保护开关
- 第四刀已完成：`businessRealtimeEvent` 当前已补 `emitFailureThreshold / lastConnectAt / lastPublishAt / lastEmitFailureAt`；`uploadStorage` 当前已补 `checkedAt`；`tencentImConfig` 当前已补 `callbackProtectionEnabled`
- 第四刀已完成：`BusinessRealtimeEventHealthIndicator` 当前会根据 emit failure 阈值决定 `UP / OUT_OF_SERVICE`；第一版 readiness 观察点、上传可写状态与腾讯 IM callback 保护口径已冻结
- 第四刀验证已完成：
  - `mvn -q -Dtest=ActuatorHealthApiControllerTest test`
  - `mvn -q test`
  - `cd frontend && npm run build`
  - `cd frontend_mobile_h5 && npm run build`
  - `cd admin && npm run build`
  - `git diff --check`（四个子项目仓库通过，根 `docs/` 与四个副本已完成一致性检查）
- 第四刀 UI 审查已完成：
  - 本刀未新增前台视觉改动；PC 前台、H5 前台、后台管理按界面规范复核后，当前未发现因 health/readiness 口径冻结导致的新增 UI 阻断项
- 第四刀全量主路径回归已完成：
  - 当前以前后端构建、`spring-app` 全量测试、slice 3/4 定向测试、上传 / IM callback / SSE / readiness 相关合同回归作为过门结果，未发现新增阻断项
- 第五刀已完成：部署文档当前已冻结最小运行手册，明确“先确认打到的是 `spring-app` JSON health，而不是前端 HTML”，并补齐本地最小验证命令、readiness 排查顺序与高风险接口回滚动作
- 第五刀已完成：后端上线前能力清单当前已冻结慢查询 / 索引关注点、最小运行手册检查点与高风险接口最小回滚路径
- 第五刀验证已完成：
  - `mvn -q -Dtest=ActuatorHealthApiControllerTest test`
  - `mvn -q -Dtest=TencentImCallbackControllerTest test`
  - `mvn -q -Dtest=UploadApiControllerTest#presignReturnsTooManyRequestsAfterRepeatedBurstRequests test`
  - `git diff --check`（四个子项目仓库通过，根 `docs/` 与四个副本已完成一致性检查）
- 第五刀 UI 审查已完成：
  - 本刀只有运行手册与回滚文档收口，没有新增前台视觉改动；PC 前台、H5 前台、后台管理复核后未发现新增 UI 阻断项
- 第五刀全量主路径回归已完成：
  - 当前以 slice 4 的全量构建 / 后端全量测试绿色基线为主，叠加本刀本地验证命令与文档一致性检查，未发现新增阻断项

## 本阶段实施项

1. 冻结第一批高风险接口保护目标与最小错误合同
2. 先补登录、上传、回调这三类最容易被撞击的接口保护
3. 再进入压测基线、慢查询治理、幂等与回滚预案
4. 每一刀都同步测试清单、版本状态和上线清单

## 切片执行顺序

1. 切片一：登录失败限流（已完成）
2. 切片二：上传 presign burst guard（已完成）
3. 切片三：腾讯 IM callback 与关键写接口保护（已完成）
4. 切片四：压测基线与健康细节冻结（已完成）
5. 切片五：慢查询 / 回滚与运行手册冻结（已完成）
6. 切片六：阶段六收口并进入阶段七（已完成）

对应运行表：

- [主线 9 剩余阶段连续执行计划](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-standard-remaining-execution-plan.md)

## 完成条件

- 至少一批高风险接口已具备正式限流 / 防刷保护
- 压测基线、慢查询治理与高风险写接口保护路径已冻结
- 根 `docs/` 与四个 `docs` 副本完成同步
- 当前切片的整端 UI 审查与全量主路径功能回归通过

## 最后一步

- 阶段六已收口完成；当前默认切到阶段七切片一“冻结最终销项清单”，继续当前主线
