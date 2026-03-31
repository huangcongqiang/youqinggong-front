<template>
  <article class="glass-panel workspace-context-panel workspace-pane workspace-pane--context stack-md">
    <div class="panel-header workspace-context-header workspace-section-header">
      <div>
        <span class="eyebrow">固定上下文</span>
        <h3>{{ taskTitle }}</h3>
      </div>
      <span class="soft-pill">{{ taskStatus }}</span>
    </div>

    <article class="mini-card stack-sm workspace-context-overview workspace-card-compact">
      <div class="panel-header">
        <div>
          <span class="eyebrow">当前协作</span>
          <h4>{{ taskTitle }}</h4>
        </div>
        <span class="soft-pill">{{ taskBudget }}</span>
      </div>
      <p class="workspace-context-summary">{{ taskSummary }}</p>
      <div class="workspace-meta-row workspace-context-overview-meta">
        <span class="workspace-meta-item">{{ taskPeriod }}</span>
        <span class="workspace-meta-item">{{ partnerName }}</span>
        <span class="workspace-meta-item">{{ statusHint }}</span>
      </div>
    </article>

    <div class="workspace-kpi-strip workspace-context-facts">
      <article class="mini-card workspace-context-fact workspace-kpi stack-xs">
        <span class="eyebrow">预算</span>
        <strong>{{ taskBudget }}</strong>
        <p class="muted">{{ budgetHint }}</p>
      </article>

      <article class="mini-card workspace-context-fact workspace-kpi stack-xs">
        <span class="eyebrow">工期</span>
        <strong>{{ taskPeriod }}</strong>
        <p class="muted">{{ periodHint }}</p>
      </article>

      <article class="mini-card workspace-context-fact workspace-kpi stack-xs">
        <span class="eyebrow">合作对象</span>
        <strong>{{ partnerName }}</strong>
        <p class="muted">{{ partnerHint }}</p>
      </article>

      <article class="mini-card workspace-context-fact workspace-kpi stack-xs">
        <span class="eyebrow">协作状态</span>
        <strong>{{ taskStatus }}</strong>
        <p class="muted">{{ statusHint }}</p>
      </article>
    </div>

    <article class="mini-card stack-sm workspace-context-feed workspace-card-compact">
      <div class="panel-header">
        <div>
          <span class="eyebrow">最近提交</span>
          <h4>{{ latestProgressTitle }}</h4>
        </div>
        <span class="soft-pill">{{ latestProgressCompletion }}</span>
      </div>

      <p class="muted">{{ latestProgressTime }}</p>
      <p class="workspace-context-summary">{{ latestProgressSummary }}</p>

      <div v-if="latestProgressTags.length" class="tag-row">
        <span v-for="item in latestProgressTags" :key="item" class="soft-pill">{{ item }}</span>
      </div>
    </article>

    <article v-if="showLatestReview" class="mini-card stack-sm workspace-context-feed workspace-card-compact">
      <div class="panel-header">
        <div>
          <span class="eyebrow">AI 审核</span>
          <h4>{{ latestReviewTitle }}</h4>
        </div>
        <span class="soft-pill">{{ latestReviewStatus }}</span>
      </div>

      <p class="muted">{{ latestReviewTime }}</p>
      <p class="workspace-context-summary">{{ latestReviewSummary }}</p>

      <div v-if="latestReviewTags.length" class="tag-row">
        <span v-for="item in latestReviewTags" :key="item" class="soft-pill">{{ item }}</span>
      </div>
    </article>

    <article v-if="showCelebrationBanner" class="result-card workspace-context-celebration stack-sm">
      <span class="eyebrow">高光时刻</span>
      <h4>{{ celebrationBanner.title }}</h4>
      <p class="muted">{{ celebrationBanner.summary }}</p>
      <div class="tag-row">
        <span class="soft-pill">{{ celebrationBanner.badge }}</span>
      </div>
    </article>

    <button class="button-secondary workspace-context-button" type="button" @click="emit('open-task-detail')">
      查看任务详情
    </button>
  </article>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  page: {
    type: Object,
    default: () => ({})
  },
  isEnterprise: {
    type: Boolean,
    default: false
  },
  hasTask: {
    type: Boolean,
    default: false
  },
  latestProgress: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['open-task-detail']);

const normalizedPage = computed(() => objectValue(props.page));
const summary = computed(() => objectValue(normalizedPage.value.summary));
const taskDetail = computed(() => objectValue(normalizedPage.value.taskDetail));
const progress = computed(() => objectValue(props.latestProgress));
const latestReview = computed(() => {
  const items = listValue(normalizedPage.value.aiReviewHistory);
  return objectValue(items.length ? items[items.length - 1] : null);
});
const celebrationBanner = computed(() => objectValue(normalizedPage.value.celebrationBanner));

