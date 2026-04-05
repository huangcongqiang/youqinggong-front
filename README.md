# youqinggong-front

有轻功前台应用仓库，对应平台的官网首页、企业端和人才端。

## 功能范围

- 官网首页
- 企业端：入驻、发布任务、人才广场、人才详情、项目沟通、协作空间、验收评分
- 人才端：入驻、任务广场、项目沟通、协作空间、验收评分
- 仅承接 PC Web 前台；移动端 H5 已迁到 `frontend_mobile_h5`

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

默认地址：

- `http://localhost:5173`

本地双跑切换：

- root mock backend：`http://localhost:8080/api`
- `spring-app`：`http://localhost:8081/api`
- 默认目标已切到 `spring`
- 可通过以下方式切换：
  - `.env.local` 写 `VITE_API_TARGET=mock|spring`
  - query `?apiTarget=mock|spring`
  - `localStorage['youqinggong.api.target']`
  - `VITE_API_BASE` 作为最高优先级显式覆盖

## 目录

- `src/`：页面、组件、路由与前台 API 封装
- `docs/`：项目文档副本
- `deploy/`：部署模板副本

## 文档入口

- [文档阅读指南](./docs/START-HERE.md)
- [API 详细契约文档](./docs/technical/2026-03-21-api-contract.md)
- [设计文档](./docs/design/2026-03-21-ai-talent-market-design.md)
