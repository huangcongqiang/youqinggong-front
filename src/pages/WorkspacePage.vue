<template>
  <section class="workspace-page">
    <ActionErrorDialog
      :message="actionError"
      eyebrow="合同概览"
      title="当前合同概览暂时不可用"
    />

    <div class="workspace-shell">
      <ContractShellHeader
        eyebrow="合同概览"
        :title="workspaceTitle"
        :lead="workspaceLead"
        :pills="shellPills"
        :tabs="shellTabs"
      />

      <div v-if="loadError" class="workspace-banner workspace-banner--warn">
        <span class="workspace-banner-icon">!</span>
        <div>
          <strong>当前合同概览暂时无法加载</strong>
          <p>{{ loadError }}</p>
        </div>
      </div>

      <div v-else-if="loading" class="workspace-banner workspace-banner--info">
        <span class="workspace-banner-icon">...</span>
        <div>
          <strong>正在加载合同概览</strong>
          <p>正在把当前合同、里程碑、进展和文件汇总到这里。</p>
        </div>
      </div>

      <div class="workspace-layout">
        <main class="workspace-main">
          <section class="workspace-card workspace-card--overview">
            <div class="summary-stack">
              <article class="summary-chip-card">
                <span>下一步</span>
                <strong>{{ nextStepText }}</strong>
                <p>先在概览里继续推进合同，消息、结算、记录和助手会继续挂在同一份合同下。</p>
              </article>
              <article class="summary-chip-card">
                <span>合同动态</span>
                <strong>{{ activityFeed.length }} 条更新</strong>
                <p>{{ assetItems.length ? `已挂接 ${assetItems.length} 个文件` : '合同推进后，文件和动态会继续汇总到这里。' }}</p>
              </article>
            </div>

            <div class="composer-actions">
              <p class="muted">
                先在这里推进合同；只有在需要实时沟通细节时再打开消息。
              </p>
            </div>
          </section>

          <section v-if="taskOptions.length > 1" class="workspace-card workspace-card--switcher">
            <div class="section-head">
              <div>
                <span class="eyebrow">其他合作</span>
                <h2>只有任务变化时再切换</h2>
              </div>
              <div class="section-head__actions">
                <span class="workspace-count">{{ taskOptions.length }} 可选</span>
                <button type="button" class="button-secondary button-secondary--small" @click="toggleTaskSwitcher">
                  {{ showTaskSwitcher ? '收起其他合作' : '切换合作' }}
                </button>
              </div>
            </div>

            <div v-if="showTaskSwitcherPanel" class="contract-switcher">
              <button
                v-for="contract in taskOptions"
                :key="contract.id"
                type="button"
                class="contract-switcher-card"
                :class="{ 'is-active': contract.id === currentTaskId }"
                @click="selectTask(contract)"
              >
                <div class="contract-switcher-copy">
                  <strong>{{ contract.title }}</strong>
                  <p>{{ contract.summary }}</p>
                </div>
                <div class="contract-switcher-meta">
                  <span class="workspace-pill">{{ contract.status }}</span>
                  <span class="contract-switcher-meta-line">{{ contract.updatedAt || '刚刚更新' }}</span>
                </div>
              </button>
            </div>

            <div v-else class="workspace-empty workspace-empty--compact">
              <p>还有 {{ taskOptions.length - 1 }} 份合作先收起，当前概览先聚焦这份正在处理的合同。</p>
            </div>

          </section>

          <section class="workspace-card workspace-card--timeline">
            <div class="section-head">
              <div>
                <span class="eyebrow">里程碑</span>
                <h2>当前合同的交付路径</h2>
              </div>
              <span class="workspace-count">{{ milestones.length }} 个里程碑</span>
            </div>

            <div v-if="milestones.length" class="timeline-list">
              <button
                v-for="(node, index) in milestones"
                :key="node.id"
                type="button"
                class="timeline-card"
                :class="{
                  'is-current': node.id === currentNode?.id,
                  'is-complete': node.isCompleted,
                }"
                @click="selectNode(node)"
              >
                <div class="timeline-rail">
                  <span class="timeline-index">{{ String(index + 1).padStart(2, '0') }}</span>
                  <span class="timeline-line"></span>
                </div>

                <div class="timeline-copy">
                  <div class="timeline-head">
                    <div>
                      <h3>{{ node.title }}</h3>
                      <p>{{ compactText(node.summary, 110) || '合同说明还没有同步过来。' }}</p>
                    </div>
                    <span class="workspace-pill">{{ node.status }}</span>
                  </div>

                  <div class="timeline-meta">
                    <span>{{ node.progress || '等待同步' }}</span>
                    <span>{{ node.workdayLabel || '排期待确认' }}</span>
                    <span>{{ node.plannedDate || '排期待确认' }}</span>
                    <span>{{ node.updatedAt || '刚刚更新' }}</span>
                  </div>

                  <div class="timeline-tags">
                    <span class="workspace-pill">{{ node.stageType || '里程碑' }}</span>
                    <span class="workspace-pill">{{ node.attachments.length ? `${node.attachments.length} 个文件` : '还没有文件' }}</span>
                    <span class="workspace-pill">{{ node.isCurrent ? '当前里程碑' : node.isCompleted ? '已完成' : '待开始' }}</span>
                  </div>

                  <p v-if="node.aiReviewSummary" class="timeline-ai">
                    助手摘要：{{ node.aiReviewSummary }}
                  </p>
                </div>
              </button>
            </div>

            <div v-else class="workspace-empty">
              <p>工作开始后，里程碑会出现在这里。</p>
            </div>
          </section>

          <section class="workspace-card workspace-card--composer">
            <div class="section-head">
              <div>
                <span class="eyebrow">{{ composerEyebrow }}</span>
                <h2>{{ composerSectionTitle }}</h2>
              </div>
              <span class="workspace-count">{{ currentNode ? (showComposer ? '编辑已展开' : '编辑已收起') : '先选里程碑' }}</span>
            </div>

            <div v-if="currentNode" class="composer-grid">
              <article class="composer-panel composer-panel--summary">
                <h3>{{ currentNode.title }}</h3>
                <p>{{ currentNode.summary || '合同说明还没有同步过来。' }}</p>
                <p class="composer-panel__summary-note">{{ composerSummaryLead }}</p>

                <div class="composer-metrics">
                  <div>
                    <span>状态</span>
                    <strong>{{ currentNode.status }}</strong>
                  </div>
                  <div>
                    <span>进度</span>
                    <strong>{{ currentNode.progress || '等待同步' }}</strong>
                  </div>
                  <div>
                    <span>更新时间</span>
                    <strong>{{ currentNode.updatedAt || '刚刚更新' }}</strong>
                  </div>
                </div>

                <div v-if="currentNode.attachments.length" class="attachment-row">
                  <a
                    v-for="attachment in currentNode.attachments"
                    :key="`${currentNode.id}-${attachmentLabel(attachment)}`"
                    class="attachment-pill"
                    :href="attachmentHref(attachment)"
                    :download="attachmentLabel(attachment)"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {{ attachmentLabel(attachment) }}
                  </a>
                </div>

                <div class="composer-panel__summary-actions">
                  <button class="button-secondary" type="button" @click="toggleComposer">
                    {{ showComposer ? '收起编辑器' : composerOpenLabel }}
                  </button>
                </div>
              </article>

              <article v-if="showComposer" class="composer-panel composer-panel--form">
                <p v-if="assistantDraftSeed" class="muted composer-panel__assistant-note">
                  草稿已经带入这条合同更新，保存前请先确认。
                </p>
                <form v-if="!isEnterprise" class="composer-form" @submit.prevent="submitProgressForm">
                  <label class="field">
                    <span>里程碑名称</span>
                    <input v-model.trim="progressForm.stageName" type="text" placeholder="例如：第一轮交付" />
                  </label>

                  <label class="field">
                    <span>当前进度</span>
                    <input v-model.trim="progressForm.completion" type="text" placeholder="例如：68%" />
                  </label>

                  <label class="field">
                    <span>需要支持</span>
                    <select v-model="progressForm.supportNeeded">
                      <option value="">当前不需要支持</option>
                      <option v-for="option in supportOptions" :key="option" :value="option">{{ option }}</option>
                    </select>
                  </label>

                  <label class="field field--full">
                    <span>进展说明</span>
                    <textarea
                      v-model.trim="progressForm.progressSummary"
                      rows="5"
                      placeholder="说明已经完成了什么、哪里被卡住、下一步准备怎么推进。"
                    ></textarea>
                  </label>

                  <label class="field field--full">
                    <span>补充文件</span>
                    <input type="file" multiple @change="handleProgressFiles" />
                  </label>

                  <div v-if="progressFiles.length" class="file-list">
                    <span v-for="file in progressFiles" :key="file.name" class="file-pill">{{ file.name }}</span>
                  </div>

                  <div class="composer-actions field--full">
                    <button class="button-primary" type="submit" :disabled="submittingProgress">
                      {{ submittingProgress ? '保存中…' : '保存进展' }}
                    </button>
                  </div>
                </form>

                <form v-else class="composer-form" @submit.prevent="submitFeedbackForm">
                  <label class="field field--full">
                    <span>企业备注</span>
                    <textarea
                      v-model.trim="feedbackForm.summary"
                      rows="5"
                      placeholder="填写这条里程碑要附带的反馈、确认意见或下一步备注。"
                    ></textarea>
                  </label>

                  <div class="composer-actions field--full">
                    <button class="button-primary" type="submit" :disabled="submittingFeedback">
                      {{ submittingFeedback ? '保存中…' : '保存备注' }}
                    </button>
                  </div>
                </form>
              </article>
            </div>

            <div v-else class="workspace-empty">
              <p>先选一个里程碑，再打开备注编辑器或发送更新。</p>
            </div>
          </section>

          <section class="workspace-card workspace-card--activity">
            <div class="section-head">
              <div>
                <span class="eyebrow">合同记录</span>
                <h2>合同动态</h2>
              </div>
              <span class="workspace-count">{{ activityFeed.length }} 条记录</span>
            </div>

            <div v-if="activityFeed.length" class="activity-list">
              <article
                v-for="item in activityFeed"
                :key="item.key"
                class="activity-card"
              >
                <div class="activity-top">
                  <div>
                    <span class="activity-type">{{ item.kindLabel }}</span>
                    <h3>{{ item.title }}</h3>
                  </div>
                  <span class="workspace-pill">{{ item.time || '刚刚更新' }}</span>
                </div>

                <p class="activity-summary">{{ item.summary }}</p>
                    <p v-if="item.aiReviewSummary" class="activity-ai">助手摘要：{{ item.aiReviewSummary }}</p>

                <div v-if="item.attachments.length" class="attachment-row">
                  <a
                    v-for="attachment in item.attachments"
                    :key="`${item.key}-${attachmentLabel(attachment)}`"
                    class="attachment-pill"
                    :href="attachmentHref(attachment)"
                    :download="attachmentLabel(attachment)"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {{ attachmentLabel(attachment) }}
                  </a>
                </div>
              </article>
            </div>

            <div v-else class="workspace-empty">
              <p>当前还没有合同记录。更新、备注和文件会按时间顺序出现在这里。</p>
            </div>
          </section>
        </main>

        <aside class="workspace-sidebar">
          <section class="workspace-card workspace-card--current">
            <div class="section-head section-head--tight">
              <div>
                <span class="eyebrow">里程碑详情</span>
                <h2>{{ currentNode ? currentNode.title : '还没有选中里程碑' }}</h2>
              </div>
                <span class="workspace-count">{{ currentNode?.status || '等待同步' }}</span>
            </div>

            <p class="sidebar-lead">
              {{ currentNode ? currentNode.summary || '当前里程碑说明还没有同步过来。' : '先选择一个里程碑，让概览、消息、验收和助手继续挂在同一份合同下。' }}
            </p>

            <div class="sidebar-stats">
              <article>
                <span>进度</span>
                <strong>{{ currentNode?.progress || '等待同步' }}</strong>
              </article>
              <article>
                <span>文件</span>
                <strong>{{ currentNode?.attachments?.length || 0 }}</strong>
              </article>
              <article>
                <span>更新时间</span>
                <strong>{{ currentNode?.updatedAt || '刚刚更新' }}</strong>
              </article>
            </div>

            <div v-if="currentNode?.attachments?.length" class="sidebar-attachments">
              <a
                v-for="attachment in currentNode.attachments"
                :key="`sidebar-${attachmentLabel(attachment)}`"
                class="sidebar-attachment"
                :href="attachmentHref(attachment)"
                :download="attachmentLabel(attachment)"
                target="_blank"
                rel="noreferrer"
              >
                {{ attachmentLabel(attachment) }}
              </a>
            </div>
          </section>

          <section class="workspace-card workspace-card--assets">
            <div class="section-head section-head--tight">
              <div>
                <span class="eyebrow">文件</span>
                <h2>文件与交付物</h2>
              </div>
              <span class="workspace-count">{{ assetItems.length }} 个文件</span>
            </div>

            <div v-if="assetItems.length" class="asset-list">
              <a
                v-for="asset in assetItems.slice(0, 8)"
                :key="asset.key"
                class="asset-card"
                :href="asset.href"
                :download="asset.label"
                target="_blank"
                rel="noreferrer"
              >
                <strong>{{ asset.label }}</strong>
                <span>{{ asset.note }}</span>
              </a>
            </div>
            <div v-else class="workspace-empty workspace-empty--compact">
              <p>当前还没有文件。上传后的资料会出现在这里。</p>
            </div>
          </section>

          <section class="workspace-card workspace-card--assistant">
            <div class="section-head section-head--tight">
              <div>
                <span class="eyebrow">助手摘要</span>
                <h2>当前助手概览</h2>
              </div>
            </div>

            <p class="sidebar-lead">
              让助手继续挂在这份合同下，需要快速回顾或生成下一步草稿时不用离开当前概览。
            </p>

            <div class="summary-stack">
              <article class="summary-chip-card">
                <span>助手摘要</span>
                <strong>{{ currentNode?.aiReviewSummary || latestAiReviewSummary || '当前还没有摘要。' }}</strong>
              </article>
            </div>
            <p class="sidebar-lead">需要完整草稿、更深的回顾或下一条备注时，再打开助手页。</p>
          </section>

          <section class="workspace-card workspace-card--closure">
            <div class="section-head section-head--tight">
              <div>
                <span class="eyebrow">验收与结算</span>
                <h2>验收与结算概览</h2>
              </div>
            </div>

            <div class="closure-grid">
              <article>
                <span>验收</span>
                <strong>{{ closure.acceptance?.status || '等待同步' }}</strong>
              </article>
              <article>
                <span>请款</span>
                <strong>{{ closure.claimSummary?.status || '未开始' }}</strong>
              </article>
              <article>
                <span>发票</span>
                <strong>{{ closure.invoiceSummary?.status || '未开始' }}</strong>
              </article>
              <article>
                <span>对账</span>
                <strong>{{ closure.reconciliationSummary?.status || '未开始' }}</strong>
              </article>
              <article>
                <span>结算</span>
                <strong>{{ closure.settlementSummary?.status || '未开始' }}</strong>
              </article>
              <article>
                <span>争议</span>
                <strong>{{ closure.disputeSummary?.status || '未开始' }}</strong>
              </article>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getWorkspaceData,
  submitTaskProgress,
  submitWorkspaceFeedback,
  uploadTaskAttachmentAsset,
  getTaskClosureData,
} from '../services/api'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import ContractShellHeader from '../components/ContractShellHeader.vue'
import { consumeAssistantDraftHandoff, peekAssistantDraftHandoff } from '../utils/assistantDraftHandoff'

