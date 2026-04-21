<template>
  <section class="freelancer-dashboard stack-xl">
    <header class="freelancer-hero panel stack-lg">
      <div class="freelancer-hero__topline">
        <div class="freelancer-hero__identity stack-sm">
          <div>
            <p class="eyebrow">人才工作台</p>
            <h1>{{ heroName }}</h1>
            <p class="freelancer-hero__role">{{ heroRole }}</p>
          </div>
          <p>{{ heroIntro }}</p>
          <div class="freelancer-pill-row">
            <span class="status-chip">{{ availabilityLabel }}</span>
            <span class="status-chip">{{ scoreLabel }}</span>
            <span class="status-chip">{{ incomeLabel }}</span>
          </div>
        </div>

        <article class="workspace-focus-card">
          <span class="eyebrow">下一步</span>
          <strong>{{ workspaceFocusTitle }}</strong>
          <p>{{ workspaceFocusNote }}</p>
          <div v-if="workspaceFocusMeta.length" class="freelancer-pill-row">
            <span
              v-for="item in workspaceFocusMeta"
              :key="`${workspaceFocusTitle}-${item}`"
              class="mini-chip"
            >
              {{ item }}
            </span>
          </div>
          <router-link class="button-primary" :to="workspaceFocusRoute">{{ workspaceFocusCta }}</router-link>
        </article>
      </div>

      <div class="freelancer-hero__signals">
        <article class="signal-card">
          <span>待处理事项</span>
          <strong>{{ attentionCount }}</strong>
          <p>先处理当前需要你回复的申请、面试邀约、合作邀约和提醒。</p>
        </article>
        <article class="signal-card">
          <span>申请 / 面试 / 合作</span>
          <strong>{{ inboxSummary.total }}</strong>
          <p>在一个地方跟踪进行中的申请、面试邀约、合作邀约和企业回复。</p>
        </article>
        <article class="signal-card">
          <span>进行中的合作</span>
          <strong>{{ activeContracts.length }}</strong>
          <p>持续推进当前合作、里程碑和企业更新。</p>
        </article>
        <article class="signal-card">
          <span>面试与合作邀约</span>
          <strong>{{ invitationItems.length + offerItems.length }}</strong>
          <p>及时查看新的面试邀约和合作邀约，别让机会冷掉。</p>
        </article>
      </div>
    </header>

    <section class="freelancer-dashboard__body">
      <main class="stack-lg">
        <section class="panel stack-md">
          <div class="section-header">
            <div>
              <p class="eyebrow">待处理事项</p>
              <h2>先处理需要你回复的事项</h2>
            </div>
            <router-link class="text-action" :to="attentionPrimaryRoute">{{ attentionPrimaryLabel }}</router-link>
          </div>
          <div v-if="attentionCards.length" class="action-grid">
            <article v-for="item in attentionCards" :key="item.title" class="action-card">
              <span class="action-card__status">{{ item.status }}</span>
              <strong>{{ item.title }}</strong>
              <p>{{ item.note }}</p>
              <router-link class="button-secondary button-secondary--small" :to="item.route">{{ item.cta }}</router-link>
            </article>
          </div>
          <div v-else class="empty-state">
            <strong>当前没有需要你回复的事项</strong>
            <p>去找任务或回复消息吧。新的申请、邀请和邀约会先出现在这里。</p>
          </div>
        </section>

        <section class="panel stack-md">
          <div class="section-header">
            <div>
              <p class="eyebrow">申请 / 面试 / 合作</p>
              <h2>继续推进申请、面试邀约和合作邀约</h2>
            </div>
            <router-link class="text-action" :to="inboxPrimaryRoute">{{ inboxPrimaryLabel }}</router-link>
          </div>

          <div class="opportunity-grid">
            <article class="opportunity-card">
              <div class="section-header section-header--compact">
                <div>
                  <p class="eyebrow">申请</p>
                  <h3>{{ proposalItems.length }}</h3>
                </div>
              </div>
              <div v-if="proposalItems.length" class="proposal-list">
                <article v-for="item in proposalItems" :key="item.key" class="proposal-list__item">
                  <div>
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.partner }}</p>
                    <p>{{ item.summary }}</p>
                  </div>
                  <router-link class="button-link" :to="item.route">{{ item.cta }}</router-link>
                </article>
              </div>
              <div v-else class="empty-state is-compact">
                <strong>当前没有新的申请</strong>
                <p>你从任务详情发出的申请会先落在这里。</p>
              </div>
            </article>

            <article class="opportunity-card">
              <div class="section-header section-header--compact">
                <div>
                  <p class="eyebrow">面试邀约</p>
                  <h3>{{ invitationItems.length }}</h3>
                </div>
              </div>
              <div v-if="invitationItems.length" class="proposal-list">
                <article v-for="item in invitationItems" :key="item.key" class="proposal-list__item">
                  <div>
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.partner }}</p>
                    <p>{{ item.summary }}</p>
                  </div>
                  <router-link class="button-link" :to="item.route">{{ item.cta }}</router-link>
                </article>
              </div>
              <div v-else class="empty-state is-compact">
                <strong>当前没有新的面试邀约</strong>
                <p>企业直接邀请你面试时，会先显示在这里。</p>
              </div>
            </article>

            <article class="opportunity-card">
              <div class="section-header section-header--compact">
                <div>
                  <p class="eyebrow">合作邀约</p>
                  <h3>{{ offerItems.length }}</h3>
                </div>
              </div>
              <div v-if="offerItems.length" class="proposal-list">
                <article v-for="item in offerItems" :key="item.key" class="proposal-list__item">
                  <div>
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.partner }}</p>
                    <p>{{ item.summary }}</p>
                  </div>
                  <router-link class="button-link" :to="item.route">{{ item.cta }}</router-link>
                </article>
              </div>
              <div v-else class="empty-state is-compact">
                <strong>当前没有新的合作邀约</strong>
                <p>企业发来明确合作条件后，会先显示在这里。</p>
              </div>
            </article>
          </div>

        </section>

        <section class="panel stack-md">
          <div class="section-header">
            <div>
              <p class="eyebrow">进行中的合作</p>
              <h2>进行中的合作</h2>
            </div>
            <router-link class="text-action" :to="activeContractsPrimaryRoute">打开当前合作</router-link>
          </div>
          <div v-if="activeContracts.length" class="contract-list">
            <article v-for="task in activeContracts" :key="task.id" class="contract-card">
              <div class="contract-card__topline">
                <div>
                  <strong>{{ task.title }}</strong>
                  <p>{{ task.partner }}</p>
                </div>
                <span class="status-chip">{{ task.status }}</span>
              </div>
              <p>{{ task.summary }}</p>
              <div class="contract-card__footer">
                <span>{{ task.milestone }}</span>
                <router-link class="button-secondary button-secondary--small" :to="task.route">打开合作</router-link>
              </div>
            </article>
          </div>
          <div v-else class="empty-state">
            <strong>当前还没有进行中的合作</strong>
            <p>去浏览任务，或先处理正在等你的申请、邀请和邀约。</p>
          </div>
        </section>

        <section class="panel stack-md">
          <div class="section-header">
            <div>
              <p class="eyebrow">找任务</p>
              <h2>推荐任务</h2>
            </div>
            <router-link class="text-action" :to="roleRouteMap.talent.market">搜索任务</router-link>
          </div>
          <div v-if="marketplaceItems.length" class="job-preview-list">
            <article v-for="item in marketplaceItems" :key="item.id" class="job-preview-card">
              <div class="job-preview-card__topline">
                <div>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.summary }}</p>
                </div>
                <span class="status-chip">{{ item.match }}</span>
              </div>
              <div class="freelancer-pill-row">
                <span class="mini-chip">{{ item.budget }}</span>
                <span class="mini-chip">{{ item.period }}</span>
                <span v-for="tag in item.tags" :key="tag" class="mini-chip">{{ tag }}</span>
              </div>
              <div class="contract-card__footer">
                <span>{{ item.callout }}</span>
                <router-link class="button-secondary button-secondary--small" :to="item.route">查看任务</router-link>
              </div>
            </article>
          </div>
          <div v-else class="empty-state">
            <strong>当前还没有推荐任务</strong>
            <p>去浏览搜索结果，或继续加强你的技能和作品来提升匹配度。</p>
          </div>
        </section>
      </main>

      <aside class="stack-lg">
        <section class="panel stack-md">
          <div class="section-header section-header--compact">
            <div>
              <p class="eyebrow">收入与提现</p>
              <h2>收入记录</h2>
            </div>
            <router-link class="text-action" :to="roleRouteMap.talent.records">查看收入记录</router-link>
          </div>
          <div class="earnings-grid">
            <article class="earnings-card">
              <span>累计收入</span>
              <strong>{{ walletSummary.totalEarned || '￥0' }}</strong>
            </article>
            <article class="earnings-card">
              <span>待入账</span>
              <strong>{{ walletSummary.pendingIncome || '￥0' }}</strong>
            </article>
            <article class="earnings-card">
              <span>可提现</span>
              <strong>{{ walletSummary.availableToWithdraw || '￥0' }}</strong>
            </article>
            <article class="earnings-card">
              <span>提现中</span>
              <strong>{{ walletSummary.frozenAmount || '￥0' }}</strong>
            </article>
          </div>
            <p class="muted">{{ walletSummary.withdrawHint || '收入会在结算后进入这里，然后再继续进入提现。' }}</p>

          <div v-if="claimableRecords.length" class="mini-feed-list mini-feed-list--tight">
            <article v-for="item in claimableRecords" :key="item.key" class="mini-feed-item mini-feed-item--compact">
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.status }}</p>
              </div>
              <div class="mini-feed-item__meta">
                <span class="soft-pill">{{ item.amount }}</span>
                <span class="soft-pill">{{ item.time }}</span>
              </div>
            </article>
          </div>
        </section>

        <section class="panel stack-md">
          <div class="section-header section-header--compact">
            <div>
              <p class="eyebrow">档案与作品</p>
              <h2>个人档案</h2>
            </div>
            <router-link class="text-action" :to="profileRoute">查看档案</router-link>
          </div>
          <div class="freelancer-pill-row">
            <span v-for="skill in displayedSkills" :key="skill" class="mini-chip">{{ skill }}</span>
          </div>
          <div v-if="portfolioItems.length" class="portfolio-list">
            <article v-for="item in portfolioItems" :key="item.title" class="portfolio-card">
              <strong>{{ item.title }}</strong>
              <p>{{ item.note }}</p>
            </article>
          </div>
          <div v-else class="empty-state is-compact">
            <strong>当前还没有作品样本</strong>
            <p>补充最近的作品，这样企业能更快决定是否邀请你。</p>
          </div>
          <div v-if="ledgerItems.length" class="mini-feed-list mini-feed-list--tight">
            <article v-for="item in ledgerItems" :key="item.key" class="mini-feed-item mini-feed-item--compact">
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.status }}</p>
              </div>
              <div class="mini-feed-item__meta">
                <span class="soft-pill">{{ item.amount }}</span>
                <span class="soft-pill">{{ item.time }}</span>
              </div>
            </article>
          </div>
        </section>
      </aside>
    </section>

    <ActionErrorDialog
      eyebrow="人才工作台"
      title="工作台暂时不可用"
      :message="errorMessage"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import { getStoredAuthUser } from '../services/authSession'
