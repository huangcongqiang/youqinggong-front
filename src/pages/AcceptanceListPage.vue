<template>
  <section class="acceptance-list-page stack-xl">
    <ContractShellHeader
      v-if="hasShellContext"
      eyebrow="验收"
      :title="shellTitle"
      :lead="shellLead"
      :support-copy="shellSupportCopy"
      :pills="shellPills"
      :tabs="shellTabs"
    />

    <header v-else class="acceptance-list-hero panel stack-lg">
      <div class="acceptance-list-hero__content">
        <div>
          <p class="eyebrow">验收工作台</p>
          <h1>{{ shellTitle }}</h1>
          <p class="muted">{{ shellLead }}</p>
        </div>
        <router-link class="button-secondary" :to="dashboardRoute">返回工作台</router-link>
      </div>
    </header>

    <section class="acceptance-list-stats">
      <article class="acceptance-stat-card">
        <span>全部验收</span>
        <strong>{{ totalCount }}</strong>
      </article>
      <article class="acceptance-stat-card">
        <span>进行中</span>
        <strong>{{ ongoingCount }}</strong>
      </article>
      <article class="acceptance-stat-card">
        <span>已完成</span>
        <strong>{{ completedCount }}</strong>
      </article>
    </section>

    <article v-if="errorMessage" class="result-card stack-sm acceptance-list-error">
      <span class="eyebrow">暂时无法加载</span>
      <h3>验收列表暂时不可用</h3>
      <p class="muted">{{ errorMessage }}</p>
    </article>

    <section class="acceptance-list-layout">
      <main class="panel acceptance-list-main stack-lg">
        <div class="section-header">
          <div>
            <p class="eyebrow">验收列表</p>
            <h2>先筛选，再进入某一条验收详情</h2>
          </div>
          <span class="soft-pill">{{ visibleRows.length }} 条结果</span>
        </div>

        <div class="acceptance-list-toolbar">
          <div class="acceptance-filter-row" role="tablist" aria-label="验收状态筛选">
            <button
              v-for="filter in filters"
              :key="filter.key"
              class="acceptance-filter-pill"
              :class="{ 'is-active': activeFilter === filter.key }"
              type="button"
              @click="setFilter(filter.key)"
            >
              {{ filter.label }}
              <span>{{ filter.count }}</span>
            </button>
          </div>
          <input
            v-model.trim="searchText"
            class="acceptance-search"
            type="search"
            placeholder="搜索合同、合作方、状态或标签"
          />
        </div>

        <div v-if="visibleRows.length" class="acceptance-card-list">
          <article v-for="row in visibleRows" :key="row.key" class="acceptance-row-card stack-md">
            <div class="acceptance-row-card__topline">
              <div>
                <p class="eyebrow">{{ row.bucketLabel }}</p>
                <h3>{{ row.title }}</h3>
                <p class="muted">{{ row.summary }}</p>
              </div>
              <span class="acceptance-status-chip" :class="`is-${row.bucket}`">{{ row.statusLabel }}</span>
            </div>

            <div class="acceptance-meta-grid">
              <span>{{ partnerLabel }}：{{ row.partner }}</span>
              <span>合同：{{ row.taskId || '待同步' }}</span>
              <span>{{ row.amount }}</span>
              <span>更新于 {{ row.updatedAt }}</span>
            </div>

            <div v-if="row.tags.length" class="acceptance-tag-row">
              <span v-for="tag in row.tags" :key="`${row.key}-${tag}`">{{ tag }}</span>
            </div>

            <div class="toolbar toolbar--wrap">
              <router-link class="button-primary" :to="detailRoute(row)">查看验收详情</router-link>
              <router-link v-if="row.recordId" class="button-secondary" :to="recordRoute(row)">查看记录</router-link>
              <router-link v-if="row.taskId" class="button-tertiary" :to="workspaceRoute(row)">打开工作区</router-link>
            </div>
          </article>
        </div>

        <div v-else class="empty-state is-compact acceptance-empty-state">
          <strong>当前没有符合条件的验收</strong>
          <p>{{ emptyHint }}</p>
        </div>
      </main>

      <aside class="panel acceptance-list-side stack-md">
        <div class="section-header">
          <div>
            <p class="eyebrow">当前筛选</p>
            <h2>{{ activeFilterLabel }}</h2>
          </div>
        </div>

        <article class="mini-card stack-sm">
          <span class="eyebrow">处理方式</span>
          <strong>列表进入详情</strong>
          <p class="muted">点击“验收”只看列表；需要确认、评级或反馈时，再打开具体合同的验收详情。</p>
        </article>

        <article class="mini-card stack-sm">
          <span class="eyebrow">最近一条</span>
          <strong>{{ visibleRows[0]?.title || '暂无验收记录' }}</strong>
          <p class="muted">{{ visibleRows[0]?.updatedAt ? `更新于 ${visibleRows[0].updatedAt}` : '后续验收会显示在这里。' }}</p>
        </article>
      </aside>
    </section>

    <ActionErrorDialog :message="errorMessage" title="验收列表暂时不可用" eyebrow="验收" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import ContractShellHeader from '../components/ContractShellHeader.vue'
