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
        <article class="record-archive-cover stack-lg">
          <div class="record-archive-cover__halo" aria-hidden="true"></div>
          <div class="record-archive-cover__topline">
            <div class="record-archive-cover__copy stack-sm">
              <p class="eyebrow">记录概览</p>
              <h2>把这次合作沉淀成一份清晰档案</h2>
              <p class="muted">{{ viewModel.overviewText || recordShellLead }}</p>
              <div class="mini-chip-row">
                <span class="mini-chip">时间线 {{ viewModel.dateRangeLabel }}</span>
                <span class="mini-chip">{{ gradeLabel }} {{ viewModel.ratingValue }}</span>
                <span v-for="tag in viewModel.summaryTags" :key="tag" class="mini-chip">{{ tag }}</span>
              </div>
            </div>
            <div class="record-archive-cover__stamp">
              <span>{{ recordShellLifecycleLabel }}</span>
              <strong>{{ viewModel.ratingValue }}</strong>
              <small>{{ viewModel.dateRangeLabel }}</small>
            </div>
          </div>

          <div v-if="viewModel.keyResults.length" class="fact-list record-fact-grid">
            <article
              v-for="(item, index) in viewModel.keyResults"
              :key="`${item.label}-${item.text}`"
              class="fact-card"
              :class="{ 'fact-card--feature': index === 0 }"
            >
              <span class="eyebrow">{{ item.label }}</span>
              <p>{{ item.text }}</p>
            </article>
          </div>
        </article>

        <article class="panel stack-md record-timeline-panel">
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

      <aside class="stack-md record-side-rail">
        <article class="panel stack-md finance-command-panel">
            <div class="section-header section-header--compact">
            <div>
              <p class="eyebrow">财务跟进</p>
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

        <article class="panel stack-md file-vault-panel">
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
  --record-ink: #1d2517;
  --record-muted: #687260;
  --record-soft: #f5f2e6;
  --record-paper: rgba(255, 254, 247, 0.96);
  --record-panel: rgba(255, 255, 251, 0.9);
  --record-line: rgba(49, 68, 35, 0.12);
  --record-green: #2f7d24;
  --record-green-deep: #1f5f18;
  --record-gold: #c39b3c;
  --record-shadow: 0 24px 70px rgba(40, 52, 28, 0.12);
  display: grid;
  gap: 24px;
  position: relative;
  isolation: isolate;
  padding-bottom: 48px;
}

.record-detail-page::before {
  content: "";
  position: absolute;
  z-index: -1;
  inset: 120px -48px auto;
  height: 520px;
  border-radius: 48px;
  background:
    radial-gradient(circle at 12% 18%, rgba(47, 125, 36, 0.16), transparent 32%),
    radial-gradient(circle at 88% 12%, rgba(195, 155, 60, 0.14), transparent 28%),
    linear-gradient(135deg, rgba(247, 244, 229, 0.86), rgba(255, 255, 250, 0.28));
  pointer-events: none;
}

.stack-xl { gap: 32px; display: grid; }
.stack-lg { gap: 24px; display: grid; }
.stack-md { gap: 18px; display: grid; }
.stack-sm { gap: 12px; display: grid; }

.panel {
  padding: 26px;
  border-radius: 30px;
  border: 1px solid var(--record-line);
  background: var(--record-panel);
  box-shadow: 0 18px 46px rgba(40, 52, 28, 0.08);
  backdrop-filter: blur(18px);
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--record-green);
}

.muted {
  margin: 0;
  color: var(--record-muted);
  line-height: 1.7;
}

.record-detail-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
  gap: 26px;
  align-items: start;
  width: min(calc(100vw - 56px), 1480px);
  margin-inline: calc((100% - min(calc(100vw - 56px), 1480px)) / 2);
}

