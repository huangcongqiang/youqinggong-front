<template>
  <section class="page-stack business-dashboard-page" v-if="page">
    <MobilePageScaffold
      :title="heroTitle"
      :subtitle="heroSubtitle"
    >
      <template #meta>
        <div class="business-dashboard__hero-pills">
          <span class="soft-pill">{{ attentionSummaryChip }}</span>
          <span class="soft-pill">{{ conversationMeta }}</span>
          <span class="soft-pill">{{ workspaceMeta }}</span>
        </div>
      </template>

      <article v-if="page.requestError" class="result-card stack-sm">
        <h3>暂时没拉到工作台数据</h3>
        <p class="muted">{{ page.requestError }}</p>
      </article>

      <SummarySection
        title="待办"
        :highlight-value="attentionHighlight"
        tone="warm"
      >
        <div v-if="primaryAttentionItems.length" class="business-dashboard__todo-list">
          <UnifiedListCard
            v-for="item in primaryAttentionItems"
            :key="item.id || item.label"
            :title="item.label || '当前事项'"
            :subtitle="attentionSubtitle(item)"
            :status="attentionStatus(item)"
            :status-tone="attentionStatusTone(item)"
            clickable
            @select="openAttention(item)"
          />
        </div>

        <article v-else class="mini-card stack-sm business-dashboard__todo-empty">
          <h3>当前没有待办</h3>
          <p class="muted">直接去聊天或发布任务。</p>
          <router-link class="button-secondary" :to="roleRouteMap.enterprise.publish">
            去发布任务
          </router-link>
        </article>
      </SummarySection>

      <article class="glass-panel stack-md business-dashboard__entry-panel">
        <div class="panel-header panel-header-top">
          <div>
            <h3>先去这里</h3>
          </div>
          <button class="button-secondary business-dashboard__info-trigger" type="button" @click="openInfo">
            资料
          </button>
        </div>

        <div class="business-dashboard__entry-list">
          <router-link class="business-dashboard__entry-card is-primary" :to="roleRouteMap.enterprise.messages">
            <div class="stack-xs">
              <strong>聊天</strong>
              <p class="muted">查看最近会话</p>
            </div>
            <span class="business-dashboard__entry-meta">{{ conversationMeta }}</span>
          </router-link>

          <router-link class="business-dashboard__entry-card" :to="roleRouteMap.enterprise.publish">
            <div class="stack-xs">
              <strong>发布任务</strong>
              <p class="muted">发起新任务</p>
            </div>
            <span class="business-dashboard__entry-meta">{{ publishMeta }}</span>
          </router-link>
        </div>
      </article>

      <article class="glass-panel stack-md business-dashboard__secondary-panel">
        <div class="panel-header panel-header-top">
          <div>
            <h3>继续推进</h3>
          </div>
        </div>

        <div class="business-dashboard__secondary-links">
          <router-link
            v-for="item in secondaryLinks"
            :key="item.label"
            class="business-dashboard__secondary-link"
            :to="item.to"
          >
            <div class="stack-xs">
              <strong>{{ item.label }}</strong>
              <p class="muted">{{ item.description }}</p>
            </div>
            <span class="business-dashboard__secondary-meta">{{ item.meta }}</span>
          </router-link>
        </div>
      </article>
    </MobilePageScaffold>

    <div v-if="activeInfo" class="business-dashboard__overlay" @click.self="closeInfo">
      <article class="business-dashboard__sheet stack-md">
        <div class="panel-header panel-header-top">
          <div>
            <h3>资料概览</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeInfo">关闭</button>
        </div>

        <div class="tag-row">
          <span v-for="item in infoHighlights" :key="item" class="soft-pill">{{ item }}</span>
        </div>

        <section class="business-dashboard__info-section stack-sm">
          <div class="stack-xs">
            <h4>当前概况</h4>
          </div>
          <div class="business-dashboard__info-list">
            <article
              v-for="item in hiddenInfoItems"
              :key="item.label"
              class="business-dashboard__info-item"
            >
              <strong>{{ item.label }}</strong>
              <span>{{ item.value }}</span>
              <p class="muted">{{ item.note }}</p>
            </article>
          </div>
        </section>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import MobilePageScaffold from '../components/mobile/MobilePageScaffold.vue';
