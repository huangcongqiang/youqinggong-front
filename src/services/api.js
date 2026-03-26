import {
  aiPublishPresetMockData,
  mockAnalyzeTaskBrief,
  buildWorkspaceFallback,
  buildWorkspaceFeedbackFallback,
  webMockData
} from '../data/mock';
import { roleRouteMap } from '../utils/roleRoutes';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';
const AUTH_TOKEN_KEY = 'youqinggong.auth.token';
const AUTH_USER_KEY = 'youqinggong.auth.user';
const AUTH_EXPIRES_KEY = 'youqinggong.auth.expiresAt';

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredAuthToken() {
  if (!hasStorage()) {
    return '';
  }
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

export function getStoredAuthUser() {
  if (!hasStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

export function getStoredAuthExpiresAt() {
  if (!hasStorage()) {
    return '';
  }
  return window.localStorage.getItem(AUTH_EXPIRES_KEY) || '';
}

export function isAuthSessionExpired(expiresAt) {
  if (!expiresAt) {
    return false;
  }
  const expiresAtMs = Date.parse(expiresAt);
  if (Number.isNaN(expiresAtMs)) {
    return false;
  }
  return expiresAtMs <= Date.now();
}

export function hasFreshStoredAuthSession() {
  const token = getStoredAuthToken();
  if (!token) {
    return false;
  }
  return !isAuthSessionExpired(getStoredAuthExpiresAt());
}

export function persistAuthSession(token, user, expiresAt) {
  if (!hasStorage()) {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  if (expiresAt) {
    window.localStorage.setItem(AUTH_EXPIRES_KEY, expiresAt);
  }
}

export function clearStoredAuthSession() {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem(AUTH_EXPIRES_KEY);
}

function buildHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = getStoredAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function readJson(path, fallback, options) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: buildHeaders(options?.headers || {})
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return fallback;
  }
}

async function writeJson(path, fallback, body) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return typeof fallback === 'function' ? fallback() : fallback;
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
      description: '当前还没有真实已发布任务，企业发布后会在这里实时出现。'
    },
    filters: ['全部', 'AI 产品', '前端开发', '品牌设计', '数据分析', '内容增长'],
    metrics: [
      { label: '当前任务总数', value: '0', note: '这里不再展示预置演示任务。' },
      { label: '待选人才', value: '0', note: '企业发布并确认拆解后会进入待选人才阶段。' },
      { label: '协商进行中', value: '0', note: '聊天确认后的任务会同步到这里。' },
      { label: '最近新增', value: '0', note: '新任务会自动排在最前面。' }
    ],
    items: []
  };
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

