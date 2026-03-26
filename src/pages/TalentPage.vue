<template>
  <section class="page-stack dashboard-page" v-if="page">
    <article v-if="attentionItems.length" class="glass-panel stack-sm dashboard-attention-card dashboard-alert-card">
      <div class="dashboard-attention-header">
        <div>
          <span class="eyebrow">优先处理</span>
          <h3>待办提醒</h3>
        </div>
        <p class="muted">{{ page.attentionHeadline }}</p>
      </div>

      <div class="dashboard-attention-list">
        <router-link
          v-for="item in attentionItems"
          :key="item.id"
          class="dashboard-attention-item"
          :to="item.route"
        >
          <span class="dashboard-attention-dot"></span>
          <span class="dashboard-attention-label">{{ item.label }}</span>
          <span class="dashboard-attention-count">{{ item.count }}</span>
        </router-link>
      </div>
    </article>

    <article class="hero-card dashboard-hero stack-md">
      <span class="eyebrow">人才端工作台</span>
      <h1 class="dashboard-title">{{ page.hero.name }} 的工作台总览</h1>
      <p class="hero-lead dashboard-lead">
        这里先看接单状态、当前任务和关键入口。任务广场、项目消息、协作进度、对外简历和档期详情，都放到各自模块里处理，不在工作台里堆完整内容。
      </p>

      <div class="dashboard-hero-actions">
        <router-link class="button-primary" :to="roleRouteMap.talent.messages">去聊天</router-link>
        <router-link class="button-secondary" :to="roleRouteMap.talent.market">查看任务广场</router-link>
        <router-link class="button-secondary" :to="roleRouteMap.talent.profile('chen-yining')">查看对外简历</router-link>
      </div>
    </article>

    <article class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">总览</span>
          <h3>当前人才端的关键状态</h3>
        </div>
        <span class="soft-pill">{{ page.hero.availability }}</span>
      </div>

      <section class="metric-grid dashboard-metric-grid">
        <MetricCard
          v-for="item in summaryMetrics"
          :key="item.label"
          :label="item.label"
          :value="item.value"
          :note="item.note"
        />
      </section>

      <p class="muted">
        当前人才端最常用的就是聊天、看任务、看进度和看档期。工作台只负责把这几个入口放清楚，具体细节都放到对应页面里处理。
      </p>

      <div class="tag-row">
        <span v-for="item in summaryChips" :key="item" class="soft-pill">{{ item }}</span>
      </div>
    </article>

    <section class="dashboard-module-list">
      <article v-for="module in modules" :key="module.id" class="glass-panel dashboard-module-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">{{ module.eyebrow }}</span>
            <h3>{{ module.title }}</h3>
          </div>
          <span class="soft-pill">{{ module.status }}</span>
        </div>

        <p class="muted">{{ module.description }}</p>

        <div class="tag-row">
          <span v-for="item in module.badges" :key="item" class="tag-pill tag-pill-muted">{{ item }}</span>
        </div>

        <div class="dashboard-preview-list">
          <div v-for="item in module.preview" :key="item" class="dashboard-preview-item">
            <span class="status-dot"></span>
            <p class="muted">{{ item }}</p>
          </div>
        </div>

        <div class="dashboard-module-actions">
          <router-link v-if="module.route" class="button-primary" :to="module.route">
            {{ module.actionLabel }}
          </router-link>
          <button v-else class="button-primary" type="button" @click="openModule(module)">
            {{ module.actionLabel }}
          </button>
          <button class="button-secondary" type="button" @click="openModule(module)">查看摘要</button>
        </div>
      </article>
    </section>

    <div v-if="activeModule" class="dashboard-detail-modal" @click.self="closeModule">
      <article class="dashboard-detail-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">{{ activeModule.eyebrow }}</span>
            <h3>{{ activeModule.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeModule">关闭</button>
        </div>

        <p class="muted">{{ activeModule.description }}</p>

        <div class="tag-row">
          <span v-for="item in activeModule.badges" :key="item" class="soft-pill">{{ item }}</span>
        </div>

        <div class="dashboard-detail-section">
          <h4>模块摘要</h4>
          <ul class="dashboard-detail-list">
            <li v-for="item in activeModule.details" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div class="dashboard-module-actions">
          <router-link v-if="activeModule.route" class="button-primary" :to="activeModule.route" @click="closeModule">
            {{ activeModule.actionLabel }}
          </router-link>
          <button v-else class="button-primary" type="button" @click="closeModule">已了解</button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import MetricCard from '../components/MetricCard.vue';
import { getTalentData } from '../services/api';
import { roleRouteMap } from '../utils/roleRoutes';

const page = ref(null);
const activeModule = ref(null);
let dashboardRefreshTimer = null;

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function joinText(value, separator = ' / ') {
  const items = listOf(value).filter(Boolean);
  return items.length ? items.join(separator) : '标签待补充';
}

const summaryMetrics = computed(() => {
  if (!page.value) {
    return [];
  }

  const openDays = page.value.calendar.filter((item) => item.state === 'open').length;

  return [
    {
      label: '综合评分',
      value: page.value.hero.score,
      note: '平台会结合评价、完工率和协作稳定性生成公开画像。'
    },
    {
      label: '本月收入',
      value: page.value.hero.income,
      note: '收入会持续沉淀为个人品牌和接单背书。'
    },
    {
      label: '开放档期',
      value: `${openDays} 天`,
      note: '根据当前日历状态自动统计本周剩余可接单时间。'
    },
    {
      label: '进行中任务',
      value: `${page.value.activeTasks.length} 个`,
      note: '真正的进度详情放到协作空间查看。'
    }
  ];
});

const summaryChips = computed(() => {
  if (!page.value) {
    return [];
  }

  return [
    `任务广场 ${page.value.marketplace.length} 个真实任务`,
    page.value.pendingConfirmations?.length
      ? `待确认任务 ${page.value.pendingConfirmations.length} 个`
      : `未读沟通 ${page.value.messages.length} 条摘要`,
    page.value.latestDeliveryGrade?.grade
      ? `最近企业评级 ${page.value.latestDeliveryGrade.grade} 级${page.value.latestDeliveryGrade.payoutRatio ? ` · ${page.value.latestDeliveryGrade.payoutRatio}` : ''}`
      : '',
    page.value.evaluations?.length ? `最近评价 ${page.value.evaluations[0]}` : '完善资料后会逐步沉淀评价'
  ].filter(Boolean);
});

const attentionItems = computed(() => listOf(page.value?.attentionItems));

const modules = computed(() => {
  if (!page.value) {
    return [];
  }

  return [
    {
      id: 'messages',
      eyebrow: '聊天',
      title: '所有项目聊天都从这里进入',
      status: page.value.pendingConfirmations?.length ? '有任务待确认' : '有新消息待查看',
      description: page.value.pendingConfirmations?.length
        ? '企业刚选择你进入合作，先去聊天页确认任务范围、工期和交付边界；如果不合理，也可以直接提出修改。'
        : '接单后围绕具体任务聊天、回附件、看 AI 沟通纪要，都直接在聊天页处理，不需要先去别的模块找。',
      badges: ['即时聊天', '附件同步', '沟通纪要'],
      preview: page.value.messages.length
        ? page.value.messages.map(
            (message) => `${message.time} · ${message.from}：${message.text}`
          )
        : ['当前还没有聊天记录，企业选中你之后会从这里进入任务确认。'],
      details: page.value.messages.length
        ? page.value.messages.map(
            (message) => `${message.time} · ${message.from}：${message.text}`
          )
        : ['聊天房间会按最新消息自动排序，新的协商任务也会在这里提醒。'],
      route: roleRouteMap.talent.messages,
      actionLabel: '进入聊天页'
    },
    {
      id: 'profile',
      eyebrow: '对外简历',
      title: '维护你的公开人才详情页',
      status: '公开展示中',
      description: '你的头像、履历、作品、平台结果和评价都应该沉淀在对外简历页，不在工作台里完整展开。',
      badges: ['头像与履历', '作品沉淀', '平台评价'],
      preview: [
        `技能标签：${joinText(listOf(page.value.skills).slice(0, 3))}`,
        `代表作品：${page.value.portfolio[0]?.title}`,
        `对外状态：可供企业端查看与比较`
      ],
      details: [
        ...listOf(page.value.skills).map((skill) => `技能：${skill}`),
        ...listOf(page.value.portfolio).map((item) => `作品：${item.title} - ${item.desc}`)
      ],
      route: roleRouteMap.talent.profile('chen-yining'),
      actionLabel: '查看对外简历'
    },
    {
      id: 'market',
      eyebrow: '任务广场',
      title: '主动看任务，判断值不值得接',
      status: page.value.marketplace.length ? `推荐 ${page.value.marketplace.length} 个` : '暂无任务',
      description: '任务广场会按匹配度、预算和周期展示推荐项目，工作台这里只保留入口和最近摘要。',
      badges: ['匹配度', '预算周期', '主动接单'],
      preview: page.value.marketplace.length
        ? page.value.marketplace.map(
            (task) => `${task.title} · 匹配 ${task.match} · ${task.budget}`
          )
        : ['企业发布真实任务后，会在这里按时间和状态展示。'],
      details: page.value.marketplace.length
        ? page.value.marketplace.map(
            (task) => `${task.title}：${task.period}，${task.budget}，标签 ${joinText(task.tags)}`
          )
        : ['当前还没有可浏览任务。企业发布后，任务广场会自动更新。'],
      route: roleRouteMap.talent.market,
      actionLabel: '进入任务广场'
    },
    {
      id: 'workspace',
      eyebrow: '任务进度',
      title: '进行中任务和交付进度统一到协作空间',
      status: `${page.value.activeTasks.length} 个任务进行中`,
      description: '真正的任务进度、里程碑和上传记录都在协作空间里看，工作台只保留项目摘要。',
      badges: ['里程碑', '上传进度', '验收前准备'],
      preview: page.value.activeTasks.length
        ? page.value.activeTasks.map(
            (task) => `${task.title} · 进度 ${task.progress}`
          )
        : ['当前还没有进行中的真实项目。'],
      details: page.value.activeTasks.length
        ? page.value.activeTasks.map(
            (task) => `${task.title}：${task.note}（当前进度 ${task.progress}）`
          )
        : ['当你确认任务后，进度和里程碑会在这里同步。'],
      route: roleRouteMap.talent.workspace,
      actionLabel: '查看任务进度'
    },
    {
      id: 'calendar',
      eyebrow: '档期与评价',
      title: '接单日历、收入与评价集中看摘要',
      status: page.value.hero.availability,
      description: '档期、收入和评价都是经营个人品牌的重要部分，但不适合在工作台里展开成大块内容。',
      badges: ['接单日历', '收入沉淀', '历史评价'],
      preview: [
        ...page.value.calendar.slice(0, 3).map((item) => `${item.day} · ${item.note}`),
        page.value.evaluations?.length ? `最近评价：${page.value.evaluations[0]}` : '最近评价：暂无'
      ],
      details: [
        ...page.value.calendar.map((item) => `${item.day}：${item.note}`),
        `本月收入：${page.value.hero.income}`,
        ...(page.value.evaluations || []).map((item) => `评价：${item}`)
      ],
      route: '',
      actionLabel: '查看摘要'
    }
  ];
});

function openModule(module) {
  activeModule.value = module;
}

function closeModule() {
  activeModule.value = null;
}

async function loadPage() {
  page.value = await getTalentData();
}

onMounted(async () => {
  await loadPage();
  if (typeof window !== 'undefined') {
    dashboardRefreshTimer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      void loadPage();
    }, 6000);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && dashboardRefreshTimer) {
    window.clearInterval(dashboardRefreshTimer);
  }
});
</script>
