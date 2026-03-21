# AI 人才协作市场 API 详细契约文档

## 1. 文档用途

本文件用于给前端、后端、联调和后续第三方接入使用。

和之前“只列接口目录”的版本不同，这一版重点补齐：

- 接口分组
- 请求方式与路径
- 请求参数
- 请求体字段
- 主要响应字段
- 请求示例
- 响应示例
- 常见错误说明

## 2. 基础约定

### 2.1 Base URL

```text
http://localhost:8080/api
```

生产环境通常会通过 Nginx 代理为：

```text
https://api.example.com/api
```

### 2.2 当前鉴权状态

当前项目处于开发版阶段：

- 大部分接口暂未接入正式登录鉴权
- 前台与后台当前默认以业务参数驱动
- 后续接入登录后，建议统一增加 `Authorization: Bearer <token>`

因此本文件里的接口默认不强制要求鉴权头，但正式环境建议补上。

### 2.3 数据格式

- 请求体：`application/json`
- 返回体：`application/json`
- 日期：`YYYY-MM-DD`
- 日期时间：`MM/dd HH:mm` 或 ISO 日期字符串，当前以页面展示需要为主

### 2.4 当前错误返回说明

当前项目同时存在两套后端形态：

- root mock API：错误通常返回

```json
{
  "error": "Not Found",
  "message": "具体错误说明"
}
```

- `spring-app`：参数校验失败时，当前仍使用 Spring Boot 默认 `400` 错误结构

后续建议统一为：

```json
{
  "code": "BAD_REQUEST",
  "message": "具体错误说明",
  "details": []
}
```

### 2.5 契约优先级

当前项目同时有两套可对接后端：

- root mock API：用于本地演示、前端预览、快速联调
- `spring-app`：后续正式交付的 Spring Boot + MySQL 服务

当前建议的理解方式是：

1. 文档中的字段命名和路径约定，作为后续正式服务的主契约
2. root mock API 作为“当前本地联调返回”的参考实现
3. 如果 mock 返回和文档字段有少量差异，以文档契约为后续收口目标

当前这版文档里的大部分示例已经按本地 mock API 真实返回补齐。

### 2.6 状态值速查

| 场景 | 取值 | 说明 |
|---|---|---|
| 入驻申请 | `PENDING_REVIEW` | 已提交，等待审核 |
| 任务发布 | `AI_ANALYZING` | 已发布，等待 AI 拆解 |
| AI 确认后 | `MATCHING` | 进入人才匹配 |
| 选人后 | `NEGOTIATING` | 进入需求 / 工期协商 |
| 协商完成 | `IN_PROGRESS` | 正式执行中 |
| 进度提交 | `AI_REVIEW_PENDING` | 等待 AI 审查 |
| 验收完成 | `ACCEPTED` | 验收通过 |
| 评分写入 | `RECORDED` | 已记录到评价体系 |
| 风控回调 | `RECEIVED` | 回调已接收 |
| 档期状态 | `OPEN / BUSY / CLOSED` | 可接单 / 忙碌 / 暂停接单 |
| 日历展示态 | `open / busy / closed` | 前端展示使用的小写状态 |

### 2.7 角色与接口矩阵

| 角色 | 主要接口组 | 说明 |
|---|---|---|
| 官网访客 | `/landing` | 只看介绍、案例、联系方式、角色入口 |
| 企业端 | `/business` `/talents/marketplace` `/talents/{slug}` `/tasks/*` `/messages/task-room` | 先看人才，再进入协商和协作 |
| 人才端 | `/talent` `/talent/calendar/*` `/tasks/marketplace` `/tasks/*` `/messages/task-room` | 先看任务，再推进接单和交付 |
| 后台管理 | `/admin/*` | 只做审核、运营、流转和风控，不承接项目沟通主界面 |
| AI / 第三方回调 | `/ai/decompose` `/tencent-im/callback/*` | 负责拆单建议和任务消息回写 |

## 3. 通用错误码建议

虽然当前代码还没有完全统一错误码，但文档先给出推荐约定，便于后续收口：

| HTTP 状态 | code | 说明 |
|---|---|---|
| 400 | `BAD_REQUEST` | 请求参数缺失、格式不合法 |
| 401 | `UNAUTHORIZED` | 未登录或 token 无效 |
| 403 | `FORBIDDEN` | 角色无权限访问 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 409 | `CONFLICT` | 状态冲突，如重复流转 |
| 422 | `VALIDATION_FAILED` | 业务规则校验不通过 |
| 500 | `INTERNAL_ERROR` | 服务内部错误 |

## 4. 阅读方式

如果你是：

- 前端开发：先看“公共展示接口”“入驻接口”“任务生命周期接口”“IM 接口”
- 后台开发：重点看“管理后台接口”
- 运维或测试：重点看“回调接口”“错误说明”“部署文档”

## 5. 公共展示接口

### 5.1 `GET /landing`

用途：

- 官网首页
- 返回平台介绍、角色入口、案例、联系方式

请求参数：

无

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `badges` | `string[]` | 首页信号标签 |
| `entryNotes` | `string[]` | 首页入口说明 |
| `metrics` | `object[]` | 首页指标卡 |
| `pillars` | `object[]` | 平台核心能力 |
| `stages` | `object[]` | 合作主线阶段 |
| `roleCards` | `object[]` | 企业端 / 人才端入口卡 |
| `journeys` | `object[]` | 两类角色路径 |
| `cases` | `object[]` | 案例卡片 |
| `contacts` | `object[]` | 联系方式 |
| `highlights` | `object[]` | 首页记忆点 |

响应示例：

```json
{
  "badges": ["AI 拆单", "人才匹配", "协作验收", "企业审核"],
  "entryNotes": [
    "企业端先看人才广场，确认合作对象后再进入项目沟通与协作。",
    "人才端先看任务广场，接单之后围绕任务推进进度与验收。"
  ],
  "roleCards": [
    {
      "title": "企业端",
      "desc": "可发布任务、确认 AI 拆单、浏览人才广场并验收。",
      "route": "/enterprise",
      "cta": "进入企业端"
    }
  ],
  "contacts": [
    {
      "label": "商务合作",
      "value": "bd@youqinggong.ai",
      "note": "适合企业入驻、渠道合作、方案咨询。"
    }
  ]
}
```

### 5.2 `GET /business`

用途：

- 企业端工作台首页

请求参数：

无

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `metrics` | `object[]` | 企业端看板指标 |
| `onboardingChecklist` | `string[]` | 企业端入驻清单 |
| `sampleBrief` | `string` | 默认任务描述示例 |
| `recommendedTalents` | `object[]` | 推荐人才列表 |
| `taskBoard` | `object[]` | 当前任务阶段面板 |
| `liveConversation` | `object[]` | 当前项目沟通摘要 |
| `contractSummary` | `string[]` | 协作确认摘要 |

`recommendedTalents` 关键字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `slug` | `string` | 人才详情页跳转标识 |
| `name` | `string` | 人才姓名 |
| `role` | `string` | 人才定位 |
| `score` | `string` | 评分 |
| `tags` | `string[]` | 技能标签 |
| `summary` | `string` | 简介摘要 |

响应示例：

