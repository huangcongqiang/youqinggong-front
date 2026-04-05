<template>
  <section class="page-stack task-market-workbench-page office-list-page task-market-workbench-shell" v-if="page">
    <article v-if="page.requestError" class="result-card stack-sm">
      <strong>任务广场数据暂时不可用</strong>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <article v-if="taskMarketRestrictionMessage" class="result-card stack-sm">
      <strong>当前账号还不能申请任务</strong>
      <p class="muted">{{ taskMarketRestrictionMessage }}</p>
    </article>

    <header class="stack-md task-market-page-header task-market-sticky-header">
      <div class="task-market-page-intro">
        <SectionTitle
          eyebrow="任务池"
          title="先筛，再看详情"
          description="按标签、工期、预算和评级筛任务。"
          tag="h1"
        />
      </div>

      <div class="task-market-decision-strip">
        <article class="mini-card stack-sm task-market-conclusion-card">
          <h3>{{ filteredItems.length }} 个结果</h3>
          <div class="tag-row task-market-conclusion-tags">
            <span class="soft-pill">右侧固定看详情</span>
            <span v-if="activeFilterCount" class="soft-pill">已筛 {{ activeFilterCount }} 项</span>
          </div>
        </article>

        <MetricCard
          :label="marketTotalMetric.label"
          :value="marketTotalMetric.value"
          :note="marketTotalMetric.note"
        />
      </div>

      <section class="task-market-filter-dock">
        <article class="mini-card stack-md task-market-filter-card task-market-filter-rail task-market-filter-panel">
          <div class="panel-header task-market-filter-header">
            <span class="eyebrow">筛选任务</span>
            <button class="button-secondary" type="button" @click="resetFilters">重置</button>
          </div>

          <div class="task-market-filter-grid task-market-filter-group-grid">
            <div v-for="group in filterGroups" :key="group.key" class="stack-sm task-market-filter-group task-market-filter-cluster">
              <span class="eyebrow">{{ group.label }}</span>
              <div class="task-market-filter-row task-market-filter-chip-row">
                <button
                  v-for="option in group.options"
                  :key="`${group.key}-${option}`"
                  type="button"
                  class="soft-pill task-market-filter-chip"
                  :class="{ 'is-active': selectedFilters[group.key] === option }"
                  @click="updateFilter(group.key, option)"
                >
                  {{ option }}
                </button>
              </div>
            </div>
          </div>
        </article>
      </section>

    </header>

    <section class="task-market-workbench-layout task-market-board">
      <section class="stack-md task-market-list-rail task-market-row-column">
        <article
          v-if="filteredItems.length === 0"
          class="glass-panel stack-md task-market-empty-state task-market-empty-row task-market-empty-panel"
        >
          <div>
            <span class="eyebrow">暂无匹配任务</span>
            <h3>换一个筛选条件，或者稍后再刷新任务池</h3>
          </div>
          <p class="muted">
            当前筛出来的任务为空。你可以先放宽筛选条件，等新的任务同步进来后再继续处理。
          </p>
          <div class="toolbar task-market-empty-actions">
            <button class="button-secondary" type="button" @click="resetFilters">清空筛选</button>
            <router-link class="button-primary" to="/talent">返回人才工作台</router-link>
          </div>
        </article>

        <article
          v-for="task in filteredItems"
          :key="task.id"
          class="glass-panel task-market-task-row task-market-task-row--table"
          :class="{ 'is-active': activeTaskKey === task.id }"
          tabindex="0"
          role="button"
          :aria-pressed="activeTaskKey === task.id"
          @click="openTaskDetail(task)"
          @keyup.enter="openTaskDetail(task)"
          @keyup.space.prevent="openTaskDetail(task)"
        >
          <div class="task-market-task-row-main task-market-task-row-body">
            <div class="panel-header task-market-task-row-header">
              <div class="stack-xs task-market-task-title-block">
                <span class="eyebrow">{{ task.company }}</span>
                <h3>{{ task.title }}</h3>
              </div>
              <div class="toolbar task-market-task-statusbar">
                <span class="soft-pill">{{ task.status }}</span>
                <span class="soft-pill is-info">评级 {{ task.companyRating || 'A级' }}</span>
              </div>
            </div>

            <div class="task-market-task-judgment-grid">
              <article v-for="item in taskJudgmentItems(task)" :key="`${task.id}-${item.label}`" class="task-market-task-judgment">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </article>
            </div>
          </div>

          <div class="task-market-task-row-side task-market-task-row-aside">
            <div class="toolbar task-market-task-actions task-market-task-action-row">
              <button class="button-primary" type="button" @click.stop="openTaskDetail(task)">详情</button>
            </div>
          </div>
        </article>
      </section>

      <aside class="task-market-detail-rail task-market-detail-column">
        <article v-if="activeTaskDetail" class="stack-md task-market-detail-panel task-market-detail-surface task-market-detail-sticky">
          <div class="panel-header task-market-detail-header">
            <div>
              <span class="eyebrow">{{ activeTaskDetail.company || '任务详情' }}</span>
              <h3>{{ activeTaskDetail.title }}</h3>
            </div>
            <div class="toolbar task-market-detail-toolbar">
              <button class="button-secondary" type="button" @click="closeTaskDetail">收起</button>
            </div>
          </div>

          <div class="tag-row task-market-detail-tags task-market-detail-badges">
            <span class="soft-pill">{{ activeTaskDetail.status || '待处理' }}</span>
            <span class="soft-pill">预算 {{ activeTaskDetail.budget || '未填写预算' }}</span>
            <span class="soft-pill">周期 {{ activeTaskDetail.period || '待确认' }}</span>
            <span class="soft-pill is-info">{{ activeTaskDetail.companyRating || 'A级' }}</span>
          </div>

          <div class="dashboard-detail-dual task-market-detail-dual task-market-detail-grid">
            <div class="mini-card stack-sm task-market-detail-card">
              <h4>{{ activeTaskDetail.matchLabel || '对你适配' }}</h4>
              <strong class="task-market-detail-highlight">{{ activeTaskDetail.match || '待评估' }}</strong>
              <p class="muted">{{ activeTaskDetail.matchNote || '系统会结合你的公开技能、评分和任务标签做当前判断。' }}</p>
            </div>
            <div class="mini-card stack-sm task-market-detail-card">
              <h4>当前动作</h4>
              <strong class="task-market-detail-highlight">{{ activeTaskAction.label || '先看详情' }}</strong>
              <p class="muted">{{ activeTaskAction.note || '当前还没有可执行动作。' }}</p>
            </div>
          </div>

          <div class="dashboard-detail-section task-market-detail-section task-market-detail-block">
            <h4>一句话说明</h4>
            <p class="muted">{{ activeTaskDetail.brief || activeTaskDetail.summary || '任务摘要暂未同步' }}</p>
          </div>

          <div class="dashboard-detail-dual task-market-detail-dual task-market-detail-grid">
            <div class="mini-card stack-sm task-market-detail-card">
              <h4>风险提示</h4>
              <p class="muted">{{ activeTaskDetail.risk || '当前风险暂未同步' }}</p>
            </div>
            <div class="mini-card stack-sm task-market-detail-card">
              <h4>前提假设</h4>
              <p class="muted">{{ activeTaskDetail.assumption || '平台判断依据暂未同步' }}</p>
            </div>
          </div>

          <div v-if="activeTaskDetail.tags?.length" class="dashboard-detail-section task-market-detail-section task-market-detail-block">
            <h4>匹配标签</h4>
            <div class="tag-row task-market-detail-tag-row">
              <span v-for="tag in activeTaskDetail.tags || []" :key="tag" class="soft-pill">{{ tag }}</span>
            </div>
          </div>

          <div v-if="activeTaskDetail.deliverables?.length" class="dashboard-detail-section task-market-detail-section task-market-detail-block">
            <h4>核心交付件</h4>
            <ul class="dashboard-detail-list task-market-detail-list">
              <li v-for="item in activeTaskDetail.deliverables" :key="item">{{ item }}</li>
            </ul>
          </div>

          <div v-if="activeTaskDetail.modules?.length" class="dashboard-detail-section task-market-detail-section task-market-detail-block">
            <h4>AI 拆解模块</h4>
            <ul class="dashboard-detail-list task-market-detail-list">
              <li v-for="module in activeTaskDetail.modules" :key="module.name || module">{{ module.name || module }}</li>
            </ul>
          </div>

          <div v-if="activeTaskDetail.recommendations?.length" class="dashboard-detail-section task-market-detail-section task-market-detail-block">
            <h4>执行建议</h4>
            <ul class="dashboard-detail-list task-market-detail-list">
              <li v-for="item in activeTaskDetail.recommendations" :key="item">{{ item }}</li>
            </ul>
          </div>

          <div class="toolbar task-market-detail-actions task-market-detail-footer">
            <button
              class="button-primary"
              type="button"
              :disabled="detailActionPending || activeTaskAction.disabled || taskMarketTradingBlocked"
              @click="handlePrimaryTaskAction"
            >
              {{ detailActionPending ? '处理中...' : (activeTaskAction.label || '申请合作') }}
            </button>
            <router-link class="button-secondary" to="/talent">返回人才工作台</router-link>
          </div>

          <p v-if="taskMarketRestrictionMessage" class="soft-pill is-warning task-market-detail-feedback">{{ taskMarketRestrictionMessage }}</p>
          <p v-if="detailActionError" class="soft-pill is-danger task-market-detail-feedback">{{ detailActionError }}</p>
          <p v-else-if="detailActionSuccess" class="soft-pill is-info task-market-detail-feedback">{{ detailActionSuccess }}</p>
        </article>

        <article v-else class="mini-card stack-md task-market-detail-placeholder task-market-detail-empty">
          <div>
            <span class="eyebrow">右侧详情区</span>
            <h3>从左侧挑一条任务，右侧固定看决策信息</h3>
          </div>
          <p class="muted">
            这里不再重复任务摘要，只承接风险、前提、交付件和执行建议。
          </p>
        </article>
      </aside>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import MetricCard from '../components/MetricCard.vue';
