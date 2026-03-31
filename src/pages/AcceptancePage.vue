<template>
  <section class="page-stack acceptance-page" v-if="page">
    <article class="hero-card stack-md acceptance-object-hero">
      <div class="acceptance-object-head">
        <div class="stack-sm">
          <span class="eyebrow">验收对象</span>
          <h1>{{ page.summary.title || '验收结果待同步' }}</h1>
          <p class="muted acceptance-object-subline">{{ objectHeroDescription }}</p>
        </div>
        <span class="soft-pill is-info acceptance-object-status">{{ currentActionStatusLabel }}</span>
      </div>

      <div class="tag-row acceptance-object-meta">
        <span v-for="item in objectMetaChips" :key="item" class="soft-pill">{{ item }}</span>
      </div>
    </article>

    <MobileLiveSyncStatus
      v-if="showLiveSyncBanner"
      :snapshot="liveSyncStatus"
      :error-note="liveSyncError"
    />

    <article class="glass-panel stack-md acceptance-focus-shell">
      <article class="mini-card stack-md acceptance-result-card">
        <span class="eyebrow">当前结果</span>
        <h3>{{ currentStatusHeadline }}</h3>
        <p class="muted acceptance-result-note">{{ currentStatusNote }}</p>

        <div v-if="showSCeremony" class="tag-row acceptance-ceremony-inline">
          <span class="soft-pill is-warning">S 级结论</span>
          <span class="soft-pill">100% 结算</span>
          <span class="soft-pill">案例沉淀</span>
        </div>

        <div class="acceptance-context-grid">
          <article
            v-for="item in acceptanceContextCards"
            :key="item.label"
            class="acceptance-context-card"
          >
            <span class="eyebrow">{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </article>

      <article class="mini-card stack-md acceptance-action-card">
        <div class="acceptance-action-head">
          <div class="stack-xs">
            <span class="eyebrow">{{ currentPendingAction === 'none' ? '当前动作已完成' : '当前动作' }}</span>
            <h3>{{ currentActionTitle }}</h3>
          </div>
          <span class="soft-pill acceptance-action-state">{{ page.summary.status }}</span>
        </div>

        <p class="muted acceptance-action-note">{{ currentActionDescription }}</p>

        <form
          v-if="currentPendingAction === 'acceptance'"
          class="form-grid acceptance-focus-form"
          @submit.prevent="handleAcceptance"
        >
          <div class="form-field full">
            <div class="tag-row">
              <span class="soft-pill">验收人：{{ currentActorLabel }}</span>
              <span class="soft-pill">任务：{{ currentTaskId() }}</span>
            </div>
          </div>
          <div class="form-field full">
            <label for="acceptance-note">验收说明</label>
            <textarea
              id="acceptance-note"
              v-model="acceptanceForm.acceptanceNote"
              class="textarea"
              placeholder="例如：本轮交付已满足范围、附件齐全，可以进入评级。"
            ></textarea>
          </div>
          <div class="form-field full">
            <div class="toolbar acceptance-focus-actions">
              <button class="button-primary" type="submit">确认验收</button>
              <router-link class="button-secondary" :to="acceptanceBackRoute">{{ acceptanceBackLabel }}</router-link>
            </div>
          </div>
        </form>

        <template v-else-if="currentPendingAction === 'grade'">
          <div class="acceptance-grade-grid acceptance-grade-grid-compact">
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
              <button class="button-secondary" type="button" @click="gradeForm.grade = item.value">
                选择 {{ item.value }} 级
              </button>
            </article>
          </div>

          <article v-if="earlyCompletion.aiReviewSummary" class="mini-card stack-sm acceptance-ai-review-card">
            <h4>AI 审核意见</h4>
            <p class="muted">{{ earlyCompletion.aiReviewSummary }}</p>
            <ul v-if="listOf(earlyCompletion.aiReviewSuggestions).length" class="dashboard-detail-list">
              <li v-for="item in listOf(earlyCompletion.aiReviewSuggestions)" :key="item">{{ item }}</li>
            </ul>
          </article>

          <form class="form-grid acceptance-focus-form" @submit.prevent="handleGrade">
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
                placeholder="例如：当前交付已完整覆盖首版范围，附件与沟通纪要也已齐备。"
              ></textarea>
            </div>
            <div class="form-field full">
              <div class="toolbar acceptance-focus-actions">
                <button class="button-primary" type="submit">提交企业评级</button>
                <router-link class="button-secondary" :to="acceptanceBackRoute">{{ acceptanceBackLabel }}</router-link>
              </div>
            </div>
          </form>
        </template>

        <form v-else-if="currentPendingAction === 'review'" class="form-grid acceptance-focus-form" @submit.prevent="handleReview">
          <div class="form-field full">
            <div class="tag-row">
              <span class="soft-pill">评分人：{{ currentActorLabel }}</span>
              <span class="soft-pill">被评人：{{ reviewTargetLabel }}</span>
            </div>
          </div>
          <div class="form-field">
            <label for="rating">评分</label>
            <select id="rating" v-model="reviewForm.rating" class="select-input">
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
              placeholder="例如：需求边界明确、反馈及时、验收过程顺畅。"
            ></textarea>
          </div>
          <div class="form-field full">
            <div class="toolbar acceptance-focus-actions">
              <button class="button-primary" type="submit">提交评分</button>
              <router-link class="button-secondary" :to="acceptanceBackRoute">{{ acceptanceBackLabel }}</router-link>
            </div>
          </div>
        </form>

        <article v-else class="mini-card stack-sm acceptance-passive-card">
          <h4>当前无需继续操作</h4>
          <p class="muted">{{ page.summary.nextStep }}</p>
          <div class="tag-row">
            <span class="soft-pill">返回 {{ acceptanceBackLabel }}</span>
            <span class="soft-pill">验收 {{ acceptanceAcceptedLabel }}</span>
            <span v-if="deliveryGrade" class="soft-pill">{{ deliveryGrade }} 级</span>
            <span v-if="deliveryPayoutRatio" class="soft-pill">{{ deliveryPayoutRatio }}</span>
          </div>
          <div class="toolbar acceptance-focus-actions">
            <router-link class="button-secondary" :to="acceptanceBackRoute">{{ acceptanceBackLabel }}</router-link>
          </div>
        </article>

        <div v-if="currentActionResult" class="result-card">
          <span class="eyebrow">动作结果</span>
          <h3>{{ mutationResultTitle(currentActionResult, currentActionSuccessTitle) }}</h3>
          <p class="muted">{{ mutationResultText(currentActionResult, currentActionFallbackText) }}</p>
        </div>
      </article>
    </article>

    <DetailAccordion :items="detailAccordionItems" />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import MobileLiveSyncStatus from '../components/mobile/MobileLiveSyncStatus.vue';
import DetailAccordion from '../components/mobile/DetailAccordion.vue';
import { getTaskClosureData, submitAcceptance, submitEarlyCompletion, submitReview } from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream.js';
import { useAuthState } from '../stores/auth';
import {
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
    metrics: [],
    timeline: [],
    reviewSummary: [],
    reviewHistory: [],
    creditImpact: []
  };
}

