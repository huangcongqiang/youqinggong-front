import fs from 'node:fs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readSource(fileName) {
  return fs.readFileSync(new URL(`./${fileName}`, import.meta.url), 'utf8');
}

const uiLocaleSource = fs.readFileSync(new URL('../utils/uiLocale.js', import.meta.url), 'utf8');
const apiSource = fs.readFileSync(new URL('../services/api.js', import.meta.url), 'utf8');
const uploadWorkflowSource = fs.readFileSync(new URL('../services/uploadWorkflow.js', import.meta.url), 'utf8');
const publicReadServiceSource = fs.readFileSync(
  new URL('../../../backend/spring-app/src/main/java/com/youqinggong/spring/service/PublicReadService.java', import.meta.url),
  'utf8'
);
const taskLifecycleServiceSource = fs.readFileSync(
  new URL('../../../backend/spring-app/src/main/java/com/youqinggong/spring/service/TaskLifecycleApplicationService.java', import.meta.url),
  'utf8'
);
const liveSyncSource = fs.readFileSync(new URL('../components/LiveSyncStatusBar.vue', import.meta.url), 'utf8');
const businessSource = readSource('BusinessPage.vue');
const workspaceSource = readSource('WorkspacePage.vue');
const talentMarketSource = readSource('TalentMarketPage.vue');
const recruitingSource = readSource('RecruitingPage.vue');

const onboardingSource = readSource('OnboardingPage.vue');
assert(
  onboardingSource.includes('setup-flow-shell')
    && onboardingSource.includes('onboarding-stepper')
    && onboardingSource.includes('企业资料')
    && onboardingSource.includes('联系人与合作偏好')
    && onboardingSource.includes('核对信息')
    && onboardingSource.includes('上传材料')
    && !onboardingSource.includes('publish-stepper-item'),
  'OnboardingPage should rebuild enterprise onboarding as a dedicated single-column setup flow instead of reusing the old publish stepper shell.'
);

assert(
  businessSource.includes('const sidebarMetrics = computed(() => {')
    && businessSource.includes("value: textOf(item?.value, item?.amount, item?.count, item?.total, '—')")
    && businessSource.includes('function textOf(...values) {')
    && businessSource.includes('enterprise-overview-strip')
    && businessSource.includes('enterprise-dashboard-grid')
    && businessSource.includes('const overviewCards = computed(() => {')
    && businessSource.includes('const collaborationModuleCards = computed(() => {')
    && !businessSource.includes('<header class="hero-band hero-band--client"'),
  'BusinessPage should define a local textOf helper and render enterprise home as a compact overview-strip plus main-column dashboard instead of the old oversized hero shell.'
);
assert(
  onboardingSource.includes('uploadStandaloneAttachmentAsset')
    && onboardingSource.includes('isUploadingMaterials')
    && onboardingSource.includes('uploadStandaloneAttachmentAsset(file,')
    && onboardingSource.includes('buildSubmittedMaterialUrls')
    && onboardingSource.includes('buildSubmittedMaterialFiles')
    && onboardingSource.includes('materials: buildSubmittedMaterialUrls(businessForm.materialFiles)')
    && onboardingSource.includes('materialFiles: buildSubmittedMaterialFiles(businessForm.materialFiles)')
    && onboardingSource.includes("map((file) => file.url || file.downloadUrl || '')")
    && onboardingSource.includes('url: file.url || file.downloadUrl ||')
    && onboardingSource.includes('单个文件建议不超过 200MB')
    && onboardingSource.includes('const totalSkills = talentSkillPayload.value.skills.length + talentSkillPayload.value.customSkills.length;')
    && onboardingSource.includes('请保持 2 到 6 个擅长方向。')
    && apiSource.includes('export function uploadStandaloneAttachmentAsset(file, options = {})')
    && apiSource.includes('uploadStandaloneAttachmentRuntime')
    && apiSource.includes('materialNames: Array.isArray(payload.materials)')
    && apiSource.includes('materialFiles: Array.isArray(payload.materialFiles) ? payload.materialFiles : []')
    && uploadWorkflowSource.includes('上传文件过大，请压缩后再试（单个文件建议不超过 200MB）。')
    && uploadWorkflowSource.includes('error?.status === 413'),
  'Onboarding should upload materials through the standalone upload workflow, enforce the talent skill-count guard locally, submit url strings in materials plus metadata objects in materialFiles, and translate oversized upload failures into a clear Chinese message.'
);

assert(
  workspaceSource.includes('files: uploadedFiles.map(progressFileReference).filter(Boolean)')
    && workspaceSource.includes('attachmentFiles: uploadedFiles')
    && workspaceSource.includes('ensureProgressSubmitted(result)')
    && workspaceSource.includes("result?.actionMessage")
    && apiSource.includes('function normalizeProgressFileReferences(files)')
    && apiSource.includes('files: fileReferences'),
  'Workspace progress submit should send legacy files as string references, send rich metadata through attachmentFiles, and keep the dialog open with a visible error when the mutation is rejected.'
);

assert(
  workspaceSource.includes('@click.stop="openSubmissionDialog(node)"')
    && workspaceSource.includes('const submissionDialogOpen = ref(false)')
    && workspaceSource.includes('const submissionDialogData = computed(() => normalizeTalentSubmission(submissionDialogNode.value))')
    && workspaceSource.includes('function openSubmissionDialog(node)')
    && workspaceSource.includes('function closeSubmissionDialog()')
    && workspaceSource.includes('submission-dialog-card'),
  'Workspace submission view should open a clear talent-submission dialog instead of silently only selecting the milestone.'
);

assert(
  workspaceSource.includes("submitProgressForm({ completeMilestone: true })")
    && workspaceSource.includes("{{ submittingProgress ? '推进中…' : '完成并进入下一里程碑' }}")
    && workspaceSource.includes('function canCompleteMilestoneProgress(node)')
    && workspaceSource.includes('function isAcceptanceMilestoneNode(node)')
    && workspaceSource.includes('v-if="canOpenAcceptanceMilestone(node)"')
    && workspaceSource.includes('function hasCompletedAcceptanceRating()')
    && workspaceSource.includes('已完成评级|待双方评分|评分已归档|已提前完成')
    && workspaceSource.includes('前往验收')
    && workspaceSource.includes('const shouldCompleteMilestone = options?.completeMilestone === true')
    && workspaceSource.includes('const percent = shouldCompleteMilestone ? 100 : resolveProgressSubmissionPercent(targetNode)')
    && workspaceSource.includes('if (isAcceptanceHandoffResult(result))')
    && !workspaceSource.includes('field-help')
    && workspaceSource.includes('button-primary--finish'),
  'Workspace progress dialog should expose an explicit complete-and-advance action, and the final acceptance milestone should hand off to the acceptance page instead of accepting more progress.'
);

assert(
  workspaceSource.includes('function mergeClosureIntoWorkspace(workspace, closureData)')
    && workspaceSource.includes('claimSummary: closureData.claimSummary || workspace.claimSummary')
    && workspaceSource.includes('invoiceSummary: closureData.invoiceSummary || workspace.invoiceSummary')
    && workspaceSource.includes('reconciliationSummary: closureData.reconciliationSummary || workspace.reconciliationSummary')
    && workspaceSource.includes('settlementSummary: closureData.settlementSummary || workspace.settlementSummary')
    && workspaceSource.includes('disputeSummary: closureData.disputeSummary || workspace.disputeSummary'),
  'Workspace overview should merge the closure finance summaries so the acceptance-and-settlement card stays in sync with record and settlement pages.'
);