```json
{
  "metrics": [
    {
      "label": "待审核入驻",
      "value": "06",
      "note": "企业资质与虚拟企业申请混合待处理。"
    }
  ],
  "recommendedTalents": [
    {
      "slug": "lin-zhao",
      "name": "林昭",
      "role": "全栈产品工程师",
      "score": "4.9",
      "tags": ["Vue 3", "Spring Boot", "AI 工作流"],
      "summary": "做过 18 个中后台与交易协作项目，擅长快速落地 MVP。"
    }
  ]
}
```

### 5.3 `GET /talent`

用途：

- 人才端工作台首页

请求参数：

无

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `hero` | `object` | 人才顶部摘要 |
| `skills` | `string[]` | 技能标签 |
| `portfolio` | `object[]` | 作品卡片 |
| `calendar` | `object[]` | 未来 7 天档期 |
| `marketplace` | `object[]` | 推荐任务摘要 |
| `activeTasks` | `object[]` | 进行中任务 |
| `messages` | `object[]` | 最近项目消息 |
| `evaluations` | `string[]` | 最近评价 |

`hero` 关键字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | `string` | 人才名称 |
| `role` | `string` | 人才定位 |
| `intro` | `string` | 简介 |
| `availability` | `string` | 本周档期摘要 |
| `score` | `string` | 综合评分 |
| `income` | `string` | 收入汇总 |

响应示例：

```json
{
  "hero": {
    "name": "陈一宁",
    "role": "AI 产品设计 + 全栈开发",
    "availability": "本周剩余可接单 4 天",
    "score": "4.9",
    "income": "￥86,400"
  },
  "calendar": [
    {
      "date": "2026-03-21",
      "day": "周六",
      "state": "open",
      "note": "可接新单"
    }
  ]
}
```

### 5.4 `GET /talent/calendar/{userId}`

用途：

- 获取指定人才未来 7 天档期

路径参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `userId` | `number` | 是 | 人才用户 ID |

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `userId` | `string` | 用户 ID |
| `summary` | `object` | 档期汇总 |
| `items` | `object[]` | 每日档期明细 |

`summary` 字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `range` | `string` | 日期范围 |
| `openDays` | `string` | 可接单天数 |
| `busyDays` | `string` | 忙碌天数 |
| `closedDays` | `string` | 暂停接单天数 |
| `headline` | `string` | 人才端顶部摘要 |

`items` 字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `date` | `string` | 日期 |
| `day` | `string` | 星期中文 |
| `state` | `string` | `open / busy / closed` |
| `note` | `string` | 说明 |

响应示例：

```json
{
  "userId": "2",
  "summary": {
    "range": "03/21 - 03/27",
    "openDays": "4",
    "busyDays": "2",
    "closedDays": "1",
    "headline": "本周剩余可接单 4 天"
  },
  "items": [
    {
      "date": "2026-03-24",
      "day": "周二",
      "state": "closed",
      "note": "封板日"
    }
  ]
}
```

### 5.5 `POST /talent/calendar`

用途：

- 更新某一天的接单状态

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `userId` | `number` | 是 | 人才用户 ID |
| `availableDate` | `string` | 是 | 日期，格式 `YYYY-MM-DD` |
| `availabilityStatus` | `string` | 是 | `OPEN / BUSY / CLOSED` |
| `note` | `string` | 否 | 档期备注 |

请求示例：

```json
{
  "userId": 2,
  "availableDate": "2026-03-24",
  "availabilityStatus": "CLOSED",
  "note": "封板日"
}
```

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `userId` | `string` | 人才用户 ID |
| `availableDate` | `string` | 更新日期 |
| `availabilityStatus` | `string` | 更新后的状态 |
| `state` | `string` | 页面状态值 |
| `note` | `string` | 备注 |
| `nextStep` | `string` | 下一步说明 |
| `calendar` | `object` | 更新后的 7 天日历 |

响应示例：

```json
{
  "userId": "2",
  "availableDate": "2026-03-24",
  "availabilityStatus": "CLOSED",
  "state": "closed",
  "note": "封板日",
  "nextStep": "档期已更新，后续任务匹配和人才展示会优先参考这份日历。"
}
```

### 5.6 `GET /tasks/marketplace`

用途：

- 人才端任务广场

请求参数：

无

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `summary` | `object` | 页面标题与说明 |
| `filters` | `string[]` | 筛选标签 |
| `metrics` | `object[]` | 广场指标 |
| `items` | `object[]` | 任务列表 |

`items` 关键字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `string` | 任务 ID |
| `title` | `string` | 任务标题 |
| `company` | `string` | 发布方 |
| `budget` | `string` | 预算 |
| `period` | `string` | 工期 |
| `match` | `string` | 匹配度 |
| `status` | `string` | 当前阶段 |
| `tags` | `string[]` | 任务标签 |
| `summary` | `string` | 任务摘要 |
| `deliverables` | `string[]` | 交付件 |

响应示例：

```json
{
  "summary": {
    "title": "任务广场",
    "description": "人才可以主动浏览任务，也可以等待系统按技能、档期和历史评分自动推荐。"
  },
  "filters": ["全部", "AI 产品", "前端开发", "品牌设计"],
  "items": [
    {
      "id": "task-001",
      "title": "AI 招聘 H5 首版",
      "company": "星河智能",
      "budget": "￥18k - ￥28k",
      "period": "3 周",
      "match": "92%",
      "status": "推荐中",
      "tags": ["Vue 3", "H5", "现代感", "任务协作"],
      "summary": "需要同时覆盖前台 H5/PC 与管理后台首版体验，强调任务闭环和 AI 拆解能力。",
      "deliverables": ["首页与角色工作台", "任务协作区", "管理后台骨架"]
    }
  ]
}
```

### 5.7 `GET /talents/marketplace`

用途：

- 企业端人才广场

请求参数：

无

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `summary` | `object` | 页面标题与描述 |
| `filters` | `string[]` | 筛选项 |
| `metrics` | `object[]` | 人才广场指标 |
| `items` | `object[]` | 人才列表 |

`items` 关键字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `slug` | `string` | 人才详情 slug |
| `name` | `string` | 姓名 |
| `role` | `string` | 定位 |
| `location` | `string` | 城市 |
| `score` | `string` | 评分 |
| `responseTime` | `string` | 响应速度 |
| `summary` | `string` | 简介摘要 |
| `tags` | `string[]` | 技能标签 |
| `services` | `string[]` | 合作方式 |
| `portfolio` | `string` | 作品摘要 |

响应示例：

```json
{
  "summary": {
    "title": "人才广场",
    "description": "企业和个人品牌方可以在这里查看人才的专长、作品、评分、响应速度和近期档期。"
  },
  "filters": ["产品研发", "设计创意", "AI 顾问", "近期可接单"],
  "items": [
    {
      "slug": "chen-yining",
      "name": "陈一宁",
      "role": "AI 产品设计 + 全栈开发",
      "location": "上海",
      "score": "4.9",
      "responseTime": "8 分钟",
      "summary": "擅长把复杂业务拆成用户能理解、团队能交付的产品方案，适合从需求梳理到交付验收的端到端协作。",
      "tags": ["Vue 3", "Java API", "任务协作", "多端产品"],
      "services": ["产品方案设计", "前后端协作", "交付流程梳理"],
      "portfolio": "AI 简历诊断平台 / 创作者任务协作台"
    }
  ]
}
```

