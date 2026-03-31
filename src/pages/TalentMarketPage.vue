<template>
  <section class="page-stack talent-market-page" v-if="page">
    <article v-if="page.requestError" class="result-card stack-sm">
      <span class="eyebrow">数据暂不可用</span>
      <h3>当前先展示兜底列表</h3>
      <p class="muted">系统会保留可筛人才，稍后可继续刷新。</p>
    </article>

    <article class="hero-card talent-market-mobile-hero stack-md">
      <SectionTitle
        eyebrow="人才广场"
        :title="page.summary.title"
        :description="''"
        tag="h1"
      />
      <div class="tag-row talent-market-mobile-summary">
        <span class="soft-pill">{{ talentCount }} 位可选人才</span>
        <span class="soft-pill">{{ fastResponseCount }} 位快响应</span>
      </div>
      <div class="toolbar talent-market-mobile-actions">
        <router-link class="button-primary" :to="roleRouteMap.enterprise.publish">发布任务</router-link>
      </div>
    </article>

    <section class="stack-md" v-if="page.items?.length">
      <article
        v-for="talent in page.items"
        :key="talent.slug"
        class="glass-panel talent-market-mobile-card"
      >
        <div class="talent-market-mobile-card-head">
          <div class="stack-xs talent-market-mobile-title">
            <span class="eyebrow">{{ talent.location || '区域待补充' }}</span>
            <h3>{{ talent.name }}</h3>
            <p class="muted talent-market-mobile-role">{{ talent.role || '待补充角色信息' }}</p>
          </div>
          <span class="soft-pill talent-market-mobile-score">评分 {{ formatScore(talent.score) }}</span>
        </div>

        <div class="talent-market-mobile-judgment-grid">
          <article v-for="item in talentJudgments(talent)" :key="item.label" class="talent-market-mobile-judgment">
            <span class="eyebrow">{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>

        <div class="toolbar talent-market-mobile-card-actions">
          <router-link class="button-primary talent-market-mobile-main-action" :to="detailRoute(talent.slug)">
            查看详情
          </router-link>
        </div>
      </article>
    </section>

    <section v-if="page.metrics?.length" class="metric-grid talent-market-mobile-metrics">
      <MetricCard
        v-for="item in page.metrics"
        :key="item.label"
        :label="item.label"
        :value="item.value"
        :note="item.note"
      />
    </section>

    <article v-else class="glass-panel stack-sm talent-market-mobile-empty">
      <span class="eyebrow">暂无可筛人才</span>
      <h3>先发布任务，再回来筛真实人才</h3>
      <p class="muted">这里会优先展示可合作的人才资料、响应速度和匹配判断。</p>
      <div class="toolbar">
        <router-link class="button-primary" :to="roleRouteMap.enterprise.publish">去发布任务</router-link>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import MetricCard from '../components/MetricCard.vue';
import SectionTitle from '../components/SectionTitle.vue';
import { getTalentMarketplaceData } from '../services/api';
import { roleRouteMap } from '../utils/roleRoutes';

const page = ref(null);

const talentCount = computed(() => (Array.isArray(page.value?.items) ? page.value.items.length : 0));
const fastResponseCount = computed(() =>
  (Array.isArray(page.value?.items) ? page.value.items : []).filter((item) => {
    const minutes = Number(String(item?.responseTime || '').replace(/[^\d]/g, ''));
    return Number.isFinite(minutes) && minutes <= 15;
  }).length
);

function detailRoute(slug) {
  return roleRouteMap.enterprise.detail(slug);
}

function previewItems(items, limit = 3) {
  return (Array.isArray(items) ? items : []).slice(0, limit);
}

function formatScore(score) {
  const value = Number(score);
  if (Number.isFinite(value)) {
    return `${value.toFixed(1)} 分`;
  }

  const text = String(score || '').trim();
  return text || '待评分';
}

function compactText(value, limit = 72) {
  const text = String(value || '').trim();
  if (!text) {
    return '当前还没有更多摘要信息。';
  }
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit).trim()}...`;
}

function talentJudgments(talent) {
  const servicePreview = previewItems(talent.services, 2).join(' / ');
  const tagPreview = previewItems(talent.tags, 2).join(' / ');

  return [
    {
      label: '评分',
      value: formatScore(talent.score)
    },
    {
      label: '响应',
      value: talent.responseTime || '待同步'
    },
    {
      label: '擅长',
      value: compactText(servicePreview || tagPreview || '待补充', 20)
    }
  ];
}

onMounted(async () => {
  page.value = await getTalentMarketplaceData();
});
</script>

<style scoped>
.talent-market-page {
  gap: 12px;
}

.talent-market-mobile-hero {
  display: grid;
  gap: 8px;
  padding: 12px 12px 10px;
  border-radius: 22px;
  border: 1px solid rgba(120, 190, 255, 0.16);
  background:
    linear-gradient(180deg, rgba(9, 17, 32, 0.96), rgba(12, 22, 40, 0.9)),
    radial-gradient(circle at top right, rgba(58, 196, 255, 0.08), transparent 38%);
}

.talent-market-mobile-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}

.talent-market-mobile-summary .soft-pill {
  justify-content: center;
  text-align: center;
}

.talent-market-mobile-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.talent-market-mobile-card {
  display: grid;
  gap: 9px;
  padding: 11px 11px 10px;
  border-radius: 20px;
  border: 1px solid rgba(120, 190, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(9, 18, 33, 0.93), rgba(10, 20, 38, 0.98)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.06), transparent 36%);
  box-shadow: 0 16px 28px rgba(2, 8, 20, 0.16);
}

.talent-market-mobile-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.talent-market-mobile-title {
  min-width: 0;
}

.talent-market-mobile-title h3,
.talent-market-mobile-empty h3 {
  margin: 0;
  color: var(--text-strong);
  font-size: 16px;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.talent-market-mobile-role {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
}

.talent-market-mobile-score {
  flex: 0 0 auto;
  white-space: nowrap;
}

.talent-market-mobile-judgment-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
}

.talent-market-mobile-judgment {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 8px 8px 7px;
  border-radius: 14px;
  border: 1px solid rgba(120, 190, 255, 0.12);
  background: rgba(7, 14, 27, 0.58);
}

.talent-market-mobile-judgment strong {
  color: var(--text-strong);
  font-size: 13px;
  line-height: 1.25;
  letter-spacing: -0.02em;
  min-height: 32px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.talent-market-mobile-card-actions {
  display: grid;
}

.talent-market-mobile-main-action {
  width: 100%;
  justify-content: center;
}

.talent-market-mobile-empty {
  display: grid;
  gap: 7px;
  padding: 12px 12px 11px;
  border-radius: 20px;
  border: 1px solid rgba(120, 190, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(9, 18, 33, 0.93), rgba(10, 20, 38, 0.98)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.06), transparent 36%);
}

.talent-market-mobile-empty p {
  margin: 0;
  line-height: 1.5;
}

.talent-market-mobile-metrics {
  gap: 10px;
}

@media (max-width: 380px) {
  .talent-market-mobile-judgment-grid {
    grid-template-columns: 1fr;
  }

  .talent-market-mobile-summary,
  .talent-market-mobile-actions {
    grid-template-columns: 1fr;
  }
}
</style>
