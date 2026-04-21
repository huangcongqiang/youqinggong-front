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
      communicationStatus: communicationRecord.status || item.communicationStatus || 'Generated',
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
    title: targetCounterpartName ? `Conversation with ${targetCounterpartName}` : 'No conversation yet',
    taskTitle: '',
    counterpartName: targetCounterpartName,
    counterpartPlatformUserId: targetCounterpartPlatformUserId,
    stage: 'Waiting for a contract',
    focus: targetCounterpartName
      ? requiresTaskSelection
        ? `先为 ${targetCounterpartName} 选择合同，再回来继续这条会话。`
        : hasMultipleMatches
        ? `和 ${targetCounterpartName} 之间有多条合同会话，请先从上面的列表里选对合同。`
        : `No contract conversation exists with ${targetCounterpartName} yet. Link a contract first, then continue here.`
      : 'Once a client posts work and selects talent, the contract conversation will appear here.',
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
