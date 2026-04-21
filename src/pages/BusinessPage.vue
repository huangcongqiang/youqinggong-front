<template>
  <section class="upw-workspace-page client-dashboard-page">
    <ActionErrorDialog
      eyebrow="企业工作台"
      title="企业工作台暂时不可用"
      :message="errorMessage"
    />

    <section class="enterprise-overview-strip">
      <router-link
        v-for="card in overviewCards"
        :key="card.key"
        class="overview-card"
        :to="card.route"
      >
        <span class="overview-card__label">{{ card.label }}</span>
        <strong class="overview-card__value">{{ card.value }}</strong>
        <p class="overview-card__note">{{ card.note }}</p>
        <span class="overview-card__action">{{ card.cta }}</span>
      </router-link>
    </section>

    <div class="enterprise-dashboard-grid">
      <main class="enterprise-dashboard-main">
        <section class="surface-card surface-card--spotlight enterprise-focus-card">
          <div class="enterprise-section-head enterprise-section-head--stacked">
            <div class="enterprise-section-head__copy">
              <p class="upw-eyebrow">当前最该处理</p>
              <h1>{{ currentWorkHeadline }}</h1>
              <p>{{ heroLead }}</p>
              <div class="tag-row tag-row--tight">
                <span v-if="currentWorkCountLabel" class="soft-pill">{{ currentWorkCountLabel }}</span>
                <span v-if="hasDraftSignals" class="soft-pill">草稿已保存</span>
              </div>
            </div>
            <div class="enterprise-section-actions enterprise-section-actions--equal">
              <router-link class="button-primary button-primary--hero" :to="heroPrimaryRoute">{{ heroPrimaryLabel }}</router-link>
              <router-link class="button-secondary button-secondary--hero" :to="roleRouteMap.enterprise.market">搜索人才</router-link>
            </div>
          </div>

          <div v-if="currentWorkMode === 'action' && currentWorkCards.length" class="priority-list">
            <article
              v-for="item in currentWorkCards"
              :key="item.key"
              class="priority-item priority-item--decision"
            >
              <div class="priority-item__meta">
                <div class="tag-row tag-row--tight">
                  <span class="soft-pill">{{ item.status }}</span>
                  <span v-if="item.topic" class="soft-pill">{{ item.topic }}</span>
                </div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.summary }}</p>
                <div v-if="item.meta.length" class="tag-row tag-row--tight">
                  <span v-for="meta in item.meta" :key="`${item.key}-${meta}`" class="soft-pill">{{ meta }}</span>
                </div>
              </div>

              <div class="priority-item__actions">
                <router-link v-if="item.route" class="button-secondary" :to="item.route">{{ item.cta }}</router-link>
                <router-link v-if="item.secondaryRoute" class="button-link" :to="item.secondaryRoute">{{ item.secondaryCta }}</router-link>
              </div>
            </article>
          </div>
          <div v-else-if="currentWorkMode === 'dual' && currentWorkCards.length" class="priority-dual-grid">
            <section class="priority-lane">
              <div class="priority-lane__header">
                <div>
                  <span class="priority-item__eyebrow">合同协作</span>
                  <strong>优先推进正在进行的合同。</strong>
                </div>
                <span class="soft-pill">{{ dualContractWorkCards.length }} 条合同</span>
              </div>
              <div class="priority-lane__list">
                <article
                  v-for="item in dualContractWorkCards"
                  :key="item.key"
                  class="priority-item priority-item--contract"
                >
                  <div class="priority-item__meta">
                    <span v-if="item.eyebrow" class="priority-item__eyebrow">{{ item.eyebrow }}</span>
                    <div class="tag-row tag-row--tight">
                      <span class="soft-pill">{{ item.status }}</span>
                      <span v-if="item.partner" class="soft-pill">{{ item.partner }}</span>
                    </div>
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.summary }}</p>
                    <div v-if="item.meta.length" class="tag-row tag-row--tight">
                      <span v-for="meta in item.meta" :key="`${item.key}-${meta}`" class="soft-pill">{{ meta }}</span>
                    </div>
                  </div>

                  <div class="priority-item__actions">
                    <router-link v-if="item.route" class="button-secondary" :to="item.route">{{ item.cta }}</router-link>
                    <router-link v-if="item.secondaryRoute" class="button-link" :to="item.secondaryRoute">{{ item.secondaryCta }}</router-link>
                  </div>
                </article>
              </div>
            </section>

            <section class="priority-lane">
              <div class="priority-lane__header">
                <div>
                  <span class="priority-item__eyebrow">消息线程</span>
                  <strong>先回到已经承载下一步动作的会话。</strong>
                </div>
                <span class="soft-pill">{{ dualMessageWorkCards.length }} 条会话</span>
              </div>
              <div class="priority-lane__list">
                <article
                  v-for="item in dualMessageWorkCards"
                  :key="item.key"
                  class="priority-item priority-item--message"
                >
                  <div class="priority-item__meta">
                    <span v-if="item.eyebrow" class="priority-item__eyebrow">{{ item.eyebrow }}</span>
                    <div class="tag-row tag-row--tight">
                      <span class="soft-pill">{{ item.status }}</span>
                      <span v-if="item.partner" class="soft-pill">{{ item.partner }}</span>
                    </div>
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.summary }}</p>
                    <div v-if="item.meta.length" class="tag-row tag-row--tight">
                      <span v-for="meta in item.meta" :key="`${item.key}-${meta}`" class="soft-pill">{{ meta }}</span>
                    </div>
                  </div>

                  <div class="priority-item__actions">
                    <router-link v-if="item.route" class="button-secondary" :to="item.route">{{ item.cta }}</router-link>
                    <router-link v-if="item.secondaryRoute" class="button-link" :to="item.secondaryRoute">{{ item.secondaryCta }}</router-link>
                  </div>
                </article>
              </div>
            </section>
          </div>
          <div v-else-if="currentWorkCards.length" class="priority-list">
            <article
              v-for="item in currentWorkCards"
              :key="item.key"
              class="priority-item"
              :class="item.kind ? `priority-item--${item.kind}` : ''"
            >
              <div class="priority-item__meta">
                <span v-if="item.eyebrow" class="priority-item__eyebrow">{{ item.eyebrow }}</span>
                <div class="tag-row tag-row--tight">
                  <span class="soft-pill">{{ item.status }}</span>
                  <span v-if="item.partner" class="soft-pill">{{ item.partner }}</span>
                </div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.summary }}</p>
                <div v-if="item.meta.length" class="tag-row tag-row--tight">
                  <span v-for="meta in item.meta" :key="`${item.key}-${meta}`" class="soft-pill">{{ meta }}</span>
                </div>
              </div>

              <div class="priority-item__actions">
                <router-link v-if="item.route" class="button-secondary" :to="item.route">{{ item.cta }}</router-link>
                <router-link v-if="item.secondaryRoute" class="button-link" :to="item.secondaryRoute">{{ item.secondaryCta }}</router-link>
              </div>
            </article>
          </div>
          <div v-else class="empty-state is-compact">
            <strong>{{ currentWorkEmptyState.title }}</strong>
            <p>{{ currentWorkEmptyState.copy }}</p>
            <router-link class="button-link" :to="currentWorkEmptyState.to">{{ currentWorkEmptyState.cta }}</router-link>
          </div>
        </section>

        <section v-if="showCollaborationModule" class="surface-card surface-card--quiet enterprise-module-card">
          <div class="enterprise-section-head enterprise-section-head--compact">
            <div class="enterprise-section-head__copy">
              <p class="upw-eyebrow">进行中合作</p>
              <h2>推进工作。</h2>
              <p>查看工作区、消息、验收和记录。</p>
            </div>
            <router-link class="button-secondary button-secondary--small" :to="roleRouteMap.enterprise.contracts">查看全部合作</router-link>
          </div>

          <div
            class="enterprise-module-grid"
            :class="{ 'enterprise-module-grid--single': collaborationModuleCards.length === 1 }"
          >
            <article
              v-for="item in collaborationModuleCards"
              :key="item.key"
              class="enterprise-module-item"
            >
              <div class="tag-row tag-row--tight enterprise-module-item__tags">
                <span
                  v-for="tag in item.tags"
                  :key="`${item.key}-${tag}`"
                  class="soft-pill"
                >
                  {{ tag }}
                </span>
              </div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.summary }}</p>
              <div class="enterprise-module-item__actions">
                <router-link v-if="item.route" class="button-primary button-primary--compact" :to="item.route">{{ item.cta }}</router-link>
                <router-link v-if="item.secondaryRoute" class="button-secondary button-secondary--small" :to="item.secondaryRoute">{{ item.secondaryCta }}</router-link>
              </div>
            </article>
          </div>
        </section>
      </main>

      <aside class="enterprise-dashboard-side">
        <section class="surface-card surface-card--tight surface-card--quiet surface-card--inbox enterprise-side-card">
          <div class="surface-card__header surface-card__header--stacked">
            <div>
              <p class="upw-eyebrow">招聘申请</p>
              <h2>按下一步动作整理申请、邀请和回复。</h2>
            </div>
            <span v-if="inboundItems.length" class="soft-pill">{{ inboundItems.length }} 条待处理</span>
          </div>
          <div v-if="inboundItems.length" class="summary-strip summary-strip--queue">
            <article v-if="proposalCount" class="summary-chip summary-chip--mini">
              <span>申请</span>
              <strong>{{ proposalCount }}</strong>
            </article>
            <article v-if="invitationCount" class="summary-chip summary-chip--mini">
              <span>邀请</span>
              <strong>{{ invitationCount }}</strong>
            </article>
            <article v-if="responseCount" class="summary-chip summary-chip--mini">
              <span>回复</span>
              <strong>{{ responseCount }}</strong>
            </article>
          </div>

          <div v-if="hiringInboxCards.length" class="summary-stack summary-stack--dense">
            <article
              v-for="(item, index) in hiringInboxCards"
              :key="item.key"
              class="summary-line summary-line--stacked summary-line--compact summary-line--queue"
            >
              <div class="summary-line__queue-head">
                <span class="summary-line__rank">队列 {{ String(index + 1).padStart(2, '0') }}</span>
                <span>{{ item.status }}</span>
              </div>
              <strong>{{ item.partner || item.title }}</strong>
              <p v-if="item.partner && item.partner !== item.title" class="summary-line__subhead">{{ item.title }}</p>
              <p>{{ item.summary }}</p>
              <div class="toolbar toolbar--wrap summary-line__footer">
                <router-link v-if="item.route" class="button-secondary button-secondary--small" :to="item.route">{{ item.cta }}</router-link>
                <router-link v-if="item.secondaryRoute" class="button-link" :to="item.secondaryRoute">{{ item.secondaryCta }}</router-link>
              </div>
            </article>
          </div>
          <div v-else class="empty-state is-compact">
            <strong>当前还没有新的招聘信号</strong>
            <p>新的申请、邀请和回复会继续汇总到这里。</p>
            <router-link class="button-link" :to="hiringInboxRoute">处理申请</router-link>
          </div>
        </section>

        <section class="surface-card surface-card--tight surface-card--quiet surface-card--supplemental surface-card--metrics enterprise-side-card">
          <div class="surface-card__header surface-card__header--stacked surface-card__header--compact">
            <div>
              <p class="upw-eyebrow">账单与记录</p>
              <h2>概览只留最关键的轻量指标。</h2>
            </div>
          </div>

          <div class="metrics-grid metrics-grid--sidebar">
            <article
              v-for="item in sidebarMetrics"
              :key="item.label"
              class="metric-card metric-card--sidebar"
            >
              <p class="metric-card__label">{{ item.label }}</p>
              <strong class="metric-card__value">{{ item.value }}</strong>
              <p v-if="item.note" class="metric-card__note">{{ item.note }}</p>
            </article>
          </div>
        </section>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import { getBusinessData } from '../services/api'
