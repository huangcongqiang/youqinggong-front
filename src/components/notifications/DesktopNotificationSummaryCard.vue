<template>
  <article class="desktop-notification-summary stack-md">
    <header class="desktop-notification-summary__header">
      <div class="stack-xs">
        <span class="eyebrow">{{ eyebrow }}</span>
        <h3>{{ title }}</h3>
        <p v-if="description" class="muted">{{ description }}</p>
      </div>

      <div class="desktop-notification-summary__actions">
        <button
          v-if="secondaryAction?.label"
          type="button"
          class="button-secondary"
          @click="$emit('secondary-action')"
        >
          {{ secondaryAction.label }}
        </button>
        <button
          v-if="primaryAction?.label"
          type="button"
          class="button-primary"
          @click="$emit('primary-action')"
        >
          {{ primaryAction.label }}
        </button>
      </div>
    </header>

    <section class="desktop-notification-summary__hero">
      <div class="desktop-notification-summary__metric">
        <span class="desktop-notification-summary__label">{{ totalLabel }}</span>
        <strong>{{ totalValue }}</strong>
        <p v-if="totalNote" class="muted">{{ totalNote }}</p>
      </div>

      <div v-if="normalizedStats.length" class="desktop-notification-summary__stats">
        <article v-for="item in normalizedStats" :key="item.label" class="desktop-notification-summary__stat">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p v-if="item.note" class="muted">{{ item.note }}</p>
        </article>
      </div>
    </section>

    <section v-if="normalizedHighlights.length" class="desktop-notification-summary__highlights stack-sm">
      <div class="stack-xs">
        <span class="eyebrow">{{ highlightTitle }}</span>
      </div>
      <ul class="desktop-notification-summary__highlight-list">
        <li v-for="item in normalizedHighlights" :key="item.label">
          <strong>{{ item.label }}</strong>
          <span>{{ item.value }}</span>
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  eyebrow: { type: String, default: '通知总览' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  totalLabel: { type: String, default: '待处理事项' },
  totalValue: { type: String, default: '0 项' },
  totalNote: { type: String, default: '' },
  stats: { type: Array, default: () => [] },
  highlights: { type: Array, default: () => [] },
  highlightTitle: { type: String, default: '处理建议' },
  primaryAction: { type: Object, default: null },
  secondaryAction: { type: Object, default: null }
});

defineEmits(['primary-action', 'secondary-action']);

function textOf(value) {
  return value == null ? '' : String(value).trim();
}

const normalizedStats = computed(() =>
  (Array.isArray(props.stats) ? props.stats : [])
    .filter((item) => item && textOf(item.label))
    .map((item) => ({
      label: textOf(item.label),
      value: textOf(item.value) || '0',
      note: textOf(item.note)
    }))
);

const normalizedHighlights = computed(() =>
  (Array.isArray(props.highlights) ? props.highlights : [])
    .filter((item) => item && textOf(item.label) && textOf(item.value))
    .map((item) => ({
      label: textOf(item.label),
      value: textOf(item.value)
    }))
);
</script>

<style scoped>
.desktop-notification-summary {
  padding: 24px;
  border-radius: 28px;
  border: 1px solid rgba(102, 137, 196, 0.14);
  background:
    linear-gradient(180deg, rgba(15, 20, 31, 0.96), rgba(8, 12, 20, 0.98)),
    radial-gradient(circle at top right, rgba(108, 154, 255, 0.15), transparent 32%);
  box-shadow: 0 28px 72px rgba(0, 4, 16, 0.28);
}

.desktop-notification-summary__header,
.desktop-notification-summary__actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.desktop-notification-summary__header h3 {
  margin: 6px 0 0;
  font-size: 26px;
  letter-spacing: -0.04em;
}

.desktop-notification-summary__hero {
  display: grid;
  grid-template-columns: minmax(220px, 0.84fr) minmax(0, 1.16fr);
  gap: 14px;
}

.desktop-notification-summary__metric,
.desktop-notification-summary__stat,
.desktop-notification-summary__highlights {
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid rgba(158, 179, 212, 0.1);
  background: rgba(10, 15, 26, 0.8);
}

.desktop-notification-summary__label,
.desktop-notification-summary__stat span {
  color: var(--text-faint);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.desktop-notification-summary__metric strong,
.desktop-notification-summary__stat strong {
  display: block;
  margin-top: 8px;
  font-family: var(--font-display);
  font-size: 32px;
  letter-spacing: -0.05em;
  color: var(--text-strong);
}

.desktop-notification-summary__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.desktop-notification-summary__stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.desktop-notification-summary__highlight-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.desktop-notification-summary__highlight-list li {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(158, 179, 212, 0.08);
  background: rgba(12, 18, 29, 0.7);
}

.desktop-notification-summary__highlight-list strong {
  color: var(--text-strong);
}

.desktop-notification-summary__highlight-list span {
  color: var(--text-soft);
  line-height: 1.6;
}

.muted {
  margin: 0;
}

@media (max-width: 1280px) {
  .desktop-notification-summary__hero,
  .desktop-notification-summary__highlight-list {
    grid-template-columns: 1fr;
  }

  .desktop-notification-summary__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
