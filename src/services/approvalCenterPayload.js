const APPROVAL_GROUP_META = {
  confirmations: { label: '待确认', note: '先确认版本和工期。' },
  changes: { label: '待修改', note: '先收口修改意见。' },
  reviews: { label: '待验收 / 评级', note: '先处理验收、评级和结算前动作。' },
  cancellations: { label: '待取消', note: '先确认取消事项。' }
};

export const APPROVAL_GROUP_KEYS = Object.keys(APPROVAL_GROUP_META);

function listOf(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function textOf(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

function numberOf(value, fallback = 0) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

function isApprovalGroup(groupKey) {
  return APPROVAL_GROUP_KEYS.includes(textOf(groupKey));
}

function approvalTypeOf(groupKey) {
  return switchGroup(groupKey, {
    confirmations: 'TASK_ANALYSIS_CONFIRM',
    changes: 'TASK_CONFIRMATION_CHANGE_REQUEST',
    reviews: 'TASK_REVIEW',
    cancellations: 'TASK_CANCELLATION'
  }, 'TASK_APPROVAL');
}

function switchGroup(groupKey, mapping, fallback) {
  const key = textOf(groupKey);
  return Object.prototype.hasOwnProperty.call(mapping, key) ? mapping[key] : fallback;
}

function buildApprovalGroups(items) {
  const counts = APPROVAL_GROUP_KEYS.reduce((accumulator, key) => ({
    ...accumulator,
    [key]: 0
  }), {});

  listOf(items).forEach((item) => {
    const key = textOf(item?.groupKey);
    if (isApprovalGroup(key)) {
      counts[key] += Math.max(numberOf(item?.count, 1), 1);
    }
  });

  return APPROVAL_GROUP_KEYS.map((key) => ({
    key,
    label: APPROVAL_GROUP_META[key].label,
    note: APPROVAL_GROUP_META[key].note,
    count: counts[key] || 0
  }));
}

function normalizeApprovalItem(item, index) {
  const groupKey = textOf(item?.groupKey);
  if (!isApprovalGroup(groupKey)) {
    return null;
  }

  const id = textOf(item?.approvalId, item?.id, item?.itemId, `approval-${groupKey}-${index}`);
  return {
    ...item,
    id,
    itemId: textOf(item?.itemId, id),
    approvalId: textOf(item?.approvalId, id),
    approvalType: textOf(item?.approvalType, approvalTypeOf(groupKey)),
    approvalStatus: textOf(item?.approvalStatus, 'PENDING'),
    pendingAudience: textOf(item?.pendingAudience, 'enterprise'),
    decisionSummary: textOf(item?.decisionSummary, item?.summary, item?.note, '待处理审批事项。'),
    decisionActions: listOf(item?.decisionActions),
    groupKey,
    groupLabel: textOf(item?.groupLabel, APPROVAL_GROUP_META[groupKey].label),
    count: Math.max(numberOf(item?.count, 1), 1)
  };
}

export function buildApprovalCenterFallbackFromBusiness(businessFallback = {}) {
  const approvalItems = listOf(businessFallback?.approvalItems).length
    ? listOf(businessFallback.approvalItems).map(normalizeApprovalItem).filter(Boolean)
    : listOf(businessFallback?.notificationItems).map(normalizeApprovalItem).filter(Boolean);

  const approvalHeadline = textOf(
    businessFallback?.approvalHeadline,
    businessFallback?.attentionHeadline,
    '当前没有待审批事项。'
  );

  return {
    approvalHeadline,
    attentionHeadline: approvalHeadline,
    approvalItems,
    approvalGroups: buildApprovalGroups(approvalItems)
  };
}

export function normalizeApprovalCenterPayload(rawPayload, fallbackState = {}) {
  const fallback = buildApprovalCenterFallbackFromBusiness(fallbackState);
  const approvalItems = listOf(rawPayload?.approvalItems).map(normalizeApprovalItem).filter(Boolean);
  const normalizedItems = approvalItems.length ? approvalItems : fallback.approvalItems;
  const normalizedGroups = listOf(rawPayload?.approvalGroups)
    .filter((item) => isApprovalGroup(item?.key))
    .map((item) => ({
      key: textOf(item?.key),
      label: textOf(item?.label, APPROVAL_GROUP_META[textOf(item?.key)]?.label),
      note: textOf(item?.note, APPROVAL_GROUP_META[textOf(item?.key)]?.note),
      count: Math.max(numberOf(item?.count, 0), 0)
    }));

  const approvalGroups = normalizedGroups.length ? buildApprovalGroups(
    APPROVAL_GROUP_KEYS.flatMap((key) => {
      const count = normalizedGroups.find((item) => item.key === key)?.count || 0;
      return count > 0 ? [{ groupKey: key, count }] : [];
    })
  ) : buildApprovalGroups(normalizedItems);

  const approvalHeadline = textOf(
    rawPayload?.approvalHeadline,
    rawPayload?.attentionHeadline,
    fallback.approvalHeadline
  );

  return {
    ...fallback,
    ...(rawPayload && typeof rawPayload === 'object' ? rawPayload : {}),
    approvalHeadline,
    attentionHeadline: approvalHeadline,
    approvalItems: normalizedItems,
    approvalGroups
  };
}
