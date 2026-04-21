<template>
  <article class="desktop-attention-hub stack-md">
    <header class="desktop-attention-hub__header">
      <div class="desktop-attention-hub__title-group stack-xs">
        <span class="eyebrow">{{ eyebrow }}</span>
        <h3>{{ title }}</h3>
        <p v-if="description" class="muted">{{ description }}</p>
      </div>

      <button
        v-if="normalizedDetailItems.length"
        class="button-secondary desktop-attention-hub__toggle"
        type="button"
        :aria-expanded="expanded ? 'true' : 'false'"
        :aria-controls="detailId"
        @click="toggleExpanded"
      >
        {{ expanded ? 'Hide details' : toggleLabel }}
      </button>
    </header>

    <section class="desktop-attention-hub__summary">
      <div class="desktop-attention-hub__metric">
        <span class="desktop-attention-hub__metric-label">{{ summaryLabel }}</span>
        <strong>{{ summaryValue }}</strong>
        <p v-if="summaryNote" class="muted">{{ summaryNote }}</p>
      </div>

      <div v-if="normalizedStats.length" class="desktop-attention-hub__stats">
        <article v-for="item in normalizedStats" :key="item.label" class="desktop-attention-hub__stat">
          <span class="desktop-attention-hub__stat-label">{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p v-if="item.note" class="muted">{{ item.note }}</p>
        </article>
      </div>
    </section>

    <section class="desktop-attention-hub__items">
      <template v-for="item in normalizedItems" :key="item.id || item.label">
        <router-link
          v-if="item.to"
          class="desktop-attention-hub__item"
          :to="item.to"
        >
          <div class="stack-xs">
            <strong>{{ item.label }}</strong>
            <p class="muted">{{ item.note || '打开相关合同继续处理' }}</p>
          </div>
          <span class="desktop-attention-hub__count">{{ item.count || 0 }}</span>
        </router-link>

        <div
          v-else
          class="desktop-attention-hub__item is-disabled"
          aria-disabled="true"
        >
          <div class="stack-xs">
            <strong>{{ item.label }}</strong>
            <p class="muted">{{ item.note || 'Access is coming soon' }}</p>
          </div>
          <span class="desktop-attention-hub__count">{{ item.count || 0 }}</span>
        </div>
      </template>
    </section>

    <div class="desktop-attention-hub__actions">
      <router-link
        v-if="primaryAction?.to"
        class="button-primary"
        :to="primaryAction.to"
      >
        {{ primaryAction.label }}
      </router-link>
      <router-link
        v-if="secondaryAction?.to"
        class="button-secondary"
        :to="secondaryAction.to"
      >
        {{ secondaryAction.label }}
      </router-link>
    </div>

    <transition name="attention-expand">
      <section
        v-if="expanded && normalizedDetailItems.length"
        :id="detailId"
        class="desktop-attention-hub__detail stack-sm"
      >
        <div class="stack-xs">
          <span class="eyebrow">{{ detailTitle }}</span>
          <p v-if="detailDescription" class="muted">{{ detailDescription }}</p>
        </div>
        <ul class="desktop-attention-hub__detail-list">
      <li v-for="item in normalizedDetailItems" :key="item.label">
        <strong>{{ item.label }}</strong>
        <span>{{ item.value }}</span>
      </li>
        </ul>
      </section>
    </transition>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue';

const emit = defineEmits(['toggle']);
const props = defineProps({
  eyebrow: {
    type: String,
    default: 'Action needed'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  summaryLabel: {
    type: String,
    default: 'To review'
  },
  summaryValue: {
    type: String,
    default: '0 items'
  },
  summaryNote: {
    type: String,
    default: ''
  },
  stats: {
    type: Array,
    default: () => []
  },
  items: {
    type: Array,
    default: () => []
  },
  detailItems: {
    type: Array,
    default: () => []
  },
  detailTitle: {
    type: String,
    default: 'More context'
  },
  detailDescription: {
    type: String,
    default: ''
  },
  toggleLabel: {
    type: String,
    default: 'View all'
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  },
  primaryAction: {
    type: Object,
    default: null
  },
  secondaryAction: {
    type: Object,
    default: null
  }
});

const expanded = ref(props.defaultExpanded);

function toText(value) {
  return value == null ? '' : String(value).trim();
}

function toSlug(value, fallback) {
  const normalized = toText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

const detailId = computed(() => `desktop-attention-hub-detail-${toSlug(props.title, 'default')}`);

function toggleExpanded() {
  expanded.value = !expanded.value;
  emit('toggle', expanded.value);
}

const normalizedStats = computed(() =>
  (Array.isArray(props.stats) ? props.stats : [])
    .filter((item) => item && toText(item.label))
    .map((item) => ({
      label: toText(item.label),
      value: toText(item.value) || '0',
      note: toText(item.note)
    }))
);

const normalizedItems = computed(() =>
  (Array.isArray(props.items) ? props.items : [])
    .filter((item) => item && toText(item.label))
    .map((item, index) => ({
      id: item.id || `item-${index}`,
      label: toText(item.label),
      note: toText(item.note || item.hint),
      count: toText(item.count) || '0',
      to: item.to || item.route || null
    }))
);

const normalizedDetailItems = computed(() =>
  (Array.isArray(props.detailItems) ? props.detailItems : [])
    .map((item, index) => {
      if (item && typeof item === 'object') {
        return {
          label: toText(item.label || `Item ${index + 1}`),
          value: toText(item.value)
        };
      }

      const value = toText(item);
      return {
        label: `Item ${index + 1}`,
        value
      };
    })
    .filter((item) => item.value)
);
</script>

<style scoped>
.desktop-attention-hub {
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(20, 20, 20, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 249, 246, 0.98)),
    radial-gradient(circle at top right, rgba(20, 168, 0, 0.06), transparent 34%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.desktop-attention-hub__header,
.desktop-attention-hub__actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.desktop-attention-hub__title-group {
  max-width: 40rem;
}

.desktop-attention-hub__header h3 {
  margin: 4px 0 0;
  font-size: 24px;
  letter-spacing: -0.04em;
}

.desktop-attention-hub__header .muted,
.desktop-attention-hub__metric .muted,
.desktop-attention-hub__stat .muted,
.desktop-attention-hub__detail .muted,
.desktop-attention-hub__item .muted {
  margin: 0;
}

.desktop-attention-hub__header .muted {
  line-height: 1.45;
  max-width: 34rem;
}

.desktop-attention-hub__toggle {
  min-height: 32px;
  padding: 0 12px;
  font-size: 12px;
}

.desktop-attention-hub__summary {
  display: grid;
  grid-template-columns: minmax(248px, 0.9fr) minmax(0, 1.1fr);
  gap: 12px;
}

.desktop-attention-hub__metric,
.desktop-attention-hub__stat,
.desktop-attention-hub__detail {
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(255, 255, 255, 0.92);
}

.desktop-attention-hub__metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(241, 250, 239, 0.94), rgba(255, 255, 255, 0.98));
}

.desktop-attention-hub__metric-label,
.desktop-attention-hub__stat-label {
  color: rgba(77, 86, 105, 0.78);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.desktop-attention-hub__metric strong,
.desktop-attention-hub__stat strong {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: -0.05em;
  color: var(--text-strong);
}

.desktop-attention-hub__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.desktop-attention-hub__stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 0;
}

.desktop-attention-hub__stat strong {
  font-size: 24px;
}

.desktop-attention-hub__items {
  display: grid;
  gap: 8px;
}

.desktop-attention-hub__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 14px;
  border-radius: 18px;
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(255, 255, 255, 0.94);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.desktop-attention-hub__item:hover {
  transform: translateY(-1px);
  border-color: rgba(20, 168, 0, 0.18);
  background: rgba(246, 251, 244, 0.96);
}

.desktop-attention-hub__item.is-disabled {
  cursor: default;
  opacity: 0.78;
}

.desktop-attention-hub__item strong {
  font-size: 15px;
}

.desktop-attention-hub__item .muted {
  line-height: 1.42;
}

.desktop-attention-hub__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 30px;
  height: 30px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(20, 168, 0, 0.12);
  color: #0c6a1f;
  font-weight: 700;
  font-size: 13px;
}

.desktop-attention-hub__actions {
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 10px;
}

.desktop-attention-hub__actions :deep(.button-primary),
.desktop-attention-hub__actions :deep(.button-secondary) {
  min-height: 38px;
  padding: 0 16px;
}

.desktop-attention-hub__detail-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.desktop-attention-hub__detail-list li {
  display: flex;
  gap: 10px;
  align-items: baseline;
  justify-content: space-between;
  padding: 11px 13px;
  border-radius: 16px;
  background: rgba(247, 248, 245, 0.96);
}

.desktop-attention-hub__detail-list strong {
  color: var(--text-strong);
}

.desktop-attention-hub__detail-list span {
  color: var(--text-soft);
  text-align: right;
}

.attention-expand-enter-active,
.attention-expand-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.attention-expand-enter-from,
.attention-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1120px) {
  .desktop-attention-hub__summary {
    grid-template-columns: 1fr;
  }

  .desktop-attention-hub__stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .desktop-attention-hub {
    padding: 20px;
  }

  .desktop-attention-hub__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .desktop-attention-hub__item,
  .desktop-attention-hub__detail-list li {
    flex-direction: column;
    align-items: flex-start;
  }

  .desktop-attention-hub__count {
    align-self: flex-end;
  }
}
</style>
