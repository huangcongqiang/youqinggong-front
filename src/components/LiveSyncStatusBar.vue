<template>
  <article v-if="visible" class="live-sync-status" :class="`is-${tone}`">
    <div class="live-sync-status__copy">
      <span class="eyebrow">{{ title }}</span>
      <p>{{ description }}</p>
    </div>
    <div class="live-sync-status__meta">
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
    return props.errorNote;
  }
  switch (String(props.snapshot?.state || '')) {
    case 'open':
      return '关键任务、审批和协作更新会优先实时刷新。';
    case 'fallback':
      return '连接波动时会自动切到轮询同步，避免你错过最新状态。';
    case 'paused':
      return String(props.snapshot?.reason || '') === 'hidden'
        ? '当前页面不可见，实时同步会在回到前台后自动恢复。'
        : '当前操作进行中，实时同步会在动作结束后自动恢复。';
    case 'disabled':
      return String(props.snapshot?.reason || '') === 'missing_token'
        ? '当前未拿到登录态，实时同步已关闭。'
        : '当前环境未启用实时同步，会保留手动刷新和轮询兜底。';
    case 'connecting':
      return '正在建立事件流连接，稍后会自动进入实时同步。';
    default:
      return '当前同步状态会在这里显示。';
  }
});

const transportLabel = computed(() => {
  const transport = String(props.snapshot?.transport || '').trim();
  return transport === 'poll' ? '轮询通道' : '事件流';
});

const reconnectLabel = computed(() => {
  const reconnectCount = Number(props.snapshot?.reconnectCount || 0);
  return reconnectCount > 0 ? `重连 ${reconnectCount} 次` : '';
});
</script>

<style scoped>
.live-sync-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(141, 190, 255, 0.14);
  background: rgba(11, 18, 32, 0.78);
}

.live-sync-status__copy {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.live-sync-status__copy p {
  margin: 0;
  color: var(--text-soft, rgba(224, 232, 255, 0.72));
  line-height: 1.55;
}

.live-sync-status__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.live-sync-status.is-positive {
  border-color: rgba(81, 216, 155, 0.22);
  background: linear-gradient(135deg, rgba(12, 29, 24, 0.82), rgba(10, 18, 32, 0.82));
}

.live-sync-status.is-warning {
  border-color: rgba(255, 188, 84, 0.22);
  background: linear-gradient(135deg, rgba(32, 25, 12, 0.82), rgba(10, 18, 32, 0.82));
}

.live-sync-status.is-muted {
  border-color: rgba(138, 150, 175, 0.2);
  background: rgba(13, 19, 31, 0.68);
}

@media (max-width: 960px) {
  .live-sync-status {
    flex-direction: column;
    align-items: flex-start;
  }

  .live-sync-status__meta {
    justify-content: flex-start;
  }
}
</style>
