<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card hero-showcase portal-hero">
      <div class="hero-topbar">
        <div class="hero-brandbar">
          <span class="hero-brandmark">有轻工</span>
          <span class="hero-brandcopy">AI 人才协作平台</span>
        </div>

        <div class="action-row">
          <router-link class="button-secondary" :to="roleRouteMap.portal.talentEntry">人才端入口</router-link>
          <router-link class="button-primary" :to="roleRouteMap.portal.enterpriseEntry">企业端入口</router-link>
        </div>
      </div>

      <div class="portal-hero-grid">
        <div class="stack-lg">
          <p class="hero-kicker">让需求被快速理解，让合作被清楚推进</p>
          <h1 class="hero-display">先选角色入口，再进入属于你的业务端。</h1>
          <p class="hero-lead hero-lead-strong">
            首页是官网和入口页，负责介绍平台价值、展示案例、提供联系方式和分流角色。真正的业务功能会分别进入企业端和人才端，避免把两类用户的路径混在一起。
          </p>

          <div class="signal-grid">
            <span v-for="badge in page.badges" :key="badge" class="signal-chip">{{ badge }}</span>
          </div>

          <div class="stack-sm">
            <div v-for="note in page.entryNotes" :key="note" class="list-row list-row-tight">
              <p class="muted">{{ note }}</p>
            </div>
          </div>
        </div>

        <div class="portal-entry-stack">
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
      </div>

      <div class="hero-stats-bar">
        <article v-for="item in page.metrics" :key="item.label" class="hero-stat">
          <span class="eyebrow">{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <p>{{ item.note }}</p>
        </article>
      </div>
    </article>

    <section id="features" class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="平台介绍"
          title="不是把人和需求堆在一个列表里，而是把合作流程设计清楚。"
          description="平台先做角色分流，再分别进入企业端和人才端。企业端围绕发布任务、找人才、协作验收；人才端围绕完善资料、看任务、上传进度和沉淀信用。"
        />

        <div class="tri-grid">
          <article v-for="pillar in page.pillars" :key="pillar.title" class="mini-card stack-sm">
            <div class="title-line">
              <span class="status-dot"></span>
              <h3>{{ pillar.title }}</h3>
            </div>
            <p class="muted">{{ pillar.description }}</p>
          </article>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">合作主线</span>
            <h3>同一平台，两条清晰路径。</h3>
          </div>
          <span class="soft-pill">官网只做入口分流</span>
        </div>

        <div class="timeline">
          <div v-for="stage in page.stages" :key="stage.title" class="timeline-item">
            <h4>{{ stage.title }}</h4>
            <p class="muted">{{ stage.note }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="split-grid">
      <article
        v-for="journey in page.journeys"
        :key="journey.title"
        class="glass-panel stack-md"
      >
        <div class="panel-header">
          <div>
            <span class="eyebrow">角色路径</span>
            <h3>{{ journey.title }}</h3>
          </div>
          <router-link class="button-secondary" :to="journey.route">进入查看</router-link>
        </div>

        <div class="timeline">
          <div v-for="step in journey.steps" :key="step" class="timeline-item">
            <h4>业务步骤</h4>
            <p class="muted">{{ step }}</p>
          </div>
        </div>
      </article>
    </section>

    <section id="cases" class="glass-panel stack-md">
      <SectionTitle
        eyebrow="案例"
        title="让不同角色都能看懂平台能解决什么问题。"
        description="企业看的是立项、选人和交付效率；人才看的是任务获取、协作体验和长期品牌沉淀。"
      />

      <div class="tri-grid">
        <article v-for="item in page.cases" :key="item.name" class="case-card stack-md">
          <span class="soft-pill">{{ item.type }}</span>
          <h3>{{ item.name }}</h3>
          <p class="muted">{{ item.summary }}</p>
          <div class="result-card case-result">
            <span class="eyebrow">结果</span>
            <p class="muted">{{ item.result }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="平台记忆点"
          title="科技感不是堆概念，而是让入口、路径和协作节奏都更清楚。"
          description="这版首页收掉了不该直接给用户看的技术表达，把重点放在角色入口、真实案例和联系方式上。"
        />

        <div class="tri-grid">
          <article v-for="item in page.highlights" :key="item.title" class="mini-card stack-sm">
            <h3>{{ item.title }}</h3>
            <p class="muted">{{ item.desc }}</p>
          </article>
        </div>
      </article>

      <article id="contact" class="glass-panel stack-md">
        <SectionTitle
          eyebrow="联系方式"
          title="如果你已经准备好了，就从这里开始沟通。"
          description="首页承担官网职责，所以联系方式和咨询入口应该直接展示在这里，而不是藏在业务页面里。"
        />

        <div class="stack-sm">
          <div v-for="item in page.contacts" :key="item.label" class="contact-card">
            <div>
              <h4>{{ item.label }}</h4>
              <p class="muted">{{ item.note }}</p>
            </div>
            <strong>{{ item.value }}</strong>
          </div>
        </div>

        <div class="action-row">
          <router-link class="button-secondary" :to="roleRouteMap.portal.talentEntry">我是人才</router-link>
          <router-link class="button-primary" :to="roleRouteMap.portal.enterpriseEntry">我是企业</router-link>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import SectionTitle from '../components/SectionTitle.vue';
import { getLandingData } from '../services/api';
import { roleRouteMap } from '../utils/roleRoutes';

const page = ref(null);

onMounted(async () => {
  page.value = await getLandingData();
});
</script>
