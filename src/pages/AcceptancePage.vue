<template>
  <section v-if="page" class="page-stack acceptance-page">
    <ActionErrorDialog
      eyebrow="验收"
      :title="actionDialogTitle"
      :message="dialogErrorMessage"
    />

    <template v-if="page?.isUnavailable">
      <article class="result-card acceptance-lock-card stack-sm">
        <span class="eyebrow">页面状态</span>
        <h3>当前验收内容暂时不可用</h3>
        <p class="muted">{{ page.requestError || '当前验收数据暂时无法加载，请稍后再试。' }}</p>
        <div class="toolbar">
          <router-link class="button-primary" :to="acceptanceUnavailableRoute">
            {{ acceptanceBackLabel }}
          </router-link>
        </div>
      </article>
    </template>

    <template v-else>
      <article v-if="acceptanceTradingBlocked" class="result-card acceptance-lock-card stack-sm">
        <span class="eyebrow">账户受限</span>
        <h3>当前账号暂时不能继续合同操作</h3>
        <p class="muted">{{ acceptanceTradingRestriction }}</p>
      </article>

      <ContractShellHeader
        eyebrow="验收"
        :title="acceptanceHeroTitle"
        :lead="acceptanceHeroLead"
        :support-copy="acceptanceShellSupportCopy"
        :pills="acceptanceShellPills"
        :tabs="hasShellContext ? acceptanceShellTabs : []"
      />

      <div v-if="!hasShellContext && acceptanceBackRoute" class="toolbar acceptance-hero-actions">
        <router-link class="button-secondary" :to="acceptanceBackRoute">
          {{ acceptanceBackLabel }}
        </router-link>
      </div>

    <section class="acceptance-lane-strip">
      <article
        v-for="item in acceptanceMetricCards"
        :key="item.label"
        class="mini-card stack-sm acceptance-lane-card"
      >
        <span class="eyebrow">{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <p class="muted">{{ item.note }}</p>
      </article>
    </section>

    <section class="acceptance-grid">
      <main class="stack-lg acceptance-main">
        <article class="glass-panel stack-lg acceptance-action-panel">
          <div class="panel-header acceptance-section-header">
            <div>
              <span v-if="!hasShellContext" class="eyebrow">当前验收动作</span>
              <h3>{{ acceptanceActionTitle }}</h3>
            </div>
            <span class="soft-pill">{{ currentActorLabel }}</span>
          </div>

          <p class="muted acceptance-action-body">{{ acceptanceActionBody }}</p>
          <p v-if="assistantDraftSeed && (showGradeForm || showAcceptanceForm || showReviewForm)" class="muted acceptance-action-assistant-note">
            这一步已经带入了一份 AI 草稿，提交前先确认一遍。
          </p>
          <article v-if="page?.requestError" class="result-card stack-sm acceptance-inline-warning">
            <span class="eyebrow">当前上下文提示</span>
            <h3>这里附带了一条上下文说明</h3>
            <p class="muted">{{ page.requestError }}</p>
          </article>

          <template v-if="showGradeForm">
            <fieldset class="acceptance-grid-cards acceptance-grade-group">
              <legend class="sr-only">选择最终合同评级</legend>
              <label
                v-for="item in gradeOptions"
                :key="item.value"
                class="mini-card stack-sm acceptance-option-card acceptance-option-choice"
                :class="{
                  'is-selected': gradeForm.grade === item.value,
                  'is-disabled': acceptanceTradingBlocked
                }"
              >
                <input
                  v-model="gradeForm.grade"
                  class="sr-only"
                  type="radio"
                  name="delivery-grade"
                  :value="item.value"
                  :disabled="acceptanceTradingBlocked"
                />
                <div class="panel-header">
                  <div>
                    <h4>{{ item.label }}</h4>
                    <p class="muted">{{ item.note }}</p>
                  </div>
                  <span class="soft-pill">{{ item.value }}</span>
                </div>
                <span class="acceptance-option-check">
                  {{ gradeForm.grade === item.value ? '已选择' : `选择 ${item.value}` }}
                </span>
              </label>
            </fieldset>

            <form class="form-grid acceptance-form-shell" @submit.prevent="handleGrade">
              <div class="form-field full">
                <div class="tag-row">
                  <span class="soft-pill">状态：{{ earlyCompletionStatusLabel }}</span>
                  <span class="soft-pill">评级：{{ gradeForm.grade }}</span>
                </div>
              </div>
              <div class="form-field full">
                <label for="grade-note">评级说明</label>
                <textarea
                  id="grade-note"
                  v-model="gradeForm.note"
                  class="textarea"
                  placeholder="说明为什么当前交付符合这个评级。"
                />
              </div>
              <div class="form-field full">
                <div class="toolbar">
                  <button
                    class="button-primary"
                    type="submit"
                    :disabled="isSubmittingGrade"
                  >
                    {{ isSubmittingGrade ? '提交中...' : '提交最终评级' }}
                  </button>
                </div>
              </div>
            </form>
          </template>

          <form v-else-if="showAcceptanceForm" class="form-grid acceptance-form-shell" @submit.prevent="handleAcceptance">
            <div class="form-field full">
              <div class="tag-row">
                <span class="soft-pill">当前处理方：{{ currentActorLabel }}</span>
                <span class="soft-pill">合同：{{ currentTaskId() }}</span>
                <span class="soft-pill">状态：{{ acceptanceSummaryStatusLabel }}</span>
              </div>
            </div>
            <div class="form-field full">
              <label for="acceptance-note">验收说明</label>
              <textarea
                id="acceptance-note"
                v-model="acceptanceForm.acceptanceNote"
                class="textarea"
                placeholder="说明当前交付是否符合范围，并能进入评级。"
              />
            </div>
            <div class="form-field full">
              <div class="toolbar">
                <button
                  class="button-primary"
                  type="submit"
                  :disabled="isSubmittingAcceptance"
                >
                  {{ isSubmittingAcceptance ? '提交中...' : '确认验收' }}
                </button>
              </div>
            </div>
          </form>

          <form v-else-if="showReviewForm" class="form-grid acceptance-form-shell" @submit.prevent="handleReview">
            <div class="form-field full">
              <div class="tag-row">
                <span class="soft-pill">当前处理方：{{ currentActorLabel }}</span>
                <span class="soft-pill">反馈对象：{{ reviewTargetLabel }}</span>
              </div>
            </div>
            <div class="form-field">
              <label for="rating">评分</label>
              <select id="rating" v-model="reviewForm.rating" class="select-input">
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </div>
            <div class="form-field full">
              <label for="review-content">反馈</label>
              <textarea
                id="review-content"
                v-model="reviewForm.reviewContent"
                class="textarea"
                placeholder="聚焦沟通清晰度、反馈速度和整体协作体验。"
              />
            </div>
            <div class="form-field full">
              <div class="toolbar">
                <button
                  class="button-primary"
                  type="submit"
                  :disabled="isSubmittingReview"
                >
                  {{ isSubmittingReview ? '提交中...' : '提交反馈' }}
                </button>
              </div>
            </div>
          </form>

          <article v-else-if="acceptanceTradingBlocked" class="result-card stack-sm acceptance-result-card">
            <span class="eyebrow">当前状态</span>
            <h3>当前动作已锁定</h3>
            <p class="muted">当前先处理账户限制，解除后这里才会恢复验收、评级和反馈动作。</p>
          </article>

          <article v-else class="result-card stack-sm acceptance-result-card">
            <span class="eyebrow">验收结果</span>
            <h3>{{ acceptanceDecisionTitle }}</h3>
            <p class="muted">{{ acceptanceDecisionBody }}</p>
            <div class="tag-row">
              <span class="soft-pill">{{ acceptanceSummaryStatusLabel }}</span>
              <span v-if="page.summary.acceptedAt" class="soft-pill">已验收 {{ page.summary.acceptedAt }}</span>
              <span v-if="deliveryPayoutRatio" class="soft-pill">{{ deliveryPayoutRatio }}</span>
            </div>
          </article>

          <div v-if="acceptanceResult" class="result-card stack-sm">
            <span class="eyebrow">最新同步</span>
            <h3>{{ acceptanceResultStatusLabel }}</h3>
            <p class="muted">{{ resultMessage(acceptanceResult) || '验收结果已经同步到这里。' }}</p>
          </div>

          <div v-if="gradeResult" class="result-card stack-sm">
            <span class="eyebrow">评级结果</span>
            <h3>{{ gradeResultStatusLabel }}</h3>
            <p class="muted">{{ resultMessage(gradeResult) || '评级结果已经同步到这里。' }}</p>
            <div class="tag-row">
              <span class="soft-pill">评级 {{ gradeResult.grade || gradeForm.grade }}</span>
            </div>
          </div>

          <div v-if="reviewResult" class="result-card stack-sm">
            <span class="eyebrow">反馈结果</span>
            <h3>{{ reviewResultStatusLabel }}</h3>
            <p class="muted">{{ resultMessage(reviewResult) || '反馈结果已经同步到这里。' }}</p>
            <div class="tag-row">
              <span class="soft-pill">评分：{{ reviewResult.rating }}</span>
            </div>
          </div>
        </article>

        <article class="result-card stack-md acceptance-finance-panel">
          <div class="stack-sm">
            <div>
              <span class="eyebrow">结算衔接</span>
              <h3>{{ billingUnlocked ? '验收完成后继续去结算' : '验收完成后再打开结算' }}</h3>
            </div>
          </div>

          <article v-if="!billingUnlocked" class="result-card stack-sm">
            <span class="eyebrow">结算摘要</span>
            <h3>{{ deferredBillingTitle }}</h3>
            <p class="muted">{{ deferredBillingBody }}</p>
            <div class="tag-row">
              <span class="soft-pill">{{ acceptanceSummaryStatusLabel }}</span>
              <span v-if="deliveryGrade" class="soft-pill">{{ deliveryGrade }} 级</span>
              <span v-if="deliveryPayoutRatio" class="soft-pill">{{ deliveryPayoutRatio }}</span>
            </div>
          </article>

          <article v-else-if="showClosureEmptyState" class="result-card stack-sm">
            <span class="eyebrow">结算摘要</span>
            <h3>当前还没有结算动作</h3>
            <p class="muted">验收、评级和双方反馈完成后，结算步骤会显示在这里。</p>
          </article>

          <article v-else class="result-card stack-sm acceptance-billing-preview">
            <span class="eyebrow">结算摘要</span>
            <h3>{{ billingPreviewTitle }}</h3>
            <p class="muted">{{ billingPreviewBody }}</p>
            <p class="muted">{{ billingActionCountLabel }}</p>
            <div class="toolbar">
              <router-link v-if="billingUnlocked && settlementRoute" class="button-link" :to="settlementRoute">
                继续去结算
              </router-link>
              <p v-else class="muted">验收完成后再打开结算。</p>
            </div>
          </article>
        </article>

      </main>

      <aside class="stack-lg acceptance-side">
        <article v-if="acceptanceContextCards.length" class="glass-panel stack-lg acceptance-sidebar-card">
          <div class="panel-header acceptance-section-header">
            <div>
              <span class="eyebrow">验收摘要</span>
              <h3>把验收、记录和结算放在一个侧栏里查看</h3>
            </div>
          </div>

          <div class="acceptance-summary-grid">
            <article v-for="item in acceptanceContextCards" :key="item.label" class="mini-card stack-sm acceptance-summary-card">
              <span class="eyebrow">{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <p v-if="item.note" class="muted">{{ item.note }}</p>
            </article>
          </div>
        </article>

        <article class="glass-panel stack-lg acceptance-sidebar-card">
          <div class="panel-header acceptance-section-header">
            <div>
              <span class="eyebrow">AI 审阅</span>
              <h3>在侧栏里随时查看</h3>
            </div>
          </div>
          <p v-if="earlyCompletion.aiReviewSummary" class="muted">{{ earlyCompletion.aiReviewSummary }}</p>
          <p v-else class="muted">当前还没有 AI 审阅结果。</p>
          <ul v-if="listOf(earlyCompletion.aiReviewSuggestions).length" class="dashboard-detail-list acceptance-ai-list">
            <li v-for="item in listOf(earlyCompletion.aiReviewSuggestions)" :key="item">{{ item }}</li>
          </ul>
        </article>

        <article class="glass-panel stack-md acceptance-sidebar-card">
          <div class="panel-header acceptance-section-header">
            <div>
              <span class="eyebrow">下一步</span>
              <h3>{{ hasShellContext ? '接下来会发生什么' : acceptanceSummaryStatusLabel }}</h3>
            </div>
          </div>
          <p class="muted">{{ page.summary.nextStep }}</p>
          <div class="tag-row">
            <span v-if="!hasShellContext" class="soft-pill">{{ currentTaskId() || '待补充合同上下文' }}</span>
          </div>
        </article>
      </aside>
    </section>

    <LiveSyncStatusBar :snapshot="liveSyncStatus" :error-note="liveSyncError" />

      <article v-if="showSCeremony" class="result-card acceptance-celebration-card">
        <span class="eyebrow">验收完成</span>
        <h3>{{ sCeremonyTitle }}</h3>
        <p class="muted">
          {{ sCeremonyBody }}
        </p>
        <div class="tag-row">
          <span class="soft-pill">S 级</span>
          <span class="soft-pill">{{ sCeremonyPayoutPill }}</span>
          <span class="soft-pill">{{ sCeremonyResultPill }}</span>
        </div>
      </article>
    </template>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ActionErrorDialog from '../components/ActionErrorDialog.vue';
import ContractShellHeader from '../components/ContractShellHeader.vue';
import LiveSyncStatusBar from '../components/LiveSyncStatusBar.vue';
import SectionTitle from '../components/SectionTitle.vue';
import {
  getTaskClosureData,
  submitAcceptance,
  submitEarlyCompletion,
  submitReview
} from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream';
import { useAuthState } from '../stores/auth';
import { consumeAssistantDraftHandoff, peekAssistantDraftHandoff } from '../utils/assistantDraftHandoff';
import { hasTradingAccess, tradingRestrictionMessage } from '../utils/tradingAccess';
import {
  buildCenterReturnQuery,
  buildChildObjectPageContext,
  labelForObjectPageSource,
  readObjectPageContext,
  resolveImmediateOriginContext
} from '../utils/objectPageContext';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';
import { buildSettlementRoute, financeActionLabel, normalizeFinanceActionCode } from './settlementHelpers.js';

const route = useRoute();
const router = useRouter();
const page = ref(null);
const authState = useAuthState();
const audience = computed(() => resolveAudience(route));
const isEnterprise = computed(() => audience.value === 'enterprise');
const isTalent = computed(() => audience.value === 'talent');
const acceptanceTradingRestriction = computed(() => tradingRestrictionMessage(authState.user, audience.value));
const acceptanceTradingBlocked = computed(() => !hasTradingAccess(authState.user, audience.value));
const actionErrorMessage = ref('');
const liveSyncStatus = ref(null);
const liveSyncError = ref('');
let stopBusinessLiveSync = null;

const gradeOptions = [
  { value: 'S', label: 'S 级 · 顶级结果', note: '完成度、质量和协作都达到了最高档。' },
  { value: 'A', label: 'A 级 · 强结果', note: '主要目标已经完成，合同可以进入正常结算流程。' },
  { value: 'B', label: 'B 级 · 部分达成', note: '只完成了部分目标，或仍有明显缺口。' }
];

const acceptanceForm = ref({
  acceptanceNote: '当前交付已经符合范围，可以继续进入评级。'
});

const gradeForm = ref({
  grade: 'A',
  note: '主要目标已经完成，合同记录也已经齐了，可以继续进入结算。'
});

const reviewForm = ref({
  rating: '5',
  reviewContent: '需求说明清楚，反馈节奏及时，整体协作过程推进得比较顺畅。'
});

const acceptanceResult = ref(null);
const gradeResult = ref(null);
const reviewResult = ref(null);
const isSubmittingAcceptance = ref(false);
const isSubmittingGrade = ref(false);
const isSubmittingReview = ref(false);

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function compactText(value, limit = 64) {
  const normalized = String(value || '').replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '';
  }
  return normalized.length > limit ? `${normalized.slice(0, limit - 1)}…` : normalized;
}

