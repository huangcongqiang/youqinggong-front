<template>
  <section class="task-apply-page stack-xl">
    <ActionErrorDialog :message="errorMessage || loadError" title="申请页暂时不可用" eyebrow="申请" />

    <section class="apply-hero panel stack-lg">
      <div class="apply-hero__topline">
        <div class="stack-sm">
          <span class="eyebrow">申请</span>
          <h1>{{ job?.title || '申请' }}</h1>
          <p class="muted">{{ job?.company || '企业信息暂未公开' }}</p>
        </div>
        <div class="toolbar">
          <router-link class="button-secondary" :to="detailLocation">返回任务</router-link>
          <router-link class="button-secondary" :to="browseLocation">返回任务列表</router-link>
        </div>
      </div>
      <div v-if="job" class="mini-chip-row">
        <span class="mini-chip">{{ proposalStageLabel }}</span>
        <span class="mini-chip">{{ proposalState.nextStep }}</span>
        <span class="mini-chip">完成度 {{ proposalState.progressPercent }}%</span>
      </div>
    </section>

    <article v-if="loading" class="panel stack-sm">
      <strong>正在加载申请页</strong>
      <p class="muted">我们正在同步任务详情和这条任务的本地申请草稿。</p>
    </article>

    <article v-else-if="loadError" class="panel stack-sm">
      <strong>申请页加载失败</strong>
      <p class="muted">{{ loadError }}</p>
    </article>

    <article v-else-if="!job" class="panel stack-sm">
      <strong>这条任务暂时不可用</strong>
      <p class="muted">请返回任务列表，查看其它合适的任务。</p>
      <div class="toolbar">
        <router-link class="button-secondary" :to="browseLocation">返回任务列表</router-link>
      </div>
    </article>

    <section v-else class="apply-layout">
      <main class="stack-lg">
        <article class="panel stack-sm">
          <div class="section-header">
            <div>
              <span class="eyebrow">任务</span>
              <h2>先看关键任务信息</h2>
            </div>
            <span class="soft-pill">{{ job.match }}</span>
          </div>
          <p class="muted">{{ job.summary }}</p>
          <div class="mini-chip-row">
            <span class="mini-chip">{{ job.budget }}</span>
            <span class="mini-chip">{{ job.period }}</span>
            <span class="mini-chip">{{ job.jobType || '合作类型' }}</span>
          </div>
        </article>

        <article v-if="proposalState.readOnly" class="panel stack-md">
          <div class="section-header">
            <div>
              <span class="eyebrow">申请状态</span>
              <h2>{{ proposalStageLabel }}</h2>
            </div>
          </div>
          <p class="muted">{{ proposalStageHint }}</p>
          <div class="toolbar">
            <button v-if="proposalState.primaryAction === 'messages'" type="button" class="button-primary" @click="openMessages">查看面试邀约</button>
            <button v-else-if="proposalState.primaryAction === 'contract'" type="button" class="button-primary" @click="openContract">查看申请进度</button>
            <router-link v-else class="button-secondary" :to="detailLocation">返回任务</router-link>
          </div>
        </article>

        <article v-else class="panel stack-lg">
          <div class="section-header">
            <div>
              <span class="eyebrow">申请</span>
              <h2>完成当前申请</h2>
            </div>
            <span class="soft-pill">{{ proposalStageHint }}</span>
          </div>

          <form class="proposal-form" @submit.prevent="handlePrimaryAction">
            <label class="field field--full">
              <span>申请说明</span>
              <textarea v-model.trim="proposalDraft.coverLetter" rows="5" placeholder="写几句说明你为什么适合这条任务、准备怎么推进，以及最早什么时候可以开始。" />
            </label>

            <div class="proposal-form__two-up">
              <label class="field">
                <span>报价或费率</span>
                <input v-model.trim="proposalDraft.proposedRate" type="text" placeholder="例如：￥300 / 天，或固定总价 ￥3000" />
              </label>
              <label class="field">
                <span>可用时间</span>
                <input v-model.trim="proposalDraft.availability" type="text" placeholder="例如：本周可投入 20 小时" />
              </label>
            </div>

            <div class="proposal-form__two-up">
              <label class="field">
                <span>开始时间</span>
                <input v-model.trim="proposalDraft.startDate" type="text" placeholder="例如：可立即开始 / 下周一开始" />
              </label>
              <label class="field">
                <span>作品或案例</span>
                <input v-model.trim="proposalDraft.proof" type="text" placeholder="例如：最近类似作品、作品集链接或相关案例" />
              </label>
            </div>

            <label class="field field--full">
              <span>补充说明</span>
              <textarea v-model.trim="proposalDraft.notes" rows="3" placeholder="补充你对需求的理解、风险提醒，以及想先确认的点。" />
            </label>

            <div class="stack-md">
              <div class="section-header">
                <div>
                  <span class="eyebrow">筛选问题</span>
                  <h3>直接回答企业提出的问题</h3>
                </div>
                <span class="soft-pill">已回答 {{ answeredQuestionsCount }} / {{ selectedQuestions.length }}</span>
              </div>

              <div v-if="selectedQuestions.length" class="question-list">
                <label v-for="question in selectedQuestions" :key="question" class="field field--full question-form-card">
                  <span>{{ question }}</span>
                  <textarea v-model.trim="proposalDraft.responses[question]" rows="3" placeholder="直接回答，尽量具体、简洁，并给出可验证的信息。" />
                </label>
              </div>
              <p v-else class="muted">这条任务暂时还没有筛选问题。</p>
            </div>

            <div class="toolbar">
              <button class="button-primary" type="submit" :disabled="requesting || proposalState.primaryDisabled">
                {{ requesting ? '正在提交申请...' : proposalState.primaryActionLabel }}
              </button>
            </div>
          </form>
        </article>
      </main>

      <aside class="stack-lg">
        <article class="panel stack-md">
            <div class="section-header">
            <div>
              <span class="eyebrow">申请摘要</span>
              <h2>当前申请内容与状态</h2>
            </div>
            <span class="soft-pill">{{ proposalStageLabel }}</span>
          </div>
          <article class="mini-card stack-sm">
            <strong>{{ applicationDraftTitle }}</strong>
            <p class="muted">{{ applicationDraftLead }}</p>
            <div class="mini-chip-row">
              <span class="mini-chip">{{ proposalStageLabel }}</span>
            </div>
            <div v-if="applicationDraftMeta.length" class="mini-chip-row">
              <span v-for="item in applicationDraftMeta" :key="item" class="mini-chip">{{ item }}</span>
            </div>
            <div v-if="selectedQuestions.length" class="mini-chip-row">
              <span class="mini-chip">已回答 {{ answeredQuestionsCount }} / {{ selectedQuestions.length }}</span>
            </div>
          </article>
        </article>

        <article class="panel stack-md">
          <div class="section-header">
            <div>
              <span class="eyebrow">申请准备度</span>
              <h2>随时确认当前申请完成度</h2>
            </div>
            <span class="soft-pill">完成度 {{ proposalState.progressPercent }}%</span>
          </div>
          <div class="proposal-checklist">
            <div v-for="item in proposalState.checklist" :key="item.label" class="proposal-checklist__item" :class="{ 'is-ready': item.checked }">
              <span class="proposal-checklist__mark">{{ item.checked ? '✓' : '•' }}</span>
              <div>
                <strong>{{ item.label }}</strong>
                <p>{{ item.note }}</p>
              </div>
            </div>
          </div>
        </article>

        <article class="panel stack-md">
          <div class="section-header">
            <div>
              <span class="eyebrow">企业上下文</span>
              <h2>先把企业信号看完整</h2>
            </div>
          </div>
          <div v-if="selectedSignals.length" class="signal-list">
            <article v-for="signal in selectedSignals" :key="`${signal.title}-${signal.note}`" class="signal-card stack-sm">
              <strong>{{ signal.title }}</strong>
              <p class="muted">{{ signal.note }}</p>
            </article>
          </div>
          <p v-else class="muted">这条任务暂时还没有同步企业信号。</p>
        </article>
      </aside>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import { getTaskMarketplaceData, requestTaskCollaboration } from '../services/api'