const taskTitle = computed(() => firstText([taskDetail.value.title, summary.value.taskName], '当前协作任务'));
const taskSummary = computed(() =>
  firstText([taskDetail.value.brief, normalizedPage.value.focus, summary.value.description], '当前还没有补充任务摘要。')
);
const taskStatus = computed(() => firstText([taskDetail.value.status, summary.value.status], props.hasTask ? '协作中' : '待创建'));
const taskBudget = computed(() => firstText([taskDetail.value.budget, summary.value.budget], '未填写预算'));
const taskPeriod = computed(() => firstText([taskDetail.value.period, summary.value.range], '待确认工期'));
const budgetHint = computed(() => (taskBudget.value === '未填写预算' ? '预算待确认' : '预算已确认'));
const periodHint = computed(() => (taskPeriod.value === '待确认工期' ? '工期待确认' : '工期已确认'));
const partnerName = computed(() =>
  props.isEnterprise
    ? firstText([summary.value.talent, taskDetail.value.partner, taskDetail.value.company], '待确认人才')
    : firstText([summary.value.business, taskDetail.value.partner, taskDetail.value.company], '待确认企业')
);
const partnerHint = computed(() => (props.isEnterprise ? '当前任务对接的人才' : '当前任务所属企业'));
const statusHint = computed(() =>
  props.hasTask ? '任务已进入协作空间，进展会持续在这里沉淀。' : '还没有可协作的任务。'
);

const latestProgressTitle = computed(() => firstText([progress.value.stage, progress.value.title], '最近提交'));
const latestProgressCompletion = computed(() => firstText([progress.value.completion, progress.value.status], '待更新'));
const latestProgressTime = computed(() =>
  firstText([progress.value.time, progress.value.submittedAt, progress.value.updatedAt], props.hasTask ? '刚刚更新' : '暂无提交记录')
);
const latestProgressSummary = computed(() =>
  firstText(
    [progress.value.summary, progress.value.note, progress.value.description],
    props.hasTask ? '当前还没有更多进展说明。' : '暂无协作任务，暂时没有提交记录。'
  )
);
const latestProgressTags = computed(() => {
  const tags = [];
  const author = firstText([progress.value.author], '');
  const attachmentCount = listValue(progress.value.attachments).length;
  const support = firstText([progress.value.supportNeeded], '');

  if (author) tags.push(author);
  if (attachmentCount) tags.push(`附件 ${attachmentCount} 个`);
  if (support) tags.push(support);

  return tags;
});

const latestReviewTitle = computed(() => firstText([latestReview.value.title], 'AI 审核'));
const latestReviewStatus = computed(() => firstText([latestReview.value.status], '已生成'));
const latestReviewTime = computed(() =>
  firstText([latestReview.value.focus, latestReview.value.time, latestReview.value.updatedAt], '最近更新')
);
const latestReviewSummary = computed(() => firstText([latestReview.value.summary], ''));
const latestReviewTags = computed(() => {
  const tags = [];
  const focus = firstText([latestReview.value.focus], '');
  const score = firstText([latestReview.value.score], '');

  if (focus) tags.push(focus);
  if (score) tags.push(`评分 ${score}`);

  return tags;
});

const showLatestReview = computed(() => Boolean(latestReviewSummary.value));
const showCelebrationBanner = computed(() => props.isEnterprise && Boolean(celebrationBanner.value.title));

function firstText(values, fallback = '') {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function listValue(value) {
  return Array.isArray(value) ? value : [];
}
</script>

<style scoped>
.workspace-context-panel {
  position: sticky;
  top: 24px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  overflow: auto;
  padding-right: 6px;
  scrollbar-gutter: stable;
}

.workspace-context-summary {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.7;
}

.workspace-context-header {
  padding-bottom: 2px;
}

.workspace-context-overview {
  border-color: rgba(121, 155, 255, 0.14);
  background: rgba(9, 18, 34, 0.88);
}

.workspace-context-overview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: var(--text-faint);
  font-size: 13px;
  line-height: 1.5;
}

.workspace-context-overview-meta span {
  position: relative;
  padding-left: 10px;
}

.workspace-context-overview-meta span::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(121, 155, 255, 0.7);
  transform: translateY(-50%);
}

.workspace-context-facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.workspace-context-fact strong {
  display: block;
  font-size: 18px;
  line-height: 1.4;
  color: var(--text-strong);
}

.workspace-context-fact .muted {
  margin: 0;
}

.workspace-context-button {
  align-self: stretch;
  position: sticky;
  bottom: 0;
  margin-top: auto;
  background: linear-gradient(180deg, rgba(11, 20, 38, 0.92), rgba(9, 18, 34, 0.98));
  backdrop-filter: blur(16px);
}

.workspace-context-celebration {
  border-color: rgba(255, 216, 102, 0.24);
  background:
    radial-gradient(circle at top right, rgba(255, 216, 102, 0.14), transparent 42%),
    linear-gradient(180deg, rgba(22, 42, 86, 0.92), rgba(10, 22, 44, 0.92));
}

@media (max-width: 1360px) {
  .workspace-context-panel {
    position: static;
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }

  .workspace-context-facts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 980px) {
  .workspace-context-panel {
    top: 0;
  }
}
</style>
