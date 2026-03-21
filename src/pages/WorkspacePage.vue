<template>
  <section class="page-stack" v-if="page">
    <article class="hero-card">
      <SectionTitle
        eyebrow="协作工作区"
        :title="page.summary.taskName"
        :description="`${page.summary.business} 与 ${page.summary.talent} 已完成需求确认，当前处于 ${page.summary.status} 阶段。这里集中展示工期、交付时间线、附件留痕、AI 巡检和验收信用。`"
        tag="h1"
      />
      <div class="chip-row">
        <span class="tag-pill">合作周期 {{ page.summary.range }}</span>
        <span class="tag-pill">需求 / 工期 / 里程碑在线确认</span>
        <span class="tag-pill">AI 进度审查 + 信用沉淀</span>
        <router-link class="button-secondary" :to="messagesRoute">进入项目沟通</router-link>
      </div>
    </article>

    <section class="metric-grid">
      <article v-for="item in page.pulse" :key="item.label" class="metric-card">
        <p class="eyebrow">{{ item.label }}</p>
        <div class="metric-value">{{ item.value }}</div>
        <p>{{ item.note }}</p>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="里程碑"
          title="双方确认后进入正式工作。"
          description="人才与 B 端围绕需求与工期进行商讨，双方都同意后才正式开始执行。"
        />

        <div class="timeline">
          <div v-for="item in page.milestones" :key="item.title" class="timeline-item">
            <h4>{{ item.title }}</h4>
            <p class="muted">{{ item.owner }} · {{ item.status }}</p>
            <p class="muted">{{ item.note }}</p>
          </div>
        </div>

        <div class="result-card">
          <span class="eyebrow">协商确认</span>
          <h3>正式开工前，先把需求和工期敲定。</h3>
          <form class="form-grid" @submit.prevent="handleNegotiationConfirm">
            <div class="form-field">
              <label for="business-user-id">B 端用户 ID</label>
              <input id="business-user-id" v-model="negotiationForm.businessUserId" class="text-input" />
            </div>
            <div class="form-field">
              <label for="talent-user-id">人才用户 ID</label>
              <input id="talent-user-id" v-model="negotiationForm.talentUserId" class="text-input" />
            </div>
            <div class="form-field full">
              <label for="agreement-note">协商说明</label>
              <textarea id="agreement-note" v-model="negotiationForm.agreementNote" class="textarea"></textarea>
            </div>
            <div class="form-field full">
              <div class="toolbar">
                <button class="button-primary" type="submit">确认需求与工期</button>
              </div>
            </div>
          </form>

          <div v-if="negotiationResult" class="tag-row">
            <span class="soft-pill">状态：{{ negotiationResult.status }}</span>
            <span class="soft-pill">{{ negotiationResult.nextStep }}</span>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">进度上传</span>
            <h3>图片、视频、代码、资料</h3>
          </div>
          <span class="soft-pill">支持多种附件</span>
        </div>

        <div class="stack-sm">
          <div v-for="item in page.assetLibrary" :key="item.name" class="mini-card stack-sm">
            <div class="panel-header asset-card-head">
              <div>
                <span class="eyebrow">{{ item.type }}</span>
                <h4>{{ item.name }}</h4>
              </div>
              <span class="soft-pill">{{ item.status }}</span>
            </div>
            <div class="meta-inline">
              <span>{{ item.updatedAt }}</span>
              <span>{{ item.size }}</span>
            </div>
          </div>
        </div>

        <div class="result-card">
          <span class="eyebrow">提交进度</span>
          <h3>人才可以持续上传进展，平台再做 AI 审查。</h3>
          <form class="form-grid" @submit.prevent="handleProgressSubmit">
            <div class="form-field">
              <label for="submitter-user-id">提交人 ID</label>
              <input id="submitter-user-id" v-model="progressForm.submitterUserId" class="text-input" />
            </div>
            <div class="form-field">
              <label for="completion-percent">完成度</label>
              <input id="completion-percent" v-model="progressForm.completionPercent" class="text-input" />
            </div>
            <div class="form-field full">
              <label for="progress-text">进展说明</label>
              <textarea id="progress-text" v-model="progressForm.progressText" class="textarea"></textarea>
            </div>
            <div class="form-field full">
              <div class="toolbar">
                <button class="button-primary" type="submit">提交进度</button>
                <router-link class="button-secondary" :to="messagesRoute">同步去项目沟通</router-link>
              </div>
            </div>
          </form>

          <div v-if="progressResult" class="tag-row">
            <span class="soft-pill">状态：{{ progressResult.status }}</span>
            <span class="soft-pill">{{ progressResult.nextStep }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="交付时间线"
          title="每一次提交，都要能被看见和追踪。"
          description="把里程碑进展、提交说明和附件清单串成一条可回看的时间线，方便 B 端随时了解项目推进状态。"
        />

        <div class="timeline">
          <div v-for="item in page.progressFeed" :key="item.time" class="timeline-item">
            <div class="progress-head">
              <div>
                <h4>{{ item.stage }}</h4>
                <p class="muted">{{ item.author }} · {{ item.time }}</p>
              </div>
              <span class="soft-pill">完成度 {{ item.completion }}</span>
            </div>
            <p class="muted">{{ item.summary }}</p>
            <div class="tag-row">
              <span v-for="attachment in item.attachments" :key="attachment" class="tag-pill tag-pill-muted">
                {{ attachment }}
              </span>
            </div>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="AI 巡检"
          title="AI 不替代交付，而是帮助双方更快对齐。"
          description="系统会对进度完整度、关键交付物、里程碑一致性做轻量检查，并给出修改建议。"
        />

        <div class="stack-sm">
          <div v-for="item in page.aiReviewHistory" :key="item.title" class="inspector-card stack-sm">
            <div class="panel-header">
              <div>
                <span class="eyebrow">{{ item.title }}</span>
                <h4>{{ item.status }}</h4>
              </div>
              <span class="score-pill">评分 {{ item.score }}</span>
            </div>
            <p class="muted">关注点：{{ item.focus }}</p>
            <p class="muted">{{ item.summary }}</p>
            <div class="stack-sm">
              <div v-for="suggestion in item.suggestions" :key="suggestion" class="list-row list-row-tight">
                <p class="muted">{{ suggestion }}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">验收节点</span>
            <h3>完工后提醒 B 端验收</h3>
          </div>
          <span class="soft-pill">验收 -> 评分</span>
        </div>

        <div class="stack-sm">
          <div v-for="item in page.acceptance" :key="item" class="list-row">
            <div>
              <h4>{{ item }}</h4>
              <p class="muted">验收确认后，双方评价进入信用体系与推荐策略。</p>
            </div>
          </div>
        </div>

        <div class="toolbar">
          <router-link class="button-primary" :to="acceptanceRoute">进入验收评分页</router-link>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="互评记录"
          title="合作结束后，沉淀成双方都看得见的信用。"
          description="评分不是单一数字，而是和交付记录、沟通节奏、验收配合一起构成长期合作画像。"
        />

        <div class="stack-sm">
          <div v-for="item in page.reviewHistory" :key="`${item.reviewer}-${item.time}`" class="list-card stack-sm">
            <div class="panel-header">
              <div>
                <h4>{{ item.reviewer }}</h4>
                <p class="muted">{{ item.role }} · {{ item.time }}</p>
              </div>
              <span class="score-pill">{{ item.rating }}</span>
            </div>
            <p class="muted">{{ item.content }}</p>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import { confirmNegotiation, getWorkspaceData, submitTaskProgress } from '../services/api';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const page = ref(null);
const audience = computed(() => resolveAudience(route));
const messagesRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages
);
const acceptanceRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.acceptance : roleRouteMap.enterprise.acceptance
);
const negotiationForm = ref({
  businessUserId: '1',
  talentUserId: '2',
  agreementNote: '双方确认按 3 周首版推进，优先完成核心闭环。'
});
const progressForm = ref({
  submitterUserId: '2',
  completionPercent: '65',
  progressText: '已完成首页、角色工作台和任务骨架，正在补进度提交与验收页。'
});
const negotiationResult = ref(null);
const progressResult = ref(null);

async function handleNegotiationConfirm() {
  negotiationResult.value = await confirmNegotiation('task-001', negotiationForm.value);
}

async function handleProgressSubmit() {
  progressResult.value = await submitTaskProgress('task-001', progressForm.value);
}

onMounted(async () => {
  page.value = await getWorkspaceData();
});
</script>
