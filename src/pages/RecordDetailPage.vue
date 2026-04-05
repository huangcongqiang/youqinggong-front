<template>
  <section class="page-stack record-page record-detail-page office-detail-page">
    <article v-if="page?.requestError" class="result-card stack-sm">
      <span class="eyebrow">数据同步失败</span>
      <h3>当前展示的是空态详情</h3>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <article class="hero-card record-detail-hero office-detail-hero stack-md">
      <div class="panel-header panel-header-top record-detail-hero-header">
        <SectionTitle
          :eyebrow="audience === 'talent' ? '人才接单记录' : '企业发单记录'"
          :title="record?.title || '记录详情'"
          :description="record ? lead : '当前记录不存在或已被移除。'"
          tag="h1"
        />
        <div class="record-detail-hero-actions office-detail-actions">
          <router-link class="button-secondary" :to="backRoute">{{ backLabel }}</router-link>
          <a class="button-secondary" href="#record-actions">主动作</a>
          <a class="button-secondary" href="#record-basis">依据</a>
        </div>
      </div>

      <div v-if="record" class="record-detail-hero-strip">
        <div id="record-conclusion" class="record-detail-hero-copy">
          <span class="eyebrow">当前结论</span>
          <strong class="record-detail-stage">{{ stageLabel }}</strong>
          <p class="muted record-detail-conclusion-text">{{ overviewText }}</p>

          <div class="record-detail-factline">
            <span>{{ partnerLabel }}：{{ partnerName }}</span>
            <span>{{ amountValue }}</span>
            <span>{{ dateRangeLabel }}</span>
          </div>

          <div class="tag-row">
            <span v-for="tag in summaryHeadlineTags" :key="tag" class="soft-pill">{{ tag }}</span>
          </div>
        </div>

        <div id="record-actions" class="record-detail-hero-links">
          <div class="record-detail-action-copy">
            <span class="eyebrow">主动作</span>
            <h3>直接推进处理</h3>
          </div>
          <router-link class="button-primary" :to="chatRoute">进入聊天</router-link>
          <router-link class="button-secondary" :to="workspaceRoute">查看协作空间</router-link>
          <router-link class="button-secondary" :to="acceptanceRoute">查看验收与评分</router-link>
        </div>
      </div>
    </article>

    <article v-if="record" class="glass-panel record-detail-shell office-detail-shell stack-lg">
      <div id="record-basis" class="record-detail-grid record-detail-grid-balanced record-detail-basis-grid">
        <article class="mini-card stack-sm record-detail-basis-card">
          <div class="panel-header">
            <div>
              <span class="eyebrow">决策依据</span>
              <h3>为什么现在是这个结论</h3>
            </div>
          </div>

          <ul class="dashboard-detail-list record-detail-basis-facts">
            <li>金额：{{ amountValue }}</li>
            <li>周期：{{ dateRangeLabel }}</li>
            <li>{{ gradeLabel }}：{{ ratingValue }}</li>
            <li>阶段：{{ stageLabel }}</li>
          </ul>

          <div v-if="keyResults.length" class="record-detail-note-list">
            <div v-for="item in keyResults" :key="`${item.label}-${item.text}`" class="record-detail-note-item">
              <span class="record-detail-note-dot"></span>
              <p class="muted">
                <strong>{{ item.label }}：</strong>{{ item.text }}
              </p>
            </div>
          </div>
        </article>

        <article class="mini-card stack-sm record-detail-basis-card">
          <div class="panel-header">
            <div>
              <span class="eyebrow">主动作留痕</span>
              <h3>执行和确认留下了什么</h3>
            </div>
          </div>

          <div v-if="deliverables.length" class="record-detail-note-list">
            <div v-for="item in deliverables" :key="item" class="record-detail-note-item">
              <span class="record-detail-note-dot"></span>
              <p class="muted">{{ item }}</p>
            </div>
          </div>
          <p v-else class="muted">当前没有单独拆出的交付件，任务说明会继续在聊天和协作里补齐。</p>

          <div v-if="confirmationHistory.length" class="record-detail-note-list record-detail-confirmation-list">
            <div v-for="item in confirmationHistory" :key="`${item.time}-${item.action}`" class="record-detail-note-item">
              <span class="record-detail-note-dot"></span>
              <p class="muted">{{ item.time || '待同步' }} · {{ item.action || '任务确认' }}{{ item.note ? `：${item.note}` : '' }}</p>
            </div>
          </div>
        </article>
      </div>

      <article id="record-timeline" class="mini-card stack-sm record-detail-timeline-card">
        <div class="panel-header">
          <div>
            <span class="eyebrow">过程链路</span>
            <h3>记录是怎么推进到现在的</h3>
          </div>
        </div>

        <div class="record-detail-timeline">
          <div v-for="step in timelineItems" :key="`${step.time}-${step.title}`" class="record-detail-step">
            <span class="record-detail-step-time">{{ step.time }}</span>
            <div>
              <h4>{{ step.title }}</h4>
              <p class="muted">{{ step.note }}</p>
            </div>
          </div>
        </div>
      </article>

      <article class="mini-card stack-sm record-detail-progress-card">
        <div class="panel-header">
          <div>
            <span class="eyebrow">进展记录</span>
            <h3>每次推进和对应附件</h3>
          </div>
        </div>

        <div v-if="progressItems.length" class="record-detail-progress-list">
          <article
            v-for="item in progressItems"
            :key="item.key"
            class="record-detail-progress-item"
          >
            <div class="record-detail-progress-head">
              <div class="stack-xs">
                <strong>{{ item.progress || item.completion || item.stage || item.status || '已提交进展更新' }}</strong>
                <p class="muted">{{ item.summary || item.description || '暂无说明' }}</p>
                <p class="muted">
                  <template v-if="item.progress">进度：{{ item.progress }}</template>
                  <template v-if="item.progress && (item.time || item.stage || item.completion || item.status)"> · </template>
                  {{ item.time || '待同步' }}
                  <template v-if="item.stage"> · {{ item.stage }}</template>
                  <template v-if="item.completion"> · {{ item.completion }}</template>
                  <template v-if="item.status"> · {{ item.status }}</template>
                </p>
              </div>
            </div>

            <p class="muted">AI 审核：{{ item.aiReviewSummary || '暂无 AI 审核' }}</p>

            <div v-if="item.attachments.length" class="record-asset-list record-progress-asset-list">
              <div
                v-for="asset in item.attachments"
                :key="`${item.key}-${asset.updatedAt}-${asset.name}`"
                class="record-asset-item"
              >
                <div class="stack-xs">
                  <strong>{{ asset.name }}</strong>
                  <p class="muted">{{ asset.type || '附件' }} · {{ asset.updatedAt || '待同步' }}</p>
                </div>
                <a
                  v-if="asset.downloadHref"
                  class="button-secondary"
                  :href="asset.downloadHref"
                  :download="asset.name"
                  target="_blank"
                  rel="noreferrer"
                >
                  下载
                </a>
              </div>
            </div>
            <p v-else class="muted">这次进展没有单独上传附件。</p>
          </article>
        </div>
        <p v-else class="muted">当前还没有进展记录，后续提交的阶段更新会在这里逐条沉淀。</p>
      </article>

      <article v-if="financeSections.length" class="mini-card stack-sm record-detail-finance-card">
        <div class="panel-header">
          <div>
            <span class="eyebrow">财务收口</span>
            <h3>请款、开票、对账、结算、争议</h3>
          </div>
        </div>

        <div class="stack-md">
          <article v-for="section in financeSections" :key="section.key" class="mini-card stack-sm">
            <div class="panel-header">
              <div>
                <span class="eyebrow">{{ section.badge }}</span>
                <h4>{{ section.title }}</h4>
              </div>
              <span class="soft-pill">{{ section.status }}</span>
            </div>

            <p class="muted">{{ section.summary }}</p>
            <p v-if="section.note" class="muted">{{ section.note }}</p>

            <div v-if="section.meta.length" class="tag-row">
              <span v-for="meta in section.meta" :key="`${section.key}-${meta}`" class="soft-pill">{{ meta }}</span>
            </div>

            <div v-if="section.actions.length" class="tag-row">
              <span v-for="action in section.actions" :key="`${section.key}-${action.code}`" class="soft-pill">
                {{ action.label }}
              </span>
            </div>

            <div v-if="section.actions.length" class="toolbar">
              <router-link class="button-secondary" :to="acceptanceRoute">去验收页处理</router-link>
            </div>
          </article>
        </div>
      </article>

      <article id="record-assets" class="mini-card stack-sm record-detail-assets-card">
        <div class="panel-header">
          <div>
            <span class="eyebrow">附件沉淀</span>
            <h3>已保留下来的文件和素材</h3>
          </div>
        </div>

        <div v-if="assetFiles.length" class="record-asset-list">
          <div v-for="asset in assetFiles" :key="`${asset.updatedAt}-${asset.name}`" class="record-asset-item">
            <div class="stack-xs">
              <strong>{{ asset.name }}</strong>
              <p class="muted">{{ asset.type || '附件' }} · {{ asset.updatedAt || '待同步' }}</p>
            </div>
            <a
              v-if="asset.downloadHref"
              class="button-secondary"
              :href="asset.downloadHref"
              :download="asset.name"
              target="_blank"
              rel="noreferrer"
            >
              下载
            </a>
          </div>
        </div>
        <p v-else class="muted">当前还没有沉淀附件，后续上传的图片、视频和文件会保留在这里。</p>
      </article>
    </article>

    <article v-else class="glass-panel record-empty-state stack-md">
      <span class="eyebrow">记录未找到</span>
      <h3>这条记录可能已被删除或参数有误</h3>
      <p class="muted">先返回列表，重新选择一条可查看的记录。</p>
      <router-link class="button-primary" :to="backRoute">{{ backLabel }}</router-link>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import { buildRecordDetailViewModel } from './recordDetailViewModel.js';