const route = useRoute()
const router = useRouter()

const page = ref(createEmptyWorkspace(''))
const loading = ref(false)
const loadError = ref('')
const actionError = ref('')
const submittingProgress = ref(false)
const submittingFeedback = ref(false)
const selectedNodeId = ref('')
const progressFiles = ref([])
const showComposer = ref(false)
const showTaskSwitcher = ref(false)

const progressForm = reactive({
  stageName: '',
  completion: '',
  supportNeeded: '',
  progressSummary: '',
})

const feedbackForm = reactive({
  summary: '',
})

const isEnterprise = computed(() => route.path.startsWith('/enterprise'))
const basePath = computed(() => (isEnterprise.value ? '/enterprise' : '/talent'))
const routeTaskId = computed(() => String(route.query.taskId || route.params.taskId || '').trim())
const currentRoomQuery = computed(() => String(route.query.roomKey || route.query.room || '').trim())
const routeNodeId = computed(() => String(route.query.node || '').trim())
const currentRecordId = computed(() => String(route.query.recordId || '').trim())
const originSourceValue = computed(() => String(route.query.originSource || route.query.source || 'contract').trim())
const originTaskIdValue = computed(() => String(route.query.originTaskId || route.query.taskId || '').trim())
const originRecordIdValue = computed(() => String(route.query.originRecordId || route.query.recordId || '').trim())
const originRoomValue = computed(() => String(route.query.originRoom || route.query.roomKey || route.query.room || '').trim())
const currentTaskId = computed(() => String(page.value?.summary?.taskId || routeTaskId.value || '').trim())
const hasTask = computed(() => Boolean(currentTaskId.value))
const assistantDraftToken = computed(() => String(route.query.assistantDraftToken || '').trim())
const assistantDraftSeed = computed(() => {
  const raw = route.query.assistantDraft
  const inlineDraft = Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim()
  if (inlineDraft) return inlineDraft
  return assistantDraftToken.value ? String(peekAssistantDraftHandoff(assistantDraftToken.value)?.text || '').trim() : ''
})
const assistantDraftApplyKey = ref('')
const summary = computed(() => page.value?.summary || {})
const focus = computed(() => page.value?.focus || {})
const taskDetail = computed(() => page.value?.taskDetail || {})
const contextQuery = computed(() => ({
  ...(currentTaskId.value ? { taskId: currentTaskId.value } : {}),
  ...(currentRoomQuery.value ? { room: currentRoomQuery.value, roomKey: currentRoomQuery.value } : {}),
  ...(routeNodeId.value ? { node: routeNodeId.value } : {}),
  ...(currentRecordId.value ? { recordId: currentRecordId.value } : {}),
  ...(workspaceTitle.value ? { contextTitle: workspaceTitle.value } : {}),
  ...(summary.value?.status ? { contextStage: summary.value.status } : {}),
  ...(currentNode.value?.title ? { contextMilestone: currentNode.value.title } : {}),
  source: 'contract',
  surface: 'contract',
  originSource: originSourceValue.value || 'contract',
  originTaskId: originTaskIdValue.value || currentTaskId.value || '',
  ...(originRecordIdValue.value ? { originRecordId: originRecordIdValue.value } : {}),
  ...(originRoomValue.value ? { originRoom: originRoomValue.value } : {}),
}))
const supportOptions = computed(() => asArray(page.value?.supportOptions).map((item) => String(item).trim()).filter(Boolean))
const taskOptions = computed(() => normalizeTaskOptions(page.value?.taskOptions))
const milestones = computed(() => normalizeNodes(page.value?.milestones || page.value?.collaborationNodes || []))
const progressFeed = computed(() => normalizeProgressItems(page.value?.progressFeed || []))
const aiReviewHistory = computed(() => normalizeActivityItems(page.value?.aiReviewHistory || []))
const reviewHistory = computed(() => normalizeReviewItems(page.value?.reviewHistory || []))
const closure = computed(() => page.value || createEmptyWorkspace(currentTaskId.value))
const assetItems = computed(() => {
  const fromLibrary = normalizeAssetItems(page.value?.assetLibrary || [])
  const fromNodes = milestones.value.flatMap((node) => node.attachments.map((attachment) => ({
    key: `${node.id}-${attachmentLabel(attachment)}`,
    label: attachmentLabel(attachment),
    href: attachmentHref(attachment),
    note: node.title,
  })))
  const fromProgress = progressFeed.value.flatMap((item) => item.attachments.map((attachment) => ({
    key: `${item.key}-${attachmentLabel(attachment)}`,
    label: attachmentLabel(attachment),
    href: attachmentHref(attachment),
    note: item.title,
  })))
  return [...fromLibrary, ...fromNodes, ...fromProgress].filter((item, index, list) => index === list.findIndex((candidate) => candidate.key === item.key || candidate.href === item.href))
})

