<template>
    <section class="record-detail-page stack-xl">
    <ContractShellHeader
      eyebrow="申请 / 面试 / 合作"
      :title="record?.title || '申请与合作记录'"
      :lead="recordShellLead"
      :support-copy="recordShellSupportCopy"
      :pills="recordShellPills"
      :tabs="recordShellTaskId ? recordShellTabs : []"
    />

    <div v-if="!recordShellTaskId" class="hero-actions">
      <router-link class="button-secondary" :to="backRoute">返回记录页</router-link>
    </div>

    <article v-if="errorMessage" class="result-card stack-sm detail-error-banner">
      <span class="eyebrow">暂时无法加载</span>
      <h3>申请与合作记录暂时不可用</h3>
      <p class="muted">{{ errorMessage }}</p>
    </article>

    <section class="record-detail-shell">
      <main class="stack-md">
        <article class="panel stack-md">
          <div class="section-header">
            <div>
              <p class="eyebrow">记录概览</p>
              <h2>先看这条记录的关键信息</h2>
            </div>
          </div>

          <div class="mini-chip-row">
            <span class="mini-chip">时间线 {{ viewModel.dateRangeLabel }}</span>
            <span class="mini-chip">{{ gradeLabel }} {{ viewModel.ratingValue }}</span>
            <span v-for="tag in viewModel.summaryTags" :key="tag" class="mini-chip">{{ tag }}</span>
          </div>

          <div v-if="viewModel.keyResults.length" class="fact-list">
            <article v-for="item in viewModel.keyResults" :key="`${item.label}-${item.text}`" class="fact-card">
              <span class="eyebrow">{{ item.label }}</span>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </article>

        <article class="panel stack-md">
          <div class="section-header">
            <div>
              <p class="eyebrow">记录时间线</p>
              <h2>申请、面试与合作时间线</h2>
            </div>
          </div>

          <div v-if="activityStream.length" class="activity-stream">
            <article v-for="item in activityStream" :key="item.key" class="activity-card stack-sm">
              <div class="activity-card__topline">
                <div>
                  <span class="eyebrow">{{ item.eyebrow }}</span>
                  <strong>{{ item.title }}</strong>
                </div>
                <div class="activity-card__meta">
                  <span class="soft-pill">{{ item.status }}</span>
                  <small>{{ item.time }}</small>
                </div>
              </div>
              <p>{{ item.summary }}</p>
              <p v-if="item.detail" class="muted">{{ item.detail }}</p>
              <p v-if="item.aiReviewSummary" class="muted">助手摘要： {{ item.aiReviewSummary }}</p>
              <div v-if="item.attachments.length" class="asset-list">
                <button
                  v-for="asset in item.attachments"
                  :key="`${item.key}-${asset.name}`"
                  type="button"
                  class="asset-item"
                  @click.stop.prevent="openRecordAttachment(asset, $event)"
                >
                  <strong>{{ asset.name }}</strong>
                  <span>{{ asset.type || '附件' }}</span>
                </button>
              </div>
            </article>
          </div>
          <div v-else class="empty-state is-compact">
            <strong>暂时还没有记录条目</strong>
            <p>验收记录、工作更新和里程碑会继续沉淀在这里。</p>
          </div>
        </article>
      </main>

      <aside class="stack-md">
        <article class="panel stack-md">
            <div class="section-header section-header--compact">
            <div>
              <p class="eyebrow">财务跟进</p>
              <h2>下一步财务动作</h2>
            </div>
          </div>

          <template v-if="viewModel.financeSections.length">
            <article class="mini-card stack-sm">
              <span class="eyebrow">当前财务步骤</span>
              <strong>继续处理财务跟进</strong>
              <p class="muted">记录会把财务跟进收在这里；需要继续处理请款、发票、对账或争议时，再打开财务跟进。</p>
              <div v-if="firstFinanceActionCode" class="toolbar">
                <router-link class="button-link" :to="buildFinanceActionRoute(firstFinanceActionCode)">
                  打开财务跟进
                </router-link>
              </div>
            </article>
            <article v-for="section in viewModel.financeSections" :key="section.key" class="context-card stack-sm">
              <div class="context-card__topline">
                <div>
                  <span class="eyebrow">{{ section.badge }}</span>
                  <strong>{{ section.title }}</strong>
                </div>
                <span class="status-chip">{{ section.status }}</span>
              </div>
              <p>{{ section.summary }}</p>
              <p v-if="section.note" class="muted">{{ section.note }}</p>
              <div v-if="section.meta.length" class="mini-chip-row">
                <span v-for="meta in section.meta" :key="`${section.key}-${meta}`" class="mini-chip">{{ meta }}</span>
              </div>
              <div v-if="section.actions.length" class="toolbar">
                <router-link
                  v-for="action in section.actions"
                  :key="`${section.key}-${action.code}`"
                  class="button-link"
                  :to="buildFinanceActionRoute(action.code)"
                >
                  {{ action.label }}
                </router-link>
              </div>
            </article>
          </template>
          <article v-else class="empty-state is-compact">
            <strong>还没有结算步骤</strong>
            <p>开始进入结算动作后，这里会继续补上后续步骤；当前仍以记录主线为主。</p>
          </article>
        </article>

        <article class="panel stack-md">
          <div class="section-header section-header--compact">
            <div>
              <p class="eyebrow">文件</p>
              <h2>已保存的合同文件</h2>
            </div>
          </div>

          <article class="context-card stack-sm">
            <span class="eyebrow">附件</span>
            <div v-if="viewModel.assetFiles.length" class="asset-list">
              <button
                v-for="asset in viewModel.assetFiles"
                :key="asset.name"
                type="button"
                class="asset-item"
                @click.stop.prevent="openRecordAttachment(asset, $event)"
              >
                <strong>{{ asset.name }}</strong>
                <span>{{ asset.type || '附件' }}</span>
              </button>
            </div>
            <p v-else class="muted">还没有保存的文件。</p>
          </article>
        </article>
      </aside>
    </section>

    <ChatAttachmentPreviewModal
      :open="Boolean(previewAttachment)"
      :attachment="previewAttachment"
      :attachment-meta-text="attachmentMetaText"
      :attachment-download-href="attachmentDownloadHref"
      @close="previewAttachment = null"
    />
    <ActionErrorDialog :message="errorMessage" title="申请与合作记录暂时不可用" eyebrow="记录" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import ChatAttachmentPreviewModal from '../components/chat/ChatAttachmentPreviewModal.vue'
