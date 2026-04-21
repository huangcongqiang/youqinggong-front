<template>
  <section class="account-status-shell stack-md">
    <article v-if="showSummary" class="account-status-summary" :class="`is-${model.summaryTone || 'default'}`">
      <div class="stack-xs">
        <span class="eyebrow">{{ eyebrow }}</span>
        <h3>{{ model.summaryTitle }}</h3>
        <p class="muted">{{ model.summaryBody }}</p>
      </div>
      <span class="soft-pill">{{ summaryLabel }}</span>
    </article>

    <div class="account-status-grid" :class="gridClass">
      <article
        v-for="item in model.items || []"
        :key="item.key"
        class="account-status-card"
        :class="`is-${item.state}`"
      >
        <div class="panel-header panel-header-top">
          <div class="stack-xs">
            <span class="eyebrow">{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
          <span class="soft-pill">{{ stateLabel(item.state) }}</span>
        </div>

        <p class="muted">{{ item.note }}</p>

        <div v-if="item.actionLabel" class="toolbar account-status-actions">
          <button
            class="button-secondary"
            :class="{ 'account-status-primary': item.state === 'action-required' || item.state === 'blocked' }"
            type="button"
            :disabled="item.disabled"
            @click="$emit('action', item)"
          >
            {{ item.actionLabel }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  model: {
    type: Object,
    required: true
  },
  eyebrow: {
    type: String,
    default: '账号状态'
  },
  showSummary: {
    type: Boolean,
    default: true
  }
});

defineEmits(['action']);

const summaryLabel = computed(() => {
  const model = props.model || {};
  if (model.hasBlockingItems) {
    return `${model.blockingCount || 0} 个阻断项`;
  }
  if (model.gapCount) {
    return `${model.gapCount} 项待补充`;
  }
  return model.approved ? '可以继续' : '仍需补充';
});

const gridClass = computed(() => {
  const itemCount = Array.isArray(props.model?.items) ? props.model.items.length : 0;
  if (itemCount <= 1) {
    return 'is-single';
  }
  if (itemCount === 2) {
    return 'is-double';
  }
  return 'is-triple';
});

function stateLabel(state) {
  switch (state) {
    case 'clear':
      return '已就绪';
    case 'action-required':
      return '待处理';
    case 'blocked':
      return '受限';
    case 'gap':
      return '未完成';
    default:
      return '处理中';
  }
}
</script>

<style scoped>
.account-status-shell {
  gap: 12px;
}

.account-status-summary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid rgba(16, 138, 0, 0.14);
  background:
    linear-gradient(180deg, rgba(251, 253, 248, 0.98), rgba(244, 249, 239, 0.98)),
    radial-gradient(circle at top right, rgba(16, 138, 0, 0.08), transparent 32%);
}

.account-status-summary.is-warning {
  border-color: rgba(255, 191, 36, 0.26);
  background:
    linear-gradient(180deg, rgba(255, 251, 242, 0.98), rgba(255, 246, 229, 0.98)),
    radial-gradient(circle at top right, rgba(255, 196, 61, 0.14), transparent 36%);
}

.account-status-summary.is-note {
  border-style: dashed;
}

.account-status-summary .soft-pill,
.account-status-card .soft-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  background: #f4f7ef;
  border: 1px solid rgba(20, 24, 18, 0.08);
  color: #4e5b4a;
  box-shadow: none;
}

.account-status-summary.is-warning .soft-pill,
.account-status-card.is-action-required .soft-pill,
.account-status-card.is-blocked .soft-pill {
  background: #fff5df;
  border-color: rgba(255, 191, 36, 0.22);
  color: #8f6400;
}

.account-status-card.is-clear .soft-pill {
  background: #edf7e8;
  border-color: rgba(45, 173, 87, 0.24);
  color: #187236;
}

.account-status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.account-status-grid.is-double {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.account-status-grid.is-single {
  grid-template-columns: minmax(0, 1fr);
}

.account-status-card {
  display: grid;
  gap: 12px;
  min-height: 168px;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(16, 138, 0, 0.14);
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.98), rgba(247, 250, 243, 0.98)),
    radial-gradient(circle at top right, rgba(16, 138, 0, 0.06), transparent 28%);
}

.account-status-card .panel-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
}

.account-status-card .panel-header .stack-xs {
  min-width: 0;
}

.account-status-card .soft-pill {
  justify-self: end;
}

.account-status-card.is-clear {
  border-color: rgba(45, 173, 87, 0.3);
  background:
    linear-gradient(180deg, rgba(244, 251, 245, 0.98), rgba(235, 247, 237, 0.98)),
    radial-gradient(circle at top right, rgba(45, 173, 87, 0.1), transparent 30%);
}

.account-status-card.is-action-required,
.account-status-card.is-blocked {
  border-color: rgba(255, 191, 36, 0.28);
  background:
    linear-gradient(180deg, rgba(255, 251, 243, 0.98), rgba(255, 244, 226, 0.98)),
    radial-gradient(circle at top right, rgba(255, 196, 61, 0.12), transparent 32%);
}

.account-status-card.is-gap {
  border-style: dashed;
}

.account-status-card strong {
  color: var(--text-strong);
  font-size: 18px;
  line-height: 1.2;
}

.account-status-card .muted,
.account-status-summary .muted {
  color: #5d6657;
}

.account-status-actions {
  margin-top: auto;
}

.account-status-primary {
  border-color: rgba(255, 191, 36, 0.32);
  color: var(--text-strong);
}

@media (max-width: 980px) {
  .account-status-grid {
    grid-template-columns: 1fr;
  }

  .account-status-summary {
    flex-direction: column;
  }
}
</style>
