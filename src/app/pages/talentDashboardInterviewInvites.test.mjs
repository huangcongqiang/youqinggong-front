import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const talentDashboardSource = readFileSync(resolve(currentDir, 'TalentDashboard.tsx'), 'utf8');

assert(
  talentDashboardSource.includes('visibleInterviewInvites')
    && talentDashboardSource.includes('pendingInterviewInvites.slice(0, 3)')
    && !talentDashboardSource.includes('const latestInterviewInvite = pendingInterviewInvites[0] || null'),
  'TalentDashboard should render a short list of pending interview invites instead of only pendingInterviewInvites[0].'
);

assert(
  talentDashboardSource.includes('handleRespondInvite')
    && talentDashboardSource.includes("handleRespondInvite(invite, 'REJECT')")
    && talentDashboardSource.includes('拒绝邀约')
    && talentDashboardSource.includes('已拒绝本次面试邀约'),
  'TalentDashboard should let talent reject each pending interview invite from the dashboard.'
);
