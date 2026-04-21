<template>
    <section class="history-page stack-xl">
      <ContractShellHeader
        v-if="hasShellContext"
        eyebrow="记录"
        :title="recordShellTitle"
        :lead="recordShellLead"
        :support-copy="recordShellSupportCopy"
        :pills="recordShellPills"
        :tabs="recordShellTabs"
      />

      <header v-else class="history-hero panel stack-lg">
        <div class="history-hero__topline">
          <div>
            <p class="eyebrow">申请 / 面试 / 合作</p>
            <h1>{{ page?.summary?.title || defaultTitle }}</h1>
            <p class="muted">{{ page?.summary?.description || defaultLead }}</p>
          </div>
          <div class="hero-actions">
            <router-link class="button-secondary" :to="dashboardRoute">返回工作台</router-link>
          </div>
        </div>

      <div class="signal-grid">
        <article class="signal-card">
          <span>全部记录</span>
          <strong>{{ page?.summary?.total || records.length }}</strong>
        </article>
        <article class="signal-card">
          <span>进行中</span>
          <strong>{{ page?.summary?.ongoing || 0 }}</strong>
        </article>
        <article class="signal-card">
          <span>已完成</span>
          <strong>{{ page?.summary?.completed || 0 }}</strong>
        </article>
      </div>
    </header>

    <div v-if="hasShellContext" class="signal-grid">
      <article class="signal-card">
        <span>全部记录</span>
        <strong>{{ page?.summary?.total || records.length }}</strong>
      </article>
      <article class="signal-card">
        <span>进行中</span>
        <strong>{{ page?.summary?.ongoing || 0 }}</strong>
      </article>
      <article class="signal-card">
        <span>已完成</span>
        <strong>{{ page?.summary?.completed || 0 }}</strong>
      </article>
    </div>

    <article v-if="errorMessage" class="result-card stack-sm history-error-banner">
      <span class="eyebrow">暂时无法加载</span>
      <h3>申请与合作记录暂时不可用</h3>
      <p class="muted">{{ errorMessage }}</p>
    </article>

    <section class="history-layout">
      <section class="panel stack-md history-main">
        <div class="section-header">
          <div>
            <p class="eyebrow">记录与筛选</p>
            <h2>按申请、面试和合作状态浏览记录</h2>
          </div>
          <span class="soft-pill">{{ filteredRecords.length }} 条结果</span>
        </div>

        <div class="toolbar toolbar--wrap">
          <div class="mini-chip-row">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="filter-pill"
              :class="{ 'is-active': activeTab === tab.key }"
              @click="setTab(tab.key)"
            >
              {{ tab.label }}
              <span v-if="typeof tab.count === 'number'">{{ tab.count }}</span>
            </button>
          </div>
          <input v-model.trim="searchText" class="text-input history-search" type="search" :placeholder="searchPlaceholder" />
        </div>

        <div v-if="filteredRecords.length" class="history-list">
          <article v-for="record in filteredRecords" :key="record.id" class="history-card stack-sm">
            <div class="history-card__topline">
              <div>
                <strong>{{ record.title }}</strong>
                <p>{{ record.summary }}</p>
              </div>
              <span class="status-chip">{{ record.status }}</span>
            </div>

            <div class="mini-chip-row">
              <span class="mini-chip">{{ partnerLabel }}：{{ record.partner }}</span>
              <span class="mini-chip">{{ record.amount }}</span>
              <span class="mini-chip">{{ record.range }}</span>
              <span class="mini-chip">更新于 {{ record.updatedAt }}</span>
              <span class="mini-chip">{{ gradeLabel }}：{{ record.rating }}</span>
            </div>

            <div v-if="record.tags.length" class="mini-chip-row">
              <span v-for="tag in record.tags" :key="`${record.id}-${tag}`" class="mini-chip">{{ tag }}</span>
            </div>

            <div class="toolbar toolbar--wrap">
              <router-link class="button-primary" :to="detailRoute(record)">打开记录</router-link>
              <router-link v-if="record.taskId" class="button-secondary" :to="workspaceRoute(record.taskId)">打开工作区</router-link>
              <router-link v-if="record.taskId && record.roomKey" class="button-tertiary" :to="chatRoute(record)">查看消息</router-link>
            </div>
          </article>
        </div>
        <div v-else class="empty-state is-compact">
          <strong>当前没有符合筛选条件的记录</strong>
          <p>{{ emptyHint }}</p>
        </div>
      </section>

      <aside class="panel stack-md history-side">
        <div class="section-header">
          <div>
            <p class="eyebrow">记录摘要</p>
            <h2>申请与合作记录</h2>
          </div>
        </div>

        <article class="mini-card stack-sm">
          <span class="eyebrow">当前筛选</span>
          <strong>{{ tabs.find((tab) => tab.key === activeTab)?.label || '全部' }}</strong>
          <p class="muted">{{ page?.summary?.description || defaultLead }}</p>
        </article>

        <article class="mini-card stack-sm">
          <span class="eyebrow">一眼概览</span>
          <div class="mini-chip-row">
            <span class="mini-chip">全部 {{ page?.summary?.total || records.length }}</span>
            <span class="mini-chip">进行中 {{ page?.summary?.ongoing || 0 }}</span>
            <span class="mini-chip">已完成 {{ page?.summary?.completed || 0 }}</span>
          </div>
        </article>

        <article class="mini-card stack-sm">
          <span class="eyebrow">最近更新记录</span>
          <strong>{{ filteredRecords[0]?.updatedAt || '刚刚更新' }}</strong>
          <p class="muted">{{ filteredRecords[0]?.title || '最新记录会显示在这里。' }}</p>
        </article>

          <router-link class="button-link" :to="dashboardRoute">返回工作台</router-link>
      </aside>
    </section>

    <ActionErrorDialog :message="errorMessage" title="申请与合作记录暂时不可用" eyebrow="记录归档" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import ContractShellHeader from '../components/ContractShellHeader.vue'
