<template>
  <div class="workspace-shell" :class="`is-${audience}`">
    <header class="workspace-topbar">
      <div class="workspace-topbar__brand-rail">
        <router-link to="/" class="workspace-brand" aria-label="返回首页">
          <span class="workspace-brand__mark">YouQingGong</span>
          <span class="workspace-brand__divider"></span>
          <span class="workspace-brand__caption">{{ shellModel.brandCaption }}</span>
        </router-link>
      </div>

      <nav class="workspace-topnav" aria-label="工作台导航">
        <router-link
          v-for="item in shellModel.primary"
          :key="item.label"
          class="workspace-topnav__link"
          :class="{ 'is-active': isNavItemActive(item) }"
          :to="item.to"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <form class="workspace-search" @submit.prevent="handleSearchSubmit">
        <span class="workspace-search__icon">⌕</span>
        <input
          v-model.trim="searchTerm"
          type="search"
          :placeholder="shellModel.searchPlaceholder"
          aria-label="全局搜索"
        />
      </form>

      <div class="workspace-topbar__utility">
        <span v-if="workspaceScopeLabel" class="workspace-topbar__scope">{{ workspaceScopeLabel }}</span>
        <router-link class="workspace-topbar__text-link" :to="shellModel.helpLink.to">
          {{ shellModel.helpLink.label }}
        </router-link>
        <router-link class="workspace-topbar__text-link" :to="shellModel.notificationLink.to">
          {{ shellModel.notificationLink.label }}
        </router-link>
        <router-link class="workspace-topbar__assistant" :to="shellModel.assistantLink.to">
          AI 助手
        </router-link>
        <button class="workspace-topbar__avatar" type="button" @click="handleLogout">
          {{ userInitials }}
        </button>
      </div>
    </header>

    <section v-if="bannerModel && !usesImmersiveFlow" class="workspace-banner" :class="`is-${bannerModel.tone}`">
      <div class="workspace-banner__icon">!</div>
      <div class="workspace-banner__copy">
        <strong>{{ bannerModel.title }}</strong>
        <p>{{ bannerModel.body }}</p>
      </div>
      <router-link v-if="bannerModel.to" class="workspace-banner__action" :to="bannerModel.to">
        {{ bannerModel.actionLabel || '查看详情' }}
      </router-link>
    </section>

    <section v-if="!hidePageHero" class="workspace-hero">
      <div class="workspace-hero__copy">
        <span class="workspace-hero__eyebrow">{{ pageEyebrow }}</span>
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageDescription }}</p>
      </div>
      <div class="workspace-hero__actions">
        <router-link class="button-secondary workspace-hero__button workspace-hero__button--secondary" :to="shellModel.secondaryAction.to">
          {{ shellModel.secondaryAction.label }}
        </router-link>
        <router-link class="button-primary workspace-hero__button workspace-hero__button--primary" :to="shellModel.primaryAction.to">
          {{ shellModel.primaryAction.label }}
        </router-link>
      </div>
    </section>

    <main class="workspace-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { signOut, useAuthState } from '../stores/auth';
import { roleRouteMap, resolveAudience } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();

const audience = computed(() => resolveAudience(route));
const searchTerm = ref(typeof route.query.q === 'string' ? route.query.q : '');
const workspaceScopeLabel = computed(() => {
  if (!authState.user) {
    return '';
  }

  if (audience.value === 'enterprise') {
    return '当前为企业工作台';
  }

  if (audience.value === 'talent') {
    return '当前为人才工作台';
  }

  return '工作台入口';
});

watch(
  () => route.query.q,
  (value) => {
    searchTerm.value = typeof value === 'string' ? value : '';
  }
);

