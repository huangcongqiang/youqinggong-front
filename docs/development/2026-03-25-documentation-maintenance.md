# 文档维护规范

这份文档回答一件事：以后每次开发之后，哪些文档必须跟着更新，怎么避免“代码一套、文档一套”。

## 1. 文档维护原则

- 根目录 `docs/` 是主文档库，默认以这里为准。
- `frontend/docs`、`admin/docs`、`backend/docs` 是同步副本，不单独长期编辑。
- 同一类信息只保留一个主事实源，不维护两份平行正文。
- `plans/` 只保留阶段方案基线和历史快照，不作为当前实现的唯一事实源。

## 2. 各目录负责什么

### `requirements/`

什么时候更新：

- 新增或删除功能
- 角色流程变化
- 边界条件变化

不要在这里写：

- 技术实现细节
- 接口字段

### `design/`

什么时候更新：

- 页面结构变化
- 角色入口变化
- 流程交互变化
- 组件布局发生明显变化

不要在这里写：

- 数据库结构
- 部署步骤

### `technical/`

什么时候更新：

- 架构边界变化
- 第三方集成变化
- 实时/轮询策略变化
- 接口字段和行为变化

不要在这里写：

- 需求优先级讨论
- 纯视觉描述

### `development/`

什么时候更新：

- 当前实现状态变化
- 启动方式变化
- 部署方式变化
- 文档维护方式变化

不要在这里写：

- 完整接口字段正文
- 纯产品需求正文

## 3. 哪些开发改动必须同步文档

### 页面与流程改动

至少更新：

- `requirements`
- `design`
- 必要时 `development`

典型例子：

- 官网首页改成单列
- 企业端 / 人才端流程变化
- 聊天页从双栏改成单列
- 协作空间交互重做

### 接口与字段改动

至少更新：

- `technical/2026-03-21-api-contract.md`
- `technical/2026-03-21-ai-talent-market-technical.md`
- 必要时 `development`

典型例子：

- 新增预算字段
- 新增撤回变更动作
- 新增聊天房间字段
- 实时策略改成轮询或 socket

### 部署与运行改动

至少更新：

- `development/2026-03-21-deployment-guide.md`
- `development/2026-03-21-ai-talent-market-development.md`
- 根目录 `README.md`

## 4. 当前项目最重要的事实源

### 产品事实源

- [需求文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/requirements/2026-03-21-ai-talent-market-requirements.md)
- [设计文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/design/2026-03-21-ai-talent-market-design.md)

### 技术事实源

- [技术文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-ai-talent-market-technical.md)
- [接口文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-api-contract.md)

### 开发与交付事实源

- [开发文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-21-ai-talent-market-development.md)
- [版本与状态总览](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-version-status-overview.md)
- [测试清单与验收清单](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-test-acceptance-checklist.md)
- [部署文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-21-deployment-guide.md)
- [后端上线前能力清单](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-backend-launch-readiness-checklist.md)

## 5. 每次开发完成后的文档检查清单

提交前至少检查这 6 项：

1. 这次改动有没有影响角色流程。
2. 这次改动有没有影响页面结构或交互。
3. 这次改动有没有新增、删除或改变接口字段。
4. 这次改动有没有改变当前实现边界。
5. 根目录 `docs/` 是否已更新。
6. `frontend/docs`、`admin/docs`、`backend/docs` 是否已同步。

## 6. 推荐同步方式

当前建议流程：

1. 先更新根目录 `docs/`
2. 再把根目录 `docs/` 同步到三个子仓库副本

推荐命令：

```bash
rsync -a --delete docs/ frontend/docs/
rsync -a --delete docs/ admin/docs/
rsync -a --delete docs/ backend/docs/
```

## 7. 当前最适合合并或降级的内容

### 已建议做减法

- `docs/README.md`
  只保留文档索引，不再重复承担阅读指南职责。
- `docs/START-HERE.md`
  只保留“先看哪几份文档”，不再重复目录索引。
- `plans/2026-03-21-ai-talent-market-design.md`
  作为历史基线快照保留，不再与需求 / 设计 / 技术 / 开发并列维护为第二份事实源。

### 建议继续保持独立

- 需求文档
- 设计文档
- 技术文档
- API 契约文档
- 开发文档
- 部署文档
- 腾讯 IM 集成说明
- Spring App 结构说明

原因：

- 这些文档分别服务不同角色
- 其中很多内容更新频率不同
- 强行合并会让单份文档过长、职责变混
