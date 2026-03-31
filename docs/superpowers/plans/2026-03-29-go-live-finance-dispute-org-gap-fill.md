# 主线 9 阶段五：财务、争议、风控与组织权限补缺

## 目标

- 把当前“财务对象已进入主链、争议第一阶段已完成、组织权限仍缺失”的状态推进到更接近正式上线门槛
- 补齐财务审计、争议第二阶段、风控升级与组织权限的第一批正式缺口

## 范围

- `spring-app` 中 `approval / claim / invoice / reconciliation / settlement / dispute / riskTicket` 的剩余上线缺口
- 组织权限最小对象合同、角色边界与后台/前台依赖字段
- 记录详情、闭环详情、后台合规与中心页对财务 / 争议对象的回读一致性

## 当前状态

- 状态：`已完成`
- 当前默认下一步：阶段五已完成，立即进入阶段六“承载、压测与高风险接口保护”

## 当前阶段进展

- 第一刀已完成：`/api/admin/compliance` 当前已移除“risk ticket 为空就回退 demo”的旧分支，正式回读 `summary / checks / riskTickets / deliveryBoard`
- 第一刀已完成：后台合规读模型当前已新增 `organizationPermissions`，第一批明确了 `平台管理员 / 企业管理员 / 人才账号` 三类最小权限边界
- 第一刀验证已完成：
  - `mvn -q -Dtest=AdminComplianceFormalizationTest test`
  - `mvn -q -Dtest=AdminComplianceFormalizationTest,ClaimApiControllerFlowTest,AdminApiControllerAuthTest,AdminWriteChainFormalizationTest test`
- 第二刀已完成：`/api/admin/dashboard` 与 `/api/admin/users` 当前已移除“空列表时回退 demo 队列”的旧分支，读模型会返回正式 `queues / alerts / activities / reviewQueue`
- 第二刀已完成：后台 dashboard 当前已按真实 `task / organization / riskTicket` 回读待办与风险提醒；用户管理页当前在无待审核对象时会返回空 `reviewQueue`
- 第二刀验证已完成：
  - `mvn -q -Dtest=AdminReadModelFormalizationTest test`
  - `mvn -q -Dtest=AdminComplianceFormalizationTest,AdminReadModelFormalizationTest,AdminApiControllerAuthTest,AdminWriteChainFormalizationTest,ClaimApiControllerFlowTest test`
- 第三刀已完成：`/api/admin/tasks` 当前已移除“无任务时整页回退 demo”的旧分支；任务管理页现在会返回正式空 `summary / items / actionQueue`
- 第三刀验证已完成：
  - `mvn -q -Dtest=AdminReadModelFormalizationTest test`
  - `mvn -q -Dtest=AdminComplianceFormalizationTest,AdminReadModelFormalizationTest,AdminApiControllerAuthTest,AdminWriteChainFormalizationTest,ClaimApiControllerFlowTest test`
- 第四刀已完成：后台管理前端当前已正式消费 `/api/admin/compliance.organizationPermissions`，`admin/src/data/mock.js` 的 fallback 也已完成对齐
- 第四刀已完成：阶段五当前已完成财务 / 争议 / 风控 / 组织权限第一批正式对象回读与管理台读模型空态 formalization，已满足本阶段收口条件

## 本阶段实施项

1. 盘点并冻结财务、争议、风控、组织权限的上线缺口与最小对象合同
2. 补第一批正式接口或对象字段缺口，避免继续依赖隐式 fallback
3. 回读记录详情、闭环详情、后台合规与中心页，确认对象状态在多入口下一致
4. 用最小回归确认第一批缺口已真正被正式主链承接

## 完成条件

- 财务、争议、风控与组织权限的第一批上线缺口已冻结为明确合同
- 至少一批组织权限 / 财务审计对象已进入正式后端接口或正式读写链
- 记录详情、闭环详情、后台合规和中心页对相关对象的状态展示保持一致
- 根 `docs/` 与四个 `docs` 副本完成同步

## 最后一步

- 切到阶段六“承载、压测与高风险接口保护”，继续当前主线
