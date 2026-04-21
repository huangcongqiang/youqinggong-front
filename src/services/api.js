import { roleRouteMap } from '../utils/roleRoutes';
import {
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
import { attachRequestError, buildAuthHeaders, readResponsePayload, unwrapEnvelopePayload } from './httpClient';
import { resolveApiBase } from './apiBase';
import { uploadStandaloneAttachmentRuntime, uploadTaskAttachmentRuntime } from './uploadWorkflow';
import { getIntlLocale, translateText } from '../utils/uiLocale.js';
import { formatTalentAvailability } from '../utils/talentAvailability.js';

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
    return unwrapEnvelopePayload(response, payload);
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
    return unwrapEnvelopePayload(response, payload);
  } catch (error) {
    return attachRequestError(fallback, error);
  }
}

async function deleteJson(path, fallback) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(getStoredAuthToken, {})
    });
    const payload = await readResponsePayload(response);
    return unwrapEnvelopePayload(response, payload);
  } catch (error) {
    return attachRequestError(fallback, error);
  }
}

function normalizeRecruitingApplicant(item, index = 0) {
  const taskId = stringOf(item?.taskId, item?.id, '');
  const talentUserId = stringOf(item?.talentUserId, item?.platformUserId, item?.userId, '');
  const stage = stringOf(item?.stage, item?.status, item?.assignmentStatus, 'APPLIED').toUpperCase();
  const interview = item?.interview || item?.currentInterview || {};
  const roomKey = stringOf(item?.roomKey, item?.room, interview?.roomKey, '');

  return {
    ...item,
    id: stringOf(item?.id, item?.applicationId, talentUserId || `app-${index + 1}`),
    taskId,
    talentUserId,
    name: stringOf(item?.name, item?.talentName, '申请人'),
    role: stringOf(item?.role, item?.headline, '职位待补充'),
    applyAt: stringOf(item?.applyAt, item?.submittedAt, item?.createdAt, ''),
    rate: stringOf(item?.rate, item?.proposedRate, item?.budget, '待确认'),
    summary: stringOf(item?.summary, item?.intro, item?.coverLetter, '先查看申请摘要，再决定约面试还是继续沟通。'),
    status: stage,
    statusLabel: stringOf(item?.statusLabel, item?.stageLabel, stage),
    tags: Array.isArray(item?.tags) ? item.tags : [],
    signals: Array.isArray(item?.signals) ? item.signals : Array.isArray(item?.trustSignals) ? item.trustSignals : [],
    portfolio: Array.isArray(item?.portfolio) ? item.portfolio : [],
    interview: {
      time: stringOf(interview?.time, item?.interviewAt, ''),
      meetingCode: stringOf(interview?.meetingCode, item?.meetingCode, ''),
      note: stringOf(interview?.note, item?.interviewNote, ''),
      state: stringOf(interview?.state, item?.interviewState, ''),
    },
    currentInvite: item?.currentInvite || null,
    autoClosedReason: stringOf(item?.autoClosedReason, ''),
    canReapply: item?.canReapply !== false,
    detailRoute: item?.slug ? roleRouteMap.enterprise.talentDetail(item.slug) : '',
    messageRoute: roomKey
      ? roleRouteMap.enterprise.messageRoom(roomKey, {
          taskId,
          room: roomKey,
          roomKey,
          source: 'recruiting',
          surface: 'recruiting',
        })
      : roleRouteMap.enterprise.messages,
  };
}

export function normalizeRecruitingWorkspacePayload(payload) {
  const rawApplications = Array.isArray(payload?.applications)
    ? payload.applications
    : Array.isArray(payload?.items)
      ? payload.items
      : [];
  const applications = rawApplications.map(normalizeRecruitingApplicant).filter((item) => item.id);
  const task = payload?.task || {};
  const pending = applications.filter((item) => ['APPLIED', 'REQUESTED', 'PENDING', 'REVIEWING', 'UNDER_REVIEW'].includes(item.status)).length;
  const interviewPending = applications.filter((item) => item.status === 'INTERVIEW_PENDING').length;
  const accepted = applications.filter((item) => item.status === 'INTERVIEW_ACCEPTED').length;
  const confirmed = applications.filter((item) => ['CONFIRMED', 'AUTO_CONFIRMED'].includes(item.status)).length;
  const autoClosed = applications.filter((item) => ['AUTO_CLOSED', 'CLOSED', 'INTERVIEW_REJECTED'].includes(item.status)).length;

  return {
    ...payload,
    task: {
      id: stringOf(task?.id, task?.taskId, payload?.taskId, ''),
      taskId: stringOf(task?.taskId, payload?.taskId, ''),
      title: stringOf(task?.title, payload?.taskTitle, '招聘申请处理'),
      budget: stringOf(task?.budget, task?.budgetRange, '待确认'),
      period: stringOf(task?.period, task?.timeline, '待确认'),
      summary: stringOf(task?.summary, task?.lead, '先查看申请，再决定约面试、继续沟通或确认合作。'),
      statusNote: stringOf(task?.statusNote, '这是一条独立的申请处理页，不是人才市场搜索页。'),
    },
    applications,
    counts: {
      total: Number(payload?.counts?.total ?? applications.length) || applications.length,
      pending: Number(payload?.counts?.pending ?? pending) || pending,
      interviewPending: Number(payload?.counts?.interviewPending ?? interviewPending) || interviewPending,
      accepted: Number(payload?.counts?.accepted ?? accepted) || accepted,
      confirmed: Number(payload?.counts?.confirmed ?? confirmed) || confirmed,
      autoClosed: Number(payload?.counts?.autoClosed ?? autoClosed) || autoClosed,
    },
    summary: payload?.summary || {
      title: '招聘申请处理',
      description: '任务 -> 申请人 -> 动作。先处理申请，再决定约面试、继续沟通或确认合作。',
    },
  };
}