import { roleRouteMap } from '../utils/roleRoutes';
import {
  buildCenterReturnQuery,
  buildChildObjectPageContext,
  labelForObjectPageSource,
  readObjectPageContext,
  resolveImmediateOriginContext
} from '../utils/objectPageContext.js';
import { getOrderRecordDetail } from '../services/api';

const route = useRoute();

const audience = computed(() => (route.meta?.audience === 'talent' ? 'talent' : 'enterprise'));
const page = ref(null);
const record = computed(() => page.value?.record || null);
const activeTab = computed(() => normalizeTab(route.query.tab));
const lead = computed(() =>
  audience.value === 'talent'
    ? '按接单、执行和验收回看这一单，先看结论和关键依据。'
    : '按发单、执行和结算回看这一单，先看结论和关键依据。'
);
const partnerLabel = computed(() => (audience.value === 'talent' ? '合作企业' : '合作人才'));
const gradeLabel = computed(() => (audience.value === 'talent' ? '企业评级' : '我的评级'));
const pageContext = computed(() =>
  readObjectPageContext(route.query, {
    recordId: route.params.recordId,
    taskId: record.value?.taskId,
    room: record.value?.roomKey
  })
);
const entrySource = computed(() => pageContext.value.source);
const currentItemId = computed(() => pageContext.value.itemId);
const currentGroupKey = computed(() => pageContext.value.group);
const currentTaskId = computed(() => pageContext.value.taskId);
const currentRecordId = computed(() => pageContext.value.recordId);
const currentRoomKey = computed(() => pageContext.value.room);
const originContext = computed(() =>
  resolveImmediateOriginContext({
    entrySource: entrySource.value,
    query: route.query,
    defaults: {
      recordId: route.params.recordId,
      taskId: record.value?.taskId,
      room: record.value?.roomKey
    },
    allowedSources: ['approvals', 'notifications', 'messages', 'workspace', 'acceptance', 'records']
  })
);

