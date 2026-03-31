<template>
  <article class="glass-panel workspace-task-rail workspace-pane workspace-pane--rail stack-md">
    <div class="panel-header workspace-section-header">
      <div>
        <span class="eyebrow">任务树</span>
        <h3>{{ isEnterprise ? '当前协作任务' : '我的执行任务' }}</h3>
      </div>
      <div class="workspace-task-rail-head-meta">
        <span class="soft-pill">{{ safeTaskOptions.length }} 个</span>
        <span v-if="activeTask?.focus" class="workspace-task-rail-head-note">{{ activeTask.focus }}</span>
      </div>
    </div>

    <div v-if="safeTaskOptions.length" class="workspace-task-rail-list">
      <button
        v-for="task in safeTaskOptions"
        :key="task.taskId"
        class="workspace-task-rail-card workspace-card-compact"
        :class="{ 'is-active': task.taskId === currentTaskId }"
        type="button"
        @click="$emit('select-task', task.taskId)"
      >
        <div class="workspace-task-rail-card-top">
          <div class="workspace-task-rail-card-copy">
            <p class="workspace-task-rail-card-status">{{ task.status || '待处理' }}</p>
            <h4>{{ task.title }}</h4>
          </div>
          <span class="workspace-task-rail-card-completion">{{ task.completion || '待同步' }}</span>
        </div>

        <p class="workspace-task-rail-card-summary">{{ task.summary }}</p>

        <div class="workspace-meta-row">
          <span class="workspace-meta-item">{{ task.partnerLabel }}</span>
          <span class="workspace-meta-item">{{ task.budget || '未填写预算' }}</span>
          <span class="workspace-meta-item">{{ task.period || '待确认工期' }}</span>
        </div>

        <div class="workspace-task-rail-card-meta">
          <span>{{ task.lastSync || '待更新' }}</span>
          <span>{{ task.focus || '等待处理' }}</span>
        </div>
      </button>
    </div>

    <article v-else class="mini-card stack-sm workspace-task-rail-empty">
      <h4>{{ isEnterprise ? '还没有协作任务' : '还没有执行任务' }}</h4>
      <p class="muted">{{ isEnterprise ? '发布任务并确认人才后，这里会出现任务切换列表。' : '接单并确认任务后，这里会出现执行中的任务。' }}</p>
    </article>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  taskOptions: {
    type: Array,
    default: () => []
  },
  currentTaskId: {
    type: String,
    default: ''
  },
  isEnterprise: {
    type: Boolean,
    default: false
  }
});

defineEmits(['select-task']);

const safeTaskOptions = computed(() =>
  (Array.isArray(props.taskOptions) ? props.taskOptions : [])
    .map((task) => normalizeTaskOption(task, props.isEnterprise))
    .filter((task) => task.taskId)
);
const activeTask = computed(() =>
  safeTaskOptions.value.find((task) => task.taskId === props.currentTaskId) || null
);

function normalizeTaskOption(task, isEnterprise) {
  const item = task && typeof task === 'object' ? task : {};
  return {
    taskId: stringValue(item.taskId),
    title: firstText([item.title, item.taskName, item.name], '未命名任务'),
    status: firstText([item.status, item.phase, item.stage, item.latestNode], '待处理'),
    summary: firstText([item.summary, item.range, item.period, item.brief], '当前还没有更多任务摘要。'),
    completion: firstText([item.completion, item.progress], ''),
    budget: stringValue(item.budget, ''),
    period: firstText([item.period, item.range], ''),
    lastSync: firstText([item.lastSync, item.latestSync, item.updatedAt, item.time], ''),
    focus: firstText([item.focus, item.note], ''),
    partnerLabel: isEnterprise
      ? `人才 · ${firstText([item.partnerName, item.talentName, item.assignee], '待确认')}`
      : `企业 · ${firstText([item.partnerName, item.businessName, item.company], '待确认')}`
  };
}

function stringValue(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function firstText(values, fallback = '') {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}
</script>

<style scoped>
.workspace-task-rail {
  min-height: 100%;
}

.workspace-task-rail-head-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.workspace-task-rail-head-note {
  color: var(--text-faint);
  font-size: 12px;
}

.workspace-task-rail-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.workspace-task-rail-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 18px 18px 18px 20px;
  border-radius: 24px;
  border: 1px solid rgba(121, 155, 255, 0.12);
  background: rgba(9, 18, 34, 0.9);
  color: inherit;
  text-align: left;
  transition: border-color 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.workspace-task-rail-card::before {
  content: "";
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 0;
  width: 3px;
  border-radius: 999px;
  background: transparent;
  transition: background 0.2s ease;
}

.workspace-task-rail-card:hover {
  transform: translateY(-2px);
  border-color: rgba(76, 201, 255, 0.22);
}

.workspace-task-rail-card.is-active {
  border-color: rgba(76, 201, 255, 0.32);
  background: linear-gradient(180deg, rgba(19, 33, 61, 0.96), rgba(10, 18, 34, 0.96));
  box-shadow: inset 0 0 0 1px rgba(76, 201, 255, 0.12);
}

.workspace-task-rail-card.is-active::before {
  background: linear-gradient(180deg, rgba(76, 201, 255, 0.92), rgba(118, 102, 255, 0.88));
}

.workspace-task-rail-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.workspace-task-rail-card-copy {
  min-width: 0;
}

.workspace-task-rail-card-top h4 {
  margin: 6px 0 0;
  font-size: 18px;
  line-height: 1.35;
}

.workspace-task-rail-card-completion {
  color: var(--text-strong);
  font-size: 13px;
  white-space: nowrap;
}

.workspace-task-rail-card-status {
  margin: 0;
  color: var(--text-faint);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workspace-task-rail-card-summary {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.7;
}

.workspace-task-rail-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  color: var(--text-faint);
  font-size: 13px;
}

.workspace-task-rail-empty {
  min-height: 180px;
  justify-content: center;
}
</style>
