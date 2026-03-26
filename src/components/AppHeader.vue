<template>
  <header class="nav-shell">
    <div class="nav-inner">
      <router-link to="/" class="brand-lockup">
        <span class="brand-chip">{{ headerModel.chip }}</span>
        <div>
          <span class="brand-mark">有轻工</span>
          <span class="brand-copy">{{ headerModel.copy }}</span>
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
      chip: 'Enterprise Side',
      copy: '企业端：发布需求、查看人才、推进协作与验收',
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
      chip: 'Talent Side',
      copy: '人才端：完善资料、查看任务、持续协作与沉淀信用',
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
    chip: 'Official Site',
    copy: 'AI 驱动的人才协作平台，先选入口，再进入对应业务端',
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
  padding: 16px 20px;
}

.nav-inner {
  max-width: 1240px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 14px 18px;
  background:
    linear-gradient(180deg, rgba(8, 17, 34, 0.9), rgba(8, 15, 30, 0.94)),
    radial-gradient(circle at top left, rgba(64, 112, 255, 0.18), transparent 36%);
  border: 1px solid rgba(114, 154, 255, 0.16);
  border-radius: 26px;
  backdrop-filter: blur(22px);
  box-shadow: 0 20px 48px rgba(2, 7, 19, 0.44);
}

.brand-lockup {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(126, 157, 255, 0.18);
  background: rgba(13, 27, 54, 0.9);
  color: rgba(184, 204, 255, 0.9);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.brand-mark {
  display: block;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #f5f8ff;
}

.brand-copy {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-faint);
  letter-spacing: 0.06em;
}

.nav-links,
.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-links a {
  padding: 10px 12px;
  border-radius: 12px;
  color: var(--text-faint);
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.nav-links .router-link-exact-active,
.nav-links .router-link-active {
  background: linear-gradient(180deg, rgba(30, 54, 108, 0.88), rgba(17, 33, 67, 0.88));
  color: var(--text-main);
  box-shadow: inset 0 0 0 1px rgba(93, 141, 255, 0.14);
}

.nav-links a:hover {
  transform: translateY(-1px);
  color: var(--text-main);
}

.nav-button {
  min-height: 40px;
  padding: 0 14px;
  font-size: 14px;
}

.nav-user-chip {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 16px;
  border: 1px solid rgba(126, 157, 255, 0.16);
  background: rgba(11, 24, 49, 0.86);
}

.nav-user-name {
  color: var(--text-main);
  font-size: 13px;
  font-weight: 600;
}

.nav-user-meta {
  color: var(--text-faint);
  font-size: 11px;
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
    padding: 12px;
  }

  .nav-inner {
    padding: 12px 14px;
  }

  .brand-chip,
  .nav-links {
    display: none;
  }

  .nav-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