### 5.8 `GET /talents/{slug}`

用途：

- 企业端查看人才详情
- 人才端查看自己的对外名片

路径参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `slug` | `string` | 是 | 人才 slug |

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `slug` | `string` | 标识 |
| `name` | `string` | 姓名 |
| `role` | `string` | 职业定位 |
| `location` | `string` | 所在地 |
| `score` | `string` | 综合评分 |
| `completionRate` | `string` | 完工率 |
| `responseTime` | `string` | 平均响应时间 |
| `intro` | `string` | 简介 |
| `headlineTags` | `string[]` | 标签 |
| `strengths` | `string[]` | 核心优势 |
| `services` | `string[]` | 服务边界 |
| `portfolio` | `object[]` | 作品列表 |
| `reviews` | `object[]` | 历史评价 |
| `availability` | `string[]` | 合作档期 |
| `process` | `string[]` | 协作流程 |

响应示例：

```json
{
  "slug": "chen-yining",
  "name": "陈一宁",
  "role": "AI 产品设计 + 全栈开发",
  "location": "上海",
  "score": "4.9",
  "completionRate": "96%",
  "responseTime": "8 分钟",
  "headlineTags": ["Vue 3", "Java API", "任务协作", "AI Agent", "多端产品"],
  "services": ["AI 产品 MVP 设计与开发", "多端协作平台", "后台管理系统设计与实现"],
  "availability": ["本周剩余可接单 3 天", "下周适合承接 2-4 周的产品 MVP"]
}
```

### 5.9 `GET /workspace`

用途：

- 协作空间页

请求参数：

无

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `summary` | `object` | 当前任务概览 |
| `pulse` | `object[]` | 脉冲指标 |
| `milestones` | `object[]` | 里程碑 |
| `progressFeed` | `object[]` | 进度流 |
| `assetLibrary` | `object[]` | 资产库 |
| `aiReviewHistory` | `object[]` | AI 巡检记录 |
| `reviewHistory` | `object[]` | 互评历史 |
| `acceptance` | `string[]` | 验收提示 |

响应示例：

```json
{
  "summary": {
    "taskName": "AI 人才市场 MVP 交付",
    "business": "星河智能",
    "talent": "陈一宁",
    "range": "03/18 - 04/08",
    "status": "协作中"
  },
  "pulse": [
    {
      "label": "整体完成度",
      "value": "68%",
      "note": "核心路径已闭环，正在补交付历史与验收沉淀。"
    }
  ],
  "acceptance": [
    "确认交付件：页面、API、SQL 结构、说明文档",
    "确认可演示流程：入驻 -> AI 拆单 -> 匹配 -> 协作 -> 验收"
  ]
}
```

### 5.10 `GET /tasks/{taskId}/closure`

用途：

- 验收评分页闭环数据

路径参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `taskId` | `string` | 是 | 任务 ID，如 `task-001` |

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `summary` | `object` | 任务验收摘要 |
| `metrics` | `object[]` | 验收指标 |
| `timeline` | `object[]` | 验收时间线 |
| `reviewSummary` | `string[]` | 评分摘要 |
| `reviewHistory` | `object[]` | 历史评分 |
| `creditImpact` | `object[]` | 信用影响 |

响应示例：

```json
{
  "summary": {
    "taskId": "task-001",
    "title": "AI 人才市场 MVP 交付",
    "status": "待双方评分闭环",
    "acceptedAt": "04/08 18:20"
  },
  "metrics": [
    {
      "label": "交付完成度",
      "value": "100%",
      "note": "页面、API、SQL 与核心文档均已核对。"
    }
  ],
  "creditImpact": [
    {
      "title": "人才信用画像",
      "note": "新增“交付稳健”“文档完整”标签，推荐权重上调。"
    }
  ]
}
```

### 5.11 `POST /ai/decompose`

用途：

- 企业端输入任务描述后，生成 AI 拆解结果

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `brief` | `string` | 是 | 原始任务描述 |

请求示例：

```json
{
  "brief": "支持任务发布、人才匹配、项目沟通和进度协作，第一阶段先完成核心交付闭环。"
}
```

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `originalBrief` | `string` | 原始需求 |
| `modules` | `object[]` | 拆解模块 |
| `schedule` | `object` | 工期估算 |
| `tags` | `string[]` | 推荐技能标签 |
| `recommendations` | `string[]` | 建议 |

响应示例：

```json
{
  "originalBrief": "支持任务发布、人才匹配、项目沟通和进度协作，第一阶段先完成核心交付闭环。",
  "modules": [
    {
      "name": "任务闭环",
      "duration": "4 天",
      "output": "发布、AI 拆解、确认、匹配、协作、验收流程"
    }
  ],
  "schedule": {
    "total": "12 个开发日",
    "risk": "实时沟通与附件同步建议作为协作主线优先设计。"
  },
  "tags": ["Vue 3", "Java API", "SQL 建模", "AI 拆单", "项目沟通"]
}
```

### 5.12 公共展示接口前端联调顺序

建议前端按下面顺序接这组接口：

1. `GET /landing`
用途：先把官网首页和角色入口搭起来。

2. `GET /business` + `GET /talent`
用途：分别补企业端工作台首页和人才端工作台首页。

3. `GET /talents/marketplace` + `GET /talents/{slug}`
用途：先完成企业端“看人才 -> 看人才详情”。

4. `GET /tasks/marketplace`
用途：再完成人才端“看任务广场”。

5. `GET /workspace` + `GET /tasks/{taskId}/closure`
用途：补协作空间和验收评分闭环页。

6. `GET /talent/calendar/{userId}` + `POST /talent/calendar`
用途：最后补人才端日历查看与编辑。

7. `POST /ai/decompose`
用途：接企业端任务发布页的 AI 拆解能力。

### 5.13 公共展示接口后端实现状态

- root mock API：这组接口都已可本地联调。
- `spring-app`：
  - `landing / business / talent / tasks/marketplace / talents/marketplace / talents/{slug} / workspace` 已推进到“数据库优先 + fallback”
  - `talent/calendar` 已有真实读写服务
  - `tasks/{taskId}/closure` 已有应用层读取能力，但仍建议继续核对最终字段和 MySQL 模型的一致性
  - `ai/decompose` 当前仍以 mock / 规则返回为主，后续可切真实模型服务

## 6. 入驻接口

### 6.1 `GET /onboarding/checklists`

用途：

- 获取企业端和人才端入驻准备清单

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `business` | `string[]` | 企业端入驻清单 |
| `talent` | `string[]` | 人才端入驻清单 |

响应示例：

```json
{
  "business": ["上传营业执照或企业证明", "补充联系人与合作偏好", "等待后台审核通过后再发布任务"],
  "talent": ["填写简介、技能和作品", "设置接单日历", "若申请虚拟企业则补身份证等实名材料"]
}
```

### 6.2 `POST /onboarding/business`

用途：

