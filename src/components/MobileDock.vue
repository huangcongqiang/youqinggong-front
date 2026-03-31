<template>
  <nav v-if="items.length" class="mobile-dock" aria-label="移动端快捷导航">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="dock-link"
    >
      <span class="dock-indicator"></span>
      <span class="dock-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path :d="dockIconPath(item.icon)" />
        </svg>
      </span>
      <strong>{{ item.label }}</strong>
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
      { to: '/enterprise', label: '工作台', icon: 'home' },
      { to: '/enterprise/chat', label: '聊天', icon: 'chat' },
      { to: '/enterprise/publish', label: '发布', icon: 'plus' },
      { to: '/enterprise/talents', label: '人才', icon: 'brief' }
    ];
  }

  if (audience === 'talent') {
    return [
      { to: '/talent', label: '我的', icon: 'home' },
      { to: '/talent/chat', label: '聊天', icon: 'chat' },
      { to: '/talent/tasks', label: '任务', icon: 'brief' },
      { to: '/talent/workspace', label: '协作', icon: 'grid' }
    ];
  }

  return [];
});

function dockIconPath(icon) {
  const icons = {
    home:
      'M4 11.5 12 5l8 6.5M6.5 10.5v8h4.5v-4.5h2v4.5h4.5v-8',
    chat:
      'M5 6.5h14a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 19 16.5H10l-4.5 3v-3H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5Z',
    plus:
      'M12 5v14M5 12h14',
    grid:
      'M5 5.5h5.5V11H5zM13.5 5.5H19V11h-5.5zM5 13h5.5v5.5H5zM13.5 13H19v5.5h-5.5z',
    brief:
      'M4.5 8h15v9a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 17V8Zm5-2h5a1 1 0 0 1 1 1v1h-7V7a1 1 0 0 1 1-1Z'
  };
  return icons[icon] || icons.home;
}
</script>

<style scoped>
.mobile-dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 18;
  display: none;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
  padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(120, 190, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(10, 20, 38, 0.98), rgba(6, 13, 25, 0.99)),
    radial-gradient(circle at top, rgba(57, 196, 255, 0.06), transparent 58%);
  box-shadow: 0 -12px 28px rgba(2, 8, 20, 0.3);
  backdrop-filter: blur(14px);
}

.dock-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 58px;
  padding: 8px 6px 5px;
  border-radius: 16px;
  color: var(--text-soft);
  transition: background 0.2s ease, color 0.2s ease;
  position: relative;
}

.dock-link strong {
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.04em;
}

.dock-indicator {
  position: absolute;
  top: 0;
  left: 50%;
  width: 20px;
  height: 3px;
  border-radius: 999px;
  background: transparent;
  transform: translateX(-50%);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.dock-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
}

.dock-icon svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.dock-link.router-link-exact-active,
.dock-link.router-link-active {
  color: var(--text-strong);
  background: rgba(57, 196, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(57, 196, 255, 0.12);
}

.dock-link.router-link-exact-active .dock-indicator,
.dock-link.router-link-active .dock-indicator {
  background: linear-gradient(90deg, var(--accent-deep), var(--accent));
  box-shadow: 0 0 10px rgba(57, 196, 255, 0.18);
}

.dock-link:hover {
  color: var(--text-strong);
}

@media (max-width: 820px) {
  .mobile-dock {
    display: grid;
  }
}
</style>