assert(
  workspaceSource.includes('<span>文件与交付物</span>')
    && !workspaceSource.includes('workspace-card--activity')
    && !workspaceSource.includes('<span class="eyebrow">合同记录</span>')
    && !workspaceSource.includes('const activityFeed = computed(() =>')
    && !workspaceSource.includes('function normalizeReviewItems'),
  'Workspace should remove the duplicated contract-record activity module and keep files plus milestones as the main progress trail.'
);

assert(
  !workspaceSource.includes('workspace-card--composer')
    && !workspaceSource.includes('submitWorkspaceFeedback')
    && !workspaceSource.includes('submitFeedbackForm')
    && !workspaceSource.includes('showComposer')
    && !workspaceSource.includes('合同备注')
    && !workspaceSource.includes('企业备注'),
  'Workspace should remove the unclear enterprise contract-note composer from the main milestone flow.'
);

const publishSource = readSource('PublishTaskPage.vue');
assert(
  apiSource.includes("skills: Array.isArray(payload?.skills) ? payload.skills : []")
    && apiSource.includes("customSkills: Array.isArray(payload?.customSkills) ? payload.customSkills : []")
    && apiSource.includes("customSkills: Array.isArray(payload.customSkills) ? payload.customSkills : []"),
  'Shared skill tag plumbing should carry both skills and customSkills through register, onboarding, and publish API payloads.'
);

assert(
  publishSource.includes('publish-upwork-shell')
    && publishSource.includes('publishStep === 0')
    && publishSource.includes('publishStep === 1')
    && publishSource.includes('publishStep === 2')
    && publishSource.includes('publishStep === 3')
    && publishSource.includes('用 AI 拆分任务')
    && !publishSource.includes('让 AI 帮我起草')
    && !publishSource.includes('v-if="showAiPresetGrid" class="publish-preset-panel"')
    && !publishSource.includes('class="publish-preset-panel__header"')
    && !publishSource.includes('class="publish-preset-grid"')
    && !publishSource.includes('const showAiPresetGrid = ref(false);')
    && !publishSource.includes('showAiPresetGrid: showAiPresetGrid.value')
    && !publishSource.includes('showAiPresetGrid.value = true;')
    && !publishSource.includes('getAiPublishPresets')
    && publishSource.includes('保存草稿')
    && publishSource.includes('发布职位'),
  'PublishTaskPage should remove the unused AI preset gallery entirely so the rebuilt Post a job 0-4 wizard defaults to direct custom input, with only the AI split action remaining.'
);
assert(
  publishSource.includes("title: '任务已发布'")
    && publishSource.includes("body: '任务已发布，并且为您推荐了合适的人选。'")
    && publishSource.includes('const publishRecommendedTalents = computed(() => {')
    && publishSource.includes('publish-talent-carousel')
    && publishSource.includes("publish-talent-card__signal-label\">评分")
    && publishSource.includes('roleRouteMap.enterprise.talentDetail(slug)')
    && publishSource.includes('recommendedTalents: Array.isArray(response?.recommendedTalents) ? response.recommendedTalents : []')
    && publishSource.includes('matchingPreview: Array.isArray(response?.matchingPreview) ? response.matchingPreview : []'),
  'PublishTaskPage success state should show a real recommended-talent carousel from publish response data and route each card into enterprise talent detail.'
);
assert(
  publicReadServiceSource.includes('if (!"MATCHING".equalsIgnoreCase(taskStatus)')
    && publicReadServiceSource.includes('&& !"AI_ANALYZING".equalsIgnoreCase(taskStatus)')
    && publicReadServiceSource.includes('你可以先提交申请，平台会在 AI 分析完成后结合你的标签进入匹配。')
    && taskLifecycleServiceSource.includes('&& !"AI_ANALYZING".equals(taskStatus))'),
  'Task marketplace should allow AI_ANALYZING jobs to be applied for, and the backend request endpoint must accept the same status instead of blocking after the UI opens the application flow.'
);
assert(
  publishSource.includes('发布前先补全任务标题和任务简介。'),
  'PublishTaskPage should surface a validation error when title or brief is missing.'
);
assert(
  publishSource.includes("openErrorDialog('先补任务标题。')"),
  'PublishTaskPage should expose the first missing required publish step to the UI.'
);
assert(
  publishSource.includes('preferences: [],')
    && publishSource.includes("preferences: Array.isArray(parsed.draft.preferences)")
    && publishSource.includes("Array.isArray(parsed.draft['条合作偏好'])")
    && publishSource.includes('高级偏好')
    && publishSource.includes('筛选问题')
    && !publishSource.includes('筛选问题s or 条合作偏好.')
    && !publishSource.includes('条合作偏好: [],'),
  'PublishTaskPage should keep collaboration preferences on the real preferences field and restore old local drafts without breaking the screening/preferences step.'
);
assert(
  publishSource.includes("if (normalized.includes('talent') || normalized.includes('market')) return '人才搜索'")
    && publishSource.includes("if (normalized.includes('detail') || normalized.includes('profile')) return '人才档案'")
    && publishSource.includes("if (normalized.includes('recommend') || normalized.includes('assistant')) return '助手推荐'")
    && publishSource.includes("if (normalized.includes('message') || normalized.includes('chat')) return '消息'")
    && publishSource.includes("if (normalized.includes('publish')) return '任务发布'")
    && publishSource.includes("if (normalized.includes('record') || normalized.includes('history')) return '合作记录'")
    && publishSource.includes("return '当前入口'"),
  'PublishTaskPage should translate entrySource into Chinese owner-first labels instead of title-casing unknown English source names into the UI.'
);
assert(
  publishSource.includes("const DRAFT_STORAGE_NAMESPACE = 'youqinggong.publish-task-draft'")
    && publishSource.includes("const DRAFT_SESSION_KEY = 'youqinggong.publish-task-session-key'")
    && publishSource.includes('function buildDraftStorageKey() {')
    && publishSource.includes('sessionStorage.getItem(DRAFT_SESSION_KEY)')
    && publishSource.includes('localStorage.setItem(')
    && publishSource.includes('buildDraftStorageKey()'),
  'PublishTaskPage should scope local draft storage keys instead of using one global key for every publish flow.'
);
assert(
  publishSource.includes("if (route.query.brief) draft.brief = `${route.query.brief}`")
    && publishSource.includes("if (route.query.title) draft.title = `${route.query.title}`")
    && !publishSource.includes("if (route.query.brief && !draft.brief.trim())")
    && !publishSource.includes("if (route.query.title && !draft.title.trim())"),
  'PublishTaskPage should let the current entry query seed override old local draft content instead of silently restoring the wrong draft.'
);
assert(
  publishSource.includes("const sectionStateLabels = {")
    && publishSource.includes("ready: '已就绪'")
    && !publishSource.includes("项已就绪: '已就绪'"),
  'PublishTaskPage should map the real ready state key so review badges do not render blank.'
);
assert(
  publishSource.includes('async function submitJobPost() {')
    && publishSource.includes('if (isPublishing.value) return'),
  'PublishTaskPage should guard submitJobPost itself against duplicate publish clicks.'
);
assert(
  publishSource.includes('const currentStep = publishStep.value;')
    && publishSource.includes('publishStep.value = currentStep === 1 ? 2 : 3;')
    && !publishSource.includes('draft.screeningQuestions = result.recommendations.slice')
    && publishSource.includes('const normalizedAnalysisModules = computed(() => {')
    && publishSource.includes('const normalizedAnalysisRecommendations = computed(() => {')
    && publishSource.includes('publish-analysis-module-list'),
  'PublishTaskPage should return AI-assisted flows to the budget step, stop stuffing AI recommendations into screening questions, and render normalized AI output instead of raw payload strings.'
);
assert(
  apiSource.includes('function normalizeAiDecomposeResponse(payload) {')
    && apiSource.includes('JSON.parse(trimmed)')
    && apiSource.includes('modules: normalizedModules')
    && apiSource.includes('recommendations: normalizedRecommendations'),
  'analyzeTaskBrief responses should be normalized before the UI consumes them so structured AI payloads do not leak as raw JSON strings.'
);
assert(
  publishSource.includes('按时计费')
    && publishSource.includes('固定总价')
    && publishSource.includes('补充说明')
    && publishSource.includes('发布优先展示职位')
    && publishSource.includes('当前还没有生成 AI 拆分建议。')
    && publishSource.includes('刷新 AI 建议')
    && publishSource.includes('标准 / 优先展示 / 草稿')
    && publishSource.includes('这里只处理发布方式、优先展示与草稿。')
    && !publishSource.includes('Hourly rate')
    && !publishSource.includes('Fixed price')
    && !publishSource.includes('Screening questions')
    && !publishSource.includes('Featured 职位')
    && !publishSource.includes('Post a job 3')
    && !publishSource.includes('optional 字段'),
  'PublishTaskPage should keep the rebuilt wizard fully localized instead of leaving English budget, review, or finalize labels in the enterprise publish flow.'
);
assert(
  publishSource.includes('publish-optional-card publish-optional-card--notes')
    && publishSource.includes('如果还有额外说明、交付限制或合作备注，可以直接写在这里。')
    && !publishSource.includes('publish-review-sections')
    && !publishSource.includes('toggleReviewSection(')
    && !publishSource.includes('可选模块 01')
    && !publishSource.includes('可选模块 05'),
  'PublishTaskPage should keep review focused on core summary plus a directly visible notes field instead of a large collapsible optional-module system.'
);
assert(
  uiLocaleSource.includes('function readDocumentLocale(')
    && uiLocaleSource.includes("document.documentElement.classList.add('notranslate')")
    && !uiLocaleSource.includes('new MutationObserver(')
    && !uiLocaleSource.includes('observer.observe('),
  'desktop uiLocale should honor document language and must not keep a MutationObserver that fights browser translation or causes flicker.'
);

