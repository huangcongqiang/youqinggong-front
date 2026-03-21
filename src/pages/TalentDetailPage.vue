<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card">
      <SectionTitle
        eyebrow="人才详情"
        :title="`${page.name} · ${page.role}`"
        :description="page.intro"
        tag="h1"
      />

      <div class="chip-row">
        <span class="tag-pill">{{ page.location }}</span>
        <span class="tag-pill">评分 {{ page.score }}</span>
        <span class="tag-pill">完工率 {{ page.completionRate }}</span>
        <span class="tag-pill">平均响应 {{ page.responseTime }}</span>
      </div>
    </article>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="核心专长"
          title="适合什么样的任务"
          description="这里展示的是 B 端在挑选人才时最关心的能力浓度、服务边界与协作习惯。"
        />
        <div class="tag-row">
          <span v-for="tag in page.headlineTags" :key="tag" class="tag-pill">{{ tag }}</span>
        </div>
        <div class="stack-sm">
          <div v-for="item in page.strengths" :key="item" class="mini-card stack-sm">
            <h4>优势</h4>
            <p class="muted">{{ item }}</p>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">合作方式</span>
            <h3>服务范围与档期</h3>
          </div>
          <router-link class="button-secondary" :to="backToMarket">返回上一页</router-link>
        </div>
        <div class="tag-row">
          <span v-for="item in page.services" :key="item" class="soft-pill">{{ item }}</span>
        </div>
        <div class="stack-sm">
          <div v-for="item in page.availability" :key="item" class="mini-card stack-sm">
            <h4>可接入状态</h4>
            <p class="muted">{{ item }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="glass-panel stack-md">
      <SectionTitle
        eyebrow="作品集"
        title="作品比简历更能说明问题。"
        description="这一部分对应你的需求里提到的简介、作品和评价，是招聘方选人时的核心判断区。"
      />
      <div class="tri-grid">
        <article v-for="item in page.portfolio" :key="item.title" class="mini-card stack-sm">
          <span class="soft-pill">{{ item.type }}</span>
          <h3>{{ item.title }}</h3>
          <p class="muted">{{ item.desc }}</p>
        </article>
      </div>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="历史评价"
          title="平台评价沉淀为后续匹配和信用画像。"
          description="评价不仅展示给 B 端看，也会进入系统推荐逻辑。"
        />
        <div class="stack-sm">
          <div v-for="review in page.reviews" :key="`${review.author}-${review.content}`" class="mini-card stack-sm">
            <div class="title-line">
              <span class="status-dot"></span>
              <div>
                <h4>{{ review.author }}</h4>
                <p class="muted">{{ review.role }}</p>
              </div>
            </div>
            <p class="muted">{{ review.content }}</p>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">协作流程</span>
            <h3>适合如何合作</h3>
          </div>
          <router-link class="button-primary" :to="workspaceRoute">查看协作样例</router-link>
        </div>

        <div class="timeline">
          <div v-for="item in page.process" :key="item" class="timeline-item">
            <h4>协作步骤</h4>
            <p class="muted">{{ item }}</p>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import { getTalentDetail } from '../services/api';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const page = ref(null);
const audience = computed(() => resolveAudience(route));
const backToMarket = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.home : roleRouteMap.enterprise.market
);
const workspaceRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace
);

async function loadTalent() {
  page.value = await getTalentDetail(route.params.slug);
}

onMounted(loadTalent);
watch(() => route.params.slug, loadTalent);
</script>