function normalizeSettlementRatioCopy(value) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }
  return normalized.replace(/\bpayout\b/gi, '结算比例');
}

function buildEmptyClosurePage(taskId = '', reason = '') {
  return {
    isUnavailable: true,
    requestError: reason,
    summary: {
      taskId,
      title: '',
      status: '待验收',
      nextStep: reason || '先等合同上下文同步完成，再进入验收流程。',
      acceptedAt: '',
      business: '',
      talent: '',
      businessUserId: '',
      talentUserId: '',
      deliveryGrade: '',
      deliveryPayoutRatio: '',
      settlementStatus: '',
      settledAt: '',
      disputeStatus: '',
      disputeOpenedAt: ''
    },
    earlyCompletion: {
      status: '未开始',
      grade: '',
      payoutRatio: '',
      gradeNote: '',
      aiReviewSummary: '',
      aiReviewSuggestions: []
    },
    acceptance: {
      status: '待验收',
      note: '',
      acceptedAt: '',
      accepterUserId: ''
    },
    claimSummary: {},
    invoiceSummary: {},
    reconciliationSummary: {},
    settlementSummary: {},
    disputeSummary: {},
    availableActions: [],
    metrics: [],
    timeline: [],
    reviewSummary: [],
    reviewHistory: [],
    creditImpact: []
  };
}

