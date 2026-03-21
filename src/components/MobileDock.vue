<template>
  <nav v-if="items.length" class="mobile-dock" aria-label="移动端快捷导航">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="dock-link"
    >
      <span class="dock-indicator"></span>
      <strong>{{ item.label }}</strong>
      <small>{{ item.hint }}</small>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { resolveAudience } from '../utils/roleRoutes';

const route = useRoute();

const items = computed(() => {
  const audience = resolveAudience(route);

  if (audience === 'enterprise') {
    return [
      { to: '/enterprise', label: '工作台', hint: '总览' },
      { to: '/enterprise/publish', label: '发布', hint: '任务' },
      { to: '/enterprise/talents', label: '人才', hint: '广场' },
      { to: '/enterprise/messages', label: '协作', hint: '沟通' }
    ];
  }

  if (audience === 'talent') {
    return [
      { to: '/talent', label: '我的', hint: '工作台' },
      { to: '/talent/tasks', label: '任务', hint: '广场' },
      { to: '/talent/messages', label: '消息', hint: '沟通' },
      { to: '/talent/workspace', label: '协作', hint: '进度' }
    ];
  }

  return [];
});
</script>

<style scoped>
.mobile-dock {
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: 14px;
  z-index: 14;
  display: none;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(116, 151, 255, 0.18);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(7, 15, 30, 0.94), rgba(7, 13, 25, 0.96)),
    radial-gradient(circle at top, rgba(70, 129, 255, 0.16), transparent 60%);
  box-shadow: 0 20px 60px rgba(0, 6, 18, 0.48);
  backdrop-filter: blur(22px);
}

.dock-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: 18px;
  color: var(--text-faint);
  transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.dock-link strong,
.dock-link small {
  line-height: 1;
}

.dock-link strong {
  font-size: 14px;
}

.dock-link small {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dock-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(62, 122, 255, 0.75), rgba(140, 105, 255, 0.85));
  box-shadow: 0 0 18px rgba(76, 201, 255, 0.48);
}

.dock-link.router-link-exact-active,
.dock-link.router-link-active {
  color: var(--text-main);
  background: linear-gradient(180deg, rgba(26, 46, 92, 0.72), rgba(12, 24, 47, 0.72));
}

.dock-link:hover {
  transform: translateY(-2px);
}

@media (max-width: 820px) {
  .mobile-dock {
    display: grid;
  }
}
</style>
