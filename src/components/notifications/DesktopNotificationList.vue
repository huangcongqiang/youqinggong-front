<template>
  <article class="desktop-notification-list stack-md">
    <header class="desktop-notification-list__header">
      <div class="stack-xs">
        <span class="eyebrow">{{ eyebrow }}</span>
        <h3>{{ title }}</h3>
        <p v-if="description" class="muted">{{ description }}</p>
      </div>

      <button
        v-if="showRefresh"
        type="button"
        class="button-secondary"
        @click="$emit('refresh')"
      >
        {{ refreshLabel }}
      </button>
    </header>

    <div v-if="normalizedItems.length" class="desktop-notification-list__items">
      <DesktopNotificationItem
        v-for="item in normalizedItems"
        :key="item.id || item.title"
        :item="item"
        @select="$emit('select', $event)"
        @action="$emit('action', $event)"
      />
    </div>

    <section v-else class="desktop-notification-list__empty stack-sm">
      <strong>{{ emptyTitle }}</strong>
      <p class="muted">{{ emptyDescription }}</p>
    </section>

    <footer class="desktop-notification-list__footer">
      <span class="muted">{{ footerNote }}</span>

      <div v-if="normalizedFooterActions.length" class="desktop-notification-list__footer-actions">
        <button
          v-for="action in normalizedFooterActions"
          :key="action.key || action.label"
          type="button"
          :class="action.tone === 'primary' ? 'button-primary' : 'button-secondary'"
          :disabled="action.disabled"
          @click="$emit('footer-action', action)"
        >
          {{ action.label }}
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup>
import { computed } from 'vue';
import DesktopNotificationItem from './DesktopNotificationItem.vue';

const props = defineProps({
  eyebrow: { type: String, default: '通知列表' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  items: { type: Array, default: () => [] },
  emptyTitle: { type: String, default: '当前没有待处理通知' },
  emptyDescription: { type: String, default: '新的高优先级事项出现后，会自动汇总到这里。' },
  showRefresh: { type: Boolean, default: false },
  refreshLabel: { type: String, default: '刷新' },
  footerNote: { type: String, default: '批量动作先保留骨架，后续接审批流与财务流。' },
  footerActions: { type: Array, default: () => [] }
});

defineEmits(['select', 'action', 'refresh', 'footer-action']);

const normalizedItems = computed(() => (Array.isArray(props.items) ? props.items.filter(Boolean) : []));
const normalizedFooterActions = computed(() =>
  (Array.isArray(props.footerActions) ? props.footerActions : []).filter((item) => item && item.label)
);
</script>

<style scoped>
.desktop-notification-list {
  padding: 22px;
  border-radius: 28px;
  border: 1px solid rgba(158, 179, 212, 0.1);
  background: linear-gradient(180deg, rgba(14, 19, 31, 0.94), rgba(7, 11, 18, 0.98));
  box-shadow: 0 24px 56px rgba(0, 4, 16, 0.24);
  min-height: 100%;
}

.desktop-notification-list__header,
.desktop-notification-list__footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.desktop-notification-list__header h3 {
  margin: 6px 0 0;
  font-size: 24px;
  letter-spacing: -0.04em;
}

.desktop-notification-list__items {
  display: grid;
  gap: 14px;
}

.desktop-notification-list__empty {
  min-height: 220px;
  align-items: flex-start;
  justify-content: center;
  padding: 24px;
  border-radius: 22px;
  border: 1px dashed rgba(158, 179, 212, 0.12);
  background: rgba(9, 14, 24, 0.72);
}

.desktop-notification-list__empty strong {
  color: var(--text-strong);
  font-size: 18px;
}

.desktop-notification-list__footer {
  align-items: center;
}

.desktop-notification-list__footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.muted {
  margin: 0;
}
</style>
