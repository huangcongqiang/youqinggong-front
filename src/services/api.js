import {
  aiPublishPresetMockData,
  mockAnalyzeTaskBrief,
  buildWorkspaceFeedbackFallback,
  webMockData
} from '../data/mock';
import { roleRouteMap } from '../utils/roleRoutes';
import { buildOrderRecordsFallback } from '../pages/recordData';
import {
  buildApprovalCenterFallbackFromBusiness,
  normalizeApprovalCenterPayload
} from './approvalCenterPayload';
import { normalizeWorkspacePayload } from './workspacePayload';
import {
  clearStoredAuthSession,
  getStoredAuthExpiresAt,
  getStoredAuthToken,
  getStoredAuthUser,
  hasFreshStoredAuthSession,
  isAuthSessionExpired,
  persistAuthSession
} from './authSession';
import { attachRequestError, buildAuthHeaders, readResponsePayload } from './httpClient';
import { resolveApiBase } from './apiBase';
import { uploadTaskAttachmentRuntime } from './uploadWorkflow';

export {
  clearStoredAuthSession,
  getStoredAuthExpiresAt,
  getStoredAuthToken,
  getStoredAuthUser,
  hasFreshStoredAuthSession,
  isAuthSessionExpired,
  persistAuthSession
} from './authSession';

const API_BASE = resolveApiBase(import.meta.env, typeof window === 'undefined' ? globalThis : window);

