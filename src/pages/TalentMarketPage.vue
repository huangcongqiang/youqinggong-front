<template>
  <section v-if="page" class="talent-search-workspace stack-xl">
    <section class="talent-search-hero panel">
      <div class="stack-xs">
        <span class="eyebrow">{{ heroEyebrow }}</span>
        <h1>{{ heroTitle }}</h1>
        <p class="talent-search-hero__description">
          {{ heroDescription }}
        </p>
      </div>

      <div class="talent-search-hero__tools">
        <input
          v-model.trim="keyword"
          class="talent-search-input"
          type="search"
          :placeholder="searchPlaceholder"
        />
        <div v-if="quickFilters.length" class="talent-search-chip-row">
          <button
            v-for="item in quickFilters"
            :key="item"
            class="talent-search-filter-chip"
            type="button"
            @click="applyQuick筛选(item)"
          >
            {{ item }}
          </button>
        </div>
        <div class="talent-search-hero__meta">
          <span class="talent-search-hero__meta-pill">{{ heroResultCountLabel }}</span>
          <span class="talent-search-hero__meta-pill">{{ heroSecondaryCountLabel }}</span>
          <span class="talent-search-hero__meta-pill">{{ selectedTalent ? '已选 1 位' : '还没有选择人才' }}</span>
        </div>
      </div>
    </section>

    <section class="talent-search-layout">
      <div class="talent-search-条结果 panel stack-md">
        <div class="section-head">
          <div class="stack-xs">
            <span class="eyebrow">结果</span>
            <h2>人才结果</h2>
          </div>
          <span class="muted">{{ `${filteredItems.length} 位候选人` }}</span>
        </div>

        <div v-if="filteredItems.length" class="talent-search-list">
          <article
            v-for="item in filteredItems"
            :key="item.id"
            class="talent-search-card"
            :class="{
              'is-active': selectedTalent?.id === item.id,
            }"
          >
            <button type="button" class="talent-search-card__body" @click="select人才(item)">
              <div class="talent-search-card__topline">
                <div class="stack-xs">
                  <div class="talent-search-badge-row">
                    <span v-if="已入围TalentIds.has(item.id)" class="talent-search-badge">已入围</span>
                    <span v-else class="talent-search-badge talent-search-badge--muted">人才</span>
                    <span v-if="item.matchLabel || item.match" class="talent-search-badge talent-search-badge--subtle">{{ item.matchLabel || item.match }}</span>
                  </div>
                  <strong>{{ item.name }}</strong>
                  <p>{{ item.role }}</p>
                </div>
                <span class="talent-search-rating">{{ item.score }}</span>
              </div>

              <div class="talent-search-signal-row talent-search-signal-row--tight">
                <span v-if="item.location" class="talent-search-signal">{{ item.location }}</span>
                <span v-if="item.responseTime" class="talent-search-signal">{{ item.responseTime }}</span>
                <span v-if="item.completionRate" class="talent-search-signal">{{ item.completionRate }}</span>
                <span class="talent-search-signal">{{ item.summarySignal }}</span>
              </div>

              <p class="talent-search-card__summary">{{ item.summary }}</p>

              <div v-if="item.standardSkills.length || item.customSkills.length" class="talent-search-chip-groups">
                <div v-if="item.standardSkills.length" class="talent-search-chip-row">
                  <span v-for="tag in item.standardSkills" :key="tag" class="talent-search-chip is-standard">{{ tag }}</span>
                </div>
                <div v-if="item.customSkills.length" class="talent-search-chip-row">
                  <span v-for="tag in item.customSkills" :key="tag" class="talent-search-chip is-custom">{{ tag }}</span>
                </div>
              </div>
            </button>

            <div class="talent-search-card__footer">
              <button class="button-secondary button-secondary--small" type="button" @click="toggle加入入围(item)">
                {{ 已入围TalentIds.has(item.id) ? '移除入围' : '加入入围' }}
              </button>
              <router-link class="button-primary button-secondary--small" :to="item.publishRoute">邀请到任务</router-link>
            </div>
          </article>
        </div>
        <div v-else class="empty-state talent-search-empty-state">
          <strong>当前没有符合这些筛选条件的人才</strong>
          <p>换个关键词，或先清空筛选继续浏览人才。</p>
        </div>
      </div>

      <aside class="talent-search-detail panel stack-md" v-if="selectedTalent">
        <div class="stack-xs">
          <span class="eyebrow">人才档案</span>
          <h2>{{ selectedTalent.name }}</h2>
          <p class="muted">{{ selectedTalent.role }}</p>
        </div>

        <div class="talent-search-stat-grid">
          <article class="talent-search-stat-card">
            <span>评分</span>
            <strong>{{ selectedTalent.score }}</strong>
          </article>
          <article class="talent-search-stat-card">
            <span>完成率</span>
            <strong>{{ selectedTalent.completionRate || '暂未公开' }}</strong>
          </article>
          <article class="talent-search-stat-card">
            <span>响应速度</span>
            <strong>{{ selectedTalent.responseTime || '暂未公开' }}</strong>
          </article>
          <article class="talent-search-stat-card">
            <span>所在地</span>
            <strong>{{ selectedTalent.location || '暂未公开' }}</strong>
          </article>
        </div>

        <div class="stack-sm">
          <span class="eyebrow">可信信号</span>
          <div class="talent-search-chip-row">
            <span class="talent-search-chip">{{ selectedTalent.summarySignal }}</span>
            <span
              v-for="tag in selectedTalent.standardSkills.slice(0, 2)"
              :key="`signal-standard-${tag}`"
              class="talent-search-chip is-standard"
            >
              {{ tag }}
            </span>
            <span
              v-for="tag in selectedTalent.customSkills.slice(0, 1)"
              :key="`signal-custom-${tag}`"
              class="talent-search-chip is-custom"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="stack-sm">
          <span class="eyebrow">概览</span>
          <p class="talent-search-detail__summary">{{ selectedTalent.summary }}</p>
        </div>

        <div v-if="selectedTalent.standardSkills.length || selectedTalent.customSkills.length" class="stack-sm">
          <span class="eyebrow">标签</span>
          <div class="talent-search-chip-groups">
            <div v-if="selectedTalent.standardSkills.length" class="stack-xs">
              <span class="talent-search-label">标准标签</span>
              <div class="talent-search-chip-row">
                <span v-for="item in selectedTalent.standardSkills" :key="`detail-standard-${item}`" class="talent-search-chip is-standard">{{ item }}</span>
              </div>
            </div>
            <div v-if="selectedTalent.customSkills.length" class="stack-xs">
              <span class="talent-search-label">自定义标签</span>
              <div class="talent-search-chip-row">
                <span v-for="item in selectedTalent.customSkills" :key="`detail-custom-${item}`" class="talent-search-chip is-custom">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedTalent.services.length" class="stack-sm">
          <span class="eyebrow">服务</span>
          <div class="talent-search-chip-row">
            <span v-for="item in selectedTalent.services" :key="item" class="talent-search-chip">{{ item }}</span>
          </div>
        </div>

        <div class="stack-sm">
          <span class="eyebrow">最近案例</span>
          <div v-if="selectedTalent.portfolio.length" class="talent-search-portfolio-list">
            <article v-for="item in selectedTalent.portfolio" :key="item.title || item.name" class="talent-search-portfolio-card">
              <strong>{{ item.title || item.name || '作品样本' }}</strong>
                <p>{{ item.description || item.summary || '打开完整档案查看更完整的上下文。' }}</p>
            </article>
          </div>
          <div v-else class="empty-state talent-search-empty-state is-compact">
            <strong>这位人才暂时还没有公开案例</strong>
            <p>先看标签和摘要，再决定是否值得打开完整档案。</p>
          </div>
        </div>

        <div class="talent-search-actions">
          <router-link class="button-primary" :to="selectedTalent.publishRoute">邀请到任务</router-link>
          <router-link class="button-secondary" :to="selectedTalent.detailRoute">查看完整档案</router-link>
        </div>
      </aside>
    </section>

    <ActionErrorDialog :message="errorMessage" title="当前人才搜索暂不可用" eyebrow="搜索人才" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ActionErrorDialog from '../components/ActionErrorDialog.vue';