const shellModel = computed(() => {
  if (audience.value === 'talent') {
    return {
      brandCaption: '人才工作台',
      searchPlaceholder: '搜索任务、企业或技能',
      helpLink: { to: roleRouteMap.talent.records, label: '收入记录' },
      notificationLink: { to: roleRouteMap.talent.notifications, label: '通知' },
      assistantLink: { to: roleRouteMap.talent.assistant },
      primaryAction: { to: roleRouteMap.talent.market, label: '找任务' },
      secondaryAction: { to: roleRouteMap.talent.records, label: '合作记录' },
      primary: [
        { to: roleRouteMap.talent.home, label: '工作台' },
        { to: roleRouteMap.talent.market, label: '找任务' },
        { to: roleRouteMap.talent.messages, label: '消息' },
        { to: roleRouteMap.talent.records, label: '收入记录' }
      ]
    };
  }

  return {
    brandCaption: '企业工作台',
    searchPlaceholder: '搜索人才、技能或任务',
    helpLink: { to: roleRouteMap.enterprise.records, label: '合作记录' },
    notificationLink: { to: roleRouteMap.enterprise.notifications, label: '通知' },
    assistantLink: { to: roleRouteMap.enterprise.assistant },
    primaryAction: { to: roleRouteMap.enterprise.publish, label: '发布任务' },
    secondaryAction: { to: roleRouteMap.enterprise.market, label: '搜索人才' },
    primary: [
      { to: roleRouteMap.enterprise.home, label: '工作台' },
      { to: roleRouteMap.enterprise.market, label: '搜索人才' },
      { to: roleRouteMap.enterprise.messages, label: '消息' },
      { to: roleRouteMap.enterprise.records, label: '合作记录' }
    ]
  };
});

function resolveEnterprisePageMeta(path) {
  if (path.startsWith('/enterprise/onboarding')) {
    return {
      eyebrow: '设置',
      title: '完成企业设置',
      description: '先完成验证和账单权限，再开始招聘。'
    };
  }
  if (path.startsWith('/enterprise/publish')) {
    return {
      eyebrow: '发布任务',
      title: '写好任务需求',
      description: '先把范围、预算和筛选问题一次写完整。'
    };
  }
  if (path.startsWith('/enterprise/talents/')) {
    return {
      eyebrow: '人才档案',
      title: '查看人才档案',
      description: '发邀请前先看匹配度、证明和下一步。'
    };
  }
  if (path.startsWith('/enterprise/talents')) {
    return {
      eyebrow: '搜索人才',
      title: '寻找你需要的人才。',
      description: '寻找匹配的人才，完成您的需求。'
    };
  }
  if (path.startsWith('/enterprise/approvals')) {
    return {
      eyebrow: '审批',
      title: '处理待审批事项',
      description: '按优先级处理 shortlist、验收和合同跟进。'
    };
  }
  if (path.startsWith('/enterprise/notifications')) {
    return {
      eyebrow: '通知',
      title: '通知中心',
      description: '先看高优先级变化，再回到对应页面。'
    };
  }
  if (path.startsWith('/enterprise/chat')) {
    return {
      eyebrow: '消息',
      title: '带上下文的消息',
      description: '把聊天和合同上下文放在一起处理。'
    };
  }
  if (path.startsWith('/enterprise/workspace')) {
    return {
      eyebrow: '合同',
      title: '当前合作',
      description: '在一个合同视图里跟进进展、文件、验收、记录和助手。'
    };
  }
  if (path.startsWith('/enterprise/acceptance')) {
    return {
      eyebrow: '验收',
      title: '处理当前验收',
      description: '在一个地方完成验收、评级和结算衔接。'
    };
  }
  if (path.startsWith('/enterprise/records/') && path.endsWith('/settlement')) {
    return {
      eyebrow: '结算',
      title: '继续结算步骤',
      description: '在这里推进请款、发票、对账和结算。'
    };
  }
  if (path.startsWith('/enterprise/records/')) {
    return {
      eyebrow: '记录',
      title: '合作记录',
      description: '查看合同流、文件和结算摘要。'
    };
  }
  if (path.startsWith('/enterprise/records')) {
    return {
      eyebrow: '记录',
      title: '合作记录',
      description: '浏览合同、合作结果和结算摘要。'
    };
  }
  if (path.startsWith('/enterprise/contracts')) {
    return {
      eyebrow: '合同',
      title: '合同对象',
      description: '查看合同对象，需要时打开关联合同。'
    };
  }
  if (path.startsWith('/enterprise/reports')) {
    return {
      eyebrow: '报表',
      title: '交易报表',
      description: '在一个地方查看交易记录和合作结果。'
    };
  }
  if (path.startsWith('/enterprise/billing')) {
    return {
      eyebrow: '账单',
      title: '账单状态',
      description: '在一个地方查看就绪状态、限制和账单上下文。'
    };
  }
  if (path.startsWith('/enterprise/assistant')) {
    return {
      eyebrow: '助手',
      title: '上下文助手',
      description: '在当前流程里起草、检索和总结。'
    };
  }
  return {
    eyebrow: '企业工作台',
    title: '当前工作',
    description: '聚焦任务、合同、消息和支出。'
  };
}

