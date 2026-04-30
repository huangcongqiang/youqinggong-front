import TencentCloudChat from '@tencentcloud/lite-chat';
import type { TencentImRoomConfig } from './api';

type LiteChatEvent = { data?: unknown };
type LiteChatMessage = {
  ID?: string;
  id?: string;
  clientSequence?: string | number;
  type?: string;
  payload?: Record<string, any>;
  conversationID?: string;
  to?: string;
  from?: string;
  flow?: string;
  time?: number;
  status?: string;
  nick?: string;
  nameCard?: string;
};

type LiteChatSdk = {
  login(options: { userID: string; userSig: string }): Promise<unknown>;
  logout(): Promise<void>;
  isReady?(): boolean;
  on(eventName: string, handler: (event: LiteChatEvent) => void): void;
  off(eventName: string, handler: (event: LiteChatEvent) => void): void;
  setLogLevel?(level: number): void;
  createTextMessage(options: Record<string, unknown>): LiteChatMessage;
  createImageMessage(options: Record<string, unknown>): LiteChatMessage;
  createCustomMessage(options: Record<string, unknown>): LiteChatMessage;
  sendMessage(message: LiteChatMessage, options?: Record<string, unknown>): Promise<any>;
};

type SharedChatSession = {
  sdkAppId: number;
  chat: LiteChatSdk;
  activeClients: number;
  userId: string;
  ready: boolean;
  loginPromise?: Promise<void>;
  logoutTimer?: number;
};

export type BusinessFilePayload = {
  kind: 'YQG_TASK_FILE';
  taskId: string;
  roomKey: string;
  assetId?: string;
  uploadId?: string;
  objectKey?: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  downloadUrl: string;
  uploadedAt: string;
};

export type TaskImIncomingMessage = {
  providerMessageId: string;
  senderAccount: string;
  author?: string;
  flow?: string;
  isOwn?: boolean;
  text: string;
  createdAt: string;
  attachments: Array<{
    id: string;
    name: string;
    kind: 'image' | 'file' | 'other';
    type: string;
    size?: number;
    previewUrl?: string;
    downloadUrl?: string;
    uploadId?: string;
    objectKey?: string;
  }>;
};

export type TaskImRoomClient = {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendText(text: string): Promise<TaskImIncomingMessage>;
  sendImage(file: File): Promise<TaskImIncomingMessage>;
  sendBusinessFile(payload: BusinessFilePayload): Promise<TaskImIncomingMessage>;
  onMessage(listener: (message: TaskImIncomingMessage) => void): () => void;
  onCallInvite(listener: (payload: unknown) => void): () => void;
  startAudioCall(): Promise<never>;
  startVideoCall(): Promise<never>;
};

const READY_TIMEOUT_MS = 8000;
const IDLE_LOGOUT_DELAY_MS = 30000;
let sharedChatSession: SharedChatSession | null = null;