export async function getRecruitingWorkspaceData(taskId = '') {
  const suffix = taskId ? `?taskId=${encodeURIComponent(String(taskId))}` : '';
  return readJson(`/enterprise/recruiting${suffix}`, {
    success: false,
    requestError: '招聘申请处理页暂时不可用。',
    task: null,
    applications: [],
    counts: { total: 0, pending: 0, interviewPending: 0, accepted: 0, confirmed: 0, autoClosed: 0 },
  });
}

export async function sendRecruitingInterviewInvite(payload) {
  const taskId = stringOf(payload?.taskId, '').trim();
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/recruiting/interview/invite`, {
    success: false,
    requestError: '发送面试邀约暂时不可用。',
  }, payload);
}

export async function respondRecruitingInterviewInvite(payload) {
  const taskId = stringOf(payload?.taskId, '').trim();
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/recruiting/interview/decision`, {
    success: false,
    requestError: '处理面试邀约暂时不可用。',
  }, payload);
}

export async function recordRecruitingInterviewOutcome(payload) {
  const taskId = stringOf(payload?.taskId, '').trim();
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/recruiting/outcome`, {
    success: false,
    requestError: '记录面试结果暂时不可用。',
  }, payload);
}

export async function confirmRecruitingCooperation(payload) {
  return recordRecruitingInterviewOutcome({ ...payload, outcome: 'PASS_CONFIRM' });
}

export async function createWithdrawalRequest(payload) {
  return writeJson('/talent/withdrawals', {
    success: false,
    requestError: '提现申请暂时不可用。'
  }, payload);
}

function buildMutationFailure(nextStep, state = {}) {
  return {
    success: false,
    status: 'FAILED',
    nextStep,
    ...state
  };
}

const onboardingFallback = {
  business: ['上传营业执照或企业证明', '补充联系人与合作偏好', '等待后台审核通过后再发布任务'],
  talent: ['填写简介、技能和作品', '设置接单日历', '若申请虚拟企业则补身份证等实名材料']
};

const CUSTOM_PUBLISH_PRESET = {
  id: 'custom-blank',
  title: '不选模板，直接描述需求',
  focus: '先把模糊想法直接交给 AI 梳理',
  brief: '',
  period: '自由输入',
  source: 'TEXT',
  isCustom: true,
  tags: ['自由输入', '需求梳理', 'AI 拆解']
};

function normalizeAiPublishPresets(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const hasCustomPreset = items.some((item) => item?.isCustom || item?.id === 'custom-blank');
  const normalizedItems = hasCustomPreset ? items : [CUSTOM_PUBLISH_PRESET, ...items].filter(Boolean);

  return {
    ...payload,
    items: normalizedItems
  };
}

function normalizeAiDecomposeResponse(payload) {
  function parseStructuredItem(item, index = 0) {
    const fallbackId = `module-${index + 1}`;
    let source = item;
    if (typeof item === 'string') {
      const trimmed = item.trim();
      try {
        source = JSON.parse(trimmed);
      } catch {
        source = { title: trimmed };
      }
    }
    if (!source || typeof source !== 'object') {
      return {
        id: fallbackId,
        title: `建议 ${index + 1}`,
        duration: '',
        output: String(item || '').trim(),
        summary: ''
      };
    }
    const title = stringOf(source?.title, source?.name, source?.module, source?.step, `建议 ${index + 1}`);
    const duration = stringOf(source?.duration, source?.timeline, source?.period, source?.eta, '');
    const output = stringOf(source?.output, source?.deliverable, source?.result, source?.goal, source?.content, '');
    const summary = stringOf(source?.summary, source?.note, source?.description, '');
    return {
      ...source,
      id: stringOf(source?.id, fallbackId),
      title,
      duration,
      output,
      summary
    };
  }

  const normalizedModules = Array.isArray(payload?.modules)
    ? payload.modules
        .map((item, index) => parseStructuredItem(item, index))
        .filter((item) => item.title || item.output || item.summary)
    : [];

  const normalizedRecommendations = Array.isArray(payload?.recommendations)
    ? payload.recommendations
        .map((item) => {
          if (typeof item === 'string') {
            return item.trim();
          }
          if (item && typeof item === 'object') {
            return stringOf(item?.title, item?.label, item?.name, item?.summary, item?.content, '');
          }
          return '';
        })
        .filter(Boolean)
    : [];

  const matchingPreview = Array.isArray(payload?.matchingPreview)
    ? payload.matchingPreview.map((item, index) => {
        const fallbackId = `preview-${index + 1}`;
        const normalized = normalizeTalentDirectoryItem(item);
        const talentUserId = stringOf(normalized?.talentUserId, item?.talentUserId, item?.platformUserId, item?.id, fallbackId);
        return {
          ...normalized,
          ...item,
          platformUserId: stringOf(item?.platformUserId, normalized?.platformUserId, talentUserId),
          talentUserId,
          slug: stringOf(item?.slug, normalized?.slug, ''),
          role: stringOf(item?.role, normalized?.role, '专业方向未公开'),
          score: stringOf(item?.score, normalized?.score, '暂无'),
          reason: stringOf(item?.reason, item?.summary, normalized?.summary, '平台已筛出当前候选，可继续查看详情。'),
          tags: Array.isArray(item?.tags) ? item.tags : normalized?.tags || [],
          services: Array.isArray(item?.services) ? item.services : normalized?.services || []
        };
      })
    : [];

  return {
    ...payload,
    originalBrief: stringOf(payload?.originalBrief, payload?.brief, payload?.title, ''),
    modules: normalizedModules,
    recommendations: normalizedRecommendations,
    matchingPreview
  };
}

function isMutationFailed(payload) {
  return Boolean(payload?.requestError || payload?.success === false || payload?.status === 'FAILED');
}

function normalizeCollaborationCandidate(item) {
  const taskId = stringOf(item?.taskId, item?.id, item?.taskNo, '');
  const title = stringOf(item?.title, item?.taskTitle, item?.name, '未命名任务');
  const status = stringOf(item?.status, item?.stage, '待协商');
  const updatedAt = stringOf(item?.updatedAt, item?.lastUpdatedAt, item?.time, item?.createdAt, '');
  const selectedTalentUserId = stringOf(item?.selectedTalentUserId, item?.talentUserId, item?.counterpartPlatformUserId, '');
  const selectedTalentName = stringOf(item?.selectedTalentName, item?.counterpartName, item?.talentName, '');
  const roomKey = stringOf(item?.roomKey, item?.room, '');
  const blockedReason = stringOf(item?.blockedReason, '');
  const canStart = item?.canStart !== false && Boolean(taskId) && !blockedReason;

  return {
    ...item,
    taskId,
    title,
    status,
    updatedAt,
    selectedTalentUserId,
    selectedTalentName,
    roomKey,
    blockedReason,
    canStart
  };
}

function normalizeCollaborationCandidatesPayload(payload) {
  return {
    ...payload,
    summary: payload?.summary || {
      title: '可合作任务',
      description: '从当前企业的已有任务里选择一个继续合作。'
    },
    items: Array.isArray(payload?.items) ? payload.items.map(normalizeCollaborationCandidate).filter((item) => item.taskId) : []
  };
}

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

function normalizeAssignmentPayload(payload, taskId, talentUserId) {
  if (!payload || payload.status === 'FAILED' || payload.success === false || payload.requestError) {
    return payload;
  }
  const normalizedTaskId = stringOf(payload?.taskId, taskId, '');
  const normalizedRoomKey = stringOf(payload?.roomKey, payload?.taskRoom?.roomKey, '');
  const normalizedTalentUserId = stringOf(payload?.talentUserId, payload?.selectedTalentUserId, talentUserId, payload?.selectedTalent?.talentUserId, '');

  return {
    ...payload,
    taskId: normalizedTaskId,
    talentUserId: normalizedTalentUserId,
    selectedTalentUserId: normalizedTalentUserId,
    selectedTalent: payload.selectedTalent || null,
    roomKey: normalizedRoomKey,
    taskRoom: payload.taskRoom || buildEmptyTaskRoomFallback('').taskRoom,
    nextRoute: normalizedRoomKey
      ? roleRouteMap.enterprise.messageRoom(normalizedRoomKey, { taskId: normalizedTaskId, source: 'publish' })
      : ''
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
    { key: 'reviews', label: '待审核 / 评级', note: '优先处理审核、评级和反馈确认。', count: counts.reviews },
    { key: 'cancellations', label: '待取消', note: '需要双方确认的取消事项。', count: counts.cancellations },
    { key: 'followup', label: '待回看', note: '回到聊天、记录或任务池继续处理。', count: counts.followup }
  ];
}

function buildBusinessFallback() {
  return {
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
    contractSummary: [],
    notificationItems: [],
    notificationGroups: []
  };
}

function buildTalentFallback() {
  const authUser = getStoredAuthUser();
  const displayName = authUser?.displayName || '未命名人才';
  return {
    attentionHeadline: '当前没有待你处理的确认、取消或提前完成事项。',
    attentionItems: [],
    hero: {
      name: displayName,
      role: authUser?.headline || '专业方向未公开',
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
    },
    notificationItems: [],
    notificationGroups: []
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

function buildEmptyLandingData() {
  return {
    badges: [],
    entryNotes: [],
    metrics: [],
    pillars: [],
    stages: [],
    roleCards: [],
    journeys: [],
    cases: [],
    contacts: [],
    highlights: []
  };
}

function buildEmptyTalentMarketplace() {
  return {
    summary: {
      title: '人才广场',
      description: '当前没有可展示的真实人才资料，稍后再回来看看。'
    },
    filters: ['全部'],
    metrics: [],
    items: []
  };
}

function buildEmptyTalentDetail(slug = '') {
  return {
    slug,
    platformUserId: '',
    talentUserId: '',
    name: '暂无资料',
    role: '专业方向未公开',
    location: '',
    score: '',
    completionRate: '',
    responseTime: '',
    intro: '当前没有读取到这位人才的真实资料。',
    headlineTags: [],
    strengths: [],
    services: [],
    portfolio: [],
    reviews: [],
    availability: '',
    process: []
  };
}

function normalizeTalentDirectoryItem(item) {
  const talentUserId = stringOf(item?.talentUserId, item?.platformUserId, '');
  return {
    ...(item && typeof item === 'object' ? item : {}),
    platformUserId: stringOf(item?.platformUserId, talentUserId),
    talentUserId,
    slug: stringOf(item?.slug, ''),
    name: stringOf(item?.name, '未命名人才'),
    role: stringOf(item?.role, '专业方向未公开'),
    location: stringOf(item?.location, ''),
    score: stringOf(item?.score, ''),
    responseTime: stringOf(item?.responseTime, ''),
    summary: stringOf(item?.summary, item?.intro, '当前还没有更多摘要信息。'),
    intro: stringOf(item?.intro, item?.summary, '当前还没有更多摘要信息。'),
    tags: Array.isArray(item?.tags) ? item.tags : [],
    services: Array.isArray(item?.services) ? item.services : []
  };
}

function normalizeTalentMarketplacePayload(payload) {
  return {
    ...(payload && typeof payload === 'object' ? payload : {}),
    summary: payload?.summary || buildEmptyTalentMarketplace().summary,
    filters: Array.isArray(payload?.filters) ? payload.filters : ['全部'],
    metrics: Array.isArray(payload?.metrics) ? payload.metrics : [],
    items: Array.isArray(payload?.items) ? payload.items.map(normalizeTalentDirectoryItem) : []
  };
}

function normalizeTalentDetailPayload(payload, slug = '') {
  const normalized = normalizeTalentDirectoryItem(payload);
  return {
    ...buildEmptyTalentDetail(slug),
    ...(payload && typeof payload === 'object' ? payload : {}),
    ...normalized,
    slug: stringOf(payload?.slug, slug),
    headlineTags: Array.isArray(payload?.headlineTags) ? payload.headlineTags : [],
    strengths: Array.isArray(payload?.strengths) ? payload.strengths : [],
    services: Array.isArray(payload?.services) ? payload.services : normalized.services,
    portfolio: Array.isArray(payload?.portfolio) ? payload.portfolio : [],
    reviews: Array.isArray(payload?.reviews) ? payload.reviews : [],
    availability: formatTalentAvailability(payload?.availability),
    process: Array.isArray(payload?.process) ? payload.process : []
  };
}

function buildEmptySavedTalentLists() {
  return {
    summary: {
      title: 'Saved talent lists',
      description: '把值得继续沟通的人才沉淀到 list 里，方便回到 shortlist 决策。',
      totalLists: 0,
      totalSavedTalents: 0,
      activeListId: ''
    },
    lists: [],
    gaps: [
      'share-list-not-implemented',
      'bulk-management-not-implemented',
      'saved-search-not-implemented'
    ]
  };
}

function normalizeSavedTalentItem(item) {
  return {
    ...(item && typeof item === 'object' ? item : {}),
    savedItemId: stringOf(item?.savedItemId, ''),
    slug: stringOf(item?.slug, ''),
    platformUserId: stringOf(item?.platformUserId, item?.talentUserId, ''),
    talentUserId: stringOf(item?.talentUserId, item?.platformUserId, ''),
    name: stringOf(item?.name, '未命名人才'),
    role: stringOf(item?.role, '专业方向未公开'),
    summary: stringOf(item?.summary, '当前还没有更多摘要信息。'),
    tags: Array.isArray(item?.tags) ? item.tags : [],
    services: Array.isArray(item?.services) ? item.services : [],
    savedAt: stringOf(item?.savedAt, '')
  };
}

function normalizeSavedTalentList(item) {
  return {
    ...(item && typeof item === 'object' ? item : {}),
    listId: stringOf(item?.listId, ''),
    name: stringOf(item?.name, '未命名 list'),
    itemCount: Number(item?.itemCount || 0),
    updatedAt: stringOf(item?.updatedAt, ''),
    items: Array.isArray(item?.items) ? item.items.map(normalizeSavedTalentItem) : []
  };
}

function normalizeSavedTalentListsPayload(payload) {
  return {
    ...(payload && typeof payload === 'object' ? payload : {}),
    summary: payload?.summary || buildEmptySavedTalentLists().summary,
    lists: Array.isArray(payload?.lists) ? payload.lists.map(normalizeSavedTalentList) : [],
    gaps: Array.isArray(payload?.gaps) ? payload.gaps : buildEmptySavedTalentLists().gaps
  };
}

function buildEmptyAiPublishPresets() {
  const authUser = getStoredAuthUser();
  return {
    defaultPublisherUserId: authUser?.platformUserId || '',
    defaultOrganizationId: authUser?.organizationId || '',
    items: [CUSTOM_PUBLISH_PRESET]
  };
}

function buildEmptyAnalysisResult(brief = '') {
  return {
    brief,
    originalBrief: brief,
    title: '',
    provider: '',
    model: '',
    modules: [],
    tags: [],
    recommendations: [],
    matchingPreview: [],
    schedule: {
      total: '',
      assumption: '',
      risk: ''
    }
  };
}

function approvalCenterIssueMessage(requestError = '') {
  const text = String(requestError || '').trim();
  if (!text) {
    return '';
  }

  return '审批数据暂时不可用，当前只显示正式空态。';
}

function buildTalentCalendarFallback(userId = '2') {
  const today = new Date();
  const formatter = new Intl.DateTimeFormat(getIntlLocale(), getIntlLocale() === 'zh-CN' ? { month: '2-digit', day: '2-digit' } : { month: 'short', day: 'numeric' });
  const items = Array.from({ length: 7 }, (_, index) => {
    const next = new Date(today);
    next.setDate(today.getDate() + index);
    return {
      date: next.toISOString().slice(0, 10),
      day: formatter.format(next),
      state: 'closed',
      note: translateText('当前还没有同步真实档期')
    };
  });
  return {
    userId: String(userId),
    summary: {
      range: items.length ? `${items[0].day} - ${items[items.length - 1].day}` : '',
      openDays: '0',
      busyDays: '0',
      closedDays: String(items.length),
      headline: translateText('当前还没有同步真实档期')
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
    availableActions: [],
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

function buildEmptyOrderRecords(audience = 'enterprise', tab = 'all') {
  const normalizedTab = tab === 'ongoing' || tab === 'completed' ? tab : 'all';
  const title = audience === 'talent' ? '接单记录' : '发单记录';
  const description = audience === 'talent'
    ? '当前还没有可展示的真实接单记录。'
    : '当前还没有可展示的真实发单记录。';
  return {
    role: audience,
    title,
    summary: {
      title,
      description,
      total: 0,
      ongoing: 0,
      completed: 0,
      activeTab: normalizedTab === 'all' ? '全部' : normalizedTab === 'ongoing' ? '进行中' : '已完成',
      latestTaskId: '',
      latestTitle: '',
      latestUpdatedAt: ''
    },
    tabs: [
      { key: 'all', label: '全部', count: 0, active: normalizedTab === 'all' },
      { key: 'ongoing', label: '进行中', count: 0, active: normalizedTab === 'ongoing' },
      { key: 'completed', label: '已完成', count: 0, active: normalizedTab === 'completed' }
    ],
    activeTab: normalizedTab,
    items: []
  };
}

function normalizeWorkspaceData(rawData, taskId = '') {
  const fallback = buildEmptyWorkspaceState(taskId || rawData?.summary?.taskId || '');
  return normalizeWorkspacePayload(rawData, fallback, taskId);
}

export async function registerAuth(payload) {
  const result = await writeJson(
    '/auth/register',
    {
      success: false,
      message: '当前注册接口暂不可用，请稍后再试。'
    },
    {
      ...payload,
      skills: Array.isArray(payload?.skills) ? payload.skills : [],
      customSkills: Array.isArray(payload?.customSkills) ? payload.customSkills : []
    }
  );
  if (result?.requestError) {
    return {
      ...result,
      message: result.requestError
    };
  }
  return result;
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
  return writeJson('/auth/logout', { success: false, message: '当前暂时无法退出登录，请稍后再试。' }, {});
}

export function getLandingData() {
  return readJson('/landing', buildEmptyLandingData());
}

export function getBusinessData() {
  return readJson('/business', buildBusinessFallback());
}

export function getApprovalCenterData() {
  const fallback = {
    approvalHeadline: '审批数据暂时不可用。',
    attentionHeadline: '审批数据暂时不可用。',
    approvalItems: [],
    approvalGroups: []
  };
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
  const fallback = {
    approvalHeadline: '审批动作提交失败。',
    attentionHeadline: '审批动作提交失败。',
    approvalItems: [],
    approvalGroups: []
  };
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

export function getFreelancerEarningsData() {
  const fallback = {
    title: '收入账本',
    walletSummary: {
      title: '收入',
      totalEarned: '￥0',
      totalEarnedValue: '0.00',
      pendingIncome: '￥0',
      pendingIncomeValue: '0.00',
      availableToWithdraw: '￥0',
      availableToWithdrawValue: '0.00',
      frozenAmount: '￥0',
      frozenAmountValue: '0.00',
      withdrawnAmount: '￥0',
      withdrawnAmountValue: '0.00',
      claimableCount: 0,
      claimableRecords: [],
      recentIncome: [],
      withdrawHint: '当前没有可提现余额，请等待企业确认结算。'
    },
    ledger: [],
    claimableRecords: [],
    requestIssue: ''
  };

  return readJson('/freelancer/earnings', fallback).then((payload) => ({
    ...fallback,
    ...(payload && typeof payload === 'object' ? payload : {}),
    ledger: Array.isArray(payload?.ledger) ? payload.ledger : Array.isArray(payload?.walletSummary?.recentIncome) ? payload.walletSummary.recentIncome : [],
    claimableRecords: Array.isArray(payload?.claimableRecords) ? payload.claimableRecords : Array.isArray(payload?.walletSummary?.claimableRecords) ? payload.walletSummary.claimableRecords : []
  }));
}

export function getFreelancerWithdrawalsData() {
  const fallback = {
    title: '提现记录',
    walletSummary: {
      title: '收入',
      totalEarned: '￥0',
      totalEarnedValue: '0.00',
      pendingIncome: '￥0',
      pendingIncomeValue: '0.00',
      availableToWithdraw: '￥0',
      availableToWithdrawValue: '0.00',
      frozenAmount: '￥0',
      frozenAmountValue: '0.00',
      withdrawnAmount: '￥0',
      withdrawnAmountValue: '0.00',
      claimableCount: 0,
      claimableRecords: [],
      recentIncome: [],
      withdrawHint: '当前没有可提现余额，请等待企业确认结算。'
    },
    withdrawals: [],
    requestIssue: ''
  };

  return readJson('/freelancer/withdrawals', fallback).then((payload) => ({
    ...fallback,
    ...(payload && typeof payload === 'object' ? payload : {}),
    withdrawals: Array.isArray(payload?.withdrawals) ? payload.withdrawals : []
  }));
}

export function getFreelancerPayoutProfileData() {
  const fallback = {
    title: '收款方式',
    payoutStatus: 'UNSET',
    payoutMethods: [],
    latestPayoutMethod: null,
    requestIssue: ''
  };

  return readJson('/freelancer/payout-profile', fallback).then((payload) => ({
    ...fallback,
    ...(payload && typeof payload === 'object' ? payload : {}),
    payoutMethods: Array.isArray(payload?.payoutMethods) ? payload.payoutMethods : []
  }));
}

export function getFreelancerTaxProfileData() {
  const fallback = {
    title: '税务资料',
    taxStatus: 'UNSET',
    taxSummary: {
      userStatus: '',
      availableToWithdraw: '￥0',
      frozenAmount: '￥0'
    },
    requestIssue: ''
  };

  return readJson('/freelancer/tax-profile', fallback).then((payload) => ({
    ...fallback,
    ...(payload && typeof payload === 'object' ? payload : {})
  }));
}

export function getFreelancerCollaborationInboxData() {
  const fallback = {
    title: '提案 / 邀请 / Offer',
    summary: {
      proposals: 0,
      invitations: 0,
      offers: 0,
      total: 0,
      note: '当前还没有可以处理的提案或邀约。'
    },
    proposalItems: [],
    invitationItems: [],
    offerItems: [],
    requestIssue: ''
  };

  return readJson('/freelancer/collaboration-inbox', fallback).then((payload) => ({
    ...fallback,
    ...(payload && typeof payload === 'object' ? payload : {}),
    proposalItems: Array.isArray(payload?.proposalItems) ? payload.proposalItems : [],
    invitationItems: Array.isArray(payload?.invitationItems) ? payload.invitationItems : [],
    offerItems: Array.isArray(payload?.offerItems) ? payload.offerItems : []
  }));
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
      note: payload.note || '',
      nextStep: '当前暂时无法更新档期，请稍后再试。',
      status: 'FAILED',
      calendar: buildTalentCalendarFallback(payload.userId)
    }),
    payload
  );
}

export function getTaskMarketplaceData() {
  return readJson('/tasks/marketplace', buildTaskMarketplaceFallback());
}

export function requestTaskCollaboration(taskId, payload = {}) {
  return writeJson(
    `/tasks/${taskId}/collaboration/request`,
    () => ({
      taskId,
      applicationStatus: 'FAILED',
      roomKey: '',
      nextRoute: '',
      nextStep: '当前暂时无法提交合作申请，请稍后重试。'
    }),
    payload
  );
}

export function getTalentMarketplaceData() {
  return readJson('/talents/marketplace', buildEmptyTalentMarketplace()).then((payload) =>
    normalizeTalentMarketplacePayload(payload)
  );
}

export function getTalentDetail(slug) {
  return readJson(`/talents/${slug}`, buildEmptyTalentDetail(slug)).then((payload) =>
    normalizeTalentDetailPayload(payload, slug)
  );
}

export function getSavedTalentLists() {
  return readJson('/client/saved-talent-lists', buildEmptySavedTalentLists()).then((payload) =>
    normalizeSavedTalentListsPayload(payload)
  );
}

export function createSavedTalentList(name) {
  return writeJson(
    '/client/saved-talent-lists',
    () => ({
      summary: buildEmptySavedTalentLists().summary,
      list: null,
      requestError: '当前暂时无法创建人才 list，请稍后再试。'
    }),
    { name }
  ).then((payload) => ({
    ...payload,
    list: payload?.list ? normalizeSavedTalentList(payload.list) : null
  }));
}

export function saveTalentToList(listId, talentUserId) {
  return writeJson(
    `/client/saved-talent-lists/${encodeURIComponent(String(listId || ''))}/items`,
    () => ({
      list: null,
      requestError: '当前暂时无法保存人才，请稍后再试。'
    }),
    { talentUserId: String(talentUserId || '') }
  ).then((payload) => ({
    ...payload,
    list: payload?.list ? normalizeSavedTalentList(payload.list) : null
  }));
}

export function removeTalentFromList(listId, talentUserId) {
  return deleteJson(
    `/client/saved-talent-lists/${encodeURIComponent(String(listId || ''))}/items/${encodeURIComponent(String(talentUserId || ''))}`,
    {
      list: null,
      requestError: '当前暂时无法移出人才，请稍后再试。'
    }
  ).then((payload) => ({
    ...payload,
    list: payload?.list ? normalizeSavedTalentList(payload.list) : null
  }));
}

export async function getCollaborationCandidates(talentUserId) {
  const encodedTalentUserId = encodeURIComponent(String(talentUserId || ''));
  const payload = await readJson(
    `/tasks/collaboration-candidates?talentUserId=${encodedTalentUserId}`,
    {
      summary: {
        title: '可合作任务',
        description: '当前暂时无法读取可合作任务列表。'
      },
      items: []
    }
  );

  const normalizedPayload = normalizeCollaborationCandidatesPayload(payload);
  return normalizedPayload;
}

export function getTaskCollaborationRequests(taskId) {
  return readJson(
    `/tasks/${encodeURIComponent(String(taskId || ''))}/collaboration-requests`,
    {
      taskId: String(taskId || ''),
      title: '',
      brief: '',
      budget: '',
      status: 'FAILED',
      matchingPreview: [],
      assignmentResult: null,
      nextStep: '当前暂时无法读取当前任务的合作申请，请稍后重试。'
    }
  ).then((payload) => ({
    ...payload,
    assignmentResult: payload?.assignmentResult
      ? normalizeAssignmentPayload(
          payload.assignmentResult,
          payload?.taskId || String(taskId || ''),
          payload?.assignmentResult?.talentUserId || payload?.assignmentResult?.selectedTalent?.talentUserId || ''
        )
      : null
  }));
}

export async function startTaskCollaboration(taskId, talentUserId) {
  const fallback = () => ({
    taskId,
    talentUserId,
    selectedTalent: null,
    roomKey: '',
    taskRoom: buildEmptyTaskRoomFallback('').taskRoom,
    nextRoute: '',
    status: 'FAILED',
    imRoomPlanned: false,
    nextStep: '当前暂时无法启动合作，请稍后重试。'
  });

  const response = await writeJson(
    `/tasks/${taskId}/collaboration/start`,
    fallback,
    { talentUserId }
  );
  return normalizeAssignmentPayload(response, taskId, talentUserId);
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

export function requestTaskClaim(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/claims`,
    buildMutationFailure('当前暂时无法发起请款，请稍后再试。', {
      taskId,
      claimId: '',
      claimNo: '',
      amount: '',
      currency: 'CNY',
      requestedBy: 'talent',
      requestedAt: '',
      note: payload?.note || ''
    }),
    {
      note: payload?.note || ''
    }
  );
}

