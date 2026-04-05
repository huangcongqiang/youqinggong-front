<template>
  <div v-if="props.open" class="collaboration-overlay" @click.self="emit('close')">
    <article class="collaboration-card stack-md" role="dialog" aria-modal="true">
      <div class="panel-header collaboration-header">
        <div class="stack-xs collaboration-header-copy">
          <span class="eyebrow">发起合作并进入沟通</span>
          <h3>{{ talentName }}</h3>
          <p class="muted">{{ talentRole }}</p>
        </div>
        <button class="button-secondary" type="button" @click="emit('close')">关闭</button>
      </div>

      <div class="collaboration-summary mini-card stack-sm">
        <span class="eyebrow">当前对象</span>
        <p class="collaboration-summary-text">{{ talentSummary }}</p>
        <div class="tag-row collaboration-summary-tags">
          <span v-if="talentLocation" class="soft-pill">{{ talentLocation }}</span>
          <span v-if="talentScore" class="soft-pill">评分 {{ talentScore }}</span>
          <span v-if="talentResponseTime" class="soft-pill">响应 {{ talentResponseTime }}</span>
        </div>
      </div>

      <article v-if="mode === 'blocked'" class="mini-card stack-sm collaboration-blocked-state">
        <span class="eyebrow">当前无法继续</span>
        <h4>这次点击已经收到，但暂时还不能进入沟通</h4>
        <p class="muted">{{ props.error || '请先完成当前账号的审核或刷新页面后重试。' }}</p>
        <div class="toolbar collaboration-chooser-toolbar">
          <button class="button-secondary" type="button" @click="emit('close')">我知道了</button>
        </div>
      </article>

      <div v-else-if="mode === 'chooser'" class="collaboration-actions stack-sm">
        <p class="muted">先绑定任务，再进入和这位人才的沟通页面。</p>
        <div class="toolbar collaboration-chooser-toolbar">
          <button class="button-primary" type="button" @click="emit('load-existing')">选择已有任务并沟通</button>
          <button class="button-secondary" type="button" @click="emit('choose-new')">新建任务后进入沟通</button>
        </div>
      </div>

      <template v-else>
        <div class="collaboration-actions collaboration-actions-top">
          <div class="stack-xs">
            <span class="eyebrow">已有任务</span>
            <p class="muted">从你当前企业账号下的任务里选一个，选定后会直接进入聊天沟通。</p>
          </div>
          <div class="toolbar collaboration-chooser-toolbar">
            <button class="button-secondary" type="button" @click="emit('back-to-chooser')">返回</button>
            <button class="button-secondary" type="button" @click="emit('choose-new')">新建任务后进入沟通</button>
          </div>
        </div>

        <article v-if="props.loading" class="mini-card stack-sm">
          <span class="eyebrow">读取任务中</span>
          <h4>正在加载可合作任务列表</h4>
          <p class="muted">请稍等，系统会先把当前账号下可协作的任务筛出来。</p>
        </article>

        <article v-else-if="props.error" class="mini-card stack-sm">
          <span class="eyebrow">任务列表异常</span>
          <h4>暂时没读到可合作任务</h4>
          <p class="muted">{{ props.error }}</p>
          <div class="toolbar collaboration-chooser-toolbar">
            <button class="button-secondary" type="button" @click="emit('retry')">重试</button>
            <button class="button-primary" type="button" @click="emit('choose-new')">新建任务后进入沟通</button>
          </div>
        </article>

        <article v-else-if="!props.candidates.length" class="mini-card stack-sm">
          <span class="eyebrow">暂无可用任务</span>
          <h4>当前没有适合继续合作的已有任务</h4>
          <p class="muted">你可以直接新建一个任务，并在发布后自动邀请这位人才。</p>
          <div class="toolbar collaboration-chooser-toolbar">
            <button class="button-secondary" type="button" @click="emit('back-to-chooser')">返回</button>
            <button class="button-primary" type="button" @click="emit('choose-new')">新建任务后进入沟通</button>
          </div>
        </article>

        <div v-else class="collaboration-task-list">
          <article
            v-for="task in props.candidates"
            :key="task.taskId"
            class="collaboration-task-card"
            :class="{ 'is-blocked': !task.canStart }"
          >
            <div class="collaboration-task-head">
              <div class="stack-xs">
                <span class="eyebrow">任务 {{ task.taskId }}</span>
                <h4>{{ task.title }}</h4>
                <p class="muted">{{ task.status }} · {{ task.updatedAt || '更新时间待同步' }}</p>
              </div>
              <span class="soft-pill" :class="{ 'is-warning': !task.canStart }">
                {{ task.selectedTalentName || (task.canStart ? '可继续合作' : '已绑定他人') }}
              </span>
            </div>
            <p v-if="task.blockedReason" class="muted collaboration-task-blocked">{{ task.blockedReason }}</p>
            <div class="toolbar collaboration-task-actions">
              <button
                class="button-primary"
                type="button"
                :disabled="!task.canStart || props.busyTaskId === task.taskId"
                @click="emit('select-task', task)"
              >
                {{ props.busyTaskId === task.taskId ? '正在进入...' : (task.canStart ? '进入沟通' : '不可选择') }}
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

const talentName = computed(() => props.talent?.name || '当前人才');
const talentRole = computed(() => props.talent?.role || '专业方向未公开');
const talentSummary = computed(() => props.talent?.summary || props.talent?.intro || '先看评分、响应速度和可承接服务，再决定合作方式。');
const talentLocation = computed(() => props.talent?.location || '');
const talentScore = computed(() => props.talent?.score || '');
const talentResponseTime = computed(() => props.talent?.responseTime || '');
</script>

<style scoped>
.collaboration-overlay {
  position: fixed;
  inset: 0;
  z-index: 260;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(2, 8, 20, 0.72);
  backdrop-filter: blur(12px);
}

.collaboration-card {
  width: min(960px, 100%);
  max-height: min(88vh, 980px);
  overflow: auto;
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(109, 180, 255, 0.22);
  background:
    linear-gradient(180deg, rgba(10, 18, 34, 0.98), rgba(8, 14, 26, 0.98)),
    radial-gradient(circle at top right, rgba(63, 196, 255, 0.1), transparent 36%);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.42);
}

.collaboration-summary-text {
  margin: 0;
  color: var(--text-strong);
  line-height: 1.6;
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
  border: 1px solid rgba(120, 190, 255, 0.16);
  background: rgba(12, 20, 35, 0.9);
}

.collaboration-task-card.is-blocked {
  opacity: 0.82;
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
</style>