export function createTaskImRoomClient(config: TencentImRoomConfig): TaskImRoomClient {
  const sdkAppId = Number(config.sdkAppId);
  const groupId = String(config.groupId || config.roomKey || '').trim();
  const userId = String(config.userId || '').trim();
  const userSig = String(config.userSig || '').trim();

  if (!sdkAppId || !groupId || !userId || !userSig) {
    throw new Error('TENCENT_IM_CONFIG_INCOMPLETE');
  }

  const session = resolveSharedChatSession(sdkAppId);
  const chat = session.chat;

  const listeners = new Set<(message: TaskImIncomingMessage) => void>();
  const callListeners = new Set<(payload: unknown) => void>();
  const conversationID = `GROUP${groupId}`;
  let connected = false;

  const handleMessageReceived = (event: LiteChatEvent) => {
    const rawItems = Array.isArray(event?.data) ? event.data : [];
    rawItems
      .filter((item): item is LiteChatMessage => Boolean(item && typeof item === 'object'))
      .filter((item) => isCurrentRoomMessage(item, groupId, conversationID))
      .map(normalizeSdkMessage)
      .forEach((message) => {
        listeners.forEach((listener) => listener(message));
      });
  };

  async function connect() {
    if (connected) return;
    cancelIdleLogout(session);
    chat.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, handleMessageReceived);
    session.activeClients += 1;
    try {
      await ensureLoggedIn(session, userId, userSig);
      connected = true;
    } catch (exception) {
      session.activeClients = Math.max(0, session.activeClients - 1);
      chat.off(TencentCloudChat.EVENT.MESSAGE_RECEIVED, handleMessageReceived);
      throw exception;
    }
  }

  async function disconnect() {
    chat.off(TencentCloudChat.EVENT.MESSAGE_RECEIVED, handleMessageReceived);
    listeners.clear();
    if (connected) {
      connected = false;
      session.activeClients = Math.max(0, session.activeClients - 1);
      scheduleIdleLogout(session);
    }
  }

  async function sendSdkMessage(message: LiteChatMessage, optimistic?: Partial<TaskImIncomingMessage>) {
    const response = await chat.sendMessage(message);
    const sent = response?.data?.message || response?.data || message;
    return normalizeSdkMessage(sent, optimistic);
  }

  return {
    connect,
    disconnect,
    async sendText(text: string) {
      const sdkMessage = chat.createTextMessage({
        to: groupId,
        conversationType: TencentCloudChat.TYPES.CONV_GROUP,
        priority: TencentCloudChat.TYPES.MSG_PRIORITY_NORMAL,
        payload: { text }
      });
      return sendSdkMessage(sdkMessage, { text });
    },
    async sendImage(file: File) {
      const sdkMessage = chat.createImageMessage({
        to: groupId,
        conversationType: TencentCloudChat.TYPES.CONV_GROUP,
        priority: TencentCloudChat.TYPES.MSG_PRIORITY_NORMAL,
        payload: { file }
      });
      return sendSdkMessage(sdkMessage, {
        text: '',
        attachments: [{
          id: imageAttachmentId(file),
          name: file.name || '图片',
          kind: 'image',
          type: file.type || 'image/*',
          size: file.size
        }]
      });
    },
    async sendBusinessFile(payload: BusinessFilePayload) {
      const sdkMessage = chat.createCustomMessage({
        to: groupId,
        conversationType: TencentCloudChat.TYPES.CONV_GROUP,
        priority: TencentCloudChat.TYPES.MSG_PRIORITY_NORMAL,
        payload: {
          data: JSON.stringify(payload),
          description: payload.fileName,
          extension: payload.mimeType || 'application/octet-stream'
        }
      });
      return sendSdkMessage(sdkMessage, {
        text: payload.fileName,
        attachments: [businessFileAttachment(payload)]
      });
    },
    onMessage(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    onCallInvite(listener) {
      callListeners.add(listener);
      return () => {
        callListeners.delete(listener);
      };
    },
    async startAudioCall() {
      throw new Error('CALL_NOT_ENABLED');
    },
    async startVideoCall() {
      throw new Error('CALL_NOT_ENABLED');
    }
  };
}

function resolveSharedChatSession(sdkAppId: number) {
  if (sharedChatSession?.sdkAppId === sdkAppId) {
    return sharedChatSession;
  }
  if (sharedChatSession) {
    cancelIdleLogout(sharedChatSession);
    void sharedChatSession.chat.logout().catch(() => undefined);
  }
  const chat = TencentCloudChat.create({ SDKAppID: sdkAppId }) as unknown as LiteChatSdk | null;
  if (!chat) {
    throw new Error('TENCENT_IM_SDK_CREATE_FAILED');
  }
  chat.setLogLevel?.(1);
  sharedChatSession = {
    sdkAppId,
    chat,
    activeClients: 0,
    userId: '',
    ready: false
  };
  return sharedChatSession;
}

async function ensureLoggedIn(session: SharedChatSession, userId: string, userSig: string) {
  if (session.loginPromise) {
    await session.loginPromise;
  }
  if (session.userId === userId && session.ready && session.chat.isReady?.()) {
    return;
  }
  if (session.userId && session.userId !== userId) {
    await session.chat.logout().catch(() => undefined);
    session.ready = false;
  }
  session.userId = userId;
  session.ready = false;
  session.loginPromise = (async () => {
    await session.chat.login({ userID: userId, userSig });
    await waitForSdkReady(session.chat);
    session.ready = true;
  })();
  try {
    await session.loginPromise;
  } finally {
    session.loginPromise = undefined;
  }
}