import { roleRouteMap } from '../utils/roleRoutes'

const dashboard = ref(null)
const errorMessage = ref('')

const metrics = computed(() => listOf(dashboard.value?.metrics))
const taskBoard = computed(() => normalizeContracts(listOf(dashboard.value?.taskBoard)))
const liveConversation = computed(() => normalizeMessages(listOf(dashboard.value?.liveConversation)))
const onboardingChecklist = computed(() => listOf(dashboard.value?.onboardingChecklist))
const recommendedTalents = computed(() => normalizeTalents(listOf(dashboard.value?.recommendedTalents)))
const contractSummary = computed(() => normalizeSpend(listOf(dashboard.value?.contractSummary)))
const sampleBrief = computed(() => dashboard.value?.sampleBrief || {})
const notificationItems = computed(() => listOf(dashboard.value?.notificationItems))
const rawTaskBoard = computed(() => listOf(dashboard.value?.taskBoard))
const heroTitle = computed(() => dashboard.value?.attentionHeadline || '先处理当前最需要你关注的企业决策。')
const allAttentionItems = computed(() => normalizeActions(listOf(dashboard.value?.attentionItems)))
const hiringAttentionItems = computed(() => allAttentionItems.value.filter(isHiringInboxItem))
const actionItems = computed(() => allAttentionItems.value.filter((item) => !isHiringInboxItem(item)))
const inboundItems = computed(() => {
  const actionSignatures = new Set(actionItems.value.flatMap(itemSignatures))
  return mergeUniqueItems([
    ...hiringAttentionItems.value,
    ...normalizeInboundQueue(notificationItems.value)
  ]).filter((item) =>
    !itemSignatures(item).some((signature) => actionSignatures.has(signature))
  )
})
const proposalCount = computed(() => countBySignals(inboundItems.value, ['proposal', 'application', '提案', '申请']))
const invitationCount = computed(() => countBySignals(inboundItems.value, ['invite', 'invitation', '邀约', '邀请']))
const responseCount = computed(() => countBySignals(inboundItems.value, ['offer', 'reply', '回复', 'response']))
const recruitingWorkCard = computed(() => rawTaskBoard.value.find((item) => normalizeText(item?.title) === '招聘申请') || null)
const recruitingWorkCount = computed(() => {
  const count = Number(recruitingWorkCard.value?.count)
  return Number.isFinite(count) && count > 0 ? count : 0
})
const activeContracts = computed(() => taskBoard.value)
const recentMessages = computed(() => liveConversation.value)
const spendingItems = computed(() => contractSummary.value)
const hiringInboxCards = computed(() => inboundItems.value.slice(0, 3))
const hiringInboxRoute = computed(() => {
  const firstInbound = inboundItems.value[0] || {}
  const taskId = textOf(firstInbound?.taskId, firstInbound?.summary?.taskId, firstInbound?.task?.taskId)
  const recruitingRoute = recruitingWorkCard.value?.route

  if (recruitingRoute) {
    return recruitingRoute
  }

  return {
    path: '/enterprise/recruiting',
    query: {
      source: 'workspace',
      ...(taskId ? { taskId } : {})
    }
  }
})
const hasDraftSignals = computed(() => Boolean(normalizeText([
  sampleBrief.value?.title,
  sampleBrief.value?.brief,
  sampleBrief.value?.category,
  sampleBrief.value?.budget,
  sampleBrief.value?.period
].filter(Boolean).join(' '))))
const hasCurrentWorkSignals = computed(() => Boolean(
  actionItems.value.length || inboundItems.value.length || activeContracts.value.length || recentMessages.value.length
))
const showHeroOverview = computed(() => !hasCurrentWorkSignals.value)
const heroHeadline = computed(() => {
  if (actionItems.value.length) {
    return '先处理当前决策'
  }
  if (inboundItems.value.length) {
    return '先处理招聘信号'
  }
  if (activeContracts.value.length) {
    return '继续推进当前协作'
  }
  if (recentMessages.value.length) {
    return '回到最近会话'
  }
  return heroTitle.value
})
const showPublishingPrep = computed(() =>
  !hasCurrentWorkSignals.value && hasDraftSignals.value
)
const heroLead = computed(() => {
  if (dashboard.value?.attentionLead) {
    return dashboard.value.attentionLead
  }
  if (actionItems.value.length) {
    return '先处理优先级最高的决策，再继续推进招聘、合同和消息。'
  }
  if (inboundItems.value.length) {
    return '先处理申请、邀请和回复，再决定是否开启新的工作流。'
  }
  if (activeContracts.value.length) {
    return '先推进当前合同，再决定是否开启新的工作流。'
  }
  if (recentMessages.value.length) {
    return '先处理最近会话，再决定是否开启新的工作流。'
  }
  return '在一个工作台里继续发布任务、处理招聘信号并推进当前合同。'
})
function routeForNotificationsGroup(groupKey = 'all', item = {}) {
  if (groupKey === 'matching') {
    const query = new URLSearchParams()
    query.set('source', 'workspace')
    if (item?.taskId) {
      query.set('taskId', String(item.taskId))
    }
    return `/enterprise/recruiting?${query.toString()}`
  }
  const query = new URLSearchParams()
  if (groupKey && groupKey !== 'all') {
    query.set('group', groupKey)
  }
  if (item?.id || item?.itemId) {
    query.set('itemId', String(item.itemId || item.id))
  }
  if (item?.taskId) {
    query.set('taskId', String(item.taskId))
  }
  if (item?.recordId) {
    query.set('recordId', String(item.recordId))
  }
  if (item?.roomKey || item?.room) {
    const room = String(item.roomKey || item.room)
    query.set('room', room)
    query.set('roomKey', room)
  }
  const queryString = query.toString()
  return `${roleRouteMap.enterprise.notifications}${queryString ? `?${queryString}` : ''}`
}
const heroPrimaryTarget = computed(() => {
  const firstAction = actionItems.value[0]
  if (firstAction) {
    const route = firstAction.route || roleRouteMap.enterprise.approvals
    return {
      route,
      label: firstAction.cta || ctaForDashboardRoute(route, '打开审批')
    }
  }

  const firstInbound = inboundItems.value[0]
  if (firstInbound) {
    const route = firstInbound.route || routeForNotificationsGroup('matching', firstInbound)
    return {
      route,
      label: firstInbound.cta || ctaForDashboardRoute(route, '处理申请')
    }
  }

  const firstContract = activeContracts.value[0]
  if (firstContract) {
    const route = firstContract.workspaceRoute || roleRouteMap.enterprise.contracts
    return {
      route,
      label: ctaForDashboardRoute(route, '打开工作区')
    }
  }

  const firstMessage = recentMessages.value[0]
  if (firstMessage) {
    return {
      route: firstMessage.route,
      label: ctaForDashboardRoute(firstMessage.route, '打开消息')
    }
  }

  return {
    route: hasDraftSignals.value ? roleRouteMap.enterprise.publish : roleRouteMap.enterprise.publish,
    label: hasDraftSignals.value ? '打开草稿' : '发布任务'
  }
})
const heroPrimaryRoute = computed(() => heroPrimaryTarget.value.route)
const heroPrimaryLabel = computed(() => heroPrimaryTarget.value.label)
const heroSummaryCards = computed(() => [
  {
    key: 'action',
    label: '待处理',
    value: displayCount(actionItems.value.length),
    note: actionItems.value.length ? '优先处理' : '当前没有紧急决策'
  },
  {
    key: 'inbox',
    label: '招聘申请',
    value: displayCount(inboundItems.value.length),
    note: inboundItems.value.length ? `已有 ${proposalCount.value} 位人才等待处理` : '当前比较安静'
  },
  {
    key: 'active',
    label: '当前协作',
    value: displayCount(activeContracts.value.length),
    note: activeContracts.value.length ? '继续推进合同' : '当前没有进行中协作'
  },
  {
    key: 'messages',
    label: '最近消息',
    value: displayCount(recentMessages.value.length),
    note: recentMessages.value.length ? '继续跟进会话' : '当前没有新的回复'
  }
])
const compactHeroSummaryCards = computed(() => {
  const cardMap = new Map(heroSummaryCards.value.map((item) => [item.key, item]))
  const pick = (keys) => keys.map((key) => cardMap.get(key)).filter(Boolean).slice(0, 2)

  if (actionItems.value.length) {
    return pick(['action', 'inbox'])
  }
  if (inboundItems.value.length) {
    return pick(['inbox', 'active'])
  }
  if (activeContracts.value.length) {
    return pick(['active', 'messages'])
  }
  if (recentMessages.value.length) {
    return pick(['messages', 'active'])
  }
  return pick(['action', 'inbox'])
})
const currentWorkMode = computed(() => {
  if (actionItems.value.length) {
    return 'action'
  }
  if (activeContracts.value.length && recentMessages.value.length) {
    return 'dual'
  }
  if (activeContracts.value.length) {
    return 'contracts'
  }
  if (recentMessages.value.length) {
    return 'messages'
  }
  return 'idle'
})
const currentWorkHeadline = computed(() => {
  switch (currentWorkMode.value) {
    case 'dual':
      return '把需要推进的合同和消息放进同一条当前工作线。'
    case 'contracts':
      return '优先推进当前还在进行中的合同。'
    case 'messages':
      return '先回到已经承载下一步动作的消息线程。'
    default:
      return '先处理需要你回应的决策事项。'
  }
})
const currentWorkCards = computed(() => {
  if (actionItems.value.length) {
    return actionItems.value.slice(0, 3).map((item) => ({
      ...item,
      meta: Array.isArray(item?.meta) ? item.meta : []
    }))
  }

  const contractCards = activeContracts.value.slice(0, 2).map((item, index) => {
    const route = item?.workspaceRoute || roleRouteMap.enterprise.contracts
    const secondaryRoute = item?.messageRoute || roleRouteMap.enterprise.messages
    const existingMeta = Array.isArray(item?.meta)
      ? item.meta.map((entry) => compactText(entry, 32)).filter(Boolean).slice(0, 2)
      : []
    return {
      key: item?.key || item?.taskId || `contract-${index}`,
      kind: 'contract',
      eyebrow: '合同工作区',
      title: compactText(item?.title || item?.label || '进行中的合同', 72),
      summary: compactText(item?.summary || item?.note || '从工作区继续推进当前合同。', 140),
      status: compactText(item?.status || item?.phase || '进行中合同', 32),
      partner: compactText(item?.partner || item?.counterpartName || item?.talentName || '', 32),
      meta: existingMeta.length ? existingMeta : [
        compactText(item?.stage || item?.milestone || '', 32),
        compactText(item?.budget || item?.updatedAt || '', 32)
      ].filter(Boolean),
      route,
      cta: ctaForDashboardRoute(route, '打开工作区'),
      secondaryRoute,
      secondaryCta: '打开消息'
    }
  })

  const messageCards = recentMessages.value.slice(0, 2).map((item, index) => {
    const route = item?.route || roleRouteMap.enterprise.messages
    const secondaryRoute = item?.workspaceRoute || roleRouteMap.enterprise.contracts
    const existingMeta = Array.isArray(item?.meta)
      ? item.meta.map((entry) => compactText(entry, 32)).filter(Boolean).slice(0, 2)
      : []
    return {
      key: item?.key || item?.room || item?.roomKey || `message-${index}`,
      kind: 'message',
      eyebrow: '消息线程',
      title: compactText(item?.title || item?.subject || item?.partner || '最近会话', 72),
      summary: compactText(item?.summary || item?.preview || item?.note || '先打开已经承载下一步动作的会话。', 140),
      status: compactText(item?.status || item?.topic || '最近回复', 32),
      partner: compactText(item?.partner || item?.counterpartName || item?.taskTitle || '', 32),
      meta: existingMeta.length ? existingMeta : [
        compactText(item?.time || item?.timeLabel || item?.updatedAt || '', 32),
        compactText(item?.context || item?.taskTitle || item?.recordLabel || '', 32)
      ].filter(Boolean),
      route,
      cta: ctaForDashboardRoute(route, '打开会话'),
      secondaryRoute,
      secondaryCta: '打开工作区'
    }
  })

  if (currentWorkMode.value === 'dual') {
    return [...contractCards, ...messageCards]
  }

  if (activeContracts.value.length) {
    return activeContracts.value.slice(0, 3).map((item, index) => {
      const route = item?.workspaceRoute || roleRouteMap.enterprise.contracts
      const secondaryRoute = item?.messageRoute || roleRouteMap.enterprise.messages
      const existingMeta = Array.isArray(item?.meta)
        ? item.meta.map((entry) => compactText(entry, 32)).filter(Boolean).slice(0, 2)
        : []
      return {
        key: item?.key || item?.taskId || `contract-${index}`,
        kind: 'contract',
        eyebrow: '合同工作区',
        title: compactText(item?.title || item?.label || '进行中的合同', 72),
        summary: compactText(item?.summary || item?.note || '从工作区继续推进当前合同。', 140),
        status: compactText(item?.status || item?.phase || '进行中合同', 32),
        partner: compactText(item?.partner || item?.counterpartName || item?.talentName || '', 32),
        meta: existingMeta.length ? existingMeta : [
          compactText(item?.stage || item?.milestone || '', 32),
          compactText(item?.budget || item?.updatedAt || '', 32)
        ].filter(Boolean),
        route,
        cta: ctaForDashboardRoute(route, '打开工作区'),
        secondaryRoute,
        secondaryCta: item?.messageRoute ? '打开消息' : '打开消息'
      }
    })
  }

  if (recentMessages.value.length) {
    return recentMessages.value.slice(0, 3).map((item, index) => {
      const route = item?.route || roleRouteMap.enterprise.messages
      const secondaryRoute = item?.workspaceRoute || roleRouteMap.enterprise.messages
      const existingMeta = Array.isArray(item?.meta)
        ? item.meta.map((entry) => compactText(entry, 32)).filter(Boolean).slice(0, 2)
        : []
      return {
        key: item?.key || item?.room || item?.roomKey || `message-${index}`,
        kind: 'message',
        eyebrow: '消息线程',
        title: compactText(item?.title || item?.subject || item?.partner || '最近会话', 72),
        summary: compactText(item?.summary || item?.preview || item?.note || '先打开已经承载下一步动作的会话。', 140),
        status: compactText(item?.status || item?.topic || '最近回复', 32),
        partner: compactText(item?.partner || item?.counterpartName || item?.taskTitle || '', 32),
        meta: existingMeta.length ? existingMeta : [
          compactText(item?.time || item?.timeLabel || item?.updatedAt || '', 32),
          compactText(item?.context || item?.taskTitle || item?.recordLabel || '', 32)
        ].filter(Boolean),
        route,
        cta: ctaForDashboardRoute(route, '打开会话'),
        secondaryRoute,
        secondaryCta: item?.workspaceRoute ? '打开工作区' : '打开合同'
      }
    })
  }

  return []
})
const dualContractWorkCards = computed(() => currentWorkCards.value.filter((item) => item.kind === 'contract'))
const dualMessageWorkCards = computed(() => currentWorkCards.value.filter((item) => item.kind === 'message'))
const currentWorkCountLabel = computed(() =>
  currentWorkCards.value.length
    ? currentWorkMode.value === 'contracts'
      ? `${currentWorkCards.value.length} 条合同`
      : currentWorkMode.value === 'messages'
        ? `${currentWorkCards.value.length} 条会话`
        : currentWorkMode.value === 'dual'
          ? `${Math.min(activeContracts.value.length, 2)} 条合同 · ${Math.min(recentMessages.value.length, 2)} 条会话`
        : `${currentWorkCards.value.length} 条事项`
    : ''
)
const currentWorkEmptyState = computed(() => {
  const firstInbound = inboundItems.value[0]
  if (firstInbound) {
    return {
      title: '招聘流程已经在推进',
      copy: '先处理下面的招聘申请，再决定是否开启新的任务流程。',
      cta: '处理申请',
      to: hiringInboxRoute.value
    }
  }

  const firstContract = activeContracts.value[0]
  if (firstContract) {
    return {
      title: '进行中的合同已经在推进',
      copy: '先把当前工作区推进下去，再决定是否发布新的任务。',
      cta: '打开工作区',
      to: firstContract.workspaceRoute || roleRouteMap.enterprise.contracts
    }
  }

  const firstMessage = recentMessages.value[0]
  if (firstMessage) {
    return {
      title: '最近的会话已经承载下一步动作',
      copy: '先打开最新消息线程，再决定是否开启新的任务流程。',
      cta: '打开消息',
      to: firstMessage.route || roleRouteMap.enterprise.messages
    }
  }

  if (hasDraftSignals.value) {
    return {
      title: '草稿已经准备好继续编辑',
      copy: '等当前工作清空后，回到这份草稿继续，而不是重新新建一条发布。',
      cta: '打开草稿',
      to: roleRouteMap.enterprise.publish
    }
  }

  return {
    title: '当前还没有新的待处理事项',
    copy: '审批、变更和验收决策会优先汇总到这里。',
    cta: '发布任务',
    to: roleRouteMap.enterprise.publish
  }
})
const sidebarMetrics = computed(() => {
  const metricItems = metrics.value
    .map((item, index) => ({
      label: compactText(item?.label || item?.title || item?.name || `指标 ${index + 1}`, 36),
      value: textOf(item?.value, item?.amount, item?.count, item?.total, '—'),
      note: compactText(item?.note || item?.description || item?.hint || '', 64)
    }))
    .filter((item) => item.label)
    .slice(0, 4)

  if (metricItems.length) {
    return metricItems
  }

  return heroSummaryCards.value.map((item) => ({
    label: item.label,
    value: item.value,
    note: item.note
  }))
})
const showSidebarMetrics = computed(() =>
  hasCurrentWorkSignals.value
  && !showPublishingPrep.value
  && !showContractMessageLeadState.value
  && sidebarMetrics.value.length > 0
)
const showSidebarColumn = computed(() => showPublishingPrep.value || showSidebarMetrics.value)
const summaryRailCards = computed(() => buildSummaryRailCards())
const showContractMessageLeadState = computed(() =>
  !actionItems.value.length
  && !inboundItems.value.length
  && (activeContracts.value.length > 0 || recentMessages.value.length > 0)
)
const showSummaryRail = computed(() =>
  summaryRailCards.value.length > 0
  && (!hasCurrentWorkSignals.value || showPublishingPrep.value || showContractMessageLeadState.value)
)
const showHiringInboxPanel = computed(() =>
  inboundItems.value.length > 0 || !showContractMessageLeadState.value
)
const heroFocusCards = computed(() => buildHeroFocusCards())
const overviewCards = computed(() => {
  const firstContract = activeContracts.value[0]
  const firstMessage = recentMessages.value[0]
  return [
    {
      key: 'attention',
      label: '待处理',
      value: displayCount(actionItems.value.length),
      note: actionItems.value.length ? '先处理当前决策和审批事项。' : '当前没有新的待处理。',
      route: heroPrimaryRoute.value,
      cta: heroPrimaryLabel.value
    },
    {
      key: 'inbox',
      label: '招聘申请',
      value: displayCount(inboundItems.value.length || recruitingWorkCount.value),
      note: inboundItems.value.length
        ? `有 ${proposalCount.value} 位人才等待处理。`
        : recruitingWorkCount.value
          ? compactText(recruitingWorkCard.value?.summary || `有 ${recruitingWorkCount.value} 份申请等待处理。`, 96)
          : '新的申请会先汇总到这里。',
      route: hiringInboxRoute.value,
      cta: '处理申请'
    },
    {
      key: 'contracts',
      label: '进行中合作',
      value: displayCount(activeContracts.value.length),
      note: activeContracts.value.length ? '协作、版本和验收沿这条线继续推进。' : '当前还没有进行中的合作。',
      route: firstContract?.workspaceRoute || roleRouteMap.enterprise.contracts,
      cta: '查看合作'
    },
    {
      key: 'messages',
      label: '消息跟进',
      value: displayCount(recentMessages.value.length),
      note: recentMessages.value.length ? '先回到最近会话继续当前上下文。' : '新的会话会继续汇总到这里。',
      route: firstMessage?.route || roleRouteMap.enterprise.messages,
      cta: '打开消息'
    }
  ]
})
const collaborationModuleCards = computed(() => {
  const cards = []
  const firstContract = activeContracts.value[0]
  if (firstContract) {
    cards.push({
      key: firstContract?.key || firstContract?.taskId || 'collaboration-contract',
      title: compactText(firstContract?.title || firstContract?.label || '进行中的合作', 48),
      summary: compactText(firstContract?.summary || firstContract?.note || '继续查看里程碑推进、当前版本和下一轮反馈。', 96),
      tags: [
        compactText(firstContract?.status || firstContract?.phase || '协作中', 20),
        compactText(firstContract?.stage || firstContract?.milestone || '正在推进', 20)
      ].filter(Boolean),
      route: firstContract?.workspaceRoute || roleRouteMap.enterprise.contracts,
      cta: '打开工作区',
      secondaryRoute: firstContract?.recordRoute || roleRouteMap.enterprise.records,
      secondaryCta: '查看记录'
    })
  }
  const firstMessage = recentMessages.value[0]
  if (firstMessage) {
    cards.push({
      key: firstMessage?.key || firstMessage?.room || firstMessage?.roomKey || 'collaboration-message',
      title: compactText(firstMessage?.title || firstMessage?.subject || '最近消息也挂在合作链下面处理。', 48),
      summary: compactText(firstMessage?.summary || firstMessage?.preview || '消息不再单独占首页主视觉，而是作为合作推进的一个子入口存在。', 96),
      tags: [
        compactText(firstMessage?.status || firstMessage?.topic || '待回复', 20),
        compactText(firstMessage?.time || firstMessage?.timeLabel || '最近消息', 20)
      ].filter(Boolean),
      route: firstMessage?.route || roleRouteMap.enterprise.messages,
      cta: '打开消息页',
      secondaryRoute: firstMessage?.workspaceRoute || roleRouteMap.enterprise.contracts,
      secondaryCta: '查看上下文'
    })
  }
  return cards
})
const showCollaborationModule = computed(() => collaborationModuleCards.value.length > 0)

