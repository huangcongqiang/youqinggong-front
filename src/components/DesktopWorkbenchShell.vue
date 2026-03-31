<template>
  <div class="desktop-shell">
    <aside class="desktop-rail">
      <router-link to="/" class="desktop-brand">
        <span class="desktop-brand-chip">{{ shellModel.brandChip }}</span>
        <strong>有轻工</strong>
        <span>{{ shellModel.brandCopy }}</span>
      </router-link>

      <section class="desktop-rail-section">
        <span class="desktop-section-label">主导航</span>
        <nav class="desktop-nav">
          <router-link
            v-for="item in shellModel.primary"
            :key="item.label"
            class="desktop-nav-item"
            :to="item.to"
          >
            <span class="desktop-nav-title">{{ item.label }}</span>
            <span class="desktop-nav-note">{{ item.note }}</span>
          </router-link>
        </nav>
      </section>

      <section class="desktop-rail-section">
        <span class="desktop-section-label">今日焦点</span>
        <div class="desktop-rail-focus">
          <strong>{{ shellModel.focus.title }}</strong>
          <p>{{ shellModel.focus.copy }}</p>
        </div>
      </section>

      <div class="desktop-rail-actions">
        <router-link class="button-primary desktop-rail-button" :to="shellModel.primaryAction.to">
          {{ shellModel.primaryAction.label }}
        </router-link>
        <router-link class="button-secondary desktop-rail-button" :to="shellModel.secondaryAction.to">
          {{ shellModel.secondaryAction.label }}
        </router-link>
      </div>
    </aside>

    <section class="desktop-main">
      <header class="desktop-topbar">
        <div class="desktop-topbar-heading stack-xs">
          <span class="eyebrow">{{ shellModel.topbarEyebrow }}</span>
          <h1 class="desktop-topbar-title">{{ pageTitle }}</h1>
        </div>

        <div class="desktop-topbar-side">
          <div class="desktop-topbar-status">
            <span class="soft-pill">{{ shellModel.status }}</span>
          </div>
          <span class="desktop-topbar-meta">{{ userMeta }}</span>
          <router-link class="button-secondary" :to="shellModel.topbarAction.to">
            {{ shellModel.topbarAction.label }}
          </router-link>
          <button class="button-secondary" type="button" @click="handleLogout">退出登录</button>
        </div>
      </header>

      <main class="desktop-main-scroll">
        <slot />
      </main>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { signOut, useAuthState } from '../stores/auth';
import { roleRouteMap, resolveAudience } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();

const audience = computed(() => resolveAudience(route));
const pageTitle = computed(() => String(route.meta?.title || (audience.value === 'talent' ? '人才端工作区' : '企业端工作区')));
const userMeta = computed(() => {
  const user = authState.user;
  if (!user) {
    return '未登录';
  }
  return `${user.displayName} · ${user.audience === 'talent' ? '人才端' : '企业端'}`;
});

const shellModel = computed(() => {
  if (audience.value === 'talent') {
    return {
      brandChip: 'Talent Desk',
      brandCopy: '确认 · 交付',
      topbarEyebrow: '人才端工作区',
      topbarCopy: '先清待确认，再执行。',
      status: '待确认优先',
      focus: {
        title: '先清待确认',
        copy: '确认后再进入执行。'
      },
      topbarAction: { to: roleRouteMap.talent.notifications, label: '通知中心' },
      primaryAction: { to: roleRouteMap.talent.messages, label: '去聊天' },
      secondaryAction: { to: roleRouteMap.talent.market, label: '找任务' },
      primary: [
        { to: roleRouteMap.talent.home, label: '工作台', note: '待办入口' },
        { to: roleRouteMap.talent.notifications, label: '通知中心', note: '提醒汇总' },
        { to: roleRouteMap.talent.messages, label: '聊天', note: '任务沟通' },
        { to: roleRouteMap.talent.workspace, label: '协作空间', note: '进度提交' },
        { to: roleRouteMap.talent.records, label: '接单记录', note: '留痕回看' }
      ]
    };
  }

  return {
    brandChip: 'Enterprise Desk',
    brandCopy: '发单 · 协作',
    topbarEyebrow: '企业端工作区',
    topbarCopy: '先清待办，再推进。',
    status: '待办中控',
    focus: {
      title: '先清待办',
      copy: '先处理确认和修改。'
    },
    topbarAction: { to: roleRouteMap.enterprise.approvals, label: '审批中心' },
    primaryAction: { to: roleRouteMap.enterprise.publish, label: '发布任务' },
    secondaryAction: { to: roleRouteMap.enterprise.messages, label: '去聊天' },
    primary: [
      { to: roleRouteMap.enterprise.home, label: '工作台', note: '待办总览' },
      { to: roleRouteMap.enterprise.approvals, label: '审批中心', note: '确认与修改' },
      { to: roleRouteMap.enterprise.notifications, label: '通知中心', note: '提醒汇总' },
      { to: roleRouteMap.enterprise.messages, label: '聊天', note: '范围沟通' },
      { to: roleRouteMap.enterprise.workspace, label: '协作空间', note: '节点推进' },
      { to: roleRouteMap.enterprise.records, label: '发单记录', note: '金额回看' }
    ]
  };
});