function cancelIdleLogout(session: SharedChatSession) {
  if (session.logoutTimer) {
    window.clearTimeout(session.logoutTimer);
    session.logoutTimer = undefined;
  }
}

function scheduleIdleLogout(session: SharedChatSession) {
  cancelIdleLogout(session);
  session.logoutTimer = window.setTimeout(() => {
    session.logoutTimer = undefined;
    if (session.activeClients > 0 || sharedChatSession !== session) {
      return;
    }
    session.ready = false;
    session.userId = '';
    void session.chat.logout().catch(() => undefined);
  }, IDLE_LOGOUT_DELAY_MS);
}

function waitForSdkReady(chat: LiteChatSdk) {
  if (chat.isReady?.()) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('TENCENT_IM_READY_TIMEOUT'));
    }, READY_TIMEOUT_MS);
    const onReady = () => {
      cleanup();
      resolve();
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      chat.off(TencentCloudChat.EVENT.SDK_READY, onReady);
    };
    chat.on(TencentCloudChat.EVENT.SDK_READY, onReady);
  });
}

function isCurrentRoomMessage(message: LiteChatMessage, groupId: string, conversationID: string) {
  return message.conversationID === conversationID || message.to === groupId;
}

function normalizeSdkMessage(message: LiteChatMessage, optimistic: Partial<TaskImIncomingMessage> = {}): TaskImIncomingMessage {
  const sdkAttachments = normalizeAttachments(message);
  const attachments = optimistic.attachments
    ? mergeOptimisticAttachments(sdkAttachments, optimistic.attachments)
    : sdkAttachments;
  const flow = stringOf(message.flow);
  return {
    providerMessageId: stringOf(message.ID, message.id, message.clientSequence, `im-${Date.now()}`),
    senderAccount: stringOf(message.from),
    author: stringOf(message.nameCard, message.nick, message.from),
    flow,
    isOwn: flow === 'out',
    text: optimistic.text ?? textOfMessage(message),
    createdAt: message.time ? new Date(message.time * 1000).toISOString() : new Date().toISOString(),
    attachments
  };
}

function textOfMessage(message: LiteChatMessage) {
  const payload = message.payload || {};
  if (message.type === TencentCloudChat.TYPES.MSG_TEXT) {
    return stringOf(payload.text, payload.Text);
  }
  if (message.type === TencentCloudChat.TYPES.MSG_CUSTOM) {
    const businessFile = parseBusinessFilePayload(payload.data || payload.Data);
    return businessFile?.fileName || stringOf(payload.description, payload.Desc);
  }
  return '';
}

function normalizeAttachments(message: LiteChatMessage): TaskImIncomingMessage['attachments'] {
  const payload = message.payload || {};
  if (message.type === TencentCloudChat.TYPES.MSG_IMAGE) {
    const originalImage = pickImageVariant(payload, 'download');
    const previewImage = pickImageVariant(payload, 'preview');
    const downloadUrl = stringOf(imageVariantUrl(originalImage), payload.url, payload.URL, payload.imageUrl, payload.downloadUrl);
    const previewUrl = stringOf(imageVariantUrl(previewImage), payload.thumbnailUrl, payload.thumbUrl, downloadUrl);
    return [{
      id: stringOf(message.ID, message.clientSequence, imageAttachmentId(payload.file)),
      name: stringOf(payload.fileName, payload.name, '图片'),
      kind: 'image',
      type: stringOf(payload.mimeType, payload.type, 'image/*'),
      size: numberOf(payload.fileSize, originalImage?.size, originalImage?.Size, previewImage?.size, previewImage?.Size),
      previewUrl,
      downloadUrl: stringOf(downloadUrl, previewUrl)
    }];
  }
  if (message.type === TencentCloudChat.TYPES.MSG_CUSTOM) {
    const businessFile = parseBusinessFilePayload(payload.data || payload.Data);
    return businessFile ? [businessFileAttachment(businessFile)] : [];
  }
  return [];
}