import SectionTitle from '../components/SectionTitle.vue';
import { getTaskMarketplaceData, initiateTaskRoom, requestTaskCollaboration } from '../services/api';
import { useAuthState } from '../stores/auth';
import { tradingRestrictionMessage } from '../utils/tradingAccess';
import { roleRouteMap } from '../utils/roleRoutes';

const page = ref(null);
const activeTaskDetail = ref(null);
const activeTaskKey = ref(null);
const detailActionPending = ref(false);
const detailActionError = ref('');
const detailActionSuccess = ref('');
const taskActionStateOverrides = reactive({});
const selectedFilters = reactive({
  tag: '全部',
  period: '全部',
  budget: '全部',
  companyRating: '全部'
});
let marketplaceRefreshTimer = null;
const router = useRouter();
const authState = useAuthState();

function openTaskDetail(task) {
  activeTaskKey.value = task?.id ?? null;
  activeTaskDetail.value = task?.taskDetail || task || null;
  clearDetailActionFeedback();
}

function closeTaskDetail() {
  activeTaskDetail.value = null;
  activeTaskKey.value = null;
  clearDetailActionFeedback();
}

function taskJudgmentItems(task = {}) {
  return [
    { label: '预算', value: task.budget || '未填写预算' },
    { label: '工期', value: task.period || '待确认工期' },
    { label: task.matchLabel || '对你适配', value: task.match || '待计算' }
  ];
}