const currentNode = computed(() => {
  if (!milestones.value.length) return null
  return (
    milestones.value.find((node) => node.id === routeNodeId.value) ||
    milestones.value.find((node) => node.id === selectedNodeId.value) ||
    milestones.value.find((node) => node.isCurrent) ||
    milestones.value.find((node) => !node.isCompleted) ||
    milestones.value[0]
  )
})

const currentNodeIndex = computed(() => {
  if (!currentNode.value) return -1
  return milestones.value.findIndex((node) => node.id === currentNode.value.id)
})

const currentNodeProgress = computed(() => currentNode.value?.progress || currentNode.value?.completion || currentNode.value?.status || '等待同步')
const currentNodeTitle = computed(() => currentNode.value?.title || taskDetail.value?.title || summary.value?.taskName || '合同概览')
const workspaceTitle = computed(() => summary.value.taskName || taskDetail.value.title || currentNodeTitle.value || '合同概览')
const workspaceStatusLabel = computed(() => {
  const rawStatus = String(summary.value.status || '').trim()
  if (rawStatus.includes('已确认合作') || rawStatus.includes('协作中') || rawStatus.includes('企业已确认')) {
    return '执行中'
  }
  return rawStatus || '等待同步'
})
const workspaceLead = computed(() => {
  if (workspaceStatusLabel.value === '执行中') {
    return '当前合作已经进入执行中，继续在这里同步里程碑、附件、风险和后续验收准备。'
  }
  if (focus.value.summary) return focus.value.summary
  return currentNode.value
    ? `先把 ${currentNode.value.title} 留在这里继续推进，消息、验收和助手都会继续挂在同一份合同下。`
    : '先在这里保持当前合同在视野里，消息、验收、记录和助手会随着合同一起推进。'
})
const composerHeading = computed(() => (isEnterprise.value ? '补一条合同备注' : '提交一条里程碑进展'))
const composerEyebrow = computed(() => (isEnterprise.value ? '合同备注' : '里程碑进展'))
const composerSectionTitle = computed(() => {
  if (!currentNode.value) return '先选一个里程碑'
  return isEnterprise.value
    ? '把合同备注继续挂在这份合作下，概览先聚焦当前合同。'
    : '把里程碑进展继续挂在这份合作下，概览先聚焦当前合同。'
})
const composerSummaryLead = computed(() => {
  if (!currentNode.value) return '先选一个里程碑，再把备注、文件和下一步继续挂在这一条线上。'
  if (assistantDraftSeed.value) {
    return '草稿已经带到这里，需要时再打开编辑器确认或保存。'
  }
  return isEnterprise.value
    ? '只有这条里程碑真的需要新备注时，再把编辑器展开。'
    : '只有这条里程碑真的需要保存新进展时，再把编辑器展开。'
})
const composerOpenLabel = computed(() => (isEnterprise.value ? '打开备注编辑器' : '打开进展编辑器'))

