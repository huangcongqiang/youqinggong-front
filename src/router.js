import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './pages/HomePage.vue';
import BusinessPage from './pages/BusinessPage.vue';
import TalentPage from './pages/TalentPage.vue';
import WorkspacePage from './pages/WorkspacePage.vue';
import TaskMarketPage from './pages/TaskMarketPage.vue';
import TalentMarketPage from './pages/TalentMarketPage.vue';
import TalentDetailPage from './pages/TalentDetailPage.vue';
import OnboardingPage from './pages/OnboardingPage.vue';
import PublishTaskPage from './pages/PublishTaskPage.vue';
import MessagesPage from './pages/MessagesPage.vue';
import AcceptancePage from './pages/AcceptancePage.vue';

const routes = [
  { path: '/', component: HomePage, meta: { title: '官网首页', audience: 'portal' } },
  { path: '/enterprise', component: BusinessPage, meta: { title: '企业端工作台', audience: 'enterprise' } },
  { path: '/enterprise/onboarding', component: OnboardingPage, meta: { title: '企业入驻', audience: 'enterprise', onboardingMode: 'business' } },
  { path: '/enterprise/publish', component: PublishTaskPage, meta: { title: '发布任务', audience: 'enterprise' } },
  { path: '/enterprise/talents', component: TalentMarketPage, meta: { title: '人才广场', audience: 'enterprise' } },
  { path: '/enterprise/talents/:slug', component: TalentDetailPage, meta: { title: '人才详情', audience: 'enterprise' } },
  { path: '/enterprise/messages', component: MessagesPage, meta: { title: '项目沟通', audience: 'enterprise' } },
  { path: '/enterprise/workspace', component: WorkspacePage, meta: { title: '协作空间', audience: 'enterprise' } },
  { path: '/enterprise/acceptance', component: AcceptancePage, meta: { title: '验收评分', audience: 'enterprise' } },
  { path: '/talent', component: TalentPage, meta: { title: '人才端工作台', audience: 'talent' } },
  { path: '/talent/onboarding', component: OnboardingPage, meta: { title: '人才入驻', audience: 'talent', onboardingMode: 'talent' } },
  { path: '/talent/tasks', component: TaskMarketPage, meta: { title: '任务广场', audience: 'talent' } },
  { path: '/talent/profile/:slug', component: TalentDetailPage, meta: { title: '我的对外名片', audience: 'talent' } },
  { path: '/talent/messages', component: MessagesPage, meta: { title: '项目沟通', audience: 'talent' } },
  { path: '/talent/workspace', component: WorkspacePage, meta: { title: '协作空间', audience: 'talent' } },
  { path: '/talent/acceptance', component: AcceptancePage, meta: { title: '验收评分', audience: 'talent' } },
  { path: '/business', redirect: '/enterprise' },
  { path: '/onboarding', redirect: '/enterprise/onboarding' },
  { path: '/publish', redirect: '/enterprise/publish' },
  { path: '/talents', redirect: '/enterprise/talents' },
  { path: '/talents/:slug', redirect: (to) => `/enterprise/talents/${to.params.slug}` },
  { path: '/tasks', redirect: '/talent/tasks' },
  { path: '/messages', redirect: '/enterprise/messages' },
  { path: '/workspace', redirect: '/enterprise/workspace' },
  { path: '/acceptance', redirect: '/enterprise/acceptance' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

router.afterEach((to) => {
  document.title = `有轻工 | ${to.meta.title || 'AI 人才协作市场'}`;
});

export default router;
