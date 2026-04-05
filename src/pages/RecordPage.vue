<template>
  <section v-if="page" class="page-stack record-page record-page--office office-list-page">
    <article class="record-page-header">
      <SectionTitle
        :eyebrow="audience === 'talent' ? '人才接单记录' : '企业发单记录'"
        :title="page.summary?.title || page.title || '记录列表'"
        :description="page.summary?.description || defaultLead"
        tag="h1"
      />

      <div class="record-summary-bar record-summary-bar--compact record-summary-bar--office" aria-label="记录摘要">
        <div v-for="item in summaryCards" :key="item.label" class="record-summary-item record-summary-item--compact">
          <span class="record-summary-label">{{ item.label }}</span>
          <strong class="record-summary-value">{{ item.value }}</strong>
          <span class="record-summary-note">{{ item.note }}</span>
        </div>
      </div>
    </article>

    <article class="record-workbench">
      <div class="record-workbench-header record-workbench-header--office">
        <div class="record-workbench-copy record-workbench-copy--office">
          <span class="eyebrow">记录筛选</span>
          <h3>按状态查看发单与接单</h3>
          <p class="muted">固定筛选区、批量选择和行级动作都收在同一条工作带里，方便快速处理当前页记录。</p>
        </div>
        <div class="record-workbench-meta record-workbench-meta--office">
          <span class="record-workbench-count">{{ filteredRecords.length }} 条记录</span>
          <span class="record-workbench-tip">最近更新 {{ page.summary?.latestUpdatedAt || '待同步' }}</span>
        </div>
      </div>

      <div class="record-workbench-sticky">
        <div class="record-tab-row record-tab-row--office record-tab-row--sticky" role="tablist" aria-label="记录状态筛选">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="record-tab-button"
            :class="{ 'is-active-tab': activeTab === tab.key }"
            :aria-pressed="activeTab === tab.key"
            @click="setTab(tab.key)"
          >
            <span class="record-tab-button-label">{{ tab.label }}</span>
            <span v-if="typeof tab.count === 'number'" class="record-tab-button-count">{{ tab.count }}</span>
          </button>
        </div>

        <div class="record-batch-bar" aria-label="批量操作">
          <label class="record-batch-select-all">
            <input
              :checked="isAllVisibleSelected"
              :indeterminate="isSelectionIndeterminate"
              type="checkbox"
              @change="toggleVisibleSelection($event.target.checked)"
            />
            <span class="record-batch-select-all-label">全选当前页</span>
          </label>

          <div class="record-batch-meta">
            <span class="record-batch-count">已选 {{ selectedVisibleCount }} 条</span>
            <span class="record-batch-tip">{{ filteredRecords.length }} 条可批量处理</span>
            <span class="soft-pill">归档仅整理当前视图</span>
          </div>

          <div class="record-batch-actions toolbar">
            <button type="button" class="record-batch-action" :disabled="selectedVisibleCount === 0" @click="archiveSelectedRecords">
              本地归档
            </button>
            <button type="button" class="record-batch-action" :disabled="selectedVisibleCount === 0" @click="exportSelectedRecords">
              批量导出
            </button>
            <button type="button" class="record-batch-action" :disabled="selectedVisibleCount === 0" @click="clearSelection">
              清空选择
            </button>
            <button
              v-if="archivedCount"
              type="button"
              class="record-batch-action"
              @click="restoreArchivedRecords"
            >
              恢复本地归档
            </button>
          </div>
        </div>

        <p v-if="batchResult" class="record-batch-result">{{ batchResult }}</p>
      </div>

      <div v-if="filteredRecords.length" class="record-list-shell record-list-shell--office">
        <div class="record-list-head record-list-head--office" aria-hidden="true">
          <span class="record-list-head-cell record-list-head-cell--select">
            <span class="record-list-head-cell-label">选择</span>
          </span>
          <span class="record-list-head-cell record-list-head-cell--main">记录</span>
          <span class="record-list-head-cell record-list-head-cell--amount">金额</span>
          <span class="record-list-head-cell record-list-head-cell--time">周期</span>
          <span class="record-list-head-cell record-list-head-cell--partner">{{ partnerLabel }}</span>
          <span class="record-list-head-cell record-list-head-cell--grade">{{ gradeLabel }}</span>
          <span class="record-list-head-cell record-list-head-cell--tags">标签</span>
          <span class="record-list-head-cell record-list-head-cell--actions">操作</span>
        </div>

        <div class="record-list-body record-list-body--office">
          <article
            v-for="(record, index) in filteredRecords"
            :key="record.id"
            class="record-list-item record-list-item--office"
            :class="{ 'is-selected': isRecordSelected(record.id) }"
          >
            <div class="record-list-cell record-list-cell--select">
              <label class="record-row-select">
                <input
                  :checked="isRecordSelected(record.id)"
                  type="checkbox"
                  @change="toggleRecordSelection(record.id, $event.target.checked)"
                />
                <span class="record-row-select-label">选择记录</span>
              </label>
            </div>

            <div class="record-list-cell record-list-cell--main">
              <div class="record-list-main-head">
                <span class="record-row-index">#{{ index + 1 }}</span>
                <span class="record-status-chip">{{ record.statusGroup || record.stage }}</span>
              </div>
              <h3 class="record-list-title">{{ record.title }}</h3>
              <p class="record-list-summary">{{ record.summary }}</p>
            </div>

            <div class="record-list-cell record-list-cell--amount">
              <span class="record-cell-label">金额</span>
              <strong class="record-cell-value">{{ record.amountValue || formatMoney(record.amount) }}</strong>
            </div>

            <div class="record-list-cell record-list-cell--time">
              <span class="record-cell-label">周期</span>
              <div class="record-cell-stack">
                <span>开始 {{ formatDateLabel(record.startAt || record.startDate) }}</span>
                <span>结束 {{ formatDateLabel(record.endAt || record.endDate) }}</span>
              </div>
            </div>

            <div class="record-list-cell record-list-cell--partner">
              <span class="record-cell-label">{{ partnerLabel }}</span>
              <span class="record-cell-value">{{ record.counterpartName || record.partnerName }}</span>
            </div>

            <div class="record-list-cell record-list-cell--grade">
              <span class="record-cell-label">{{ gradeLabel }}</span>
              <span class="record-cell-value">{{ ratingValue(record) }}</span>
            </div>

            <div class="record-list-cell record-list-cell--tags">
              <span class="record-cell-label">标签</span>
              <div class="record-tag-row">
                <span v-for="tag in listOf(record.tags || record.taskTags)" :key="tag" class="record-tag-chip">{{ tag }}</span>
              </div>
            </div>

            <div class="record-list-cell record-list-cell--actions">
              <div class="record-row-action-group">
                <router-link class="record-row-link record-row-link--primary" :to="detailRoute(record)">查看详情</router-link>
                <router-link class="record-row-link record-row-link--secondary" :to="detailRoute(record, 'timeline')">
                  查看进展
                </router-link>
              </div>
              <span class="record-cell-note">记录已留痕</span>
            </div>
          </article>
        </div>
      </div>

      <article v-else class="record-empty-state">
        <h4>暂无对应记录</h4>
        <p class="muted">{{ emptyHint }}</p>
        <router-link class="record-empty-link" :to="baseRoute">返回全部记录</router-link>
      </article>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import { formatDateLabel, formatGrade, formatMoney } from '../services/recordFormatters.js';
