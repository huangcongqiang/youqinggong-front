<template>
  <section class="settlement-page stack-xl">
    <ActionErrorDialog eyebrow="结算" :title="actionDialogTitle" :message="dialogErrorMessage" />

    <ContractShellHeader
      eyebrow="结算"
      :title="settlementHeroTitle"
      :lead="settlementHeroLead"
      :support-copy="settlementSupportCopy"
      :pills="settlementPills"
      :tabs="settlementTabs"
    />

    <article v-if="isPageLoading" class="glass-panel stack-sm settlement-blocking-card">
      <span class="eyebrow">结算同步中</span>
      <h3>正在同步结算上下文</h3>
      <p class="muted">先同步当前合同和结算链，再继续处理请款、开票、对账和结算。</p>
    </article>

    <article v-else-if="acceptanceTradingBlocked" class="result-card settlement-lock-card stack-sm">
      <span class="eyebrow">结算受限</span>
      <h3>当前账户暂时不能继续结算</h3>
      <p class="muted">{{ acceptanceTradingRestriction }}</p>
      <div v-if="recordRoute || acceptanceRoute" class="toolbar">
        <router-link v-if="recordRoute" class="button-secondary" :to="recordRoute">返回记录</router-link>
        <router-link v-else-if="acceptanceRoute" class="button-secondary" :to="acceptanceRoute">返回验收</router-link>
      </div>
    </article>

    <article v-else-if="pageLoadError" class="glass-panel stack-sm settlement-blocking-card">
      <span class="eyebrow">结算暂不可用</span>
      <h3>当前结算内容暂时不可用</h3>
      <p class="muted">{{ pageLoadError }}</p>
      <div v-if="recordRoute || acceptanceRoute" class="toolbar">
        <router-link v-if="recordRoute" class="button-secondary" :to="recordRoute">返回记录</router-link>
        <router-link v-else-if="acceptanceRoute" class="button-secondary" :to="acceptanceRoute">返回验收</router-link>
      </div>
    </article>

    <article v-else-if="page" class="glass-panel stack-lg settlement-main-panel">
      <div class="panel-header settlement-section-header">
        <div>
          <span class="eyebrow">当前步骤</span>
          <h3>继续推进结算</h3>
        </div>
      </div>

      <p class="muted">验收完成后，在这里继续处理请款、开票、对账和结算。</p>

      <article v-if="highlightedFinanceSection" class="result-card stack-sm settlement-inline-warning">
        <span class="eyebrow">当前重点</span>
        <h3>继续处理{{ highlightedFinanceSectionTitle }}</h3>
        <p class="muted">{{ highlightedFinanceActionLabel }}这一步已经可以继续了。</p>
      </article>

      <article v-if="visibleFinanceActionResult" class="result-card stack-sm">
        <span class="eyebrow">结算更新</span>
        <h3>{{ visibleFinanceActionResult.title }}</h3>
        <p class="muted">{{ visibleFinanceActionResult.message || '结算时间线已更新。' }}</p>
        <div class="tag-row">
          <span class="soft-pill">{{ visibleFinanceActionResult.actionLabel }}</span>
          <span v-if="visibleFinanceActionResult.status" class="soft-pill">{{ visibleFinanceActionResult.status }}</span>
        </div>
      </article>

      <article
        v-if="primarySettlementCard"
        class="mini-card stack-md settlement-primary-card"
        :class="{ 'is-highlighted': highlightedFinanceSection?.key === primarySettlementCard.key }"
      >
        <div class="panel-header settlement-primary-card__header">
          <div>
            <span class="eyebrow">当前结算步骤</span>
            <h4>{{ primarySettlementCard.label }}</h4>
          </div>
          <span class="soft-pill">{{ primarySettlementCard.value }}</span>
        </div>
        <p class="muted">{{ primarySettlementCard.note }}</p>
        <div class="settlement-fact-grid">
          <article
            v-for="fact in primarySettlementFacts"
            :key="fact.key"
            class="mini-card stack-xs settlement-fact-card"
          >
            <span class="eyebrow">{{ fact.label }}</span>
            <strong>{{ fact.value }}</strong>
            <p class="muted">{{ fact.note }}</p>
          </article>
        </div>
        <div v-if="primarySettlementCard.meta.length" class="tag-row">
          <span v-for="meta in primarySettlementCard.meta" :key="`${primarySettlementCard.label}-${meta}`" class="soft-pill">{{ meta }}</span>
        </div>
        <div v-if="primarySettlementCard.actions.length" class="toolbar">
          <button
            v-for="action in primarySettlementCard.actions"
            :key="action.code"
            class="button-secondary"
            type="button"
            :disabled="action.disabled"
            @click="action.handler"
          >
            {{ action.label }}
          </button>
        </div>
      </article>

      <article v-if="settlementTimelineSteps.length" class="mini-card stack-md settlement-secondary-card">
        <div class="panel-header settlement-primary-card__header">
          <div>
            <span class="eyebrow">结算时间线</span>
            <h4>先处理当前步骤，再看后续流转</h4>
          </div>
        </div>

        <div class="settlement-timeline">
          <article v-for="step in settlementTimelineSteps" :key="step.key" class="settlement-timeline__item" :class="{ 'is-current': step.isCurrent }">
            <div class="settlement-timeline__topline">
              <span class="soft-pill">{{ step.badge }}</span>
              <strong>{{ step.title }}</strong>
            </div>
            <p class="muted">{{ step.summary }}</p>
            <div v-if="step.meta.length" class="tag-row">
              <span v-for="meta in step.meta" :key="`${step.key}-${meta}`" class="soft-pill">{{ meta }}</span>
            </div>
          </article>
        </div>
      </article>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import ContractShellHeader from '../components/ContractShellHeader.vue'
