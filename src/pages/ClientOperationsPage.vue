<template>
  <section class="page-stack client-ops-page">
    <ActionErrorDialog title="当前操作页暂时无法同步" :message="pageError" />

    <template v-if="pageError">
      <article class="result-card stack-sm client-ops-blocking-error">
        <span class="eyebrow">页面状态</span>
        <h3>
          {{
            mode === 'billing'
              ? '账单记录暂时不可用'
              : mode === 'reports'
                ? '交易核对暂时不可用'
                : '企业操作台暂时不可用'
          }}
        </h3>
        <p class="muted">
          {{ pageError }}
        </p>
        <div class="toolbar">
          <router-link class="button-primary" :to="roleRouteMap.enterprise.home">
            返回工作台
          </router-link>
        </div>
      </article>
    </template>

    <template v-else>
    <article class="hero-card client-ops-hero stack-lg">
      <div class="client-ops-hero__header">
        <SectionTitle
          eyebrow="企业操作台"
          :title="pageTitle"
          :description="pageLead"
          tag="h1"
        />

        <div class="client-ops-hero__actions toolbar">
          <router-link class="button-secondary" :to="roleRouteMap.enterprise.home">返回工作台</router-link>
          <router-link
            v-if="heroPrimaryAction"
            class="button-primary"
            :to="heroPrimaryAction.to"
          >
            {{ heroPrimaryAction.label }}
          </router-link>
        </div>
      </div>

      <div class="tag-row">
        <span class="soft-pill">{{ modeMeta.kicker }}</span>
          <span class="soft-pill">
          {{
            `${visibleRows.length} ${
              mode === 'contracts'
                ? '份合同'
                : mode === 'reports'
                  ? '笔交易'
                  : '条账单'
            }`
          }}
        </span>
        <span class="soft-pill">{{ statusFilterLabel }}</span>
        <span class="soft-pill">{{ dateWindowLabel }}</span>
      </div>
    </article>

    <article v-if="billingBannerVisible" class="glass-panel client-ops-banner stack-md">
      <div class="client-ops-banner__copy stack-sm">
        <div class="stack-xs">
          <span class="eyebrow">账单状态</span>
          <h3>{{ activationStatus.summaryTitle }}</h3>
          <p class="muted">{{ activationStatus.summaryBody }}</p>
        </div>
        <div class="tag-row">
          <span
            v-for="item in activationStatus.items"
            :key="item.key"
            class="soft-pill"
            :class="`is-${item.state}`"
          >
            {{ `${item.label} · ${item.value}` }}
          </span>
        </div>
      </div>

      <div class="client-ops-banner__actions toolbar">
        <router-link
          v-for="item in actionableActivationItems"
          :key="`${item.key}-route`"
          class="button-secondary"
          :to="item.actionTo"
        >
          {{ item.actionLabel }}
        </router-link>
        <span
          v-for="item in disabledActivationItems"
          :key="`${item.key}-gap`"
          class="soft-pill"
        >
          {{ item.displayLabel }}
        </span>
      </div>
    </article>

    <article v-if="pageFeedback" class="result-card stack-sm">
      <span class="eyebrow">页面状态</span>
      <h3>{{ pageFeedback.title }}</h3>
      <p class="muted">{{ pageFeedback.message }}</p>
    </article>

    <article v-if="showBillingGapCard" class="result-card client-ops-gap-card stack-sm">
      <span class="eyebrow">账单缺口</span>
      <h3>{{ billingGapTitle }}</h3>
      <p class="muted">{{ billingGapSummary }}</p>
      <div class="tag-row">
        <span class="soft-pill">先看账单状态</span>
        <span class="soft-pill">再看关联记录</span>
        <span class="soft-pill">把当前账期处理完</span>
      </div>
    </article>

    <article class="glass-panel client-ops-filter-bar">
      <div class="client-ops-filter-bar__tabs" role="tablist" aria-label="查看模式">
        <router-link
          v-for="tab in modeTabs"
          :key="tab.id"
          class="client-ops-mode-tab"
          :class="{ 'is-active': tab.id === mode }"
          :to="tab.to"
        >
          <span class="eyebrow">{{ tab.kicker }}</span>
          <strong>{{ tab.label }}</strong>
          <small>{{ tab.note }}</small>
        </router-link>
      </div>

      <div class="client-ops-filter-bar__controls">
        <label class="client-ops-select-field">
          <span>状态</span>
          <select v-model="statusFilter" class="select-input">
            <option value="all">全部</option>
            <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
        <label class="client-ops-select-field">
          <span>时间范围</span>
          <select v-model="dateWindow" class="select-input">
            <option value="all">全部时间</option>
            <option value="30d">近 30 天</option>
            <option value="90d">近 90 天</option>
          </select>
        </label>
        <button class="button-secondary" type="button" :disabled="exportBusy" @click="exportCurrentView">
          {{
            exportBusy
              ? '导出中...'
              : mode === 'billing'
                ? '导出账单记录'
                : mode === 'reports'
                  ? '导出交易记录'
                  : '导出当前视图'
          }}
        </button>
      </div>
    </article>

    <section class="client-ops-layout">
      <main class="stack-md">
        <article class="glass-panel client-ops-summary stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">{{ modeMeta.summaryEyebrow }}</span>
              <h3>{{ modeMeta.summaryTitle }}</h3>
            </div>
          </div>

          <div class="client-ops-summary__grid">
            <article v-for="item in summaryCards" :key="item.label" class="client-ops-summary-card stack-xs">
              <span class="client-ops-summary-card__label">{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <p class="muted">{{ item.note }}</p>
            </article>
          </div>
        </article>

        <article class="glass-panel client-ops-table-card stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">{{ modeMeta.tableEyebrow }}</span>
              <h3>{{ modeMeta.tableTitle }}</h3>
            </div>
            <span class="soft-pill">
              {{
                `${visibleRows.length} ${
                  mode === 'billing' ? '条账单' : mode === 'reports' ? '笔交易' : '份合同'
                }`
              }}
            </span>
          </div>

          <template v-if="mode === 'billing'">
            <article class="client-ops-split-section stack-sm">
              <div class="panel-header">
                <div>
                  <span class="eyebrow">账单状态</span>
                  <h4>状态记录</h4>
                </div>
                <span class="soft-pill">{{ `${visibleBillingReadinessRows.length} 条` }}</span>
              </div>

              <div v-if="visibleBillingReadinessRows.length" class="client-ops-table">
                <button
                  v-for="row in visibleBillingReadinessRows"
                  :key="row.id"
                  type="button"
                  class="client-ops-row"
                  :class="{ 'is-selected': row.id === selectedRowId }"
                  @click="openRow(row)"
                >
                  <div class="client-ops-row__main">
                    <div class="client-ops-row__head">
                      <strong>{{ row.title }}</strong>
                      <span class="soft-pill">{{ row.status || '待更新' }}</span>
                    </div>
                    <p class="muted">{{ row.note }}</p>
                    <div class="tag-row">
                      <span class="soft-pill">{{ row.amount }}</span>
                      <span class="soft-pill">{{ row.counterpart || '等待对方同步' }}</span>
                      <span class="soft-pill">{{ row.updatedAt || '等待更新时间' }}</span>
                    </div>
                  </div>

                  <div class="client-ops-row__actions">
                    <span class="client-ops-row__action">{{ row.primaryLabel }}</span>
                    <small>{{ row.secondaryLabel }}</small>
                  </div>
                </button>
              </div>
              <p v-else class="muted">
                当前还没有可查看的账单状态记录。
              </p>
            </article>

            <article class="client-ops-split-section stack-sm">
              <div class="panel-header">
                <div>
                  <span class="eyebrow">交易核对</span>
                  <h4>关联记录</h4>
                </div>
                <span class="soft-pill">{{ `${visibleBillingTransactionRows.length} 条` }}</span>
              </div>

              <div v-if="visibleBillingTransactionRows.length" class="client-ops-table">
                <button
                  v-for="row in visibleBillingTransactionRows"
                  :key="row.id"
                  type="button"
                  class="client-ops-row"
                  :class="{ 'is-selected': row.id === selectedRowId }"
                  @click="openRow(row)"
                >
                  <div class="client-ops-row__main">
                    <div class="client-ops-row__head">
                      <strong>{{ row.title }}</strong>
                      <span class="soft-pill">{{ row.status || '待更新' }}</span>
                    </div>
                    <p class="muted">{{ row.note }}</p>
                    <div class="tag-row">
                      <span class="soft-pill">{{ row.amount }}</span>
                      <span class="soft-pill">{{ row.counterpart || '等待对方同步' }}</span>
                      <span class="soft-pill">{{ row.updatedAt || '等待更新时间' }}</span>
                    </div>
                  </div>

                  <div class="client-ops-row__actions">
                    <span class="client-ops-row__action">{{ row.primaryLabel }}</span>
                    <small>{{ row.secondaryLabel }}</small>
                  </div>
                </button>
              </div>
              <p v-else class="muted">
                当前还没有可核对的交易记录。
              </p>
            </article>
          </template>

          <div v-else-if="visibleRows.length" class="client-ops-table">
            <button
              v-for="row in visibleRows"
              :key="row.id"
              type="button"
              class="client-ops-row"
              :class="{ 'is-selected': row.id === selectedRowId }"
              @click="openRow(row)"
            >
              <div class="client-ops-row__main">
                <div class="client-ops-row__head">
                  <strong>{{ row.title }}</strong>
                  <span class="soft-pill">{{ row.status || '待更新' }}</span>
                </div>
                <p class="muted">{{ row.note }}</p>
                <div class="tag-row">
                  <span class="soft-pill">{{ row.amount }}</span>
                  <span class="soft-pill">{{ row.counterpart || '等待对方同步' }}</span>
                  <span class="soft-pill">{{ row.updatedAt || '等待更新时间' }}</span>
                </div>
              </div>

              <div class="client-ops-row__actions">
                <span class="client-ops-row__action">{{ row.primaryLabel }}</span>
                <small>{{ row.secondaryLabel }}</small>
              </div>
            </button>
          </div>

          <article v-else class="client-ops-empty stack-sm">
            <strong>{{ modeMeta.emptyTitle }}</strong>
            <p class="muted">{{ modeMeta.emptyCopy }}</p>
            <router-link class="button-secondary" :to="emptyStateAction.to">
              {{ emptyStateAction.label }}
            </router-link>
          </article>
        </article>
      </main>

      <aside class="stack-md">
        <article class="glass-panel client-ops-detail stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">{{ modeMeta.detailEyebrow }}</span>
              <h3>{{ selectedRow ? selectedRow.title : mode === 'contracts' ? '还没有选中合同' : mode === 'reports' ? '还没有选中交易' : '还没有选中账单记录' }}</h3>
            </div>
          </div>

          <template v-if="selectedRow">
            <div class="client-ops-detail__grid">
              <article v-for="item in selectedRowFacts" :key="item.label" class="client-ops-detail-fact stack-xs">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
                <p v-if="item.note" class="muted">{{ item.note }}</p>
              </article>
            </div>

            <p class="muted">{{ selectedRow.note }}</p>

            <div class="toolbar">
              <router-link
                v-if="selectedRowPrimaryRoute"
                class="button-primary"
                :to="selectedRowPrimaryRoute"
              >
                {{ selectedRowPrimaryLabel }}
              </router-link>
              <router-link
                v-if="selectedRow.workspaceRoute"
                class="button-link"
                :to="selectedRow.workspaceRoute"
              >
                {{ selectedRowSecondaryLabel }}
              </router-link>
            </div>
          </template>

          <p v-else class="muted">
            {{ mode === 'contracts'
              ? '先从列表里选一份合同。'
              : mode === 'reports'
                ? '先从列表里选一条交易。'
                : '先从列表里选一条账单记录。' }}
          </p>
        </article>

        <article class="glass-panel stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">{{ contractPulseEyebrow }}</span>
              <h3>{{ contractPulseTitle }}</h3>
            </div>
          </div>

          <div v-if="contractCards.length" class="client-ops-mini-list">
            <article v-for="card in contractCards" :key="card.id" class="client-ops-mini-card stack-xs">
              <strong>{{ card.title }}</strong>
              <span class="soft-pill">{{ card.status }}</span>
              <p class="muted">{{ card.note }}</p>
            </article>
          </div>
          <p v-else class="muted">
            {{ mode === 'contracts'
              ? '当前还没有可展示的活跃合同。'
              : mode === 'reports'
                ? '当前还没有可展示的关联合同。'
                : '当前还没有可展示的关联账单记录。' }}
          </p>
        </article>

        <article class="glass-panel stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">{{ ledgerPulseEyebrow }}</span>
              <h3>{{ ledgerPulseTitle }}</h3>
            </div>
          </div>

          <div v-if="recentTransactions.length" class="client-ops-mini-list">
            <button
              v-for="transaction in recentTransactions.slice(0, 4)"
              :key="transaction.id"
              type="button"
              class="client-ops-mini-card stack-xs"
              @click="openRow(transaction)"
            >
              <strong>{{ transaction.title }}</strong>
              <span class="soft-pill">{{ transaction.amount }}</span>
              <p class="muted">{{ transaction.note }}</p>
            </button>
          </div>
          <p v-else class="muted">当前还没有可核对的交易记录。</p>
        </article>

        <article class="result-card stack-sm client-ops-footnote">
          <span class="eyebrow">使用说明</span>
          <h4>{{ footnoteTitle }}</h4>
          <p class="muted">
            {{ footnoteBody }}
          </p>
        </article>
      </aside>
    </section>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ActionErrorDialog from '../components/ActionErrorDialog.vue';
import SectionTitle from '../components/SectionTitle.vue';
import { formatMoney } from '../services/recordFormatters.js';
import { downloadClientReportExport, getBusinessData, getOrderRecords, requestClientReportExport } from '../services/api';
import { useAuthState } from '../stores/auth';
import { roleRouteMap } from '../utils/roleRoutes';
import { buildUpworkFirstAccountStatus } from '../utils/upworkFirstAccountStatus';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();

const businessPage = ref(null);
const recordsPage = ref(null);
const selectedRowId = ref('');
const statusFilter = ref('all');
const dateWindow = ref('all');
const pageFeedback = ref(null);
const exportBusy = ref(false);

const mode = computed(() => String(route.meta?.clientOperationsMode || 'contracts'));
const financeSummary = computed(() => businessPage.value?.financeSummary || {});
const normalizedFinanceSummary = computed(() => {
  const source = financeSummary.value || {};
  return {
    ...source,
    pendingPayable: source.pendingPayable ?? source.pendingSettlement,
    disputedAmount: source.disputedAmount ?? source.disputeAmount,
    recentExpenses: Array.isArray(source.recentExpenses) && source.recentExpenses.length
      ? source.recentExpenses
      : listOf(source.expenseRecords)
  };
});
const activationStatus = computed(() => buildUpworkFirstAccountStatus(authState.user, 'enterprise'));
const pageError = computed(() => textOf(recordsPage.value?.requestError, businessPage.value?.requestError));

const modeTabs = computed(() => [
  {
    id: 'contracts',
    label: '合同台账',
    kicker: '合同',
    note: '按当前状态查看合同对象和协作进度。',
    to: roleRouteMap.enterprise.contracts
  },
  {
    id: 'reports',
    label: '交易与报表',
    kicker: '报表',
    note: '先看最新交易，再按状态和时间范围继续核对。',
    to: roleRouteMap.enterprise.reports
  },
  {
    id: 'billing',
    label: '账单状态',
    kicker: '账单',
    note: '先看账号状态，再处理账单限制和关联记录。',
    to: roleRouteMap.enterprise.billing
  }
]);

const modeMeta = computed(() => {
  switch (mode.value) {
    case 'reports':
      return {
        kicker: '交易与报表',
        summaryEyebrow: '交易摘要',
        summaryTitle: '先看最新支出、待结算项和争议信号',
        tableEyebrow: '交易历史',
        tableTitle: '当前交易视图',
        detailEyebrow: '交易详情',
        emptyTitle: '当前还没有交易',
        emptyCopy: '合同进入结算或争议阶段后，相关交易会出现在这里。'
      };
    case 'billing':
      return {
        kicker: '账单状态',
      summaryEyebrow: '账单状态',
        summaryTitle: '先看账号是否就绪，再处理限制和关联记录',
      tableEyebrow: '账单记录',
        tableTitle: '当前账单记录',
        detailEyebrow: '账单详情',
        emptyTitle: '当前还没有账单记录',
      emptyCopy: '状态检查和关联交易开始后，账单记录会出现在这里。'
      };
    default:
      return {
        kicker: '合同台账',
        summaryEyebrow: '当前合同',
        summaryTitle: '先分清活跃、已完成和待跟进的合同对象',
        tableEyebrow: '合同',
        tableTitle: '当前合同',
        detailEyebrow: '合同详情',
        emptyTitle: '当前还没有合同',
        emptyCopy: '发布任务并选中人才后，合同对象和相关记录会出现在这里。'
      };
  }
});

const pageTitle = computed(() => {
  switch (mode.value) {
    case 'reports':
      return '先看最新交易，再继续核对待结算和争议状态。';
    case 'billing':
      return '先确认账单状态，再处理限制、账期和关联记录。';
    default:
      return '把活跃合同、已完成合作和下一步集中放在同一页处理。';
  }
});

const pageLead = computed(() => {
  switch (mode.value) {
    case 'reports':
      return '按交易、状态和时间范围看最新支出与待结算信号，先处理最需要你跟进的那几笔。';
    case 'billing':
      return '先确认账号是否就绪，再继续处理账期限制、账单状态和关联记录。';
    default:
      return '这页把合同对象、合同状态和后续动作收在一起，让你先处理最重要的当前事项。';
  }
});

const heroPrimaryAction = computed(() => {
  if (!selectedRow.value?.detailRoute) {
    return null;
  }

  const billingPrimaryLabel = selectedRow.value.kind === 'billing-status' ? '继续处理账单状态' : '打开账单记录';
  const labelByMode = {
    reports: '打开交易',
    billing: billingPrimaryLabel,
    contracts: '打开合同'
  };

  return {
    label: labelByMode[mode.value] || '打开合同',
    to: selectedRow.value.detailRoute
  };
});

const selectedRowPrimaryRoute = computed(() => selectedRow.value?.detailRoute || null);

const selectedRowPrimaryLabel = computed(() => {
  if (mode.value === 'reports') {
    return '打开交易';
  }
  if (mode.value === 'billing') {
    return selectedRow.value?.kind === 'billing-status'
      ? (selectedRow.value?.detailRoute ? '继续处理账单状态' : '先看当前状态')
      : '打开账单记录';
  }
  return '打开合同';
});

const selectedRowSecondaryLabel = computed(() => {
  if (mode.value === 'reports') {
    return '返回关联合同';
  }
  if (mode.value === 'billing') {
    return '打开关联合同';
  }
  return '继续处理合同';
});

const emptyStateAction = computed(() => {
  if (mode.value === 'contracts') {
    return {
      label: '先去发布任务',
      to: roleRouteMap.enterprise.publish
    };
  }

  return {
    label: '返回工作台',
    to: roleRouteMap.enterprise.home
  };
});

const contractPulseTitle = computed(() => {
  if (mode.value === 'billing') {
    return '当前账单信号';
  }
  return '当前合同信号';
});

const ledgerPulseTitle = computed(() => {
  if (mode.value === 'billing') {
    return '最近账单信号';
  }
  return '最近交易信号';
});

const contractPulseEyebrow = computed(() => (mode.value === 'billing' ? '账单脉冲' : '合同脉冲'));

const ledgerPulseEyebrow = computed(() => (mode.value === 'billing' ? '账单台账' : '台账脉冲'));

const footnoteTitle = computed(() => {
  if (mode.value === 'reports') {
    return '这里继续看交易、结算和账单信号';
  }
  if (mode.value === 'billing') {
    return '这里先看账单状态、限制和关联记录';
  }
  return '这里继续看合同、交易和账单摘要';
});

const footnoteBody = computed(() => {
  if (mode.value === 'reports') {
    return '执行、沟通和验收仍在合同与验收页继续，这里只专注交易状态、结算节奏和支出摘要。';
  }
  if (mode.value === 'billing') {
    return '执行、沟通和验收仍在合同与验收页继续，这里只专注账单状态、限制和关联记录。';
  }
  return '执行、沟通和验收仍在合同与验收页继续，这里只专注合同对象、交易状态和账单摘要。';
});

const enterpriseRecords = computed(() =>
  listOf(recordsPage.value?.items).map((item, index) => {
    const recordId = textOf(item?.recordId, item?.id, item?.taskId, `record-${index}`);
    const taskId = textOf(item?.taskId, item?.id);
  return {
    id: recordId,
    kind: 'contract',
    title: textOf(item?.title, '未命名合同'),
      status: translateClientOperationsStatus(textOf(item?.statusGroup, item?.stage), '待更新'),
      rawStatus: textOf(item?.statusGroup, item?.stage, '待更新'),
      amount: textOf(item?.amountValue, formatMoney(item?.amount)),
      counterpart: textOf(item?.counterpartName, item?.partnerName, '待更新'),
      updatedAt: textOf(item?.updatedAt, item?.endAt, item?.endDate, '待更新'),
      note: textOf(item?.summary, item?.note, '打开详情查看完整记录。'),
      taskId,
      recordId,
      detailRoute: { path: roleRouteMap.enterprise.recordDetail(recordId) },
      workspaceRoute: taskId ? { path: roleRouteMap.enterprise.workspace, query: { taskId, source: 'client-operations' } } : null,
      primaryLabel: mode.value === 'billing' ? '打开账单记录' : '打开合同',
      secondaryLabel: taskId ? (mode.value === 'billing' ? '打开关联合同' : '继续处理合同') : '打开合同',
      raw: item
    };
  })
);

const recentTransactions = computed(() =>
  listOf(normalizedFinanceSummary.value.recentExpenses).map((item, index) => {
    const recordId = textOf(item?.recordId, item?.record?.recordId, item?.record?.id, item?.taskId, `expense-${index}`);
    const taskId = textOf(item?.taskId, item?.record?.taskId, '');
    return {
      id: textOf(item?.expenseId, item?.id, recordId, `expense-${index}`),
      kind: 'transaction',
      title: textOf(item?.title, item?.vendor, item?.category, '交易记录'),
      status: translateClientOperationsStatus(textOf(item?.status, item?.category), '待更新'),
      rawStatus: textOf(item?.status, item?.category, '待更新'),
      amount: textOf(item?.amount, item?.total, item?.value, '￥0'),
      counterpart: textOf(item?.vendor, item?.counterpartName, '平台交易'),
      updatedAt: textOf(item?.spentAt, item?.createdAt, item?.date, '待更新'),
      note: textOf(item?.note, '继续核对账期和交易上下文。'),
      taskId,
      recordId,
      detailRoute: { path: roleRouteMap.enterprise.recordDetail(recordId) },
      workspaceRoute: taskId ? { path: roleRouteMap.enterprise.workspace, query: { taskId, source: 'client-reports' } } : null,
      primaryLabel: '打开交易',
      secondaryLabel: taskId ? '返回关联合同' : '当前没有关联合同',
      raw: item
    };
  })
);

const billingEntries = computed(() => {
  const readinessRows = activationStatus.value.items.map((item, index) => {
    const taskId = textOf(item?.taskId, item?.record?.taskId);
    const recordId = textOf(item?.recordId, item?.record?.recordId, item?.record?.id, taskId, `billing-status-${index}`);
    return {
      id: textOf(item?.id, item?.key, item?.title, `billing-status-${index}`),
      kind: 'billing-status',
      title: textOf(item?.title, item?.label, '账单状态'),
      status: translateClientOperationsStatus(textOf(item?.statusLabel, item?.badge, item?.typeLabel, item?.type), '待更新'),
      rawStatus: textOf(item?.statusLabel, item?.badge, item?.typeLabel, item?.type, '待更新'),
      amount: textOf(item?.amountValue, moneyText(item?.amount), '—'),
      counterpart: textOf(item?.ownerLabel, item?.groupLabel, item?.typeLabel, '账单状态'),
      updatedAt: textOf(item?.updatedAt, item?.reviewedAt, item?.checkedAt, '待更新'),
      note: textOf(item?.note, item?.summary, '先看状态、限制和下一步账单动作。'),
      taskId,
      recordId,
      detailRoute: item?.actionTo || null,
      workspaceRoute: taskId ? { path: roleRouteMap.enterprise.workspace, query: { taskId, source: 'client-billing' } } : null,
      primaryLabel: item?.actionTo ? textOf(item?.actionLabel, '继续处理账单状态') : '先看当前状态',
      secondaryLabel: taskId ? '打开关联合同' : '当前没有关联合同',
      raw: item
    };
  });

  const relatedRows = recentTransactions.value.map((item, index) => ({
    ...item,
    id: `billing-related-${item.id || index}`,
    kind: 'billing-entry',
    primaryLabel: '打开账单记录',
    secondaryLabel: item.taskId ? '打开关联合同' : '当前没有关联合同'
  }));

  return [...readinessRows, ...relatedRows];
});

const billingReadinessRows = computed(() => billingEntries.value.filter((item) => item.kind === 'billing-status'));
const billingTransactionRows = computed(() => billingEntries.value.filter((item) => item.kind === 'billing-entry'));

const tableRows = computed(() => {
  if (mode.value === 'reports') {
    return recentTransactions.value;
  }
  if (mode.value === 'billing') {
    return billingEntries.value;
  }
  return enterpriseRecords.value;
});

const statusOptions = computed(() => Array.from(new Set(tableRows.value.map((item) => textOf(item.status)).filter(Boolean))));
const statusFilterLabel = computed(() => (statusFilter.value === 'all' ? '全部状态' : statusFilter.value));
const dateWindowLabel = computed(() => (dateWindow.value === 'all' ? '全部时间' : dateWindow.value === '30d' ? '近 30 天' : '近 90 天'));

const visibleRows = computed(() =>
  tableRows.value.filter((row) => matchesCurrentFilters(row))
);

const visibleBillingReadinessRows = computed(() => billingReadinessRows.value.filter((row) => matchesCurrentFilters(row)));
const visibleBillingTransactionRows = computed(() => billingTransactionRows.value.filter((row) => matchesCurrentFilters(row)));

const selectedRow = computed(() => visibleRows.value.find((item) => item.id === selectedRowId.value) || visibleRows.value[0] || null);

const selectedRowFacts = computed(() => {
  if (!selectedRow.value) {
    return [];
  }

  const isBillingStatusRow = mode.value === 'billing' && selectedRow.value.kind === 'billing-status';

  return [
    {
      label: mode.value === 'reports'
        ? '交易金额'
        : mode.value === 'billing'
          ? (isBillingStatusRow ? '当前归属' : '账单金额')
          : '合同金额',
      value: isBillingStatusRow ? (selectedRow.value.counterpart || '账单状态') : selectedRow.value.amount,
      note: mode.value === 'reports'
        ? '先确认这笔交易对应的金额。'
        : mode.value === 'billing'
          ? (isBillingStatusRow ? '这里先看这一步当前由谁处理。' : '先确认这条账单记录对应的金额。')
          : '先确认这份合同对象对应的金额。'
    },
    {
      label: mode.value === 'reports'
        ? '交易状态'
        : mode.value === 'billing'
          ? (isBillingStatusRow ? '当前状态' : '账单状态')
          : '当前状态',
      value: selectedRow.value.status || '待更新',
      note: mode.value === 'reports'
        ? '这笔交易的最新状态会继续在这里同步。'
        : mode.value === 'billing'
          ? (isBillingStatusRow ? '账单状态变化会继续在这里同步。' : '这条账单记录的状态会继续在这里同步。')
          : '这份合同对象的状态会继续在这里同步。'
    },
    {
      label: mode.value === 'billing'
        ? (isBillingStatusRow ? '下一步' : '关联合同')
        : '相关对象',
      value: isBillingStatusRow
        ? (selectedRow.value.primaryLabel || '继续处理账单状态')
        : (selectedRow.value.counterpart || '待更新'),
      note: isBillingStatusRow
        ? '优先从上面的账单动作继续这一步。'
        : (selectedRow.value.workspaceRoute ? '可以继续进入关联合同查看。' : '这条对象暂时还没有关联合同入口。')
    },
    {
      label: '最近更新',
      value: selectedRow.value.updatedAt || '待更新',
      note: selectedRow.value.recordId ? `记录 ${selectedRow.value.recordId}` : '这条对象还处在过渡读模型里。'
    }
  ];
});

const summaryCards = computed(() => {
  if (mode.value === 'reports') {
    return [
      { label: '总支出', value: moneyText(normalizedFinanceSummary.value.totalSpent), note: '当前账期累计支出。' },
      { label: '待结算', value: moneyText(normalizedFinanceSummary.value.pendingPayable), note: '还在请款、对账或结算流程里的金额。' },
      { label: '争议金额', value: moneyText(normalizedFinanceSummary.value.disputedAmount), note: '仍然需要人工核对的金额。' },
      { label: '交易数', value: String(recentTransactions.value.length), note: '这页当前可以继续核对的交易条数。' }
    ];
  }

  if (mode.value === 'billing') {
    return [
      { label: '阻断项', value: String(activationStatus.value.blockingCount), note: '邮箱、手机号或账单限制仍在影响当前账期。' },
      { label: '缺口项', value: String(activationStatus.value.gapCount), note: '还有账单设置项需要补齐后才能完全放开。' },
      { label: '本期支出', value: moneyText(normalizedFinanceSummary.value.totalSpent), note: '当前账期累计支出。' },
      { label: '账单记录', value: String(billingEntries.value.length), note: '当前可以继续查看的账单记录数。' }
    ];
  }

  const completedCount = enterpriseRecords.value.filter((item) => /(完成|已完成|结算|closed|completed|settled)/i.test(item.rawStatus || item.status)).length;
  const activeCount = enterpriseRecords.value.filter((item) => item.status && !/(完成|已完成|结算|closed|completed|settled)/i.test(item.rawStatus || item.status)).length;

  return [
    { label: '合同对象', value: String(enterpriseRecords.value.length), note: '当前可以继续处理的合同对象数量。' },
    { label: '进行中', value: String(activeCount), note: '仍在执行、验收或待决策中的合同对象。' },
    { label: '已完成', value: String(completedCount), note: '已经完成评价或结算的合作。' },
    { label: '待结算', value: moneyText(normalizedFinanceSummary.value.pendingPayable), note: '财务链路里还没有收完的部分。' }
  ];
});

const contractCards = computed(() =>
  listOf(businessPage.value?.contractSummary).slice(0, 4).map((item, index) => ({
    id: textOf(item?.taskId, item?.id, `contract-${index}`),
    title: textOf(item?.title, item?.name, '合同上下文'),
    status: translateClientOperationsStatus(textOf(item?.status, item?.stage), '待更新'),
    note: textOf(item?.note, item?.summary, '继续看这份合同对象的当前状态和下一步。')
  }))
);

const actionableActivationItems = computed(() =>
  activationStatus.value.items.filter((item) => item.actionTo && !item.disabled)
);

const disabledActivationItems = computed(() =>
  activationStatus.value.items
    .filter((item) => item.actionLabel && item.disabled)
    .map((item) => ({
      ...item,
      displayLabel: textOf(item?.blockedReason, item?.note, item?.actionLabel, '当前暂不可操作'),
    }))
);
const billingBannerVisible = computed(() =>
  mode.value === 'billing'
  && (
    activationStatus.value.hasBlockingItems
    || actionableActivationItems.value.length > 0
    || disabledActivationItems.value.length > 0
  )
);
const showBillingGapCard = computed(() => mode.value === 'billing' && !billingBannerVisible.value && activationStatus.value.gapCount > 0);
const billingGapTitle = computed(() => '继续之前先把账单状态看清楚');
const billingGapSummary = computed(() => {
  if (activationStatus.value.hasBlockingItems) {
    return '先处理邮箱、手机号或账单限制，再继续看账单记录和关联合同。';
  }
  if (activationStatus.value.gapCount > 0) {
    return '先补齐当前账单设置，再回来核对关联记录和账期。';
  }
  return '';
});

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function textOf(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

function moneyText(value) {
  return textOf(value, formatMoney(value));
}

function matchesCurrentFilters(row) {
  if (statusFilter.value !== 'all' && row.status !== statusFilter.value) {
    return false;
  }

  if (dateWindow.value === 'all') {
    return true;
  }

  const time = resolveRowTime(row);
  if (!time) {
    return false;
  }

  const days = dateWindow.value === '30d' ? 30 : 90;
  return Date.now() - time.getTime() <= days * 24 * 60 * 60 * 1000;
}

function translateClientOperationsStatus(value, fallback = '待更新') {
  const raw = textOf(value);
  if (!raw) {
    return fallback;
  }

  return (
    {
      待验收: '待验收',
      待审批: '待审批',
      待请款: '待请款',
      待开票: '待开票',
      待对账: '待对账',
      待结算: '待结算',
      待开始: '未开始',
      未发起: '未开始',
      执行中: '进行中',
      进行中: '进行中',
      已完成: '已完成',
      完成: '已完成',
      已结算: '已结算',
      已通过: '已通过',
      已驳回: '已驳回',
      已付款: '已付款',
      处理中: '处理中',
      争议处理中: '争议处理中'
    }[raw] || raw
  );
}

function resolveRowTime(row) {
  const source = textOf(row?.updatedAt, row?.raw?.updatedAt, row?.raw?.spentAt, row?.raw?.createdAt, row?.raw?.date);
  if (!source) {
    return null;
  }

  const parsed = new Date(source);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function openRow(row) {
  if (!row) {
    selectedRowId.value = '';
    return;
  }
  if (row.kind === 'transaction') {
    if (mode.value === 'billing') {
      statusFilter.value = 'all';
      dateWindow.value = 'all';
      selectedRowId.value = `billing-related-${row.id}`;
      return;
    }
    if (mode.value !== 'reports') {
      statusFilter.value = 'all';
      dateWindow.value = 'all';
      selectedRowId.value = row.id || '';
      router.push(roleRouteMap.enterprise.reports);
      return;
    }
  }
  if ((row.kind === 'billing-entry' || row.kind === 'billing-status') && mode.value !== 'billing') {
    statusFilter.value = 'all';
    dateWindow.value = 'all';
    selectedRowId.value = row.id || '';
    router.push(roleRouteMap.enterprise.billing);
    return;
  }
  if (row.kind === 'contract' && mode.value !== 'contracts') {
    statusFilter.value = 'all';
    dateWindow.value = 'all';
    selectedRowId.value = row.id || '';
    router.push(roleRouteMap.enterprise.contracts);
    return;
  }
  selectedRowId.value = row?.id || '';
}

function handleBillingAction(item) {
  pageFeedback.value = {
    title: item.label,
    message: item.note || '这个账单入口暂时还不能继续，请先处理上面的账号状态和账单限制。'
  };
}

async function exportCurrentView() {
  if (!visibleRows.value.length || exportBusy.value) {
    return;
  }

  exportBusy.value = true;
  pageFeedback.value = {
    title: '正在准备导出',
    message: `正在整理${mode.value === 'reports' ? '交易' : mode.value === 'billing' ? '账单' : '合同'}视图的导出内容。`
  };

  try {
    const exportJob = await requestClientReportExport({
      mode: mode.value,
      statusFilter: statusFilter.value,
      dateWindow: dateWindow.value,
      rows: visibleRows.value.map((row) => ({
        title: row.title,
        status: row.status,
        amount: row.amount,
        counterpart: row.counterpart,
        updatedAt: row.updatedAt,
        note: row.note
      }))
    });

    if (exportJob?.requestError || !exportJob?.export?.exportId) {
      pageFeedback.value = {
        title: '导出任务创建失败',
        message: exportJob?.requestError || '当前无法创建导出任务，请稍后再试。'
      };
      return;
    }

    const download = await downloadClientReportExport(
      exportJob.export.exportId,
      exportJob.export.fileName || `client-${mode.value}-${new Date().toISOString().slice(0, 10)}.csv`
    );

    if (download?.requestError || !download?.blob) {
      pageFeedback.value = {
        title: '导出任务已创建',
        message: download?.requestError || '导出文件已经生成，但当前无法下载，请稍后再试。'
      };
      return;
    }

    if (typeof window !== 'undefined') {
      const href = window.URL.createObjectURL(download.blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = download.fileName || `client-${mode.value}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
    }

    pageFeedback.value = {
      title: '导出完成',
      message: `已为当前${mode.value === 'reports' ? '交易' : mode.value === 'billing' ? '账单' : '合同'}视图生成 ${exportJob.export.rowCount || visibleRows.value.length} 条记录的导出文件。`
  };
  } finally {
    exportBusy.value = false;
  }
}

async function loadPage() {
  const [business, records] = await Promise.all([
    getBusinessData(),
    getOrderRecords('enterprise', 'all')
  ]);
  businessPage.value = business;
  recordsPage.value = records;
}

watch(mode, () => {
  statusFilter.value = 'all';
  dateWindow.value = 'all';
  pageFeedback.value = null;
});

watch(visibleRows, (rows) => {
  if (!rows.length) {
    selectedRowId.value = '';
    return;
  }

  if (!rows.some((item) => item.id === selectedRowId.value)) {
    selectedRowId.value = rows[0].id;
  }
}, { immediate: true });

watch(
  () => route.fullPath,
  () => {
    pageFeedback.value = null;
  }
);

onMounted(async () => {
  await loadPage();
});
</script>

<style scoped>
.client-ops-page {
  --ops-panel: rgba(255, 255, 255, 0.96);
  --ops-border: rgba(21, 36, 61, 0.08);
  --ops-muted: #5a697d;
  --ops-accent: #127d57;
}

.client-ops-hero,
.client-ops-filter-bar,
.client-ops-summary,
.client-ops-table-card,
.client-ops-detail,
.client-ops-page .glass-panel {
  background: var(--ops-panel);
  border: 1px solid var(--ops-border);
}

.client-ops-hero__header,
.client-ops-filter-bar,
.client-ops-layout {
  display: flex;
  gap: 18px;
}

.client-ops-hero__header {
  align-items: flex-start;
  justify-content: space-between;
}

.client-ops-hero__actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.client-ops-banner {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(240px, 1fr);
  gap: 16px;
}

.client-ops-banner__actions {
  align-items: flex-start;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.client-ops-gap-card {
  border-color: rgba(255, 159, 103, 0.22);
  background:
    radial-gradient(circle at top right, rgba(255, 159, 103, 0.14), transparent 46%),
    linear-gradient(180deg, rgba(45, 24, 12, 0.92), rgba(14, 19, 34, 0.96));
}

.client-ops-filter-bar {
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-radius: 24px;
}

.client-ops-filter-bar__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  flex: 1;
}

.client-ops-mode-tab {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid transparent;
  background: rgba(15, 23, 38, 0.04);
  color: #0f1726;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.client-ops-mode-tab:hover,
.client-ops-mode-tab.is-active {
  transform: translateY(-1px);
  border-color: rgba(18, 125, 87, 0.22);
  background: linear-gradient(180deg, rgba(18, 125, 87, 0.12), rgba(18, 125, 87, 0.04));
}

.client-ops-mode-tab strong {
  font-size: 16px;
}

.client-ops-mode-tab small,
.client-ops-page .muted {
  color: var(--ops-muted);
}

.client-ops-filter-bar__controls {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.client-ops-select-field {
  display: grid;
  gap: 6px;
  min-width: 150px;
}

.client-ops-select-field span {
  font-size: 12px;
  color: var(--ops-muted);
}

.client-ops-layout {
  align-items: start;
}

.client-ops-layout > main {
  flex: 1.6;
}

.client-ops-layout > aside {
  width: min(360px, 100%);
}

.client-ops-summary__grid,
.client-ops-detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.client-ops-summary-card,
.client-ops-detail-fact,
.client-ops-mini-card {
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(15, 23, 38, 0.03), rgba(15, 23, 38, 0.01));
  border: 1px solid rgba(15, 23, 38, 0.06);
}

.client-ops-summary-card__label,
.client-ops-detail-fact span {
  font-size: 12px;
  color: var(--ops-muted);
}

.client-ops-table,
.client-ops-mini-list {
  display: grid;
  gap: 12px;
}

.client-ops-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 38, 0.08);
  background: rgba(247, 249, 251, 0.92);
  text-align: left;
  transition: border-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}

.client-ops-row:hover,
.client-ops-row.is-selected {
  border-color: rgba(18, 125, 87, 0.22);
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(15, 23, 38, 0.08);
}

.client-ops-row__head,
.client-ops-row__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.client-ops-row__actions {
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 108px;
  color: var(--ops-accent);
}

.client-ops-row__action {
  font-weight: 700;
}

.client-ops-empty {
  padding: 18px;
  border-radius: 18px;
  background: rgba(15, 23, 38, 0.03);
  border: 1px dashed rgba(15, 23, 38, 0.12);
}

.client-ops-mini-card {
  text-align: left;
}

.client-ops-footnote {
  border-radius: 22px;
}

.client-ops-banner :deep(.soft-pill.is-gap) {
  background: rgba(212, 162, 44, 0.14);
}

.client-ops-banner :deep(.soft-pill.is-action-required),
.client-ops-banner :deep(.soft-pill.is-blocked) {
  background: rgba(204, 78, 78, 0.12);
}

@media (max-width: 1100px) {
  .client-ops-hero__header,
  .client-ops-filter-bar,
  .client-ops-layout {
    flex-direction: column;
  }

  .client-ops-layout > aside {
    width: 100%;
  }

  .client-ops-filter-bar__tabs {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .client-ops-banner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .client-ops-summary__grid,
  .client-ops-detail__grid,
  .client-ops-row {
    grid-template-columns: 1fr;
  }

  .client-ops-row__actions {
    align-items: flex-start;
  }
}
</style>

<style scoped>
/* codex visual polish */
.client-ops-hero {
  padding: 34px;
  border-radius: 34px;
  background: linear-gradient(135deg, rgba(239, 248, 236, 0.94), rgba(255, 255, 255, 0.98));
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.08);
}
.client-ops-hero__header {
  align-items: end;
}
.client-ops-hero__actions .button-secondary {
  border-color: transparent;
  background: transparent;
  min-height: auto;
  padding-inline: 0;
  color: #2d5b2f;
}
.client-ops-banner,
.client-ops-summary,
.client-ops-table-card,
.client-ops-detail,
.client-ops-page .glass-panel {
  border-radius: 28px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.05);
}
.client-ops-layout {
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}
.client-ops-summary {
  background: #fcfcf8;
}
.client-ops-summary__grid {
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.client-ops-summary-card,
.client-ops-detail-fact,
.client-ops-mini-card {
  border-radius: 22px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fff;
}
.client-ops-row {
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
}
.client-ops-detail {
  background: #fcfcf8;
  box-shadow: none;
  border: 1px solid rgba(17, 24, 39, 0.08);
}
.client-ops-empty {
  padding: 24px;
  border-radius: 24px;
  border: 1px dashed rgba(17, 24, 39, 0.12);
  background: #fafbf8;
}
.client-ops-page .button-link {
  color: #2d5b2f;
  text-decoration: none;
  font-weight: 600;
}
.client-ops-page .button-link:hover {
  text-decoration: underline;
}
@media (max-width: 1120px) {
  .client-ops-layout,
  .client-ops-summary__grid {
    grid-template-columns: 1fr;
  }
}
</style>