export function reviewTaskClaim(taskId, claimId, payload) {
  return writeJson(
    `/enterprise/claims/${claimId}/actions`,
    buildMutationFailure('当前暂时无法审批请款，请稍后再试。', {
      taskId,
      claimId,
      statusCode: 'FAILED',
      status: 'FAILED',
      decisionNote: payload?.note || '',
      updatedAt: ''
    }),
    {
      action: payload?.action,
      note: payload?.note || ''
    }
  );
}

export function submitTaskInvoice(claimId, payload) {
  return writeJson(
    `/claims/${claimId}/invoice`,
    buildMutationFailure('当前暂时无法提交开票，请稍后再试。', {
      claimId,
      taskId: '',
      invoiceId: '',
      invoice: {
        statusCode: 'FAILED',
        status: 'FAILED',
        invoiceType: payload?.invoiceType || 'ELECTRONIC_NORMAL'
      },
      reconciliation: {
        reconciliationId: '',
        statusCode: 'FAILED',
        status: 'FAILED'
      },
      note: payload?.note || ''
    }),
    {
      invoiceType: payload?.invoiceType || 'ELECTRONIC_NORMAL',
      note: payload?.note || ''
    }
  );
}

export function respondTaskReconciliation(reconciliationId, payload) {
  return writeJson(
    `/enterprise/reconciliations/${reconciliationId}/actions`,
    buildMutationFailure('当前暂时无法处理对账，请稍后再试。', {
      reconciliationId,
      taskId: '',
      reconciliation: {
        reconciliationId,
        statusCode: 'FAILED',
        status: 'FAILED'
      },
      invoice: {
        invoiceId: '',
        statusCode: '',
        status: ''
      },
      settlement: null,
      dispute: null,
      riskTicket: null
    }),
    {
      action: payload?.action,
      note: payload?.note || ''
    }
  );
}

