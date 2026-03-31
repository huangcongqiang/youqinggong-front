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
    market: '/enterprise/talents',
    detail: (slug) => `/enterprise/talents/${slug}`,
    approvals: '/enterprise/approvals',
    notifications: '/enterprise/notifications',
    messages: '/enterprise/chat',
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
