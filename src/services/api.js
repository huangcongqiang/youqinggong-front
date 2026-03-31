import { roleRouteMap } from '../utils/roleRoutes';
import { normalizeWorkspacePayload } from './workspacePayload.js';
import {
  clearStoredAuthSession,
  getStoredAuthExpiresAt,
  getStoredAuthToken,
  getStoredAuthUser,
  hasFreshStoredAuthSession,
  isAuthSessionExpired,
  persistAuthSession
} from './authSession.js';
import { attachRequestError, buildAuthHeaders, readResponsePayload } from './httpClient.js';
import { resolveApiBase } from './apiBase.js';
import { uploadTaskAttachmentRuntime } from './uploadWorkflow.js';

export {
  clearStoredAuthSession,
  getStoredAuthExpiresAt,
  getStoredAuthToken,
  getStoredAuthUser,
  hasFreshStoredAuthSession,
  isAuthSessionExpired,
  persistAuthSession
} from './authSession.js';

const API_BASE = resolveApiBase(import.meta.env || {}, typeof window === 'undefined' ? globalThis : window);

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

function buildMutationFailure(nextStep, state = {}) {
  return {
    success: false,
    status: 'FAILED',
    nextStep,
    ...state
  };
}

function buildEmptyLandingData() {
  return {
    badges: [],
    entryNotes: [],
    metrics: [],
    pillars: [],
    stages: [],
    roles: [],
    rolePaths: [],
    cases: [],
    contacts: [],
    differentiators: []
  };
}

