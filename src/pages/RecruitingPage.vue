<template>
  <section class="recruiting-page stack-xl">
    <ActionErrorDialog :message="errorMessage" title="招聘申请页暂时不可用" eyebrow="招聘申请" />

    <section class="recruiting-hero panel stack-lg">
      <div class="recruiting-hero__surface">
        <div class="recruiting-hero__lead stack-lg">
          <div class="stack-sm">
            <span class="eyebrow">招聘申请</span>
            <div class="recruiting-hero__headline">
              <h1>{{ page.task.title }}</h1>
              <span class="soft-pill soft-pill--accent">{{ page.applications.length }} 份申请</span>
            </div>
            <p class="muted recruiting-hero__summary">{{ page.task.summary }}</p>
          </div>

          <div class="recruiting-signal-grid">
            <article class="signal-card signal-card--primary">
              <span>待处理申请</span>
              <strong>{{ page.counts.pending }}</strong>
              <p>先看申请摘要、标签和可信信号，再决定是否约面试。</p>
            </article>
            <article class="signal-card">
              <span>待面试确认</span>
              <strong>{{ page.counts.interviewPending }}</strong>
              <p>这里是已经发出邀约、等待人才确认的申请。</p>
            </article>
            <article class="signal-card">
              <span>已确认合作</span>
              <strong>{{ page.counts.confirmed }}</strong>
              <p>只有确认合作后，才进入后续协作链路。</p>
            </article>
          </div>
        </div>

        <aside class="recruiting-hero__docket stack-md">
          <div class="stack-sm">
            <span class="eyebrow">处理节奏</span>
            <strong>{{ recruitingDocketHeadline }}</strong>
          </div>
          <div class="toolbar toolbar--stacked">
            <router-link class="button-secondary" :to="roleRouteMap.enterprise.home">返回工作台</router-link>
            <router-link class="button-secondary" :to="roleRouteMap.enterprise.market">回到人才市场</router-link>
          </div>
        </aside>
      </div>
    </section>

    <section class="recruiting-layout">
      <main class="panel stack-md recruiting-main">
        <div class="section-header">
          <div>
            <span class="eyebrow">申请人列表</span>
            <h2>先处理这条任务下的申请人</h2>
          </div>
          <span class="soft-pill">{{ page.applications.length }} 位申请人</span>
        </div>

        <div v-if="page.applications.length" class="recruiting-list">
          <article
            v-for="app in page.applications"
            :key="app.id"
            class="recruiting-card"
            :class="{ 'is-active': selectedApplicant?.id === app.id }"
          >
            <div class="recruiting-card__topline">
              <div class="stack-xs recruiting-card__identity">
                <div class="mini-chip-row">
                  <span class="mini-chip">{{ app.statusLabel }}</span>
                  <span v-if="app.interview.state" class="mini-chip">{{ interviewStateLabel(app.interview.state) }}</span>
                </div>
                <strong>{{ app.name }}</strong>
                <p>{{ app.role }}</p>
              </div>
              <div class="stack-xs recruiting-card__metrics">
                <span class="recruiting-card__rate">{{ app.rate }}</span>
                <span class="recruiting-card__date">{{ app.applyAt ? `申请于 ${app.applyAt}` : '最新申请' }}</span>
              </div>
            </div>

            <p class="recruiting-card__summary">{{ app.summary }}</p>

            <div class="recruiting-card__factrow">
              <span class="recruiting-card__fact">
                <span>匹配度</span>
                <strong>{{ applicantMatchLabel(app) }}</strong>
              </span>
              <span class="recruiting-card__fact">
                <span>面试状态</span>
                <strong>{{ app.interview.state ? interviewStateLabel(app.interview.state) : '待发起' }}</strong>
              </span>
            </div>

            <div class="recruiting-card__footer">
              <div class="mini-chip-row">
                <span v-for="tag in app.tags.slice(0, 3)" :key="`${app.id}-${tag}`" class="mini-chip">{{ tag }}</span>
              </div>
              <div
                class="recruiting-card__actions"
                :class="{
                  'recruiting-card__actions--triple': isApplicantApplicationStage(app),
                  'recruiting-card__actions--quad': isApplicantInterviewStage(app),
                }"
              >
                <button
                  v-if="app.detailRoute"
                  type="button"
                  class="recruiting-card__action recruiting-card__action--detail button-secondary"
                  @click="openApplicantDetails(app)"
                >
                  查看人才详情
                </button>
                <button
                  v-if="isApplicantApplicationStage(app)"
                  type="button"
                  class="recruiting-card__action recruiting-card__action--invite button-primary"
                  @click="openInviteForApplicant(app)"
                >
                  约面试
                </button>
                <button
                  v-if="isApplicantApplicationStage(app)"
                  type="button"
                  class="recruiting-card__action button-secondary"
                  @click="rejectApplication(app)"
                >
                  拒绝申请
                </button>
                <button
                  v-if="isApplicantInterviewStage(app)"
                  type="button"
                  class="recruiting-card__action button-secondary"
                  @click="continueChat(app)"
                >
                  继续沟通
                </button>
                <button
                  v-if="isApplicantInterviewStage(app)"
                  type="button"
                  class="recruiting-card__action button-secondary"
                  @click="markInterviewFailed(app)"
                >
                  面试未通过
                </button>
                <button
                  v-if="isApplicantInterviewStage(app)"
                  type="button"
                  class="recruiting-card__action button-primary"
                  @click="confirmCooperation(app)"
                >
                  通过面试并确认合作
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state recruiting-empty">
          <strong>当前还没有申请人</strong>
          <p>新申请会先出现在这里，企业可以先按任务处理，再决定约面试、继续沟通或确认合作。</p>
        </div>
      </main>
    </section>

    <section v-if="inviteComposerOpen && selectedApplicant" ref="inviteComposerRef" class="panel stack-md recruiting-invite">
      <div class="section-header">
        <div>
          <span class="eyebrow">约面试</span>
          <h2>发送新的面试邀约</h2>
        </div>
        <button type="button" class="button-secondary" @click="closeInviteComposer">取消</button>
      </div>
      <div class="invite-grid">
        <label class="field">
          <span>面试时间</span>
          <input ref="inviteTimeInputRef" v-model.trim="inviteDraft.time" type="text" placeholder="例如：2026-04-20 14:00" />
        </label>
        <label class="field">
          <span>腾讯会议号</span>
          <input v-model.trim="inviteDraft.meetingCode" type="text" placeholder="例如：123 456 789" />
        </label>
        <label class="field field--full">
          <span>备注</span>
          <textarea v-model.trim="inviteDraft.note" rows="3" placeholder="补充面试安排、准备事项或沟通要点。" />
        </label>
      </div>
      <div class="action-row">
        <button class="button-primary" type="button" @click="sendInvite">发送邀约</button>
        <button class="button-secondary" type="button" @click="closeInviteComposer">取消</button>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import {
  confirmRecruitingCooperation,
  getRecruitingWorkspaceData,
  normalizeRecruitingWorkspacePayload,
  recordRecruitingInterviewOutcome,
  sendRecruitingInterviewInvite,
} from '../services/api'
import { roleRouteMap } from '../utils/roleRoutes'

