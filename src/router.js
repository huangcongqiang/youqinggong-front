import { createRouter, createWebHistory } from 'vue-router';
import { getStoredAuthUser, hasFreshStoredAuthSession } from './services/api';
import { resolveAudience } from './utils/roleRoutes';

const HomePage = () => import('./pages/HomePage.vue');
const BusinessPage = () => import('./pages/BusinessPage.vue');
const TalentPage = () => import('./pages/TalentPage.vue');
const WorkspacePage = () => import('./pages/WorkspacePage.vue');
const TaskMarketPage = () => import('./pages/TaskMarketPage.vue');
const TalentMarketPage = () => import('./pages/TalentMarketPage.vue');
const TalentDetailPage = () => import('./pages/TalentDetailPage.vue');
const OnboardingPage = () => import('./pages/OnboardingPage.vue');
const PublishTaskPage = () => import('./pages/PublishTaskPage.vue');
const MessagesPage = () => import('./pages/MessagesPage.vue');
const AcceptancePage = () => import('./pages/AcceptancePage.vue');
const RegisterPage = () => import('./pages/RegisterPage.vue');

const routes = [
  { path: '/', component: HomePage, meta: { title: '官网首页', audience: 'portal' } },
  {
    path: '/auth',
    redirect: (to) => ({
      path: '/',
      query: {
        ...to.query,
        login: '1'
      }
    }),
    meta: { title: '账号登录', audience: 'portal' }
  },
  { path: '/register', component: RegisterPage, meta: { title: '账号注册', audience: 'portal' } },
  { path: '/enterprise', component: BusinessPage, meta: { title: '企业端工作台', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/onboarding', component: OnboardingPage, meta: { title: '企业入驻', audience: 'enterprise', onboardingMode: 'business', requiresAuth: true } },
  { path: '/enterprise/publish', component: PublishTaskPage, meta: { title: '发布任务', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/talents', component: TalentMarketPage, meta: { title: '人才广场', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/talents/:slug', component: TalentDetailPage, meta: { title: '人才详情', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/chat', component: MessagesPage, meta: { title: '聊天', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/messages', redirect: (to) => ({ path: '/enterprise/chat', query: to.query }) },
  { path: '/enterprise/workspace', component: WorkspacePage, meta: { title: '协作空间', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/acceptance', component: AcceptancePage, meta: { title: '验收评分', audience: 'enterprise', requiresAuth: true } },
  { path: '/talent', component: TalentPage, meta: { title: '人才端工作台', audience: 'talent', requiresAuth: true } },
  { path: '/talent/onboarding', component: OnboardingPage, meta: { title: '人才入驻', audience: 'talent', onboardingMode: 'talent', requiresAuth: true } },
  { path: '/talent/tasks', component: TaskMarketPage, meta: { title: '任务广场', audience: 'talent', requiresAuth: true } },
  { path: '/talent/profile/:slug', component: TalentDetailPage, meta: { title: '我的对外名片', audience: 'talent', requiresAuth: true } },
  { path: '/talent/chat', component: MessagesPage, meta: { title: '聊天', audience: 'talent', requiresAuth: true } },
  { path: '/talent/messages', redirect: (to) => ({ path: '/talent/chat', query: to.query }) },
  { path: '/talent/workspace', component: WorkspacePage, meta: { title: '协作空间', audience: 'talent', requiresAuth: true } },
  { path: '/talent/acceptance', component: AcceptancePage, meta: { title: '验收评分', audience: 'talent', requiresAuth: true } },
  { path: '/business', redirect: '/enterprise' },
  { path: '/onboarding', redirect: '/enterprise/onboarding' },
  { path: '/publish', redirect: '/enterprise/publish' },
  { path: '/talents', redirect: '/enterprise/talents' },
  { path: '/talents/:slug', redirect: (to) => `/enterprise/talents/${to.params.slug}` },
  { path: '/tasks', redirect: '/talent/tasks' },
  { path: '/messages', redirect: '/enterprise/chat' },
  { path: '/chat', redirect: '/enterprise/chat' },
  { path: '/workspace', redirect: '/enterprise/workspace' },
  { path: '/acceptance', redirect: '/enterprise/acceptance' }
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
      path: '/',
      query: {
        login: '1',
        audience: resolveAudience(to),
        redirect: to.fullPath
      }
    };
  }

  const user = getStoredAuthUser();
  const targetAudience = resolveAudience(to);
  if (user?.audience && targetAudience !== 'portal' && user.audience !== targetAudience) {
    return user.audience === 'talent' ? '/talent' : '/enterprise';
  }

  return true;
});

router.afterEach((to) => {
  document.title = `有轻工 | ${to.meta.title || 'AI 人才协作市场'}`;
});

export default router;