function routeForRecordImmediateSource(source, queryBuilder) {
  if (source === 'messages') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages,
      query: queryBuilder()
    };
  }

  if (source === 'workspace') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace,
      query: queryBuilder()
    };
  }

  if (source === 'acceptance') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.acceptance : roleRouteMap.enterprise.acceptance,
      query: queryBuilder()
    };
  }

  if (source === 'approvals') {
    return {
      path: roleRouteMap.enterprise.approvals,
      query: buildCenterReturnQuery({
        current: pageContext.value,
        origin: originContext.value
      })
    };
  }

  if (source === 'notifications') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.notifications : roleRouteMap.enterprise.notifications,
      query: buildCenterReturnQuery({
        current: pageContext.value,
        origin: originContext.value
      })
    };
  }

  if (source === 'records') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.records : roleRouteMap.enterprise.records,
      query: activeTab.value ? { tab: activeTab.value } : {}
    };
  }

  return null;
}

const backRoute = computed(() => {
  const directRoute = routeForRecordImmediateSource(entrySource.value, () => recordContextQuery.value);
  if (directRoute) {
    return directRoute;
  }

  if (entrySource.value === 'record-detail') {
    const originRoute = routeForRecordImmediateSource(originContext.value.source, () => recordContextQuery.value);
    if (originRoute) {
      return originRoute;
    }
  }

  return {
    path: audience.value === 'talent' ? roleRouteMap.talent.records : roleRouteMap.enterprise.records,
    query: { tab: activeTab.value }
  };
});
const backLabel = computed(() => {
  const source = entrySource.value === 'record-detail' ? originContext.value.source : entrySource.value;
  return labelForObjectPageSource(source, '返回记录列表');
});
const recordContextQuery = computed(() =>
  buildChildObjectPageContext({
    current: pageContext.value,
    origin: originContext.value,
    overrides: {
      itemId: currentItemId.value,
      group: currentGroupKey.value,
      recordId: currentRecordId.value,
      taskId: currentTaskId.value,
      room: currentRoomKey.value,
      source: 'record-detail',
      tab: activeTab.value
    }
  })
);
const workspaceRoute = computed(() => ({
  path: audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace,
  query: recordContextQuery.value
}));
const acceptanceRoute = computed(() => ({
  path: audience.value === 'talent' ? roleRouteMap.talent.acceptance : roleRouteMap.enterprise.acceptance,
  query: recordContextQuery.value
}));
const chatRoute = computed(() => ({
  path: audience.value === 'talent' ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages,
  query: recordContextQuery.value
}));
const pageSummary = computed(() => page.value?.summary || {});
const detailViewModel = computed(() =>
  buildRecordDetailViewModel(record.value, {
    fallbackLead: lead.value,
    availableActions: pageSummary.value?.availableActions
  })
);
const overviewText = computed(() => detailViewModel.value.overviewText);
const stageLabel = computed(() => detailViewModel.value.stageLabel);
const partnerName = computed(() => detailViewModel.value.partnerName);
const amountValue = computed(() => detailViewModel.value.amountValue);
const dateRangeLabel = computed(() => detailViewModel.value.dateRangeLabel);
const ratingValue = computed(() => detailViewModel.value.ratingValue);
const summaryTags = computed(() => detailViewModel.value.summaryTags);
const summaryHeadlineTags = computed(() => summaryTags.value.slice(0, 2));
const timelineItems = computed(() => detailViewModel.value.timelineItems);
const deliverables = computed(() => detailViewModel.value.deliverables);
const assetFiles = computed(() => detailViewModel.value.assetFiles);
const progressItems = computed(() => detailViewModel.value.progressItems);
const financeSections = computed(() => detailViewModel.value.financeSections);
const keyResults = computed(() => detailViewModel.value.keyResults);
const confirmationHistory = computed(() => detailViewModel.value.confirmationHistory);

