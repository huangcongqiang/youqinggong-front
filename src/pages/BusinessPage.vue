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
      <span class="eyebrow">企业端工作台</span>
      <h1 class="dashboard-title">企业工作台总览</h1>
      <p class="hero-lead dashboard-lead">
        这里先看整体状态、当前重点和模块入口，不在工作台里堆满完整操作。需要处理任务、看人才、看消息或跟进进度时，直接进入对应页面。
      </p>

      <div class="dashboard-hero-actions">
        <router-link class="button-primary" :to="roleRouteMap.enterprise.messages">去聊天</router-link>
        <router-link class="button-secondary" :to="roleRouteMap.enterprise.publish">去发布任务</router-link>
        <router-link class="button-secondary" :to="roleRouteMap.enterprise.market">去看人才广场</router-link>
      </div>

      <div v-if="businessHighlights.length" class="tag-row">
        <span v-for="item in businessHighlights" :key="item" class="soft-pill">{{ item }}</span>
      </div>
    </article>

    <article class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">总览</span>
          <h3>当前企业端的关键状态</h3>
        </div>
      </div>

      <section class="metric-grid dashboard-metric-grid">
        <article v-for="item in page.metrics" :key="item.label" class="metric-card dashboard-stat-card">
          <span class="eyebrow">{{ item.label }}</span>
          <div class="metric-value">{{ item.value }}</div>
          <p>{{ item.note }}</p>
          <div class="dashboard-stat-actions">
            <button class="button-secondary" type="button" @click="openMetric(item)">查看详情</button>
          </div>
        </article>
      </section>
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

    <div v-if="activeMetric" class="dashboard-detail-modal" @click.self="closeMetric">
      <article class="dashboard-detail-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">{{ activeMetric.label }}</span>
            <h3>{{ activeMetric.value }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeMetric">关闭</button>
        </div>

        <p class="muted">{{ activeMetric.note }}</p>

        <div class="dashboard-detail-dual">
          <div class="mini-card stack-sm">
            <h4>待处理事项</h4>
            <ul class="dashboard-detail-list">
              <li v-for="item in activeMetric.todos || []" :key="item">{{ item }}</li>
            </ul>
          </div>

          <div class="mini-card stack-sm">
            <h4>已完成统计</h4>
            <ul class="dashboard-detail-list">
              <li v-for="item in activeMetric.doneStats || []" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <p class="muted">{{ activeMetric.source || '实时统计' }} · 这里展示的是当前企业账号已产生的数据摘要。</p>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { getBusinessData } from '../services/api';
import { roleRouteMap } from '../utils/roleRoutes';

const page = ref(null);
const activeModule = ref(null);
const activeMetric = ref(null);
let dashboardRefreshTimer = null;

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function joinText(value, separator = ' / ') {
  const items = listOf(value).filter(Boolean);
  return items.length ? items.join(separator) : '标签待补充';
}

const modules = computed(() => {
  if (!page.value) {
    return [];
  }

  return [
    {
      id: 'messages',
      eyebrow: '聊天',
      title: '所有项目聊天都从这里进入',
      status: '有新沟通待查看',
      description: '任务一旦选中人才，需求确认、工期协商和交付沟通都直接在聊天页处理，不用在工作台里绕来绕去找入口。',
      badges: ['即时聊天', '沟通纪要', '项目房间'],
      preview: page.value.liveConversation.map(
        (line) => `${line.time} · ${line.author}：${line.text}`
      ),
      details: page.value.liveConversation.map(
        (line) => `${line.time} · ${line.author}：${line.text}`
      ),
      route: roleRouteMap.enterprise.messages,
      actionLabel: '进入聊天页'
    },
    {
      id: 'onboarding',
      eyebrow: '入驻资料',
      title: '企业准入与资料准备',
      status: '待审核材料 4 项',
      description: '这一块只负责看当前企业入驻是否准备齐全，真正的资料填写和补充放到入驻页面或后续工作台补交里处理。',
      badges: ['企业资质', '联系人信息', '合作偏好'],
      preview: [...page.value.onboardingChecklist.slice(0, 2), '若资料没准备齐，可先提交基础信息，后续再补交材料'],
      details: [...page.value.onboardingChecklist, '支持先提交基础信息，后续回企业工作台继续补交材料'],
      route: roleRouteMap.enterprise.onboarding,
      actionLabel: '去完善入驻'
    },
    {
      id: 'publish',
      eyebrow: '发布任务',
      title: '先发布任务，再确认 AI 拆解',
      status: page.value.metrics[1]?.value || '进行中',
      description: '任务发布页会按步骤完成需求输入、AI 拆解、候选人推荐和发布确认，工作台这里只保留入口和摘要。',
      badges: ['语音 / 文字', 'AI 拆解', '工期评估'],
      preview: page.value.contractSummary.length
        ? [
            page.value.sampleBrief ? `最近需求：${page.value.sampleBrief.slice(0, 38)}...` : '最近还没有已发布任务',
            page.value.contractSummary[1] ? `里程碑摘要：${page.value.contractSummary[1]}` : '发布后这里会保留真实工期与范围摘要',
            page.value.contractSummary[2] ? `风险提醒：${page.value.contractSummary[2]}` : 'AI 风险提示会跟着真实任务一起沉淀'
          ]
        : [
            '发布后这里会保留最近任务的需求摘要',
            'AI 会同步生成里程碑和工期建议',
            '推荐人才和聊天协商会从真实任务继续推进'
          ],
      details: page.value.contractSummary.length
        ? [
            '发布任务时先输入需求，AI 会先拆解模块、工期和风险。',
            ...page.value.contractSummary
          ]
        : [
            '当前还没有已发布任务。',
            '去发布任务后，这里会显示真实任务的工期、风险和技能标签。'
          ],
      route: roleRouteMap.enterprise.publish,
      actionLabel: '去发布任务'
    },
    {
      id: 'talents',
      eyebrow: '人才广场',
      title: '先看推荐人才，再去广场补充筛选',
      status: page.value.recommendedTalents.length ? `推荐 ${page.value.recommendedTalents.length} 位` : '暂无推荐',
      description: '系统会先按技能、作品、评分和档期给你候选名单，不满意再进入人才广场继续看。',
      badges: ['技能匹配', '作品判断', '档期参考'],
      preview: page.value.recommendedTalents.length
        ? page.value.recommendedTalents.map(
            (talent) => `${talent.name} · ${talent.role} · 评分 ${talent.score}`
          )
        : ['发布并确认任务后，这里会展示 AI 推荐的人才。'],
      details: page.value.recommendedTalents.length
        ? page.value.recommendedTalents.map(
            (talent) => `${talent.name}：${talent.summary}（${joinText(talent.tags)}）`
          )
        : ['当前还没有针对这家企业的推荐人才。你也可以直接进入人才广场手动筛选。'],
      route: roleRouteMap.enterprise.market,
      actionLabel: '去看人才广场'
    },
    {
      id: 'workspace',
      eyebrow: '项目进度',
      title: '看当前项目进度与协作节点',
      status: page.value.taskBoard[1]?.status || '进行中',
      description: '真正的项目状态、里程碑和进展都在协作空间里查看，工作台只保留项目总览。',
      badges: ['里程碑', '进度同步', '验收前准备'],
      preview: page.value.taskBoard.length
        ? page.value.taskBoard.map((item) => `${item.title} · ${item.status}`)
        : ['当前还没有执行中的项目，选中人才并确认任务后会出现在这里。'],
      details: page.value.taskBoard.length
        ? page.value.taskBoard.map((item) => `${item.title}：${item.note}`)
        : ['协作空间会展示真实项目的里程碑、进度、附件和验收节点。'],
      route: roleRouteMap.enterprise.workspace,
      actionLabel: '查看项目进度'
    }
  ];
});

const businessHighlights = computed(() => {
  if (!page.value) {
    return [];
  }

  const items = [];
  if (page.value.latestTalentRating?.rating) {
    items.push(`最近人才评分 ${page.value.latestTalentRating.rating} 分`);
  }
  if (page.value.latestTalentRating?.content) {
    const summary = String(page.value.latestTalentRating.content);
    items.push(`最新反馈：${summary.length > 18 ? `${summary.slice(0, 18)}...` : summary}`);
  }
  return items.slice(0, 2);
});

const attentionItems = computed(() => listOf(page.value?.attentionItems));

function openModule(module) {
  activeModule.value = module;
}

function closeModule() {
  activeModule.value = null;
}

function openMetric(metric) {
  activeMetric.value = metric;
}

function closeMetric() {
  activeMetric.value = null;
}

async function loadPage() {
  page.value = await getBusinessData();
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
