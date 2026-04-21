import fs from 'node:fs'
import assert from 'assert'

const source = fs.readFileSync('/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/SettlementPage.vue', 'utf8')

assert.ok(
  source.includes('const isPageLoading = ref(true)')
    && source.includes("const pageLoadError = ref('')")
    && source.includes('const linkedRecord = ref(null)'),
  'SettlementPage should model loading, blocking error, and linked record context explicitly instead of falling back to fake empty finance cards.'
)

assert.ok(
  source.includes('const recordPayload = await getOrderRecordDetail(audience.value, recordId.value)')
    && source.includes("const derivedTaskId = String(recordPayload?.record?.taskId || recordPayload?.taskId || recordPayload?.record?.task?.id || '').trim()"),
  'SettlementPage should bridge recordId routes back to the closure taskId before loading closure data.'
)

assert.ok(
  source.includes('v-if="isPageLoading"')
    && source.includes('v-else-if="acceptanceTradingBlocked"')
    && source.includes('v-else-if="pageLoadError"')
    && source.includes('v-else-if="page"'),
  'SettlementPage should render loading, blocked, error, and ready states as mutually exclusive branches.'
)

assert.ok(
  !source.includes('page.value = buildEmptyClosurePage('),
  'SettlementPage should no longer render buildEmptyClosurePage as a fake available finance surface on missing context or request failures.'
)

assert.ok(
  source.includes('当前结算内容暂时不可用')
    && source.includes('当前账户暂时不能继续结算')
    && source.includes('正在同步结算上下文')
    && source.includes('返回记录'),
  'SettlementPage should use owner-first settlement shell copy for loading, blocked, and unavailable states.'
)

assert.ok(
  source.includes('const primarySettlementCard = computed(() =>')
    && source.includes('const primarySettlementOwnerLabel = computed(() =>')
    && source.includes('const primarySettlementFacts = computed(() =>')
    && source.includes('const settlementTimelineSteps = computed(() =>')
    && source.includes('当前结算步骤')
    && source.includes('结算时间线')
    && source.includes('当前归属')
    && source.includes('下一步')
    && source.includes('当前状态')
    && source.includes("value: String(source.status || '未开始').trim() || '未开始'"),
  'SettlementPage should promote one owner-first current finance step card and demote the rest into a settlement timeline instead of rendering five equal-weight cards.'
)

assert.ok(
  source.includes('const highlightedFinanceSectionTitle = computed(() => highlightedFinanceSection.value?.label || highlightedFinanceSection.value?.title || \'当前步骤\')')
    && source.includes('const visibleFinanceActionResult = computed(() => (actionErrorMessage.value ? null : financeActionResult.value))')
    && source.includes('继续处理{{ highlightedFinanceSectionTitle }}'),
  'SettlementPage should keep finance deep-links owner-first and avoid showing a broken title or duplicate inline result while an action error dialog is open.'
)

assert.ok(
  source.includes("deliveryGrade.value ? `${deliveryGrade.value} 级` : ''"),
  'SettlementPage should not expose English tier copy in the settlement hero pills.'
)

console.log('settlement flow contracts ok')