- 企业或虚拟企业提交入驻申请

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `organizationName` | `string` | 是 | 企业名称 |
| `contactName` | `string` | 是 | 联系人 |
| `contactMobile` | `string` | 是 | 联系电话 |
| `materials` | `string[]` | 是 | 材料列表，可填 URL 或人工占位 |
| `virtualCompany` | `boolean` | 是 | 是否虚拟企业 |

请求示例：

```json
{
  "organizationName": "星河智能",
  "contactName": "王晴",
  "contactMobile": "13800000001",
  "materials": ["营业执照", "品牌授权书"],
  "virtualCompany": false
}
```

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `organizationId` | `number` | 组织 ID |
| `userId` | `number` | 用户 ID |
| `organizationName` | `string` | 企业名称 |
| `contactName` | `string` | 联系人 |
| `contactMobile` | `string` | 联系方式 |
| `virtualCompany` | `boolean` | 是否虚拟企业 |
| `materials` | `string[]` | 提交材料 |
| `status` | `string` | 当前状态 |
| `nextStep` | `string` | 下一步说明 |

说明：

- 当前 root mock API 已验证返回 `organizationName / contactName / contactMobile / status / nextStep`
- `organizationId / userId / materials / virtualCompany` 建议作为 `spring-app` 正式服务补齐字段

响应示例：

```json
{
  "organizationName": "星河智能",
  "contactName": "王晴",
  "contactMobile": "13800000001",
  "status": "PENDING_REVIEW",
  "nextStep": "后台审核企业材料，审核通过后开放发布任务权限。"
}
```

### 6.3 `POST /onboarding/talent`

用途：

- 人才提交入驻申请

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `displayName` | `string` | 是 | 展示名称 |
| `headline` | `string` | 是 | 个人定位 |
| `skills` | `string[]` | 是 | 技能列表 |
| `portfolioUrls` | `string[]` | 是 | 作品地址或作品说明 |
| `applyVirtualCompany` | `boolean` | 是 | 是否申请虚拟企业 |

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `userId` | `number` | 用户 ID |
| `displayName` | `string` | 展示名 |
| `headline` | `string` | 定位 |
| `skills` | `string[]` | 技能 |
| `portfolioUrls` | `string[]` | 作品 |
| `applyVirtualCompany` | `boolean` | 是否申请虚拟企业 |
| `status` | `string` | 当前状态 |
| `nextStep` | `string` | 下一步说明 |

说明：

- 当前 root mock API 已验证返回 `displayName / headline / status / nextStep`
- `userId / skills / portfolioUrls / applyVirtualCompany` 建议作为正式服务稳定返回

请求示例：

```json
{
  "displayName": "陈一宁",
  "headline": "AI 产品设计 + 全栈开发",
  "skills": ["Vue 3", "Java", "MySQL"],
  "portfolioUrls": ["作品集链接 A", "作品集链接 B"],
  "applyVirtualCompany": true
}
```

响应示例：

```json
{
  "displayName": "陈一宁",
  "headline": "AI 产品设计 + 全栈开发",
  "status": "PENDING_REVIEW",
  "nextStep": "平台将校验作品与实名材料，审核通过后开放接单和推荐资格。"
}
```

### 6.4 入驻接口前端联调顺序

建议前端按下面顺序接这组接口：

1. `GET /onboarding/checklists`
用途：先把企业端和人才端的入驻说明页接起来。

2. `POST /onboarding/business`
用途：接企业端或虚拟企业提交入驻申请。

3. `POST /onboarding/talent`
用途：接人才端提交资料、作品和虚拟企业申请。

建议页面顺序：

- 企业端：入驻说明 -> 企业表单 -> 提交完成页
- 人才端：入驻说明 -> 人才表单 -> 档期设置 / 等待审核页

### 6.5 入驻接口后端实现状态

- root mock API：已可联调，但返回字段偏精简。
- `spring-app`：入驻主链已接 JPA / Repository，可作为后续真实服务基础。
- 当前仍建议继续补：
  - 材料文件上传
  - 身份证 / 企业材料字段结构化
  - 审核状态枚举与驳回原因标准化

## 7. 管理后台接口

### 7.1 `GET /admin/dashboard`

用途：

- 经营看板首页

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `stats` | `object[]` | 顶部统计 |
| `queues` | `object[]` | 待处理队列 |
| `alerts` | `object[]` | 风险提醒 |
| `activities` | `object[]` | 最近动作 |

响应示例：

```json
{
  "stats": [
    {
      "label": "平台总用户",
      "value": "12,480",
      "note": "含 B 端、C 端与管理员账号。"
    }
  ],
  "queues": [
    {
      "title": "企业认证资料审核",
      "owner": "审核组 A",
      "amount": "32 单"
    }
  ]
}
```

### 7.2 `GET /admin/users`

用途：

- 用户管理
- 审核队列

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `summary` | `object[]` | 用户统计 |
| `items` | `object[]` | 用户列表 |
| `reviewQueue` | `object[]` | 审核队列 |

响应示例：

```json
{
  "items": [
    {
      "name": "星河智能",
      "type": "企业",
      "status": "已认证",
      "role": "B 端",
      "contact": "王晴"
    }
  ],
  "reviewQueue": [
    {
      "id": "review-biz-001",
      "subject": "叶舟工作室",
      "type": "虚拟企业",
      "status": "待初审"
    }
  ]
}
```

### 7.3 `POST /admin/users/drafts`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | `string` | 是 | 名称 |
| `type` | `string` | 是 | 企业 / 虚拟企业 / 人才 |
| `role` | `string` | 是 | 企业端 / 人才端 |
| `contact` | `string` | 是 | 联系方式 |

响应示例：

```json
{
  "name": "新企业草稿",
  "type": "企业",
  "status": "草稿已创建",
  "role": "B 端",
  "contact": "13800000009"
}
```

### 7.4 `POST /admin/reviews/{reviewId}/decision`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `decision` | `string` | 是 | 通过 / 补资料 / 冻结观察 |
| `note` | `string` | 否 | 备注 |

响应示例：

```json
{
  "reviewId": "review-biz-001",
  "decision": "通过",
  "status": "已通过",
  "note": "材料齐全，准予放行。",
  "nextStep": "审核结果已记录到用户资料流转中。"
}
```

### 7.5 `GET /admin/tasks`

用途：

- 任务列表
- 阶段流转队列

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `summary` | `object[]` | 任务统计 |
| `items` | `object[]` | 任务列表 |
| `actionQueue` | `object[]` | 操作队列 |

响应示例：

```json
{
  "items": [
    {
      "title": "AI 招聘 H5 首版",
      "stage": "协作中",
      "budget": "￥26,000",
      "owner": "星河智能",
      "talent": "陈一宁"
    }
  ],
  "actionQueue": [
    {
      "id": "task-001",
      "title": "AI 招聘 H5 首版",
      "stage": "协作中",
      "risk": "低风险"
    }
  ]
}
```

### 7.6 `POST /admin/tasks/drafts`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | `string` | 是 | 任务标题 |
| `stage` | `string` | 是 | 初始阶段 |
| `budget` | `string` | 是 | 预算显示值 |
| `owner` | `string` | 是 | 归属方 |
| `talent` | `string` | 否 | 人才 |

响应示例：

