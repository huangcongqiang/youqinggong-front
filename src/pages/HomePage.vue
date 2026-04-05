<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card hero-showcase portal-hero homepage-compact-hero">
      <div class="homepage-landing-shell">
        <div class="homepage-hero-main stack-lg">
          <div class="homepage-hero-copy stack-lg">
            <div class="stack-sm homepage-hero-copy-block">
              <p class="hero-kicker">从需求到交付，一条线做完</p>
              <h1 class="hero-display">把需求变成结果。</h1>
              <p class="hero-lead hero-lead-compact">
                发布、协作、验收都在一条闭环里。
              </p>
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
              <span class="eyebrow">平台方式</span>
              <h2>发布、协作、验收在一条线。</h2>
              <p class="muted homepage-hero-side-note">先定范围，再推进执行。</p>
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
          <span class="eyebrow">角色入口</span>
          <h2>先看角色，再选入口。</h2>
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
          <span class="eyebrow">案例</span>
          <h2>看真实结果。</h2>
          <p class="muted">
            企业看交付，人才看回报。
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
                <span class="soft-pill">{{ activeCase.type }}</span>
                <div class="stack-xs">
                  <h4>{{ activeCase.coverTitle }}</h4>
                  <p>{{ activeCase.coverCaption }}</p>
                </div>
                <div class="homepage-carousel-stats">
                  <span v-for="item in activeCase.coverStats" :key="item" class="homepage-carousel-stat">{{ item }}</span>
                </div>
              </div>
            </div>

            <div class="homepage-carousel-body stack-sm">
              <h4>{{ activeCase.name }}</h4>
              <p class="muted">{{ activeCase.summary }}</p>
              <div class="portal-case-result">
                <span class="eyebrow">结果</span>
                <p class="muted">{{ activeCase.result }}</p>
              </div>
              <div v-if="activeCase.ratingSummary" class="homepage-carousel-rating stack-xs">
                <span class="soft-pill">{{ activeCase.ratingBadge || '合作评分' }}</span>
                <p class="muted">{{ activeCase.ratingSummary }}</p>
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
              :aria-label="`查看 ${item.name}`"
              @click="selectCaseIndex(index)"
            />
          </div>
        </div>
      </article>
    </section>

    <section id="contact" class="glass-panel portal-contact-panel homepage-contact-panel">
      <div class="section-lead stack-sm">
        <span class="eyebrow">联系方式</span>
        <h2>准备开始，就从这里进入。</h2>
        <p class="muted">
          企业注册、人才注册和平台说明都从这里进入。
        </p>
      </div>

      <div class="portal-contact-list">
        <div v-for="item in compactContacts" :key="item.label" class="contact-card portal-contact-card">
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
import { useRoute } from 'vue-router';
import VisualGlyph from '../components/VisualGlyph.vue';
import { getLandingData } from '../services/api';
import { useAuthState } from '../stores/auth';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const authState = useAuthState();
const page = ref(null);
const enterpriseCaseIndex = ref(0);
const talentCaseIndex = ref(0);
const caseAudience = ref('enterprise');

function buildLoginRoute(audience = 'enterprise') {
  return {
    path: '/',
    query: {
      ...route.query,
      login: '1',
      audience
    }
  };
}

const primaryHeroRoute = computed(() => {
  if (authState.user) {
    return authState.user.homeRoute || (authState.user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home);
  }
  return roleRouteMap.portal.register('enterprise');
});

const primaryHeroLabel = computed(() => (authState.user ? '进入当前账号' : '企业注册'));
const secondaryHeroRoute = computed(() => roleRouteMap.portal.register('talent'));
const secondaryHeroLabel = computed(() => (authState.user ? '切换账号' : '人才注册'));

const compactContacts = computed(() =>
  (page.value?.contacts || []).slice(0, 3).map((item, index) => ({
    ...item,
    icon: ['tower', 'network', 'check'][index] || 'spark'
  }))
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
  caseAudience.value === 'enterprise' ? '企业如何更快发布、选人、推进交付。' : '人才如何沉淀作品、收入和长期合作。'
);
const activeCaseAudienceLabel = computed(() => (caseAudience.value === 'enterprise' ? '企业案例' : '人才案例'));

const homepageSteps = computed(() => {
  const fallbackSteps = [
    { title: '企业发起', note: '输入需求与预算' },
    { title: 'AI 拆解', note: '给出模块与周期' },
    { title: '人才协作', note: '确认版本与交付' },
    { title: '验收评分', note: '留痕并沉淀口碑' }
  ];

  return (page.value?.stages || fallbackSteps).slice(0, 4).map((item, index) => ({
    title: item.title,
    note: item.note || item.description || fallbackSteps[index].note,
    index: `0${index + 1}`,
    icon: ['brief', 'spark', 'network', 'medal'][index] || 'spark'
  }));
});

const homepageProofSignals = computed(() =>
  (page.value?.metrics || []).slice(0, 3)
);

const roleCards = computed(() =>
  (page.value?.roleCards || []).map((card, index) => {
    const audience = index === 0 ? 'enterprise' : 'talent';
    return {
      ...card,
      icon: audience === 'enterprise' ? 'tower' : 'talent',
      shortDesc:
        audience === 'enterprise'
          ? '发布任务，快速推进交付。'
          : '接任务，沉淀作品与收入。',
      points:
        audience === 'enterprise'
          ? ['发布需求', '选择人才']
          : ['查看任务', '确认合作'],
      route: authState.user
        ? authState.user.audience === audience
          ? audience === 'enterprise'
            ? roleRouteMap.enterprise.home
            : roleRouteMap.talent.home
          : buildLoginRoute(audience)
        : roleRouteMap.portal.register(audience),
      cta: authState.user
        ? authState.user.audience === audience
          ? `进入${audience === 'enterprise' ? '企业端' : '人才端'}`
          : `切换到${audience === 'enterprise' ? '企业端' : '人才端'}`
        : `注册${audience === 'enterprise' ? '企业端' : '人才端'}`
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
    backgroundImage: `${item?.coverGradient || 'linear-gradient(135deg, rgba(28, 50, 92, 0.9), rgba(12, 20, 35, 0.94))'}, radial-gradient(circle at top right, rgba(118,163,255,0.18), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.04), transparent 42%)`
  };
}

onMounted(async () => {
  page.value = await getLandingData();
});
</script>
