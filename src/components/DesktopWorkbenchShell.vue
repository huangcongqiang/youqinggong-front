<template>
  <div class="desktop-shell" :class="`is-${audience}`">
    <aside class="desktop-rail">
      <router-link to="/" class="desktop-brand">
        <span class="desktop-brand-chip">{{ shellModel.brandChip }}</span>
        <strong>{{ shellModel.brandName }}</strong>
        <span class="desktop-brand-copy">{{ shellModel.brandCopy }}</span>
      </router-link>

      <nav class="desktop-nav" aria-label="工作台导航">
        <router-link
          v-for="item in shellModel.primary"
          :key="item.label"
          class="desktop-nav-link"
          :class="{ 'is-active': isNavItemActive(item) }"
          :to="item.to"
        >
          <span class="desktop-nav-link__label">{{ item.label }}</span>
          <span class="desktop-nav-link__note">{{ item.note }}</span>
        </router-link>
      </nav>

      <div class="desktop-rail-footer">
        <div class="desktop-rail-actions">
          <router-link class="button-primary desktop-rail-button" :to="shellModel.primaryAction.to">
            {{ shellModel.primaryAction.label }}
          </router-link>
          <router-link class="button-secondary desktop-rail-button" :to="shellModel.secondaryAction.to">
            {{ shellModel.secondaryAction.label }}
          </router-link>
          <router-link class="desktop-rail-link" :to="shellModel.topbarAction.to">
            {{ shellModel.topbarAction.label }}
          </router-link>
        </div>

        <div class="desktop-user-card">
          <div class="desktop-user-card__copy">
            <span class="eyebrow">{{ shellModel.status }}</span>
            <strong>{{ userMeta }}</strong>
          </div>
          <button class="desktop-logout" type="button" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </aside>

    <div class="desktop-main">
      <header class="desktop-header">
        <div class="desktop-header-copy">
          <span class="eyebrow">{{ shellModel.topbarEyebrow }}</span>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageDescription }}</p>
        </div>

        <div class="desktop-header-actions">
          <router-link class="button-secondary" :to="shellModel.secondaryAction.to">
            {{ shellModel.secondaryAction.label }}
          </router-link>
          <router-link class="button-primary" :to="shellModel.primaryAction.to">
            {{ shellModel.primaryAction.label }}
          </router-link>
        </div>
      </header>

      <main class="desktop-content">
        <slot />
      </main>
    </div>
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
const pageTitle = computed(() => String(route.meta?.title || (audience.value === 'talent' ? '人才端工作台' : '企业端工作台')));
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
      brandChip: '人才端',
      brandName: '有轻功',
      brandCopy: '接单 · 交付 · 回款',
      topbarEyebrow: '人才工作台',
      status: '待确认优先',
      topbarAction: { to: roleRouteMap.talent.notifications, label: '通知中心' },
      primaryAction: { to: roleRouteMap.talent.messages, label: '进入沟通' },
      secondaryAction: { to: roleRouteMap.talent.market, label: '找任务' },
      primary: [
        { to: roleRouteMap.talent.home, label: '工作台', note: '总览待确认、钱包和重点任务' },
        { to: roleRouteMap.talent.notifications, label: '通知', note: '查看待确认和系统提醒' },
        { to: roleRouteMap.talent.messages, label: '沟通', note: '绑定任务后进入聊天' },
        { to: roleRouteMap.talent.workspace, label: '协作', note: '提交进展和附件' },
        { to: roleRouteMap.talent.records, label: '记录', note: '查看接单历史与财务留痕' }
      ]
    };
  }

  return {
    brandChip: '企业端',
    brandName: '有轻功',
    brandCopy: '发布 · 协作 · 支出',
    topbarEyebrow: '企业工作台',
    status: '待办中控',
    topbarAction: { to: roleRouteMap.enterprise.approvals, label: '审批中心' },
    primaryAction: { to: roleRouteMap.enterprise.publish, label: '发布任务' },
    secondaryAction: { to: roleRouteMap.enterprise.messages, label: '最近沟通' },
    primary: [
      { to: roleRouteMap.enterprise.home, label: '工作台', note: '查看待办、合作和支出概览' },
      { to: roleRouteMap.enterprise.approvals, label: '审批', note: '处理确认、修改和评级' },
      { to: roleRouteMap.enterprise.notifications, label: '通知', note: '回看所有提醒与后续动作' },
      { to: roleRouteMap.enterprise.messages, label: '沟通', note: '按任务进入聊天和纪要' },
      { to: roleRouteMap.enterprise.workspace, label: '协作', note: '推进节点、进展与验收' },
      { to: roleRouteMap.enterprise.records, label: '记录', note: '查看发单留痕与金额明细' }
    ]
  };
});

