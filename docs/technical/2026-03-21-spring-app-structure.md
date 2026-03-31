# Spring App 结构说明

## 1. 目标

`backend/spring-app` 是后续正式后端服务的主承接模块。它的目标不是替代当前 mock API 的即时可运行性，而是为真实数据库、鉴权、文件服务、腾讯 IM 和 AI 服务提供清晰的落点。

## 2. 当前包结构

```text
com.youqinggong.spring
├── config
├── controller
├── dto
├── domain
│   ├── entity
│   └── repository
├── im
├── service
└── support
```

## 3. 各层职责

### controller

负责对外暴露 HTTP 接口，当前已覆盖：

- 公共数据接口
- 管理台接口
- AI 拆解接口
- 入驻接口
- 任务生命周期接口
- 腾讯 IM 接口与回调接口

### dto

负责请求参数校验和输入边界控制，避免控制器直接处理原始 JSON。

### domain/entity

负责映射 MySQL 表，当前已覆盖：

- 用户
- 企业
- 企业审核材料
- 管理员动作日志
- 风险工单
- 人才资料
- 任务
- AI 分析
- 候选分配
- 协商确认
- 里程碑
- 进度
- 附件
- 会话
- 消息
- IM 房间

### domain/repository

负责 JPA 数据访问，当前先提供按业务流程最常见的查询方法。

### service

负责应用层编排。当前已拆为：

- `AdminManagementService`
- `DemoFacadeService`
- `PublicReadService`
- `OnboardingApplicationService`
- `TaskLifecycleApplicationService`
- `TencentImFacadeService`
- `TencentImCallbackService`

### im

负责 IM 供应商适配层。当前用 `MockTencentImGateway` 占位，后续可以替换为真实腾讯 IM SDK 调用。

### support

当前放的是 `DemoDataFactory`，用于给 Spring Boot 骨架返回稳定的示意数据。后续应该逐步把这里的示意数据替换成数据库读写和外部服务编排。

当前演进状态补充：

- 官网首页与 AI 拆解仍以 `DemoFacadeService + DemoDataFactory` 为主
- 公共展示接口已经开始由 `PublicReadService` 读取 `Task / TaskAiAnalysis / TaskAssignment / TaskMilestone / TaskProgressUpdate / TaskFile / User / TalentProfile / Review`
- 管理台接口已经开始由 `AdminManagementService` 读取 `User / Organization / OrganizationVerification / Task / TaskAssignment / RiskTicket / AdminAction`
- 入驻接口已经开始由 `OnboardingApplicationService` 写入 `User / Organization / OrganizationVerification / TalentProfile`
- 任务生命周期接口已经开始由 `TaskLifecycleApplicationService` 写入 `Task / TaskAiAnalysis / TaskAssignment / TaskNegotiation / TaskProgressUpdate / TaskFile / Review / TaskImRoom`
- 任务生命周期接口当前已完成第一批 actor 边界正式化：发布任务、AI 拆解确认、选人、协商确认、闭环摘要以及进度 / 验收 / 评分写链优先从 token 解 actor，不再信任前端当前操作者字段
- 任务房间预览已经开始由 `TencentImFacadeService` 读取 `TaskImRoom / ChatConversation / ChatMessage`
- `TencentImCallbackService` 当前已承接 callback 第一批房间反查、文本消息幂等入库与 provider 标识回写；后续继续扩到验签、附件 callback 与异常重试
- 当前采用“数据库优先，缺数据时回退 demo”的方式，保证迁移过程中接口结构稳定

## 4. 当前已落下的业务主线

### 入驻

- 企业入驻提交
- 人才入驻提交
- 入驻清单返回
- 企业 / 人才入驻数据写库
- 虚拟企业审核材料落 `organization_verifications`

### 任务

- 任务发布
- AI 结果确认
- 选择人才
- 协商确认
- 上传进度
- 验收确认
- 双方评分
- 交付闭环摘要读取

### 公共展示

- 企业端工作台
- 人才端工作台
- 任务广场
- 人才广场
- 人才详情
- 协作空间

### IM

- 腾讯 IM 配置查询
- 任务房间预览
- 腾讯 IM 事件回调
- 腾讯 IM 消息回调

## 5. 后续建议

1. 增加统一异常处理与返回包装
2. 继续扩大真实 Service + Repository 读写范围到官网展示和更多个性化读取
3. 接入登录态和权限校验
4. 为腾讯 IM 增加签名、回调验签和任务房间创建逻辑
5. 将 AI 拆解与 AI 审查从示意数据替换为真实调用