const pageContext = computed(() =>
  readObjectPageContext(route.query, {
    taskId: page.value?.summary?.taskId || ''
  })
);
const entrySource = computed(() => pageContext.value.source);
const currentItemId = computed(() => pageContext.value.itemId);
const currentGroupKey = computed(() => pageContext.value.group);
const currentRecordId = computed(() => pageContext.value.recordId);
const currentRoomKey = computed(() => pageContext.value.room);
const currentNodeId = computed(() => pageContext.value.nodeId);
const currentRecordTab = computed(() => pageContext.value.tab);
const currentTaskIdValue = computed(() => pageContext.value.taskId || String(page.value?.summary?.taskId || '').trim());
const settlementRoute = computed(() => buildSettlementRoute({
  audience: audience.value,
  recordId: currentRecordId.value,
  taskId: currentTaskIdValue.value,
  room: currentRoomKey.value,
  current: route.query,
  origin: pageContext.value.origin,
  source: 'acceptance',
  financeAction: requestedFinanceAction.value,
}));
const assistantDraftToken = computed(() => String(route.query.assistantDraftToken || '').trim());
const assistantDraftSeed = computed(() => {
  const raw = route.query.assistantDraft;
  const inlineDraft = Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim();
  if (inlineDraft) return inlineDraft;
  return assistantDraftToken.value ? String(peekAssistantDraftHandoff(assistantDraftToken.value)?.text || '').trim() : '';
});
const assistantDraftApplyKey = ref('');
const hasShellContext = computed(() => Boolean(currentTaskIdValue.value));
const originContext = computed(() =>
  resolveImmediateOriginContext({
    entrySource: entrySource.value,
    query: route.query,
    defaults: {
      taskId: page.value?.summary?.taskId || ''
    },
    allowedSources: ['approvals', 'notifications', 'messages', 'workspace', 'contract', 'record-detail', 'records']
  })
);
const entrySourceLabel = computed(() => labelForObjectPageSource(entrySource.value, '来源'));
const currentActorLabel = computed(() => authState.user?.displayName || '当前账号');
const acceptanceStatusLabel = computed(() => String(page.value?.acceptance?.status || page.value?.summary?.status || '待验收').trim());
const earlyCompletion = computed(() => page.value?.earlyCompletion || {});
const earlyCompletionStatusLabel = computed(() => normalizeAcceptanceStatusLabel(earlyCompletion.value?.status || '待企业评级'));
const isAcceptanceExecutionPhase = computed(() => {
  const rawStatus = String(page.value?.summary?.status || page.value?.summary?.statusCode || '').trim();
  const normalizedStatus = normalizeAcceptanceStatusLabel(rawStatus);
  return [
    'IN_PROGRESS',
    'CONFIRMED',
    'AUTO_CONFIRMED',
    '协作中',
    '已确认合作',
    '企业已确认',
    '执行中',
  ].includes(rawStatus.toUpperCase()) || ['协作中', '已确认合作', '企业已确认', '执行中'].includes(normalizedStatus);
});
const acceptanceSummaryStatusLabel = computed(() => (
  isAcceptanceExecutionPhase.value && !isAcceptancePending.value && !hasAccepted.value
    ? '执行中'
    : normalizeAcceptanceStatusLabel(page.value?.summary?.status || '待验收')
));
const deliveryGrade = computed(() => page.value?.summary?.deliveryGrade || earlyCompletion.value?.grade || '');
const deliveryPayoutRatio = computed(() =>
  normalizeSettlementRatioCopy(page.value?.summary?.deliveryPayoutRatio || earlyCompletion.value?.payoutRatio || '')
);
const claimSummary = computed(() => page.value?.claimSummary || {});
const invoiceSummary = computed(() => page.value?.invoiceSummary || {});
const reconciliationSummary = computed(() => page.value?.reconciliationSummary || {});
const settlementSummary = computed(() => page.value?.settlementSummary || {});
const disputeSummary = computed(() => page.value?.disputeSummary || {});
const settlementStatusCode = computed(() => String(
  settlementSummary.value?.status
  || page.value?.summary?.settlementStatus
  || ''
).trim().toUpperCase());
const isSettlementComplete = computed(() => {
  const settledAt = String(page.value?.summary?.settledAt || settlementSummary.value?.settledAt || '').trim();
  if (settledAt) return true;
  return ['SETTLED', 'SETTLEMENT_SUCCESS', 'SUCCESS', 'COMPLETED', '已结算', '已完成'].includes(settlementStatusCode.value);
});
const showSCeremony = computed(() => deliveryGrade.value === 'S');
const sCeremonyTitle = computed(() => (
  isSettlementComplete.value ? '这份合同已经进入归档' : '这份合同进入了最高交付等级'
));
const sCeremonyBody = computed(() => (
  isSettlementComplete.value
    ? (isEnterprise.value
      ? '这份合同已经按 100% 结算，后续会继续沉淀到推荐和案例素材里。'
      : '这份合同已经按 100% 结算，后续会继续沉淀到你的记录和推荐信号里。')
    : (isEnterprise.value
      ? '当前评级已经锁定为 S 级，等对账完成后就可以继续结算。'
      : '当前评级已经锁定为 S 级，等对账完成后就可以继续结算。')
));
const sCeremonyPayoutPill = computed(() => (
  isSettlementComplete.value ? '完整结算结果' : '等待结算'
));
const sCeremonyResultPill = computed(() => (
  isSettlementComplete.value ? '案例素材已就绪' : '顶级交付结果'
));
const isGradePending = computed(() => earlyCompletion.value?.status === 'Waiting on client rating');
const acceptanceStatusCode = computed(() => String(page.value?.acceptance?.status || '').trim().toUpperCase());
const isAcceptancePending = computed(() => {
  if (acceptanceStatusCode.value === 'PENDING_CONFIRM') {
    return true;
  }
  return summaryStatusMatches(page.value?.summary, ['PENDING_ACCEPTANCE', '待验收', '待企业确认', 'PENDING_CONFIRM']);
});
const hasAccepted = computed(() => {
  const acceptedAt = String(page.value?.summary?.acceptedAt || '').trim();
  return acceptanceStatusCode.value === 'ACCEPTED'
    || Boolean(acceptedAt && acceptedAt !== 'Pending confirmation' && acceptedAt !== '待验收');
});
const showGradeForm = computed(() => !acceptanceTradingBlocked.value && isEnterprise.value && isGradePending.value);
const showAcceptanceForm = computed(() =>
  !acceptanceTradingBlocked.value
  && 
  isEnterprise.value
  && !showGradeForm.value
  && !hasAccepted.value
  && isAcceptancePending.value
);
const latestEnterpriseToTalentReview = computed(() => latestReviewItemForAudience('enterprise'));
const latestTalentToBusinessReview = computed(() => latestReviewItemForAudience('talent'));
const latestCurrentActorReview = computed(() => (isEnterprise.value ? latestEnterpriseToTalentReview.value : latestTalentToBusinessReview.value));
const hasBothReviewFeedback = computed(() => Boolean(
  latestEnterpriseToTalentReview.value && latestTalentToBusinessReview.value
));
const showReviewForm = computed(() =>
  !acceptanceTradingBlocked.value
  &&
  hasAccepted.value
  && !isGradePending.value
  && !latestCurrentActorReview.value
);
const acceptanceCounterpartLabel = computed(() => (isEnterprise.value ? '人才' : '企业'));
const acceptanceCounterpartValue = computed(() =>
  isEnterprise.value ? page.value?.summary?.talent || '待同步' : page.value?.summary?.business || '待同步'
);
const acceptanceHeroTitle = computed(() =>
  page.value?.summary?.title || (isEnterprise.value ? '确认交付并完成评级' : '确认结果并提交反馈')
);
const acceptanceHeroLead = computed(() => {
  if (showGradeForm.value) {
    return '先完成最终评级，再继续去结算。';
  }
  if (showAcceptanceForm.value) {
    return '先确认这次交付是否符合当前范围。';
  }
  if (showReviewForm.value) {
    return isEnterprise.value ? '验收和评级已经完成，现在补上企业侧协作反馈。' : '当前结果已经同步，剩下的就是你的协作反馈。';
  }
  if (isAcceptanceExecutionPhase.value && !hasAccepted.value) {
    return '当前合作正在执行中，先查看交付进展、验收准备和结算状态。';
  }
  return '查看当前验收结果、评级、结算状态和反馈。';
});
const acceptanceShellSupportCopy = computed(() =>
  '当前结果继续推进反馈和结算时，验收、结算、记录和助手都会挂在这份合同上。'
);
const acceptanceShellPills = computed(() => ([
  currentTaskIdValue.value ? `合同 ${currentTaskIdValue.value}` : '',
  acceptanceSummaryStatusLabel.value,
  String(route.query.contextMilestone || '').trim(),
]).filter(Boolean));
const acceptanceShellTabs = computed(() => {
  if (!hasShellContext.value) return [];
  return [
    workspaceRoute.value ? { label: '概览', to: workspaceRoute.value } : null,
    messagesRoute.value ? { label: '消息', to: messagesRoute.value } : null,
    { label: '验收', current: true },
    recordsRoute.value ? { label: '记录', to: recordsRoute.value } : null,
    assistantRoute.value ? { label: '助手', to: assistantRoute.value } : null,
  ].filter(Boolean);
});
const acceptanceDecisionTitle = computed(() => {
  if (deliveryGrade.value) {
    return `${deliveryGrade.value} 级交付结果已经确认`;
  }
  if (isGradePending.value) {
    return '验收已经完成，正在等待企业评级';
  }
  if (isAcceptanceExecutionPhase.value && !hasAccepted.value) {
    return '当前合作仍在执行中';
  }
  if (hasAccepted.value) {
    return isEnterprise.value ? '验收已经确认，正在等待评级或结算步骤' : '企业已经确认验收，最终评级还在等待中';
  }
  return isEnterprise.value ? '企业需要先确认验收' : '正在等待企业确认验收';
});
const acceptanceDecisionBody = computed(() => {
  if (!page.value?.summary) {
    return '合同上下文同步后，当前验收结果会显示在这里。';
  }
  if (isAcceptanceExecutionPhase.value && !hasAccepted.value) {
    return '先继续推进交付、同步风险与附件，达到可验收状态后这里会自动进入下一步。';
  }
  if (deliveryPayoutRatio.value) {
    return `当前结算比例是 ${deliveryPayoutRatio.value}，这次结果会继续沉淀到信任记录里。`;
  }
  return compactText(page.value.summary.nextStep, 48) || '当前结果会继续进入评级和结算步骤。';
});
const acceptanceActionTitle = computed(() => {
  if (showGradeForm.value) {
    return '设置最终合同评级';
  }
  if (showAcceptanceForm.value) {
    return '确认这次交付是否应当验收';
  }
  if (showReviewForm.value) {
    return isEnterprise.value ? '给人才留下反馈' : '给企业留下反馈';
  }
  if (isAcceptanceExecutionPhase.value && !hasAccepted.value) {
    return '执行与验收准备';
  }
  return '验收结果';
});
const acceptanceActionBody = computed(() => {
  if (acceptanceTradingBlocked.value) {
    return '当前先处理账户限制，解除后再回来继续验收、评级和反馈。';
  }
  if (showGradeForm.value) {
    return '从 S、A、B 里选一个，再补一条清晰的评级说明。';
  }
  if (showAcceptanceForm.value) {
    return '这里只需要确认这次交付是否符合当前范围，然后再进入评级。';
  }
  if (showReviewForm.value) {
    return '补一条简洁反馈，不要重复整段项目背景。';
  }
  if (isAcceptanceExecutionPhase.value && !hasAccepted.value) {
    return '这一步先围绕执行中的交付结果整理进展、文件和验收准备，不急着提前进入评级。';
  }
  return '当前已经没有额外动作，直接在这里查看验收结果。';
});
const hasActiveReviewDecision = computed(() => (
  showGradeForm.value || showAcceptanceForm.value || showReviewForm.value
));
const billingUnlocked = computed(() => (
  hasAccepted.value
  && !isGradePending.value
  && hasBothReviewFeedback.value
));
const deferredBillingTitle = computed(() => {
  if (showGradeForm.value) return '先完成最终评级，再打开结算动作'
  if (showAcceptanceForm.value) return '先确认验收结果，再打开结算动作'
  if (showReviewForm.value) return '先提交剩余反馈，再打开结算动作'
  if (!billingUnlocked.value) return '等双方都完成反馈后，再打开结算动作'
  return '验收完成后再打开结算'
});
const deferredBillingBody = computed(() => {
  if (showGradeForm.value) {
    return '结算时间线会继续挂在这里，但在最终合同评级提交前，结算步骤不会打开。'
  }
  if (showAcceptanceForm.value) {
    return '先完成当前验收确认。等交付被验收并进入评级或结算步骤后，结算动作才会出现。'
  }
  if (showReviewForm.value) {
    return '先完成剩余协作反馈。结算动作继续下沉，保证这页当前只有一个主任务。'
  }
  if (!billingUnlocked.value) {
    return '当前验收任务可能已经完成，但在双方都结束反馈阶段前，结算仍然保持关闭。'
  }
  return '验收完成后再打开结算。'
});
const reviewTargetLabel = computed(() => {
  if (!page.value?.summary) {
    return '待识别';
  }
  return isEnterprise.value ? page.value.summary.talent : page.value.summary.business;
});
const acceptanceContextCards = computed(() => {
  const cards = [
    {
      label: '状态',
      value: acceptanceSummaryStatusLabel.value,
      note: hasAccepted.value ? `已验收 ${page.value.summary.acceptedAt}` : ''
    },
    {
      label: acceptanceCounterpartLabel.value,
      value: acceptanceCounterpartValue.value,
      note: ''
    },
    {
      label: '交付评级',
      value: deliveryGrade.value ? `${deliveryGrade.value} 级` : '待企业评级',
      note: ''
    },
    {
      label: '结算结果',
      value: deliveryPayoutRatio.value || page.value?.summary?.settlementStatus || '待确认',
      note: page.value?.summary?.settledAt ? `已结算 ${page.value.summary.settledAt}` : ''
    }
  ];

  if (!hasShellContext.value) return cards;
  return [];
});
const acceptanceMetricCards = computed(() => listOf(page.value?.metrics).slice(0, 4));
const acceptanceResultStatusLabel = computed(() => normalizeAcceptanceMutationStatusLabel(acceptanceResult.value?.status, '已同步'));
const gradeResultStatusLabel = computed(() => normalizeAcceptanceMutationStatusLabel(gradeResult.value?.status, '已同步'));
const reviewResultStatusLabel = computed(() => normalizeAcceptanceMutationStatusLabel(reviewResult.value?.status, '已同步'));
const closureActionSources = computed(() => [
  page.value?.summary?.availableActions,
  claimSummary.value?.availableActions,
  invoiceSummary.value?.availableActions,
  reconciliationSummary.value?.availableActions,
  settlementSummary.value?.availableActions,
  disputeSummary.value?.availableActions
]);
const closureAvailableActionCodes = computed(() =>
  collectClosureActionCodes(...closureActionSources.value)
);
const closureActionChips = computed(() => {
  const labels = {
    CLAIM_REQUEST: '提交请款',
    CLAIM_APPROVE: '审批请款',
    CLAIM_REJECT: '退回请款',
    INVOICE_SUBMIT: '提交发票',
    RECONCILIATION_CONFIRM: '确认对账',
    RECONCILIATION_DISPUTE: '发起争议',
    SETTLEMENT_EXECUTE: '执行结算',
    SETTLEMENT_FAIL: '标记失败'
  };
  return Array.from(closureAvailableActionCodes.value)
    .map((code) => labels[code] || '')
    .filter(Boolean)
    .slice(0, 6);
});
const requestedFinanceAction = computed(() => normalizeFinanceActionCode(route.query.financeAction));
const highlightedFinanceSection = computed(() =>
  requestedFinanceAction.value
    ? { title: financeActionLabel(requestedFinanceAction.value) }
    : null
);
const highlightedFinanceActionLabel = computed(() => (
  requestedFinanceAction.value ? financeActionLabel(requestedFinanceAction.value) : '当前动作'
));