const messagesSource = readSource('MessagesPage.vue');
assert(
  messagesSource.includes("const errorMessage = ref('')")
    && messagesSource.includes('errorMessage.value = payload.requestError'),
  'MessagesPage should surface contract inbox request errors explicitly.'
);
assert(
  messagesSource.includes('const originSourceValue = computed(')
    && messagesSource.includes("originSource: sameTask ? (originSourceValue.value || 'messages') : 'messages'"),
  'MessagesPage should preserve originSource when staying inside the same contract thread.'
);

const acceptanceSource = readSource('AcceptancePage.vue');
assert(
  acceptanceSource.includes('acceptanceResult.requestError || acceptanceResult.nextStep')
    || acceptanceSource.includes('resultMessage(acceptanceResult)'),
  'AcceptancePage should render requestError when acceptance submission fails.'
);
assert(
  acceptanceSource.includes('const isSubmittingAcceptance = ref(')
    && acceptanceSource.includes('const isSubmittingGrade = ref(')
    && acceptanceSource.includes('const isSubmittingReview = ref('),
  'AcceptancePage should track review submission state to prevent duplicate clicks.'
);
assert(
  acceptanceSource.includes("note: '主要目标已经完成，合同记录也已经齐了，可以继续进入结算。'")
    && acceptanceSource.includes("reviewContent: '需求说明清楚，反馈节奏及时，整体协作过程推进得比较顺畅。'")
    && !acceptanceSource.includes('The main goals were achieved')
    && !acceptanceSource.includes('The brief was clear'),
  'AcceptancePage should not expose English default grade/review draft copy in the acceptance flow.'
);
assert(
  acceptanceSource.includes("const dialogErrorMessage = computed(() => actionErrorMessage.value || '');")
    && acceptanceSource.includes('stopBusinessLiveSync = startBusinessLiveSync({')
    && !acceptanceSource.includes('<LiveSyncStatusBar')
    && !acceptanceSource.includes('liveSyncStatus')
    && !acceptanceSource.includes('liveSyncError')
    && acceptanceSource.includes("if (acceptanceTradingBlocked.value) {\n    return '当前先处理账户限制，解除后再回来继续验收、评级和反馈。';")
    && !acceptanceSource.includes('当前先处理账户限制，再回来继续验收'),
  'AcceptancePage should keep action errors single-sourced in the dialog while keeping live sync silent in the background.'
);
assert(
  !acceptanceSource.includes('验收完成后再打开结算')
    && !acceptanceSource.includes('结算衔接')
    && !acceptanceSource.includes('acceptance-finance-panel'),
  'AcceptancePage should not render the redundant settlement handoff panel inside the acceptance flow.'
);
assert(
  acceptanceSource.includes('isUnavailable: true,')
    && acceptanceSource.includes('<template v-if="page?.isUnavailable">')
    && acceptanceSource.includes('当前验收内容暂时不可用')
    && acceptanceSource.includes("const acceptanceUnavailableRoute = computed(() => acceptanceBackRoute.value || (isEnterprise.value ? roleRouteMap.enterprise.home : roleRouteMap.talent.home));"),
  'AcceptancePage should render a true blocking unavailable state when the page context fails instead of keeping the rest of the acceptance surface visible.'
);
assert(
  !acceptanceSource.includes(':tabs="hasShellContext ? acceptanceShellTabs : []"')
    && !acceptanceSource.includes('const acceptanceShellTabs = computed')
    && !acceptanceSource.includes("workspaceRoute.value ? { label: '概览'"),
  'AcceptancePage should not render contract shell tabs inside the acceptance detail surface.'
);
assert(
  acceptanceSource.includes("const showGradeForm = computed(() => !acceptanceTradingBlocked.value && isEnterprise.value && isGradePending.value);")
    && acceptanceSource.includes("const showReviewForm = computed(() =>\n  !acceptanceTradingBlocked.value")
    && acceptanceSource.includes("v-else-if=\"acceptanceTradingBlocked\"")
    && acceptanceSource.includes('当前动作已锁定'),
  'AcceptancePage should not keep interactive acceptance, grading, or review forms visible when the account is blocked.'
);
assert(
  acceptanceSource.includes("return labelForObjectPageSource(source, '返回上一页');")
    && !acceptanceSource.includes("labelForObjectPageSource(source, 'Back')"),
  'AcceptancePage should keep the back CTA localized instead of falling back to an English label.'
);
assert(
  acceptanceSource.includes('function normalizeAcceptanceStatusLabel(value) {')
    && acceptanceSource.includes("'Waiting on client rating': '待企业评级'")
    && acceptanceSource.includes("const earlyCompletionStatusLabel = computed(() => normalizeAcceptanceStatusLabel(earlyCompletion.value?.status || '待企业评级'));")
    && (acceptanceSource.includes("const acceptanceSummaryStatusLabel = computed(() => normalizeAcceptanceStatusLabel(page.value?.summary?.status || '待验收'));")
      || acceptanceSource.includes('const isAcceptanceExecutionPhase = computed(() => {')
      || acceptanceSource.includes("? '执行中'"))
    && !acceptanceSource.includes("value: normalizeAcceptanceStatusLabel(String(source.status || '未开始').trim() || '未开始')"),
  'AcceptancePage should normalize backend status strings before showing them in pills and summary cards.'
);
assert(
  acceptanceSource.includes('const deliveryCompletionPercent = computed(() => {')
    && acceptanceSource.includes("String(item?.label || '').includes('交付完成度')")
    && acceptanceSource.includes("return deliveryCompletionPercent.value >= 100 && !alreadyAccepted && !deliveryGrade.value && !isGradePending.value;")
    && taskLifecycleServiceSource.includes('repairLegacyExecutionStateIfNeeded(context.task());\n        syncAcceptanceStatusFromFullDelivery(context.task());\n        if (!"PENDING_ACCEPTANCE".equalsIgnoreCase')
    && taskLifecycleServiceSource.includes('private void syncAcceptanceStatusFromFullDelivery(TaskEntity task) {')
    && taskLifecycleServiceSource.includes('private void syncAcceptanceStatusFromActiveMilestone(TaskEntity task, TaskMilestoneEntity activeMilestone) {')
    && taskLifecycleServiceSource.includes('task.setTaskStatus("PENDING_ACCEPTANCE");')
    && taskLifecycleServiceSource.includes('task.setAcceptanceStatus("PENDING_CONFIRM");'),
  'Acceptance flow should surface the confirm-acceptance action when delivery is 100%, and backend should repair active acceptance milestones into pending acceptance before submission.'
);
assert(
  acceptanceSource.includes("function normalizeAcceptanceMutationStatusLabel(value, fallback = '处理中') {")
    && acceptanceSource.includes("result?.actionMessage")
    && acceptanceSource.includes("result?.actionBlocked")
    && acceptanceSource.includes("acceptanceResult.value = result;")
    && acceptanceSource.includes("} catch (error) {\n    const message = error?.message || '验收确认暂时无法提交。';")
    && acceptanceSource.includes("const acceptanceResultStatusLabel = computed(() => normalizeAcceptanceMutationStatusLabel(acceptanceResult.value?.status, '已同步'));")
    && acceptanceSource.includes("const gradeResultStatusLabel = computed(() => normalizeAcceptanceMutationStatusLabel(gradeResult.value?.status, '已同步'));")
    && acceptanceSource.includes("const reviewResultStatusLabel = computed(() => normalizeAcceptanceMutationStatusLabel(reviewResult.value?.status, '已同步'));")
    && acceptanceSource.includes('<h3>{{ acceptanceResultStatusLabel }}</h3>')
    && acceptanceSource.includes('<h3>{{ gradeResultStatusLabel }}</h3>')
    && acceptanceSource.includes('<h3>{{ reviewResultStatusLabel }}</h3>'),
  'AcceptancePage should not surface raw backend mutation statuses like FAILED or SUCCESS in the sync result cards.'
);
assert(
  acceptanceSource.includes('function normalizeReviewRoleLabel(item = {}) {')
    && acceptanceSource.includes('function latestReviewItemForAudience(audienceKey) {')
    && acceptanceSource.includes("const latestEnterpriseToTalentReview = computed(() => latestReviewItemForAudience('enterprise'));")
    && acceptanceSource.includes("const latestTalentToBusinessReview = computed(() => latestReviewItemForAudience('talent'));")
    && !acceptanceSource.includes('const reviewHistoryItems = computed(() =>')
    && !acceptanceSource.includes('title="验收记录和反馈历史"'),
  'AcceptancePage should remove the feedback-history panel while keeping normalized latest-review checks for gating.'
);
assert(
  acceptanceSource.includes('function reviewSortTimestamp(item = {}) {')
    && acceptanceSource.includes('function latestReviewItemForAudience(audienceKey) {')
    && acceptanceSource.includes('sort((left, right) => reviewSortTimestamp(right) - reviewSortTimestamp(left))')
    && acceptanceSource.includes("const latestEnterpriseToTalentReview = computed(() => latestReviewItemForAudience('enterprise'));")
    && acceptanceSource.includes("const latestTalentToBusinessReview = computed(() => latestReviewItemForAudience('talent'));"),
  'AcceptancePage should determine the latest review by timestamp instead of trusting backend array order.'
);
assert(
  acceptanceSource.includes('acceptanceResult.value = null;')
    && acceptanceSource.includes('gradeResult.value = null;')
    && acceptanceSource.includes('reviewResult.value = null;')
    && acceptanceSource.includes('clearActionError();'),
  'AcceptancePage should clear stale local submission results before refreshing or changing context.'
);

