import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const enterpriseRecruitingSource = readFileSync(resolve(currentDir, 'EnterpriseRecruiting.tsx'), 'utf8');
const talentDashboardSource = readFileSync(resolve(currentDir, 'TalentDashboard.tsx'), 'utf8');
const contractChatSource = readFileSync(resolve(currentDir, 'ContractChat.tsx'), 'utf8');
const contractWorkspaceSource = readFileSync(resolve(currentDir, 'ContractWorkspace.tsx'), 'utf8');

assert(
  !enterpriseRecruitingSource.includes("outcome: 'CONTINUE'")
    && !enterpriseRecruitingSource.includes('handleContinue')
    && enterpriseRecruitingSource.includes('确认合作'),
  'Enterprise recruiting should not open a pre-confirmation continue chat; interview accepted applicants must be confirmed first.'
);

assert(
  talentDashboardSource.includes("if (decision === 'ACCEPT') {")
    && talentDashboardSource.includes('已同意面试，等待企业确认合作后再进入沟通。')
    && !talentDashboardSource.includes("navigate(`/talent/chat?taskId=${encodeURIComponent(taskId)}${roomKey ? `&room=${encodeURIComponent(roomKey)}&roomKey=${encodeURIComponent(roomKey)}` : ''}`);"),
  'Talent dashboard should not navigate directly into chat after accepting an interview invite.'
);

assert(
  contractChatSource.includes('const displayStage = isTaskConfirmationPending ? confirmationStatus : activeRoom.stage')
    && contractChatSource.includes('{displayStage}：{activeRoom.title}'),
  'Contract chat should show pending task-confirmation status before the task version is confirmed.'
);

assert(
  contractWorkspaceSource.includes('const isTaskConfirmationPending')
    && contractWorkspaceSource.includes('const primaryActionHref = isTaskConfirmationPending ? chatHref : acceptanceHref')
    && contractWorkspaceSource.includes('const canSubmitProgress = !isTaskConfirmationPending'),
  'Contract workspace should route pending confirmations back to the confirmation card and block progress submission before execution.'
);