function listOf(value) {
  return Array.isArray(value) ? value : []
}

function displayCount(value) {
  return value > 0 ? String(value) : '—'
}

function textOf(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function compactText(value, limit = 90) {
  const text = normalizeText(value)
  if (!text) return ''
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text
}

function hasHiringKeyword(...values) {
  const haystack = normalizeText(values.filter(Boolean).join(' ')).toLowerCase()
  return [
    'proposal',
    'application',
    'invite',
    'invitation',
    'offer',
    'reply',
    'response',
    '提案',
    '申请',
    '邀约',
    '邀请',
    '回复'
  ].some((keyword) => haystack.includes(keyword.toLowerCase()))
}

function itemSignatures(item = {}) {
  const taskId = normalizeText(item?.taskId || '')
  const roomKey = normalizeText(item?.roomKey || item?.room || '')
  const title = normalizeText(item?.title || item?.label || '')
  const partner = normalizeText(item?.partner || item?.talentName || item?.counterpartName || '')
  return [
    taskId ? `task:${taskId}` : '',
    roomKey ? `room:${roomKey}` : '',
    title && partner ? `match:${title}::${partner}` : ''
  ].filter(Boolean)
}

function structuredActionTokens(item = {}) {
  const routePath = typeof item?.route === 'string' ? item.route : String(item?.route?.path || '')
  return normalizeText([
    item?.kind,
    item?.type,
    item?.source,
    item?.group,
    item?.category,
    item?.workflow,
    routePath
  ].filter(Boolean).join(' ')).toLowerCase()
}

function actionOwnerKind(item = {}) {
  const tokens = structuredActionTokens(item)
  if (item?.financeAction || /settlement|finance|billing/.test(tokens)) {
    return 'settlement'
  }
  if ((item?.recordId || item?.taskId) && /review|accept/.test(tokens)) {
    return 'review'
  }
  if (item?.approvalId || /approval|confirm/.test(tokens)) {
    return 'approval'
  }
  if (/matching|proposal|application|invite|offer|reply/.test(tokens)) {
    return 'hiring'
  }
  if (item?.roomKey || /message|chat/.test(tokens)) {
    return 'messages'
  }
  if (item?.recordId || /record|history/.test(tokens)) {
    return 'record'
  }
  if (item?.taskId || /task|contract|workspace/.test(tokens)) {
    return 'workspace'
  }
  if (/talent|market/.test(tokens)) {
    return 'market'
  }
  return 'notifications'
}

function isHiringInboxItem(item = {}) {
  return actionOwnerKind(item) === 'hiring'
}

function mergeUniqueItems(items) {
  const seen = new Set()
  return items.filter((item) => {
    const signatures = itemSignatures(item)
    const keys = signatures.length
      ? signatures
      : [`fallback:${normalizeText([item?.title, item?.partner, item?.status, item?.summary].join('|'))}`]
    const duplicate = keys.some((key) => seen.has(key))
    if (duplicate) {
      return false
    }
    keys.forEach((key) => seen.add(key))
    return true
  })
}

function routeForMessage(item = {}) {
  if (item.route) return item.route
  if (item.roomKey) {
    const query = new URLSearchParams()
    if (item.taskId) query.set('taskId', String(item.taskId))
    query.set('room', String(item.roomKey))
    query.set('roomKey', String(item.roomKey))
    query.set('source', 'messages')
    query.set('surface', 'messages')
    if (item.taskId) query.set('originTaskId', String(item.taskId))
    query.set('originSource', 'messages')
    return `${roleRouteMap.enterprise.messages}?${query.toString()}`
  }
  if (item.taskId) {
    return `${roleRouteMap.enterprise.workspace}?taskId=${encodeURIComponent(String(item.taskId))}&source=contract&surface=contract&originSource=contract&originTaskId=${encodeURIComponent(String(item.taskId))}`
  }
  return roleRouteMap.enterprise.notifications
}

function routeForWorkspace(item = {}) {
  if (item.route) return item.route
  if (item.taskId || item.id) {
    const taskId = item.taskId || item.id
    const query = new URLSearchParams()
    query.set('taskId', String(taskId))
    if (item.roomKey) {
      query.set('room', String(item.roomKey))
      query.set('roomKey', String(item.roomKey))
    }
    query.set('source', 'contract')
    query.set('surface', 'contract')
    query.set('originSource', 'contract')
    query.set('originTaskId', String(taskId))
    return `${roleRouteMap.enterprise.workspace}?${query.toString()}`
  }
  return roleRouteMap.enterprise.notifications
}

function routeForReview(item = {}) {
  const query = new URLSearchParams()
  if (item?.taskId) query.set('taskId', String(item.taskId))
  if (item?.recordId) query.set('recordId', String(item.recordId))
  if (item?.roomKey) {
    query.set('room', String(item.roomKey))
    query.set('roomKey', String(item.roomKey))
  }
  query.set('source', 'reviews')
  return `${roleRouteMap.enterprise.acceptance}?${query.toString()}`
}

function routeForRecord(item = {}) {
  if (item?.recordId) {
    return roleRouteMap.enterprise.recordDetail(item.recordId)
  }
  return roleRouteMap.enterprise.records
}

function routeForSettlement(item = {}) {
  if (!item?.recordId) {
    return roleRouteMap.enterprise.records
  }
  const query = new URLSearchParams()
  if (item?.taskId) query.set('taskId', String(item.taskId))
  if (item?.financeAction) query.set('financeAction', String(item.financeAction))
  const queryString = query.toString()
  return `${roleRouteMap.enterprise.recordDetail(item.recordId)}/settlement${queryString ? `?${queryString}` : ''}`
}

function ctaForDashboardRoute(target, fallback = '打开当前事项') {
  const path = typeof target === 'string' ? target : String(target?.path || '')
  const isMatchingQueue = (
    (typeof target === 'string' && target.includes('group=matching'))
    || target?.query?.group === 'matching'
  )
  if (!path) {
    return fallback
  }
  if (path.includes('/messages') || path.includes('/chat')) {
    return '打开消息'
  }
  if (path.includes('/acceptance')) {
    return '打开验收'
  }
  if (path.includes('/settlement')) {
    return '打开结算'
  }
  if (/\/records\/[^/]+$/.test(path)) {
    return '打开记录'
  }
  if (path.includes('/records')) {
    return '打开历史'
  }
  if (path.includes('/workspace')) {
    return '打开工作区'
  }
  if (path.includes('/recruiting')) {
    return '处理申请'
  }
  if (path.includes('/approvals')) {
    return '打开审批'
  }
  if (path.includes('/talents')) {
    return '搜索人才'
  }
  if (path.includes('/notifications')) {
    return isMatchingQueue ? '处理申请' : '查看待处理队列'
  }
  return fallback
}

function routeForTalent(talent = {}) {
  const slug = talent.slug || talent.talentSlug || talent.talentUserId || talent.platformUserId
  return roleRouteMap.enterprise.talentDetail(slug)
}

function routeForInvite(talent = {}) {
  return roleRouteMap.enterprise.publishWithTalent(
    {
      talentUserId: talent.talentUserId || talent.platformUserId,
      slug: talent.slug,
      name: talent.name
    },
    'client-dashboard'
  )
}

function normalizeActions(items) {
  return items.slice(0, 4).map((item, index) => {
    const kind = normalizeText(item?.kind || '').toLowerCase()
    const owner = actionOwnerKind(item)
    const title = item?.title || item?.label || `待处理事项 ${index + 1}`
    const summary = compactText(item?.summary || item?.note || item?.description || '先处理这条事项，再决定合同的下一步动作。')
    const status = item?.badge || item?.status || '待处理'
    const partner = item?.partner || item?.talentName || item?.counterpartName || ''
    const meta = listOf(item?.tags || item?.meta || item?.details).slice(0, 3)
    const route = item?.route
      || (owner === 'settlement' ? routeForSettlement(item) : '')
      || (owner === 'review' ? routeForReview(item) : '')
      || (owner === 'approval' ? roleRouteMap.enterprise.approvals : '')
      || (owner === 'messages' ? routeForMessage(item) : '')
      || (owner === 'record' ? routeForRecord(item) : '')
      || (owner === 'workspace' ? routeForWorkspace(item) : '')
      || (owner === 'market' ? roleRouteMap.enterprise.market : '')
      || (owner === 'hiring' ? routeForNotificationsGroup('matching', item) : '')
      || (kind.includes('message') ? roleRouteMap.enterprise.messages : '')
      || (kind.includes('talent') ? roleRouteMap.enterprise.market : '')
      || (kind.includes('task') ? routeForWorkspace(item) : '')
      || (item?.roomKey ? routeForMessage(item) : '')
      || (item?.taskId ? routeForWorkspace(item) : roleRouteMap.enterprise.notifications)
    const cta = item?.actionLabel
      || item?.cta
      || ctaForDashboardRoute(route, owner === 'hiring' ? '处理申请' : '打开当前事项')
    const secondaryRoute = item?.secondaryRoute
      || (owner === 'settlement' || owner === 'review' || owner === 'record'
        ? routeForRecord(item)
        : item?.roomKey
          ? routeForMessage(item)
          : item?.taskId
            ? routeForWorkspace(item)
            : '')
    const secondaryCta = item?.secondaryActionLabel || (secondaryRoute ? ctaForDashboardRoute(secondaryRoute, '继续处理') : '')
    return {
      key: item?.id || item?.taskId || item?.roomKey || `${title}-${index}`,
      title,
      summary,
      status,
      partner,
      topic: item?.topic || item?.tag || '',
      meta,
      kind: item?.kind || item?.type || item?.group || '',
      source: item?.source || item?.group || item?.category || '',
      taskId: item?.taskId || '',
      recordId: item?.recordId || '',
      approvalId: item?.approvalId || '',
      financeAction: item?.financeAction || '',
      roomKey: item?.roomKey || item?.room || '',
      route,
      cta,
      secondaryRoute,
      secondaryCta
    }
  })
}

function normalizeInboundQueue(items) {
  const keywords = ['proposal', 'application', '提案', '申请', 'invite', '邀请', 'offer', '邀约', 'response', 'reply', '回复']
  return items
    .filter((item) => {
      const haystack = normalizeText([item?.kind, item?.title, item?.label, item?.summary, item?.note, item?.status].filter(Boolean).join(' ')).toLowerCase()
      return actionOwnerKind(item) === 'hiring' || keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))
    })
    .slice(0, 4)
    .map((item, index) => {
      const title = item?.title || item?.label || `申请 ${index + 1}`
      const summary = compactText(item?.summary || item?.note || item?.description || '先看清这条机会，再决定下一步动作。')
      const partner = item?.partner || item?.talentName || item?.counterpartName || '待确认人才'
      const status = item?.badge || item?.status || '等待回复'
      const route = item?.route || routeForNotificationsGroup('matching', item)
      const cta = item?.actionLabel || item?.cta || ctaForDashboardRoute(route, '处理申请')
      const secondaryRoute = item?.secondaryRoute || (item?.roomKey ? routeForMessage(item) : item?.taskId ? routeForWorkspace(item) : roleRouteMap.enterprise.market)
      const secondaryCta = item?.secondaryActionLabel || ctaForDashboardRoute(secondaryRoute, '继续处理')
      return {
        key: item?.id || item?.taskId || item?.roomKey || `${title}-${index}`,
        title,
        summary,
        partner,
        status,
        kind: item?.kind || item?.type || item?.group || '',
        source: item?.source || item?.group || item?.category || '',
        taskId: item?.taskId || '',
        roomKey: item?.roomKey || item?.room || '',
        route,
        cta,
        secondaryRoute,
        secondaryCta
      }
    })
}

