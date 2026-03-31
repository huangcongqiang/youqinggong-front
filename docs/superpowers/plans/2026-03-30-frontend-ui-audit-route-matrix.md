# 主线 10 / 11 截图清单与路由矩阵

## 说明

本矩阵当前覆盖：

- `frontend`
- `frontend_mobile_h5`
- `admin`

临时采集目录固定为：

- `/tmp/yqg-ui-audit/pc`
- `/tmp/yqg-ui-audit/h5`
- `/tmp/yqg-ui-audit/admin`

正式归档目录固定为：

- `/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/artifacts/...`

规则补充：

- `/tmp` 只作为采集临时目录，不作为正式留档位置。
- `docs/superpowers/artifacts/...` 才是正式归档目录，截图落盘后以这里为准。
- 不做分批量预抓，只对当前活跃阶段 / 切片 / gate 需要的页面按需截图。
- 有效截图必须命中目标页面；登录页 / 首页 / 错误页只算失败取证。
- 当前默认继续动作围绕主线 10 阶段五按需补拍与归档，不再写批量计划。

## 命名规则

- PC：`pc-<group>-<page>.png`
- H5：`h5-<group>-<page>.png`
- Admin：`admin-<page>.png`
- 对象页增加对象上下文：`pc-<page>-<taskId|recordId|room>.png`

## PC 前台矩阵

| 页面 | 路由 | 角色/状态 | 典型上下文 | 截图文件 |
| --- | --- | --- | --- | --- |
| 官网首页 | `/` | 未登录 | 门户默认态 | `pc-portal-home.png` |
| 注册页 | `/register` | 未登录 | 企业注册入口 | `pc-portal-register.png` |
| 企业工作台 | `/enterprise` | 企业登录 | 默认工作台 | `pc-enterprise-dashboard.png` |
| 企业发布任务 | `/enterprise/publish` | 企业登录 | 默认表单态 | `pc-enterprise-publish.png` |
| 企业人才广场 | `/enterprise/talents` | 企业登录 | 列表 + 详情态 | `pc-enterprise-talent-market.png` |
| 企业人才详情 | `/enterprise/talents/:slug` | 企业登录 | 真实 `slug` | `pc-enterprise-talent-detail-<slug>.png` |
| 企业审批中心 | `/enterprise/approvals` | 企业登录 | followup / empty 态 | `pc-enterprise-approvals.png` |
| 企业通知中心 | `/enterprise/notifications` | 企业登录 | followup / empty 态 | `pc-enterprise-notifications.png` |
| 企业聊天 | `/enterprise/chat` | 企业登录 | `room=group_task_001` | `pc-enterprise-chat-task-001.png` |
| 企业协作空间 | `/enterprise/workspace` | 企业登录 | `taskId=task-001` | `pc-enterprise-workspace-task-001.png` |
| 企业验收页 | `/enterprise/acceptance` | 企业登录 | `taskId=task-001` | `pc-enterprise-acceptance-task-001.png` |
| 企业发单记录 | `/enterprise/records` | 企业登录 | 列表态 | `pc-enterprise-records.png` |
| 企业发单记录详情 | `/enterprise/records/:recordId` | 企业登录 | `recordId=task-001` | `pc-enterprise-record-detail-task-001.png` |
| 人才工作台 | `/talent` | 人才登录 | 默认工作台 | `pc-talent-dashboard.png` |
| 人才任务广场 | `/talent/tasks` | 人才登录 | 列表 + 详情态 | `pc-talent-task-market.png` |
| 人才个人详情 | `/talent/profile/:slug` | 人才登录 | 真实 `slug` | `pc-talent-profile-<slug>.png` |
| 人才通知中心 | `/talent/notifications` | 人才登录 | followup / empty 态 | `pc-talent-notifications.png` |
| 人才聊天 | `/talent/chat` | 人才登录 | `room=group_task_001` | `pc-talent-chat-task-001.png` |
| 人才协作空间 | `/talent/workspace` | 人才登录 | `taskId=task-001` | `pc-talent-workspace-task-001.png` |
| 人才验收页 | `/talent/acceptance` | 人才登录 | `taskId=task-001` | `pc-talent-acceptance-task-001.png` |
| 人才接单记录 | `/talent/records` | 人才登录 | 列表态 | `pc-talent-records.png` |
| 人才接单记录详情 | `/talent/records/:recordId` | 人才登录 | `recordId=task-001` | `pc-talent-record-detail-task-001.png` |
| 企业入驻 | `/enterprise/onboarding` | 企业登录 | 默认步骤态 | `pc-enterprise-onboarding.png` |
| 人才入驻 | `/talent/onboarding` | 人才登录 | 默认步骤态 | `pc-talent-onboarding.png` |

