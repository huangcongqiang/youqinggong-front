export const roleRouteMap = {
  portal: {
    home: '/',
    enterpriseEntry: '/enterprise',
    talentEntry: '/talent',
    register: (audience = 'enterprise') => ({
      path: '/register',
      query: { audience }
    })
  },
  enterprise: {
    home: '/enterprise',
    onboarding: '/enterprise/onboarding',
    publish: '/enterprise/publish',
    publishWithTalent: (talent = {}, entrySource = 'enterprise-market') => ({
      path: '/enterprise/publish',
      query: {
        ...(talent.talentUserId ? { talentUserId: String(talent.talentUserId) } : {}),
        ...(talent.slug ? { talentSlug: String(talent.slug) } : {}),
        ...(talent.name ? { talentName: String(talent.name) } : {}),
        entrySource
      }
    }),
    market: '/enterprise/talents',
    detail: (slug) => `/enterprise/talents/${slug}`,
    approvals: '/enterprise/approvals',
    notifications: '/enterprise/notifications',
    messages: '/enterprise/chat',
    messageRoom: (roomKey = '', query = {}) => ({
      path: '/enterprise/chat',
      query: {
        ...query,
        ...(roomKey ? { room: roomKey } : {})
      }
    }),
    workspace: '/enterprise/workspace',
    acceptance: '/enterprise/acceptance',
    records: '/enterprise/records',
    recordDetail: (recordId) => `/enterprise/records/${recordId}`
  },
  talent: {
    home: '/talent',
    onboarding: '/talent/onboarding',
    market: '/talent/tasks',
    profile: (slug) => `/talent/profile/${slug}`,
    notifications: '/talent/notifications',
    messages: '/talent/chat',
    messageRoom: (roomKey = '', query = {}) => ({
      path: '/talent/chat',
      query: {
        ...query,
        ...(roomKey ? { room: roomKey } : {})
      }
    }),
    workspace: '/talent/workspace',
    acceptance: '/talent/acceptance',
    records: '/talent/records',
    recordDetail: (recordId) => `/talent/records/${recordId}`
  }
};

export function resolveAudience(route) {
  if (route?.meta?.audience) {
    return route.meta.audience;
  }

  if (route?.path?.startsWith('/enterprise')) {
    return 'enterprise';
  }

  if (route?.path?.startsWith('/talent')) {
    return 'talent';
  }

  return 'portal';
}
