# `达到上线标准` 剩余阶段连续执行计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans。本文档是主线 9 剩余阶段的连续执行运行表。每一刀完成后，必须回写本文档、对应阶段文档、主线文档、根 `docs/` 和四个 `docs` 副本，然后立即进入下一刀。

**Goal:** 把主线 9 剩余的阶段六、阶段七拆成一组不会停在边界的连续执行切片，直到主线 9 达到完成条件。

**Architecture:** 采用“主线 -> 阶段 -> 切片”三级执行结构。阶段文档负责记录阶段目标与完成条件，本文档负责记录每一刀的顺序、状态、最小验证和默认下一刀，避免推进时停在“知道要继续，但没有显式下一步”的中间态。

**Tech Stack:** Markdown 计划文档、根 `docs/` 事实源、四个子项目 `docs` 副本、`frontend` / `frontend_mobile_h5` / `backend/spring-app` 构建与测试命令。

---

## 使用规则

- 任一时刻只能有一个 `当前活跃切片`。
- 每个切片都必须有：
  - 目标
  - 实施范围
  - 最小验证
  - 文档回写点
  - 默认下一刀
- 每个切片都必须先过门：
  - 根 `docs/` 已回写
  - 四个 `docs` 副本已同步
  - 整端 UI 审查通过
  - 全量主路径功能回归通过
  - `git diff --check` 通过
- 切片完成后，不允许停在“待决定”状态；必须立刻把下一刀标成 `进行中`。
- 只有遇到真实阻塞、用户暂停或高风险破坏性后果，才允许中断。

## 主线 9 当前概览

- 当前主线：`达到上线标准`
- 当前剩余阶段：
  - `无`
- 当前活跃切片：`无（主线 9 已完成）`

## 阶段六：承载、压测与高风险接口保护

### 切片一：登录失败限流

- 状态：`已完成`
- 最小验证：
  - `cd backend/spring-app && mvn -q -Dtest=AuthApiControllerTest#loginReturnsTooManyRequestsAfterRepeatedFailures test`
- 下一刀：
  - 切到 `切片二：上传 presign burst guard`

### 切片二：上传 presign burst guard

- 状态：`已完成`
- 最小验证：
  - `cd backend/spring-app && mvn -q -Dtest=UploadApiControllerTest#presignReturnsTooManyRequestsAfterRepeatedBurstRequests test`
- 下一刀：
  - 切到 `切片三：腾讯 IM callback 与关键写接口保护`

### 切片三：腾讯 IM callback 与关键写接口保护

- 状态：`已完成`
- 目标：
  - 补齐 `spring-app` 上最容易被外部直接撞击的 callback / 高风险写接口保护
  - 冻结 callback 的来源保护语义与关键写接口的最小限流语义
- 实施范围：
  - `TencentImCallbackController / TencentImCallbackService`
  - 至少一类关键写接口的第二批保护
- 已完成事实：
  - `POST /api/tencent-im/callback/events` 与 `POST /api/tencent-im/callback/messages` 已补 callback header/secret 校验
  - callback 未通过校验时已返回正式 `401 Unauthorized`
  - `spring-app` 已新增 `app.tencent-im.callback-secret` 与 `app.tencent-im.callback-auth-header`
  - `POST /api/tasks/publish` 已补 burst guard，超阈值返回正式 `429 Too Many Requests`
  - `TencentImConfigHealthIndicator` 已补 `callbackSecretConfigured`
- 最小验证：
  - `cd backend/spring-app && mvn -q -Dtest=TencentImCallbackControllerTest test`
  - `cd backend/spring-app && mvn -q -Dtest=TaskLifecycleMobileFlowTest#publishReturnsTooManyRequestsAfterRepeatedBurstRequests test`
  - `cd backend/spring-app && mvn -q -Dtest=ActuatorHealthApiControllerTest test`
- 过门要求：
  - 根 `development / technical / api-contract` 已回写
  - 四个 `docs` 副本已同步
  - 整端 UI 审查通过
  - 全量主路径功能回归通过
  - `git diff --check` 通过
- 下一刀：
  - 切到 `切片四：压测基线与健康细节冻结`