## H5 前台矩阵

| 页面 | 路由 | 角色/状态 | 典型上下文 | 截图文件 |
| --- | --- | --- | --- | --- |
| 落地页 | `/landing` | 未登录 | 门户默认态 | `h5-landing.png` |
| 登录页 | `/auth` | 未登录 | 企业登录入口 | `h5-auth.png` |
| 注册页 | `/register` | 未登录 | 企业注册入口 | `h5-register.png` |
| 企业工作台 | `/enterprise` | 企业登录 | 默认工作台 | `h5-enterprise-dashboard.png` |
| 企业发布任务 | `/enterprise/publish` | 企业登录 | 默认表单态 | `h5-enterprise-publish.png` |
| 企业人才广场 | `/enterprise/talents` | 企业登录 | 列表态 | `h5-enterprise-talent-market.png` |
| 企业人才详情 | `/enterprise/talents/:slug` | 企业登录 | 真实 `slug` | `h5-enterprise-talent-detail-<slug>.png` |
| 企业聊天列表 | `/enterprise/chat` | 企业登录 | 默认列表态 | `h5-enterprise-chat-inbox.png` |
| 企业聊天详情 | `/enterprise/chat/room` | 企业登录 | `room=group_task_001` | `h5-enterprise-chat-room-task-001.png` |
| 企业协作空间 | `/enterprise/workspace` | 企业登录 | `taskId=task-001` | `h5-enterprise-workspace-task-001.png` |
| 企业验收页 | `/enterprise/acceptance` | 企业登录 | `taskId=task-001` | `h5-enterprise-acceptance-task-001.png` |
| 企业发单记录 | `/enterprise/records` | 企业登录 | 列表态 | `h5-enterprise-records.png` |
| 企业发单记录详情 | `/enterprise/records/:recordId` | 企业登录 | `recordId=task-001` | `h5-enterprise-record-detail-task-001.png` |
| 企业入驻 | `/enterprise/onboarding` | 企业登录 | 默认步骤态 | `h5-enterprise-onboarding.png` |
| 人才工作台 | `/talent` | 人才登录 | 默认工作台 | `h5-talent-dashboard.png` |
| 人才任务广场 | `/talent/tasks` | 人才登录 | 列表态 | `h5-talent-task-market.png` |
| 人才个人资料 | `/talent/profile/:slug` | 人才登录 | 真实 `slug` | `h5-talent-profile-<slug>.png` |
| 人才聊天列表 | `/talent/chat` | 人才登录 | 默认列表态 | `h5-talent-chat-inbox.png` |
| 人才聊天详情 | `/talent/chat/room` | 人才登录 | `room=group_task_001` | `h5-talent-chat-room-task-001.png` |
| 人才协作空间 | `/talent/workspace` | 人才登录 | `taskId=task-001` | `h5-talent-workspace-task-001.png` |
| 人才验收页 | `/talent/acceptance` | 人才登录 | `taskId=task-001` | `h5-talent-acceptance-task-001.png` |
| 人才接单记录 | `/talent/records` | 人才登录 | 列表态 | `h5-talent-records.png` |
| 人才接单记录详情 | `/talent/records/:recordId` | 人才登录 | `recordId=task-001` | `h5-talent-record-detail-task-001.png` |
| 人才入驻 | `/talent/onboarding` | 人才登录 | 默认步骤态 | `h5-talent-onboarding.png` |