watch([requestedFinanceAction, settlementRoute], () => {
  if (requestedFinanceAction.value && settlementRoute.value) {
    router.replace(settlementRoute.value)
  }
}, { immediate: true });
const showClosureEmptyState = computed(() =>
  !closureActionChips.value.length
  && billingStatusCards.value.every((item) =>
    item.value === '未开始' && !item.meta.length
  )
);
const billingActionCountLabel = computed(() => {
  if (closureActionChips.value.length) return `已关联 ${closureActionChips.value.length} 条结算动作`;
  const activeStepCount = billingStatusCards.value.filter((item) => item.value !== '未开始' || item.meta.length).length;
  if (activeStepCount) return `已有 ${activeStepCount} 个结算步骤在推进`;
  return '结算时间线会继续挂在这里';
});
const billingPreviewTitle = computed(() => {
  if (highlightedFinanceSection.value) return `继续处理${highlightedFinanceSection.value.title}`;
  if (closureActionChips.value.length) return '打开结算继续处理';
  return '有结算动作后再打开结算';
});
const billingPreviewBody = computed(() => {
  if (highlightedFinanceSection.value) {
    return `${highlightedFinanceActionLabel.value}已经转到结算页继续，这里先专注验收。`;
  }
  if (closureActionChips.value.length) {
    return '请款、发票、对账、争议和结算动作都已经转到结算页继续，不再留在验收页。';
  }
  return '结算步骤会继续挂在这里，等验收、评级和双方反馈都完成后再打开。';
});
const billingStatusCards = computed(() => [
  buildClosureSummaryCard(
    '请款',
    claimSummary.value,
    '验收完成后就可以继续提交请款。',
    [
      ['amount', '金额 '],
      ['requestedAt', '提交于 '],
      ['payoutRatio', '比例 ']
    ]
  ),
  buildClosureSummaryCard(
    '发票',
    invoiceSummary.value,
    '请款通过后，下一步就是发票。',
    [
      ['amount', '金额 '],
      ['submittedAt', '提交于 '],
      ['invoiceType', '类型 ']
    ]
  ),
  buildClosureSummaryCard(
    '对账',
    reconciliationSummary.value,
    '发票提交后，就会进入对账。',
    [
      ['amount', '金额 '],
      ['submittedAt', '提交于 '],
      ['updatedAt', '更新于 ']
    ]
  ),
  buildClosureSummaryCard(
    '结算',
    settlementSummary.value,
    '对账完成后，就可以继续结算。',
    [
      ['amount', '金额 '],
      ['payoutRatio', '比例 '],
      ['settledAt', '结算于 ']
    ]
  ),
  buildClosureSummaryCard(
    '争议',
    disputeSummary.value,
    '如果对账有争议，平台会继续发起争议和风险工单。',
    [
      ['amount', '金额 '],
      ['submittedAt', '发起于 '],
      ['riskTicketId', '工单 ']
    ]
  )
]);
const acceptanceContextQuery = computed(() =>
  buildChildObjectPageContext({
    current: pageContext.value,
    origin: originContext.value,
    overrides: {
      itemId: currentItemId.value,
      group: currentGroupKey.value,
      taskId: currentTaskIdValue.value,
      recordId: currentRecordId.value,
      room: currentRoomKey.value,
      nodeId: currentNodeId.value,
      tab: currentRecordTab.value,
      source: 'acceptance'
    }
  })
);
const workspaceRoute = computed(() => ({
  path: isEnterprise.value ? roleRouteMap.enterprise.workspace : roleRouteMap.talent.workspace,
  query: acceptanceContextQuery.value
}));
const messagesRoute = computed(() => ({
  path: isEnterprise.value ? roleRouteMap.enterprise.messages : roleRouteMap.talent.messages,
  query: acceptanceContextQuery.value
}));
const recordsRoute = computed(() => ({
  path: currentRecordId.value
    ? `${isEnterprise.value ? roleRouteMap.enterprise.records : roleRouteMap.talent.records}/${encodeURIComponent(currentRecordId.value)}`
    : isEnterprise.value ? roleRouteMap.enterprise.records : roleRouteMap.talent.records,
  query: acceptanceContextQuery.value
}));
const assistantRoute = computed(() => ({
  path: isEnterprise.value ? roleRouteMap.enterprise.assistant : roleRouteMap.talent.assistant,
  query: acceptanceContextQuery.value
}));

