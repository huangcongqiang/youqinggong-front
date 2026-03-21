import { mockAnalyzeTaskBrief, webMockData } from '../data/mock';

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
  taskId: 'task-001',
  participants: ['星河智能', '陈一宁', 'AI 系统消息'],
  messages: [
    { author: '系统消息', type: 'SYSTEM', text: '项目沟通已开启，可在这里同步需求确认与阶段进展。' },
    { author: '星河智能', type: 'TEXT', text: '我们先按 3 周首版推进。' },
    { author: '陈一宁', type: 'TEXT', text: '收到，我会先按里程碑拆出首版交付清单。' }
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
      taskId: 'task-20260321-publish',
      publisherUserId: String(payload.publisherUserId),
      organizationId: String(payload.organizationId || 1),
      title: payload.title,
      brief: payload.brief,
      source: payload.source,
      status: 'AI_ANALYZING',
      nextStep: '任务已进入 AI 拆解阶段，等待 B 端确认模块和工期。'
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

export function getTaskRoom() {
  return readJson('/messages/task-room', taskRoomFallback);
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
