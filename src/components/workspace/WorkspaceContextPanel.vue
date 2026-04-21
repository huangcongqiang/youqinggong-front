<template>
  <article class="glass-panel workspace-context-panel workspace-pane workspace-pane--context stack-md">
    <div class="panel-header workspace-context-header workspace-section-header">
      <div>
        <span class="eyebrow">合同上下文</span>
        <h3>{{ taskTitle }}</h3>
      </div>
      <span class="soft-pill">{{ taskStatus }}</span>
    </div>

    <article class="mini-card stack-sm workspace-context-overview workspace-card-compact">
      <div class="panel-header">
        <div>
          <span class="eyebrow">合同快照</span>
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

    <article v-if="liveSyncLabel || liveSyncNote" class="mini-card stack-sm workspace-context-feed workspace-card-compact">
      <div class="panel-header">
        <div>
          <span class="eyebrow">合同同步</span>
          <h4>{{ liveSyncLabel || '实时同步' }}</h4>
        </div>
        <span class="soft-pill">{{ liveSyncState || '同步中' }}</span>
      </div>
      <p class="muted">{{ liveSyncNote }}</p>
    </article>

    <article v-if="hasTask" class="result-card workspace-context-gap-card stack-sm">
      <span class="eyebrow">下一步</span>
      <h4>{{ nextStepTitle }}</h4>
      <p class="muted">{{ nextStepSummary }}</p>
      <div class="tag-row">
        <span v-for="item in nextStepPills" :key="item" class="soft-pill">{{ item }}</span>
      </div>
    </article>

    <div class="workspace-kpi-strip workspace-context-facts">
      <article class="mini-card workspace-context-fact workspace-kpi stack-xs">
        <span class="eyebrow">预算</span>
        <strong>{{ taskBudget }}</strong>
        <p class="muted">{{ budgetHint }}</p>
      </article>

      <article class="mini-card workspace-context-fact workspace-kpi stack-xs">
        <span class="eyebrow">周期</span>
        <strong>{{ taskPeriod }}</strong>
        <p class="muted">{{ periodHint }}</p>
      </article>

      <article class="mini-card workspace-context-fact workspace-kpi stack-xs">
        <span class="eyebrow">{{ props.isEnterprise ? '人才' : '企业' }}</span>
        <strong>{{ partnerName }}</strong>
        <p class="muted">{{ partnerHint }}</p>
      </article>

      <article class="mini-card workspace-context-fact workspace-kpi stack-xs">
        <span class="eyebrow">状态</span>
        <strong>{{ taskStatus }}</strong>
        <p class="muted">{{ statusHint }}</p>
      </article>
    </div>

    <article v-if="latestProgressAttachments.length" class="mini-card stack-sm workspace-context-feed workspace-card-compact">
      <div class="panel-header">
        <div>
          <span class="eyebrow">文件</span>
          <h4>{{ latestProgressTitle }}</h4>
        </div>
        <span class="soft-pill">{{ latestProgressAttachments.length }} 个文件</span>
      </div>

      <p class="muted">{{ latestProgressSummary }}</p>

      <div class="workspace-context-attachment-list">
        <button
          v-for="attachment in latestProgressAttachments"
          :key="attachmentKey(attachment)"
          class="soft-pill workspace-context-attachment-pill"
          type="button"
          @click="emit('preview-attachment', attachment)"
        >
          {{ attachmentLabel(attachment) }}
        </button>
      </div>
    </article>

    <article class="mini-card stack-sm workspace-context-feed workspace-card-compact">
      <div class="panel-header">
        <div>
          <span class="eyebrow">阶段更新</span>
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
          <span class="eyebrow">AI 总结</span>
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

    <article class="mini-card stack-sm workspace-context-feed workspace-card-compact">
      <div class="panel-header">
        <div>
          <span class="eyebrow">沟通纪要</span>
          <h4>{{ communicationRecordTitle }}</h4>
        </div>
        <span class="soft-pill">{{ communicationRecordStatus }}</span>
      </div>

      <p class="muted">{{ communicationRecordSummary }}</p>
      <p v-if="communicationRecordSavedAt" class="muted">{{ communicationRecordSavedAt }}</p>

      <div v-if="communicationRecordPoints.length" class="stack-xs">
        <p v-for="item in communicationRecordPoints.slice(0, 3)" :key="item" class="muted">· {{ item }}</p>
      </div>

      <div class="toolbar workspace-context-actions">
        <router-link v-if="messagesRoute" class="button-secondary" :to="messagesRoute">
          打开消息
        </router-link>
        <button v-else class="button-secondary" type="button" @click="emit('open-messages')">
          打开消息
        </button>
      </div>
    </article>

    <article class="mini-card stack-sm workspace-context-feed workspace-card-compact">
      <div class="panel-header">
        <div>
          <span class="eyebrow">验收</span>
          <h4>{{ acceptanceTitle }}</h4>
        </div>
        <span class="soft-pill">{{ acceptanceStatus }}</span>
      </div>

      <p class="muted">{{ acceptanceSummary }}</p>
      <div class="tag-row">
        <span v-if="acceptanceAcceptedAt" class="soft-pill">已验收 {{ acceptanceAcceptedAt }}</span>
        <span v-if="deliveryGrade" class="soft-pill">评级 {{ delivery评级 }}</span>
        <span v-if="deliveryPayoutRatio" class="soft-pill">结算 {{ deliveryPayoutRatio }}</span>
      </div>
    </article>

    <article v-if="showCelebrationBanner" class="result-card workspace-context-celebration stack-sm">
      <span class="eyebrow">合作亮点</span>
      <h4>{{ celebrationBanner.title }}</h4>
      <p class="muted">{{ celebrationBanner.summary }}</p>
      <div class="tag-row">
        <span class="soft-pill">{{ celebrationBanner.badge }}</span>
      </div>
    </article>

    <button class="button-primary workspace-context-button" type="button" @click="emit('open-task-detail')">
      打开当前任务
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
  },
  communicationRecord: {
    type: Object,
    default: null
  },
  liveSyncState: {
    type: String,
    default: ''
  },
  liveSyncLabel: {
    type: String,
    default: ''
  },
  liveSyncNote: {
    type: String,
    default: ''
  },
  messagesRoute: {
    type: [String, Object],
    default: null
  }
});

