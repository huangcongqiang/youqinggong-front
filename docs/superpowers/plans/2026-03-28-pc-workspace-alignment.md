# PC Workspace Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 PC 协作空间从长单列卡片页重构为更符合新规范的工作区，优先实现“任务切换 / 主工作区 / 上下文详情”的桌面使用方式。

**Architecture:** 保留现有 `WorkspacePage.vue` 的业务状态与接口读取逻辑，但把页面拆成更清晰的布局单元。企业端优先做成“左任务切换 + 中节点与动作 + 右详情”，人才端复用同一工作区框架，但主区聚焦执行与提交。文档同步只更新当前实现态与目标态差异，不改接口契约。

**Tech Stack:** Vue 3、Vue Router、现有 CSS 变量体系、root `docs/` 事实源

---

## Progress

- [x] 计划已记录到进展文档
- [x] 第 1 步：拆出 PC 协作空间的结构边界与组件职责
- [x] 第 2 步：实现企业端 PC 协作空间三栏布局
- [x] 第 3 步：实现人才端 PC 协作空间三栏 / 上下文布局
- [x] 第 4 步：同步文档与构建验证

### Task 1: 定义结构边界并拆分组件

**Files:**
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/WorkspacePage.vue`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/style.css`
- Create: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/components/workspace/WorkspaceTaskRail.vue`
- Create: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/components/workspace/WorkspaceContextPanel.vue`

- [x] 盘点 `WorkspacePage.vue` 当前承担的 3 类职责：任务切换、主工作区、详情弹层
- [x] 把任务切换条抽成左侧 `WorkspaceTaskRail.vue`
- [x] 把任务详情 / 最近提交 / 关键摘要抽成右侧 `WorkspaceContextPanel.vue`
- [x] 保持接口读取、节点详情弹层、表单提交逻辑先不变，避免第一步引入流程回归

### Task 2: 实现企业端三栏工作区

**Files:**
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/WorkspacePage.vue`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/style.css`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/components/workspace/WorkspaceTaskRail.vue`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/components/workspace/WorkspaceContextPanel.vue`

- [x] 左侧承接任务切换与任务状态摘要
- [x] 中间承接当前任务、任务动作、节点时间线
- [x] 右侧承接预算、周期、合作对象、最近提交、任务详情入口
- [x] 去掉长单列卡片连续堆叠的阅读方式

### Task 3: 实现人才端桌面执行台

**Files:**
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/WorkspacePage.vue`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/style.css`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/components/workspace/WorkspaceContextPanel.vue`

- [x] 沿用同一桌面工作区壳
- [x] 主区优先保留当前任务、关键节点、进展提交
- [x] 右侧承接企业信息、预算周期、最近审核与任务详情
- [x] 保持人才端执行表单在主区，不被详情信息挤压

### Task 4: 同步文档与验证

**Files:**
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/docs/design/2026-03-28-enterprise-employment-collaboration-design.md`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/docs/design/2026-03-28-h5-pc-ui-spec.md`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-ai-talent-market-technical.md`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-21-ai-talent-market-development.md`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-version-status-overview.md`
- Modify: `/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-test-acceptance-checklist.md`

- [x] 更新 PC 协作空间当前实现态描述
- [x] 更新 H5 / PC 规范中关于桌面协作工作区的现状说明
- [x] 运行 `cd /Users/huangcongqiang/Desktop/products/youqinggong/frontend && npm run build`
- [x] 如本轮有改 H5 共享样式，再运行 `cd /Users/huangcongqiang/Desktop/products/youqinggong/frontend_mobile_h5 && npm run build`
- [x] 将根 `docs/` 同步到 `frontend / frontend_mobile_h5 / admin / backend` 的 `docs` 副本