import {
  getFreelancerCollaborationInboxData,
  getFreelancerEarningsData,
  getTalentData,
} from '../services/api'
import { resolveTalentProfileSlug } from '../utils/talentProfileSlug'
import { roleRouteMap } from '../utils/roleRoutes'

const route = useRoute()
const page = ref(null)
const earnings = ref(null)
const inbox = ref(null)
const errorMessage = ref('')

const hero = computed(() => page.value?.hero || {})
const heroName = computed(() => hero.value.name || '人才')
const heroRole = computed(() => hero.value.role || '独立人才')
const heroIntro = computed(() => hero.value.intro || '先处理申请、邀请和当前合作，再回头看收入。')
const availabilityLabel = computed(() => hero.value.availability || '待同步状态')
const scoreLabel = computed(() => hero.value.score || '待同步评分')
const incomeLabel = computed(() => hero.value.income || earnings.value?.walletSummary?.totalEarned || '￥0')
const walletSummary = computed(() => earnings.value?.walletSummary || {})
const inboxSummary = computed(() => inbox.value?.summary || { proposals: 0, invitations: 0, offers: 0, total: 0, note: '' })
const attentionCount = computed(() => (Array.isArray(page.value?.attentionItems) ? page.value.attentionItems.length : 0))
const proposalItems = computed(() => normalizeOpportunityItems(Array.isArray(inbox.value?.proposalItems) ? inbox.value.proposalItems : [], 'proposal'))
const invitationItems = computed(() => normalizeOpportunityItems(Array.isArray(inbox.value?.invitationItems) ? inbox.value.invitationItems : [], 'invitation'))
const offerItems = computed(() => normalizeOpportunityItems(Array.isArray(inbox.value?.offerItems) ? inbox.value.offerItems : [], 'offer'))
const claimableRecords = computed(() => normalizeFinancialItems(Array.isArray(earnings.value?.claimableRecords) ? earnings.value.claimableRecords : [], 'claimable'))
const ledgerItems = computed(() => normalizeFinancialItems(Array.isArray(earnings.value?.ledger) ? earnings.value.ledger : [], 'ledger'))

