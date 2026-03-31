import TencentCloudChat from '@tencentcloud/chat';
import TIMUploadPlugin from 'tim-upload-plugin';

let chat = null;
let currentSdkAppId = null;
let currentLoginKey = '';
let isReady = false;
let readyResolver = null;
let currentUserId = '';
let currentDisplayName = '';
let uploadPluginRegistered = false;
const subscribers = new Set();

async function logoutIfNeeded(instance, nextLoginKey) {
  if (!instance || !currentLoginKey || currentLoginKey === nextLoginKey) {
    return;
  }

  try {
    await instance.logout();
  } catch (error) {
    // Ignore logout failures and let the next login attempt decide the final state.
  }

  currentLoginKey = '';
  isReady = false;
}

function ensureChat(sdkAppId) {
  const numericSdkAppId = Number(sdkAppId);
  if (chat && currentSdkAppId === numericSdkAppId) {
    return chat;
  }

  chat = TencentCloudChat.create({ SDKAppID: numericSdkAppId });
  chat.setLogLevel(1);
  currentSdkAppId = numericSdkAppId;
  currentLoginKey = '';
  isReady = false;
  uploadPluginRegistered = false;

  chat.on(TencentCloudChat.EVENT.SDK_READY, () => {
    isReady = true;
    if (readyResolver) {
      readyResolver();
      readyResolver = null;
    }
  });

  chat.on(TencentCloudChat.EVENT.SDK_NOT_READY, () => {
    isReady = false;
  });

  chat.on(TencentCloudChat.EVENT.MESSAGE_RECEIVED, (event) => {
    const messages = (event?.data || []).map((item) => normalizeMessage(item, currentDisplayName, currentUserId));
    const conversationID = event?.data?.[0]?.conversationID || '';
    subscribers.forEach((listener) => listener({ conversationID, messages }));
  });

  return chat;
}

function ensureUploadPlugin(instance) {
  if (!instance || uploadPluginRegistered) {
    return;
  }
  instance.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin });
  uploadPluginRegistered = true;
}

function waitUntilReady() {
  if (isReady) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    readyResolver = resolve;
    window.setTimeout(() => {
      if (!isReady) {
        reject(new Error('Tencent IM SDK not ready'));
      }
    }, 10000);
  });
}

function normalizeMessage(message, displayName, userId) {
  const systemPayload = extractTencentSystemPayload(message);
  const payloadText = extractPayloadText(message);
  const attachments = extractPayloadAttachments(message);
  const author = message.from === userId
    ? displayName || message.from
    : (message.nick || message.from || '腾讯 IM 系统消息');

  return {
    id: message.ID || message.idClient || `${message.from}-${message.time}-${payloadText}`,
    conversationID: message.conversationID,
    author,
    type: normalizeType(message),
    timestamp: Number(message.time || 0),
    time: formatTime(message.time),
    text: payloadText,
    attachments,
    hidden: shouldHideTencentSystemMessage(message, systemPayload, payloadText),
    rawType: message.type
  };
}

function normalizeType(message) {
  if (message.type === TencentCloudChat.TYPES.MSG_TEXT) {
    return 'TEXT';
  }
  if (message.type === TencentCloudChat.TYPES.MSG_GRP_TIP || message.type === TencentCloudChat.TYPES.MSG_GRP_SYS_NOTICE) {
    return 'SYSTEM';
  }
  return 'TEXT';
}

function extractPayloadText(message) {
  if (
    message?.type === TencentCloudChat.TYPES.MSG_IMAGE ||
    message?.type === TencentCloudChat.TYPES.MSG_FILE ||
    message?.type === TencentCloudChat.TYPES.MSG_VIDEO
  ) {
    return '';
  }
  const systemPayload = extractTencentSystemPayload(message);
  if (systemPayload) {
    if (systemPayload.businessID === 'group_create') {
      return '任务房间已创建';
    }
    if (systemPayload.content) {
      return String(systemPayload.content);
    }
  }
  if (message?.payload?.text) {
    return message.payload.text;
  }
  if (message?.payload?.description) {
    return message.payload.description;
  }
  if (message?.payload?.extension) {
    return String(message.payload.extension);
  }
  if (message?.payload?.data) {
    return String(message.payload.data);
  }
  return '[暂不支持的消息类型]';
}