import ContractShellHeader from '../components/ContractShellHeader.vue'
import { buildRecordDetailViewModel } from './recordDetailViewModel.js'
import { attachmentMetaText, inferAttachmentKind } from './messageDetailHelpers.js'
import { buildSettlementRoute } from './settlementHelpers.js'
import { getOrderRecordDetail } from '../services/api'

const route = useRoute()
const audience = computed(() => (route.meta?.audience === 'talent' ? 'talent' : 'enterprise'))
const recordId = computed(() => String(route.params.recordId || ''))
const page = ref(null)
const errorMessage = ref('')
const previewAttachment = ref(null)

const record = computed(() => page.value?.record || page.value || null)
const defaultLead = computed(() => (audience.value === 'talent'
  ? '在这里回看这份申请、面试、合作结果与结算跟进。'
  : '在这里回看这份申请、面试、合作结果、时间线和结算跟进。'))
const gradeLabel = computed(() => (audience.value === 'talent' ? '企业评分' : '我的评分'))
const recordShellStatusKey = computed(() => String(record.value?.statusKey || record.value?.statusGroup || record.value?.status || '').trim().toUpperCase())
const recordShellLifecycleLabel = computed(() => {
  const statusKey = recordShellStatusKey.value
  if (['APPLIED', 'PENDING', 'REVIEWING'].includes(statusKey)) return '申请阶段'
  if (statusKey === 'INTERVIEW_PENDING') return '待确认面试'
  if (statusKey === 'INTERVIEW_ACCEPTED') return '面试阶段'
  if (['INTERVIEW_REJECTED', 'AUTO_CLOSED', 'CLOSED'].includes(statusKey)) return '已关闭'
  if (['CONFIRMED', 'AUTO_CONFIRMED'].includes(statusKey)) return '执行中'
  return '记录已关联'
})
const recordShellLead = computed(() => {
  if (recordShellLifecycleLabel.value === '申请阶段') {
    return '先看申请摘要和任务进展，再决定是否约面试、继续沟通或确认合作。'
  }
  if (recordShellLifecycleLabel.value === '待确认面试') {
    return '这条记录已经发出面试邀约，先等人才确认，再继续推进后续动作。'
  }
  if (recordShellLifecycleLabel.value === '面试阶段') {
    return '这条记录已经进入面试阶段，后续可以继续沟通、判断是否通过面试并确认合作。'
  }
  if (recordShellLifecycleLabel.value === '执行中') {
    return '这条记录对应的合作已经进入执行中，消息、验收和财务跟进会继续挂在这里。'
  }
  return defaultLead.value
})
const viewModel = computed(() => buildRecordDetailViewModel(record.value, {
  availableActions: page.value?.availableActions,
  fallbackLead: defaultLead.value,
  audience: audience.value,
}))
const firstFinanceActionCode = computed(() => {
  const section = viewModel.value.financeSections.find((item) => Array.isArray(item.actions) && item.actions.length)
  return section?.actions?.[0]?.code || ''
})
const activityStream = computed(() => {
  const reviewItems = viewModel.value.confirmationHistory.map((item, index) => ({
    key: `review-${index}-${item?.title || item?.label || item}`,
    eyebrow: '验收',
    title: item?.title || item?.label || `验收记录 ${index + 1}`,
    summary: typeof item === 'string'
      ? item
      : (item?.note || item?.summary || item?.text || item?.content || '这条验收记录已经保存。'),
    detail: '',
    status: '已记录',
    time: item?.time || item?.updatedAt || item?.status || '刚刚更新',
    aiReviewSummary: '',
    attachments: [],
    stamp: resolveActivityStamp(item?.time || item?.updatedAt || item?.createdAt || item?.status)
  }))
  const timelineItems = viewModel.value.timelineItems.map((item, index) => ({
    key: `timeline-${index}-${item.title}-${item.time}`,
    eyebrow: '记录',
    title: item.title || `合同更新 ${index + 1}`,
    summary: item.note || '这条合同事件已经记录。',
    detail: '',
    status: item.status || '已记录',
    time: item.time || '刚刚更新',
    aiReviewSummary: '',
    attachments: [],
    stamp: resolveActivityStamp(item.time)
  }))
  const progressItems = viewModel.value.progressItems.map((item, index) => ({
    key: `progress-${item.key || index}`,
    eyebrow: '工作更新',
    title: item.progress || item.stage || item.status || '工作更新',
    summary: item.summary,
    detail: item.description,
    status: item.stage || item.status || '已保存',
    time: item.time || '刚刚更新',
    aiReviewSummary: item.aiReviewSummary,
    attachments: item.attachments || [],
    stamp: resolveActivityStamp(item.time)
  }))

  return [...progressItems, ...reviewItems, ...timelineItems]
    .sort((left, right) => {
      if (left.stamp == null && right.stamp == null) return 0
      if (left.stamp == null) return 1
      if (right.stamp == null) return -1
      return right.stamp - left.stamp
    })
})

