# 文档阅读指南

这份文件只回答一件事：你现在应该先看哪几份文档。

如果你想看“文档库里都有什么”，回到 [README.md](./README.md)。

## 1. 如果你第一次接手这个项目

建议按这个顺序看：

1. [需求文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/requirements/2026-03-21-ai-talent-market-requirements.md)
2. [设计文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/design/2026-03-21-ai-talent-market-design.md)
3. [技术文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-ai-talent-market-technical.md)
4. [API 详细契约文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-api-contract.md)
5. [开发文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-21-ai-talent-market-development.md)
6. [版本与状态总览](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-version-status-overview.md)

## 2. 如果你是产品 / 业务同学

优先看这些：

- [需求文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/requirements/2026-03-21-ai-talent-market-requirements.md)
- [设计文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/design/2026-03-21-ai-talent-market-design.md)
- [总体设计 / MVP 计划](/Users/huangcongqiang/Desktop/products/youqinggong/docs/plans/2026-03-21-ai-talent-market-design.md)

适合回答的问题：

- 这个产品到底做什么
- 企业端和人才端分别怎么走
- 后台管理边界是什么
- 当前第一阶段做到哪里

## 3. 如果你是前端开发

优先看这些：

- [设计文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/design/2026-03-21-ai-talent-market-design.md)
- [API 详细契约文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-api-contract.md)
- [开发文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-21-ai-talent-market-development.md)

适合回答的问题：

- 页面该调哪个接口
- 企业端 / 人才端 / 后台的边界是什么
- 哪些字段是页面强依赖

## 4. 如果你是后端开发

优先看这些：

- [技术文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-ai-talent-market-technical.md)
- [API 详细契约文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-api-contract.md)
- [Spring App 结构说明](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-spring-app-structure.md)
- [腾讯 IM 集成说明](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-tencent-im-integration.md)
- [开发文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-21-ai-talent-market-development.md)
- [版本与状态总览](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-version-status-overview.md)
- [后端上线前能力清单](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-backend-launch-readiness-checklist.md)

适合回答的问题：

- 数据库结构怎么分
- 哪些接口已经真实落库
- 哪些还在 fallback
- 腾讯 IM 应该放在哪一层
- 后端距离正式上线还差哪些能力

## 5. 如果你是运维 / 部署同学

优先看这些：

- [部署文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-21-deployment-guide.md)
- [部署模板目录](/Users/huangcongqiang/Desktop/products/youqinggong/deploy/README.md)

适合回答的问题：

- 前台、后台、API 怎么部署
- Nginx 怎么配
- systemd 怎么配
- 发布和回滚怎么做

## 6. 如果你要看架构决策

看这里：

- [ADR-0001：采用模块化单体作为后端起步架构](/Users/huangcongqiang/Desktop/products/youqinggong/docs/adr/0001-adopt-modular-monolith.md)
- [ADR-0002：前台与后台管理采用双 Vue 应用](/Users/huangcongqiang/Desktop/products/youqinggong/docs/adr/0002-split-web-and-admin-frontends.md)

## 7. 如果你要维护文档

优先看：

- [文档维护规范](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-documentation-maintenance.md)
- [开发文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-21-ai-talent-market-development.md)
- [后端上线前能力清单](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-backend-launch-readiness-checklist.md)
- [版本与状态总览](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-version-status-overview.md)
- [测试清单与验收清单](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-test-acceptance-checklist.md)

适合回答的问题：

- 本次开发改动后，哪些文档必须同步更新
- 哪份文档才是当前事实源
- 根目录 `docs` 和三个子仓库 `docs` 怎么保持一致