const talentDetailSource = readSource('TalentDetailPage.vue');
assert(
  talentDetailSource.includes("const errorMessage = ref('')")
    && talentDetailSource.includes('errorMessage.value = payload.requestError'),
  'TalentDetailPage should surface request errors instead of silently falling back to an empty profile.'
);
assert(
  talentDetailSource.includes("const profileLoading = ref(true);")
    && talentDetailSource.includes("v-else-if=\"!profile\"")
    && talentDetailSource.includes('当前人才档案暂时不可用')
    && talentDetailSource.includes("profile.value = null;")
    && talentDetailSource.includes("profileLoading.value = false;"),
  'TalentDetailPage should render explicit loading/unavailable states instead of leaving a blank or fake-available profile surface when the request fails.'
);
assert(
  talentDetailSource.includes("const candidateErrorMessage = ref('');")
    && talentDetailSource.includes('candidateErrorMessage.value = payload.requestError')
    && talentDetailSource.includes('可复用任务暂时不可用')
    && talentDetailSource.includes('先回到人才搜索，或稍后再回来继续从已有任务发起沟通。'),
  'TalentDetailPage should surface reusable-task request failures as a real unavailable state instead of pretending there are simply no reusable tasks.'
);
assert(
  talentDetailSource.includes('roleRouteMap.enterprise.publishWithTalent({ talentUserId: profile.talentUserId, slug: profile.slug, name: profile.name })')
    && talentDetailSource.includes('先发布任务')
    && talentDetailSource.includes('再从那份任务里继续发起沟通'),
  'TalentDetailPage should keep reusable-task empty and unavailable states anchored to a direct publish-task CTA instead of leaving only explanatory copy.'
);
assert(
  talentDetailSource.includes("collaborationCandidates.value = [];")
    && talentDetailSource.includes("candidateErrorMessage.value = '';")
    && talentDetailSource.includes('try {')
    && talentDetailSource.includes("candidateErrorMessage.value = error?.message || '可复用任务暂时不可用，请稍后再试。';")
    && talentDetailSource.includes("errorMessage.value = error?.message || '当前人才档案暂时不可用，请稍后再试。';")
    && talentDetailSource.includes('profileLoading.value = false'),
  'TalentDetailPage should clear stale candidate data and catch thrown profile/candidate request errors instead of getting stuck in loading or leaking old task rows.'
);
assert(
  talentDetailSource.includes("collaborationErrorMessage.value = '协作已经创建，但消息入口还没同步好，请稍后再试。';")
    && !talentDetailSource.includes("path: roleRouteMap.enterprise.messages"),
  'TalentDetailPage should not fall back to a generic messages list when collaboration succeeds without a room or nextRoute.'
);

