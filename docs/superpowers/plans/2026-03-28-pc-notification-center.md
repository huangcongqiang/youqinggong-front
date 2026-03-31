# 2026-03-28 PC 通知中心独立页

## 目标

为 PC Web 端企业工作台、人才工作台补一层独立的通知中心页，把当前高优先级待办从首页顶部入口继续展开成可筛选、可分组、可直达处理上下文的桌面工作页。

## 本阶段范围

- [x] 新增 PC 通知中心独立页
- [x] 企业端工作台接入通知中心入口
- [x] 人才端工作台接入通知中心入口
- [x] 桌面业务壳接入通知入口导航与顶部动作
- [x] 根 `docs/` 与四个子项目副本文档同步本阶段结果
- [x] 运行 `frontend` 与 `frontend_mobile_h5` 构建验证

## 设计方向

- 通知中心优先承接高优先级事项，而不是做成泛消息列表
- 默认分组展示：待确认、待修改、待评级、待取消、待回看
- 企业端更偏“审批 / 处理”，人才端更偏“确认 / 执行”
- 所有通知项继续复用精确深链，确保进入聊天、协作空间和记录详情时保留 `taskId / room / recordId / source`
- 页面优先遵循桌面办公端范式：左侧分组、中央列表、右侧摘要与批量动作骨架

## 后续阶段

- 审批、请款、开票、对账、结算链路
- 争议处理与风控升级
- 桌面列表页批量处理与表格化深化

## 本阶段结果

- 已新增独立页面：[frontend/src/pages/NotificationCenterPage.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/NotificationCenterPage.vue)
- 已补桌面通知组件：[frontend/src/components/notifications](/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/components/notifications)
- 企业端与人才端工作台顶部待办都已可进入通知中心
- 桌面业务壳左侧导航与顶部动作已接入通知中心
- 通知中心页已按分组、列表、右侧摘要和批量动作骨架承接
- 从通知中心进入协作空间、聊天、记录详情时，`source=notifications` 已纳入回跳来源
