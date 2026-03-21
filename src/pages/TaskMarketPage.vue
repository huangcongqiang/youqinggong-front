<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card">
      <SectionTitle
        eyebrow="任务广场"
        :title="page.summary.title"
        :description="page.summary.description"
        tag="h1"
      />
      <p class="hero-lead">
        这里面向 C 端人才展示可抢单任务，也承接系统自动推荐结果。每条任务都已经过 AI 拆解和标签化，方便快速判断预算、周期、匹配度和交付范围。
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
      <article v-for="task in page.items" :key="task.id" class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">{{ task.company }}</span>
            <h3>{{ task.title }}</h3>
          </div>
          <div class="toolbar">
            <span class="soft-pill">{{ task.status }}</span>
            <span class="tag-pill">匹配 {{ task.match }}</span>
          </div>
        </div>

        <div class="split-grid">
          <div class="stack-sm">
            <p class="muted">{{ task.summary }}</p>
            <div class="tag-row">
              <span v-for="tag in task.tags" :key="tag" class="soft-pill">{{ tag }}</span>
            </div>
          </div>

          <div class="stack-sm">
            <div class="mini-card stack-sm">
              <h4>预算与周期</h4>
              <p class="muted">{{ task.budget }} · {{ task.period }}</p>
            </div>
            <div class="mini-card stack-sm">
              <h4>核心交付件</h4>
              <div class="tag-row">
                <span v-for="item in task.deliverables" :key="item" class="soft-pill">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="toolbar">
          <router-link class="button-primary" to="/talent/workspace">查看协作样例</router-link>
          <router-link class="button-secondary" to="/talent">回到人才工作台</router-link>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import MetricCard from '../components/MetricCard.vue';
import SectionTitle from '../components/SectionTitle.vue';
import { getTaskMarketplaceData } from '../services/api';

const page = ref(null);

onMounted(async () => {
  page.value = await getTaskMarketplaceData();
});
</script>
