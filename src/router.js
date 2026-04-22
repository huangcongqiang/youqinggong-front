import { createRouter, createWebHistory } from 'vue-router';
import { getStoredAuthUser, hasFreshStoredAuthSession } from './services/api';
import { resolveAudience, roleRouteMap } from './utils/roleRoutes';
import { localizePageTitle } from './utils/uiLocale.js';

const HomePage = () => import('./pages/HomePage.vue');
const AuthPage = () => import('./pages/AuthPage.vue');
const BusinessPage = () => import('./pages/BusinessPage.vue');
const TalentPage = () => import('./pages/TalentPage.vue');
const WorkspacePage = () => import('./pages/WorkspacePage.vue');
const TaskMarketPage = () => import('./pages/TaskMarketPage.vue');
const TaskDetailPage = () => import('./pages/TaskDetailPage.vue');
const TaskApplyPage = () => import('./pages/TaskApplyPage.vue');
const TalentMarketPage = () => import('./pages/TalentMarketPage.vue');
const RecruitingPage = () => import('./pages/RecruitingPage.vue');
const TalentDetailPage = () => import('./pages/TalentDetailPage.vue');
const OnboardingPage = () => import('./pages/OnboardingPage.vue');
const PublishTaskPage = () => import('./pages/PublishTaskPage.vue');
const MessagesPage = () => import('./pages/MessagesPage.vue');
const AcceptancePage = () => import('./pages/AcceptancePage.vue');
const RegisterPage = () => import('./pages/RegisterPage.vue');
const RecordPage = () => import('./pages/RecordPage.vue');
const RecordDetailPage = () => import('./pages/RecordDetailPage.vue');
const SettlementPage = () => import('./pages/SettlementPage.vue');
const NotificationCenterPage = () => import('./pages/NotificationCenterPage.vue');
const ApprovalCenterPage = () => import('./pages/ApprovalCenterPage.vue');
const AssistantPage = () => import('./pages/AssistantPage.vue');
const ClientOperationsPage = () => import('./pages/ClientOperationsPage.vue');

function redirectWithQuery(target) {
  return (to) => {
    const path = typeof target === 'function' ? target(to) : target;
    return {
      path,
      query: to.query,
      hash: to.hash
    };
  };
}

function redirectByAudience(enterprisePath, talentPath) {
  return redirectWithQuery(() => (getStoredAuthUser()?.audience === 'talent' ? talentPath : enterprisePath));
}