import { roleRouteMap } from '../utils/roleRoutes'
import {
  buildProposalDraftSnapshot,
  buildTaskBrowseLocation,
  buildTaskDetailLocation,
  createEmptyMarketplace,
  createEmptyProposalDraft,
  deriveProposalState,
  normalizeJobItem,
  normalizeMarketplace,
  persistProposalDraft,
  readStoredProposalDraft,
} from './taskMarketSurfaceState.js'

const route = useRoute()
const router = useRouter()
const page = ref(createEmptyMarketplace())
const loadError = ref('')
const errorMessage = ref('')
const loading = ref(false)
const requesting = ref(false)
const draftSavedAt = ref('')
const proposalDraft = reactive(createEmptyProposalDraft())
const proposalSubmittedAt = ref('')
const proposalSubmittedRoomKey = ref('')
const taskId = computed(() => String(route.params.taskId || '').trim())

const normalizedItems = computed(() => {
  const items = Array.isArray(page.value?.items) ? page.value.items : []
  return items.map((item, index) => normalizeJobItem(item, index))
})
const job = computed(() => normalizedItems.value.find((item) => String(item.taskId || item.id) === taskId.value) || null)
const selectedQuestions = computed(() => job.value?.questions || [])
const selectedSignals = computed(() => job.value?.signals || [])
const answeredQuestionsCount = computed(() => selectedQuestions.value.filter((question) => String(proposalDraft.responses?.[question] || '').trim()).length)
const proposalState = computed(() => deriveProposalState({
  job: job.value,
  draft: proposalDraft,
  selectedQuestions: selectedQuestions.value,
  selectedSignals: selectedSignals.value,
  submittedAt: proposalSubmittedAt.value,
  submittedRoomKey: proposalSubmittedRoomKey.value,
}))
const proposalStageLabel = computed(() => {
  if (!proposalState.value.readOnly) {
    return '申请阶段'
  }
  if (proposalState.value.primaryAction === 'messages') {
    return '面试阶段'
  }
  if (proposalState.value.primaryAction === 'contract') {
    return '执行中'
  }
  return proposalState.value.stateLabel || '申请状态'
})
const proposalStageHint = computed(() => {
  if (!proposalState.value.readOnly) {
    return proposalState.value.submitHint
  }
  if (proposalState.value.primaryAction === 'messages') {
    return '申请已提交，企业已经发来面试邀约。'
  }
  if (proposalState.value.primaryAction === 'contract') {
    return '当前合作已经进入执行中，后续会继续保留进度、验收和消息。'
  }
  return proposalState.value.submitHint || '申请已提交，等待企业处理。'
})
const applicationDraftMeta = computed(() => [
  String(proposalDraft.proposedRate || '').trim(),
  String(proposalDraft.availability || '').trim(),
  String(proposalDraft.startDate || '').trim()
].filter(Boolean))
const applicationDraftTitle = computed(() => {
  if (proposalState.value.readOnly) return proposalStageLabel.value
  if (!proposalState.value.primaryDisabled) return '可以提交申请'
  if (String(proposalDraft.proposedRate || '').trim()) return String(proposalDraft.proposedRate || '').trim()
  if (String(proposalDraft.availability || '').trim()) return String(proposalDraft.availability || '').trim()
  return '还需要补报价和时间安排'
})
const applicationDraftLead = computed(() => {
  if (proposalState.value.readOnly) {
    return proposalStageHint.value || '这条申请已经进入下一步流程。'
  }
  if (!proposalState.value.primaryDisabled) {
    return '当前报价、时间安排和筛选问题都已经准备好，可以直接提交。'
  }
  const hasRate = Boolean(String(proposalDraft.proposedRate || '').trim())
  const hasAvailability = Boolean(String(proposalDraft.availability || '').trim())
  const hasStartDate = Boolean(String(proposalDraft.startDate || '').trim())

  if (hasRate && (hasAvailability || hasStartDate)) {
    return '这条申请的报价和时间安排已经基本齐了。'
  }
  if (hasRate || hasAvailability || hasStartDate) {
    return '提交前再把报价、可用时间和开始时间对齐一下。'
  }
  return '先补上报价、可用时间和开始时间，再继续提交。'
})