import {
  getOrderRecordDetail,
  getTaskClosureData,
  requestTaskClaim,
  reviewTaskClaim,
  respondTaskReconciliation,
  respondTaskSettlement,
  submitTaskInvoice,
} from '../services/api'
import { useAuthState } from '../stores/auth'
import { hasTradingAccess, tradingRestrictionMessage } from '../utils/tradingAccess'
import { buildChildObjectPageContext, readObjectPageContext } from '../utils/objectPageContext'
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes'
import { financeActionLabel, normalizeFinanceActionCode } from './settlementHelpers.js'

const route = useRoute()
const router = useRouter()
const authState = useAuthState()
const page = ref(null)
const linkedRecord = ref(null)
const isPageLoading = ref(true)
const pageLoadError = ref('')
const actionErrorMessage = ref('')
const financeActionResult = ref(null)
const financeSubmittingActionCode = ref('')
const audience = computed(() => resolveAudience(route))
const isEnterprise = computed(() => audience.value === 'enterprise')
const isTalent = computed(() => audience.value === 'talent')
const acceptanceTradingRestriction = computed(() => tradingRestrictionMessage(authState.user, audience.value))
const acceptanceTradingBlocked = computed(() => !hasTradingAccess(authState.user, audience.value))
const recordId = computed(() => String(route.params.recordId || '').trim())
const recordSummary = computed(() => {
  const source = linkedRecord.value?.record && typeof linkedRecord.value.record === 'object'
    ? linkedRecord.value.record
    : linkedRecord.value
  return source && typeof source === 'object' ? source : null
})
const pageContext = computed(() => readObjectPageContext(route.query, {
  recordId: recordId.value,
  taskId: page.value?.summary?.taskId || recordSummary.value?.taskId || recordSummary.value?.task?.id || ''
}))
const currentTaskIdValue = computed(() => String(
  pageContext.value.taskId
  || page.value?.summary?.taskId
  || recordSummary.value?.taskId
  || recordSummary.value?.task?.id
  || ''
).trim())
const currentRoomKey = computed(() => String(
  pageContext.value.room
  || recordSummary.value?.roomKey
  || recordSummary.value?.task?.roomKey
  || ''
).trim())
const claimSummary = computed(() => page.value?.claimSummary || {})
const invoiceSummary = computed(() => page.value?.invoiceSummary || {})
const reconciliationSummary = computed(() => page.value?.reconciliationSummary || {})
const settlementSummary = computed(() => page.value?.settlementSummary || {})
const disputeSummary = computed(() => page.value?.disputeSummary || {})
const requestedFinanceAction = computed(() => normalizeFinanceActionCode(route.query.financeAction))
const deliveryGrade = computed(() => page.value?.summary?.deliveryGrade || '')
const deliveryPayoutRatio = computed(() => page.value?.summary?.deliveryPayoutRatio || '')
const settlementHeroTitle = computed(() => page.value?.summary?.title || recordSummary.value?.title || '结算')
const settlementHeroLead = computed(() => '验收完成后，在这里继续请款、开票、对账和结算。')
const settlementSupportCopy = computed(() => '验收留在验收页处理。当前页只负责结算链的下一步。')
const settlementPills = computed(() => ([
  currentTaskIdValue.value ? `合同 ${currentTaskIdValue.value}` : '',
  page.value?.summary?.status || recordSummary.value?.status || '结算已附着',
  deliveryGrade.value ? `${deliveryGrade.value} 级` : '',
  deliveryPayoutRatio.value || ''
]).filter(Boolean))

