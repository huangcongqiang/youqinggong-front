import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const source = fs.readFileSync(
  path.resolve('/Users/huangcongqiang/Desktop/products/youqinggong/frontend/src/pages/ClientOperationsPage.vue'),
  'utf8'
);

assert(
  source.includes('const normalizedFinanceSummary = computed(() => {')
    && source.includes('pendingPayable: source.pendingPayable ?? source.pendingSettlement')
    && source.includes('disputedAmount: source.disputedAmount ?? source.disputeAmount')
    && source.includes('recentExpenses: Array.isArray(source.recentExpenses) && source.recentExpenses.length')
    && source.includes(': listOf(source.expenseRecords)'),
  'ClientOperationsPage should normalize billing/report finance fields before rendering summary cards and transactions.'
);

assert(
  source.includes("const billingReadinessRows = computed(() => billingEntries.value.filter((item) => item.kind === 'billing-status'));")
    && source.includes("const billingTransactionRows = computed(() => billingEntries.value.filter((item) => item.kind === 'billing-entry'));")
    && source.includes('账单状态')
    && source.includes('交易核对')
    && source.includes('当前还没有可查看的账单状态记录。')
    && source.includes('当前还没有可核对的交易记录。')
    && source.includes('导出账单记录')
    && source.includes('导出交易记录'),
  'ClientOperationsPage should split billing status and transaction review into separate sections with owner-first actions instead of mixing them into one generic operations table.'
);

assert(
  source.includes("const billingBannerVisible = computed(() =>")
    && source.includes("actionableActivationItems.value.length > 0")
    && source.includes("disabledActivationItems.value.length > 0")
    && source.includes("const showBillingGapCard = computed(() => mode.value === 'billing' && !billingBannerVisible.value && activationStatus.value.gapCount > 0);")
    && source.includes('继续之前先把账单状态看清楚')
    && source.includes('先处理邮箱、手机号或账单限制，再继续看账单记录和关联合同。')
    && source.includes('先补齐当前账单设置，再回来核对关联记录和账期。'),
  'ClientOperationsPage should only surface the billing gap card when there is an actual billing gap or blocking item instead of keeping an always-on gap surface in billing mode.'
);

assert(
  source.includes("detailRoute: item?.actionTo || null")
    && source.includes('const selectedRowPrimaryRoute = computed(() => selectedRow.value?.detailRoute || null);')
    && source.includes('<router-link')
    && source.includes('v-if="selectedRowPrimaryRoute"')
    && source.includes('继续处理账单状态'),
  'ClientOperationsPage should not render a fake primary CTA for billing-status rows when there is no real actionTo target.'
);

assert(
  source.includes('<template v-if="pageError">')
    && source.includes('client-ops-blocking-error')
    && source.includes('账单记录暂时不可用')
    && source.includes('交易核对暂时不可用')
    && source.includes('企业操作台暂时不可用')
    && source.includes('返回工作台')
    && source.includes('<template v-else>'),
  'ClientOperationsPage should collapse into a blocking error state with mode-aware owner-first copy when the request fails instead of continuing to render summary, table, export, and gap surfaces.'
);

assert(
  source.includes("const showBillingGapCard = computed(() => mode.value === 'billing' && !billingBannerVisible.value && activationStatus.value.gapCount > 0);")
    && source.includes('继续之前先把账单状态看清楚')
    && source.includes('先处理邮箱、手机号或账单限制，再继续看账单记录和关联合同。')
    && source.includes('先补齐当前账单设置，再回来核对关联记录和账期。'),
  'ClientOperationsPage should only keep the billing gap card when there is a real blocking or missing state instead of making billing look broken by default.'
);

assert(
  source.includes('<span')
    && source.includes("class=\"soft-pill\"")
    && source.includes('v-for="item in disabledActivationItems"')
    && source.includes("displayLabel: textOf(item?.blockedReason, item?.note, item?.actionLabel, '当前暂不可操作')")
    && !source.includes('v-for="item in disabledActivationItems"\n          :key="`${item.key}-gap`"\n          class="button-secondary"'),
  'ClientOperationsPage should render disabled billing blockers as status pills instead of fake disabled CTA buttons.'
);