function normalizeTab(value) {
  if (value === 'ongoing' || value === 'completed' || value === 'all') {
    return value;
  }
  return 'all';
}

async function loadDetail() {
  try {
    page.value = await getOrderRecordDetail(audience.value, String(route.params.recordId || ''));
  } catch (error) {
    page.value = {
      requestError: error?.message || '记录详情读取失败，请稍后重试。',
      record: null
    };
  }
}

watch(
  () => [audience.value, route.params.recordId],
  () => {
    void loadDetail();
  }
);

onMounted(() => {
  void loadDetail();
});
</script>

<style scoped>
.record-detail-page {
  --detail-panel: #ffffff;
  --detail-soft: #f7f9fc;
  --detail-border: #d9e1ea;
  --detail-border-strong: #c7d5e4;
  --detail-text: #132238;
  --detail-muted: #627389;
  --detail-accent: #1562c5;
  gap: 20px;
  padding-bottom: 36px;
  color: var(--detail-text);
}

.record-detail-page :is(.hero-card, .glass-panel, .mini-card, .result-card) {
  background: var(--detail-panel);
  border: 1px solid var(--detail-border);
  box-shadow: 0 18px 40px rgba(15, 35, 63, 0.08);
  backdrop-filter: none;
}

.record-detail-page .muted {
  color: var(--detail-muted);
}

.record-detail-page .soft-pill {
  border: 1px solid var(--detail-border);
  background: #f6f8fb;
  color: #27415e;
  box-shadow: none;
}