export function respondTaskSettlement(settlementId, payload) {
  return writeJson(
    `/enterprise/settlements/${settlementId}/actions`,
    buildMutationFailure('当前暂时无法执行结算，请稍后再试。', {
      settlementId,
      taskId: '',
      settlement: {
        settlementId,
        statusCode: 'FAILED',
        status: 'FAILED',
        settledAt: ''
      }
    }),
    {
      action: payload?.action,
      note: payload?.note || ''
    }
  );
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
      status: 'FAILED',
      materialStatus: payload.deferMaterials ? 'WAITING_UPLOAD' : 'PENDING_UPLOAD',
      deferMaterials: Boolean(payload.deferMaterials),
      collaborationPreferences: Array.isArray(payload.collaborationPreferences) ? payload.collaborationPreferences : [],
      materialNames: Array.isArray(payload.materials)
        ? payload.materials.map((item) => (typeof item === 'string' ? item : item?.name || item?.label || '')).filter(Boolean)
        : [],
      materialFiles: Array.isArray(payload.materialFiles) ? payload.materialFiles : [],
      nextStep: '当前暂时无法提交企业入驻，请稍后再试。',
      nextRoute: ''
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
      customSkills: Array.isArray(payload.customSkills) ? payload.customSkills : [],
      materials: Array.isArray(payload.materials) ? payload.materials : [],
      materialNames: Array.isArray(payload.materials)
        ? payload.materials.map((item) => (typeof item === 'string' ? item : item?.name || item?.label || '')).filter(Boolean)
        : [],
      materialFiles: Array.isArray(payload.materialFiles) ? payload.materialFiles : [],
      portfolioUrls: Array.isArray(payload.portfolioUrls) ? payload.portfolioUrls : [],
      applyVirtualCompany: Boolean(payload.applyVirtualCompany),
      status: 'FAILED',
      nextStep: '当前暂时无法提交人才入驻，请稍后再试。'
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
      category: payload.category || '',
      skills: Array.isArray(payload.skills) ? payload.skills : [],
      customSkills: Array.isArray(payload.customSkills) ? payload.customSkills : [],
      scope: payload.scope || '',
      timeline: payload.timeline || '',
      talentLevel: payload.talentLevel || '',
      collaborationMode: payload.collaborationMode || '',
      budgetMode: payload.budgetMode || '',
      budgetMin: payload.budgetMin ?? null,
      budgetMax: payload.budgetMax ?? null,
      locationPreference: payload.locationPreference || '',
      languagePreference: payload.languagePreference || '',
      screeningQuestions: Array.isArray(payload.screeningQuestions) ? payload.screeningQuestions : [],
      collaborationPreferences: Array.isArray(payload.collaborationPreferences) ? payload.collaborationPreferences : [],
      additionalNotes: payload.additionalNotes || '',
      contractToHire: Boolean(payload.contractToHire),
      priorityReview: Boolean(payload.priorityReview),
      aiSummary: payload.aiSummary || '',
      status: 'FAILED',
      nextStep: '当前服务不可用，暂时无法生成真实任务，请稍后重试。',
      analysisProvider: '',
      analysisModel: '',
      analysisSummary: {
        total: '',
        assumption: '',
        risk: ''
      },
      matchingPreview: []
    }),
    payload
  );
}