```json
{
  "title": "管理员代建任务",
  "stage": "待确认",
  "budget": "￥20,000",
  "owner": "平台运营",
  "talent": "待选择"
}
```

### 7.7 `POST /admin/tasks/{taskId}/transition`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `stage` | `string` | 是 | 目标阶段 |
| `note` | `string` | 否 | 备注 |

响应示例：

```json
{
  "taskId": "task-002",
  "stage": "协作中",
  "note": "候选人才已确认，进入执行阶段。",
  "nextStep": "任务阶段已更新，后续会同步影响推荐和协作流程。"
}
```

### 7.8 `GET /admin/compliance`

用途：

- 审核风控页

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `summary` | `object[]` | 概览统计 |
| `checks` | `object[]` | 合规检查项 |
| `riskTickets` | `object[]` | 风险工单列表 |
| `deliveryBoard` | `object[]` | 交付开发板 |

响应示例：

```json
{
  "summary": [
    {
      "label": "证件待复核",
      "value": "29",
      "note": "包括证件模糊、字段不一致等问题。"
    }
  ],
  "riskTickets": [
    {
      "id": "risk-001",
      "title": "高价值任务延期风险",
      "severity": "P1",
      "status": "待处理"
    }
  ]
}
```

### 7.9 `POST /admin/risk-tickets/{ticketId}/status`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `status` | `string` | 是 | 处理中 / 已解决 / 已升级 / 冻结观察 |
| `note` | `string` | 否 | 备注 |

响应示例：

```json
{
  "ticketId": "risk-001",
  "status": "处理中",
  "note": "已通知任务运营确认是否调整工期。",
  "nextStep": "风控工单状态已更新。"
}
```

### 7.10 管理后台接口前端联调顺序

建议后台前端按下面顺序接这组接口：

1. `GET /admin/dashboard`
用途：先把经营看板搭起来，方便验证数据面板结构。

2. `GET /admin/users`
用途：接用户列表和审核队列。

3. `POST /admin/users/drafts` + `POST /admin/reviews/{reviewId}/decision`
用途：接“创建草稿”和“审核处理”动作。

4. `GET /admin/tasks`
用途：接任务列表和阶段流转队列。

5. `POST /admin/tasks/drafts` + `POST /admin/tasks/{taskId}/transition`
用途：接任务代建和阶段推进。

6. `GET /admin/compliance` + `POST /admin/risk-tickets/{ticketId}/status`
用途：最后接风控工单处理与交付开发板。

### 7.11 管理后台接口后端实现状态

- root mock API：后台所有核心列表和操作接口都已可演示联调。
- `spring-app`：后台管理是当前最完整的一块，已接实体、仓储和管理员动作日志。
- 后续建议继续补：
  - 分页、筛选、搜索参数
  - 管理员鉴权与角色权限
  - 审核动作审计日志查询接口

## 8. 任务生命周期接口

### 8.1 `POST /tasks/publish`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `publisherUserId` | `number` | 是 | 发布人 ID |
| `organizationId` | `number` | 否 | 组织 ID |
| `title` | `string` | 是 | 任务标题 |
| `brief` | `string` | 是 | 原始需求 |
| `source` | `string` | 是 | `TEXT / VOICE` |

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | `string` | 任务 ID |
| `publisherUserId` | `number` | 发布人 ID |
| `organizationId` | `number` | 组织 ID |
| `title` | `string` | 标题 |
| `brief` | `string` | 需求 |
| `source` | `string` | 来源 |
| `status` | `string` | 当前状态 |
| `nextStep` | `string` | 下一步 |

请求示例：

```json
{
  "publisherUserId": 1,
  "organizationId": 1,
  "title": "AI 招聘 H5 首版",
  "brief": "支持任务发布、人才匹配、项目沟通和进度协作，第一阶段先完成核心交付闭环。",
  "source": "TEXT"
}
```

响应示例：

```json
{
  "taskId": "task-20260321-publish",
  "publisherUserId": "1",
  "organizationId": "1",
  "title": "AI 招聘 H5 首版",
  "status": "AI_ANALYZING",
  "nextStep": "任务已进入 AI 拆解阶段，等待 B 端确认模块和工期。"
}
```

### 8.2 `POST /tasks/{taskId}/analysis/confirm`

用途：

- 企业端确认 AI 拆解

请求体：

无

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | `string` | 任务 ID |
| `status` | `string` | `MATCHING` |
| `nextStep` | `string` | 下一步 |

响应示例：

```json
{
  "taskId": "task-001",
  "status": "MATCHING",
  "nextStep": "AI 分析已确认，平台开始按技能、评分和档期匹配人才。"
}
```

### 8.3 `POST /tasks/{taskId}/assignments/select`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `talentUserId` | `number` | 是 | 被选中的人才 ID |

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | `string` | 任务 ID |
| `talentUserId` | `number` | 人才 ID |
| `status` | `string` | `NEGOTIATING` |
| `imRoomPlanned` | `boolean` | 是否计划创建任务房间 |
| `nextStep` | `string` | 下一步 |

请求示例：

```json
{
  "talentUserId": 2
}
```

响应示例：

```json
{
  "taskId": "task-001",
  "talentUserId": "2",
  "status": "NEGOTIATING",
  "imRoomPlanned": true,
  "nextStep": "候选人才已选定，进入需求与工期协商阶段。"
}
```

### 8.4 `POST /tasks/{taskId}/negotiations/confirm`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `businessUserId` | `number` | 是 | 企业端用户 ID |
| `talentUserId` | `number` | 是 | 人才用户 ID |
| `requirementConfirmed` | `boolean` | 是 | 是否确认需求 |
| `scheduleConfirmed` | `boolean` | 是 | 是否确认工期 |
| `agreementNote` | `string` | 是 | 协商说明 |

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | `string` | 任务 ID |
| `businessUserId` | `number` | 企业端用户 ID |
| `talentUserId` | `number` | 人才用户 ID |
| `requirementConfirmed` | `boolean` | 需求确认状态 |
| `scheduleConfirmed` | `boolean` | 工期确认状态 |
| `agreementNote` | `string` | 协商说明 |
| `status` | `string` | `NEGOTIATING / IN_PROGRESS` |
| `nextStep` | `string` | 下一步 |

说明：

- 当前 root mock API 已验证返回 `taskId / businessUserId / talentUserId / agreementNote / status / nextStep`
- `requirementConfirmed / scheduleConfirmed` 建议在正式服务中稳定回显

请求示例：

```json
{
  "businessUserId": 1,
  "talentUserId": 2,
  "requirementConfirmed": true,
  "scheduleConfirmed": true,
  "agreementNote": "按 3 周 MVP 节奏推进，支付能力放到第二阶段。"
}
```

响应示例：

```json
{
  "taskId": "task-001",
  "businessUserId": "1",
  "talentUserId": "2",
  "agreementNote": "按 3 周 MVP 节奏推进，支付能力放到第二阶段。",
  "status": "IN_PROGRESS",
  "nextStep": "若双方均确认，则正式进入执行阶段并创建任务房间。"
}
```