function looksLikeUploadId(value) {
  return /^upload[-_]/i.test(String(value || '').trim())
}

function resolveAttachmentHref(value) {
  const raw = String(value || '').trim()
  if (!raw || raw === '#') return ''
  if (/^(https?:|blob:|data:)/i.test(raw)) return raw
  if (looksLikeUploadId(raw)) {
    return resolveAttachmentHref(`/api/uploads/${encodeURIComponent(raw)}/content`)
  }
  if (!raw.startsWith('/') && !/^(api|uploads|files)\//i.test(raw)) return ''
  if (typeof window === 'undefined') return raw.startsWith('/') ? raw : `/${raw}`
  try {
    return new URL(raw.startsWith('/') ? raw : `/${raw}`, window.location.origin).toString()
  } catch {
    return raw
  }
}

function rawAttachmentHref(source) {
  if (typeof source === 'string') return source
  const uploadId = String(source?.uploadId || '').trim()
  const id = String(source?.id || '').trim()
  return String(
    source?.downloadHref ||
    source?.downloadUrl ||
    source?.previewUrl ||
    source?.url ||
    source?.href ||
    source?.fileUrl ||
    source?.path ||
    (uploadId ? `/api/uploads/${encodeURIComponent(uploadId)}/content` : '') ||
    (looksLikeUploadId(id) ? `/api/uploads/${encodeURIComponent(id)}/content` : '')
  ).trim()
}

function normalizeAttachmentName(source, fallback = '附件') {
  if (typeof source === 'string') {
    const raw = source.trim()
    if (!raw) return fallback
    try {
      const url = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://app.cyxss.xyz')
      return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || fallback)
    } catch {
      return raw
    }
  }
  return String(
    source?.name ||
      source?.filename ||
      source?.fileName ||
      source?.label ||
      source?.title ||
      fallback
  ).trim()
}

