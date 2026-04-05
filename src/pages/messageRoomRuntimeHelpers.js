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

export function findRoomsForTargetCounterpart(items = [], counterpartPlatformUserId = '', taskId = '') {
  const normalizedCounterpartPlatformUserId = String(counterpartPlatformUserId || '').trim();
  const normalizedTaskId = String(taskId || '').trim();
  if (!normalizedCounterpartPlatformUserId || !normalizedTaskId) {
    return [];
  }
  return items.filter((item) => {
    if (item.counterpartPlatformUserId !== normalizedCounterpartPlatformUserId) {
      return false;
    }
    return String(item?.taskId || '').trim() === normalizedTaskId;
  });
}

export function findRoomForTargetCounterpart(items = [], counterpartPlatformUserId = '', taskId = '') {
  const matches = findRoomsForTargetCounterpart(items, counterpartPlatformUserId, taskId);
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
  targetTaskId = '',
  matchingRooms = []
}) {
  const hasMultipleMatches = matchingRooms.length > 1;
  const requiresTaskSelection = !String(targetTaskId || '').trim();
  return {
    roomKey: '',
    taskId: '',
    title: targetCounterpartName ? `与 ${targetCounterpartName} 的聊天` : '还没有聊天',
    taskTitle: '',
    counterpartName: targetCounterpartName,
    counterpartPlatformUserId: targetCounterpartPlatformUserId,
    stage: '等待任务开始',
    focus: targetCounterpartName
      ? requiresTaskSelection
        ? `请先为 ${targetCounterpartName} 选择一个任务，再进入当前轮协商。`
        : hasMultipleMatches
        ? `当前与 ${targetCounterpartName} 已有多个任务房间，请先从上方会话列表选择要继续沟通的任务。`
        : `当前还没有与 ${targetCounterpartName} 建立聊天。请先绑定任务，再进入当前轮协商。`
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
