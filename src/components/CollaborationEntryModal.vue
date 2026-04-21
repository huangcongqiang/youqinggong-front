<template>
  <div v-if="props.open" class="collaboration-overlay" @click.self="emit('close')">
    <article class="collaboration-card stack-md" role="dialog" aria-modal="true">
      <div class="panel-header collaboration-header">
        <div class="stack-xs collaboration-header-copy">
          <span class="eyebrow">邀请人才并进入消息</span>
          <h3>{{ talentName }}</h3>
          <p class="muted">{{ talentRole }}</p>
        </div>
        <button class="button-secondary" type="button" @click="emit('close')">关闭</button>
      </div>

      <div class="collaboration-summary mini-card stack-sm">
        <span class="eyebrow">当前人才</span>
        <p class="collaboration-summary-text">{{ talentSummary }}</p>
        <div class="tag-row collaboration-summary-tags">
          <span v-if="talentLocation" class="soft-pill">{{ talentLocation }}</span>
          <span v-if="talentScore" class="soft-pill">评分 {{ talentScore }}</span>
          <span v-if="talentResponseTime" class="soft-pill">响应 {{ talentResponseTime }}</span>
        </div>
      </div>

      <article v-if="decisionTitle || decisionCopy" class="collaboration-decision-strip mini-card stack-sm" :class="`is-${decisionState}`">
        <div class="collaboration-decision-strip__head">
          <div class="stack-xs">
            <span class="eyebrow">当前状态</span>
            <h4>{{ decisionTitle }}</h4>
            <p class="muted">{{ decisionCopy }}</p>
          </div>
          <span v-if="decisionBadge" class="soft-pill collaboration-decision-strip__badge">{{ decisionBadge }}</span>
        </div>
        <div v-if="decisionSteps.length" class="collaboration-decision-steps">
          <span
            v-for="step in decisionSteps"
            :key="step.key || step.label"
            class="collaboration-decision-step"
            :class="{ 'is-current': step.key === decisionState, 'is-done': step.done }"
          >
            {{ step.label }}
          </span>
        </div>
      </article>

      <article v-if="mode === 'blocked'" class="mini-card stack-sm collaboration-blocked-state">
        <span class="eyebrow">当前不可用</span>
        <h4>这个动作暂时还不能继续</h4>
        <p class="muted">{{ props.error || '请先完成账号校验，或刷新页面后再试。' }}</p>
        <div class="toolbar collaboration-chooser-toolbar">
          <button class="button-secondary" type="button" @click="emit('close')">关闭</button>
        </div>
      </article>

      <div v-else-if="mode === 'chooser'" class="collaboration-actions stack-sm">
        <p class="muted">先选择已有任务，或先创建一个新任务，再进入与这个人才的消息页。</p>
        <div class="toolbar collaboration-chooser-toolbar">
          <button class="button-primary" type="button" @click="emit('load-existing')">{{ primaryActionLabel || '使用已有任务' }}</button>
          <button class="button-secondary" type="button" @click="emit('choose-new')">创建新任务</button>
        </div>
      </div>

      <template v-else>
        <div class="collaboration-actions collaboration-actions-top">
          <div class="stack-xs">
            <span class="eyebrow">已有任务</span>
            <p class="muted">从当前已有任务里选一条，直接进入和这个人才的消息页。</p>
          </div>
          <div class="toolbar collaboration-chooser-toolbar">
            <button class="button-secondary" type="button" @click="emit('back-to-chooser')">返回</button>
            <button class="button-secondary" type="button" @click="emit('choose-new')">创建新任务</button>
          </div>
        </div>

        <article v-if="props.loading" class="mini-card stack-sm">
          <span class="eyebrow">加载中</span>
          <h4>正在加载可用任务</h4>
          <p class="muted">请稍等，我们正在找出当前还能继续邀请这个人才的任务。</p>
        </article>

        <article v-else-if="props.error" class="mini-card stack-sm">
          <span class="eyebrow">任务列表</span>
          <h4>暂时无法加载可用任务</h4>
          <p class="muted">{{ props.error }}</p>
          <div class="toolbar collaboration-chooser-toolbar">
            <button class="button-secondary" type="button" @click="emit('retry')">重试</button>
            <button class="button-primary" type="button" @click="emit('choose-new')">创建新任务</button>
          </div>
        </article>

        <article v-else-if="!props.candidates.length" class="mini-card stack-sm">
          <span class="eyebrow">没有可复用任务</span>
          <h4>当前没有适合直接发起邀请的任务</h4>
          <p class="muted">先创建一个新任务，再回来邀请这个人才继续合作。</p>
          <div class="toolbar collaboration-chooser-toolbar">
            <button class="button-secondary" type="button" @click="emit('back-to-chooser')">返回</button>
            <button class="button-primary" type="button" @click="emit('choose-new')">创建新任务</button>
          </div>
        </article>

        <div v-else class="collaboration-task-list">
          <article
            v-for="task in props.candidates"
            :key="task.taskId"
            class="collaboration-task-card"
            :class="{
              'is-blocked': !canSelectTask(task),
              'is-active-flow': taskRelationshipState(task) === 'active',
              'is-pending-flow': taskRelationshipState(task) === 'pending'
            }"
          >
            <div class="collaboration-task-head">
              <div class="stack-xs">
                <span class="eyebrow">任务 {{ task.taskId }}</span>
                <h4>{{ task.title }}</h4>
                <p class="muted">{{ task.status }} · {{ task.updatedAt || '刚刚更新' }}</p>
              </div>
              <span
                class="soft-pill"
                :class="{
                  'is-warning': taskRelationshipState(task) === 'locked',
                  'is-accent': taskRelationshipState(task) === 'pending',
                  'is-success': taskRelationshipState(task) === 'active'
                }"
              >
                {{ taskRelationshipLabel(task) }}
              </span>
            </div>
            <p class="muted collaboration-task-blocked">{{ taskRelationshipNote(task) }}</p>
          <div class="toolbar collaboration-task-actions">
            <button
              v-if="taskRelationshipState(task) === 'active'"
              class="button-secondary"
              type="button"
              :disabled="props.busyTaskId === task.taskId"
              @click="emit('select-task', task)"
            >
                {{ props.busyTaskId === task.taskId ? '打开中...' : (secondaryActionLabel || '打开消息') }}
            </button>
            <button
              class="button-primary"
              type="button"
              :disabled="!canSelectTask(task) || props.busyTaskId === task.taskId"
              @click="emit('select-task', task)"
              >
                {{ props.busyTaskId === task.taskId ? '打开中...' : collaborationPrimaryLabel(task) }}
              </button>
            </div>
          </article>
        </div>
      </template>
    </article>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'chooser'
  },
  talent: {
    type: Object,
    default: null
  },
  decisionState: {
    type: String,
    default: ''
  },
  decisionTitle: {
    type: String,
    default: ''
  },
  decisionCopy: {
    type: String,
    default: ''
  },
  decisionBadge: {
    type: String,
    default: ''
  },
  decisionSteps: {
    type: Array,
    default: () => []
  },
  primaryActionLabel: {
    type: String,
    default: ''
  },
  secondaryActionLabel: {
    type: String,
    default: ''
  },
  candidates: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  busyTaskId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'close',
  'load-existing',
  'choose-new',
  'back-to-chooser',
  'retry',
  'select-task'
]);

