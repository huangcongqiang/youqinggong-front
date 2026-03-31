<template>
  <article v-if="visible" class="mobile-live-sync-status" :class="`is-${tone}`">
    <div class="stack-xs">
      <span class="eyebrow">{{ title }}</span>
      <p class="muted">{{ description }}</p>
    </div>
    <div class="tag-row">
      <span class="soft-pill">{{ transportLabel }}</span>
      <span v-if="reconnectLabel" class="soft-pill">{{ reconnectLabel }}</span>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  snapshot: {
    type: Object,
    default: null
  },
  errorNote: {
    type: String,
    default: ''
  }
});

const visible = computed(() => {
  const state = String(props.snapshot?.state || '').trim();
  return Boolean(state && state !== 'disposed');
});

const tone = computed(() => {
  switch (String(props.snapshot?.state || '')) {
    case 'open':
      return 'positive';
    case 'fallback':
      return 'warning';
    case 'paused':
      return 'neutral';
    case 'disabled':
      return 'muted';
    default:
      return 'neutral';
  }
});

const title = computed(() => {
  switch (String(props.snapshot?.state || '')) {
    case 'open':
      return '实时同步中';
    case 'fallback':
      return '已切换轮询';
    case 'paused':
      return '实时同步已暂停';
    case 'disabled':
      return '实时同步未启用';
    case 'connecting':
      return '正在连接实时同步';
    default:
      return '同步状态';
  }
});

const description = computed(() => {
  if (props.errorNote) {
    return '连接波动，页面已切到轮询。';
  }
  switch (String(props.snapshot?.state || '')) {
    case 'open':
      return '关键变化会自动同步。';
    case 'fallback':
      return '当前已切到轮询同步。';
    case 'paused':
      return String(props.snapshot?.reason || '') === 'hidden'
        ? '回到前台后会自动恢复。'
        : '当前动作结束后会自动恢复。';
    case 'disabled':
      return String(props.snapshot?.reason || '') === 'missing_token'
        ? '当前未拿到登录态。'
        : '当前环境未启用实时同步。';
    case 'connecting':
      return '正在建立连接。';
    default:
      return '这里会显示当前同步状态。';
  }
});

const transportLabel = computed(() => {
  return String(props.snapshot?.transport || '') === 'poll' ? '轮询通道' : '事件流';
});

const reconnectLabel = computed(() => {
  const reconnectCount = Number(props.snapshot?.reconnectCount || 0);
  return reconnectCount > 0 ? `重连 ${reconnectCount} 次` : '';
});
</script>

<style scoped>
.mobile-live-sync-status {
  display: grid;
  gap: 0.55rem;
  padding: 0.8rem 0.9rem;
  border-radius: 0.9rem;
  border: 1px solid rgba(121, 155, 255, 0.12);
  background: rgba(8, 15, 28, 0.72);
}

.mobile-live-sync-status.is-positive {
  border-color: rgba(81, 216, 155, 0.22);
  background: linear-gradient(135deg, rgba(11, 33, 25, 0.86), rgba(8, 15, 28, 0.8));
}

.mobile-live-sync-status.is-warning {
  border-color: rgba(255, 190, 96, 0.22);
  background: linear-gradient(135deg, rgba(35, 25, 12, 0.86), rgba(8, 15, 28, 0.8));
}

.mobile-live-sync-status.is-muted {
  border-color: rgba(142, 151, 170, 0.18);
  background: rgba(11, 18, 30, 0.72);
}

.mobile-live-sync-status .muted {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
}
</style>
