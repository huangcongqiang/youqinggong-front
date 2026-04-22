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
                <span>文件与交付物</span>
                <strong>{{ assetItems.length }} 个文件</strong>
                <p>{{ assetItems.length ? '交付文件已汇总到右侧文件区。' : '里程碑推进后，文件和交付物会继续汇总到这里。' }}</p>
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
              <article
                v-for="(node, index) in milestones"
                :key="node.id"
                role="button"
                tabindex="0"
                class="timeline-card"
                :class="{
                  'is-current': node.id === currentNode?.id,
                  'is-complete': node.isCompleted,
                }"
                @click="selectNode(node)"
                @keydown.enter.prevent="selectNode(node)"
                @keydown.space.prevent="selectNode(node)"
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

                  <div class="timeline-footer">
                    <div class="timeline-tags">
                      <span class="workspace-pill">{{ node.stageType || '里程碑' }}</span>
                      <span class="workspace-pill">{{ node.attachments.length ? `${node.attachments.length} 个文件` : '还没有文件' }}</span>
                      <span class="workspace-pill">{{ milestoneStateLabel(node) }}</span>
                    </div>

                    <div class="timeline-actions">
                      <button
                        v-if="hasTalentSubmission(node)"
                        type="button"
                        class="button-secondary button-secondary--small timeline-view-submission-button"
                        @click.stop="openSubmissionDialog(node)"
                      >
                        查看提交
                      </button>
                      <button
                        v-if="canOpenAcceptanceMilestone(node)"
                        type="button"
                        class="button-primary button-primary--small timeline-progress-button"
                        @click.stop="goToAcceptance"
                      >
                        前往验收
                      </button>
                      <button
                        v-if="canUpdateMilestoneProgress(node)"
                        type="button"
                        class="button-primary button-primary--small timeline-progress-button"
                        @click.stop="openProgressDialog(node)"
                      >
                        {{ node.progress ? '更新进展' : '添加进展' }}
                      </button>
                    </div>
                  </div>

                  <p v-if="node.aiReviewSummary" class="timeline-ai">
                    助手摘要：{{ node.aiReviewSummary }}
                  </p>
                </div>
              </article>
            </div>

            <div v-else class="workspace-empty">
              <p>工作开始后，里程碑会出现在这里。</p>
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

            <article v-if="currentTalentSubmission" class="talent-submission-card">
              <div class="talent-submission-card__head">
                <div>
                  <span class="eyebrow">人才提交</span>
                  <h3>本次进展说明</h3>
                </div>
                <span class="workspace-pill">{{ currentTalentSubmission.time }}</span>
              </div>

              <p>{{ currentTalentSubmission.content }}</p>
              <p v-if="currentTalentSubmission.supportNeeded" class="talent-submission-card__support">
                需要支持：{{ currentTalentSubmission.supportNeeded }}
              </p>

              <div v-if="currentTalentSubmission.attachments.length" class="sidebar-attachments">
                <a
                  v-for="attachment in currentTalentSubmission.attachments"
                  :key="`submission-${attachmentLabel(attachment)}`"
                  class="sidebar-attachment"
                  :href="attachmentHref(attachment)"
                  :download="attachmentLabel(attachment)"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ attachmentLabel(attachment) }}
                </a>
              </div>
            </article>

            <article v-else class="talent-submission-card talent-submission-card--empty">
              <span class="eyebrow">人才提交</span>
              <strong>还没有提交内容</strong>
              <p>人才提交进展后，说明、附件和需要协助的事项会显示在这里。</p>
            </article>
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

      <div
        v-if="progressDialogOpen && progressDialogNode && !isEnterprise"
        class="progress-dialog-backdrop"
        @click.self="closeProgressDialog"
      >
        <article class="progress-dialog-card" role="dialog" aria-modal="true" aria-labelledby="progress-dialog-title">
          <div class="section-head">
            <div>
              <span class="eyebrow">里程碑进展</span>
              <h2 id="progress-dialog-title">{{ progressDialogNode.title }}</h2>
              <p class="muted">这条进展会直接挂到当前里程碑下，提交后会同步到当前里程碑和文件区。</p>
            </div>
            <button class="button-secondary button-secondary--small" type="button" @click="closeProgressDialog">关闭</button>
          </div>

          <form class="composer-form progress-dialog-form" @submit.prevent="submitProgressForm">
            <label class="field">
              <span>里程碑名称</span>
              <input v-model.trim="progressForm.stageName" type="text" placeholder="例如：第一轮交付" />
            </label>

            <label class="field">
              <span>当前进度</span>
              <input
                :value="progressDisplayText(progressDialogNode)"
                class="field-input--readonly"
                type="text"
                disabled
                aria-disabled="true"
              />
            </label>

            <label class="field field--select">
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

            <div v-if="progressFiles.length" class="file-list field--full">
              <span v-for="file in progressFiles" :key="file.name" class="file-pill">{{ file.name }}</span>
            </div>

            <div class="composer-actions field--full progress-dialog-actions">
              <button class="button-primary" type="submit" :disabled="submittingProgress">
                {{ submittingProgress ? '保存中…' : '保存进展' }}
              </button>
              <button
                v-if="canCompleteMilestoneProgress(progressDialogNode)"
                class="button-primary button-primary--finish"
                type="button"
                :disabled="submittingProgress"
                @click="submitProgressForm({ completeMilestone: true })"
              >
                {{ submittingProgress ? '推进中…' : '完成并进入下一里程碑' }}
              </button>
              <button class="button-secondary" type="button" @click="closeProgressDialog">取消</button>
            </div>
          </form>
        </article>
      </div>

      <div
        v-if="submissionDialogOpen && submissionDialogNode && submissionDialogData"
        class="progress-dialog-backdrop"
        @click.self="closeSubmissionDialog"
      >
        <article class="progress-dialog-card submission-dialog-card" role="dialog" aria-modal="true" aria-labelledby="submission-dialog-title">
          <div class="section-head">
            <div>
              <span class="eyebrow">人才提交</span>
              <h2 id="submission-dialog-title">{{ submissionDialogNode.title }}</h2>
              <p class="muted">这条内容来自人才对当前里程碑提交的进展说明。</p>
            </div>
            <button class="button-secondary button-secondary--small" type="button" @click="closeSubmissionDialog">关闭</button>
          </div>

          <div class="submission-dialog-body">
            <div class="submission-dialog-meta">
              <span class="workspace-pill">{{ submissionDialogNode.status }}</span>
              <span class="workspace-pill">{{ submissionDialogNode.progress || '等待同步' }}</span>
              <span class="workspace-pill">{{ submissionDialogData.time }}</span>
            </div>

            <article class="talent-submission-card submission-dialog-copy">
              <span class="eyebrow">进展说明</span>
              <p>{{ submissionDialogData.content }}</p>
              <p v-if="submissionDialogData.supportNeeded" class="talent-submission-card__support">
                需要支持：{{ submissionDialogData.supportNeeded }}
              </p>
            </article>

            <article class="submission-dialog-files">
              <div class="section-head section-head--tight">
                <div>
                  <span class="eyebrow">附件</span>
                  <h3>{{ submissionDialogData.attachments.length ? `${submissionDialogData.attachments.length} 个附件` : '没有附件' }}</h3>
                </div>
              </div>

              <div v-if="submissionDialogData.attachments.length" class="sidebar-attachments">
                <a
                  v-for="attachment in submissionDialogData.attachments"
                  :key="`dialog-submission-${attachmentLabel(attachment)}`"
                  class="sidebar-attachment"
                  :href="attachmentHref(attachment)"
                  :download="attachmentLabel(attachment)"
                  target="_blank"
                  rel="noreferrer"
                >
                  {{ attachmentLabel(attachment) }}
                </a>
              </div>
              <p v-else class="muted">这次提交只有文字说明，没有额外附件。</p>
            </article>
          </div>
        </article>
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
const selectedNodeId = ref('')
const progressFiles = ref([])
const showTaskSwitcher = ref(false)
const progressDialogOpen = ref(false)
const progressDialogNodeId = ref('')
const submissionDialogOpen = ref(false)
const submissionDialogNodeId = ref('')

