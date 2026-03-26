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
    messages: '/enterprise/chat',
    workspace: '/enterprise/workspace',
    acceptance: '/enterprise/acceptance'
  },
  talent: {
    home: '/talent',
    onboarding: '/talent/onboarding',
    market: '/talent/tasks',
    profile: (slug) => `/talent/profile/${slug}`,
    messages: '/talent/chat',
    workspace: '/talent/workspace',
    acceptance: '/talent/acceptance'
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
