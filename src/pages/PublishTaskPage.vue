<template>
  <section class="page-stack publish-page">
    <article class="hero-card publish-hero-card publish-hero-card-compact">
      <div class="panel-header panel-header-top publish-hero-shell">
        <div class="stack-sm">
          <span class="eyebrow">AI 协助发任务</span>
          <h1 class="page-hero-title publish-hero-title">发布任务</h1>
          <p class="hero-lead hero-lead-compact">
            先定场景，再补输入，最后看 AI 结果。
          </p>
          <div class="tag-row publish-hero-meta">
            <span class="soft-pill">当前 {{ currentStepMeta.title }}</span>
            <span class="soft-pill">{{ selectedPreset?.isCustom ? '自由输入' : selectedPreset?.title || '待选模板' }}</span>
          </div>
        </div>

        <div class="publish-top-actions publish-top-actions-compact">
          <span class="soft-pill">4 步完成</span>
          <button class="button-secondary" type="button" @click="overviewOpen = true">发布概览</button>
        </div>
      </div>
    </article>

    <section class="publish-wizard-shell">
      <article class="glass-panel stack-md publish-wizard-main">
        <div class="publish-stepper">
          <button
            v-for="step in steps"
            :key="step.id"
            type="button"
            class="publish-stepper-item"
            :class="stepClass(step.id)"
            @click="jumpToStep(step.id)"
          >
            <span class="publish-stepper-index">{{ step.id }}</span>
            <div>
              <strong>{{ step.title }}</strong>
              <small>{{ step.note }}</small>
            </div>
          </button>
        </div>

        <div class="publish-step-panel">
          <template v-if="currentStep === 1">
            <SectionTitle
              eyebrow="第 1 步"
              title="先选一个任务场景"
              description="先定场景，再补标题、预算和需求。"
            />

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
                <div class="tag-row preset-card-tags">
                  <span
                    v-for="tag in presetPreviewTags(preset)"
                    :key="tag"
                    class="tag-pill tag-pill-muted"
                  >
                    {{ tag }}
                  </span>
                  <span
                    v-if="countPresetTags(preset) > presetPreviewTags(preset).length"
                    class="soft-pill"
                  >
                    +{{ countPresetTags(preset) - presetPreviewTags(preset).length }}
                  </span>
                </div>
              </button>
            </div>

            <div v-if="selectedPreset" class="mini-card publish-preset-inline">
              <div class="publish-preset-inline-copy">
                <span class="eyebrow">当前模板</span>
                <strong>{{ selectedPreset.title }}</strong>
                <p class="muted">
                  {{
                    selectedPreset.isCustom
                      ? '适合把模糊想法先交给 AI 梳理。'
                      : (selectedPreset.focus || '已带入默认方向，继续补预算和需求。')
                  }}
                </p>
              </div>
              <div class="tag-row">
                <span class="soft-pill">{{ selectedPreset.period || '自由输入' }}</span>
                <span class="soft-pill">预算 {{ publishForm.budget || '后面填写' }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="currentStep === 2">
            <SectionTitle
              eyebrow="第 2 步"
              title="把任务需求写清楚"
              description="先把标题、预算和需求说清楚，再交给 AI 处理。"
            />

            <form class="form-grid" @submit.prevent>
              <div class="form-field full">
                <div class="result-card stack-sm">
                  <span class="eyebrow">当前发布账号</span>
                  <h4>{{ accountLabel }}</h4>
                  <div class="tag-row">
                    <span class="soft-pill">发布人：{{ publishForm.publisherUserId || '待识别' }}</span>
                    <span class="soft-pill">企业：{{ publishForm.organizationId || '待识别' }}</span>
                  </div>
                </div>
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

              <div class="form-field">
                <label for="task-budget">任务预算</label>
                <input id="task-budget" v-model="publishForm.budget" class="text-input" placeholder="例如：12000 或 ￥12000" />
              </div>

              <div class="form-field full">
                <label for="task-brief">任务需求</label>
                <textarea id="task-brief" v-model="publishForm.brief" class="textarea publish-textarea"></textarea>
              </div>

              <div v-if="publishForm.source === 'VOICE' && publishForm.voiceTranscript" class="form-field full">
                <div class="result-card stack-sm">
                  <span class="eyebrow">语音转写参考</span>
                  <p class="muted">{{ publishForm.voiceTranscript }}</p>
                </div>
              </div>
            </form>
          </template>

          <template v-else-if="currentStep === 3">
            <SectionTitle
              eyebrow="第 3 步"
              title="最后确认一遍输入内容"
              description="这一步只确认你即将提交给 AI 的输入。"
            />

            <div class="stack-md">
              <div class="result-card stack-sm">
                <span class="eyebrow">任务标题</span>
                <h3>{{ publishForm.title || '待补充任务标题' }}</h3>
                <div class="tag-row">
                  <span class="soft-pill">来源：{{ publishForm.source === 'VOICE' ? '语音输入' : '文字输入' }}</span>
                  <span class="soft-pill">模板：{{ selectedPreset?.isCustom ? '自由输入' : selectedPreset?.title || '未选择模板' }}</span>
                  <span class="soft-pill">预算：{{ publishForm.budget || '未填写预算' }}</span>
                </div>
              </div>

              <div class="mini-card stack-sm">
                <span class="eyebrow">需求内容</span>
                <p class="muted">{{ effectiveBrief() || '待补充任务需求' }}</p>
              </div>
            </div>
          </template>

          <template v-else>
            <SectionTitle
              eyebrow="第 4 步"
              title="统一查看 AI 结果并正式发布"
              description="只看结论、修订和下一步。"
            />

            <div v-if="isAnalyzing" class="result-card publish-loading-card stack-md">
              <span class="eyebrow">AI 正在生成结果</span>
              <h3>正在拆解任务、估算工期并筛选推荐人才</h3>
              <p class="muted">这一步可能需要几秒到十几秒。页面会先理解需求，再按 AI 人才效率估算工期，最后从人才库筛出更合适的候选人。</p>

              <div class="publish-loading-orb" aria-hidden="true"></div>

              <div class="publish-loading-timeline">
                <div v-for="(item, index) in analysisLoadingSteps" :key="item" class="publish-loading-step">
                  <span class="publish-loading-step-index">{{ index + 1 }}</span>
                  <div>
                    <strong>{{ item }}</strong>
                    <small>结果生成完成后会直接展示在当前页面。</small>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="analysis.originalBrief" class="stack-md">
              <div class="result-card stack-sm publish-analysis-summary-card">
                <span class="eyebrow">原始需求摘要</span>
                <h3>{{ analysis.schedule.total || '待估算' }}</h3>
                <p class="muted">{{ analysis.originalBrief }}</p>
                <div class="tag-row publish-analysis-summary-tags">
                  <span v-if="analysis.provider" class="soft-pill">{{ analysis.provider }}</span>
                  <span v-if="analysis.model" class="soft-pill">{{ analysis.model }}</span>
                  <span class="soft-pill">{{ analysis.schedule.risk || '待补充风险提示' }}</span>
                </div>
                <p v-if="analysis.schedule.assumption" class="muted publish-analysis-summary-note">
                  <strong class="accent">估算口径：</strong>{{ analysis.schedule.assumption }}
                </p>
              </div>

              <div class="mini-card stack-md publish-analysis-edit-card">
                <div class="panel-header">
                  <div>
                    <span class="eyebrow">需求修订</span>
                    <h4>如果 AI 理解偏了，直接改这里</h4>
                  </div>
                  <button class="button-secondary" type="button" @click="resetRevision">恢复本轮输入</button>
                </div>

                <div class="form-grid">
                  <div class="form-field full">
                    <label for="revision-title">修订后的标题</label>
                    <input id="revision-title" v-model="revisionForm.title" class="text-input" placeholder="继续调整标题也可以" />
                  </div>
                  <div class="form-field full">
                    <label for="revision-brief">修订后的需求</label>
                    <textarea id="revision-brief" v-model="revisionForm.brief" class="textarea publish-textarea publish-textarea-compact"></textarea>
                  </div>
                </div>

                <div class="toolbar">
                  <button class="button-primary" type="button" @click="handleRegenerate">按修订内容重新生成</button>
                  <button class="button-secondary" type="button" @click="currentStep = 2">返回前面继续改</button>
                </div>
              </div>

              <div class="publish-analysis-detail-grid">
                <details v-if="analysis.modules?.length" class="publish-analysis-detail-group" open>
                  <summary>
                    <span>模块拆解</span>
                    <strong>{{ analysis.modules.length }} 个模块</strong>
                  </summary>
                  <div class="stack-sm">
                    <div v-for="module in analysis.modules" :key="module.name" class="list-row">
                      <div>
                        <h4>{{ module.name }}</h4>
                        <p class="muted">{{ module.output }}</p>
                      </div>
                      <span class="soft-pill">{{ module.duration }}</span>
                    </div>
                  </div>
                </details>

                <details v-if="analysis.tags?.length" class="publish-analysis-detail-group">
                  <summary>
                    <span>推荐标签</span>
                    <strong>{{ analysis.tags.length }} 个</strong>
                  </summary>
                  <div class="tag-row">
                    <span v-for="tag in analysis.tags" :key="tag" class="tag-pill">{{ tag }}</span>
                  </div>
                </details>

                <details v-if="analysis.recommendations?.length" class="publish-analysis-detail-group">
                  <summary>
                    <span>执行建议</span>
                    <strong>{{ analysis.recommendations.length }} 条</strong>
                  </summary>
                  <div class="stack-sm">
                    <div v-for="item in analysis.recommendations" :key="item" class="mini-card stack-sm">
                      <p class="muted">{{ item }}</p>
                    </div>
                  </div>
                </details>
              </div>

              <div v-if="publishResult" class="result-card stack-sm publish-result-summary-card">
                <div class="panel-header">
                  <div>
                    <span class="eyebrow">发布状态</span>
                    <h3>{{ publishResult.title }}</h3>
                  </div>
                  <span class="soft-pill">{{ publishResult.status }}</span>
                </div>

                <p class="muted">{{ publishResult.nextStep }}</p>

                <div class="tag-row publish-result-summary-tags">
                  <span class="soft-pill">任务：{{ publishResult.taskId }}</span>
                  <span class="soft-pill">来源：{{ publishResult.source }}</span>
                  <span class="soft-pill">预算：{{ publishResult.budget || '未填写预算' }}</span>
                </div>

                <div class="toolbar publish-result-summary-actions">
                  <button
                    v-if="analysis.matchingPreview?.length"
                    class="button-primary"
                    type="button"
                    :disabled="isBusy"
                    @click="talentPickerOpen = true"
                  >
                    查看推荐人才
                  </button>
                  <router-link class="button-secondary" to="/enterprise/talents">去看人才广场</router-link>
                </div>
              </div>

              <div v-if="assignmentResult" class="result-card stack-sm">
                <span class="eyebrow">已选中的推荐人才</span>
                <h3>{{ assignmentResult.selectedTalent?.name || '候选人才已选定' }}</h3>
                <p class="muted">{{ assignmentResult.nextStep }}</p>
                <div class="tag-row">
                  <span class="soft-pill">任务：{{ assignmentResult.taskId }}</span>
                  <span class="soft-pill">人才：{{ assignmentResult.talentUserId }}</span>
                  <span class="soft-pill">{{ assignmentResult.status }}</span>
                </div>
              </div>
            </div>

            <div v-else class="result-card stack-sm">
              <span class="eyebrow">还没有 AI 输出</span>
              <h3>先生成一版拆解结果</h3>
              <p class="muted">点击下方按钮后，平台会在当前页面集中展示模块拆解、工期评估和候选人才。工期默认按 AI 熟练人才的协同效率估算。</p>
            </div>
          </template>
        </div>

        <div class="publish-step-actions">
          <button v-if="currentStep > 1" class="button-secondary" type="button" :disabled="isBusy" @click="prevStep">上一步</button>

          <button
            v-if="currentStep === 1"
            class="button-primary"
            type="button"
            :disabled="isBusy"
            @click="nextStep"
          >
            继续填写需求
          </button>

          <button
            v-else-if="currentStep === 2"
            class="button-primary"
            type="button"
            :disabled="isBusy"
            @click="nextStep"
          >
            去确认输入内容
          </button>

          <button
            v-else-if="currentStep === 3"
            class="button-primary"
            type="button"
            :disabled="isBusy"
            @click="proceedToAnalysis"
          >
            生成 AI 拆解
          </button>

          <button
            v-else-if="!publishResult"
            class="button-primary"
            type="button"
            :disabled="isBusy || isAnalyzing"
            @click="proceedToPublish"
          >
            {{ isPublishing ? '正在发布...' : '确认并发布任务' }}
          </button>

          <button
            v-else
            class="button-primary"
            type="button"
            :disabled="isBusy"
            @click="analysis.matchingPreview?.length ? (talentPickerOpen = true) : router.push('/enterprise/talents')"
          >
            {{ analysis.matchingPreview?.length ? '查看推荐人才' : '去人才广场' }}
          </button>

          <button
            v-if="currentStep < 4 || !publishResult"
            class="button-secondary"
            type="button"
            :disabled="isBusy"
            @click="resetForm"
          >
            恢复当前模板
          </button>
        </div>
      </article>
    </section>

    <div v-if="overviewOpen" class="publish-overview-modal" @click.self="overviewOpen = false">
      <article class="publish-overview-card">
        <div class="panel-header">
          <div>
            <span class="eyebrow">发布概览</span>
            <h3>当前任务的关键信息</h3>
          </div>
          <button class="button-secondary" type="button" @click="overviewOpen = false">关闭</button>
        </div>

        <div class="publish-overview-grid">
          <div class="mini-card stack-sm">
            <span class="eyebrow">当前账号</span>
            <h4>{{ accountLabel }}</h4>
            <p class="muted">发布人 {{ publishForm.publisherUserId || '待识别' }}</p>
          </div>

            <div class="mini-card stack-sm">
              <span class="eyebrow">当前模板</span>
              <h4>{{ selectedPreset?.title || '待选择' }}</h4>
              <p class="muted">{{ selectedPreset?.focus || '选择模板后会在这里显示一句摘要。' }}</p>
            </div>

          <div class="mini-card stack-sm">
            <span class="eyebrow">当前步骤</span>
            <h4>第 {{ currentStep }} 步</h4>
            <p class="muted">{{ currentStepMeta.note }}</p>
          </div>

          <div class="mini-card stack-sm">
            <span class="eyebrow">任务预算</span>
            <h4>{{ publishForm.budget || '未填写预算' }}</h4>
            <p class="muted">人才端会直接看到这项预算，用来判断是否值得接单。</p>
          </div>

          <div class="mini-card stack-sm">
            <span class="eyebrow">AI 状态</span>
            <h4>{{ analysis.schedule.total || '待分析' }}</h4>
            <p class="muted">{{ analysis.schedule.assumption || (analysis.provider ? `${analysis.provider} · ${analysis.model}` : '还没有开始生成 AI 拆解。') }}</p>
          </div>

          <div class="mini-card stack-sm">
            <span class="eyebrow">发布状态</span>
            <h4>{{ publishResult?.status || '待发布' }}</h4>
            <p class="muted">{{ publishResult?.taskId ? `任务编号 ${publishResult.taskId}` : '正式发布后，这里会显示任务编号。' }}</p>
          </div>

          <div class="mini-card stack-sm">
            <span class="eyebrow">最近拆解记录</span>
            <h4>{{ analysisHistory[0]?.title || '暂无记录' }}</h4>
            <p class="muted">{{ analysisHistory[0]?.risk || '生成 AI 拆解后，这里会保留最近一次记录。' }}</p>
          </div>
        </div>
      </article>
    </div>

    <div v-if="talentPickerOpen && analysis.matchingPreview?.length" class="publish-overview-modal" @click.self="talentPickerOpen = false">
      <article class="publish-overview-card publish-talent-picker-card">
        <div class="panel-header">
          <div>
            <span class="eyebrow">推荐人才</span>
            <h3>任务已发布，是否现在直接选人？</h3>
            <p class="muted">这一步不是强制的。你可以直接从推荐名单中选择一位继续沟通，也可以先跳过，后面再去人才广场补充筛选。</p>
          </div>
          <button class="button-secondary" type="button" @click="talentPickerOpen = false">跳过</button>
        </div>

        <div class="publish-candidate-grid">
          <article
            v-for="talent in analysis.matchingPreview"
            :key="talent.talentUserId || `${talent.name}-${talent.role}`"
            class="publish-candidate-card"
            :class="{ 'is-selected': assignmentResult?.talentUserId === talent.talentUserId }"
          >
            <div class="publish-candidate-head">
              <div>
                <h4>{{ talent.name }}</h4>
                <p class="muted">{{ talent.role }}</p>
              </div>
              <span class="soft-pill">{{ talent.matchScore || '候选' }}</span>
            </div>

            <div class="tag-row">
              <span v-if="talent.score" class="soft-pill">评分 {{ talent.score }}</span>
              <span v-if="talent.responseTime" class="soft-pill">{{ talent.responseTime }} 响应</span>
              <span v-if="talent.availability" class="soft-pill">{{ talent.availability }}</span>
            </div>

            <p class="muted">{{ talent.reason }}</p>

            <div class="toolbar">
              <router-link class="button-secondary" :to="`/enterprise/talents/${talent.slug}`">查看详情</router-link>
              <button
                class="button-primary"
                type="button"
                :disabled="!canChooseTalent(talent)"
                @click="handleSelectTalent(talent)"
              >
                {{ talentActionLabel(talent) }}
              </button>
            </div>
          </article>
        </div>

        <div class="toolbar publish-talent-picker-toolbar">
          <button class="button-secondary" type="button" @click="talentPickerOpen = false">暂时跳过</button>
          <router-link class="button-secondary" to="/enterprise/talents">去人才广场筛选</router-link>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import {
  analyzeTaskBrief,
  confirmTaskAnalysis,
  getAiPublishPresets,
  publishTask,
  selectTaskAssignment
} from '../services/api';
import { useAuthState } from '../stores/auth';

const router = useRouter();
const steps = [
  { id: 1, title: '选场景', note: '先选一个合适模板' },
  { id: 2, title: '填需求', note: '补任务标题和需求内容' },
  { id: 3, title: '确认输入', note: '最后确认提交给 AI 的内容' },
  { id: 4, title: '看结果并发布', note: '统一查看 AI 结果并正式发布' }
];

const presets = ref([]);
const selectedPresetId = ref('');
const currentStep = ref(1);
const overviewOpen = ref(false);
const analysis = ref({ modules: [], tags: [], schedule: {}, recommendations: [], matchingPreview: [] });
const analysisHistory = ref([]);
const publishResult = ref(null);
const confirmResult = ref(null);
const assignmentResult = ref(null);
const talentPickerOpen = ref(false);
const authState = useAuthState();
const isAnalyzing = ref(false);
const isPublishing = ref(false);
const isSelectingTalent = ref(false);
const selectedTalentUserId = ref('');
const revisionForm = ref({
  title: '',
  brief: ''
});

const analysisLoadingSteps = [
  '正在理解需求目标与交付边界',
  '正在按 AI 人才效率估算工期与风险',
  '正在从人才库筛出推荐候选人'
];

const publishForm = ref({
  publisherUserId: '1',
  organizationId: '1',
  title: '',
  brief: '',
  budget: '',
  source: 'TEXT',
  voiceTranscript: ''
});

const selectedPreset = computed(() =>
  presets.value.find((item) => item.id === selectedPresetId.value) || presets.value[0] || null
);

const currentStepMeta = computed(() => steps.find((item) => item.id === currentStep.value) || steps[0]);
const isBusy = computed(() => isAnalyzing.value || isPublishing.value || isSelectingTalent.value);
const canSelectTalent = computed(() => Boolean(publishResult.value?.taskId));

const accountLabel = computed(() => {
  const user = authState.user;
  if (!user) {
    return '当前账号未识别';
  }
  const primaryName = user.organizationName || user.displayName || '未命名账号';
  return `${primaryName} · ${user.mobile}`;
});

function currentPublisherUserId() {
  return authState.user?.platformUserId || '1';
}

function currentOrganizationId() {
  return authState.user?.organizationId || '1';
}

function effectiveBrief() {
  if (publishForm.value.source === 'VOICE' && publishForm.value.voiceTranscript) {
    return publishForm.value.voiceTranscript;
  }
  return publishForm.value.brief;
}

function hasBasicTaskInfo() {
  return Boolean(publishForm.value.title?.trim() && effectiveBrief()?.trim());
}

function stepClass(stepId) {
  return {
    'is-active': currentStep.value === stepId,
    'is-complete': currentStep.value > stepId
  };
}

function jumpToStep(stepId) {
  if (isBusy.value) {
    return;
  }

  if (stepId <= currentStep.value) {
    currentStep.value = stepId;
    return;
  }

  if (stepId === 2 && selectedPreset.value) {
    currentStep.value = 2;
    return;
  }

  if (stepId === 3 && hasBasicTaskInfo()) {
    currentStep.value = 3;
    return;
  }

  if (stepId === 4 && analysis.value.modules?.length) {
    currentStep.value = 4;
  }
}

function nextStep() {
  if (isBusy.value) {
    return;
  }
  if (currentStep.value < 4) {
    currentStep.value += 1;
  }
}

function prevStep() {
  if (isBusy.value) {
    return;
  }
  if (currentStep.value > 1) {
    currentStep.value -= 1;
  }
}

function applyPreset(preset) {
  if (isBusy.value) {
    return;
  }
  selectedPresetId.value = preset.id;
  publishForm.value = {
    publisherUserId: currentPublisherUserId(),
    organizationId: currentOrganizationId(),
    title: preset.isCustom ? '' : preset.title,
    brief: preset.isCustom ? '' : preset.brief,
    budget: '',
    source: preset.source || 'TEXT',
    voiceTranscript: preset.voiceTranscript || ''
  };
  revisionForm.value = {
    title: preset.isCustom ? '' : preset.title,
    brief: preset.isCustom ? '' : preset.brief
  };
  publishResult.value = null;
  confirmResult.value = null;
  assignmentResult.value = null;
  talentPickerOpen.value = false;
  selectedTalentUserId.value = '';
  analysis.value = { modules: [], tags: [], schedule: {}, recommendations: [], matchingPreview: [] };
}

function presetPreviewTags(preset) {
  return Array.isArray(preset?.tags) ? preset.tags.slice(0, 2) : [];
}

function countPresetTags(preset) {
  return Array.isArray(preset?.tags) ? preset.tags.length : 0;
}

async function handleAnalyze() {
  analysis.value = await analyzeTaskBrief(effectiveBrief());
  revisionForm.value = {
    title: publishForm.value.title,
    brief: effectiveBrief()
  };
  publishResult.value = null;
  confirmResult.value = null;
  assignmentResult.value = null;
  selectedTalentUserId.value = '';
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
    publisherUserId: currentPublisherUserId(),
    organizationId: currentOrganizationId(),
    brief: effectiveBrief()
  });
  if (publishResult.value?.taskId) {
    confirmResult.value = await confirmTaskAnalysis(publishResult.value.taskId);
    if (analysis.value.matchingPreview?.length) {
      talentPickerOpen.value = true;
    }
  }
}