import { getOrderRecords } from '../services/api'
import { formatDateLabel, formatDateRangeLabel, formatGrade, formatMoney } from '../services/recordFormatters.js'
import { roleRouteMap } from '../utils/roleRoutes'

const route = useRoute()
const router = useRouter()
const page = ref(null)
const errorMessage = ref('')
const searchText = ref('')
const audience = computed(() => (route.meta?.audience === 'talent' ? 'talent' : 'enterprise'))

const activeFilter = computed(() => {
  const value = textQuery('tab') || textQuery('status') || 'all'
  return ['all', 'ongoing', 'completed'].includes(value) ? value : 'all'
})

const currentTaskId = computed(() => textQuery('taskId') || textQuery('originTaskId'))
const currentRecordId = computed(() => textQuery('recordId') || textQuery('originRecordId'))
const currentRoomKey = computed(() => textQuery('roomKey') || textQuery('room') || textQuery('originRoom'))
const currentMilestoneLabel = computed(() => textQuery('contextMilestone'))
const hasShellContext = computed(() => Boolean(currentTaskId.value))
const dashboardRoute = computed(() => `/${audience.value}`)
const partnerLabel = computed(() => (audience.value === 'talent' ? '企业方' : '人才方'))
const shellTitle = computed(() => page.value?.summary?.title || '验收列表')
const shellLead = computed(() => '先在列表里筛选进行中或已完成的验收，再打开具体合同处理确认、评级和反馈。')
const shellSupportCopy = computed(() => '验收入口只负责列表，详情页从列表中进入，避免不同合同混在同一个页面里。')
const activeFilterLabel = computed(() => filters.value.find((item) => item.key === activeFilter.value)?.label || '全部')
const emptyHint = computed(() => (
  searchText.value
    ? '换一个合同名称、合作方、状态或标签关键词试试。'
    : activeFilter.value === 'completed'
      ? '完成验收、评级和反馈后，已完成项会沉淀在这里。'
      : '进入执行或待验收阶段的合同会显示在这里。'
))

const totalCount = computed(() => Number(page.value?.summary?.total) || rows.value.length)
const ongoingCount = computed(() => Number(page.value?.summary?.ongoing) || rows.value.filter((row) => row.bucket === 'ongoing').length)
const completedCount = computed(() => Number(page.value?.summary?.completed) || rows.value.filter((row) => row.bucket === 'completed').length)

const filters = computed(() => [
  { key: 'all', label: '全部', count: totalCount.value },
  { key: 'ongoing', label: '进行中', count: ongoingCount.value },
  { key: 'completed', label: '已完成', count: completedCount.value },
])

const shellPills = computed(() => ([
  currentTaskId.value ? `当前合同 ${currentTaskId.value}` : '',
  activeFilterLabel.value,
  currentMilestoneLabel.value,
]).filter(Boolean))

const workspaceShellRoute = computed(() => buildShellRoute(`/${audience.value}/workspace`, {
  source: 'contract',
  surface: 'contract',
}))
const messagesShellRoute = computed(() => buildShellRoute(`/${audience.value}/chat`, {
  source: 'messages',
  surface: 'messages',
}))
const recordsShellRoute = computed(() => buildShellRoute(`/${audience.value}/records`, {
  source: 'acceptance',
  surface: 'records',
}))
const assistantShellRoute = computed(() => buildShellRoute(`/${audience.value}/assistant`, {
  source: 'acceptance',
  surface: 'acceptance',
}))
const shellTabs = computed(() => {
  if (!hasShellContext.value) return []
  return [
    { label: '概览', to: workspaceShellRoute.value },
    currentRoomKey.value ? { label: '消息', to: messagesShellRoute.value } : null,
    { label: '验收', current: true },
    { label: '记录', to: recordsShellRoute.value },
    { label: '助手', to: assistantShellRoute.value },
  ].filter(Boolean)
})