import { formatDateLabel, formatDateRangeLabel, formatGrade, formatMoney } from '../services/recordFormatters.js'
import { getOrderRecords } from '../services/api'

const route = useRoute()
const router = useRouter()
const audience = computed(() => (route.meta?.audience === 'talent' ? 'talent' : 'enterprise'))
const page = ref(null)
const errorMessage = ref('')
const searchText = ref('')

const activeTab = computed(() => {
  const value = String(route.query.tab || 'all')
  return ['all', 'ongoing', 'completed'].includes(value) ? value : 'all'
})

const defaultTitle = computed(() => (audience.value === 'talent' ? '申请、面试与收入记录' : '申请、面试与合作记录归档'))
const defaultLead = computed(() => (audience.value === 'talent'
  ? '把申请、面试、合作、交付与收入整理成一条可浏览的记录线。'
  : '把任务、申请、面试、合作、反馈和结算结果整理成一条可浏览的记录线。'))
const partnerLabel = computed(() => (audience.value === 'talent' ? '企业方' : '人才方'))
const gradeLabel = computed(() => (audience.value === 'talent' ? '企业评分' : '我的评分'))
const searchPlaceholder = computed(() => (audience.value === 'talent' ? '搜索申请、面试、企业、标签或摘要' : '搜索申请、面试、合作、标签或摘要'))
const emptyHint = computed(() => (searchText.value ? '换一个合作名称、对象或标签关键词试试。' : '随着合作推进、验收完成和结算继续，记录会持续沉淀在这里。'))
const dashboardRoute = computed(() => `/${audience.value}`)
const currentTaskId = computed(() => textQuery('taskId') || textQuery('originTaskId'))
const currentRecordId = computed(() => textQuery('recordId') || textQuery('originRecordId'))
const currentRoomKey = computed(() => textQuery('roomKey') || textQuery('room'))
const currentMilestoneLabel = computed(() => textQuery('contextMilestone'))
const hasShellContext = computed(() => Boolean(currentTaskId.value))
const recordShellTitle = computed(() => page.value?.summary?.title || defaultTitle.value)
const recordShellLead = computed(() => page.value?.summary?.description || defaultLead.value)
const recordShellSupportCopy = computed(() => '当前记录继续挂在同一份合同下，概览、消息、验收和助手都可以从这里切回去。')
const recordShellPills = computed(() => ([
  currentTaskId.value ? `合同 ${currentTaskId.value}` : '',
  tabs.value.find((tab) => tab.key === activeTab.value)?.label || '全部记录',
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
const acceptanceShellRoute = computed(() => buildShellRoute(`/${audience.value}/acceptance`, {
  source: 'records',
  surface: 'review',
}))
const assistantShellRoute = computed(() => buildShellRoute(`/${audience.value}/assistant`, {
  source: 'history',
  surface: 'history',
}))
const recordShellTabs = computed(() => {
  if (!hasShellContext.value) return []
  return [
    { label: '概览', to: workspaceShellRoute.value },
    currentRoomKey.value ? { label: '消息', to: messagesShellRoute.value } : null,
    { label: '验收', to: acceptanceShellRoute.value },
    { label: '记录', current: true },
    { label: '助手', to: assistantShellRoute.value },
  ].filter(Boolean)
})

function textQuery(key) {
  const value = route.query[key]
  return String(Array.isArray(value) ? value[0] || '' : value || '').trim()
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
      originSource: textQuery('originSource') || textQuery('source') || 'records',
      originTaskId: textQuery('originTaskId') || currentTaskId.value,
      originRecordId: textQuery('originRecordId') || currentRecordId.value,
      ...overrides,
    }),
  }
}

