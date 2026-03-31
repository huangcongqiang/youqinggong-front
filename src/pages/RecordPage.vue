<template>
  <section v-if="page" class="page-stack record-page">
    <article v-if="page.requestError" class="result-card stack-sm">
      <span class="eyebrow">数据同步失败</span>
      <h3>当前展示的是空态记录</h3>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <header class="record-page-intro stack-xs">
      <div class="record-page-intro-head">
        <span class="eyebrow">{{ audience === 'talent' ? '人才接单记录' : '企业发单记录' }}</span>
        <h1>{{ page.summary?.title || page.title || '记录列表' }}</h1>
      </div>
      <p class="muted record-page-intro-note">{{ introNote }}</p>
    </header>

    <article class="glass-panel stack-md record-list-panel">
      <div class="panel-header panel-header-top record-list-panel__header">
        <div>
          <span class="eyebrow">记录列表</span>
          <h3>{{ panelTitle }}</h3>
        </div>
        <span class="soft-pill">{{ filteredRecords.length }} 条记录</span>
      </div>

      <div class="record-tab-row">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="button-secondary"
          :class="{ 'is-active-tab': activeTab === tab.key }"
          @click="setTab(tab.key)"
        >
          {{ tab.label }}<span v-if="typeof tab.count === 'number'"> {{ tab.count }}</span>
        </button>
      </div>

      <div v-if="filteredRecords.length" class="record-card-list">
        <article v-for="record in filteredRecords" :key="record.id" class="mini-card stack-sm record-card">
          <div class="record-card-head">
            <div>
              <span class="eyebrow">{{ record.statusGroup || record.stage }}</span>
              <h3>{{ record.title }}</h3>
            </div>
            <span class="soft-pill">{{ record.amountValue || formatMoney(record.amount) }}</span>
          </div>

          <div class="record-card-meta">
            <span>开始 {{ formatDateLabel(record.startAt || record.startDate) }}</span>
            <span>结束 {{ formatDateLabel(record.endAt || record.endDate) }}</span>
            <span>{{ partnerLabel }}：{{ record.counterpartName || record.partnerName }}</span>
            <span>{{ gradeLabel }}：{{ ratingValue(record) }}</span>
          </div>

          <p class="muted">{{ record.summary }}</p>

          <div class="tag-row">
            <span v-for="tag in listOf(record.tags || record.taskTags)" :key="tag" class="soft-pill">{{ tag }}</span>
          </div>

          <div class="record-card-actions">
            <router-link class="button-primary" :to="detailRoute(record.id)">查看详情</router-link>
            <span class="soft-pill">记录已留痕</span>
          </div>
        </article>
      </div>

      <article v-else class="mini-card record-empty-state stack-sm">
        <h4>暂无对应记录</h4>
        <p class="muted">{{ emptyHint }}</p>
        <router-link class="button-primary" :to="baseRoute">返回全部记录</router-link>
      </article>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatDateLabel, formatGrade, formatMoney } from './recordData';
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
const partnerLabel = computed(() => (audience.value === 'talent' ? '合作企业' : '合作人才'));
const gradeLabel = computed(() => (audience.value === 'talent' ? '企业评级' : '我的评级'));
const emptyHint = computed(() =>
  audience.value === 'talent'
    ? '接单记录会在这里按状态沉淀，方便复盘作品和合作质量。'
    : '发单记录会在这里按状态沉淀，便于继续跟进和复盘。'
);
const tabs = computed(() => listOf(page.value?.tabs));
const introNote = computed(() => {
  const summary = page.value?.summary;
  if (summary?.latestUpdatedAt) {
    return summary.latestTitle
      ? `最近更新：${summary.latestUpdatedAt} · ${summary.latestTitle}`
      : `最近更新：${summary.latestUpdatedAt}`;
  }
  return audience.value === 'talent'
    ? '按状态回看接单、执行和验收记录。'
    : '按状态回看发单、执行和结算记录。';
});
const panelTitle = computed(() => {
  if (activeTab.value === 'ongoing') {
    return '进行中记录';
  }
  if (activeTab.value === 'completed') {
    return '已完成记录';
  }
  return '全部记录';
});

const filteredRecords = computed(() => {
  return listOf(page.value?.items).map((item) => ({
    ...item,
    id: item.taskId || item.id
  }));
});

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

function detailRoute(recordId) {
  const query = activeTab.value === 'all' ? {} : { tab: activeTab.value };
  return {
    path: audience.value === 'talent'
      ? roleRouteMap.talent.recordDetail(recordId)
      : roleRouteMap.enterprise.recordDetail(recordId),
    query
  };
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

async function loadPage() {
  page.value = await getOrderRecords(audience.value, activeTab.value);
}

watch(
  () => [audience.value, activeTab.value],
  () => {
    void loadPage();
  }
);

onMounted(() => {
  void loadPage();
});
</script>

<style scoped>
.record-page {
  gap: 18px;
}

.record-page-intro {
  gap: 8px;
  padding: 2px 2px 0;
}

.record-page-intro-head h1 {
  margin: 8px 0 0;
  color: var(--text-strong);
  font-size: clamp(28px, 7vw, 34px);
  line-height: 1.18;
}

.record-page-intro-note {
  margin: 0;
  max-width: 36ch;
  color: var(--text-soft);
  font-size: 14px;
  line-height: 1.6;
}

.record-list-panel {
  gap: 16px;
  padding: 22px 18px;
  background:
    linear-gradient(180deg, rgba(10, 20, 38, 0.84), rgba(12, 24, 44, 0.9)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.04), transparent 38%);
  box-shadow: 0 16px 32px rgba(2, 8, 20, 0.28);
}

.record-list-panel::after {
  width: 170px;
  height: 170px;
  inset: auto -12% -38% auto;
  opacity: 0.55;
}

.record-list-panel__header h3 {
  margin: 8px 0 0;
  font-size: 20px;
}

.record-tab-row {
  gap: 10px;
}

.record-tab-row .button-secondary {
  min-height: 38px;
  padding-inline: 14px;
  border-radius: 16px;
  border-color: rgba(120, 190, 255, 0.14);
  background: rgba(8, 15, 28, 0.6);
}

.record-tab-row .button-secondary.is-active-tab {
  border-color: rgba(120, 190, 255, 0.3);
  background: rgba(57, 196, 255, 0.14);
  color: var(--text-strong);
}

.record-card-list {
  grid-template-columns: 1fr;
  gap: 14px;
}

.record-card {
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(120, 190, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(9, 17, 31, 0.84), rgba(12, 22, 40, 0.92)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.05), transparent 42%);
  box-shadow: 0 12px 24px rgba(2, 8, 20, 0.18);
}

.record-card-head h3 {
  margin-top: 8px;
  font-size: 20px;
  line-height: 1.35;
}

.record-card-meta {
  gap: 8px 14px;
}

.record-card .tag-row {
  gap: 8px;
}

.record-card-actions {
  align-items: center;
}

@media (min-width: 760px) {
  .record-card-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