const contextDefaults = computed(() => ({
  taskId: page.value?.summary?.taskId || '',
  room: route.query.room,
  recordId: route.query.recordId,
  nodeId: route.query.nodeId,
  tab: route.query.tab
}));
const pageContext = computed(() => readObjectPageContext(route.query, contextDefaults.value));
const originContext = computed(() =>
  resolveImmediateOriginContext({
    entrySource: pageContext.value.source,
    query: route.query,
    defaults: contextDefaults.value,
    allowedSources: ['messages', 'workspace', 'record-detail', 'records']
  })
);
const currentTaskIdValue = computed(() => pageContext.value.taskId || String(page.value?.summary?.taskId || '').trim());
const currentActorLabel = computed(() => authState.user?.displayName || '当前账号未识别');
const earlyCompletion = computed(() => page.value?.earlyCompletion || {});
const deliveryGrade = computed(() => page.value?.summary?.deliveryGrade || earlyCompletion.value?.grade || '');
const deliveryPayoutRatio = computed(() => page.value?.summary?.deliveryPayoutRatio || earlyCompletion.value?.payoutRatio || '');
const disputeSummary = computed(() => page.value?.disputeSummary || {});
const showSCeremony = computed(() => deliveryGrade.value === 'S');
const isGradePending = computed(() => earlyCompletion.value?.status === '待企业评级');
const reviewTargetLabel = computed(() => {
  if (!page.value?.summary) {
    return '待识别';
  }
  return isEnterprise.value ? page.value.summary.talent : page.value.summary.business;
});
const hasAccepted = computed(() => {
  const acceptedAt = String(page.value?.summary?.acceptedAt || '').trim();
  return Boolean(acceptedAt && acceptedAt !== '待确认');
});
const acceptanceAcceptedLabel = computed(() => (hasAccepted.value ? String(page.value?.summary?.acceptedAt || '').trim() : '待确认'));
const showLiveSyncBanner = computed(() => {
  const state = String(liveSyncStatus.value?.state || '').trim();
  if (liveSyncError.value) {
    return true;
  }
  return Boolean(state && state !== 'disabled' && state !== 'disposed');
});
const currentPendingAction = computed(() => {
  if (isEnterprise.value && !hasAccepted.value) {
    return 'acceptance';
  }
  if (isEnterprise.value && isGradePending.value) {
    return 'grade';
  }
  if (!isEnterprise.value) {
    return 'review';
  }
  return 'none';
});
const currentActionResult = computed(() => {
  if (currentPendingAction.value === 'acceptance') {
    return acceptanceResult.value;
  }
  if (currentPendingAction.value === 'grade') {
    return gradeResult.value;
  }
  if (currentPendingAction.value === 'review') {
    return reviewResult.value;
  }
  return reviewResult.value || gradeResult.value || acceptanceResult.value || null;
});
const currentActionSuccessTitle = computed(() => {
  if (currentPendingAction.value === 'acceptance') {
    return '验收已提交';
  }
  if (currentPendingAction.value === 'grade') {
    return '评级已提交';
  }
  if (currentPendingAction.value === 'review') {
    return '评分已提交';
  }
  return '结果已更新';
});
const currentActionFallbackText = computed(() => {
  if (currentPendingAction.value === 'acceptance') {
    return '验收结果已更新。';
  }
  if (currentPendingAction.value === 'grade') {
    return '评级结果已更新。';
  }
  if (currentPendingAction.value === 'review') {
    return '评分结果已更新。';
  }
  return '当前结果已更新。';
});
const currentActionStatusLabel = computed(() => {
  if (currentPendingAction.value === 'acceptance') {
    return '待企业验收';
  }
  if (currentPendingAction.value === 'grade') {
    return '待企业评级';
  }
  if (currentPendingAction.value === 'review') {
    return '待人才评分';
  }
  return '已完成';
});
const currentStatusHeadline = computed(() => {
  if (deliveryGrade.value) {
    return `${deliveryGrade.value} 级评级${deliveryPayoutRatio.value ? ` · ${deliveryPayoutRatio.value}` : ''}`;
  }
  if (currentPendingAction.value === 'acceptance') {
    return '待企业确认验收';
  }
  if (hasAccepted.value) {
    return `验收已完成 · ${acceptanceAcceptedLabel.value}`;
  }
  if (currentPendingAction.value === 'review') {
    return '待人才完成评分';
  }
  return page.value?.summary?.status || '等待同步';
});
const currentStatusNote = computed(() => {
  if (showSCeremony.value) {
    return isEnterprise.value
      ? '这次合作会按 100% 结算，并作为高质量交付继续沉淀到案例和推荐。'
      : '这次合作会按 100% 结算，并进入你的公开案例与平台高质量合作记录。';
  }
  if (deliveryGrade.value) {
    return earlyCompletion.value?.gradeNote || page.value?.summary?.nextStep || '评级结果已经形成。';
  }
  if (disputeSummary.value.status && disputeSummary.value.status !== '未发起') {
    return disputeSummary.value.nextStep || disputeSummary.value.note || page.value?.summary?.nextStep || '当前存在争议，等待平台继续处理。';
  }
  if (currentPendingAction.value === 'acceptance') {
    return '先确认这轮交付是否覆盖范围，再进入评级。';
  }
  if (currentPendingAction.value === 'grade') {
    return compactText(
      earlyCompletion.value?.aiReviewSummary || '验收已完成，当前只差企业给出最终评级和结算比例。',
      56
    );
  }
  if (currentPendingAction.value === 'review') {
    return '企业侧结果已经形成，现在只差你补完本次反馈。';
  }
  return compactText(page.value?.summary?.nextStep || '当前结果会继续同步到这里。', 56);
});
const currentActionTitle = computed(() => {
  if (currentPendingAction.value === 'acceptance') {
    return '确认验收';
  }
  if (currentPendingAction.value === 'grade') {
    return '完成企业评级';
  }
  if (currentPendingAction.value === 'review') {
    return '提交合作评分';
  }
  return '查看沉淀结果';
});
const currentActionDescription = computed(() => {
  if (currentPendingAction.value === 'acceptance') {
    return '确认交付满足范围后，再进入 S / A / B 评级。';
  }
  if (currentPendingAction.value === 'grade') {
    return '结合 AI 审核建议，给出最终评级和结算比例。';
  }
  if (currentPendingAction.value === 'review') {
    return '把这次合作体验留给企业，也会同步影响后续推荐。';
  }
  return '首屏只保留结论和当前动作，详细过程都下沉到下面。';
});
const objectHeroDescription = computed(() => {
  if (!page.value?.summary) {
    return '这里会沉淀验收结果、交付评级和合作反馈。';
  }
  const partnerLabel = isEnterprise.value ? '合作人才' : '合作企业';
  const partner = reviewTargetLabel.value || '待同步';
  return `${partnerLabel} ${partner} · ${page.value.summary.status || '待同步'}`;
});
const objectMetaChips = computed(() => {
  const chips = [
    `任务 ${currentTaskId() || '待同步'}`,
    `${isEnterprise.value ? '人才' : '企业'} ${reviewTargetLabel.value || '待同步'}`,
    `验收 ${acceptanceAcceptedLabel.value}`
  ];
  if (deliveryGrade.value) {
    chips.push(`评级 ${deliveryGrade.value} 级`);
  } else if (isGradePending.value) {
    chips.push('评级 待企业确认');
  }
  if (deliveryPayoutRatio.value) {
    chips.push(`结算 ${deliveryPayoutRatio.value}`);
  }
  return chips.slice(0, 4);
});
const acceptanceContextCards = computed(() => {
  const cards = [
    {
      label: isEnterprise.value ? '合作人才' : '合作企业',
      value: reviewTargetLabel.value || '待同步'
    },
    {
      label: '验收',
      value: acceptanceAcceptedLabel.value
    },
    {
      label: '评级',
      value: deliveryGrade.value ? `${deliveryGrade.value} 级` : (isGradePending.value ? '待企业评级' : '待形成')
    },
    {
      label: disputeSummary.value.status && disputeSummary.value.status !== '未发起' ? '争议' : '结算',
      value: disputeSummary.value.status && disputeSummary.value.status !== '未发起'
        ? disputeSummary.value.status
        : (deliveryPayoutRatio.value || '待确认')
    }
  ];
  return cards;
});
const latestTalentToBusinessReview = computed(() =>
  listOf(page.value?.reviewHistory).find(
    (item) => item?.reviewerAudience === 'talent' || item?.reviewerRole === '人才方' || item?.role === '人才方'
  )
);

