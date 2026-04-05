<template>
  <section class="page-stack talent-detail-page office-detail-page" v-if="page">
    <ActionErrorDialog title="人才详情暂时不可用" :message="talentDetailError || collaborationError || page.requestError" />

    <article class="office-detail-hero stack-md">
      <div class="office-detail-hero-head">
        <div class="office-detail-identity">
          <div class="profile-avatar-shell office-detail-avatar-shell">
            <div class="profile-avatar">
              <img v-if="page.avatar" :src="page.avatar" :alt="`${page.name} 头像`" />
              <span v-else>{{ avatarMonogram }}</span>
            </div>
          </div>

          <div class="office-detail-identity-copy stack-sm">
            <span class="eyebrow">人才 Profile</span>
            <h1>{{ page.name }}</h1>
            <p class="profile-role">{{ page.role }}</p>
            <div v-if="decisionTags.length" class="tag-row">
              <span v-for="tag in decisionTags" :key="tag" class="soft-pill">{{ tag }}</span>
            </div>
            <p class="muted profile-summary">{{ decision.summary }}</p>
          </div>
        </div>

        <div class="office-detail-hero-side stack-md">
          <div class="office-detail-decision">
            <div class="panel-header office-detail-decision__header">
              <div>
                <span class="eyebrow">结论</span>
                <h3>{{ decision.headline }}</h3>
              </div>
              <span class="decision-badge" :class="`decision-badge--${decision.tone}`">{{ decision.badge }}</span>
            </div>

            <p class="office-detail-decision__copy">{{ decision.nextStep }}</p>

            <div class="office-detail-mini-grid">
              <article v-for="metric in decision.metrics" :key="metric.label" class="office-detail-mini-card">
                <span class="office-detail-mini-card__label">{{ metric.label }}</span>
                <strong class="office-detail-mini-card__value">{{ metric.value }}</strong>
              </article>
            </div>
          </div>

          <div class="office-detail-hero-facts">
            <article v-for="metric in heroMetrics" :key="metric.label" class="office-detail-hero-fact">
              <span class="office-detail-hero-fact__label">{{ metric.label }}</span>
              <strong class="office-detail-hero-fact__value">{{ metric.value }}</strong>
              <p class="office-detail-hero-fact__note muted">{{ metric.note }}</p>
            </article>
          </div>

          <div class="office-detail-actions">
            <router-link class="button-secondary" :to="backToMarket">{{ backLabel }}</router-link>
            <button
              v-if="audience === 'enterprise'"
              class="button-primary"
              type="button"
              @click="openCollaborationLauncher"
            >
              {{ conversationLabel }}
            </button>
            <router-link v-else-if="conversationRoute" class="button-primary" :to="conversationRoute">
              {{ conversationLabel }}
            </router-link>
            <button v-else class="button-primary" type="button" disabled>
              {{ conversationLabel }}
            </button>
          </div>

          <p v-if="collaborationRestrictionMessage" class="hero-note hero-note--warning">{{ collaborationRestrictionMessage }}</p>
          <p v-if="conversationBlockedMessage" class="hero-note hero-note--warning">{{ conversationBlockedMessage }}</p>
        </div>
      </div>
    </article>

    <div class="office-detail-layout">
      <main class="office-detail-main stack-md">
        <article class="office-detail-section stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">简介</span>
              <h3>先看他能不能接住这单</h3>
            </div>
          </div>

          <p class="muted office-detail-copy">{{ page.resumeSummary }}</p>

          <div class="office-detail-signal-grid">
            <article v-for="item in decisionSignals" :key="item.label" class="office-detail-signal-card">
              <span class="office-detail-signal-card__label">{{ item.label }}</span>
              <strong class="office-detail-signal-card__value">{{ item.value }}</strong>
              <p class="office-detail-signal-card__note muted">{{ item.note }}</p>
            </article>
          </div>
        </article>

        <article class="office-detail-section stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">技能</span>
              <h3>核心能力标签</h3>
            </div>
          </div>

          <div v-if="skillTags.length" class="tag-row profile-tag-row">
            <span v-for="tag in skillTags" :key="tag" class="soft-pill">{{ tag }}</span>
          </div>
          <p v-else class="muted">暂无技能标签。</p>
        </article>

        <article class="office-detail-section stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">服务</span>
              <h3>可承接范围</h3>
            </div>
          </div>

          <div v-if="serviceItems.length" class="tag-row profile-tag-row">
            <span v-for="item in serviceItems" :key="item" class="soft-pill">{{ item }}</span>
          </div>
          <p v-else class="muted">暂无可展示的服务项。</p>
        </article>

        <article class="office-detail-section stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">作品</span>
              <h3>直接看产物，而不是看长履历</h3>
            </div>
            <div class="profile-section-meta">
              <span class="soft-pill" v-if="activePortfolio">{{ portfolioTypeLabel(activePortfolio) }}</span>
              <span class="muted">{{ portfolioCounter }}</span>
            </div>
          </div>

          <article v-if="activePortfolio" class="office-detail-work-stage stack-md">
            <button
              v-if="activePortfolio.type !== 'LINK'"
              class="office-detail-work-media"
              type="button"
              @click="openPreview(activePortfolio)"
            >
              <img
                :src="activePortfolio.cover || activePortfolio.mediaUrl"
                :alt="activePortfolio.title"
                class="office-detail-work-media__image"
              />
              <span class="soft-pill office-detail-work-type">{{ portfolioTypeLabel(activePortfolio) }}</span>
              <span class="office-detail-work-preview-note">{{ previewLabel(activePortfolio) }}</span>
            </button>

            <div v-else class="office-detail-work-link-preview">
              <img
                v-if="activePortfolio.cover"
                :src="activePortfolio.cover"
                :alt="activePortfolio.title"
                class="office-detail-work-link-image"
              />
              <span class="soft-pill office-detail-work-type">{{ portfolioTypeLabel(activePortfolio) }}</span>
              <h4>{{ activePortfolio.title }}</h4>
              <p class="muted">{{ activePortfolio.desc }}</p>
              <button class="button-primary" type="button" @click="openExternalLink(activePortfolio.linkUrl)">
                打开项目链接
              </button>
            </div>

            <div class="stack-sm">
              <div class="title-line">
                <div>
                  <h3>{{ activePortfolio.title }}</h3>
                  <p class="muted">{{ activePortfolio.tag }}</p>
                </div>
              </div>

              <p class="muted">{{ activePortfolio.desc }}</p>

              <div class="work-actions-row">
                <button class="button-secondary" type="button" @click="previousPortfolio">上一个</button>
                <button class="button-secondary" type="button" @click="nextPortfolio">下一个</button>
                <button
                  v-if="activePortfolio.type !== 'LINK'"
                  class="button-primary"
                  type="button"
                  @click="openPreview(activePortfolio)"
                >
                  {{ previewLabel(activePortfolio) }}
                </button>
                <button
                  v-else
                  class="button-primary"
                  type="button"
                  @click="openExternalLink(activePortfolio.linkUrl)"
                >
                  查看项目页面
                </button>
              </div>
            </div>
          </article>

          <div v-if="portfolioItems.length" class="office-detail-thumb-grid">
            <button
              v-for="(item, index) in portfolioItems"
              :key="`${item.title}-${index}`"
              type="button"
              class="office-detail-thumb"
              :class="{ 'is-active': index === portfolioIndex }"
              @click="portfolioIndex = index"
            >
              <span class="soft-pill">{{ portfolioTypeLabel(item) }}</span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.tag }}</small>
            </button>
          </div>
        </article>

        <article class="office-detail-section stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">经验与工作方式</span>
              <h3>进一步看适不适合这类协作</h3>
            </div>
          </div>

          <div class="office-detail-list-grid">
            <article v-if="experienceItems.length" class="office-detail-list-card">
              <span class="eyebrow">经历</span>
              <ul class="summary-list">
                <li v-for="item in experienceItems" :key="`${item.label}-${item.value}`" class="summary-row">
                  <strong>{{ item.label }}</strong>
                  <span class="muted">{{ item.value }}</span>
                </li>
              </ul>
            </article>

            <article v-if="availabilityItems.length" class="office-detail-list-card">
              <span class="eyebrow">可用性</span>
              <ul class="summary-list">
                <li v-for="item in availabilityItems" :key="`${item.label}-${item.value}`" class="summary-row">
                  <strong>{{ item.label }}</strong>
                  <span class="muted">{{ item.value }}</span>
                </li>
              </ul>
            </article>
          </div>

          <article v-if="processItems.length" class="office-detail-list-card">
            <span class="eyebrow">工作方式</span>
            <ul class="summary-list">
              <li v-for="item in processItems" :key="`${item.label}-${item.value}`" class="summary-row">
                <strong>{{ item.label }}</strong>
                <span class="muted">{{ item.value }}</span>
              </li>
            </ul>
          </article>

          <article v-if="reviewItems.length" class="office-detail-list-card">
            <span class="eyebrow">评价</span>
            <div class="office-detail-review-list">
              <div v-for="item in reviewItems" :key="`${item.author}-${item.time}`" class="office-detail-review-card">
                <div class="panel-header">
                  <div>
                    <strong>{{ item.author }}</strong>
                    <p class="muted">{{ item.role }}</p>
                  </div>
                  <span class="soft-pill">{{ item.score }}</span>
                </div>
                <p class="muted">{{ item.content }}</p>
                <span class="muted">{{ item.time }}</span>
              </div>
            </div>
          </article>
        </article>
      </main>

      <aside class="office-detail-side stack-md">
        <article class="office-detail-section stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">决策备忘</span>
              <h3>只留合作时真正会用到的补充信息</h3>
            </div>
          </div>

          <div class="office-detail-mini-grid">
            <article v-for="metric in heroMetrics" :key="metric.label" class="office-detail-mini-card">
              <span class="office-detail-mini-card__label">{{ metric.label }}</span>
              <strong class="office-detail-mini-card__value">{{ metric.value }}</strong>
            </article>
          </div>
        </article>

        <article class="office-detail-section stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">合作入口</span>
              <h3>直接发起沟通或返回人才广场</h3>
            </div>
          </div>

          <div class="office-detail-actions">
            <router-link class="button-secondary" :to="backToMarket">{{ backLabel }}</router-link>
            <button
              v-if="audience === 'enterprise'"
              class="button-primary"
              type="button"
              @click="openCollaborationLauncher"
            >
              {{ conversationLabel }}
            </button>
            <router-link v-else-if="conversationRoute" class="button-primary" :to="conversationRoute">
              {{ conversationLabel }}
            </router-link>
            <button v-else class="button-primary" type="button" disabled>
              {{ conversationLabel }}
            </button>
          </div>
        </article>

        <article class="office-detail-section stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">决策信号</span>
              <h3>合作前最值得看的判断点</h3>
            </div>
          </div>

          <div class="office-detail-signal-grid office-detail-signal-grid--compact">
            <article v-for="item in decisionSignals" :key="item.label" class="office-detail-signal-card">
              <span class="office-detail-signal-card__label">{{ item.label }}</span>
              <strong class="office-detail-signal-card__value">{{ item.value }}</strong>
              <p class="office-detail-signal-card__note muted">{{ item.note }}</p>
            </article>
          </div>
        </article>

        <p v-if="collaborationRestrictionMessage" class="hero-note hero-note--warning">{{ collaborationRestrictionMessage }}</p>
        <p v-if="conversationBlockedMessage" class="hero-note hero-note--warning">{{ conversationBlockedMessage }}</p>
      </aside>
    </div>

    <div v-if="previewItem" class="talent-media-modal" @click.self="closePreview">
      <article class="talent-media-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">作品预览</span>
            <h3>{{ previewItem.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closePreview">关闭</button>
        </div>

        <img
          v-if="previewItem.type === 'IMAGE'"
          :src="previewItem.mediaUrl || previewItem.cover"
          :alt="previewItem.title"
          class="talent-media-frame"
        />

        <video
          v-else-if="previewItem.type === 'VIDEO'"
          class="talent-media-frame talent-media-video"
          controls
          autoplay
          playsinline
          :poster="previewItem.cover"
          :src="previewItem.mediaUrl"
        ></video>

        <p class="muted">{{ previewItem.desc }}</p>
      </article>
    </div>

    <CollaborationEntryModal
      :open="collaborationOpen"
      :mode="collaborationMode"
      :talent="collaborationTalentData"
      :candidates="collaborationCandidates"
      :loading="collaborationLoading"
      :error="collaborationError"
      :busy-task-id="collaborationBusyTaskId"
      @close="closeCollaborationLauncher"
      @load-existing="loadCollaborationCandidates"
      @choose-new="openNewTaskWithTalent"
      @back-to-chooser="collaborationMode = 'chooser'"
      @retry="loadCollaborationCandidates"
      @select-task="startExistingCollaboration"
    />
  </section>

  <section v-else class="page-stack talent-detail-page office-detail-page">
    <article class="office-directory-empty stack-md">
      <span class="eyebrow">人才详情</span>
      <h3>{{ talentDetailLoading ? '正在加载人才资料' : '当前暂时无法读取人才资料' }}</h3>
      <p class="muted">{{ talentDetailLoading ? '正在同步作品、评价和合作建议。' : (talentDetailError || '请稍后再试。') }}</p>
      <div class="toolbar">
        <button class="button-primary" type="button" @click="loadTalent">重新加载</button>
        <router-link class="button-secondary" :to="backToMarket">{{ backLabel }}</router-link>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ActionErrorDialog from '../components/ActionErrorDialog.vue';
import CollaborationEntryModal from '../components/CollaborationEntryModal.vue';
import { getCollaborationCandidates, getTalentDetail, startTaskCollaboration } from '../services/api';
import { useAuthState } from '../stores/auth';
import { tradingRestrictionMessage } from '../utils/tradingAccess';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();
const page = ref(null);
const talentDetailLoading = ref(true);
const talentDetailError = ref('');
const portfolioIndex = ref(0);
const previewItem = ref(null);
const collaborationOpen = ref(false);
const collaborationMode = ref('chooser');
const collaborationCandidates = ref([]);
const collaborationLoading = ref(false);
const collaborationError = ref('');
const collaborationBusyTaskId = ref('');
const collaborationTalent = ref(null);

const audience = computed(() => resolveAudience(route));
const collaborationRestrictionMessage = computed(() => tradingRestrictionMessage(authState.user, 'enterprise'));
const collaborationBlocked = computed(() => Boolean(collaborationRestrictionMessage.value));
const backToMarket = computed(() => {
  if (audience.value === 'talent') {
    return roleRouteMap.talent.home;
  }
  const query = {};
  if (route.query.from) {
    query.from = String(route.query.from);
  }
  if (route.query.filter) {
    query.filter = String(route.query.filter);
  }
  return {
    path: roleRouteMap.enterprise.market,
    query
  };
});
const backLabel = computed(() => (audience.value === 'talent' ? '返回人才端首页' : '返回人才广场'));
const taskContextId = computed(() => {
  const value = route.query?.taskId;
  return typeof value === 'string' ? value.trim() : '';
});
const conversationRoute = computed(() => {
  if (audience.value === 'enterprise') {
    return null;
  }
  const taskId = taskContextId.value;
  if (!taskId) {
    return null;
  }
  const query = {
    taskId,
    from: 'talent-detail'
  };
  if (page.value?.platformUserId) {
    query.counterpartPlatformUserId = String(page.value.platformUserId);
  }
  if (page.value?.name) {
    query.counterpartName = String(page.value.name);
  }
  if (page.value?.slug) {
    query.talentSlug = String(page.value.slug);
  }
  return {
    path: roleRouteMap.talent.messages,
    query
  };
});
const conversationBlockedMessage = computed(() =>
  audience.value === 'talent' && !taskContextId.value
    ? '聊天入口需要 taskId 上下文，请从任务详情、通知或审批入口进入。'
    : ''
);
const avatarMonogram = computed(() => {
  const name = page.value?.name || '';
  return name.slice(0, 2) || 'AI';
});
const decisionTags = computed(() => (page.value?.headlineTags || []).slice(0, 3));
const reviewItems = computed(() => (page.value?.reviews || []).slice(0, 2));
const portfolioItems = computed(() => page.value?.portfolio || []);
const experienceItems = computed(() => page.value?.experience || []);
const serviceItems = computed(() => Array.isArray(page.value?.services) ? page.value.services : []);
const availabilityItems = computed(() => Array.isArray(page.value?.availability) ? page.value.availability : []);
const processItems = computed(() => Array.isArray(page.value?.process) ? page.value.process : []);
const skillTags = computed(() => {
  const skills = Array.isArray(page.value?.skills) ? page.value.skills : [];
  if (skills.length) {
    return skills;
  }
  return Array.isArray(page.value?.headlineTags) ? page.value.headlineTags : [];
});
const activePortfolio = computed(() => portfolioItems.value[portfolioIndex.value] || null);
const portfolioCounter = computed(() =>
  portfolioItems.value.length ? `${portfolioIndex.value + 1} / ${portfolioItems.value.length}` : '暂无作品'
);
const decision = computed(() => {
  const score = Number.parseFloat(String(page.value?.score || '').replace(/[^\d.]/g, '')) || 0;
  const completion = Number.parseFloat(String(page.value?.completionRate || '').replace(/[^\d.]/g, '')) || 0;
  const response = Number.parseFloat(String(page.value?.responseTime || '').replace(/[^\d.]/g, '')) || 0;
  const highConfidence = score >= 4.9 && completion >= 96 && response <= 12;
  const strongMatch = score >= 4.8 && completion >= 94;

  let tone = 'caution';
  let badge = '建议补充验证';
  let headline = '先补齐关键信号，再决定是否推进';
  let summary = '当前信息更适合做初筛，建议先补一轮作品、协作边界或试做结果。';
  let nextStep = audience.value === 'talent'
    ? '先继续查看聊天，把这位合作对象纳入候选沟通。'
    : '先发起聊天，确认需求边界和排期，再决定是否推进。';

  if (highConfidence) {
    tone = 'positive';
    badge = '建议优先推进';
    headline = '适合尽快进入合作沟通';
    summary = '评分、完工率和响应速度都比较稳，适合直接进入需求确认和排期沟通。';
    nextStep = audience.value === 'talent'
      ? '可以继续把它放进优先沟通列表，先确认合作范围。'
      : '可以直接发起聊天，先确认需求范围和时间表。';
  } else if (strongMatch) {
    tone = 'neutral';
    badge = '可以进入下一轮';
    headline = '基础表现不错，适合继续沟通';
    summary = '整体表现是稳的，但最好先把合作范围、里程碑和协作节奏再确认一次。';
    nextStep = audience.value === 'talent'
      ? '继续查看聊天，优先确认版本边界和节奏。'
      : '先进入聊天，把交付边界和排期对齐。';
  }

  return {
    tone,
    badge,
    headline,
    summary,
    nextStep,
    note: page.value?.platformResults?.summary || page.value?.resumeSummary || '用评分、完工率、响应速度和作品样本一起判断是否推进。',
    metrics: [
      { label: '评分', value: page.value?.score || '暂无' },
      { label: '完工率', value: page.value?.completionRate || '暂无' },
      { label: '响应', value: page.value?.responseTime || '暂无' }
    ]
  };
});
const decisionSignals = computed(() => {
  const platformMetrics = page.value?.platformResults?.metrics || [];
  const platformHighlights = page.value?.platformResults?.highlights || [];

  return [
    {
      label: '交付稳定性',
      value: `${page.value?.score || '暂无'} / ${page.value?.completionRate || '暂无'}`,
      note: platformMetrics[0]?.note || '优先看真实交付与验收完成情况。'
    },
    {
      label: '协作响应',
      value: page.value?.responseTime || '暂无',
      note: platformHighlights[0]?.note || '快节奏沟通会更容易推进下一步。'
    },
    {
      label: '适配场景',
      value: page.value?.services?.[0] || page.value?.specialty || '暂无',
      note: page.value?.resumeSummary || '先看是否匹配当前合作类型。'
    }
  ];
});
const collaborationTalentData = computed(() => collaborationTalent.value || page.value || null);
const conversationLabel = computed(() => (audience.value === 'talent' ? '去沟通' : '发起合作并沟通'));
const heroMetrics = computed(() => [
  { label: '评分', value: page.value?.score || '暂无', note: '平台综合表现' },
  { label: '完工率', value: page.value?.completionRate || '暂无', note: '交付稳定性' },
  { label: '响应', value: page.value?.responseTime || '暂无', note: '沟通反馈速度' },
  { label: '作品', value: `${portfolioItems.value.length} 个`, note: '可继续查看样本' }
]);

async function openCollaborationLauncher() {
  if (!collaborationTalentData.value) {
    return;
  }
  if (page.value?.requestError) {
    collaborationOpen.value = true;
    collaborationMode.value = 'blocked';
    collaborationError.value = page.value.requestError || '当前人才资料同步失败，暂时无法继续发起合作。';
    return;
  }
  collaborationTalent.value = collaborationTalentData.value;
  collaborationOpen.value = true;
  collaborationMode.value = 'existing';
  collaborationCandidates.value = [];
  collaborationError.value = '';
  collaborationLoading.value = false;
  collaborationBusyTaskId.value = '';
  if (collaborationBlocked.value) {
    collaborationMode.value = 'blocked';
    collaborationError.value = collaborationRestrictionMessage.value || '当前账号暂时还不能发起合作。';
    return;
  }
  if (!collaborationTalentData.value?.talentUserId) {
    collaborationMode.value = 'blocked';
    collaborationError.value = '当前人才标识还没准备好，请刷新页面后重试。';
    return;
  }
  await loadCollaborationCandidates();
}

function closeCollaborationLauncher() {
  collaborationOpen.value = false;
  collaborationMode.value = 'chooser';
  collaborationCandidates.value = [];
  collaborationError.value = '';
  collaborationLoading.value = false;
  collaborationBusyTaskId.value = '';
}

function openNewTaskWithTalent() {
  if (!collaborationTalentData.value) {
    collaborationError.value = '当前人才标识还没准备好，暂时无法新建任务。';
    return;
  }
  const targetRoute = roleRouteMap.enterprise.publishWithTalent(collaborationTalentData.value, 'enterprise-detail');
  closeCollaborationLauncher();
  router.push(targetRoute).catch((error) => {
    collaborationOpen.value = true;
    collaborationMode.value = 'chooser';
    collaborationError.value = error instanceof Error ? error.message : '当前暂时无法进入发布任务页。';
  });
}

async function loadCollaborationCandidates() {
  collaborationMode.value = 'existing';
  if (!collaborationTalentData.value?.talentUserId) {
    collaborationError.value = '当前人才标识还没准备好，暂时无法读取可合作任务。';
    collaborationCandidates.value = [];
    return;
  }
  collaborationLoading.value = true;
  collaborationError.value = '';
  try {
    const payload = await getCollaborationCandidates(collaborationTalentData.value.talentUserId);
    collaborationCandidates.value = Array.isArray(payload?.items) ? payload.items : [];
    collaborationError.value = payload?.requestError || '';
  } catch (error) {
    collaborationError.value = error instanceof Error ? error.message : '当前暂时无法读取可合作任务。';
    collaborationCandidates.value = [];
  } finally {
    collaborationLoading.value = false;
  }
}

async function startExistingCollaboration(task) {
  if (!task?.taskId || !collaborationTalentData.value?.talentUserId) {
    collaborationError.value = '当前任务或人才标识不完整，暂时无法开始合作。';
    return;
  }
  collaborationBusyTaskId.value = task.taskId;
  collaborationError.value = '';
  try {
    const result = await startTaskCollaboration(task.taskId, collaborationTalentData.value.talentUserId);
    if (result?.requestError || result?.status === 'FAILED') {
      collaborationError.value = result?.requestError || result?.nextStep || '当前暂时无法开始合作。';
      return;
    }
    const normalizedTaskId = String(result?.taskId || task.taskId || '');
    const normalizedRoomKey = String(result?.roomKey || '');
    if (normalizedTaskId !== task.taskId) {
      collaborationError.value = '协作结果的任务标识不一致，请稍后重试。';
      return;
    }
    if (!normalizedRoomKey) {
      collaborationError.value = result?.nextStep || '企业已确认合作，但聊天房间编号暂未返回，请稍后从会话列表进入。';
      return;
    }
    closeCollaborationLauncher();
    await router.push(result?.nextRoute || roleRouteMap.enterprise.messageRoom(normalizedRoomKey, {
      taskId: task.taskId,
      source: 'detail',
      talentSlug: collaborationTalentData.value?.slug || ''
    }));
  } finally {
    collaborationBusyTaskId.value = '';
  }
}

function portfolioTypeLabel(item) {
  if (!item?.type) {
    return '作品';
  }

  const map = {
    IMAGE: '图片作品',
    VIDEO: '视频作品',
    LINK: '项目链接'
  };

  return map[item.type] || item.type;
}

function previewLabel(item) {
  return item?.type === 'VIDEO' ? '播放作品视频' : '查看大图';
}

function previousPortfolio() {
  if (!portfolioItems.value.length) {
    return;
  }
  portfolioIndex.value =
    (portfolioIndex.value - 1 + portfolioItems.value.length) % portfolioItems.value.length;
}

function nextPortfolio() {
  if (!portfolioItems.value.length) {
    return;
  }
  portfolioIndex.value = (portfolioIndex.value + 1) % portfolioItems.value.length;
}

function openExternalLink(url) {
  if (!url || typeof window === 'undefined') {
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

function openPreview(item) {
  if (!item) {
    return;
  }

  if (item.type === 'LINK') {
    openExternalLink(item.linkUrl);
    return;
  }

  previewItem.value = item;
}

function closePreview() {
  previewItem.value = null;
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closePreview();
  }

  if (!portfolioItems.value.length || previewItem.value) {
    return;
  }

  if (event.key === 'ArrowLeft') {
    previousPortfolio();
  }

  if (event.key === 'ArrowRight') {
    nextPortfolio();
  }
}

async function loadTalent() {
  talentDetailLoading.value = true;
  talentDetailError.value = '';
  try {
    const nextPage = await getTalentDetail(route.params.slug);
    if (!nextPage) {
      throw new Error('人才资料读取失败，请稍后再试。');
    }
    page.value = nextPage;
    talentDetailError.value = nextPage?.requestError || '';
    portfolioIndex.value = 0;
    closePreview();
  } catch (error) {
    page.value = null;
    talentDetailError.value = error instanceof Error ? error.message : '人才资料读取失败，请稍后再试。';
  } finally {
    talentDetailLoading.value = false;
  }
}

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

onMounted(() => {
  loadTalent();
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown);
  }
});

watch(
  () => route.params.slug,
  () => {
    loadTalent();
  }
);

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown);
  }
});
</script>