async function handleConfirm() {
  if (!publishResult.value?.taskId) {
    return;
  }
  confirmResult.value = await confirmTaskAnalysis(publishResult.value.taskId);
}

async function proceedToAnalysis() {
  if (!hasBasicTaskInfo()) {
    return;
  }
  currentStep.value = 4;
  isAnalyzing.value = true;
  try {
    await handleAnalyze();
  } finally {
    isAnalyzing.value = false;
  }
}

async function proceedToPublish() {
  if (!analysis.value?.modules?.length) {
    currentStep.value = 4;
    isAnalyzing.value = true;
    try {
      await handleAnalyze();
    } finally {
      isAnalyzing.value = false;
    }
  }
  isPublishing.value = true;
  try {
    await handlePublish();
  } finally {
    isPublishing.value = false;
  }
}

function resetRevision() {
  revisionForm.value = {
    title: publishForm.value.title,
    brief: effectiveBrief()
  };
}

async function handleRegenerate() {
  publishForm.value = {
    ...publishForm.value,
    title: revisionForm.value.title,
    brief: revisionForm.value.brief
  };
  currentStep.value = 4;
  isAnalyzing.value = true;
  try {
    await handleAnalyze();
  } finally {
    isAnalyzing.value = false;
  }
}

function talentActionLabel(talent) {
  if (isSelectingTalent.value && selectedTalentUserId.value === talent.talentUserId) {
    return '正在选择...';
  }
  if (assignmentResult.value?.talentUserId === talent.talentUserId) {
    return '已选中';
  }
  if (!publishResult.value?.taskId) {
    return '发布后可选';
  }
  return '选择这位人才';
}