function buildAcceptanceChildQuery(overrides = {}) {
  return buildChildObjectPageContext({
    current: pageContext.value,
    origin: originContext.value,
    overrides: {
      source: 'acceptance',
      taskId: currentTaskIdValue.value,
      recordId: pageContext.value.recordId,
      room: pageContext.value.room,
      nodeId: pageContext.value.nodeId,
      tab: pageContext.value.tab,
      ...overrides
    }
  });
}

function messagesRoute(query) {
  if (pageContext.value.room) {
    return isEnterprise.value
      ? roleRouteMap.enterprise.messageRoom(pageContext.value.room, query)
      : roleRouteMap.talent.messageRoom(pageContext.value.room, query);
  }
  return {
    path: isEnterprise.value ? roleRouteMap.enterprise.messages : roleRouteMap.talent.messages,
    query
  };
}

function recordsRoute() {
  return {
    path: isEnterprise.value ? roleRouteMap.enterprise.records : roleRouteMap.talent.records,
    query: pageContext.value.tab ? { tab: pageContext.value.tab } : {}
  };
}

function routeForImmediateSource(source) {
  if (source === 'messages') {
    return messagesRoute(buildAcceptanceChildQuery());
  }
  if (source === 'workspace') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.workspace : roleRouteMap.talent.workspace,
      query: buildAcceptanceChildQuery()
    };
  }
  if (source === 'record-detail' && pageContext.value.recordId) {
    return {
      path: isEnterprise.value
        ? roleRouteMap.enterprise.recordDetail(pageContext.value.recordId)
        : roleRouteMap.talent.recordDetail(pageContext.value.recordId),
      query: buildAcceptanceChildQuery({
        nodeId: undefined
      })
    };
  }
  if (source === 'records') {
    return recordsRoute();
  }
  return null;
}