<style scoped>
.talent-detail-page {
  display: grid;
  gap: 20px;
  color: #dbe4f0;
}

.office-detail-hero,
.office-detail-section,
.office-directory-empty {
  border: 1px solid rgba(121, 155, 255, 0.1);
  background:
    linear-gradient(180deg, rgba(8, 16, 29, 0.96), rgba(6, 11, 21, 0.98)),
    radial-gradient(circle at top right, rgba(76, 201, 255, 0.06), transparent 32%);
  box-shadow: 0 20px 42px rgba(1, 6, 18, 0.16);
}

.office-detail-hero {
  padding: 28px;
  border-radius: 30px;
}

.office-detail-hero-head,
.office-detail-identity,
.office-detail-actions,
.office-detail-mini-grid,
.office-detail-signal-grid,
.office-detail-list-grid {
  display: grid;
  gap: 14px;
}

.office-detail-hero-head {
  grid-template-columns: minmax(0, 1.12fr) minmax(320px, 0.88fr);
  align-items: start;
}

.office-detail-identity {
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 18px;
}

.office-detail-avatar-shell :is(.profile-avatar) {
  width: 92px;
  height: 92px;
  border-radius: 26px;
  border: 1px solid rgba(121, 155, 255, 0.18);
  background: rgba(4, 9, 17, 0.92);
}

