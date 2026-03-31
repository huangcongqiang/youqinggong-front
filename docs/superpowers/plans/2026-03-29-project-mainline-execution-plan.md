# 项目主线执行计划

## 目标

把项目推进方式从“单条主线做完就停”升级成“按项目维度持续推进”，直到所有已登记主线完成或被明确暂停。

## 范围

本计划只管理项目级主线，不替代单阶段计划文档。

项目完成定义：主线 10、11、12 全部完成。

纳入本计划的主线包括：

- 文档与规范对齐
- PC Web 前台收口
- H5 前台收口
- PC / H5 共享数据层与运行时收口
- `spring-app + MySQL` 正式主链接管
- 文件上传 / 实时事件 / IM 回写正式化
- 审批 / 请款 / 开票 / 对账 / 结算 / 争议主链
- 上线准备与全链回归
- 达到上线标准
- PC + H5 前台全页 UI 截图评审与改版
- Admin 全页 UI 截图评审与改版
- 上线后增强项收口

## 当前基线

- `frontend`：`正式上线可测`，PC Web 前台业务已可测可回归，但主线 10 的整端 UI 收口与二次截图复审仍在推进
- `frontend_mobile_h5`：`正式上线可测`，H5 前台业务已可测可回归，但主线 10 的整端 UI 收口与二次截图复审仍在推进
- `backend/src/main/java`：`演示可测`，仍是 root mock API
- `backend/spring-app`：`正式上线可测`，正式主写链、上传链、IM callback、实时事件、管理台与九组真实主路径终验均已过门

## 主线拆分

### 主线 1：文档与规范对齐

状态：`已完成`

结果：

- `规范文件夹` 保持为参考基线
- 根目录 `docs/` 成为唯一事实源
- 四个子项目 `docs` 副本已按根目录同步

### 主线 2：PC Web 前台收口

状态：`已完成`

结果：

- PC 工作台、通知中心、审批中心、聊天页、协作空间、记录详情已按桌面工作区方向收口
- PC 中心页和对象页之间的来源链与返回链已统一

### 主线 3：H5 前台收口

状态：`已完成`

结果：

- H5 已独立成单独前端
- H5 聊天已拆成会话列表页与详情页
- H5 工作台、协作页、记录详情、验收页已完成阶段性首屏减法

### 主线 4：PC / H5 共享数据层与运行时收口

状态：`已完成`

目标：

- 统一 H5 / PC 共用的数据层、房间运行时、对象页运行时和回链合同
- 继续缩小 H5 / PC 之间的拷贝式重复
- 把聊天、记录、协作、验收这些对象页的数据编排从页面主文件继续拆薄
- 当前已完成共享认证会话、请求基础层、聊天纯 helper、协作 payload / 失败合同、记录详情 formatter 与对象页 view model 对齐、对象页上下文合同与回链纯函数对齐；当前采用“镜像 helper + 同合同”而不是跨项目物理共享模块

主线计划：

- [PC / H5 共享数据层与运行时收口主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-shared-runtime-alignment-mainline.md)

### 主线 5：`spring-app + MySQL` 正式主链接管

状态：`已完成`

目标：

- 把登录、任务、聊天、协作、验收的关键写链迁移到 `spring-app`
- 明确 root mock API 只保留联调职责
- 让正式鉴权、正式落库、正式事务边界成为默认链路

主线计划：

- [spring-app + MySQL 正式主链接管主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-spring-app-mainline.md)

### 主线 6：文件上传 / 实时事件 / IM 回写正式化

状态：`已完成`

目标：

- 接通真实上传链路与对象存储
- 补齐 WebSocket / SSE 或等价正式实时事件链
- 完成腾讯 IM 写链、回写链、回调幂等与异常重试

主线计划：

- [文件上传 / 实时事件 / IM 回写正式化主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-upload-realtime-im-mainline.md)

### 主线 7：审批 / 请款 / 开票 / 对账 / 结算 / 争议主链

状态：`已完成`

