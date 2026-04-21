<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card hero-showcase portal-hero homepage-compact-hero">
      <div class="homepage-landing-shell">
        <div class="homepage-hero-main stack-lg">
          <div class="homepage-hero-copy stack-lg">
            <div class="stack-sm homepage-hero-copy-block">
              <p class="hero-kicker">一个入口，一条协作主线</p>
              <h1 class="hero-display">有轻功。</h1>
              <p class="hero-lead hero-lead-compact">一条工作流解决你的任务。</p>
            </div>

            <div class="action-row portal-hero-actions">
              <router-link class="button-primary" :to="primaryHeroRoute">{{ primaryHeroLabel }}</router-link>
              <router-link class="button-secondary" :to="secondaryHeroRoute">{{ secondaryHeroLabel }}</router-link>
            </div>
          </div>

          <div v-if="homepageProofSignals.length" class="homepage-hero-signal-row">
            <article v-for="item in homepageProofSignals" :key="item.label" class="homepage-hero-signal">
              <span class="eyebrow">{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>
        </div>

        <aside class="homepage-hero-side">
          <article class="homepage-hero-side-card stack-md">
            <div class="section-lead stack-xs homepage-hero-side-copy">
              <span class="eyebrow">平台流程</span>
              <h2>快速开始。</h2>
              <p class="muted homepage-hero-side-note">4步完成你的需求。</p>
            </div>

            <div class="homepage-step-strip homepage-step-strip-compact">
              <article v-for="item in homepageSteps" :key="item.title" class="homepage-step-strip-item homepage-step-strip-tile">
                <div class="homepage-step-strip-head">
                  <span class="homepage-step-strip-index">{{ item.index }}</span>
                  <strong>{{ item.title }}</strong>
                </div>
                <span>{{ item.note }}</span>
              </article>
            </div>
          </article>
        </aside>
      </div>
    </article>

    <section id="features" class="homepage-entry-stack">
      <article id="roles" class="glass-panel stack-md homepage-role-shell">
        <div class="homepage-showcase-copy stack-xs">
          <span class="eyebrow">选择入口</span>
          <h2>先选角色，再进入正确的起点。</h2>
        </div>

        <div class="portal-role-grid homepage-role-grid homepage-role-grid-compact">
          <article
            v-for="card in roleCards"
            :key="card.title"
            class="portal-entry-card homepage-entry-card homepage-entry-card-compact"
          >
            <div class="homepage-entry-card-head">
              <span class="soft-pill">角色入口</span>
              <span class="homepage-entry-card-meta">{{ previewRolePoints(card.points).join(' · ') }}</span>
            </div>
            <h3>{{ card.title }}</h3>
            <p class="muted">{{ card.shortDesc }}</p>
          </article>
        </div>
      </article>

      <article id="cases" class="glass-panel stack-md portal-case-board homepage-case-board homepage-case-board-compact">
        <div class="section-lead stack-sm">
          <span class="eyebrow">案例快照</span>
          <h2>看看真实合作是怎样落地的。</h2>
          <p class="muted">
            企业更关注交付结果，人才更关注协作过程和收入沉淀。
          </p>
        </div>

        <div class="homepage-carousel-shell" v-if="activeCaseList.length">
          <div class="homepage-carousel-head">
            <div class="stack-xs">
              <span class="eyebrow">{{ activeCaseAudienceLabel }}</span>
              <h3>{{ activeCaseTitle }}</h3>
            </div>
            <div class="homepage-carousel-controls">
              <button
                class="homepage-carousel-button"
                type="button"
                :class="{ 'is-active': caseAudience === 'enterprise' }"
                @click="caseAudience = 'enterprise'"
              >
                企业
              </button>
              <button
                class="homepage-carousel-button"
                type="button"
                :class="{ 'is-active': caseAudience === 'talent' }"
                @click="caseAudience = 'talent'"
              >
                人才
              </button>
            </div>
          </div>

          <article v-if="activeCase" class="homepage-carousel-card">
            <div class="homepage-carousel-media" :style="coverStyle(activeCase)">
              <div class="homepage-carousel-overlay">
                <span class="soft-pill">{{ translateText(activeCase.type || '') }}</span>
                <div class="stack-xs">
                  <h4>{{ translateText(activeCase.coverTitle || '') }}</h4>
                  <p>{{ translateText(activeCase.coverCaption || '') }}</p>
                </div>
                <div class="homepage-carousel-stats">
              <span v-for="item in activeCase.coverStats" :key="item" class="homepage-carousel-stat">{{ translateText(item) }}</span>
                </div>
              </div>
            </div>

            <div class="homepage-carousel-body stack-sm">
              <h4>{{ translateText(activeCase.name || '') }}</h4>
              <p class="muted">{{ translateText(activeCase.summary || '') }}</p>
              <div class="portal-case-result">
                <span class="eyebrow">合作结果</span>
                <p class="muted">{{ translateText(activeCase.result || '') }}</p>
              </div>
              <div v-if="activeCase.ratingSummary" class="homepage-carousel-rating stack-xs">
                <span class="soft-pill">{{ translateText(activeCase.ratingBadge || '评分摘要') }}</span>
                <p class="muted">{{ translateText(activeCase.ratingSummary || '') }}</p>
              </div>
            </div>
          </article>

          <div class="homepage-carousel-controls">
            <button class="homepage-carousel-button" type="button" @click="cycleCase(-1)">上一个</button>
            <button class="homepage-carousel-button" type="button" @click="cycleCase(1)">下一个</button>
          </div>

          <div class="homepage-carousel-dots">
            <button
              v-for="(item, index) in activeCaseList"
              :key="item.name"
              type="button"
              class="homepage-carousel-dot"
              :class="{ 'is-active': index === activeCaseIndex }"
              :aria-label="`查看案例 ${translateText(item.name || '')}`"
              @click="selectCaseIndex(index)"
            />
          </div>
        </div>
      </article>
    </section>

    <section id="contact" class="glass-panel portal-contact-panel homepage-contact-panel">
      <div class="section-lead stack-sm">
        <span class="eyebrow">开始使用</span>
        <h2>先从正确入口进入。</h2>
        <p class="muted">
          企业注册、人才注册和平台说明都从这里开始。
        </p>
      </div>

      <div class="portal-contact-list">
        <div v-for="item in compactContacts" :key="item.label" class="contact-card portal-contact-card" translate="no">
          <div class="contact-card-main">
            <div class="contact-card-icon">
              <VisualGlyph :name="item.icon" />
            </div>
            <div>
              <h4>{{ item.label }}</h4>
              <p class="muted">{{ item.note }}</p>
            </div>
          </div>
          <strong>{{ item.value }}</strong>
        </div>
      </div>

      <div class="action-row portal-contact-actions">
        <router-link class="button-secondary" :to="roleRouteMap.portal.register('talent')">人才注册</router-link>
        <router-link class="button-primary" :to="roleRouteMap.portal.register('enterprise')">企业注册</router-link>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import VisualGlyph from '../components/VisualGlyph.vue';
import { getLandingData } from '../services/api';
import { useAuthState } from '../stores/auth';
import { roleRouteMap } from '../utils/roleRoutes';
import { translateText } from '../utils/uiLocale';

const authState = useAuthState();
const page = ref(null);
const enterpriseCaseIndex = ref(0);
const talentCaseIndex = ref(0);
const caseAudience = ref('enterprise');

function buildLoginRoute(audience = 'enterprise') {
  return roleRouteMap.portal.login(audience);
}

const primaryHeroRoute = computed(() => {
  if (authState.user) {
    return authState.user.homeRoute || (authState.user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home);
  }
  return roleRouteMap.portal.register('enterprise');
});

const primaryHeroLabel = computed(() => (authState.user ? '进入工作台' : '企业注册'));
const secondaryHeroRoute = computed(() => {
  if (authState.user) {
    return buildLoginRoute(authState.user.audience === 'talent' ? 'enterprise' : 'talent');
  }
  return roleRouteMap.portal.register('talent');
});
const secondaryHeroLabel = computed(() => {
  if (!authState.user) {
    return '人才注册';
  }
  return authState.user.audience === 'talent' ? '切换到企业账号' : '切换到人才账号';
});

const compactContactFallbacks = [
  { label: '商务合作', note: '适合企业入驻、渠道合作、方案咨询。' },
  { label: '人才入驻', note: '适合作品投递、档期同步、入驻咨询。' },
  { label: '微信咨询', note: '适合预约产品演示、沟通需求和获取报价。' }
];
const compactContacts = computed(() =>
  (page.value?.contacts || []).slice(0, 3).map((item, index) => {
    const fallback = compactContactFallbacks[index] || {};
    return {
      ...item,
      label: fallback.label || translateText(item?.label || ''),
      note: fallback.note || translateText(item?.note || ''),
      value: translateText(item?.value || ''),
      icon: ['tower', 'network', 'check'][index] || 'spark'
    };
  })
);
const caseGroups = computed(() => page.value?.caseGroups || []);
const enterpriseCases = computed(
  () => caseGroups.value.find((item) => item.id === 'enterprise')?.items || []
);
const talentCases = computed(
  () => caseGroups.value.find((item) => item.id === 'talent')?.items || []
);
const activeCaseList = computed(() => (caseAudience.value === 'enterprise' ? enterpriseCases.value : talentCases.value));
const activeCaseIndex = computed(() => (caseAudience.value === 'enterprise' ? enterpriseCaseIndex.value : talentCaseIndex.value));
const activeCase = computed(() => activeCaseList.value[activeCaseIndex.value] || activeCaseList.value[0] || null);
const activeCaseTitle = computed(() =>
  caseAudience.value === 'enterprise' ? '看看企业如何更快发起需求、筛选合适人才并推进交付。' : '看看人才如何沉淀作品、收入和长期合作。'
);
const activeCaseAudienceLabel = computed(() => (caseAudience.value === 'enterprise' ? '企业案例快照' : '人才案例快照'));

const homepageSteps = computed(() => {
  const fallbackSteps = [
    { title: '明确需求', note: '先把范围、预算和目标说明清楚' },
    { title: 'AI 梳理', note: '快速形成结构、周期和协作拆解' },
    { title: '匹配人才', note: '确认人选、条款和交付安排' },
    { title: '验收结算', note: '完成验收、结算并沉淀合作记录' }
  ];

  return (page.value?.stages || fallbackSteps).slice(0, 4).map((item, index) => ({
    title: translateText(item?.title || fallbackSteps[index].title),
    note: translateText(item?.note || item?.description || fallbackSteps[index].note),
    index: `0${index + 1}`,
    icon: ['brief', 'spark', 'network', 'medal'][index] || 'spark'
  }));
});

const homepageProofSignals = computed(() =>
  (page.value?.metrics || []).slice(0, 3).map((item) => ({
    ...item,
    label: translateText(item?.label || item?.title || ''),
    value: translateText(String(item?.value ?? item?.count ?? item?.amount ?? item?.total ?? '')),
    note: translateText(item?.note || item?.description || '')
  }))
);

const roleCards = computed(() =>
  (page.value?.roleCards || []).map((card, index) => {
    const audience = index === 0 ? 'enterprise' : 'talent';
    return {
      ...card,
      icon: audience === 'enterprise' ? 'tower' : 'talent',
      title: translateText(card?.title || (audience === 'enterprise' ? '企业端' : '人才端')),
      shortDesc: translateText(
        card?.desc
          || card?.shortDesc
          || (audience === 'enterprise'
            ? '发布任务，推进交付，缩短招聘路径。'
            : '找任务，沉淀证明，持续积累收入。')
      ),
      points:
        (Array.isArray(card?.points) && card.points.length
          ? card.points
          : audience === 'enterprise'
            ? ['发布任务', '筛选人才', '推进交付']
            : ['寻找任务', '确认合作', '积累收入']).map((item) => translateText(item)),
      route: authState.user
        ? authState.user.audience === audience
          ? audience === 'enterprise'
            ? roleRouteMap.enterprise.home
            : roleRouteMap.talent.home
          : buildLoginRoute(audience)
        : roleRouteMap.portal.register(audience),
      cta: authState.user
        ? authState.user.audience === audience
          ? `进入${audience === 'enterprise' ? '企业' : '人才'}工作台`
          : `切换到${audience === 'enterprise' ? '企业' : '人才'}账号`
        : `注册${audience === 'enterprise' ? '企业' : '人才'}账号`
      };
  })
);

function selectCaseIndex(index) {
  if (caseAudience.value === 'enterprise') {
    enterpriseCaseIndex.value = index;
    return;
  }

  talentCaseIndex.value = index;
}

function cycleCase(delta) {
  if (caseAudience.value === 'enterprise') {
    const total = enterpriseCases.value.length;
    if (!total) {
      return;
    }
    enterpriseCaseIndex.value = (enterpriseCaseIndex.value + delta + total) % total;
    return;
  }

  const total = talentCases.value.length;
  if (!total) {
    return;
  }
  talentCaseIndex.value = (talentCaseIndex.value + delta + total) % total;
}

function previewRolePoints(points) {
  return (Array.isArray(points) ? points : []).slice(0, 2);
}

function coverStyle(item) {
  return {
    backgroundImage: `${item?.coverGradient || 'linear-gradient(135deg, rgba(26, 62, 44, 0.92), rgba(13, 22, 17, 0.96))'}, radial-gradient(circle at top right, rgba(122, 177, 91, 0.18), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.04), transparent 42%)`
  };
}

onMounted(async () => {
  page.value = await getLandingData();
});
</script>

<style scoped>
/* codex visual polish */
.homepage-compact-hero {
  padding: 42px;
  border-radius: 36px;
  background: linear-gradient(135deg, rgba(236, 247, 232, 0.96), rgba(255, 255, 255, 0.98));
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.08);
}
.homepage-landing-shell {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) 400px;
  gap: 28px;
  align-items: stretch;
}
.homepage-hero-copy {
  max-width: 760px;
}
.hero-display {
  max-width: 10ch;
  font-size: clamp(48px, 6vw, 76px);
  line-height: 0.92;
  letter-spacing: -0.04em;
}
.hero-lead-compact {
  max-width: 58ch;
}
.portal-hero-actions .button-secondary {
  border-color: transparent;
  background: transparent;
  min-height: auto;
  padding-inline: 0;
  color: #2d5b2f;
}
.homepage-hero-side-card,
.homepage-entry-card-compact,
.homepage-carousel-card,
.portal-contact-panel {
  border-radius: 30px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 22px 54px rgba(15, 23, 42, 0.06);
}
.homepage-step-strip,
.homepage-role-grid-compact,
.portal-contact-list {
  gap: 18px;
}
@media (max-width: 980px) {
  .homepage-landing-shell {
    grid-template-columns: 1fr;
  }
  .hero-display {
    max-width: none;
  }
}
</style>