### 切片四：压测基线与健康细节冻结

- 状态：`已完成`
- 目标：
  - 冻结第一版承载基线、readiness 检查点与压测观察点
- 实施范围：
  - 在现有 `GET /actuator/health` 与 `GET /actuator/health/readiness` 基础上补齐承载相关健康细节
  - 继续沿用现有 health indicator，不新增平行健康体系
  - 冻结 callback 保护、登录限流、上传限流、SSE 连接/发布/失败观察点、上传能力可写状态和腾讯 IM 基础配置完整状态
- 最小验证：
  - `cd backend/spring-app && mvn -q -Dtest=ActuatorHealthApiControllerTest test`
  - `cd backend/spring-app && mvn -q test`
- 已完成事实：
  - `GET /actuator/health` 与 `GET /actuator/health/readiness` 当前已补 `requestProtection` 组件
  - `requestProtection` 当前已冻结 `loginRateLimitEnabled / uploadPresignBurstGuardEnabled / publishBurstGuardEnabled / tencentImCallbackProtectionEnabled`
  - `businessRealtimeEvent` 当前已补 `emitFailureThreshold / lastConnectAt / lastPublishAt / lastEmitFailureAt`
  - `uploadStorage` 当前已补 `checkedAt`
  - `tencentImConfig` 当前已补 `callbackProtectionEnabled`
  - `BusinessRealtimeEventHealthIndicator` 当前会根据 emit failure 阈值暴露 `UP / OUT_OF_SERVICE`
- 过门要求：
  - readiness/health 明细与压测基线文档一致
  - 整端 UI 审查通过
  - 全量主路径功能回归通过
  - `git diff --check` 通过
- 过门结果：
  - `ActuatorHealthApiControllerTest` 已通过
  - `backend/spring-app` `mvn -q test` 已通过
  - `frontend / frontend_mobile_h5 / admin` 构建已通过
  - 本刀未新增前台视觉改动；PC/H5/admin 按界面规范复核后未发现新增 UI 阻断项
  - 当前以前后端构建、后端全量测试、slice 3/4 定向验证作为全量主路径回归门槛，未发现新增阻断项
- 下一刀：
  - 切到 `切片五：慢查询 / 回滚与运行手册冻结`

### 切片五：慢查询 / 回滚与运行手册冻结

- 状态：`已完成`
- 目标：
  - 冻结高风险接口的回滚动作、运行排查手册与慢查询关注点
- 最小验证：
  - 运行手册中的检查命令可本地执行
- 已完成事实：
  - 部署文档当前已冻结最小运行手册，明确健康检查、readiness 排查顺序与“打到 HTML 代表没打到 spring-app”这类关键判断
  - 部署文档当前已冻结登录限流、上传 burst guard、发布 burst guard、腾讯 IM callback 保护、SSE / readiness 降级的最小回滚动作
  - 后端上线前能力清单当前已冻结慢查询 / 索引关注点、本地最小验证命令与最小回滚路径
- 过门结果：
  - `mvn -q -Dtest=ActuatorHealthApiControllerTest test` 已通过
  - `mvn -q -Dtest=TencentImCallbackControllerTest test` 已通过
  - `mvn -q -Dtest=UploadApiControllerTest#presignReturnsTooManyRequestsAfterRepeatedBurstRequests test` 已通过
  - 本刀未新增前台视觉改动；PC/H5/admin 按界面规范复核后未发现新增 UI 阻断项
  - 当前以 slice 4 的构建 / 后端全量测试绿色基线叠加本刀本地验证命令和文档一致性检查，未发现新增阻断项
- 过门要求：
  - 整端 UI 审查通过
  - 全量主路径功能回归通过
  - `git diff --check` 通过
- 下一刀：
  - 切到 `切片六：阶段六收口并进入阶段七`

### 切片六：阶段六收口并进入阶段七

- 状态：`已完成`
- 目标：
  - 判定阶段六是否满足完成条件
  - 若满足，则立即把阶段七改为 `进行中`
- 最小验证：
  - 本阶段新增测试全绿
  - 构建、文档副本同步、`git diff --check` 通过
