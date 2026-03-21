<template>
  <section class="page-stack">
    <article class="hero-card">
      <div class="panel-header panel-header-top">
        <div class="stack-sm">
          <span class="eyebrow">AI 协助发任务</span>
          <h1 class="page-hero-title">先选一个测试场景，再让 AI 把模糊需求拆成可确认的交付方案。</h1>
          <p class="hero-lead hero-lead-compact">
            这里已经补了多组文本和语音样例。你可以直接切换模板，测试 AI 拆解、工期评估、推荐人才和发布确认的完整链路。
          </p>
        </div>

        <div class="chip-row">
          <span class="tag-pill">任务模板切换</span>
          <span class="tag-pill">语音 / 文字输入</span>
          <span class="tag-pill">AI 拆解与工期评估</span>
          <span class="tag-pill">匹配人才预览</span>
        </div>
      </div>
    </article>

    <section class="split-grid publish-shell-grid">
      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">任务模板</span>
            <h3>先选一组测试需求</h3>
          </div>
          <span class="soft-pill">{{ presets.length }} 个样例</span>
        </div>

        <div class="preset-grid">
          <button
            v-for="preset in presets"
            :key="preset.id"
            type="button"
            class="preset-card"
            :class="{ 'is-active': preset.id === selectedPresetId }"
            @click="applyPreset(preset)"
          >
            <div class="preset-card-head">
              <div>
                <h4>{{ preset.title }}</h4>
                <p class="muted">{{ preset.focus }}</p>
              </div>
              <span class="soft-pill">{{ preset.period }}</span>
            </div>
            <div class="tag-row">
              <span v-for="tag in preset.tags || []" :key="tag" class="tag-pill tag-pill-muted">{{ tag }}</span>
            </div>
          </button>
        </div>

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

          <div v-if="publishForm.source === 'VOICE' && publishForm.voiceTranscript" class="form-field full">
            <div class="result-card stack-sm">
              <span class="eyebrow">语音转写参考</span>
              <p class="muted">{{ publishForm.voiceTranscript }}</p>
            </div>
          </div>

          <div class="form-field full">
            <div class="toolbar">
              <button class="button-primary" type="button" @click="handleAnalyze">先做 AI 拆解</button>
              <button class="button-secondary" type="submit">发布任务</button>
              <button class="button-secondary" type="button" @click="resetForm">恢复当前模板</button>
            </div>
          </div>
        </form>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">AI 输出</span>
            <h3>需求拆分与工期评估</h3>
          </div>
          <div class="tag-row">
            <span class="soft-pill">{{ analysis.schedule.total || '待生成' }}</span>
            <span v-if="analysis.provider" class="soft-pill">{{ analysis.provider }}</span>
            <span v-if="analysis.model" class="soft-pill">{{ analysis.model }}</span>
          </div>
        </div>

        <div v-if="analysis.originalBrief" class="result-card stack-sm">
          <span class="eyebrow">原始需求摘要</span>
          <p class="muted">{{ analysis.originalBrief }}</p>
          <p class="muted"><strong class="accent">风险提示：</strong>{{ analysis.schedule.risk }}</p>
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

        <div v-if="analysis.tags?.length" class="stack-sm">
          <h4>推荐标签</h4>
          <div class="tag-row">
            <span v-for="tag in analysis.tags" :key="tag" class="tag-pill">{{ tag }}</span>
          </div>
        </div>

        <div v-if="analysis.recommendations?.length" class="stack-sm">
          <h4>执行建议</h4>
          <div class="stack-sm">
            <div v-for="item in analysis.recommendations" :key="item" class="mini-card stack-sm">
              <p class="muted">{{ item }}</p>
            </div>
          </div>
        </div>

        <div v-if="analysis.matchingPreview?.length" class="stack-sm">
          <h4>推荐人才预览</h4>
          <div class="stack-sm">
            <div v-for="talent in analysis.matchingPreview" :key="`${talent.name}-${talent.role}`" class="list-row">
              <div>
                <h4>{{ talent.name }} · {{ talent.role }}</h4>
                <p class="muted">{{ talent.reason }}</p>
              </div>
              <span class="soft-pill">可邀约</span>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="测试记录"
          title="AI 拆解历史"
          description="每次换一个模板跑一下拆解，就能快速验证不同类型任务的分析结果有没有明显区别。"
        />

        <div v-if="analysisHistory.length" class="stack-sm">
          <div v-for="item in analysisHistory" :key="item.id" class="mini-card stack-sm">
            <div class="panel-header">
              <div>
                <h4>{{ item.title }}</h4>
                <p class="muted">{{ item.time }}</p>
              </div>
              <span class="soft-pill">{{ item.total }}</span>
            </div>
            <p class="muted">{{ item.risk }}</p>
          </div>
        </div>
        <p v-else class="muted">还没有测试记录，先跑一次 AI 拆解。</p>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="发布结果"
          title="确认无误后进入人才匹配"
          description="发布成功后，任务会进入待确认与匹配阶段。这里会保留最近一次的发布结果，方便你连续验证。"
        />

        <div v-if="publishResult" class="result-card stack-md">
          <div class="panel-header">
            <div>
              <span class="eyebrow">发布状态</span>
              <h3>{{ publishResult.title }}</h3>
            </div>
            <span class="soft-pill">{{ publishResult.status }}</span>
          </div>

          <p class="muted">{{ publishResult.nextStep }}</p>

          <div class="tag-row">
            <span class="soft-pill">任务：{{ publishResult.taskId }}</span>
            <span class="soft-pill">来源：{{ publishResult.source }}</span>
            <span v-if="publishResult.analysisSummary?.total" class="soft-pill">{{ publishResult.analysisSummary.total }}</span>
            <span v-if="publishResult.analysisProvider" class="soft-pill">{{ publishResult.analysisProvider }}</span>
            <span v-if="publishResult.analysisModel" class="soft-pill">{{ publishResult.analysisModel }}</span>
          </div>

          <div v-if="publishResult.matchingPreview?.length" class="stack-sm">
            <h4>匹配人才预览</h4>
            <div class="stack-sm">
              <div v-for="talent in publishResult.matchingPreview" :key="`${talent.name}-${talent.role}`" class="list-row">
                <div>
                  <h4>{{ talent.name }} · {{ talent.role }}</h4>
                  <p class="muted">{{ talent.reason }}</p>
                </div>
                <span class="soft-pill">推荐</span>
              </div>
            </div>
          </div>

          <div class="toolbar">
            <button class="button-primary" type="button" @click="handleConfirm">确认拆解并开始匹配</button>
            <router-link class="button-secondary" to="/enterprise/talents">去看人才广场</router-link>
          </div>
        </div>

        <div v-else class="mini-card stack-sm">
          <h4>还没有发布结果</h4>
          <p class="muted">先选一个模板跑 AI 拆解，再点击“发布任务”。</p>
        </div>

        <div v-if="confirmResult" class="result-card stack-sm">
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
import { computed, onMounted, ref } from 'vue';
import SectionTitle from '../components/SectionTitle.vue';
import {
  analyzeTaskBrief,
  confirmTaskAnalysis,
  getAiPublishPresets,
  publishTask
} from '../services/api';

