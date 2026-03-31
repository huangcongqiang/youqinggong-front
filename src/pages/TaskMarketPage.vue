<template>
  <section class="page-stack task-market-page" v-if="page">
    <article v-if="page.requestError" class="result-card stack-sm">
      <span class="eyebrow">数据同步失败</span>
      <h3>当前展示的是空态列表</h3>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <article class="hero-card stack-md task-market-hero">
      <SectionTitle
        eyebrow="任务广场"
        :title="page.summary.title"
        :description="marketSummaryText"
        tag="h1"
      />
      <div class="tag-row task-market-summary-inline">
        <span class="soft-pill">{{ filteredItems.length }} 个任务</span>
        <span class="soft-pill">{{ hasAnyActiveFilters ? `已筛 ${activeFilterBadges.length} 项` : '默认筛选' }}</span>
        <span v-if="selectedFilters.companyRating !== '全部'" class="soft-pill">评级 {{ selectedFilters.companyRating }}</span>
      </div>
      <div class="task-market-filter-toolbar">
        <button class="button-primary" type="button" @click="openFilterSheet">筛选</button>
        <button v-if="hasAnyActiveFilters" class="button-secondary" type="button" @click="resetFilters">重置</button>
      </div>
    </article>

    <section class="stack-md">
      <article v-if="filteredItems.length === 0" class="glass-panel stack-md task-market-empty-state">
        <div>
          <span class="eyebrow">暂无匹配任务</span>
          <h3>换一个筛选条件，或稍后再看</h3>
        </div>
        <p class="muted">
          这里会优先展示企业真实发布、且仍在招募中的任务。你也可以先回到工作台，等新的任务和提醒同步过来。
        </p>
        <div class="toolbar">
          <button class="button-secondary" type="button" @click="resetFilters">清空筛选</button>
          <router-link class="button-primary" to="/talent">回到人才工作台</router-link>
        </div>
      </article>

      <article v-for="task in filteredItems" :key="task.id" class="glass-panel stack-md task-market-card">
        <div class="panel-header task-market-card-head">
          <div class="stack-sm">
            <span class="eyebrow">{{ task.company }}</span>
            <h3>{{ task.title }}</h3>
          </div>
          <div class="toolbar task-market-card-badges">
            <span class="soft-pill">{{ task.status }}</span>
            <span class="soft-pill is-info">企业评级 {{ task.companyRating || 'A级' }}</span>
          </div>
        </div>

        <div class="task-market-card-stats">
          <article class="task-market-card-stat">
            <span class="eyebrow">预算</span>
            <strong>{{ task.budget }}</strong>
          </article>
          <article class="task-market-card-stat">
            <span class="eyebrow">工期</span>
            <strong>{{ task.period }}</strong>
          </article>
          <article class="task-market-card-stat">
            <span class="eyebrow">匹配</span>
            <strong>{{ task.match }}</strong>
          </article>
        </div>

        <div class="stack-sm">
            <span class="eyebrow">标签</span>
          <div class="tag-row">
            <span v-for="tag in previewTaskTags(task.tags)" :key="tag" class="soft-pill">{{ tag }}</span>
            <span v-if="countOf(task.tags) > previewTaskTags(task.tags).length" class="soft-pill">
              +{{ countOf(task.tags) - previewTaskTags(task.tags).length }}
            </span>
          </div>
        </div>

        <div class="toolbar task-market-card-actions">
          <button class="button-primary" type="button" @click="openTaskDetail(task)">查看详情</button>
        </div>
      </article>
    </section>

    <MobileSheet
      :open="filterSheetVisible"
      title="筛选任务"
      subtitle="先按方向和工期缩一轮，再看预算和企业评级。"
      size="medium"
      @close="closeFilterSheet"
    >
      <article class="stack-md task-market-filter-sheet">
        <div class="panel-header">
          <div>
            <span class="eyebrow">快速筛选</span>
            <h3>先缩小范围，再看详情</h3>
          </div>
          <button class="button-secondary" type="button" @click="resetFilters">重置</button>
        </div>

        <div class="task-market-filter-grid">
          <div v-for="group in primaryFilterGroups" :key="group.key" class="stack-sm">
            <span class="eyebrow">{{ group.label }}</span>
            <div class="task-market-filter-row">
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

        <div class="task-market-filter-extra-head">
          <button class="button-secondary" type="button" @click="toggleAdvancedFilters">
            {{ showAdvancedFilters ? '收起更多筛选' : '更多筛选' }}
          </button>
          <span v-if="hasActiveAdvancedFilters" class="soft-pill task-market-filter-extra-pill">
            已启用高级筛选
          </span>
        </div>

        <div
          v-if="showAdvancedFilters || hasActiveAdvancedFilters"
          class="task-market-filter-grid task-market-filter-grid-secondary"
        >
          <div v-for="group in advancedFilterGroups" :key="group.key" class="stack-sm">
            <span class="eyebrow">{{ group.label }}</span>
            <div class="task-market-filter-row">
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

        <div class="toolbar">
          <button class="button-primary" type="button" @click="closeFilterSheet">查看任务</button>
        </div>
      </article>
    </MobileSheet>

    <MobileSheet
      :open="Boolean(activeTaskDetail)"
      title="任务详情"
      :subtitle="activeTaskDetail?.title || '当前任务'"
      size="large"
      @close="closeTaskDetail"
    >
      <article v-if="activeTaskDetail" class="stack-md task-market-detail-sheet">
        <div class="panel-header">
          <div>
            <span class="eyebrow">{{ activeTaskDetail.company || '任务详情' }}</span>
            <h3>{{ activeTaskDetail.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeTaskDetail">关闭</button>
        </div>

        <div class="tag-row">
          <span class="soft-pill">{{ activeTaskDetail.status || '待处理' }}</span>
          <span class="soft-pill">预算 {{ activeTaskDetail.budget || '未填写预算' }}</span>
          <span class="soft-pill">周期 {{ activeTaskDetail.period || '待确认' }}</span>
          <span class="soft-pill is-info">企业评级 {{ activeTaskDetail.companyRating || 'A级' }}</span>
        </div>

        <div class="mini-card stack-sm task-market-detail-hero">
          <span class="eyebrow">接单判断</span>
          <strong>{{ detailDecisionTitle }}</strong>
          <p class="muted">{{ detailDecisionBody }}</p>
        </div>

        <div class="dashboard-detail-section">
          <h4>任务说明</h4>
          <p class="muted">{{ activeTaskDetail.brief || activeTaskDetail.summary || '待补充' }}</p>
        </div>

        <div class="dashboard-detail-dual">
          <div class="mini-card stack-sm">
            <h4>技能标签</h4>
            <div class="tag-row">
              <span v-for="tag in activeTaskDetail.tags || []" :key="tag" class="soft-pill">{{ tag }}</span>
            </div>
          </div>
          <div class="mini-card stack-sm">
            <h4>核心交付件</h4>
            <div class="tag-row">
              <span v-for="item in activeTaskDetail.deliverables || []" :key="item" class="soft-pill">{{ item }}</span>
            </div>
          </div>
        </div>

        <div v-if="activeTaskDetail.modules?.length" class="dashboard-detail-section">
          <h4>AI 拆解模块</h4>
          <ul class="dashboard-detail-list">
            <li v-for="module in activeTaskDetail.modules" :key="module.name || module">{{ module.name || module }}</li>
          </ul>
        </div>

        <div v-if="activeTaskDetail.recommendations?.length" class="dashboard-detail-section">
          <h4>执行建议</h4>
          <ul class="dashboard-detail-list">
            <li v-for="item in activeTaskDetail.recommendations" :key="item">{{ item }}</li>
          </ul>
        </div>
      </article>
    </MobileSheet>
  </section>

  <section v-else-if="loading" class="page-stack task-market-page">
    <article class="hero-card stack-md task-market-loading-shell">
      <span class="eyebrow">任务广场</span>
      <h1 class="page-hero-title">正在同步任务</h1>
      <p class="muted">先拉取真实任务，再进入筛选和详情。</p>
    </article>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import SectionTitle from '../components/SectionTitle.vue';
import MobileSheet from '../components/mobile/MobileSheet.vue';
import { getTaskMarketplaceData } from '../services/api';

const page = ref(null);
const loading = ref(false);
const activeTaskDetail = ref(null);
const filterSheetVisible = ref(false);
const showAdvancedFilters = ref(false);
const selectedFilters = reactive({
  tag: '全部',
  period: '全部',
  budget: '全部',
  companyRating: '全部'
});
let marketplaceRefreshTimer = null;

function openTaskDetail(task) {
  activeTaskDetail.value = task?.taskDetail || task || null;
}

function closeTaskDetail() {
  activeTaskDetail.value = null;
}

function openFilterSheet() {
  filterSheetVisible.value = true;
}

function closeFilterSheet() {
  filterSheetVisible.value = false;
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

const primaryFilterGroups = computed(() =>
  filterGroups.value.filter((group) => ['tag', 'period'].includes(group.key))
);

const advancedFilterGroups = computed(() =>
  filterGroups.value.filter((group) => ['budget', 'companyRating'].includes(group.key))
);

const hasActiveAdvancedFilters = computed(() =>
  selectedFilters.budget !== '全部' || selectedFilters.companyRating !== '全部'
);

const hasAnyActiveFilters = computed(() =>
  Object.values(selectedFilters).some((value) => value !== '全部')
);

const activeFilterBadges = computed(() => {
  const badges = [];
  if (selectedFilters.tag !== '全部') {
    badges.push(`标签 ${selectedFilters.tag}`);
  }
  if (selectedFilters.period !== '全部') {
    badges.push(`工期 ${selectedFilters.period}`);
  }
  if (selectedFilters.budget !== '全部') {
    badges.push(`价格 ${selectedFilters.budget}`);
  }
  if (selectedFilters.companyRating !== '全部') {
    badges.push(`评级 ${selectedFilters.companyRating}`);
  }
  return badges;
});

const marketSummaryText = computed(() =>
  '先缩一轮筛选，再看当前最适合接的任务。'
);

const detailDecisionTitle = computed(() => {
  if (!activeTaskDetail.value) {
    return '先打开一条任务详情';
  }
  return `${activeTaskDetail.value.budget || '预算待确认'} · ${activeTaskDetail.value.period || '周期待确认'}`;
});

const detailDecisionBody = computed(() => {
  if (!activeTaskDetail.value) {
    return '详情会先给接单判断，再展开任务说明、标签和交付件。';
  }
  const rating = activeTaskDetail.value.companyRating || 'A级';
  return `先看企业评级 ${rating} 和预算周期是否匹配，再决定要不要继续确认这单任务。`;
});

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

function updateFilter(key, option) {
  selectedFilters[key] = option;
  if ((key === 'budget' || key === 'companyRating') && option !== '全部') {
    showAdvancedFilters.value = true;
  }
}

function countOf(items) {
  return Array.isArray(items) ? items.length : 0;
}

function previewTaskTags(items) {
  return (Array.isArray(items) ? items : []).slice(0, 2);
}

function resetFilters() {
  selectedFilters.tag = '全部';
  selectedFilters.period = '全部';
  selectedFilters.budget = '全部';
  selectedFilters.companyRating = '全部';
  showAdvancedFilters.value = false;
}

function toggleAdvancedFilters() {
  showAdvancedFilters.value = !showAdvancedFilters.value;
}

function syncSelectedFilters() {
  filterGroups.value.forEach((group) => {
    if (!group.options.includes(selectedFilters[group.key])) {
      selectedFilters[group.key] = group.options[0] || '全部';
    }
  });
}

async function loadPage() {
  loading.value = true;
  try {
    page.value = await getTaskMarketplaceData();
    syncSelectedFilters();
  } finally {
    loading.value = false;
  }
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
</script>