const dashboardRoute = computed(() => basePath.value)
const assistantRoute = computed(() =>
  buildRoute(`${basePath.value}/assistant`, contextQuery.value)
)
const messagesRoute = computed(() =>
  hasTask.value ? buildRoute(`${basePath.value}/chat`, contextQuery.value) : ''
)
const acceptanceRoute = computed(() =>
  hasTask.value ? buildRoute(`${basePath.value}/acceptance`, contextQuery.value) : ''
)
const recordsRoute = computed(() =>
  hasTask.value
    ? buildRoute(currentRecordId.value ? `${basePath.value}/records/${encodeURIComponent(currentRecordId.value)}` : `${basePath.value}/records`, contextQuery.value)
    : ''
)
const showTaskSwitcherPanel = computed(() => !currentTaskId.value || showTaskSwitcher.value)
const shellPills = computed(() => ([
  summary.value.taskId ? `合同 ${summary.value.taskId}` : '还没有挂接',
  workspaceStatusLabel.value,
  currentNode.value?.title || '',
]).filter(Boolean))
const shellTabs = computed(() => {
  if (!hasTask.value) return []
  return [
    { label: '概览', current: true },
    messagesRoute.value ? { label: '消息', to: messagesRoute.value } : null,
    acceptanceRoute.value ? { label: '验收', to: acceptanceRoute.value } : null,
    recordsRoute.value ? { label: '记录', to: recordsRoute.value } : null,
    assistantRoute.value ? { label: '助手', to: assistantRoute.value } : null,
  ].filter(Boolean)
})

const nextStepText = computed(() => {
  const parts = [
    summary.value.nextStep,
    closure.value?.acceptance?.nextStep,
    closure.value?.claimSummary?.nextStep,
    closure.value?.invoiceSummary?.nextStep,
    closure.value?.reconciliationSummary?.nextStep,
    closure.value?.settlementSummary?.nextStep,
    closure.value?.disputeSummary?.nextStep,
  ].filter(Boolean)
  if (workspaceStatusLabel.value === '执行中') {
    const first = String(parts[0] || '').trim()
    if (!first || /确认任务范围|确认需求范围|排期和预算|正式执行/.test(first)) {
      return '继续同步里程碑进展、附件和风险，逐步准备后续验收与结算。'
    }
  }
  return parts[0] || '当前还没有挂上下一步。'
})

const latestAiReviewSummary = computed(() => {
  return (
    currentNode.value?.aiReviewSummary ||
    currentNode.value?.aiReview?.summary ||
    aiReviewHistory.value[0]?.summary ||
    '当前还没有摘要。'
  )
})

const activityFeed = computed(() => {
  const feed = []

  progressFeed.value.forEach((item, index) => {
    feed.push({
      key: `progress-${item.key || index}`,
      kindLabel: '进展更新',
      title: item.title || item.stage || item.status || `更新 ${index + 1}`,
      summary: item.summary || item.description || item.progressText || '当前还没有摘要。',
      time: item.time || item.updatedAt || item.submittedAt || '刚刚更新',
      aiReviewSummary: item.aiReviewSummary || item.aiReview?.summary || '',
      attachments: item.attachments || [],
    })
  })

  aiReviewHistory.value.forEach((item, index) => {
    feed.push({
      key: `ai-${item.key || index}`,
      kindLabel: '助手摘要',
      title: item.title || '助手摘要',
      summary: item.summary || '当前还没有摘要。',
      time: item.time || item.updatedAt || '刚刚更新',
      aiReviewSummary: item.aiReviewSummary || '',
      attachments: item.attachments || [],
    })
  })

  reviewHistory.value.forEach((item, index) => {
    feed.push({
      key: `review-${item.key || index}`,
      kindLabel: '反馈',
      title: item.reviewer || '反馈记录',
      summary: item.content || item.summary || '暂时还没有反馈。',
      time: item.time || item.updatedAt || '刚刚更新',
      aiReviewSummary: '',
      attachments: item.attachments || [],
    })
  })

  return feed.slice(0, 10)
})

function clearAssistantDraftQuery() {
  if (!route.query.assistantDraftToken && !route.query.assistantDraft && !route.query.assistantSurface) return
  const query = { ...route.query }
  delete query.assistantDraftToken
  delete query.assistantDraft
  delete query.assistantSurface
  router.replace({ path: route.path, query })
}