const workspaceRoute = computed(() => ({
  path: isEnterprise.value ? roleRouteMap.enterprise.workspace : roleRouteMap.talent.workspace,
  query: buildAcceptanceChildQuery()
}));
const acceptanceBackRoute = computed(() => {
  const directRoute = routeForImmediateSource(pageContext.value.source);
  if (directRoute) {
    return directRoute;
  }
  if (pageContext.value.source === 'acceptance') {
    const originRoute = routeForImmediateSource(originContext.value.source);
    if (originRoute) {
      return originRoute;
    }
  }
  return workspaceRoute.value;
});
const acceptanceBackLabel = computed(() => {
  const targetSource = pageContext.value.source === 'acceptance' ? originContext.value.source : pageContext.value.source;
  return labelForObjectPageSource(targetSource, '返回协作空间');
});

const detailAccordionItems = computed(() => {
  const metricItems = listOf(page.value?.metrics).map(
    (item) => `${item.label || '指标'}：${item.value || '待同步'}${item.note ? ` · ${item.note}` : ''}`
  );
  const timelineItems = listOf(page.value?.timeline).map(
    (item) => `${item.time || '待同步'} · ${item.title || '节点'} · ${item.status || '待确认'}${item.note ? `：${item.note}` : ''}`
  );
  const reviewItems = listOf(page.value?.reviewHistory).map(
    (item) => `${item.reviewer || '待同步'} · ${item.reviewerRole || item.role || '评分'} · ${item.time || '待同步'} · ${item.rating || '-'} 分${item.content ? `：${item.content}` : ''}`
  );
  const creditItems = listOf(page.value?.creditImpact).map(
    (item) => `${item.title || '影响'}${item.note ? `：${item.note}` : ''}`
  );
  const gradeItems = [
    deliveryGrade.value ? `当前评级：${deliveryGrade.value} 级` : '',
    deliveryPayoutRatio.value ? `当前结算：${deliveryPayoutRatio.value}` : '',
    earlyCompletion.value?.status ? `当前状态：${earlyCompletion.value.status}` : '',
    earlyCompletion.value?.gradeNote ? `评级说明：${earlyCompletion.value.gradeNote}` : '',
    earlyCompletion.value?.aiReviewSummary ? `AI 审核：${earlyCompletion.value.aiReviewSummary}` : '',
    ...listOf(earlyCompletion.value?.aiReviewSuggestions).map((item) => `建议：${item}`)
  ].filter(Boolean);

  return [
    {
      key: 'timeline',
      badge: '验收进度',
      title: '过程节点',
      summary: timelineItems.length ? `共 ${timelineItems.length} 个节点` : '当前还没有更多过程节点',
      list: timelineItems
    },
    {
      key: 'summary',
      badge: '结果摘要',
      title: '指标与结论',
      summary: metricItems.length ? metricItems[0] : '当前还没有更多摘要指标',
      list: metricItems
    },
    {
      key: 'grade',
      badge: '评级依据',
      title: '评级与审核',
      summary: gradeItems.length ? gradeItems[0] : '当前还没有更多评级说明',
      list: gradeItems
    },
    {
      key: 'feedback',
      badge: '评分反馈',
      title: '合作反馈',
      summary: reviewItems.length
        ? reviewItems[0]
        : (latestTalentToBusinessReview.value
          ? `最近一次评分：${latestTalentToBusinessReview.value.rating} 分`
          : '当前还没有新的评分反馈'),
      list: reviewItems
    },
    {
      key: 'credit',
      badge: '信用影响',
      title: '后续影响',
      summary: creditItems.length ? creditItems[0] : '平台会按交付结果继续更新推荐和案例',
      list: creditItems
    },
    {
      key: 'dispute',
      badge: '争议状态',
      title: '争议与风控',
      summary: disputeSummary.value.status && disputeSummary.value.status !== '未发起'
        ? `当前争议状态：${disputeSummary.value.status}`
        : '当前没有争议或风控升级',
      list: disputeSummary.value.status && disputeSummary.value.status !== '未发起'
        ? [
            `状态：${disputeSummary.value.status}`,
            disputeSummary.value.submittedAt ? `发起时间：${disputeSummary.value.submittedAt}` : '',
            disputeSummary.value.amount ? `争议金额：${disputeSummary.value.amount}` : '',
            disputeSummary.value.riskTicketId ? `风险工单：${disputeSummary.value.riskTicketId}` : '',
            disputeSummary.value.nextStep ? `下一步：${disputeSummary.value.nextStep}` : '',
            disputeSummary.value.note ? `说明：${disputeSummary.value.note}` : ''
          ].filter(Boolean)
        : ['当前没有争议，若对账或结算出现异议，平台会自动生成争议与风控工单。']
    }
  ];
});

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function isFailedResult(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED');
}

