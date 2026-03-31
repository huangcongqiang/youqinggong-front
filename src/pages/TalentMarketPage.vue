<template>
  <section class="page-stack talent-market-page office-directory-page" v-if="page">
    <article class="glass-panel talent-market-hero office-directory-hero stack-md">
      <div class="panel-header talent-market-hero-head">
        <div class="stack-xs talent-market-hero-copy">
          <span class="eyebrow">企业端 / 资源目录</span>
          <h2>{{ page.summary?.title || '人才广场' }}</h2>
          <p class="muted talent-market-hero-lead">
            {{ page.summary?.description || '先缩候选池，再在右侧看详情。' }}
          </p>
        </div>
        <div class="toolbar talent-market-actions">
          <router-link class="button-primary" :to="roleRouteMap.enterprise.publish">发布任务</router-link>
          <router-link class="button-secondary" :to="roleRouteMap.enterprise.home">返回工作台</router-link>
        </div>
      </div>

      <div class="stack-sm talent-market-filter-shell">
        <div class="talent-market-filter-topline">
          <span class="eyebrow">顶部筛选</span>
          <div class="tag-row talent-market-filter-topline-meta">
            <span class="soft-pill">{{ filteredTalents.length }} 个可选资源</span>
            <span class="soft-pill">筛选：{{ selectedFilter }}</span>
          </div>
        </div>

        <div class="tag-row talent-market-filter-tags">
          <button
            v-for="filter in filterOptions"
            :key="filter"
            type="button"
            class="soft-pill talent-market-filter-chip"
            :class="{ 'is-active': selectedFilter === filter }"
            @click="selectedFilter = filter"
          >
            {{ filter }}
          </button>
        </div>
      </div>
    </article>

    <section class="talent-market-directory-layout office-directory-layout">
      <section class="stack-md talent-market-list-rail office-directory-list">
        <article
          v-if="filteredTalents.length === 0"
          class="glass-panel talent-market-empty-state office-directory-empty"
        >
          <div class="stack-xs">
            <span class="eyebrow">暂无匹配资源</span>
            <h3>换个筛选条件，再看一次目录</h3>
          </div>
          <p class="muted">
            当前筛出来的资源为空。你可以先切回“全部”，或者换成更靠近业务方向的标签。
          </p>
          <div class="toolbar">
            <button class="button-secondary" type="button" @click="selectedFilter = '全部'">清空筛选</button>
            <router-link class="button-primary" :to="roleRouteMap.enterprise.home">返回工作台</router-link>
          </div>
        </article>

        <article
          v-for="(talent, index) in filteredTalents"
          :key="talent.slug"
          class="glass-panel talent-market-resource-row office-directory-row"
          :class="{ 'is-active': activeTalent?.slug === talent.slug }"
          tabindex="0"
          role="button"
          :aria-pressed="activeTalent?.slug === talent.slug"
          @click="selectTalent(talent)"
          @keyup.enter="selectTalent(talent)"
          @keyup.space.prevent="selectTalent(talent)"
        >
            <div class="talent-market-resource-row-main">
              <div class="panel-header talent-market-resource-row-head">
                <div class="stack-xs talent-market-resource-row-title">
                <div class="title-line talent-market-resource-row-title-line">
                  <span class="badge-number talent-market-resource-rank">{{ index + 1 }}</span>
                  <div class="stack-xs">
                    <h3>{{ talent.name }}</h3>
                    <p class="muted">{{ talent.role }}</p>
                  </div>
                </div>

                <div class="tag-row talent-market-resource-row-meta">
                  <span class="soft-pill">{{ talent.location }}</span>
                  <span class="soft-pill">评分 {{ talent.score }}</span>
                  <span class="soft-pill">响应 {{ talent.responseTime }}</span>
                </div>
                </div>
              </div>

              <p class="muted talent-market-resource-row-summary">
                {{ compactSummary(talent.summary) }}
              </p>

              <div class="tag-row talent-market-resource-row-tags">
                <span v-for="tag in previewTalentTags(talent.tags)" :key="tag" class="soft-pill">{{ tag }}</span>
                <span v-if="countOf(talent.tags) > previewTalentTags(talent.tags).length" class="soft-pill">
                  +{{ countOf(talent.tags) - previewTalentTags(talent.tags).length }}
                </span>
              </div>
            </div>

            <div class="talent-market-resource-row-side">
              <div class="stack-sm talent-market-resource-row-block">
                <span class="eyebrow">适合承担</span>
                <div class="tag-row talent-market-resource-row-services">
                  <span v-for="item in previewTalentServices(talent.services)" :key="item" class="soft-pill">{{ item }}</span>
                </div>
              </div>
            </div>
        </article>
      </section>

      <aside class="talent-market-detail-rail office-directory-detail-rail">
        <article v-if="activeTalent" class="glass-panel talent-market-detail-panel office-directory-detail-panel stack-md">
          <div class="panel-header talent-market-detail-head">
            <div class="stack-xs talent-market-detail-title">
              <span class="eyebrow">稳定详情承接</span>
              <h3>{{ activeTalent.name }}</h3>
              <p class="muted">{{ activeTalent.role }}</p>
            </div>
            <div class="toolbar talent-market-detail-actions">
              <router-link class="button-primary" :to="roleRouteMap.enterprise.publish">
                发起合作
              </router-link>
              <router-link class="button-secondary" :to="detailRoute(activeTalent.slug)">
                查看完整详情
              </router-link>
            </div>
          </div>

          <div class="tag-row talent-market-detail-tags">
            <span class="soft-pill">{{ activeTalent.location }}</span>
            <span class="soft-pill">评分 {{ activeTalent.score }}</span>
            <span class="soft-pill">响应 {{ activeTalent.responseTime }}</span>
          </div>

          <div class="mini-card stack-sm talent-market-detail-decision">
            <span class="eyebrow">推荐结论</span>
            <strong>{{ activeTalentDecisionTitle }}</strong>
            <p class="muted">{{ activeTalentDecisionBody }}</p>
          </div>

          <div class="dashboard-detail-section talent-market-detail-section">
            <h4>目录摘要</h4>
            <p class="muted">{{ activeTalent.summary }}</p>
          </div>

          <div class="dashboard-detail-dual talent-market-detail-dual">
            <div class="mini-card stack-sm talent-market-detail-block">
              <h4>专长标签</h4>
              <div class="tag-row">
                <span v-for="tag in activeTalent.tags || []" :key="tag" class="soft-pill">{{ tag }}</span>
              </div>
            </div>
            <div class="mini-card stack-sm talent-market-detail-block">
              <h4>可承接服务</h4>
              <div class="tag-row">
                <span v-for="item in activeTalent.services || []" :key="item" class="soft-pill">{{ item }}</span>
              </div>
            </div>
          </div>

          <div class="dashboard-detail-section talent-market-detail-section">
            <h4>近期作品</h4>
            <p class="muted">{{ activeTalent.portfolio }}</p>
          </div>
          <div class="toolbar talent-market-detail-actions talent-market-detail-actions-secondary">
            <router-link class="button-secondary" :to="detailRoute(activeTalent.slug)">
              进入人才详情页
            </router-link>
          </div>
        </article>

        <article v-else class="glass-panel talent-market-detail-placeholder office-directory-detail-placeholder stack-md">
          <div class="stack-xs">
            <span class="eyebrow">右侧详情区</span>
            <h3>从左侧选择一个资源</h3>
          </div>
          <p class="muted">
            这里会固定承接选中的人才信息，适合在办公端快速核对评分、响应速度、服务项和近期作品。
          </p>
        </article>
      </aside>
    </section>
  </section>

  <section v-else class="page-stack talent-market-page office-directory-page">
    <article class="glass-panel talent-market-loading-state stack-md">
      <span class="eyebrow">人才广场加载中</span>
      <h3>正在同步候选目录与右侧详情</h3>
      <p class="muted">请稍等，页面会先拉取可选资源，再固定右侧详情承接区。</p>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTalentMarketplaceData } from '../services/api';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const page = ref(null);