const profileRoute = computed(() => {
  const slug = page.value?.profileSlug
    || route.query.slug
    || hero.value.slug
    || hero.value.profileSlug
    || resolveTalentProfileSlug(getStoredAuthUser())
    || 'me'
  return roleRouteMap.talent.profile(encodeURIComponent(slug))
})
const attentionPrimaryRoute = computed(() => attentionCards.value[0]?.route || roleRouteMap.talent.messages)
const attentionPrimaryLabel = computed(() => attentionCards.value[0]?.cta || '打开当前事项')
const inboxPrimaryRoute = computed(() => proposalItems.value[0]?.route || invitationItems.value[0]?.route || offerItems.value[0]?.route || roleRouteMap.talent.messages)
const inboxPrimaryLabel = computed(() => proposalItems.value[0]?.cta || invitationItems.value[0]?.cta || offerItems.value[0]?.cta || '查看申请与邀请')

const attentionCards = computed(() => {
  const items = Array.isArray(page.value?.attentionItems) ? page.value.attentionItems : []
  return items.slice(0, 3).map((item, index) => ({
    title: item.title || item.label || `待处理事项 ${index + 1}`,
    note: item.note || item.description || '先处理这一步，再决定当前合作的下一步。',
    status: item.status || item.badge || '待处理',
    partner: item.partner || item.businessName || item.counterpartName || '',
    cta: item.cta || item.actionLabel || '打开当前事项',
    route:
      routeForInboxItem(item)
      || item.route
      || roleRouteMap.talent.notifications,
  }))
})

