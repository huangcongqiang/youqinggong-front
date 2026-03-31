<template>
  <header class="nav-shell">
    <div class="nav-inner" :class="{ 'is-portal': isPortalAudience, 'is-app': !isPortalAudience }">
      <router-link to="/" class="brand-lockup">
        <span v-if="isPortalAudience" class="brand-chip">{{ headerModel.chip }}</span>
        <div>
          <span class="brand-mark">有轻工</span>
          <span class="brand-copy brand-copy-desktop">{{ headerModel.copy }}</span>
          <span class="brand-copy brand-copy-mobile">{{ mobileSubtitle }}</span>
        </div>
      </router-link>

      <nav v-if="isPortalAudience" class="nav-links">
        <component
          :is="item.href ? 'a' : 'router-link'"
          v-for="item in headerModel.links"
          :key="item.label"
          v-bind="item.href ? { href: item.href } : { to: item.to }"
        >
          {{ item.label }}
        </component>
      </nav>

      <div class="nav-actions" :class="{ 'nav-actions-app': !isPortalAudience }">
        <div v-if="authState.user" class="nav-user-chip" :class="{ 'is-app': !isPortalAudience }">
          <span class="nav-user-name">{{ authState.user.displayName }}</span>
          <span v-if="isPortalAudience" class="nav-user-meta">{{ authState.user.audience === 'talent' ? '人才端' : '企业端' }}</span>
        </div>
        <button
          v-if="showAppGuestLogin"
          class="button-secondary nav-button nav-button-compact nav-button-app-login"
          type="button"
          @click="openLoginPage(headerModel.primary.audience)"
        >
          {{ headerModel.primary.label }}
        </button>
        <router-link
          v-else-if="!isPortalAudience && !authState.user && headerModel.secondary?.to"
          class="button-secondary nav-button nav-button-compact"
          :to="headerModel.secondary.to"
        >
          {{ headerModel.secondary.label }}
        </router-link>
        <button
          v-else-if="isPortalAudience && headerModel.secondary?.action === 'login'"
          class="button-secondary nav-button"
          type="button"
          @click="openLoginPage(headerModel.secondary.audience)"
        >
          {{ headerModel.secondary.label }}
        </button>
        <router-link
          v-else-if="isPortalAudience && headerModel.secondary"
          class="button-secondary nav-button"
          :to="headerModel.secondary.to"
        >
          {{ headerModel.secondary.label }}
        </router-link>
        <button
          v-if="showLogout"
          class="button-secondary nav-button nav-button-compact nav-button-logout"
          type="button"
          @click="handleLogout"
        >
          退出
        </button>
        <button
          v-if="isPortalAudience && headerModel.primary?.action === 'login'"
          class="button-primary nav-button"
          type="button"
          @click="openLoginPage(headerModel.primary.audience)"
        >
          {{ headerModel.primary.label }}
        </button>
        <router-link v-else-if="isPortalAudience" class="button-primary nav-button" :to="headerModel.primary.to">
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
const mobileTitle = computed(() => String(route.meta?.title || '有轻工'));
const isPortalAudience = computed(() => resolveAudience(route) === 'portal');
const showAppGuestLogin = computed(
  () => !isPortalAudience.value && authState.initialized && !authState.user && headerModel.value.primary?.action === 'login'
);
const mobileSubtitle = computed(() => {
  if (isPortalAudience.value) {
    return mobileTitle.value;
  }
  return '';
});

async function handleLogout() {
  await signOut();
  router.push('/');
}

function openLoginPage(audience = 'enterprise') {
  router.push(roleRouteMap.portal.login(audience));
}

const headerModel = computed(() => {
  const audience = resolveAudience(route);
  const authUser = authState.user;

  if (audience === 'enterprise') {
    return {
      chip: '企业端',
      copy: '发单、选人、推进交付',
      links: [
        { to: '/enterprise', label: '工作台' },
        { to: '/enterprise/chat', label: '聊天' },
        { to: '/enterprise/publish', label: '发布任务' },
        { to: '/enterprise/talents', label: '人才广场' }
      ],
      primary: authUser
        ? { to: '/enterprise/chat', label: '去聊天' }
        : { action: 'login', audience: 'enterprise', label: '登录' },
      secondary: authUser
        ? null
        : { to: roleRouteMap.portal.register('enterprise'), label: '注册' }
    };
  }

  if (audience === 'talent') {
    return {
      chip: '人才端',
      copy: '接单、协作、沉淀记录',
      links: [
        { to: '/talent', label: '工作台' },
        { to: '/talent/chat', label: '聊天' },
        { to: '/talent/tasks', label: '任务广场' },
        { to: '/talent/workspace', label: '协作空间' }
      ],
      primary: authUser
        ? { to: '/talent/chat', label: '去聊天' }
        : { action: 'login', audience: 'talent', label: '登录' },
      secondary: authUser
        ? null
        : { to: roleRouteMap.portal.register('talent'), label: '注册' }
    };
  }

  return {
    chip: '官网',
    copy: '企业与 AI 人才的协作平台',
    links: [
      { to: roleRouteMap.portal.landing, label: '平台页' },
      { href: '#features', label: '平台介绍' },
      { href: '#cases', label: '案例' },
      { href: '#contact', label: '联系方式' }
    ],
    primary: authUser
      ? { to: authUser.homeRoute || (authUser.audience === 'talent' ? '/talent' : '/enterprise'), label: '进入当前账号' }
      : { to: roleRouteMap.portal.register('enterprise'), label: '立即注册' },
    secondary: authUser ? null : { action: 'login', audience: 'enterprise', label: '登录' }
  };
});
</script>

