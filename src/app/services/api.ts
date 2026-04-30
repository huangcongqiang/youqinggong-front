import { resolveApiBase } from "./apiBase";
import { getStoredAuthToken } from "./authSession";
import { buildAuthHeaders, readResponsePayload, requestErrorMessage, unwrapEnvelopePayload } from "./httpClient";

export type AuthAudience = "enterprise" | "talent" | "admin";

export interface AuthLoginPayload {
  audience: AuthAudience;
  mobile?: string;
  email?: string;
  password: string;
}

export interface AuthRegisterPayload extends AuthLoginPayload {
  displayName: string;
  organizationName?: string;
  headline?: string;
  skills?: string[];
}

export interface ApiFailure {
  requestError?: string;
  requestStatus?: number;
}

const API_BASE = resolveApiBase(
  import.meta.env as Record<string, string | undefined>,
  typeof window === "undefined" ? globalThis : window
);

async function readJson<T>(path: string, fallback: T): Promise<T & ApiFailure> {
  try {
    const targetUrl = /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;
    const response = await fetch(targetUrl, {
      headers: buildAuthHeaders(getStoredAuthToken, {})
    });
    const payload = await readResponsePayload(response);
    return unwrapEnvelopePayload<T & ApiFailure>(response, payload);
  } catch (error) {
    return {
      ...(fallback && typeof fallback === "object" ? fallback : {}),
      requestError: requestErrorMessage(error),
      requestStatus: (error as { status?: number })?.status || 0
    } as T & ApiFailure;
  }
}

async function writeJson<T>(path: string, fallback: T, body: unknown): Promise<T & ApiFailure> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: buildAuthHeaders(getStoredAuthToken, {
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(body)
    });
    const payload = await readResponsePayload(response);
    return unwrapEnvelopePayload<T & ApiFailure>(response, payload);
  } catch (error) {
    return {
      ...(fallback && typeof fallback === "object" ? fallback : {}),
      requestError: requestErrorMessage(error),
      requestStatus: (error as { status?: number })?.status || 0
    } as T & ApiFailure;
  }
}

