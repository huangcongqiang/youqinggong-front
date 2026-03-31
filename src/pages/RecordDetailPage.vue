<template>
  <section class="page-stack record-page" v-if="page">
    <article v-if="page?.requestError" class="result-card stack-sm">
      <span class="eyebrow">数据同步失败</span>
      <h3>当前展示的是空态详情</h3>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <article v-if="record" class="glass-panel record-hero stack-sm">
      <div class="record-hero-head">
        <div class="stack-xs record-hero-copy">
          <span class="eyebrow">{{ audience === 'talent' ? '人才记录对象' : '企业记录对象' }}</span>
          <h1>{{ record.title || '记录详情' }}</h1>
          <p class="muted record-hero-lead">{{ heroLeadCompact }}</p>
        </div>

        <span class="soft-pill record-hero-stage">{{ stageLabel }}</span>
      </div>

      <p class="muted record-hero-snapshot">
        <span class="eyebrow">当前结论</span>
        <span>{{ conclusionHeadline }}</span>
      </p>

      <div class="record-hero-actions">
        <router-link class="button-primary" :to="primaryActionRoute">{{ primaryActionLabel }}</router-link>
        <router-link v-if="secondaryActionVisible" class="button-secondary" :to="recordsRoute">
          {{ recordsLabel }}
        </router-link>
      </div>

      <div v-if="heroTags.length" class="tag-row record-hero-tags">
        <span v-for="item in heroTags" :key="item" class="soft-pill">{{ item }}</span>
      </div>
    </article>

    <article v-if="record" class="glass-panel record-context-shell stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">必要上下文</span>
          <h3>只看这三项就够判断下一步</h3>
        </div>
      </div>

      <div class="record-context-grid">
        <article v-for="item in currentStatusCards" :key="item.label" class="mini-card stack-sm record-context-card">
          <span class="eyebrow">{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p class="muted">{{ item.note }}</p>
        </article>
      </div>

      <div v-if="visibleStatusNotes.length" class="record-note-list">
        <div v-for="note in visibleStatusNotes" :key="note" class="record-note-item">
          <span class="record-note-dot"></span>
          <p class="muted">{{ note }}</p>
        </div>
      </div>
    </article>

    <article v-else class="glass-panel record-empty-state stack-md">
      <span class="eyebrow">记录未找到</span>
      <h3>这条记录可能已被删除或参数有误</h3>
      <p class="muted">先返回列表，重新选择一条可查看的记录。</p>
      <router-link class="button-primary" :to="recordsRoute">{{ recordsLabel }}</router-link>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { buildRecordDetailViewModel } from './recordDetailViewModel';
import { roleRouteMap } from '../utils/roleRoutes';
import { getOrderRecordDetail } from '../services/api';
import {
  buildChildObjectPageContext,
  labelForObjectPageSource,
  readObjectPageContext,
  resolveImmediateOriginContext
} from '../utils/objectPageContext';

const route = useRoute();

const audience = computed(() => (route.meta?.audience === 'talent' ? 'talent' : 'enterprise'));
const page = ref(null);
const record = computed(() => page.value?.record || null);
const recordViewModel = computed(() => buildRecordDetailViewModel(record.value, { audience: audience.value }));
const contextDefaults = computed(() => ({
  taskId: recordViewModel.value.anchor.taskId,
  recordId: recordViewModel.value.anchor.recordId || String(route.params.recordId || '').trim(),
  room: recordViewModel.value.anchor.roomKey,
  tab: route.query.tab
}));
const pageContext = computed(() => readObjectPageContext(route.query, contextDefaults.value));
const originContext = computed(() =>
  resolveImmediateOriginContext({
    entrySource: pageContext.value.source,
    query: route.query,
    defaults: contextDefaults.value,
    allowedSources: ['messages', 'workspace', 'acceptance', 'records', 'record-detail']
  })
);
const activeRecordId = computed(() => pageContext.value.recordId || contextDefaults.value.recordId);
const activeTaskId = computed(() => pageContext.value.taskId || contextDefaults.value.taskId);
const activeRoomKey = computed(() => pageContext.value.room || contextDefaults.value.room);

const recordsRoute = computed(() => ({
  path: audience.value === 'talent' ? roleRouteMap.talent.records : roleRouteMap.enterprise.records,
  query: pageContext.value.tab ? { tab: pageContext.value.tab } : {}
}));

const recordsLabel = computed(() => '返回记录列表');

function buildRecordDetailChildQuery(overrides = {}) {
  return buildChildObjectPageContext({
    current: pageContext.value,
    origin: originContext.value,
    overrides: {
      source: 'record-detail',
      taskId: activeTaskId.value,
      recordId: activeRecordId.value,
      room: activeRoomKey.value,
      tab: pageContext.value.tab,
      ...overrides
    }
  });
}

function messagesRoute(query) {
  if (activeRoomKey.value) {
    return audience.value === 'talent'
      ? roleRouteMap.talent.messageRoom(activeRoomKey.value, query)
      : roleRouteMap.enterprise.messageRoom(activeRoomKey.value, query);
  }

  return {
    path: audience.value === 'talent' ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages,
    query
  };
}

function routeForImmediateSource(source) {
  if (source === 'messages') {
    return messagesRoute(buildRecordDetailChildQuery());
  }

  if (source === 'workspace') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace,
      query: buildRecordDetailChildQuery()
    };
  }

  if (source === 'acceptance') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.acceptance : roleRouteMap.enterprise.acceptance,
      query: buildRecordDetailChildQuery()
    };
  }

  if (source === 'records') {
    return recordsRoute.value;
  }

  return null;
}

