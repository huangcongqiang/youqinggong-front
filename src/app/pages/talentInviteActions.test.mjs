import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const readPage = (file) => readFileSync(resolve(currentDir, file), 'utf8');
const readComponent = (file) => readFileSync(resolve(currentDir, '../components', file), 'utf8');
const readUtils = (file) => readFileSync(resolve(currentDir, '../utils', file), 'utf8');

const talentSearchSource = readPage('TalentSearch.tsx');
const talentDetailsSource = readPage('TalentDetails.tsx');
const inviteDialogSource = readComponent('TalentInviteDialog.tsx');
const interviewTimeSource = readUtils('interviewTime.ts');

assert(
  talentSearchSource.includes('TalentInviteDialog')
    && talentSearchSource.includes('setInviteTalent(talent)')
    && !talentSearchSource.includes('先选任务再邀约')
    && !talentSearchSource.includes('disabled>\n                          先选任务再邀约'),
  'TalentSearch should open a real task invite dialog instead of rendering a disabled invite placeholder.'
);

assert(
  talentDetailsSource.includes('TalentInviteDialog')
    && talentDetailsSource.includes('setInviteOpen(true)')
    && !talentDetailsSource.includes('<Button disabled')
    && !talentDetailsSource.includes('从任务中邀约</Button>'),
  'TalentDetails should let enterprises invite from the profile header instead of showing a disabled button.'
);

assert(
  inviteDialogSource.includes('getBusinessData')
    && inviteDialogSource.includes('sendRecruitingInterviewInvite')
    && inviteDialogSource.includes('role="dialog"')
    && inviteDialogSource.includes('aria-modal="true"')
    && inviteDialogSource.includes('选择任务')
    && inviteDialogSource.includes('面试时间')
    && inviteDialogSource.includes('腾讯会议号')
    && inviteDialogSource.includes('发送面试邀约')
    && inviteDialogSource.includes('/enterprise/recruiting?taskId='),
  'TalentInviteDialog should collect task and interview details, send a real invite, and link back to recruiting.'
);

assert(
  inviteDialogSource.includes('isKnownInterviewTimeInPast(draft.interviewAt)')
    && inviteDialogSource.includes('PAST_INTERVIEW_TIME_MESSAGE')
    && interviewTimeSource.includes('parseKnownInterviewTime'),
  'TalentInviteDialog should reject parseable past interview times before sending profile invites.'
);