function deriveTalentTaskActionState(task = {}, overrideState = '') {
  if (overrideState === 'waiting') {
    return {
      type: 'waiting',
      label: '等待企业确认',
      note: '申请已提交，正在等待企业确认。',
      disabled: true
    };
  }

  if (overrideState === 'enter_chat') {
    return {
      type: 'enter_chat',
      label: '进入沟通',
      note: '企业已确认，可以直接进入聊天。',
      disabled: false
    };
  }

  const roomKey = String(task?.roomKey || task?.taskRoom?.roomKey || '').trim();
  const applicationStatus = String(task?.applicationStatus || task?.action?.status || task?.status || '').trim().toUpperCase();
  const actionType = String(task?.action?.type || '').trim();
  const actionLabel = String(task?.action?.label || '').trim();
  const statusText = String(task?.status || '').trim();

  if (
    roomKey ||
    actionType === 'enter_chat' ||
    applicationStatus === 'SELECTED' ||
    actionLabel.includes('进入沟通') ||
    statusText.includes('已确认')
  ) {
    return {
      type: 'enter_chat',
      label: '进入沟通',
      note: '企业已确认，可以直接进入聊天。',
      disabled: false
    };
  }

  if (
    applicationStatus === 'PENDING' ||
    applicationStatus === 'WAITING' ||
    actionType === 'waiting' ||
    actionLabel.includes('等待企业确认') ||
    statusText.includes('等待企业确认')
  ) {
    return {
      type: 'waiting',
      label: '等待企业确认',
      note: '申请已提交，正在等待企业确认。',
      disabled: true
    };
  }

  return {
    type: 'request',
    label: '申请合作',
    note: '先提交合作申请，企业确认后再进入聊天。',
    disabled: false
  };
}