const talentName = computed(() => props.talent?.name || 'Selected talent');
const talentRole = computed(() => props.talent?.role || 'Specialty not public');
const talentSummary = computed(() => props.talent?.summary || props.talent?.intro || '先看评分、响应速度和服务范围，再决定是否雇佣或邀请。');
const talentLocation = computed(() => props.talent?.location || '');
const talentScore = computed(() => props.talent?.score || '');
const talentResponseTime = computed(() => props.talent?.responseTime || '');
const targetTalentUserId = computed(() => textOf(props.talent?.talentUserId, props.talent?.platformUserId, props.talent?.id));

function textOf(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

function taskRelationshipState(task) {
  const selectedTalentUserId = textOf(task?.selectedTalentUserId, task?.talentUserId);
  const currentTalentUserId = targetTalentUserId.value;
  const hasExistingRoom = Boolean(textOf(task?.roomKey));

  if (currentTalentUserId && selectedTalentUserId && currentTalentUserId === selectedTalentUserId) {
    return hasExistingRoom ? 'active' : 'pending';
  }

  if (selectedTalentUserId && selectedTalentUserId !== currentTalentUserId) {
    return 'locked';
  }

  return 'fresh';
}

function taskRelationshipLabel(task) {
  const state = taskRelationshipState(task);
  if (state === 'active') {
    return '消息已建立';
  }
  if (state === 'pending') {
    return '已发送邀请';
  }
  if (state === 'locked') {
    return task?.selectedTalentName ? `已锁定给 ${task.selectedTalentName}` : '已锁定给其他人才';
  }
  return '可以邀请';
}

function taskRelationshipNote(task) {
  const state = taskRelationshipState(task);
  if (state === 'active') {
    return '这条任务和当前人才已经建立了消息会话。';
  }
  if (state === 'pending') {
    return '这位人才已经挂到当前任务下，可以继续推进到消息协作。';
  }
  if (state === 'locked') {
    return task?.blockedReason || '这条任务已经绑定到其他人才，当前不能重复使用。';
  }
  return '这条任务可以直接发起邀请，并继续进入消息协作。';
}

function collaborationPrimaryLabel(task) {
  const state = taskRelationshipState(task);
  if (state === 'active') {
    return '打开消息';
  }
  if (state === 'pending') {
    return '继续邀请';
  }
  if (state === 'locked') {
    return '当前不可用';
  }
  return '邀请到任务';
}

function canSelectTask(task) {
  return taskRelationshipState(task) !== 'locked' && Boolean(task?.taskId);
}
</script>

<style scoped>
.collaboration-overlay {
  position: fixed;
  inset: 0;
  z-index: 260;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(17, 24, 39, 0.18);
  backdrop-filter: blur(12px);
}

.collaboration-card {
  width: min(960px, 100%);
  max-height: min(88vh, 980px);
  overflow: auto;
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fffef8;
  box-shadow: 0 28px 56px rgba(15, 23, 42, 0.16);
}

.collaboration-summary-text {
  margin: 0;
  color: var(--text-strong);
  line-height: 1.6;
}

.collaboration-decision-strip {
  border-color: rgba(88, 166, 255, 0.18);
}

.collaboration-decision-strip.is-active {
  border-color: rgba(110, 231, 183, 0.24);
}

.collaboration-decision-strip__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.collaboration-decision-strip__head h4 {
  margin: 0;
  color: var(--text-strong);
}

.collaboration-decision-strip__badge {
  border-color: rgba(88, 166, 255, 0.24);
  background: rgba(88, 166, 255, 0.12);
  color: #a8d1ff;
}

.collaboration-decision-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.collaboration-decision-step {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1;
}

.collaboration-decision-step.is-done {
  border-color: rgba(88, 166, 255, 0.24);
  color: var(--text-strong);
}

.collaboration-decision-step.is-current {
  border-color: rgba(110, 231, 183, 0.3);
  background: rgba(110, 231, 183, 0.1);
  color: #b7f7d5;
}

.collaboration-chooser-toolbar,
.collaboration-task-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.collaboration-task-list {
  display: grid;
  gap: 12px;
}

.collaboration-task-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.98);
}

.collaboration-task-card.is-blocked {
  opacity: 0.82;
}

.collaboration-task-card.is-pending-flow {
  border-color: rgba(88, 166, 255, 0.28);
  box-shadow: inset 0 0 0 1px rgba(88, 166, 255, 0.12);
}

.collaboration-task-card.is-active-flow {
  border-color: rgba(110, 231, 183, 0.3);
  box-shadow: inset 0 0 0 1px rgba(110, 231, 183, 0.14);
}

.collaboration-task-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.collaboration-task-head h4 {
  margin: 0;
  color: var(--text-strong);
}

.collaboration-task-blocked {
  margin: 0;
}

.soft-pill.is-warning {
  border-color: rgba(255, 189, 89, 0.32);
  background: rgba(255, 189, 89, 0.12);
  color: #ffcf84;
}

.soft-pill.is-accent {
  border-color: rgba(88, 166, 255, 0.3);
  background: rgba(88, 166, 255, 0.12);
  color: #a8d1ff;
}

.soft-pill.is-success {
  border-color: rgba(110, 231, 183, 0.28);
  background: rgba(110, 231, 183, 0.12);
  color: #b7f7d5;
}
</style>
