import {
  aiPublishPresetMockData,
  getTaskRoomBindingMock,
  getTaskRoomCounterpartMock,
  getTaskRoomMemberMock,
  getTaskRoomMock,
  getTaskRoomsMock,
  mockAnalyzeTaskBrief,
  webMockData
} from '../data/mock';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

async function readJson(path, fallback, options) {
  try {
    const response = await fetch(`${API_BASE}${path}`, options);
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
      headers: {
        'Content-Type': 'application/json'
      },
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

const taskRoomFallback = {
  roomKey: 'launch-sprint',
  taskId: 'task-001',
  title: 'AI 招聘 H5 首版',
  stage: '需求确认中',
  focus: '确认 3 周 MVP 范围，并锁定哪些能力放到第二阶段。',
  taskRoom: {
    taskId: 'task-001',
    provider: 'TENCENT_IM',
    providerRoomId: 'group_task_001',
    groupType: 'Public',
    joinOption: 'FreeAccess',
    status: 'ACTIVE'
  },
  members: [
    {
      audience: 'enterprise',
      platformUserId: 'business-user-001',
      imUserId: 'u_business_user_001',
      displayName: '星河智能',
      role: 'PROJECT_OWNER'
    },
    {
      audience: 'talent',
      platformUserId: 'talent-user-002',
      imUserId: 'u_talent_user_002',
      displayName: '陈一宁',
      role: 'TALENT'
    },
    {
      audience: 'system',
      platformUserId: 'system-ai',
      imUserId: 'system_ai',
      displayName: 'AI 系统消息',
      role: 'SYSTEM'
    }
  ],
  participants: ['星河智能', '陈一宁', 'AI 系统消息'],
  quickReplies: ['这条范围我确认', '先把支付放到二期', '今晚回传首版结构'],
  taskTags: ['Vue 3', '任务闭环', '现代科技感'],
  pendingActions: ['确认支付与结算延后', '确认首页首屏信息层级'],
  messages: [
    { author: '系统消息', type: 'SYSTEM', time: '09:12', text: '项目沟通已开启，可在这里同步需求确认与阶段进展。' },
    { author: '星河智能', type: 'TEXT', time: '09:18', text: '我们先按 3 周首版推进。' },
    { author: '陈一宁', type: 'TEXT', time: '09:31', text: '收到，我会先按里程碑拆出首版交付清单。' }
  ]
};

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

export function getLandingData() {
  return readJson('/landing', webMockData.landing);
}

export function getBusinessData() {
  return readJson('/business', webMockData.business);
}

export function getTalentData() {
  return readJson('/talent', webMockData.talent);
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
  return readJson('/tasks/marketplace', webMockData.taskMarketplace);
}

export function getTalentMarketplaceData() {
  return readJson('/talents/marketplace', webMockData.talentMarketplace);
}

export function getTalentDetail(slug) {
  const fallback = webMockData.talentProfiles[slug] || webMockData.talentProfiles['chen-yining'];
  return readJson(`/talents/${slug}`, fallback);
}

export function getWorkspaceData() {
  return readJson('/workspace', webMockData.workspace);
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
      status: 'PENDING_REVIEW',
      nextStep: '后台审核企业材料，审核通过后开放发布任务权限。'
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
      taskId: `task-demo-${Date.now()}`,
      publisherUserId: String(payload.publisherUserId),
      organizationId: String(payload.organizationId || 1),
      title: payload.title,
      brief: payload.brief,
      source: payload.source,
      status: 'AI_ANALYZING',
      nextStep: '任务已进入 AI 拆解阶段，等待 B 端确认模块和工期。',
      analysisProvider: 'Mock AI',
      analysisModel: 'rule-based',
      analysisSummary: {
        total: '12 个开发日',
        risk: '建议先锁第一阶段交付范围，再进入人才匹配。'
      },
      matchingPreview: mockAnalyzeTaskBrief(payload.brief).matchingPreview
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

export function getTaskRooms() {
  return readJson(
    '/messages/task-rooms',
    {
      summary: {
        activeRooms: String(getTaskRoomsMock().length),
        waitingReply: '2',
        unreadRooms: '2'
      },
      items: getTaskRoomsMock()
    }
  );
}

export function getTaskRoom(roomKey) {
  const fallback = roomKey ? getTaskRoomMock(roomKey) : taskRoomFallback;
  const path = roomKey ? `/messages/task-room/${roomKey}` : '/messages/task-room';
  return readJson(path, fallback);
}

export function sendTaskRoomMessage(roomKey, payload) {
  return writeJson(
    `/messages/task-room/${roomKey}/messages`,
    () => {
      const room = getTaskRoomMock(roomKey);
      const time = '刚刚';
      room.messages.push({
        author: payload.author || '星河智能',
        type: payload.type || 'TEXT',
        time,
        text: payload.text || '收到，我先按当前版本推进。'
      });
      room.messages.push({
        author: 'AI 系统消息',
        type: 'SYSTEM',
        time,
        text: '消息已写入任务房间，建议把它转成明确的范围、里程碑或交付件说明。'
      });
      room.lastTime = time;
      room.lastMessage = payload.text || '收到，我先按当前版本推进。';
      room.unreadCount = '0';
      return room;
    },
    payload
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
  const normalizedRoomKey = roomKey || 'launch-sprint';
  const room = getTaskRoomMock(normalizedRoomKey);
  const currentUser = getTaskRoomMemberMock(normalizedRoomKey, normalizedAudience);
  const counterpartUser = getTaskRoomCounterpartMock(normalizedRoomKey, normalizedAudience);
  const taskRoom = getTaskRoomBindingMock(normalizedRoomKey);
  const fallback = {
    provider: 'Tencent IM',
    enabled: false,
    status: 'MOCK_FALLBACK',
    audience: normalizedAudience,
    sdkAppId: '',
    platformUserId: currentUser.platformUserId,
    userId: currentUser.imUserId,
    userSig: '',
    displayName: currentUser.displayName,
    roomKey: normalizedRoomKey,
    groupId: taskRoom.providerRoomId || room.roomId,
    roomTitle: room.title,
    taskId: room.taskId,
    conversationType: 'GROUP',
    groupType: taskRoom.groupType || 'Public',
    joinOption: taskRoom.joinOption || 'FreeAccess',
    currentUser,
    counterpartUser,
    members: room.members || [],
    taskRoom,
    useMockFallback: true,
    notes: [
      '尚未配置腾讯 IM SDKAppID 或 AppKey，前台会继续显示演示消息数据。',
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

export function submitTaskProgress(taskId, payload) {
  return writeJson(
    `/tasks/${taskId}/progress`,
    {
      taskId,
      submitterUserId: String(payload.submitterUserId),
      progressText: payload.progressText,
      completionPercent: String(payload.completionPercent),
      status: 'AI_REVIEW_PENDING',
      nextStep: '进度已提交，AI 将生成审查建议并提醒 B 端查看。'
    },
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
  return writeJson('/ai/decompose', fallback, { brief });
}