const activeTaskAction = computed(() =>
  deriveTalentTaskActionState(activeTaskDetail.value || {}, taskActionStateOverrides[activeTaskKey.value] || '')
);
const taskMarketRestrictionMessage = computed(() => tradingRestrictionMessage(authState.user, 'talent'));
const taskMarketTradingBlocked = computed(() => Boolean(taskMarketRestrictionMessage.value));

function clearDetailActionFeedback() {
  detailActionError.value = '';
  detailActionSuccess.value = '';
}

async function enterTaskCommunication(task) {
  if (taskMarketTradingBlocked.value) {
    throw new Error(taskMarketRestrictionMessage.value);
  }
  const response = await initiateTaskRoom({
    taskId: task?.id
  });
  const roomKey = String(response?.roomKey || response?.taskRoom?.roomKey || response?.room?.roomKey || '').trim();
  if (response?.requestError || response?.success === false || !roomKey) {
    throw new Error(response?.requestError || response?.message || response?.nextStep || '当前暂时无法进入沟通，请稍后重试。');
  }
  await router.push({
    path: roleRouteMap.talent.messages,
    query: {
      room: roomKey,
      taskId: task.id,
      source: 'task-market'
    }
  });
}

async function handlePrimaryTaskAction() {
  const task = activeTaskDetail.value;
  const action = activeTaskAction.value;
  if (!task || !action || action.disabled || taskMarketTradingBlocked.value) {
    if (taskMarketTradingBlocked.value) {
      detailActionError.value = taskMarketRestrictionMessage.value;
    }
    return;
  }

  detailActionPending.value = true;
  clearDetailActionFeedback();
  try {
    if (action.type === 'enter_chat') {
      await enterTaskCommunication(task);
      return;
    }

    if (action.type === 'request') {
      const response = await requestTaskCollaboration(task.id);
      const requestRoomKey = String(response?.roomKey || response?.taskRoom?.roomKey || response?.room?.roomKey || '').trim();
      if (response?.requestError || response?.applicationStatus === 'FAILED') {
        throw new Error(response?.requestError || response?.nextStep || '当前暂时无法提交合作申请，请稍后重试。');
      }
      if (response?.applicationStatus === 'SELECTED' || requestRoomKey) {
        taskActionStateOverrides[task.id] = 'enter_chat';
        detailActionSuccess.value = response?.nextStep || '企业已确认当前合作，正在进入沟通。';
        await enterTaskCommunication(task);
        return;
      }
      taskActionStateOverrides[task.id] = 'waiting';
      detailActionSuccess.value = response?.nextStep || '申请已提交，等待企业确认。';
      await loadPage();
      return;
    }
  } catch (error) {
    detailActionError.value = error?.message || '当前暂时无法处理这个动作，请稍后重试。';
  } finally {
    detailActionPending.value = false;
  }
}