import { roleRouteMap } from '../utils/roleRoutes';
import { getOrderRecords } from '../services/api';

const route = useRoute();
const router = useRouter();

const audience = computed(() => (route.meta?.audience === 'talent' ? 'talent' : 'enterprise'));
const page = ref(null);
const baseRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.records : roleRouteMap.enterprise.records
);
const activeTab = computed(() => normalizeTab(route.query.tab));
const defaultLead = computed(() =>
  audience.value === 'talent'
    ? '按接单、执行和验收节奏查看每一单合作，把收入、周期和企业评级保留下来。'
    : '按发单、执行和结算节奏回看每一单合作，重点看金额、时间和我的评级。'
);
const partnerLabel = computed(() => (audience.value === 'talent' ? '合作企业' : '合作人才'));
const gradeLabel = computed(() => (audience.value === 'talent' ? '企业评级' : '我的评级'));
const emptyHint = computed(() =>
  audience.value === 'talent'
    ? '接单记录会在这里按状态沉淀，方便复盘作品和合作质量。'
    : '发单记录会在这里按状态沉淀，便于继续跟进和复盘。'
);
const tabs = computed(() => listOf(page.value?.tabs));
const summaryCards = computed(() => [
  {
    label: '记录总数',
    value: String(page.value?.summary?.total || 0),
    note: '当前账号已沉淀的记录数量。'
  },
  {
    label: '进行中',
    value: String(page.value?.summary?.ongoing || 0),
    note: '仍在推进或等待确认的任务。'
  },
  {
    label: '已完成',
    value: String(page.value?.summary?.completed || 0),
    note: '已经完成结算或评级闭环的任务。'
  },
  {
    label: '最近更新',
    value: page.value?.summary?.latestUpdatedAt || '待同步',
    note: page.value?.summary?.latestTitle || '最新记录会优先排在最上方。'
  }
]);
const selectedRecordIds = ref([]);
const localArchivedRecordIds = ref([]);
const batchResult = ref('');