function mergeOptimisticAttachments(
  sdkAttachments: TaskImIncomingMessage['attachments'],
  optimisticAttachments: TaskImIncomingMessage['attachments']
) {
  if (sdkAttachments.length === 0) return optimisticAttachments;
  return sdkAttachments.map((sdkAttachment, index) => {
    const optimisticAttachment = optimisticAttachments[index];
    if (!optimisticAttachment) return sdkAttachment;
    const sdkName = sdkAttachment.name === '图片' ? '' : sdkAttachment.name;
    return {
      ...optimisticAttachment,
      ...sdkAttachment,
      id: stringOf(sdkAttachment.id, optimisticAttachment.id),
      name: stringOf(sdkName, optimisticAttachment.name, sdkAttachment.name),
      kind: sdkAttachment.kind || optimisticAttachment.kind,
      type: stringOf(sdkAttachment.type, optimisticAttachment.type),
      size: sdkAttachment.size ?? optimisticAttachment.size,
      previewUrl: stringOf(sdkAttachment.previewUrl, optimisticAttachment.previewUrl),
      downloadUrl: stringOf(sdkAttachment.downloadUrl, optimisticAttachment.downloadUrl),
      uploadId: stringOf(sdkAttachment.uploadId, optimisticAttachment.uploadId),
      objectKey: stringOf(sdkAttachment.objectKey, optimisticAttachment.objectKey)
    };
  });
}

function pickImageVariant(payload: Record<string, any>, purpose: 'download' | 'preview') {
  const images = imageVariants(payload);
  if (images.length === 0) {
    return null;
  }
  const preferredTypes = purpose === 'download' ? [1, 0, 2, 3] : [3, 2, 1, 0];
  for (const preferredType of preferredTypes) {
    const matched = images.find((item) => imageVariantType(item) === preferredType);
    if (matched) return matched;
  }
  const textMatch = images.find((item) => {
    const type = stringOf(item?.type, item?.Type).toLowerCase();
    return purpose === 'download'
      ? type.includes('origin') || type.includes('original')
      : type.includes('thumb') || type.includes('small');
  });
  if (textMatch) {
    return textMatch;
  }
  return purpose === 'download' ? images[0] : images[images.length - 1];
}

function imageVariants(payload: Record<string, any>) {
  const raw = payload.imageInfoArray || payload.ImageInfoArray || payload.imageInfoList || payload.images || [];
  return Array.isArray(raw) ? raw.filter((item) => item && typeof item === 'object') : [];
}

function imageVariantType(image: Record<string, any>) {
  const raw = image?.type ?? image?.Type;
  const parsed = Number(raw);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  const normalized = stringOf(raw).toLowerCase();
  if (normalized.includes('origin') || normalized.includes('original')) return 1;
  if (normalized.includes('large')) return 2;
  if (normalized.includes('thumb') || normalized.includes('small')) return 3;
  return -1;
}

function imageVariantUrl(image: Record<string, any> | null) {
  return stringOf(image?.url, image?.URL, image?.imageUrl, image?.downloadUrl);
}

function parseBusinessFilePayload(raw: unknown): BusinessFilePayload | null {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed?.kind !== 'YQG_TASK_FILE') return null;
    return parsed as BusinessFilePayload;
  } catch {
    return null;
  }
}

function businessFileAttachment(payload: BusinessFilePayload): TaskImIncomingMessage['attachments'][number] {
  return {
    id: stringOf(payload.assetId, payload.uploadId, payload.downloadUrl, payload.fileName),
    name: payload.fileName,
    kind: 'file',
    type: payload.mimeType || 'application/octet-stream',
    size: payload.fileSize,
    previewUrl: payload.downloadUrl,
    downloadUrl: payload.downloadUrl,
    uploadId: payload.uploadId,
    objectKey: payload.objectKey
  };
}

function imageAttachmentId(file: unknown) {
  if (file instanceof File) {
    return `${file.name}-${file.size}-${file.lastModified}`;
  }
  return `image-${Date.now()}`;
}

function numberOf(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return undefined;
}

function stringOf(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const next = String(value).trim();
    if (next) return next;
  }
  return '';
}
