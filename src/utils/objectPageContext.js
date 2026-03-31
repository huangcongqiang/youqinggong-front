const CONTEXT_KEYS = ['itemId', 'group', 'approvalId', 'taskId', 'recordId', 'room', 'nodeId', 'tab', 'source'];
const ORIGIN_KEYS = ['source', 'itemId', 'group', 'approvalId', 'taskId', 'recordId', 'room'];
const ORIGIN_KEY_MAP = {
  source: 'originSource',
  itemId: 'originItemId',
  group: 'originGroup',
  approvalId: 'originApprovalId',
  taskId: 'originTaskId',
  recordId: 'originRecordId',
  room: 'originRoom'
};

const SOURCE_LABELS = {
  messages: '返回聊天',
  workspace: '返回协作空间',
  'record-detail': '返回记录详情',
  records: '返回记录列表',
  acceptance: '返回验收页',
  notifications: '返回通知中心',
  approvals: '返回审批中心',
  'dashboard-enterprise': '返回企业工作台',
  'dashboard-talent': '返回人才工作台'
};

export function normalizeContextValue(value) {
  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized || '';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value).trim();
  }

  return '';
}

function readValue(query, defaults, key) {
  return normalizeContextValue(query?.[key] ?? defaults?.[key]);
}

export function readObjectPageContext(query = {}, defaults = {}) {
  const context = {};

  CONTEXT_KEYS.forEach((key) => {
    context[key] = readValue(query, defaults, key);
  });

  Object.entries(ORIGIN_KEY_MAP).forEach(([key, queryKey]) => {
    context[queryKey] = readValue(query, defaults, queryKey);
  });

  return context;
}

export function extractOriginContext(context = {}) {
  const normalized = {};

  ORIGIN_KEYS.forEach((key) => {
    const queryKey = ORIGIN_KEY_MAP[key];
    normalized[key] = normalizeContextValue(context?.[queryKey] ?? context?.[key]);
  });

  return normalized;
}

export function resolveImmediateOriginContext({ entrySource = '', query = {}, defaults = {}, allowedSources = [] } = {}) {
  const context = readObjectPageContext(query, defaults);

  if (context.originSource) {
    return extractOriginContext(context);
  }

  const source = normalizeContextValue(context.source || entrySource);
  if (!source || !new Set(allowedSources).has(source)) {
    return {};
  }

  return {
    source,
    itemId: context.itemId,
    group: context.group,
    approvalId: context.approvalId,
    taskId: context.taskId,
    recordId: context.recordId,
    room: context.room
  };
}

export function serializeObjectPageContext(context = {}) {
  const query = {};

  CONTEXT_KEYS.forEach((key) => {
    const value = normalizeContextValue(context[key]);
    if (value) {
      query[key] = value;
    }
  });

  Object.entries(ORIGIN_KEY_MAP).forEach(([key, queryKey]) => {
    const value = normalizeContextValue(context[queryKey] ?? context[`origin${key[0].toUpperCase()}${key.slice(1)}`]);
    if (value) {
      query[queryKey] = value;
    }
  });

  return query;
}

export function buildChildObjectPageContext({ current = {}, overrides = {}, origin } = {}) {
  const normalizedCurrent = readObjectPageContext(current, current);
  const nextOrigin = origin
    ? {
        source: normalizeContextValue(origin.source),
        itemId: normalizeContextValue(origin.itemId),
        group: normalizeContextValue(origin.group),
        approvalId: normalizeContextValue(origin.approvalId),
        taskId: normalizeContextValue(origin.taskId),
        recordId: normalizeContextValue(origin.recordId),
        room: normalizeContextValue(origin.room)
      }
    : extractOriginContext(normalizedCurrent);

  const merged = {
    ...normalizedCurrent,
    ...overrides
  };

  Object.entries(ORIGIN_KEY_MAP).forEach(([key, queryKey]) => {
    if (!Object.prototype.hasOwnProperty.call(overrides, queryKey)) {
      merged[queryKey] = nextOrigin[key];
    }
  });

  return serializeObjectPageContext(merged);
}

export function buildCenterReturnQuery({ current = {}, origin = {} } = {}) {
  const currentContext = readObjectPageContext(current, current);
  const nextOrigin = origin?.source
    ? origin
    : extractOriginContext(currentContext);

  const query = {};

  ['group', 'itemId', 'approvalId', 'taskId', 'recordId', 'room'].forEach((key) => {
    const value = normalizeContextValue(nextOrigin[key] || currentContext[key]);
    if (value) {
      query[key] = value;
    }
  });

  return query;
}

export function labelForObjectPageSource(source, fallback = '返回来源') {
  return SOURCE_LABELS[normalizeContextValue(source)] || fallback;
}
