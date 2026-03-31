# 文档索引

这份文件只做两件事：

- 告诉你文档库里有什么
- 告诉你每个目录谁是主文档
- 明确根目录 `docs/` 是事实源，子项目 `docs/` 都是同步副本

如果你想按“角色 / 任务”来找阅读顺序，直接看 [START-HERE.md](./START-HERE.md)。

## 当前文档事实源约定

- 根目录 `docs/` 是唯一长期维护的正文事实源
- `frontend/docs`、`frontend_mobile_h5/docs`、`admin/docs`、`backend/docs` 都是同步副本
- 子项目内如需补充说明，优先写各自 `README.md`，不要在副本里长期手工分叉正文
- 如果当前处于主线切片推进期，则每个切片都必须先完成根 `docs/` 回写、四个副本同步、整端 UI 审查、全量主路径功能回归和阻断项清零，才允许进入下一切片

## 主入口

- 快速阅读顺序：[START-HERE.md](./START-HERE.md)
- 需求主文档：[requirements/2026-03-28-enterprise-employment-collaboration-requirements.md](./requirements/2026-03-28-enterprise-employment-collaboration-requirements.md)
- 功能清单（老板 / 产品版）：[requirements/2026-03-30-product-feature-inventory.md](./requirements/2026-03-30-product-feature-inventory.md)
- 设计主文档（业务流）：[design/2026-03-28-enterprise-employment-collaboration-design.md](./design/2026-03-28-enterprise-employment-collaboration-design.md)
- 设计主文档（界面规范）：[design/2026-03-28-h5-pc-ui-spec.md](./design/2026-03-28-h5-pc-ui-spec.md)
- 技术主文档：[technical/2026-03-21-ai-talent-market-technical.md](./technical/2026-03-21-ai-talent-market-technical.md)
- 接口主文档：[technical/2026-03-21-api-contract.md](./technical/2026-03-21-api-contract.md)
- 目标态技术蓝图：[plans/2026-03-28-h5-pc-technical-blueprint.md](./plans/2026-03-28-h5-pc-technical-blueprint.md)
- 项目主线执行计划：[superpowers/plans/2026-03-29-project-mainline-execution-plan.md](./superpowers/plans/2026-03-29-project-mainline-execution-plan.md)
- 开发主文档：[development/2026-03-21-ai-talent-market-development.md](./development/2026-03-21-ai-talent-market-development.md)
- 版本与状态总览：[development/2026-03-25-version-status-overview.md](./development/2026-03-25-version-status-overview.md)
- 部署主文档：[development/2026-03-21-deployment-guide.md](./development/2026-03-21-deployment-guide.md)
- 后端上线前能力清单：[development/2026-03-25-backend-launch-readiness-checklist.md](./development/2026-03-25-backend-launch-readiness-checklist.md)
- 测试清单与验收清单：[development/2026-03-25-test-acceptance-checklist.md](./development/2026-03-25-test-acceptance-checklist.md)
- 文档维护规范：[development/2026-03-25-documentation-maintenance.md](./development/2026-03-25-documentation-maintenance.md)
- 项目维度持续推进规则：[superpowers/plans/2026-03-29-continuous-phase-execution-rules.md](./superpowers/plans/2026-03-29-continuous-phase-execution-rules.md)
- 主线 9 剩余切片执行表：[superpowers/plans/2026-03-29-go-live-standard-remaining-execution-plan.md](./superpowers/plans/2026-03-29-go-live-standard-remaining-execution-plan.md)

## 目录边界

### `requirements/`

主问题：产品要做什么，范围到哪里。  
入口：[requirements/README.md](./requirements/README.md)

### `design/`

主问题：页面、角色和流程怎么组织。  
入口：[design/README.md](./design/README.md)

### `technical/`

主问题：系统怎么实现、接口怎么对接、第三方怎么接。  
入口：[technical/README.md](./technical/README.md)

### `development/`

主问题：怎么开发、怎么联调、怎么交接、怎么部署。  
入口：[development/README.md](./development/README.md)

### `plans/`

主问题：阶段计划和历史快照怎么看。  
说明：这里的内容不是实时事实源，更适合放“阶段方案基线”、目标态蓝图和历史版本。
入口：[plans/README.md](./plans/README.md)

### `adr/`

主问题：为什么做这些关键架构决策。  
入口：[adr/README.md](./adr/README.md)