function normalizeOptions(items = [], fallback = ['全部']) {
  const values = Array.isArray(items)
    ? items.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
  const unique = [...new Set(values)];
  if (!unique.length) {
    return fallback;
  }
  return unique.includes('全部') ? unique : ['全部', ...unique];
}

function parseBudgetLowerBound(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text) {
    return Number.NaN;
  }
  const compact = text.replace(/,/g, '');
  const kiloMatch = compact.match(/(\d+(?:\.\d+)?)\s*k/);
  if (kiloMatch) {
    return Number(kiloMatch[1]) * 1000;
  }
  const numericMatch = compact.match(/(\d+(?:\.\d+)?)/);
  return numericMatch ? Number(numericMatch[1]) : Number.NaN;
}

function parsePeriodDays(value) {
  const match = String(value || '').match(/(\d+)/);
  return match ? Number(match[1]) : Number.NaN;
}

function deriveTagOptions(items = []) {
  const tags = [];
  items.forEach((task) => {
    (Array.isArray(task?.tags) ? task.tags : []).forEach((tag) => {
      if (!tags.includes(tag) && tags.length < 8) {
        tags.push(tag);
      }
    });
  });
  return normalizeOptions(tags, ['全部']);
}

const filterGroups = computed(() => {
  const groups = page.value?.filterGroups || {};
  const items = Array.isArray(page.value?.items) ? page.value.items : [];

  return [
    {
      key: 'tag',
      label: '标签',
      options: normalizeOptions(groups.tag || deriveTagOptions(items), ['全部'])
    },
    {
      key: 'period',
      label: '工期',
      options: normalizeOptions(groups.period, ['全部', '3天内', '4-7天', '8天以上'])
    },
    {
      key: 'budget',
      label: '价格',
      options: normalizeOptions(groups.budget, ['全部', '3000以下', '3000-8000', '8000-15000', '15000以上'])
    },
    {
      key: 'companyRating',
      label: '企业评级',
      options: normalizeOptions(groups.companyRating, ['全部', 'S级', 'A级', 'B级'])
    }
  ];
});

const activeFilterCount = computed(() =>
  filterGroups.value.reduce((count, group) => count + (selectedFilters[group.key] === '全部' ? 0 : 1), 0)
);

