import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  AuthAudience,
  AuthLoginPayload,
  AuthRegisterPayload,
  getAuthMe,
  getBusinessData,
  getTalentData,
  getTaskMarketplaceData,
  loginAuth,
  logoutAuth,
  registerAuth
} from "./services/api";
import {
  clearStoredAuthSession,
  getStoredAuthUser,
  hasFreshStoredAuthSession,
  persistAuthSession
} from "./services/authSession";

type Role = "ENTERPRISE" | "TALENT" | "BOTH";
type DataMode = "real";

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  companyName?: string;
  title?: string;
  skills?: string[];
  rating?: number;
  homeRoute?: string;
  raw?: Record<string, any>;
}

export interface Task {
  id: string;
  enterpriseId: string;
  title: string;
  description: string;
  budget: string;
  cycle: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  statusLabel: string;
  company?: string;
  skills: string[];
  applicantsCount: number;
  actionLabel?: string;
  actionDisabled?: boolean;
  actionNote?: string;
  actionType?: string;
  nextRoute?: string;
  roomKey?: string;
  deliverables?: string[];
  raw?: Record<string, any>;
}

export interface Application {
  id: string;
  taskId: string;
  talentId: string;
  quote: string;
  availableTime: string;
  status: "PENDING" | "INTERVIEW" | "ACCEPTED" | "REJECTED";
  interviewTime?: string;
  raw?: Record<string, any>;
}

interface AuthSuccessResult {
  success?: boolean;
  token?: string;
  user?: Record<string, any>;
  expiresAt?: string;
  message?: string;
  nextStep?: string;
  requestError?: string;
  requestStatus?: number;
}

interface AppState {
  currentUser: User | null;
  tasks: Task[];
  applications: Application[];
  isBootstrapping: boolean;
  isLoadingData: boolean;
  dataMode: DataMode;
  dashboardData: Record<string, any> | null;
  authError: string;
  dataError: string;
  login: (user: User, session?: { token?: string; expiresAt?: string }) => void;
  loginWithPassword: (payload: AuthLoginPayload) => Promise<AuthSuccessResult>;
  registerAccount: (payload: AuthRegisterPayload) => Promise<AuthSuccessResult>;
  logout: () => Promise<void>;
  refreshDashboardData: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const StoreContext = createContext<AppState | undefined>(undefined);

function stringOf(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }
    const next = String(value).trim();
    if (next) {
      return next;
    }
  }
  return "";
}

function numberOf(...values: unknown[]) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function normalizeRole(rawRole: unknown, audience?: unknown): Role {
  const value = stringOf(rawRole, audience).toLowerCase();
  if (value === "talent") {
    return "TALENT";
  }
  if (value === "both") {
    return "BOTH";
  }
  return "ENTERPRISE";
}

function normalizeUser(raw: any): User | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const role = normalizeRole(raw.role, raw.audience);
  const name = stringOf(raw.displayName, raw.name, raw.contactName, raw.organizationName, raw.mobile, "未命名账号");

  return {
    id: stringOf(raw.platformUserId, raw.id, raw.userId, raw.imUserId, raw.mobile, "current-user"),
    name,
    role,
    avatar: stringOf(raw.avatar, raw.avatarUrl, name.charAt(0), "轻"),
    companyName: stringOf(raw.organizationName, raw.companyName),
    title: stringOf(raw.headline, raw.title, raw.contactRole),
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    rating: Number.isFinite(Number(raw.rating)) ? Number(raw.rating) : undefined,
    homeRoute: stringOf(raw.homeRoute),
    raw
  };
}

function normalizeTaskStatus(rawStatus: unknown, rawStatusCode?: unknown): Task["status"] {
  const status = stringOf(rawStatus).toUpperCase();
  const statusCode = stringOf(rawStatusCode).toUpperCase();
  if (
    [
      "OPEN",
      "PUBLISHED",
      "RECRUITING",
      "WAITING_APPLICATION",
      "AI_ANALYZING",
      "VIEW_ONLY",
      "APPLY_AVAILABLE",
      "待报名",
      "待确认",
      "待处理申请",
      "发布与选人",
      "招募中"
    ].includes(status) ||
    ["OPEN", "PUBLISHED", "RECRUITING", "AI_ANALYZING", "VIEW_ONLY", "APPLY_AVAILABLE", "MATCHING"].includes(statusCode)
  ) {
    return "OPEN";
  }
  if (["CLOSED", "COMPLETED", "ARCHIVED", "DONE", "已完成"].includes(status)) {
    return "CLOSED";
  }
  return "IN_PROGRESS";
}