const filteredRecords = computed(() => {
  const archived = new Set(localArchivedRecordIds.value.map((item) => String(item || '')));
  return listOf(page.value?.items)
    .map((item) => ({
      ...item,
      id: item.taskId || item.id
    }))
    .filter((item) => !archived.has(String(item.id || '')));
});
const archivedCount = computed(() => localArchivedRecordIds.value.length);
const selectedVisibleCount = computed(() => {
  const selected = new Set(selectedRecordIds.value);
  return filteredRecords.value.filter((record) => selected.has(record.id)).length;
});
const isAllVisibleSelected = computed(() => filteredRecords.value.length > 0 && selectedVisibleCount.value === filteredRecords.value.length);
const isSelectionIndeterminate = computed(
  () => selectedVisibleCount.value > 0 && selectedVisibleCount.value < filteredRecords.value.length
);

function normalizeTab(value) {
  if (value === 'ongoing' || value === 'completed') {
    return value;
  }
  return 'all';
}

function setTab(tab) {
  const nextQuery = tab === 'all' ? {} : { ...route.query, tab };
  router.replace({
    path: route.path,
    query: nextQuery
  });
}

function detailRoute(record, focus = '') {
  const query = buildRecordContextQuery({
    recordId: record?.id || record?.taskId || '',
    taskId: record?.taskId || record?.id || '',
    room: record?.roomKey || record?.room || route.query.room || '',
    source: 'records',
    tab: activeTab.value,
    focus
  });
  return {
    path: audience.value === 'talent'
      ? roleRouteMap.talent.recordDetail(record?.id || record?.taskId || '')
      : roleRouteMap.enterprise.recordDetail(record?.id || record?.taskId || ''),
    query
  };
}

function buildRecordContextQuery(context) {
  const query = {};

  if (context.recordId) {
    query.recordId = String(context.recordId);
  }

  if (context.taskId) {
    query.taskId = String(context.taskId);
  }

  if (context.room) {
    query.room = String(context.room);
  }

  if (context.source) {
    query.source = context.source;
  }

  if (context.tab) {
    query.tab = context.tab;
  }

  if (context.focus) {
    query.focus = context.focus;
  }

  return query;
}

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function ratingValue(record) {
  if (record?.rating?.value) {
    return record.rating.value;
  }
  return formatGrade(record?.myGrade);
}

function isRecordSelected(recordId) {
  return selectedRecordIds.value.includes(recordId);
}

function toggleRecordSelection(recordId, checked) {
  const normalizedId = String(recordId || '');
  if (!normalizedId) {
    return;
  }

  const nextSelected = new Set(selectedRecordIds.value.map((item) => String(item || '')));
  if (checked) {
    nextSelected.add(normalizedId);
  } else {
    nextSelected.delete(normalizedId);
  }
  selectedRecordIds.value = Array.from(nextSelected);
}

