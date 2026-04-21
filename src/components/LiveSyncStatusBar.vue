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
      return '实时同步';
    case 'fallback':
      return '已切换为轮询';
    case 'paused':
      return '同步已暂停';
    case 'disabled':
      return '同步已关闭';
    case 'connecting':
      return '连接中';
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
      return '合同、审批和概览更新会优先在这里同步。';
    case 'fallback':
      return '如果实时同步暂时不可用，页面会自动切到轮询。';
    case 'paused':
      return String(props.snapshot?.reason || '') === 'hidden'
        ? '页面当前在后台，回到前台后会自动恢复实时同步。'
        : '当前有操作正在提交，完成后会自动恢复实时同步。';
    case 'disabled':
      return String(props.snapshot?.reason || '') === 'missing_token'
        ? '当前没有有效登录状态，实时同步已关闭。'
        : '当前环境没有启用实时同步，可以继续手动刷新或使用轮询。';
    case 'connecting':
      return '正在连接事件流，稍后会自动切换到实时同步。';
    default:
      return '同步状态会显示在这里。';
  }
});

const transportLabel = computed(() => {
  const transport = String(props.snapshot?.transport || '').trim();
  return transport === 'poll' ? '轮询' : '实时流';
});

const reconnectLabel = computed(() => {
  const reconnectCount = Number(props.snapshot?.reconnectCount || 0);
  return reconnectCount > 0 ? `已重连 ${reconnectCount} 次` : '';
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
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.live-sync-status__copy {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.live-sync-status__copy p {
  margin: 0;
  color: rgba(77, 86, 105, 0.84);
  line-height: 1.55;
}

.live-sync-status__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
}

.live-sync-status.is-positive {
  border-color: rgba(20, 168, 0, 0.18);
  background: linear-gradient(135deg, rgba(241, 250, 239, 0.96), rgba(255, 255, 255, 0.98));
}

.live-sync-status.is-warning {
  border-color: rgba(245, 158, 11, 0.22);
  background: linear-gradient(135deg, rgba(255, 247, 229, 0.96), rgba(255, 255, 255, 0.98));
}

.live-sync-status.is-muted {
  border-color: rgba(148, 163, 184, 0.24);
  background: rgba(248, 250, 252, 0.98);
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
