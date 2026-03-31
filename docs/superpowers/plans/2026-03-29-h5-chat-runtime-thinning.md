# H5 聊天运行时稳态与实时链收口

## 阶段目标

- 把 H5 聊天详情页里不需要占页面上下文的纯函数层和刷新节奏层抽出去
- 保持当前房间选择、消息发送、附件展示和轮询刷新逻辑不变
- 让 `MessagesPage.vue` 更接近“页面编排层 + 视图层”，减少后续继续收口时的阻力

## 实际结果

- `messageDetailHelpers.js` 已新增，统一承接消息展示、附件展示、任务确认历史整理、消息合并和状态映射
- `messageLiveRefresh.js` 已新增，统一承接轮询刷新开关和刷新间隔判断
- `messageRoomRuntimeHelpers.js` 已新增，统一承接房间预选、对象级空态房间、房间摘要 enrich 和详情刷新判断
- `MessagesPage.vue` 当前已从页面里移出一批纯 helper，页面自身更聚焦在房间编排、消息发送和 UI 交互

## 验证

- `frontend_mobile_h5`：`npm run build` 通过

## 结论

- `H5 前台收口主线` 当前已阶段性完成