## Admin 管理台矩阵

| 页面 | 路由 | 角色/状态 | 典型上下文 | 截图文件 |
| --- | --- | --- | --- | --- |
| 管理台登录 | `/auth` | 未登录 | 默认登录态 | `admin-auth.png` |
| 经营看板 | `/` | 管理员登录 | 默认经营看板 | `admin-dashboard.png` |
| 用户管理 | `/users` | 管理员登录 | 默认列表态 | `admin-users.png` |
| 任务管理 | `/tasks` | 管理员登录 | 默认列表态 | `admin-tasks.png` |
| 审核风控 | `/compliance` | 管理员登录 | 默认列表 + 详情态 | `admin-compliance.png` |

## 当前已锁定的真实上下文

- 企业 token：`阶段七企业`
- 人才 token：`阶段七人才`
- 当前任务：`task-001`
- 当前房间：`group_task_001`
- 当前记录：`task-001`

## 当前最新取证文件

说明：以下路径大多是历史临时采集记录；后续继续推进时，以 `docs/superpowers/artifacts/...` 中的正式归档图为唯一事实源。

- PC 官网首页：`/tmp/yqg-ui-audit/pc/pc-portal-home-stage3c.png`
- PC 注册页：`/tmp/yqg-ui-audit/pc/pc-portal-register-stage3b.png`
- PC 企业工作台：`/tmp/yqg-ui-audit/pc/pc-enterprise-dashboard-stage2c.png`
- PC 人才工作台：`/tmp/yqg-ui-audit/pc/pc-talent-dashboard-stage3a.png`
- H5 落地页：`/tmp/yqg-ui-audit/h5/h5-landing-stage3c.png`
- H5 登录页：`/tmp/yqg-ui-audit/h5/h5-auth-stage3b.png`
- H5 注册页：`/tmp/yqg-ui-audit/h5/h5-register-stage3b.png`
- H5 企业工作台：`/tmp/yqg-ui-audit/h5/h5-enterprise-dashboard-stage2c-alt.png`
- H5 人才工作台：`/tmp/yqg-ui-audit/h5/h5-talent-dashboard-stage3a.png`
- H5 企业聊天列表：`/tmp/yqg-ui-audit/h5/h5-enterprise-chat-inbox-stage2c.png`
- PC 企业发布任务：`/tmp/yqg-ui-audit/pc/pc-enterprise-publish-stage4b.png`
- PC 企业人才广场：`/tmp/yqg-ui-audit/pc/pc-enterprise-talent-market-stage4b.png`
- H5 企业协作空间：`/tmp/yqg-ui-audit/h5/h5-enterprise-workspace-stage4d.png`
- H5 人才任务广场：`/tmp/yqg-ui-audit/h5/h5-talent-task-market-stage4d.png`
- Admin：待主线 11 阶段一统一补拍

## 当前新增业务页取证状态

- PC 企业发布任务：二轮业务页复审已完成，Hero、步骤带与模板摘要已继续压缩
- PC 企业人才广场：二轮业务页复审已完成，顶部统计卡已收掉，目录 + 详情承接已稳定
- H5 企业协作空间：二轮业务页复审已完成，真实业务态已收成“当前结论 + 当前动作 + 关键节点”
- H5 人才任务广场：二轮业务页复审已完成，已切成“主筛选 + 更多筛选”并改成单焦点详情承接

## 当前阶段五优先级

1. 门户 / 登录 / 注册
2. 企业工作台 / 人才工作台
3. 聊天 / 协作 / 验收 / 记录详情
4. 广场 / 详情 / 发布 / 入驻

## 当前默认继续动作

1. 围绕主线 10 阶段五按需补拍当前缺失页，并立即归档到 `docs/superpowers/artifacts/...`
2. 先读取当前已归档的有效截图，再补当前切片缺失截图
3. 对命中登录页 / 首页 / 错误页的结果继续按失败取证处理并修正入口
4. 不再展开下一批批量预抓计划
