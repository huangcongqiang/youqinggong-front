<template>
  <section class="page-stack">
    <article class="hero-card">
      <SectionTitle
        eyebrow="任务发布"
        title="把模糊需求变成可确认、可匹配、可执行的任务。"
        description="B 端在这里先提交任务，再调用 AI 做拆解，最后确认分析结果进入人才匹配。"
        tag="h1"
      />
      <div class="chip-row">
        <span class="tag-pill">发布任务</span>
        <span class="tag-pill">AI 拆解</span>
        <span class="tag-pill">确认进入匹配</span>
      </div>
    </article>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="发布表单"
          title="先提交任务基础信息"
          description="这里先建任务，再进入 AI 分析。后续可以继续补充语音转写、预算档位、任务模板和附件上传。"
        />

        <form class="form-grid" @submit.prevent="handlePublish">
          <div class="form-field">
            <label for="publisher-id">发布人 ID</label>
            <input id="publisher-id" v-model="publishForm.publisherUserId" class="text-input" />
          </div>
          <div class="form-field">
            <label for="organization-id">企业 ID</label>
            <input id="organization-id" v-model="publishForm.organizationId" class="text-input" />
          </div>
          <div class="form-field full">
            <label for="task-title">任务标题</label>
            <input id="task-title" v-model="publishForm.title" class="text-input" placeholder="例如：AI 协作后台首版" />
          </div>
          <div class="form-field">
            <label for="task-source">输入来源</label>
            <select id="task-source" v-model="publishForm.source" class="select-input">
              <option value="TEXT">文字输入</option>
              <option value="VOICE">语音输入</option>
            </select>
          </div>
          <div class="form-field full">
            <label for="task-brief">任务需求</label>
            <textarea id="task-brief" v-model="publishForm.brief" class="textarea"></textarea>
          </div>
          <div class="form-field full">
            <div class="toolbar">
              <button class="button-primary" type="button" @click="handleAnalyze">先做 AI 拆解</button>
              <button class="button-secondary" type="submit">发布任务</button>
              <button class="button-secondary" type="button" @click="resetForm">恢复示例</button>
            </div>
          </div>
        </form>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">AI 拆解结果</span>
            <h3>先分析，再确认进入匹配</h3>
          </div>
          <span class="soft-pill">{{ analysis.schedule.total || '待生成' }}</span>
        </div>

        <div v-if="analysis.modules?.length" class="stack-sm">
          <div v-for="module in analysis.modules" :key="module.name" class="list-row">
            <div>
              <h4>{{ module.name }}</h4>
              <p class="muted">{{ module.output }}</p>
            </div>
            <span class="soft-pill">{{ module.duration }}</span>
          </div>
        </div>
        <p v-else class="muted">先点击“先做 AI 拆解”，平台会给出任务模块、工期和风险提示。</p>

        <div v-if="analysis.tags?.length" class="tag-row">
          <span v-for="tag in analysis.tags" :key="tag" class="tag-pill">{{ tag }}</span>
        </div>

        <div v-if="publishResult" class="result-card">
          <span class="eyebrow">发布状态</span>
          <h3>{{ publishResult.title }}</h3>
          <p class="muted">{{ publishResult.nextStep }}</p>
          <div class="toolbar">
            <button class="button-primary" type="button" @click="handleConfirm">确认拆解并开始匹配</button>
            <router-link class="button-secondary" to="/enterprise">返回企业端工作台</router-link>
          </div>
        </div>

        <div v-if="confirmResult" class="result-card">
          <span class="eyebrow">确认结果</span>
          <h3>{{ confirmResult.status }}</h3>
          <p class="muted">{{ confirmResult.nextStep }}</p>
          <div class="tag-row">
            <span class="soft-pill">任务：{{ confirmResult.taskId }}</span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import SectionTitle from '../components/SectionTitle.vue';
import { analyzeTaskBrief, confirmTaskAnalysis, publishTask } from '../services/api';

const initialForm = () => ({
  publisherUserId: '1',
  organizationId: '1',
  title: 'AI 协作后台首版',
  brief: '支持任务发布、人才匹配、项目沟通和进度协作，第一阶段先完成核心交付闭环。',
  source: 'TEXT'
});

const publishForm = ref(initialForm());
const analysis = ref({ modules: [], tags: [], schedule: {} });
const publishResult = ref(null);
const confirmResult = ref(null);

async function handleAnalyze() {
  analysis.value = await analyzeTaskBrief(publishForm.value.brief);
}

async function handlePublish() {
  publishResult.value = await publishTask(publishForm.value);
}

async function handleConfirm() {
  const taskId = publishResult.value?.taskId || 'task-20260321-publish';
  confirmResult.value = await confirmTaskAnalysis(taskId);
}

function resetForm() {
  publishForm.value = initialForm();
  analysis.value = { modules: [], tags: [], schedule: {} };
  publishResult.value = null;
  confirmResult.value = null;
}
</script>