function clearAssistantDraftQuery() {
  if (!route.query.assistantDraftToken && !route.query.assistantDraft && !route.query.assistantSurface) return;
  const query = { ...route.query };
  delete query.assistantDraftToken;
  delete query.assistantDraft;
  delete query.assistantSurface;
  router.replace({ path: route.path, query });
}

watch(
  [assistantDraftSeed, assistantDraftToken, showGradeForm, showAcceptanceForm, showReviewForm],
  ([draftText, token, gradeOpen, acceptanceOpen, reviewOpen]) => {
    if (!draftText) return;
    const targetKey = gradeOpen ? 'grade' : acceptanceOpen ? 'acceptance' : reviewOpen ? 'review' : '';
    const applyKey = `${token || 'inline'}::${targetKey}::${draftText}`;
    if (gradeOpen) {
      if (assistantDraftApplyKey.value === applyKey) return;
      if (!gradeForm.value.note.trim()) {
        gradeForm.value.note = draftText;
      } else if (!gradeForm.value.note.includes(draftText)) {
        gradeForm.value.note = `${gradeForm.value.note}\n\n${draftText}`.trim();
      }
      assistantDraftApplyKey.value = applyKey;
      if (token) consumeAssistantDraftHandoff(token);
      clearAssistantDraftQuery();
      return;
    }
    if (acceptanceOpen) {
      if (assistantDraftApplyKey.value === applyKey) return;
      if (!acceptanceForm.value.acceptanceNote.trim()) {
        acceptanceForm.value.acceptanceNote = draftText;
      } else if (!acceptanceForm.value.acceptanceNote.includes(draftText)) {
        acceptanceForm.value.acceptanceNote = `${acceptanceForm.value.acceptanceNote}\n\n${draftText}`.trim();
      }
      assistantDraftApplyKey.value = applyKey;
      if (token) consumeAssistantDraftHandoff(token);
      clearAssistantDraftQuery();
      return;
    }
    if (reviewOpen) {
      if (assistantDraftApplyKey.value === applyKey) return;
      if (!reviewForm.value.reviewContent.trim()) {
        reviewForm.value.reviewContent = draftText;
      } else if (!reviewForm.value.reviewContent.includes(draftText)) {
        reviewForm.value.reviewContent = `${reviewForm.value.reviewContent}\n\n${draftText}`.trim();
      }
      assistantDraftApplyKey.value = applyKey;
      if (token) consumeAssistantDraftHandoff(token);
      clearAssistantDraftQuery();
    }
  },
  { immediate: true }
);

