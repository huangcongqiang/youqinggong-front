# frontend_mobile_h5

有轻工移动端 H5 仓库，对应平台的认证优先登录页、次级平台介绍页、企业端和人才端移动端页面。

补充约定：

- 这是独立的 mobile-first H5 前端，不再和桌面前端共用同一个运行入口
- 根目录 `docs/` 是事实源，这里的 `docs/` 只是同步副本
- H5 当前通过统一 API 目标切换层指向后端 API；本地默认已走 `spring-app` 的 `:8081/api`
- 默认入口为 `/auth` 独立登录页，`/landing` 仅保留为次级平台介绍页

## 功能范围

- 平台介绍页（`/landing`，非默认入口）
- 企业端：入驻、发布任务、人才广场、人才详情、项目沟通、协作空间、验收评分
- 人才端：入驻、任务广场、项目沟通、协作空间、验收评分
- mobile-first H5，重点页面优先服务移动端操作
- 工作台、聊天页、协作空间优先使用移动端壳层、底部 sheet 和固定动作条

## 当前状态

- 页面不再依赖前端 mock 数据做静默回退
- 默认打开 `/auth`，登录后按账号状态直达对应业务页；品牌介绍页收在 `/landing`
- 认证区已重构为极简登录页 + 单步骤切换式注册页；人才注册第二步改成预置标签多选 + 自定义专业输入，提交时会同步生成 `headline` 并写入 `skills`
- 入驻页已收成极简功能表单：只保留角色切换、步骤、字段、上传与提交结果，不再展示资料清单、账号状态和说明型模块
- `frontend_mobile_h5/src/data/mock.js` 已删除
- `frontend_mobile_h5/src/pages/recordData.js` 已收成记录格式化工具
- 读接口失败会明确展示错误提示，不再伪装为空态
- 写接口失败会明确暴露失败状态，不再伪装成功
- 腾讯 IM 优先走真实配置，无法连通时展示已同步聊天记录和错误提示，不回退 mock 数据
- 全局视觉已切为高对比深色科技风，统一使用深色面板、蓝青高亮和可读性更强的正文层级

## 技术栈

- Vue 3
- Vue Router
- Vite
- CSS 变量 + 响应式布局

## 本地运行

```bash
npm install
npm run dev
```

本地联调时请先确保 `backend/spring-app` 已启动；如需覆盖地址，可把：

```bash
VITE_API_TARGET=spring
# 或者显式覆盖：
# VITE_API_BASE=http://localhost:8081/api
```

写进 `.env.local`。

本地双跑切换：

- root mock backend：`http://localhost:8080/api`
- `spring-app`：`http://localhost:8081/api`
- 默认目标已切到 `spring`
- 可通过以下方式切换：
  - `.env.local` 写 `VITE_API_TARGET=mock|spring`
  - query `?apiTarget=mock|spring`
  - `localStorage['youqinggong.api.target']`
  - `VITE_API_BASE` 作为最高优先级显式覆盖

默认地址：

- `http://localhost:5175`

## 目录

- `src/`：页面、组件、路由与前台 API 封装
- `docs/`：根目录文档的同步副本
- `deploy/`：部署模板副本

## 文档入口

- [文档阅读指南](./docs/START-HERE.md)
- [API 详细契约文档](./docs/technical/2026-03-21-api-contract.md)
- [设计文档](./docs/design/2026-03-21-ai-talent-market-design.md)
