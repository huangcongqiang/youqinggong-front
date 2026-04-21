import { normalizeApprovalCenterPayload } from './approvalCenterPayload.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const payload = normalizeApprovalCenterPayload({
  approvalHeadline: '当前有 2 项待审批事项。',
  approvalItems: [
    {
      approvalId: 'approval-matching-101',
      groupKey: 'matching',
      taskId: 'task-101',
      title: '品牌官网重构',
      summary: '有 2 位人才已申请合作。',
      status: '待处理申请',
      count: 1
    },
    {
      approvalId: 'approval-confirmations-102',
      groupKey: 'confirmations',
      taskId: 'task-102',
      title: '包装升级',
      summary: '等待确认拆解。',
      status: '待确认',
      count: 1
    }
  ]
});

assert(
  payload.approvalItems.some((item) => item.groupKey === 'matching' && item.approvalType === 'TASK_COLLABORATION_REQUEST'),
  'normalizeApprovalCenterPayload should preserve matching approvals and map them to TASK_COLLABORATION_REQUEST.'
);

assert(
  payload.approvalGroups.some((item) => item.key === 'matching' && item.count === 1),
  'normalizeApprovalCenterPayload should include matching counts in approval groups.'
);
