import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const read = (file) => readFileSync(resolve(currentDir, file), 'utf8');

const recruitingSource = read('EnterpriseRecruiting.tsx');
const taskDetailsSource = read('TaskDetails.tsx');
const taskApplySource = read('TaskApply.tsx');
const workspaceSource = read('ContractWorkspace.tsx');
const acceptanceSource = read('AcceptanceCenter.tsx');

assert(
  recruitingSource.includes('role="dialog"')
    && recruitingSource.includes('aria-modal="true"')
    && recruitingSource.includes('先填写面试时间。')
    && recruitingSource.includes('先填写腾讯会议号。')
    && !recruitingSource.includes("meetingCode: '线上会议待同步'")
    && !recruitingSource.includes('defaultInterviewAt()'),
  'EnterpriseRecruiting should collect interview details in a modal and stop sending placeholder invite data.'
);

assert(
  recruitingSource.includes('applicant.avatar ?')
    && recruitingSource.includes("applicant.name.slice(0, 1) || '人'"),
  'EnterpriseRecruiting should show a stable applicant initial when avatar data is missing.'
);

assert(
  taskDetailsSource.includes("actionStatus === 'INTERVIEW_PENDING'")
    && taskDetailsSource.includes("actionLabel = '回应面试邀约'")
    && taskDetailsSource.includes("actionRoute = `/talent/tasks?taskId=${encodeURIComponent(id)}`"),
  'TaskDetails should route interview-pending talent users to the real invite response surface.'
);

assert(
  taskApplySource.includes("actionStatus === 'INTERVIEW_PENDING'")
    && taskApplySource.includes("navigate(`/talent/tasks?taskId=${encodeURIComponent(taskId)}`)")
    && taskApplySource.includes('去处理面试邀约'),
  'TaskApply should not resubmit an application when the task is waiting for talent interview response.'
);

assert(
  workspaceSource.includes('summary.talentName, summary.talent')
    && workspaceSource.includes('summary.enterpriseName, summary.business'),
  'ContractWorkspace should use role-aware partner fields from workspace summary instead of falling back to unsynced partner text.'
);

assert(
  acceptanceSource.includes('useState<string | null>("S")'),
  'AcceptanceCenter should have a default rating selected so acceptance can be submitted without re-clicking the visible default grade.'
);
