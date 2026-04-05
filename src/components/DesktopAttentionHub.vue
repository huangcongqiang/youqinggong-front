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
        {{ expanded ? '收起详情' : toggleLabel }}
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
            <p class="muted">{{ item.note || '进入对应页面处理' }}</p>
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
            <p class="muted">{{ item.note || '处理入口即将开放' }}</p>
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
    default: '优先处理'
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
    default: '待处理'
  },
  summaryValue: {
    type: String,
    default: '0 项'
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
    default: '更多信息'
  },
  detailDescription: {
    type: String,
    default: ''
  },
  toggleLabel: {
    type: String,
    default: '查看全部'
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
          label: toText(item.label || `条目 ${index + 1}`),
          value: toText(item.value)
        };
      }

      const value = toText(item);
      return {
        label: `条目 ${index + 1}`,
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
  border: 1px solid rgba(148, 170, 210, 0.12);
  background:
    linear-gradient(180deg, rgba(16, 19, 28, 0.96), rgba(9, 12, 20, 0.99)),
    radial-gradient(circle at top right, rgba(104, 138, 229, 0.08), transparent 34%);
  box-shadow: 0 18px 40px rgba(3, 6, 16, 0.22);
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
  border: 1px solid rgba(158, 179, 212, 0.1);
  background: rgba(12, 17, 28, 0.58);
}

.desktop-attention-hub__metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  background: linear-gradient(180deg, rgba(14, 20, 33, 0.88), rgba(10, 14, 24, 0.94));
}

.desktop-attention-hub__metric-label,
.desktop-attention-hub__stat-label {
  color: var(--text-faint);
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
  border: 1px solid rgba(148, 170, 210, 0.12);
  background: rgba(13, 18, 29, 0.5);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.desktop-attention-hub__item:hover {
  transform: translateY(-1px);
  border-color: rgba(105, 168, 255, 0.18);
  background: rgba(15, 21, 34, 0.72);
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
  background: rgba(105, 168, 255, 0.12);
  color: #e6f0ff;
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
  background: rgba(7, 12, 21, 0.76);
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