function extractTencentSystemPayload(message) {
  const rawPayload = message?.payload?.data || message?.payload?.extension || '';
  if (!rawPayload || typeof rawPayload !== 'string' || rawPayload.trim()[0] !== '{') {
    return null;
  }

  try {
    return JSON.parse(rawPayload);
  } catch {
    return null;
  }
}

function shouldHideTencentSystemMessage(message, systemPayload, payloadText) {
  if (
    message?.type !== TencentCloudChat.TYPES.MSG_GRP_TIP &&
    message?.type !== TencentCloudChat.TYPES.MSG_GRP_SYS_NOTICE
  ) {
    return false;
  }

  if (systemPayload?.businessID === 'group_create') {
    return true;
  }

  return payloadText === '[暂不支持的消息类型]';
}

function inferAttachmentKind(type, name) {
  const normalizedType = String(type || '').toLowerCase();
  const normalizedName = String(name || '').toLowerCase();
  if (normalizedType.startsWith('image/')) {
    return 'image';
  }
  if (normalizedType.startsWith('video/')) {
    return 'video';
  }
  if (normalizedName.endsWith('.zip') || normalizedName.endsWith('.rar') || normalizedName.endsWith('.7z')) {
    return 'archive';
  }
  if (
    normalizedName.endsWith('.js') ||
    normalizedName.endsWith('.ts') ||
    normalizedName.endsWith('.java') ||
    normalizedName.endsWith('.py') ||
    normalizedName.endsWith('.vue') ||
    normalizedName.endsWith('.sql')
  ) {
    return 'code';
  }
  if (
    normalizedName.endsWith('.pdf') ||
    normalizedName.endsWith('.doc') ||
    normalizedName.endsWith('.docx') ||
    normalizedName.endsWith('.md') ||
    normalizedName.endsWith('.txt') ||
    normalizedName.endsWith('.fig') ||
    normalizedName.endsWith('.xls') ||
    normalizedName.endsWith('.xlsx') ||
    normalizedName.endsWith('.ppt') ||
    normalizedName.endsWith('.pptx')
  ) {
    return 'document';
  }
  return 'other';
}

function pickImagePayload(message) {
  const imageInfoArray = message?.payload?.imageInfoArray || [];
  return (
    imageInfoArray.find((item) => String(item?.type || '').toLowerCase() === 'original') ||
    imageInfoArray[0] ||
    null
  );
}

function extractPayloadAttachments(message) {
  if (message?.type === TencentCloudChat.TYPES.MSG_IMAGE) {
    const imagePayload = pickImagePayload(message);
    const fileName = message?.payload?.fileName || '图片';
    return [
      {
        id: message.ID || message.idClient || `${message.from}-${message.time}-${fileName}`,
        name: fileName,
        type: message?.payload?.filetype || 'image/*',
        kind: 'image',
        size: Number(imagePayload?.size || message?.payload?.fileSize || 0),
        previewUrl: imagePayload?.url || message?.payload?.url || '',
        downloadUrl: imagePayload?.url || message?.payload?.url || ''
      }
    ];
  }

  if (message?.type === TencentCloudChat.TYPES.MSG_VIDEO) {
    const fileName = message?.payload?.fileName || '视频';
    return [
      {
        id: message.ID || message.idClient || `${message.from}-${message.time}-${fileName}`,
        name: fileName,
        type: message?.payload?.filetype || 'video/*',
        kind: 'video',
        size: Number(message?.payload?.fileSize || 0),
        previewUrl: message?.payload?.videoUrl || message?.payload?.url || '',
        downloadUrl: message?.payload?.url || message?.payload?.videoUrl || ''
      }
    ];
  }

  if (message?.type === TencentCloudChat.TYPES.MSG_FILE) {
    const fileName = message?.payload?.fileName || '文件';
    const fileType = message?.payload?.filetype || 'application/octet-stream';
    return [
      {
        id: message.ID || message.idClient || `${message.from}-${message.time}-${fileName}`,
        name: fileName,
        type: fileType,
        kind: inferAttachmentKind(fileType, fileName),
        size: Number(message?.payload?.fileSize || 0),
        previewUrl: message?.payload?.url || '',
        downloadUrl: message?.payload?.url || ''
      }
    ];
  }

  return [];
}