const emit = defineEmits(['open-task-detail', 'open-messages', 'preview-attachment']);

const normalizedPage = computed(() => objectValue(props.page));
const summary = computed(() => objectValue(normalizedPage.value.summary));
const taskDetail = computed(() => objectValue(normalizedPage.value.taskDetail));
const progress = computed(() => objectValue(props.latestProgress));
const communicationRecord = computed(() => objectValue(props.communicationRecord));
const latestReview = computed(() => {
  const items = listValue(normalizedPage.value.aiReviewHistory);
  return objectValue(items.length ? items[items.length - 1] : null);
});
const celebrationBanner = computed(() => objectValue(normalizedPage.value.celebrationBanner));
const latestProgressAttachments = computed(() => listValue(progress.value.attachments));

const taskTitle = computed(() => firstText([taskDetail.value.title, summary.value.taskName], '当前合作'));
const taskSummary = computed(() =>
  firstText([taskDetail.value.brief, normalizedPage.value.focus, summary.value.description], '当前还没有合作摘要。')
);
const taskStatus = computed(() => firstText([taskDetail.value.status, summary.value.status], props.hasTask ? '进行中' : '尚未创建'));
const taskBudget = computed(() => firstText([taskDetail.value.budget, summary.value.budget], '待确认预算'));
const taskPeriod = computed(() => firstText([taskDetail.value.period, summary.value.range], '待确认周期'));
const budgetHint = computed(() => (taskBudget.value === '待确认预算' ? '预算待确认' : '预算已确认'));
const periodHint = computed(() => (taskPeriod.value === '待确认周期' ? '周期待确认' : '周期已确认'));
const partnerName = computed(() =>
  props.isEnterprise
    ? firstText([summary.value.talent, taskDetail.value.partner, taskDetail.value.company], '待确认人才')
    : firstText([summary.value.business, taskDetail.value.partner, taskDetail.value.company], '待确认企业')
);
const partnerHint = computed(() => (props.isEnterprise ? '当前合作人才' : '当前合作企业'));
const statusHint = computed(() =>
  props.hasTask ? '当前合作已经进入合同视图，后续更新会继续收集在这里。' : '当前还没有可继续的合作。'
);

const latestProgressTitle = computed(() => firstText([progress.value.stage, progress.value.title], '最新进展'));
const latestProgressCompletion = computed(() => firstText([progress.value.completion, progress.value.status], '待同步'));
const latestProgressTime = computed(() =>
  firstText([progress.value.time, progress.value.submittedAt, progress.value.updatedAt], props.hasTask ? '刚刚更新' : '暂无更新')
);
const latestProgressSummary = computed(() =>
  firstText(
    [progress.value.summary, progress.value.note, progress.value.description],
    props.hasTask ? '当前还没有更多进展细节。' : '当前还没有合作记录。'
  )
);
const latestProgressTags = computed(() => {
  const tags = [];
  const author = firstText([progress.value.author], '');
  const attachmentCount = listValue(progress.value.attachments).length;
  const support = firstText([progress.value.supportNeeded], '');

  if (author) tags.push(author);
  if (attachmentCount) tags.push(`${attachmentCount} 个文件`);
  if (support) tags.push(support);

  return tags;
});

const latestReviewTitle = computed(() => firstText([latestReview.value.title], 'AI 总结'));
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