import SummarySection from '../components/mobile/SummarySection.vue';
import UnifiedListCard from '../components/mobile/UnifiedListCard.vue';
import { getBusinessData } from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream.js';
import { roleRouteMap } from '../utils/roleRoutes';

const router = useRouter();
const page = ref(null);
const activeInfo = ref(false);
let stopBusinessLiveSync = null;

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function countOf(value) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : 0;
}

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

const attentionItems = computed(() => listOf(page.value?.attentionItems));
const primaryAttentionItems = computed(() => attentionItems.value.slice(0, 2));
const attentionTotal = computed(() =>
  attentionItems.value.reduce((sum, item) => sum + Math.max(countOf(item?.count), 0), 0)
);
const conversationCount = computed(() => listOf(page.value?.liveConversation).length);
const publishRecordCount = computed(() => listOf(page.value?.publishRecords).length);
const activeTaskCount = computed(() => listOf(page.value?.taskBoard).length);
const recommendedTalentCount = computed(() => listOf(page.value?.recommendedTalents).length);
const onboardingCount = computed(() => listOf(page.value?.onboardingChecklist).length);
const contractSummaryCount = computed(() => listOf(page.value?.contractSummary).length);

const heroTitle = computed(() => (attentionTotal.value ? '处理待办' : '开始工作'));
const heroSubtitle = computed(() =>
  attentionTotal.value
    ? '先处理当前待办，再进入聊天和协作。'
    : '从聊天、发单和协作开始。'
);
const attentionHighlight = computed(() => (attentionTotal.value ? String(attentionTotal.value) : ''));
const attentionSummaryChip = computed(() => (attentionTotal.value ? `${attentionTotal.value} 项待办` : '待办已清空'));
const conversationMeta = computed(() =>
  conversationCount.value ? `${conversationCount.value} 条会话` : '查看会话'
);
const workspaceMeta = computed(() =>
  activeTaskCount.value ? `${activeTaskCount.value} 项协作` : '查看协作'
);
const publishMeta = computed(() =>
  publishRecordCount.value ? `${publishRecordCount.value} 条记录` : '开始发单'
);
const infoHighlights = computed(() => [
  `${attentionTotal.value} 待办`,
  `${conversationCount.value} 沟通`,
  `${publishRecordCount.value} 发单`
]);
const hiddenInfoItems = computed(() => [
  {
    label: '待完善资料',
    value: `${onboardingCount.value} 项`,
    note: '资料和资质统一收在这里。'
  },
  {
    label: '推荐人才',
    value: `${recommendedTalentCount.value} 位`,
    note: '候选人继续在人才页筛选。'
  },
  {
    label: '范围与工期',
    value: `${contractSummaryCount.value} 条`,
    note: '任务边界和排期摘要继续保留。'
  },
  {
    label: '历史发单记录',
    value: `${publishRecordCount.value} 条`,
    note: '历史合作统一沉淀到记录页。'
  }
]);
const secondaryLinks = computed(() => [
  {
    label: '协作空间',
    description: '查看执行中的任务和节点。',
    meta: activeTaskCount.value ? `${activeTaskCount.value} 项任务` : '当前无执行任务',
    to: roleRouteMap.enterprise.workspace
  },
  {
    label: '发单记录',
    description: '回看历史合作和留痕。',
    meta: publishRecordCount.value ? `${publishRecordCount.value} 条记录` : '当前无历史记录',
    to: roleRouteMap.enterprise.records
  },
  {
    label: '人才广场',
    description: '继续查看候选人资料。',
    meta: recommendedTalentCount.value ? `${recommendedTalentCount.value} 位推荐` : '去查看候选人才',
    to: roleRouteMap.enterprise.market
  }
]);

function attentionRoute(item) {
  return item?.route || item?.to || item?.link || roleRouteMap.enterprise.messages;
}

function attentionSubtitle(item) {
  return textOf(item?.note, item?.summary, item?.description);
}