const route = useRoute()
const router = useRouter()
const errorMessage = ref('')
const loading = ref(false)
const inviteComposerOpen = ref(false)
const selectedApplicantId = ref('')
const inviteComposerRef = ref(null)
const inviteTimeInputRef = ref(null)
const page = ref(normalizeRecruitingWorkspacePayload({
  task: {
    title: '招聘申请处理',
    summary: '任务 -> 申请人 -> 动作',
  },
  applications: [],
  counts: { total: 0, pending: 0, interviewPending: 0, accepted: 0, confirmed: 0, autoClosed: 0 },
}))
const inviteDraft = reactive({ time: '', meetingCode: '', note: '' })

const taskId = computed(() => String(route.query.taskId || '').trim())
const applicants = computed(() => Array.isArray(page.value?.applications) ? page.value.applications : [])
const selectedApplicant = computed(() => applicants.value.find((item) => item.id === selectedApplicantId.value) || applicants.value[0] || null)
const activeTaskId = computed(() => {
  if (taskId.value) return taskId.value
  const task = page.value?.task || {}
  return String(task.taskId || task.id || '').trim()
})
const recruitingDocketHeadline = computed(() => {
  const counts = page.value?.counts || {}
  const interviewPending = Number(counts.interviewPending || 0)
  const accepted = Number(counts.accepted || 0)
  const pending = Number(counts.pending || 0)
  if (interviewPending > 0) return `有 ${interviewPending} 位人才在等待确认面试`
  if (accepted > 0) return `有 ${accepted} 位人才已同意面试，等待你给出结果`
  if (pending > 0) return `有 ${pending} 位申请人在等待处理`
  return '当前没有需要继续处理的申请'
})

