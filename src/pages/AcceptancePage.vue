<template>
  <section class="page-stack acceptance-page" v-if="page">
    <ActionErrorDialog title="验收流程出现波动" :message="liveSyncError || page.requestError" />
    <article v-if="acceptanceTradingBlocked" class="result-card stack-sm">
      <span class="eyebrow">当前账号受限</span>
      <h3>待审核账号不能继续交易动作</h3>
      <p class="muted">{{ acceptanceTradingRestriction }}</p>
    </article>

    <article class="hero-card acceptance-hero stack-md">
      <div class="acceptance-hero-head">
        <div class="stack-md acceptance-hero-copy">
          <div class="stack-xs">
            <span class="eyebrow">验收与评分</span>
            <h1 class="dashboard-title">{{ acceptanceHeroTitle }}</h1>
            <p class="hero-lead dashboard-lead">{{ acceptanceHeroLead }}</p>
          </div>

          <div class="tag-row">
            <span class="soft-pill">任务 {{ currentTaskId() }}</span>
            <span class="soft-pill">{{ page.summary.status }}</span>
            <span v-if="deliveryGrade" class="soft-pill">评级 {{ deliveryGrade }}</span>
            <span v-if="deliveryPayoutRatio" class="soft-pill">结算 {{ deliveryPayoutRatio }}</span>
          </div>

          <div v-if="acceptanceBackRoute || workspaceRoute" class="toolbar acceptance-hero-actions">
            <router-link v-if="acceptanceBackRoute" class="button-secondary" :to="acceptanceBackRoute">
              {{ acceptanceBackLabel }}
            </router-link>
            <router-link v-if="workspaceRoute" class="button-secondary" :to="workspaceRoute">返回协作空间</router-link>
          </div>
        </div>
      </div>
    </article>

    <section class="acceptance-object-layout">
      <main class="stack-md acceptance-object-main">
        <article class="glass-panel stack-md acceptance-current-panel">
          <div class="panel-header acceptance-section-header">
            <div>
              <span class="eyebrow">当前动作</span>
              <h3>{{ acceptanceActionTitle }}</h3>
            </div>
            <span class="soft-pill">{{ page.summary.status }}</span>
          </div>

          <p class="muted acceptance-action-note">{{ acceptanceActionBody }}</p>

          <template v-if="showGradeForm">
            <div class="acceptance-grade-grid">
              <article
                v-for="item in gradeOptions"
                :key="item.value"
                class="mini-card stack-sm acceptance-grade-card"
                :class="{ 'is-selected': gradeForm.grade === item.value, 'is-current': deliveryGrade === item.value }"
              >
                <div class="panel-header">
                  <div>
                    <h4>{{ item.label }}</h4>
                    <p class="muted">{{ item.note }}</p>
                  </div>
                  <span class="soft-pill">{{ item.value }}</span>
                </div>
                <button
                  class="button-secondary"
                  type="button"
                  :disabled="acceptanceTradingBlocked"
                  :title="acceptanceTradingBlocked ? acceptanceTradingRestriction : ''"
                  @click="gradeForm.grade = item.value"
                >
                  选择 {{ item.value }} 级
                </button>
              </article>
            </div>

            <form class="form-grid acceptance-form-shell" @submit.prevent="handleGrade">
              <div class="form-field full">
                <div class="tag-row">
                  <span class="soft-pill">当前状态：{{ earlyCompletion.status || '待企业评级' }}</span>
                  <span class="soft-pill">当前选择：{{ gradeForm.grade }} 级</span>
                </div>
              </div>
              <div class="form-field full">
                <label for="grade-note">评级说明</label>
                <textarea
                  id="grade-note"
                  v-model="gradeForm.note"
                  class="textarea"
                  placeholder="说明这次交付为什么对应当前评级。"
                  :disabled="acceptanceTradingBlocked"
                ></textarea>
              </div>
              <div class="form-field full">
                <div class="toolbar">
                <button
                  class="button-primary"
                  type="submit"
                  :disabled="acceptanceTradingBlocked || isSubmittingGrade"
                  :title="acceptanceTradingBlocked ? acceptanceTradingRestriction : ''"
                >
                  {{ isSubmittingGrade ? '提交中...' : '提交企业评级' }}
                </button>
                </div>
              </div>
            </form>
          </template>

          <form v-else-if="showAcceptanceForm" class="form-grid acceptance-form-shell" @submit.prevent="handleAcceptance">
            <div class="form-field full">
              <div class="tag-row">
                <span class="soft-pill">验收人：{{ currentActorLabel }}</span>
                <span class="soft-pill">任务：{{ currentTaskId() }}</span>
                <span class="soft-pill">当前状态：{{ page.summary.status }}</span>
              </div>
            </div>
            <div class="form-field full">
              <label for="acceptance-note">验收说明</label>
              <textarea
                id="acceptance-note"
                v-model="acceptanceForm.acceptanceNote"
                class="textarea"
                placeholder="只写这轮交付是否已经满足范围、是否可以进入评级。"
                :disabled="acceptanceTradingBlocked"
              ></textarea>
            </div>
            <div class="form-field full">
              <div class="toolbar">
                <button
                  class="button-primary"
                  type="submit"
                  :disabled="acceptanceTradingBlocked || isSubmittingAcceptance"
                  :title="acceptanceTradingBlocked ? acceptanceTradingRestriction : ''"
                >
                  {{ isSubmittingAcceptance ? '提交中...' : '确认验收' }}
                </button>
                <router-link class="button-secondary" :to="workspaceRoute">返回协作空间</router-link>
              </div>
            </div>
          </form>
          <form v-else-if="showReviewForm" class="form-grid acceptance-form-shell" @submit.prevent="handleReview">
            <div class="form-field full">
              <div class="tag-row">
                <span class="soft-pill">评分人：{{ currentActorLabel }}</span>
                <span class="soft-pill">被评人：{{ reviewTargetLabel }}</span>
              </div>
            </div>
            <div class="form-field">
              <label for="rating">评分</label>
              <select id="rating" v-model="reviewForm.rating" class="select-input" :disabled="acceptanceTradingBlocked">
                <option value="5">5 分</option>
                <option value="4">4 分</option>
                <option value="3">3 分</option>
                <option value="2">2 分</option>
                <option value="1">1 分</option>
              </select>
            </div>
            <div class="form-field full">
              <label for="review-content">评语</label>
              <textarea
                id="review-content"
                v-model="reviewForm.reviewContent"
                class="textarea"
                placeholder="重点写需求清晰度、反馈效率和验收体验。"
                :disabled="acceptanceTradingBlocked"
              ></textarea>
            </div>
            <div class="form-field full">
              <div class="toolbar">
                <button
                  class="button-primary"
                  type="submit"
                  :disabled="acceptanceTradingBlocked || isSubmittingReview"
                  :title="acceptanceTradingBlocked ? acceptanceTradingRestriction : ''"
                >
                  {{ isSubmittingReview ? '提交中...' : '提交评分' }}
                </button>
              </div>
            </div>
          </form>

          <article v-else class="mini-card stack-sm acceptance-current-result">
            <span class="eyebrow">当前结果</span>
            <strong>{{ acceptanceDecisionTitle }}</strong>
            <p class="muted">{{ acceptanceDecisionBody }}</p>
            <div class="tag-row">
              <span class="soft-pill">{{ page.summary.status }}</span>
              <span v-if="page.summary.acceptedAt" class="soft-pill">验收 {{ page.summary.acceptedAt }}</span>
              <span v-if="deliveryPayoutRatio" class="soft-pill">{{ deliveryPayoutRatio }}</span>
            </div>
          </article>

          <div v-if="acceptanceResult" class="result-card">
            <span class="eyebrow">验收结果</span>
            <h3>{{ acceptanceResult.status }}</h3>
            <p class="muted">{{ resultMessage(acceptanceResult) || '验收结果已更新。' }}</p>
          </div>

          <div v-if="gradeResult" class="result-card">
            <span class="eyebrow">评级提交结果</span>
            <h3>{{ gradeResult.status }}</h3>
            <p class="muted">{{ resultMessage(gradeResult) || '评级结果已更新。' }}</p>
          </div>

          <div v-if="reviewResult" class="result-card">
            <span class="eyebrow">评分结果</span>
            <h3>{{ reviewResult.status }}</h3>
            <p class="muted">{{ resultMessage(reviewResult) || '评分结果已更新。' }}</p>
            <div class="tag-row">
              <span class="soft-pill">评分：{{ reviewResult.rating }}</span>
            </div>
          </div>
        </article>
      </main>

      <aside class="stack-md acceptance-object-side">
        <article class="glass-panel stack-md acceptance-status-panel">
          <div class="panel-header acceptance-section-header">
            <div>
              <span class="eyebrow">评级 / 结算上下文</span>
              <h3>首屏只保留这组关键信息</h3>
            </div>
          </div>

          <div class="acceptance-status-grid">
            <article v-for="item in acceptanceContextCards" :key="item.label" class="mini-card stack-sm acceptance-status-card">
              <span class="eyebrow">{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <p v-if="item.note" class="muted">{{ item.note }}</p>
            </article>
          </div>
        </article>
      </aside>
    </section>

    <LiveSyncStatusBar :snapshot="liveSyncStatus" :error-note="liveSyncError" />

    <article v-if="showSCeremony" class="result-card acceptance-celebration-card">
      <span class="eyebrow">高光时刻</span>
      <h3>{{ isEnterprise ? '你给出了 S 级交付评级' : '你获得了 S 级交付评级' }}</h3>
      <p class="muted">
        {{ isEnterprise
          ? '这次合作会按 100% 结算，并作为高质量合作沉淀到平台推荐与案例展示里。'
          : '这次合作会按 100% 结算，并进入你的公开案例与平台高质量合作记录。' }}
      </p>
      <div class="tag-row">
        <span class="soft-pill">S 级</span>
        <span class="soft-pill">100% 结算</span>
        <span class="soft-pill">案例沉淀</span>
      </div>
    </article>

    <article v-if="acceptanceMetricCards.length" class="glass-panel stack-md acceptance-signal-panel">
      <div class="panel-header acceptance-section-header">
        <div>
          <span class="eyebrow">结果信号</span>
          <h3>当前结果只看这几个关键信号</h3>
        </div>
      </div>

      <div class="acceptance-signal-grid">
        <article v-for="item in acceptanceMetricCards" :key="item.label" class="mini-card stack-sm acceptance-signal-card">
          <span class="eyebrow">{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p class="muted">{{ item.note }}</p>
        </article>
      </div>
    </article>

    <article class="glass-panel stack-md acceptance-finance-panel">
      <div class="panel-header acceptance-section-header">
        <div>
          <span class="eyebrow">收口链路</span>
          <h3>请款、开票、对账、结算、争议</h3>
        </div>
      </div>

      <div v-if="closureActionChips?.length" class="tag-row">
        <span v-for="item in closureActionChips" :key="item" class="soft-pill">{{ item }}</span>
      </div>

      <article v-if="showClosureEmptyState" class="result-card stack-sm">
        <span class="eyebrow">财务摘要</span>
        <h3>当前还没有进入请款、开票、对账或结算</h3>
        <p class="muted">等验收、评级和评分完成后，这里才会出现后续财务动作。</p>
      </article>

      <div v-else class="acceptance-signal-grid">
        <article v-for="item in closureOverviewCards" :key="item.label" class="mini-card stack-sm acceptance-signal-card">
          <span class="eyebrow">{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p class="muted">{{ item.note }}</p>
          <div v-if="item.meta?.length" class="tag-row">
            <span v-for="meta in item.meta" :key="`${item.label}-${meta}`" class="soft-pill">{{ meta }}</span>
          </div>
          <div v-if="item.actions?.length" class="toolbar">
            <button
              v-for="action in item.actions"
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
      </div>
    </article>

    <article v-if="financeActionResult" class="result-card stack-sm">
      <span class="eyebrow">财务 / 争议动作结果</span>
      <h3>{{ financeActionResult.title }}</h3>
      <p class="muted">{{ financeActionResult.message }}</p>
      <div class="tag-row">
        <span class="soft-pill">{{ financeActionResult.actionLabel }}</span>
        <span v-if="financeActionResult.status" class="soft-pill">{{ financeActionResult.status }}</span>
      </div>
    </article>

    <article
      v-if="earlyCompletion.aiReviewSummary || listOf(earlyCompletion.aiReviewSuggestions).length"
      class="glass-panel stack-md acceptance-ai-panel"
    >
      <div class="panel-header acceptance-section-header">
        <div>
          <span class="eyebrow">AI 审核意见</span>
          <h3>放到首屏之后查看</h3>
        </div>
      </div>

      <p v-if="earlyCompletion.aiReviewSummary" class="muted">{{ earlyCompletion.aiReviewSummary }}</p>
      <ul v-if="listOf(earlyCompletion.aiReviewSuggestions).length" class="dashboard-detail-list">
        <li v-for="item in listOf(earlyCompletion.aiReviewSuggestions)" :key="item">{{ item }}</li>
      </ul>
    </article>

    <article class="glass-panel stack-md acceptance-feedback-panel">
      <div class="panel-header acceptance-section-header">
        <div>
          <span class="eyebrow">反馈摘要</span>
          <h3>{{ isEnterprise ? '查看人才侧反馈' : '保留这次合作反馈' }}</h3>
        </div>
      </div>

      <div v-if="acceptanceReviewHighlights.length" class="stack-sm acceptance-review-summary">
        <div v-for="item in acceptanceReviewHighlights" :key="item" class="list-row list-row-tight">
          <p class="muted">{{ item }}</p>
        </div>
      </div>

      <article class="mini-card stack-sm">
        <h4>{{ isEnterprise ? '人才侧反馈' : '最新反馈记录' }}</h4>
        <p v-if="latestTalentToBusinessReview" class="muted">
          最近一次评分：{{ latestTalentToBusinessReview.rating }} 分 · {{ latestTalentToBusinessReview.content }}
        </p>
        <p v-else class="muted">
          {{ isEnterprise ? '人才完成评分后，这里会显示最新合作反馈。' : '提交评分后，这里会保留最新反馈记录。' }}
        </p>
      </article>
    </article>

    <article class="glass-panel stack-md acceptance-timeline-shell">
      <div class="panel-header acceptance-section-header">
        <div>
          <span class="eyebrow">时间线</span>
          <h3>这次闭环走到哪一步</h3>
        </div>
      </div>

      <div class="acceptance-timeline-compact">
        <article v-for="item in acceptanceTimeline" :key="item.title" class="acceptance-timeline-item">
          <div class="panel-header">
            <div>
              <h4>{{ item.title }}</h4>
              <p class="muted">{{ item.time }} · {{ item.status }}</p>
            </div>
          </div>
          <p class="muted">{{ item.note }}</p>
        </article>
      </div>
    </article>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="评分历史"
          title="保留这次合作的真实反馈"
          description="历史结果继续影响推荐、信用标签和案例展示。"
        />

        <div class="stack-sm">
          <div v-if="!page.reviewHistory?.length" class="mini-card stack-sm">
            <h4>还没有评分记录</h4>
            <p class="muted">完成验收与评分后，这里会显示双方本次合作的评价历史。</p>
          </div>
          <div v-for="item in page.reviewHistory" :key="`${item.reviewer}-${item.time}`" class="list-card stack-sm">
            <div class="panel-header">
              <div>
                <h4>{{ item.reviewer }}</h4>
                <p class="muted">{{ item.reviewerRole || item.role }} · {{ item.time }}</p>
              </div>
              <span class="score-pill">{{ item.rating }}</span>
            </div>
            <p class="muted">{{ item.content }}</p>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="信用影响"
          title="这次结果会如何影响后续合作"
          description="平台会把交付评级、互评和过程质量一起用于推荐与案例展示。"
        />

        <div class="stack-sm">
          <div v-for="item in page.creditImpact" :key="item.title" class="mini-card stack-sm">
            <h4>{{ item.title }}</h4>
            <p class="muted">{{ item.note }}</p>
          </div>
        </div>

        <div class="result-card">
          <span class="eyebrow">下一步</span>
          <h3>{{ page.summary.status }}</h3>
          <p class="muted">{{ page.summary.nextStep }}</p>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import ActionErrorDialog from '../components/ActionErrorDialog.vue';
import LiveSyncStatusBar from '../components/LiveSyncStatusBar.vue';
import SectionTitle from '../components/SectionTitle.vue';
import {
  getTaskClosureData,
  requestTaskClaim,
  reviewTaskClaim,
  respondTaskReconciliation,
  respondTaskSettlement,
  submitAcceptance,
  submitEarlyCompletion,
  submitTaskInvoice,
  submitReview
} from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream';
import { useAuthState } from '../stores/auth';
import { hasTradingAccess, tradingRestrictionMessage } from '../utils/tradingAccess';
import {
  buildCenterReturnQuery,
  buildChildObjectPageContext,
  labelForObjectPageSource,
  readObjectPageContext,
  resolveImmediateOriginContext
} from '../utils/objectPageContext';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const page = ref(null);
const authState = useAuthState();
const audience = computed(() => resolveAudience(route));
const isEnterprise = computed(() => audience.value === 'enterprise');
const acceptanceTradingRestriction = computed(() => tradingRestrictionMessage(authState.user, audience.value));
const acceptanceTradingBlocked = computed(() => !hasTradingAccess(authState.user, audience.value));
const gradeOptions = [
  { value: 'S', label: 'S 级 · 100% 结算', note: '完整度、质量和协作体验都达到最高档。' },
  { value: 'A', label: 'A 级 · 80% 结算', note: '已满足主要目标，可进入正常结算。' },
  { value: 'B', label: 'B 级 · 30% 结算', note: '只覆盖部分目标或存在明显缺口。' }
];

const acceptanceForm = ref({
  acceptanceNote: '验收完成，当前交付已满足本轮范围，可以进入评级。'
});

const gradeForm = ref({
  grade: 'A',
  note: '主要目标已达成，协作记录和附件齐全，可以进入结算。'
});

const reviewForm = ref({
  rating: '5',
  reviewContent: '需求清晰，反馈及时，验收过程顺畅，整体合作体验很好。'
});

const acceptanceResult = ref(null);
const gradeResult = ref(null);
const reviewResult = ref(null);
const financeActionResult = ref(null);
const isSubmittingAcceptance = ref(false);
const isSubmittingGrade = ref(false);
const isSubmittingReview = ref(false);
const financeSubmittingActionCode = ref('');
const financeActionSubmitting = financeSubmittingActionCode;
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

function buildEmptyClosurePage(taskId = '', reason = '') {
  return {
    requestError: reason,
    summary: {
      taskId,
      title: '',
      status: '待验收',
      nextStep: reason || '等待任务上下文同步后再进入验收流程。',
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
      status: '未发起',
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
const originContext = computed(() =>
  resolveImmediateOriginContext({
    entrySource: entrySource.value,
    query: route.query,
    defaults: {
      taskId: page.value?.summary?.taskId || ''
    },
    allowedSources: ['approvals', 'notifications', 'messages', 'workspace', 'record-detail', 'records']
  })
);
const currentActorLabel = computed(() => authState.user?.displayName || '当前账号未识别');
const earlyCompletion = computed(() => page.value?.earlyCompletion || {});
const deliveryGrade = computed(() => page.value?.summary?.deliveryGrade || earlyCompletion.value?.grade || '');
const deliveryPayoutRatio = computed(() => page.value?.summary?.deliveryPayoutRatio || earlyCompletion.value?.payoutRatio || '');
const claimSummary = computed(() => page.value?.claimSummary || {});
const invoiceSummary = computed(() => page.value?.invoiceSummary || {});
const reconciliationSummary = computed(() => page.value?.reconciliationSummary || {});
const settlementSummary = computed(() => page.value?.settlementSummary || {});
const disputeSummary = computed(() => page.value?.disputeSummary || {});
const showSCeremony = computed(() => deliveryGrade.value === 'S');
const isGradePending = computed(() => earlyCompletion.value?.status === '待企业评级');
const acceptanceStatusCode = computed(() => String(page.value?.acceptance?.status || '').trim().toUpperCase());
const hasAccepted = computed(() => {
  const acceptedAt = String(page.value?.summary?.acceptedAt || '').trim();
  return acceptanceStatusCode.value === 'ACCEPTED'
    || Boolean(acceptedAt && acceptedAt !== '待确认' && acceptedAt !== '待验收');
});
const showGradeForm = computed(() => isEnterprise.value && isGradePending.value);
const showAcceptanceForm = computed(() =>
  isEnterprise.value
  && !showGradeForm.value
  && !hasAccepted.value
  && summaryStatusMatches(page.value?.summary, ['PENDING_ACCEPTANCE', '待验收', '待企业确认', 'PENDING_CONFIRM'])
);
const latestEnterpriseToTalentReview = computed(() =>
  listOf(page.value?.reviewHistory).find(
    (item) => item?.reviewerAudience === 'enterprise' || item?.reviewerRole === '企业端' || item?.role === '企业端'
  )
);
const latestCurrentActorReview = computed(() => (isEnterprise.value ? latestEnterpriseToTalentReview.value : latestTalentToBusinessReview.value));
const showReviewForm = computed(() =>
  hasAccepted.value
  && !isGradePending.value
  && !latestCurrentActorReview.value
);
const acceptanceCounterpartLabel = computed(() => (isEnterprise.value ? '合作人才' : '合作企业'));
const acceptanceCounterpartValue = computed(() =>
  isEnterprise.value ? page.value?.summary?.talent || '待同步' : page.value?.summary?.business || '待同步'
);
const acceptanceHeroTitle = computed(() =>
  page.value?.summary?.title || (isEnterprise.value ? '确认交付并完成评级' : '查看结果并处理评分')
);
const acceptanceHeroLead = computed(() => {
  if (showGradeForm.value) {
    return '先给出最终评级，再进入结算。';
  }
  if (showAcceptanceForm.value) {
    return '先判断这轮交付是否已经满足当前范围。';
  }
  if (showReviewForm.value) {
    return isEnterprise.value ? '验收与评级已经完成，现在补齐企业侧合作评分。' : '结果已经同步，现在只处理你的合作评分。';
  }
  return '围绕当前验收结果核对评级、结算和反馈。';
});
const acceptanceDecisionTitle = computed(() => {
  if (deliveryGrade.value) {
    return `${deliveryGrade.value} 级交付结果已生成`;
  }
  if (isGradePending.value) {
    return '验收已完成，当前等待企业评级';
  }
  if (hasAccepted.value) {
    return isEnterprise.value ? '验收已经确认，等待后续评级或结算' : '企业已完成验收，等待评级结果';
  }
  return isEnterprise.value ? '当前需要企业先确认是否验收' : '当前等待企业确认是否验收';
});
const acceptanceDecisionBody = computed(() => {
  if (!page.value?.summary) {
    return '任务上下文同步后，这里会显示当前验收结论。';
  }
  if (deliveryPayoutRatio.value) {
    return `当前按 ${deliveryPayoutRatio.value} 结算，结果会继续沉淀到信用记录。`;
  }
  return compactText(page.value.summary.nextStep, 48) || '当前结果会继续同步到评级和结算。';
});
const acceptanceActionTitle = computed(() => {
  if (showGradeForm.value) {
    return '完成这一单的最终评级';
  }
  if (showAcceptanceForm.value) {
    return '先确认这轮交付是否可以验收';
  }
  if (showReviewForm.value) {
    return isEnterprise.value ? '给人才留下这次合作评分' : '给企业留下这次合作评分';
  }
  return '当前没有额外主动作，只需要核对结果';
});
const acceptanceActionBody = computed(() => {
  if (showGradeForm.value) {
    return '选定 S / A / B，再补一条清楚的评级说明。';
  }
  if (showAcceptanceForm.value) {
    return '只判断这轮交付是否满足当前范围，确认后再进入评级。';
  }
  if (showReviewForm.value) {
    return '补一条合作评分即可，不需要重复描述整段项目背景。';
  }
  return acceptanceDecisionBody.value;
});
const reviewTargetLabel = computed(() => {
  if (!page.value?.summary) {
    return '待识别';
  }
  return isEnterprise.value ? page.value.summary.talent : page.value.summary.business;
});
const latestTalentToBusinessReview = computed(() =>
  listOf(page.value?.reviewHistory).find(
    (item) => item?.reviewerAudience === 'talent' || item?.reviewerRole === '人才方' || item?.role === '人才方'
  )
);
const acceptanceContextCards = computed(() => [
  {
    label: '当前状态',
    value: page.value?.summary?.status || '待验收',
    note: hasAccepted.value ? `验收 ${page.value.summary.acceptedAt}` : ''
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
    note: page.value?.summary?.settledAt ? `结算 ${page.value.summary.settledAt}` : ''
  }
]);
const acceptanceTimeline = computed(() => listOf(page.value?.timeline).slice(0, 4));
const acceptanceMetricCards = computed(() => listOf(page.value?.metrics).slice(0, 4));
const acceptanceReviewHighlights = computed(() => listOf(page.value?.reviewSummary).slice(0, 3));
const closureActionSources = computed(() => [
  page.value?.summary?.availableActions,
  claimSummary.value?.availableActions,
  invoiceSummary.value?.availableActions,
  reconciliationSummary.value?.availableActions,
  settlementSummary.value?.availableActions,
  disputeSummary.value?.availableActions
]);
const closureActionsProvided = computed(() =>
  closureActionSources.value.some((source) => Array.isArray(source))
);
const closureAvailableActionCodes = computed(() =>
  collectClosureActionCodes(...closureActionSources.value)
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

function closureActionAllowed(actionCode, summary, fallbackCheck) {
  if (closureActionsProvided.value) {
    return closureAvailableActionCodes.value.has(normalizeClosureActionCode(actionCode));
  }
  return fallbackCheck(summary);
}

function closureActionButton(actionCode, label, handler, summary, fallbackCheck, tone = 'button-secondary') {
  if (!closureActionAllowed(actionCode, summary, fallbackCheck)) {
    return null;
  }
  return {
    code: actionCode,
    label: financeSubmittingActionCode.value === actionCode ? '提交中...' : label,
    handler,
    tone,
    disabled: acceptanceTradingBlocked.value || Boolean(financeSubmittingActionCode.value)
  };
}

function summaryId(summary, ...keys) {
  const source = summary && typeof summary === 'object' ? summary : {};
  return keys.map((key) => String(source?.[key] || '').trim()).find(Boolean) || '';
}

function buildFinanceActionMessage(response, fallback) {
  return String(response?.requestError || response?.nextStep || response?.message || fallback || '').trim();
}

function mutationResultText(result, fallback) {
  return String(result?.requestError || result?.nextStep || fallback || '').trim();
}

function resultMessage(result) {
  return mutationResultText(result, '');
}

function buildFinanceActionResult(actionCode, response, fallbackTitle, fallbackMessage) {
  const responseStatus = String(response?.status || '').trim();
  return {
    actionCode,
    actionLabel: {
      CLAIM_REQUEST: '发起请款',
      CLAIM_APPROVE: '审批请款',
      CLAIM_REJECT: '驳回请款',
      INVOICE_SUBMIT: '提交开票',
      RECONCILIATION_CONFIRM: '确认对账',
      RECONCILIATION_DISPUTE: '发起争议',
      SETTLEMENT_EXECUTE: '执行结算',
      SETTLEMENT_FAIL: '结算失败'
    }[normalizeClosureActionCode(actionCode)] || '财务动作',
    title: responseStatus === 'FAILED'
      ? String(fallbackTitle || '提交失败').trim()
      : String(responseStatus || fallbackTitle || '动作已提交').trim(),
    status: responseStatus,
    message: buildFinanceActionMessage(response, fallbackMessage)
  };
}

function isMutationFailed(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED');
}

const closureOverviewCards = computed(() => [
  buildClosureSummaryCard(
    '请款',
    claimSummary.value,
    '任务闭环后可发起请款。',
    [
      ['amount', '金额 '],
      ['requestedAt', '提交 '],
      ['payoutRatio', '比例 ']
    ],
    [
      closureActionButton('CLAIM_REQUEST', '发起请款', handleClaimRequest, claimSummary.value, (summary) =>
        isTalent.value && summaryStatusMatches(summary, ['', '未发起', '待请款', 'DRAFT', 'REJECTED', 'CANCELLED', 'EXPIRED'])
      ),
      closureActionButton('CLAIM_APPROVE', '批准请款', handleApproveClaim, claimSummary.value, (summary) =>
        isEnterprise.value && summaryStatusMatches(summary, ['PENDING_APPROVAL', 'SUBMITTED', 'UNDER_REVIEW', '待企业审批', '待审批', '待审核'])
      ),
      closureActionButton('CLAIM_REJECT', '驳回请款', handleRejectClaim, claimSummary.value, (summary) =>
        isEnterprise.value && summaryStatusMatches(summary, ['PENDING_APPROVAL', 'SUBMITTED', 'UNDER_REVIEW', '待企业审批', '待审批', '待审核'])
      )
    ].filter(Boolean)
  ),
  buildClosureSummaryCard(
    '开票',
    invoiceSummary.value,
    '请款批准后可发起开票。',
    [
      ['amount', '金额 '],
      ['submittedAt', '提交 '],
      ['invoiceType', '类型 ']
    ],
    [
      closureActionButton('INVOICE_SUBMIT', '提交开票', handleSubmitInvoice, invoiceSummary.value, (summary) =>
        isTalent.value && summaryStatusMatches(claimSummary.value, ['APPROVED', '已批准', '已通过'])
          && summaryStatusMatches(summary, ['', 'NOT_REQUESTED', '未发起', '待开票'])
      )
    ].filter(Boolean)
  ),
  buildClosureSummaryCard(
    '对账',
    reconciliationSummary.value,
    '提交开票后可进入对账。',
    [
      ['amount', '金额 '],
      ['submittedAt', '提交 '],
      ['updatedAt', '更新 ']
    ],
    [
      closureActionButton('RECONCILIATION_CONFIRM', '确认对账', handleConfirmReconciliation, reconciliationSummary.value, (summary) =>
        isEnterprise.value && summaryStatusMatches(summary, ['PENDING', '待企业对账', '待对账', '待确认'])
      ),
      closureActionButton('RECONCILIATION_DISPUTE', '发起争议', handleOpenReconciliationDispute, reconciliationSummary.value, (summary) =>
        isEnterprise.value && summaryStatusMatches(summary, ['PENDING', '待企业对账', '待对账', '待确认'])
      )
    ].filter(Boolean)
  ),
  buildClosureSummaryCard(
    '结算',
    settlementSummary.value,
    '对账完成后可进入结算执行。',
    [
      ['amount', '金额 '],
      ['payoutRatio', '比例 '],
      ['settledAt', '结算 ']
    ],
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
    disputeSummary.value,
    '如对账有异议，平台会生成争议与风控工单。',
    [
      ['amount', '金额 '],
      ['submittedAt', '发起 '],
      ['riskTicketId', '工单 ']
    ]
  )
]);

const closureActionChips = computed(() => {
  const labels = {
    CLAIM_REQUEST: '发起请款',
    CLAIM_APPROVE: '批准请款',
    CLAIM_REJECT: '驳回请款',
    INVOICE_SUBMIT: '提交开票',
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
const showClosureEmptyState = computed(() =>
  !closureActionChips.value.length
  && closureOverviewCards.value.every((item) =>
    item.value === '未发起' && !item.meta?.length && !item.actions?.length
  )
);

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

  if (source === 'workspace') {
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
  return labelForObjectPageSource(source, '返回来源');
});

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
    value: String(source.status || '未发起').trim() || '未发起',
    note: compactText(source.nextStep || source.decisionNote || source.note || fallbackNote, 60),
    meta: summaryMeta(source, fields),
    actions
  };
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

async function refreshPage() {
  const taskId = currentTaskId();
  if (!taskId) {
    page.value = buildEmptyClosurePage('', '当前缺少任务上下文，无法读取验收数据。');
    return;
  }
  try {
    page.value = await getTaskClosureData(taskId);
  } catch (error) {
    page.value = buildEmptyClosurePage(taskId, error?.message || '验收数据读取失败，请稍后重试。');
  }
}

async function handleAcceptance() {
  if (isSubmittingAcceptance.value) {
    return;
  }
  const taskId = currentTaskId();
  if (!taskId) {
    acceptanceResult.value = {
      status: 'FAILED',
      requestError: '当前缺少任务上下文，无法提交验收。'
    };
    return;
  }
  if (acceptanceTradingBlocked.value) {
    acceptanceResult.value = {
      status: 'FAILED',
      requestError: acceptanceTradingRestriction.value
    };
    return;
  }
  isSubmittingAcceptance.value = true;
  try {
    acceptanceResult.value = await submitAcceptance(taskId, {
      accepterUserId: reviewerUserId(),
      acceptanceNote: acceptanceForm.value.acceptanceNote
    });
    if (isMutationFailed(acceptanceResult.value)) {
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
    gradeResult.value = {
      status: 'FAILED',
      requestError: '当前缺少任务上下文，无法提交评级。'
    };
    return;
  }
  if (acceptanceTradingBlocked.value) {
    gradeResult.value = {
      status: 'FAILED',
      requestError: acceptanceTradingRestriction.value
    };
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
    reviewResult.value = {
      status: 'FAILED',
      requestError: '当前缺少任务上下文，无法提交评分。'
    };
    return;
  }
  if (acceptanceTradingBlocked.value) {
    reviewResult.value = {
      status: 'FAILED',
      requestError: acceptanceTradingRestriction.value
    };
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
      return;
    }
    await refreshPage();
  } finally {
    isSubmittingReview.value = false;
  }
}

async function runFinanceAction(actionCode, taskAction, fallbackTitle, fallbackMessage) {
  if (financeSubmittingActionCode.value) {
    return;
  }
  financeSubmittingActionCode.value = actionCode;
  try {
    const result = await taskAction();
    financeActionResult.value = buildFinanceActionResult(actionCode, result, fallbackTitle, fallbackMessage);
    if (isMutationFailed(result)) {
      return;
    }
    await refreshPage();
  } finally {
    financeSubmittingActionCode.value = '';
  }
}

async function handleClaimRequest() {
  const taskId = currentTaskId();
  if (!taskId) {
    financeActionResult.value = buildFinanceActionResult(
      'CLAIM_REQUEST',
      { status: 'FAILED', requestError: '当前缺少任务上下文，无法发起请款。' },
      '提交失败',
      '当前缺少任务上下文，无法发起请款。'
    );
    return;
  }
  if (!isTalent.value) {
    financeActionResult.value = buildFinanceActionResult(
      'CLAIM_REQUEST',
      { status: 'FAILED', requestError: '当前账号不是人才方，不能发起请款。' },
      '提交失败',
      '当前账号不是人才方，不能发起请款。'
    );
    return;
  }
  await runFinanceAction(
    'CLAIM_REQUEST',
    () => requestTaskClaim(taskId, {
      note: String(page.value?.summary?.nextStep || claimSummary.value?.note || '请发起请款。').trim()
    }),
    '请款已提交',
    '请款动作已提交。'
  );
}

async function handleApproveClaim() {
  const taskId = currentTaskId();
  const claimId = summaryId(claimSummary.value, 'claimId', 'id');
  if (!taskId || !claimId) {
    financeActionResult.value = buildFinanceActionResult(
      'CLAIM_APPROVE',
      { status: 'FAILED', requestError: '缺少请款单号，无法审批请款。' },
      '提交失败',
      '缺少请款单号，无法审批请款。'
    );
    return;
  }
  if (!isEnterprise.value) {
    financeActionResult.value = buildFinanceActionResult(
      'CLAIM_APPROVE',
      { status: 'FAILED', requestError: '当前账号不是企业方，不能审批请款。' },
      '提交失败',
      '当前账号不是企业方，不能审批请款。'
    );
    return;
  }
  await runFinanceAction(
    'CLAIM_APPROVE',
    () => reviewTaskClaim(taskId, claimId, {
      action: 'APPROVE',
      note: String(claimSummary.value?.decisionNote || claimSummary.value?.note || '请款已通过审批。').trim()
    }),
    '请款审批已提交',
    '请款审批动作已提交。'
  );
}

async function handleRejectClaim() {
  const taskId = currentTaskId();
  const claimId = summaryId(claimSummary.value, 'claimId', 'id');
  if (!taskId || !claimId) {
    financeActionResult.value = buildFinanceActionResult(
      'CLAIM_REJECT',
      { status: 'FAILED', requestError: '缺少请款单号，无法驳回请款。' },
      '提交失败',
      '缺少请款单号，无法驳回请款。'
    );
    return;
  }
  if (!isEnterprise.value) {
    financeActionResult.value = buildFinanceActionResult(
      'CLAIM_REJECT',
      { status: 'FAILED', requestError: '当前账号不是企业方，不能驳回请款。' },
      '提交失败',
      '当前账号不是企业方，不能驳回请款。'
    );
    return;
  }
  await runFinanceAction(
    'CLAIM_REJECT',
    () => reviewTaskClaim(taskId, claimId, {
      action: 'REJECT',
      note: String(claimSummary.value?.decisionNote || claimSummary.value?.note || '请款已驳回，请补充后再提。').trim()
    }),
    '请款驳回已提交',
    '请款驳回动作已提交。'
  );
}

async function handleSubmitInvoice() {
  const claimId = summaryId(claimSummary.value, 'claimId', 'id', 'claimNo');
  if (!claimId) {
    financeActionResult.value = buildFinanceActionResult(
      'INVOICE_SUBMIT',
      { status: 'FAILED', requestError: '缺少请款单号，无法提交开票。' },
      '提交失败',
      '缺少请款单号，无法提交开票。'
    );
    return;
  }
  if (!isTalent.value) {
    financeActionResult.value = buildFinanceActionResult(
      'INVOICE_SUBMIT',
      { status: 'FAILED', requestError: '当前账号不是人才方，不能提交开票。' },
      '提交失败',
      '当前账号不是人才方，不能提交开票。'
    );
    return;
  }
  await runFinanceAction(
    'INVOICE_SUBMIT',
    () => submitTaskInvoice(claimId, {
      invoiceType: 'ELECTRONIC_NORMAL',
      note: String(claimSummary.value?.note || page.value?.summary?.nextStep || '请根据当前请款提交开票。').trim()
    }),
    '开票已提交',
    '开票动作已提交。'
  );
}

async function handleConfirmReconciliation() {
  const reconciliationId = summaryId(reconciliationSummary.value, 'reconciliationId', 'id');
  if (!reconciliationId) {
    financeActionResult.value = buildFinanceActionResult(
      'RECONCILIATION_CONFIRM',
      { status: 'FAILED', requestError: '缺少对账单号，无法确认对账。' },
      '提交失败',
      '缺少对账单号，无法确认对账。'
    );
    return;
  }
  if (!isEnterprise.value) {
    financeActionResult.value = buildFinanceActionResult(
      'RECONCILIATION_CONFIRM',
      { status: 'FAILED', requestError: '当前账号不是企业方，不能确认对账。' },
      '提交失败',
      '当前账号不是企业方，不能确认对账。'
    );
    return;
  }
  await runFinanceAction(
    'RECONCILIATION_CONFIRM',
    () => respondTaskReconciliation(reconciliationId, {
      action: 'CONFIRM',
      note: String(reconciliationSummary.value?.note || reconciliationSummary.value?.decisionNote || '对账已确认。').trim()
    }),
    '对账确认已提交',
    '对账确认动作已提交。'
  );
}

async function handleOpenReconciliationDispute() {
  const reconciliationId = summaryId(reconciliationSummary.value, 'reconciliationId', 'id');
  if (!reconciliationId) {
    financeActionResult.value = buildFinanceActionResult(
      'RECONCILIATION_DISPUTE',
      { status: 'FAILED', requestError: '缺少对账单号，无法发起争议。' },
      '提交失败',
      '缺少对账单号，无法发起争议。'
    );
    return;
  }
  if (!isEnterprise.value) {
    financeActionResult.value = buildFinanceActionResult(
      'RECONCILIATION_DISPUTE',
      { status: 'FAILED', requestError: '当前账号不是企业方，不能发起争议。' },
      '提交失败',
      '当前账号不是企业方，不能发起争议。'
    );
    return;
  }
  await runFinanceAction(
    'RECONCILIATION_DISPUTE',
    () => respondTaskReconciliation(reconciliationId, {
      action: 'DISPUTE',
      note: String(reconciliationSummary.value?.note || '对账存在异议，请平台介入处理。').trim()
    }),
    '争议已发起',
    '对账争议已提交。'
  );
}

async function handleExecuteSettlement() {
  const settlementId = summaryId(settlementSummary.value, 'settlementId', 'id');
  if (!settlementId) {
    financeActionResult.value = buildFinanceActionResult(
      'SETTLEMENT_EXECUTE',
      { status: 'FAILED', requestError: '缺少结算单号，无法执行结算。' },
      '提交失败',
      '缺少结算单号，无法执行结算。'
    );
    return;
  }
  if (!isEnterprise.value) {
    financeActionResult.value = buildFinanceActionResult(
      'SETTLEMENT_EXECUTE',
      { status: 'FAILED', requestError: '当前账号不是企业方，不能执行结算。' },
      '提交失败',
      '当前账号不是企业方，不能执行结算。'
    );
    return;
  }
  await runFinanceAction(
    'SETTLEMENT_EXECUTE',
    () => respondTaskSettlement(settlementId, {
      action: 'EXECUTE',
      note: String(settlementSummary.value?.note || settlementSummary.value?.decisionNote || '请执行结算。').trim()
    }),
    '结算已提交',
    '结算执行动作已提交。'
  );
}

async function handleFailSettlement() {
  const settlementId = summaryId(settlementSummary.value, 'settlementId', 'id');
  if (!settlementId) {
    financeActionResult.value = buildFinanceActionResult(
      'SETTLEMENT_FAIL',
      { status: 'FAILED', requestError: '缺少结算单号，无法标记结算失败。' },
      '提交失败',
      '缺少结算单号，无法标记结算失败。'
    );
    return;
  }
  if (!isEnterprise.value) {
    financeActionResult.value = buildFinanceActionResult(
      'SETTLEMENT_FAIL',
      { status: 'FAILED', requestError: '当前账号不是企业方，不能标记结算失败。' },
      '提交失败',
      '当前账号不是企业方，不能标记结算失败。'
    );
    return;
  }
  await runFinanceAction(
    'SETTLEMENT_FAIL',
    () => respondTaskSettlement(settlementId, {
      action: 'FAIL',
      note: String(settlementSummary.value?.note || settlementSummary.value?.decisionNote || '结算执行失败，需要后续处理。').trim()
    }),
    '结算失败标记已提交',
    '结算失败标记已提交。'
  );
}

onMounted(refreshPage);

onMounted(() => {
  stopBusinessLiveSync = startBusinessLiveSync({
    refresh: () => refreshPage(),
    acceptsEvent(event) {
      const taskId = String(currentTaskId() || '').trim();
      return !taskId || !event?.taskId || event.taskId === taskId;
    },
    onStatusChange: handleLiveSyncStatus,
    onSyncError: handleLiveSyncError
  });
});

onBeforeUnmount(() => {
  stopBusinessLiveSync?.();
  stopBusinessLiveSync = null;
});
</script>

<style scoped>
.acceptance-page {
  --acceptance-bg: #f3f5f7;
  --acceptance-panel: #ffffff;
  --acceptance-soft: #f7f9fc;
  --acceptance-soft-strong: #eef3f8;
  --acceptance-border: #d9e1ea;
  --acceptance-border-strong: #c7d5e4;
  --acceptance-text: #132238;
  --acceptance-muted: #627389;
  --acceptance-accent: #1562c5;
  gap: 20px;
  padding-bottom: 36px;
  color: var(--acceptance-text);
}

.acceptance-page :is(.hero-card, .glass-panel, .mini-card, .result-card, .list-card) {
  background: var(--acceptance-panel);
  border: 1px solid var(--acceptance-border);
  box-shadow: 0 18px 40px rgba(15, 35, 63, 0.08);
  backdrop-filter: none;
}

.acceptance-page .muted {
  color: var(--acceptance-muted);
}

.acceptance-page .soft-pill {
  border: 1px solid var(--acceptance-border);
  background: #f6f8fb;
  color: #27415e;
  box-shadow: none;
}

.acceptance-page :is(.button-primary, .button-secondary) {
  min-height: 42px;
  border-radius: 12px;
  font-weight: 600;
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

.acceptance-page textarea {
  min-height: 120px;
  resize: vertical;
}

.acceptance-page .result-card {
  border-left: 4px solid var(--acceptance-accent);
}

.acceptance-hero {
  padding: 26px 30px;
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 249, 253, 0.98)),
    radial-gradient(circle at top right, rgba(21, 98, 197, 0.12), transparent 36%);
}

.acceptance-hero-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.acceptance-hero-copy {
  max-width: 74ch;
}

.acceptance-hero :is(.dashboard-title, .hero-lead) {
  margin: 0;
}

.acceptance-hero-actions {
  flex-wrap: wrap;
}

.acceptance-object-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) 320px;
  gap: 24px;
  align-items: start;
}

.acceptance-object-main,
.acceptance-current-panel,
.acceptance-object-side {
  min-width: 0;
}

.acceptance-object-side {
  position: sticky;
  top: 24px;
  align-self: start;
}

.acceptance-current-panel,
.acceptance-status-panel,
.acceptance-signal-panel,
.acceptance-finance-panel,
.acceptance-ai-panel,
.acceptance-feedback-panel,
.acceptance-timeline-shell {
  border-radius: 24px;
}

.acceptance-section-header {
  align-items: flex-start;
}

.acceptance-grade-grid,
.acceptance-status-grid,
.acceptance-signal-grid {
  display: grid;
  gap: 14px;
}

.acceptance-grade-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.acceptance-status-grid,
.acceptance-signal-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.acceptance-grade-card,
.acceptance-status-card,
.acceptance-signal-card {
  border-radius: 20px;
  background: var(--acceptance-soft);
}

.acceptance-grade-card.is-selected {
  border-color: #97b8e6;
  background: #ecf3ff;
  box-shadow: 0 12px 26px rgba(21, 98, 197, 0.11);
}

.acceptance-grade-card.is-current {
  border-color: #a8d5b8;
  background: #effaf2;
}

.acceptance-form-shell,
.acceptance-current-result {
  padding: 18px;
  border-radius: 20px;
  background: var(--acceptance-soft);
  border: 1px solid var(--acceptance-border);
}

.acceptance-action-note,
.acceptance-review-summary,
.acceptance-current-result p {
  margin: 0;
}

.acceptance-celebration-card {
  border-left-color: #2a9d5b;
  background: linear-gradient(180deg, #ffffff, #f2fbf5);
}

.acceptance-feedback-panel .mini-card,
.split-grid .mini-card,
.split-grid .list-card {
  border-radius: 18px;
  background: var(--acceptance-soft);
}

.acceptance-timeline-compact {
  display: grid;
  gap: 12px;
}

.acceptance-timeline-item {
  position: relative;
  padding: 16px 18px 16px 22px;
  border-radius: 18px;
  border: 1px solid var(--acceptance-border);
  background: linear-gradient(180deg, #ffffff, #f8fbfe);
}

.acceptance-timeline-item::before {
  content: "";
  position: absolute;
  top: 16px;
  bottom: 16px;
  left: 0;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, #2c77dd, rgba(44, 119, 221, 0.24));
}

.split-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.score-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid var(--acceptance-border);
  background: #edf3fb;
  font-weight: 700;
  color: #1d4f92;
}

.list-card {
  padding: 16px 18px;
}

.list-row-tight {
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--acceptance-soft);
  border: 1px solid var(--acceptance-border);
}

@media (max-width: 1120px) {
  .acceptance-object-layout,
  .split-grid {
    grid-template-columns: 1fr;
  }

  .acceptance-object-side {
    position: static;
  }
}

@media (max-width: 860px) {
  .acceptance-hero-head {
    flex-direction: column;
  }

  .acceptance-grade-grid,
  .acceptance-status-grid,
  .acceptance-signal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
