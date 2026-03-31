<template>
  <section class="page-stack acceptance-page" v-if="page">
    <article v-if="page.requestError" class="result-card stack-sm">
      <span class="eyebrow">数据同步失败</span>
      <h3>当前展示的是空态验收页</h3>
      <p class="muted">{{ page.requestError }}</p>
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
                ></textarea>
              </div>
              <div class="form-field full">
                <div class="toolbar">
                  <button class="button-primary" type="submit">提交企业评级</button>
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
              ></textarea>
            </div>
            <div class="form-field full">
              <div class="toolbar">
                <button class="button-primary" type="submit">确认验收</button>
                <router-link class="button-secondary" :to="workspaceRoute">返回协作空间</router-link>
              </div>
            </div>
          </form>
          <form v-else-if="showTalentReviewForm" class="form-grid acceptance-form-shell" @submit.prevent="handleReview">
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
                placeholder="重点写需求清晰度、反馈效率和验收体验。"
              ></textarea>
            </div>
            <div class="form-field full">
              <div class="toolbar">
                <button class="button-primary" type="submit">提交评分</button>
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
            <p class="muted">{{ acceptanceResult.nextStep }}</p>
          </div>

          <div v-if="gradeResult" class="result-card">
            <span class="eyebrow">评级提交结果</span>
            <h3>{{ gradeResult.status }}</h3>
            <p class="muted">{{ gradeResult.nextStep }}</p>
          </div>

          <div v-if="reviewResult" class="result-card">
            <span class="eyebrow">评分结果</span>
            <h3>{{ reviewResult.status }}</h3>
            <p class="muted">{{ reviewResult.nextStep }}</p>
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
import LiveSyncStatusBar from '../components/LiveSyncStatusBar.vue';
import SectionTitle from '../components/SectionTitle.vue';
import { getTaskClosureData, submitAcceptance, submitEarlyCompletion, submitReview } from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream';
import { useAuthState } from '../stores/auth';
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
const showSCeremony = computed(() => deliveryGrade.value === 'S');
const isGradePending = computed(() => earlyCompletion.value?.status === '待企业评级');
const showGradeForm = computed(() => isEnterprise.value && isGradePending.value);
const showAcceptanceForm = computed(() => isEnterprise.value && !showGradeForm.value && !page.value?.summary?.acceptedAt);
const showTalentReviewForm = computed(() => !isEnterprise.value && !latestTalentToBusinessReview.value);
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
  if (showTalentReviewForm.value) {
    return '结果已经同步，现在只处理你的合作评分。';
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
  if (page.value?.summary?.acceptedAt) {
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
  if (showTalentReviewForm.value) {
    return '给企业留下这次合作评分';
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
  if (showTalentReviewForm.value) {
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
    note: page.value?.summary?.acceptedAt ? `验收 ${page.value.summary.acceptedAt}` : ''
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