import { getTalentMarketplaceData } from '../services/api';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const page = ref(null);
const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '');
const selectedTalent = ref(null);
const errorMessage = ref('');
const 已入围TalentIds = ref(new Set());

const quickFilters = computed(() => {
  const groupCandidates = [];
  const rawGroups = Array.isArray(page.value?.filterGroups) ? page.value.filterGroups : [];
  for (const group of rawGroups) {
    if (Array.isArray(group?.items)) {
      group.items.forEach((item) => {
        if (typeof item === 'string' && item && groupCandidates.length < 6) {
          groupCandidates.push(item);
        } else if (typeof item === 'object' && item?.label && groupCandidates.length < 6) {
          groupCandidates.push(item.label);
        }
      });
    }
  }
  if (!groupCandidates.length) {
    const fallback = Array.isArray(page.value?.filters) ? page.value.filters : [];
    return fallback.slice(0, 6).map((item) => (typeof item === 'string' ? item : item?.label || item?.title || '筛选'));
  }
  return groupCandidates;
});

const 已入围Count = computed(() => 已入围TalentIds.value.size);
const heroEyebrow = computed(() => '搜索人才');
const heroTitle = computed(() => page.value?.summary?.title || '先看评分、响应速度和最近案例，再决定是否入围或邀请。');
const heroDescription = computed(() => '把搜索、筛选、档案查看和邀请决策放在同一屏里。先看可信信号和最近案例，再决定是否打开完整档案或直接邀请到任务。');
const searchPlaceholder = computed(() => '按角色、技能、标签或姓名搜索');
const heroResultCountLabel = computed(() => `${filteredItems.value.length} 条结果`);
const heroSecondaryCountLabel = computed(() => `${已入围Count.value} 已入围`);