const acceptanceRoute = computed(() => {
  if (!currentTaskIdValue.value) return null
  return {
    path: isEnterprise.value ? roleRouteMap.enterprise.acceptance : roleRouteMap.talent.acceptance,
    query: buildChildObjectPageContext({
      current: pageContext.value,
      overrides: {
        source: 'settlement',
        recordId: recordId.value,
        taskId: currentTaskIdValue.value,
        room: currentRoomKey.value,
      }
    })
  }
})

const recordRoute = computed(() => {
  if (!recordId.value) return null
  return {
    path: isEnterprise.value ? roleRouteMap.enterprise.recordDetail(recordId.value) : roleRouteMap.talent.recordDetail(recordId.value),
    query: buildChildObjectPageContext({
      current: pageContext.value,
      overrides: {
        source: 'settlement',
        recordId: recordId.value,
        taskId: currentTaskIdValue.value,
        room: currentRoomKey.value,
      }
    })
  }
})

const settlementTabs = computed(() => {
  const tabs = []
  if (acceptanceRoute.value) tabs.push({ label: '验收', to: acceptanceRoute.value })
  tabs.push({ label: '结算', current: true })
  if (recordRoute.value) tabs.push({ label: '记录', to: recordRoute.value })
  return tabs
})

const settlementActionSources = computed(() => [
  page.value?.summary?.availableActions,
  claimSummary.value?.availableActions,
  invoiceSummary.value?.availableActions,
  reconciliationSummary.value?.availableActions,
  settlementSummary.value?.availableActions,
  disputeSummary.value?.availableActions,
])
const settlementAvailableActionCodes = computed(() => collectClosureActionCodes(...settlementActionSources.value))
const settlementCards = computed(() => [
  buildClosureSummaryCard(
    '请款',
    'claim',
    claimSummary.value,
    '验收完成后，先在这里发起请款。',
    [['amount', '金额 '], ['requestedAt', '提交于 '], ['payoutRatio', '比例 ']],
    [
      closureActionButton('CLAIM_REQUEST', '发起请款', handleClaimRequest, claimSummary.value, (summary) =>
        isTalent.value && summaryStatusMatches(summary, ['', '未发起', '待请款', 'DRAFT', 'REJECTED', 'CANCELLED', 'EXPIRED'])
      ),
      closureActionButton('CLAIM_APPROVE', '通过请款', handleApproveClaim, claimSummary.value, (summary) =>
        isEnterprise.value && summaryStatusMatches(summary, ['PENDING_APPROVAL', 'SUBMITTED', 'UNDER_REVIEW', '待企业审批', '待审批', '待审核'])
      ),
      closureActionButton('CLAIM_REJECT', '驳回请款', handleRejectClaim, claimSummary.value, (summary) =>
        isEnterprise.value && summaryStatusMatches(summary, ['PENDING_APPROVAL', 'SUBMITTED', 'UNDER_REVIEW', '待企业审批', '待审批', '待审核'])
      )
    ].filter(Boolean)
  ),
  buildClosureSummaryCard(
    '开票',
    'invoice',
    invoiceSummary.value,
    '请款通过后，再继续提交开票。',
    [['amount', '金额 '], ['submittedAt', '提交于 '], ['invoiceType', '类型 ']],
    [
      closureActionButton('INVOICE_SUBMIT', '提交开票', handleSubmitInvoice, invoiceSummary.value, (summary) =>
        isTalent.value && summaryStatusMatches(claimSummary.value, ['APPROVED', '已批准', '已通过'])
          && summaryStatusMatches(summary, ['', 'NOT_REQUESTED', '未发起', '待开票'])
      )
    ].filter(Boolean)
  ),
  buildClosureSummaryCard(
    '对账',
    'reconciliation',
    reconciliationSummary.value,
    '开票提交后，在这里确认对账或发起争议。',
    [['amount', '金额 '], ['submittedAt', '提交于 '], ['updatedAt', '更新于 ']],
    [
      closureActionButton('RECONCILIATION_CONFIRM', '确认对账', handleConfirmReconciliation, reconciliationSummary.value, (summary) =>
        isEnterprise.value && summaryStatusMatches(summary, ['PENDING', '待企业对账', '待对账', 'Pending confirmation'])
      ),
      closureActionButton('RECONCILIATION_DISPUTE', '发起争议', handleOpenReconciliationDispute, reconciliationSummary.value, (summary) =>
        isEnterprise.value && summaryStatusMatches(summary, ['PENDING', '待企业对账', '待对账', 'Pending confirmation'])
      )
    ].filter(Boolean)
  ),
  buildClosureSummaryCard(
    '结算',
    'settlement',
    settlementSummary.value,
    '对账完成后，再继续执行结算。',
    [['amount', '金额 '], ['payoutRatio', '比例 '], ['settledAt', '结算于 ']],
    [
      closureActionButton('SETTLEMENT_EXECUTE', '执行结算', handleExecuteSettlement, settlementSummary.value, (summary) =>
        isEnterprise.value && summaryStatusMatches(summary, ['PENDING_EXECUTION', '待执行', '待结算'])
      ),
      closureActionButton('SETTLEMENT_FAIL', '标记失败', handleFailSettlement, settlementSummary.value, (summary) =>
        isEnterprise.value && summaryStatusMatches(summary, ['PENDING_EXECUTION', '待执行', '待结算'])
      )
    ].filter(Boolean)
  ),
  buildClosureSummaryCard(
    '争议',
    'dispute',
    disputeSummary.value,
    '如果对账存在分歧，平台会在这里继续处理争议和风控工单。',
    [['amount', '金额 '], ['submittedAt', '发起于 '], ['riskTicketId', '工单 ']],
    []
  )
])
const primarySettlementCard = computed(() =>
  highlightedFinanceSection.value
  || settlementCards.value.find((item) => item.actions.length)
  || settlementCards.value.find((item) => item.value !== '未开始')
  || settlementCards.value[0]
  || null
)
const primarySettlementStepIndex = computed(() =>
  settlementCards.value.findIndex((item) => item.key === primarySettlementCard.value?.key)
)
const primarySettlementOwnerLabel = computed(() => {
  switch (primarySettlementCard.value?.key) {
    case 'claim':
    case 'invoice':
      return '人才侧'
    case 'reconciliation':
    case 'settlement':
      return '企业侧'
    case 'dispute':
      return '平台'
    default:
      return '当前负责人'
  }
})
const primarySettlementNextStepLabel = computed(() =>
  primarySettlementCard.value?.actions?.[0]?.label
  || primarySettlementCard.value?.note
  || '等待下一次同步'
)
const primarySettlementFacts = computed(() => ([
  {
    key: 'owner',
    label: '当前归属',
    value: primarySettlementOwnerLabel.value,
    note: '这一步当前由哪一侧继续推进，会在这里持续显示。'
  },
  {
    key: 'next',
    label: '下一步',
    value: primarySettlementNextStepLabel.value,
    note: '优先处理这里，再决定是否继续看后续阶段。'
  },
  {
    key: 'status',
    label: '当前状态',
    value: primarySettlementCard.value?.value || '未开始',
    note: '状态会随着当前结算步骤继续同步。'
  }
]))
const settlementTimelineSteps = computed(() =>
  settlementCards.value
    .filter((item) => item.key !== primarySettlementCard.value?.key)
    .map((item, index) => {
      const originalIndex = settlementCards.value.findIndex((candidate) => candidate.key === item.key)
      const isCompleted = primarySettlementStepIndex.value > -1 && originalIndex < primarySettlementStepIndex.value
      const isCurrent = highlightedFinanceSection.value?.key === item.key
      return {
        key: item.key,
        title: item.label,
        badge: isCurrent ? '当前关注' : isCompleted ? '已处理' : '后续步骤',
        summary: item.note,
        meta: item.meta,
        isCurrent
      }
    })
)
const highlightedFinanceSection = computed(() => settlementCards.value.find((item) => item.actions.some((action) => action.code === requestedFinanceAction.value)) || null)
const highlightedFinanceSectionTitle = computed(() => highlightedFinanceSection.value?.label || highlightedFinanceSection.value?.title || '当前步骤')
const highlightedFinanceActionLabel = computed(() => {
  if (!highlightedFinanceSection.value) return '当前操作'
  return highlightedFinanceSection.value.actions.find((action) => action.code === requestedFinanceAction.value)?.label || '当前操作'
})
const actionDialogTitle = computed(() => (actionErrorMessage.value ? '结算操作暂时没有提交成功' : '结算流程同步出现了问题'))
const dialogErrorMessage = computed(() => actionErrorMessage.value || '')
const visibleFinanceActionResult = computed(() => (actionErrorMessage.value ? null : financeActionResult.value))