watch(applicants, (list) => {
  if (!list.length) {
    selectedApplicantId.value = ''
    return
  }
  if (!selectedApplicantId.value || !list.some((item) => item.id === selectedApplicantId.value)) {
    selectedApplicantId.value = list[0].id
  }
}, { immediate: true })

watch(taskId, loadWorkspace, { immediate: true })

function selectApplicant(applicant) {
  selectedApplicantId.value = applicant?.id || ''
}

function isApplicantApplicationStage(applicant) {
  const stage = String(applicant?.status || '').toUpperCase()
  return ['APPLIED', 'REQUESTED', 'PENDING', 'REVIEWING', 'UNDER_REVIEW'].includes(stage)
}

function isApplicantInterviewStage(applicant) {
  const stage = String(applicant?.status || '').toUpperCase()
  return ['INTERVIEW_PENDING', 'INTERVIEW_ACCEPTED'].includes(stage)
}

function applicantMatchLabel(applicant) {
  const signalCount = Array.isArray(applicant?.signals) ? applicant.signals.length : 0
  const tagCount = Array.isArray(applicant?.tags) ? applicant.tags.length : 0
  if (signalCount >= 2 || tagCount >= 3) return '高'
  if (signalCount >= 1 || tagCount >= 1) return '中'
  return '待判断'
}

function openApplicantDetails(applicant) {
  if (!applicant?.detailRoute) {
    return
  }
  router.push(applicant.detailRoute)
}

function openInviteForApplicant(applicant) {
  selectApplicant(applicant)
  void openInviteComposer()
}

async function openInviteComposer() {
  resetInviteDraft()
  inviteComposerOpen.value = true
  await nextTick()
  inviteComposerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
  inviteTimeInputRef.value?.focus()
}

function closeInviteComposer() {
  inviteComposerOpen.value = false
}

function resetInviteDraft() {
  inviteDraft.time = ''
  inviteDraft.meetingCode = ''
  inviteDraft.note = ''
}

function interviewStateLabel(value) {
  const stage = String(value || '').trim().toUpperCase()
  if (!stage) return ''
  if (stage.includes('ACCEPT')) return '已同意面试'
  if (stage.includes('REJECT')) return '已拒绝面试'
  if (stage.includes('PENDING')) return '待确认面试'
  if (stage.includes('PASS')) return '面试通过'
  if (stage.includes('FAIL')) return '面试未通过'
  return stage
}

async function loadWorkspace() {
  loading.value = true
  errorMessage.value = ''
  try {
    const payload = await getRecruitingWorkspaceData(taskId.value)
    page.value = normalizeRecruitingWorkspacePayload(payload)
    if (payload?.requestError) {
      errorMessage.value = payload.requestError
    }
  } catch (error) {
    errorMessage.value = error?.message || '招聘申请处理页加载失败。'
  } finally {
    loading.value = false
  }
}

async function refreshWorkspace() {
  const payload = await getRecruitingWorkspaceData(activeTaskId.value)
  page.value = normalizeRecruitingWorkspacePayload(payload)
  if (payload?.requestError) {
    errorMessage.value = payload.requestError
  }
}

async function sendInvite() {
  if (!selectedApplicant.value?.talentUserId || !activeTaskId.value) {
    errorMessage.value = '缺少申请人或任务信息，暂时不能发送邀约。'
    return
  }
  if (!inviteDraft.time.trim()) {
    errorMessage.value = '先填写面试时间。'
    inviteTimeInputRef.value?.focus()
    return
  }
  if (!inviteDraft.meetingCode.trim()) {
    errorMessage.value = '先填写腾讯会议号。'
    return
  }
  const payload = await sendRecruitingInterviewInvite({
    taskId: activeTaskId.value,
    talentUserId: selectedApplicant.value.talentUserId,
    interviewAt: inviteDraft.time.trim(),
    meetingCode: inviteDraft.meetingCode.trim(),
    note: inviteDraft.note.trim(),
  })
  if (payload?.requestError || payload?.success === false) {
    errorMessage.value = payload?.requestError || '发送面试邀约失败。'
    return
  }
  resetInviteDraft()
  inviteComposerOpen.value = false
  await refreshWorkspace()
}