function normalizeContracts(items) {
  return items.slice(0, 4).map((item, index) => {
    const title = item?.title || item?.taskTitle || item?.taskName || `合同 ${index + 1}`
    const summary = compactText(item?.summary || item?.brief || item?.note || '继续在当前合同里推进这次合作。')
    const partner = item?.partner || item?.talentName || item?.counterpartName || '待确认人才'
    const status = item?.status || item?.stage || '进行中'
    const updatedAt = item?.updatedAt || item?.time || '等待同步'
    const meta = listOf(item?.meta || item?.tags || item?.milestones).slice(0, 3)
    return {
      key: item?.taskId || item?.id || `contract-${index}`,
      title,
      summary,
      partner,
      status,
      updatedAt,
      meta,
      workspaceRoute: routeForWorkspace(item),
      messageRoute: routeForMessage(item)
    }
  })
}

function normalizeMessages(items) {
  return items.slice(0, 4).map((item, index) => ({
    key: item?.id || item?.taskId || item?.roomKey || `message-${index}`,
    title: item?.title || item?.taskTitle || item?.roomTitle || '消息线程',
    summary: compactText(item?.summary || item?.lastMessage || item?.note || '会话动态会继续汇总到这里。'),
    status: item?.status || item?.badge || '待处理',
    time: item?.time || item?.updatedAt || '刚刚更新',
    partner: item?.partner || item?.talentName || item?.counterpartName || '待确认人才',
    route: routeForMessage(item),
    workspaceRoute: routeForWorkspace(item)
  }))
}