async function readJson(path, fallback, options) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: buildAuthHeaders(getStoredAuthToken, options?.headers || {})
    });
    const payload = await readResponsePayload(response);
    if (!response.ok) {
      const error = new Error(`Request failed: ${response.status}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  } catch (error) {
    return attachRequestError(fallback, error);
  }
}

async function writeJson(path, fallback, body) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: buildAuthHeaders(getStoredAuthToken, {
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    });
    const payload = await readResponsePayload(response);
    if (!response.ok) {
      const error = new Error(`Request failed: ${response.status}`);
      error.status = response.status;
      error.payload = payload;
      throw error;
    }
    return payload;
  } catch (error) {
    return attachRequestError(fallback, error);
  }
}

const onboardingFallback = {
  business: ['上传营业执照或企业证明', '补充联系人与合作偏好', '等待后台审核通过后再发布任务'],
  talent: ['填写简介、技能和作品', '设置接单日历', '若申请虚拟企业则补身份证等实名材料']
};

function buildEmptyTaskRoomFallback(roomKey = '') {
  return {
    roomKey,
    taskId: '',
    title: '还没有聊天',
    stage: '等待任务开始',
    focus: '当企业发布任务并选中人才后，新的协商房间会出现在这里。',
    taskDetail: null,
    taskRoom: {
      taskId: '',
      provider: 'TENCENT_IM',
      providerRoomId: '',
      groupType: 'Public',
      joinOption: 'FreeAccess',
      status: 'INACTIVE'
    },
    members: [],
    participants: [],
    quickReplies: [],
    quickRepliesByAudience: {
      enterprise: [],
      talent: []
    },
    taskTags: [],
    pendingActions: [],
    messages: []
  };
}

function stringOf(value, fallback = '') {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
}

function buildNotificationGroupsFromItems(items) {
  const counts = (Array.isArray(items) ? items : []).reduce(
    (acc, item) => {
      const groupKey = stringOf(item?.groupKey, 'followup');
      acc.all += Number(item?.count) || 0;
      acc[groupKey] = (acc[groupKey] || 0) + (Number(item?.count) || 0);
      return acc;
    },
    { all: 0, confirmations: 0, changes: 0, matching: 0, reviews: 0, cancellations: 0, followup: 0 }
  );

  return [
    { key: 'all', label: '全部', note: '先看所有高优先级事项。', count: counts.all },
    { key: 'confirmations', label: '待确认', note: '优先确认任务、版本和执行边界。', count: counts.confirmations },
    { key: 'changes', label: '待修改', note: '集中处理范围、工期和补充说明。', count: counts.changes },
    { key: 'matching', label: '发布与选人', note: '先完成候选人查看与当前轮选择。', count: counts.matching },
    { key: 'reviews', label: '待评级 / 验收', note: '优先处理验收、提前完成和评级。', count: counts.reviews },
    { key: 'cancellations', label: '待取消', note: '需要双方确认的取消事项。', count: counts.cancellations },
    { key: 'followup', label: '待回看', note: '回到聊天、记录或任务池继续处理。', count: counts.followup }
  ];
}

function buildBusinessNotificationFallback(fallback) {
  const metrics = Array.isArray(fallback?.metrics) ? fallback.metrics : [];
  const checklist = Array.isArray(fallback?.onboardingChecklist) ? fallback.onboardingChecklist : [];
  const rating = fallback?.latestTalentRating || {};
  const items = [
    {
      id: 'business-confirmations',
      title: stringOf(metrics[0]?.label, '待审核入驻'),
      summary: stringOf(metrics[0]?.note, '企业资质与入驻材料先确认。'),
      groupKey: 'confirmations',
      count: 1,
      route: roleRouteMap.enterprise.onboarding,
      status: '待确认',
      updatedAt: '实时汇总'
    },
    {
      id: 'business-changes',
      title: stringOf(metrics[1]?.label, 'AI 拆解中任务'),
      summary: stringOf(metrics[1]?.note, '先补充任务边界和附件说明。'),
      groupKey: 'changes',
      count: 1,
      route: roleRouteMap.enterprise.publish,
      status: '待修改',
      updatedAt: '实时汇总'
    },
    {
      id: 'business-matching',
      title: stringOf(metrics[2]?.label, '匹配候选人才'),
      summary: stringOf(metrics[2]?.note, '先从推荐名单里确认合作对象。'),
      groupKey: 'matching',
      count: 1,
      route: roleRouteMap.enterprise.market,
      status: '待选人',
      updatedAt: '实时汇总'
    },
    {
      id: 'business-reviews',
      title: stringOf(metrics[3]?.label, '进行中项目'),
      summary: stringOf(metrics[3]?.note, stringOf(rating.content, '项目进展会在这里继续沉淀。')),
      groupKey: 'reviews',
      count: 1,
      route: roleRouteMap.enterprise.records,
      status: '待评级 / 验收',
      updatedAt: '实时汇总'
    },
    {
      id: 'business-followup',
      title: '企业入驻待回看',
      summary: checklist[0] || stringOf(rating.content, '补齐资料后可继续进入项目协作。'),
      groupKey: 'followup',
      count: 1,
      route: roleRouteMap.enterprise.messages,
      status: '待回看',
      updatedAt: '实时汇总'
    }
  ];

  return {
    notificationItems: items,
    notificationGroups: buildNotificationGroupsFromItems(items)
  };
}

function buildTalentNotificationFallback(fallback) {
  const items = [
    {
      id: 'talent-confirmations',
      title: stringOf(fallback.activeTasks[0]?.title, '待确认任务'),
      summary: stringOf(fallback.activeTasks[0]?.note, '先确认任务版本和执行边界。'),
      groupKey: 'confirmations',
      count: 1,
      route: roleRouteMap.talent.workspace,
      status: '待确认',
      updatedAt: '实时汇总'
    },
    {
      id: 'talent-changes',
      title: stringOf(fallback.activeTasks[1]?.title, '待修改任务'),
      summary: stringOf(fallback.activeTasks[1]?.note, '先处理调整建议和补充说明。'),
      groupKey: 'changes',
      count: 1,
      route: roleRouteMap.talent.workspace,
      status: '待修改',
      updatedAt: '实时汇总'
    },
    {
      id: 'talent-matching',
      title: stringOf(fallback.marketplace[0]?.title, '任务广场'),
      summary: fallback.marketplace[0]
        ? `${stringOf(fallback.marketplace[0].budget, '预算待补充')} · ${stringOf(fallback.marketplace[0].period, '工期待确认')}`
        : '先浏览任务广场，再挑选合适项目。',
      groupKey: 'matching',
      count: 1,
      route: roleRouteMap.talent.market,
      status: '待选人',
      updatedAt: '实时汇总'
    },
    {
      id: 'talent-reviews',
      title: '最新交付评分',
      summary: fallback.latestDeliveryGrade?.grade
        ? `${stringOf(fallback.latestDeliveryGrade.grade, '暂无')} · ${stringOf(fallback.latestDeliveryGrade.payoutRatio, '待结算')}`
        : '项目验收后会在这里同步评分和结算比例。',
      groupKey: 'reviews',
      count: 1,
      route: roleRouteMap.talent.records,
      status: '待评级 / 验收',
      updatedAt: '实时汇总'
    },
    {
      id: 'talent-followup',
      title: stringOf(fallback.messages[0]?.from, '最新消息'),
      summary: stringOf(fallback.messages[0]?.text, '进入聊天继续处理。'),
      groupKey: 'followup',
      count: 1,
      route: roleRouteMap.talent.messages,
      status: '待回看',
      updatedAt: '实时汇总'
    }
  ];

  return {
    notificationItems: items,
    notificationGroups: buildNotificationGroupsFromItems(items)
  };
}

function buildBusinessFallback() {
  const fallback = {
    attentionHeadline: '当前没有需要优先处理的任务变更或确认事项。',
    attentionItems: [],
    latestTalentRating: {
      rating: '',
      content: ''
    },
    metrics: [
      {
        label: '已发布任务',
        value: '0',
        note: '当前账号还没有发布任务。',
        source: '实时统计',
        todos: ['去发布任务页创建第一条需求。'],
        doneStats: ['发布后会在这里保留真实任务数据。']
      },
      {
        label: '待选择人才',
        value: '0',
        note: '发布任务后，这里会显示待选人才的任务数量。',
        source: '实时统计',
        todos: ['AI 推荐人才后，可以直接从弹窗里选人。'],
        doneStats: ['当前没有待处理的选人动作。']
      },
      {
        label: '协商中的任务',
        value: '0',
        note: '当你选中人才并进入聊天协商后，这里会自动更新。',
        source: '实时统计',
        todos: ['当前还没有协商中的任务。'],
        doneStats: ['聊天房间会按最新消息自动排序。']
      },
      {
        label: '执行中的任务',
        value: '0',
        note: '人才确认任务后，这里会显示执行中的项目。',
        source: '实时统计',
        todos: ['当前还没有执行中的任务。'],
        doneStats: ['后续进度、附件与验收会继续在协作区沉淀。']
      }
    ],
    onboardingChecklist: [
      '上传企业营业执照 / 品牌证明',
      '上传项目联系人与合作偏好',
      '个人入驻时补充身份证、实名信息与虚拟企业申请',
      '通过后台审核后启用发布权限与项目沟通权限'
    ],
    sampleBrief: '',
    recommendedTalents: [],
    taskBoard: [],
    liveConversation: [],
    contractSummary: []
  };
  return {
    ...fallback,
    ...buildBusinessNotificationFallback(fallback)
  };
}

function buildTalentFallback() {
  const authUser = getStoredAuthUser();
  const displayName = authUser?.displayName || '未命名人才';
  const fallback = {
    attentionHeadline: '当前没有待你处理的确认、取消或提前完成事项。',
    attentionItems: [],
    hero: {
      name: displayName,
      role: authUser?.headline || '待补充专业方向',
      intro: '完善资料、作品和档期后，这里会逐步沉淀真实接单数据。',
      availability: '当前没有设置可接单档期',
      score: '暂无',
      income: '￥0'
    },
    skills: [],
    portfolio: [],
    calendar: buildTalentCalendarFallback(authUser?.platformUserId || 'talent').items,
    marketplace: [],
    activeTasks: [],
    messages: [],
    evaluations: [],
    latestDeliveryGrade: {
      grade: '',
      payoutRatio: ''
    }
  };
  return {
    ...fallback,
    ...buildTalentNotificationFallback(fallback)
  };
}

function buildTaskMarketplaceFallback() {
  return {
    summary: {
      title: '任务广场',
      description: '这里展示企业真实发布、仍在招募中的任务。可按标签、工期、预算和企业评级快速筛选。'
    },
    filters: ['全部'],
    filterGroups: {
      tag: ['全部', '官网升级', 'AI 产品', '品牌设计', '内容增长'],
      period: ['全部', '3天内', '4-7天', '8天以上'],
      budget: ['全部', '3000以下', '3000-8000', '8000-15000', '15000以上'],
      companyRating: ['全部', 'S级', 'A级', 'B级']
    },
    metrics: [
      { label: '当前任务总数', value: '0', note: '这里只展示仍在招募中的真实任务，不再混入企业侧流程指标。' }
    ],
    items: []
  };
}

function approvalCenterIssueMessage(requestError = '') {
  const text = String(requestError || '').trim();
  if (!text) {
    return '';
  }

  if (text.includes('Unknown path') && text.includes('/api/enterprise/approvals')) {
    return '审批数据暂时无法直连，已切换到本地兜底队列。';
  }

  if (text.includes('/api/enterprise/approvals')) {
    return '审批数据接口暂时不可用，已显示本地兜底队列。';
  }

  return '审批数据暂时未同步到最新版本，已显示本地兜底队列。';
}

function buildTalentCalendarFallback(userId = '2') {
  const items = (webMockData.talent.calendar || []).map((item, index) => ({
    date: `2026-03-${String(21 + index).padStart(2, '0')}`,
    day: item.day,
    state: item.state,
    note: item.note
  }));
  const openDays = items.filter((item) => item.state === 'open').length;
  const busyDays = items.filter((item) => item.state === 'busy').length;
  const closedDays = items.filter((item) => item.state === 'closed').length;
  return {
    userId: String(userId),
    summary: {
      range: '03/21 - 03/27',
      openDays: String(openDays),
      busyDays: String(busyDays),
      closedDays: String(closedDays),
      headline: openDays > 0 ? `本周剩余可接单 ${openDays} 天` : '本周档期已基本排满'
    },
    items
  };
}

function buildEmptyWorkspaceState(taskId = '') {
  return {
    taskOptions: [],
    summary: {
      taskId: taskId || '',
      taskName: '',
      business: '',
      businessUserId: '',
      talent: '',
      talentUserId: '',
      range: '',
      status: '待开始'
    },
    taskDetail: null,
    focus: '当前还没有可以展示的真实协作任务。',
    pulse: [],
    executionChecklist: [],
    milestones: [],
    collaborationNodes: [],
    progressFeed: [],
    assetLibrary: [],
    aiReviewHistory: [],
    reviewHistory: [],
    earlyCompletion: {
      status: '未发起',
      aiReviewStatus: '',
      aiReviewSummary: '',
      aiReviewSuggestions: [],
      grade: '',
      payoutRatio: '',
      gradeNote: '',
      talentDecisionNote: '',
      requestNote: ''
    },
    cancellationRequest: {
      status: '未发起',
      initiatorAudience: '',
      reason: '',
      counterpartyDecision: '',
      counterpartyDecisionNote: ''
    },
    supportOptions: [],
    acceptance: [],
    celebrationBanner: null
  };
}

function buildEmptyTaskClosure(taskId = '') {
  return {
    summary: {
      taskId,
      title: '',
      status: '待验收',
      nextStep: '',
      acceptedAt: '',
      business: '',
      talent: '',
      businessUserId: '',
      talentUserId: '',
      deliveryGrade: '',
      deliveryPayoutRatio: '',
      settlementStatus: '',
      settledAt: '',
      disputeStatus: '',
      disputeOpenedAt: ''
    },
    earlyCompletion: {
      status: '未发起',
      grade: '',
      payoutRatio: '',
      gradeNote: '',
      aiReviewSummary: '',
      aiReviewSuggestions: []
    },
    acceptance: {
      status: '待验收',
      note: '',
      acceptedAt: '',
      accepterUserId: ''
    },
    claimSummary: {},
    invoiceSummary: {},
    reconciliationSummary: {},
    settlementSummary: {},
    disputeSummary: {},
    metrics: [],
    timeline: [],
    reviewSummary: [],
    reviewHistory: [],
    creditImpact: []
  };
}

function buildEmptyOrderRecordDetail(audience = 'enterprise', taskId = '') {
  return {
    role: audience,
    title: audience === 'talent' ? '接单记录' : '发单记录',
    summary: {
      title: '',
      taskId,
      statusGroup: '',
      stage: '',
      amountLabel: '',
      amountValue: '',
      ratingLabel: '',
      ratingValue: '',
      updatedAt: '',
      route: ''
    },
    record: null
  };
}

function normalizeWorkspaceData(rawData, taskId = '') {
  const fallback = buildEmptyWorkspaceState(taskId || rawData?.summary?.taskId || '');
  return normalizeWorkspacePayload(rawData, fallback, taskId);
}

export function registerAuth(payload) {
  return writeJson(
    '/auth/register',
    {
      success: false,
      message: '当前注册接口暂不可用，请稍后再试。'
    },
    payload
  );
}

export function loginAuth(payload) {
  return writeJson(
    '/auth/login',
    {
      success: false,
      message: '当前登录接口暂不可用，请稍后再试。'
    },
    payload
  );
}

export function getAuthMe() {
  return readJson('/auth/me', { authenticated: false, message: '当前未登录。' });
}

export function logoutAuth() {
  return writeJson('/auth/logout', { success: true }, {});
}

export function getLandingData() {
  return readJson('/landing', webMockData.landing);
}

export function getBusinessData() {
  return readJson('/business', buildBusinessFallback());
}

export function getApprovalCenterData() {
  const fallback = buildApprovalCenterFallbackFromBusiness(buildBusinessFallback());
  return readJson('/enterprise/approvals', fallback).then((raw) => {
    const normalized = normalizeApprovalCenterPayload(raw, fallback);
    return {
      ...normalized,
      requestIssue: approvalCenterIssueMessage(raw?.requestError),
      requestStatus: raw?.requestStatus || 0
    };
  });
}

export function submitEnterpriseApprovalAction(approvalId, payload) {
  const fallback = buildApprovalCenterFallbackFromBusiness(buildBusinessFallback());
  return writeJson(
    `/enterprise/approvals/${encodeURIComponent(String(approvalId || ''))}/actions`,
    fallback,
    payload
  ).then((raw) => {
    const normalized = normalizeApprovalCenterPayload(raw, fallback);
    return {
      ...(raw && typeof raw === 'object' ? raw : {}),
      ...normalized,
      requestIssue: approvalCenterIssueMessage(raw?.requestError),
      requestStatus: raw?.requestStatus || 0
    };
  });
}

export function getTalentData() {
  return readJson('/talent', buildTalentFallback());
}

export function getTalentCalendar(userId) {
  return readJson(`/talent/calendar/${userId}`, buildTalentCalendarFallback(userId));
}

export function updateTalentCalendar(payload) {
  return writeJson(
    '/talent/calendar',
    () => ({
      userId: String(payload.userId),
      availableDate: payload.availableDate,
      availabilityStatus: payload.availabilityStatus,
      state: String(payload.availabilityStatus || 'CLOSED').toLowerCase(),
      note: payload.note || '档期已更新',
      nextStep: '档期已更新，后续任务匹配和人才展示会优先参考这份日历。',
      calendar: buildTalentCalendarFallback(payload.userId)
    }),
    payload
  );
}

export function getTaskMarketplaceData() {
  return readJson('/tasks/marketplace', buildTaskMarketplaceFallback());
}

export function getTalentMarketplaceData() {
  return readJson('/talents/marketplace', webMockData.talentMarketplace);
}

export function getTalentDetail(slug) {
  const fallback = webMockData.talentProfiles[slug] || webMockData.talentProfiles['chen-yining'];
  return readJson(`/talents/${slug}`, fallback);
}

export function getWorkspaceData(taskId = '') {
  const query = taskId ? `?taskId=${encodeURIComponent(taskId)}` : '';
  return readJson(`/workspace${query}`, buildEmptyWorkspaceState(taskId), undefined).then((raw) =>
    normalizeWorkspaceData(raw, taskId)
  );
}

export function getTaskClosureData(taskId) {
  return readJson(`/tasks/${taskId}/closure`, buildEmptyTaskClosure(taskId));
}

export function getOnboardingChecklists() {
  return readJson('/onboarding/checklists', onboardingFallback);
}

export function submitBusinessOnboarding(payload) {
  return writeJson(
    '/onboarding/business',
    () => ({
      organizationName: payload.organizationName,
      contactName: payload.contactName,
      contactMobile: payload.contactMobile,
      status: payload.deferMaterials ? 'PENDING_MATERIALS' : 'PENDING_REVIEW',
      materialStatus: payload.deferMaterials ? 'WAITING_UPLOAD' : 'UPLOADED',
      deferMaterials: Boolean(payload.deferMaterials),
      collaborationPreferences: Array.isArray(payload.collaborationPreferences) ? payload.collaborationPreferences : [],
      materialNames: Array.isArray(payload.materialFiles) ? payload.materialFiles.map((file) => file.name).filter(Boolean) : [],
      materialFiles: Array.isArray(payload.materialFiles) ? payload.materialFiles : [],
      nextStep: payload.deferMaterials
        ? '基础信息已提交，你可以后续回企业工作台补交材料，补齐后再进入审核。'
        : '后台审核企业材料，审核通过后开放发布任务权限。',
      nextRoute: roleRouteMap.enterprise.home
    }),
    payload
  );
}

export function submitTalentOnboarding(payload) {
  return writeJson(
    '/onboarding/talent',
    () => ({
      displayName: payload.displayName,
      headline: payload.headline,
      skills: Array.isArray(payload.skills) ? payload.skills : [],
      portfolioUrls: Array.isArray(payload.portfolioUrls) ? payload.portfolioUrls : [],
      applyVirtualCompany: Boolean(payload.applyVirtualCompany),
      status: 'PENDING_REVIEW',
      nextStep: '平台将校验作品与实名材料，审核通过后开放接单和推荐资格。'
    }),
    payload
  );
}

export function publishTask(payload) {
  const authUser = getStoredAuthUser();
  return writeJson(
    '/tasks/publish',
    () => ({
      taskId: '',
      publisherUserId: String(authUser?.platformUserId || payload.publisherUserId || ''),
      organizationId: String(authUser?.organizationId || payload.organizationId || ''),
      title: payload.title,
      brief: payload.brief,
      source: payload.source,
      budget: payload.budget || '未填写预算',
      status: '发布失败',
      nextStep: '当前服务不可用，暂时无法生成真实任务，请稍后重试。',
      analysisProvider: '本地分析',
      analysisModel: 'rule-based',
      analysisSummary: {
        total: '4 个 AI 协同工作日',
        assumption: '按熟练使用 AI 工具的人才估算，传统一周左右工作量可能被压缩到 1 天左右。',
        risk: '建议先锁第一阶段交付范围，再进入人才匹配。'
      },
      matchingPreview: []
    }),
    {
      title: payload.title,
      brief: payload.brief,
      source: payload.source,
      budget: payload.budget
    }
  );
}

export function confirmTaskAnalysis(taskId) {
  return writeJson(
    `/tasks/${taskId}/analysis/confirm`,
    {
      taskId,
      status: 'MATCHING',
      nextStep: 'AI 分析已确认，平台开始按技能、评分和档期匹配人才。'
    },
    {}
  );
}

export function selectTaskAssignment(taskId, talentUserId) {
  return writeJson(
    `/tasks/${taskId}/assignments/select`,
    () => ({
      taskId,
      talentUserId,
      selectedTalent: null,
      roomKey: '',
      taskRoom: buildEmptyTaskRoomFallback('').taskRoom,
      nextRoute: '',
      status: 'FAILED',
      imRoomPlanned: false,
      nextStep: '当前服务不可用，暂时无法创建真实协商房间，请稍后重试。'
    }),
    { talentUserId }
  );
}

export function getTaskRooms() {
  return readJson(
    '/messages/task-rooms',
    {
      summary: {
        activeRooms: '0',
        waitingReply: '0',
        unreadRooms: '0'
      },
      items: []
    }
  );
}

export function getTaskRoom(roomKey) {
  const fallback = buildEmptyTaskRoomFallback(roomKey || '');
  const path = roomKey ? `/messages/task-room/${roomKey}` : '/messages/task-room';
  return readJson(path, fallback);
}

export function initiateTaskRoom(payload) {
  return writeJson(
    '/messages/task-room/initiate',
    () => ({
      success: false,
      roomKey: '',
      room: buildEmptyTaskRoomFallback(''),
      message: '当前暂时无法建立聊天房间，请稍后再试。'
    }),
    payload
  );
}

export function sendTaskRoomMessage(roomKey, payload) {
  return writeJson(
    `/messages/task-room/${roomKey}/messages`,
    () => buildEmptyTaskRoomFallback(roomKey),
    payload
  );
}

export function refreshTaskRoomCommunicationRecord(roomKey) {
  return writeJson(
    `/messages/task-room/${roomKey}/communication-record`,
    () => buildEmptyTaskRoomFallback(roomKey),
    {}
  );
}

export function getAiPublishPresets() {
  return readJson(
    '/ai/publish-presets',
    {
      defaultPublisherUserId: '1',
      defaultOrganizationId: '1',
      items: aiPublishPresetMockData
    }
  );
}

export function getTencentImRuntimeConfig(audience, roomKey) {
  const normalizedAudience = audience === 'talent' ? 'talent' : 'enterprise';
  const normalizedRoomKey = roomKey || '';
  const authUser = getStoredAuthUser();
  const currentUser = {
    audience: normalizedAudience,
    platformUserId: authUser?.platformUserId || '',
    imUserId: authUser?.imUserId || '',
    displayName: authUser?.displayName || '',
    role: normalizedAudience === 'talent' ? 'TALENT' : 'PROJECT_OWNER'
  };
  const counterpartUser = {
    audience: normalizedAudience === 'talent' ? 'enterprise' : 'talent',
    platformUserId: '',
    imUserId: '',
    displayName: '',
    role: normalizedAudience === 'talent' ? 'PROJECT_OWNER' : 'TALENT'
  };
  const taskRoom = buildEmptyTaskRoomFallback(normalizedRoomKey).taskRoom;
  const fallback = {
    provider: 'Tencent IM',
    enabled: false,
    status: 'MOCK_FALLBACK',
    audience: normalizedAudience,
    sdkAppId: '',
    platformUserId: currentUser.platformUserId,
    userId: currentUser.imUserId || '',
    userSig: '',
    displayName: currentUser.displayName,
    roomKey: normalizedRoomKey,
    groupId: taskRoom.providerRoomId || '',
    roomTitle: '',
    taskId: '',
    conversationType: 'GROUP',
    groupType: taskRoom.groupType || 'Public',
    joinOption: taskRoom.joinOption || 'FreeAccess',
    currentUser,
    counterpartUser,
    members: [],
    taskRoom,
    useMockFallback: true,
    notes: [
      '尚未建立真实房间或 IM 通道，当前页面会继续显示已保存的聊天记录。',
      '当前 userId 来源于平台用户身份映射，任务群来源于任务房间绑定。'
    ]
  };

  const params = new URLSearchParams({
    audience: normalizedAudience,
    roomKey: normalizedRoomKey
  });

  return readJson(`/im/tencent/config?${params.toString()}`, fallback);
}

export function getOrderRecords(audience, tab = 'all') {
  const normalizedAudience = audience === 'talent' ? 'talent' : 'enterprise';
  const normalizedTab = tab === 'ongoing' || tab === 'completed' ? tab : 'all';
  const fallback = buildOrderRecordsFallback(normalizedAudience, normalizedTab);
  return readJson(`/${normalizedAudience}/orders?tab=${normalizedTab}`, fallback);
}

export function getOrderRecordDetail(audience, taskId) {
  const normalizedAudience = audience === 'talent' ? 'talent' : 'enterprise';
  const normalizedTaskId = String(taskId || '');
  const fallback = buildEmptyOrderRecordDetail(normalizedAudience, normalizedTaskId);
  return readJson(`/${normalizedAudience}/orders/${normalizedTaskId}`, fallback);
}

export function uploadTaskAttachmentAsset(taskId, file, options = {}) {
  return uploadTaskAttachmentRuntime(
    {
      apiBase: API_BASE,
      getToken: getStoredAuthToken
    },
    {
      taskId,
      file,
      scene: options.scene || 'TASK_PROGRESS',
      source: options.source || options.scene || 'TASK_PROGRESS',
      fileType: options.fileType || ''
    }
  );
}

export function confirmNegotiation(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/negotiations/confirm`,
    {
      taskId,
      talentUserId: String(payload.talentUserId),
      agreementNote: payload.agreementNote,
      status: 'IN_PROGRESS',
      nextStep: '若双方均确认，则正式进入执行阶段并开启项目沟通。'
    },
    {
      talentUserId: payload.talentUserId,
      requirementConfirmed: payload.requirementConfirmed,
      scheduleConfirmed: payload.scheduleConfirmed,
      agreementNote: payload.agreementNote
    }
  );
}

