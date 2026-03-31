import {
  buildApprovalCenterFallbackFromBusiness,
  normalizeApprovalCenterPayload
} from './approvalCenterPayload.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nexpected: ${expected}\nactual: ${actual}`);
  }
}

const businessFallback = {
  attentionHeadline: '当前有 5 项高优先级事项。',
  notificationItems: [
    {
      id: 'approval-confirm-1',
      itemId: 'approval-confirm-1',
      groupKey: 'confirmations',
      title: '确认任务拆解',
      summary: '需要确认范围与工期。',
      status: '待确认'
    },
    {
      id: 'approval-change-1',
      itemId: 'approval-change-1',
      groupKey: 'changes',
      title: '处理人才修改',
      summary: '人才提出新的修改建议。',
      status: '待修改'
    },
    {
      id: 'notification-matching-1',
      itemId: 'notification-matching-1',
      groupKey: 'matching',
      title: '去选人',
      summary: '这里不应该进入审批中心。',
      status: '待选人'
    },
    {
      id: 'notification-followup-1',
      itemId: 'notification-followup-1',
      groupKey: 'followup',
      title: '普通回看',
      summary: '这里也不应该进入审批中心。',
      status: '待回看'
    }
  ]
};

const fallback = buildApprovalCenterFallbackFromBusiness(businessFallback);

assertEqual(fallback.approvalItems.length, 2, '审批中心 fallback 只应保留审批相关事项');
assertEqual(fallback.approvalGroups.length, 4, '审批中心 fallback 只应保留四个审批分组');
assertEqual(fallback.approvalGroups[0].key, 'confirmations', '审批分组应从待确认开始');
assertEqual(fallback.approvalGroups[1].count, 1, '待修改分组应统计正确数量');
assertEqual(
  fallback.approvalHeadline,
  '当前有 5 项高优先级事项。',
  '审批中心 fallback 应优先复用业务页 attentionHeadline'
);

const normalized = normalizeApprovalCenterPayload(
  {
    approvalHeadline: '当前有 3 项待审批事项。',
    approvalItems: [
      {
        approvalId: 'approval-confirmations-101',
        id: 'approval-confirmations-101',
        groupKey: 'confirmations',
        title: '确认 AI 拆解',
        summary: '请先确认范围。',
        count: 1,
        decisionActions: [
          { key: 'approve', label: '确认拆解', action: 'APPROVE', tone: 'primary' }
        ]
      },
      {
        approvalId: 'approval-matching-102',
        id: 'approval-matching-102',
        groupKey: 'matching',
        title: '这个不应该出现',
        summary: '审批中心不应承接选人。'
      },
      {
        approvalId: 'approval-cancellations-103',
        id: 'approval-cancellations-103',
        groupKey: 'cancellations',
        title: '确认取消',
        summary: '对方已发起取消。',
        count: 2
      }
    ],
    approvalGroups: [
      { key: 'confirmations', count: 1 },
      { key: 'matching', count: 99 },
      { key: 'cancellations', count: 2 }
    ]
  },
  fallback
);

assertEqual(normalized.approvalItems.length, 2, 'normalizeApprovalCenterPayload 应过滤非审批分组事项');
assertEqual(normalized.approvalGroups.length, 4, 'normalizeApprovalCenterPayload 应输出固定四个审批分组');
assertEqual(normalized.approvalGroups[0].count, 1, '待确认数量应保留');
assertEqual(normalized.approvalGroups[3].count, 2, '待取消数量应保留');
assertEqual(
  normalized.approvalItems[0].decisionActions[0].action,
  'APPROVE',
  'normalizeApprovalCenterPayload 应保留审批动作'
);
assert(
  !normalized.approvalItems.some((item) => item.groupKey === 'matching'),
  'normalizeApprovalCenterPayload 不应输出 matching 分组'
);