function normalizeTask(raw: any, index = 0): Task {
  const id = stringOf(raw?.taskId, raw?.recordId, raw?.id, `task-${index + 1}`);
  const action = raw?.action || {};
  const actionStatus = stringOf(action?.status, raw?.applicationStatus).toUpperCase();
  const requestedTalentCount = Array.isArray(raw?.requestedTalentUserIds) ? raw.requestedTalentUserIds.length : undefined;
  const skills = Array.isArray(raw?.skills)
    ? raw.skills
    : Array.isArray(raw?.tags)
      ? raw.tags
      : Array.isArray(raw?.requiredSkills)
        ? raw.requiredSkills
        : [];
  let actionType = stringOf(action?.type, action?.status, raw?.actionType);
  let actionLabel = stringOf(action?.label, raw?.actionLabel);
  let actionDisabled = Boolean(action?.disabled);
  let actionNote = stringOf(action?.note, raw?.actionNote);

  if (actionStatus === "INTERVIEW_PENDING") {
    actionType = "interview_decision";
    actionLabel = "回应面试邀约";
    actionDisabled = false;
    actionNote = actionNote || "企业已发起面试邀约，请先同意或拒绝后再推进后续协作。";
  }

  return {
    id,
    enterpriseId: stringOf(raw?.enterpriseId, raw?.clientUserId, raw?.ownerId),
    title: stringOf(raw?.title, raw?.taskTitle, raw?.name, "未命名任务"),
    description: stringOf(raw?.description, raw?.summary, raw?.brief, raw?.lead, "暂无任务说明。"),
    budget: stringOf(raw?.budget, raw?.budgetRange, raw?.amount, raw?.price, "待确认"),
    cycle: stringOf(raw?.cycle, raw?.period, raw?.timeline, raw?.duration, "待确认"),
    status: normalizeTaskStatus(raw?.status || raw?.stage || raw?.taskStatus, raw?.statusCode || action?.status),
    statusLabel: stringOf(raw?.statusLabel, raw?.status, raw?.stage, raw?.taskStatus, "可查看"),
    company: stringOf(raw?.company, raw?.organizationName, raw?.enterpriseName, raw?.clientName),
    skills: skills.map((item: unknown) => String(item)).filter(Boolean),
    applicantsCount: numberOf(raw?.applicantsCount, raw?.applicationsCount, raw?.candidateCount, raw?.requestCount, requestedTalentCount, raw?.count),
    actionLabel,
    actionDisabled,
    actionNote,
    actionType,
    nextRoute: stringOf(action?.nextRoute, raw?.nextRoute),
    roomKey: stringOf(action?.roomKey, raw?.roomKey, raw?.room),
    deliverables: Array.isArray(raw?.deliverables) ? raw.deliverables.map((item: unknown) => String(item)).filter(Boolean) : [],
    raw
  };
}

function normalizeApplication(raw: any, index = 0): Application {
  return {
    id: stringOf(raw?.id, raw?.applicationId, `application-${index + 1}`),
    taskId: stringOf(raw?.taskId, raw?.id),
    talentId: stringOf(raw?.talentId, raw?.talentUserId, raw?.platformUserId),
    quote: stringOf(raw?.quote, raw?.rate, raw?.proposedRate, raw?.budget, "待确认"),
    availableTime: stringOf(raw?.availableTime, raw?.availability, raw?.period, "待确认"),
    status: normalizeApplicationStatus(raw?.status || raw?.stage),
    interviewTime: stringOf(raw?.interviewTime, raw?.interviewAt, raw?.currentInvite?.time),
    raw
  };
}

function normalizeApplicationStatus(rawStatus: unknown): Application["status"] {
  const status = stringOf(rawStatus).toUpperCase();
  if (status.includes("INTERVIEW")) {
    return "INTERVIEW";
  }
  if (["ACCEPTED", "CONFIRMED", "AUTO_CONFIRMED", "PASS_CONFIRM"].includes(status)) {
    return "ACCEPTED";
  }
  if (["REJECTED", "AUTO_CLOSED", "CLOSED", "FAILED"].includes(status)) {
    return "REJECTED";
  }
  return "PENDING";
}

function extractTaskItems(payload: any) {
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  if (Array.isArray(payload?.tasks)) {
    return payload.tasks;
  }
  if (Array.isArray(payload?.taskPool)) {
    return payload.taskPool;
  }
  if (Array.isArray(payload?.activeTasks)) {
    return payload.activeTasks;
  }
  if (Array.isArray(payload?.notificationItems)) {
    return payload.notificationItems;
  }
  if (Array.isArray(payload?.attentionItems)) {
    return payload.attentionItems;
  }
  return [];
}