function resolveTalentPageMeta(path) {
  if (path.startsWith('/talent/onboarding')) {
    return {
      eyebrow: '设置',
      title: '完成人才设置',
      description: '先完成档案和验证，再开始报名。'
    };
  }
  if (path.startsWith('/talent/tasks/') && path.endsWith('/apply')) {
    return {
      eyebrow: '报名',
      title: '完成当前申请',
      description: '写好申请内容、回答筛选问题，再提交。'
    };
  }
  if (path.startsWith('/talent/tasks/')) {
    return {
      eyebrow: '任务详情',
      title: '查看任务需求',
      description: '报名前先看需求、信任信号和下一步。'
    };
  }
  if (path.startsWith('/talent/tasks')) {
    return {
      eyebrow: '找任务',
      title: '浏览任务',
      description: '查看任务、比较匹配度并决定下一步。'
    };
  }
  if (path.startsWith('/talent/profile/')) {
    return {
      eyebrow: '档案',
      title: '查看个人档案',
      description: '检查企业会看到的档案、证明和信号。'
    };
  }
  if (path.startsWith('/talent/notifications')) {
    return {
      eyebrow: '通知',
      title: '通知中心',
      description: '先看高优先级变化，再回到对应页面。'
    };
  }
  if (path.startsWith('/talent/chat')) {
    return {
      eyebrow: '消息',
      title: '带上下文的消息',
      description: '把聊天和合同上下文放在一起处理。'
    };
  }
  if (path.startsWith('/talent/workspace')) {
    return {
      eyebrow: '合同',
      title: '当前合作',
      description: '在一个合同视图里跟进进展、文件、验收、记录和助手。'
    };
  }
  if (path.startsWith('/talent/acceptance')) {
    return {
      eyebrow: '验收',
      title: '处理当前验收',
      description: '在一个地方完成验收、评级和结算衔接。'
    };
  }
  if (path.startsWith('/talent/records/') && path.endsWith('/settlement')) {
    return {
      eyebrow: '结算',
      title: '继续结算步骤',
      description: '在这里推进请款、发票、对账和结算。'
    };
  }
  if (path.startsWith('/talent/records/')) {
    return {
      eyebrow: '记录',
      title: '合作记录',
      description: '查看合同流、文件和结算摘要。'
    };
  }
  if (path.startsWith('/talent/records')) {
    return {
      eyebrow: '记录与收入',
      title: '合作记录与收入',
      description: '查看合同、反馈、收入和结算摘要。'
    };
  }
  if (path.startsWith('/talent/assistant')) {
    return {
      eyebrow: '助手',
      title: '上下文助手',
      description: '在当前流程里起草、审阅和总结。'
    };
  }
  return {
    eyebrow: '人才工作台',
    title: '当前工作',
    description: '聚焦任务、消息和收入。'
  };
}

const pageMeta = computed(() => (
  audience.value === 'enterprise'
    ? resolveEnterprisePageMeta(route.path)
    : resolveTalentPageMeta(route.path)
));

const pageEyebrow = computed(() => pageMeta.value.eyebrow);
const pageTitle = computed(() => pageMeta.value.title);
const pageDescription = computed(() => pageMeta.value.description);
const usesImmersiveFlow = computed(() => (
  route.path.startsWith('/enterprise/onboarding')
  || route.path.startsWith('/talent/onboarding')
  || route.path.startsWith('/enterprise/publish')
));
const hidePageHero = computed(() => (
  usesImmersiveFlow.value
  || route.path.startsWith('/enterprise/workspace')
  || route.path.startsWith('/talent/workspace')
));