const communicationRecordTitle = computed(() =>
  firstText([communicationRecord.value.title, communicationRecord.value.recordTitle], '沟通纪要')
);
const communicationRecordStatus = computed(() =>
  firstText([communicationRecord.value.status, communicationRecord.value.recordStatus], '暂未生成')
);
const communicationRecordSummary = computed(() =>
  firstText(
    [communicationRecord.value.summary, communicationRecord.value.recordNote, communicationRecord.value.description],
    '当对话和阶段稳定下来后，AI 沟通总结会显示在这里。'
  )
);
const communicationRecordSavedAt = computed(() =>
  firstText([communicationRecord.value.savedAt, communicationRecord.value.updatedAt, communicationRecord.value.time], '')
);
const communicationRecordPoints = computed(() =>
  listValue(communicationRecord.value.keyPoints)
    .concat(listValue(communicationRecord.value.decisions))
    .concat(listValue(communicationRecord.value.openItems))
    .map((item) => String(item || '').trim())
    .filter(Boolean)
);
const acceptanceTitle = computed(() => {
  if (summary.value.acceptedAt) {
    return `已验收 · ${summary.value.acceptedAt}`;
  }
  return firstText([summary.value.nextStep], '待验收');
});
const acceptanceStatus = computed(() => firstText([summary.value.status], '待验收'));
const acceptanceSummary = computed(() =>
  firstText(
    [summary.value.nextStep, normalizedPage.value.earlyCompletion?.gradeNote, normalizedPage.value.acceptance?.note],
    '验收、反馈和结算更新会继续显示在这里。'
  )
);
const acceptanceAcceptedAt = computed(() => firstText([summary.value.acceptedAt, normalizedPage.value.acceptance?.acceptedAt], ''));
const delivery评级 = computed(() => firstText([summary.value.deliveryGrade, normalizedPage.value.earlyCompletion?.grade], ''));
const deliveryPayoutRatio = computed(() => firstText([summary.value.deliveryPayoutRatio, normalizedPage.value.earlyCompletion?.payoutRatio], ''));
const nextStepTitle = computed(() => firstText([summary.value.nextStep, normalizedPage.value.acceptance?.nextStep], '下一步'))
const nextStepSummary = computed(() =>
  props.hasTask
    ? '把更新、文件、验收说明和结算上下文都继续挂在这份合同上。'
    : '先进入一份合同，验收记录和结算摘要才会显示在这里。'
);
const nextStepPills = computed(() => {
  if (deliveryPayoutRatio.value || acceptanceAcceptedAt.value) {
    return ['验收记录', '结算摘要'];
  }
  if (props.hasTask) {
    return ['当前协作', '下一步'];
  }
  return ['待进入协作', '待生成记录'];
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

function attachmentLabel(item) {
  if (typeof item === 'string') {
    return item.trim();
  }
  if (item && typeof item === 'object') {
    return String(item.name || item.fileName || item.filename || item.label || item.title || item.url || '').trim();
  }
  return '';
}

function attachmentKey(item) {
  return attachmentLabel(item) || String(item?.downloadHref || item?.downloadUrl || item?.previewUrl || item?.url || item?.href || item?.path || '');
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
  color: #15201a;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(19, 33, 27, 0.08);
  box-shadow: 0 18px 42px rgba(26, 39, 21, 0.06);
}

.workspace-context-summary {
  margin: 0;
  color: #5d665a;
  line-height: 1.7;
}

.workspace-context-header {
  padding-bottom: 2px;
}

.workspace-context-overview {
  border-color: rgba(19, 33, 27, 0.08);
  background: linear-gradient(180deg, #fff, #f8fbf5);
}

.workspace-context-overview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: #6b7269;
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
  background: #4b9d2f;
  transform: translateY(-50%);
}

.workspace-context-sync {
  border-color: rgba(72, 155, 64, 0.14);
  background: linear-gradient(180deg, #f6fbf3, #ffffff);
}

.workspace-context-attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.workspace-context-attachment-pill {
  border: 1px solid rgba(71, 94, 61, 0.12);
  background: #fff;
  color: #162017;
  cursor: pointer;
}

.workspace-context-attachment-pill:hover {
  border-color: rgba(72, 155, 64, 0.22);
}

.workspace-context-actions {
  display: flex;
  flex-wrap: wrap;
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
  color: #162017;
}

.workspace-context-fact .muted {
  margin: 0;
}

.workspace-context-button {
  align-self: stretch;
  position: sticky;
  bottom: 0;
  margin-top: auto;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(250, 252, 247, 0.98));
  backdrop-filter: blur(12px);
}

.workspace-context-celebration {
  border-color: rgba(255, 216, 102, 0.28);
  background:
    radial-gradient(circle at top right, rgba(255, 216, 102, 0.14), transparent 42%),
    linear-gradient(180deg, #fffdf2, #ffffff);
}

.workspace-context-gap-card {
  border-color: rgba(72, 155, 64, 0.14);
  background:
    radial-gradient(circle at top right, rgba(72, 155, 64, 0.08), transparent 46%),
    linear-gradient(180deg, #f8fbf5, #ffffff);
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
