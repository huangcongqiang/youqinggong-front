<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card hero-showcase portal-hero homepage-compact-hero">
      <div class="hero-topbar">
        <div class="hero-brandbar">
          <span class="hero-brandmark">有轻工</span>
          <span class="hero-brandcopy">AI 人才协作平台</span>
        </div>

        <div class="action-row">
          <a class="button-secondary" href="#cases">查看案例</a>
          <button v-if="!authState.user" class="button-secondary" type="button" @click="openLoginModal('enterprise')">登录</button>
          <router-link class="button-primary" :to="topPrimaryRoute">{{ topPrimaryLabel }}</router-link>
        </div>
      </div>

      <div class="homepage-compact-shell">
        <div class="stack-lg">
          <div class="stack-md">
            <p class="hero-kicker">先把需求说清，再把合作做顺</p>
            <h1 class="hero-display">让企业更快找到人，让人才更快进入协作。</h1>
            <p class="hero-lead hero-lead-compact">
              用更轻的入口页先说明平台价值，再把企业合作与人才接单分别交给各自的业务端完成。
            </p>
          </div>

          <div class="action-row portal-hero-actions">
            <router-link class="button-primary" :to="primaryHeroRoute">{{ primaryHeroLabel }}</router-link>
            <router-link class="button-secondary" :to="secondaryHeroRoute">{{ secondaryHeroLabel }}</router-link>
          </div>

          <div class="signal-grid">
            <span v-for="badge in compactBadges" :key="badge" class="signal-chip">{{ badge }}</span>
          </div>
        </div>

        <div class="homepage-showcase-panel stack-md">
          <div class="homepage-showcase-copy stack-xs">
            <span class="eyebrow">品牌展示</span>
            <h3>围绕任务交付展开，而不是把首页做成说明书。</h3>
            <p class="muted">
              企业端负责发布、选人和推进合作，人才端负责接单、执行和沉淀作品。
            </p>
          </div>

          <div class="portal-role-grid homepage-role-grid">
            <router-link
              v-for="card in roleCards"
              :key="card.title"
              :to="card.route"
              class="portal-entry-card homepage-entry-card"
            >
              <span class="eyebrow">角色入口</span>
              <h3>{{ card.title }}</h3>
              <p class="muted">{{ card.desc }}</p>
              <strong class="portal-entry-cta">{{ card.cta }}</strong>
            </router-link>
          </div>

          <div class="homepage-proof-ribbon">
            <article v-for="item in heroProofs" :key="item.label" class="homepage-proof-card">
              <span class="eyebrow">{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <p>{{ item.note }}</p>
            </article>
          </div>
        </div>
      </div>
    </article>

    <section id="features" class="homepage-editorial-stack">
      <article class="glass-panel stack-md homepage-editorial-panel">
        <div class="section-lead stack-sm">
          <span class="eyebrow">平台方式</span>
          <h2>不是只展示岗位，而是先把合作怎么发生讲清楚。</h2>
          <p class="muted">
            首页只保留最重要的合作逻辑，让企业和人才都能一眼明白平台的运行方式。
          </p>
        </div>

        <div class="homepage-editorial-grid">
          <div class="homepage-editorial-copy stack-md">
            <p class="homepage-editorial-lead">
              从需求整理、人才匹配到协作验收，平台只把真正影响效率的关键环节做深。
            </p>
            <div class="homepage-step-ribbon">
              <article v-for="item in homepageSteps" :key="item.title" class="homepage-step-ribbon-item">
                <span class="portal-stage-index">{{ item.index }}</span>
                <div class="stack-xs">
                  <h3>{{ item.title }}</h3>
                  <p class="muted">{{ item.note }}</p>
                </div>
              </article>
            </div>
          </div>

          <div class="homepage-highlight-grid">
            <article v-for="pillar in compactPillars" :key="pillar.title" class="portal-pillar-card homepage-highlight-card">
              <h3>{{ pillar.title }}</h3>
              <p class="muted">{{ pillar.description }}</p>
            </article>
            <article v-for="item in compactHighlights" :key="item.title" class="homepage-highlight-note">
              <span class="eyebrow">补充说明</span>
              <h3>{{ item.title }}</h3>
              <p class="muted">{{ item.desc }}</p>
            </article>
          </div>
        </div>
      </article>

      <article id="cases" class="glass-panel stack-md portal-case-board homepage-case-board">
        <div class="section-lead stack-sm">
          <span class="eyebrow">案例</span>
          <h2>用更像官网展示的方式，把企业合作与人才成长讲清楚。</h2>
          <p class="muted">
            案例分成企业端与人才端两组，各自独立轮播，先看成果，再决定是否进入。
          </p>
        </div>

        <div class="homepage-carousel-stack">
          <article class="homepage-carousel-shell" v-if="enterpriseCases.length">
            <div class="homepage-carousel-head">
              <div class="stack-xs">
                <span class="eyebrow">企业案例</span>
                <h3>企业如何更快把任务发布、选人和协作跑顺。</h3>
              </div>
              <div class="homepage-carousel-controls">
                <button class="homepage-carousel-button" type="button" @click="cycleCase('enterprise', -1)">上一个</button>
                <button class="homepage-carousel-button" type="button" @click="cycleCase('enterprise', 1)">下一个</button>
              </div>
            </div>

            <article v-if="activeEnterpriseCase" class="homepage-carousel-card">
              <div class="homepage-carousel-media" :style="coverStyle(activeEnterpriseCase)">
                <div class="homepage-carousel-overlay">
                  <span class="soft-pill">{{ activeEnterpriseCase.type }}</span>
                  <div class="stack-xs">
                    <h4>{{ activeEnterpriseCase.coverTitle }}</h4>
                    <p>{{ activeEnterpriseCase.coverCaption }}</p>
                  </div>
                  <div class="homepage-carousel-stats">
                    <span v-for="item in activeEnterpriseCase.coverStats" :key="item" class="homepage-carousel-stat">{{ item }}</span>
                  </div>
                </div>
              </div>

              <div class="homepage-carousel-body stack-sm">
                <h4>{{ activeEnterpriseCase.name }}</h4>
                <p class="muted">{{ activeEnterpriseCase.summary }}</p>
                <div class="portal-case-result">
                  <span class="eyebrow">结果</span>
                  <p class="muted">{{ activeEnterpriseCase.result }}</p>
                </div>
                <div v-if="activeEnterpriseCase.ratingSummary" class="homepage-carousel-rating stack-xs">
                  <span class="soft-pill">{{ activeEnterpriseCase.ratingBadge || '合作评分' }}</span>
                  <p class="muted">{{ activeEnterpriseCase.ratingSummary }}</p>
                </div>
              </div>
            </article>

            <div class="homepage-carousel-dots">
              <button
                v-for="(item, index) in enterpriseCases"
                :key="item.name"
                type="button"
                class="homepage-carousel-dot"
                :class="{ 'is-active': index === enterpriseCaseIndex }"
                :aria-label="`查看 ${item.name}`"
                @click="enterpriseCaseIndex = index"
              />
            </div>
          </article>

          <article class="homepage-carousel-shell" v-if="talentCases.length">
            <div class="homepage-carousel-head">
              <div class="stack-xs">
                <span class="eyebrow">人才案例</span>
                <h3>人才如何通过平台沉淀作品、收入和长期合作。</h3>
              </div>
              <div class="homepage-carousel-controls">
                <button class="homepage-carousel-button" type="button" @click="cycleCase('talent', -1)">上一个</button>
                <button class="homepage-carousel-button" type="button" @click="cycleCase('talent', 1)">下一个</button>
              </div>
            </div>

            <article v-if="activeTalentCase" class="homepage-carousel-card">
              <div class="homepage-carousel-media" :style="coverStyle(activeTalentCase)">
                <div class="homepage-carousel-overlay">
                  <span class="soft-pill">{{ activeTalentCase.type }}</span>
                  <div class="stack-xs">
                    <h4>{{ activeTalentCase.coverTitle }}</h4>
                    <p>{{ activeTalentCase.coverCaption }}</p>
                  </div>
                  <div class="homepage-carousel-stats">
                    <span v-for="item in activeTalentCase.coverStats" :key="item" class="homepage-carousel-stat">{{ item }}</span>
                  </div>
                </div>
              </div>

              <div class="homepage-carousel-body stack-sm">
                <h4>{{ activeTalentCase.name }}</h4>
                <p class="muted">{{ activeTalentCase.summary }}</p>
                <div class="portal-case-result">
                  <span class="eyebrow">结果</span>
                  <p class="muted">{{ activeTalentCase.result }}</p>
                </div>
                <div v-if="activeTalentCase.ratingSummary" class="homepage-carousel-rating stack-xs">
                  <span class="soft-pill">{{ activeTalentCase.ratingBadge || '交付评级' }}</span>
                  <p class="muted">{{ activeTalentCase.ratingSummary }}</p>
                </div>
              </div>
            </article>

            <div class="homepage-carousel-dots">
              <button
                v-for="(item, index) in talentCases"
                :key="item.name"
                type="button"
                class="homepage-carousel-dot"
                :class="{ 'is-active': index === talentCaseIndex }"
                :aria-label="`查看 ${item.name}`"
                @click="talentCaseIndex = index"
              />
            </div>
          </article>
        </div>
      </article>
    </section>

    <section id="contact" class="glass-panel portal-contact-panel homepage-contact-panel">
      <div class="section-lead stack-sm">
        <span class="eyebrow">联系方式</span>
        <h2>准备开始，就从这里进入。</h2>
        <p class="muted">
          支持企业入驻、人才报名、项目咨询和产品演示预约。
        </p>
      </div>

      <div class="portal-contact-list">
        <div v-for="item in compactContacts" :key="item.label" class="contact-card portal-contact-card">
          <div>
            <h4>{{ item.label }}</h4>
            <p class="muted">{{ item.note }}</p>
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
import { useRoute, useRouter } from 'vue-router';
import { getLandingData } from '../services/api';
import { useAuthState } from '../stores/auth';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const authState = useAuthState();
const page = ref(null);
const enterpriseCaseIndex = ref(0);
const talentCaseIndex = ref(0);

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

const topPrimaryRoute = computed(() => {
  if (authState.user) {
    return authState.user.homeRoute || (authState.user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home);
  }
  return roleRouteMap.portal.register('enterprise');
});

const topPrimaryLabel = computed(() => (authState.user ? '进入当前账号' : '立即注册'));

const primaryHeroRoute = computed(() => {
  if (authState.user) {
    return authState.user.homeRoute || (authState.user.audience === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.home);
  }
  return roleRouteMap.portal.register('enterprise');
});

const primaryHeroLabel = computed(() => (authState.user ? '进入当前账号' : '企业注册'));
const secondaryHeroRoute = computed(() => roleRouteMap.portal.register('talent'));
const secondaryHeroLabel = computed(() => (authState.user ? '切换账号' : '人才注册'));

const compactBadges = computed(() => (page.value?.badges || []).slice(0, 4));
const heroProofs = computed(() => (page.value?.metrics || []).slice(0, 3));
const compactPillars = computed(() => (page.value?.pillars || []).slice(0, 3));
const compactHighlights = computed(() => (page.value?.highlights || []).slice(0, 2));
const compactContacts = computed(() => (page.value?.contacts || []).slice(0, 3));
const caseGroups = computed(() => page.value?.caseGroups || []);
const enterpriseCases = computed(
  () => caseGroups.value.find((item) => item.id === 'enterprise')?.items || []
);
const talentCases = computed(
  () => caseGroups.value.find((item) => item.id === 'talent')?.items || []
);
const activeEnterpriseCase = computed(
  () => enterpriseCases.value[enterpriseCaseIndex.value] || enterpriseCases.value[0] || null
);
const activeTalentCase = computed(
  () => talentCases.value[talentCaseIndex.value] || talentCases.value[0] || null
);

const homepageSteps = computed(() =>
  (page.value?.stages || []).slice(0, 4).map((item, index) => ({
    ...item,
    index: `0${index + 1}`
  }))
);

const roleCards = computed(() =>
  (page.value?.roleCards || []).map((card, index) => {
    const audience = index === 0 ? 'enterprise' : 'talent';
    return {
      ...card,
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

function openLoginModal(audience = 'enterprise') {
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      login: '1',
      audience
    },
    hash: route.hash
  });
}

function cycleCase(group, delta) {
  if (group === 'enterprise') {
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
    background: item?.coverGradient ||
      'linear-gradient(135deg, rgba(43, 98, 255, 0.42), rgba(84, 206, 255, 0.26))'
  };
}

onMounted(async () => {
  page.value = await getLandingData();
});
</script>