const filteredItems = computed(() => {
  const items = Array.isArray(page.value?.items) ? page.value.items : [];
  const q = keyword.value.trim().toLowerCase();
  const normalized = items.map((item, index) => ({
    id: String(item?.id || item?.talentUserId || index),
    talentUserId: String(item?.talentUserId || item?.platformUserId || ''),
    name: item?.name || '人才候选人',
    role: item?.role || item?.headline || '角色暂未公开',
    score: item?.score || '暂时没有评分',
    location: item?.location || '',
    responseTime: item?.responseTime || '',
    completionRate: item?.completionRate || '',
    summary: item?.intro || item?.summary || item?.reason || '先查看档案，再决定是否入围或邀请。',
    summarySignal: item?.matchLabel || item?.match || item?.summarySignal || '可信信号',
    standardSkills: Array.isArray(item?.skills) && item.skills.length
      ? item.skills.slice(0, 4)
      : Array.isArray(item?.tags)
        ? item.tags.slice(0, 4)
        : Array.isArray(item?.headlineTags)
          ? item.headlineTags.slice(0, 4)
          : [],
    customSkills: Array.isArray(item?.customSkills) ? item.customSkills.slice(0, 3) : [],
    services: Array.isArray(item?.services) ? item.services.slice(0, 6) : [],
    portfolio: Array.isArray(item?.portfolio) ? item.portfolio.slice(0, 3) : [],
    detailRoute: item?.slug ? roleRouteMap.enterprise.talentDetail(item.slug) : roleRouteMap.enterprise.market,
    publishRoute: roleRouteMap.enterprise.publishWithTalent({
      talentUserId: item?.talentUserId || item?.platformUserId,
      slug: item?.slug,
      name: item?.name
    })
  }));
  return q
    ? normalized.filter((item) =>
        [item.name, item.role, item.summary, item.standardSkills.join(' '), item.customSkills.join(' '), item.services.join(' '), item.location]
          .join(' ')
          .toLowerCase()
      .includes(q)
      )
    : normalized;
});

watch(filteredItems, (items) => {
  if (!items.length) {
    selectedTalent.value = null;
    collaborationCandidates.value = [];
    return;
  }
  const currentId = selectedTalent.value?.id;
  if (!currentId || !items.some((item) => item.id === currentId)) {
    select人才(items[0]);
  }
}, { immediate: true });

function toggle加入入围(item) {
  if (!item?.id) return
  const next = new Set(已入围TalentIds.value)
  if (next.has(item.id)) {
    next.delete(item.id)
  } else {
    next.add(item.id)
  }
  已入围TalentIds.value = next
  if (!selectedTalent.value || selectedTalent.value.id !== item.id) {
    select人才(item)
  }
}

