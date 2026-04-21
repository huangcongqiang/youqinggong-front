<template>
  <section class="task-market-page">
    <ActionErrorDialog :message="errorMessage || loadError" title="任务广场暂时不可用" eyebrow="找任务" />

    <header class="task-market-header workspace-shell-card">
      <div class="task-market-header__copy stack-sm">
        <span class="eyebrow">找任务</span>
        <div class="stack-xs">
          <h1>寻找任务</h1>
          <p class="task-market-lead">
            在这里搜索、筛选并比较任务，准备好后再打开详情或继续申请。
          </p>
        </div>
        <div class="task-market-header__pills">
          <span class="info-pill">{{ filteredItems.length }} 条结果</span>
          <span v-if="activeFilterCount" class="info-pill">{{ activeFilterCount }} 个筛选</span>
          <span v-if="keyword" class="info-pill">关键词：{{ keyword }}</span>
          <span v-if="sortLabel" class="info-pill">排序：{{ sortLabel }}</span>
        </div>
      </div>

      <div class="task-market-header__search-card">
        <label class="search-field">
          <span class="eyebrow">搜索任务</span>
          <input
            v-model.trim="keyword"
            type="search"
            class="search-input"
            placeholder="按企业、技能或任务描述搜索"
          />
        </label>
      </div>
    </header>

    <div v-if="loading" class="workspace-shell-card state-banner state-banner--loading">
      <div>
        <strong>正在加载任务</strong>
        <p>我们正在同步最新的任务结果和申请状态。</p>
      </div>
    </div>

    <div v-else-if="loadError" class="workspace-shell-card state-banner state-banner--error">
      <div>
        <strong>任务流加载失败</strong>
        <p>{{ loadError }}</p>
      </div>
      <button type="button" class="button-secondary" @click="loadMarketplace">重试</button>
    </div>

    <section class="task-market-layout">
      <aside class="task-market-sidebar workspace-shell-card">
        <div class="section-head stack-xs">
          <span class="eyebrow">筛选</span>
          <h2>缩小范围</h2>
          <p>先用筛选条件缩小结果，再打开任务详情。</p>
        </div>

        <div v-if="filterGroups.length" class="filter-stack">
          <article v-for="group in filterGroups" :key="group.label" class="filter-group">
            <div class="filter-group__head">
              <strong>{{ group.label }}</strong>
              <span>{{ group.items.length }} 项</span>
            </div>
            <div class="chip-grid">
              <button
                v-for="option in group.items"
                :key="option"
                type="button"
                class="filter-chip"
                :class="{ 'is-active': isSelectedFilter(group.label, option) }"
                @click="toggleFilter(group.label, option)"
              >
                {{ option }}
              </button>
            </div>
          </article>
        </div>

        <div v-else class="empty-panel empty-panel--compact">
          <strong>筛选项还在整理中</strong>
          <p>任务类型、预算、周期和信任信号会在这里继续补齐。</p>
        </div>

        <div class="toolbar task-market-sidebar__footer">
          <button type="button" class="button-secondary" @click="resetSearch">清空筛选</button>
        </div>
      </aside>

      <main class="task-market-results workspace-shell-card">
        <div class="section-head section-head--split">
          <div>
            <span class="eyebrow">结果</span>
            <h2>{{ keyword ? '搜索结果' : '浏览匹配任务' }}</h2>
          </div>
          <div class="section-head__meta">{{ filteredItems.length }} 条结果</div>
        </div>

        <div v-if="filteredItems.length" class="job-list">
          <article
            v-for="item in filteredItems"
            :key="item.id"
            class="job-card"
            :class="{ 'is-active': isSelectedJob(item) }"
          >
            <button type="button" class="job-card__select" @click="selectJob(item)">
              <div class="job-card__topline">
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.company }}</p>
                </div>
                <span class="match-chip">{{ item.match }}</span>
              </div>

              <p class="job-card__summary">{{ item.summary }}</p>

              <div class="job-card__signals">
                <span>{{ item.budget }}</span>
                <span>{{ item.period }}</span>
                <span>{{ item.jobType || '任务类型' }}</span>
                <span v-if="item.location">{{ item.location }}</span>
              </div>

              <div v-if="item.signals.length" class="result-trust">
                <span
                  v-for="signal in item.signals.slice(0, 2)"
                  :key="`${item.id}-${signal.title}`"
                  class="result-trust__item"
                >
                  {{ signal.title }} · {{ signal.note }}
                </span>
              </div>

              <div v-if="item.tags.length" class="chip-grid chip-grid--wrap">
                <span v-for="tag in item.tags" :key="tag" class="info-pill">{{ tag }}</span>
              </div>
            </button>

            <div class="job-card__cta">
              <div class="job-card__cta-copy">
                <span>当前状态</span>
                <strong>{{ jobCardState(item).stateLabel }}</strong>
                <small>{{ jobCardState(item).nextStep }}</small>
              </div>
              <div class="toolbar">
                <router-link class="button-secondary" :to="jobCardAction(item).to">{{ jobCardAction(item).label }}</router-link>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-panel empty-panel--results">
          <strong>当前没有符合这些筛选的任务</strong>
          <p>换一个关键词，或者清空筛选后继续浏览任务。</p>
          <button type="button" class="button-secondary" @click="resetSearch">清空筛选</button>
        </div>
      </main>
    </section>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import { getTaskMarketplaceData } from '../services/api'
