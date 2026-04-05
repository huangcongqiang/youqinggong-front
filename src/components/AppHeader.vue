<template>
  <header class="nav-shell">
    <div class="nav-inner">
      <router-link to="/" class="brand-lockup">
        <span class="brand-chip">{{ headerModel.chip }}</span>
        <div>
          <span class="brand-mark">有轻功</span>
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
        <div v-if="authState.user" class="nav-user-chip">
          <span class="nav-user-name">{{ authState.user.displayName }}</span>
          <span class="nav-user-meta">{{ authState.user.audience === 'talent' ? '人才端' : '企业端' }}</span>
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
const mobileTitle = computed(() => String(route.meta?.title || '有轻功'));

async function handleLogout() {
  await signOut();
  router.push('/');
}

function openLoginModal(audience = 'enterprise') {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      login: '1',
      audience
    },
    hash: route.hash
  });
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
        : { action: 'login', audience: 'enterprise', label: '登录企业端' },
      secondary: authUser
        ? { to: '/enterprise/publish', label: '发布任务' }
        : { to: roleRouteMap.portal.register('enterprise'), label: '去注册' }
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
        : { action: 'login', audience: 'talent', label: '登录人才端' },
      secondary: authUser
        ? { to: '/talent/tasks', label: '去找任务' }
        : { to: roleRouteMap.portal.register('talent'), label: '去注册' }
    };
  }

  return {
    chip: '官网',
    copy: '企业与 AI 人才的协作平台',
    links: [
      { to: '/', label: '首页' },
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
  background:
    linear-gradient(180deg, rgba(10, 14, 22, 0.94), rgba(8, 12, 20, 0.98)),
    radial-gradient(circle at top left, rgba(104, 138, 229, 0.05), transparent 38%);
  border: 1px solid rgba(176, 192, 221, 0.08);
  border-radius: 22px;
  backdrop-filter: blur(18px);
  box-shadow: 0 14px 30px rgba(2, 6, 14, 0.18);
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
  border: 1px solid rgba(176, 192, 221, 0.09);
  background: rgba(14, 20, 31, 0.94);
  color: rgba(214, 224, 238, 0.82);
  font-size: 10px;
  letter-spacing: 0.12em;
}

.brand-mark {
  display: block;
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--text-strong);
}

.brand-copy {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  color: rgba(153, 168, 189, 0.82);
  letter-spacing: 0.02em;
}

.brand-copy-mobile {
  display: none;
}

.nav-links a {
  padding: 9px 11px;
  border-radius: 999px;
  color: rgba(153, 168, 189, 0.9);
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.nav-links .router-link-exact-active,
.nav-links .router-link-active {
  background: rgba(88, 113, 180, 0.12);
  color: var(--text-strong);
  box-shadow: inset 0 0 0 1px rgba(141, 172, 255, 0.12);
}

.nav-links a:hover {
  transform: translateY(-1px);
  color: #d7e0ec;
}

.nav-links,
.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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
  border: 1px solid rgba(176, 192, 221, 0.1);
  background: rgba(11, 17, 28, 0.88);
}

.nav-user-name {
  color: var(--text-main);
  font-size: 12px;
  font-weight: 600;
}

.nav-user-meta {
  color: var(--text-faint);
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
    box-shadow: 0 12px 28px rgba(0, 4, 14, 0.18);
  }

  .brand-chip,
  .nav-links {
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
    color: rgba(171, 186, 209, 0.88);
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
