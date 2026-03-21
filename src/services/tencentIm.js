import TencentCloudChat from '@tencentcloud/chat';

let chat = null;
let currentSdkAppId = null;
let currentLoginKey = '';
let isReady = false;
let readyResolver = null;
let currentUserId = '';
let currentDisplayName = '';
const subscribers = new Set();

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
  const payloadText = extractPayloadText(message);
  const author = message.from === userId
    ? displayName || message.from
    : (message.nick || message.from || '腾讯 IM 系统消息');

  return {
    id: message.ID || message.idClient || `${message.from}-${message.time}-${payloadText}`,
    conversationID: message.conversationID,
    author,
    type: normalizeType(message),
    time: formatTime(message.time),
    text: payloadText,
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

export function subscribeTencentMessages(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export async function connectTencentIm(config) {
  if (!config?.enabled || !config.sdkAppId || !config.userSig || !config.userId) {
    return { enabled: false };
  }

  const instance = ensureChat(config.sdkAppId);
  const loginKey = `${config.sdkAppId}:${config.userId}`;
  currentUserId = config.userId;
  currentDisplayName = config.displayName || config.userId;

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
    try {
      await chat.joinGroup({
        groupID: config.groupId,
        type: groupType
      });
      return true;
    } catch (joinError) {
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
    .sort((left, right) => String(left.time).localeCompare(String(right.time)));
}

export async function sendTencentGroupText(config, text) {
  if (!chat || !config?.enabled) {
    return [];
  }

  const message = chat.createTextMessage({
    to: config.groupId,
    conversationType: TencentCloudChat.TYPES.CONV_GROUP,
    payload: {
      text
    }
  });

  await chat.sendMessage(message);
  return getTencentGroupMessages(config);
}