import { roleRouteMap } from '../utils/roleRoutes'
import {
  buildBrowseQuery,
  buildTaskApplyLocation,
  buildTaskBrowseLocation,
  buildTaskDetailLocation,
  createEmptyMarketplace,
  deriveProposalState,
  filterMarketplaceItems,
  normalizeJobItem,
  normalizeMarketplace,
  parseSelectedFilters,
  readStoredProposalDraft,
  buildFilterQuery,
} from './taskMarketSurfaceState.js'

const route = useRoute()
const router = useRouter()

const page = ref(createEmptyMarketplace())
const loading = ref(false)
const loadError = ref('')
const errorMessage = ref('')
const keyword = ref(typeof route.query.q === 'string' ? route.query.q : '')
const selectedFilters = ref({})
const hydratingFromRoute = ref(false)

const filterGroups = computed(() => {
  const rawGroups = page.value?.filterGroups
  const groups = Array.isArray(rawGroups)
    ? rawGroups
    : rawGroups && typeof rawGroups === 'object'
      ? Object.entries(rawGroups).map(([label, items]) => ({ label, items }))
      : []
  return groups.map((group, index) => ({
    label: group?.label || `筛选 ${index + 1}`,
    items: Array.isArray(group?.items) ? group.items.filter(Boolean) : [],
  }))
})

const normalizedItems = computed(() => {
  const items = Array.isArray(page.value?.items) ? page.value.items : []
  return items.map((item, index) => normalizeJobItem(item, index))
})

const filteredItems = computed(() => filterMarketplaceItems(normalizedItems.value, keyword.value, selectedFilters.value))
const activeFilterCount = computed(() => Object.values(selectedFilters.value).reduce((count, items) => count + (Array.isArray(items) ? items.length : 0), 0))
const selectedTaskId = computed(() => normalizeTaskId(route.query.taskId))
const sortLabel = computed(() => normalizeQueryValue(route.query.sort))

onMounted(loadMarketplace)

watch(filterGroups, () => {
  hydrateFromRoute()
}, { immediate: true })

watch(() => route.query, () => {
  hydrateFromRoute()
}, { deep: true, immediate: true })

watch([keyword, selectedFilters, filterGroups], () => {
  if (hydratingFromRoute.value || !filterGroups.value.length) return
  syncBrowseQuery()
}, { deep: true })

async function loadMarketplace() {
  loading.value = true
  loadError.value = ''
  errorMessage.value = ''
  try {
    const payload = await getTaskMarketplaceData()
    page.value = normalizeMarketplace(payload)
  } catch (error) {
    loadError.value = error?.message || '任务广场加载失败'
    page.value = createEmptyMarketplace()
  } finally {
    loading.value = false
  }
}

function hydrateFromRoute() {
  hydratingFromRoute.value = true
  keyword.value = typeof route.query.q === 'string' ? route.query.q : ''
  selectedFilters.value = filterGroups.value.length ? parseSelectedFilters(route.query, filterGroups.value) : {}
  nextTick(() => {
    hydratingFromRoute.value = false
  })
}

function syncBrowseQuery() {
  const nextQuery = buildBrowseQuery(route.query, {
    q: keyword.value.trim() || undefined,
    ...buildFilterQuery(selectedFilters.value, filterGroups.value),
  })

  if (serializeQuery(route.query) === serializeQuery(nextQuery)) return
  router.replace({ path: '/talent/tasks', query: nextQuery })
}

function serializeQuery(query = {}) {
  return Object.keys(query)
    .sort()
    .map((key) => `${key}:${JSON.stringify(query[key])}`)
    .join('|')
}

function normalizeTaskId(value) {
  return Array.isArray(value) ? String(value[0] || '').trim() : String(value || '').trim()
}

function normalizeQueryValue(value) {
  if (Array.isArray(value)) return String(value[0] || '').trim()
  return String(value || '').trim()
}