async function rejectApplication(applicant = selectedApplicant.value) {
  if (!applicant?.talentUserId) return
  const payload = await recordRecruitingInterviewOutcome({
    taskId: activeTaskId.value,
    talentUserId: applicant.talentUserId,
    outcome: 'REJECT_APPLICATION',
  })
  if (payload?.requestError || payload?.success === false) {
    errorMessage.value = payload?.requestError || '拒绝申请失败。'
    return
  }
  await refreshWorkspace()
}

function continueChat(applicant = selectedApplicant.value) {
  if (!applicant?.messageRoute) return
  router.push(applicant.messageRoute)
}

async function markInterviewFailed(applicant = selectedApplicant.value) {
  if (!applicant?.talentUserId) return
  const payload = await recordRecruitingInterviewOutcome({
    taskId: activeTaskId.value,
    talentUserId: applicant.talentUserId,
    outcome: 'FAIL',
  })
  if (payload?.requestError || payload?.success === false) {
    errorMessage.value = payload?.requestError || '记录面试未通过失败。'
    return
  }
  await refreshWorkspace()
}

async function confirmCooperation(applicant = selectedApplicant.value) {
  if (!applicant?.talentUserId) return
  const payload = await confirmRecruitingCooperation({
    taskId: activeTaskId.value,
    talentUserId: applicant.talentUserId,
  })
  if (payload?.requestError || payload?.success === false) {
    errorMessage.value = payload?.requestError || '确认合作失败。'
    return
  }
  await refreshWorkspace()
}

</script>

