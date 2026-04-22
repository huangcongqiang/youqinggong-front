export const roleRouteMap = {
  portal: {
    home: '/',
    login: (audience = 'enterprise', redirect = '') => ({
      path: '/auth',
      query: {
        audience,
        ...(redirect ? { redirect } : {})
      }
    }),
    enterpriseEntry: '/enterprise',
    talentEntry: '/talent',
    register: (audience = 'enterprise', redirect = '') => ({
      path: '/register',
      query: {
        audience,
        ...(redirect ? { redirect } : {})
      }
    })
  },
  enterprise: {
    home: '/enterprise',
    onboarding: '/enterprise/onboarding',
    publish: '/enterprise/publish',
    assistant: '/enterprise/assistant',
    contracts: '/enterprise/contracts',
    reports: '/enterprise/reports',
    billing: '/enterprise/billing',
    recruiting: '/enterprise/recruiting',
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
    talentDetail: (slug) => `/enterprise/talents/${slug}`,
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
    assistant: '/talent/assistant',
    market: '/talent/tasks',
    taskDetail: (taskId) => `/talent/tasks/${taskId}`,
    taskApply: (taskId) => `/talent/tasks/${taskId}/apply`,
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