watch(
  [assistantDraftSeed, assistantDraftToken],
  ([value, token]) => {
    const applyKey = `${token || 'inline'}::${value}`
    if (!value || assistantDraftApplyKey.value === applyKey) return
    if (isEnterprise.value) {
      if (!feedbackForm.summary.trim()) {
        feedbackForm.summary = value
      } else if (!feedbackForm.summary.includes(value)) {
        feedbackForm.summary = `${feedbackForm.summary}\n\n${value}`.trim()
      }
    } else if (!progressForm.progressSummary.trim()) {
      progressForm.progressSummary = value
    } else if (!progressForm.progressSummary.includes(value)) {
      progressForm.progressSummary = `${progressForm.progressSummary}\n\n${value}`.trim()
    }
    assistantDraftApplyKey.value = applyKey
    if (token) consumeAssistantDraftHandoff(token)
    clearAssistantDraftQuery()
  },
  { immediate: true }
)

watch(
  [routeTaskId, () => route.path],
  async () => {
    await loadWorkspace()
  },
  { immediate: true }
)

watch(
  () => milestones.value,
  (items) => {
    if (!items.length) {
      selectedNodeId.value = ''
      showComposer.value = false
      return
    }

    const preferred =
      items.find((node) => node.id === selectedNodeId.value) ||
      items.find((node) => node.isCurrent) ||
      items.find((node) => !node.isCompleted) ||
      items[0]

    if (!selectedNodeId.value || !items.some((node) => node.id === selectedNodeId.value)) {
      selectedNodeId.value = preferred?.id || ''
    }
  },
  { immediate: true }
)

watch(
  [currentNode, assistantDraftSeed],
  ([node, draft]) => {
    if (!node) {
      showComposer.value = false
      return
    }
    if (draft) {
      showComposer.value = true
    }
  },
  { immediate: true }
)

async function loadWorkspace() {
  loading.value = true
  loadError.value = ''
  try {
    const data = await getWorkspaceData(currentTaskId.value || '')
    page.value = normalizeWorkspace(data, currentTaskId.value)
    if (currentTaskId.value) {
      try {
        const closureData = await getTaskClosureData(currentTaskId.value)
        page.value = mergeClosureIntoWorkspace(page.value, closureData)
      } catch (closureError) {
        console.warn('closure sync failed', closureError)
      }
    }
  } catch (error) {
    loadError.value = error?.message || '当前合同概览暂时无法同步。'
    page.value = createEmptyWorkspace(currentTaskId.value)
  } finally {
    loading.value = false
  }
}

function selectTask(task) {
  const nextTaskId = task?.id || task?.taskId || ''
  if (!nextTaskId) return
  showTaskSwitcher.value = false
  const sameTask = String(nextTaskId) === currentTaskId.value
  router.replace({
    path: route.path,
    query: {
      taskId: nextTaskId,
      ...(sameTask && currentRecordId.value ? { recordId: currentRecordId.value } : {}),
      source: 'contract',
      surface: 'contract',
      originSource: sameTask ? (originSourceValue.value || 'contract') : 'contract',
      originTaskId: sameTask ? (originTaskIdValue.value || nextTaskId) : nextTaskId,
      ...(sameTask && originRecordIdValue.value ? { originRecordId: originRecordIdValue.value } : {}),
      ...(sameTask && originRoomValue.value ? { originRoom: originRoomValue.value } : {}),
    },
  })
}

function toggleTaskSwitcher() {
  showTaskSwitcher.value = !showTaskSwitcher.value
}

function selectNode(node) {
  const nextNodeId = String(node?.id || '')
  selectedNodeId.value = nextNodeId
  showComposer.value = false
  router.replace({
    path: route.path,
    query: {
      ...contextQuery.value,
      ...(nextNodeId ? { node: nextNodeId } : {}),
    },
  })
}

function toggleComposer() {
  if (!currentNode.value) return
  showComposer.value = !showComposer.value
}

function goToChat() {
  if (!messagesRoute.value) {
    actionError.value = '先选一份合同。'
    return
  }
  router.push(messagesRoute.value)
}

function goToAcceptance() {
  if (!acceptanceRoute.value) {
    actionError.value = '先选一份合同。'
    return
  }
  router.push(acceptanceRoute.value)
}

async function submitProgressForm() {
  if (!currentTaskId.value) {
    actionError.value = '先选一份合同。'
    return
  }

  const percent = normalizePercent(progressForm.completion)
  if (percent === null) {
    actionError.value = '请输入有效进度，例如 68% 或 68。'
    return
  }

  if (!progressForm.progressSummary.trim()) {
    actionError.value = '先补上进展说明，再提交。'
    return
  }

  submittingProgress.value = true
  actionError.value = ''
  try {
    const uploadedFiles = []
    for (const file of progressFiles.value) {
      const uploaded = await uploadTaskAttachmentAsset(currentTaskId.value, file, {
        scene: 'TASK_PROGRESS',
        source: 'TASK_PROGRESS',
      })
      uploadedFiles.push(normalizeAttachment(uploaded, file))
    }

    await submitTaskProgress(currentTaskId.value, {
      stage: progressForm.stageName.trim() || currentNode.value?.title || '',
      milestoneId: currentNode.value?.id || currentNode.value?.milestoneId || currentNode.value?.nodeId || '',
      progressText: progressForm.progressSummary.trim(),
      supportNeeded: progressForm.supportNeeded,
      completionPercent: percent,
      files: uploadedFiles,
      attachmentFiles: uploadedFiles,
    })

    progressForm.stageName = ''
    progressForm.completion = ''
    progressForm.supportNeeded = ''
    progressForm.progressSummary = ''
    progressFiles.value = []
    showComposer.value = false
    await loadWorkspace()
  } catch (error) {
    actionError.value = error?.message || '当前暂时无法提交这条进展。'
  } finally {
    submittingProgress.value = false
  }
}

async function submitFeedbackForm() {
  if (!currentTaskId.value) {
    actionError.value = '先选一份合同，再发送这条备注。'
    return
  }

  if (!currentNode.value?.id) {
    actionError.value = '先选一个里程碑，再发送这条备注。'
    return
  }

  if (!feedbackForm.summary.trim()) {
    actionError.value = '先补上备注内容，再提交。'
    return
  }

  submittingFeedback.value = true
  actionError.value = ''
  try {
    await submitWorkspaceFeedback(currentTaskId.value, {
      nodeId: currentNode.value.id,
      summary: feedbackForm.summary.trim(),
    })
    feedbackForm.summary = ''
    showComposer.value = false
    await loadWorkspace()
  } catch (error) {
    actionError.value = error?.message || '当前暂时无法提交这条备注。'
  } finally {
    submittingFeedback.value = false
  }
}

function handleProgressFiles(event) {
  const files = Array.from(event?.target?.files || [])
  progressFiles.value = files
}

function compactText(value, limit = 80) {
  const text = String(value || '').trim()
  if (!text) return ''
  return text.length <= limit ? text : `${text.slice(0, limit)}…`
}