function canChooseTalent(talent) {
  if (!talent?.talentUserId) {
    return false;
  }
  if (!canSelectTalent.value) {
    return false;
  }
  if (assignmentResult.value?.talentUserId === talent.talentUserId) {
    return false;
  }
  if (!isSelectingTalent.value) {
    return true;
  }
  return selectedTalentUserId.value === talent.talentUserId;
}

async function handleSelectTalent(talent) {
  if (!publishResult.value?.taskId || !talent?.talentUserId) {
    return;
  }

  selectedTalentUserId.value = talent.talentUserId;
  isSelectingTalent.value = true;
  try {
    assignmentResult.value = await selectTaskAssignment(publishResult.value.taskId, talent.talentUserId);
    talentPickerOpen.value = false;
    if (assignmentResult.value?.nextRoute) {
      await router.push(assignmentResult.value.nextRoute);
    }
  } finally {
    isSelectingTalent.value = false;
  }
}

function resetForm() {
  if (selectedPreset.value) {
    applyPreset(selectedPreset.value);
  }
  currentStep.value = 1;
}

onMounted(async () => {
  const payload = await getAiPublishPresets();
  presets.value = payload.items || [];
  publishForm.value.publisherUserId = authState.user?.platformUserId || payload.defaultPublisherUserId || '1';
  publishForm.value.organizationId = authState.user?.organizationId || payload.defaultOrganizationId || '1';

  if (presets.value.length) {
    applyPreset(presets.value[0]);
  }
});
</script>