function formatTime(unixSeconds) {
  if (!unixSeconds) {
    return '刚刚';
  }
  return new Date(unixSeconds * 1000).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function conversationID(groupId) {
  return `${TencentCloudChat.TYPES.CONV_GROUP}${groupId}`;
}

function resolveGroupType(groupType) {
  switch (groupType) {
    case 'ChatRoom':
      return TencentCloudChat.TYPES.GRP_AVCHATROOM;
    case 'Work':
      return TencentCloudChat.TYPES.GRP_WORK;
    default:
      return TencentCloudChat.TYPES.GRP_PUBLIC;
  }
}

function resolveJoinOption(joinOption) {
  switch (joinOption) {
    case 'NeedPermission':
      return TencentCloudChat.TYPES.JOIN_OPTIONS_NEED_PERMISSION;
    case 'DisableApply':
      return TencentCloudChat.TYPES.JOIN_OPTIONS_DISABLE_APPLY;
    default:
      return TencentCloudChat.TYPES.JOIN_OPTIONS_FREE_ACCESS;
  }
}

function tencentErrorCode(error) {
  const code = Number(error?.code);
  return Number.isFinite(code) ? code : null;
}

function isIgnorableCreateGroupError(error) {
  const code = tencentErrorCode(error);
  return code === 10025;
}

function isIgnorableJoinGroupError(error) {
  const code = tencentErrorCode(error);
  return code === 10013;
}

export function subscribeTencentMessages(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export async function connectTencentIm(config) {
  if (!config?.enabled || !config.sdkAppId || !config.userSig || !config.userId) {
    return { enabled: false };
  }

  const instance = ensureChat(config.sdkAppId);
  ensureUploadPlugin(instance);
  const loginKey = `${config.sdkAppId}:${config.userId}`;
  currentUserId = config.userId;
  currentDisplayName = config.displayName || config.userId;

  await logoutIfNeeded(instance, loginKey);

  if (currentLoginKey !== loginKey) {
    await instance.login({
      userID: config.userId,
      userSig: config.userSig
    });
    await waitUntilReady();
    currentLoginKey = loginKey;
  } else if (!isReady) {
    await waitUntilReady();
  }

  return {
    enabled: true,
    conversationID: conversationID(config.groupId)
  };
}

export async function ensureTencentTaskGroup(config) {
  if (!chat || !config?.enabled || !config.groupId) {
    return false;
  }

  const groupType = resolveGroupType(config.groupType);
  const joinOption = resolveJoinOption(config.joinOption);

  try {
    await chat.createGroup({
      groupID: config.groupId,
      name: config.roomTitle || config.groupId,
      type: groupType,
      joinOption,
      introduction: `任务房间 ${config.roomTitle || config.groupId}`,
      notification: '围绕任务范围、进度与验收协作的专用房间'
    });
    return true;
  } catch (error) {
    if (isIgnorableCreateGroupError(error)) {
      return true;
    }
    try {
      await chat.joinGroup({
        groupID: config.groupId,
        type: groupType
      });
      return true;
    } catch (joinError) {
      if (isIgnorableJoinGroupError(joinError)) {
        return true;
      }
      return false;
    }
  }
}

export async function getTencentGroupMessages(config) {
  if (!chat || !config?.enabled) {
    return [];
  }

  const response = await chat.getMessageList({
    conversationID: conversationID(config.groupId)
  });

  const messageList = response?.data?.messageList || [];
  return messageList
    .map((item) => normalizeMessage(item, config.displayName, config.userId))
    .sort((left, right) => Number(left.timestamp || 0) - Number(right.timestamp || 0));
}

export async function sendTencentGroupText(config, text) {
  if (!chat || !config?.enabled) {
    return;
  }

  const message = chat.createTextMessage({
    to: config.groupId,
    conversationType: TencentCloudChat.TYPES.CONV_GROUP,
    payload: {
      text
    }
  });

  await chat.sendMessage(message);
}

export async function sendTencentGroupAttachment(config, attachment) {
  if (!chat || !config?.enabled || !attachment?.file) {
    return;
  }

  let message;
  if (attachment.kind === 'image') {
    message = chat.createImageMessage({
      to: config.groupId,
      conversationType: TencentCloudChat.TYPES.CONV_GROUP,
      payload: {
        file: attachment.file
      }
    });
  } else if (attachment.kind === 'video') {
    message = chat.createVideoMessage({
      to: config.groupId,
      conversationType: TencentCloudChat.TYPES.CONV_GROUP,
      payload: {
        file: attachment.file
      }
    });
  } else {
    message = chat.createFileMessage({
      to: config.groupId,
      conversationType: TencentCloudChat.TYPES.CONV_GROUP,
      payload: {
        file: attachment.file
      }
    });
  }

  await chat.sendMessage(message);
}