const routes = [
  { path: '/', component: HomePage, meta: { title: '官网首页', audience: 'portal' } },
  { path: '/auth', component: AuthPage, meta: { title: '账号登录', audience: 'portal' } },
  { path: '/register', component: RegisterPage, meta: { title: '账号注册', audience: 'portal' } },
  { path: '/enterprise', component: BusinessPage, meta: { title: '企业工作台', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/onboarding', component: OnboardingPage, meta: { title: '企业入驻', audience: 'enterprise', onboardingMode: 'business', requiresAuth: true } },
  { path: '/enterprise/publish', component: PublishTaskPage, meta: { title: '发布任务', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/talents', component: TalentMarketPage, meta: { title: '搜索人才', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/recruiting', component: RecruitingPage, meta: { title: '招聘申请处理', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/talents/:slug', component: TalentDetailPage, meta: { title: '人才详情', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/approvals', component: ApprovalCenterPage, meta: { title: '审批中心', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/notifications', component: NotificationCenterPage, meta: { title: '通知中心', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/chat', component: MessagesPage, meta: { title: '消息', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/messages', redirect: redirectWithQuery('/enterprise/chat') },
  { path: '/enterprise/workspace', component: WorkspacePage, meta: { title: '合同协作', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/acceptance', component: AcceptancePage, meta: { title: '验收', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/records', component: RecordPage, meta: { title: '申请与合作记录', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/contracts', component: ClientOperationsPage, meta: { title: '合同管理', audience: 'enterprise', requiresAuth: true, clientOperationsMode: 'contracts' } },
  { path: '/enterprise/reports', component: ClientOperationsPage, meta: { title: '交易核对', audience: 'enterprise', requiresAuth: true, clientOperationsMode: 'reports' } },
  { path: '/enterprise/billing', component: ClientOperationsPage, meta: { title: '账单管理', audience: 'enterprise', requiresAuth: true, clientOperationsMode: 'billing' } },
  { path: '/enterprise/records/:recordId/settlement', component: SettlementPage, meta: { title: '结算', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/records/:recordId', component: RecordDetailPage, meta: { title: '申请与合作记录', audience: 'enterprise', requiresAuth: true } },
  { path: '/enterprise/assistant', component: AssistantPage, meta: { title: 'AI 助手', audience: 'enterprise', requiresAuth: true } },
  { path: '/talent', component: TalentPage, meta: { title: '人才工作台', audience: 'talent', requiresAuth: true } },
  { path: '/talent/onboarding', component: OnboardingPage, meta: { title: '人才入驻', audience: 'talent', onboardingMode: 'talent', requiresAuth: true } },
  { path: '/talent/tasks', component: TaskMarketPage, meta: { title: '任务广场', audience: 'talent', requiresAuth: true } },
  { path: '/talent/tasks/:taskId', component: TaskDetailPage, meta: { title: '任务详情', audience: 'talent', requiresAuth: true } },
  { path: '/talent/tasks/:taskId/apply', component: TaskApplyPage, meta: { title: '提交报名', audience: 'talent', requiresAuth: true } },
  { path: '/talent/profile/:slug', component: TalentDetailPage, meta: { title: '个人档案', audience: 'talent', requiresAuth: true } },
  { path: '/talent/notifications', component: NotificationCenterPage, meta: { title: '通知中心', audience: 'talent', requiresAuth: true } },
  { path: '/talent/chat', component: MessagesPage, meta: { title: '消息', audience: 'talent', requiresAuth: true } },
  { path: '/talent/messages', redirect: redirectWithQuery('/talent/chat') },
  { path: '/talent/workspace', component: WorkspacePage, meta: { title: '合同协作', audience: 'talent', requiresAuth: true } },
  { path: '/talent/acceptance', component: AcceptancePage, meta: { title: '验收', audience: 'talent', requiresAuth: true } },
  { path: '/talent/records', component: RecordPage, meta: { title: '申请、面试与收入记录', audience: 'talent', requiresAuth: true } },
  { path: '/talent/records/:recordId/settlement', component: SettlementPage, meta: { title: '结算', audience: 'talent', requiresAuth: true } },
  { path: '/talent/records/:recordId', component: RecordDetailPage, meta: { title: '申请与合作记录', audience: 'talent', requiresAuth: true } },
  { path: '/talent/assistant', component: AssistantPage, meta: { title: 'AI 助手', audience: 'talent', requiresAuth: true } },
  { path: '/business', redirect: redirectWithQuery('/enterprise') },
  { path: '/onboarding', redirect: redirectWithQuery('/enterprise/onboarding') },
  { path: '/publish', redirect: redirectWithQuery('/enterprise/publish') },
  { path: '/talents', redirect: redirectWithQuery('/enterprise/talents') },
  { path: '/talents/:slug', redirect: redirectWithQuery((to) => `/enterprise/talents/${encodeURIComponent(String(to.params.slug || ''))}`) },
  { path: '/tasks', redirect: redirectWithQuery('/talent/tasks') },
  { path: '/messages', redirect: redirectByAudience('/enterprise/chat', '/talent/chat') },
  { path: '/chat', redirect: redirectByAudience('/enterprise/chat', '/talent/chat') },
  {
    path: '/notifications',
    redirect: redirectWithQuery(() => (getStoredAuthUser()?.audience === 'talent' ? '/talent/notifications' : '/enterprise/notifications'))
  },
  {
    path: '/approvals',
    redirect: redirectWithQuery(() => (getStoredAuthUser()?.audience === 'talent' ? '/talent/notifications' : '/enterprise/approvals'))
  },
  {
    path: '/assistant',
    redirect: redirectWithQuery(() => (getStoredAuthUser()?.audience === 'talent' ? '/talent/assistant' : '/enterprise/assistant'))
  },
  { path: '/contracts', redirect: redirectWithQuery('/enterprise/contracts') },
  { path: '/reports', redirect: redirectWithQuery('/enterprise/reports') },
  { path: '/billing', redirect: redirectWithQuery('/enterprise/billing') },
  { path: '/workspace', redirect: redirectByAudience('/enterprise/workspace', '/talent/workspace') },
  { path: '/acceptance', redirect: redirectByAudience('/enterprise/acceptance', '/talent/acceptance') },
  {
    path: '/records',
    redirect: redirectWithQuery(() => (getStoredAuthUser()?.audience === 'talent' ? '/talent/records' : '/enterprise/records'))
  },
  {
    path: '/records/:recordId',
    redirect: redirectWithQuery((to) => {
      const base = getStoredAuthUser()?.audience === 'talent' ? '/talent/records' : '/enterprise/records';
      return `${base}/${encodeURIComponent(String(to.params.recordId || ''))}`;
    })
  },
  {
    path: '/records/:recordId/settlement',
    redirect: redirectWithQuery((to) => {
      const base = getStoredAuthUser()?.audience === 'talent' ? '/talent/records' : '/enterprise/records';
      return `${base}/${encodeURIComponent(String(to.params.recordId || ''))}/settlement`;
    })
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
    return roleRouteMap.portal.login(resolveAudience(to), to.fullPath);
  }

  const user = getStoredAuthUser();
  const targetAudience = resolveAudience(to);
  if (user?.audience && targetAudience !== 'portal' && user.audience !== targetAudience) {
    return user.audience === 'talent' ? '/talent' : '/enterprise';
  }

  return true;
});

router.afterEach((to) => {
  document.title = localizePageTitle(to.meta.title || 'AI 人才协作市场');
});

export default router;