const backTargetSource = computed(() =>
  pageContext.value.source === 'record-detail' ? originContext.value.source : pageContext.value.source
);
const primaryActionRoute = computed(() => {
  const directRoute = routeForImmediateSource(backTargetSource.value);
  if (directRoute) {
    return directRoute;
  }

  if (activeRoomKey.value) {
    return messagesRoute(buildRecordDetailChildQuery());
  }

  if (activeTaskId.value) {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace,
      query: buildRecordDetailChildQuery()
    };
  }

  return recordsRoute.value;
});
const primaryActionLabel = computed(() => {
  if (backTargetSource.value && backTargetSource.value !== 'records') {
    return labelForObjectPageSource(backTargetSource.value, '继续处理').replace(/^返回/, '继续');
  }

  if (backTargetSource.value === 'records') {
    return '返回记录列表';
  }

  if (activeRoomKey.value) {
    return '去聊天';
  }

  if (activeTaskId.value) {
    return '去协作空间';
  }

  return '返回记录列表';
});
const secondaryActionVisible = computed(() => {
  const primary = primaryActionRoute.value;
  const fallback = recordsRoute.value;
  return !isSameRoute(primary, fallback);
});
const heroLead = computed(() => recordViewModel.value.heroLead);
const heroLeadCompact = computed(() => compactText(heroLead.value, 46));
const stageLabel = computed(() => recordViewModel.value.stageLabel);
const conclusionHeadline = computed(() => recordViewModel.value.conclusionHeadline);
const heroTags = computed(() => recordViewModel.value.conclusionTags.slice(0, 2));
const currentStatusCards = computed(() => recordViewModel.value.currentStatusCards);
const visibleStatusNotes = computed(() => recordViewModel.value.statusNotes.slice(0, 2));

function compactText(value, limit = 72) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }

  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit).trim()}…`;
}

function routeSignature(routeLike) {
  if (!routeLike) {
    return '';
  }

  const query = routeLike.query && typeof routeLike.query === 'object'
    ? Object.entries(routeLike.query)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${String(value)}`)
        .join('&')
    : '';

  return `${routeLike.path || ''}?${query}`;
}

function isSameRoute(left, right) {
  return routeSignature(left) === routeSignature(right);
}

async function loadDetail() {
  page.value = await getOrderRecordDetail(audience.value, String(route.params.recordId || ''));
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
.record-page {
  gap: 12px;
}

.record-hero {
  padding: 18px;
  background:
    radial-gradient(circle at top right, rgba(246, 196, 83, 0.18), transparent 34%),
    linear-gradient(180deg, rgba(9, 18, 34, 0.96), rgba(14, 28, 52, 0.98));
}

.record-hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.record-hero-copy {
  min-width: 0;
}

.record-hero-copy h1,
.record-context-card strong {
  margin: 0;
}

.record-hero-copy h1 {
  font-size: 1.24rem;
  line-height: 1.18;
}

.record-hero-lead {
  max-width: 52ch;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.record-hero-stage {
  flex: none;
}

.record-hero-snapshot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(246, 196, 83, 0.12);
  background: rgba(10, 20, 38, 0.74);
  color: var(--text-main);
}

.record-hero-snapshot .eyebrow {
  flex: none;
}

.record-hero-snapshot span:last-child {
  min-width: 0;
  color: var(--text-strong);
  line-height: 1.35;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.record-hero-actions {
  display: flex;
  gap: 10px;
}

.record-hero-actions > * {
  flex: 1 1 0;
  min-width: 0;
}

.record-hero-tags {
  row-gap: 6px;
}

.record-context-shell {
  gap: 14px;
}

.record-context-grid {
  display: grid;
  gap: 12px;
}

.record-context-card {
  border: 1px solid rgba(121, 155, 255, 0.08);
  background: rgba(9, 20, 40, 0.52);
}

.record-context-card strong {
  color: var(--text-strong);
  font-size: 18px;
  line-height: 1.35;
}

.record-context-card p,
.record-note-item p {
  margin: 0;
}

.record-note-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-note-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.record-note-dot {
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 999px;
  flex: none;
  background: linear-gradient(135deg, rgba(246, 196, 83, 0.92), rgba(121, 155, 255, 0.78));
  box-shadow: 0 0 0 3px rgba(246, 196, 83, 0.08);
}

@media (min-width: 640px) {
  .record-context-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .record-hero {
    padding: 18px;
  }

  .record-hero-head,
  .record-hero-actions {
    flex-direction: column;
  }

  .record-hero-stage {
    align-self: flex-start;
  }

  .record-hero-actions > * {
    width: 100%;
    justify-content: center;
  }
}
</style>
