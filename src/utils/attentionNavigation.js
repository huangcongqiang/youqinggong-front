import { roleRouteMap } from './roleRoutes';

function textValue(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      const normalized = String(value).trim();
      if (normalized) {
        return normalized;
      }
    }
  }

  return '';
}

function routeQueryOf(routeLike) {
  if (!routeLike) {
    return {};
  }

  if (typeof routeLike === 'string') {
    if (!routeLike.includes('?')) {
      return {};
    }
    const [, rawQuery = ''] = routeLike.split('?');
    return Object.fromEntries(new URLSearchParams(rawQuery).entries());
  }

  if (routeLike && typeof routeLike === 'object' && routeLike.query && typeof routeLike.query === 'object') {
    return routeLike.query;
  }

  return {};
}

export function normalizeAttentionGroupKey(value) {
  const normalized = textValue(value).toLowerCase();
  if (!normalized) {
    return '';
  }
  if (normalized.includes('all') || normalized.includes('全部')) {
    return 'all';
  }
  if (normalized.includes('confirm') || normalized.includes('确认')) {
    return 'confirmations';
  }
  if (normalized.includes('change') || normalized.includes('修改')) {
    return 'changes';
  }
  if (normalized.includes('selection') || normalized.includes('match') || normalized.includes('选人') || normalized.includes('发布')) {
    return 'matching';
  }
  if (normalized.includes('grade') || normalized.includes('review') || normalized.includes('验收') || normalized.includes('评级')) {
    return 'reviews';
  }
  if (normalized.includes('cancel') || normalized.includes('取消')) {
    return 'cancellations';
  }
  if (normalized.includes('follow') || normalized.includes('chat') || normalized.includes('message') || normalized.includes('回看')) {
    return 'followup';
  }
  return '';
}

export function collectAttentionAnchor(...sources) {
  const anchor = {};
  const queue = [...sources];

  const assign = (key, value) => {
    const next = textValue(value);
    if (next && !anchor[key]) {
      anchor[key] = next;
    }
  };

  while (queue.length) {
    const source = queue.shift();
    if (!source) {
      continue;
    }
    if (Array.isArray(source)) {
      queue.unshift(...source);
      continue;
    }
    if (typeof source !== 'object') {
      continue;
    }

    const routeQuery = routeQueryOf(source.route || source.to || source.link || source.secondaryRoute);
    assign('itemId', source.itemId ?? source.id ?? routeQuery.itemId);
    assign('approvalId', source.approvalId ?? routeQuery.approvalId);
    assign('taskId', source.taskId ?? source.summary?.taskId ?? source.taskDetail?.taskId ?? source.task?.taskId ?? source.task?.id ?? routeQuery.taskId);
    assign('room', source.room ?? source.roomKey ?? source.roomId ?? source.taskRoom?.roomKey ?? routeQuery.room ?? routeQuery.roomKey);
    assign('recordId', source.recordId ?? source.record?.recordId ?? source.record?.id ?? routeQuery.recordId);
  }

  return anchor;
}

function routeMatches(item, keywords) {
  const path = textValue(
    typeof item?.route === 'string'
      ? item.route.split('?')[0]
      : item?.route?.path,
    typeof item?.to === 'string'
      ? item.to.split('?')[0]
      : item?.to?.path
  ).toLowerCase();
  return keywords.some((keyword) => path.includes(keyword));
}

function routeFingerprint(target) {
  if (!target) {
    return '';
  }

  if (typeof target === 'string') {
    return target;
  }

  return JSON.stringify({
    path: target.path || '',
    name: target.name || '',
    query: target.query || {}
  });
}

export function dedupeAttentionActions(actions) {
  const seen = new Set();

  return (Array.isArray(actions) ? actions : []).filter((action) => {
    if (!action?.to) {
      return false;
    }

    const signature = routeFingerprint(action.to);
    if (seen.has(signature)) {
      return false;
    }
    seen.add(signature);
    return true;
  });
}