const activeContracts = computed(() => {
  const tasks = Array.isArray(page.value?.activeTasks) ? page.value.activeTasks : []
  return tasks.slice(0, 4).map((task, index) => ({
    id: task.id || task.taskId || `task-${index}`,
    title: task.title || '未命名合作',
    partner: task.partner || task.businessName || task.company || '企业',
    status: task.status || task.phase || '进行中',
    summary: task.summary || task.note || '把这份合作继续推进到交付、消息和反馈阶段。',
    milestone: task.milestone || task.nextStep || '打开合作查看里程碑和下一步。',
    route: task.route || (task.taskId || task.id
      ? `/talent/workspace?taskId=${encodeURIComponent(task.taskId || task.id)}${task.roomKey ? `&room=${encodeURIComponent(task.roomKey)}&roomKey=${encodeURIComponent(task.roomKey)}` : ''}&source=contract&surface=contract&originSource=contract&originTaskId=${encodeURIComponent(task.taskId || task.id)}`
      : roleRouteMap.talent.workspace),
  }))
})
const activeContractsPrimaryRoute = computed(() => activeContracts.value[0]?.route || roleRouteMap.talent.records)

const marketplaceItems = computed(() => {
  const items = Array.isArray(page.value?.marketplace) ? page.value.marketplace : []
  return items.slice(0, 4).map((item, index) => ({
    id: item.id || item.taskId || `market-${index}`,
    title: item.title || '任务机会',
    summary: item.summary || item.brief || '先打开详情，再决定这份任务值不值得报名。',
    match: item.match || item.matchLabel || '平台匹配',
    budget: item.budget || '待确认预算',
    period: item.period || item.timeline || '待确认周期',
    tags: Array.isArray(item.tags) ? item.tags.slice(0, 3) : [],
    callout: item.nextStep || '先看详情，再决定是否提交申请。',
    route: `${roleRouteMap.talent.market}?taskId=${encodeURIComponent(item.taskId || item.id || `market-${index}`)}`,
  }))
})

const displayedSkills = computed(() => {
  const skills = Array.isArray(page.value?.skills) ? page.value.skills : []
  return skills.slice(0, 8)
})

