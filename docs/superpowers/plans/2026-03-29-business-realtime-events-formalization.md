# 主线 6 阶段四：业务实时事件正式化

## 目标

为聊天业务字段、协作空间、验收页、通知中心 / 审批中心补正式业务事件同步链，优先采用 SSE / 等价后端事件流；聊天消息正文继续复用腾讯 IM 实时通道。

## 本阶段最小切片

- 在 `spring-app` 增加正式业务事件流入口
- 先覆盖对象状态刷新，不重做消息正文传输层
- 先让前端可以在事件到达时刷新：
  - 聊天业务字段
  - 协作空间
  - 验收页
  - 通知中心 / 审批中心

## 当前状态

- 状态：`已完成`

## 当前起点

- 阶段三已完成，`task -> room -> provider group -> currentUser / counterpartUser` 当前已以后端房间真相为准
- 当前前端关键业务字段仍主要依赖轮询 / 手动刷新
- 当前聊天正文实时通道继续依赖腾讯 IM SDK

## 阶段结果

- 已完成正式业务事件流入口：
  - `spring-app` 已补 `GET /api/events/stream`
  - 事件流当前要求 `Authorization`
  - 首包当前稳定发送 `system.connected`
- 已完成前端正式消费层：
  - PC 已切到 `businessEventStream` 的页面：
    - `BusinessPage`
    - `TalentPage`
    - `WorkspacePage`
    - `AcceptancePage`
    - `NotificationCenterPage`
    - `ApprovalCenterPage`
  - H5 已切到 `businessEventStream` 的页面：
    - `BusinessPage`
    - `TalentPage`
    - `WorkspacePage`
    - `AcceptancePage`
- 已完成事件解析与重连收口：
  - `parseBusinessEventChunks` 当前已兼容 `CRLF`
  - `startBusinessLiveSync` 当前已补断流后重新可见时的重连
- 已完成事件接收人边界收口：
  - `publishTaskEvent(...)` 当前只会推送给发布方和已选中人才
  - 不再把任务状态事件广播给仅处于 `RECOMMENDED` 的人才
- 已补 controller 级最小保障：
  - `BusinessEventApiControllerTest` 当前已覆盖 `401` 与“已登录可起流”

## 下一步

- 已切入主线 7 阶段一：审批 / 财务 / 争议对象与状态机冻结
- 聊天正文继续复用腾讯 IM 实时通道，不在下一主线里回退到轮询

## 当前边界

- 本阶段不替换腾讯 IM 聊天正文实时通道
- 本阶段不先做完整业务 WebSocket 网关
- 本阶段先覆盖业务状态刷新，再考虑更细粒度事件编排

## 验证目标

- 关键业务对象当前已优先通过正式事件流刷新而不是轮询
- 事件类型、订阅对象、前端消费策略已文档化
- 关键页面的状态更新当前不再只依赖手动刷新

## 验证

- `cd frontend && node src/services/businessEventStream.test.js`
- `cd frontend_mobile_h5 && node src/services/businessEventStream.test.js`
- `cd backend/spring-app && mvn -q -Dtest=TaskLifecycleMobileFlowTest test`
- `cd backend/spring-app && mvn -q -Dtest=BusinessEventApiControllerTest test`
- `cd frontend && npm run build`
- `cd frontend_mobile_h5 && npm run build`
- `cd backend/spring-app && mvn -q test`

## 最后一步

- 继续进入主线 7 阶段一：审批 / 财务 / 争议对象与状态机冻结