export function buildCenterEntryRoute({ path, source, preferredItem }) {
  const groupKey = normalizeAttentionGroupKey(
    preferredItem?.groupKey ||
    preferredItem?.group ||
    preferredItem?.id ||
    preferredItem?.label ||
    preferredItem?.title
  );
  const anchor = collectAttentionAnchor(preferredItem);
  const query = {};

  if (source) {
    query.source = source;
  }
  if (groupKey && groupKey !== 'all') {
    query.group = groupKey;
  }
  if (anchor.itemId) {
    query.itemId = anchor.itemId;
  }
  if (anchor.approvalId) {
    query.approvalId = anchor.approvalId;
  }
  if (anchor.taskId) {
    query.taskId = anchor.taskId;
  }
  if (anchor.room) {
    query.room = anchor.room;
  }
  if (anchor.recordId) {
    query.recordId = anchor.recordId;
  }

  return Object.keys(query).length ? { path, query } : { path };
}

export function pickPreferredAttentionItem(items, moduleId, options = {}) {
  const normalizedItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!normalizedItems.length) {
    return null;
  }

  const firstItem = normalizedItems[0];
  const excludeGroupsByModule = options.excludeGroupsByModule || {};
  const preferredGroupsByModule = options.preferredGroupsByModule || {};
  const excludedGroups = new Set(excludeGroupsByModule[moduleId] || []);
  const preferredGroups = new Set(preferredGroupsByModule[moduleId] || []);

  if (moduleId === 'messages') {
    return normalizedItems.find((item) => Boolean(collectAttentionAnchor(item).room) || routeMatches(item, ['chat', 'messages'])) || firstItem;
  }

  if (moduleId === 'workspace') {
    return normalizedItems.find((item) => {
      const groupKey = normalizeAttentionGroupKey(item?.groupKey || item?.id || item?.label || item?.title);
      return Boolean(collectAttentionAnchor(item).taskId) && !excludedGroups.has(groupKey);
    }) || firstItem;
  }

  if (moduleId === 'records') {
    return normalizedItems.find((item) => {
      const groupKey = normalizeAttentionGroupKey(item?.groupKey || item?.id || item?.label || item?.title);
      return Boolean(collectAttentionAnchor(item).recordId) || groupKey === 'reviews';
    }) || firstItem;
  }

  if (preferredGroups.size) {
    return normalizedItems.find((item) =>
      preferredGroups.has(normalizeAttentionGroupKey(item?.groupKey || item?.id || item?.label || item?.title))
    ) || firstItem;
  }

  return firstItem;
}

export function buildCurrentObjectContextActions({
  item,
  audience = 'enterprise',
  primaryAction,
  secondaryAction,
  withSource,
  attachRouteContext
}) {
  if (!item || typeof withSource !== 'function' || typeof attachRouteContext !== 'function') {
    return [];
  }

  const isTalent = audience === 'talent';
  const routeMap = isTalent ? roleRouteMap.talent : roleRouteMap.enterprise;
  const groupKey = normalizeAttentionGroupKey(item.groupKey || item.group || item.id || item.label || item.title);
  const context = {
    group: groupKey,
    itemId: textValue(item.itemId, item.id),
    approvalId: textValue(item.approvalId),
    taskId: textValue(item.taskId),
    recordId: textValue(item.recordId),
    room: textValue(item.room, item.roomKey)
  };

  return dedupeAttentionActions([
    primaryAction?.to
      ? {
          key: textValue(primaryAction.key, 'primary'),
          label: textValue(primaryAction.label, '去处理'),
          tone: primaryAction.tone === 'secondary' ? 'secondary' : 'primary',
          to: primaryAction.to
        }
      : null,
    context.room
      ? {
          key: 'messages',
          label: '去聊天',
          tone: 'secondary',
          to: attachRouteContext(withSource(routeMap.messages), context)
        }
      : null,
    context.taskId
      ? {
          key: 'workspace',
          label: '去协作空间',
          tone: 'secondary',
          to: attachRouteContext(withSource(routeMap.workspace), context)
        }
      : null,
    context.recordId
      ? {
          key: 'record',
          label: '看记录详情',
          tone: 'secondary',
          to: attachRouteContext(withSource(routeMap.recordDetail(context.recordId)), context)
        }
      : null,
    context.taskId && groupKey === 'reviews'
      ? {
          key: 'acceptance',
          label: '去验收页',
          tone: 'secondary',
          to: attachRouteContext(withSource(routeMap.acceptance), context)
        }
      : null,
    secondaryAction?.to
      ? {
          key: textValue(secondaryAction.key, 'secondary'),
          label: textValue(secondaryAction.label, '查看详情'),
          tone: secondaryAction.tone === 'primary' ? 'primary' : 'secondary',
          to: secondaryAction.to
        }
      : null
  ]);
}