function normalizeTalents(items) {
  return items.slice(0, 4).map((talent, index) => ({
    key: talent?.talentUserId || talent?.platformUserId || talent?.slug || `talent-${index}`,
    name: talent?.name || talent?.displayName || '未命名人才',
    role: talent?.role || talent?.headline || '专业方向待同步',
    score: talent?.score || talent?.rating || '暂无评分',
    signals: [
      talent?.jobSuccess,
      talent?.responseTime,
      talent?.availability,
      talent?.location,
    ].filter(Boolean).slice(0, 2),
    tags: listOf(talent?.tags || talent?.services).slice(0, 3),
    detailRoute: routeForTalent(talent),
    inviteRoute: routeForInvite(talent)
  }))
}

function normalizeSpend(items) {
  return items.slice(0, 4).map((item, index) => ({
    key: item?.label || item?.title || `spend-${index}`,
    title: item?.label || item?.title || '项目',
    value: item?.value || item?.amount || '等待同步',
    note: compactText(item?.note || item?.description || '支出总览和账单状态会继续汇总到这里。')
  }))
}

function buildSummaryRailCards() {
  const firstContract = activeContracts.value[0]
  const firstMessage = recentMessages.value[0]
  const firstSpend = spendingItems.value[0]
  return [
    {
      label: '进行中合同',
      title: firstContract?.title || '当前还没有进行中的合同',
      note: firstContract?.summary || '工作区里的当前合同会继续在这里保持同步。',
      badge: displayCount(activeContracts.value.length),
      route: firstContract?.workspaceRoute || roleRouteMap.enterprise.contracts,
      cta: firstContract ? '打开工作区' : '查看全部合同'
    },
    {
      label: '消息',
      title: firstMessage?.title || '当前还没有最近会话',
      note: firstMessage?.summary || '新的回复会继续自动汇总到这里。',
      badge: displayCount(recentMessages.value.length),
      route: firstMessage?.route || roleRouteMap.enterprise.messages,
      cta: firstMessage ? '打开会话' : '打开消息'
    },
    {
      label: '账单',
      title: firstSpend?.title || '账单概览',
      note: firstSpend?.note || '支出总览和账单状态会继续在这里汇总。',
      badge: firstSpend?.value || '待同步',
      route: roleRouteMap.enterprise.billing || roleRouteMap.enterprise.records,
      cta: '打开账单'
    }
  ]
}