const progressForm = reactive({
  stageName: '',
  completion: '',
  supportNeeded: '',
  progressSummary: '',
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
const milestones = computed(() => normalizeNodes(page.value?.collaborationNodes || page.value?.milestones || []))
const progressFeed = computed(() => normalizeProgressItems(page.value?.progressFeed || []))
const aiReviewHistory = computed(() => normalizeActivityItems(page.value?.aiReviewHistory || []))
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
const progressDialogNode = computed(() => {
  if (!milestones.value.length) return null
  return milestones.value.find((node) => node.id === progressDialogNodeId.value) || currentNode.value
})
const submissionDialogNode = computed(() => {
  if (!milestones.value.length) return null
  return milestones.value.find((node) => node.id === submissionDialogNodeId.value) || currentNode.value
})
const submissionDialogData = computed(() => normalizeTalentSubmission(submissionDialogNode.value))
const currentTalentSubmission = computed(() => normalizeTalentSubmission(currentNode.value))

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
      assistantDraftApplyKey.value = applyKey
      if (token) consumeAssistantDraftHandoff(token)
      clearAssistantDraftQuery()
      return
    }
    if (!progressForm.progressSummary.trim()) {
      progressForm.progressSummary = value
    } else if (!progressForm.progressSummary.includes(value)) {
      progressForm.progressSummary = `${progressForm.progressSummary}\n\n${value}`.trim()
    }
    if (currentNode.value) {
      openProgressDialog(currentNode.value, { preserveDraft: true })
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
      progressDialogOpen.value = false
      progressDialogNodeId.value = ''
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
      progressDialogOpen.value = false
      return
    }
    if (draft && !isEnterprise.value) {
      openProgressDialog(node, { preserveDraft: true })
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
  router.replace({
    path: route.path,
    query: {
      ...contextQuery.value,
      ...(nextNodeId ? { node: nextNodeId } : {}),
    },
  })
}

function openSubmissionDialog(node) {
  if (!hasTalentSubmission(node)) return
  const nextNodeId = String(node?.id || '')
  selectedNodeId.value = nextNodeId
  submissionDialogNodeId.value = nextNodeId
  submissionDialogOpen.value = true
  router.replace({
    path: route.path,
    query: {
      ...contextQuery.value,
      ...(nextNodeId ? { node: nextNodeId } : {}),
    },
  })
}

function resetProgressForm({ keepSummary = false } = {}) {
  progressForm.stageName = ''
  progressForm.completion = ''
  progressForm.supportNeeded = ''
  if (!keepSummary) {
    progressForm.progressSummary = ''
  }
  progressFiles.value = []
}

function openProgressDialog(node, options = {}) {
  if (!canUpdateMilestoneProgress(node)) return
  const nextNodeId = String(node.id || '')
  selectedNodeId.value = nextNodeId
  progressDialogNodeId.value = nextNodeId
  if (!options.preserveDraft) {
    resetProgressForm()
  }
  progressForm.stageName = node.title || ''
  progressForm.completion = progressDisplayText(node)
  progressDialogOpen.value = true
}

function milestoneStateLabel(node) {
  if (node?.isCompleted || isCompletedStatus(node?.status)) return '已完成'
  if (node?.isCurrent || isActiveStatus(node?.status)) return '进行中'
  return '待开始'
}

function canUpdateMilestoneProgress(node) {
  if (isEnterprise.value || !node) return false
  if (isAcceptanceMilestoneNode(node)) return false
  if (node.isCompleted || isCompletedStatus(node.status)) return true
  if (isNotStartedStatus(node.status)) return false
  return Boolean(node.isCurrent || isActiveStatus(node.status))
}

function canCompleteMilestoneProgress(node) {
  if (isEnterprise.value || !node) return false
  if (isAcceptanceMilestoneNode(node)) return false
  if (node.isCompleted || isCompletedStatus(node.status) || isCompletedStatus(node.progress)) return false
  if (isNotStartedStatus(node.status)) return false
  return Boolean(node.isCurrent || isActiveStatus(node.status) || isActiveStatus(node.progress))
}

function isAcceptanceMilestoneNode(node) {
  const text = [
    node?.title,
    node?.stageType,
    node?.status,
    node?.progress,
  ].map((item) => String(item || '')).join(' ')
  return /验收|评级|评价|acceptance|rating|grade/i.test(text)
}

function canOpenAcceptanceMilestone(node) {
  return Boolean(isAcceptanceMilestoneNode(node) && acceptanceRoute.value && !hasCompletedAcceptanceRating())
}

function hasCompletedAcceptanceRating() {
  const grade = String(closure.value?.earlyCompletion?.grade || summary.value?.deliveryGrade || '').trim()
  const payoutRatio = String(closure.value?.earlyCompletion?.payoutRatio || summary.value?.deliveryPayoutRatio || '').trim()
  const statusText = [
    closure.value?.earlyCompletion?.status,
    summary.value?.status,
  ].map((item) => String(item || '')).join(' ')
  return Boolean(grade && payoutRatio) || /已完成评级|待双方评分|评分已归档|已提前完成/i.test(statusText)
}

function hasTalentSubmission(node) {
  return Boolean(normalizeTalentSubmission(node))
}

function normalizeTalentSubmission(node) {
  if (!node) return null
  const submission = node.talentSubmission && typeof node.talentSubmission === 'object' ? node.talentSubmission : {}
  const content = String(submission.content || submission.summary || node.submissionText || '').trim()
  const supportNeeded = String(node.supportNeeded || submission.supportNeeded || '').trim()
  const attachments = Array.isArray(node.attachments) ? node.attachments : []
  if (!content && !supportNeeded && !attachments.length) return null
  return {
    content: content || '人才已提交进展，详情请查看附件或当前里程碑。',
    supportNeeded,
    attachments,
    time: String(submission.time || node.updatedAt || '刚刚更新').trim() || '刚刚更新',
  }
}

function isActiveStatus(value) {
  return /进行中|执行中|协作中|推进中|当前|active|in progress/i.test(String(value || ''))
}

function isCompletedStatus(value) {
  const text = String(value || '')
  if (/未完成|待完成/.test(text)) return false
  return /已完成|完成$|完成[，。,.]|已交付|completed|done/i.test(text)
}

function isNotStartedStatus(value) {
  return /待开始|未开始|排期待确认|等待同步|待同步|待处理|待确认|not started|pending|upcoming|todo/i.test(String(value || ''))
}

function progressDisplayText(node) {
  if (!node) return '等待同步'
  return node.progress || node.completion || node.completionPercent || milestoneStateLabel(node)
}

function milestoneSubmissionId(node) {
  return node?.milestoneId || extractMilestoneId(node?.nodeId || node?.id) || null
}

function extractMilestoneId(value) {
  const text = String(value || '').trim()
  if (!text) return ''
  const prefixed = text.match(/^milestone-(\d+)$/i)
  if (prefixed) return prefixed[1]
  if (/^\d+$/.test(text) && text !== '0') return text
  return ''
}

function closeProgressDialog() {
  progressDialogOpen.value = false
  progressDialogNodeId.value = ''
  resetProgressForm()
}

function closeSubmissionDialog() {
  submissionDialogOpen.value = false
  submissionDialogNodeId.value = ''
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

async function submitProgressForm(options = {}) {
  if (!currentTaskId.value) {
    actionError.value = '先选一份合同。'
    return
  }

  const targetNode = progressDialogNode.value || currentNode.value
  const shouldCompleteMilestone = options?.completeMilestone === true
  const percent = shouldCompleteMilestone ? 100 : resolveProgressSubmissionPercent(targetNode)
  if (percent === null) {
    actionError.value = '当前进度暂时没有同步，请刷新后再提交。'
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

    const result = await submitTaskProgress(currentTaskId.value, {
      stage: progressForm.stageName.trim() || targetNode?.title || '',
      milestoneId: milestoneSubmissionId(targetNode),
      progressText: progressForm.progressSummary.trim(),
      supportNeeded: progressForm.supportNeeded,
      completionPercent: percent,
      files: uploadedFiles.map(progressFileReference).filter(Boolean),
      attachmentFiles: uploadedFiles,
    })
    if (isAcceptanceHandoffResult(result)) {
      resetProgressForm()
      progressDialogOpen.value = false
      progressDialogNodeId.value = ''
      await loadWorkspace()
      goToAcceptance()
      return
    }
    ensureProgressSubmitted(result)

    resetProgressForm()
    progressDialogOpen.value = false
    progressDialogNodeId.value = ''
    await loadWorkspace()
  } catch (error) {
    actionError.value = error?.message || '当前暂时无法提交这条进展。'
  } finally {
    submittingProgress.value = false
  }
}

function progressFileReference(file) {
  return String(file?.url || file?.downloadUrl || file?.downloadHref || file?.href || file?.name || '').trim()
}

function ensureProgressSubmitted(result) {
  const failed = Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED' || result?.actionBlocked)
  if (!failed) return
  throw new Error(
    result?.requestError
    || result?.actionMessage
    || result?.message
    || result?.nextStep
    || '当前暂时无法提交这条进展。'
  )
}

function isAcceptanceHandoffResult(result) {
  const message = String(result?.actionMessage || result?.requestError || result?.nextStep || result?.message || '')
  return Boolean(
    result?.actionBlocked
      && /验收|评级|评价|acceptance|rating|grade/i.test(message)
      && /前往|继续处理|已进入|已切换|节点/i.test(message)
  )
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

function resolveProgressSubmissionPercent(node) {
  const fromForm = normalizePercent(progressForm.completion)
  if (fromForm !== null) return fromForm
  const fromNode = normalizePercent(node?.completionPercent || node?.completion || node?.progress)
  if (fromNode !== null) return fromNode
  if (node?.isCompleted || isCompletedStatus(node?.status) || isCompletedStatus(node?.progress)) return 100
  if (node?.isCurrent || isActiveStatus(node?.status) || isActiveStatus(node?.progress)) return 50
  return null
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
    milestones: normalizeNodes(source.collaborationNodes || source.milestones || []),
    collaborationNodes: normalizeNodes(source.collaborationNodes || source.milestones || []),
    progressFeed: normalizeProgressItems(source.progressFeed || []),
    assetLibrary: normalizeAssetItems(source.assetLibrary || []),
    aiReviewHistory: normalizeActivityItems(source.aiReviewHistory || []),
    executionChecklist: asArray(source.executionChecklist),
    supportOptions: asArray(source.supportOptions).map((item) => String(item).trim()).filter(Boolean),
    earlyCompletion: source.earlyCompletion && typeof source.earlyCompletion === 'object' ? source.earlyCompletion : {},
    cancellationRequest: source.cancellationRequest && typeof source.cancellationRequest === 'object' ? source.cancellationRequest : {},
    acceptance: source.acceptance && typeof source.acceptance === 'object' ? source.acceptance : {},
    claimSummary: source.claimSummary && typeof source.claimSummary === 'object' ? source.claimSummary : {},
    invoiceSummary: source.invoiceSummary && typeof source.invoiceSummary === 'object' ? source.invoiceSummary : {},
    reconciliationSummary: source.reconciliationSummary && typeof source.reconciliationSummary === 'object' ? source.reconciliationSummary : {},
    settlementSummary: source.settlementSummary && typeof source.settlementSummary === 'object' ? source.settlementSummary : {},
    disputeSummary: source.disputeSummary && typeof source.disputeSummary === 'object' ? source.disputeSummary : {},
    celebrationBanner: source.celebrationBanner && typeof source.celebrationBanner === 'object' ? source.celebrationBanner : {},
  }
}

function mergeClosureIntoWorkspace(workspace, closureData) {
  if (!closureData || typeof closureData !== 'object') return workspace
  return {
    ...workspace,
    acceptance: closureData.acceptance || workspace.acceptance,
    earlyCompletion: closureData.earlyCompletion || workspace.earlyCompletion,
    claimSummary: closureData.claimSummary || workspace.claimSummary,
    invoiceSummary: closureData.invoiceSummary || workspace.invoiceSummary,
    reconciliationSummary: closureData.reconciliationSummary || workspace.reconciliationSummary,
    settlementSummary: closureData.settlementSummary || workspace.settlementSummary,
    disputeSummary: closureData.disputeSummary || workspace.disputeSummary,
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
    executionChecklist: [],
    supportOptions: [],
    earlyCompletion: {},
    cancellationRequest: {},
    acceptance: {},
    claimSummary: {},
    invoiceSummary: {},
    reconciliationSummary: {},
    settlementSummary: {},
    disputeSummary: {},
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
    const completed = Boolean(item?.isCompleted || item?.done || isCompletedStatus(statusText))
    const current = Boolean(item?.isCurrent || item?.current || isActiveStatus(statusText))
    const rawNodeId = String(item?.nodeId || item?.id || item?.milestoneId || item?.key || index)
    const rawMilestoneId = item?.milestoneId || extractMilestoneId(rawNodeId)
    return {
      id: rawNodeId,
      nodeId: rawNodeId,
      milestoneId: rawMilestoneId,
      title: item?.title || item?.name || item?.label || `里程碑 ${index + 1}`,
      summary: item?.updateSummary || item?.summary || item?.description || item?.note || item?.progressText || '',
      status: statusText,
      progress: item?.progress || item?.completion || item?.completionPercent || item?.status || '',
      workdayLabel: item?.workdayLabel || item?.workday || '',
      plannedDate: item?.plannedDate || item?.dueDate || item?.deadline || '',
      stageType: item?.stageType || item?.type || item?.kind || '里程碑',
      updatedAt: item?.updatedAt || item?.time || item?.submittedAt || '',
      expectedDeliverables: item?.expectedDeliverables || item?.deliverables || item?.deliverable || '',
      aiReviewSummary: item?.aiReview?.summary || item?.aiReviewSummary || item?.reviewSummary || '',
      supportNeeded: item?.supportNeeded || item?.talentSubmission?.supportNeeded || '',
      submissionText: item?.talentSubmission?.content || item?.progressText || '',
      talentSubmission: item?.talentSubmission && typeof item.talentSubmission === 'object' ? item.talentSubmission : {},
      attachments: normalizeAttachmentList(item?.attachmentFiles || item?.talentSubmission?.attachmentFiles || item?.attachments || item?.files),
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
    attachments: normalizeAttachmentList(item?.attachmentFiles || item?.attachments || item?.files),
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
  padding-bottom: 40px;
}

.workspace-shell {
  width: min(1440px, calc(100vw - 48px));
  margin: 0 auto;
}

.workspace-tabs {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 22px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #ffffff;
}

.workspace-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid rgba(18, 18, 18, 0.12);
  background: #fff;
  color: #111111;
  font-weight: 600;
}

.workspace-tab.is-active {
  border-color: rgba(16, 138, 0, 0.22);
  background: #f3fff0;
  color: #165a0f;
}

.workspace-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  border-radius: 28px;
  padding: 28px 30px;
  background: #fffef8;
  box-shadow: 0 16px 34px rgba(18, 18, 18, 0.05);
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
  font-size: 13px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #108a00;
  font-weight: 700;
}

.workspace-title {
  margin: 0;
  font-size: clamp(30px, 3.8vw, 52px);
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: #111111;
}

.workspace-lead {
  margin: 0;
  color: #66665f;
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
  border: 1px solid rgba(18, 18, 18, 0.12);
  background: #ffffff;
  color: #111111;
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
  border: 1px solid rgba(18, 18, 18, 0.08);
  border-radius: 26px;
  background: #fffef8;
  box-shadow: 0 16px 34px rgba(18, 18, 18, 0.05);
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
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #ffffff;
  cursor: pointer;
}

.contract-switcher-card.is-active {
  border-color: rgba(16, 138, 0, 0.2);
  background: #f3fff0;
  box-shadow: 0 16px 32px rgba(16, 138, 0, 0.05);
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
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #ffffff;
  text-align: left;
  cursor: pointer;
}

.timeline-card.is-current {
  border-color: rgba(16, 138, 0, 0.2);
  box-shadow: 0 16px 32px rgba(16, 138, 0, 0.05);
}

.timeline-card:focus-visible {
  outline: 3px solid rgba(16, 138, 0, 0.18);
  outline-offset: 3px;
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
  background: #f3fff0;
  color: #165a0f;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 52px;
  border-radius: 999px;
  background: rgba(16, 138, 0, 0.1);
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
.workspace-card h2 {
  margin: 0;
}

.timeline-head p,
.sidebar-lead,
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
.sidebar-lead,
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

.timeline-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.timeline-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.timeline-progress-button,
.timeline-view-submission-button,
.button-primary--small {
  min-height: 38px;
  padding: 0 16px;
  font-size: 13px;
  white-space: nowrap;
}

.sidebar-stats article,
.closure-grid article {
  display: grid;
  gap: 4px;
  padding: 14px 15px;
  border-radius: 18px;
  background: #fff;
  border: 1px solid rgba(18, 18, 18, 0.08);
}

.sidebar-stats span,
.closure-grid span {
  color: #66665f;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sidebar-stats strong,
.closure-grid strong {
  color: #111111;
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
  border: 1px solid rgba(18, 18, 18, 0.12);
  background: #fff;
  color: #111111;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

.talent-submission-card {
  display: grid;
  gap: 12px;
  margin-top: 18px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(16, 138, 0, 0.14);
  background: linear-gradient(180deg, #ffffff 0%, #fbfff7 100%);
}

.talent-submission-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.talent-submission-card h3,
.talent-submission-card p {
  margin: 0;
}

.talent-submission-card h3 {
  margin-top: 4px;
  font-size: 18px;
  color: #111111;
}

.talent-submission-card p {
  color: #576453;
  line-height: 1.72;
}

.talent-submission-card__support {
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(16, 138, 0, 0.12);
  background: #f3fff0;
  color: #165a0f !important;
  font-weight: 700;
}

.talent-submission-card--empty {
  border-color: rgba(18, 18, 18, 0.08);
  background: #ffffff;
}

.talent-submission-card--empty strong {
  color: #111111;
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
  border: 1px solid rgba(18, 18, 18, 0.16);
  border-radius: 16px;
  background: #fff;
  color: #111111;
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
  border-color: rgba(16, 138, 0, 0.62);
  box-shadow: 0 0 0 4px rgba(16, 138, 0, 0.08);
}

.field-input--readonly:disabled {
  border-color: rgba(18, 18, 18, 0.08);
  background: #f5f6f2;
  color: #80887a;
  cursor: not-allowed;
  -webkit-text-fill-color: #80887a;
}

.field--select {
  position: relative;
}

.field--select select {
  appearance: none;
  padding-right: 46px;
  border-color: rgba(16, 138, 0, 0.18);
  background: linear-gradient(180deg, #ffffff 0%, #fffef8 100%);
  color: #27321f;
  font-weight: 600;
}

.field--select::after {
  content: "";
  position: absolute;
  right: 18px;
  top: 45px;
  width: 9px;
  height: 9px;
  border-right: 2px solid #108a00;
  border-bottom: 2px solid #108a00;
  transform: rotate(45deg);
  pointer-events: none;
}

.composer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.progress-dialog-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(17, 24, 39, 0.34);
  backdrop-filter: blur(10px);
}

.progress-dialog-card {
  width: min(760px, 100%);
  max-height: min(86vh, 760px);
  overflow: auto;
  display: grid;
  gap: 22px;
  padding: 28px;
  border-radius: 28px;
  border: 1px solid rgba(18, 18, 18, 0.1);
  background: #fffef8;
  box-shadow: 0 30px 90px rgba(17, 24, 39, 0.2);
}

.progress-dialog-form {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.progress-dialog-actions {
  justify-content: flex-end;
}

.button-primary--finish {
  background: linear-gradient(135deg, #174b13 0%, #108a00 100%);
}

.submission-dialog-card {
  width: min(680px, 100%);
}

.submission-dialog-body {
  display: grid;
  gap: 18px;
}

.submission-dialog-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.submission-dialog-copy {
  margin-top: 0;
}

.submission-dialog-files {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #ffffff;
}

.submission-dialog-files h3 {
  margin: 4px 0 0;
  font-size: 18px;
}

.section-head__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.workspace-sidebar {
  gap: 18px;
}

.workspace-card--assistant {
  background: #fbfbf8;
  border-color: rgba(18, 18, 18, 0.08);
}

.workspace-card--assistant .sidebar-lead {
  color: #66665f;
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
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #fff;
}

.summary-chip-card span {
  color: #66665f;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.summary-chip-card strong {
  color: #111111;
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
  border: 1px solid rgba(18, 18, 18, 0.08);
}

.assistant-log-item span {
  color: #66665f;
  font-size: 12px;
  font-weight: 700;
}

.assistant-log-item p {
  margin: 0;
  line-height: 1.65;
  color: #111111;
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
  .workspace-layout {
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
  .section-head {
    flex-direction: column;
  }

  .composer-form,
  .sidebar-stats,
  .closure-grid {
    grid-template-columns: 1fr;
  }

  .workspace-hero-actions,
  .composer-actions,
  .workspace-pills,
  .timeline-meta,
  .timeline-tags,
  .timeline-footer,
  .timeline-actions,
  .attachment-row,
  .file-list,
  .sidebar-attachments {
    flex-wrap: wrap;
  }

  .progress-dialog-backdrop {
    align-items: end;
    padding: 16px;
  }

  .progress-dialog-card,
  .progress-dialog-form {
    grid-template-columns: 1fr;
  }

  .talent-submission-card__head {
    flex-direction: column;
  }
}
</style>