const selectedFilter = ref(String(route.query.filter || '全部'));
const activeTalentSlug = ref(null);

const filterOptions = computed(() => {
  if (!page.value) {
    return [];
  }
  const values = Array.isArray(page.value?.filters) ? page.value.filters : [];
  const unique = [...new Set(values.map((item) => String(item || '').trim()).filter(Boolean))];
  return ['全部', ...unique];
});

const filteredTalents = computed(() => {
  const items = Array.isArray(page.value?.items) ? page.value.items : [];
  const activeFilter = selectedFilter.value;
  if (activeFilter === '全部') {
    return items;
  }
  return items.filter((talent) => matchesTalentFilter(talent, activeFilter));
});

const activeTalent = computed(() => {
  const items = filteredTalents.value;
  if (!items.length) {
    return null;
  }
  return items.find((talent) => talent.slug === activeTalentSlug.value) || items[0];
});

const activeTalentDecisionTitle = computed(() => {
  if (!activeTalent.value) {
    return '先从左侧选择一位候选人';
  }
  return `${activeTalent.value.score} 分 / ${activeTalent.value.responseTime} 响应`;
});

const activeTalentDecisionBody = computed(() => {
  if (!activeTalent.value) {
    return '右侧会承接当前候选人的决策摘要、专长标签和下一步动作。';
  }
  const services = previewTalentServices(activeTalent.value.services).join(' / ');
  return services
    ? `优先看这位候选人是否适合承接 ${services}，再决定要不要进入完整详情和发起合作。`
    : '先看评分、响应速度和近期作品，再决定是否进入完整详情页继续判断。';
});