function buildEmptyTaskMarketplace() {
  return {
    summary: {
      title: '任务广场',
      description: '当前没有可展示的真实任务，稍后再回来看看。'
    },
    filters: ['全部'],
    filterGroups: {
      tag: ['全部'],
      period: ['全部'],
      budget: ['全部'],
      companyRating: ['全部']
    },
    metrics: [
      { label: '当前任务总数', value: '0', note: '这里只展示仍在招募中的真实任务。' }
    ],
    items: []
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
    name: '暂无资料',
    role: '待补充',
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
    availability: [],
    process: []
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

function buildEmptyAiPublishPresets() {
  const authUser = getStoredAuthUser();
  return {
    defaultPublisherUserId: authUser?.platformUserId || '',
    defaultOrganizationId: authUser?.organizationId || '',
    items: []
  };
}

function buildEmptyOrderRecords(audience = 'enterprise', tab = 'all') {
  return {
    role: audience,
    title: audience === 'talent' ? '接单记录' : '发单记录',
    summary: {
      title: audience === 'talent' ? '接单记录' : '发单记录',
      description: audience === 'talent'
        ? '按接单、执行和验收节奏查看每一单合作。'
        : '按发单、执行和结算节奏查看每一单合作。',
      total: 0,
      ongoing: 0,
      completed: 0,
      activeTab: tab,
      latestTaskId: '',
      latestTitle: '',
      latestUpdatedAt: ''
    },
    tabs: [
      { key: 'all', label: '全部', count: 0, active: tab === 'all' },
      { key: 'ongoing', label: '进行中', count: 0, active: tab === 'ongoing' },
      { key: 'completed', label: '已完成', count: 0, active: tab === 'completed' }
    ],
    activeTab: tab,
    items: []
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

function buildEmptyAnalysisResult(brief = '') {
  return {
    brief,
    title: '',
    provider: '',
    model: '',
    modules: [],
    tags: [],
    recommendations: [],
    matchingPreview: [],
    schedule: {
      total: '',
      risk: ''
    }
  };
}

const onboardingFallback = {
  business: ['上传营业执照或企业证明', '补充联系人与合作偏好', '等待后台审核通过后再发布任务'],
  talent: ['填写简介、技能和作品', '补充作品与服务方向', '设置接单日历']
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
      '若走个人经营者 / 虚拟企业路径，则补充身份证与实名材料',
      '通过后台审核后启用发布权限与项目沟通权限'
    ],
    sampleBrief: '',
    recommendedTalents: [],
    taskBoard: [],
    liveConversation: [],
    contractSummary: []
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

function buildTalentCalendarFallback(userId = '2') {
  return {
    userId: String(userId),
    summary: {
      range: '',
      openDays: '0',
      busyDays: '0',
      closedDays: '0',
      headline: '当前还没有同步真实档期'
    },
    items: []
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
  return writeJson(
    '/auth/logout',
    {
      success: false,
      message: '当前退出接口暂不可用，本地会话会继续按退出处理。'
    },
    {}
  );
}

export function getLandingData() {
  return readJson('/landing', buildEmptyLandingData());
}

export function getBusinessData() {
  return readJson('/business', buildBusinessFallback());
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
    () => buildMutationFailure(
      '当前暂时无法更新真实档期，请稍后再试。',
      {
      userId: String(payload.userId),
      availableDate: payload.availableDate,
      availabilityStatus: payload.availabilityStatus,
      state: String(payload.availabilityStatus || 'CLOSED').toLowerCase(),
      note: payload.note || '',
      calendar: buildTalentCalendarFallback(payload.userId)
      }
    ),
    payload
  );
}

export function getTaskMarketplaceData() {
  return readJson('/tasks/marketplace', buildTaskMarketplaceFallback());
}

export function getTalentMarketplaceData() {
  return readJson('/talents/marketplace', buildEmptyTalentMarketplace());
}

export function getTalentDetail(slug) {
  return readJson(`/talents/${slug}`, buildEmptyTalentDetail(slug));
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
    () => buildMutationFailure(
      '当前暂时无法提交企业入驻，请稍后再试。',
      {
      organizationName: payload.organizationName,
      contactName: payload.contactName,
      contactMobile: payload.contactMobile,
      materialStatus: payload.deferMaterials ? 'WAITING_UPLOAD' : 'PENDING_UPLOAD',
      deferMaterials: Boolean(payload.deferMaterials),
      collaborationPreferences: Array.isArray(payload.collaborationPreferences) ? payload.collaborationPreferences : [],
      materialNames: Array.isArray(payload.materialFiles) ? payload.materialFiles.map((file) => file.name).filter(Boolean) : [],
      materialFiles: Array.isArray(payload.materialFiles) ? payload.materialFiles : [],
      nextRoute: ''
      }
    ),
    payload
  );
}

export function submitTalentOnboarding(payload) {
  return writeJson(
    '/onboarding/talent',
    () => buildMutationFailure(
      '当前暂时无法提交人才入驻，请稍后再试。',
      {
      displayName: payload.displayName,
      headline: payload.headline,
      skills: Array.isArray(payload.skills) ? payload.skills : [],
      portfolioUrls: Array.isArray(payload.portfolioUrls) ? payload.portfolioUrls : [],
      nextRoute: ''
      }
    ),
    payload
  );
}

export function publishTask(payload) {
  const authUser = getStoredAuthUser();
  return writeJson(
    '/tasks/publish',
    () => buildMutationFailure(
      '当前服务不可用，暂时无法生成真实任务，请稍后重试。',
      {
      taskId: '',
      publisherUserId: String(authUser?.platformUserId || payload.publisherUserId || ''),
      organizationId: String(authUser?.organizationId || payload.organizationId || ''),
      title: payload.title,
      brief: payload.brief,
      source: payload.source,
      budget: payload.budget || '未填写预算',
      nextStep: '当前服务不可用，暂时无法生成真实任务，请稍后重试。',
      analysisProvider: '本地分析',
      analysisModel: 'rule-based',
      analysisSummary: {
        total: '',
        assumption: '',
        risk: ''
      },
      matchingPreview: []
      }
    ),
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
    buildMutationFailure('当前暂时无法确认分析结果，请稍后重试。', {
      taskId,
      matchingPreview: []
    }),
    {}
  );
}

export function selectTaskAssignment(taskId, talentUserId) {
  return writeJson(
    `/tasks/${taskId}/assignments/select`,
    () => ({
      taskId,
      talentUserId: '',
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
      ...buildMutationFailure('当前暂时无法建立聊天房间，请稍后再试。', {
        roomKey: '',
        room: null
      }),
      message: '当前暂时无法建立聊天房间，请稍后再试。'
    }),
    payload
  );
}

export function sendTaskRoomMessage(roomKey, payload) {
  return writeJson(
    `/messages/task-room/${roomKey}/messages`,
    () => buildMutationFailure('当前暂时无法发送消息，请稍后再试。', { roomKey }),
    payload
  );
}

export function refreshTaskRoomCommunicationRecord(roomKey) {
  return writeJson(
    `/messages/task-room/${roomKey}/communication-record`,
    () => buildMutationFailure('当前暂时无法生成沟通纪要，请稍后再试。', { roomKey }),
    {}
  );
}

export function getAiPublishPresets() {
  return readJson(
    '/ai/publish-presets',
    buildEmptyAiPublishPresets()
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
    status: 'DISABLED',
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
    useMockFallback: false,
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
  const fallback = buildEmptyOrderRecords(normalizedAudience, normalizedTab);
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
    buildMutationFailure('当前暂时无法确认协商结果，请稍后再试。', {
      taskId,
      talentUserId: String(payload.talentUserId),
      agreementNote: payload.agreementNote
    }),
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
    () => buildMutationFailure('当前暂时无法更新任务确认单，请稍后再试。', { taskId }),
    payload
  );
}

export function submitTaskProgress(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/progress`,
    buildMutationFailure('当前暂时无法提交进度，请稍后再试。', {
      taskId,
      stage: payload.stage,
      progressText: payload.progressText,
      supportNeeded: payload.supportNeeded,
      completionPercent: String(payload.completionPercent),
      attachmentFiles: Array.isArray(payload.attachmentFiles) ? payload.attachmentFiles : [],
      attachmentNames: Array.isArray(payload.attachmentFiles)
        ? payload.attachmentFiles.map((item) => item.name).filter(Boolean)
        : [],
      aiSuggestions: [],
      submittedAt: ''
    }),
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
    () => buildMutationFailure('当前暂时无法保存企业建议，请稍后再试。', {
      taskId,
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
    () => buildMutationFailure('当前服务不可用，暂时无法处理提前完成流程。', {
      taskId,
      earlyCompletion: {
        status: '未发起'
      }
    }),
    payload
  );
}

export function submitTaskCancellation(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/cancellation`,
    () => buildMutationFailure('当前服务不可用，暂时无法处理取消任务流程。', {
      taskId,
      cancellationRequest: {
        status: '未发起'
      }
    }),
    payload
  );
}

export function submitAcceptance(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/acceptance`,
    buildMutationFailure('当前暂时无法提交验收，请稍后再试。', {
      taskId,
      acceptanceNote: payload.acceptanceNote
    }),
    {
      acceptanceNote: payload.acceptanceNote
    }
  );
}

export function submitReview(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/reviews`,
    buildMutationFailure('当前暂时无法提交评分，请稍后再试。', {
      taskId,
      revieweeUserId: String(payload.revieweeUserId),
      rating: String(payload.rating),
      reviewContent: payload.reviewContent
    }),
    {
      revieweeUserId: payload.revieweeUserId,
      rating: payload.rating,
      reviewContent: payload.reviewContent
    }
  );
}

export function analyzeTaskBrief(brief) {
  return writeJson('/ai/decompose', buildEmptyAnalysisResult(brief), { brief });
}