onMounted(refreshPage)

watch(
  () => [String(route.params.recordId || '').trim(), String(route.query.taskId || '').trim(), String(route.query.recordId || '').trim()],
  ([nextRouteRecordId, nextTaskId, nextQueryRecordId], previous = []) => {
    const previousRouteRecordId = String(previous?.[0] || '').trim()
    const previousTaskId = String(previous?.[1] || '').trim()
    const previousQueryRecordId = String(previous?.[2] || '').trim()
    if (
      nextRouteRecordId === previousRouteRecordId
      && nextTaskId === previousTaskId
      && nextQueryRecordId === previousQueryRecordId
    ) {
      return
    }
    financeActionResult.value = null
    clearActionError()
    refreshPage()
  }
)

async function refreshPage() {
  isPageLoading.value = true
  pageLoadError.value = ''
  linkedRecord.value = null
  page.value = null
  try {
    const routeTaskId = String(pageContext.value.taskId || '').trim()
    if (!recordId.value && !routeTaskId) {
      pageLoadError.value = '当前结算页缺少合同上下文，暂时还不能继续。'
      return
    }

    let resolvedTaskId = routeTaskId
    if (!resolvedTaskId && recordId.value) {
      const recordPayload = await getOrderRecordDetail(audience.value, recordId.value)
      linkedRecord.value = recordPayload
      const recordRequestError = String(recordPayload?.requestError || '').trim()
      const derivedTaskId = String(recordPayload?.record?.taskId || recordPayload?.taskId || recordPayload?.record?.task?.id || '').trim()
      if (recordRequestError) {
        pageLoadError.value = recordRequestError
        return
      }
      if (!derivedTaskId) {
        pageLoadError.value = '当前结算页还没有同步到对应合同，稍后再试。'
        return
      }
      resolvedTaskId = derivedTaskId
    }

    const nextPage = await getTaskClosureData(resolvedTaskId)
    if (nextPage?.requestError) {
      pageLoadError.value = String(nextPage.requestError || '当前结算内容暂时不可用。').trim()
      return
    }
    page.value = nextPage
    clearActionError()
  } catch (error) {
    pageLoadError.value = error?.message || '当前结算内容暂时不可用。'
  } finally {
    isPageLoading.value = false
  }
}