const browseLocation = computed(() => buildTaskBrowseLocation(route.query, { taskId: taskId.value }))
const detailLocation = computed(() => buildTaskDetailLocation(taskId.value, route.query))

watch(
  taskId,
  (nextTaskId) => {
    const saved = readStoredProposalDraft(nextTaskId)
    proposalDraft.coverLetter = saved.coverLetter
    proposalDraft.proposedRate = saved.proposedRate
    proposalDraft.availability = saved.availability
    proposalDraft.startDate = saved.startDate
    proposalDraft.proof = saved.proof
    proposalDraft.notes = saved.notes
    proposalDraft.responses = { ...saved.responses }
    proposalSubmittedAt.value = saved.submittedAt
    proposalSubmittedRoomKey.value = saved.submittedRoomKey
    draftSavedAt.value = saved.savedAt
  },
  { immediate: true }
)

watch(
  proposalDraft,
  () => {
    if (!taskId.value || loading.value) return
    draftSavedAt.value = persistProposalDraft(taskId.value, buildProposalDraftSnapshot(proposalDraft, selectedQuestions.value), {
      submittedAt: proposalSubmittedAt.value,
      submittedRoomKey: proposalSubmittedRoomKey.value,
    })
  },
  { deep: true }
)

onMounted(loadMarketplace)