function mutationResultTitle(result, successTitle) {
  if (isFailedResult(result)) {
    return '提交失败';
  }
  return result?.status || successTitle;
}

function mutationResultText(result, fallback) {
  return result?.requestError || result?.nextStep || fallback;
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
  page.value = await getTaskClosureData(taskId);
}

async function handleAcceptance() {
  const taskId = currentTaskId();
  if (!taskId) {
    acceptanceResult.value = {
      status: 'FAILED',
      requestError: '当前缺少任务上下文，无法提交验收。'
    };
    return;
  }
  acceptanceResult.value = await submitAcceptance(taskId, {
    accepterUserId: reviewerUserId(),
    acceptanceNote: acceptanceForm.value.acceptanceNote
  });
  if (isFailedResult(acceptanceResult.value)) {
    return;
  }
  await refreshPage();
}

async function handleGrade() {
  const taskId = currentTaskId();
  if (!taskId) {
    gradeResult.value = {
      status: 'FAILED',
      requestError: '当前缺少任务上下文，无法提交评级。'
    };
    return;
  }
  gradeResult.value = await submitEarlyCompletion(taskId, {
    action: 'grade',
    grade: gradeForm.value.grade,
    note: gradeForm.value.note
  });
  if (isFailedResult(gradeResult.value)) {
    return;
  }
  await refreshPage();
}