function resolveLifecycleStageLabel(item) {
  const explicitLabel = [item?.stage, item?.stageLabel, item?.statusLabel]
    .map((value) => String(value || '').trim())
    .find(Boolean)
  if (explicitLabel) {
    return explicitLabel === '待同步' ? '待处理' : explicitLabel
  }
  const statusKey = String(item?.statusKey || item?.statusGroup || item?.status || '').trim().toUpperCase()
  if (!statusKey) return '待处理'
  if (['APPLIED', 'PENDING', 'REVIEWING'].includes(statusKey)) return '申请阶段'
  if (statusKey === 'INTERVIEW_PENDING') return '待确认面试'
  if (statusKey === 'INTERVIEW_ACCEPTED') return '面试阶段'
  if (['INTERVIEW_REJECTED', 'AUTO_CLOSED', 'CLOSED'].includes(statusKey)) return '已关闭'
  if (['CONFIRMED', 'AUTO_CONFIRMED'].includes(statusKey)) return '执行中'
  return item?.statusLabel || item?.stageLabel || item?.status || '待处理'
}

const tabs = computed(() => {
  const items = Array.isArray(page.value?.tabs) ? page.value.tabs : []
  if (items.length) return items.map((item) => ({ key: item.key || 'all', label: item.label || '全部', count: item.count }))
  return [
    { key: 'all', label: '全部', count: records.value.length },
    { key: 'ongoing', label: '进行中' },
    { key: 'completed', label: '已完成' },
  ]
})

const records = computed(() => {
  const items = Array.isArray(page.value?.items) ? page.value.items : []
  return items.map((item, index) => ({
    id: String(item?.taskId || item?.id || `record-${index}`),
    taskId: String(item?.taskId || item?.id || ''),
    roomKey: String(item?.roomKey || item?.room || ''),
    title: item?.title || '未命名合作',
    summary: item?.summary || item?.detail || '暂时还没有合作摘要。',
    status: resolveLifecycleStageLabel(item),
    amount: item?.amountValue || formatMoney(item?.amount),
    range: formatDateRangeLabel(item?.startAt || item?.startDate, item?.endAt || item?.endDate),
    updatedAt: formatDateLabel(item?.updatedAt || item?.updated_at || item?.latestUpdatedAt || item?.time),
    partner: item?.counterpartName || item?.partnerName || '对方处理中',
    rating: item?.rating?.value || formatGrade(item?.myGrade),
    tags: Array.isArray(item?.tags) ? item.tags : (Array.isArray(item?.taskTags) ? item.taskTags : []),
    searchText: [
      item?.title,
      item?.summary,
      resolveLifecycleStageLabel(item),
      item?.counterpartName,
      item?.partnerName,
      ...(Array.isArray(item?.tags) ? item.tags : []),
      ...(Array.isArray(item?.taskTags) ? item.taskTags : []),
    ].join(' ').toLowerCase(),
  }))
})