function toggleVisibleSelection(checked) {
  if (checked) {
    selectedRecordIds.value = filteredRecords.value.map((record) => record.id).filter(Boolean);
    return;
  }

  selectedRecordIds.value = [];
}

function clearSelection() {
  selectedRecordIds.value = [];
}

function archiveSelectedRecords() {
  if (!selectedVisibleCount.value) {
    return;
  }

  const selected = new Set(selectedRecordIds.value.map((item) => String(item || '')));
  const nextArchived = new Set(localArchivedRecordIds.value.map((item) => String(item || '')));
  filteredRecords.value.forEach((record) => {
    if (selected.has(String(record.id || ''))) {
      nextArchived.add(String(record.id || ''));
    }
  });
  localArchivedRecordIds.value = Array.from(nextArchived);
  batchResult.value = `已从当前视图本地归档 ${selectedVisibleCount.value} 条记录；该操作当前只影响本地工作区视图。`;
  clearSelection();
}

function restoreArchivedRecords() {
  localArchivedRecordIds.value = [];
  batchResult.value = '已恢复当前视图里的本地归档记录。';
}

function exportSelectedRecords() {
  if (!selectedVisibleCount.value || typeof window === 'undefined') {
    return;
  }

  const selected = new Set(selectedRecordIds.value.map((item) => String(item || '')));
  const rows = filteredRecords.value.filter((record) => selected.has(String(record.id || '')));
  const csvLines = [
    ['任务标题', '金额', '开始日期', '完成日期', partnerLabel.value, gradeLabel.value, '阶段', '摘要'].map(toCsvCell).join(','),
    ...rows.map((record) => [
      record.title,
      record.amountValue || formatMoney(record.amount),
      formatDateLabel(record.startAt || record.startDate),
      formatDateLabel(record.endAt || record.endDate),
      record.counterpartName || record.partnerName,
      ratingValue(record),
      record.statusGroup || record.stage,
      record.summary
    ].map(toCsvCell).join(','))
  ];

  const blob = new Blob([`\uFEFF${csvLines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `${audience.value === 'talent' ? '接单记录' : '发单记录'}-${activeTab.value}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
  batchResult.value = `已导出 ${rows.length} 条记录。`;
}

function toCsvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

async function loadPage() {
  page.value = await getOrderRecords(audience.value, activeTab.value);
}

watch(filteredRecords, (records) => {
  const allowed = new Set(records.map((record) => String(record.id || '')));
  selectedRecordIds.value = selectedRecordIds.value.filter((id) => allowed.has(String(id || '')));
});

watch(
  () => [audience.value, activeTab.value],
  () => {
    batchResult.value = '';
    localArchivedRecordIds.value = [];
    selectedRecordIds.value = [];
    void loadPage();
  }
);

onMounted(() => {
  void loadPage();
});
</script>

<style scoped>
.record-page {
  --record-bg: #f3f5f7;
  --record-panel: #ffffff;
  --record-soft: #f7f9fc;
  --record-border: #d9e1ea;
  --record-border-strong: #c7d5e4;
  --record-text: #132238;
  --record-muted: #627389;
  --record-accent: #1562c5;
  gap: 20px;
  padding-bottom: 36px;
  color: var(--record-text);
}

.record-page .muted {
  color: var(--record-muted);
}

.record-page-header,
.record-workbench,
.record-empty-state {
  border-radius: 26px;
}

.record-page-header,
.record-workbench,
.record-empty-state,
.record-summary-item,
.record-batch-bar,
.record-list-item {
  background: var(--record-panel);
  border: 1px solid var(--record-border);
  box-shadow: 0 18px 40px rgba(15, 35, 63, 0.08);
}

.record-page-header {
  padding: 24px 28px;
}

.record-page-header :deep(.section-title h1) {
  margin: 0;
  font-size: clamp(28px, 3.1vw, 38px);
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.record-page-header :deep(.section-title p) {
  max-width: 62ch;
  color: var(--record-muted);
}

.record-summary-bar {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.record-summary-item {
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff, #f7f9fc);
}

.record-summary-label,
.record-summary-note,
.record-workbench-tip,
.record-batch-tip,
.record-cell-label,
.record-cell-note {
  color: var(--record-muted);
}

.record-summary-value {
  font-size: 24px;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.record-workbench {
  padding: 22px 24px 24px;
}

.record-workbench-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.record-workbench-copy h3,
.record-empty-state h4 {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.record-workbench-copy p,
.record-empty-state p {
  margin: 0;
}

.record-workbench-meta {
  display: grid;
  gap: 6px;
  justify-items: end;
  text-align: right;
}

.record-workbench-count {
  font-weight: 700;
}

.record-workbench-sticky {
  position: sticky;
  top: 16px;
  z-index: 3;
  display: grid;
  gap: 12px;
  margin-top: 18px;
  padding-top: 2px;
}

.record-tab-row,
.record-batch-bar {
  border-radius: 18px;
}

.record-tab-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px;
  background: #ffffff;
  border: 1px solid var(--record-border);
  box-shadow: 0 12px 26px rgba(15, 35, 63, 0.06);
}

.record-tab-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: var(--record-soft);
  color: var(--record-muted);
  font-weight: 600;
}

.record-tab-button.is-active-tab {
  border-color: #97b8e6;
  background: #eaf2ff;
  color: #184f9d;
}

.record-tab-button-count,
.soft-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--record-border);
  background: #f6f8fb;
  color: #28415e;
}

.record-batch-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 16px;
}

.record-batch-select-all,
.record-row-select {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--record-text);
  font-weight: 600;
}