export function confirmTaskAnalysis(taskId) {
  return writeJson(
    `/tasks/${taskId}/analysis/confirm`,
    {
      taskId,
      status: 'FAILED',
      nextStep: '当前暂时无法确认分析结果，请稍后重试。'
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
  ).then((response) => normalizeAssignmentPayload(response, taskId, talentUserId));
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
  if (!payload?.taskId && !payload?.counterpartPlatformUserId) {
    return Promise.resolve({
      ...buildMutationFailure('请先选择任务或明确沟通对象，再进入聊天。', {
        roomKey: '',
        room: null
      }),
      message: '请先选择任务或明确沟通对象，再进入聊天。'
    });
  }
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
  return readJson('/ai/publish-presets', buildEmptyAiPublishPresets()).then(normalizeAiPublishPresets);
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
    provider: 'Realtime messaging',
    enabled: false,
    status: 'UNAVAILABLE',
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
    notes: [
      'Realtime messaging is not configured in this environment.',
      'Use synced history until the live messaging configuration is ready.'
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
  const fallback = buildEmptyOrderRecords(normalizedAudience, normalizedTab);
  return readJson(`/${normalizedAudience}/orders?tab=${normalizedTab}`, fallback);
}

export function getOrderRecordDetail(audience, taskId) {
  const normalizedAudience = audience === 'talent' ? 'talent' : 'enterprise';
  const normalizedTaskId = String(taskId || '');
  const fallback = buildEmptyOrderRecordDetail(normalizedAudience, normalizedTaskId);
  return readJson(`/${normalizedAudience}/orders/${normalizedTaskId}`, fallback);
}

export function requestClientReportExport(payload) {
  return writeJson(
    '/client/reports/export',
    () => ({
      export: null,
      requestError: '当前暂时无法创建导出任务，请稍后再试。'
    }),
    payload
  );
}

export function getClientReportExport(exportId) {
  return readJson(
    `/client/reports/exports/${encodeURIComponent(String(exportId || ''))}`,
    {
      export: null,
      requestError: '当前暂时无法读取导出任务，请稍后再试。'
    }
  );
}

export async function downloadClientReportExport(exportId, fallbackFileName = 'client-report.csv') {
  try {
    const response = await fetch(`${API_BASE}/client/reports/exports/${encodeURIComponent(String(exportId || ''))}/download`, {
      headers: buildAuthHeaders(getStoredAuthToken, {})
    });
    if (!response.ok) {
      const payload = await readResponsePayload(response);
      throw new Error(payload?.msg || '当前暂时无法下载导出文件。');
    }
    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const matchedFileName = disposition.match(/filename=\"([^\"]+)\"/i)?.[1];
    return {
      blob,
      fileName: matchedFileName || fallbackFileName
    };
  } catch (error) {
    return {
      blob: null,
      fileName: fallbackFileName,
      requestError: error instanceof Error ? error.message : '当前暂时无法下载导出文件。'
    };
  }
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

export function uploadStandaloneAttachmentAsset(file, options = {}) {
  return uploadStandaloneAttachmentRuntime(
    {
      apiBase: API_BASE,
      getToken: getStoredAuthToken
    },
    {
      file,
      scene: options.scene || 'ONBOARDING_MATERIAL',
      source: options.source || options.scene || 'ONBOARDING_MATERIAL'
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
      status: 'FAILED',
      nextStep: '当前暂时无法提交进度，请稍后再试。',
      aiSuggestions: [],
      submittedAt: ''
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
    () => ({
      taskId,
      status: 'FAILED',
      nextStep: '当前暂时无法保存企业建议，请稍后再试。',
      nodeId: payload?.nodeId || '',
      businessSuggestion: {
        summary: payload?.summary || '',
        aiSupplement: '',
        updatedAt: '',
        author: ''
      }
    }),
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
      status: 'FAILED',
      nextStep: '当前暂时无法提交验收，请稍后再试。'
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
      status: 'FAILED',
      nextStep: '当前暂时无法提交评分，请稍后再试。'
    },
    {
      revieweeUserId: payload.revieweeUserId,
      rating: payload.rating,
      reviewContent: payload.reviewContent
    }
  );
}

export function analyzeTaskBrief(payload) {
  const normalizedPayload = typeof payload === 'string'
    ? {
        brief: payload
      }
    : {
        title: payload?.title || '',
        brief: payload?.brief || '',
        source: payload?.source || 'TEXT',
        presetId: payload?.presetId || '',
        presetTitle: payload?.presetTitle || '',
        presetTags: Array.isArray(payload?.presetTags) ? payload.presetTags : []
      };
  return writeJson(
    '/ai/decompose',
    buildEmptyAnalysisResult(normalizedPayload.brief || normalizedPayload.title || ''),
    normalizedPayload
  ).then(normalizeAiDecomposeResponse);
}
