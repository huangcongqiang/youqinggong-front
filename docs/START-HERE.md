# 文档阅读指南

这份项目的文档现在建议用两种方式读：

- 按“你现在要做什么”读
- 按“目录分别负责什么”读

如果你只是想快速开始，优先按第一种。

## 1. 如果你第一次接手这个项目

建议按这个顺序看：

1. [需求文档](requirements/2026-03-21-ai-talent-market-requirements.md)
2. [设计文档](design/2026-03-21-ai-talent-market-design.md)
3. [技术文档](technical/2026-03-21-ai-talent-market-technical.md)
4. [API 详细契约文档](technical/2026-03-21-api-contract.md)
5. [开发文档](development/2026-03-21-ai-talent-market-development.md)

## 2. 如果你是产品 / 业务同学

优先看这些：

- [需求文档](requirements/2026-03-21-ai-talent-market-requirements.md)
- [设计文档](design/2026-03-21-ai-talent-market-design.md)
- [总体设计 / MVP 计划](plans/2026-03-21-ai-talent-market-design.md)

适合回答的问题：

- 这个产品到底做什么
- 企业端和人才端分别怎么走
- 后台管理边界是什么
- 当前第一阶段做到哪里

## 3. 如果你是前端开发

优先看这些：

- [设计文档](design/2026-03-21-ai-talent-market-design.md)
- [API 详细契约文档](technical/2026-03-21-api-contract.md)
- [开发文档](development/2026-03-21-ai-talent-market-development.md)

适合回答的问题：

- 页面该调哪个接口
- 企业端 / 人才端 / 后台的边界是什么
- 哪些字段是页面强依赖

## 4. 如果你是后端开发

优先看这些：

- [技术文档](technical/2026-03-21-ai-talent-market-technical.md)
- [API 详细契约文档](technical/2026-03-21-api-contract.md)
- [Spring App 结构说明](technical/2026-03-21-spring-app-structure.md)
- [腾讯 IM 集成说明](technical/2026-03-21-tencent-im-integration.md)
- [开发文档](development/2026-03-21-ai-talent-market-development.md)

适合回答的问题：

- 数据库结构怎么分
- 哪些接口已经真实落库
- 哪些还在 fallback
- 腾讯 IM 应该放在哪一层

## 5. 如果你是运维 / 部署同学

优先看这些：

- [部署文档](development/2026-03-21-deployment-guide.md)
- [部署模板目录](../deploy/README.md)

适合回答的问题：

- 前台、后台、API 怎么部署
- Nginx 怎么配
- systemd 怎么配
- 发布和回滚怎么做

## 6. 如果你要看架构决策

看这里：

- [ADR-0001：采用模块化单体作为后端起步架构](adr/0001-adopt-modular-monolith.md)
- [ADR-0002：前台与后台管理采用双 Vue 应用](adr/0002-split-web-and-admin-frontends.md)

## 7. 当前文档分类建议

以后建议按下面这个理解方式来看，而不是只看目录名：

- `requirements/`：这个产品要做什么
- `design/`：产品怎么组织页面和流程
- `technical/`：系统怎么实现
- `development/`：怎么开发、怎么部署、怎么交接
- `adr/`：关键架构决策为什么这么定
- `plans/`：阶段计划和路线

如果你对目录边界还有疑惑，可以继续看每个目录自己的说明：

- [requirements 目录说明](requirements/README.md)
- [design 目录说明](design/README.md)
- [technical 目录说明](technical/README.md)
- [development 目录说明](development/README.md)
- [plans 目录说明](plans/README.md)
- [adr 目录说明](adr/README.md)