const userInitials = computed(() => {
  const name = String(authState.user?.displayName || 'YouQingGong').trim();
  return name.slice(0, 1).toUpperCase();
});

const bannerModel = computed(() => {
  const user = authState.user || {};
  const restriction = String(user.tradingRestrictionMessage || '').trim();
  if (restriction) {
    return {
      tone: 'warning',
      title: '先完成验证，再使用完整工作台。',
      body: restriction,
      to: audience.value === 'talent' ? roleRouteMap.talent.onboarding : roleRouteMap.enterprise.onboarding,
      actionLabel: '继续完成设置'
    };
  }

  if (audience.value === 'enterprise' && route.path.startsWith('/enterprise/publish')) {
    return {
      tone: 'note',
      title: '先把任务需求写完整，再继续下一步。',
      body: '把标题、范围、预算和筛选问题集中写在这份草稿里。'
    };
  }

  return null;
});

function isNavItemActive(item) {
  const target = typeof item?.to === 'string' ? item.to : item?.to?.path;
  if (!target) {
    return false;
  }
  return route.path === target || route.path.startsWith(`${target}/`);
}

function handleSearchSubmit() {
  const nextQuery = searchTerm.value ? { q: searchTerm.value } : {};
  router.push({
    path: audience.value === 'talent' ? roleRouteMap.talent.market : roleRouteMap.enterprise.market,
    query: nextQuery
  });
}

async function handleLogout() {
  await signOut();
  router.push('/');
}
</script>

<style scoped>
.workspace-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding: 26px 0 10px;
}

.workspace-hero__copy {
  display: grid;
  gap: 12px;
  max-width: 760px;
}

.workspace-hero__copy h1 {
  margin: 0;
  max-width: 11ch;
  font-size: clamp(34px, 4.8vw, 58px);
  line-height: 0.96;
  letter-spacing: -0.03em;
}

.workspace-hero__copy p {
  margin: 0;
  max-width: 58ch;
  color: #4a5b42;
}

.workspace-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.workspace-hero__button {
  min-height: 46px;
}

.workspace-hero__button--secondary {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  color: #2a5b2b;
  min-height: auto;
  padding-inline: 0;
}

.workspace-hero__button--secondary:hover {
  background: transparent;
  text-decoration: underline;
}

.workspace-banner {
  border-radius: 24px;
}

.workspace-content {
  padding-top: 10px;
}

@media (max-width: 900px) {
  .workspace-hero {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .workspace-hero__copy h1 {
    max-width: none;
  }
}
</style>

<style scoped>
.workspace-shell {
  width: min(1360px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 28px 0 72px;
}

.workspace-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(320px, 420px) auto;
  align-items: center;
  column-gap: 22px;
  min-height: 84px;
  padding: 18px 0;
  background: rgba(248, 248, 244, 0.92);
  backdrop-filter: blur(18px);
}

.workspace-topbar__brand-rail,
.workspace-topbar__utility {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.workspace-brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: #121212;
  white-space: nowrap;
}

.workspace-brand__mark {
  font-weight: 800;
  font-size: 28px;
  letter-spacing: -0.05em;
}

.workspace-brand__divider {
  width: 1px;
  height: 20px;
  background: rgba(18, 18, 18, 0.14);
}

.workspace-brand__caption {
  color: #5d5d56;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.workspace-topnav {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.workspace-topnav::-webkit-scrollbar {
  display: none;
}

.workspace-topnav__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  color: #45453f;
  font-weight: 700;
  white-space: nowrap;
}

.workspace-topnav__link:hover,
.workspace-topnav__link.is-active {
  background: #ffffff;
  color: #121212;
  box-shadow: 0 8px 18px rgba(20, 20, 20, 0.08);
}

.workspace-topbar__scope {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(31, 143, 58, 0.16);
  background: #f2fbf1;
  color: #1f6b35;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.workspace-search {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding: 0 18px;
  min-height: 48px;
  border: 1px solid rgba(18, 18, 18, 0.12);
  border-radius: 999px;
  background: #fffdf8;
}

