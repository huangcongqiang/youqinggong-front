<template>
  <header class="nav-shell">
    <div class="nav-inner">
      <router-link to="/" class="brand-lockup">
        <span class="brand-chip">{{ headerModel.chip }}</span>
        <div>
          <span class="brand-mark">YouQingGong</span>
          <span class="brand-copy brand-copy-desktop">{{ headerModel.copy }}</span>
          <span class="brand-copy brand-copy-mobile">{{ mobileTitle }}</span>
        </div>
      </router-link>

      <nav class="nav-links">
        <component
          :is="item.href ? 'a' : 'router-link'"
          v-for="item in headerModel.links"
          :key="item.label"
          v-bind="item.href ? { href: item.href } : { to: item.to }"
        >
          {{ item.label }}
        </component>
      </nav>

      <div class="nav-actions">
        <span v-if="headerSurfaceLabel" class="nav-surface-chip">{{ headerSurfaceLabel }}</span>
        <div v-if="authState.user" class="nav-user-chip">
          <span class="nav-user-name">{{ authState.user.displayName }}</span>
          <span class="nav-user-meta">{{ authState.user.audience === 'talent' ? '人才账号' : '企业账号' }}</span>
        </div>
        <button
          v-if="headerModel.secondary?.action === 'login'"
          class="button-secondary nav-button"
          type="button"
          @click="openLoginModal(headerModel.secondary.audience)"
        >
          {{ headerModel.secondary.label }}
        </button>
        <router-link
          v-else-if="headerModel.secondary"
          class="button-secondary nav-button"
          :to="headerModel.secondary.to"
        >
          {{ headerModel.secondary.label }}
        </router-link>
        <button v-if="showLogout" class="button-secondary nav-button" type="button" @click="handleLogout">
          退出登录
        </button>
        <button
          v-if="headerModel.primary?.action === 'login'"
          class="button-primary nav-button"
          type="button"
          @click="openLoginModal(headerModel.primary.audience)"
        >
          {{ headerModel.primary.label }}
        </button>
        <router-link v-else class="button-primary nav-button" :to="headerModel.primary.to">
          {{ headerModel.primary.label }}
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { signOut, useAuthState } from '../stores/auth';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();
const showLogout = computed(() => Boolean(authState.user));
const isWorkspaceAudience = computed(() => ['enterprise', 'talent'].includes(resolveAudience(route)));
const headerSurfaceLabel = computed(() => {
  if (!authState.user) {
    return isWorkspaceAudience.value ? '工作台预览' : '公开站点';
  }

  if (isWorkspaceAudience.value) {
    return authState.user.audience === 'talent' ? '当前为人才工作台' : '当前为企业工作台';
  }

  return '工作台入口';
});
const mobileTitle = computed(() => String(route.meta?.title || '有轻功'));

async function handleLogout() {
  await signOut();
  router.push('/');
}

function openLoginModal(audience = 'enterprise') {
  const redirect = route.fullPath === '/' ? '' : route.fullPath;
  router.push(roleRouteMap.portal.login(audience, redirect));
}