const talentSource = readSource('TalentPage.vue');
assert(
  talentSource.includes('getFreelancerCollaborationInboxData'),
  'TalentPage should request freelancer collaboration inbox data for application, invitation, and offer summaries.'
);
assert(
  talentSource.includes('申请 / 面试 / 合作')
    && talentSource.includes('const attentionPrimaryRoute = computed(() => attentionCards.value[0]?.route || roleRouteMap.talent.messages)')
    && talentSource.includes('const inboxPrimaryRoute = computed(() => proposalItems.value[0]?.route || invitationItems.value[0]?.route || offerItems.value[0]?.route || roleRouteMap.talent.messages)'),
  'TalentPage should surface collaboration inbox entry points around application, interview, and cooperation states without keeping the extra assistant prompt card.'
);
assert(
  talentSource.includes('function isInterviewInvitationItem(item = {})')
    && talentSource.includes('function talentInviteNotificationRoute(item = {})')
    && talentSource.includes("path: roleRouteMap.talent.notifications")
    && talentSource.includes("source: 'recruiting'")
    && talentSource.includes("group: 'tasks'")
    && talentSource.includes("cta: '查看面试邀约'"),
  'TalentPage should send interview invite cards back into the notification confirmation surface instead of routing talent users into workspace directly.'
);

const assistantSource = readSource('AssistantPage.vue');
assert(
  assistantSource.includes('assistant-entry-shell')
    && assistantSource.includes('assistant-entry-priority')
    && assistantSource.includes('assistant-entry-secondary-grid')
    && assistantSource.includes('assistant-tool-shell')
    && assistantSource.includes('选择这次要让 AI 帮你完成的动作')
    && assistantSource.includes('进入真实发任务流程')
    && assistantSource.includes('任务拆分')
    && assistantSource.includes('人才匹配')
    && assistantSource.includes('消息起草')
    && assistantSource.includes('验收说明')
    && assistantSource.includes('记录总结')
    && assistantSource.includes('先把老板的需求拆清楚')
    && assistantSource.includes('const toolConfigs = {')
    && assistantSource.includes("'talent-fit'")
    && assistantSource.includes("'message-draft'")
    && assistantSource.includes("'review-draft'")
    && assistantSource.includes("'record-summary'")
    && assistantSource.includes('开始拆分')
    && assistantSource.includes('开始生成')
    && assistantSource.includes('带到发布流程')
    && assistantSource.includes('带到消息页')
    && assistantSource.includes('带到验收页')
    && assistantSource.includes('带到合作记录')
    && assistantSource.includes('重新输入内容')
    && !assistantSource.includes('Choose context')
    && !assistantSource.includes('请先从一个真实上下文页面打开 AI 助手'),
  'AssistantPage should become a simple enterprise entry surface with multiple single-purpose tool pages instead of the old context-attachment landing state or route-away placeholders.'
);

const clientOperationsSource = readSource('ClientOperationsPage.vue');
assert(
  clientOperationsSource.includes('const billingEntries = computed(() =>')
    && clientOperationsSource.includes("kind: 'billing-status'")
    && clientOperationsSource.includes("kind: 'billing-entry'")
    && clientOperationsSource.includes("primaryLabel: item?.actionTo ? textOf(item?.actionLabel, '继续处理账单状态') : '先看当前状态'")
    && clientOperationsSource.includes("if (mode.value === 'billing') {\n    return billingEntries.value;")
    && clientOperationsSource.includes("const billingPrimaryLabel = selectedRow.value.kind === 'billing-status' ? '继续处理账单状态' : '打开账单记录';")
    && clientOperationsSource.includes('<span class="eyebrow">账单缺口</span>')
    && !clientOperationsSource.includes('Transaction review')
    && !clientOperationsSource.includes('How to use this page')
    && clientOperationsSource.includes('当前没有关联合同')
    && clientOperationsSource.includes('const router = useRouter()'),
  'ClientOperationsPage should keep billing on billing-specific rows instead of relabeling contract rows as billing entries.'
);
assert(
  clientOperationsSource.includes('const actionableActivationItems = computed(() =>')
    && clientOperationsSource.includes('const disabledActivationItems = computed(() =>')
    && clientOperationsSource.includes("displayLabel: textOf(item?.blockedReason, item?.note, item?.actionLabel, '当前暂不可操作')")
    && clientOperationsSource.includes("const billingBannerVisible = computed(() =>")
    && clientOperationsSource.includes('actionableActivationItems.value.length')
    && clientOperationsSource.includes('disabledActivationItems.value.length')
    && clientOperationsSource.includes("const showBillingGapCard = computed(() => mode.value === 'billing' && !billingBannerVisible.value && activationStatus.value.gapCount > 0);"),
  'ClientOperationsPage should keep the billing banner and gap card mutually exclusive and explain disabled actions with status copy instead of action-looking pills.'
);

const recordPageSource = readSource('RecordPage.vue');
assert(
  recordPageSource.includes("import ContractShellHeader from '../components/ContractShellHeader.vue'")
    && recordPageSource.includes('<ContractShellHeader')
    && recordPageSource.includes('v-if="hasShellContext"')
    && recordPageSource.includes('const recordShellTabs = computed(() => {')
    && recordPageSource.includes("{ label: '记录', current: true }")
    && recordPageSource.includes('function detailRoute(record) {')
    && recordPageSource.includes("roomKey: record?.roomKey || currentRoomKey.value")
    && recordPageSource.includes("originRecordId: textQuery('originRecordId') || recordId"),
  'RecordPage should keep the contract shell navigation and route context when opened from workspace, messages, or acceptance.'
);
assert(
  workspaceSource.includes("buildRoute(`${basePath.value}/records`, contextQuery.value)")
    && messagesSource.includes('return buildRoute(basePath, contextQuery.value)')
    && acceptanceSource.includes('path: isEnterprise.value ? roleRouteMap.enterprise.records : roleRouteMap.talent.records')
    && !workspaceSource.includes("currentRecordId.value ? `${basePath.value}/records/${encodeURIComponent(currentRecordId.value)}`")
    && !messagesSource.includes("const detailPath = currentRecordId.value ? `${basePath}/${encodeURIComponent(currentRecordId.value)}` : basePath")
    && !acceptanceSource.includes("`${isEnterprise.value ? roleRouteMap.enterprise.records : roleRouteMap.talent.records}/${encodeURIComponent(currentRecordId.value)}`"),
  'Workspace, messages, and acceptance tabs should open the records list first; users drill into a detail page from the list.'
);

const recordDetailSource = readSource('RecordDetailPage.vue');
assert(
  recordDetailSource.includes('const reviewItems = viewModel.value.confirmationHistory.map(')
    && !recordDetailSource.includes('confirmation记录')
    && recordDetailSource.includes('记录概览')
    && recordDetailSource.includes('申请阶段')
    && recordDetailSource.includes('面试阶段')
    && !recordDetailSource.includes(':tabs="recordShellTaskId ? recordShellTabs : []"')
    && !recordDetailSource.includes('const recordShellTabs = computed(() => {')
    && !recordDetailSource.includes("{ label: '全部记录', to: allRecordsRoute.value }")
    && recordDetailSource.includes('这条记录当前还是申请阶段。先看申请摘要和任务进展，再决定是否约面试、继续沟通或确认合作。')
    && recordDetailSource.includes('这条记录已经进入面试阶段，后续可以继续沟通、判断是否通过面试并确认合作。')
    && recordDetailSource.includes('当前缺少记录编号，暂时无法加载合作记录。')
    && recordDetailSource.includes('record-archive-cover')
    && recordDetailSource.includes('record-timeline-panel')
    && recordDetailSource.includes('record-side-rail')
    && recordDetailSource.includes('const visibleTimelineItems = timelineItems.filter((item) => !shouldHideProgressSyncTimelineItem(item, progressItems))')
    && recordDetailSource.includes('function shouldHideProgressSyncTimelineItem(item, progressItems = [])')
    && recordDetailSource.includes('max-width: none;')
    && recordDetailSource.includes('margin-inline: 0;')
    && !recordDetailSource.includes('width: min(calc(100vw - 56px), 1480px);')
    && !recordDetailSource.includes('下一步财务动作'),
  'RecordDetailPage should use the real confirmationHistory field and clearly separate application, interview, and confirmed collaboration states.'
);