function normalizeClosureActionCode(value) {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) {
    return '';
  }

  const aliases = {
    REQUEST_CLAIM: 'CLAIM_REQUEST',
    CLAIM_REQUEST: 'CLAIM_REQUEST',
    CLAIM: 'CLAIM_REQUEST',
    APPROVE_CLAIM: 'CLAIM_APPROVE',
    CLAIM_APPROVE: 'CLAIM_APPROVE',
    REJECT_CLAIM: 'CLAIM_REJECT',
    CLAIM_REJECT: 'CLAIM_REJECT',
    SUBMIT_INVOICE: 'INVOICE_SUBMIT',
    INVOICE_SUBMIT: 'INVOICE_SUBMIT',
    CONFIRM_RECONCILIATION: 'RECONCILIATION_CONFIRM',
    RECONCILIATION_CONFIRM: 'RECONCILIATION_CONFIRM',
    DISPUTE_RECONCILIATION: 'RECONCILIATION_DISPUTE',
    RECONCILIATION_DISPUTE: 'RECONCILIATION_DISPUTE',
    EXECUTE_SETTLEMENT: 'SETTLEMENT_EXECUTE',
    SETTLEMENT_EXECUTE: 'SETTLEMENT_EXECUTE',
    FAIL_SETTLEMENT: 'SETTLEMENT_FAIL',
    SETTLEMENT_FAIL: 'SETTLEMENT_FAIL'
  };

  return aliases[raw] || raw;
}

function collectClosureActionCodes(...sources) {
  return new Set(
    sources.flatMap((source) => listOf(source).map((item) => normalizeClosureActionCode(item)).filter(Boolean))
  );
}

function summaryStatusMatches(summary, candidates = []) {
  const status = String(summary?.status || summary?.statusCode || '').trim();
  const normalizedStatus = status.toUpperCase();
  return listOf(candidates).some((candidate) => {
    const normalizedCandidate = String(candidate || '').trim().toUpperCase();
    if (!normalizedCandidate) {
      return !status;
    }
    return status === candidate
      || normalizedStatus === normalizedCandidate
      || normalizedStatus.includes(normalizedCandidate)
      || status.includes(String(candidate || '').trim());
  });
}

function normalizeAcceptanceStatusLabel(value) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }
  const aliases = {
    'Waiting on client rating': '待企业评级',
    WAITING_ON_CLIENT_RATING: '待企业评级',
    PENDING_CONFIRM: '待验收',
    PENDING_ACCEPTANCE: '待验收',
    'Pending confirmation': '待验收',
    ACCEPTED: '已验收',
    REVIEW_PENDING: '待反馈',
    FEEDBACK_PENDING: '待反馈',
    FAILED: '失败',
    SUCCESS: '已完成',
    COMPLETED: '已完成',
  };
  return aliases[normalized] || aliases[normalized.toUpperCase()] || normalized;
}

function normalizeClosureStatusLabel(value) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }
  const aliases = {
    CLAIM_REQUESTED: '待提交请款',
    CLAIM_PENDING: '待提交请款',
    CLAIM_APPROVED: '已审批请款',
    CLAIM_REJECTED: '已退回请款',
    INVOICE_SUBMITTED: '已提交发票',
    INVOICE_PENDING: '待提交发票',
    RECONCILIATION_PENDING: '待确认对账',
    RECONCILIATION_CONFIRMED: '已确认对账',
    SETTLEMENT_PENDING: '待执行结算',
    SETTLEMENT_EXECUTED: '已执行结算',
    SETTLEMENT_SUCCESS: '已完成结算',
    DISPUTE_OPENED: '争议处理中',
    DISPUTE_PENDING: '争议处理中',
  };
  return aliases[normalized.toUpperCase()] || normalizeAcceptanceStatusLabel(normalized);
}

function normalizeAcceptanceMutationStatusLabel(value, fallback = '处理中') {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return fallback;
  }
  const aliases = {
    FAILED: '提交失败',
    SUCCESS: '已同步',
    COMPLETED: '已完成',
    PENDING: '处理中',
    PROCESSING: '处理中',
    SUBMITTED: '已提交',
  };
  return aliases[normalized.toUpperCase()] || normalizeAcceptanceStatusLabel(normalized) || fallback;
}

function normalizeReviewRoleLabel(item = {}) {
  const candidates = [
    item?.reviewerRole,
    item?.role,
    item?.reviewerAudience,
  ].map((value) => String(value || '').trim()).filter(Boolean);

  for (const raw of candidates) {
    const normalized = raw.toLowerCase();
    if (normalized.includes('enterprise') || normalized.includes('business') || normalized.includes('client') || raw.includes('企业')) {
      return '企业端';
    }
    if (normalized.includes('talent') || normalized.includes('freelancer') || raw.includes('人才')) {
      return '人才方';
    }
  }

  return '反馈方';
}