function attachmentLabel(attachment) {
  return (
    attachment?.label ||
    attachment?.name ||
    attachment?.filename ||
    attachment?.fileName ||
    attachment?.title ||
    '文件'
  )
}

function attachmentHref(attachment) {
  return (
    attachment?.downloadHref ||
    attachment?.downloadUrl ||
    attachment?.previewUrl ||
    attachment?.url ||
    attachment?.href ||
    attachment?.path ||
    ''
  )
}

function normalizePercent(value) {
  const text = String(value || '').trim()
  if (!text) return null
  const matched = text.match(/\d+(?:\.\d+)?/)
  if (!matched) return null
  const percent = Number.parseFloat(matched[0])
  if (Number.isNaN(percent)) return null
  return Math.max(0, Math.min(100, Math.round(percent)))
}

function normalizeWorkspace(raw, requestedTaskId = '') {
  const base = createEmptyWorkspace(requestedTaskId)
  const source = raw && typeof raw === 'object' ? raw : {}
  const summarySource = source.summary && typeof source.summary === 'object' ? source.summary : {}
  const focusSource = source.focus && typeof source.focus === 'object' ? source.focus : {}

  return {
    ...base,
    ...source,
    requestError: source.requestError || '',
    summary: {
      ...base.summary,
      ...summarySource,
    },
    focus: {
      ...base.focus,
      ...focusSource,
    },
    taskDetail: source.taskDetail && typeof source.taskDetail === 'object' ? source.taskDetail : {},
    taskOptions: normalizeTaskOptions(source.taskOptions),
    milestones: normalizeNodes(source.milestones || source.collaborationNodes || []),
    collaborationNodes: normalizeNodes(source.collaborationNodes || source.milestones || []),
    progressFeed: normalizeProgressItems(source.progressFeed || []),
    assetLibrary: normalizeAssetItems(source.assetLibrary || []),
    aiReviewHistory: normalizeActivityItems(source.aiReviewHistory || []),
    reviewHistory: normalizeReviewItems(source.reviewHistory || []),
    executionChecklist: asArray(source.executionChecklist),
    supportOptions: asArray(source.supportOptions).map((item) => String(item).trim()).filter(Boolean),
    earlyCompletion: source.earlyCompletion && typeof source.earlyCompletion === 'object' ? source.earlyCompletion : {},
    cancellationRequest: source.cancellationRequest && typeof source.cancellationRequest === 'object' ? source.cancellationRequest : {},
    acceptance: source.acceptance && typeof source.acceptance === 'object' ? source.acceptance : {},
    celebrationBanner: source.celebrationBanner && typeof source.celebrationBanner === 'object' ? source.celebrationBanner : {},
  }
}

function mergeClosureIntoWorkspace(workspace, closureData) {
  if (!closureData || typeof closureData !== 'object') return workspace
  return {
    ...workspace,
    acceptance: closureData.acceptance || workspace.acceptance,
    earlyCompletion: closureData.earlyCompletion || workspace.earlyCompletion,
    summary: {
      ...workspace.summary,
      ...(closureData.summary || {}),
    },
  }
}

function createEmptyWorkspace(taskId = '') {
  return {
    summary: {
      taskId,
      taskName: taskId ? `合同 ${taskId}` : '选择一份合同',
      business: '',
      businessUserId: '',
      talent: '',
      talentUserId: '',
      range: '',
      status: '等待同步',
      nextStep: '先选一份合同，再查看概览。',
    },
    focus: {
      title: '里程碑还没有同步过来',
      summary: '',
      status: '等待同步',
    },
    taskDetail: {},
    taskOptions: [],
    milestones: [],
    collaborationNodes: [],
    progressFeed: [],
    assetLibrary: [],
    aiReviewHistory: [],
    reviewHistory: [],
    executionChecklist: [],
    supportOptions: [],
    earlyCompletion: {},
    cancellationRequest: {},
    acceptance: {},
    celebrationBanner: {},
  }
}

function normalizeTaskOptions(list) {
  return asArray(list).map((item, index) => ({
    id: String(item?.id || item?.taskId || item?.value || item?.slug || index),
    title: item?.title || item?.taskName || item?.name || `合同 ${index + 1}`,
    summary: item?.summary || item?.description || item?.focus || '打开这份合同继续查看。',
    status: item?.status || item?.state || item?.badge || '等待同步',
    updatedAt: item?.updatedAt || item?.time || item?.latestAt || '',
  }))
}

function normalizeNodes(list) {
  return asArray(list).map((item, index) => {
    const statusText = String(item?.status || item?.state || item?.phase || '等待同步').trim() || '等待同步'
    const completed = Boolean(item?.isCompleted || item?.done || /Completed|done|完成/.test(statusText))
    const current = Boolean(item?.isCurrent || item?.current || /进行中|当前|active/.test(statusText))
    return {
      id: String(item?.id || item?.nodeId || item?.milestoneId || item?.key || index),
      title: item?.title || item?.name || item?.label || `里程碑 ${index + 1}`,
      summary: item?.summary || item?.description || item?.note || item?.progressText || '',
      status: statusText,
      progress: item?.progress || item?.completion || item?.completionPercent || item?.status || '',
      workdayLabel: item?.workdayLabel || item?.workday || '',
      plannedDate: item?.plannedDate || item?.dueDate || item?.deadline || '',
      stageType: item?.stageType || item?.type || item?.kind || '里程碑',
      updatedAt: item?.updatedAt || item?.time || item?.submittedAt || '',
      expectedDeliverables: item?.expectedDeliverables || item?.deliverables || item?.deliverable || '',
      aiReviewSummary: item?.aiReviewSummary || item?.aiReview?.summary || item?.reviewSummary || '',
      attachments: normalizeAttachmentList(item?.attachments || item?.attachmentFiles || item?.files),
      isCurrent: current,
      isCompleted: completed,
    }
  })
}

function normalizeProgressItems(list) {
  return asArray(list).map((item, index) => ({
    key: String(item?.key || item?.id || item?.progressId || item?.nodeId || index),
    title: item?.title || item?.stage || item?.status || `更新 ${index + 1}`,
    summary: item?.summary || item?.description || item?.progressText || item?.note || '',
    time: item?.time || item?.updatedAt || item?.submittedAt || '',
    aiReviewSummary: item?.aiReviewSummary || item?.aiReview?.summary || '',
    attachments: normalizeAttachmentList(item?.attachments || item?.attachmentFiles || item?.files),
  }))
}

function normalizeActivityItems(list) {
  return asArray(list).map((item, index) => ({
    key: String(item?.key || item?.id || item?.time || index),
    title: item?.title || item?.name || item?.label || '助手摘要',
    summary: item?.summary || item?.note || item?.content || '',
    time: item?.time || item?.updatedAt || item?.submittedAt || '',
    attachments: normalizeAttachmentList(item?.attachments || item?.attachmentFiles || item?.files),
  }))
}