async function handleLogout() {
  await signOut();
  router.push('/');
}
</script>

<style scoped>
.desktop-shell {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  gap: 12px;
  max-width: 1480px;
  margin: 0 auto;
  padding: 16px;
  min-height: 100vh;
}

.desktop-rail {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-self: start;
  min-height: calc(100vh - 48px);
  padding: 16px 14px;
  border-radius: 22px;
  border: 1px solid rgba(158, 179, 212, 0.08);
  background:
    linear-gradient(180deg, rgba(10, 15, 24, 0.95), rgba(8, 12, 20, 0.99)),
    radial-gradient(circle at top left, rgba(112, 144, 224, 0.05), transparent 30%);
  box-shadow: 0 16px 36px rgba(0, 5, 18, 0.18);
  backdrop-filter: blur(14px);
}

.desktop-brand {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.desktop-brand strong {
  font-family: var(--font-display);
  font-size: 22px;
  letter-spacing: -0.04em;
  color: var(--text-strong);
}

.desktop-brand span:last-child {
  color: var(--text-soft);
  line-height: 1.5;
  font-size: 11px;
}

.desktop-brand-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(158, 179, 212, 0.09);
  background: rgba(11, 16, 25, 0.92);
  color: rgba(214, 225, 239, 0.82);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.desktop-section-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-faint);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.desktop-rail-section {
  display: flex;
  flex-direction: column;
}

.desktop-nav {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.desktop-nav-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 11px 12px;
  border-radius: 16px;
  border: 1px solid rgba(158, 179, 212, 0.08);
  background: rgba(9, 14, 22, 0.68);
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.desktop-nav-item:hover {
  transform: translateY(-1px);
  border-color: rgba(105, 168, 255, 0.18);
}

.desktop-nav-item.router-link-exact-active,
.desktop-nav-item.router-link-active {
  border-color: rgba(105, 168, 255, 0.24);
  background: linear-gradient(180deg, rgba(22, 33, 58, 0.9), rgba(12, 18, 30, 0.96));
  box-shadow: inset 0 0 0 1px rgba(105, 168, 255, 0.12);
}

.desktop-nav-title {
  color: var(--text-strong);
  font-weight: 600;
}

.desktop-nav-note {
  color: var(--text-soft);
  font-size: 10px;
}

.desktop-rail-focus {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(158, 179, 212, 0.08);
  background: rgba(9, 14, 22, 0.58);
}

.desktop-rail-focus strong {
  color: var(--text-strong);
}

.desktop-rail-focus p {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.45;
  font-size: 12px;
}

.desktop-rail-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.desktop-rail-button {
  justify-content: center;
}

.desktop-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.desktop-topbar-heading {
  gap: 4px;
}

.desktop-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 4px 10px;
}

.desktop-topbar-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(22px, 3vw, 30px);
  line-height: 1;
  letter-spacing: -0.05em;
  color: var(--text-strong);
}

.desktop-topbar-copy {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.45;
  font-size: 13px;
  max-width: 460px;
}

.desktop-topbar-side {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.desktop-topbar-status {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.desktop-topbar-status :deep(.soft-pill) {
  min-height: 24px;
  padding: 0 8px;
  font-size: 10px;
}

.desktop-topbar-side .button-secondary {
  min-height: 34px;
  padding: 0 12px;
  font-size: 12px;
}

.desktop-topbar-meta {
  color: var(--text-faint);
  font-size: 12px;
  white-space: nowrap;
}

.desktop-main-scroll {
  min-width: 0;
}

@media (max-width: 1180px) {
  .desktop-shell {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .desktop-rail {
    position: relative;
    top: 0;
    min-height: 0;
  }
}

@media (max-width: 768px) {
  .desktop-shell {
    padding: 16px;
  }

  .desktop-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .desktop-topbar-side {
    justify-content: flex-start;
  }
}
</style>