assert(
  recordDetailSource.includes('ChatAttachmentPreviewModal')
    && recordDetailSource.includes('@click.stop.prevent="openRecordAttachment(asset, $event)"')
    && recordDetailSource.includes('function openRecordAttachment(asset, event = null)')
    && recordDetailSource.includes('function attachmentDownloadHref(attachment)')
    && !recordDetailSource.includes(':href="asset.downloadHref"'),
  'RecordDetailPage saved contract files should open the attachment preview/download modal instead of behaving like a file picker or raw anchor.'
);

const recordDetailViewModelSource = readSource('recordDetailViewModel.js');
assert(
  !recordDetailViewModelSource.includes("amountNote: 'Contract value'")
    && recordDetailViewModelSource.includes("amountNote: '合同金额'")
    && recordDetailViewModelSource.includes("item?.description || '已有工作更新。'")
    && recordDetailViewModelSource.includes("if (!text.startsWith('合作方：'))")
    && recordDetailViewModelSource.includes("return `发布方：${counterpart}`;")
    && recordDetailViewModelSource.includes("return `申请人才：${counterpart}`;")
    && recordDetailViewModelSource.includes("return `企业方：${counterpart}`;")
    && recordDetailViewModelSource.includes("return `人才方：${counterpart}`;"),
  'recordDetailViewModel should keep contract amount and work-update fallbacks localized.'
);

const notificationSource = readSource('NotificationCenterPage.vue');
assert(
  notificationSource.includes('roleRouteMap.talent.recordDetail(context.recordId)')
    && notificationSource.includes('roleRouteMap.enterprise.recordDetail(context.recordId)')
    && notificationSource.includes('function isExplicitApplicationTaskContext(context = {})')
    && notificationSource.includes('function explicitReviewOwnerKind(context = {}, preferredRoute)')
    && notificationSource.includes('function explicitGroupKeyForItem(item)')
    && notificationSource.includes('textOf(context.group)')
    && notificationSource.includes('(review|reviews|acceptance|grade|rating)')
    && notificationSource.includes("if (textOf(item?.taskId)) {")
    && notificationSource.includes("if (context.recordId && ownerKind === 'record')")
    && notificationSource.includes("if (context.taskId && ownerKind === 'review')"),
  'NotificationCenterPage should route review items with stronger explicit owner rules, recognize plural review signals, and avoid defaulting task-backed followups straight to messages.'
);
assert(
  notificationSource.includes('label: textOf(action?.label, ctaLabelForRoute(resolvedRoute, fallbackLabel))'),
  'NotificationCenterPage should keep contract action labels synchronized with the resolved destination route.'
);
assert(
  notificationSource.includes("const summaryEyebrow = computed(() => (isApprovalCenter.value ? '审批中心' : '通知中心'));")
    && notificationSource.includes("return isApprovalCenter.value ? '审批概览' : '通知概览';")
    && notificationSource.includes("isApprovalCenter.value ? '返回通知中心' : '返回审批中心'")
    && notificationSource.includes("const refreshLabel = computed(() => (isApprovalCenter.value ? '刷新审批' : '刷新通知'));")
    && notificationSource.includes("isApprovalCenter.value ? '审批同步暂时中断，页面会自动重连。' : '通知同步暂时中断，页面会自动重连。'")
    && notificationSource.includes("['notifications', 'messages', 'workspace', 'acceptance', 'matching', 'reviews', 'records', 'settlement', 'billing', 'followup'].includes(scope)"),
  'NotificationCenterPage should keep notification-shell copy owner-specific and refresh on record/settlement followup scopes instead of only approval-style events.'
);
assert(
  notificationSource.includes('function taskOwnerFallbackLabel()')
    && notificationSource.includes('function primaryActionFallbackLabel(groupKey)')
    && notificationSource.includes('function secondaryActionFallbackLabel(groupKey)')
    && notificationSource.includes("if (groupKey === 'announcements') {\n    return '查看公告';")
    && notificationSource.includes("if (groupKey === 'account') {\n    return '继续完善设置';")
    && notificationSource.includes("if (groupKey === 'tasks') {\n    return '查看任务';"),
  'NotificationCenterPage should use message-centered fallback CTA labels for announcement, task, and account reminders.'
);
assert(
  notificationSource.includes('function secondaryActionFallbackLabel(groupKey)')
    && notificationSource.includes("if (groupKey === 'announcements') {\n    return '稍后查看';")
    && notificationSource.includes("if (groupKey === 'account') {\n    return '查看账号状态';")
    && notificationSource.includes("if (groupKey === 'tasks') {\n    return '打开对应页面';")
    && !notificationSource.includes('Keep current entry'),
  'NotificationCenterPage should keep route-aware secondary fallback labels for the new message-center categories and remove the old Keep current entry wording.'
);
assert(
  notificationSource.includes("path: '/enterprise/recruiting'")
    && notificationSource.includes("source: 'notifications'")
    && notificationSource.includes('function talentRecruitingNotificationRoute(context = {})')
    && notificationSource.includes("path: roleRouteMap.talent.notifications")
    && notificationSource.includes("return '查看面试邀约';")
    && notificationSource.includes("taskId: textOf(item?.taskId")
    && notificationSource.includes('notification-message-header')
    && notificationSource.includes('notification-message-filters')
    && notificationSource.includes('notification-message-stream')
    && notificationSource.includes('notification-message-helper')
    && notificationSource.includes('notification-message-helper--invite')
    && notificationSource.includes("label: '公告'")
    && notificationSource.includes("label: '任务'")
    && notificationSource.includes("label: '账号'")
    && notificationSource.includes('查看公告、任务提醒与账号提醒。')
    && notificationSource.includes('通知里只保留消息提醒，不承担处理工作台角色。每条通知都能直接跳到对应页面继续处理。')
    && notificationSource.includes('真正处理申请请回工作台里的 `招聘申请` 入口。')
    && notificationSource.includes('面试邀约')
    && notificationSource.includes('同意面试')
    && notificationSource.includes('拒绝面试')
    && notificationSource.includes('respondRecruitingInterviewInvite')
    && notificationSource.includes('title: \'缺少申请人信息\'')
    && notificationSource.includes('payload?.requestError || payload?.success === false')
    && notificationSource.includes('talentUserId,')
    && recruitingSource.includes('任务 -> 申请人 -> 动作')
    && recruitingSource.includes('查看人才详情')
    && recruitingSource.includes('v-if="app.detailRoute"')
    && recruitingSource.includes('约面试')
    && recruitingSource.includes('先填写面试时间。')
    && recruitingSource.includes('先填写腾讯会议号。')
    && recruitingSource.includes('通过面试并确认合作')
    && !talentMarketSource.includes('确认合作并开启沟通')
    && publicReadServiceSource.includes('item.put("requestedTalentUserIds", requestedTalentUserIds);')
    && publicReadServiceSource.includes('item.put("requestedTalentSlugs", requestedTalentSlugs);'),
  'NotificationCenterPage should become a unified message feed while recruitment reminders still route enterprise users into a dedicated applicant-processing view with direct talent-detail routes.'
);
assert(
  notificationSource.includes('DesktopNotificationList')
    && notificationSource.includes('eyebrow="消息流"')
    && notificationSource.includes('notification-message-header')
    && notificationSource.includes('notification-message-filters')
    && notificationSource.includes('notification-message-stream')
    && !notificationSource.includes('<DesktopNotificationSummaryCard')
    && !notificationSource.includes('<aside class="glass-panel notification-center-sidebar')
    && !notificationSource.includes('<article class="glass-panel notification-center-context'),
  'NotificationCenterPage should remove the old processing-workbench shell and keep notifications in a single-column message stream.'
);
assert(
  liveSyncSource.includes("return '实时同步';")
    && liveSyncSource.includes("return '已切换为轮询';")
    && liveSyncSource.includes("return '同步已暂停';")
    && liveSyncSource.includes("return '同步已关闭';")
    && liveSyncSource.includes("return '连接中';")
    && liveSyncSource.includes('已重连')
    && !liveSyncSource.includes('Reconnect ')
    && !liveSyncSource.includes('Switched to polling')
    && !liveSyncSource.includes('Connecting'),
  'LiveSyncStatusBar should keep sync state copy in Chinese instead of leaking English status strings into workspace pages.'
);

