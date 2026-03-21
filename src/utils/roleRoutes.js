export const roleRouteMap = {
  portal: {
    home: '/',
    enterpriseEntry: '/enterprise',
    talentEntry: '/talent'
  },
  enterprise: {
    home: '/enterprise',
    onboarding: '/enterprise/onboarding',
    publish: '/enterprise/publish',
    market: '/enterprise/talents',
    detail: (slug) => `/enterprise/talents/${slug}`,
    messages: '/enterprise/messages',
    workspace: '/enterprise/workspace',
    acceptance: '/enterprise/acceptance'
  },
  talent: {
    home: '/talent',
    onboarding: '/talent/onboarding',
    market: '/talent/tasks',
    profile: (slug) => `/talent/profile/${slug}`,
    messages: '/talent/messages',
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