### 8.5 `POST /tasks/{taskId}/progress`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `submitterUserId` | `number` | 是 | 提交人 |
| `milestoneId` | `number` | 否 | 里程碑 ID |
| `progressText` | `string` | 是 | 进度说明 |
| `completionPercent` | `number` | 是 | 0-100 |
| `files` | `string[]` | 否 | 附件列表，当前可传 URL 或文件标识 |

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | `string` | 任务 ID |
| `submitterUserId` | `number` | 提交人 |
| `milestoneId` | `number` | 里程碑 ID |
| `completionPercent` | `number` | 完成度 |
| `files` | `string[]` | 附件列表 |
| `status` | `string` | `AI_REVIEW_PENDING` |
| `nextStep` | `string` | 下一步 |

说明：

- 当前 root mock API 已验证返回 `taskId / submitterUserId / progressText / completionPercent / status / nextStep`
- `milestoneId / files` 建议在正式服务中稳定回显

请求示例：

```json
{
  "submitterUserId": 2,
  "milestoneId": 1,
  "progressText": "首页与角色分流页面已完成，正在联调任务发布与人才广场。",
  "completionPercent": 65,
  "files": ["https://example.com/demo.mp4", "https://example.com/spec.pdf"]
}
```

响应示例：

```json
{
  "taskId": "task-001",
  "submitterUserId": "2",
  "progressText": "首页与角色分流页面已完成，正在联调任务发布与人才广场。",
  "completionPercent": "65",
  "status": "AI_REVIEW_PENDING",
  "nextStep": "进度已提交，AI 将生成审查建议并提醒 B 端查看。"
}
```

### 8.6 `GET /tasks/{taskId}/closure`

用途：

- 获取验收闭环

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `summary` | `object` | 概览 |
| `metrics` | `object[]` | 指标 |
| `timeline` | `object[]` | 时间线 |
| `reviewSummary` | `string[]` | 评分摘要 |
| `reviewHistory` | `object[]` | 评分历史 |
| `creditImpact` | `object[]` | 信用影响 |

响应示例：

```json
{
  "summary": {
    "taskId": "task-001",
    "title": "AI 人才市场 MVP 交付",
    "status": "待双方评分闭环"
  },
  "timeline": [
    {
      "title": "AI 提醒发起验收",
      "status": "已完成",
      "time": "04/08 17:20"
    }
  ]
}
```

### 8.7 `POST /tasks/{taskId}/acceptance`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `accepterUserId` | `number` | 是 | 验收发起人 |
| `acceptanceNote` | `string` | 是 | 验收说明 |

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | `string` | 任务 ID |
| `accepterUserId` | `number` | 验收人 |
| `acceptanceNote` | `string` | 验收说明 |
| `status` | `string` | `ACCEPTED` |
| `nextStep` | `string` | 下一步 |

请求示例：

```json
{
  "accepterUserId": 1,
  "acceptanceNote": "首版闭环已跑通，同意进入验收和评分。"
}
```

响应示例：

```json
{
  "taskId": "task-001",
  "accepterUserId": "1",
  "acceptanceNote": "首版闭环已跑通，同意进入验收和评分。",
  "status": "ACCEPTED",
  "nextStep": "验收完成，进入双方评分和信用画像沉淀。"
}
```

### 8.8 `POST /tasks/{taskId}/reviews`

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `reviewerUserId` | `number` | 是 | 评价人 |
| `revieweeUserId` | `number` | 是 | 被评价人 |
| `rating` | `number` | 是 | 1-5 |
| `reviewContent` | `string` | 是 | 评价内容 |

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | `string` | 任务 ID |
| `reviewerUserId` | `number` | 评价人 |
| `revieweeUserId` | `number` | 被评价人 |
| `rating` | `number / string` | 分值 |
| `reviewContent` | `string` | 评价内容 |
| `status` | `string` | `RECORDED` |
| `nextStep` | `string` | 下一步 |

请求示例：

```json
{
  "reviewerUserId": 1,
  "revieweeUserId": 2,
  "rating": 5,
  "reviewContent": "沟通清楚、进度同步及时，交付完整。"
}
```

响应示例：

```json
{
  "taskId": "task-001",
  "reviewerUserId": "1",
  "revieweeUserId": "2",
  "rating": "5",
  "reviewContent": "沟通清楚、进度同步及时，交付完整。",
  "status": "RECORDED",
  "nextStep": "评分已写入平台信用画像与后续推荐逻辑。"
}
```

### 8.9 任务生命周期接口前端联调顺序

这组接口建议严格按业务顺序联调：

1. `POST /tasks/publish`
用途：企业端先发布任务。

2. `POST /ai/decompose`
用途：让企业端先看到 AI 拆解建议。

3. `POST /tasks/{taskId}/analysis/confirm`
用途：企业端确认拆解，任务进入匹配。

4. `POST /tasks/{taskId}/assignments/select`
用途：企业端从人才广场选择合作对象。

5. `POST /tasks/{taskId}/negotiations/confirm`
用途：双方确认需求和工期。

6. `GET /messages/task-room`
用途：进入项目沟通房间预览。

7. `POST /tasks/{taskId}/progress`
用途：人才端提交进度和附件。

8. `GET /workspace`
用途：企业端 / 人才端查看协作空间和 AI 巡检结果。

9. `POST /tasks/{taskId}/acceptance`
用途：B 端发起验收。

10. `GET /tasks/{taskId}/closure`
用途：查看验收闭环与评分摘要。

11. `POST /tasks/{taskId}/reviews`
用途：双方互评并沉淀信用画像。

### 8.10 任务生命周期接口后端实现状态

- root mock API：主链路已完整可演示。
- `spring-app`：
  - 任务发布、确认、选人、协商、进度、验收、评分已进入真实持久化实现范围
  - 验收闭环读取能力已补齐，但仍建议继续校对最终 DTO 与页面字段需求
- 后续建议继续补：
  - 文件上传正式接口与附件表
  - 幂等键、防重复提交
  - AI 进度审查的真实模型接入

## 9. IM 接口

### 9.1 `GET /im/tencent/config`

用途：

- 获取腾讯 IM 平台配置说明

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `provider` | `string` | 固定为 `Tencent IM` |
| `status` | `string` | 接入状态 |
| `recommendedScope` | `string[]` | 推荐接入范围 |
| `notes` | `string[]` | 说明 |

响应示例：

```json
{
  "provider": "Tencent IM",
  "status": "planned",
  "recommendedScope": ["单聊", "任务群聊", "历史消息回溯", "离线推送", "系统消息"],
  "notes": [
    "任务接受后自动创建任务房间",
    "房间 ID 与 task_id 绑定，消息摘要回写平台任务页"
  ]
}
```

### 9.2 `GET /messages/task-room`

用途：

- 获取任务房间预览

查询参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| `taskId` | `string` | 否 | `task-001` | 任务 ID |

主要响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | `string` | 任务 ID |
| `provider` | `string` | IM 提供方 |
| `roomId` | `string` | 房间 ID |
| `participants` | `string[]` | 参与者 |
| `messages` | `object[]` | 消息预览 |

`messages` 字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `author` | `string` | 发送者 |
| `type` | `string` | `TEXT / SYSTEM` |
| `text` | `string` | 消息内容 |

响应示例：