const rows = computed(() => {
  const items = Array.isArray(page.value?.items) ? page.value.items : []
  return items.map((item, index) => normalizeAcceptanceRow(item, index))
})

const visibleRows = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  return rows.value
    .filter((row) => activeFilter.value === 'all' || row.bucket === activeFilter.value)
    .filter((row) => !query || row.searchText.includes(query))
})

function textQuery(key) {
  const value = route.query[key]
  return String(Array.isArray(value) ? value[0] || '' : value || '').trim()
}

function textOf(...values) {
  return values
    .map((value) => (value && typeof value === 'object' ? '' : String(value || '').trim()))
    .find(Boolean) || ''
}

function compactQuery(input) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0
      return String(value || '').trim()
    })
  )
}

function buildShellRoute(path, overrides = {}) {
  return {
    path,
    query: compactQuery({
      ...route.query,
      taskId: currentTaskId.value,
      recordId: currentRecordId.value,
      room: currentRoomKey.value,
      roomKey: currentRoomKey.value,
      originSource: textQuery('originSource') || textQuery('source') || 'acceptance',
      originTaskId: textQuery('originTaskId') || currentTaskId.value,
      originRecordId: textQuery('originRecordId') || currentRecordId.value,
      ...overrides,
    }),
  }
}

function normalizeBucket(item = {}) {
  const raw = [
    item.acceptanceStatus,
    item.acceptanceStatusLabel,
    item.acceptance?.status,
    item.summary?.status,
    item.statusGroup,
    item.statusKey,
    item.status,
    item.statusLabel,
    item.stage,
    item.stageLabel,
    item.deliveryGrade,
    item.rating?.value,
  ].join(' ')
  const upper = raw.toUpperCase()
  if (/已完成|已验收|评分已归档|评级已归档|已结算|结算已完成|COMPLETED|ACCEPTED|SETTLED|ARCHIVED|CLOSED/.test(raw) || /COMPLETED|ACCEPTED|SETTLED|ARCHIVED|CLOSED/.test(upper)) {
    return 'completed'
  }
  return 'ongoing'
}

function normalizeStatusLabel(item = {}, bucket = 'ongoing') {
  const label = textOf(item.acceptanceStatusLabel, item.acceptance?.status, item.statusLabel, item.stageLabel, item.status)
  if (bucket === 'completed') return label && !/CONFIRMED|COMPLETED|ACCEPTED|SETTLED|ARCHIVED|CLOSED/i.test(label) ? label : '已完成'
  if (/待验收|待企业评级|待反馈|进行中|执行中/.test(label)) return label
  return '进行中'
}

function amountLabel(item = {}) {
  const explicit = textOf(item.amountValue, item.amountLabel, item.budgetLabel)
  if (explicit) return explicit
  const amount = Number(item.amount || item.budget || 0)
  return amount > 0 ? formatMoney(amount) : '金额待同步'
}

function normalizeAcceptanceRow(item = {}, index = 0) {
  const taskId = textOf(item.taskId, item.task?.id, item.id)
  const recordId = textOf(item.recordId, item.record?.recordId, item.record?.id, item.id, taskId)
  const roomKey = textOf(item.roomKey, item.room, item.taskRoom?.roomKey)
  const bucket = normalizeBucket(item)
  const title = textOf(item.title, item.taskTitle, item.task?.title, '未命名合同')
  const summary = textOf(
    item.acceptanceSummary,
    item.summary,
    item.detail,
    item.description,
    bucket === 'completed' ? '这条验收已经完成，可以查看验收、评级和反馈详情。' : '这条验收仍在推进中，可以进入详情继续处理。'
  )
  const tags = Array.isArray(item.tags) ? item.tags : (Array.isArray(item.taskTags) ? item.taskTags : [])
  const statusLabel = normalizeStatusLabel(item, bucket)
  return {
    key: textOf(recordId, taskId, `acceptance-${index}`),
    taskId,
    recordId,
    roomKey,
    title,
    summary,
    bucket,
    bucketLabel: bucket === 'completed' ? '已完成验收' : '进行中验收',
    statusLabel,
    amount: amountLabel(item),
    range: formatDateRangeLabel(item.startAt || item.startDate, item.endAt || item.endDate),
    updatedAt: formatDateLabel(item.updatedAt || item.updated_at || item.latestUpdatedAt || item.time),
    partner: textOf(item.counterpartName, item.partnerName, item.businessName, item.talentName, '对方处理中'),
    grade: textOf(item.rating?.value, formatGrade(item.myGrade || item.deliveryGrade)),
    tags,
    searchText: [
      title,
      summary,
      statusLabel,
      taskId,
      recordId,
      roomKey,
      textOf(item.counterpartName, item.partnerName, item.businessName, item.talentName),
      ...tags,
    ].join(' ').toLowerCase(),
  }
}