function isSelectedFilter(label, option) {
  return Array.isArray(selectedFilters.value?.[label]) && selectedFilters.value[label].includes(option)
}

function toggleFilter(label, option) {
  const group = filterGroups.value.find((entry) => entry.label === label)
  if (!group) return
  const current = Array.isArray(selectedFilters.value[label]) ? [...selectedFilters.value[label]] : []
  const nextValue = String(option || '').trim()
  if (!nextValue) return
  if (current.includes(nextValue)) {
    selectedFilters.value = {
      ...selectedFilters.value,
      [label]: current.filter((value) => value !== nextValue),
    }
  } else {
    selectedFilters.value = {
      ...selectedFilters.value,
      [label]: [...current, nextValue],
    }
  }
}

function resetSearch() {
  keyword.value = ''
  selectedFilters.value = {}
  const nextQuery = {}
  const sortValue = normalizeQueryValue(route.query.sort)
  if (sortValue) nextQuery.sort = sortValue
  router.replace({ path: '/talent/tasks', query: nextQuery })
}

function selectJob(item) {
  const taskId = String(item?.taskId || item?.id || '').trim()
  if (!taskId) return
  router.replace(buildTaskBrowseLocation(route.query, { taskId }))
}

function isSelectedJob(item) {
  return normalizeTaskId(item?.taskId || item?.id) === selectedTaskId.value
}

function resolveTaskKey(item) {
  return String(item?.taskId || item?.id || '').trim()
}

function detailLocation(item) {
  return buildTaskDetailLocation(resolveTaskKey(item), route.query)
}

function applyLocation(item) {
  return buildTaskApplyLocation(resolveTaskKey(item), route.query)
}

function messagesLocation(item, state) {
  const taskId = resolveTaskKey(item)
  const room = String(state?.serverProposalRoomKey || '').trim()
  return {
    path: roleRouteMap.talent.messages,
    query: {
      taskId,
      source: 'application',
      surface: 'application',
      ...(room ? { room } : {}),
    },
  }
}

function contractLocation(item) {
  const taskId = resolveTaskKey(item)
  return {
    path: roleRouteMap.talent.workspace,
    query: {
      taskId,
      source: 'contract',
      surface: 'contract',
      originSource: 'application',
      originTaskId: taskId,
    },
  }
}

function jobCardState(item) {
  const taskKey = resolveTaskKey(item)
  const draft = readStoredProposalDraft(taskKey)
  return deriveProposalState({
    job: item,
    draft,
    selectedQuestions: Array.isArray(item?.questions) ? item.questions : [],
    selectedSignals: Array.isArray(item?.signals) ? item.signals : [],
    submittedAt: draft.submittedAt,
    submittedRoomKey: draft.submittedRoomKey,
  })
}

function jobCardAction(item) {
  const state = jobCardState(item)
  if (state.primaryAction === 'submit') {
    return { label: state.primaryActionLabel, to: applyLocation(item) }
  }
  if (state.primaryAction === 'messages') {
    return { label: state.primaryActionLabel, to: messagesLocation(item, state) }
  }
  if (state.primaryAction === 'contract') {
    return { label: state.primaryActionLabel, to: contractLocation(item) }
  }
  return { label: '查看任务', to: detailLocation(item) }
}

</script>

<style scoped>
.task-market-page,
.stack-xs,
.stack-sm,
.stack-md,
.stack-lg,
.filter-stack,
.job-list,
.result-trust,
.chip-grid,
.section-head,
.section-head--split,
.task-market-header,
.task-market-header__copy,
.task-market-results,
.task-market-sidebar,
.job-card,
.job-card__cta,
.job-card__cta-copy,
.job-card__select,
.empty-panel,
.state-banner,
.toolbar,
.search-field {
  display: grid;
}

.task-market-page {
  gap: 24px;
}

.stack-xs {
  gap: 8px;
}

.stack-sm {
  gap: 10px;
}

.stack-md {
  gap: 16px;
}

.stack-lg {
  gap: 20px;
}

.workspace-shell-card,
.job-card,
.empty-panel,
.state-banner,
.search-field,
.filter-group,
.result-trust__item,
.info-pill,
.match-chip,
.button-primary,
.button-secondary {
  border: 1px solid rgba(18, 18, 18, 0.08);
  border-radius: 24px;
  background: #fff;
}

.workspace-shell-card,
.state-banner,
.empty-panel,
.task-market-results,
.task-market-sidebar {
  padding: 20px;
  box-shadow: 0 18px 48px rgba(39, 55, 27, 0.06);
}

.task-market-header {
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 20px;
  align-items: end;
}