目标：

- 让审批、请款、开票、对账、结算、争议处理进入正式后端主链
- 把企业端高优先级财务与风控链补齐到可上线口径

主线计划：

- [审批 / 财务 / 争议主链](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-finance-dispute-mainline.md)
- [阶段一：审批 / 财务状态冻结](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-approval-financial-state-freeze.md)
- [阶段二：审批中心正式化](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-approval-center-formalization.md)
- [阶段三：请款最小闭环](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-claim-minimum-closure.md)
- [阶段四：开票与对账](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-invoice-reconciliation-minimum-closure.md)
- [阶段五：结算执行](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-settlement-execution.md)
- [阶段六：争议与风控升级](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-dispute-risk-upgrade.md)

### 主线 8：上线准备与全链回归

状态：`已完成`

目标：

- 完成全链路验收、压测、部署、监控、回滚和稳定性校验
- 明确“正式上线可测”的通过条件

主线计划：

- [上线准备与全链回归主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-launch-readiness-mainline.md)
- [阶段一：合同与数据回归](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-launch-contract-data-regression.md)
- [阶段二：稳定性与可观测性](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-launch-stability-observability.md)
- [阶段三：上线前通过条件冻结](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-launch-go-live-criteria-freeze.md)

### 主线 9：达到上线标准

状态：`已完成`

目标：

- 逐条完成“正式上线可测”的冻结条件
- 在不改动参考规范文档的前提下，让根 `docs/` 和代码都真正达到上线门槛

主线计划：

- [达到上线标准主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-standard-mainline.md)
- [阶段一：认证与权限正式化](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-auth-permission-formalization.md)
- [阶段二：主写链补缺与审计补齐](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-write-chain-audit-gap-fill.md)
- [阶段三：上传、IM callback 与附件回写正式化](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-upload-im-writeback-formalization.md)
- [阶段四：实时事件与可观测性升级](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-realtime-observability-upgrade.md)
- [阶段五：财务、争议、风控与组织权限补缺](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-finance-dispute-org-gap-fill.md)
- [阶段六：承载、压测与高风险接口保护](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-capacity-rate-limit-guard.md)
- [主线 9 剩余阶段连续执行计划](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-standard-remaining-execution-plan.md)

### 主线 10：PC + H5 前台全页 UI 截图评审与改版

状态：`进行中`

目标：

- 对 `frontend` 与 `frontend_mobile_h5` 的全部真实页面执行全页截图审查
- 完成基线评分、问题分级、分批改版、整端回归与二次截图复审

当前进度：

- 阶段一已完成：基线截图、评分总表、路由矩阵与跨页问题归纳已建档
- 阶段二至四已完成：共享壳层、PC / H5 分组改版与重点页面收口已完成首轮到三轮推进
- 阶段五进行中：整端复拍、评分复核、阻断项清零与主线收口正在推进，当前口径与主线 10 最新文档保持一致

主线计划：

- [PC + H5 前台全页 UI 截图评审与改版](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-30-frontend-ui-audit-mainline.md)
- [评分总表](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-30-frontend-ui-audit-scorecard.md)
- [截图清单与路由矩阵](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-30-frontend-ui-audit-route-matrix.md)

### 主线 11：Admin 全页 UI 截图评审与改版

状态：`已登记 / 待执行`

目标：

- 对管理台 `Auth / Dashboard / Users / Tasks / Compliance` 做一轮完整截图审查、评分建档、分批改版与整端回归
- 让后台页面回到“列表优先、抽屉承接、主工作区清晰”的治理端表达

主线计划：

- [Admin 全页 UI 截图评审与改版](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-30-admin-ui-audit-mainline.md)

### 主线 12：上线后增强项收口

状态：`已登记 / 待执行`

目标：

- 把当前已降级为非阻断的增强项，重新整理成持续推进主线
- 优先覆盖容量、上传、IM 附件治理、组织权限、后台治理、财务审计与争议仲裁深化

主线计划：