function acceptanceDetailPath(taskId = '') {
  const safeTaskId = encodeURIComponent(String(taskId || '').trim())
  return audience.value === 'talent'
    ? roleRouteMap.talent.acceptanceDetail(safeTaskId)
    : roleRouteMap.enterprise.acceptanceDetail(safeTaskId)
}

function detailRoute(row) {
  const taskId = textOf(row?.taskId, row?.key)
  return {
    path: acceptanceDetailPath(taskId),
    query: compactQuery({
      ...route.query,
      taskId,
      recordId: row?.recordId || currentRecordId.value,
      room: row?.roomKey || currentRoomKey.value,
      roomKey: row?.roomKey || currentRoomKey.value,
      tab: activeFilter.value === 'all' ? '' : activeFilter.value,
      source: 'acceptance',
      surface: 'acceptance',
      originSource: textQuery('originSource') || textQuery('source') || 'acceptance',
      originTaskId: textQuery('originTaskId') || currentTaskId.value || taskId,
      originRecordId: textQuery('originRecordId') || currentRecordId.value || row?.recordId,
    }),
  }
}

function recordRoute(row) {
  const recordId = textOf(row?.recordId, row?.taskId)
  return {
    path: audience.value === 'talent' ? roleRouteMap.talent.recordDetail(recordId) : roleRouteMap.enterprise.recordDetail(recordId),
    query: compactQuery({
      taskId: row?.taskId,
      recordId,
      room: row?.roomKey,
      roomKey: row?.roomKey,
      source: 'acceptance',
      originSource: 'acceptance',
      originTaskId: row?.taskId,
      originRecordId: recordId,
    }),
  }
}

function workspaceRoute(row) {
  return {
    path: audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace,
    query: compactQuery({
      taskId: row?.taskId,
      recordId: row?.recordId,
      room: row?.roomKey,
      roomKey: row?.roomKey,
      source: 'contract',
      surface: 'contract',
      originSource: 'acceptance',
      originTaskId: row?.taskId,
      originRecordId: row?.recordId,
    }),
  }
}

function setFilter(key) {
  const query = { ...route.query }
  delete query.status
  if (!key || key === 'all') {
    delete query.tab
  } else {
    query.tab = key
  }
  router.replace({ path: route.path, query })
}

async function loadAcceptanceRows() {
  const payload = await getOrderRecords(audience.value, activeFilter.value)
  page.value = payload
  errorMessage.value = payload?.requestError || ''
}

watch(activeFilter, loadAcceptanceRows)
onMounted(loadAcceptanceRows)
</script>

<style scoped>
.acceptance-list-page {
  --acceptance-bg: #f4f7f2;
  --acceptance-panel: rgba(255, 255, 255, 0.96);
  --acceptance-soft: #f8faf6;
  --acceptance-border: #dce5d5;
  --acceptance-border-strong: #bed0b3;
  --acceptance-text: #16311d;
  --acceptance-muted: #5d6f60;
  --acceptance-accent: #2f7a20;
  --acceptance-accent-soft: #edf7e8;
  display: grid;
  gap: 24px;
  padding-bottom: 42px;
  color: var(--acceptance-text);
}

.stack-xl,
.stack-lg,
.stack-md,
.stack-sm {
  display: grid;
}

.stack-xl { gap: 28px; }
.stack-lg { gap: 22px; }
.stack-md { gap: 16px; }
.stack-sm { gap: 10px; }

.panel,
.acceptance-stat-card,
.acceptance-row-card {
  border: 1px solid var(--acceptance-border);
  background: var(--acceptance-panel);
  box-shadow: 0 18px 40px rgba(22, 49, 29, 0.06);
}