const filteredItems = computed(() => {
  const items = Array.isArray(page.value?.items) ? page.value.items : [];

  return items.filter((task) => {
    const matchesTag =
      selectedFilters.tag === '全部' ||
      (Array.isArray(task.tags) && task.tags.includes(selectedFilters.tag));

    const periodDays = parsePeriodDays(task.period);
    const matchesPeriod =
      selectedFilters.period === '全部' ||
      (selectedFilters.period === '3天内' && !Number.isNaN(periodDays) && periodDays <= 3) ||
      (selectedFilters.period === '4-7天' && !Number.isNaN(periodDays) && periodDays >= 4 && periodDays <= 7) ||
      (selectedFilters.period === '8天以上' && !Number.isNaN(periodDays) && periodDays >= 8);

    const budgetAmount = parseBudgetLowerBound(task.budget);
    const matchesBudget =
      selectedFilters.budget === '全部' ||
      (selectedFilters.budget === '3000以下' && !Number.isNaN(budgetAmount) && budgetAmount < 3000) ||
      (selectedFilters.budget === '3000-8000' && !Number.isNaN(budgetAmount) && budgetAmount >= 3000 && budgetAmount < 8000) ||
      (selectedFilters.budget === '8000-15000' && !Number.isNaN(budgetAmount) && budgetAmount >= 8000 && budgetAmount < 15000) ||
      (selectedFilters.budget === '15000以上' && !Number.isNaN(budgetAmount) && budgetAmount >= 15000);

    const matchesCompanyRating =
      selectedFilters.companyRating === '全部' ||
      String(task.companyRating || '').trim() === selectedFilters.companyRating;

    return matchesTag && matchesPeriod && matchesBudget && matchesCompanyRating;
  });
});

const marketTotalMetric = computed(() => {
  const items = Array.isArray(page.value?.items) ? page.value.items : [];
  const metrics = Array.isArray(page.value?.metrics) ? page.value.metrics : [];
  const explicitTotal = metrics.find((item) => String(item?.label || '').includes('当前任务总数'));

  return {
    label: '当前任务总数',
    value: String(explicitTotal?.value || items.length),
    note: '只看当前可浏览任务。'
  };
});

function updateFilter(key, option) {
  selectedFilters[key] = option;
}

function resetFilters() {
  selectedFilters.tag = '全部';
  selectedFilters.period = '全部';
  selectedFilters.budget = '全部';
  selectedFilters.companyRating = '全部';
}

function syncSelectedFilters() {
  filterGroups.value.forEach((group) => {
    if (!group.options.includes(selectedFilters[group.key])) {
      selectedFilters[group.key] = group.options[0] || '全部';
    }
  });
}

async function loadPage() {
  page.value = await getTaskMarketplaceData();
  syncSelectedFilters();
  syncActiveTask();
}

function syncActiveTask() {
  const items = filteredItems.value;
  if (!items.length) {
    closeTaskDetail();
    return;
  }

  const matched = items.find((item) => item.id === activeTaskKey.value);
  const target = matched || items[0];
  activeTaskKey.value = target.id ?? null;
  activeTaskDetail.value = target.taskDetail || target || null;
}

onMounted(async () => {
  await loadPage();
  if (typeof window !== 'undefined') {
    marketplaceRefreshTimer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      void loadPage();
    }, 6000);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && marketplaceRefreshTimer) {
    window.clearInterval(marketplaceRefreshTimer);
  }
});

watch(filteredItems, () => {
  syncActiveTask();
});
</script>

<style scoped>
.task-market-workbench-page {
  gap: 20px;
}

.task-market-page-header {
  display: grid;
  gap: 8px;
}

.task-market-detail-highlight {
  font-size: 28px;
  line-height: 1;
  color: rgba(245, 249, 255, 0.98);
}

.task-market-detail-feedback {
  align-self: flex-start;
}

.task-market-decision-strip {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(220px, 0.62fr);
  gap: 8px;
  align-items: start;
}

.task-market-conclusion-card {
  padding: 12px;
  border-radius: 18px;
  border: 1px solid rgba(121, 155, 255, 0.14);
  background:
    radial-gradient(circle at top right, rgba(76, 201, 255, 0.08), transparent 36%),
    linear-gradient(180deg, rgba(11, 19, 34, 0.95), rgba(8, 15, 28, 0.98));
}

.task-market-conclusion-card h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1;
}

.task-market-conclusion-tags {
  margin-top: 0;
}

.task-market-filter-card {
  padding: 12px;
}