async function putBinary<T>(path: string, fallback: T, file: File, contentType = "application/octet-stream"): Promise<T & ApiFailure> {
  try {
    const targetUrl = /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`;
    const response = await fetch(targetUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType
      },
      body: file
    });
    const payload = await readResponsePayload(response);
    return unwrapEnvelopePayload<T & ApiFailure>(response, payload);
  } catch (error) {
    return {
      ...(fallback && typeof fallback === "object" ? fallback : {}),
      requestError: requestErrorMessage(error),
      requestStatus: (error as { status?: number })?.status || 0
    } as T & ApiFailure;
  }
}

export function loginAuth(payload: AuthLoginPayload) {
  return writeJson(
    "/auth/login",
    {
      success: false,
      message: "当前登录接口暂不可用，请稍后再试。"
    },
    payload
  );
}

export function registerAuth(payload: AuthRegisterPayload) {
  return writeJson(
    "/auth/register",
    {
      success: false,
      message: "当前注册接口暂不可用，请稍后再试。"
    },
    {
      ...payload,
      skills: Array.isArray(payload.skills) ? payload.skills : []
    }
  );
}

export function getAuthMe() {
  return readJson("/auth/me", {
    authenticated: false,
    user: null,
    expiresAt: ""
  });
}

export function logoutAuth() {
  return writeJson("/auth/logout", { success: false, message: "当前暂时无法退出登录，请稍后再试。" }, {});
}

export function getBusinessData() {
  return readJson("/business", {
    attentionItems: [],
    taskBoard: [],
    financeSummary: null,
    notifications: []
  });
}

export function getLandingData() {
  return readJson("/landing", {
    badges: [],
    roleCards: [],
    journeys: [],
    cases: [],
    contacts: [],
    highlights: []
  });
}

export function getTalentData() {
  return readJson("/talent", {
    overview: null,
    walletSummary: null,
    claimableRecords: [],
    withdrawals: [],
    notifications: [],
    taskPool: []
  });
}

export function getTaskMarketplaceData(params: { page?: number; size?: number; keyword?: string; category?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.size) query.set("size", String(params.size));
  if (params.keyword?.trim()) query.set("keyword", params.keyword.trim());
  if (params.category?.trim()) query.set("category", params.category.trim());
  const suffix = query.toString();
  return readJson(`/tasks/marketplace${suffix ? `?${suffix}` : ""}`, {
    items: [],
    tasks: [],
    categories: [],
    pagination: {
      page: 1,
      pageSize: params.size || 24,
      total: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false
    }
  });
}

export function getTalentMarketplaceData(params: { page?: number; size?: number; keyword?: string; filter?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.size) query.set("size", String(params.size));
  if (params.keyword?.trim()) query.set("keyword", params.keyword.trim());
  if (params.filter?.trim()) query.set("filter", params.filter.trim());
  const suffix = query.toString();
  return readJson(`/talents/marketplace${suffix ? `?${suffix}` : ""}`, {
    items: [],
    talents: [],
    pagination: {
      page: 1,
      pageSize: params.size || 8,
      total: 0,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false
    }
  });
}

export function getTalentDetailData(slug: string) {
  return readJson(`/talents/${encodeURIComponent(slug)}`, {
    slug,
    name: "",
    role: "",
    headline: "",
    intro: "",
    skills: [],
    portfolio: [],
    reviews: []
  });
}

export function getEnterpriseApprovalsData() {
  return readJson("/enterprise/approvals", {
    approvalHeadline: "",
    approvalItems: [],
    approvalGroups: []
  });
}

export function submitEnterpriseApprovalAction(approvalId: string, payload: unknown) {
  return writeJson(`/enterprise/approvals/${encodeURIComponent(approvalId)}/actions`, {
    approvalId,
    status: "FAILED",
    nextStep: "当前暂时无法处理审批。"
  }, payload);
}

export function getOnboardingChecklists() {
  return readJson("/onboarding/checklists", {
    business: [],
    talent: []
  });
}

export function submitBusinessOnboarding(payload: unknown) {
  return writeJson("/onboarding/business", {
    success: false,
    status: "FAILED",
    nextStep: "当前暂时无法提交企业入驻。"
  }, payload);
}

export function submitTalentOnboarding(payload: unknown) {
  return writeJson("/onboarding/talent", {
    success: false,
    status: "FAILED",
    nextStep: "当前暂时无法提交人才入驻。"
  }, payload);
}

export function getAiPublishPresets() {
  return readJson("/ai/publish-presets", {
    presets: [],
    templates: [],
    suggestions: []
  });
}

export function getTagCatalog() {
  return readJson("/tags/catalog", {
    skills: [],
    businessTags: [],
    deliverableTags: [],
    customTags: []
  });
}

export function decomposeTaskBrief(payload: unknown) {
  return writeJson("/ai/decompose", {
    modules: [],
    recommendations: [],
    skillTags: [],
    riskSummary: [],
    status: "FAILED",
    nextStep: "当前暂时无法拆解任务。"
  }, payload);
}

export function getRecruitingWorkspaceData(taskId = "") {
  const suffix = taskId ? `?taskId=${encodeURIComponent(taskId)}` : "";
  return readJson(`/enterprise/recruiting${suffix}`, {
    task: null,
    applications: [],
    counts: { total: 0, pending: 0, interviewPending: 0, accepted: 0, confirmed: 0, autoClosed: 0 }
  });
}

export function sendRecruitingInterviewInvite(payload: {
  taskId: string;
  talentUserId: string | number;
  interviewAt: string;
  meetingCode: string;
  note?: string;
}) {
  const taskId = String(payload.taskId || "");
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/recruiting/interview/invite`, {
    taskId,
    status: "FAILED",
    nextStep: "当前暂时无法发送面试邀约。"
  }, {
    ...payload,
    talentUserId: Number(payload.talentUserId)
  });
}

