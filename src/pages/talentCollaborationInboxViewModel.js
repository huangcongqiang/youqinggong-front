import { getUiLocale } from '../utils/uiLocale.js';

function listOf(value) {
  return Array.isArray(value) ? value : [];
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

function isZh() {
  return getUiLocale() === 'zh';
}

function kindLabel(kind) {
  switch (String(kind || '').toLowerCase()) {
    case 'proposal':
      return isZh() ? '申请' : 'Application';
    case 'invitation':
      return isZh() ? '邀请' : 'Invite';
    default:
      return isZh() ? '合作邀约' : 'Offer';
  }
}

function describeItem(item) {
  return [
    textOf(item?.title, '待确认合同'),
    textOf(item?.businessName, '待确认企业'),
    textOf(item?.status, 'Needs review')
  ].join(' · ');
}

function describeDetail(item) {
  return [
    kindLabel(item?.kind),
    textOf(item?.title, '待确认合同'),
    textOf(item?.businessName, '待确认企业'),
    textOf(item?.nextStep, item?.status, '回到通知继续处理')
  ].join(' · ');
}

export function collectTalentCollaborationItems(inbox) {
  return [
    ...listOf(inbox?.proposalItems),
    ...listOf(inbox?.invitationItems),
    ...listOf(inbox?.offerItems)
  ];
}

export function buildTalentCollaborationSummary(inbox) {
  const summary = inbox?.summary && typeof inbox.summary === 'object' ? inbox.summary : {};
  const items = collectTalentCollaborationItems(inbox);
  const proposals = Number(summary.proposals || 0);
  const invitations = Number(summary.invitations || 0);
  const offers = Number(summary.offers || 0);
  const total = Number(summary.total || proposals + invitations + offers || items.length);
  const badge = [
    proposals > 0 ? `${proposals} ${isZh() ? '申请' : 'applications'}` : '',
    invitations > 0 ? `${invitations} ${isZh() ? '邀请' : 'invites'}` : '',
    offers > 0 ? `${offers} ${isZh() ? '合作邀约' : 'offers'}` : ''
  ].filter(Boolean).join(' / ');
  const note = textOf(summary.note, isZh() ? '当前没有需要处理的申请或邀请。' : 'There are no applications or invites to review right now.');

  return {
    title: textOf(inbox?.title, isZh() ? '申请 / 邀请 / 合作邀约' : 'Applications / Invites / Offers'),
    total,
    headline: total > 0 ? (isZh() ? `${total} 项合作动作待处理` : `${total} collaboration actions need attention`) : (isZh() ? '当前没有合作动作' : 'No collaboration actions right now'),
    badge: badge || 'Idle',
    description: total > 0 ? (isZh() ? '先查看新的申请、邀请和正在推进的合作邀约。' : '先查看新的申请、邀请和正在推进的合作邀约。') : note,
    preview: items.length ? items.slice(0, 2).map(describeItem) : [note],
    details: items.length ? items.map(describeDetail) : [note],
    sheetHint: isZh() ? '先处理申请、邀请和合作邀约，再回到消息和进行中的合同。' : 'Handle applications, invites, and offers first, then return to messages and active contracts.',
    status: total > 0 ? (isZh() ? `${total} 项待处理` : `${total} open`) : (isZh() ? '空闲' : 'Idle')
  };
}