.record-archive-cover {
  position: relative;
  overflow: hidden;
  padding: 30px;
  border: 1px solid rgba(47, 125, 36, 0.14);
  border-radius: 34px;
  background:
    linear-gradient(120deg, rgba(255, 254, 246, 0.98), rgba(247, 250, 238, 0.92)),
    repeating-linear-gradient(90deg, rgba(47, 125, 36, 0.06) 0 1px, transparent 1px 18px);
  box-shadow: var(--record-shadow);
}

.record-archive-cover::after {
  content: "";
  position: absolute;
  right: -80px;
  top: -120px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 42px solid rgba(47, 125, 36, 0.07);
  pointer-events: none;
}

.record-archive-cover__halo {
  position: absolute;
  inset: auto 24px 20px auto;
  width: 160px;
  height: 160px;
  border-radius: 42px;
  background:
    linear-gradient(135deg, rgba(47, 125, 36, 0.14), transparent 62%),
    linear-gradient(45deg, rgba(195, 155, 60, 0.12), transparent 60%);
  transform: rotate(10deg);
  opacity: 0.85;
}

.record-archive-cover__topline,
.hero-actions,
.section-header,
.section-header--compact,
.context-card__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.record-archive-cover__copy {
  position: relative;
  z-index: 1;
  max-width: 700px;
}

.record-archive-cover__copy h2 {
  margin: 0;
  max-width: 680px;
  color: var(--record-ink);
  font-size: clamp(2rem, 4vw, 4.7rem);
  line-height: 0.96;
  letter-spacing: -0.06em;
}

.record-archive-cover__stamp {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 8px;
  min-width: 170px;
  padding: 18px;
  border: 1px solid rgba(47, 125, 36, 0.18);
  border-radius: 26px;
  background: rgba(255, 255, 252, 0.78);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);
}

.record-archive-cover__stamp span,
.record-archive-cover__stamp small {
  color: var(--record-muted);
  font-weight: 700;
}

.record-archive-cover__stamp strong {
  color: var(--record-green-deep);
  font-size: 2.8rem;
  line-height: 1;
  letter-spacing: -0.08em;
}

.mini-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.soft-pill,
.status-chip,
.mini-chip,
.button-primary,
.button-secondary,
.button-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--record-line);
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
}

.soft-pill,
.mini-chip,
.button-secondary {
  background: rgba(255, 255, 252, 0.86);
  color: var(--record-ink);
}

.status-chip,
.button-link,
.button-primary {
  border-color: rgba(47, 125, 36, 0.24);
  background: linear-gradient(180deg, #f3fff0, #e7f2db);
  color: var(--record-green-deep);
}

.button-secondary {
  min-height: 44px;
  padding: 0 20px;
  border-radius: 16px;
}

.fact-list,
.asset-list,
.activity-stream {
  display: grid;
  gap: 14px;
}

.record-fact-grid {
  position: relative;
  z-index: 1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.fact-card,
.context-card,
.mini-card,
.activity-card {
  position: relative;
  border: 1px solid var(--record-line);
  border-radius: 24px;
  background: rgba(255, 255, 252, 0.88);
}

.fact-card,
.context-card,
.mini-card,
.activity-card {
  padding: 20px;
}

.fact-card--feature {
  grid-column: span 2;
  background:
    linear-gradient(135deg, rgba(47, 125, 36, 0.1), rgba(255, 255, 252, 0.9)),
    rgba(255, 255, 252, 0.92);
}

.fact-card p,
.context-card p,
.mini-card p,
.activity-card p {
  margin: 0;
  color: var(--record-muted);
  line-height: 1.68;
}

.fact-card p {
  color: var(--record-ink);
  font-size: 1.02rem;
}

.context-card strong,
.mini-card strong,
.activity-card strong {
  color: var(--record-ink);
}

.record-timeline-panel {
  overflow: hidden;
}

.record-timeline-panel .section-header h2,
.file-vault-panel h2 {
  margin: 4px 0 0;
  color: var(--record-ink);
  letter-spacing: -0.04em;
}

.activity-stream {
  position: relative;
  padding-left: 30px;
}

.activity-stream::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(47, 125, 36, 0.6), rgba(195, 155, 60, 0.18));
}