assert(
  businessSource.includes('const hiringAttentionItems = computed(() => allAttentionItems.value.filter(isHiringInboxItem))')
    && businessSource.includes('function actionOwnerKind(item = {})')
    && businessSource.includes('function routeForNotificationsGroup(groupKey = \'all\', item = {})')
    && businessSource.includes('return mergeUniqueItems(['),
  'BusinessPage should move application and invite signals into Hiring inbox using structured owner rules and a stable hiring queue route instead of only deduplicating them from Action needed.'
);
assert(
  businessSource.includes('enterprise-overview-strip')
    && businessSource.includes('overview-card__label')
    && businessSource.includes("label: '待处理'")
    && businessSource.includes("label: '招聘申请'")
    && businessSource.includes("label: '进行中合作'")
    && businessSource.includes("label: '消息跟进'")
    && businessSource.includes('enterprise-dashboard-grid')
    && businessSource.includes('enterprise-dashboard-main')
    && businessSource.includes('enterprise-dashboard-side')
    && businessSource.includes('enterprise-focus-card')
    && businessSource.includes('<p class="upw-eyebrow">当前最该处理</p>')
    && businessSource.includes('enterprise-module-card')
    && businessSource.includes('推进工作。')
    && businessSource.includes('查看工作区、消息、验收和记录。')
    && businessSource.includes('enterprise-module-grid')
    && !businessSource.includes('<header class="hero-band hero-band--client"'),
  'BusinessPage should render enterprise home as a compact overview strip plus a main-column focus area with a dedicated collaboration module instead of the old oversized hero and summary rail shell.'
);
assert(
  businessSource.includes('const hiringInboxCards = computed(() => inboundItems.value.slice(0, 3))')
    && businessSource.includes("path: '/enterprise/recruiting'")
    && businessSource.includes("source: 'workspace'")
    && businessSource.includes('summary-strip summary-strip--queue')
    && businessSource.includes('summary-line__queue-head')
    && businessSource.includes('button-secondary button-secondary--small')
    && businessSource.includes('<span>申请</span>')
    && businessSource.includes('<span>邀请</span>')
    && businessSource.includes('<span>回复</span>')
    && businessSource.includes('<span v-if="currentWorkCountLabel" class="soft-pill">{{ currentWorkCountLabel }}</span>')
    && businessSource.includes('const currentWorkMode = computed(() => {')
    && businessSource.includes('const currentWorkCards = computed(() => {')
    && businessSource.includes('const currentWorkCountLabel = computed(() =>')
    && businessSource.includes('const showContractMessageLeadState = computed(() =>')
    && businessSource.includes('优先推进当前还在进行中的合同。')
    && businessSource.includes('先回到已经承载下一步动作的消息线程。')
    && businessSource.includes('处理申请')
    && businessSource.includes("return value > 0 ? String(value) : '—'"),
  'BusinessPage should surface recruiting as a workbench action that routes directly into recruiting while keeping hiring counts soft and current-work modules stable.'
);
assert(
  businessSource.includes(":class=\"item.kind ? `priority-item--${item.kind}` : ''\"")
    && businessSource.includes("eyebrow: '合同工作区'")
    && businessSource.includes("eyebrow: '消息线程'")
    && businessSource.includes("`${currentWorkCards.value.length} 条合同`")
    && businessSource.includes("`${currentWorkCards.value.length} 条会话`"),
  'BusinessPage current-work cards should differentiate contract and message objects in both visual treatment and count labels instead of flattening them into one generic open counter.'
);
assert(
  businessSource.includes("ctaForDashboardRoute(route, '处理申请')")
    && businessSource.includes("ctaForDashboardRoute(secondaryRoute, '继续处理')"),
  'BusinessPage hiring inbox should avoid generic next-step CTA copy and keep its primary route anchored to the hiring queue.'
);
assert(
  businessSource.includes('const currentWorkEmptyState = computed(() => {')
    && businessSource.includes("title: '招聘流程已经在推进'")
    && businessSource.includes("title: '进行中的合同已经在推进'")
    && businessSource.includes("title: '最近的会话已经承载下一步动作'")
    && businessSource.includes('<strong>{{ currentWorkEmptyState.title }}</strong>')
    && businessSource.includes('<p>{{ currentWorkEmptyState.copy }}</p>')
    && businessSource.includes('<router-link class="button-link" :to="currentWorkEmptyState.to">{{ currentWorkEmptyState.cta }}</router-link>')
    && businessSource.includes("label: hasDraftSignals.value ? '打开草稿' : '发布任务'"),
  'BusinessPage should keep current-work empty states and quiet-state hero CTAs aligned with the strongest real owner instead of always falling back to post-a-job copy.'
);
assert(
  businessSource.includes('<strong>{{ item.partner || item.title }}</strong>')
    && businessSource.includes('summary-line__subhead')
    && businessSource.includes('<router-link v-if="item.secondaryRoute" class="button-link" :to="item.secondaryRoute">{{ item.secondaryCta }}</router-link>'),
  'BusinessPage hiring inbox should surface partner, phase, and next-step actions in a queue-like line instead of flattening everything into one summary paragraph.'
);
assert(
  businessSource.includes('const showPublishingPrep = computed(() =>')
    && businessSource.includes('!hasCurrentWorkSignals.value && hasDraftSignals.value')
    && businessSource.includes("return '先处理当前决策'")
    && businessSource.includes("return '先处理招聘信号'")
    && businessSource.includes("return '继续推进当前协作'")
    && businessSource.includes('账单与记录')
    && businessSource.includes('概览只留最关键的轻量指标。')
    && businessSource.includes('surface-card surface-card--tight surface-card--quiet surface-card--supplemental surface-card--metrics')
    && businessSource.includes('metrics-grid metrics-grid--sidebar')
    && businessSource.includes('const sidebarMetrics = computed(() =>')
    && businessSource.includes('enterprise-dashboard-side')
    && businessSource.includes('grid-template-columns: minmax(0, 1.22fr) minmax(320px, 0.78fr);')
    && !businessSource.includes('Refine with Assistant'),
  'BusinessPage should keep draft-detection logic in data while rendering the right side as a stable lightweight metrics and records rail instead of switching back to the old hero-side shell.'
);
assert(
  !businessSource.includes('roleRouteMap.enterprise.messages">Messages</router-link>'),
  'BusinessPage hero should keep one primary action and avoid repeating Messages as another high-visibility support CTA.'
);

