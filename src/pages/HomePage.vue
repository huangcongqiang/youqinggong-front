<template>
  <section class="page-stack landing-entry-page" v-if="page">
    <article class="hero-card landing-entry-hero">
      <div class="landing-entry-copy stack-md">
        <span class="entry-kicker">企业发任务 · 人才交付</span>
        <div class="stack-sm">
          <h1 class="landing-entry-title">把需求接成结果。</h1>
          <p class="landing-entry-lead">
            先选身份进入。发布、协作、验收都在同一条闭环里。
          </p>
        </div>
      </div>

      <div class="landing-entry-actions">
        <router-link class="button-primary" :to="primaryHeroRoute">{{ primaryHeroLabel }}</router-link>
        <router-link class="button-secondary" :to="utilityHeroRoute">{{ utilityHeroLabel }}</router-link>
      </div>
      <router-link v-if="!authState.user" class="landing-entry-login-link" :to="buildLoginRoute('enterprise')">
        已有账号，去登录
      </router-link>

      <section id="roles" class="landing-entry-role-grid" aria-label="角色说明">
        <article
          v-for="card in roleCards"
          :key="card.title"
          class="landing-entry-role-card"
        >
          <div class="landing-entry-role-head">
            <strong class="landing-entry-role-label">{{ card.title }}</strong>
            <span class="landing-entry-role-meta">{{ card.meta }}</span>
          </div>
          <p class="landing-entry-role-copy">{{ card.shortDesc }}</p>
          <p v-if="card.points?.length" class="landing-entry-role-note">{{ card.points.slice(0, 2).join(' · ') }}</p>
        </article>
      </section>
    </article>

    <section id="features" class="glass-panel landing-entry-method">
      <div class="landing-entry-section-head stack-sm">
        <span class="entry-kicker">平台方式</span>
        <h2>先选身份，再推进。</h2>
      </div>

      <div class="landing-entry-step-list">
        <article v-for="item in homepageSteps" :key="item.title" class="landing-entry-step">
          <span class="landing-entry-step-index">{{ item.index }}</span>
          <div class="stack-xs">
            <strong>{{ item.title }}</strong>
            <p class="muted">{{ item.note }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="landing-entry-proof-row" aria-label="平台证明">
      <article v-for="item in landingProofSignals" :key="item.label" class="landing-entry-proof-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </article>
    </section>

    <section id="cases" class="glass-panel landing-entry-case" v-if="activeCase">
      <div class="landing-entry-section-head landing-entry-section-head-split">
        <div class="stack-xs">
          <span class="entry-kicker">案例</span>
          <h2>{{ activeCaseAudienceLabel }}的结果</h2>
        </div>

        <div class="entry-segmented" role="tablist" aria-label="切换案例角色">
          <button
            type="button"
            class="entry-segment-button"
            :class="{ 'is-active': caseAudience === 'enterprise' }"
            @click="caseAudience = 'enterprise'"
          >
            企业
          </button>
          <button
            type="button"
            class="entry-segment-button"
            :class="{ 'is-active': caseAudience === 'talent' }"
            @click="caseAudience = 'talent'"
          >
            人才
          </button>
        </div>
      </div>

      <article class="landing-entry-case-card" :style="coverStyle(activeCase)">
        <div class="landing-entry-case-top">
          <span class="soft-pill">{{ activeCase.type }}</span>
          <div class="entry-chip-row">
            <span
              v-for="item in (activeCase.coverStats || []).slice(0, 3)"
              :key="item"
              class="landing-entry-case-stat"
            >
              {{ item }}
            </span>
          </div>
        </div>

        <div class="stack-sm">
          <h3>{{ activeCase.name }}</h3>
          <p class="muted">{{ activeCase.summary || activeCase.coverCaption }}</p>
        </div>

        <div class="landing-entry-case-result">
          <span>结果</span>
          <strong>{{ activeCase.result }}</strong>
        </div>
      </article>

      <div class="landing-entry-case-footer">
        <button class="button-secondary landing-entry-case-nav" type="button" @click="cycleCase(-1)">上一个</button>
        <div class="landing-entry-case-dots">
          <button
            v-for="(item, index) in activeCaseList"
            :key="item.name"
            type="button"
            class="landing-entry-case-dot"
            :class="{ 'is-active': index === activeCaseIndex }"
            :aria-label="`查看 ${item.name}`"
            @click="selectCaseIndex(index)"
          />
        </div>
        <button class="button-secondary landing-entry-case-nav" type="button" @click="cycleCase(1)">下一个</button>
      </div>
    </section>

    <section id="contact" class="glass-panel landing-entry-contact">
      <div class="landing-entry-section-head stack-sm">
        <span class="entry-kicker">开始入口</span>
        <h2>先注册，资料后补。</h2>
        <p class="muted">企业入驻、人才报名和产品演示都从这里进入。</p>
      </div>

      <div class="landing-entry-contact-list">
        <article v-for="item in compactContacts" :key="item.label" class="landing-entry-contact-card">
          <div class="landing-entry-contact-main">
            <div class="landing-entry-contact-icon">
              <VisualGlyph :name="item.icon" />
            </div>
            <div class="stack-xs">
              <strong>{{ item.label }}</strong>
              <p class="muted">{{ item.note }}</p>
            </div>
          </div>
          <span class="landing-entry-contact-value">{{ item.value }}</span>
        </article>
      </div>

      <div class="landing-entry-contact-actions">
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

const authState = useAuthState();
const page = ref(null);
const enterpriseCaseIndex = ref(0);
const talentCaseIndex = ref(0);
const caseAudience = ref('enterprise');

function buildLoginRoute(audience = 'enterprise') {
  return {
    path: '/auth',
    query: { audience }
  };
}

const primaryHeroRoute = computed(() => {
  if (authState.user) {
    return authState.user.homeRoute || (authState.user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home);
  }
  return roleRouteMap.portal.register('enterprise');
});

const primaryHeroLabel = computed(() => (authState.user ? '进入当前账号' : '企业注册'));
const utilityHeroRoute = computed(() => {
  if (authState.user) {
    return buildLoginRoute(authState.user.audience === 'talent' ? 'enterprise' : 'talent');
  }
  return roleRouteMap.portal.register('talent');
});
const utilityHeroLabel = computed(() => (authState.user ? '切换账号' : '人才注册'));

const compactContacts = computed(() =>
  ((page.value?.contacts && page.value.contacts.length)
    ? page.value.contacts
    : [
        { label: '企业入驻', note: '适合需要发布任务与推进交付的企业。', value: '从企业注册进入' },
        { label: '人才报名', note: '适合需要接任务与沉淀作品的人才。', value: '从人才注册进入' },
        { label: '产品演示', note: '先了解平台闭环与协作方式。', value: '联系产品演示' }
      ]).slice(0, 3).map((item, index) => ({
    ...item,
    icon: ['tower', 'network', 'check'][index] || 'spark'
  }))
);

const landingProofSignals = computed(() => {
  const metrics = (page.value?.metrics || []).slice(0, 3);
  if (metrics.length) {
    return metrics;
  }
  return [
    { label: '发起更快', value: '需求当天进入协作' },
    { label: '过程留痕', value: '节点、版本、验收都可回看' },
    { label: '结果可沉淀', value: '作品、评分和合作记录持续积累' }
  ];
});

const caseGroups = computed(() => page.value?.caseGroups || []);
const enterpriseCases = computed(() => caseGroups.value.find((item) => item.id === 'enterprise')?.items || []);
const talentCases = computed(() => caseGroups.value.find((item) => item.id === 'talent')?.items || []);
const activeCaseList = computed(() => (caseAudience.value === 'enterprise' ? enterpriseCases.value : talentCases.value));
const activeCaseIndex = computed(() => (caseAudience.value === 'enterprise' ? enterpriseCaseIndex.value : talentCaseIndex.value));
const activeCase = computed(() => activeCaseList.value[activeCaseIndex.value] || activeCaseList.value[0] || null);
const activeCaseAudienceLabel = computed(() => (caseAudience.value === 'enterprise' ? '企业' : '人才'));

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
    index: `0${index + 1}`
  }));
});

