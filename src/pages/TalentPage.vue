<template>
  <MobilePageScaffold
    v-if="page"
    :title="heroTitle"
    :subtitle="heroSubtitle"
  >
    <template #meta>
      <span v-if="priorityCount" class="soft-pill">{{ priorityCount }} 项待确认</span>
    </template>

    <article v-if="page.requestError" class="result-card stack-sm">
      <h3>暂时没拉到工作台数据</h3>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <SummarySection
      title="待办"
      :highlight-value="priorityCount ? String(priorityCount) : ''"
      tone="cool"
    >
      <div v-if="priorityCards.length" class="mobile-dashboard-stack">
        <router-link
          v-for="item in priorityCards"
          :key="item.id"
          class="mobile-dashboard-link"
          :to="item.route || roleRouteMap.talent.messages"
        >
          <UnifiedListCard
            :title="item.label"
            :meta="itemHint(item)"
            :status="`${item.count}项`"
            status-tone="warning"
          />
        </router-link>
      </div>
      <p v-else class="muted mobile-dashboard-empty">
        当前没有待办，直接去聊天或看任务。
      </p>
      <router-link v-if="!priorityCards.length" class="button-secondary" :to="roleRouteMap.talent.market">
        去任务广场
      </router-link>
    </SummarySection>

    <article class="glass-panel stack-md mobile-dashboard-entry-panel">
      <div class="panel-header panel-header-top">
        <div>
          <h3>常用入口</h3>
        </div>
        <button class="button-secondary" type="button" @click="openInfo">更多</button>
      </div>

      <section class="mobile-dashboard-entry-grid">
        <router-link class="mobile-dashboard-link" :to="roleRouteMap.talent.messages">
          <UnifiedListCard
            title="聊天"
            :subtitle="messageSummary"
            :meta="messageMeta"
            :status="messageStatus"
            :status-tone="messageStatusTone"
          />
        </router-link>

        <router-link class="mobile-dashboard-link" :to="roleRouteMap.talent.market">
          <UnifiedListCard
            title="任务广场"
            :subtitle="marketSummary"
            :meta="marketMeta"
            :status="marketStatus"
            :status-tone="marketStatusTone"
          />
        </router-link>
      </section>
    </article>

    <MobileSheet
      :open="activeInfo"
      title="更多入口"
      subtitle=""
      size="medium"
      @close="closeInfo"
    >
      <div class="stack-md">
        <section class="mobile-dashboard-sheet-section stack-sm">
          <div class="stack-xs">
            <h4>收起的信息</h4>
          </div>
          <div class="tag-row">
            <span v-for="item in summaryHighlights" :key="item" class="soft-pill">{{ item }}</span>
          </div>
          <ul class="dashboard-detail-list">
            <li>{{ listOf(page.activeTasks).length }} 个执行中任务</li>
            <li>{{ listOf(page.evaluations).length }} 条历史评价</li>
            <li>{{ listOf(page.calendar).length }} 条档期记录</li>
          </ul>
        </section>

        <section class="mobile-dashboard-sheet-section stack-sm">
          <div class="stack-xs">
            <h4>其他入口</h4>
          </div>
          <div class="mobile-dashboard-sheet-links">
            <router-link class="mobile-dashboard-sheet-link" :to="roleRouteMap.talent.workspace" @click="closeInfo">
              <strong>执行协作</strong>
              <p class="muted">{{ workspaceSummary }}</p>
            </router-link>
            <router-link class="mobile-dashboard-sheet-link" :to="roleRouteMap.talent.records" @click="closeInfo">
              <strong>接单记录</strong>
              <p class="muted">{{ recordsSummary }}</p>
            </router-link>
            <router-link
              v-if="page.hero?.slug"
              class="mobile-dashboard-sheet-link"
              :to="roleRouteMap.talent.profile(page.hero.slug)"
              @click="closeInfo"
            >
              <strong>我的资料</strong>
              <p class="muted">{{ profileSummary }}</p>
            </router-link>
          </div>
        </section>
      </div>
    </MobileSheet>
  </MobilePageScaffold>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import MobilePageScaffold from '../components/mobile/MobilePageScaffold.vue';
import MobileSheet from '../components/mobile/MobileSheet.vue';
import SummarySection from '../components/mobile/SummarySection.vue';
import UnifiedListCard from '../components/mobile/UnifiedListCard.vue';
import { getTalentData } from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream.js';
import { roleRouteMap } from '../utils/roleRoutes';

const page = ref(null);
const activeInfo = ref(false);
let stopBusinessLiveSync = null;

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