const presets = ref([]);
const selectedPresetId = ref('');
const analysis = ref({ modules: [], tags: [], schedule: {}, recommendations: [], matchingPreview: [] });
const analysisHistory = ref([]);
const publishResult = ref(null);
const confirmResult = ref(null);

const publishForm = ref({
  publisherUserId: '1',
  organizationId: '1',
  title: '',
  brief: '',
  source: 'TEXT',
  voiceTranscript: ''
});

const selectedPreset = computed(() =>
  presets.value.find((item) => item.id === selectedPresetId.value) || presets.value[0] || null
);

function effectiveBrief() {
  if (publishForm.value.source === 'VOICE' && publishForm.value.voiceTranscript) {
    return publishForm.value.voiceTranscript;
  }
  return publishForm.value.brief;
}

function applyPreset(preset) {
  selectedPresetId.value = preset.id;
  publishForm.value = {
    publisherUserId: '1',
    organizationId: '1',
    title: preset.title,
    brief: preset.brief,
    source: preset.source,
    voiceTranscript: preset.voiceTranscript || ''
  };
  publishResult.value = null;
  confirmResult.value = null;
  analysis.value = { modules: [], tags: [], schedule: {}, recommendations: [], matchingPreview: [] };
}

async function handleAnalyze() {
  analysis.value = await analyzeTaskBrief(effectiveBrief());
  analysisHistory.value = [
    {
      id: `${Date.now()}-${analysisHistory.value.length}`,
      title: publishForm.value.title || '未命名任务',
      time: '刚刚',
      total: analysis.value.schedule.total || '待确认',
      risk: analysis.value.schedule.risk || '待确认'
    },
    ...analysisHistory.value
  ].slice(0, 5);
}

async function handlePublish() {
  publishResult.value = await publishTask({
    ...publishForm.value,
    brief: effectiveBrief()
  });
}

async function handleConfirm() {
  const taskId = publishResult.value?.taskId || 'task-demo-latest';
  confirmResult.value = await confirmTaskAnalysis(taskId);
}

function resetForm() {
  if (selectedPreset.value) {
    applyPreset(selectedPreset.value);
  }
}

onMounted(async () => {
  const payload = await getAiPublishPresets();
  presets.value = payload.items || [];

  if (presets.value.length) {
    applyPreset(presets.value[0]);
    await handleAnalyze();
  }
});
</script>
