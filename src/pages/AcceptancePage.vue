<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card stack-md">
      <SectionTitle
        eyebrow="验收与评分"
        :title="isEnterprise ? '确认交付并完成企业评级。' : '查看结果并给企业反馈。'"
        :description="heroDescription"
        tag="h1"
      />

      <div class="chip-row">
        <span class="tag-pill">验收闭环</span>
        <span class="tag-pill">交付评级</span>
        <span class="tag-pill">信用沉淀</span>
        <span v-if="deliveryGrade" class="tag-pill">当前评级 {{ deliveryGrade }}</span>
        <span v-if="deliveryPayoutRatio" class="tag-pill">结算 {{ deliveryPayoutRatio }}</span>
      </div>
    </article>

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

    <section class="metric-grid">
      <article v-for="item in page.metrics" :key="item.label" class="metric-card">
        <p class="eyebrow">{{ item.label }}</p>
        <div class="metric-value">{{ item.value }}</div>
        <p>{{ item.note }}</p>
      </article>
    </section>

    <article class="glass-panel stack-md">
      <SectionTitle
        eyebrow="验收确认"
        :title="isEnterprise ? '先确认交付是否可以验收' : '查看企业侧验收进度'"
        :description="isEnterprise
          ? '企业先完成验收确认，再进入 S / A / B 评级与最终结算。'
          : '企业完成验收后，这里会同步当前状态与下一步说明。'"
      />

      <div class="timeline">
        <div v-for="item in page.timeline" :key="item.title" class="timeline-item">
          <div class="progress-head">
            <div>
              <h4>{{ item.title }}</h4>
              <p class="muted">{{ item.time }} · {{ item.status }}</p>
            </div>
          </div>
          <p class="muted">{{ item.note }}</p>
        </div>
      </div>

      <form v-if="isEnterprise" class="form-grid" @submit.prevent="handleAcceptance">
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
            placeholder="例如：本轮交付已满足范围、附件齐全，可以进入评级。"
          ></textarea>
        </div>
        <div class="form-field full">
          <div class="toolbar">
            <button class="button-primary" type="submit">确认验收</button>
            <router-link class="button-secondary" :to="workspaceRoute">返回协作空间</router-link>
          </div>
        </div>
      </form>

      <article v-else class="mini-card stack-sm">
        <h4>当前验收状态</h4>
        <p class="muted">{{ page.summary.status }}</p>
        <p class="muted">{{ page.summary.nextStep }}</p>
        <div class="tag-row">
          <span class="soft-pill">任务 {{ currentTaskId() }}</span>
          <span class="soft-pill">验收时间 {{ page.summary.acceptedAt || '待企业确认' }}</span>
        </div>
      </article>

      <div v-if="acceptanceResult" class="result-card">
        <span class="eyebrow">验收结果</span>
        <h3>{{ acceptanceResult.status }}</h3>
        <p class="muted">{{ acceptanceResult.nextStep }}</p>
      </div>
    </article>

    <article class="glass-panel stack-md">
      <SectionTitle
        eyebrow="企业评级"
        :title="isEnterprise ? '按交付质量完成 S / A / B 评级' : '查看企业最终给出的交付评级'"
        :description="isEnterprise
          ? '只有在人才同意提前完成后，企业才能进行最终评级。评级会决定本次结算比例。'
          : '企业评级会直接影响结算比例、公开案例和后续推荐权重。'"
      />

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
            v-if="isEnterprise && isGradePending"
            class="button-secondary"
            type="button"
            @click="gradeForm.grade = item.value"
          >
            选择 {{ item.value }} 级
          </button>
        </article>
      </div>

      <article v-if="earlyCompletion.aiReviewSummary" class="mini-card stack-sm">
        <h4>AI 审核意见</h4>
        <p class="muted">{{ earlyCompletion.aiReviewSummary }}</p>
        <ul v-if="listOf(earlyCompletion.aiReviewSuggestions).length" class="dashboard-detail-list">
          <li v-for="item in listOf(earlyCompletion.aiReviewSuggestions)" :key="item">{{ item }}</li>
        </ul>
      </article>

      <form v-if="isEnterprise && isGradePending" class="form-grid" @submit.prevent="handleGrade">
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
          <div class="toolbar">
            <button class="button-primary" type="submit">提交企业评级</button>
          </div>
        </div>
      </form>

      <div v-else class="result-card">
        <span class="eyebrow">评级结果</span>
        <h3>{{ deliveryGrade ? `${deliveryGrade} 级` : '待企业评级' }}</h3>
        <p class="muted">{{ deliveryPayoutRatio ? `本次将按 ${deliveryPayoutRatio} 结算。` : page.summary.nextStep }}</p>
        <div class="tag-row">
          <span class="soft-pill">{{ earlyCompletion.status || '未发起' }}</span>
          <span v-if="deliveryPayoutRatio" class="soft-pill">{{ deliveryPayoutRatio }}</span>
          <span v-if="earlyCompletion.gradeNote" class="soft-pill">{{ earlyCompletion.gradeNote }}</span>
        </div>
      </div>

      <div v-if="gradeResult" class="result-card">
        <span class="eyebrow">评级提交结果</span>
        <h3>{{ gradeResult.status }}</h3>
        <p class="muted">{{ gradeResult.nextStep }}</p>
      </div>
    </article>

    <article class="glass-panel stack-md">
      <SectionTitle
        eyebrow="评分反馈"
        :title="isEnterprise ? '查看人才侧反馈与合作评分' : '给企业打分并留下反馈'"
        :description="isEnterprise
          ? '人才对企业的评分会同步到首页轮播、企业工作台和后续推荐逻辑。'
          : '重点反馈需求清晰度、沟通效率、验收体验和合作感受。'"
      />

      <div class="stack-sm">
        <div v-for="item in page.reviewSummary" :key="item" class="list-row list-row-tight">
          <p class="muted">{{ item }}</p>
        </div>
      </div>

      <form v-if="!isEnterprise" class="form-grid" @submit.prevent="handleReview">
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
          <div class="toolbar">
            <button class="button-primary" type="submit">提交评分</button>
          </div>
        </div>
      </form>

      <article v-else class="mini-card stack-sm">
        <h4>人才侧反馈</h4>
        <p v-if="latestTalentToBusinessReview" class="muted">
          最近一次评分：{{ latestTalentToBusinessReview.rating }} 分 · {{ latestTalentToBusinessReview.content }}
        </p>
        <p v-else class="muted">人才完成评分后，这里会显示最新的合作反馈。</p>
      </article>

      <div v-if="reviewResult" class="result-card">
        <span class="eyebrow">评分结果</span>
        <h3>{{ reviewResult.status }}</h3>
        <p class="muted">{{ reviewResult.nextStep }}</p>
        <div class="tag-row">
          <span class="soft-pill">评分：{{ reviewResult.rating }}</span>
        </div>
      </div>
    </article>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="评分历史"
          title="把这次合作的真实反馈保留下来。"
          description="这些历史结果会继续影响推荐、信用标签和首页案例展示。"
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
          title="这次结果会如何继续影响后续合作"
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
import SectionTitle from '../components/SectionTitle.vue';
import { getTaskClosureData, submitAcceptance, submitEarlyCompletion, submitReview } from '../services/api';
import { useAuthState } from '../stores/auth';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const page = ref(null);
const authState = useAuthState();
const audience = computed(() => resolveAudience(route));
const isEnterprise = computed(() => audience.value === 'enterprise');
const workspaceRoute = computed(() =>
  isEnterprise.value ? roleRouteMap.enterprise.workspace : roleRouteMap.talent.workspace
);
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
let acceptanceRefreshTimer = null;