.task-market-filter-header {
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.task-market-filter-grid {
  display: grid;
  gap: 8px;
}

.task-market-filter-group-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.task-market-filter-group {
  padding: 8px;
  border-radius: 14px;
  background: rgba(7, 14, 25, 0.52);
  border: 1px solid rgba(121, 155, 255, 0.1);
}

.task-market-filter-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.task-market-filter-chip {
  border-color: rgba(121, 155, 255, 0.12);
  background: rgba(10, 18, 32, 0.72);
  padding: 6px 10px;
}

.task-market-filter-chip.is-active {
  border-color: rgba(95, 131, 255, 0.34);
  background: linear-gradient(135deg, rgba(68, 103, 220, 0.22), rgba(19, 34, 67, 0.92));
}

.task-market-board {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.9fr);
  gap: 10px;
  align-items: start;
}

.task-market-list-rail {
  min-width: 0;
}

.task-market-task-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 12px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid rgba(121, 155, 255, 0.12);
  background:
    radial-gradient(circle at top right, rgba(76, 201, 255, 0.04), transparent 30%),
    rgba(7, 14, 25, 0.88);
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.task-market-task-row:hover {
  transform: translateY(-1px);
  border-color: rgba(76, 201, 255, 0.2);
}

.task-market-task-row.is-active {
  border-color: rgba(95, 131, 255, 0.3);
  background:
    radial-gradient(circle at top right, rgba(76, 201, 255, 0.08), transparent 36%),
    rgba(10, 18, 32, 0.98);
}

.task-market-task-row-main {
  display: grid;
  gap: 8px;
}

.task-market-task-row-header {
  align-items: flex-start;
  gap: 10px;
}

.task-market-task-title-block h3 {
  margin: 0;
}

.task-market-task-statusbar {
  justify-content: flex-end;
  gap: 6px;
}

@media (max-width: 1180px) {
  .task-market-decision-strip,
  .task-market-board {
    grid-template-columns: 1fr;
  }
}

.task-market-task-judgment-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.task-market-task-judgment {
  display: grid;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(10, 18, 32, 0.68);
  border: 1px solid rgba(121, 155, 255, 0.1);
}

.task-market-task-judgment span {
  font-size: 12px;
  color: var(--text-secondary);
}

.task-market-task-judgment strong {
  color: var(--text-strong);
  font-size: 14px;
}

.task-market-task-row-side {
  display: grid;
  align-content: center;
  gap: 8px;
  padding-left: 0;
}

.task-market-task-action-row {
  justify-content: flex-start;
}

.task-market-task-action-row .button-primary {
  width: 100%;
  justify-content: center;
}

.task-market-detail-column {
  min-width: 0;
}

.task-market-detail-sticky {
  position: sticky;
  top: 20px;
}

.task-market-detail-panel {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(121, 155, 255, 0.12);
  background:
    radial-gradient(circle at top right, rgba(76, 201, 255, 0.06), transparent 32%),
    rgba(7, 14, 25, 0.9);
}

.task-market-detail-header,
.task-market-detail-toolbar,
.task-market-detail-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.task-market-detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.task-market-detail-section {
  margin-top: 0;
}

.task-market-detail-grid {
  gap: 12px;
}

.task-market-detail-card {
  padding: 12px;
}

.task-market-detail-placeholder {
  padding: 18px;
}

.task-market-detail-empty {
  border: 1px dashed rgba(121, 155, 255, 0.14);
}

.task-market-detail-list {
  margin: 0;
  padding-left: 18px;
}

@media (max-width: 1180px) {
  .task-market-decision-strip,
  .task-market-board {
    grid-template-columns: 1fr;
  }

  .task-market-detail-sticky {
    position: static;
  }
}

@media (max-width: 960px) {
  .task-market-filter-group-grid,
  .task-market-task-row,
  .task-market-task-judgment-grid {
    grid-template-columns: 1fr;
  }

  .task-market-task-row-side {
    padding-left: 0;
    border-left: 0;
    border-top: 1px solid rgba(113, 128, 150, 0.14);
    padding-top: 12px;
  }
}
</style>
