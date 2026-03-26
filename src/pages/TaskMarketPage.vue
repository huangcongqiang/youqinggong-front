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
          <button class="button-secondary" type="button" @click="openTaskDetail(task)">查看任务详情</button>
          <router-link class="button-primary" to="/talent/workspace">查看协作样例</router-link>
          <router-link class="button-secondary" to="/talent">回到人才工作台</router-link>
        </div>
      </article>
    </section>

    <div v-if="activeTaskDetail" class="dashboard-detail-modal" @click.self="closeTaskDetail">
      <article class="dashboard-detail-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">{{ activeTaskDetail.company || '任务详情' }}</span>
            <h3>{{ activeTaskDetail.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeTaskDetail">关闭</button>
        </div>

        <div class="tag-row">
          <span class="soft-pill">{{ activeTaskDetail.status || '待处理' }}</span>
          <span class="soft-pill">预算 {{ activeTaskDetail.budget || '未填写预算' }}</span>
          <span class="soft-pill">周期 {{ activeTaskDetail.period || '待确认' }}</span>
        </div>

        <div class="dashboard-detail-section">
          <h4>任务说明</h4>
          <p class="muted">{{ activeTaskDetail.brief || activeTaskDetail.summary || '待补充' }}</p>
        </div>

        <div class="dashboard-detail-dual">
          <div class="mini-card stack-sm">
            <h4>技能标签</h4>
            <div class="tag-row">
              <span v-for="tag in activeTaskDetail.tags || []" :key="tag" class="soft-pill">{{ tag }}</span>
            </div>
          </div>
          <div class="mini-card stack-sm">
            <h4>核心交付件</h4>
            <div class="tag-row">
              <span v-for="item in activeTaskDetail.deliverables || []" :key="item" class="soft-pill">{{ item }}</span>
            </div>
          </div>
        </div>

        <div v-if="activeTaskDetail.modules?.length" class="dashboard-detail-section">
          <h4>AI 拆解模块</h4>
          <ul class="dashboard-detail-list">
            <li v-for="module in activeTaskDetail.modules" :key="module.name || module">{{ module.name || module }}</li>
          </ul>
        </div>

        <div v-if="activeTaskDetail.recommendations?.length" class="dashboard-detail-section">
          <h4>执行建议</h4>
          <ul class="dashboard-detail-list">
            <li v-for="item in activeTaskDetail.recommendations" :key="item">{{ item }}</li>
          </ul>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';
import MetricCard from '../components/MetricCard.vue';
import SectionTitle from '../components/SectionTitle.vue';
import { getTaskMarketplaceData } from '../services/api';

const page = ref(null);
const activeTaskDetail = ref(null);
let marketplaceRefreshTimer = null;

function openTaskDetail(task) {
  activeTaskDetail.value = task?.taskDetail || task || null;
}

function closeTaskDetail() {
  activeTaskDetail.value = null;
}

async function loadPage() {
  page.value = await getTaskMarketplaceData();
}

onMounted(async () => {
  await loadPage();
  if (typeof window !== 'undefined') {
    marketplaceRefreshTimer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      void loadPage();
    }, 6000);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && marketplaceRefreshTimer) {
    window.clearInterval(marketplaceRefreshTimer);
  }
});
</script>
