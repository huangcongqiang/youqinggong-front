# 阶段记录：记录详情与对象页 view model 对齐

## 所属主线

- [PC / H5 共享数据层与运行时收口主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-shared-runtime-alignment-mainline.md)

## 阶段目标

- 对齐 PC / H5 记录详情对象的关键字段映射
- 统一金额、日期、评级 formatter
- 把记录详情页关键 view model 从页面内联计算中抽离
- 明确记录详情对象锚点当前统一只认 `recordId / taskId / roomKey`

## 已完成

- `frontend` 新增：
  - `src/services/recordFormatters.js`
  - `src/pages/recordDetailViewModel.js`
  - `src/pages/recordDetailViewModel.test.js`
- `frontend_mobile_h5` 新增：
  - `src/services/recordFormatters.js`
  - `src/pages/recordDetailViewModel.js`
  - `src/pages/recordDetailViewModel.test.js`
- PC / H5 两端 `recordData.js` 都已改为复用并继续导出统一 formatter，避免列表页和 fallback 现有调用断裂。
- PC / H5 记录详情页都已改为消费独立 view model helper，不再在页面里堆叠金额、日期、评级、最新留痕、确认历史、标签与附件的内联派生逻辑。
- 记录详情对象当前统一暴露 `anchor.recordId / anchor.taskId / anchor.roomKey`，为下一阶段的对象页上下文合同与回链纯函数对齐做准备。

## 验证

- `node frontend/src/pages/recordDetailViewModel.test.js`
- `node frontend_mobile_h5/src/pages/recordDetailViewModel.test.js`
- `cd frontend && npm run build`
- `cd frontend_mobile_h5 && npm run build`
- `git -C frontend diff --check`
- `git -C frontend_mobile_h5 diff --check`

## 风险与边界

- 这阶段完成的是“对象字段映射、formatter 与 view model 合同对齐”，还不是“对象页上下文与回链纯函数完全共享”。
- 两端当前采用“镜像 helper + 同合同”而不是“跨项目物理共享模块”。在现有双 Vite app 结构下，这样更稳；若后续要真正共享根模块，需要再补 alias、`server.fs.allow` 与共享目录边界。

## 最后一步

- 继续进入阶段五：对象页上下文合同与回链纯函数对齐
