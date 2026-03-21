<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card">
      <SectionTitle
        eyebrow="人才广场"
        :title="page.summary.title"
        :description="page.summary.description"
        tag="h1"
      />
      <p class="hero-lead">
        这里面向企业和个人品牌方展示可合作人才。你可以先看专长、作品、响应速度和档期，再决定是否进一步沟通。
      </p>
      <div class="chip-row">
        <span v-for="filter in page.filters" :key="filter" class="soft-pill">{{ filter }}</span>
      </div>
    </article>

    <section class="metric-grid">
      <MetricCard
        v-for="item in page.metrics"
        :key="item.label"
        :label="item.label"
        :value="item.value"
        :note="item.note"
      />
    </section>

    <section class="stack-md">
      <article v-for="talent in page.items" :key="talent.slug" class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">{{ talent.location }}</span>
            <h3>{{ talent.name }} · {{ talent.role }}</h3>
          </div>
          <div class="toolbar">
            <span class="soft-pill">评分 {{ talent.score }}</span>
            <span class="tag-pill">响应 {{ talent.responseTime }}</span>
          </div>
        </div>

        <div class="split-grid">
          <div class="stack-sm">
            <p class="muted">{{ talent.summary }}</p>
            <div class="tag-row">
              <span v-for="tag in talent.tags" :key="tag" class="soft-pill">{{ tag }}</span>
            </div>
          </div>

          <div class="stack-sm">
            <div class="mini-card stack-sm">
              <h4>近期作品</h4>
              <p class="muted">{{ talent.portfolio }}</p>
            </div>
            <div class="mini-card stack-sm">
              <h4>可合作方式</h4>
              <div class="tag-row">
                <span v-for="item in talent.services" :key="item" class="soft-pill">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="toolbar">
          <router-link class="button-primary" :to="`/enterprise/talents/${talent.slug}`">查看人才详情</router-link>
          <router-link class="button-secondary" to="/enterprise/publish">发布任务</router-link>
          <router-link class="button-secondary" to="/enterprise">返回企业工作台</router-link>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import MetricCard from '../components/MetricCard.vue';
import SectionTitle from '../components/SectionTitle.vue';
import { getTalentMarketplaceData } from '../services/api';

const page = ref(null);

onMounted(async () => {
  page.value = await getTalentMarketplaceData();
});
</script>