const filteredRecords = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  if (!query) return records.value
  return records.value.filter((item) => item.searchText.includes(query))
})

function detailRoute(record) {
  const recordId = String(record?.id || record || '').trim()
  if (!hasShellContext.value) {
    const query = activeTab.value === 'all' ? {} : { tab: activeTab.value }
    return {
      path: `/${audience.value}/records/${encodeURIComponent(recordId)}`,
      query,
    }
  }

  return {
    path: `/${audience.value}/records/${encodeURIComponent(recordId)}`,
    query: compactQuery({
      ...route.query,
      tab: activeTab.value === 'all' ? '' : activeTab.value,
      taskId: record?.taskId || currentTaskId.value,
      recordId,
      room: record?.roomKey || currentRoomKey.value,
      roomKey: record?.roomKey || currentRoomKey.value,
      source: 'records',
      surface: 'records',
      originSource: textQuery('originSource') || textQuery('source') || 'records',
      originTaskId: textQuery('originTaskId') || record?.taskId || currentTaskId.value,
      originRecordId: textQuery('originRecordId') || recordId,
    }),
  }
}

function workspaceRoute(taskId) {
  const query = new URLSearchParams()
  query.set('taskId', String(taskId))
  query.set('source', 'contract')
  query.set('surface', 'contract')
  query.set('originSource', 'records')
  query.set('originTaskId', String(taskId))
  return `/${audience.value}/workspace?${query.toString()}`
}

function chatRoute(record) {
  const query = new URLSearchParams()
  if (record.taskId) query.set('taskId', record.taskId)
  if (record.roomKey) {
    query.set('room', record.roomKey)
    query.set('roomKey', record.roomKey)
  }
  query.set('source', 'messages')
  query.set('surface', 'messages')
  query.set('originSource', 'records')
  if (record.taskId) query.set('originTaskId', record.taskId)
  return `/${audience.value}/chat?${query.toString()}`
}

function setTab(tab) {
  const query = { ...route.query }
  if (!tab || tab === 'all') {
    delete query.tab
  } else {
    query.tab = tab
  }
  router.replace({ path: route.path, query })
}

async function loadRecords() {
  const payload = await getOrderRecords(audience.value, activeTab.value)
  page.value = payload
  if (payload?.requestError) {
    errorMessage.value = payload.requestError
  }
}

watch(activeTab, loadRecords)
onMounted(loadRecords)
</script>

<style scoped>
.history-page {
  display: grid;
  gap: 22px;
  padding-bottom: 40px;
}

.stack-xl { gap: 32px; display: grid; }
.stack-lg { gap: 24px; display: grid; }
.stack-md { gap: 18px; display: grid; }
.stack-sm { gap: 12px; display: grid; }

.panel {
  padding: 24px;
  border-radius: 28px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #fffef8;
  box-shadow: 0 16px 34px rgba(18, 18, 18, 0.05);
}

.history-hero {
  padding: 28px 30px;
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 244, 0.98));
  box-shadow: 0 14px 36px rgba(22, 49, 29, 0.07);
  border: 1px solid rgba(18, 18, 18, 0.08);
}

.history-hero__topline,
.hero-actions,
.section-header,
.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.toolbar--wrap {
  flex-wrap: wrap;
  align-items: center;
}

.history-hero__topline h1 {
  margin: 6px 0 10px;
  font-size: 2.2rem;
  line-height: 1.1;
  color: #111111;
  letter-spacing: -0.02em;
}

.eyebrow {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #108a00;
}

.muted {
  margin: 0;
  color: #66665f;
  line-height: 1.7;
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.signal-card,
.history-card {
  border-radius: 22px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #ffffff;
}

.history-main .history-card {
  border-radius: 24px;
}

.signal-card {
  padding: 18px 20px;
}

.signal-card span {
  display: block;
  margin-bottom: 8px;
  color: #6f6f68;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.signal-card strong {
  font-size: 1.6rem;
  color: #111111;
  line-height: 1;
}

.soft-pill,
.status-chip,
.mini-chip,
.button-primary,
.button-secondary,
.filter-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  text-decoration: none;
  font-size: 14px;
}

