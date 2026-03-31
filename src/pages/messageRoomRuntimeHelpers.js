import { findRoomByTaskId } from './messageRoomSelection.js';

export function roomCounterpartName(roomData, audience) {
  const members = Array.isArray(roomData?.members) ? roomData.members : [];
  const currentAudience = audience === 'talent' ? 'talent' : 'enterprise';
  const counterpart = members.find((item) => item?.audience && item.audience !== currentAudience && item.audience !== 'system');
  return counterpart?.displayName || '';
}

export function enrichRoomItem(item, activeRoomKey, communicationRecord) {
  if (item.roomKey === activeRoomKey && communicationRecord) {
    return {
      ...item,
      communicationStatus: communicationRecord.status || item.communicationStatus || '已生成',
      communicationSavedAt: communicationRecord.savedAt || item.communicationSavedAt || ''
    };
  }
  return item;
}

export function findRoomsForTargetCounterpart(items = [], counterpartPlatformUserId = '') {
  if (!counterpartPlatformUserId) {
    return [];
  }
  return items.filter((item) => item.counterpartPlatformUserId === counterpartPlatformUserId);
}

export function findRoomForTargetCounterpart(items = [], counterpartPlatformUserId = '') {
  const matches = findRoomsForTargetCounterpart(items, counterpartPlatformUserId);
  if (matches.length !== 1) {
    return null;
  }
  return matches[0];
}

export function findRoomForTask(items = [], taskId = '') {
  return findRoomByTaskId(items, taskId);
}

export function buildTargetedEmptyRoom({
  targetCounterpartName = '',
  targetCounterpartPlatformUserId = '',
  matchingRooms = []
}) {
  const hasMultipleMatches = matchingRooms.length > 1;
  return {
    roomKey: '',
    taskId: '',
    title: targetCounterpartName ? `与 ${targetCounterpartName} 的聊天` : '还没有聊天',
    taskTitle: '',
    counterpartName: targetCounterpartName,
    counterpartPlatformUserId: targetCounterpartPlatformUserId,
    stage: '等待任务开始',
    focus: targetCounterpartName
      ? hasMultipleMatches
        ? `当前与 ${targetCounterpartName} 已有多个任务房间，请先从上方会话列表选择要继续沟通的任务。`
        : `当前还没有与 ${targetCounterpartName} 建立聊天。你可以直接发送第一条消息，系统会自动建立沟通房间。`
      : '当企业发布任务并选中人才后，新的协商房间会出现在这里。',
    taskDetail: null,
    members: [],
    participants: targetCounterpartName ? [targetCounterpartName] : [],
    quickReplies: [],
    quickRepliesByAudience: {
      enterprise: [],
      talent: []
    },
    taskTags: [],
    messages: []
  };
}

export function shouldRefreshRoomDetail(previousActiveSummary, activeSummary) {
  return (
    !previousActiveSummary ||
    previousActiveSummary.lastTimestamp !== activeSummary.lastTimestamp ||
    previousActiveSummary.stage !== activeSummary.stage ||
    previousActiveSummary.communicationSavedAt !== activeSummary.communicationSavedAt ||
    previousActiveSummary.lastMessage !== activeSummary.lastMessage
  );
}
