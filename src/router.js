import { createRouter, createWebHistory } from 'vue-router';
import { getStoredAuthUser, hasFreshStoredAuthSession } from './services/api';
import { resolveAudience, resolveUserEntryRoute } from './utils/roleRoutes';

const HomePage = () => import('./pages/HomePage.vue');
const AuthPage = () => import('./pages/AuthPage.vue');
const BusinessPage = () => import('./pages/BusinessPage.vue');
const TalentPage = () => import('./pages/TalentPage.vue');
const WorkspacePage = () => import('./pages/WorkspacePage.vue');
const TaskMarketPage = () => import('./pages/TaskMarketPage.vue');
const TalentMarketPage = () => import('./pages/TalentMarketPage.vue');
const TalentDetailPage = () => import('./pages/TalentDetailPage.vue');
const OnboardingPage = () => import('./pages/OnboardingPage.vue');
const PublishTaskPage = () => import('./pages/PublishTaskPage.vue');
const ChatInboxPage = () => import('./pages/ChatInboxPage.vue');
const MessagesPage = () => import('./pages/MessagesPage.vue');
const AcceptancePage = () => import('./pages/AcceptancePage.vue');
const RegisterPage = () => import('./pages/RegisterPage.vue');
const RecordPage = () => import('./pages/RecordPage.vue');
const RecordDetailPage = () => import('./pages/RecordDetailPage.vue');

function resolveDefaultEntry() {
  const user = getStoredAuthUser();
  if (!hasFreshStoredAuthSession() || !user) {
    return '/auth';
  }
  return resolveUserEntryRoute(user);
}

const routes = [
  { path: '/', redirect: () => resolveDefaultEntry() },
  { path: '/landing', component: HomePage, meta: { title: '平台介绍', audience: 'portal', hideHeader: true, hideDock: true } },
  {
    path: '/auth',
    component: AuthPage,
    meta: { title: '账号登录', audience: 'portal', hideHeader: true, hideDock: true, layout: 'auth' }
  },
  { path: '/register', component: RegisterPage, meta: { title: '账号注册', audience: 'portal', hideHeader: true, hideDock: true, layout: 'auth' } },
  { path: '/enterprise', component: BusinessPage, meta: { title: '企业端工作台', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/onboarding', component: OnboardingPage, meta: { title: '企业入驻', audience: 'enterprise', onboardingMode: 'business', requiresAuth: true } },
  { path: '/enterprise/publish', component: PublishTaskPage, meta: { title: '发布任务', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/talents', component: TalentMarketPage, meta: { title: '人才广场', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/talents/:slug', component: TalentDetailPage, meta: { title: '人才详情', audience: 'enterprise', requiresAuth: true } },
  {
    path: '/enterprise/chat',
    component: ChatInboxPage,
    meta: { title: '聊天列表', audience: 'enterprise', requiresAuth: true },
    beforeEnter: (to) => {
      const roomKey = typeof to.query.room === 'string' ? to.query.room.trim() : '';
      if (roomKey) {
        return { path: '/enterprise/chat/room', query: to.query };
      }
      return true;
    }
  },
  { path: '/enterprise/chat/room', component: MessagesPage, meta: { title: '聊天详情', audience: 'enterprise', requiresAuth: true } },
  {
    path: '/enterprise/messages',
    redirect: (to) => ({
      path: typeof to.query.room === 'string' && to.query.room.trim() ? '/enterprise/chat/room' : '/enterprise/chat',
      query: to.query
    })
  },
  { path: '/enterprise/workspace', component: WorkspacePage, meta: { title: '协作空间', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/acceptance', component: AcceptancePage, meta: { title: '验收评分', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/records', component: RecordPage, meta: { title: '发单记录', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/records/:recordId', component: RecordDetailPage, meta: { title: '发单记录详情', audience: 'enterprise', requiresAuth: true } },
  { path: '/talent', component: TalentPage, meta: { title: '人才端工作台', audience: 'talent', requiresAuth: true } },
  { path: '/talent/onboarding', component: OnboardingPage, meta: { title: '人才入驻', audience: 'talent', onboardingMode: 'talent', requiresAuth: true } },
  { path: '/talent/tasks', component: TaskMarketPage, meta: { title: '任务广场', audience: 'talent', requiresAuth: true } },
  { path: '/talent/profile/:slug', component: TalentDetailPage, meta: { title: '我的对外名片', audience: 'talent', requiresAuth: true } },
  {
    path: '/talent/chat',
    component: ChatInboxPage,
    meta: { title: '聊天列表', audience: 'talent', requiresAuth: true },
    beforeEnter: (to) => {
      const roomKey = typeof to.query.room === 'string' ? to.query.room.trim() : '';
      if (roomKey) {
        return { path: '/talent/chat/room', query: to.query };
      }
      return true;
    }
  },
  { path: '/talent/chat/room', component: MessagesPage, meta: { title: '聊天详情', audience: 'talent', requiresAuth: true } },
  {
    path: '/talent/messages',
    redirect: (to) => ({
      path: typeof to.query.room === 'string' && to.query.room.trim() ? '/talent/chat/room' : '/talent/chat',
      query: to.query
    })
  },
  { path: '/talent/workspace', component: WorkspacePage, meta: { title: '协作空间', audience: 'talent', requiresAuth: true } },
  { path: '/talent/acceptance', component: AcceptancePage, meta: { title: '验收评分', audience: 'talent', requiresAuth: true } },
  { path: '/talent/records', component: RecordPage, meta: { title: '接单记录', audience: 'talent', requiresAuth: true } },
  { path: '/talent/records/:recordId', component: RecordDetailPage, meta: { title: '接单记录详情', audience: 'talent', requiresAuth: true } },
  { path: '/business', redirect: '/enterprise' },
  { path: '/onboarding', redirect: '/enterprise/onboarding' },
  { path: '/publish', redirect: '/enterprise/publish' },
  { path: '/talents', redirect: '/enterprise/talents' },
  { path: '/talents/:slug', redirect: (to) => `/enterprise/talents/${to.params.slug}` },
  { path: '/tasks', redirect: '/talent/tasks' },
  { path: '/messages', redirect: '/enterprise/chat' },
  { path: '/chat', redirect: '/enterprise/chat' },
  { path: '/workspace', redirect: '/enterprise/workspace' },
  { path: '/acceptance', redirect: '/enterprise/acceptance' },
  {
    path: '/records',
    redirect: () => (getStoredAuthUser()?.audience === 'talent' ? '/talent/records' : '/enterprise/records')
  },
  {
    path: '/records/:recordId',
    redirect: (to) => {
      const base = getStoredAuthUser()?.audience === 'talent' ? '/talent/records' : '/enterprise/records';
      return `${base}/${to.params.recordId}`;
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    if (to.path === from.path) {
      return false;
    }
    return { top: 0 };
  }
});

router.beforeEach((to) => {
  if (!to.meta?.requiresAuth) {
    return true;
  }

  if (!hasFreshStoredAuthSession()) {
    return {
      path: '/auth',
      query: {
        audience: resolveAudience(to),
        redirect: to.fullPath
      }
    };
  }

  const user = getStoredAuthUser();
  const targetAudience = resolveAudience(to);
  if (user?.audience && targetAudience !== 'portal' && user.audience !== targetAudience) {
    return resolveUserEntryRoute(user);
  }

  return true;
});

router.afterEach((to) => {
  document.title = `有轻工 | ${to.meta.title || 'AI 人才协作市场'}`;
});

export default router;
