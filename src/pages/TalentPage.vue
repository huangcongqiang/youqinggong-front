<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card">
      <SectionTitle
        eyebrow="人才端工作台"
        :title="`${page.hero.name} · ${page.hero.role}`"
        :description="page.hero.intro"
        tag="h1"
      />
      <p class="hero-lead">
        人才端既能主动去任务列表抢单，也可以等待系统根据技能、作品和接单档期自动分配任务。接单后通过日历、进度上传、项目消息和验收评价完成整个交付周期。
      </p>
      <div class="action-row" style="margin-bottom: 20px;">
        <router-link class="button-primary" to="/talent/onboarding">去做人才入驻</router-link>
        <router-link class="button-secondary" to="/talent/tasks">查看任务广场</router-link>
      </div>
      <div class="chip-row">
        <span class="tag-pill">{{ page.hero.availability }}</span>
        <span class="tag-pill">综合评分 {{ page.hero.score }}</span>
        <span class="tag-pill">累计收入 {{ page.hero.income }}</span>
        <router-link class="button-secondary" to="/talent/profile/chen-yining">查看对外人才详情页</router-link>
      </div>
    </article>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">个人资料</span>
            <h3>作品、专长与合作画像</h3>
          </div>
          <span class="soft-pill">可对外展示</span>
        </div>

        <div class="tag-row">
          <span v-for="skill in page.skills" :key="skill" class="tag-pill">{{ skill }}</span>
        </div>

        <div class="stack-sm">
          <div v-for="item in page.portfolio" :key="item.title" class="mini-card stack-sm">
            <h4>{{ item.title }}</h4>
            <p class="muted">{{ item.desc }}</p>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">接单日历</span>
            <h3>开启 / 关闭接单</h3>
          </div>
          <span class="soft-pill">支持移动端快速切换</span>
        </div>

        <div class="calendar-grid">
          <div
            v-for="item in page.calendar"
            :key="item.day"
            class="calendar-cell"
            :class="{
              'is-open': item.state === 'open',
              'is-busy': item.state === 'busy'
            }"
          >
            <strong>{{ item.day }}</strong>
            <p class="muted" style="margin-top: 10px;">{{ item.note }}</p>
          </div>
        </div>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="任务广场"
          title="可主动查看任务，也可等待自动分配。"
          description="系统会标注与你的技能匹配度和建议工期，方便你快速判断是否值得接。"
        />

        <div class="stack-sm">
          <div v-for="task in page.marketplace" :key="task.title" class="list-row">
            <div class="stack-sm">
              <div>
                <h4>{{ task.title }}</h4>
                <p class="muted">{{ task.budget }} · {{ task.period }}</p>
              </div>
              <div class="tag-row">
                <span v-for="tag in task.tags" :key="tag" class="soft-pill">{{ tag }}</span>
              </div>
            </div>
            <div class="stack-sm" style="align-items: end;">
              <span class="soft-pill">匹配 {{ task.match }}</span>
              <router-link class="button-secondary" to="/talent/tasks">查看广场</router-link>
            </div>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">任务管理</span>
            <h3>查看进行中任务与进度</h3>
          </div>
          <router-link class="button-secondary" to="/talent/workspace">查看协作空间</router-link>
        </div>

        <div class="stack-sm">
          <div v-for="task in page.activeTasks" :key="task.title" class="mini-card stack-sm">
            <div class="title-line">
              <span class="status-dot"></span>
              <div>
                <h4>{{ task.title }}</h4>
                <p class="muted">{{ task.note }}</p>
              </div>
            </div>
            <span class="soft-pill">进度 {{ task.progress }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="任务消息"
          title="接单后在项目沟通里持续推进。"
          description="消息、提醒、文件上传和阶段确认都会围绕当前项目展开，方便人才在移动端也能持续推进任务。"
        />

        <div class="stack-sm">
          <div v-for="message in page.messages" :key="`${message.from}-${message.time}`" class="mini-card stack-sm">
            <div class="title-line">
              <span class="status-dot"></span>
              <h4>{{ message.from }}</h4>
              <span class="muted">{{ message.time }}</span>
            </div>
            <p class="muted">{{ message.text }}</p>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">我的统计</span>
            <h3>收入、作品与评价沉淀</h3>
          </div>
          <span class="soft-pill">品牌经营</span>
        </div>

        <div class="metric-grid">
          <article class="metric-card">
            <span class="eyebrow">本月收入</span>
            <div class="metric-value">{{ page.hero.income }}</div>
            <p>支持沉淀为个人品牌背书与接单效率提升。</p>
          </article>
          <article class="metric-card">
            <span class="eyebrow">开放档期</span>
            <div class="metric-value">4 天</div>
            <p>自动依据日历状态计算可分配窗口。</p>
          </article>
        </div>

        <div class="stack-sm">
          <h4 style="margin: 0;">最近评价</h4>
          <div class="tag-row">
            <span v-for="item in page.evaluations" :key="item" class="soft-pill">{{ item }}</span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import SectionTitle from '../components/SectionTitle.vue';
import { getTalentData } from '../services/api';

const page = ref(null);

onMounted(async () => {
  page.value = await getTalentData();
});
</script>