async function loadMarketplace() {
  loading.value = true
  loadError.value = ''
  errorMessage.value = ''
  try {
    const payload = await getTaskMarketplaceData()
    page.value = normalizeMarketplace(payload)
  } catch (error) {
    loadError.value = error?.message || '申请页加载失败'
    page.value = createEmptyMarketplace()
  } finally {
    loading.value = false
  }
}

function openMessages() {
  const roomKey = proposalState.value.serverProposalRoomKey || proposalSubmittedRoomKey.value
  if (!roomKey || !job.value?.taskId) return
  router.push(roleRouteMap.talent.messageRoom(roomKey, {
    taskId: job.value.taskId,
    roomKey,
    source: 'application',
    surface: 'application',
    originSource: 'task-apply',
    originTaskId: job.value.taskId,
  }))
}

function openContract() {
  if (!job.value?.taskId) return
  router.push({
    path: roleRouteMap.talent.workspace,
    query: {
      taskId: job.value.taskId,
      source: 'contract',
      surface: 'contract',
      originSource: 'task-apply',
      originTaskId: job.value.taskId,
    },
  })
}

async function handlePrimaryAction() {
  if (!job.value?.taskId || proposalState.value.primaryDisabled) return
  if (proposalState.value.primaryAction === 'messages') {
    openMessages()
    return
  }
  if (proposalState.value.primaryAction === 'contract') {
    openContract()
    return
  }
  await submitProposal()
}

async function submitProposal() {
  if (!job.value?.taskId) return
  if (!proposalDraft.coverLetter.trim()) {
    errorMessage.value = '先补一段申请说明，再提交申请。'
    return
  }
  if (!proposalDraft.proposedRate.trim()) {
    errorMessage.value = '先补报价或费率，再提交申请。'
    return
  }
  if (selectedQuestions.value.length && answeredQuestionsCount.value !== selectedQuestions.value.length) {
    errorMessage.value = '先回答筛选问题，再提交申请。'
    return
  }

  requesting.value = true
  errorMessage.value = ''
  try {
    draftSavedAt.value = persistProposalDraft(taskId.value, buildProposalDraftSnapshot(proposalDraft, selectedQuestions.value))
    const payload = await requestTaskCollaboration(job.value.taskId, {
      coverLetter: proposalDraft.coverLetter.trim(),
      proposedRate: proposalDraft.proposedRate.trim(),
      availability: proposalDraft.availability.trim(),
      startDate: proposalDraft.startDate.trim(),
      proof: proposalDraft.proof.trim(),
      notes: proposalDraft.notes.trim(),
      responses: { ...proposalDraft.responses },
      source: 'proposal_draft',
    })
    if (payload?.requestError || payload?.applicationStatus === 'FAILED' || payload?.success === false) {
      errorMessage.value = payload?.requestError || payload?.nextStep || '当前暂时无法提交申请。'
      return
    }

    const roomKey = String(payload?.roomKey || payload?.room?.roomKey || '')
    const submissionStatus = String(payload?.applicationStatus || payload?.status || '').trim().toUpperCase()
    proposalSubmittedAt.value = new Date().toISOString()
    proposalSubmittedRoomKey.value = roomKey
    draftSavedAt.value = persistProposalDraft(taskId.value, buildProposalDraftSnapshot(proposalDraft, selectedQuestions.value), {
      submittedAt: proposalSubmittedAt.value,
      submittedRoomKey: proposalSubmittedRoomKey.value,
    })

    if (roomKey) {
      openMessages()
      return
    }
    if (payload?.nextRoute) {
      router.push(payload.nextRoute)
      return
    }
    if (['REQUESTED', 'SUBMITTED', 'PENDING'].includes(submissionStatus)) {
      return
    }
    router.push({
      path: roleRouteMap.talent.messages,
      query: {
        taskId: job.value.taskId,
        source: 'application',
        surface: 'application',
        originSource: 'task-apply',
        originTaskId: job.value.taskId,
      },
    })
  } catch (error) {
    errorMessage.value = error?.message || '当前暂时无法提交申请。'
  } finally {
    requesting.value = false
  }
}
</script>