const portfolioItems = computed(() => {
  const items = Array.isArray(page.value?.portfolio) ? page.value.portfolio : []
  return items.slice(0, 3).map((item, index) => ({
    title: item.title || item.name || `Portfolio ${index + 1}`,
    note: item.note || item.summary || 'Show recent work, industry context, and delivery quality.',
  }))
})

const workspaceFocusItem = computed(() => (
  attentionCards.value[0]
  || proposalItems.value[0]
  || invitationItems.value[0]
  || offerItems.value[0]
  || activeContracts.value[0]
  || marketplaceItems.value[0]
  || null
))

const workspaceFocusTitle = computed(() => (
  workspaceFocusItem.value?.title
  || 'Line up the next application or contract step.'
))

const workspaceFocusNote = computed(() => (
  workspaceFocusItem.value?.note
  || workspaceFocusItem.value?.summary
  || workspaceFocusItem.value?.milestone
  || workspaceFocusItem.value?.callout
  || 'Start with the reply or delivery step most likely to unblock the next client decision.'
))

const workspaceFocusCta = computed(() => (
  workspaceFocusItem.value?.cta
  || (activeContracts.value.length ? '打开合作' : '找任务')
))

const workspaceFocusRoute = computed(() => (
  workspaceFocusItem.value?.route
  || activeContracts.value[0]?.route
  || roleRouteMap.talent.market
))

const workspaceFocusMeta = computed(() => {
  const item = workspaceFocusItem.value
  if (!item) {
    return [availabilityLabel.value, scoreLabel.value].filter(Boolean)
  }
  return [
    item.status,
    item.partner,
    item.milestone,
    ...(Array.isArray(item.meta) ? item.meta : []),
    item.match,
  ].filter(Boolean).slice(0, 3)
})

function normalizeOpportunityItems(items, kind) {
  const labelMap = {
    proposal: { cta: '查看申请', empty: '当前没有新的申请' },
    invitation: { cta: '查看面试邀约', empty: '当前没有新的面试邀约' },
    offer: { cta: '查看合作邀约', empty: '当前没有新的合作邀约' },
  }
  const fallback = labelMap[kind] || { cta: '打开当前事项', empty: '当前没有新的任务提醒' }
  return items.slice(0, 3).map((item, index) => ({
    key: item.id || item.taskId || item.roomKey || `${kind}-${index}`,
    title: item.title || item.label || item.taskTitle || item.jobTitle || `${kind} ${index + 1}`,
    partner: item.partner || item.businessName || item.counterpartName || '待企业确认',
    summary: item.summary || item.note || item.description || '打开当前事项，继续判断要不要推进申请、面试或合作。',
    status: item.status || item.badge || '待处理',
    cta: item.actionLabel || item.cta || fallback.cta,
    route: routeForInboxItem(item) || item.route,
    meta: Array.isArray(item.tags) ? item.tags.slice(0, 2) : Array.isArray(item.meta) ? item.meta.slice(0, 2) : [],
  }))
}

function normalizeFinancialItems(items, kind) {
  return items.slice(0, 4).map((item, index) => ({
    key: item.id || item.taskId || item.claimId || item.recordId || `${kind}-${index}`,
    title: item.title || item.taskTitle || item.label || item.name || '收入记录',
    amount: item.amount || item.value || item.displayAmount || '￥0',
    status: item.status || item.state || '待处理',
    time: item.time || item.updatedAt || item.requestedAt || '刚刚更新',
    route: item.route || (item.taskId ? `${roleRouteMap.talent.records}?taskId=${encodeURIComponent(item.taskId)}` : roleRouteMap.talent.records),
  }))
}

function routeForInboxItem(item = {}) {
  if (isInterviewInvitationItem(item)) {
    return talentInviteNotificationRoute(item)
  }
  if (item.route) return item.route
  if (item.roomKey) {
    const query = new URLSearchParams()
    query.set('room', String(item.roomKey))
    query.set('roomKey', String(item.roomKey))
    if (item.taskId) query.set('taskId', String(item.taskId))
    query.set('source', 'messages')
    query.set('surface', 'messages')
    query.set('originSource', 'messages')
    if (item.taskId) query.set('originTaskId', String(item.taskId))
    return `${roleRouteMap.talent.messages}?${query.toString()}`
  }
  if (item.taskId) {
    return `${roleRouteMap.talent.workspace}?taskId=${encodeURIComponent(String(item.taskId))}&source=contract&surface=contract&originSource=contract&originTaskId=${encodeURIComponent(String(item.taskId))}`
  }
  return roleRouteMap.talent.notifications
}