const attentionItems = computed(() => listOf(page.value?.attentionItems));
const pendingConfirmations = computed(() => listOf(page.value?.pendingConfirmations));
const priorityCards = computed(() => {
  if (attentionItems.value.length) {
    return attentionItems.value.slice(0, 2);
  }
  if (pendingConfirmations.value.length) {
    return [
      {
        id: 'pending-confirmations',
        label: '待确认任务',
        count: pendingConfirmations.value.length,
        route: roleRouteMap.talent.messages
      }
    ];
  }
  return [];
});

const priorityCount = computed(() => {
  if (attentionItems.value.length) {
    return attentionItems.value.reduce((sum, item) => sum + Number(item?.count || 0), 0);
  }
  return pendingConfirmations.value.length;
});

const heroTitle = computed(() => (priorityCount.value > 0 ? '处理待办' : '开始工作'));
const heroSubtitle = computed(() =>
  priorityCount.value > 0
    ? '先处理最重要的几项。'
    : ''
);

const messageSummary = computed(() => {
  const messages = listOf(page.value?.messages);
  if (!messages.length) {
    return '查看最近会话';
  }
  const latest = messages[0];
  return `${latest.from}：${latest.text}`;
});

const messageMeta = computed(() => {
  const messageCount = listOf(page.value?.messages).length;
  return messageCount ? `${messageCount} 条会话` : '进入聊天';
});

const messageStatus = computed(() => (priorityCount.value > 0 ? '待处理' : ''));
const messageStatusTone = computed(() => (priorityCount.value > 0 ? 'warning' : 'success'));

const marketSummary = computed(() => {
  const marketplace = listOf(page.value?.marketplace);
  if (!marketplace.length) {
    return '查看可接任务';
  }
  return `${marketplace[0].title} · ${marketplace[0].budget || '未填写预算'}`;
});

const marketMeta = computed(() => {
  const marketCount = listOf(page.value?.marketplace).length;
  return marketCount ? `${marketCount} 条任务` : '去看任务';
});

const marketStatus = computed(() => (listOf(page.value?.marketplace).length ? '有新任务' : '空闲'));
const marketStatusTone = computed(() => (listOf(page.value?.marketplace).length ? 'info' : 'neutral'));

const summaryHighlights = computed(() => {
  if (!page.value) {
    return [];
  }
  const openDays = listOf(page.value.calendar).filter((item) => item.state === 'open').length;
  return [
    `评分 ${page.value.hero?.score || '暂无'}`,
    `收入 ${page.value.hero?.income || '￥0'}`,
    `${openDays} 天档期`
  ];
});

const workspaceSummary = computed(() => {
  const activeCount = listOf(page.value?.activeTasks).length;
  return activeCount ? `${activeCount} 个任务在协作中。` : '确认任务后在这里推进。';
});

const recordsSummary = computed(() => {
  const evaluations = listOf(page.value?.evaluations).length;
  return evaluations ? '最新评价和过程都在这里。' : '接单过程会留在这里。';
});

const profileSummary = computed(() => {
  const skillCount = listOf(page.value?.skills).length;
  return skillCount ? `已沉淀 ${skillCount} 项技能和作品。` : '补充方向、作品和档期。';
});

function itemHint(item) {
  return Number(item?.count || 0) > 1 ? '继续处理' : '进入处理';
}

function openInfo() {
  activeInfo.value = true;
}

function closeInfo() {
  activeInfo.value = false;
}

async function loadPage() {
  page.value = await getTalentData();
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
.mobile-dashboard-stack,
.mobile-dashboard-entry-grid,
.mobile-dashboard-sheet-links {
  display: grid;
  gap: 8px;
}

.mobile-dashboard-entry-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mobile-dashboard-entry-panel {
  padding: 12px;
}

.mobile-dashboard-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.mobile-dashboard-empty {
  margin: 0;
}

.mobile-dashboard-sheet-section {
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(120, 190, 255, 0.14);
  background: rgba(8, 15, 28, 0.62);
}

.mobile-dashboard-sheet-section h4 {
  margin: 0;
  color: var(--text-strong);
  font-size: 16px;
}

.mobile-dashboard-sheet-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(120, 190, 255, 0.12);
  background: rgba(10, 20, 38, 0.74);
  color: inherit;
  text-decoration: none;
}

.mobile-dashboard-sheet-link strong {
  color: var(--text-strong);
  font-size: 14px;
}

.mobile-dashboard-sheet-link p {
  margin: 0;
}
</style>
