# development 目录说明

这个目录回答：当前项目怎么开发、怎么交接、怎么部署，以及当前实现做到哪一步。

适合谁看：

- 开发负责人
- 接手开发的工程师
- 测试
- 运维 / 交付同学

建议阅读顺序：

1. [开发文档](./2026-03-21-ai-talent-market-development.md)
2. [版本与状态总览](./2026-03-25-version-status-overview.md)
3. [后端上线前能力清单](./2026-03-25-backend-launch-readiness-checklist.md)
4. [测试清单与验收清单](./2026-03-25-test-acceptance-checklist.md)
5. [文档维护规范](./2026-03-25-documentation-maintenance.md)
6. [部署文档](./2026-03-21-deployment-guide.md)

这个目录里应该放什么：

- 当前开发状态
- 当前版本与能力状态
- 当前代码模块 / 协作分工
- 本地启动与联调说明
- 后端上线前能力清单
- 测试与验收清单
- 文档更新规则
- 交付清单
- 部署与回滚说明

这个目录里不应该放什么：

- 产品需求正文
- 界面规范正文
- 接口字段主文档
- 目标态 H5 / PC 方案正文
- 未确认的架构决策记录

补充约定：

- 这里描述的是“当前实现态”和“当前交付态”。
- `规范文件夹` 中的参考文档不在这里维护，也不在这里直接修改。
- 目标态产品 / 界面 / 技术蓝图，优先写入 `requirements / design / plans`，再按确认结果回写到这里的开发说明。
- 项目维度连续推进规则优先看 [项目维度持续推进规则](./../superpowers/plans/2026-03-29-continuous-phase-execution-rules.md)。
- 项目当前做到哪条主线、下一条默认切到哪条主线，优先看 [项目主线执行计划](./../superpowers/plans/2026-03-29-project-mainline-execution-plan.md)。
- 如果当前处于切片推进期，则每个切片都必须先完成根 `docs/` 更新、四个 `docs` 副本同步、整端 UI 审查、全量主路径功能回归和阻断项清零，才允许进入下一切片。
- 阶段七这类上线销项切片，优先看 [主线 9 剩余阶段连续执行计划](./../superpowers/plans/2026-03-29-go-live-standard-remaining-execution-plan.md) 和 [测试清单与验收清单](./2026-03-25-test-acceptance-checklist.md)。