const roleCards = computed(() =>
  ((page.value?.roleCards && page.value.roleCards.length)
    ? page.value.roleCards
    : [
        { title: '企业端' },
        { title: '人才端' }
      ]).map((card, index) => {
    const audience = index === 0 ? 'enterprise' : 'talent';
    return {
      ...card,
      shortDesc:
        audience === 'enterprise'
          ? '发布任务，快速推进交付。'
          : '接任务，沉淀作品与收入。',
      points:
        audience === 'enterprise'
          ? ['发布需求', '推进交付']
          : ['查看任务', '确认合作'],
      meta:
        audience === 'enterprise'
          ? '适合要发任务的企业'
          : '适合接任务的人才',
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

function coverStyle(item) {
  return {
    backgroundImage: `${item?.coverGradient || 'linear-gradient(135deg, rgba(28, 50, 92, 0.9), rgba(12, 20, 35, 0.94))'}, radial-gradient(circle at top right, rgba(118, 163, 255, 0.18), transparent 28%)`
  };
}

onMounted(async () => {
  page.value = await getLandingData();
});
</script>

<style scoped>
.landing-entry-page {
  gap: 16px;
}

.landing-entry-hero {
  display: grid;
  gap: 16px;
  padding: 20px;
}

.landing-entry-copy {
  max-width: 540px;
}

.landing-entry-title {
  margin: 0;
  color: var(--text-strong);
  font-size: clamp(34px, 10vw, 46px);
  line-height: 0.96;
  letter-spacing: -0.06em;
}

.landing-entry-lead {
  margin: 0;
  max-width: 34ch;
  color: var(--text-soft);
  font-size: 14px;
  line-height: 1.6;
}

.landing-entry-actions,
.landing-entry-contact-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.landing-entry-login-link {
  align-self: flex-start;
  color: var(--text-soft);
  font-size: 13px;
  margin-top: -2px;
}

.landing-entry-role-grid {
  display: grid;
  gap: 10px;
}

.landing-entry-role-card {
  display: grid;
  gap: 8px;
  padding: 14px 15px;
  border-radius: 18px;
  border: 1px solid rgba(120, 190, 255, 0.16);
  background:
    linear-gradient(180deg, rgba(10, 20, 38, 0.88), rgba(13, 24, 44, 0.94)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.07), transparent 42%);
  box-shadow: 0 14px 28px rgba(2, 8, 20, 0.18);
}

.landing-entry-role-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.landing-entry-role-label {
  color: var(--text-strong);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.landing-entry-role-meta {
  color: var(--text-soft);
  font-size: 11px;
  font-weight: 600;
}

.landing-entry-role-copy {
  margin: 0;
  color: var(--text-soft);
  line-height: 1.45;
}

.landing-entry-role-note {
  margin: 0;
  color: var(--text-faint);
  font-size: 11px;
  line-height: 1.45;
}

.landing-entry-proof-row {
  display: grid;
  gap: 8px;
}

.landing-entry-proof-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(7, 14, 27, 0.62);
  border: 1px solid rgba(120, 190, 255, 0.12);
}

.landing-entry-proof-card span {
  color: var(--text-soft);
  font-size: 11px;
}

.landing-entry-proof-card strong {
  color: var(--text-strong);
  font-size: 13px;
  text-align: right;
}

.landing-entry-method,
.landing-entry-case,
.landing-entry-contact {
  display: grid;
  gap: 16px;
}

.landing-entry-section-head h2 {
  margin: 0;
  color: var(--text-strong);
  font-size: 24px;
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.landing-entry-section-head-split {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.landing-entry-step-list {
  display: grid;
  gap: 10px;
}

.landing-entry-step {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  align-items: flex-start;
  padding: 14px;
  border-radius: 18px;
  background: rgba(8, 15, 28, 0.58);
  border: 1px solid rgba(120, 190, 255, 0.12);
}

.landing-entry-step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: 14px;
  background: rgba(12, 28, 54, 0.92);
  color: var(--text-strong);
  font-size: 13px;
  font-weight: 700;
}

.landing-entry-step strong,
.landing-entry-case-card h3,
.landing-entry-contact-card strong {
  color: var(--text-strong);
}

.landing-entry-case-card {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 22px;
  border: 1px solid rgba(120, 190, 255, 0.14);
  background:
    linear-gradient(180deg, rgba(12, 22, 42, 0.92), rgba(8, 15, 28, 0.96)),
    radial-gradient(circle at top right, rgba(57, 196, 255, 0.08), transparent 36%);
}

.landing-entry-case-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.landing-entry-case-card h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.landing-entry-case-result {
  display: grid;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid rgba(120, 190, 255, 0.12);
}

.landing-entry-case-result span {
  color: var(--text-soft);
  font-size: 12px;
}

.landing-entry-case-result strong {
  color: var(--text-strong);
  line-height: 1.6;
}

.landing-entry-case-stat {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(8, 15, 28, 0.62);
  border: 1px solid rgba(120, 190, 255, 0.12);
  color: rgba(235, 245, 255, 0.92);
  font-size: 11px;
}

.landing-entry-case-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.landing-entry-case-nav {
  min-height: 36px;
  padding-inline: 12px;
}

.landing-entry-case-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.landing-entry-case-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: rgba(120, 190, 255, 0.26);
}

.landing-entry-case-dot.is-active {
  width: 22px;
  background: rgba(86, 226, 255, 0.9);
}

.landing-entry-contact-list {
  display: grid;
  gap: 10px;
}

.landing-entry-contact-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(8, 15, 28, 0.56);
  border: 1px solid rgba(120, 190, 255, 0.12);
}

.landing-entry-contact-main {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.landing-entry-contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: rgba(12, 28, 54, 0.92);
  color: var(--text-strong);
}

.landing-entry-contact-value {
  color: var(--text-strong);
  font-size: 14px;
  font-weight: 700;
}

@media (min-width: 720px) {
  .landing-entry-role-grid,
  .landing-entry-proof-row,
  .landing-entry-contact-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .landing-entry-hero {
    padding: 18px;
  }

  .landing-entry-title {
    font-size: 34px;
  }

  .landing-entry-actions,
  .landing-entry-contact-actions {
    flex-direction: column;
  }

  .landing-entry-actions :deep(.button-primary),
  .landing-entry-actions :deep(.button-secondary),
  .landing-entry-contact-actions :deep(.button-primary),
  .landing-entry-contact-actions :deep(.button-secondary) {
    width: 100%;
  }

  .landing-entry-section-head-split,
  .landing-entry-case-top,
  .landing-entry-case-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .landing-entry-case-dots {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