.office-detail-identity-copy h1 {
  margin: 0;
  font-size: clamp(34px, 4vw, 50px);
  letter-spacing: -0.05em;
}

.office-detail-identity-copy .profile-role,
.office-detail-copy,
.office-detail-decision__copy,
.office-detail-hero-fact__note,
.office-detail-signal-card__note,
.office-detail-list-card .muted,
.office-detail-review-card .muted,
.office-detail-work-link-preview .muted {
  margin: 0;
  line-height: 1.8;
  color: #91a2b8;
}

.office-detail-hero-side,
.office-detail-decision,
.office-detail-section,
.office-detail-list-card,
.office-detail-work-link-preview,
.office-detail-work-stage,
.office-detail-thumb,
.office-detail-review-card,
.office-detail-mini-card,
.office-detail-signal-card,
.office-detail-hero-fact {
  display: grid;
  gap: 12px;
  border-radius: 22px;
  border: 1px solid rgba(121, 155, 255, 0.08);
  background: rgba(4, 9, 17, 0.72);
}

.office-detail-hero-side,
.office-detail-decision,
.office-detail-section,
.office-detail-list-card,
.office-detail-work-link-preview,
.office-detail-work-stage,
.office-detail-review-card {
  padding: 18px;
}

.office-detail-hero-facts,
.office-detail-mini-grid,
.office-detail-signal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.office-detail-hero-fact,
.office-detail-mini-card,
.office-detail-signal-card {
  padding: 14px;
  border-radius: 18px;
}