function normalizeRecordAttachmentKind(type, name) {
  const text = `${type || ''} ${name || ''}`.toLowerCase()
  if (/image|图片|\.png|\.jpe?g|\.gif|\.webp|\.svg/.test(text)) return 'image'
  return inferAttachmentKind(type, name)
}

function normalizeRecordAttachment(source, fallbackKey = 'record-attachment') {
  const name = normalizeAttachmentName(source)
  const type = String(source?.type || source?.mimeType || source?.fileType || 'application/octet-stream').trim()
  const href = resolveAttachmentHref(rawAttachmentHref(source))
  const kind = normalizeRecordAttachmentKind(type, name)
  const previewUrl = resolveAttachmentHref(source?.previewUrl || (kind === 'image' ? href : ''))
  return {
    key: String(source?.id || source?.uploadId || `${fallbackKey}-${name}`),
    id: String(source?.id || source?.uploadId || ''),
    name,
    type,
    kind,
    size: Number(source?.size || source?.fileSize || 0),
    previewUrl,
    downloadUrl: href,
    href,
  }
}

function attachmentDownloadHref(attachment) {
  return resolveAttachmentHref(
    attachment?.href ||
    attachment?.downloadUrl ||
    attachment?.downloadHref ||
    attachment?.url ||
    attachment?.fileUrl ||
    attachment?.path ||
    attachment?.previewUrl ||
    rawAttachmentHref(attachment)
  )
}

function openRecordAttachment(asset, event = null) {
  event?.preventDefault?.()
  event?.stopPropagation?.()
  const normalized = normalizeRecordAttachment(asset, asset?.key || 'record-attachment')
  const href = attachmentDownloadHref(normalized)
  previewAttachment.value = {
    ...normalized,
    previewUrl: normalized.kind === 'image' ? (normalized.previewUrl || href) : '',
    downloadUrl: href,
    href,
  }
}

