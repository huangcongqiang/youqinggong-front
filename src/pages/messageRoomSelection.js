function parseRoomTime(value) {
  const text = String(value || '');
  const match = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return 0;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

export function roomSortKey(item) {
  const numericTimestamp = Number(item?.lastTimestamp || 0);
  if (Number.isFinite(numericTimestamp) && numericTimestamp > 0) {
    return numericTimestamp;
  }
  return parseRoomTime(item?.lastTime);
}

export function sortRoomsByActivity(items = []) {
  return [...items].sort((left, right) => roomSortKey(right) - roomSortKey(left));
}

export function findRoomByTaskId(items = [], taskId = '') {
  const normalizedTaskId = String(taskId || '').trim();
  if (!normalizedTaskId) {
    return null;
  }
  return sortRoomsByActivity(items).find((item) => String(item?.taskId || '').trim() === normalizedTaskId) || null;
}

export function findDefaultRoom(items = []) {
  return sortRoomsByActivity(items)[0] || null;
}
