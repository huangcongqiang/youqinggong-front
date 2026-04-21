function textOf(value) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return '';
}

function normalizeAudience(audience) {
  return audience === 'talent' ? 'talent' : 'enterprise';
}

function buildVerificationItem({ key, label, clearValue, clearNote, emptyValue, emptyNote, audience }) {
  const hasValue = Boolean(clearNote);
  return {
    key,
    label,
    state: hasValue ? 'clear' : 'action-required',
    value: hasValue ? clearValue : emptyValue,
    note: hasValue ? clearNote : emptyNote,
    actionKind: hasValue ? 'none' : 'route',
    actionLabel: hasValue ? '' : '继续完善设置',
    actionTo: audience === 'talent' ? '/talent/onboarding' : '/enterprise/onboarding',
    disabled: false
  };
}

export function buildUpworkFirstAccountStatus(user, audience = 'enterprise') {
  const normalizedAudience = normalizeAudience(audience);
  const safeUser = user && typeof user === 'object' ? user : {};
  const email = textOf(safeUser.email);
  const mobile = textOf(safeUser.mobile);
  const approvalStatus = textOf(safeUser.approvalStatus).toUpperCase();
  const restrictionReason = textOf(safeUser.tradingRestrictionMessage);

  const items = [
    buildVerificationItem({
      key: 'email',
      label: '邮箱验证',
      clearValue: '邮箱已填写',
      clearNote: email,
      emptyValue: '还没有邮箱',
      emptyNote: '当前账号还没有填写邮箱。',
      audience: normalizedAudience
    }),
    buildVerificationItem({
      key: 'phone',
      label: '手机验证',
      clearValue: '手机号已填写',
      clearNote: mobile,
      emptyValue: '还没有手机号',
      emptyNote: '当前账号还没有填写手机号。',
      audience: normalizedAudience
    })
  ];

  if (normalizedAudience === 'enterprise') {
    const billingState = restrictionReason ? 'blocked' : 'gap';
    items.push({
      key: 'billing',
      label: '账单状态',
      state: billingState,
      value: restrictionReason ? '当前受限' : '仍待确认',
      note: restrictionReason || '打开账单状态，查看当前进度和下一步。',
      actionKind: 'route',
      actionLabel: restrictionReason ? '继续完善设置' : '查看账单状态',
      actionTo: restrictionReason ? '/enterprise/onboarding' : '/enterprise/billing',
      disabled: false
    });
  }

  const blockingItems = items.filter((item) => item.state === 'action-required' || item.state === 'blocked');
  const gapItems = items.filter((item) => item.state === 'gap');
  const approved = approvalStatus === 'APPROVED';

  let summaryTone = 'default';
  let summaryTitle = '当前账号已经可以继续。';
  let summaryBody = '基础检查已经完成，可以继续进入下一步。';

  if (blockingItems.length) {
    summaryTone = 'warning';
    summaryTitle = '当前账号还有待完善项。';
    summaryBody = blockingItems.map((item) => `${item.label}: ${item.note}`).join(' ');
  } else if (gapItems.length) {
    summaryTone = 'note';
    summaryTitle = '基础信息已就绪，还有一项待确认。';
    summaryBody = gapItems.map((item) => `${item.label}: ${item.note}`).join(' ');
  }

  return {
    audience: normalizedAudience,
    approved,
    hasBlockingItems: blockingItems.length > 0,
    blockingCount: blockingItems.length,
    gapCount: gapItems.length,
    items,
    summaryTone,
    summaryTitle,
    summaryBody
  };
}