async function runFinanceAction(actionCode, taskAction, fallbackTitle, fallbackMessage) {
  if (financeSubmittingActionCode.value) return
  financeSubmittingActionCode.value = actionCode
  try {
    const result = await taskAction()
    financeActionResult.value = buildFinanceActionResult(actionCode, result, fallbackTitle, fallbackMessage)
    if (isMutationFailed(result)) {
      setActionError(mutationResultText(result, fallbackMessage))
      return
    }
    await refreshPage()
  } finally {
    financeSubmittingActionCode.value = ''
  }
}

async function handleClaimRequest() {
  const taskId = currentTaskIdValue.value
  if (!taskId) {
    const message = '当前结算页缺少合同上下文，暂时还不能发起请款。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('CLAIM_REQUEST', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  if (!isTalent.value) {
    const message = '只有人才侧可以在这里发起请款。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('CLAIM_REQUEST', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  await runFinanceAction('CLAIM_REQUEST', () => requestTaskClaim(taskId, {
    note: String(page.value?.summary?.nextStep || claimSummary.value?.note || '先发起请款，再继续进入开票。').trim()
  }), '请款已提交', '请款申请已提交。')
}

async function handleApproveClaim() {
  const taskId = currentTaskIdValue.value
  const claimId = summaryId(claimSummary.value, 'claimId', 'id')
  if (!taskId || !claimId) {
    const message = '当前缺少请款记录，暂时还不能继续审批。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('CLAIM_APPROVE', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  if (!isEnterprise.value) {
    const message = '只有企业侧可以在这里审批请款。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('CLAIM_APPROVE', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  await runFinanceAction('CLAIM_APPROVE', () => reviewTaskClaim(taskId, claimId, {
    action: 'APPROVE',
    note: String(claimSummary.value?.decisionNote || claimSummary.value?.note || '请款已通过。').trim()
  }), '请款审批已提交', '请款审批动作已提交。')
}