.record-detail-page :is(.button-primary, .button-secondary) {
  min-height: 42px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: none;
}

.record-detail-page .button-primary {
  background: var(--detail-accent);
  border-color: var(--detail-accent);
}

.record-detail-page .button-secondary {
  background: #ffffff;
  border-color: var(--detail-border-strong);
  color: var(--detail-text);
}

.record-detail-hero {
  gap: 14px;
  padding: 24px 28px;
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 249, 253, 0.98)),
    radial-gradient(circle at top right, rgba(21, 98, 197, 0.12), transparent 36%);
}

.record-detail-hero-header {
  align-items: flex-start;
  gap: 16px;
}

.record-detail-hero :deep(.section-title h1) {
  font-size: clamp(28px, 3.2vw, 38px);
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.record-detail-hero :deep(.section-title p) {
  max-width: 54ch;
  font-size: 13px;
  line-height: 1.5;
}

.record-detail-hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.record-detail-hero-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.9fr);
  gap: 14px;
  align-items: start;
  padding: 18px;
  border-radius: 22px;
  background:
    linear-gradient(180deg, #ffffff, #f7fafc),
    radial-gradient(circle at top right, rgba(21, 98, 197, 0.08), transparent 38%);
  border: 1px solid var(--detail-border);
}

.record-detail-stage {
  display: block;
  margin: 4px 0;
  font-size: clamp(20px, 3vw, 26px);
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.record-detail-hero-links {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  border-radius: 18px;
  background: var(--detail-soft);
  border: 1px solid var(--detail-border);
}

.record-detail-action-copy {
  display: grid;
  gap: 4px;
}

.record-detail-conclusion-text {
  max-width: 56ch;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.record-detail-factline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 12px;
}

.record-detail-factline span {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  border-radius: 999px;
  background: #f6f8fb;
  border: 1px solid var(--detail-border);
}

.record-detail-shell {
  padding: 22px;
  border-radius: 26px;
}

.record-detail-grid {
  display: grid;
  gap: 14px;
}

.record-detail-grid-balanced {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.record-detail-basis-grid {
  align-items: start;
}

.record-detail-basis-card,
.record-detail-timeline-card,
.record-detail-progress-card,
.record-detail-assets-card,
.record-detail-finance-card {
  min-height: 100%;
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f8fbfe);
}

.record-detail-page #record-conclusion,
.record-detail-page #record-actions,
.record-detail-page #record-basis {
  scroll-margin-top: 96px;
}

.record-detail-basis-facts {
  margin-bottom: 12px;
}

.record-detail-note-list {
  display: grid;
  gap: 10px;
}

.record-detail-confirmation-list {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--detail-border);
}

.record-detail-note-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.record-detail-note-dot {
  width: 10px;
  height: 10px;
  margin-top: 8px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2d76dc, #7fb2f0);
  box-shadow: 0 0 0 4px rgba(45, 118, 220, 0.1);
}

.record-detail-timeline {
  display: grid;
  gap: 0;
}

.record-detail-progress-list {
  display: grid;
  gap: 14px;
}

.record-detail-progress-item {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid var(--detail-border);
  background: var(--detail-soft);
}

.record-detail-progress-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.record-progress-asset-list {
  margin-top: 2px;
}

.record-detail-step {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 12px;
  padding: 14px 0;
  border-top: 1px solid var(--detail-border);
}

.record-detail-step:first-child {
  border-top: 0;
  padding-top: 0;
}

.record-detail-step-time {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: 700;
  color: var(--detail-text);
}

.record-detail-step h4 {
  margin: 0 0 4px;
}

.record-detail-finance-card .mini-card,
.record-asset-item {
  border-radius: 18px;
  background: var(--detail-soft);
}

.record-asset-list,
.record-detail-note-list {
  gap: 12px;
}

.record-asset-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--detail-border);
}

@media (max-width: 1120px) {
  .record-detail-hero-strip {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .record-detail-shell {
    padding: 18px;
  }

  .record-detail-grid-balanced,
  .record-detail-hero-strip {
    grid-template-columns: 1fr;
  }

  .record-detail-hero-header,
  .record-detail-hero-actions,
  .record-detail-hero-links {
    justify-content: flex-start;
  }

  .record-detail-step {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
