<template>
  <article
    class="desktop-notification-item"
    :class="{ 'is-active': item.active, 'is-urgent': item.urgent, 'is-unread': item.unread }"
  >
    <button type="button" class="desktop-notification-item__body" @click="$emit('select', item)">
      <div class="desktop-notification-item__head">
        <div class="stack-xs">
          <span class="desktop-notification-item__eyebrow">{{ item.groupLabel || '待办通知' }}</span>
          <strong>{{ item.title }}</strong>
        </div>
        <span v-if="item.countLabel" class="desktop-notification-item__count">{{ item.countLabel }}</span>
      </div>

      <p class="desktop-notification-item__summary">{{ item.summary }}</p>

      <div class="desktop-notification-item__meta">
        <span v-if="item.status">{{ item.status }}</span>
        <span v-if="item.note">{{ item.note }}</span>
        <span v-if="item.updatedAt">{{ item.updatedAt }}</span>
      </div>
    </button>

    <div v-if="Array.isArray(item.actions) && item.actions.length" class="desktop-notification-item__actions">
      <button
        v-for="action in item.actions"
        :key="action.key || action.label"
        type="button"
        :class="action.tone === 'primary' ? 'button-primary' : 'button-secondary'"
        @click="$emit('action', { item, action })"
      >
        {{ action.label }}
      </button>
    </div>
  </article>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
});

defineEmits(['select', 'action']);
</script>

<style scoped>
.desktop-notification-item {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(158, 179, 212, 0.08);
  background: rgba(10, 16, 27, 0.7);
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.desktop-notification-item:hover {
  transform: translateY(-1px);
  border-color: rgba(105, 168, 255, 0.2);
}

.desktop-notification-item.is-active {
  border-color: rgba(105, 168, 255, 0.26);
  background: linear-gradient(180deg, rgba(24, 38, 67, 0.9), rgba(10, 16, 28, 0.96));
  box-shadow: inset 0 0 0 1px rgba(105, 168, 255, 0.12);
}

.desktop-notification-item.is-urgent {
  border-color: rgba(255, 124, 124, 0.22);
}

.desktop-notification-item.is-unread::before {
  content: '';
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(120, 178, 255, 1), rgba(69, 115, 255, 1));
  box-shadow: 0 0 0 4px rgba(85, 144, 255, 0.12);
}

.desktop-notification-item__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.desktop-notification-item__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.desktop-notification-item__eyebrow {
  color: var(--text-faint);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.desktop-notification-item__head strong {
  color: var(--text-strong);
  font-size: 18px;
  line-height: 1.35;
}

.desktop-notification-item__count {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(158, 179, 212, 0.12);
  background: rgba(14, 20, 31, 0.92);
  color: var(--text-soft);
  white-space: nowrap;
}

.desktop-notification-item__summary {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.7;
}

.desktop-notification-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  color: var(--text-faint);
  font-size: 13px;
}

.desktop-notification-item__meta span {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(158, 179, 212, 0.08);
  background: rgba(8, 13, 22, 0.78);
}

.desktop-notification-item__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