```json
{
  "taskId": "task-001",
  "provider": "Tencent IM",
  "roomId": "group_task_001",
  "participants": ["星河智能", "陈一宁", "AI 系统消息"],
  "messages": [
    {
      "author": "系统消息",
      "type": "SYSTEM",
      "text": "任务房间已创建，可在此同步需求确认与阶段进展。"
    }
  ]
}
```

### 9.3 `POST /tencent-im/callback/events`

用途：

- 接收腾讯 IM 事件回调

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `eventType` | `string` | 是 | 事件类型 |
| `taskId` | `string` | 是 | 任务 ID |
| `payload` | `object` | 否 | 回调原始载荷 |

请求示例：

```json
{
  "eventType": "GROUP.CREATED",
  "taskId": "task-001",
  "payload": {
    "roomId": "group_task_001"
  }
}
```

响应示例：

```json
{
  "category": "EVENT",
  "eventType": "GROUP.CREATED",
  "taskId": "task-001",
  "status": "RECEIVED",
  "nextStep": "平台会将消息摘要或事件状态写回任务工作区。"
}
```

### 9.4 `POST /tencent-im/callback/messages`

用途：

- 接收腾讯 IM 消息回调

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `eventType` | `string` | 是 | 消息事件类型 |
| `taskId` | `string` | 是 | 任务 ID |
| `payload` | `object` | 否 | 消息载荷 |

请求示例：

```json
{
  "eventType": "MESSAGE.SEND",
  "taskId": "task-001",
  "payload": {
    "from": "biz-001"
  }
}
```

响应示例：

```json
{
  "category": "MESSAGE",
  "eventType": "MESSAGE.SEND",
  "taskId": "task-001",
  "status": "RECEIVED",
  "nextStep": "平台会将消息摘要或事件状态写回任务工作区。"
}
```

### 9.5 IM 接口前端联调顺序

IM 这组接口不要单独当成后台模块来接，而应放在企业端 / 人才端协作链里联调：

1. `GET /messages/task-room`
用途：先把 B/C 协作中的任务房间页接起来。

2. `GET /im/tencent/config`
用途：仅用于开发和配置确认，不建议直接暴露给普通用户作为功能入口。

3. `POST /tencent-im/callback/events` + `POST /tencent-im/callback/messages`
用途：这两条主要给后端和第三方联调，不属于前台用户主动调用接口。

### 9.6 IM 接口后端实现状态

- root mock API：已具备任务房间预览和回调接收演示能力。
- `spring-app`：
  - 已有 IM 配置读取和任务房间预览服务
  - 已有腾讯 IM 回调控制器入口
- 当前仍需继续补：
  - 腾讯 IM 正式 SDK / REST 接入
  - 回调签名校验
  - 消息回写数据库与未读态
  - 离线提醒与多端同步策略

## 10. 当前前后端联调最常用接口

前台常用：

1. `GET /landing`
2. `GET /business`
3. `GET /talent`
4. `GET /tasks/marketplace`
5. `GET /talents/marketplace`
6. `GET /talents/{slug}`
7. `GET /workspace`
8. `GET /tasks/{taskId}/closure`
9. `POST /ai/decompose`

业务主链常用：

1. `POST /onboarding/business`
2. `POST /onboarding/talent`
3. `POST /tasks/publish`
4. `POST /tasks/{taskId}/analysis/confirm`
5. `POST /tasks/{taskId}/assignments/select`
6. `POST /tasks/{taskId}/negotiations/confirm`
7. `POST /tasks/{taskId}/progress`
8. `POST /tasks/{taskId}/acceptance`
9. `POST /tasks/{taskId}/reviews`

## 11. 还没完全定稿的接口约束

以下内容当前仍处于开发版约定，后续建议继续收口：

- 正式鉴权 header
- 统一错误响应结构
- 文件上传正式接口
- 腾讯 IM 回调签名校验
- 幂等键与重复提交策略
- 分页、排序、筛选参数规范

## 12. 后续迁移约束

- 路径尽量保持不变
- `frontend` 与 `admin` 尽量不感知后端从 mock API 切到 Spring Boot
- DTO 字段命名尽量保持当前契约
- 腾讯 IM 接入后，任务、验收、评分仍以平台数据库为准

## 13. 接口版本与字段变更规则

### 13.1 当前版本策略

当前项目仍处于开发版，接口路径统一保持在：

```text
/api/*
```

当前不额外引入 `/v1`、`/v2` 路径前缀，原因是：

- 现在仍在快速收敛 MVP 主链
- 前端、mock API、`spring-app` 都需要保持同一套路径
- 当前更需要先稳定字段和业务状态，而不是先切多版本

后续如果正式上线并开始出现不兼容改动，建议采用：

- 路径版本：`/api/v1/*`
- 保持 `/api/*` 在迁移期短暂兼容后再收口

### 13.2 允许的兼容性变更

以下变更默认视为兼容：

- 新增非必填字段
- 新增非必填对象节点
- 新增数组项里的可选字段
- 新增状态说明字段、提示字段、摘要字段
- 新增不影响旧逻辑的查询参数

### 13.3 不允许直接发生的变更

以下变更如果要做，必须先更新文档并同步前后端：

- 直接删除已有字段
- 修改字段名称
- 修改字段类型
- 修改状态枚举的含义
- 修改接口路径
- 把可空字段改成必填字段

### 13.4 状态枚举变更规则

状态字段最容易在联调时出问题，建议统一遵守：

- 可以新增状态，但新增前先更新文档
- 不要复用旧状态表达新含义
- 页面展示态和后端业务态要区分清楚
- 如果状态需要废弃，先保留兼容映射，不要直接删除

例如：

- 业务态：`OPEN / BUSY / CLOSED`
- 展示态：`open / busy / closed`

### 13.5 字段变更的同步顺序

任何核心字段调整，建议按下面顺序推进：

1. 先改 [API 详细契约文档](2026-03-21-api-contract.md)
2. 再改 SQL / Entity / DTO
3. 再改 `spring-app`
4. 再改 root mock API
5. 最后改 `frontend` / `admin`

这样可以避免“文档没改、代码先改”导致的联调漂移。

### 13.6 废弃策略

如果后续要废弃接口或字段，建议至少经过三步：

1. 在文档中标记 `Deprecated`
2. 给出替代字段 / 替代接口
3. 至少保留一个完整迭代周期再删除

建议在废弃说明里至少写清楚：

- 从哪个版本开始不推荐使用
- 用什么替代
- 最晚什么时候移除

## 14. 文件上传接口草案

说明：

- 这一组接口是“推荐正式方案”
- 当前 root mock API 尚未实现
- 当前 `spring-app` 已有 `task_files` 实体和相关读写基础，但缺正式上传服务
- 在正式上传接口完成前，`POST /tasks/{taskId}/progress` 的 `files` 字段仍可临时传 URL / 文件标识

### 14.1 设计目标

文件上传这组接口主要为以下场景服务：

- 人才端上传进度附件
- 企业端补充需求资料
- 协作空间展示图片、视频、代码包、文档
- 后续对象存储和平台附件索引解耦

设计原则：

- 文件内容尽量直传对象存储
- 平台只负责签发上传凭证、保存附件索引和业务绑定
- 附件状态仍以平台数据库为准

### 14.2 推荐上传流程