<style scoped>
.task-apply-page,.stack-xl,.stack-lg,.stack-md,.stack-sm{display:grid}.stack-xl{gap:24px}.stack-lg{gap:20px}.stack-md{gap:16px}.stack-sm{gap:10px}
.panel,.signal-card,.question-form-card,.proposal-preview-card{padding:20px;border-radius:24px;border:1px solid rgba(18,18,18,.08);background:#fff;box-shadow:0 18px 48px rgba(39,55,27,.06)}
.apply-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:24px;align-items:start}.apply-hero__topline,.section-header,.toolbar{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.toolbar{flex-wrap:wrap}.eyebrow{color:#66715f;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.muted{margin:0;color:#5c5c56;line-height:1.65}.button-primary,.button-secondary,.mini-chip,.soft-pill{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 14px;border-radius:999px;border:1px solid rgba(18,18,18,.1);background:#fff;color:#111827;text-decoration:none;font-weight:600;font:inherit}.button-primary{background:#108a00;border-color:#108a00;color:#fff}.mini-chip,.soft-pill{background:#f7f8f4}.proposal-form,.proposal-form__two-up,.question-list,.proposal-checklist,.signal-list{display:grid;gap:14px}.proposal-form__two-up{grid-template-columns:repeat(2,minmax(0,1fr))}.field{display:grid;gap:8px}.field input,.field textarea{width:100%;border:1px solid rgba(18,18,18,.12);border-radius:16px;padding:12px 14px;font:inherit;color:#111827;background:#fff}.field textarea{resize:vertical}.field--full{grid-column:1/-1}.question-form-card{display:grid;gap:8px}.proposal-checklist__item{display:flex;gap:12px;align-items:flex-start;padding:14px;border:1px solid rgba(18,18,18,.08);border-radius:18px;background:#f9faf8}.proposal-checklist__item.is-ready{border-color:rgba(16,138,0,.22);background:#eff7ee}.proposal-checklist__mark{display:inline-flex;min-width:18px;justify-content:center;font-weight:700}.mini-chip-row{display:flex;flex-wrap:wrap;gap:10px}.task-apply-page h1{margin:0;color:#111827;font-size:2rem}@media (max-width: 1100px){.apply-layout,.proposal-form__two-up{grid-template-columns:1fr}}@media (max-width: 760px){.apply-hero__topline,.section-header,.toolbar{flex-direction:column;align-items:stretch}}
</style>

<style scoped>
/* codex visual polish */
.task-apply-page .apply-layout {
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 28px;
  align-items: start;
}
.task-apply-page .panel,
.task-apply-page .signal-card,
.task-apply-page .proposal-preview-card {
  border-radius: 28px;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.05);
}
.task-apply-page .apply-hero__topline {
  align-items: end;
}
.task-apply-page h1 {
  max-width: 70%;
  font-size: clamp(36px, 4.6vw, 54px);
  line-height: 0.96;
}
.task-apply-page .proposal-checklist__item {
  background: #fff;
  border-style: dashed;
}
@media (max-width: 1100px) {
  .task-apply-page .apply-layout {
    grid-template-columns: 1fr;
  }

  .task-apply-page h1 {
    max-width: 100%;
  }
}
</style>