async function handleRejectClaim() {
  const taskId = currentTaskIdValue.value
  const claimId = summaryId(claimSummary.value, 'claimId', 'id')
  if (!taskId || !claimId) {
    const message = '当前缺少请款记录，暂时还不能继续驳回。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('CLAIM_REJECT', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  if (!isEnterprise.value) {
    const message = '只有企业侧可以在这里驳回请款。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('CLAIM_REJECT', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  await runFinanceAction('CLAIM_REJECT', () => reviewTaskClaim(taskId, claimId, {
    action: 'REJECT',
    note: String(claimSummary.value?.decisionNote || claimSummary.value?.note || '请款已驳回，请补充说明后再提交。').trim()
  }), '请款驳回已提交', '请款驳回动作已提交。')
}

async function handleSubmitInvoice() {
  const claimId = summaryId(claimSummary.value, 'claimId', 'id', 'claimNo')
  if (!claimId) {
    const message = '当前缺少请款记录，暂时还不能继续开票。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('INVOICE_SUBMIT', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  if (!isTalent.value) {
    const message = '只有人才侧可以在这里提交开票。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('INVOICE_SUBMIT', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  await runFinanceAction('INVOICE_SUBMIT', () => submitTaskInvoice(claimId, {
    invoiceType: 'ELECTRONIC_NORMAL',
    note: String(claimSummary.value?.note || page.value?.summary?.nextStep || '请提交与已通过请款一致的开票信息。').trim()
  }), '开票已提交', '开票动作已提交。')
}

async function handleConfirmReconciliation() {
  const reconciliationId = summaryId(reconciliationSummary.value, 'reconciliationId', 'id')
  if (!reconciliationId) {
    const message = '当前缺少对账记录，暂时还不能继续确认。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('RECONCILIATION_CONFIRM', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  if (!isEnterprise.value) {
    const message = '只有企业侧可以在这里确认对账。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('RECONCILIATION_CONFIRM', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  await runFinanceAction('RECONCILIATION_CONFIRM', () => respondTaskReconciliation(reconciliationId, {
    action: 'CONFIRM',
    note: String(reconciliationSummary.value?.note || reconciliationSummary.value?.decisionNote || '对账已确认。').trim()
  }), '对账确认已提交', '对账确认动作已提交。')
}

async function handleOpenReconciliationDispute() {
  const reconciliationId = summaryId(reconciliationSummary.value, 'reconciliationId', 'id')
  if (!reconciliationId) {
    const message = '当前缺少对账记录，暂时还不能发起争议。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('RECONCILIATION_DISPUTE', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  if (!isEnterprise.value) {
    const message = '只有企业侧可以在这里发起争议。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('RECONCILIATION_DISPUTE', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  await runFinanceAction('RECONCILIATION_DISPUTE', () => respondTaskReconciliation(reconciliationId, {
    action: 'DISPUTE',
    note: String(reconciliationSummary.value?.note || '当前对账存在问题，需要平台继续介入。').trim()
  }), '争议已发起', '对账争议已提交。')
}