.task-market-header__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.task-market-lead,
.empty-panel p,
.state-banner p,
.job-card__summary,
.job-card__cta-copy small,
.job-card__cta-copy span,
.filter-group__head span,
.section-head__meta {
  color: #5c5c56;
}

.task-market-header h1,
.section-head h2,
.job-card__topline strong,
.job-card__cta-copy strong,
.empty-panel strong,
.state-banner strong,
.filter-group__head strong {
  margin: 0;
  color: #111827;
}

.task-market-header h1 {
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1.02;
}

.search-field {
  gap: 10px;
  padding: 16px 18px;
}

.search-input {
  width: 100%;
  border: 0;
  outline: 0;
  font: inherit;
  background: transparent;
}

.task-market-layout {
  display: grid;
  grid-template-columns: minmax(250px, 280px) minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.task-market-sidebar {
  position: sticky;
  top: 18px;
}

.filter-stack {
  gap: 16px;
}

.filter-group {
  padding: 16px;
  background: rgba(247, 248, 244, 0.66);
}

.filter-group__head,
.section-head,
.section-head--split,
.job-card__topline,
.job-card__cta,
.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.section-head--split {
  align-items: center;
}

.chip-grid {
  grid-template-columns: repeat(auto-fit, minmax(90px, max-content));
  gap: 10px;
}

.chip-grid--wrap {
  grid-template-columns: none;
  display: flex;
  flex-wrap: wrap;
}

.filter-chip,
.info-pill,
.match-chip,
.soft-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(18, 18, 18, 0.1);
  font-size: 0.9rem;
  font-weight: 600;
}

.filter-chip {
  background: #fff;
  color: #111827;
}

.filter-chip.is-active {
  background: #108a00;
  border-color: #108a00;
  color: #fff;
}

.info-pill,
.match-chip,
.soft-pill {
  background: #f7f8f4;
  color: #111827;
}

.job-list {
  gap: 16px;
}

.job-card {
  padding: 18px;
  gap: 14px;
  background: #fff;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.job-card.is-active {
  border-color: rgba(16, 138, 0, 0.28);
  box-shadow: 0 18px 44px rgba(16, 138, 0, 0.09);
}

.job-card__select {
  gap: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
}

.job-card__signals,
.result-trust {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.job-card__signals span,
.result-trust__item {
  padding: 8px 10px;
  border-radius: 999px;
  background: #f7f8f4;
  color: #444;
  font-size: 0.9rem;
}

.job-card__cta-copy span,
.job-card__cta-copy small,
.task-market-lead,
.muted-copy {
  margin: 0;
}

.job-card__cta {
  align-items: center;
}

.job-card__cta-copy {
  gap: 4px;
}

.button-primary,
.button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 14px;
  text-decoration: none;
  font-weight: 600;
}

.button-primary {
  background: #108a00;
  border-color: #108a00;
  color: #fff;
}

.button-secondary {
  color: #111827;
  background: #fff;
}

.task-market-sidebar__footer {
  justify-content: flex-end;
}

.empty-panel,
.state-banner {
  align-content: start;
  gap: 8px;
}

.empty-panel--compact,
.empty-panel--detail,
.empty-panel--results {
  min-height: 160px;
}

.eyebrow {
  color: #66715f;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

@media (max-width: 1100px) {
  .task-market-layout,
  .task-market-header {
    grid-template-columns: 1fr;
  }

  .task-market-sidebar {
    position: static;
  }
}

@media (max-width: 760px) {
  .job-card__cta,
  .section-head,
  .section-head--split,
  .task-market-header,
  .filter-group__head,
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

<style scoped>
/* codex visual polish */
.task-market-header {
  padding: 34px;
  border-radius: 34px;
  background: linear-gradient(135deg, rgba(239, 248, 236, 0.94), rgba(255, 255, 255, 0.98));
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.08);
}
.task-market-header h1 {
  max-width: 11ch;
  font-size: clamp(38px, 4.8vw, 56px);
  line-height: 0.95;
  letter-spacing: -0.04em;
}
.task-market-layout {
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}
.task-market-layout > aside,
.task-market-layout > main {
  min-width: 0;
}
.task-market-page .workspace-shell-card,
.task-market-page .job-card,
.task-market-page .mini-card,
.task-market-page .panel {
  border-radius: 28px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.05);
}
.task-market-page .job-card {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fff;
}
.task-market-page .job-card__summary {
  max-width: 64ch;
}
.task-market-page .button-secondary {
  min-height: 42px;
}
@media (max-width: 1080px) {
  .task-market-layout {
    grid-template-columns: 1fr;
  }
}
</style>