<style scoped>
.nav-shell {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: calc(6px + env(safe-area-inset-top)) 10px 4px;
}

.nav-inner {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 7px;
  padding: 6px 8px;
  background:
    linear-gradient(180deg, rgba(9, 15, 28, 0.96), rgba(11, 19, 34, 0.99)),
    radial-gradient(circle at top right, rgba(96, 142, 255, 0.05), transparent 36%);
  border: 1px solid rgba(145, 171, 220, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 18px rgba(2, 8, 20, 0.18);
}

.nav-inner.is-app {
  padding: 5px 8px;
  border-radius: 14px;
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.brand-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(145, 171, 220, 0.12);
  background: rgba(20, 27, 42, 0.92);
  color: rgba(226, 235, 248, 0.88);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.brand-mark {
  display: block;
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-strong);
}

.brand-copy {
  display: block;
  margin-top: 1px;
  font-size: 8px;
  color: var(--text-soft);
  letter-spacing: 0.03em;
}

.brand-copy-mobile {
  display: none;
}

.nav-links a {
  padding: 6px 8px;
  border-radius: 999px;
  color: var(--text-soft);
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.nav-links .router-link-exact-active,
.nav-links .router-link-active {
  background: rgba(102, 135, 214, 0.12);
  color: var(--text-strong);
  box-shadow: inset 0 0 0 1px rgba(145, 171, 220, 0.16);
}

.nav-links a:hover {
  transform: translateY(-1px);
  color: var(--text-strong);
}

.nav-links,
.nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.nav-actions-app {
  gap: 6px;
}

.nav-button {
  min-height: 28px;
  padding: 0 8px;
  font-size: 10px;
}

.nav-user-chip {
  display: inline-flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px 7px;
  border-radius: 10px;
  background: rgba(7, 13, 24, 0.82);
  border: 1px solid rgba(145, 171, 220, 0.12);
}

.nav-user-chip.is-app {
  padding: 4px 7px;
}

.nav-user-name {
  color: var(--text-strong);
  font-size: 10px;
  font-weight: 700;
}

.nav-user-meta {
  color: var(--text-soft);
  font-size: 8px;
}

.nav-button-compact {
  min-width: 0;
}

.nav-button-app-login.button-secondary {
  background: rgba(6, 12, 24, 0.42);
  border-color: rgba(145, 171, 220, 0.08);
  color: var(--text-soft);
  box-shadow: none;
}

.nav-button-app-secondary,
.nav-button-logout {
  white-space: nowrap;
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
    padding: calc(6px + env(safe-area-inset-top)) 8px 0;
  }

  .nav-inner {
    gap: 6px;
    padding: 6px 8px;
    border-radius: 14px;
    box-shadow: 0 8px 16px rgba(2, 8, 20, 0.16);
  }

  .brand-chip,
  .nav-links {
    display: none;
  }

  .brand-mark {
    font-size: 16px;
  }

  .brand-copy-desktop {
    display: none;
  }

  .brand-copy-mobile {
    display: block;
    margin-top: 2px;
    letter-spacing: 0.02em;
    color: var(--text-soft);
  }

  .nav-actions {
    width: auto;
    justify-content: flex-end;
    margin-left: auto;
    gap: 4px;
  }

  .nav-user-chip {
    padding: 4px 7px;
    gap: 1px;
  }

  .nav-user-chip.is-app {
    padding: 4px 7px;
  }

  .nav-button {
    min-height: 28px;
    padding: 0 7px;
    font-size: 10px;
  }

  .nav-actions .button-primary {
    display: none;
  }

  .nav-button-app-secondary {
    display: none;
  }

  .nav-user-meta {
    display: none;
  }
}
</style>