function stringOf(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value)
    }
  }
  return ''
}

function isInterviewInvitationItem(item = {}) {
  const text = [
    stringOf(item.kind),
    stringOf(item.status),
    stringOf(item.assignmentStatus),
    stringOf(item.actionLabel),
    stringOf(item.cta),
    stringOf(item.note),
    stringOf(item.summary),
    stringOf(item.description),
    stringOf(item.nextStep),
    stringOf(item.interviewAt),
    stringOf(item.meetingCode)
  ].join(' ').toLowerCase()

  return /面试|interview|invite|邀约|待确认面试|已同意面试/.test(text)
}

function talentInviteNotificationRoute(item = {}) {
  const query = {
    source: 'recruiting',
    group: 'tasks',
    ...(stringOf(item.itemId, item.id) ? { itemId: stringOf(item.itemId, item.id) } : {}),
    ...(stringOf(item.taskId) ? { taskId: stringOf(item.taskId) } : {}),
    ...(stringOf(item.roomKey, item.room) ? { room: stringOf(item.roomKey, item.room), roomKey: stringOf(item.roomKey, item.room) } : {})
  }

  return {
    path: roleRouteMap.talent.notifications,
    query
  }
}

onMounted(async () => {
  const [talentPayload, earningPayload, inboxPayload] = await Promise.allSettled([
    getTalentData(),
    getFreelancerEarningsData(),
    getFreelancerCollaborationInboxData(),
  ])

  if (talentPayload.status === 'fulfilled') {
    page.value = talentPayload.value
    if (talentPayload.value?.requestError) {
      errorMessage.value = talentPayload.value.requestError
    }
  } else {
    errorMessage.value = talentPayload.reason?.message || '人才工作台数据暂时无法加载。'
  }

  if (earningPayload.status === 'fulfilled') {
    earnings.value = earningPayload.value
  }

  if (inboxPayload.status === 'fulfilled') {
    inbox.value = inboxPayload.value
  }
})
</script>

<style scoped>
.freelancer-dashboard {
  display: grid;
  gap: 24px;
}

.panel {
  padding: 28px;
  border-radius: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
}

.stack-xl,
.stack-lg,
.stack-md,
.stack-sm,
.stack-xs {
  display: grid;
}

.stack-xl { gap: 32px; }
.stack-lg { gap: 24px; }
.stack-md { gap: 18px; }
.stack-sm { gap: 12px; }
.stack-xs { gap: 8px; }

.eyebrow {
  margin: 0;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #108a00;
}

.freelancer-hero {
  background:
    radial-gradient(circle at left top, rgba(16, 138, 0, 0.08), transparent 32%),
    radial-gradient(circle at 88% 24%, rgba(245, 196, 66, 0.12), transparent 24%),
    #fffef8;
}

.freelancer-hero__topline,
.section-header,
.contract-card__topline,
.contract-card__footer,
.job-preview-card__topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.freelancer-hero__topline h1 {
  margin: 6px 0 8px;
  font-size: 2.5rem;
  line-height: 1;
  color: #111827;
}

.freelancer-hero__role {
  margin: 0;
  color: #52606d;
  font-size: 1.05rem;
}

.freelancer-hero__identity {
  display: grid;
  max-width: 54ch;
}

.freelancer-hero__identity p,
.workspace-focus-card p,
.contract-card p,
.job-preview-card p,
.portfolio-card p,
.empty-state p,
.muted {
  margin: 0;
  line-height: 1.7;
  color: #52606d;
}

.freelancer-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.workspace-focus-card {
  display: grid;
  gap: 14px;
  width: min(100%, 360px);
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: linear-gradient(180deg, #ffffff 0%, #f7fbf4 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.workspace-focus-card strong {
  color: #111827;
  font-size: 1.25rem;
  line-height: 1.1;
}

.workspace-focus-card .button-primary {
  justify-self: flex-start;
}

.status-chip,
.mini-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #fff;
  color: #111827;
  font-size: 0.92rem;
}

.status-chip {
  background: #f2fff1;
  border-color: rgba(16, 138, 0, 0.22);
}

