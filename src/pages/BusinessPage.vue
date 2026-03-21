<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card">
      <SectionTitle
        eyebrow="企业端工作台"
        title="先让 AI 读懂你的需求，再把合适的人送到你面前。"
        description="企业与个人品牌方都可以入驻。企业上传证明材料，个人通过虚拟企业申请完成准入，审核通过后即可发布任务、选择人才、跟进交付与验收。"
        tag="h1"
      />
      <p class="hero-lead">
        任务既可以语音输入，也可以文本输入。AI 会自动输出需求拆分、工期评估、任务模块和风险建议，企业端确认之后再进入人才匹配，不再靠反复沟通试错。选人完成并双向确认后，双方就进入正式协作。
      </p>
      <div class="action-row" style="margin-bottom: 20px;">
        <router-link class="button-primary" to="/enterprise/publish">去发布任务</router-link>
        <router-link class="button-secondary" to="/enterprise/talents">去看人才广场</router-link>
      </div>
      <div class="chip-row">
        <span class="tag-pill">企业入驻审核</span>
        <span class="tag-pill">个人虚拟企业申请</span>
        <span class="tag-pill">AI 工期评估</span>
        <span class="tag-pill">在线沟通确认</span>
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

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">入驻要求</span>
            <h3>招聘端准入清单</h3>
          </div>
          <span class="soft-pill">企业 / 个人</span>
        </div>

        <div class="stack-sm">
          <div v-for="(item, index) in page.onboardingChecklist" :key="item" class="list-row">
            <div class="title-line">
              <span class="badge-number">{{ index + 1 }}</span>
              <div>
                <h4>{{ item }}</h4>
                <p class="muted">所有材料都会同步进入后台管理审核流。</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">任务状态</span>
            <h3>当前任务面板</h3>
          </div>
          <router-link class="button-secondary" to="/enterprise/workspace">进入协作空间</router-link>
        </div>

        <div class="stack-sm">
          <div v-for="item in page.taskBoard" :key="item.title" class="list-row">
            <div>
              <h4>{{ item.title }}</h4>
              <p class="muted">{{ item.note }}</p>
            </div>
            <span class="soft-pill">{{ item.status }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="AI 任务发布器"
          title="用语音或文字发需求，自动生成拆解结果。"
          description="下面这块输入框模拟了 B 端发布任务的体验。后续可以接语音转写、真实大模型和平台任务模板。"
        />

        <textarea v-model="brief" class="textarea"></textarea>

        <div class="toolbar">
          <button class="button-primary" @click="runAnalysis">生成 AI 拆解</button>
          <button class="button-secondary" @click="resetBrief">恢复示例需求</button>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">AI 输出</span>
            <h3>需求拆分与工期评估</h3>
          </div>
          <span class="soft-pill">{{ analysis.schedule.total }}</span>
        </div>

        <div class="stack-sm">
          <div v-for="module in analysis.modules" :key="module.name" class="list-row">
            <div>
              <h4>{{ module.name }}</h4>
              <p class="muted">{{ module.output }}</p>
            </div>
            <span class="soft-pill">{{ module.duration }}</span>
          </div>
        </div>

        <div class="stack-sm">
          <h4 style="margin: 0;">推荐标签</h4>
          <div class="tag-row">
            <span v-for="tag in analysis.tags" :key="tag" class="tag-pill">{{ tag }}</span>
          </div>
          <p class="muted">{{ analysis.schedule.risk }}</p>
        </div>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="人才推荐"
          title="确认方案之后，再到人才广场里选人。"
          description="平台优先按技能匹配、作品调性、历史评分、当前档期和最近响应质量进行推荐。"
        />

        <div class="stack-sm">
          <div v-for="talent in page.recommendedTalents" :key="talent.name" class="list-row">
            <div class="stack-sm">
              <div class="title-line">
                <span class="status-dot"></span>
                <div>
                  <h4>{{ talent.name }} · {{ talent.role }}</h4>
                  <p class="muted">{{ talent.summary }}</p>
                </div>
              </div>
              <div class="tag-row">
                <span v-for="tag in talent.tags" :key="tag" class="soft-pill">{{ tag }}</span>
              </div>
            </div>
            <div class="stack-sm" style="align-items: end;">
              <span class="soft-pill">评分 {{ talent.score }}</span>
              <router-link class="button-secondary" :to="`/enterprise/talents/${talent.slug}`">查看详情</router-link>
            </div>
          </div>
        </div>

        <div class="toolbar">
          <router-link class="button-primary" to="/enterprise/talents">进入人才广场</router-link>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">项目沟通</span>
            <h3>确认需求、工期与开工边界</h3>
          </div>
          <span class="soft-pill">双向确认后开工</span>
        </div>

        <div class="stack-sm">
          <div v-for="line in page.liveConversation" :key="`${line.author}-${line.time}`" class="mini-card stack-sm">
            <div class="title-line">
              <span class="status-dot"></span>
              <h4>{{ line.author }}</h4>
              <span class="muted">{{ line.time }}</span>
            </div>
            <p class="muted">{{ line.text }}</p>
          </div>
        </div>

        <div class="footer-note">
          <strong class="accent">确认摘要：</strong>
          <div class="stack-sm" style="margin-top: 12px;">
            <span v-for="item in page.contractSummary" :key="item" class="soft-pill">{{ item }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="glass-panel stack-md">
      <SectionTitle
        eyebrow="AI 建议"
        title="这套 B 端流程适合先从第一阶段跑通。"
        description="建议第一阶段先把材料审核、任务发布、AI 拆解、匹配、协作、进度上传、验收评分跑通，再继续补充更完整的实时触达和复杂风控。"
      />

      <div class="tri-grid">
        <article v-for="item in analysis.recommendations" :key="item" class="mini-card stack-sm">
          <h4>执行建议</h4>
          <p class="muted">{{ item }}</p>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import MetricCard from '../components/MetricCard.vue';
import SectionTitle from '../components/SectionTitle.vue';
import { analyzeTaskBrief, getBusinessData } from '../services/api';

const page = ref(null);
const brief = ref('');
const analysis = ref({
  modules: [],
  tags: [],
  schedule: {},
  recommendations: []
});

async function runAnalysis() {
  analysis.value = await analyzeTaskBrief(brief.value);
}

function resetBrief() {
  if (!page.value) {
    return;
  }
  brief.value = page.value.sampleBrief;
  runAnalysis();
}

onMounted(async () => {
  page.value = await getBusinessData();
  brief.value = page.value.sampleBrief;
  await runAnalysis();
});
</script>