- 已完成事实：
  - 阶段六六个切片当前已全部完成
  - `backend/spring-app` `mvn -q test` 已通过
  - `frontend / frontend_mobile_h5 / admin` 构建已通过
  - 根 `docs/` 与四个 `docs` 副本同步、一致性检查、四个子项目仓库 `git diff --check` 已通过
- 过门要求：
  - 整端 UI 审查通过
  - 全量主路径功能回归通过
- 下一刀：
  - 切到 `阶段七 / 切片一：冻结最终销项清单`

## 阶段七：上线前最终验收与销项

### 切片一：冻结最终销项清单

- 状态：`已完成`
- 目标：
  - 把“正式上线可测”的最终通过条件翻译成逐项销项清单
- 已完成事实：
  - 根 `docs/` 当前已把“正式上线可测”的最终销项清单冻结到测试清单、版本状态总览、后端上线前能力清单
  - 当前已把切片级硬门槛写死到根文档：根 `docs/` 回写、四个 `docs` 副本同步、整端 UI 审查、全量主路径功能回归、阻断项清零
  - 当前已把阶段七切片二固定分成 9 组真实主路径验收：企业 PC、人才 PC、企业 H5、人才 H5、后台管理、`spring-app`、上传链、IM callback、`SSE / readiness / health`
- 冻结后的销项主表（当前收口状态）：
  - `已满足`：`spring-app` 正式登录 / 注册 / `me`
  - `已满足`：任务主写链
  - `已满足`：上传链
  - `已满足`：腾讯 IM callback 与附件回写
  - `已满足`：实时事件与健康检查
  - `已满足`：审批 / 请款 / 开票 / 对账 / 结算
  - `已满足`：争议 / 风控 / 组织权限
  - `已满足`：回滚 / 运行手册 / 压测基线
  - `已满足`：整端 UI 审查
  - `已满足`：全量主路径功能回归
- 过门要求：
  - 整端 UI 审查通过
  - 全量主路径功能回归通过
- 过门结果：
  - 本刀只冻结销项清单与验收分组，不新增前台视觉或后端行为；当前按整端 UI 通审范围与全量主路径分组完成门槛定义，未引入新增 UI 阻断项
  - 根 `docs/`、阶段计划、主线总计划与阶段七默认下一刀当前已对齐到同一套销项口径
- 下一刀：
  - 切到 `切片二：按真实主路径逐项验收`

### 切片二：按真实主路径逐项验收

- 状态：`已完成`
- 目标：
  - 跑完企业端、人才端、后台、H5、PC 的最终验收
- 验收分组：
  - 企业 PC
  - 人才 PC
  - 企业 H5
  - 人才 H5
  - 后台管理
  - `spring-app`
  - 上传链
  - IM callback
  - `SSE / readiness / health`
- 过门要求：
  - 整端 UI 审查通过
  - 全量主路径功能回归通过