function matchesTalentFilter(talent, filter) {
  const normalizedFilter = String(filter || '').trim();
  if (!normalizedFilter) {
    return true;
  }

  if (normalizedFilter === '高评分') {
    return Number(talent?.score) >= 4.9;
  }

  if (normalizedFilter === '近期可接单') {
    const responseText = String(talent?.responseTime || '');
    const minutes = Number(responseText.replace(/[^\d]/g, ''));
    return Number.isFinite(minutes) && minutes <= 15;
  }

  const searchPool = [
    talent?.role,
    talent?.summary,
    talent?.portfolio,
    ...(Array.isArray(talent?.tags) ? talent.tags : []),
    ...(Array.isArray(talent?.services) ? talent.services : [])
  ]
    .map((item) => String(item || '').toLowerCase())
    .join(' ');

  return searchPool.includes(normalizedFilter.toLowerCase());
}

function countOf(items) {
  return Array.isArray(items) ? items.length : 0;
}

function previewTalentTags(items) {
  return (Array.isArray(items) ? items : []).slice(0, 2);
}

function previewTalentServices(items) {
  return (Array.isArray(items) ? items : []).slice(0, 2);
}

function compactSummary(value, limit = 56) {
  const text = String(value || '').trim();
  if (!text) {
    return '当前还没有更多摘要信息。';
  }
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit).trim()}...`;
}

function selectTalent(talent) {
  activeTalentSlug.value = talent?.slug || null;
}

function detailRoute(slug) {
  const query = { from: 'market' };
  if (selectedFilter.value && selectedFilter.value !== '全部') {
    query.filter = selectedFilter.value;
  }
  return {
    path: roleRouteMap.enterprise.detail(slug),
    query
  };
}

watch(
  filterOptions,
  (options) => {
    if (!options.length) {
      return;
    }
    if (!options.includes(selectedFilter.value)) {
      selectedFilter.value = '全部';
    }
  },
  { immediate: true }
);

watch(
  () => route.query.filter,
  (value) => {
    const next = String(value || '全部');
    const allowed = filterOptions.value;
    selectedFilter.value = allowed.length ? (allowed.includes(next) ? next : '全部') : next;
  }
);

watch(
  filteredTalents,
  (items) => {
    if (!items.length) {
      activeTalentSlug.value = null;
      return;
    }

    if (!items.some((talent) => talent.slug === activeTalentSlug.value)) {
      activeTalentSlug.value = items[0].slug;
    }
  },
  { immediate: true }
);

watch(selectedFilter, (value) => {
  if (!page.value) {
    return;
  }
  const nextQuery = { ...route.query };
  if (!value || value === '全部') {
    delete nextQuery.filter;
  } else {
    nextQuery.filter = value;
  }
  router.replace({ query: nextQuery });
});

onMounted(async () => {
  page.value = await getTalentMarketplaceData();
});
</script>