function select人才(item) {
  selectedTalent.value = item;
}

function applyQuick筛选(value) {
  keyword.value = value;
}

onMounted(async () => {
  const payload = await getTalentMarketplaceData();
  page.value = payload;
  if (payload?.requestError) {
    errorMessage.value = payload.requestError;
  }
});
</script>

<style scoped>
.talent-search-workspace {
  display: grid;
  gap: 24px;
}

.talent-search-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.78fr);
  gap: 24px;
  padding: 28px;
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(30, 128, 66, 0.08), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #fbfaf5 100%);
}

.talent-search-hero h1 {
  margin: 0;
  color: #121212;
  font-size: clamp(2.1rem, 4vw, 3.8rem);
  line-height: 0.96;
  letter-spacing: -0.07em;
}

.talent-search-hero__description {
  margin: 0;
  color: #5f5d54;
  line-height: 1.8;
  max-width: 58ch;
}

.talent-search-hero__tools {
  display: grid;
  gap: 14px;
  align-content: start;
}

.talent-search-matching-summary {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 24px;
  border: 1px solid rgba(28, 105, 63, 0.14);
  background: linear-gradient(180deg, #f4fbf5 0%, #ffffff 100%);
  box-shadow: 0 14px 30px rgba(16, 24, 40, 0.05);
}

.talent-search-matching-summary__body {
  display: grid;
  gap: 6px;
}

.talent-search-matching-summary strong {
  color: #172225;
  font-size: 1rem;
}

.talent-search-matching-summary p {
  margin: 0;
  color: #5d675e;
  line-height: 1.7;
}

.talent-search-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.talent-search-hero__meta-pill,
.talent-search-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eff7ee;
  color: #187236;
  font-weight: 700;
}

.talent-search-badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.talent-search-badge--muted {
  background: #f4f5f7;
  color: #54606e;
}

.talent-search-badge--subtle {
  background: #fff7e8;
  color: #8b5c14;
}

.talent-search-input {
  min-height: 48px;
  border: 1px solid rgba(18, 18, 18, 0.12);
  border-radius: 999px;
  padding: 0 18px;
  background: #fffef8;
}

.talent-search-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(340px, 0.95fr);
  gap: 24px;
}

.talent-search-workspace.is-matching-mode .talent-search-hero {
  grid-template-columns: minmax(0, 1fr);
  padding: 24px 26px;
}

.talent-search-workspace.is-matching-mode .talent-search-layout {
  grid-template-columns: minmax(360px, 0.92fr) minmax(0, 1.08fr);
}