function buildHeroFocusCards() {
  const cards = []

  if (actionItems.value[0]) {
    const route = actionItems.value[0].route || roleRouteMap.enterprise.approvals
    cards.push({
      label: '当前',
      title: actionItems.value[0].title,
      note: actionItems.value[0].summary,
      cta: actionItems.value[0].cta || ctaForDashboardRoute(route, '打开审批'),
      route
    })
  }

  if (inboundItems.value[0]) {
    const route = inboundItems.value[0].route || routeForNotificationsGroup('matching', inboundItems.value[0])
    cards.push({
      label: '招聘下一步',
      title: inboundItems.value[0].title,
      note: inboundItems.value[0].summary,
      cta: inboundItems.value[0].cta || ctaForDashboardRoute(route, '处理申请'),
      route
    })
  }

  if (cards.length < 2 && activeContracts.value[0]) {
    const route = activeContracts.value[0].workspaceRoute || roleRouteMap.enterprise.contracts
    cards.push({
      label: '当前合同',
      title: activeContracts.value[0].title,
      note: activeContracts.value[0].summary,
      cta: ctaForDashboardRoute(route, '打开工作区'),
      route
    })
  }

  if (cards.length < 2 && recentMessages.value[0]) {
    cards.push({
      label: '最近回复',
      title: recentMessages.value[0].title,
      note: recentMessages.value[0].summary,
      cta: ctaForDashboardRoute(recentMessages.value[0].route, '打开消息'),
      route: recentMessages.value[0].route
    })
  }

  if (cards.length < 2) {
    const firstTalent = recommendedTalents.value[0]
    cards.push({
      label: '推荐人才',
      title: firstTalent?.name || '继续寻找下一个更匹配的人选',
      note: firstTalent?.role || '推荐人才和当前招聘信号会继续先出现在这里。',
      cta: firstTalent ? '查看档案' : '搜索人才',
      route: firstTalent?.detailRoute || roleRouteMap.enterprise.market
    })
  }

  return cards.slice(0, 2)
}

function countBySignals(items, keywords) {
  return items.filter((item) => {
    const haystack = normalizeText([item?.title, item?.summary, item?.status, item?.partner].filter(Boolean).join(' ')).toLowerCase()
    return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))
  }).length
}

onMounted(async () => {
  try {
    const payload = await getBusinessData()
    dashboard.value = payload
    if (payload?.requestError) {
      errorMessage.value = payload.requestError
    }
  } catch (error) {
    errorMessage.value = error?.message || '企业工作台数据暂时无法加载。'
  }
})
</script>

<style scoped>
.upw-workspace-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-band {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 30px;
  border-radius: 28px;
  border: 1px solid rgba(16, 24, 40, 0.08);
  background:
    radial-gradient(circle at top left, rgba(255, 193, 7, 0.12), transparent 30%),
    linear-gradient(180deg, #fffdf8 0%, #ffffff 58%);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
}

.hero-band h1 {
  margin: 10px 0 12px;
  max-width: 18ch;
  font-size: clamp(2rem, 4vw, 3.45rem);
  line-height: 0.95;
  letter-spacing: -0.05em;
  color: #102033;
}

.hero-band p {
  max-width: 68ch;
  margin: 0;
  line-height: 1.7;
  color: #53616f;
}

.hero-band__actions,
.hero-band__chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero-band__actions {
  align-self: flex-start;
}

.hero-band__chip-row {
  margin-top: 18px;
}

.hero-band__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.hero-summary-card {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid rgba(16, 24, 40, 0.08);
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(8px);
}

.hero-summary-card span {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #667381;
}

.hero-summary-card strong {
  font-size: 1.5rem;
  line-height: 1;
  color: #102033;
}

.hero-summary-card p {
  max-width: none;
  font-size: 0.92rem;
  line-height: 1.45;
}

.hero-band__focus {
  display: grid;
  gap: 12px;
  min-width: min(380px, 38vw);
}

.focus-tile {
  padding: 16px 18px;
  border-radius: 22px;
  border: 1px solid rgba(16, 24, 40, 0.08);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.focus-tile span {
  display: block;
  margin-bottom: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #108a00;
}

.focus-tile strong {
  display: block;
  font-size: 1.18rem;
  line-height: 1.25;
  color: #102033;
}

.focus-tile p {
  margin: 8px 0 0;
  color: #596878;
  line-height: 1.55;
}

.focus-tile__action {
  margin-top: 10px;
  align-self: flex-start;
}

.upw-eyebrow {
  display: inline-flex;
  align-items: center;
  margin: 0;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #108a00;
}

.workspace-grid {
  display: grid;
  gap: 24px;
}

.workspace-grid--dashboard {
  grid-template-columns: minmax(0, 1.28fr) minmax(0, 0.72fr);
  align-items: start;
}

.workspace-grid--single {
  grid-template-columns: minmax(0, 1fr);
}

.workspace-main-stack,
.workspace-sidebar-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.workspace-secondary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.82fr);
  gap: 18px;
}

.workspace-secondary-grid--single {
  grid-template-columns: minmax(0, 1fr);
}

.workspace-sidebar-stack {
  gap: 14px;
}