.record-batch-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
}

.record-batch-actions {
  margin-left: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.record-batch-action,
.record-row-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid var(--record-border-strong);
  background: #ffffff;
  color: var(--record-text);
  font-weight: 600;
  text-decoration: none;
}

.record-row-link--primary {
  background: var(--record-accent);
  border-color: var(--record-accent);
  color: #ffffff;
}

.record-list-shell {
  margin-top: 18px;
}

.record-list-head {
  display: grid;
  grid-template-columns: 70px minmax(280px, 2.3fr) 140px 170px 150px 120px 1.2fr 180px;
  gap: 12px;
  padding: 0 14px 10px;
  color: var(--record-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.record-list-body {
  display: grid;
  gap: 14px;
}

.record-list-item {
  display: grid;
  grid-template-columns: 70px minmax(280px, 2.3fr) 140px 170px 150px 120px 1.2fr 180px;
  gap: 12px;
  align-items: start;
  padding: 16px 14px;
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff, #f8fbfe);
}

.record-list-item.is-selected {
  border-color: #95b8e8;
  box-shadow: 0 16px 30px rgba(21, 98, 197, 0.1);
}

.record-list-main-head,
.record-row-action-group,
.record-tag-row,
.record-cell-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.record-row-index,
.record-status-chip,
.record-tag-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid var(--record-border);
  background: var(--record-soft);
  color: #26405c;
  font-size: 12px;
  font-weight: 600;
}

.record-list-title,
.record-cell-value {
  margin: 0;
  color: var(--record-text);
}

.record-list-summary {
  margin: 10px 0 0;
  color: var(--record-muted);
  line-height: 1.6;
}

.record-list-cell {
  display: grid;
  gap: 8px;
}

.record-row-action-group {
  display: grid;
  gap: 10px;
}

.record-empty-state {
  display: grid;
  gap: 12px;
  padding: 28px;
  text-align: center;
}

.record-empty-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  background: var(--record-accent);
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
}

@media (max-width: 1280px) {
  .record-summary-bar,
  .record-list-item {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .record-list-head {
    display: none;
  }
}

@media (max-width: 900px) {
  .record-page-header,
  .record-workbench {
    padding-inline: 18px;
  }

  .record-workbench-header {
    flex-direction: column;
  }

  .record-workbench-meta {
    justify-items: start;
    text-align: left;
  }

  .record-batch-actions {
    margin-left: 0;
  }

  .record-list-head {
    display: none;
  }

  .record-list-item,
  .record-summary-bar {
    grid-template-columns: 1fr;
  }
}
</style>