function reviewSortTimestamp(item = {}) {
  const raw = item?.updatedAt || item?.createdAt || item?.time || '';
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }
  const parsed = Date.parse(String(raw || ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function latestReviewItemForAudience(audienceKey) {
  return listOf(page.value?.reviewHistory)
    .filter((item) => {
      const audienceValue = String(item?.reviewerAudience || '').trim().toLowerCase();
      const roleValue = normalizeReviewRoleLabel(item);
      if (audienceKey === 'enterprise') {
        return audienceValue === 'enterprise' || roleValue === '企业端';
      }
      return audienceValue === 'talent' || roleValue === '人才方';
    })
    .sort((left, right) => reviewSortTimestamp(right) - reviewSortTimestamp(left))[0];
}

function mutationResultText(result, fallback) {
  return String(result?.requestError || result?.nextStep || fallback || '').trim();
}

function resultMessage(result) {
  return mutationResultText(result, '');
}

function isMutationFailed(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED');
}

function setActionError(message) {
  actionErrorMessage.value = String(message || '').trim();
}

function clearActionError() {
  actionErrorMessage.value = '';
}

function currentTaskId() {
  return currentTaskIdValue.value;
}

function reviewerUserId() {
  return authState.user?.platformUserId
    || (isEnterprise.value ? page.value?.summary?.businessUserId : page.value?.summary?.talentUserId)
    || '';
}

function revieweeUserId() {
  if (!page.value?.summary) {
    return '';
  }
  return isEnterprise.value ? page.value.summary.talentUserId : page.value.summary.businessUserId;
}

function routeForAcceptanceImmediateSource(source) {
  if (source === 'messages') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.messages : roleRouteMap.talent.messages,
      query: buildChildObjectPageContext({
        current: pageContext.value,
        origin: originContext.value,
        overrides: {
          source: 'acceptance',
          nodeId: undefined
        }
      })
    };
  }

  if (source === 'workspace' || source === 'contract') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.workspace : roleRouteMap.talent.workspace,
      query: buildChildObjectPageContext({
        current: pageContext.value,
        origin: originContext.value,
        overrides: {
          source: 'acceptance'
        }
      })
    };
  }

  if (source === 'record-detail' && currentRecordId.value) {
    return {
      path: isEnterprise.value
        ? roleRouteMap.enterprise.recordDetail(currentRecordId.value)
        : roleRouteMap.talent.recordDetail(currentRecordId.value),
      query: buildChildObjectPageContext({
        current: pageContext.value,
        origin: originContext.value,
        overrides: {
          source: 'record-detail',
          nodeId: undefined
        }
      })
    };
  }

  if (source === 'approvals') {
    return {
      path: roleRouteMap.enterprise.approvals,
      query: buildCenterReturnQuery({
        current: pageContext.value,
        origin: originContext.value
      })
    };
  }

  if (source === 'notifications') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.notifications : roleRouteMap.talent.notifications,
      query: buildCenterReturnQuery({
        current: pageContext.value,
        origin: originContext.value
      })
    };
  }

  if (source === 'records') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.records : roleRouteMap.talent.records,
      query: currentRecordTab.value ? { tab: currentRecordTab.value } : {}
    };
  }

  return null;
}

const acceptanceBackRoute = computed(() => {
  const directRoute = routeForAcceptanceImmediateSource(entrySource.value);
  if (directRoute) {
    return directRoute;
  }

  if (entrySource.value === 'acceptance') {
    const originRoute = routeForAcceptanceImmediateSource(originContext.value.source);
    if (originRoute) {
      return originRoute;
    }
  }

  return null;
});

const acceptanceBackLabel = computed(() => {
  const source = entrySource.value === 'acceptance' ? originContext.value.source : entrySource.value;
  return labelForObjectPageSource(source, '返回上一页');
});
const acceptanceUnavailableRoute = computed(() => acceptanceBackRoute.value || (isEnterprise.value ? roleRouteMap.enterprise.home : roleRouteMap.talent.home));

const actionDialogTitle = computed(() => '验收动作遇到问题');
const dialogErrorMessage = computed(() => actionErrorMessage.value || '');

async function refreshPage() {
  acceptanceResult.value = null;
  gradeResult.value = null;
  reviewResult.value = null;
  clearActionError();
  const taskId = currentTaskId();
  if (!taskId) {
    page.value = buildEmptyClosurePage('', '当前验收页缺少合同上下文，暂时无法加载数据。');
    return;
  }
  try {
    const nextPage = await getTaskClosureData(taskId);
    page.value = {
      ...nextPage,
      isUnavailable: false,
    };
  } catch (error) {
    page.value = buildEmptyClosurePage(taskId, error?.message || '当前验收数据暂时无法加载，请稍后再试。');
  }
}

async function handleAcceptance() {
  if (isSubmittingAcceptance.value) {
    return;
  }
  const taskId = currentTaskId();
  if (!taskId) {
    const message = '当前验收页缺少合同上下文，所以无法提交验收。';
    setActionError(message);
    acceptanceResult.value = { status: 'FAILED', requestError: message };
    return;
  }
  if (acceptanceTradingBlocked.value) {
    const message = acceptanceTradingRestriction.value;
    setActionError(message);
    acceptanceResult.value = { status: 'FAILED', requestError: message };
    return;
  }
  isSubmittingAcceptance.value = true;
  try {
    acceptanceResult.value = await submitAcceptance(taskId, {
      accepterUserId: reviewerUserId(),
      acceptanceNote: acceptanceForm.value.acceptanceNote
    });
    if (isMutationFailed(acceptanceResult.value)) {
      setActionError(mutationResultText(acceptanceResult.value, '验收确认暂时无法提交。'));
      return;
    }
    await refreshPage();
  } finally {
    isSubmittingAcceptance.value = false;
  }
}

async function handleGrade() {
  if (isSubmittingGrade.value) {
    return;
  }
  const taskId = currentTaskId();
  if (!taskId) {
    const message = '当前验收页缺少合同上下文，所以无法提交评级。';
    setActionError(message);
    gradeResult.value = { status: 'FAILED', requestError: message };
    return;
  }
  if (acceptanceTradingBlocked.value) {
    const message = acceptanceTradingRestriction.value;
    setActionError(message);
    gradeResult.value = { status: 'FAILED', requestError: message };
    return;
  }
  isSubmittingGrade.value = true;
  try {
    gradeResult.value = await submitEarlyCompletion(taskId, {
      action: 'grade',
      grade: gradeForm.value.grade,
      note: gradeForm.value.note
    });
    if (isMutationFailed(gradeResult.value)) {
      setActionError(mutationResultText(gradeResult.value, '合同评级暂时无法提交。'));
      return;
    }
    await refreshPage();
  } finally {
    isSubmittingGrade.value = false;
  }
}

async function handleReview() {
  if (isSubmittingReview.value) {
    return;
  }
  const taskId = currentTaskId();
  if (!taskId) {
    const message = '当前验收页缺少合同上下文，所以无法提交反馈。';
    setActionError(message);
    reviewResult.value = { status: 'FAILED', requestError: message };
    return;
  }
  if (acceptanceTradingBlocked.value) {
    const message = acceptanceTradingRestriction.value;
    setActionError(message);
    reviewResult.value = { status: 'FAILED', requestError: message };
    return;
  }
  isSubmittingReview.value = true;
  try {
    reviewResult.value = await submitReview(taskId, {
      reviewerUserId: reviewerUserId(),
      revieweeUserId: revieweeUserId(),
      rating: reviewForm.value.rating,
      reviewContent: reviewForm.value.reviewContent
    });
    if (isMutationFailed(reviewResult.value)) {
      setActionError(mutationResultText(reviewResult.value, '反馈暂时无法提交。'));
      return;
    }
    await refreshPage();
  } finally {
    isSubmittingReview.value = false;
  }
}

function summaryMeta(summary, fields) {
  const source = summary && typeof summary === 'object' ? summary : {};
  return listOf(fields)
    .map(([key, prefix]) => {
      const value = String(source?.[key] || '').trim();
      return value ? `${prefix || ''}${value}` : '';
    })
    .filter(Boolean)
    .slice(0, 3);
}

function buildClosureSummaryCard(label, summary, fallbackNote, fields = [], actions = []) {
  const source = summary && typeof summary === 'object' ? summary : {};
  return {
    label,
    value: normalizeClosureStatusLabel(String(source.status || '未开始').trim() || '未开始'),
    note: compactText(source.nextStep || source.decisionNote || source.note || fallbackNote, 64),
    meta: summaryMeta(source, fields),
    actions
  };
}

onMounted(refreshPage);

watch(
  () => [String(route.query.taskId || '').trim(), String(route.query.recordId || '').trim()],
  ([nextTaskId, nextRecordId], previous = []) => {
    const previousTaskId = String(previous?.[0] || '').trim();
    const previousRecordId = String(previous?.[1] || '').trim();
    if (!nextTaskId || (nextTaskId === previousTaskId && nextRecordId === previousRecordId)) {
      return;
    }
    refreshPage();
  }
);

onMounted(() => {
  stopBusinessLiveSync = startBusinessLiveSync({
    refresh: () => refreshPage(),
    acceptsEvent(event) {
      const taskId = String(currentTaskId() || '').trim();
      return !taskId || !event?.taskId || event.taskId === taskId;
    },
    onStatusChange(snapshot) {
      liveSyncStatus.value = snapshot ? { ...snapshot } : null;
      if (snapshot?.state === 'open') {
        liveSyncError.value = '';
      }
    },
    onSyncError() {
      liveSyncError.value = '最新同步刚刚中断，页面会自动重连，必要时再回退到轮询。';
    }
  });
});