function extractApplicationItems(payload: any) {
  if (Array.isArray(payload?.applications)) {
    return payload.applications;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  if (Array.isArray(payload?.activeApplications)) {
    return payload.activeApplications;
  }
  return [];
}

function ensureSuccessfulAuth(result: AuthSuccessResult) {
  if (result?.requestError) {
    throw new Error(result.requestError);
  }
  if (result?.success === false || !result?.token || !result?.user) {
    throw new Error(result?.message || "登录失败，请确认账号信息。");
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => normalizeUser(getStoredAuthUser()));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataMode, setDataMode] = useState<DataMode>("real");
  const [dashboardData, setDashboardData] = useState<Record<string, any> | null>(null);
  const [authError, setAuthError] = useState("");
  const [dataError, setDataError] = useState("");

  const login = useCallback((user: User, session?: { token?: string; expiresAt?: string }) => {
    setCurrentUser(user);
    setAuthError("");
    if (session?.token || user.raw) {
      persistAuthSession(session?.token, user.raw || user, session?.expiresAt);
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    const payload = await getTaskMarketplaceData();
    if (payload.requestError) {
      setDataError(payload.requestError);
      setTasks([]);
      return;
    }

    setTasks(extractTaskItems(payload).map(normalizeTask));
    setDashboardData((current) => ({ ...(current || {}), taskMarketplace: payload }));
    setDataError("");
    setDataMode("real");
  }, []);

  const refreshDashboardData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const user = currentUser;
      if (!user) {
        await refreshTasks();
        return;
      }

      const audience = user.role === "TALENT" ? "talent" : "enterprise";
      const payload = audience === "talent" ? await getTalentData() : await getBusinessData();
      if (payload.requestError) {
        setDataError(payload.requestError);
        setTasks([]);
        setApplications([]);
        return;
      }

      const nextTasks = extractTaskItems(payload).map(normalizeTask);
      const nextApplications = extractApplicationItems(payload).map(normalizeApplication);

      setTasks(nextTasks.length ? nextTasks : []);
      setApplications(nextApplications);
      setDashboardData(payload);
      setDataError("");
      setDataMode("real");
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser, refreshTasks]);

  const loginWithPassword = useCallback(
    async (payload: AuthLoginPayload) => {
      setAuthError("");
      const result = (await loginAuth(payload)) as AuthSuccessResult;
      try {
        ensureSuccessfulAuth(result);
        const normalizedUser = normalizeUser(result.user);
        if (!normalizedUser) {
          throw new Error("登录成功，但用户信息为空。");
        }
        login(normalizedUser, { token: result.token, expiresAt: result.expiresAt });
      } catch (error) {
        const message = error instanceof Error ? error.message : "登录失败，请稍后再试。";
        setAuthError(message);
        throw error;
      }
      return result;
    },
    [login]
  );

  const registerAccount = useCallback(
    async (payload: AuthRegisterPayload) => {
      setAuthError("");
      const result = (await registerAuth(payload)) as AuthSuccessResult;
      try {
        ensureSuccessfulAuth(result);
        const normalizedUser = normalizeUser(result.user);
        if (!normalizedUser) {
          throw new Error("注册成功，但用户信息为空。");
        }
        login(normalizedUser, { token: result.token, expiresAt: result.expiresAt });
      } catch (error) {
        const message = error instanceof Error ? error.message : "注册失败，请稍后再试。";
        setAuthError(message);
        throw error;
      }
      return result;
    },
    [login]
  );

  const logout = useCallback(async () => {
    await logoutAuth();
    clearStoredAuthSession();
    setCurrentUser(null);
    setTasks([]);
    setApplications([]);
    setDashboardData(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!hasFreshStoredAuthSession()) {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
        return;
      }

      const payload = await getAuthMe();
      if (cancelled) {
        return;
      }

      if (payload.requestError) {
        setAuthError(payload.requestError);
        clearStoredAuthSession();
        setCurrentUser(null);
      } else if (payload.authenticated && payload.user) {
        const user = normalizeUser(payload.user);
        setCurrentUser(user);
        persistAuthSession(undefined, payload.user, stringOf(payload.expiresAt));
      }

      setIsBootstrapping(false);
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isBootstrapping) {
      refreshDashboardData();
    }
  }, [isBootstrapping, refreshDashboardData]);

  const value = useMemo<AppState>(
    () => ({
      currentUser,
      tasks,
      applications,
      isBootstrapping,
      isLoadingData,
      dataMode,
      dashboardData,
      authError,
      dataError,
      login,
      loginWithPassword,
      registerAccount,
      logout,
      refreshDashboardData,
      refreshTasks
    }),
    [
      currentUser,
      tasks,
      applications,
      isBootstrapping,
      isLoadingData,
      dataMode,
      dashboardData,
      authError,
      dataError,
      login,
      loginWithPassword,
      registerAccount,
      logout,
      refreshDashboardData,
      refreshTasks
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}

export function roleToAudience(role: Role): AuthAudience {
  return role === "TALENT" ? "talent" : "enterprise";
}
