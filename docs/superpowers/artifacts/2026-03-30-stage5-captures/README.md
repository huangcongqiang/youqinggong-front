# 2026-03-30 Stage 5 首轮复拍

本目录是主线 10 阶段五的正式归档，不依赖 `/tmp` 临时目录。后续继续时先读本目录里的有效图，再补当前切片缺失截图。

## 已保存截图

- `pc-task-market-stage5a.png`
- `pc-task-market-stage5f.png`
- `pc-task-market-stage5h.png`
- `pc-enterprise-onboarding-stage5a.png`
- `pc-enterprise-onboarding-stage5b.png`
- `pc-enterprise-onboarding-stage5e.png`
- `pc-enterprise-onboarding-stage5i.png`
- `pc-enterprise-approvals-stage5b.png`
- `pc-enterprise-notifications-stage5b.png`
- `pc-enterprise-talent-detail-stage5c.png`
- `pc-enterprise-record-detail-stage5b.png`
- `h5-publish-task-stage5a.png`
- `h5-publish-task-stage5e.png`
- `h5-talent-record-detail-stage5a.png`
- `h5-talent-record-detail-stage5b.png`
- `h5-talent-record-detail-stage5f.png`
- `h5-enterprise-onboarding-stage5a.png`
- `h5-enterprise-onboarding-stage5d.png`
- `h5-enterprise-onboarding-stage5e.png`
- `h5-talent-onboarding-stage5b.png`
- `h5-enterprise-talent-market-stage5c.png`
- `h5-enterprise-talent-detail-stage5c.png`

## 有效截图

- `pc-task-market-stage5h.png`
  - 已通过全新标签页和人才真实会话补到目标页，可直接作为当前切片最终评分证据。
- `h5-publish-task-stage5a.png`
  - 首轮有效图保留归档；本轮最新证据为 `h5-publish-task-stage5e.png`。
- `h5-publish-task-stage5e.png`
  - 已补到最新 UI 版本，可直接作为本轮最新评分证据。
- `pc-enterprise-onboarding-stage5i.png`
  - 已补到最新 UI 版本，可直接作为当前切片最终评分证据。
- `h5-talent-record-detail-stage5f.png`
  - 已通过全新标签页和人才真实会话补到目标页，可直接作为本轮最新评分证据。
- `h5-enterprise-onboarding-stage5e.png`
  - 已补到最新 UI 版本，可直接作为本轮最新评分证据。
- `pc-enterprise-approvals-stage5b.png`
  - 已补到第二批低分页与中心页的最新 UI 版本，可直接作为当前切片评分证据。
- `pc-enterprise-notifications-stage5b.png`
  - 已补到第二批低分页与中心页的最新 UI 版本，可直接作为当前切片评分证据。
- `pc-enterprise-talent-detail-stage5c.png`
  - 已补到第二批低分页与中心页的最新 UI 版本，可直接作为当前切片评分证据。
- `pc-enterprise-record-detail-stage5b.png`
  - 已补到第二批低分页与中心页的最新 UI 版本，可直接作为当前切片评分证据。
- `h5-talent-onboarding-stage5b.png`
  - 已补到第二批低分页与中心页的最新 UI 版本，可直接作为当前切片评分证据。
- `h5-enterprise-talent-market-stage5c.png`
  - 已补到第二批低分页与中心页的最新 UI 版本，可直接作为当前切片评分证据。
- `h5-enterprise-talent-detail-stage5c.png`
  - 已补到第二批低分页与中心页的最新 UI 版本，可直接作为当前切片评分证据。

## 失败取证

- `pc-enterprise-onboarding-stage5a.png`
  - 当前落到了首页/登录入口承接，不是最终目标对象页，需要下一轮修正截图入口。
- `h5-talent-record-detail-stage5a.png`
  - 当前落到了登录页，说明该入口的本地鉴权注入还不稳定，需要下一轮补可用截图。
- `h5-enterprise-onboarding-stage5a.png`
  - 当前落到了登录页，说明该入口的本地鉴权注入还不稳定，需要下一轮补可用截图。
- `pc-task-market-stage5e.png`
  - 当前被旧标签页企业会话污染，落到了企业工作台，不作为有效评分证据。
- `h5-talent-record-detail-stage5e.png`
  - 当前被旧标签页企业会话污染，落到了企业入驻，不作为有效评分证据。

## 当前归类

- 本轮最新有效图：`pc-task-market-stage5h.png`、`pc-enterprise-onboarding-stage5i.png`、`h5-publish-task-stage5e.png`、`h5-talent-record-detail-stage5f.png`、`h5-enterprise-onboarding-stage5e.png`
- 历史有效图：`pc-task-market-stage5a.png`、`pc-task-market-stage5f.png`、`h5-publish-task-stage5a.png`、`pc-enterprise-onboarding-stage5b.png`、`pc-enterprise-onboarding-stage5e.png`、`h5-talent-record-detail-stage5b.png`、`h5-enterprise-onboarding-stage5d.png`
- 本批失败图：`pc-enterprise-onboarding-stage5a.png`、`h5-talent-record-detail-stage5a.png`、`h5-enterprise-onboarding-stage5a.png`、`pc-task-market-stage5e.png`、`h5-talent-record-detail-stage5e.png`
- 第二批低分页与中心页有效图：`pc-enterprise-approvals-stage5b.png`、`pc-enterprise-notifications-stage5b.png`、`pc-enterprise-talent-detail-stage5c.png`、`pc-enterprise-record-detail-stage5b.png`、`h5-talent-onboarding-stage5b.png`、`h5-enterprise-talent-market-stage5c.png`、`h5-enterprise-talent-detail-stage5c.png`

## 继续时的优先顺序

1. 当前第二批低分页与中心页复拍已经补齐，可直接进入阶段五终轮总复审。
2. 下一步直接切到阶段五终轮总复审与主线 10 收口。
3. 继续把命中登录页 / 首页 / 错误页或被旧会话污染的结果当作失败取证保留，不再作为有效截图读取。