建议按 3 步走：

1. 前端调用 `POST /uploads/presign`
用途：向平台申请上传凭证和对象存储目标位置。

2. 前端把文件直传对象存储
用途：减少 API 服务的流量压力。

3. 前端调用 `POST /tasks/{taskId}/files`
用途：把上传完成的文件登记到任务附件索引里。

### 14.3 `POST /uploads/presign`

状态：

- 推荐接口
- 当前未在 root mock API / `spring-app` 中落地

用途：

- 申请上传凭证
- 统一生成对象存储 key

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `fileName` | `string` | 是 | 原始文件名 |
| `contentType` | `string` | 是 | MIME 类型 |
| `size` | `number` | 是 | 文件大小，单位字节 |
| `scene` | `string` | 是 | `TASK_PROGRESS / TASK_REQUIREMENT / CHAT_ATTACHMENT / PORTFOLIO` |
| `taskId` | `string` | 否 | 任务 ID，任务相关附件时传 |
| `uploaderUserId` | `number` | 是 | 上传人 |

请求示例：

```json
{
  "fileName": "demo.mp4",
  "contentType": "video/mp4",
  "size": 24800000,
  "scene": "TASK_PROGRESS",
  "taskId": "task-001",
  "uploaderUserId": 2
}
```

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `uploadId` | `string` | 上传会话 ID |
| `provider` | `string` | 对象存储提供方 |
| `method` | `string` | 上传方式，通常为 `PUT` |
| `uploadUrl` | `string` | 直传地址 |
| `objectKey` | `string` | 对象存储 key |
| `headers` | `object` | 直传需要的请求头 |
| `expireAt` | `string` | 过期时间 |

响应示例：

```json
{
  "uploadId": "upload-20260321-001",
  "provider": "OSS",
  "method": "PUT",
  "uploadUrl": "https://oss.example.com/youqinggong/task-001/demo.mp4?signature=***",
  "objectKey": "task-001/2026/03/demo.mp4",
  "headers": {
    "Content-Type": "video/mp4"
  },
  "expireAt": "2026-03-21T19:30:00+08:00"
}
```

### 14.4 `POST /tasks/{taskId}/files`

状态：

- 推荐接口
- 当前未在 root mock API / `spring-app` 中落地

用途：

- 在业务数据库中登记任务附件
- 让协作空间、验收页、AI 巡检都能引用同一份附件索引

路径参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `taskId` | `string` | 是 | 任务 ID |

请求体字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `uploaderUserId` | `number` | 是 | 上传人 |
| `uploadId` | `string` | 否 | 上传会话 ID |
| `name` | `string` | 是 | 展示文件名 |
| `fileType` | `string` | 是 | `image / video / code / document / archive / other` |
| `objectKey` | `string` | 是 | 对象存储 key |
| `url` | `string` | 是 | 可访问地址 |
| `size` | `number` | 否 | 文件大小 |
| `mimeType` | `string` | 否 | MIME 类型 |
| `source` | `string` | 否 | 来源，如 `TASK_PROGRESS` |

请求示例：

```json
{
  "uploaderUserId": 2,
  "uploadId": "upload-20260321-001",
  "name": "demo.mp4",
  "fileType": "video",
  "objectKey": "task-001/2026/03/demo.mp4",
  "url": "https://cdn.example.com/task-001/2026/03/demo.mp4",
  "size": 24800000,
  "mimeType": "video/mp4",
  "source": "TASK_PROGRESS"
}
```

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `fileId` | `string` | 附件 ID |
| `taskId` | `string` | 任务 ID |
| `name` | `string` | 文件名 |
| `fileType` | `string` | 附件类型 |
| `url` | `string` | 访问地址 |
| `status` | `string` | `INDEXED` |
| `nextStep` | `string` | 下一步说明 |

响应示例：

```json
{
  "fileId": "file-20260321-001",
  "taskId": "task-001",
  "name": "demo.mp4",
  "fileType": "video",
  "url": "https://cdn.example.com/task-001/2026/03/demo.mp4",
  "status": "INDEXED",
  "nextStep": "附件已登记到任务资产库，可在协作空间和验收页展示。"
}
```

### 14.5 `GET /tasks/{taskId}/files`

状态：

- 推荐接口
- 当前未在 root mock API / `spring-app` 中落地

用途：

- 获取任务附件列表
- 给协作空间、验收页、AI 巡检和后台审计共用

路径参数：

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `taskId` | `string` | 是 | 任务 ID |

响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `summary` | `object` | 附件摘要 |
| `items` | `object[]` | 附件列表 |

`items` 字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `fileId` | `string` | 附件 ID |
| `name` | `string` | 文件名 |
| `fileType` | `string` | 附件类型 |
| `size` | `string` | 展示用大小 |
| `status` | `string` | `INDEXED / REMOVED / PROCESSING` |
| `updatedAt` | `string` | 更新时间 |
| `uploader` | `string` | 上传人 |
| `url` | `string` | 访问地址 |

响应示例：

```json
{
  "summary": {
    "taskId": "task-001",
    "total": "3",
    "lastUpdatedAt": "03/21 18:20"
  },
  "items": [
    {
      "fileId": "file-20260321-001",
      "name": "demo.mp4",
      "fileType": "video",
      "size": "23.7 MB",
      "status": "INDEXED",
      "updatedAt": "03/21 18:20",
      "uploader": "陈一宁",
      "url": "https://cdn.example.com/task-001/2026/03/demo.mp4"
    }
  ]
}
```

### 14.6 `DELETE /tasks/{taskId}/files/{fileId}`

状态：

- 推荐接口
- 当前未在 root mock API / `spring-app` 中落地

用途：

- 删除或隐藏错误上传的附件
- 推荐做业务软删除，不直接物理删除对象存储文件

响应示例：

```json
{
  "taskId": "task-001",
  "fileId": "file-20260321-001",
  "status": "REMOVED",
  "nextStep": "附件已从业务索引中移除，保留审计留痕。"
}
```

### 14.7 文件上传接口前端联调顺序

建议前端按下面顺序接：

1. 先保留当前临时方案
用途：继续通过 `POST /tasks/{taskId}/progress.files` 传 URL / 文件标识，不阻塞主链。

2. 接 `POST /uploads/presign`
用途：让上传行为切到正式上传通道。

3. 接直传对象存储
用途：减少后端 API 压力。

4. 接 `POST /tasks/{taskId}/files`
用途：让任务附件真正进入业务索引。

5. 接 `GET /tasks/{taskId}/files`
用途：让协作空间和验收页统一读附件列表。

6. 最后再接 `DELETE /tasks/{taskId}/files/{fileId}`
用途：处理误传、重复上传和无效附件。

### 14.8 文件上传接口后端实现状态

- root mock API：未实现正式上传接口。
- `spring-app`：
  - 已有 `task_files` 相关实体基础
  - 已有协作空间读取附件索引的能力
  - 尚未提供上传凭证签发、对象存储直传和附件登记接口
- 当前推荐落地方向：
  - 对象存储：阿里云 OSS / 腾讯云 COS / S3 兼容存储
  - 平台数据库：继续使用 `task_files`
  - 后续接入时保证 `progress.files` 与正式附件索引兼容过渡