.activity-card {
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.96), rgba(250, 249, 240, 0.9));
  box-shadow: 0 14px 34px rgba(40, 52, 28, 0.06);
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.activity-card:hover {
  transform: translateY(-2px);
  border-color: rgba(47, 125, 36, 0.28);
  box-shadow: 0 18px 42px rgba(40, 52, 28, 0.1);
}

.activity-card::before {
  content: "";
  position: absolute;
  left: -31px;
  top: 24px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--record-green);
  box-shadow:
    0 0 0 5px rgba(47, 125, 36, 0.12),
    0 0 0 1px #ffffff;
}

.activity-card__topline,
.activity-card__meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.activity-card__meta {
  flex-direction: column;
  align-items: flex-end;
}

.activity-card__meta small {
  color: var(--record-muted);
  line-height: 1.5;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.record-side-rail {
  position: sticky;
  top: 24px;
  align-self: start;
}

.record-side-rail .panel {
  background:
    linear-gradient(180deg, rgba(255, 255, 252, 0.94), rgba(247, 247, 238, 0.9));
  box-shadow: none;
}

.finance-command-panel {
  border-color: rgba(47, 125, 36, 0.16);
}

.finance-command-panel .mini-card {
  background:
    linear-gradient(135deg, rgba(47, 125, 36, 0.12), rgba(255, 255, 252, 0.92)),
    rgba(255, 255, 252, 0.92);
}

.file-vault-panel {
  border-color: rgba(195, 155, 60, 0.18);
}

.asset-item {
  display: grid;
  gap: 8px;
  position: relative;
  width: 100%;
  padding: 16px 18px 16px 52px;
  border: 1px solid var(--record-line);
  border-radius: 20px;
  background: rgba(255, 255, 252, 0.88);
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-decoration: none;
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.asset-item::before {
  content: "";
  position: absolute;
  left: 18px;
  top: 18px;
  width: 18px;
  height: 22px;
  border: 2px solid rgba(47, 125, 36, 0.34);
  border-radius: 5px 8px 5px 5px;
  background: linear-gradient(180deg, rgba(47, 125, 36, 0.08), rgba(255, 255, 252, 0.85));
}

.asset-item:hover {
  transform: translateY(-1px);
  border-color: rgba(47, 125, 36, 0.3);
  box-shadow: 0 12px 28px rgba(39, 55, 27, 0.09);
}

.asset-item strong {
  color: var(--record-ink);
}

.asset-item span {
  color: var(--record-muted);
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
  border: 1px dashed rgba(49, 68, 35, 0.18);
  background: rgba(244, 247, 239, 0.76);
  text-align: center;
  color: #5d6858;
}

@media (max-width: 1240px) {
  .record-detail-shell {
    grid-template-columns: minmax(0, 1fr) minmax(300px, 340px);
  }

  .record-fact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .record-detail-shell {
    grid-template-columns: 1fr;
  }

  .record-side-rail {
    position: static;
  }
}

@media (max-width: 720px) {
  .record-detail-page::before {
    inset-inline: -20px;
  }

  .panel {
    padding: 20px;
  }

  .record-archive-cover {
    padding: 24px;
    border-radius: 28px;
  }

  .record-archive-cover__topline,
  .hero-actions,
  .section-header,
  .section-header--compact,
  .context-card__topline,
  .activity-card__topline {
    flex-direction: column;
    align-items: stretch;
  }

  .record-archive-cover__copy h2 {
    font-size: 2.35rem;
  }

  .record-archive-cover__stamp {
    min-width: 0;
  }

  .record-fact-grid,
  .fact-card--feature {
    grid-template-columns: 1fr;
    grid-column: auto;
  }

  .activity-card__meta {
    align-items: flex-start;
  }

  .activity-stream {
    padding-left: 22px;
  }
}
</style>