async function handleReview() {
  const taskId = currentTaskId();
  if (!taskId) {
    reviewResult.value = {
      status: 'FAILED',
      requestError: '当前缺少任务上下文，无法提交评分。'
    };
    return;
  }
  reviewResult.value = await submitReview(taskId, {
    reviewerUserId: reviewerUserId(),
    revieweeUserId: revieweeUserId(),
    rating: reviewForm.value.rating,
    reviewContent: reviewForm.value.reviewContent
  });
  if (isFailedResult(reviewResult.value)) {
    return;
  }
  await refreshPage();
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
  gap: 14px;
}

.acceptance-object-hero {
  background:
    radial-gradient(circle at top right, rgba(121, 155, 255, 0.14), transparent 34%),
    linear-gradient(180deg, rgba(9, 18, 34, 0.96), rgba(11, 22, 43, 0.98));
  gap: 16px;
}

.acceptance-object-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.acceptance-object-head h1 {
  margin: 0;
  max-width: 10ch;
  font-family: var(--font-display);
  font-size: clamp(28px, 9vw, 42px);
  line-height: 0.98;
  letter-spacing: -0.05em;
  color: var(--text-strong);
}

.acceptance-object-subline {
  max-width: 34ch;
  font-size: 14px;
  line-height: 1.6;
}

.acceptance-object-status {
  white-space: nowrap;
}

.acceptance-object-meta {
  gap: 6px;
}

.acceptance-focus-shell {
  gap: 14px;
}

.acceptance-result-card,
.acceptance-action-card,
.acceptance-ai-review-card,
.acceptance-passive-card {
  border: 1px solid rgba(121, 155, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(10, 18, 34, 0.9), rgba(10, 19, 35, 0.82));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.acceptance-result-card h3,
.acceptance-action-card h3 {
  margin: 0;
}

.acceptance-result-note,
.acceptance-action-note {
  margin: 0;
}

.acceptance-ceremony-inline {
  gap: 8px;
}

.acceptance-context-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.acceptance-context-card {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(121, 155, 255, 0.1);
  background: rgba(8, 15, 28, 0.78);
}

.acceptance-context-card strong {
  color: var(--text-strong);
  font-size: 15px;
  line-height: 1.2;
}

.acceptance-action-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.acceptance-action-state {
  white-space: nowrap;
}

.acceptance-focus-form {
  gap: 12px;
}

.acceptance-focus-actions {
  flex-wrap: wrap;
  gap: 10px;
}

.acceptance-focus-actions > * {
  flex: 1 1 160px;
}

.acceptance-grade-grid-compact {
  grid-template-columns: 1fr;
  gap: 10px;
}

.acceptance-grade-card .button-secondary {
  width: 100%;
  justify-content: center;
}

.acceptance-passive-card .button-secondary {
  width: 100%;
  justify-content: center;
}

@media (max-width: 640px) {
  .acceptance-object-head,
  .acceptance-action-head {
    flex-direction: column;
  }

  .acceptance-object-head h1 {
    max-width: none;
  }

  .acceptance-context-grid {
    grid-template-columns: 1fr;
  }

  .acceptance-focus-actions > * {
    width: 100%;
    flex-basis: 100%;
  }
}
</style>