function normalizeReviewItems(list) {
  return asArray(list).map((item, index) => ({
    key: String(item?.key || item?.id || item?.time || index),
    reviewer: item?.reviewer || item?.role || '反馈记录',
    content: item?.content || item?.summary || '',
    time: item?.time || item?.updatedAt || '',
    attachments: normalizeAttachmentList(item?.attachments || item?.files),
  }))
}

function normalizeAssetItems(list) {
  return asArray(list).map((item, index) => ({
    key: String(item?.key || item?.id || item?.uploadId || index),
    label: attachmentLabel(item),
    href: attachmentHref(item),
    note: item?.note || item?.group || item?.category || item?.source || '合同资料',
  }))
}

function normalizeAttachmentList(list) {
  return asArray(list).map((item) => normalizeAttachment(item))
}

function normalizeAttachment(item, fallbackFile = null) {
  if (typeof item === 'string') {
    return {
      name: item,
      label: item,
      href: item,
      downloadHref: item,
      downloadUrl: item,
    }
  }

  const source = item && typeof item === 'object' ? item : {}
  const fileName = fallbackFile?.name || source.name || source.filename || source.fileName || source.label || '文件'
  const href = attachmentHref(source) || (fallbackFile ? URL.createObjectURL(fallbackFile) : '')
  return {
    ...source,
    name: source.name || fileName,
    filename: source.filename || fileName,
    fileName: source.fileName || fileName,
    label: attachmentLabel(source) || fileName,
    href,
    downloadHref: source.downloadHref || source.downloadUrl || href,
    downloadUrl: source.downloadUrl || href,
  }
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function buildRoute(path, query = {}) {
  const params = new URLSearchParams()
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    params.set(key, String(value))
  })
  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}
</script>

<style scoped>
.workspace-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(237, 245, 232, 0.95), transparent 30%),
    radial-gradient(circle at top right, rgba(240, 245, 238, 0.75), transparent 24%),
    linear-gradient(180deg, #f8faf7 0%, #ffffff 42%, #fbfcfa 100%);
  color: #1a1f16;
}

.workspace-shell {
  width: min(1440px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 32px 0 48px;
}

.workspace-tabs {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 22px;
  border: 1px solid rgba(24, 36, 19, 0.08);
  background: rgba(255, 255, 255, 0.92);
}

.workspace-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  color: #0f172a;
  font-weight: 600;
}

.workspace-tab.is-active {
  border-color: rgba(16, 138, 0, 0.22);
  background: #f4fbf2;
  color: #0f5132;
}

.workspace-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid rgba(24, 36, 19, 0.08);
  border-radius: 28px;
  padding: 28px 30px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 24px 80px rgba(35, 53, 28, 0.08);
}

.workspace-hero-copy {
  display: grid;
  gap: 12px;
  max-width: 820px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5d6b52;
  font-weight: 700;
}

.workspace-title {
  margin: 0;
  font-size: clamp(30px, 3.8vw, 52px);
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.workspace-lead {
  margin: 0;
  color: #51604a;
  font-size: 16px;
  line-height: 1.8;
  max-width: 760px;
}

.workspace-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.workspace-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(41, 61, 29, 0.12);
  background: #f7faf4;
  color: #33442d;
  font-size: 13px;
  font-weight: 600;
}

.workspace-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
}

.button-primary,
.button-secondary,
.button-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
  cursor: pointer;
  border: 1px solid transparent;
}

.button-primary:hover,
.button-secondary:hover,
.button-ghost:hover {
  transform: translateY(-1px);
}

.button-primary {
  color: #fff;
  background: linear-gradient(135deg, #3f911f, #5faa2b);
  box-shadow: 0 12px 28px rgba(76, 148, 39, 0.25);
}

.button-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.button-secondary {
  color: #1f2b1a;
  border-color: rgba(53, 76, 43, 0.14);
  background: #fff;
}

.button-ghost {
  color: #3f4f36;
  border-color: rgba(53, 76, 43, 0.08);
  background: rgba(255, 255, 255, 0.72);
}

.workspace-banner {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  border-radius: 20px;
  margin-top: 18px;
  padding: 18px 20px;
  border: 1px solid rgba(31, 47, 20, 0.08);
  background: rgba(255, 255, 255, 0.88);
}

.workspace-banner--warn {
  background: linear-gradient(180deg, #fff8e5, #fffdf2);
}

.workspace-banner--info {
  background: linear-gradient(180deg, #f4fbef, #fcfff9);
}

.workspace-banner-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #4c9e2a;
  color: #fff;
  font-weight: 800;
  flex: none;
}

.workspace-banner strong {
  display: block;
  margin-bottom: 6px;
}

.workspace-banner p {
  margin: 0;
  color: #5b6951;
  line-height: 1.7;
}

.workspace-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.95fr);
  gap: 24px;
  margin-top: 24px;
}

.workspace-main,
.workspace-sidebar {
  display: grid;
  gap: 24px;
  align-content: start;
}

.workspace-sidebar {
  position: sticky;
  top: 20px;
}