.office-detail-hero-fact__label,
.office-detail-mini-card__label,
.office-detail-signal-card__label {
  color: #91a2b8;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.office-detail-hero-fact__value,
.office-detail-mini-card__value,
.office-detail-signal-card__value {
  font-size: 18px;
  letter-spacing: -0.03em;
  color: #f2f7fd;
}

.office-detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
  gap: 20px;
  align-items: start;
}

.office-detail-main,
.office-detail-side {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.office-detail-side {
  position: sticky;
  top: 96px;
}

.office-detail-section {
  padding: 18px;
  border-radius: 24px;
}

.office-detail-list-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.office-detail-list-card {
  padding: 16px;
}

.summary-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.summary-row {
  display: grid;
  gap: 4px;
}

.office-detail-thumb-grid,
.office-detail-review-list {
  display: grid;
  gap: 12px;
}

.office-detail-thumb {
  text-align: left;
  padding: 14px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.office-detail-thumb:hover {
  transform: translateY(-1px);
}

.office-detail-thumb.is-active {
  border-color: rgba(96, 150, 255, 0.34);
  box-shadow: inset 0 0 0 1px rgba(96, 150, 255, 0.14);
}

.office-detail-work-stage,
.office-detail-work-link-preview {
  gap: 14px;
}

.office-detail-work-media,
.office-detail-work-link-image {
  width: 100%;
  border: 0;
  border-radius: 18px;
  background: #09111c;
}

.office-detail-work-media {
  padding: 0;
  overflow: hidden;
  position: relative;
}

.office-detail-work-media__image,
.office-detail-work-link-image {
  display: block;
  width: 100%;
  height: auto;
}

.office-detail-work-preview-note,
.office-detail-work-type {
  position: absolute;
  left: 14px;
}

.office-detail-work-type {
  top: 14px;
}

.office-detail-work-preview-note {
  bottom: 14px;
}

.office-detail-work-link-preview :is(h4, p) {
  margin: 0;
}

.office-detail-signal-grid--compact {
  grid-template-columns: 1fr;
}

.office-detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
}

.office-detail-hero-fact__value,
.office-detail-mini-card__value,
.office-detail-signal-card__value,
.office-detail-decision h3,
.office-detail-section h3,
.office-detail-work-link-preview h4,
.office-detail-thumb strong,
.office-detail-review-card strong,
.office-directory-empty h3 {
  margin: 0;
  color: #f2f7fd;
}

.office-detail-decision__copy,
.office-detail-work-link-preview p,
.office-detail-thumb small,
.office-detail-review-card p,
.office-detail-list-card p,
.office-detail-signal-card p {
  line-height: 1.8;
}

.talent-media-modal {
  position: fixed;
  inset: 0;
  background: rgba(13, 22, 35, 0.72);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 20px;
}

.talent-media-card {
  width: min(860px, 100%);
  max-height: calc(100vh - 40px);
  overflow: auto;
}

.talent-media-frame {
  width: 100%;
  border-radius: 22px;
  background: #101826;
  max-height: 72vh;
  object-fit: contain;
}

.talent-media-video {
  min-height: 300px;
}

@media (max-width: 1180px) {
  .office-detail-hero-head,
  .office-detail-layout,
  .office-detail-list-grid {
    grid-template-columns: 1fr;
  }

  .office-detail-side {
    position: static;
  }
}

@media (max-width: 720px) {
  .office-detail-identity,
  .office-detail-actions,
  .office-detail-hero-facts,
  .office-detail-mini-grid,
  .office-detail-signal-grid {
    grid-template-columns: 1fr;
  }

  .office-detail-hero,
  .office-detail-section,
  .office-detail-side,
  .office-detail-decision,
  .office-detail-list-card,
  .office-detail-work-stage,
  .office-detail-work-link-preview,
  .office-detail-review-card,
  .talent-media-card,
  .office-directory-empty {
    padding: 16px;
  }
}
</style>
