const TALENT_PROFILE_SLUG_BY_NAME = {
  '陈一宁': 'chen-yining',
  '林昭': 'lin-zhao',
  '苏禾': 'su-he',
  '顾岩': 'gu-yan',
  '宋桥': 'song-qiao',
}

function stringOf(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }
  return ''
}

export function resolveTalentProfileSlug(user = {}) {
  const displayName = stringOf(user?.displayName, user?.name)
  if (displayName && TALENT_PROFILE_SLUG_BY_NAME[displayName]) {
    return TALENT_PROFILE_SLUG_BY_NAME[displayName]
  }

  const platformUserId = stringOf(user?.platformUserId, user?.talentUserId, user?.userId)
  if (platformUserId) {
    return `user-${platformUserId}`
  }

  return ''
}

export function resolveRequestedTalentSlug(slug, currentUser = {}) {
  const normalizedSlug = stringOf(slug)
  if (normalizedSlug && normalizedSlug !== 'me') {
    return normalizedSlug
  }
  return resolveTalentProfileSlug(currentUser)
}