async function handleExecuteSettlement() {
  const settlementId = summaryId(settlementSummary.value, 'settlementId', 'id')
  if (!settlementId) {
    const message = '当前缺少结算记录，暂时还不能继续执行。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('SETTLEMENT_EXECUTE', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  if (!isEnterprise.value) {
    const message = '只有企业侧可以在这里执行结算。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('SETTLEMENT_EXECUTE', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  await runFinanceAction('SETTLEMENT_EXECUTE', () => respondTaskSettlement(settlementId, {
    action: 'EXECUTE',
    note: String(settlementSummary.value?.note || settlementSummary.value?.decisionNote || '继续执行这份合同的结算。').trim()
  }), '结算已提交', '结算执行动作已提交。')
}

async function handleFailSettlement() {
  const settlementId = summaryId(settlementSummary.value, 'settlementId', 'id')
  if (!settlementId) {
    const message = '当前缺少结算记录，暂时还不能标记失败。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('SETTLEMENT_FAIL', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  if (!isEnterprise.value) {
    const message = '只有企业侧可以在这里标记结算失败。'
    setActionError(message)
    financeActionResult.value = buildFinanceActionResult('SETTLEMENT_FAIL', { status: 'FAILED', requestError: message }, '提交失败', message)
    return
  }
  await runFinanceAction('SETTLEMENT_FAIL', () => respondTaskSettlement(settlementId, {
    action: 'FAIL',
    note: String(settlementSummary.value?.note || settlementSummary.value?.decisionNote || '当前结算失败，需要继续跟进。').trim()
  }), '失败状态已提交', '结算失败状态已提交。')
}

function listOf(value) {
  return Array.isArray(value) ? value : []
}

function compactText(value, limit = 64) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  return normalized.length > limit ? `${normalized.slice(0, limit - 1)}…` : normalized
}

function normalizeClosureActionCode(value) {
  return normalizeFinanceActionCode(value)
}

function collectClosureActionCodes(...sources) {
  return new Set(sources.flatMap((source) => listOf(source).map((item) => normalizeClosureActionCode(item)).filter(Boolean)))
}

function summaryStatusMatches(summary, candidates = []) {
  const status = String(summary?.status || summary?.statusCode || '').trim()
  const normalizedStatus = status.toUpperCase()
  return listOf(candidates).some((candidate) => {
    const normalizedCandidate = String(candidate || '').trim().toUpperCase()
    if (!normalizedCandidate) return !status
    return status === candidate
      || normalizedStatus === normalizedCandidate
      || normalizedStatus.includes(normalizedCandidate)
      || status.includes(String(candidate || '').trim())
  })
}

function closureActionAllowed(actionCode, summary, fallbackCheck) {
  return settlementAvailableActionCodes.value.has(normalizeClosureActionCode(actionCode)) || fallbackCheck(summary)
}

function closureActionButton(actionCode, label, handler, summary, fallbackCheck) {
  if (!closureActionAllowed(actionCode, summary, fallbackCheck)) return null
  return {
    code: actionCode,
    label: financeSubmittingActionCode.value === actionCode ? '提交中...' : label,
    handler,
    disabled: acceptanceTradingBlocked.value || Boolean(financeSubmittingActionCode.value)
  }
}

function summaryMeta(summary, fields) {
  const source = summary && typeof summary === 'object' ? summary : {}
  return listOf(fields)
    .map(([key, prefix]) => {
      const value = String(source?.[key] || '').trim()
      return value ? `${prefix || ''}${value}` : ''
    })
    .filter(Boolean)
    .slice(0, 3)
}

function buildClosureSummaryCard(label, key, summary, fallbackNote, fields = [], actions = []) {
  const source = summary && typeof summary === 'object' ? summary : {}
  return {
    key,
    label,
    value: String(source.status || '未开始').trim() || '未开始',
    note: compactText(source.nextStep || source.decisionNote || source.note || fallbackNote, 72),
    meta: summaryMeta(source, fields),
    actions
  }
}

function summaryId(summary, ...keys) {
  const source = summary && typeof summary === 'object' ? summary : {}
  return keys.map((key) => String(source?.[key] || '').trim()).find(Boolean) || ''
}