<style scoped>
.recruiting-page,
.stack-xl,
.stack-lg,
.stack-md,
.stack-sm {
  display: grid;
}
.stack-xl { gap: 24px; }
.stack-lg { gap: 20px; }
.stack-md { gap: 16px; }
.stack-sm { gap: 10px; }
.panel {
  padding: 24px;
  border-radius: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
}
.eyebrow {
  margin: 0;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #108a00;
}
.muted { margin: 0; color: #52606d; line-height: 1.7; }
.recruiting-hero {
  background:
    linear-gradient(135deg, rgba(244, 251, 242, 0.92), rgba(255, 253, 247, 0.94)),
    repeating-linear-gradient(
      90deg,
      rgba(16, 138, 0, 0.035) 0,
      rgba(16, 138, 0, 0.035) 1px,
      transparent 1px,
      transparent 52px
    ),
    #fffef8;
}
.recruiting-hero__surface {
  display: grid;
  grid-template-columns: minmax(0, 1.42fr) minmax(300px, 0.74fr);
  gap: 22px;
  align-items: stretch;
}
.recruiting-hero__topline,
.section-header,
.toolbar,
.action-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}
.toolbar,
.action-row { flex-wrap: wrap; }
.toolbar--stacked {
  align-items: stretch;
}
.toolbar--stacked > * {
  width: 100%;
}
.recruiting-hero__headline {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.recruiting-hero__headline h1 {
  margin: 6px 0 0;
  font-size: clamp(2.6rem, 5vw, 4.25rem);
  line-height: 1;
  color: #111827;
}
.recruiting-hero__summary {
  max-width: 68ch;
  font-size: 1.02rem;
}
.recruiting-hero__docket {
  min-height: 100%;
  padding: 22px;
  border-radius: 24px;
  border: 1px solid rgba(16, 138, 0, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(243, 250, 239, 0.92));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}
.recruiting-hero__docket strong {
  font-size: 1.15rem;
  line-height: 1.4;
  color: #10231a;
}
.recruiting-signal-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.signal-card,
.recruiting-card,
.detail-card {
  border-radius: 22px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fff;
}
.signal-card {
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
}
.signal-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: rgba(16, 138, 0, 0.12);
}
.signal-card--primary {
  background: linear-gradient(180deg, rgba(247, 253, 244, 0.96), rgba(255, 255, 255, 0.98));
  border-color: rgba(16, 138, 0, 0.18);
}
.signal-card--primary::before {
  background: #108a00;
}
.signal-card span {
  display: block;
  margin-bottom: 8px;
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.signal-card strong { font-size: 1.45rem; color: #111827; }
.recruiting-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
}
.recruiting-main,
.recruiting-detail {
  min-width: 0;
}
.recruiting-list {
  display: grid;
  gap: 14px;
}
.recruiting-card {
  padding: 18px 20px;
  text-align: left;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}
.recruiting-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: rgba(16, 138, 0, 0.08);
}
.recruiting-card:hover,
.recruiting-card.is-active {
  transform: translateY(-1px);
  border-color: rgba(16, 138, 0, 0.22);
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  background: linear-gradient(180deg, rgba(249, 253, 247, 0.96), rgba(255, 255, 255, 1));
}
.recruiting-card.is-active::before,
.recruiting-card:hover::before {
  background: #108a00;
}
.recruiting-card__topline {
  display: flex;
  justify-content: space-between;
  gap: 14px;
}
.recruiting-card__identity strong {
  font-size: 1.2rem;
  color: #101828;
}
.recruiting-card__identity p,
.recruiting-card__date {
  margin: 0;
  color: #667085;
}
.recruiting-card__metrics {
  align-items: flex-end;
  text-align: right;
}
.recruiting-card__rate {
  font-weight: 700;
  color: #111827;
  font-size: 1rem;
}
.recruiting-card__date {
  font-size: 0.84rem;
}
.recruiting-card__summary {
  margin: 12px 0;
  color: #52606d;
  line-height: 1.65;
}
.recruiting-card__factrow {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.recruiting-card__fact {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.09);
  background: rgba(250, 251, 248, 0.94);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #111827;
}
.recruiting-card__fact span {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
}
.recruiting-card__fact strong {
  font-size: 0.96rem;
  line-height: 1;
}
.recruiting-card__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
}
.recruiting-card__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 12px;
  width: min(520px, 100%);
}
.recruiting-card__actions--triple {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.recruiting-card__actions--quad {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.recruiting-card__action {
  flex: none;
  width: 100%;
  min-height: 48px;
  justify-content: center;
  padding: 0 18px;
  border-radius: 18px;
}
.recruiting-card__action--detail {
  background: rgba(255, 255, 255, 0.96);
  border-color: rgba(17, 24, 39, 0.12);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.65);
}
.recruiting-card__action--invite {
  box-shadow: 0 16px 30px rgba(16, 138, 0, 0.18);
}
.mini-chip-row { display: flex; flex-wrap: wrap; gap: 10px; }
.mini-chip,
.soft-pill,
.button-primary,
.button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  text-decoration: none;
}
.mini-chip,
.soft-pill,
.button-secondary {
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  color: #111827;
}
.soft-pill--accent {
  border-color: rgba(16, 138, 0, 0.18);
  background: rgba(244, 251, 242, 0.95);
  color: #108a00;
  font-weight: 700;
}
.button-primary {
  min-height: 46px;
  padding: 0 20px;
  border: 1px solid #108a00;
  background: #108a00;
  color: #fff;
  font-weight: 700;
}
.button-secondary {
  min-height: 46px;
  padding: 0 20px;
  font-weight: 700;
}
.button-primary,
.button-secondary {
  width: 100%;
}
.recruiting-invite {
  padding: 24px;
}
.invite-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.field {
  display: grid;
  gap: 8px;
}
.field input,
.field textarea {
  width: 100%;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 16px;
  padding: 12px 14px;
  font: inherit;
  color: #111827;
  background: #fff;
}
.field textarea { resize: vertical; }
.field--full { grid-column: 1 / -1; }
.recruiting-empty {
  padding: 16px;
  border-radius: 22px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #f8faf7;
}
@media (max-width: 1100px) {
  .recruiting-hero__surface,
  .recruiting-layout,
  .invite-grid,
  .recruiting-signal-grid {
    grid-template-columns: 1fr;
  }
  .recruiting-card__actions {
    width: 100%;
  }
  .recruiting-card__action {
    width: 100%;
  }
}
@media (max-width: 720px) {
  .panel { padding: 20px; }
  .recruiting-hero__headline,
  .recruiting-hero__topline,
  .recruiting-detail__header,
  .section-header,
  .toolbar,
  .action-row,
  .recruiting-card__topline,
  .recruiting-card__footer {
    flex-direction: column;
    align-items: stretch;
  }
  .recruiting-card__actions,
  .recruiting-card__actions--triple,
  .recruiting-card__actions--quad {
    grid-template-columns: 1fr;
  }
}
</style>