export function respondRecruitingInterviewInvite(payload: {
  taskId: string;
  talentUserId: string | number;
  decision: "ACCEPT" | "REJECT";
}) {
  const taskId = String(payload.taskId || "");
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/recruiting/interview/decision`, {
    taskId,
    status: "FAILED",
    nextStep: "当前暂时无法回应面试邀约。"
  }, {
    ...payload,
    talentUserId: Number(payload.talentUserId)
  });
}

export function recordRecruitingInterviewOutcome(payload: {
  taskId: string;
  talentUserId: string | number;
  outcome: "PASS_CONFIRM" | "FAIL" | "CONTINUE" | "REJECT_APPLICATION";
}) {
  const taskId = String(payload.taskId || "");
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/recruiting/outcome`, {
    taskId,
    status: "FAILED",
    nextStep: "当前暂时无法记录招聘结果。"
  }, {
    ...payload,
    talentUserId: Number(payload.talentUserId)
  });
}

export function getWorkspaceData(taskId = "") {
  const query = taskId ? `?taskId=${encodeURIComponent(taskId)}` : "";
  return readJson(`/workspace${query}`, {
    summary: { taskId },
    milestones: [],
    contract: null,
    progressUpdates: []
  });
}

export function getTaskClosureData(taskId: string) {
  return readJson(`/tasks/${encodeURIComponent(taskId)}/closure`, {
    summary: { taskId },
    earlyCompletion: null,
    acceptance: null,
    claimSummary: null,
    invoiceSummary: null,
    reconciliationSummary: null,
    settlementSummary: null,
    disputeSummary: null,
    metrics: [],
    timeline: [],
    reviewSummary: [],
    reviewHistory: []
  });
}

export function submitEarlyCompletionAction(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/early-completion`, { taskId, status: "FAILED" }, payload);
}

export function submitTaskCancellationAction(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/cancellation`, { taskId, status: "FAILED" }, payload);
}

export function getTaskRooms() {
  return readJson("/messages/task-rooms", {
    summary: {
      activeRooms: "0",
      waitingReply: "0",
      unreadRooms: "0"
    },
    items: []
  });
}

export function getTaskRoom(roomKey: string) {
  const path = roomKey ? `/messages/task-room/${encodeURIComponent(roomKey)}` : "/messages/task-room";
  return readJson(path, {
    roomKey,
    taskRoom: null,
    messages: []
  });
}

export interface TencentImRoomMember {
  userId?: number | string;
  platformUserId?: number | string;
  account?: string;
  imUserId?: string;
  role?: string;
  displayName?: string;
  audience?: string;
  isCurrentUser?: boolean;
}

export interface TencentImRoomConfig {
  sdkAppId: number | string;
  userId: string;
  userSig: string;
  groupId: string;
  roomKey: string;
  provider: string;
  enabled?: boolean;
  status?: string;
  realtimeDisabledReason?: string;
  taskId?: string;
  roomTitle?: string;
  members?: TencentImRoomMember[];
  currentUser?: TencentImRoomMember;
  counterpartUser?: TencentImRoomMember;
  requestError?: string;
}

export async function getTencentImConfig(roomKey: string): Promise<TencentImRoomConfig & ApiFailure> {
  return readJson(`/im/tencent/config?roomKey=${encodeURIComponent(roomKey)}`, {
    sdkAppId: "",
    userId: "",
    userSig: "",
    groupId: "",
    roomKey,
    provider: "TENCENT_IM",
    members: []
  });
}

export function sendTaskRoomMessage(roomKey: string, payload: unknown) {
  return writeJson(`/messages/task-room/${encodeURIComponent(roomKey)}/messages`, { roomKey, messages: [] }, payload);
}

