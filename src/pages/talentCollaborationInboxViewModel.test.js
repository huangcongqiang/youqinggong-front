import {
  buildTalentCollaborationSummary,
  collectTalentCollaborationItems
} from './talentCollaborationInboxViewModel.js';
import { setUiLocale } from '../utils/uiLocale.js';

setUiLocale('zh');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const inbox = {
  summary: {
    proposals: 2,
    invitations: 1,
    offers: 1,
    total: 4,
    note: '这里汇总了提案、邀约和 offer。'
  },
  proposalItems: [
    {
      kind: 'proposal',
      title: '品牌升级项目',
      businessName: 'Acme',
      status: '合作申请已提交',
      nextStep: '等待企业确认'
    }
  ],
  invitationItems: [
    {
      kind: 'invitation',
      title: '移动端重构',
      businessName: 'Globex',
      status: '企业已确认',
      nextStep: '继续进入沟通'
    }
  ],
  offerItems: [
    {
      kind: 'offer',
      title: '增长分析支持',
      businessName: 'Initech',
      status: '协商中',
      nextStep: '确认排期与交付边界'
    }
  ]
};

const items = collectTalentCollaborationItems(inbox);
assert(items.length === 3, 'collectTalentCollaborationItems should flatten proposal, invitation, and offer items into one list.');
assert(items[0].kind === 'proposal', 'collectTalentCollaborationItems should preserve proposal items first.');
assert(items[2].kind === 'offer', 'collectTalentCollaborationItems should preserve offer items last.');

const summary = buildTalentCollaborationSummary(inbox);
assert(
  summary.headline === '4 项合作动作待处理',
  'buildTalentCollaborationSummary should expose the total pending collaboration count.'
);
assert(
  summary.badge === '2 申请 / 1 邀请 / 1 合作邀约',
  'buildTalentCollaborationSummary should expose a count badge for proposal, invitation, and offer.'
);
assert(
  summary.preview[0] === '品牌升级项目 · Acme · 合作申请已提交',
  'buildTalentCollaborationSummary should surface the latest collaboration item in the preview.'
);
assert(
  summary.details.includes('合作邀约 · 增长分析支持 · Initech · 确认排期与交付边界'),
  'buildTalentCollaborationSummary should include offer next steps in the details list.'
);