const headerModel = computed(() => {
  const audience = resolveAudience(route);
  const authUser = authState.user;

  if (audience === 'enterprise') {
    return {
      chip: '企业工作台',
      copy: '任务、消息、合作记录',
      links: [
        { to: '/enterprise', label: '工作台' },
        { to: '/enterprise/publish', label: '发布任务' },
        { to: '/enterprise/talents', label: '搜索人才' },
        { to: '/enterprise/records', label: '合作记录' }
      ],
      primary: authUser
        ? { to: '/enterprise/chat', label: '消息' }
        : { action: 'login', audience: 'enterprise', label: '企业登录' },
      secondary: authUser
        ? { to: '/enterprise/reports', label: '交易记录' }
        : { to: roleRouteMap.portal.register('enterprise'), label: '企业注册' }
    };
  }

  if (audience === 'talent') {
    return {
      chip: '人才工作台',
      copy: '任务、消息、收入记录',
      links: [
        { to: '/talent', label: '工作台' },
        { to: '/talent/tasks', label: '找任务' },
        { to: '/talent/chat', label: '消息' },
        { to: '/talent/records', label: '收入记录' }
      ],
      primary: authUser
        ? { to: '/talent/chat', label: '消息' }
        : { action: 'login', audience: 'talent', label: '人才登录' },
      secondary: authUser
        ? { to: '/talent/workspace', label: '合同协作' }
        : { to: roleRouteMap.portal.register('talent'), label: '人才注册' }
    };
  }

  return {
    chip: '公开站点',
    copy: 'AI 协作人才市场',
    links: [
      { to: '/', label: '首页' },
      { href: '#features', label: '使用方式' },
      { href: '#cases', label: '合作案例' },
      { href: '#contact', label: '联系入口' }
    ],
    primary: authUser
      ? { to: authUser.homeRoute || (authUser.audience === 'talent' ? '/talent' : '/enterprise'), label: '进入工作台' }
      : { to: roleRouteMap.portal.register('enterprise'), label: '企业注册' },
    secondary: authUser ? null : { action: 'login', audience: 'talent', label: '人才登录' }
  };
});
</script>

<style scoped>
.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 12;
  padding: 14px 20px;
}

.nav-inner {
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 22px;
  backdrop-filter: blur(18px);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #eef6ee;
  color: #48604a;
  font-size: 10px;
  letter-spacing: 0.12em;
}

.brand-mark {
  display: block;
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: #17311d;
}

.brand-copy {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: #5e715f;
  letter-spacing: 0.02em;
}

.brand-copy-mobile {
  display: none;
}

.nav-links a {
  padding: 9px 11px;
  border-radius: 999px;
  color: #52524a;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.nav-links .router-link-exact-active,
.nav-links .router-link-active {
  background: #f0f7ef;
  color: #121212;
  box-shadow: inset 0 0 0 1px rgba(16, 138, 0, 0.12);
}

.nav-links a:hover {
  transform: translateY(-1px);
  color: #121212;
}

.nav-links,
.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-surface-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(31, 143, 58, 0.16);
  background: #f2fbf1;
  color: #1f6b35;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.nav-button {
  min-height: 38px;
  padding: 0 12px;
  font-size: 12px;
}

.nav-user-chip {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  padding: 7px 10px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #f7f7f3;
}

.nav-user-name {
  color: #121212;
  font-size: 12px;
  font-weight: 600;
}

.nav-user-meta {
  color: #6a6a61;
  font-size: 10px;
}

@media (max-width: 900px) {
  .nav-inner {
    flex-wrap: wrap;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: space-between;
  }

  .nav-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 640px) {
  .nav-shell {
    padding: 0 0 8px;
  }

  .nav-inner {
    gap: 10px;
    padding: 14px 16px 12px;
    border-radius: 0 0 24px 24px;
    border-left: none;
    border-right: none;
    border-top: none;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
  }

  .brand-chip,
  .nav-links {
    display: none;
  }

  .nav-surface-chip {
    display: none;
  }

  .brand-mark {
    font-size: 20px;
  }

  .brand-copy-desktop {
    display: none;
  }

  .brand-copy-mobile {
    display: block;
    margin-top: 3px;
    letter-spacing: 0.02em;
    color: #7a7a72;
  }

  .nav-actions {
    width: auto;
    justify-content: flex-end;
    margin-left: auto;
    gap: 8px;
  }

  .nav-user-chip {
    padding: 7px 10px;
    border-radius: 14px;
  }

  .nav-user-name {
    font-size: 12px;
  }

  .nav-user-meta {
    font-size: 10px;
  }

  .nav-button {
    min-height: 36px;
    padding: 0 10px;
    font-size: 12px;
  }

  .nav-actions .button-primary {
    display: none;
  }
}
</style>
