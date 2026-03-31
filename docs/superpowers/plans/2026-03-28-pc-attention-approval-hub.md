# 2026-03-28 PC 待办 / 通知 / 审批入口聚合

## 目标

把 PC Web 端企业工作台、人才工作台顶部的高优先级事项统一收成共享入口层，让用户先处理待确认、待修改、待评级、待取消等关键事项，再进入聊天、协作空间和记录页。

## 本阶段范围

- [x] 抽取共享的 PC 待办 / 通知入口组件
- [x] 企业端工作台接入聚合待办入口与审批式入口层
- [x] 人才端工作台接入聚合待办入口与处理入口层
- [x] 根 `docs/` 与四个子项目副本文档同步本阶段结果
- [x] 运行 `frontend` 与 `frontend_mobile_h5` 构建验证

## 设计方向

- 优先呈现高优先级待办，而不是继续扩张模块卡
- 待办入口强调数量、状态与下一步动作
- 企业端更偏“审批 / 处理”，人才端更偏“确认 / 执行”
- 统一复用精确深链，确保入口点进去就是正确任务与上下文

## 后续阶段

- PC 通知中心独立页
- 审批、请款、开票、对账、结算链路
- 争议处理与风控升级

## 暂停记录

- 已新建共享组件草稿：[frontend/src/components/DesktopAttentionHub.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/components/DesktopAttentionHub.vue)
- 企业端工作台与人才端工作台都已经出现“待办入口聚合”的中间态逻辑，但还没完全切到共享组件
- 当前暂停点：继续把 [frontend/src/pages/BusinessPage.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/BusinessPage.vue) 和 [frontend/src/pages/TalentPage.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/TalentPage.vue) 接到共享组件，再同步文档并跑构建验证

## 本阶段结果

- 已新增共享组件：[frontend/src/components/DesktopAttentionHub.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/components/DesktopAttentionHub.vue)
- 企业端工作台已切到“审批式待办”入口层
- 人才端工作台已切到“确认式待办”入口层
- 两端待办入口都继续复用精确深链，可直接进入聊天、协作空间和记录上下文
- `frontend` 与 `frontend_mobile_h5` 构建验证已通过
