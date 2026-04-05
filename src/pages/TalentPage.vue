<template>
  <section class="page-stack dashboard-page" v-if="page">
    <article v-if="page.requestError" class="result-card stack-sm">
      <strong>工作台数据暂时不可用</strong>
      <p class="muted">{{ page.requestError }}</p>
    </article>

    <section class="dashboard-cockpit-grid" :class="{ 'is-single': !showOverviewRail }">
      <DesktopAttentionHub
        :eyebrow="dashboardHubEyebrow"
        :title="dashboardHubTitle"
        :description="dashboardHubDescription"
        :summary-label="dashboardSummaryLabel"
        :summary-value="attentionSummaryDisplay"
        :summary-note="dashboardSummaryNote"
        :stats="attentionHubStats"
        :items="attentionHubItems"
        detail-title="资料回看"
        detail-description="作品、档期和评价继续放在次级层。"
        :detail-items="attentionHubDetails"
        toggle-label="更多"
        :primary-action="attentionPrimaryAction"
        :secondary-action="attentionSecondaryAction"
      />

      <article v-if="showOverviewRail" class="glass-panel dashboard-overview-rail stack-sm">
        <div class="dashboard-overview-header">
          <span class="eyebrow">工作摘要</span>
          <h3>{{ overviewTitle }}</h3>
        </div>

        <div class="dashboard-overview-list">
          <article v-for="item in snapshotItems" :key="item.label" class="dashboard-overview-item">
            <div class="dashboard-overview-copy">
              <span class="dashboard-overview-label">{{ item.label }}</span>
            </div>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </article>
    </section>

    <section class="glass-panel dashboard-wallet-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">钱包中心</span>
          <h3>收入与提现</h3>
        </div>
        <div class="toolbar">
          <router-link v-if="claimableRoute" class="button-secondary" :to="claimableRoute">去发起请款</router-link>
          <button class="button-secondary" type="button" @click="openWithdrawalSheet">申请提现</button>
        </div>
      </div>

      <div class="dashboard-wallet-kpis">
        <article v-for="item in walletSummaryCards" :key="item.label" class="dashboard-wallet-kpi">
          <span class="dashboard-wallet-kpi__label">{{ item.label }}</span>
          <strong class="dashboard-wallet-kpi__value">{{ item.value }}</strong>
          <p class="dashboard-wallet-kpi__note muted">{{ item.note }}</p>
        </article>
      </div>

      <article v-if="claimableRecords.length || hasPendingIncome" class="result-card stack-sm dashboard-wallet-claimable-card">
        <span class="eyebrow">{{ claimableRecords.length ? '待请款' : '待入账' }}</span>
        <h3>{{ walletPendingTitle }}</h3>
        <p class="muted">{{ walletPendingNote }}</p>

        <div v-if="claimableRecords.length" class="dashboard-wallet-claimable-list">
          <article v-for="item in claimableRecords" :key="item.id" class="dashboard-wallet-row">
            <div class="dashboard-wallet-row__copy">
              <strong>{{ item.title }}</strong>
              <p class="muted">{{ item.meta }}</p>
            </div>
            <div class="dashboard-wallet-row__aside">
              <strong>{{ item.amount }}</strong>
              <router-link class="button-secondary" :to="item.route">去发起请款</router-link>
            </div>
          </article>
        </div>
      </article>

      <div class="dashboard-wallet-columns">
        <section class="dashboard-wallet-column">
          <div class="dashboard-wallet-column__header">
            <span class="eyebrow">最近收入</span>
          </div>
          <article v-for="item in recentIncome" :key="item.id" class="dashboard-wallet-row">
            <div class="dashboard-wallet-row__copy">
              <strong>{{ item.title }}</strong>
              <p class="muted">{{ item.meta }}</p>
            </div>
            <div class="dashboard-wallet-row__aside">
              <strong>{{ item.amount }}</strong>
              <span class="muted">{{ item.time }}</span>
            </div>
          </article>
          <p v-if="!recentIncome.length" class="muted dashboard-wallet-empty">暂无最近收入记录。</p>
        </section>

        <section class="dashboard-wallet-column">
          <div class="dashboard-wallet-column__header">
            <span class="eyebrow">提现记录</span>
          </div>
          <article v-for="item in recentWithdrawals" :key="item.id" class="dashboard-wallet-row">
            <div class="dashboard-wallet-row__copy">
              <strong>{{ item.title }}</strong>
              <p class="muted">{{ item.meta }}</p>
            </div>
            <div class="dashboard-wallet-row__aside">
              <strong>{{ item.amount }}</strong>
              <span class="muted">{{ item.time }}</span>
            </div>
          </article>
          <p v-if="!recentWithdrawals.length" class="muted dashboard-wallet-empty">暂无提现记录。</p>
        </section>
      </div>
    </section>

    <LiveSyncStatusBar :snapshot="liveSyncStatus" :error-note="liveSyncError" />

    <section class="dashboard-module-list">
      <article v-for="module in primaryModules" :key="module.id" class="glass-panel dashboard-module-card">
        <div class="dashboard-module-row">
          <div class="dashboard-module-copy">
            <div class="dashboard-module-heading">
              <h3>{{ module.title }}</h3>
              <p class="muted">{{ module.description }}</p>
            </div>
            <div class="dashboard-module-preview">
              <p class="dashboard-module-meta">{{ module.preview[0] }}</p>
              <p v-if="module.preview[1]" class="dashboard-module-submeta muted">{{ module.preview[1] }}</p>
            </div>
          </div>

          <div class="dashboard-module-actions">
            <button class="button-secondary" type="button" @click="openModule(module)">
              打开
            </button>
          </div>
        </div>
      </article>
    </section>

    <section v-if="secondaryModules.length" class="glass-panel dashboard-secondary-strip">
      <div class="dashboard-secondary-copy">
        <span class="eyebrow">次级入口</span>
        <strong>协作和记录继续放在次级层。</strong>
        <p class="muted">首屏先处理待确认和主入口，执行细节继续留在次级入口和左侧导航里。</p>
      </div>

      <div class="dashboard-secondary-actions">
        <button
          v-for="module in secondaryModules"
          :key="module.id"
          class="button-secondary"
          type="button"
          @click="openModule(module)"
        >
          {{ module.title }}
        </button>
      </div>
    </section>

    <div v-if="activeModule" class="dashboard-detail-modal" @click.self="closeModule">
      <article class="dashboard-detail-card stack-md" role="dialog" aria-modal="true">
        <div class="panel-header">
          <div>
            <h3>{{ activeModule.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeModule">关闭</button>
        </div>

        <p class="muted">{{ activeModule.description }}</p>

        <div class="dashboard-detail-section">
          <h4>简要预览</h4>
          <ul class="dashboard-detail-list">
            <li v-for="item in activeModule.details.slice(0, 4)" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div class="dashboard-module-actions">
          <router-link class="button-primary" :to="resolveModuleNotificationRoute(activeModule)" @click="closeModule">
            进入通知中心
          </router-link>
          <router-link v-if="activeModule.allowDirectRoute && activeModule.route" class="button-secondary" :to="activeModule.route" @click="closeModule">
            保留原入口
          </router-link>
          <button v-else class="button-primary" type="button" @click="closeModule">已了解</button>
        </div>
      </article>
    </div>

    <div v-if="withdrawalSheetOpen" class="dashboard-detail-modal" @click.self="closeWithdrawalSheet">
      <article class="dashboard-detail-card stack-md" role="dialog" aria-modal="true">
        <div class="panel-header">
          <div>
            <span class="eyebrow">提现申请</span>
            <h3>提交提现申请</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeWithdrawalSheet">关闭</button>
        </div>

        <p class="muted">填写收款方式与账户信息后提交，平台审核通过后会进入人工打款处理。</p>

        <form class="stack-md" @submit.prevent="submitWithdrawal">
          <label class="stack-xs">
            <span class="dashboard-wallet-form__label">提现金额</span>
            <input
              v-model="withdrawalForm.amount"
              class="dashboard-wallet-form__input"
              type="number"
              min="0"
              step="0.01"
              inputmode="decimal"
              placeholder="请输入提现金额"
            >
          </label>

          <label class="stack-xs">
            <span class="dashboard-wallet-form__label">收款方式</span>
            <select v-model="withdrawalForm.payoutChannel" class="dashboard-wallet-form__input">
              <option value="BANK_TRANSFER">银行卡</option>
              <option value="ALIPAY">支付宝</option>
              <option value="WECHAT">微信收款</option>
            </select>
          </label>

          <label class="stack-xs">
            <span class="dashboard-wallet-form__label">收款人姓名</span>
            <input
              v-model="withdrawalForm.accountName"
              class="dashboard-wallet-form__input"
              type="text"
              placeholder="请输入收款人姓名"
            >
          </label>

          <label class="stack-xs">
            <span class="dashboard-wallet-form__label">收款账号</span>
            <input
              v-model="withdrawalForm.accountNo"
              class="dashboard-wallet-form__input"
              type="text"
              inputmode="text"
              placeholder="请输入银行卡号 / 支付宝账号 / 微信号"
            >
          </label>

          <label v-if="withdrawalForm.payoutChannel === 'BANK_TRANSFER'" class="stack-xs">
            <span class="dashboard-wallet-form__label">开户行</span>
            <input
              v-model="withdrawalForm.bankName"
              class="dashboard-wallet-form__input"
              type="text"
              placeholder="请输入开户行名称"
            >
          </label>

          <label class="stack-xs">
            <span class="dashboard-wallet-form__label">备注</span>
          <textarea
            v-model="withdrawalForm.note"
            class="dashboard-wallet-form__textarea"
            rows="3"
            placeholder="选填，说明提现用途或备注"
          ></textarea>
          </label>

          <p v-if="withdrawalError" class="dashboard-wallet-form__error">{{ withdrawalError }}</p>

          <div class="dashboard-module-actions">
            <button class="button-primary" type="submit" :disabled="withdrawalSubmitting">
              {{ withdrawalSubmitting ? '提交中...' : '提交申请' }}
            </button>
            <button class="button-secondary" type="button" @click="closeWithdrawalSheet">取消</button>
          </div>
        </form>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import DesktopAttentionHub from '../components/DesktopAttentionHub.vue';
import LiveSyncStatusBar from '../components/LiveSyncStatusBar.vue';
import { createWithdrawalRequest, getTalentData } from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream';
import { roleRouteMap } from '../utils/roleRoutes';
import { buildCenterEntryRoute, pickPreferredAttentionItem } from '../utils/attentionNavigation';

const page = ref(null);
const activeModuleId = ref('');
const liveSyncStatus = ref(null);
const liveSyncError = ref('');
let stopBusinessLiveSync = null;

function handleLiveSyncStatus(snapshot) {
  liveSyncStatus.value = snapshot ? { ...snapshot } : null;
  if (snapshot?.state === 'open') {
    liveSyncError.value = '';
  }
}

function handleLiveSyncError() {
  liveSyncError.value = '最近一次实时同步出现波动，页面会自动重连或切到轮询。';
}

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

function moneyText(value, fallback = '¥0') {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  const normalized = Number(value);
  if (Number.isFinite(normalized)) {
    return `¥${normalized.toLocaleString('zh-CN')}`;
  }

  return fallback;
}

function timeText(value) {
  if (!value) {
    return '待同步';
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return textOf(value, '待同步');
}

const walletSummary = computed(() => page.value?.walletSummary || {});
const walletSummaryCards = computed(() => [
  {
    label: '已入账',
    value: moneyText(walletSummary.value.totalEarned),
    note: '已经完成结算并进入钱包'
  },
  {
    label: '待入账',
    value: moneyText(walletSummary.value.pendingIncome),
    note: '已完成但还没进入钱包的金额'
  },
  {
    label: '可提现',
    value: moneyText(walletSummary.value.availableToWithdraw),
    note: '可以直接发起申请'
  },
  {
    label: '提现中',
    value: moneyText(walletSummary.value.frozenAmount),
    note: '正在处理中的金额'
  },
  {
    label: '已提现',
    value: moneyText(walletSummary.value.withdrawnAmount),
    note: '历史已完成打款金额'
  }
]);
const hasPendingIncome = computed(() => moneyNumber(walletSummary.value.pendingIncomeValue, walletSummary.value.pendingIncome) > 0);
const claimableRecords = computed(() =>
  listOf(walletSummary.value.claimableRecords).map((item, index) => {
    const taskId = textOf(item?.taskId, item?.recordId, '');
    return {
      id: textOf(item?.taskId, item?.incomeId, item?.id, `claimable-${index}`),
      title: textOf(item?.title, '待请款任务'),
      meta: textOf(item?.note, item?.status, '企业已完成验收和评级，当前可以发起请款。'),
      amount: moneyText(item?.amount ?? item?.amountValue),
      route: buildAcceptanceRoute({
        taskId,
        recordId: taskId,
        source: 'wallet'
      })
    };
  })
);
const claimableRoute = computed(() => claimableRecords.value[0]?.route || null);
const walletPendingTitle = computed(() => {
  if (claimableRecords.value.length) {
    return `有 ${claimableRecords.value.length} 笔已完成收入待请款`;
  }
  return '当前有金额正在等待入账';
});
const walletPendingNote = computed(() =>
  textOf(walletSummary.value.withdrawHint, hasPendingIncome.value ? '当前有金额处于审批、对账或结算阶段。' : '')
);
const recentIncome = computed(() =>
  listOf(walletSummary.value.recentIncome).map((item, index) => ({
    id: textOf(item?.incomeId, item?.id, `income-${index}`),
    title: textOf(item?.title, item?.source, item?.projectName, '收入明细'),
    meta: textOf(item?.status, item?.note, item?.category, '收入记录'),
    amount: moneyText(item?.amount ?? item?.value ?? item?.income),
    time: timeText(item?.earnedAt ?? item?.createdAt ?? item?.date)
  }))
);
const recentWithdrawals = computed(() => {
  const source = listOf(page.value?.withdrawals).length ? page.value?.withdrawals : walletSummary.value.withdrawals;
  return listOf(source).map((item, index) => ({
    id: textOf(item?.withdrawalId, item?.id, `withdrawal-${index}`),
    title: textOf(item?.status, '提现申请'),
    meta: textOf(item?.note, item?.requestedAt, '提现记录'),
    amount: moneyText(item?.amount),
    time: timeText(item?.requestedAt)
  }));
});
const withdrawalSheetOpen = ref(false);
const withdrawalSubmitting = ref(false);
const withdrawalError = ref('');
const withdrawalForm = ref({
  amount: '',
  payoutChannel: 'BANK_TRANSFER',
  accountName: '',
  accountNo: '',
  bankName: '',
  note: ''
});

function moneyNumber(...values) {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const normalized = Number(value.replace(/[￥¥,\s]/g, ''));
      if (Number.isFinite(normalized)) {
        return normalized;
      }
    }
  }
  return NaN;
}

function openWithdrawalSheet() {
  const availableAmount = textOf(walletSummary.value.availableToWithdrawValue, walletSummary.value.availableToWithdraw);
  withdrawalError.value = '';
  withdrawalForm.value = {
    amount: availableAmount || '',
    payoutChannel: 'BANK_TRANSFER',
    accountName: textOf(page.value?.hero?.name) || '',
    accountNo: '',
    bankName: '',
    note: ''
  };
  withdrawalSheetOpen.value = true;
}

function closeWithdrawalSheet() {
  withdrawalSheetOpen.value = false;
  withdrawalError.value = '';
}

async function submitWithdrawal() {
  const amount = Number(withdrawalForm.value.amount);
  const available = moneyNumber(walletSummary.value.availableToWithdrawValue, walletSummary.value.availableToWithdraw);

  if (!Number.isFinite(amount) || amount <= 0) {
    withdrawalError.value = '请输入有效的提现金额。';
    return;
  }
  if (!textOf(withdrawalForm.value.accountName)) {
    withdrawalError.value = '请填写收款人姓名。';
    return;
  }
  if (!textOf(withdrawalForm.value.accountNo)) {
    withdrawalError.value = '请填写收款账号。';
    return;
  }
  if (withdrawalForm.value.payoutChannel === 'BANK_TRANSFER' && !textOf(withdrawalForm.value.bankName)) {
    withdrawalError.value = '银行卡提现需要填写开户行。';
    return;
  }

  if (Number.isFinite(available) && available > 0 && amount > available) {
    withdrawalError.value = '提现金额不能超过可提现余额。';
    return;
  }

  withdrawalSubmitting.value = true;
  withdrawalError.value = '';

  try {
    const result = await createWithdrawalRequest({
      amount,
      payoutChannel: textOf(withdrawalForm.value.payoutChannel, 'BANK_TRANSFER'),
      accountName: textOf(withdrawalForm.value.accountName),
      accountNo: textOf(withdrawalForm.value.accountNo),
      bankName: textOf(withdrawalForm.value.bankName),
      note: textOf(withdrawalForm.value.note)
    });

    if (result?.requestError || result?.success === false || result?.status === 'FAILED') {
      withdrawalError.value = textOf(result?.requestError, result?.message, '提现申请提交失败，请稍后再试。');
      return;
    }

    closeWithdrawalSheet();
    await loadPage();
  } catch (error) {
    withdrawalError.value = textOf(error?.message, '提现申请提交失败，请稍后再试。');
  } finally {
    withdrawalSubmitting.value = false;
  }
}

function joinText(value, separator = ' / ') {
  const items = listOf(value).filter(Boolean);
  return items.length ? items.join(separator) : '暂未设置标签';
}

function stringValue(value) {
  return value == null ? '' : String(value).trim();
}

function normalizeGroupKey(value) {
  const normalized = stringValue(value).toLowerCase();
  if (!normalized) {
    return '';
  }
  if (normalized.includes('all') || normalized.includes('全部')) {
    return 'all';
  }
  if (normalized.includes('confirm') || normalized.includes('确认')) {
    return 'confirmations';
  }
  if (normalized.includes('change') || normalized.includes('修改')) {
    return 'changes';
  }
  if (normalized.includes('selection') || normalized.includes('match') || normalized.includes('选人') || normalized.includes('发布')) {
    return 'matching';
  }
  if (normalized.includes('grade') || normalized.includes('review') || normalized.includes('验收') || normalized.includes('评级')) {
    return 'reviews';
  }
  if (normalized.includes('cancel') || normalized.includes('取消')) {
    return 'cancellations';
  }
  if (normalized.includes('follow') || normalized.includes('chat') || normalized.includes('message') || normalized.includes('回看')) {
    return 'followup';
  }
  return '';
}

function looksLikeTaskContext(source) {
  if (!source || typeof source !== 'object') {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(source, 'taskId') ||
    Object.prototype.hasOwnProperty.call(source, 'progress') ||
    Object.prototype.hasOwnProperty.call(source, 'stage') ||
    Object.prototype.hasOwnProperty.call(source, 'status') ||
    Object.prototype.hasOwnProperty.call(source, 'note') ||
    Object.prototype.hasOwnProperty.call(source, 'attachments')
  );
}

function looksLikeRecordContext(source) {
  if (!source || typeof source !== 'object') {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(source, 'recordId') ||
    Object.prototype.hasOwnProperty.call(source, 'amount') ||
    Object.prototype.hasOwnProperty.call(source, 'amountValue') ||
    Object.prototype.hasOwnProperty.call(source, 'rating') ||
    Object.prototype.hasOwnProperty.call(source, 'counterpartName') ||
    Object.prototype.hasOwnProperty.call(source, 'partnerName') ||
    Object.prototype.hasOwnProperty.call(source, 'startAt') ||
    Object.prototype.hasOwnProperty.call(source, 'endAt') ||
    Object.prototype.hasOwnProperty.call(source, 'startDate') ||
    Object.prototype.hasOwnProperty.call(source, 'endDate')
  );
}

function mergeRouteContext(...sources) {
  const context = {};
  const queue = [...sources];

  const assign = (key, value) => {
    const next = stringValue(value);
    if (next && !context[key]) {
      context[key] = next;
    }
  };

  while (queue.length) {
    const source = queue.shift();
    if (!source) {
      continue;
    }
    if (Array.isArray(source)) {
      queue.unshift(...source);
      continue;
    }
    if (typeof source !== 'object') {
      continue;
    }

    assign('taskId', source.taskId ?? source.summary?.taskId ?? source.task?.taskId ?? source.task?.id);
    assign('room', source.room ?? source.roomKey ?? source.roomId ?? source.taskRoom?.roomKey ?? source.taskRoom?.roomId);
    if (looksLikeRecordContext(source)) {
      assign('recordId', source.recordId ?? source.id ?? source.record?.recordId ?? source.record?.id);
    }
    if (looksLikeTaskContext(source)) {
      assign('taskId', source.taskId ?? source.id ?? source.task?.taskId ?? source.task?.id);
    }
    assign('source', source.source ?? source.origin ?? source.entrySource ?? source.inputSource);
  }

  return context;
}

function buildQuery(context, allowedKeys = ['taskId', 'room', 'recordId', 'source']) {
  const query = {};

  allowedKeys.forEach((key) => {
    const value = stringValue(context?.[key]);
    if (value) {
      query[key] = value;
    }
  });

  return query;
}

function buildRoute(path, context, allowedKeys) {
  const query = buildQuery(context, allowedKeys);
  if (!query.source) {
    query.source = 'dashboard-talent';
  }
  return Object.keys(query).length ? { path, query } : { path };
}

function buildNotificationCenterRoute(preferredItem) {
  return buildCenterEntryRoute({
    path: roleRouteMap.talent.notifications,
    source: 'dashboard-talent',
    preferredItem
  });
}

function buildChatRoute(...sources) {
  return buildRoute(roleRouteMap.talent.messages, mergeRouteContext(...sources));
}

function buildWorkspaceRoute(...sources) {
  return buildRoute(roleRouteMap.talent.workspace, mergeRouteContext(...sources));
}

function buildRecordRoute(...sources) {
  const context = mergeRouteContext(...sources);

  if (context.recordId) {
    return buildRoute(roleRouteMap.talent.recordDetail(context.recordId), context, ['taskId', 'room', 'source']);
  }

  return buildRoute(roleRouteMap.talent.records, context);
}

function buildAcceptanceRoute(...sources) {
  const context = mergeRouteContext(...sources);
  return buildRoute(roleRouteMap.talent.acceptance, context, ['taskId', 'recordId', 'room', 'source']);
}

function buildModuleRoute(moduleId, ...sources) {
  switch (moduleId) {
    case 'messages':
      return buildChatRoute(...sources);
    case 'workspace':
      return buildWorkspaceRoute(...sources);
    case 'records':
      return buildRecordRoute(...sources);
    default:
      return buildRoute(roleRouteMap.talent.market, mergeRouteContext(...sources), ['taskId', 'source']);
  }
}

function buildModuleContext(moduleId) {
  const attentionContext = attentionItems.value;
  const moduleSources = {
    messages: [page.value, attentionContext, listOf(page.value?.messages), listOf(page.value?.activeTasks), listOf(page.value?.acceptRecords)],
    workspace: [page.value, attentionContext, listOf(page.value?.activeTasks), listOf(page.value?.messages), listOf(page.value?.acceptRecords)],
    records: [page.value, attentionContext, listOf(page.value?.acceptRecords), listOf(page.value?.activeTasks), listOf(page.value?.messages)],
    market: [page.value, attentionContext, listOf(page.value?.marketplace)]
  };

  return mergeRouteContext(...(moduleSources[moduleId] || [page.value, attentionContext]));
}

function resolveModuleNotificationRoute(module) {
  const moduleId = typeof module === 'string' ? module : module?.id;
  const preferredAttention = pickPreferredAttentionItem(hubSourceItems.value, moduleId, {
    excludeGroupsByModule: {
      workspace: ['followup']
    },
    preferredGroupsByModule: {
      market: ['matching']
    }
  });

  switch (moduleId) {
    case 'messages':
      return buildNotificationCenterRoute(preferredAttention);
    case 'workspace':
      return buildNotificationCenterRoute(preferredAttention);
    case 'records':
      return buildNotificationCenterRoute(preferredAttention);
    default:
      return buildNotificationCenterRoute(preferredAttention);
  }
}

const attentionItems = computed(() => listOf(page.value?.attentionItems));
const notificationItems = computed(() =>
  listOf(page.value?.notificationItems).filter((item) => normalizeGroupKey(item?.groupKey || item?.id || item?.label || item?.title) !== 'followup')
);
const notificationGroups = computed(() => listOf(page.value?.notificationGroups));
const hubSourceItems = computed(() => (notificationItems.value.length ? notificationItems.value : attentionItems.value));
const notificationCenterRoute = computed(() => buildNotificationCenterRoute(hubSourceItems.value[0]));
const attentionTotal = computed(
  () => hubSourceItems.value.reduce((sum, item) => sum + (Number(item.count) || 0), 0)
);
const attentionSummaryValue = computed(() => `${attentionTotal.value} 项`);
const attentionSummaryDisplay = computed(() => (attentionTotal.value ? `${attentionTotal.value} 项` : '已清空'));
const dashboardSummaryLabel = computed(() => (attentionTotal.value ? '待处理事项' : '当前状态'));
const dashboardHubEyebrow = computed(() => (attentionTotal.value ? '待确认' : '当前状态'));
const dashboardHubTitle = computed(() => (attentionTotal.value ? '先确认' : '当前没有优先事项'));
const dashboardHubDescription = computed(() =>
  attentionTotal.value
    ? String(page.value?.attentionHeadline || '先确认任务，再决定是否修改。')
    : '直接进入聊天或任务广场即可。'
);
const dashboardSummaryNote = computed(() =>
  attentionTotal.value ? '先清确认、修改、验收。' : '首屏只保留最常用入口，次级信息下沉。'
);
const attentionHubItems = computed(() =>
  hubSourceItems.value.slice(0, 4).map((item, index) => ({
    id: item.id || `talent-attention-${index}`,
    label: item.label,
    note: String(item.note || item.copy || item.description || item.summary || '先进入通知中心，再落到当前事项'),
    count: item.count,
    to: buildNotificationCenterRoute(item)
  }))
);
const attentionPrimaryAction = computed(() => {
  return {
    to: attentionTotal.value ? notificationCenterRoute.value : roleRouteMap.talent.market,
    label: attentionTotal.value ? '通知中心' : '任务广场'
  };
});
const attentionSecondaryAction = computed(() => ({
  to: attentionTotal.value ? roleRouteMap.talent.market : roleRouteMap.talent.messages,
  label: attentionTotal.value ? '任务广场' : '去聊天'
}));
function groupCount(groupKey) {
  const group = notificationGroups.value.find((item) => normalizeGroupKey(item?.key || item?.id || item?.label || item?.name) === groupKey);
  if (group) {
    return Number(group.count) || 0;
  }
  return notificationItems.value
    .filter((item) => normalizeGroupKey(item?.groupKey || item?.id || item?.label || item?.title) === groupKey)
    .reduce((sum, item) => sum + (Number(item.count) || 0), 0);
}
const attentionHubStats = computed(() => {
  if (!attentionTotal.value) {
    return [];
  }

  return [
    {
      label: '待确认',
      value: String(groupCount('confirmations') || 0),
      note: '先确认任务，再决定是否提出修改。'
    },
    {
      label: '待修改',
      value: String(groupCount('changes') || 0),
      note: '集中处理任务范围、工期和补充说明。'
    },
    {
      label: '待验收',
      value: String(groupCount('reviews') || 0),
      note: '已接近收尾的任务尽快完成交付。'
    }
  ].filter((item) => Number(item.value) > 0);
});

const summaryHighlights = computed(() => {
  if (!page.value) {
    return [];
  }

  const openDays = listOf(page.value.calendar).filter((item) => item.state === 'open').length;

  return [
    `评分 ${page.value.hero.score}`,
    `收入 ${page.value.hero.income}`,
    `档期 ${openDays} 天`
  ];
});
const attentionHubDetails = computed(() => [
  { label: '待处理事项', value: attentionSummaryValue.value },
  { label: '通知分组', value: `${notificationGroups.value.length || 0} 组` },
  { label: '技能与标签', value: `${listOf(page.value?.skills).length} 项` },
  { label: '作品条目', value: `${listOf(page.value?.portfolio).length} 个` },
  { label: '档期记录', value: `${listOf(page.value?.calendar).length} 条` },
  { label: '历史评价', value: `${listOf(page.value?.evaluations).length} 条` },
  { label: '当前概览', value: summaryHighlights.value.join(' / ') || '待同步' }
]);

const snapshotItems = computed(() => {
  if (!page.value) {
    return [];
  }

  const openDays = listOf(page.value.calendar).filter((item) => item.state === 'open').length;

  return [
    {
      label: '评分',
      raw: stringValue(page.value.hero?.score),
      value: stringValue(page.value.hero?.score) || '暂无',
      copy: '当前合作评分继续保留在这里。'
    },
    {
      label: '收入',
      raw: stringValue(page.value.hero?.income),
      value: stringValue(page.value.hero?.income) || '￥0',
      copy: '累计收入继续留在资料与记录里。'
    },
    {
      label: '空档期',
      raw: String(openDays),
      value: `${openDays} 天`,
      copy: '开放档期继续影响推荐排序。'
    },
    {
      label: '历史评价',
      raw: String(listOf(page.value.evaluations).length),
      value: `${listOf(page.value.evaluations).length} 条`,
      copy: '历史合作评价继续沉淀在记录里。'
    }
  ].filter((item) => item.raw && item.raw !== '0' && item.raw !== '暂无' && item.raw !== '￥0');
});
const showOverviewRail = computed(() => snapshotItems.value.length > 0);
const overviewTitle = computed(() => (showOverviewRail.value ? '右侧只保留有效摘要' : '补充信息'));

const modules = computed(() => {
  if (!page.value) {
    return [];
  }

  return [
    {
      id: 'messages',
      title: '聊天',
      description: page.value.pendingConfirmations?.length
        ? '先确认任务，再决定是否修改。'
        : '确认、补充和留痕都在这里。',
      preview: listOf(page.value.messages).length
        ? listOf(page.value.messages).slice(0, 2).map((message) => `${message.from}：${message.text}`)
        : ['当前还没有聊天记录。'],
      details: listOf(page.value.messages).length
        ? listOf(page.value.messages).map((message) => `${message.time} · ${message.from}：${message.text}`)
        : ['聊天房间会按最新消息自动排序，新的协商任务也会在这里提醒。'],
      route: buildModuleRoute('messages', buildModuleContext('messages'))
    },
    {
      id: 'market',
      title: '任务广场',
      description: '按匹配度、预算和周期挑任务。',
      preview: listOf(page.value.marketplace).length
        ? listOf(page.value.marketplace).slice(0, 2).map((task) => `${task.title} · 匹配 ${task.match} · ${task.budget}`)
        : ['企业发布真实任务后，会在这里按时间和状态展示。'],
      details: listOf(page.value.marketplace).length
        ? listOf(page.value.marketplace).map((task) => `${task.title}：${task.period}，${task.budget}，标签 ${joinText(task.tags)}`)
        : ['当前还没有可浏览任务。企业发布后，任务广场会自动更新。'],
      route: buildModuleRoute('market', buildModuleContext('market')),
      allowDirectRoute: true
    },
    {
      id: 'workspace',
      title: '协作',
      description: '提交进度、协助需求和附件。',
      preview: listOf(page.value.activeTasks).length
        ? listOf(page.value.activeTasks).slice(0, 2).map((task) => `${task.title} · 进度 ${task.progress}`)
        : ['当前还没有进行中的真实项目。'],
      details: listOf(page.value.activeTasks).length
        ? listOf(page.value.activeTasks).map((task) => `${task.title}：${task.note}（当前进度 ${task.progress}）`)
        : ['当你确认任务后，进度和里程碑会在这里同步。'],
      route: buildModuleRoute('workspace', buildModuleContext('workspace'))
    },
    {
      id: 'records',
      title: '记录',
      description: '回看收入、周期和企业评分。',
      preview: listOf(page.value.acceptRecords).length
        ? listOf(page.value.acceptRecords).slice(0, 2).map((item) => `${item.title} · ${item.amountValue || '待确认'} · ${item.stage}`)
        : ['记录列表会保留金额、开始/结束时间和企业评级。'],
      details: listOf(page.value.acceptRecords).length
        ? listOf(page.value.acceptRecords).map((item) => `${item.title}：${item.counterpartName || '待同步'}，${item.rating?.value || '待评分'}，${item.updatedAt || '待同步'}`)
        : ['这里会继续沉淀每一单接单记录，并支持查看详情。'],
      route: buildModuleRoute('records', buildModuleContext('records'))
    }
  ];
});
const primaryModules = computed(() => modules.value.slice(0, 2));
const secondaryModules = computed(() => modules.value.slice(2));

function openModule(module) {
  activeModuleId.value = module?.id || '';
}

function closeModule() {
  activeModuleId.value = '';
}

const activeModule = computed(() =>
  modules.value.find((module) => module.id === activeModuleId.value) || null
);

async function loadPage() {
  page.value = await getTalentData();
}

function handleEscape(event) {
  if (event.key === 'Escape' && activeModuleId.value) {
    closeModule();
  }
}

onMounted(async () => {
  await loadPage();
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleEscape);
    stopBusinessLiveSync = startBusinessLiveSync({
      refresh: () => loadPage(),
      onStatusChange: handleLiveSyncStatus,
      onSyncError: handleLiveSyncError
    });
  }
});

