<template>
  <section class="task-detail-page stack-xl">
    <ActionErrorDialog :message="errorMessage || loadError" title="任务详情暂时不可用" eyebrow="找任务" />

    <section class="task-detail-hero panel stack-lg">
      <div class="task-detail-hero__topline">
        <div class="stack-sm">
          <span class="eyebrow">任务详情</span>
          <h1>{{ job?.title || '任务详情' }}</h1>
          <p class="muted">{{ job?.company || '企业信息暂未公开' }}</p>
        </div>
        <div class="toolbar">
          <router-link class="button-link" :to="browseLocation">返回结果</router-link>
          <router-link v-if="job && proposalState.primaryAction !== 'contract'" class="button-primary" :to="applyLocation">{{ proposalState.readOnly ? '打开交接' : '打开申请' }}</router-link>
          <button v-else-if="job" type="button" class="button-primary" @click="openContract">打开合同</button>
        </div>
      </div>

      <div v-if="job" class="mini-chip-row">
        <span class="mini-chip">{{ job.match }}</span>
        <span class="mini-chip">{{ job.budget }}</span>
        <span class="mini-chip">{{ job.period }}</span>
        <span class="mini-chip">{{ proposalState.stateLabel }}</span>
      </div>
    </section>

    <article v-if="loading" class="panel stack-sm">
      <strong>正在加载任务详情</strong>
      <p class="muted">我们正在同步完整任务信息和当前申请状态。</p>
    </article>

    <article v-else-if="loadError" class="panel stack-sm">
      <strong>任务详情加载失败</strong>
      <p class="muted">{{ loadError }}</p>
    </article>

    <article v-else-if="!job" class="panel stack-sm">
      <strong>这条任务暂时不可用</strong>
      <p class="muted">请返回结果列表，查看其它合适的任务。</p>
      <div class="toolbar">
        <router-link class="button-link" :to="browseLocation">返回结果</router-link>
      </div>
    </article>

    <section v-else class="task-detail-layout">
      <main class="stack-lg">
        <article class="panel stack-md">
          <div class="section-header">
            <div>
              <span class="eyebrow">任务简介</span>
              <h2>先完整阅读任务说明</h2>
            </div>
          </div>
          <p class="muted">{{ job.summary }}</p>
        </article>

        <article class="panel stack-md">
          <div class="section-header">
            <div>
              <span class="eyebrow">快速判断</span>
              <h2>先确认是否匹配，再决定是否申请</h2>
            </div>
            <span class="soft-pill">{{ proposalState.stateLabel }}</span>
          </div>
          <p class="muted">{{ proposalState.nextStep }}</p>
          <p class="muted">{{ job.matchNote || '先看匹配度、预算、周期和筛选问题，再决定是否继续申请。' }}</p>
          <div class="detail-facts-grid">
            <article v-for="fact in detailFacts" :key="fact.label" class="mini-card stack-sm">
              <span class="eyebrow">{{ fact.label }}</span>
              <strong>{{ fact.value }}</strong>
              <p class="muted">{{ fact.note }}</p>
            </article>
          </div>
        </article>

        <article class="panel stack-md">
          <div class="section-header">
            <div>
              <span class="eyebrow">企业信号</span>
              <h2>先判断这位企业方是否值得投入申请</h2>
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

        <article class="panel stack-md">
          <div class="section-header">
            <div>
              <span class="eyebrow">范围与技能</span>
              <h2>先确认匹配，再准备申请内容</h2>
            </div>
          </div>
          <div v-if="job.tags.length" class="chip-grid">
            <span v-for="tag in job.tags" :key="tag" class="mini-chip">{{ tag }}</span>
          </div>
          <p v-else class="muted">这条任务暂时还没有同步技能标签。</p>
        </article>

        <article class="panel stack-md">
          <div class="section-header">
            <div>
              <span class="eyebrow">筛选问题</span>
              <h2>先看门槛，再决定是否继续申请</h2>
            </div>
          </div>
          <div v-if="selectedQuestions.length" class="question-list">
            <article v-for="question in selectedQuestions" :key="question" class="question-card">
              <p>{{ question }}</p>
            </article>
          </div>
          <p v-else class="muted">这条任务暂时还没有筛选问题。</p>
        </article>
      </main>

      <aside class="stack-lg">
        <article class="panel stack-md">
          <div class="section-header">
            <div>
              <span class="eyebrow">下一步</span>
              <h2>选择最合适的下一步</h2>
            </div>
          </div>
          <div class="stack-sm">
            <div v-for="item in checklistPreview" :key="item.label" class="mini-card stack-sm">
              <span class="eyebrow">{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <p class="muted">{{ item.note }}</p>
            </div>
          </div>
          <div class="toolbar">
            <router-link v-if="proposalState.primaryAction !== 'contract'" class="button-primary" :to="applyLocation">{{ proposalState.readOnly ? '打开交接' : '打开申请' }}</router-link>
            <button v-else type="button" class="button-primary" @click="openContract">打开合同</button>
            <router-link class="button-secondary" :to="browseLocation">返回结果</router-link>
          </div>
        </article>
      </aside>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import { getTaskMarketplaceData } from '../services/api'
import { roleRouteMap } from '../utils/roleRoutes'
import {
  buildTaskApplyLocation,
  buildTaskBrowseLocation,
  createEmptyMarketplace,
  deriveProposalState,
  normalizeJobItem,
  normalizeMarketplace,
  readStoredProposalDraft,
} from './taskMarketSurfaceState.js'

const route = useRoute()
const router = useRouter()
const page = ref(createEmptyMarketplace())
const loadError = ref('')
const loading = ref(false)
const errorMessage = ref('')

const taskId = computed(() => String(route.params.taskId || '').trim())
const normalizedItems = computed(() => {
  const items = Array.isArray(page.value?.items) ? page.value.items : []
  return items.map((item, index) => normalizeJobItem(item, index))
})
const job = computed(() => normalizedItems.value.find((item) => String(item.taskId || item.id) === taskId.value) || null)
const draftSnapshot = computed(() => readStoredProposalDraft(taskId.value))
const selectedSignals = computed(() => job.value?.signals || [])
const selectedQuestions = computed(() => job.value?.questions || [])
const proposalState = computed(() => deriveProposalState({
  job: job.value,
  draft: draftSnapshot.value,
  selectedQuestions: selectedQuestions.value,
  selectedSignals: selectedSignals.value,
  submittedAt: draftSnapshot.value.submittedAt,
  submittedRoomKey: draftSnapshot.value.submittedRoomKey,
}))

const browseLocation = computed(() => buildTaskBrowseLocation(route.query, { taskId: taskId.value }))
const applyLocation = computed(() => buildTaskApplyLocation(taskId.value, route.query))
const detailFacts = computed(() => {
  if (!job.value) return []
  return [
    { label: '预算', value: job.value.budget, note: '预算通常是第一眼需要判断的信号。' },
    { label: '周期', value: job.value.period, note: '先判断时间安排是否合理。' },
    { label: '合作类型', value: job.value.jobType || '暂未公开', note: '先确认这是固定范围、长期合作还是按时计费。' },
    { label: '企业响应', value: job.value.responseTime || '暂未公开', note: '看看企业方是否有足够快的沟通节奏。' },
    { label: '地区 / 时区', value: job.value.location || '暂未公开', note: '先确认是否有地区或时区要求。' },
  ]
})
const checklistPreview = computed(() => proposalState.value.checklist.slice(0, 4).map((item) => ({
  label: item.label,
  value: item.checked ? '已就绪' : item.required === false ? '可选' : '待补充',
  note: item.note,
})))

onMounted(loadMarketplace)

async function loadMarketplace() {
  loading.value = true
  loadError.value = ''
  errorMessage.value = ''
  try {
    const payload = await getTaskMarketplaceData()
    page.value = normalizeMarketplace(payload)
  } catch (error) {
    loadError.value = error?.message || '任务详情加载失败'
    page.value = createEmptyMarketplace()
  } finally {
    loading.value = false
  }
}

function openContract() {
  if (!job.value?.taskId) return
  router.push({
    path: roleRouteMap.talent.workspace,
    query: {
      taskId: job.value.taskId,
      source: 'contract',
      surface: 'contract',
      originSource: 'task-detail',
      originTaskId: job.value.taskId,
    },
  })
}
</script>

<style scoped>
.task-detail-page,.stack-xl,.stack-lg,.stack-sm,.stack-md{display:grid}.stack-xl{gap:24px}.stack-lg{gap:20px}.stack-md{gap:16px}.stack-sm{gap:10px}
.panel,.mini-card,.signal-card,.question-card{padding:20px;border-radius:24px;border:1px solid rgba(18,18,18,.08);background:#fff;box-shadow:0 18px 48px rgba(39,55,27,.06)}
.task-detail-hero__topline,.section-header,.toolbar{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.toolbar{flex-wrap:wrap}.eyebrow{color:#66715f;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.muted{margin:0;color:#5c5c56;line-height:1.65}.button-primary,.button-secondary,.mini-chip,.soft-pill{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 14px;border-radius:999px;border:1px solid rgba(18,18,18,.1);background:#fff;color:#111827;text-decoration:none;font-weight:600}.button-primary{background:#108a00;border-color:#108a00;color:#fff}.mini-chip,.soft-pill{background:#f7f8f4}.task-detail-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px;align-items:start}.detail-facts-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.signal-list,.question-list,.chip-grid{display:grid;gap:12px}.chip-grid{display:flex;flex-wrap:wrap}.question-card p,.signal-card p{margin:0}.task-detail-hero h1{margin:0;font-size:2.1rem;color:#111827}.mini-chip-row{display:flex;flex-wrap:wrap;gap:10px}@media (max-width: 1100px){.task-detail-layout,.detail-facts-grid{grid-template-columns:1fr}}@media (max-width: 760px){.task-detail-hero__topline,.section-header,.toolbar{flex-direction:column;align-items:stretch}}
</style>

<style scoped>
/* codex visual polish */
.task-detail-page .task-detail-hero {
  padding: 34px;
  border-radius: 34px;
  background: linear-gradient(135deg, rgba(240, 248, 236, 0.94), rgba(255, 255, 255, 0.98));
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.08);
}
.task-detail-page .task-detail-hero h1 {
  max-width: 70%;
  font-size: clamp(38px, 4.6vw, 54px);
  line-height: 0.95;
  letter-spacing: -0.04em;
}
.task-detail-page .task-detail-layout {
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}
.task-detail-page .panel,
.task-detail-page .mini-card,
.task-detail-page .signal-card,
.task-detail-page .question-card {
  border-radius: 28px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.05);
}
.task-detail-page aside .panel,
.task-detail-page aside .mini-card {
  background: #fcfcf8;
  box-shadow: none;
  border: 1px solid rgba(17, 24, 39, 0.08);
}
.task-detail-page .button-link {
  align-self: center;
  color: #2d5b2f;
  text-decoration: none;
  font-weight: 600;
}
.task-detail-page .button-link:hover {
  text-decoration: underline;
}
@media (max-width: 1100px) {
  .task-detail-page .task-detail-layout {
    grid-template-columns: 1fr;
  }

  .task-detail-page .task-detail-hero h1 {
    max-width: 100%;
  }
}
</style>
