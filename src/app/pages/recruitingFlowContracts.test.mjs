import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const read = (file) => readFileSync(resolve(currentDir, file), 'utf8');

const recruitingSource = read('EnterpriseRecruiting.tsx');
const taskDetailsSource = read('TaskDetails.tsx');
const taskApplySource = read('TaskApply.tsx');
const workspaceSource = read('ContractWorkspace.tsx');
const acceptanceSource = read('AcceptanceCenter.tsx');
const talentAcceptanceSource = read('TalentAcceptance.tsx');
const taskPublishSource = read('TaskPublish.tsx');
const enterpriseDashboardSource = read('EnterpriseDashboard.tsx');
const layoutSource = read('../Layout.tsx');
const routesSource = read('../routes.tsx');
const talentDashboardSource = read('TalentDashboard.tsx');
const talentNotificationsSource = read('TalentNotifications.tsx');
const enterpriseContractsSource = read('EnterpriseContracts.tsx');
const contractChatSource = read('ContractChat.tsx');
const interviewTimeSource = read('../utils/interviewTime.ts');
const earlyCompletionRequestGuard = workspaceSource.slice(
  workspaceSource.indexOf('const canRequestEarlyCompletion'),
  workspaceSource.indexOf('const canTalentResolveEarlyCompletion')
);

assert(
  recruitingSource.includes('role="dialog"')
    && recruitingSource.includes('aria-modal="true"')
    && recruitingSource.includes('先填写面试时间。')
    && recruitingSource.includes('先填写腾讯会议号。')
    && !recruitingSource.includes("meetingCode: '线上会议待同步'")
    && !recruitingSource.includes('defaultInterviewAt()'),
  'EnterpriseRecruiting should collect interview details in a modal and stop sending placeholder invite data.'
);

assert(
  recruitingSource.includes('isKnownInterviewTimeInPast(inviteDraft.interviewAt)')
    && recruitingSource.includes('PAST_INTERVIEW_TIME_MESSAGE')
    && interviewTimeSource.includes('parseKnownInterviewTime')
    && interviewTimeSource.includes('面试时间不能早于当前时间。'),
  'EnterpriseRecruiting should block parseable past interview times before sending invites.'
);

assert(
  recruitingSource.includes('applicant.avatar ?')
    && recruitingSource.includes("applicant.name.slice(0, 1) || '人'"),
  'EnterpriseRecruiting should show a stable applicant initial when avatar data is missing.'
);

assert(
  recruitingSource.includes('inviteListButtonClass')
    && recruitingSource.includes('bg-indigo-50 text-indigo-700')
    && recruitingSource.includes('inviteSubmitButtonClass')
    && recruitingSource.includes('bg-slate-900 text-white')
    && !recruitingSource.includes('className="bg-indigo-600 hover:bg-indigo-700"'),
  'EnterpriseRecruiting interview invite actions should use coordinated, lower-saturation button colors.'
);

assert(
  taskDetailsSource.includes("actionStatus === 'INTERVIEW_PENDING'")
    && taskDetailsSource.includes("actionLabel = '回应面试邀约'")
    && taskDetailsSource.includes("actionRoute = `/talent/tasks?taskId=${encodeURIComponent(id)}`"),
  'TaskDetails should route interview-pending talent users to the real invite response surface.'
);

assert(
  taskApplySource.includes("actionStatus === 'INTERVIEW_PENDING'")
    && taskApplySource.includes("navigate(`/talent/tasks?taskId=${encodeURIComponent(taskId)}`)")
    && taskApplySource.includes('去处理面试邀约'),
  'TaskApply should not resubmit an application when the task is waiting for talent interview response.'
);

assert(
  workspaceSource.includes('summary.talentName, summary.talent')
    && workspaceSource.includes('summary.enterpriseName, summary.business'),
  'ContractWorkspace should use role-aware partner fields from workspace summary instead of falling back to unsynced partner text.'
);

assert(
  taskPublishSource.includes('里程碑金额配比')
    && taskPublishSource.includes('milestoneBudgets')
    && taskPublishSource.includes('里程碑金额配比合计必须等于 100%。'),
  'TaskPublish should collect per-milestone budget ratios before publishing.'
);

assert(
  taskPublishSource.includes('createAlipayTaskPublishPayment')
    && taskPublishSource.includes('getAlipayOrder')
    && taskPublishSource.includes('真实支付宝预付款')
    && taskPublishSource.includes('YOUQINGGONG_ALIPAY_RETURN')
    && taskPublishSource.includes('支付并发布任务')
    && !taskPublishSource.includes('confirmTaskAnalysis'),
  'TaskPublish final step should require a real Alipay prepayment before the task is formally published.'
);

assert(
  routesSource.includes('{ path: "publish", element: <TaskPublish /> }')
    && routesSource.includes('path: "/task/publish"')
    && routesSource.includes('<Navigate to="/enterprise/publish" replace />')
    && layoutSource.includes('useLocation')
    && layoutSource.includes('const location = useLocation()')
    && layoutSource.includes('const routeKey = `${location.pathname}${location.search}`')
    && layoutSource.includes('<Outlet key={routeKey} />'),
  'Enterprise publish route should render through a pathname-keyed outlet so in-app navigation and deep links show TaskPublish.'
);

assert(
  routesSource.includes('{ path: "records", element: <FinanceRecords /> }')
    && routesSource.includes('{ path: "settlement", element: <EnterpriseSettlement /> }')
    && routesSource.includes('{ path: "billing", element: <EnterpriseBilling /> }')
    && routesSource.includes('{ path: "invoices", element: <InvoiceManagement audience="enterprise" /> }')
    && routesSource.includes('{ path: "invoices", element: <InvoiceManagement audience="talent" /> }'),
  'Records, settlement, billing, and invoice routes should remain first-class deep-linkable pages.'
);