const currentTaskIdValue = computed(() => String(route.query.taskId || page.value?.summary?.taskId || 'task-001').trim());
const currentActorLabel = computed(() => authState.user?.displayName || '当前账号未识别');
const earlyCompletion = computed(() => page.value?.earlyCompletion || {});
const deliveryGrade = computed(() => page.value?.summary?.deliveryGrade || earlyCompletion.value?.grade || '');
const deliveryPayoutRatio = computed(() => page.value?.summary?.deliveryPayoutRatio || earlyCompletion.value?.payoutRatio || '');
const showSCeremony = computed(() => deliveryGrade.value === 'S');
const isGradePending = computed(() => earlyCompletion.value?.status === '待企业评级');
const heroDescription = computed(() => {
  if (!page.value?.summary) {
    return '当前任务进入验收后，这里会沉淀交付结果、评分与信用。';
  }
  return `${page.value.summary.title} 当前状态为 ${page.value.summary.status}，${page.value.summary.nextStep}`;
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

function listOf(value) {
  return Array.isArray(value) ? value : [];
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
  page.value = await getTaskClosureData(currentTaskId());
}

async function handleAcceptance() {
  acceptanceResult.value = await submitAcceptance(currentTaskId(), {
    accepterUserId: reviewerUserId(),
    acceptanceNote: acceptanceForm.value.acceptanceNote
  });
  await refreshPage();
}

async function handleGrade() {
  gradeResult.value = await submitEarlyCompletion(currentTaskId(), {
    action: 'grade',
    grade: gradeForm.value.grade,
    note: gradeForm.value.note
  });
  await refreshPage();
}

async function handleReview() {
  reviewResult.value = await submitReview(currentTaskId(), {
    reviewerUserId: reviewerUserId(),
    revieweeUserId: revieweeUserId(),
    rating: reviewForm.value.rating,
    reviewContent: reviewForm.value.reviewContent
  });
  await refreshPage();
}

onMounted(refreshPage);

onMounted(() => {
  if (typeof window !== 'undefined') {
    acceptanceRefreshTimer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      void refreshPage();
    }, 6000);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && acceptanceRefreshTimer) {
    window.clearInterval(acceptanceRefreshTimer);
  }
});
</script>
