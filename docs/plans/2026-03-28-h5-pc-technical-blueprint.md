# H5 与 PC 技术方案蓝图

> 版本：2026-03-28  
> 说明：本文件基于“规范文件夹/03-技术文档”整理，属于目标态技术蓝图，不作为当前实现事实源。

## 1. 蓝图目标

平台目标不是只把任务发出去，而是完整承接：

- 招聘撮合
- 在线协作
- 审批与留痕
- 验收与结算
- 信用沉淀与复购

系统需要同时支持 H5 与 PC 的差异化体验，以及统一的业务底座。

## 2. 目标架构

推荐采用：

- H5 前端
- PC 前端
- 后台运营端
- 共享 API / BFF
- 领域化后端模块
- 数据库、缓存、对象存储、消息队列、监控体系

## 3. 端架构蓝图

### H5

- mobile-first 单任务协作壳
- 高触达、高提醒、强消息、轻操作
- 重点承接登录、聊天、待办、轻审批、验收确认

### PC

- 重管理、多任务、强信息密度工作台
- 重点承接工作台、筛选、协作总览、审批、财务和运营治理

## 4. 后端蓝图

推荐模块：

- 身份认证
- 企业 / 人才画像
- 任务与协作
- 聊天与通知
- 文件与素材
- 审批流
- 结算与发票
- 风控与审计

## 5. 文档边界

- 本文件描述目标态蓝图
- 当前代码实际做到哪一步，请看：
  - [当前技术文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/technical/2026-03-21-ai-talent-market-technical.md)
  - [版本与状态总览](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-25-version-status-overview.md)
  - [开发文档](/Users/huangcongqiang/Desktop/products/youqinggong/docs/development/2026-03-21-ai-talent-market-development.md)