.talent-search-workspace.is-matching-mode .talent-search-detail {
  background:
    radial-gradient(circle at top right, rgba(31, 120, 69, 0.06), transparent 34%),
    linear-gradient(180deg, #ffffff 0%, #fbfaf5 100%);
}

.talent-search-条结果,
.talent-search-detail {
  border-radius: 28px;
  padding: 26px;
}

.section-head,
.talent-search-条结果__header,
.talent-search-actions,
.talent-search-card__topline,
.talent-search-candidate-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-head h2,
.talent-search-detail h2 {
  margin: 4px 0 0;
  color: #121212;
  font-size: 1.65rem;
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.talent-search-list,
.talent-search-candidate-list,
.talent-search-portfolio-list {
  display: grid;
  gap: 14px;
}

.talent-search-card,
.talent-search-candidate-card,
.talent-search-portfolio-card {
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #ffffff;
  text-align: left;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.talent-search-card {
  padding: 0;
  overflow: hidden;
}

.talent-search-card__body {
  width: 100%;
  display: grid;
  gap: 14px;
  padding: 18px 20px;
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.talent-search-card__body:focus-visible,
.talent-search-candidate-card:focus-visible,
.talent-search-filter-chip:focus-visible,
.talent-search-card__footer .button-secondary:focus-visible {
  outline: 2px solid rgba(16, 138, 0, 0.32);
  outline-offset: 2px;
}

.talent-search-candidate-card.is-highlighted {
  border-color: rgba(28, 105, 63, 0.35);
  box-shadow: 0 0 0 1px rgba(28, 105, 63, 0.12), 0 18px 40px rgba(16, 24, 40, 0.08);
  background: linear-gradient(180deg, #f4fbf5 0%, #ffffff 100%);
}

.talent-search-recovery-card {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 22px;
  border: 1px solid rgba(28, 105, 63, 0.14);
  background: linear-gradient(180deg, #f6fbf5 0%, #ffffff 100%);
  box-shadow: 0 12px 30px rgba(16, 24, 40, 0.05);
}

.talent-search-recovery-card strong {
  color: #172225;
  font-size: 1rem;
}

.talent-search-recovery-card p {
  margin: 0;
  color: #5d675e;
  line-height: 1.65;
}

.talent-search-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px 18px;
}

.talent-search-workspace.is-matching-mode .talent-search-card__footer {
  justify-content: flex-start;
  gap: 10px;
}

.talent-search-workspace.is-matching-mode .talent-search-card__footer .button-secondary,
.talent-search-workspace.is-matching-mode .talent-search-card__footer .button-primary {
  min-width: 160px;
  justify-content: center;
}

.talent-search-card:hover,
.talent-search-candidate-card:hover,
.talent-search-portfolio-card:hover {
  transform: translateY(-1px);
  border-color: rgba(16, 138, 0, 0.18);
  box-shadow: 0 18px 30px rgba(18, 18, 18, 0.05);
}

.talent-search-card.is-active {
  border-color: rgba(16, 138, 0, 0.28);
  background: #eff7ee;
}

.talent-search-card.is-已入围 {
  border-color: rgba(16, 138, 0, 0.38);
  background: #fbfff7;
  box-shadow: 0 18px 30px rgba(16, 138, 0, 0.08);
}

.talent-search-card__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.talent-search-card strong,
.talent-search-detail strong,
.talent-search-candidate-card strong,
.talent-search-portfolio-card strong {
  color: #121212;
}

.talent-search-card p,
.talent-search-detail__summary,
.talent-search-candidate-card p,
.talent-search-portfolio-card p {
  margin: 0;
  color: #606059;
  line-height: 1.72;
}

.talent-search-rating,
.talent-search-chip,
.talent-search-signal,
.talent-search-filter-chip {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eff7ee;
  color: #187236;
  font-weight: 700;
}

.talent-search-filter-chip {
  border: 1px solid rgba(16, 138, 0, 0.18);
  background: #ffffff;
  color: #187236;
}

.talent-search-chip.is-standard {
  background: #edf7ea;
  color: #1f6a3c;
  border: 1px solid rgba(30, 128, 66, 0.18);
}

.talent-search-chip.is-custom {
  background: #fff3e8;
  color: #9a5b20;
  border: 1px solid rgba(198, 111, 37, 0.18);
}

.talent-search-chip-row,
.talent-search-signal-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.talent-search-chip-groups {
  display: grid;
  gap: 10px;
}

.talent-search-label {
  color: #6f7b70;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.talent-search-signal-row--tight {
  gap: 8px;
}

.talent-search-detail .talent-search-chip-row {
  gap: 8px;
}

.talent-search-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.talent-search-stat-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  border-radius: 20px;
  background: #f7f4ed;
}

.talent-search-stat-card span {
  color: #7a766e;
}

.talent-search-stat-card strong {
  color: #121212;
  font-size: 1.35rem;
}

.talent-search-actions {
  flex-wrap: wrap;
}

.talent-search-detail {
  position: sticky;
  top: 124px;
  align-self: start;
}

.empty-state {
  border-radius: 22px;
  border: 1px dashed rgba(18, 18, 18, 0.14);
  background: #fffef8;
  color: #5f5d54;
}

.talent-search-empty-state {
  min-height: 160px;
}

.talent-search-empty-state.is-compact {
  min-height: 132px;
}

@media (max-width: 1280px) {
  .talent-search-hero,
  .talent-search-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .talent-search-条结果,
  .talent-search-detail,
  .talent-search-hero {
    padding: 20px;
    border-radius: 24px;
  }

  .talent-search-stat-grid {
    grid-template-columns: 1fr;
  }

  .talent-search-card__topline,
  .talent-search-candidate-card,
  .talent-search-actions,
  .talent-search-card__footer {
    flex-direction: column;
  }
}
</style>