.workspace-search__icon {
  color: #63635d;
  font-size: 16px;
}

.workspace-search input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: #121212;
}

.workspace-topbar__text-link {
  color: #4c4c46;
  font-weight: 600;
  white-space: nowrap;
}

.workspace-topbar__assistant {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  background: #1f8f3a;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 14px 28px rgba(31, 143, 58, 0.18);
  white-space: nowrap;
}

.workspace-topbar__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(18, 18, 18, 0.12);
  background: #ffffff;
  color: #121212;
  font-weight: 800;
}

.workspace-banner {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 22px;
  border-radius: 18px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  margin: 10px 0 24px;
}

.workspace-banner.is-warning {
  background: linear-gradient(135deg, rgba(238, 247, 236, 0.98), rgba(248, 251, 246, 0.98));
}

.workspace-banner.is-note {
  background: linear-gradient(135deg, rgba(240, 248, 239, 0.98), rgba(249, 251, 248, 0.98));
}

.workspace-banner__icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(18, 18, 18, 0.08);
  color: #3d5f41;
  font-weight: 800;
}

.workspace-banner__copy {
  display: grid;
  gap: 4px;
  flex: 1;
}

.workspace-banner__copy strong {
  color: #1f3422;
}

.workspace-banner__copy p {
  margin: 0;
  color: #506651;
  line-height: 1.6;
}

.workspace-banner__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(18, 18, 18, 0.88);
  color: #ffffff;
  font-weight: 700;
}

.workspace-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 32px 0 24px;
  border-bottom: 1px solid rgba(18, 18, 18, 0.08);
  margin-bottom: 28px;
}

.workspace-hero__copy {
  display: grid;
  gap: 14px;
  max-width: 780px;
}

.workspace-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6c6c65;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-hero h1 {
  margin: 0;
  color: #111111;
  font-size: clamp(42px, 5vw, 68px);
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.workspace-hero p {
  margin: 0;
  color: #595951;
  font-size: 17px;
  line-height: 1.75;
}

.workspace-hero__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.workspace-hero__button {
  min-width: 150px;
}

.workspace-shell.is-enterprise .workspace-hero,
.workspace-shell.is-talent .workspace-hero {
  flex-direction: column;
  align-items: flex-start;
}

.workspace-shell.is-enterprise .workspace-hero__actions,
.workspace-shell.is-talent .workspace-hero__actions {
  justify-content: flex-start;
  align-items: stretch;
}

.workspace-shell.is-enterprise .workspace-hero__button--primary,
.workspace-shell.is-enterprise .workspace-hero__button--secondary,
.workspace-shell.is-talent .workspace-hero__button--primary,
.workspace-shell.is-talent .workspace-hero__button--secondary {
  min-width: 172px;
  min-height: 52px;
  padding: 0 24px;
}

.workspace-shell.is-enterprise .workspace-hero__button--secondary,
.workspace-shell.is-talent .workspace-hero__button--secondary {
  border: 1px solid rgba(18, 18, 18, 0.12);
  background: #ffffff;
  color: #1f2e17;
}

.workspace-content {
  min-width: 0;
}

@media (max-width: 1180px) {
  .workspace-shell {
    width: min(100vw - 28px, 1360px);
    padding-top: 18px;
  }

  .workspace-topbar {
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      "brand utility utility"
      "nav nav nav"
      "search search search";
    row-gap: 14px;
  }

  .workspace-topbar__brand-rail { grid-area: brand; }
  .workspace-topnav { grid-area: nav; }
  .workspace-search { grid-area: search; }
  .workspace-topbar__utility {
    grid-area: utility;
    justify-self: end;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .workspace-search {
    max-width: none;
  }

  .workspace-hero {
    flex-direction: column;
    align-items: stretch;
  }

  .workspace-hero__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .workspace-brand__caption,
  .workspace-topbar__text-link,
  .workspace-topbar__scope {
    display: none;
  }

  .workspace-topbar {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      "brand utility"
      "search search"
      "nav nav";
    row-gap: 12px;
  }

  .workspace-hero h1 {
    font-size: 34px;
  }

  .workspace-hero__button {
    width: 100%;
  }
}
</style>