function attentionStatus(item) {
  const count = countOf(item?.count);
  return count ? `${count} 项` : '';
}

function attentionStatusTone(item) {
  return countOf(item?.count) > 0 ? 'warning' : 'neutral';
}

function openAttention(item) {
  void router.push(attentionRoute(item));
}

function openInfo() {
  activeInfo.value = true;
}

function closeInfo() {
  activeInfo.value = false;
}

async function loadPage() {
  page.value = await getBusinessData();
}

onMounted(async () => {
  await loadPage();
  stopBusinessLiveSync = startBusinessLiveSync({
    refresh: () => loadPage()
  });
});

onBeforeUnmount(() => {
  stopBusinessLiveSync?.();
  stopBusinessLiveSync = null;
});
</script>

<style scoped>
.business-dashboard-page {
  gap: 12px;
}

.business-dashboard__hero-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.business-dashboard__info-trigger {
  min-height: 32px;
  padding-inline: 12px;
}

.business-dashboard__todo-list,
.business-dashboard__secondary-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.business-dashboard__todo-empty {
  padding: 14px;
  border-radius: 16px;
  border: 1px dashed rgba(120, 190, 255, 0.18);
  background: rgba(8, 15, 28, 0.5);
}

.business-dashboard__todo-empty :deep(.button-secondary) {
  width: fit-content;
}

.business-dashboard__entry-panel {
  padding: 12px;
}

.business-dashboard__secondary-panel {
  padding: 12px;
}

.business-dashboard__entry-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.business-dashboard__entry-card,
.business-dashboard__secondary-link {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(120, 190, 255, 0.16);
  background:
    linear-gradient(180deg, rgba(10, 20, 38, 0.92), rgba(14, 28, 52, 0.96)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.05), transparent 40%);
  box-shadow: 0 10px 18px rgba(2, 8, 20, 0.16);
  color: inherit;
  text-decoration: none;
}

.business-dashboard__entry-card.is-primary {
  border-color: rgba(246, 196, 83, 0.2);
  background:
    linear-gradient(180deg, rgba(26, 28, 19, 0.94), rgba(40, 31, 18, 0.98)),
    radial-gradient(circle at top right, rgba(246, 196, 83, 0.08), transparent 42%);
}

.business-dashboard__entry-card strong,
.business-dashboard__secondary-link strong,
.business-dashboard__info-item strong {
  color: var(--text-strong);
  font-size: 14px;
}

.business-dashboard__entry-card .muted,
.business-dashboard__secondary-link .muted,
.business-dashboard__info-item .muted {
  margin: 0;
  line-height: 1.35;
}

.business-dashboard__entry-meta,
.business-dashboard__secondary-meta {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(8, 15, 28, 0.68);
  color: var(--text-soft);
  white-space: normal;
  font-size: 10px;
}

.business-dashboard__overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px 14px calc(18px + env(safe-area-inset-bottom));
  background: rgba(3, 8, 18, 0.7);
  backdrop-filter: blur(10px);
}

.business-dashboard__sheet {
  width: min(100%, 560px);
  max-height: min(82vh, 760px);
  overflow: auto;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(120, 190, 255, 0.16);
  background:
    linear-gradient(180deg, rgba(10, 20, 38, 0.98), rgba(13, 25, 47, 0.98)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.08), transparent 40%);
  box-shadow: 0 18px 34px rgba(2, 8, 20, 0.32);
}

.business-dashboard__info-section h4 {
  margin: 0;
  color: var(--text-strong);
  font-size: 16px;
}

.business-dashboard__info-list {
  display: grid;
  gap: 10px;
}

.business-dashboard__info-item {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(120, 190, 255, 0.12);
  background: rgba(8, 15, 28, 0.58);
}

@media (max-width: 640px) {
  .business-dashboard__sheet {
    padding: 16px;
    border-radius: 20px;
  }

  .business-dashboard__hero-pills {
    gap: 5px;
  }

  .business-dashboard__entry-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .business-dashboard__entry-meta,
  .business-dashboard__secondary-meta {
    white-space: normal;
  }
}
</style>