const approvalSource = readSource('ApprovalCenterPage.vue');
assert(
  approvalSource.includes('function approvalCtaLabelForRoute(')
    && approvalSource.includes("approvalCtaLabelForRoute(selectedPrimaryRoute.value, '打开审批')")
    && approvalSource.includes("const secondaryLabel = selectedItem.value?.secondaryActionLabel || '返回通知中心';"),
  'ApprovalCenterPage should keep approval CTA labels synchronized with the resolved destination route and reuse the same naming source for Entry actions.'
);

const desktopNotificationSource = readSource('NotificationCenterPage.vue');
assert(
  desktopNotificationSource.includes('function notificationRouteSource(key, item = {})')
    && desktopNotificationSource.includes('function notificationMessageGroupKey(legacyGroupKey, item = {})')
    && desktopNotificationSource.includes("if (key === 'reviews') {")
    && desktopNotificationSource.includes('const ownerKind = explicitReviewOwnerKind(item, item.route || item.to || item.link);')
    && desktopNotificationSource.includes("if (ownerKind === 'settlement' || ownerKind === 'record') {")
    && desktopNotificationSource.includes("if (ownerKind === 'review') {")
    && desktopNotificationSource.includes("if (key === 'matching') {\n    return 'recruiting';")
    && desktopNotificationSource.includes("if (key === 'followup') {")
    && desktopNotificationSource.includes("if (textOf(item?.financeAction) || textOf(item?.recordId)) {")
    && desktopNotificationSource.includes("if (textOf(item?.taskId)) {")
    && desktopNotificationSource.includes("return 'messages';")
    && desktopNotificationSource.includes("return 'announcements';")
    && desktopNotificationSource.includes("return 'account';")
    && desktopNotificationSource.includes("return 'tasks';")
    && desktopNotificationSource.includes('const selectedContextActions = computed(() => {')
    && desktopNotificationSource.includes('const deduped = [];')
    && desktopNotificationSource.includes('const seenPaths = new Set();')
    && desktopNotificationSource.includes('const seenLabels = new Set();')
    && desktopNotificationSource.includes('return secondaryPath && secondaryPath === primaryPath ? null : target;'),
  'NotificationCenterPage should keep route-aware CTA generation while remapping legacy notification sources into announcement, task, and account message categories.'
);
assert(
  desktopNotificationSource.includes("isApprovalCenter.value ? '审批同步暂时中断，页面会自动重连。' : '通知同步暂时中断，页面会自动重连。'")
    && desktopNotificationSource.includes("const summaryEyebrow = computed(() => (isApprovalCenter.value ? '审批中心' : '通知中心'));")
    && desktopNotificationSource.includes("const refreshLabel = computed(() => (isApprovalCenter.value ? '刷新审批' : '刷新通知'));")
    && desktopNotificationSource.includes('() => route.path,')
    && desktopNotificationSource.includes("router.replace({ path: route.path, query });")
    && desktopNotificationSource.includes('当前定位已失效')
    && desktopNotificationSource.includes('通知里只保留消息提醒，不承担处理工作台角色。每条通知都能直接跳到对应页面继续处理。')
    && desktopNotificationSource.includes('新的公告、任务提醒和账号提醒会继续汇总到这里。')
    && desktopNotificationSource.includes('切换分类，查看其它提醒。')
    && desktopNotificationSource.includes("isZeroState.value")
    && desktopNotificationSource.includes("const listTitle = computed(() => {")
    && desktopNotificationSource.includes("return `${groupLabel}通知`;")
    && desktopNotificationSource.includes("label: isApprovalCenter.value ? '返回通知中心' : '返回审批中心'")
    && !desktopNotificationSource.includes('Action needed now')
    && !desktopNotificationSource.includes('Action queue')
    && !desktopNotificationSource.includes('Refresh list')
    && desktopNotificationSource.includes('const resolvedRoomKey = String(resolved?.query?.roomKey || resolved?.query?.room || \'\').trim();')
    && desktopNotificationSource.includes('const needsConversationContext = (')
    && desktopNotificationSource.includes("resolvedPath.includes('/chat')")
    && desktopNotificationSource.includes("resolvedPath.includes('/room')")
    && desktopNotificationSource.includes("const needsWorkspaceContext = resolvedPath.includes('/workspace') && !resolvedTaskId;")
    && desktopNotificationSource.includes('这条入口缺少会话上下文，暂时无法打开。请从合同、通知详情或审批详情重新进入。'),
  'NotificationCenterPage should keep its shell copy localized and keep footer recovery actions aligned with the current owner.'
);
assert(
  desktopNotificationSource.includes('const candidate = (() => {')
    && desktopNotificationSource.includes('return secondaryPath && secondaryPath === primaryPath ? null : candidate;'),
  'NotificationCenterPage summary card should suppress the secondary action when it resolves to the same destination as the primary action.'
);
assert(
  desktopNotificationSource.includes('const selectedSecondaryAction = computed(() => {')
    && desktopNotificationSource.includes('if (selectedSecondaryAction.value?.to) {')
    && desktopNotificationSource.includes('if (selectedSecondaryAction.value?.label) {')
    && desktopNotificationSource.includes('selectedItem.value.highlights.slice(0, 2)')
    && desktopNotificationSource.includes('filteredItems.value.slice(0, 2)'),
  'NotificationCenterPage summary card should reuse the selected item secondary action and keep more than one current highlight in view.'
);
assert(
  desktopNotificationSource.includes('eyebrow="消息流"')
    && desktopNotificationSource.includes("countLabel: `${count} 项`")
    && desktopNotificationSource.includes('点开对应按钮继续处理。')
    && desktopNotificationSource.includes('当前还没有新的提醒。')
    && desktopNotificationSource.includes('notification-message-header')
    && desktopNotificationSource.includes('notification-message-filters')
    && desktopNotificationSource.includes('notification-message-stream')
    && !desktopNotificationSource.includes('Action needed now')
    && !desktopNotificationSource.includes('Action queue')
    && !desktopNotificationSource.includes('Refresh list')
    && !desktopNotificationSource.includes('Key takeaways'),
  'NotificationCenterPage should keep the high-exposure message-shell copy localized and avoid leaking the old processing-workbench language.'
);

const desktopWorkspaceContextSource = fs.readFileSync(
  new URL('../components/workspace/WorkspaceContextPanel.vue', import.meta.url),
  'utf8'
);
assert(
  !desktopWorkspaceContextSource.includes('class="button-primary" type="button" @click="emit(\'open-task-detail\')"')
    && desktopWorkspaceContextSource.includes('class="button-primary workspace-context-button"'),
  'Desktop WorkspaceContextPanel should keep Open workspace as the single object-level primary action instead of repeating it inside the message recap card.'
);