const pageDescription = computed(() => {
  const active = shellModel.value.primary.find((item) => isNavItemActive(item));
  return active?.note || (audience.value === 'talent' ? '先完成待确认，再推进交付和回款。' : '先清待办，再推进合作、验收与支出。');
});

function isNavItemActive(item) {
  const target = typeof item?.to === 'string' ? item.to : item?.to?.path;
  if (!target) {
    return false;
  }
  return route.path === target || route.path.startsWith(`${target}/`);
}

async function handleLogout() {
  await signOut();
  router.push('/');
}
</script>

<style scoped>
.desktop-shell {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 22px;
  min-height: 100vh;
  padding: 22px;
}

.desktop-rail {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 22px;
  padding: 24px 20px;
  border: 1px solid rgba(151, 170, 204, 0.12);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(10, 16, 26, 0.92), rgba(7, 12, 20, 0.98)),
    radial-gradient(circle at top left, rgba(109, 157, 255, 0.08), transparent 32%);
  box-shadow: var(--shadow);
}

.desktop-brand {
  display: grid;
  gap: 6px;
}

.desktop-brand-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(109, 157, 255, 0.14);
  color: rgba(214, 226, 255, 0.92);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.desktop-brand strong {
  color: var(--text-strong);
  font-size: 30px;
  letter-spacing: -0.04em;
}

.desktop-brand-copy {
  color: var(--text-soft);
  font-size: 13px;
}

.desktop-nav {
  display: grid;
  gap: 10px;
  align-content: start;
}

.desktop-nav-link {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid transparent;
  background: rgba(14, 21, 33, 0.56);
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.desktop-nav-link:hover,
.desktop-nav-link.is-active {
  transform: translateY(-1px);
  border-color: rgba(109, 157, 255, 0.18);
  background: rgba(19, 30, 48, 0.9);
}

.desktop-nav-link__label {
  color: var(--text-strong);
  font-weight: 700;
}

.desktop-nav-link__note {
  color: var(--text-soft);
  font-size: 12px;
  line-height: 1.5;
}

.desktop-rail-footer {
  display: grid;
  gap: 18px;
}

.desktop-rail-actions {
  display: grid;
  gap: 10px;
}

.desktop-rail-button {
  width: 100%;
}

.desktop-rail-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  color: var(--text-soft);
  font-weight: 600;
}

.desktop-user-card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgba(151, 170, 204, 0.12);
  border-radius: 22px;
  background: rgba(12, 18, 29, 0.82);
}

.desktop-user-card__copy {
  display: grid;
  gap: 6px;
}

.desktop-user-card__copy strong {
  color: var(--text-main);
  font-size: 14px;
  line-height: 1.5;
}

.desktop-logout {
  min-height: 42px;
  border-radius: 16px;
  border: 1px solid rgba(151, 170, 204, 0.12);
  background: rgba(14, 21, 33, 0.76);
  color: var(--text-main);
  font-weight: 600;
}

.desktop-main {
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 22px;
}

.desktop-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 28px 30px;
  border: 1px solid rgba(151, 170, 204, 0.12);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(12, 18, 30, 0.9), rgba(8, 13, 23, 0.96)),
    radial-gradient(circle at top right, rgba(109, 157, 255, 0.06), transparent 30%);
  box-shadow: var(--shadow);
}

.desktop-header-copy {
  display: grid;
  gap: 10px;
}

.desktop-header-copy h1 {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(32px, 4vw, 48px);
  letter-spacing: -0.05em;
  line-height: 0.98;
}

.desktop-header-copy p {
  margin: 0;
  max-width: 720px;
  color: var(--text-soft);
  line-height: 1.7;
}

.desktop-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.desktop-content {
  min-width: 0;
}

@media (max-width: 1180px) {
  .desktop-shell {
    grid-template-columns: 1fr;
  }

  .desktop-rail {
    grid-template-rows: auto auto auto;
  }

  .desktop-header {
    flex-direction: column;
  }

  .desktop-header-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .desktop-shell {
    padding: 14px;
  }

  .desktop-rail,
  .desktop-header {
    padding: 20px 18px;
    border-radius: 24px;
  }

  .desktop-header-copy h1 {
    font-size: 30px;
  }

  .desktop-header-actions {
    width: 100%;
  }

  .desktop-header-actions :deep(.button-primary),
  .desktop-header-actions :deep(.button-secondary) {
    width: 100%;
  }
}
</style>