.signal-card,
.earnings-card,
.proposal-stats article,
.action-card,
.contract-card,
.job-preview-card,
.portfolio-card {
  border-radius: 22px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fff;
}

.freelancer-hero__signals {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.signal-card,
.earnings-card,
.proposal-stats article {
  padding: 18px 20px;
}

.signal-card span,
.earnings-card span,
.proposal-stats span {
  display: block;
  margin-bottom: 10px;
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.signal-card strong,
.earnings-card strong,
.proposal-stats strong,
.action-card strong,
.contract-card strong,
.job-preview-card strong,
.portfolio-card strong,
.section-header h2 {
  color: #111827;
}

.signal-card strong,
.earnings-card strong,
.proposal-stats strong {
  font-size: 1.45rem;
}

.freelancer-dashboard__body {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 24px;
}

.action-grid,
.earnings-grid,
.portfolio-list {
  display: grid;
  gap: 14px;
}

.action-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.action-card,
.contract-card,
.job-preview-card,
.portfolio-card {
  padding: 20px;
  display: grid;
  gap: 12px;
}

.action-card__status {
  color: #108a00;
  font-weight: 700;
  font-size: 0.82rem;
}

.button-primary,
.button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  cursor: pointer;
}

.button-primary {
  background: #108a00;
  color: #fff;
  border: 1px solid #108a00;
}

.button-secondary {
  background: #fff;
  color: #111827;
  border: 1px solid rgba(17, 24, 39, 0.16);
}

.button-secondary--small {
  min-height: 38px;
  padding: 0 16px;
  font-size: 0.9rem;
}

.text-action {
  color: #108a00;
  font-weight: 700;
  text-decoration: none;
}

.contract-list,
.job-preview-list {
  display: grid;
  gap: 14px;
}

.proposal-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.proposal-list {
  display: grid;
  gap: 12px;
}

.mini-feed-list {
  display: grid;
  gap: 12px;
}

.opportunity-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.opportunity-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 20px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.opportunity-card h3 {
  margin: 6px 0 0;
  font-size: 1.4rem;
  line-height: 1;
  color: #111827;
}

.context-assist-card {
  display: grid;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 20px;
  border: 1px solid rgba(16, 138, 0, 0.12);
  background: linear-gradient(180deg, #fbfff9 0%, #f4faef 100%);
}

.context-assist-card strong {
  color: #111827;
}

.proposal-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.mini-feed-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 18px;
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.mini-feed-item__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mini-feed-list--tight {
  gap: 10px;
}

.mini-feed-item--compact {
  padding: 14px 16px;
}

.mini-feed-item--compact p {
  margin-top: 4px;
}

.proposal-list__item p {
  margin: 4px 0 0;
  color: #52606d;
}

.empty-state {
  padding: 22px;
  border-radius: 22px;
  background: #f8faf7;
  border: 1px dashed rgba(17, 24, 39, 0.12);
}

.empty-state.is-compact {
  padding: 16px 18px;
}

@media (max-width: 1180px) {
  .freelancer-dashboard__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .freelancer-hero__signals,
  .opportunity-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .action-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .panel { padding: 22px; }
  .freelancer-hero__topline,
  .section-header,
  .contract-card__topline,
  .contract-card__footer,
  .job-preview-card__topline,
  .mini-feed-item,
  .proposal-list__item {
    flex-direction: column;
    align-items: stretch;
  }

  .workspace-focus-card {
    width: 100%;
  }

  .proposal-stats {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

<style scoped>
/* codex visual polish */
.freelancer-hero {
  padding: 36px;
  border-radius: 36px;
  background: linear-gradient(135deg, rgba(239, 248, 236, 0.94), rgba(255, 255, 255, 0.98));
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.08);
}
.freelancer-hero__topline {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) 320px;
  gap: 24px;
  align-items: start;
}
.workspace-focus-card {
  border-radius: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.06);
}
.freelancer-dashboard__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}
.opportunity-grid {
  gap: 18px;
}
.context-assist-card,
.earnings-card,
.job-preview-card,
.contract-card,
.opportunity-card,
.action-card {
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.05);
}
.context-assist-card {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fbfbf8;
}
@media (max-width: 1040px) {
  .freelancer-hero__topline,
  .freelancer-dashboard__body {
    grid-template-columns: 1fr;
  }
}
</style>