export function updateTaskConfirmation(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/negotiations/task-confirmation`,
    () => buildEmptyTaskRoomFallback(`negotiation-${taskId}`),
    payload
  );
}

export function submitTaskProgress(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/progress`,
    {
      taskId,
      stage: payload.stage,
      progressText: payload.progressText,
      supportNeeded: payload.supportNeeded,
      completionPercent: String(payload.completionPercent),
      attachmentFiles: Array.isArray(payload.attachmentFiles) ? payload.attachmentFiles : [],
      attachmentNames: Array.isArray(payload.attachmentFiles)
        ? payload.attachmentFiles.map((item) => item.name).filter(Boolean)
        : [],
      status: 'AI_REVIEW_PENDING',
      nextStep: '进度已提交，AI 将生成审查建议并提醒企业端查看。',
      aiSuggestions: [
        '优先把本轮新增附件和进展说明对应起来，方便企业快速核对。',
        '如果还需要企业补充素材，建议同步到聊天页，避免等待过久。'
      ],
      submittedAt: new Intl.DateTimeFormat('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(new Date()).replace(',', '')
    },
    {
      stage: payload.stage,
      milestoneId: payload.milestoneId,
      progressText: payload.progressText,
      supportNeeded: payload.supportNeeded,
      completionPercent: payload.completionPercent,
      files: Array.isArray(payload.files) ? payload.files : [],
      attachmentFiles: Array.isArray(payload.attachmentFiles) ? payload.attachmentFiles : []
    }
  );
}