.workspace-card {
  border: 1px solid rgba(28, 43, 20, 0.08);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 42px rgba(32, 49, 24, 0.06);
  padding: 24px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.section-head--tight {
  align-items: center;
}

.section-head h2 {
  margin: 6px 0 0;
  font-size: 26px;
  line-height: 1.14;
  letter-spacing: -0.03em;
}

.workspace-count {
  display: inline-flex;
  align-items: center;
  padding: 7px 11px;
  border-radius: 999px;
  background: #f4f8ef;
  border: 1px solid rgba(54, 84, 35, 0.1);
  color: #526345;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.contract-switcher {
  display: grid;
  gap: 12px;
}

.contract-switcher-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  width: 100%;
  text-align: left;
  padding: 18px 18px 18px 20px;
  border-radius: 22px;
  border: 1px solid rgba(46, 62, 37, 0.1);
  background: linear-gradient(180deg, #ffffff, #fbfcf8);
  cursor: pointer;
}

.contract-switcher-card.is-active {
  border-color: rgba(76, 148, 39, 0.45);
  box-shadow: 0 16px 32px rgba(77, 140, 46, 0.11);
}

.contract-switcher-copy strong,
.contract-switcher-copy p,
.contract-switcher-meta,
.contract-switcher-meta-line {
  display: block;
}

.contract-switcher-copy strong {
  font-size: 17px;
  line-height: 1.35;
}

.contract-switcher-copy p {
  margin: 8px 0 0;
  color: #5a6752;
  line-height: 1.65;
}

.contract-switcher-meta {
  display: grid;
  gap: 8px;
  align-content: start;
  text-align: right;
}

.contract-switcher-meta-line {
  color: #7a8671;
  font-size: 13px;
}

.workspace-empty {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  border-radius: 18px;
  background: #fbfdf8;
  border: 1px dashed rgba(53, 76, 43, 0.15);
  color: #54634a;
}

.workspace-empty--compact {
  justify-content: flex-start;
}

.timeline-list,
.activity-list,
.asset-list,
.summary-stack {
  display: grid;
  gap: 14px;
}

.timeline-card {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 16px;
  width: 100%;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(30, 43, 20, 0.08);
  background: linear-gradient(180deg, #fff, #fbfcf8);
  text-align: left;
  cursor: pointer;
}

.timeline-card.is-current {
  border-color: rgba(76, 148, 39, 0.38);
  box-shadow: 0 18px 36px rgba(77, 140, 46, 0.1);
}

.timeline-card.is-complete {
  opacity: 0.95;
}

.timeline-rail {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.timeline-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #f4f8ef;
  color: #314225;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 52px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(81, 122, 40, 0.22), rgba(81, 122, 40, 0.06));
}

.timeline-copy {
  display: grid;
  gap: 14px;
}

.timeline-head {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: flex-start;
}

.timeline-head h3,
.activity-top h3,
.composer-panel h3,
.workspace-card h2 {
  margin: 0;
}

.timeline-head p,
.activity-summary,
.activity-ai,
.sidebar-lead,
.composer-panel p,
.workspace-empty p,
.summary-chip-card strong,
.asset-card span,
.contract-switcher-copy p,
.timeline-ai,
.timeline-meta,
.timeline-tags {
  margin: 0;
}

.timeline-head p,
.timeline-ai,
.activity-summary,
.activity-ai,
.sidebar-lead,
.composer-panel p,
.asset-card span,
.contract-switcher-copy p {
  color: #576453;
  line-height: 1.72;
}

.timeline-meta,
.timeline-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.timeline-meta {
  color: #73816a;
  font-size: 13px;
}

.timeline-meta span {
  display: inline-flex;
  align-items: center;
}

.timeline-ai {
  color: #405239;
  font-weight: 600;
}

.composer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
}

.composer-panel {
  border: 1px solid rgba(39, 58, 27, 0.08);
  border-radius: 22px;
  background: #fbfcf8;
  padding: 20px;
}

.composer-panel--summary {
  background: linear-gradient(180deg, #ffffff, #f8fbf5);
}

.composer-panel__summary-note {
  margin: 12px 0 0;
  color: #4e5f47;
  line-height: 1.7;
}

.composer-panel__summary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.composer-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.composer-metrics div,
.sidebar-stats article,
.closure-grid article {
  display: grid;
  gap: 4px;
  padding: 14px 15px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(39, 58, 27, 0.08);
}

.composer-metrics span,
.sidebar-stats span,
.closure-grid span {
  color: #71806b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.composer-metrics strong,
.sidebar-stats strong,
.closure-grid strong {
  color: #1d2618;
  font-size: 15px;
  line-height: 1.45;
}

.attachment-row,
.file-list,
.sidebar-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.attachment-pill,
.file-pill,
.sidebar-attachment {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(46, 62, 37, 0.1);
  background: #fff;
  color: #304225;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

.composer-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field {
  display: grid;
  gap: 8px;
}

.field--full {
  grid-column: 1 / -1;
}

.field span {
  color: #27321f;
  font-size: 14px;
  font-weight: 700;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  border: 1px solid rgba(44, 61, 31, 0.16);
  border-radius: 16px;
  background: #fff;
  color: #1a2015;
  padding: 14px 15px;
  font: inherit;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.field textarea {
  resize: vertical;
  min-height: 132px;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: rgba(76, 148, 39, 0.62);
  box-shadow: 0 0 0 4px rgba(76, 148, 39, 0.08);
}

.composer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.section-head__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.activity-card {
  display: grid;
  gap: 12px;
  padding: 20px;
  border-radius: 22px;
  border: 1px solid rgba(40, 56, 28, 0.08);
  background: linear-gradient(180deg, #ffffff, #fafcf7);
}

.activity-top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.activity-type {
  display: inline-flex;
  margin-bottom: 8px;
  color: #5d6b52;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.activity-top h3 {
  font-size: 18px;
  line-height: 1.4;
}

.activity-summary,
.activity-ai {
  line-height: 1.76;
}

.activity-ai {
  color: #445344;
  font-weight: 600;
}

.workspace-sidebar {
  gap: 18px;
}

.workspace-card--assistant {
  background: rgba(248, 250, 247, 0.92);
  border-color: rgba(24, 36, 19, 0.06);
}

.workspace-card--assistant .sidebar-lead {
  color: #5d6b52;
}

.sidebar-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.summary-chip-card {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(43, 61, 29, 0.08);
  background: #f8fbf6;
}

.summary-chip-card span {
  color: #6f7c67;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.summary-chip-card strong {
  color: #1d2618;
  font-size: 15px;
  line-height: 1.55;
}

.assistant-log {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.assistant-log-item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(40, 56, 28, 0.08);
}

.assistant-log-item span {
  color: #7b8872;
  font-size: 12px;
  font-weight: 700;
}

.assistant-log-item p {
  margin: 0;
  line-height: 1.65;
  color: #3f4d38;
}

.closure-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 1180px) {
  .workspace-shell {
    width: min(100vw - 28px, 1440px);
    padding-top: 20px;
  }

  .workspace-hero,
  .workspace-layout,
  .composer-grid {
    grid-template-columns: 1fr;
  }

  .workspace-hero {
    flex-direction: column;
  }

  .workspace-hero-actions {
    justify-content: flex-start;
  }

  .workspace-sidebar {
    position: static;
  }
}

@media (max-width: 820px) {
  .workspace-title {
    font-size: 30px;
  }

  .workspace-card {
    padding: 18px;
    border-radius: 22px;
  }

  .contract-switcher-card,
  .timeline-card {
    grid-template-columns: 1fr;
  }

  .timeline-rail {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .timeline-line {
    width: auto;
    height: 2px;
    min-height: 2px;
    flex: 1;
  }

  .timeline-head,
  .activity-top,
  .section-head {
    flex-direction: column;
  }

  .composer-form,
  .composer-metrics,
  .sidebar-stats,
  .closure-grid {
    grid-template-columns: 1fr;
  }

  .workspace-hero-actions,
  .composer-actions,
  .workspace-pills,
  .timeline-meta,
  .timeline-tags,
  .attachment-row,
  .file-list,
  .sidebar-attachments {
    flex-wrap: wrap;
  }
}
</style>

<style scoped>
/* codex visual polish */
.workspace-page .workspace-layout {
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}
.workspace-page .workspace-card {
  border-radius: 28px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.05);
}
.workspace-page .workspace-card--overview {
  border-radius: 32px;
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.08);
}
.workspace-page .summary-chip-card {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fafbf7;
}
.workspace-page .workspace-sidebar .workspace-card {
  background: #fcfcf8;
  box-shadow: none;
  border: 1px solid rgba(17, 24, 39, 0.08);
}
.workspace-page .timeline-card,
.workspace-page .composer-panel--summary,
.workspace-page .composer-panel--form {
  border-radius: 24px;
}
.workspace-page .composer-panel--summary {
  background: #fbfcf8;
}
@media (max-width: 1040px) {
  .workspace-page .workspace-layout {
    grid-template-columns: 1fr;
  }
}
</style>