export function createTaskRoom(payload: unknown) {
  return writeJson("/messages/task-room/initiate", { roomKey: "", taskRoom: null, messages: [] }, payload);
}

export function getOrderRecords(audience: "enterprise" | "talent", tab = "all") {
  const normalizedTab = tab === "ongoing" || tab === "completed" ? tab : "all";
  return readJson(`/${audience}/orders?tab=${normalizedTab}`, {
    summary: null,
    tabs: [],
    activeTab: normalizedTab,
    items: []
  });
}

export function getOrderRecordDetail(audience: "enterprise" | "talent", taskId: string) {
  return readJson(`/${audience}/orders/${encodeURIComponent(taskId)}`, {
    taskId,
    summary: null,
    record: null,
    timeline: [],
    progressFeed: [],
    assetLibrary: [],
    aiReviewHistory: []
  });
}

export function submitTaskProgress(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/progress`, { taskId, status: "FAILED" }, payload);
}

export function submitTaskConfirmation(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/negotiations/task-confirmation`, { taskId, status: "FAILED" }, payload);
}

export function submitAcceptance(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/acceptance`, { taskId, status: "FAILED" }, payload);
}

export function submitReview(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/reviews`, { taskId, status: "FAILED" }, payload);
}

export function publishTask(payload: unknown) {
  return writeJson("/tasks/publish", { success: false, taskId: "", nextStep: "当前暂时无法发布任务。" }, payload);
}

export function updateTaskContent(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/content`, { taskId, status: "FAILED" }, payload);
}

export function confirmTaskAnalysis(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/analysis/confirm`, { taskId, status: "FAILED" }, payload);
}

export function requestTaskCollaboration(taskId: string, payload: unknown) {
  return writeJson(
    `/tasks/${encodeURIComponent(taskId)}/collaboration/request`,
    {
      taskId,
      applicationStatus: "FAILED",
      roomKey: "",
      nextRoute: "",
      nextStep: "当前暂时无法提交合作申请，请稍后重试。"
    },
    payload
  );
}

export function selectTaskAssignment(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/assignments/select`, { taskId, status: "FAILED" }, payload);
}

export function requestTaskClaim(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/claims`, {
    taskId,
    status: "FAILED",
    nextStep: "当前暂时无法发起请款。"
  }, payload);
}

export function reviewTaskClaim(claimId: string, payload: unknown) {
  return writeJson(`/enterprise/claims/${encodeURIComponent(claimId)}/actions`, {
    claimId,
    status: "FAILED",
    nextStep: "当前暂时无法处理请款。"
  }, payload);
}

export function createTaskInvoice(claimId: string, payload: unknown) {
  return writeJson(`/claims/${encodeURIComponent(claimId)}/invoice`, {
    claimId,
    status: "FAILED",
    nextStep: "当前暂时无法提交发票。"
  }, payload);
}

export function respondTaskReconciliation(reconciliationId: string, payload: unknown) {
  return writeJson(`/enterprise/reconciliations/${encodeURIComponent(reconciliationId)}/actions`, {
    reconciliationId,
    status: "FAILED",
    nextStep: "当前暂时无法处理对账。"
  }, payload);
}

export function respondTaskSettlement(settlementId: string, payload: unknown) {
  return writeJson(`/enterprise/settlements/${encodeURIComponent(settlementId)}/actions`, {
    settlementId,
    status: "FAILED",
    nextStep: "当前暂时无法处理结算。"
  }, payload);
}

export function presignUpload(payload: {
  fileName: string;
  contentType: string;
  size: number;
  scene: string;
  taskId?: string;
}) {
  return writeJson("/uploads/presign", {
    uploadId: "",
    uploadUrl: "",
    downloadUrl: "",
    objectKey: "",
    method: "PUT",
    status: "FAILED"
  }, payload);
}