const recordShellTaskId = computed(() => String(viewModel.value.anchor.taskId || route.query.taskId || '').trim())
const recordShellRoomKey = computed(() => String(viewModel.value.anchor.roomKey || route.query.roomKey || route.query.room || '').trim())
const recordShellCounterpartName = computed(() => String(
  viewModel.value.partnerName || record.value?.counterpartName || record.value?.partnerName || route.query.counterpartName || ''
).trim())
const backRoute = computed(() => {
  const tab = String(route.query.tab || '')
  return `/${audience.value}/records${tab ? `?tab=${encodeURIComponent(tab)}` : ''}`
})
const workspaceRoute = computed(() => {
  const query = new URLSearchParams()
  if (recordShellTaskId.value) query.set('taskId', recordShellTaskId.value)
  if (recordId.value) query.set('recordId', recordId.value)
  if (recordShellRoomKey.value) {
    query.set('room', recordShellRoomKey.value)
    query.set('roomKey', recordShellRoomKey.value)
  }
  query.set('source', 'contract')
  query.set('surface', 'contract')
  query.set('originSource', 'record-detail')
  if (recordShellTaskId.value) query.set('originTaskId', recordShellTaskId.value)
  if (recordId.value) query.set('originRecordId', recordId.value)
  return `/${audience.value}/workspace${query.toString() ? `?${query.toString()}` : ''}`
})
const messagesRoute = computed(() => {
  const query = new URLSearchParams()
  if (recordShellTaskId.value) query.set('taskId', recordShellTaskId.value)
  if (recordId.value) query.set('recordId', recordId.value)
  if (recordShellCounterpartName.value) query.set('counterpartName', recordShellCounterpartName.value)
  if (recordShellRoomKey.value) {
    query.set('room', recordShellRoomKey.value)
    query.set('roomKey', recordShellRoomKey.value)
  }
  query.set('source', 'messages')
  query.set('surface', 'messages')
  query.set('originSource', 'record-detail')
  if (recordShellTaskId.value) query.set('originTaskId', recordShellTaskId.value)
  if (recordId.value) query.set('originRecordId', recordId.value)
  return `/${audience.value}/chat?${query.toString()}`
})
const acceptanceRoute = computed(() => {
  const query = new URLSearchParams()
  if (recordShellTaskId.value) query.set('taskId', recordShellTaskId.value)
  if (recordId.value) query.set('recordId', recordId.value)
  if (recordShellRoomKey.value) {
    query.set('room', recordShellRoomKey.value)
    query.set('roomKey', recordShellRoomKey.value)
  }
  query.set('source', 'record-detail')
  query.set('surface', 'review')
  query.set('originSource', 'record-detail')
  if (recordShellTaskId.value) query.set('originTaskId', recordShellTaskId.value)
  if (recordId.value) query.set('originRecordId', recordId.value)
  return `/${audience.value}/acceptance${query.toString() ? `?${query.toString()}` : ''}`
})
const assistantRoute = computed(() => {
  const query = new URLSearchParams()
  if (recordShellTaskId.value) query.set('taskId', recordShellTaskId.value)
  if (recordId.value) query.set('recordId', recordId.value)
  if (recordShellRoomKey.value) {
    query.set('room', recordShellRoomKey.value)
    query.set('roomKey', recordShellRoomKey.value)
  }
  if (record.value?.title) query.set('contextTitle', record.value.title)
  if (viewModel.value.stageLabel) query.set('contextStage', viewModel.value.stageLabel)
  query.set('source', 'history')
  query.set('surface', 'history')
  query.set('originSource', 'record-detail')
  if (recordShellTaskId.value) query.set('originTaskId', recordShellTaskId.value)
  if (recordId.value) query.set('originRecordId', recordId.value)
  return `/${audience.value}/assistant${query.toString() ? `?${query.toString()}` : ''}`
})
const recordShellSupportCopy = computed(() =>
  recordShellLifecycleLabel.value === '申请阶段'
    ? '这条记录当前还是申请阶段。先看申请摘要和任务进展，再决定是否约面试、继续沟通或确认合作。'
    : recordShellLifecycleLabel.value === '待确认面试'
      ? '这条记录已经发出面试邀约，先等人才确认，再继续推进面试结果和合作判断。'
      : recordShellLifecycleLabel.value === '面试阶段'
        ? '这条记录已经进入面试阶段，后续可以继续沟通、判断是否通过面试并确认合作。'
        : recordShellLifecycleLabel.value === '执行中'
          ? '这条记录对应的合作已经进入执行中，消息、验收和财务跟进会继续挂在这份记录上。'
          : '概览、消息、验收和助手会继续挂在这份记录上；页面会把结果、文件和财务跟进收在一起。'
)
const recordShellPills = computed(() => ([
  recordShellTaskId.value ? `任务 ${recordShellTaskId.value}` : '',
  recordShellLifecycleLabel.value,
  String(route.query.contextMilestone || '').trim(),
]).filter(Boolean))
const recordShellTabs = computed(() => {
  if (!recordShellTaskId.value) return []
  return [
    workspaceRoute.value ? { label: '概览', to: workspaceRoute.value } : null,
    recordShellRoomKey.value ? { label: '消息', to: messagesRoute.value } : null,
    recordShellRoomKey.value ? { label: '验收', to: acceptanceRoute.value } : null,
    { label: '记录', current: true },
    assistantRoute.value ? { label: '助手', to: assistantRoute.value } : null,
  ].filter(Boolean)
})

function buildFinanceActionRoute(actionCode = '') {
  const settlementRoute = buildSettlementRoute({
    audience: audience.value,
    recordId: recordId.value,
    taskId: recordShellTaskId.value,
    room: recordShellRoomKey.value,
    current: route.query,
    source: 'record-detail',
    financeAction: actionCode
  })

  return settlementRoute
}

function resolveActivityStamp(value) {
  const text = String(value || '').trim()
  if (!text) return null
  const stamp = Date.parse(text)
  return Number.isNaN(stamp) ? null : stamp
}

async function loadRecordDetail() {
  if (!recordId.value) {
    errorMessage.value = '当前缺少记录编号，暂时无法加载合作记录。'
    return
  }
  errorMessage.value = ''
  const payload = await getOrderRecordDetail(audience.value, recordId.value)
  page.value = payload
  if (payload?.requestError) {
    errorMessage.value = payload.requestError
  }
}

watch(recordId, loadRecordDetail)
onMounted(loadRecordDetail)
</script>

<style scoped>
.record-detail-page {
  display: grid;
  gap: 22px;
  padding-bottom: 40px;
}

.stack-xl { gap: 32px; display: grid; }
.stack-lg { gap: 24px; display: grid; }
.stack-md { gap: 18px; display: grid; }
.stack-sm { gap: 12px; display: grid; }

.record-detail-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
}

.record-detail-nav__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(18, 18, 18, 0.12);
  color: #66665f;
  text-decoration: none;
  font-weight: 600;
  background: #ffffff;
}