function buildFinanceActionMessage(response, fallback) {
  return String(response?.requestError || response?.nextStep || response?.message || fallback || '').trim()
}

function mutationResultText(result, fallback) {
  return String(result?.requestError || result?.nextStep || fallback || '').trim()
}

function buildFinanceActionResult(actionCode, response, fallbackTitle, fallbackMessage) {
  const responseStatus = String(response?.status || '').trim()
  return {
    actionCode,
    actionLabel: financeActionLabel(actionCode),
    title: responseStatus === 'FAILED'
      ? String(fallbackTitle || '提交失败').trim()
      : String(responseStatus || fallbackTitle || '已提交').trim(),
    status: responseStatus,
    message: buildFinanceActionMessage(response, fallbackMessage)
  }
}

function isMutationFailed(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED')
}

function setActionError(message) {
  actionErrorMessage.value = String(message || '').trim()
}

function clearActionError() {
  actionErrorMessage.value = ''
}
</script>

<style scoped>
.settlement-page,.stack-xl,.stack-lg,.stack-sm,.stack-md{display:grid}.stack-xl{gap:24px}.stack-lg{gap:20px}.stack-md{gap:16px}.stack-sm{gap:10px}
.settlement-page{padding-bottom:32px}.glass-panel,.mini-card,.result-card{padding:20px;border-radius:24px;border:1px solid rgba(18,18,18,.08);background:#fff;box-shadow:0 18px 48px rgba(39,55,27,.06)}
.settlement-main-panel{gap:18px}.settlement-grid-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.toolbar,.panel-header,.settlement-section-header,.settlement-hero-actions{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.toolbar{flex-wrap:wrap}.button-secondary,.soft-pill{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 14px;border-radius:999px;border:1px solid rgba(18,18,18,.1);background:#fff;color:#111827;text-decoration:none;font-weight:600}.eyebrow{color:#66715f;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.muted{margin:0;color:#5c5c56;line-height:1.65}.settlement-inline-warning{border-left:4px solid #cd8f00;background:linear-gradient(180deg, rgba(255,250,231,.98), rgba(255,255,255,.98))}.settlement-finance-card.is-highlighted{border-color:#108a00;box-shadow:0 0 0 1px rgba(16,138,0,.12)}.tag-row{display:flex;flex-wrap:wrap;gap:10px}@media (max-width: 900px){.settlement-grid-cards{grid-template-columns:1fr}}@media (max-width: 760px){.toolbar,.panel-header,.settlement-section-header,.settlement-hero-actions{flex-direction:column;align-items:stretch}}
</style>

<style scoped>
/* codex visual polish */
.settlement-page .panel,
.settlement-page .result-card {
  border-radius: 28px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.05);
}
.settlement-page .settlement-main-panel {
  gap: 20px;
}
.settlement-page .settlement-grid-cards {
  grid-template-columns: 1fr;
  gap: 18px;
  max-width: 860px;
}
.settlement-page .settlement-primary-card {
  border-color: rgba(16, 138, 0, 0.18);
  box-shadow: 0 18px 44px rgba(16, 138, 0, 0.08);
}
.settlement-page .settlement-secondary-card {
  background: rgba(248, 250, 248, 0.96);
}
.settlement-page .settlement-primary-card__header {
  align-items: center;
}
.settlement-page .settlement-fact-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.settlement-page .settlement-fact-card {
  border-radius: 20px;
  background: rgba(248, 250, 248, 0.96);
  border: 1px solid rgba(18, 18, 18, 0.06);
  box-shadow: none;
}
.settlement-page .settlement-timeline {
  display: grid;
  gap: 14px;
}
.settlement-page .settlement-timeline__item {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(18, 18, 18, 0.08);
  background: #fff;
}
.settlement-page .settlement-timeline__item.is-current {
  border-color: rgba(16, 138, 0, 0.18);
  background: linear-gradient(180deg, rgba(243, 255, 240, 0.9), rgba(255, 255, 255, 0.98));
}
.settlement-page .settlement-timeline__topline {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.settlement-page .settlement-finance-card {
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
}
@media (max-width: 900px) {
  .settlement-page .settlement-fact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
