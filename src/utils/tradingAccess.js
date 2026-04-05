export function tradingRestrictionMessage(user, audience = '') {
  const serverMessage = String(user?.tradingRestrictionMessage || '').trim();
  if (serverMessage) {
    return serverMessage;
  }
  if (user?.hasTradingAccess === true) {
    return '';
  }

  const approvalStatus = String(user?.approvalStatus || '').trim();
  if (!approvalStatus || approvalStatus === 'APPROVED') {
    return '';
  }

  const currentAudience = String(audience || user?.audience || '').trim();
  if (currentAudience === 'enterprise') {
    return '企业资质待审核，审核通过后才能发布任务、发起合作和进入正式协作。';
  }
  if (currentAudience === 'talent') {
    return '人才资料待审核，审核通过后才能申请合作、进入沟通和提交交付。';
  }
  return '当前资料待审核，审核通过后才能继续正式交易。';
}

export function hasTradingAccess(user, audience = '') {
  if (typeof user?.hasTradingAccess === 'boolean') {
    return user.hasTradingAccess;
  }
  return !tradingRestrictionMessage(user, audience);
}