.record-detail-nav__link.is-active,
.record-detail-nav__link.router-link-active,
.record-detail-nav__link.router-link-exact-active {
  border-color: rgba(16, 138, 0, 0.2);
  background: #f3fff0;
  color: #165a0f;
}

.panel {
  padding: 24px;
  border-radius: 28px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #fffef8;
  box-shadow: 0 16px 34px rgba(18, 18, 18, 0.05);
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

.record-detail-hero {
  padding: 28px 30px;
  border-radius: 30px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 244, 0.98));
  box-shadow: 0 14px 36px rgba(22, 49, 29, 0.07);
  border: 1px solid rgba(18, 18, 18, 0.08);
}

.record-detail-hero__topline,
.hero-actions,
.section-header,
.section-header--compact,
.timeline-item,
.progress-card__topline,
.context-card__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.record-detail-hero__topline h1 {
  margin: 6px 0 10px;
  font-size: 2.2rem;
  line-height: 1.1;
  color: #111111;
  letter-spacing: -0.02em;
}

.signal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.signal-card,
.fact-card,
.progress-card,
.timeline-item,
.context-card,
.review-history-card,
.activity-card {
  border-radius: 22px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #ffffff;
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

.record-detail-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 24px;
  align-items: start;
}

.soft-pill,
.status-chip,
.mini-chip,
.button-primary,
.button-secondary {
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
.button-secondary {
  border: 1px solid rgba(18, 18, 18, 0.12);
  background: #ffffff;
  color: #111111;
}

.status-chip {
  border: 1px solid rgba(16, 138, 0, 0.24);
  background: #f3fff0;
  color: #165a0f;
  font-weight: 600;
}

.button-secondary {
  min-height: 44px;
  padding: 0 20px;
  font-weight: 600;
  border-radius: 12px;
}

.fact-list,
.timeline-list,
.progress-list,
.asset-list,
.review-history-list,
.activity-stream {
  display: grid;
  gap: 12px;
}

.fact-card,
.progress-card,
.timeline-item,
.context-card,
.review-history-card,
.activity-card {
  padding: 20px;
  border-radius: 20px;
}

.fact-card p,
.progress-card p,
.timeline-item p,
.context-card p {
  margin: 0;
  color: #66665f;
  line-height: 1.65;
}

.fact-card strong,
.progress-card strong,
.timeline-item strong,
.context-card strong {
  color: #111111;
}

.activity-card__topline,
.activity-card__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.activity-card__meta {
  flex-direction: column;
  align-items: flex-end;
}

.activity-card__meta small {
  color: #6f6f68;
  line-height: 1.5;
}

.asset-item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  border-radius: 18px;
  background: #ffffff;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-decoration: none;
}

.asset-item:hover {
  border-color: rgba(47, 125, 36, 0.32);
  box-shadow: 0 10px 26px rgba(39, 55, 27, 0.08);
}

.asset-item strong {
  color: #111111;
}

.asset-item span {
  color: #66665f;
}

.detail-error-banner {
  border-left: 4px solid #cd8f00;
  background: linear-gradient(180deg, rgba(255, 250, 231, 0.98), rgba(255, 255, 255, 0.98));
  padding: 20px;
  border-radius: 20px;
  border-top: 1px solid rgba(18, 18, 18, 0.06);
  border-right: 1px solid rgba(18, 18, 18, 0.06);
  border-bottom: 1px solid rgba(18, 18, 18, 0.06);
}

.empty-state.is-compact {
  padding: 24px;
  border-radius: 22px;
  border: 1px dashed rgba(18, 18, 18, 0.16);
  background: #f4f7ef;
  text-align: center;
  color: #5d6858;
}

.record-detail-page aside .panel {
  background: #fcfcf8;
  box-shadow: none;
  border: 1px solid rgba(18, 18, 18, 0.08);
  position: sticky;
  top: 24px;
}

@media (max-width: 1240px) {
  .record-detail-shell,
  .signal-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 960px) {
  .record-detail-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .panel {
    padding: 20px;
  }
  .record-detail-hero__topline,
  .hero-actions,
  .section-header,
  .section-header--compact,
  .timeline-item,
  .progress-card__topline,
  .context-card__topline,
  .activity-card__topline {
    flex-direction: column;
    align-items: stretch;
  }
  .activity-card__meta {
    align-items: flex-start;
  }
  .record-detail-hero__topline h1 {
    font-size: 1.9rem;
  }
}
</style>
