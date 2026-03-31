# 阶段记录：对象页上下文合同与回链纯函数对齐

## 所属主线

- [PC / H5 共享数据层与运行时收口主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-shared-runtime-alignment-mainline.md)

## 阶段目标

- 收口 `taskId / recordId / room / nodeId / tab / source / originSource / itemId / group` 这套对象页上下文模型
- 把对象页里的回链 query、返回文案和子对象页 query 序列化从页面内联逻辑抽成纯函数
- 让 PC 使用完整合同，H5 使用同语义子集合同

## 阶段结果

- PC / H5 当前都已新增镜像的 `objectPageContext` helper，统一提供 `normalizeContextValue / readObjectPageContext / resolveImmediateOriginContext / buildChildObjectPageContext / buildCenterReturnQuery / labelForObjectPageSource`。
- PC 端 [RecordDetailPage.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/RecordDetailPage.vue)、[WorkspacePage.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/WorkspacePage.vue)、[AcceptancePage.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/AcceptancePage.vue) 已切到 helper 生成对象页 query、回链 query 和返回文案。
- H5 端 [RecordDetailPage.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend_mobile_h5/src/pages/RecordDetailPage.vue)、[WorkspacePage.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend_mobile_h5/src/pages/WorkspacePage.vue)、[AcceptancePage.vue](/Users/huangcongqiang/Desktop/products/youqinggong/frontend_mobile_h5/src/pages/AcceptancePage.vue) 已完成对象页子集合同接入，保留单焦点移动端 UI。
- 本轮继续采用“镜像 helper + 同合同”的方式，没有引入跨项目物理共享模块，避免当前双 Vite 应用的跨根目录构建风险。

## 验证

- `node frontend/src/utils/objectPageContext.test.js`
- `node frontend_mobile_h5/src/utils/objectPageContext.test.js`
- `cd frontend && npm run build`
- `cd frontend_mobile_h5 && npm run build`
- `git -C frontend diff --check`
- `git -C frontend_mobile_h5 diff --check`

## 已知技术债

- PC / H5 的聊天页 chunk 仍然偏大，后续还需要继续拆消息线程和 IM 运行时。
- `objectPageContext` 目前仍是双端镜像维护，等主线 5、6 收口后再考虑是否具备抽成真正共享模块的条件。

## 最后一步

- 继续切入下一条主线：`spring-app + MySQL` 正式主链接管