function normalizeWorkspaceData(rawData, taskId = '') {
  const fallback = buildWorkspaceFallback(taskId || rawData?.summary?.taskId || '');
  const raw = rawData && typeof rawData === 'object' ? rawData : null;

  if (!raw) {
    return fallback;
  }

  const requestedTaskId = String(taskId || '').trim();
  const rawTaskId = String(raw?.summary?.taskId || raw?.taskDetail?.taskId || '').trim();
  const hasTaskOptions = Object.prototype.hasOwnProperty.call(raw, 'taskOptions');
  const hasCollaborationNodes = Object.prototype.hasOwnProperty.call(raw, 'collaborationNodes');
  const hasEnterpriseCollections = hasTaskOptions || hasCollaborationNodes;

  if (requestedTaskId && rawTaskId && rawTaskId !== requestedTaskId && !hasEnterpriseCollections) {
    return buildWorkspaceFallback(requestedTaskId);
  }

  const mergedTaskDetail = Object.prototype.hasOwnProperty.call(raw, 'taskDetail') ? raw.taskDetail : fallback.taskDetail;
  const mergedTaskOptions = hasTaskOptions ? (Array.isArray(raw.taskOptions) ? raw.taskOptions : []) : fallback.taskOptions;
  const mergedNodes = hasCollaborationNodes
    ? (Array.isArray(raw.collaborationNodes) ? raw.collaborationNodes : [])
    : fallback.collaborationNodes;

  return {
    ...fallback,
    ...raw,
    summary: {
      ...fallback.summary,
      ...(raw.summary || {})
    },
    taskDetail: mergedTaskDetail,
    taskOptions: mergedTaskOptions,
    collaborationNodes: mergedNodes,
    focus: raw.focus || fallback.focus,
    pulse: Object.prototype.hasOwnProperty.call(raw, 'pulse')
      ? (Array.isArray(raw.pulse) ? raw.pulse : [])
      : fallback.pulse,
    executionChecklist: Object.prototype.hasOwnProperty.call(raw, 'executionChecklist')
      ? (Array.isArray(raw.executionChecklist) ? raw.executionChecklist : [])
      : fallback.executionChecklist,
    progressFeed: Object.prototype.hasOwnProperty.call(raw, 'progressFeed')
      ? (Array.isArray(raw.progressFeed) ? raw.progressFeed : [])
      : fallback.progressFeed,
    assetLibrary: Object.prototype.hasOwnProperty.call(raw, 'assetLibrary')
      ? (Array.isArray(raw.assetLibrary) ? raw.assetLibrary : [])
      : fallback.assetLibrary,
    aiReviewHistory: Object.prototype.hasOwnProperty.call(raw, 'aiReviewHistory')
      ? (Array.isArray(raw.aiReviewHistory) ? raw.aiReviewHistory : [])
      : fallback.aiReviewHistory,
    reviewHistory: Object.prototype.hasOwnProperty.call(raw, 'reviewHistory')
      ? (Array.isArray(raw.reviewHistory) ? raw.reviewHistory : [])
      : fallback.reviewHistory,
    supportOptions: Object.prototype.hasOwnProperty.call(raw, 'supportOptions')
      ? (Array.isArray(raw.supportOptions) ? raw.supportOptions : [])
      : fallback.supportOptions,
    acceptance: Object.prototype.hasOwnProperty.call(raw, 'acceptance')
      ? (Array.isArray(raw.acceptance) ? raw.acceptance : [])
      : fallback.acceptance
  };
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
  return readJson(`/workspace${query}`, buildWorkspaceFallback(taskId), undefined).then((raw) =>
    normalizeWorkspaceData(raw, taskId)
  );
}

export function getTaskClosureData(taskId) {
  return readJson(`/tasks/${taskId}/closure`, webMockData.taskClosure);
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
      status: 'PENDING_REVIEW',
      nextStep: '平台将校验作品与实名材料，审核通过后开放接单和推荐资格。'
    }),
    payload
  );
}

export function publishTask(payload) {
  return writeJson(
    '/tasks/publish',
    () => ({
      taskId: '',
      publisherUserId: String(payload.publisherUserId || ''),
      organizationId: String(payload.organizationId || ''),
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
    payload
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

export function confirmNegotiation(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/negotiations/confirm`,
    {
      taskId,
      businessUserId: String(payload.businessUserId),
      talentUserId: String(payload.talentUserId),
      agreementNote: payload.agreementNote,
      status: 'IN_PROGRESS',
      nextStep: '若双方均确认，则正式进入执行阶段并开启项目沟通。'
    },
    payload
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
      submitterUserId: String(payload.submitterUserId),
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
    payload
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
      accepterUserId: String(payload.accepterUserId),
      acceptanceNote: payload.acceptanceNote,
      status: 'ACCEPTED',
      nextStep: '验收完成，进入双方评分和信用画像沉淀。'
    },
    payload
  );
}

export function submitReview(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/reviews`,
    {
      taskId,
      reviewerUserId: String(payload.reviewerUserId),
      revieweeUserId: String(payload.revieweeUserId),
      rating: String(payload.rating),
      reviewContent: payload.reviewContent,
      status: 'RECORDED',
      nextStep: '评分已写入平台信用画像与后续推荐逻辑。'
    },
    payload
  );
}

export function analyzeTaskBrief(brief) {
  const fallback = mockAnalyzeTaskBrief(brief);
  return writeJson('/ai/decompose', { ...fallback, provider: '本地分析', model: 'rule-based' }, { brief });
}
