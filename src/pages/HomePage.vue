<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card hero-showcase portal-hero portal-stage">
      <div class="hero-topbar">
        <div class="hero-brandbar">
          <span class="hero-brandmark">有轻工</span>
          <span class="hero-brandcopy">AI 人才协作平台</span>
        </div>

        <div class="action-row">
          <a class="button-secondary" href="#cases">查看案例</a>
          <router-link class="button-primary" :to="roleRouteMap.portal.enterpriseEntry">企业端入口</router-link>
        </div>
      </div>

      <div class="portal-stage-grid">
        <div class="portal-stage-copy stack-lg">
          <div class="stack-lg">
            <p class="hero-kicker">让需求被快速理解，让合作被清楚推进</p>
            <h1 class="hero-display">把需求变成可交付，把人才变成可协作。</h1>
          </div>

          <p class="hero-lead hero-lead-strong">
            企业端先看人才，人才端先看任务。平台负责把 AI 拆解、协作推进、验收评分和信用沉淀串成一条清晰主线。
          </p>

          <div class="action-row portal-hero-actions">
            <router-link class="button-primary" :to="roleRouteMap.portal.enterpriseEntry">进入企业端</router-link>
            <router-link class="button-secondary" :to="roleRouteMap.portal.talentEntry">进入人才端</router-link>
          </div>

          <div class="signal-grid">
            <span v-for="badge in page.badges" :key="badge" class="signal-chip">{{ badge }}</span>
          </div>

          <div class="portal-note-strip">
            <article
              v-for="(note, index) in page.entryNotes.slice(0, 3)"
              :key="note"
              class="portal-note-card"
            >
              <span class="portal-note-index">0{{ index + 1 }}</span>
              <p>{{ note }}</p>
            </article>
          </div>
        </div>

        <aside class="portal-stage-side">
          <div class="portal-role-grid">
            <router-link
              v-for="card in page.roleCards"
              :key="card.title"
              :to="card.route"
              class="portal-entry-card"
            >
              <span class="eyebrow">角色入口</span>
              <h3>{{ card.title }}</h3>
              <p class="muted">{{ card.desc }}</p>
              <strong class="portal-entry-cta">{{ card.cta }}</strong>
            </router-link>
          </div>

          <div class="portal-stage-panel">
            <div class="panel-header portal-stage-header">
              <div>
                <span class="eyebrow">合作节奏</span>
                <h3>首页做入口，业务在端内展开。</h3>
              </div>
              <span class="soft-pill">两类角色，两条路径</span>
            </div>

            <div class="portal-stage-list">
              <article v-for="(stage, index) in page.stages" :key="stage.title" class="portal-stage-item">
                <span class="portal-stage-index">0{{ index + 1 }}</span>
                <div>
                  <h4>{{ stage.title }}</h4>
                  <p class="muted">{{ stage.note }}</p>
                </div>
              </article>
            </div>
          </div>
        </aside>
      </div>

      <div class="portal-metric-rack">
        <article v-for="item in page.metrics" :key="item.label" class="hero-stat portal-metric-card">
          <span class="eyebrow">{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.note }}</p>
        </article>
      </div>
    </article>

    <section id="features" class="portal-story-grid">
      <article class="glass-panel portal-intent-panel">
        <div class="section-lead stack-md">
          <span class="eyebrow">平台能力</span>
          <h2>不是堆人和任务，而是先把合作结构做清楚。</h2>
          <p class="muted">
            平台先把角色入口分清，再分别服务企业端和人才端。首页负责建立信任和兴趣，真正的动作放到各自业务端里完成。
          </p>
        </div>

        <div class="portal-pillar-grid">
          <article v-for="pillar in page.pillars" :key="pillar.title" class="portal-pillar-card">
            <span class="portal-pillar-glow"></span>
            <h3>{{ pillar.title }}</h3>
            <p class="muted">{{ pillar.description }}</p>
          </article>
        </div>
      </article>

      <article class="glass-panel portal-journey-panel">
        <div class="section-lead stack-md">
          <span class="eyebrow">角色路径</span>
          <h2>同一平台，两条业务路径，各自清楚。</h2>
          <p class="muted">
            企业端围绕发布、选人、协作和验收推进；人才端围绕接单、同步进度、沉淀作品和信用持续累积。
          </p>
        </div>

        <div class="journey-lanes">
          <article
            v-for="journey in page.journeys"
            :key="journey.title"
            class="journey-lane"
          >
            <div class="journey-head">
              <div>
                <h3>{{ journey.title }}</h3>
                <p class="muted">从入口到交付，路径按角色自然展开。</p>
              </div>
              <router-link class="button-secondary" :to="journey.route">进入查看</router-link>
            </div>

            <div class="journey-step-list">
              <article v-for="(step, index) in journey.steps" :key="step" class="journey-step-card">
                <span class="journey-step-index">{{ index + 1 }}</span>
                <p>{{ step }}</p>
              </article>
            </div>
          </article>
        </div>
      </article>
    </section>

    <section id="cases" class="glass-panel portal-case-board">
      <div class="section-lead stack-md portal-case-header">
        <span class="eyebrow">案例</span>
        <h2>先让人一眼看懂平台解决的是真问题，而不是新概念。</h2>
        <p class="muted">
          企业看的是立项效率、选人效率和验收效率；人才看的是接单效率、协作体验和长期品牌沉淀。
        </p>
      </div>

      <div class="portal-case-grid">
        <article v-for="item in page.cases" :key="item.name" class="portal-case-card">
          <div class="title-line">
            <span class="soft-pill">{{ item.type }}</span>
          </div>
          <h3>{{ item.name }}</h3>
          <p class="muted">{{ item.summary }}</p>
          <div class="portal-case-result">
            <span class="eyebrow">结果</span>
            <p class="muted">{{ item.result }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="portal-contact-grid">
      <article class="glass-panel portal-memory-panel">
        <div class="section-lead stack-md">
          <span class="eyebrow">平台记忆点</span>
          <h2>科技感不是堆概念，而是让选择、沟通和交付都更顺。</h2>
          <p class="muted">
            首页不需要把所有功能说完，只需要让人快速建立信任，知道应该去哪个入口、会得到什么结果。
          </p>
        </div>

        <div class="portal-memory-list">
          <article v-for="item in page.highlights" :key="item.title" class="portal-memory-item">
            <h3>{{ item.title }}</h3>
            <p class="muted">{{ item.desc }}</p>
          </article>
        </div>
      </article>

      <article id="contact" class="glass-panel portal-contact-panel">
        <div class="section-lead stack-md">
          <span class="eyebrow">联系方式</span>
          <h2>如果你已经准备好了，就从这里开始沟通。</h2>
          <p class="muted">
            适合企业入驻、人才报名、产品演示、项目咨询和合作报价。
          </p>
        </div>

        <div class="portal-contact-list">
          <div v-for="item in page.contacts" :key="item.label" class="contact-card portal-contact-card">
            <div>
              <h4>{{ item.label }}</h4>
              <p class="muted">{{ item.note }}</p>
            </div>
            <strong>{{ item.value }}</strong>
          </div>
        </div>

        <div class="action-row portal-contact-actions">
          <router-link class="button-secondary" :to="roleRouteMap.portal.talentEntry">我是人才</router-link>
          <router-link class="button-primary" :to="roleRouteMap.portal.enterpriseEntry">我是企业</router-link>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getLandingData } from '../services/api';
import { roleRouteMap } from '../utils/roleRoutes';

const page = ref(null);

onMounted(async () => {
  page.value = await getLandingData();
});
</script>