onBeforeUnmount(() => {
  stopBusinessLiveSync?.();
  stopBusinessLiveSync = null;
});
</script>

<style scoped>
.acceptance-page {
  --acceptance-bg: #f4f7f2;
  --acceptance-panel: rgba(255, 255, 255, 0.96);
  --acceptance-soft: #f8faf6;
  --acceptance-soft-strong: #edf4e9;
  --acceptance-border: #dce5d5;
  --acceptance-border-strong: #bed0b3;
  --acceptance-text: #16311d;
  --acceptance-muted: #5d6f60;
  --acceptance-accent: #108a00;
  gap: 20px;
  padding-bottom: 40px;
  color: var(--acceptance-text);
}

.acceptance-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 20px;
}

.acceptance-nav__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid var(--acceptance-border);
  background: #ffffff;
  color: var(--acceptance-muted);
  text-decoration: none;
  font-weight: 650;
}

.acceptance-nav__link.is-active,
.acceptance-nav__link.router-link-active,
.acceptance-nav__link.router-link-exact-active {
  border-color: rgba(16, 138, 0, 0.2);
  background: #f3fff0;
  color: #165a0f;
}

.acceptance-page :is(.hero-card, .glass-panel, .mini-card, .result-card, .list-card) {
  background: var(--acceptance-panel);
  border: 1px solid var(--acceptance-border);
  box-shadow: 0 14px 36px rgba(22, 49, 29, 0.07);
  backdrop-filter: none;
}

.acceptance-page .muted {
  color: var(--acceptance-muted);
}

.acceptance-page .soft-pill {
  border: 1px solid var(--acceptance-border);
  background: #f7faf4;
  color: #255034;
  box-shadow: none;
}

.acceptance-page :is(.button-primary, .button-secondary) {
  min-height: 44px;
  border-radius: 12px;
  font-weight: 650;
  box-shadow: none;
}

.acceptance-page .button-primary {
  background: var(--acceptance-accent);
  border-color: var(--acceptance-accent);
}

.acceptance-page .button-secondary {
  background: #ffffff;
  border-color: var(--acceptance-border-strong);
  color: var(--acceptance-text);
}

.acceptance-page :is(textarea, select, input) {
  width: 100%;
  min-height: 46px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid var(--acceptance-border);
  background: #ffffff;
  color: var(--acceptance-text);
}

.acceptance-page :is(textarea, select, input)::placeholder {
  color: #8c9b8e;
}

.acceptance-page textarea {
  min-height: 124px;
  resize: vertical;
}

.acceptance-page .result-card {
  border-left: 4px solid var(--acceptance-accent);
}

.acceptance-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
  gap: 24px;
  padding: 28px 30px;
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 244, 0.98)),
    radial-gradient(circle at top right, rgba(16, 138, 0, 0.12), transparent 34%);
}

.acceptance-topline,
.acceptance-hero-meta,
.acceptance-hero-actions {
  flex-wrap: wrap;
}

.acceptance-hero-copy,
.acceptance-hero-side {
  min-width: 0;
}

.acceptance-hero-side {
  align-self: stretch;
  justify-content: space-between;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.94);
}

.acceptance-lane-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.acceptance-lane-card {
  border-radius: 22px;
  background: #fff;
}

.acceptance-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.8fr);
  gap: 24px;
  align-items: start;
}

.acceptance-main,
.acceptance-side {
  min-width: 0;
}

.acceptance-side {
  position: sticky;
  top: 24px;
  align-self: start;
}

.acceptance-action-panel,
.acceptance-finance-panel,
.acceptance-sidebar-card {
  border-radius: 24px;
}

.acceptance-grid-cards,
.acceptance-summary-grid {
  display: grid;
  gap: 14px;
}

.acceptance-grid-cards {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: none;
  padding: 0;
  margin: 0;
}

.acceptance-summary-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.acceptance-inline-warning {
  border-left-color: #cd8f00;
  background: linear-gradient(180deg, rgba(255, 250, 231, 0.98), rgba(255, 255, 255, 0.98));
}

.acceptance-option-card,
.acceptance-summary-card,
.acceptance-finance-card {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid var(--acceptance-border);
}

.acceptance-option-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.acceptance-option-card .panel-header {
  margin-bottom: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.acceptance-option-card h4 {
  font-size: 16px;
  margin: 0 0 6px;
}

.acceptance-option-card .muted {
  font-size: 13px;
  line-height: 1.5;
}

.acceptance-option-card .soft-pill {
  align-self: flex-start;
  min-height: 26px;
  font-size: 11px;
}

.acceptance-option-card.is-selected {
  border-color: var(--acceptance-accent);
  box-shadow: 0 0 0 1px rgba(16, 138, 0, 0.1);
  background: #f0f7ef;
}

.acceptance-finance-card.is-highlighted {
  border-color: var(--acceptance-accent);
  box-shadow: 0 0 0 1px rgba(16, 138, 0, 0.12);
}

.acceptance-grade-group {
  margin: 0;
  padding: 0;
  border: 0;
}

.acceptance-option-choice {
  cursor: pointer;
}

.acceptance-option-choice.is-disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.acceptance-option-check {
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--acceptance-border-strong);
  background: #fff;
  color: var(--acceptance-text);
  font-weight: 650;
}

.acceptance-option-card.is-selected .acceptance-option-check {
  border-color: var(--acceptance-accent);
  background: rgba(16, 138, 0, 0.08);
  color: var(--acceptance-accent);
}

.acceptance-action-body {
  max-width: 72ch;
}

.acceptance-hero-copy :is(.dashboard-title, .hero-lead) {
  margin: 0;
}

.acceptance-celebration-card {
  border-radius: 24px;
  border-left-color: #108a00;
  border-left-width: 4px;
  background: linear-gradient(135deg, rgba(239, 247, 238, 0.9), rgba(255, 255, 255, 0.96));
}

.acceptance-lock-card {
  border-left-color: #cd8f00;
}

.acceptance-sidebar-card {
  overflow: hidden;
}

.acceptance-ai-list {
  margin-top: 8px;
}

@media (max-width: 1200px) {
  .acceptance-hero,
  .acceptance-grid {
    grid-template-columns: 1fr;
  }

  .acceptance-lane-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .acceptance-side {
    position: static;
  }

  .acceptance-grid-cards,
  .acceptance-summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .acceptance-hero {
    padding: 20px;
  }

  .acceptance-lane-strip {
    grid-template-columns: 1fr;
  }

  .acceptance-page :is(.button-primary, .button-secondary) {
    width: 100%;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

<style scoped>
/* codex visual polish */
.acceptance-page .panel,
.acceptance-page .result-card {
  border-radius: 28px;
}
.acceptance-page .split-grid {
  gap: 24px;
  align-items: start;
}
.acceptance-page .acceptance-side {
  gap: 18px;
}
.acceptance-page .acceptance-side .mini-card,
.acceptance-page .acceptance-summary-card {
  background: #fcfcf8;
  box-shadow: none;
  border: 1px solid rgba(17, 24, 39, 0.08);
}
.acceptance-form-shell {
  padding: 18px 20px;
  border-radius: 24px;
  border: 1px solid var(--acceptance-border);
  background: var(--acceptance-soft);
}
.acceptance-section-header {
  margin-bottom: 0;
}

.acceptance-section-header h3,
.acceptance-section-header h4 {
  margin: 8px 0 0;
}
.acceptance-hero-copy .dashboard-lead {
  max-width: 760px;
  margin-bottom: 0;
}
.acceptance-form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.acceptance-form-actions .button-primary {
  min-width: 140px;
}
</style>