onBeforeUnmount(() => {
  stopBusinessLiveSync?.();
  stopBusinessLiveSync = null;
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleEscape);
  }
});
</script>

<style scoped>
.dashboard-wallet-panel {
  padding: 18px;
}

.dashboard-wallet-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.dashboard-wallet-kpi {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(120, 190, 255, 0.14);
  background: rgba(10, 18, 34, 0.78);
}

.dashboard-wallet-kpi__label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
}

.dashboard-wallet-kpi__value {
  display: block;
  margin-top: 6px;
  font-size: 22px;
  color: var(--text-strong);
}

.dashboard-wallet-kpi__note {
  margin: 6px 0 0;
  font-size: 12px;
}

.dashboard-wallet-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.dashboard-wallet-column {
  display: grid;
  gap: 8px;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(120, 190, 255, 0.12);
  background: rgba(8, 14, 26, 0.72);
}

.dashboard-wallet-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-wallet-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(120, 190, 255, 0.08);
  background: rgba(10, 18, 34, 0.66);
}

.dashboard-wallet-row__copy,
.dashboard-wallet-row__aside {
  display: grid;
  gap: 4px;
}

.dashboard-wallet-row__aside {
  text-align: right;
  min-width: 110px;
}

.dashboard-wallet-empty {
  margin: 0;
}

.dashboard-wallet-form__label {
  color: var(--text-strong);
  font-size: 13px;
}

.dashboard-wallet-form__input,
.dashboard-wallet-form__textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(120, 190, 255, 0.14);
  background: rgba(8, 15, 28, 0.72);
  color: var(--text-strong);
  padding: 11px 12px;
  outline: none;
}

.dashboard-wallet-form__textarea {
  resize: vertical;
  min-height: 92px;
}

.dashboard-wallet-form__error {
  margin: 0;
  color: #ffb4b4;
}

@media (max-width: 1080px) {
  .dashboard-wallet-kpis,
  .dashboard-wallet-columns {
    grid-template-columns: 1fr;
  }
}
</style>