.soft-pill,
.mini-chip,
.button-secondary,
.filter-pill {
  border: 1px solid rgba(18, 18, 18, 0.12);
  background: #ffffff;
  color: #111111;
}

.status-chip,
.filter-pill.is-active {
  border: 1px solid rgba(16, 138, 0, 0.24);
  background: #f3fff0;
  color: #165a0f;
  font-weight: 600;
}

.filter-pill:hover:not(.is-active) {
  border-color: rgba(18, 18, 18, 0.24);
  background: #fdfdfc;
}

.button-primary {
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid #108a00;
  background: #108a00;
  color: #ffffff;
  font-weight: 600;
  border-radius: 12px;
}

.button-secondary {
  min-height: 44px;
  padding: 0 20px;
  font-weight: 600;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(18, 18, 18, 0.12);
  color: #1f1f1a;
}

.history-hero .button-secondary {
  border-color: transparent;
  background: transparent;
  min-height: auto;
  padding: 0;
  color: #108a00;
}

.history-hero .button-secondary:hover {
  text-decoration: underline;
}

.button-tertiary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 12px;
  border: 0;
  background: transparent;
  color: #108a00;
  font-weight: 600;
  text-decoration: none;
}

.button-tertiary:hover {
  text-decoration: underline;
}

.history-search,
.text-input {
  width: min(320px, 100%);
  border: 1px solid rgba(18, 18, 18, 0.12);
  border-radius: 14px;
  padding: 12px 14px;
  background: #ffffff;
  color: #111111;
  font: inherit;
  min-height: 44px;
}

.history-search::placeholder {
  color: #8c9b8e;
}

.history-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}

.history-main,
.history-side {
  min-width: 0;
}

.history-side {
  background: #fcfcf8;
  box-shadow: none;
  border: 1px solid rgba(18, 18, 18, 0.08);
  position: sticky;
  top: 24px;
}

.history-side .mini-card {
  border-radius: 22px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #ffffff;
  padding: 16px 20px;
}

.history-error-banner {
  border-left: 4px solid #cd8f00;
  background: linear-gradient(180deg, rgba(255, 250, 231, 0.98), rgba(255, 255, 255, 0.98));
  padding: 20px;
  border-radius: 20px;
  border-top: 1px solid rgba(18, 18, 18, 0.06);
  border-right: 1px solid rgba(18, 18, 18, 0.06);
  border-bottom: 1px solid rgba(18, 18, 18, 0.06);
}

.history-error-banner h3 {
  margin: 0;
}

.history-list {
  display: grid;
  gap: 14px;
}

.history-card {
  padding: 24px;
}

.history-card__topline {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.history-card strong {
  color: #111111;
  font-size: 18px;
  line-height: 1.3;
  display: block;
  margin-bottom: 6px;
}

.history-card p {
  margin: 0;
  color: #66665f;
  line-height: 1.65;
}

.mini-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.empty-state.is-compact {
  padding: 32px 24px;
  border-radius: 24px;
  border: 1px dashed rgba(18, 18, 18, 0.16);
  background: #f4f7ef;
  text-align: center;
  color: #5d6858;
}

.empty-state.is-compact strong {
  display: block;
  margin-bottom: 8px;
  color: #111111;
  font-size: 16px;
}

.button-link {
  color: #108a00;
  font-weight: 600;
  text-decoration: none;
  text-align: left;
}

.button-link:hover {
  text-decoration: underline;
}

.section-header h2 {
  margin: 8px 0 0;
  font-size: 20px;
}

@media (max-width: 1200px) {
  .signal-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 1040px) {
  .history-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .panel {
    padding: 20px;
  }
  .history-hero__topline,
  .hero-actions,
  .section-header,
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .history-hero__topline h1 {
    font-size: 1.9rem;
  }
}
</style>