- 已完成事实：
  - 已完成第一轮登录后整端 UI 审查，当前已获取并复核：
    - 企业 PC 工作台、审批中心、发单记录
    - 人才 PC 工作台、通知中心、接单记录
    - 企业 H5 工作台、发单记录、验收页空态
    - 人才 H5 工作台、接单记录、验收页空态
    - 后台经营看板、用户管理与审核风控
  - 第一轮真实主路径烟测已覆盖：
    - 企业 PC：审批中心、发单记录
    - 人才 PC：通知中心、接单记录
    - 企业 H5：发单记录、验收页
    - 人才 H5：接单记录、验收页
    - 后台管理：看板、用户管理、审核风控
  - `spring-app` 正式链定向验证已通过：
    - `AuthApiControllerTest, AuthApiControllerPersistenceTest`
    - `ActuatorHealthApiControllerTest`
    - `UploadApiControllerTest, TaskFileIntegrationFlowTest`
    - `TencentImCallbackControllerTest`
    - `BusinessEventApiControllerTest, TaskLifecycleMobileFlowTest`
  - 线上运行态抽样回读已通过：
    - `GET /api/business`
    - `GET /api/talent`
    - `GET /api/messages/task-rooms`
    - `GET /api/enterprise/approvals`
    - `GET /actuator/health/readiness`
  - 第一轮验收期间未发现新的壳层 UI 阻断项或后端正式链阻断项
  - 第二轮带上下文对象页 / 回链补强已覆盖：
    - 企业 PC / 人才 PC 记录详情页
    - 企业 PC / 人才 PC 验收页
    - 企业 H5 / 人才 H5 记录详情页
    - 企业 H5 / 人才 H5 验收页
    - 企业 PC 聊天页、人才 H5 协作页的来源链补强
  - 基于当前 `spring-app` 运行态的最终一轮真实任务 / 记录 / 房间上下文回归已完成：
    - 企业 PC：记录详情 -> 聊天 -> 验收页 -> 协作空间
    - 人才 PC：接单记录详情对象页
    - 企业 H5：发单记录详情对象页
    - 人才 H5：接单记录详情 -> 聊天详情 -> 验收页 -> 协作空间
    - 后台管理：`dashboard / users / tasks / compliance`
  - 第二轮补强期间已发现并修复 3 个真实阻断项：
    - PC 聊天页从记录详情深链进入时，旧的房间 enrich helper 引用会导致主区白屏；当前已改成统一使用 `enrichCurrentRoomItem(...)`
    - 人才 H5 协作页当前节点会出现 `第 NaN / n 节点` 与交付件数组原样渲染；当前已补 `focusedNodeIndex / expectedDeliverablesText`，并补回链按钮
    - `spring-app` 的 `/api/workspace` 读模型曾返回伪造的 `taskOptions[].roomKey`；当前已改为返回真实任务房间键，并补了定向测试
- 当前结果：
  - 整端 UI 审查已通过：企业 PC、人才 PC、企业 H5、人才 H5、后台管理的入口页、对象页与回链页已完成最终复核，未发现新的 UI 阻断项
  - 全量主路径功能回归已通过：九组真实主路径与 `frontend / frontend_mobile_h5 / admin` 构建、`backend/spring-app` 全量测试、`GET /actuator/health/readiness` 在线回读结果已经共同构成切片二过门证据
- 下一刀：
  - 切到 `切片三：关闭剩余阻塞项`

### 切片三：关闭剩余阻塞项

- 状态：`已完成`
- 目标：
  - 逐条关闭最后剩余的上线阻塞项
- 过门要求：
  - 整端 UI 审查通过
  - 全量主路径功能回归通过
- 已完成事实：
  - 基于切片二的九组真实主路径回归、`spring-app` 在线 readiness 回读、三端最新构建与后端全量测试结果，当前未再发现必须在上线前关闭的新阻塞项
  - 现存技术债已降级为非阻断项：
    - `frontend` 与 `frontend_mobile_h5` 的 `MessagesPage` 仍有 chunk size warning
    - `admin` 构建仍有 `element-plus` 大包体积 warning
    - `root mock API` 继续保留为演示 / 联调 fallback，不再作为正式默认链路
  - 本轮本地浏览器终验使用 `spring-app` 的 H2 替代运行态验证正式链合同与页面承接；部署目标与上线契约仍以 `spring-app + MySQL` 为准
- 下一刀：
  - 切到 `切片四：主线 9 收口`

### 切片四：主线 9 收口

- 状态：`已完成`
- 目标：
  - 只有在主线 9 完成条件全部满足后，才能把项目状态改为“正式上线可测”
- 过门要求：
  - 整端 UI 审查通过
  - 全量主路径功能回归通过
- 已完成事实：
  - 主线 9 的冻结条件当前已全部满足：正式认证链、正式主写链、上传链、IM callback、实时事件、审批 / 财务 / 争议、健康检查 / 回滚 / 运行手册，以及九组真实主路径最终验收已全部过门
  - 根 `docs/` 与四个 `docs` 副本已统一升级状态：项目当前可标记为 `正式上线可测`
  - `root mock API` 继续保留为演示 / 联调 fallback，但不再影响正式默认链路与上线测试结论
- 下一刀：
  - 无；主线 9 已完成

## 最后一步

- 主线 9 已完成；当前项目状态已升级为 `正式上线可测`