.surface-card {
  padding: 24px;
  border-radius: 26px;
  border: 1px solid rgba(16, 24, 40, 0.08);
  background: #fff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.surface-card--spotlight {
  background: linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
}

.surface-card--tight {
  padding: 20px;
}

.surface-card--quiet {
  box-shadow: none;
  background: #fbfcfe;
}

.surface-card__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.surface-card__header--stacked {
  flex-direction: column;
  align-items: flex-start;
}

.surface-card__header h2 {
  margin: 6px 0 0;
  font-size: 1.45rem;
  line-height: 1.1;
  color: #102033;
}

.priority-list,
.timeline-list,
.mini-feed-list,
.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
}

.priority-dual-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.priority-lane {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(16, 24, 40, 0.08);
  background: linear-gradient(180deg, rgba(245, 247, 250, 0.92) 0%, #ffffff 100%);
}

.priority-lane__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.priority-lane__header strong {
  color: #102033;
}

.priority-lane__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-list--compact,
.recommendation-list--dense {
  margin-top: 16px;
}

.priority-item,
.timeline-item,
.mini-feed-item,
.recommendation-card,
.summary-line {
  border: 1px solid rgba(16, 24, 40, 0.08);
  border-radius: 20px;
  background: #fff;
}

.priority-item,
.recommendation-card {
  padding: 18px;
}

.priority-item {
  display: flex;
  gap: 18px;
  justify-content: space-between;
}

.priority-item__meta p,
.timeline-item p,
.mini-feed-item p,
.recommendation-card p,
.draft-preview p,
.summary-line p,
.empty-state p,
.metric-card__note,
.button-link {
  margin: 0;
  color: #566473;
  line-height: 1.65;
}

.priority-item__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  justify-content: center;
}

.priority-item__eyebrow {
  display: inline-flex;
  margin-bottom: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5f6f7e;
}

.priority-item--contract {
  border-color: rgba(16, 138, 0, 0.14);
  background: linear-gradient(180deg, rgba(16, 138, 0, 0.03) 0%, #ffffff 100%);
}

.priority-item--contract .priority-item__eyebrow {
  color: #108a00;
}

.priority-item--message {
  border-color: rgba(2, 132, 199, 0.14);
  background: linear-gradient(180deg, rgba(2, 132, 199, 0.04) 0%, #ffffff 100%);
}

.priority-item--message .priority-item__eyebrow {
  color: #0369a1;
}

@media (max-width: 1080px) {
  .priority-dual-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  padding: 18px;
}

.metric-card__label {
  margin: 0 0 6px;
  font-size: 0.84rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6d7a89;
}

.metric-card__value {
  display: block;
  font-size: 1.8rem;
  line-height: 1;
  letter-spacing: -0.04em;
  color: #102033;
}

.two-column-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.timeline-item,
.mini-feed-item {
  padding: 18px;
}

.timeline-item__head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.timeline-item__head p,
.recommendation-card__copy p {
  margin: 6px 0 0;
}

.meta-line,
.tag-row,
.summary-strip,
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-line {
  margin-top: 8px;
  color: #6a7683;
  font-size: 0.92rem;
}

.summary-strip {
  margin-top: 16px;
}

.summary-chip {
  display: grid;
  gap: 6px;
  flex: 1 1 0;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(16, 24, 40, 0.08);
  background: #f8fafc;
}

.summary-chip span {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6d7a89;
}

.summary-chip strong {
  font-size: 1.2rem;
  color: #102033;
}

.soft-pill,
.button-primary,
.button-secondary,
.button-link,
.text-action,
.mini-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
}

.button-link,
.text-action {
  min-height: 0;
  padding: 0;
  border-radius: 0;
  color: #108a00;
}

.button-primary,
.button-secondary,
.soft-pill,
.mini-chip {
  border: 1px solid rgba(16, 24, 40, 0.12);
  background: #fff;
  color: #102033;
}

.button-primary {
  border-color: #108a00;
  background: #108a00;
  color: #fff;
}

.soft-pill {
  min-height: 28px;
  font-size: 0.86rem;
  background: #f6f8fb;
}

.button-secondary--small {
  min-height: 38px;
  padding: 0 16px;
  font-size: 0.9rem;
}

.checklist-list {
  margin: 18px 0 0;
  padding-left: 18px;
  color: #455363;
  line-height: 1.8;
}

.draft-preview {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(16, 24, 40, 0.08);
  background: #f9fbf9;
}

.draft-preview--compact {
  padding: 14px 16px;
}

.draft-preview__meta {
  margin-top: 10px;
}

.draft-preview strong,
.recommendation-card strong,
.priority-item__meta strong,
.timeline-item strong,
.mini-feed-item strong,
.summary-line span {
  color: #102033;
}

.summary-line {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
}

.summary-line--dense {
  padding: 12px 14px;
}

.summary-line span {
  color: #647481;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-line strong {
  font-size: 1.05rem;
}

.summary-rail {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  margin-top: 18px;
}

.summary-stack--dense {
  gap: 10px;
}

.summary-strip--queue {
  margin-top: 14px;
}

.summary-chip--mini {
  min-width: 0;
  flex: 1 1 0;
  padding: 12px 14px;
  border-radius: 16px;
}

.summary-chip--mini strong {
  font-size: 1rem;
}

.summary-line--rail {
  min-height: 0;
  padding: 16px 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbf6 100%);
  border-color: rgba(66, 127, 67, 0.12);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
}

.summary-line--rail strong {
  font-size: 1.18rem;
}

.summary-line--rail p {
  max-width: 44ch;
}

.summary-line__footer {
  margin-top: auto;
  align-items: center;
}

.summary-line__footer .button-link {
  margin-left: auto;
}

.summary-line--stacked p {
  margin: 0;
}

.summary-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
}

.summary-line--compact {
  gap: 5px;
}

.summary-line--queue {
  position: relative;
  padding-left: 18px;
}

.summary-line--queue::before {
  content: '';
  position: absolute;
  left: 0;
  top: 14px;
  bottom: 14px;
  width: 3px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(16, 138, 0, 0.95), rgba(16, 138, 0, 0.2));
}

.summary-line__queue-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.summary-line__rank {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(16, 138, 0, 0.08);
  color: #0f6e00;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.summary-line--compact strong {
  font-size: 1rem;
}

.summary-line__subhead {
  margin: -2px 0 0;
  color: #667582;
  font-size: 0.9rem;
  line-height: 1.45;
}

.prep-checklist {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(16, 24, 40, 0.08);
}

.surface-card--spending,
.surface-card--prep {
  padding-top: 18px;
  padding-bottom: 18px;
}

.surface-card--prep {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 253, 248, 0.96));
}

.surface-card__header--compact {
  margin-bottom: 10px;
}

.checklist-list--compact {
  margin-top: 10px;
  gap: 10px;
  line-height: 1.65;
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
  .workspace-grid--dashboard,
  .metrics-grid,
  .two-column-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .priority-item {
    flex-direction: column;
  }

  .priority-item__actions {
    align-items: flex-start;
  }

  .hero-band {
    flex-direction: column;
  }

  .hero-band__stats {
    min-width: 0;
  }
}

@media (max-width: 760px) {
  .hero-band,
  .surface-card,
  .surface-card--tight {
    padding: 20px;
  }

  .hero-band h1 {
    max-width: none;
    font-size: 2rem;
  }

  .hero-band__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-chip {
    min-width: 100%;
  }
}
</style>

<style scoped>
.workspace-grid--dashboard {
  align-items: start;
}

.workspace-sidebar-stack {
  position: sticky;
  top: 20px;
  align-self: start;
}

.client-dashboard-page .surface-card--prep {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 250, 239, 0.96) 100%);
  border-color: rgba(229, 149, 0, 0.12);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.05);
}

.client-dashboard-page .surface-card--prep .draft-preview {
  margin-bottom: 14px;
}

.prep-checklist--inline {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(16, 24, 40, 0.08);
}

.prep-checklist__items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.prep-checklist__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(16, 24, 40, 0.08);
  color: rgba(15, 23, 42, 0.78);
  font-size: 0.82rem;
  line-height: 1.2;
}

.client-dashboard-page .surface-card--summary .summary-rail {
  display: grid;
  gap: 12px;
}

.client-dashboard-page .surface-card--summary .summary-line--rail {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(16, 24, 40, 0.06);
}

.client-dashboard-page .surface-card--metrics {
  background: linear-gradient(180deg, rgba(249, 251, 247, 0.98), rgba(255, 255, 255, 0.98));
  border-color: rgba(67, 94, 68, 0.08);
}
</style>