assert(
  workspaceSource.includes('当前节点金额')
    && workspaceSource.includes('已完成累计')
    && workspaceSource.includes('payoutRatio'),
  'ContractWorkspace should show current milestone amount, ratio, and accumulated completed amount.'
);

assert(
  earlyCompletionRequestGuard.includes('isEnterprise')
    && earlyCompletionRequestGuard.includes('Boolean(taskId)')
    && !earlyCompletionRequestGuard.includes('!isTaskConfirmationPending')
    && workspaceSource.includes("onClick={() => handleEarlyCompletion('request')}")
    && workspaceSource.includes('申请提前完成'),
  'Enterprise workspace should keep the early-completion submit button visible for task-scoped collaboration decisions.'
);

assert(
  !layoutSource.includes('label: "合同协作"')
    && !layoutSource.includes('label: "我的协作"')
    && !layoutSource.includes('path: "/enterprise/workspace"')
    && !layoutSource.includes('path: "/talent/workspace"'),
  'Workspace should be a task-scoped secondary page, not a top-level sidebar menu item.'
);

assert(
  workspaceSource.includes('请选择一个合作任务')
    && workspaceSource.includes('合同工作区现在作为单个任务的二级页面使用')
    && workspaceSource.includes("if (!requestedTaskId)")
    && workspaceSource.includes("getWorkspaceData(requestedTaskId)"),
  'ContractWorkspace should not load a default/latest task when no taskId is provided.'
);

assert(
  talentDashboardSource.includes('to="/talent/records?tab=ongoing"')
    && talentDashboardSource.includes('查看协作任务')
    && enterpriseContractsSource.includes('进入协作空间'),
  'Task lists should be the visible entry points into task-scoped workspace pages.'
);

assert(
  talentDashboardSource.includes('isPendingInterviewItem')
    && talentDashboardSource.includes('pendingInterview')
    && talentDashboardSource.includes('await refreshDashboardData()')
    && talentDashboardSource.includes('已同意面试，等待企业确认合作后再进入沟通。')
    && talentDashboardSource.includes("`/talent/tasks?taskId=${encodeURIComponent(app.taskId)}`")
    && talentDashboardSource.includes("app.pendingInterview ? '查看邀约'"),
  'Talent dashboard should never use a pending interview invite roomKey before the talent accepts it.'
);

assert(
  talentDashboardSource.includes('visibleInterviewInvites')
    && talentDashboardSource.includes('pendingInterviewInvites.slice(0, 3)')
    && talentDashboardSource.includes('handleRespondInvite')
    && talentDashboardSource.includes("handleRespondInvite(invite, 'REJECT')")
    && talentDashboardSource.includes('拒绝邀约')
    && !talentDashboardSource.includes('const latestInterviewInvite = pendingInterviewInvites[0] || null'),
  'Talent dashboard should list multiple pending interview invites and expose a reject action for each invite.'
);

assert(
  talentNotificationsSource.includes('isPendingInterviewNotification')
    && talentNotificationsSource.includes("const roomKey = pendingInterview ? '' : rawRoomKey")
    && talentNotificationsSource.includes("return taskId ? `/talent/tasks?taskId=${encodeURIComponent(taskId)}` : '/talent';"),
  'Talent notifications should route pending interview invites to the decision surface without carrying roomKey.'
);

assert(
  acceptanceSource.includes('useState<string | null>("S")'),
  'AcceptanceCenter should have a default rating selected so acceptance can be submitted without re-clicking the visible default grade.'
);

assert(
  !acceptanceSource.includes('setSelectedTaskId(cards[0].taskId)')
    && acceptanceSource.includes('选择一个合作任务后查看验收详情')
    && acceptanceSource.includes('先选择合作任务，再查看交付附件、验收意见、评级与结算流程。'),
  'Enterprise acceptance center should show the full task list first instead of auto-opening the first task.'
);

assert(
  !talentAcceptanceSource.includes('setSelectedTaskId(stringOf(items[0]?.taskId, items[0]?.id))')
    && talentAcceptanceSource.includes('normalizeTalentAcceptanceTask')
    && talentAcceptanceSource.includes('选择一个任务后查看交付与验收详情')
    && talentAcceptanceSource.includes('返回协作任务'),
  'Talent acceptance should work as a multi-task center and only open details after the user selects a task.'
);

assert(
  enterpriseDashboardSource.includes('修改任务内容')
    && enterpriseDashboardSource.includes('updateTaskContent(editingTask.id, editForm)')
    && enterpriseDashboardSource.includes('仅支持任务进入正式协作前修改'),
  'Enterprise dashboard should expose task content editing before formal collaboration starts.'
);

assert(
  workspaceSource.includes('提交里程碑交付物')
    && workspaceSource.includes('在这个里程碑提交交付物')
    && workspaceSource.includes('progressTargetNode')
    && workspaceSource.includes('talent-progress-form'),
  'Talent workspace should expose milestone-scoped deliverable submission.'
);

assert(
  contractChatSource.includes('补充信息 / 修改任务')
    && contractChatSource.includes('提出修改')
    && contractChatSource.includes("openTaskAction('update')")
    && contractChatSource.includes("openTaskAction('request_changes')")
    && contractChatSource.includes("action: taskActionMode")
    && contractChatSource.includes("confirmationPendingAudience !== 'none' || confirmationStatus === '已确认'")
    && contractChatSource.includes('发起任务变更')
    && !contractChatSource.includes('(!enterpriseWaitingTalentConfirm || confirmationVersion === 1)'),
  'ContractChat should expose enterprise task edits and talent change requests while pending or already confirmed.'
);