export function submitWorkspaceFeedback(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/workspace-feedback`,
    () => buildWorkspaceFeedbackFallback(taskId, payload),
    payload
  );
}

export function submitEarlyCompletion(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/early-completion`,
    () => ({
      taskId,
      status: 'FAILED',
      earlyCompletion: {
        status: '未发起'
      },
      nextStep: '当前服务不可用，暂时无法处理提前完成流程。'
    }),
    payload
  );
}

export function submitTaskCancellation(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/cancellation`,
    () => ({
      taskId,
      status: 'FAILED',
      cancellationRequest: {
        status: '未发起'
      },
      nextStep: '当前服务不可用，暂时无法处理取消任务流程。'
    }),
    payload
  );
}

export function submitAcceptance(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/acceptance`,
    {
      taskId,
      acceptanceNote: payload.acceptanceNote,
      status: 'ACCEPTED',
      nextStep: '验收完成，进入双方评分和信用画像沉淀。'
    },
    {
      acceptanceNote: payload.acceptanceNote
    }
  );
}

export function submitReview(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/reviews`,
    {
      taskId,
      revieweeUserId: String(payload.revieweeUserId),
      rating: String(payload.rating),
      reviewContent: payload.reviewContent,
      status: 'RECORDED',
      nextStep: '评分已写入平台信用画像与后续推荐逻辑。'
    },
    {
      revieweeUserId: payload.revieweeUserId,
      rating: payload.rating,
      reviewContent: payload.reviewContent
    }
  );
}

export function analyzeTaskBrief(brief) {
  const fallback = mockAnalyzeTaskBrief(brief);
  return writeJson('/ai/decompose', { ...fallback, provider: '本地分析', model: 'rule-based' }, { brief });
}