<style scoped>
/* codex visual polish */
.client-dashboard-page .hero-band {
  display: grid;
  padding: 30px;
  border-radius: 32px;
  grid-template-columns: minmax(0, 1.2fr) 340px;
  gap: 22px;
  background: linear-gradient(135deg, rgba(237, 247, 233, 0.94), rgba(255, 255, 255, 0.98));
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.08);
}
.client-dashboard-page .hero-band__copy h1 {
  max-width: 10ch;
  font-size: clamp(34px, 4vw, 56px);
  line-height: 0.94;
  letter-spacing: -0.04em;
}
.client-dashboard-page .hero-band__copy > p {
  max-width: 54ch;
}
.client-dashboard-page .hero-band__actions {
  align-items: center;
}
.client-dashboard-page .hero-band__support-action {
  min-height: auto;
  padding-inline: 0;
  color: #2d5b2f;
}
.client-dashboard-page .workspace-grid--dashboard {
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
  gap: 20px;
}
.client-dashboard-page .workspace-grid--single {
  grid-template-columns: minmax(0, 1fr);
}
.client-dashboard-page .workspace-secondary-grid {
  align-items: start;
  grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.82fr);
  gap: 14px;
}
.client-dashboard-page .surface-card {
  border-radius: 28px;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.05);
}
.client-dashboard-page .surface-card--quiet {
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(67, 94, 68, 0.08);
}
.client-dashboard-page .surface-card--summary {
  border-color: rgba(66, 127, 67, 0.1);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.025);
  background: rgba(255, 255, 255, 0.84);
}
.client-dashboard-page .surface-card--summary .summary-line--rail {
  min-height: 0;
}
.client-dashboard-page .summary-line--queue {
  padding-left: 16px;
}
.client-dashboard-page .summary-line--queue::before {
  top: 12px;
  bottom: 12px;
}
.client-dashboard-page .surface-card--spotlight {
  border-radius: 32px;
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.08);
}
.client-dashboard-page .surface-card--panel {
  border-color: rgba(17, 24, 39, 0.08);
}
.client-dashboard-page .surface-card--inbox {
  background: linear-gradient(180deg, #f5fbf2 0%, #ffffff 100%);
  border-color: rgba(66, 127, 67, 0.16);
}
.client-dashboard-page .surface-card--inbox .surface-card__header h2 {
  max-width: 18ch;
}
.client-dashboard-page .surface-card--inbox .summary-chip {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(66, 127, 67, 0.14);
}
.client-dashboard-page .surface-card--inbox .summary-line--compact {
  background: rgba(255, 255, 255, 0.88);
}
.client-dashboard-page .surface-card--tight {
  background: #fcfcf8;
  box-shadow: none;
  border: 1px solid rgba(17, 24, 39, 0.08);
}
.client-dashboard-page .surface-card--inbox .summary-line__footer {
  gap: 10px;
}
.client-dashboard-page .surface-card--inbox .summary-line__footer .button-secondary {
  min-height: 38px;
}
.client-dashboard-page .surface-card--spending,
.client-dashboard-page .surface-card--prep {
  box-shadow: none;
  border-color: rgba(67, 94, 68, 0.08);
}
.client-dashboard-page .surface-card--prep .surface-card__header h2 {
  max-width: 12ch;
}
.client-dashboard-page .surface-card--metrics .surface-card__header h2 {
  max-width: 14ch;
}
.client-dashboard-page .surface-card--spending {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 251, 246, 0.92));
}
.client-dashboard-page .surface-card--supplemental {
  background: #fdfdf9;
  border-color: rgba(17, 24, 39, 0.06);
}
.client-dashboard-page .focus-tile {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 251, 246, 0.94));
  border-color: rgba(66, 127, 67, 0.14);
}
.client-dashboard-page .hero-band--compact {
  grid-template-columns: minmax(0, 1fr);
  padding: 16px 18px;
  gap: 10px;
  border-radius: 22px;
  border: 1px solid rgba(17, 24, 39, 0.07);
  background: rgba(251, 252, 248, 0.98);
  box-shadow: none;
}
.client-dashboard-page .hero-band--compact .hero-band__copy h1 {
  max-width: none;
  font-size: clamp(26px, 2.25vw, 34px);
}
.client-dashboard-page .hero-band__summary--compact {
  margin-top: 2px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.client-dashboard-page .hero-summary-card--compact {
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(17, 24, 39, 0.06);
}
.client-dashboard-page .hero-summary-card--compact strong {
  font-size: 1.22rem;
}
.client-dashboard-page .hero-summary-card--compact p {
  font-size: 0.86rem;
  line-height: 1.35;
}
.client-dashboard-page .hero-band__summary {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.client-dashboard-page .empty-state.is-compact {
  padding: 18px;
  border-style: dashed;
  background: #fafbf8;
}
.client-dashboard-page .prep-checklist {
  margin-top: 12px;
  padding-top: 12px;
}
.client-dashboard-page .checklist-list--compact {
  margin-top: 8px;
}
.client-dashboard-page .metrics-grid--sidebar {
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}
.client-dashboard-page .metric-card--sidebar {
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(16, 24, 40, 0.06);
  background: rgba(255, 255, 255, 0.9);
}
.client-dashboard-page .metric-card--sidebar .metric-card__value {
  font-size: 1.55rem;
}
.client-dashboard-page .enterprise-overview-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.client-dashboard-page .overview-card {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.04);
  text-decoration: none;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}
.client-dashboard-page .overview-card:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 138, 0, 0.18);
  box-shadow: 0 18px 34px rgba(16, 138, 0, 0.08);
}
.client-dashboard-page .overview-card__label {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6c7a69;
}
.client-dashboard-page .overview-card__value {
  font-size: clamp(1.8rem, 2.5vw, 2.4rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  color: #102033;
}
.client-dashboard-page .overview-card__note {
  margin: 0;
  color: #5f6f7e;
  line-height: 1.55;
}
.client-dashboard-page .overview-card__action {
  color: #108a00;
  font-weight: 700;
}
.client-dashboard-page .enterprise-dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.22fr) minmax(320px, 0.78fr);
  gap: 20px;
  align-items: start;
}
.client-dashboard-page .enterprise-dashboard-main,
.client-dashboard-page .enterprise-dashboard-side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.client-dashboard-page .enterprise-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.client-dashboard-page .enterprise-section-head--stacked {
  flex-direction: column;
  align-items: flex-start;
}
.client-dashboard-page .enterprise-section-head--compact {
  align-items: center;
}
.client-dashboard-page .enterprise-section-head__copy {
  display: grid;
  gap: 8px;
  max-width: 58ch;
}
.client-dashboard-page .enterprise-section-head__copy h1,
.client-dashboard-page .enterprise-section-head__copy h2 {
  margin: 0;
  color: #102033;
  letter-spacing: -0.04em;
}
.client-dashboard-page .enterprise-section-head__copy h1 {
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 0.96;
}
.client-dashboard-page .enterprise-section-head__copy h2 {
  font-size: 1.9rem;
  line-height: 1.02;
}
.client-dashboard-page .enterprise-section-head__copy p {
  margin: 0;
  color: #5a6978;
  line-height: 1.7;
}
.client-dashboard-page .enterprise-section-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}
.client-dashboard-page .enterprise-section-actions--equal {
  justify-content: flex-start;
  align-items: stretch;
}
.client-dashboard-page .button-primary--hero,
.client-dashboard-page .button-secondary--hero {
  min-width: 182px;
  min-height: 52px;
  padding-inline: 24px;
  font-size: 1rem;
}
.client-dashboard-page .enterprise-focus-card {
  padding: 28px;
}
.client-dashboard-page .enterprise-priority-list {
  margin-top: 20px;
}
.client-dashboard-page .enterprise-module-card {
  padding: 24px;
}
.client-dashboard-page .enterprise-module-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 18px;
}
.client-dashboard-page .enterprise-module-grid--single {
  grid-template-columns: minmax(0, 1fr);
}
.client-dashboard-page .enterprise-module-item {
  display: grid;
  gap: 12px;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 251, 246, 0.92));
}
.client-dashboard-page .enterprise-module-item strong {
  font-size: 1.05rem;
  line-height: 1.2;
  color: #102033;
}
.client-dashboard-page .enterprise-module-item p {
  margin: 0;
  color: #5c6b7a;
  line-height: 1.65;
}
.client-dashboard-page .enterprise-module-item__tags {
  gap: 6px;
}
.client-dashboard-page .enterprise-module-item__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
}
.client-dashboard-page .button-primary--compact {
  min-height: 40px;
  padding-inline: 18px;
}
.client-dashboard-page .enterprise-side-card {
  background: rgba(255, 255, 255, 0.9);
}
@media (max-width: 1040px) {
  .client-dashboard-page .hero-band,
  .client-dashboard-page .workspace-grid--dashboard,
  .client-dashboard-page .workspace-secondary-grid,
  .client-dashboard-page .enterprise-dashboard-grid,
  .client-dashboard-page .enterprise-overview-strip {
    grid-template-columns: 1fr;
  }

  .client-dashboard-page .hero-band__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-rail {
    grid-template-columns: 1fr;
  }

  .client-dashboard-page .enterprise-module-grid {
    grid-template-columns: 1fr;
  }

  .client-dashboard-page .enterprise-section-head,
  .client-dashboard-page .enterprise-section-head--compact {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (min-width: 1041px) {
  .client-dashboard-page .workspace-secondary-grid {
    gap: 14px;
  }

  .client-dashboard-page .surface-card--inbox {
    padding: 26px;
  }

  .client-dashboard-page .surface-card--summary {
    padding: 18px;
  }

  .client-dashboard-page .surface-card--summary .surface-card__header h2 {
    max-width: 16ch;
  }

  .client-dashboard-page .surface-card--summary .summary-line--rail {
    padding: 12px 14px;
  }
}
</style>
