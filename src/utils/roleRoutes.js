export const roleRouteMap = {
  portal: {
    home: '/auth',
    landing: '/landing',
    login: (audience = 'enterprise', redirect = '') => ({
      path: '/auth',
      query: {
        audience,
        ...(redirect ? { redirect } : {})
      }
    }),
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
    messages: '/enterprise/chat',
    messageRoom: (roomKey = '', query = {}) => ({
      path: '/enterprise/chat/room',
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
    messages: '/talent/chat',
    messageRoom: (roomKey = '', query = {}) => ({
      path: '/talent/chat/room',
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

export function resolveUserEntryRoute(user) {
  if (!user) {
    return roleRouteMap.portal.home;
  }

  const audience = user.audience === 'talent' ? 'talent' : 'enterprise';
  if (user.approvalStatus === 'APPROVED') {
    return user.homeRoute || roleRouteMap[audience].home;
  }

  return user.onboardingRoute || roleRouteMap[audience].onboarding || roleRouteMap[audience].home;
}