export function registerTaskFile(taskId: string, payload: unknown) {
  return writeJson(`/tasks/${encodeURIComponent(taskId)}/files`, {
    taskId,
    status: "FAILED",
    nextStep: "当前暂时无法登记附件。"
  }, payload);
}

export function getTaskFiles(taskId: string) {
  return readJson(`/tasks/${encodeURIComponent(taskId)}/files`, {
    taskId,
    items: [],
    files: []
  });
}

function uploadErrorMessage(error: unknown) {
  const message = requestErrorMessage(error, "当前暂时无法上传附件。");
  if (/413|Request Entity Too Large|文件过大/i.test(message)) {
    return "上传文件过大，请压缩后再试。";
  }
  return message;
}

export async function uploadTaskAttachmentAsset(taskId: string, file: File, options: { scene?: string; source?: string; fileType?: string } = {}) {
  try {
    const scene = options.scene || "TASK_PROGRESS";
    const source = options.source || scene;
    const presign = await presignUpload({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size || 0,
      scene,
      taskId
    });
    if (presign.requestError) {
      throw new Error(presign.requestError);
    }

    const uploadPath = String(presign.uploadUrl || "");
    const normalizedUploadPath = uploadPath.startsWith("/api/") ? uploadPath.slice(4) : uploadPath;
    const uploadResult = await putBinary(normalizedUploadPath, { status: "FAILED" }, file, file.type || "application/octet-stream");
    if (uploadResult.requestError) {
      throw new Error(uploadResult.requestError);
    }

    const registered = await registerTaskFile(taskId, {
      uploadId: presign.uploadId,
      name: file.name,
      fileType: options.fileType || "",
      objectKey: presign.objectKey,
      url: presign.downloadUrl,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      source
    });
    if (registered.requestError) {
      throw new Error(registered.requestError);
    }

    return {
      ...registered,
      name: String((registered as any).name || file.name),
      size: file.size,
      type: file.type || "application/octet-stream",
      mimeType: file.type || "application/octet-stream",
      downloadUrl: String((registered as any).downloadUrl || (registered as any).url || presign.downloadUrl || ""),
      url: String((registered as any).url || (registered as any).downloadUrl || presign.downloadUrl || ""),
      objectKey: String((registered as any).objectKey || presign.objectKey || ""),
      uploadId: String((registered as any).uploadId || presign.uploadId || ""),
      source
    };
  } catch (error) {
    return {
      requestError: uploadErrorMessage(error),
      name: file?.name || "",
      size: file?.size || 0,
      type: file?.type || "application/octet-stream",
      downloadUrl: "",
      url: ""
    };
  }
}

export async function uploadStandaloneAttachmentAsset(file: File, options: { scene?: string; source?: string } = {}) {
  try {
    const scene = options.scene || "ONBOARDING_MATERIAL";
    const source = options.source || scene;
    const presign = await presignUpload({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size || 0,
      scene
    });
    if (presign.requestError) {
      throw new Error(presign.requestError);
    }
    const uploadPath = String(presign.uploadUrl || "");
    const normalizedUploadPath = uploadPath.startsWith("/api/") ? uploadPath.slice(4) : uploadPath;
    const uploadResult = await putBinary(normalizedUploadPath, { status: "FAILED" }, file, file.type || "application/octet-stream");
    if (uploadResult.requestError) {
      throw new Error(uploadResult.requestError);
    }
    return {
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      mimeType: file.type || "application/octet-stream",
      downloadUrl: String(presign.downloadUrl || ""),
      url: String(presign.downloadUrl || ""),
      objectKey: String(presign.objectKey || ""),
      uploadId: String(presign.uploadId || ""),
      source
    };
  } catch (error) {
    return {
      requestError: uploadErrorMessage(error),
      name: file?.name || "",
      size: file?.size || 0,
      type: file?.type || "application/octet-stream",
      downloadUrl: "",
      url: ""
    };
  }
}

export { API_BASE };