.acceptance-list-hero {
  padding: 30px;
  border-radius: 32px;
  background:
    radial-gradient(circle at 88% 10%, rgba(210, 226, 194, 0.52), transparent 34%),
    linear-gradient(135deg, #fffef8, #f2f7ed);
}

.acceptance-list-hero__content,
.acceptance-row-card__topline,
.acceptance-list-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.acceptance-list-hero h1 {
  margin: 0;
  font-size: clamp(36px, 5vw, 72px);
  line-height: 0.94;
  letter-spacing: -0.06em;
}

.acceptance-list-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.acceptance-stat-card {
  min-height: 136px;
  padding: 24px;
  border-radius: 28px;
}

.acceptance-stat-card span {
  color: var(--acceptance-muted);
  font-weight: 700;
}

.acceptance-stat-card strong {
  display: block;
  margin-top: 18px;
  font-size: clamp(34px, 5vw, 56px);
  line-height: 1;
}

.acceptance-list-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 22px;
  align-items: start;
}

.acceptance-list-main,
.acceptance-list-side {
  padding: 26px;
  border-radius: 30px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.section-header h2,
.acceptance-row-card h3 {
  margin: 0;
}

.acceptance-list-toolbar {
  align-items: center;
  flex-wrap: wrap;
}

.acceptance-filter-row,
.acceptance-tag-row,
.acceptance-meta-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.acceptance-filter-pill,
.acceptance-search,
.acceptance-status-chip,
.acceptance-tag-row span,
.acceptance-meta-grid span {
  border: 1px solid var(--acceptance-border);
  background: var(--acceptance-soft);
  color: var(--acceptance-text);
}

.acceptance-filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  font-weight: 800;
  cursor: pointer;
}

.acceptance-filter-pill.is-active {
  background: var(--acceptance-accent);
  border-color: var(--acceptance-accent);
  color: #fff;
}

.acceptance-filter-pill span {
  opacity: 0.76;
}

.acceptance-search {
  min-width: min(100%, 320px);
  min-height: 44px;
  padding: 0 16px;
  border-radius: 18px;
  outline: none;
}

.acceptance-card-list {
  display: grid;
  gap: 16px;
}

.acceptance-row-card {
  padding: 22px;
  border-radius: 26px;
}

.acceptance-row-card p {
  margin: 0;
}

.acceptance-status-chip {
  flex: 0 0 auto;
  padding: 9px 14px;
  border-radius: 999px;
  font-weight: 800;
}

.acceptance-status-chip.is-completed {
  background: #eef7e9;
  border-color: #b8d5aa;
  color: #2f7a20;
}

.acceptance-status-chip.is-ongoing {
  background: #fff8df;
  border-color: #ead894;
  color: #6d5b05;
}

.acceptance-meta-grid span,
.acceptance-tag-row span {
  padding: 8px 12px;
  border-radius: 999px;
  color: var(--acceptance-muted);
  font-weight: 700;
}

.acceptance-list-side {
  position: sticky;
  top: 24px;
}

.acceptance-list-page .mini-card,
.acceptance-empty-state,
.acceptance-list-error {
  border: 1px solid var(--acceptance-border);
  background: var(--acceptance-soft);
}

.acceptance-list-page .mini-card {
  padding: 18px;
  border-radius: 22px;
}

.acceptance-empty-state {
  padding: 30px;
  border-radius: 24px;
}

.acceptance-list-page .muted {
  color: var(--acceptance-muted);
}

.acceptance-list-page :is(.button-primary, .button-secondary, .button-tertiary) {
  min-height: 42px;
  border-radius: 999px;
}

@media (max-width: 1080px) {
  .acceptance-list-layout {
    grid-template-columns: 1fr;
  }

  .acceptance-list-side {
    position: static;
  }
}

@media (max-width: 760px) {
  .acceptance-list-stats {
    grid-template-columns: 1fr;
  }

  .acceptance-list-hero__content,
  .acceptance-row-card__topline {
    display: grid;
  }

  .acceptance-list-main,
  .acceptance-list-side,
  .acceptance-list-hero {
    padding: 20px;
    border-radius: 24px;
  }

  .acceptance-search,
  .acceptance-filter-pill,
  .acceptance-list-page :is(.button-primary, .button-secondary, .button-tertiary) {
    width: 100%;
    justify-content: center;
  }
}
</style>