- [上线后增强项收口](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-30-post-launch-hardening-mainline.md)

## 阶段依赖与并行策略

- 同一主线内部按阶段推进，默认连续执行，不在单阶段完成点停住
- 阶段间可并行的分析、文档、前端、后端工作，默认使用 `superpowers`，并尽量使用 `5` 个 agent
- 当前线程已具备完整本地访问权限时，不重复确认本地权限
- 截图按需归档，不做分批量预抓
- 主线切换顺序固定为 `10 -> 11 -> 12`
- 主线切换时，先回写当前主线状态，再切入下一条主线

## 阶段收口标准

每阶段结束前必须至少完成：

1. 阶段结果记录
2. 风险与缺口说明
3. 对应验证命令
4. 根 `docs/` 更新
5. 四个子项目 `docs` 副本同步
6. 主线总计划状态回写
7. 下一阶段默认入口
8. 整端 UI 审查通过
9. 全量主路径功能回归通过

## 当前活跃主线

当前默认进入：

- `主线 10：PC + H5 前台全页 UI 截图评审与改版`

当前状态：

- 当前活跃主线：`主线 10：PC + H5 前台全页 UI 截图评审与改版`
- 当前活跃阶段：`阶段五：整端 UI 复审、阻断项清零、主线收口`
- 当前活跃切片：`切片三：阶段五终轮总复审与主线 10 收口（全端分数复核 / 剩余 P1 清单清零 / 最终 docs 同步）`
- 当前项目结论：主线 1-9 保持完成；主线 10 当前正式切入阶段五并继续推进整端 UI 收口；主线 11 与主线 12 已登记待执行，项目完成定义为主线 10、11、12 全部完成
- 当前默认下一步：`继续阶段五切片三，统一复核高频页与普通页分数门槛并清理剩余 P1；主线 10 收口后按 10 -> 11 -> 12 顺序切到主线 11`

## 阶段索引

- [连续阶段执行规则](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-continuous-phase-execution-rules.md)
- [H5 前台收口主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-h5-frontend-alignment-mainline.md)
- [PC / H5 共享数据层与运行时收口主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-shared-runtime-alignment-mainline.md)
- [spring-app + MySQL 正式主链接管主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-spring-app-mainline.md)
- [spring-app 阶段六：双跑切换](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-spring-app-dual-run-cutover.md)
- [文件上传 / 实时事件 / IM 回写正式化主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-upload-realtime-im-mainline.md)
- [上传底座正式化](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-upload-foundation-formalization.md)
- [IM 回调 / 回写第一批](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-im-callback-writeback-first-batch.md)
- [IM 写链正式化](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-im-write-chain-formalization.md)
- [业务实时事件正式化](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-business-realtime-events-formalization.md)
- [审批 / 财务 / 争议主链](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-finance-dispute-mainline.md)
- [阶段一：审批 / 财务状态冻结](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-approval-financial-state-freeze.md)
- [阶段二：审批中心正式化](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-approval-center-formalization.md)
- [阶段三：请款最小闭环](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-claim-minimum-closure.md)
- [阶段四：开票与对账](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-invoice-reconciliation-minimum-closure.md)
- [阶段五：结算执行](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-settlement-execution.md)
- [阶段六：争议与风控升级](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-dispute-risk-upgrade.md)
- [上线准备与全链回归主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-launch-readiness-mainline.md)
- [阶段一：合同与数据回归](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-launch-contract-data-regression.md)
- [阶段二：稳定性与可观测性](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-launch-stability-observability.md)
- [阶段三：上线前通过条件冻结](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-launch-go-live-criteria-freeze.md)
- [达到上线标准主线](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-standard-mainline.md)
- [阶段一：认证与权限正式化](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-auth-permission-formalization.md)
- [阶段二：主写链补缺与审计补齐](/Users/huangcongqiang/Desktop/products/youqinggong/docs/superpowers/plans/2026-03-29-go-live-write-chain-audit-gap-fill.md)
