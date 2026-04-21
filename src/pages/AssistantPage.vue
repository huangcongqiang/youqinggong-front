<template>
  <section v-if="toolMode !== 'entry'" class="assistant-tool-shell">
    <header class="assistant-tool-hero">
      <span class="assistant-eyebrow">{{ activeToolConfig.eyebrow }}</span>
      <h1>{{ activeToolConfig.title }}</h1>
      <p>{{ activeToolConfig.description }}</p>
      <div v-if="assistantContextTitle || assistantContextMeta.length" class="assistant-inline-note is-context">
        <strong>{{ assistantContextTitle || '当前任务上下文' }}</strong>
        <p>{{ assistantContextMeta.length ? assistantContextMeta.join(' · ') : '当前页已带上任务上下文，生成结果会围绕这条任务继续整理。' }}</p>
      </div>
    </header>

    <article class="assistant-tool-card">
      <div v-if="errorMessage" class="assistant-inline-alert is-error">
        <strong>当前状态</strong>
        <p>{{ errorMessage }}</p>
      </div>

      <div class="assistant-inline-note">
        <strong>{{ activeToolConfig.noteTitle }}</strong>
        <p>{{ activeToolConfig.noteDescription }}</p>
      </div>

      <div class="assistant-compose">
        <label for="assistant-task-breakdown-input">{{ activeToolConfig.inputLabel }}</label>
        <textarea
          id="assistant-task-breakdown-input"
          v-model.trim="taskBreakdownInput"
          class="assistant-textarea"
          rows="10"
          :placeholder="activeToolConfig.placeholder"
        ></textarea>
        <div v-if="activeToolConfig.quickPrompts?.length" class="assistant-quick-prompt-block">
          <span class="assistant-quick-prompt-label">常用起点</span>
          <div class="assistant-quick-prompt-list">
            <button
              v-for="prompt in activeToolConfig.quickPrompts"
              :key="prompt.label"
              type="button"
              class="assistant-quick-prompt"
              @click="applyQuickPrompt(prompt.text)"
            >
              {{ prompt.label }}
            </button>
          </div>
        </div>
        <div class="assistant-compose__footer">
          <span>{{ taskBreakdownHint }}</span>
          <div class="assistant-actions">
            <button type="button" class="assistant-button assistant-button--ghost" @click="goBackToEntry">返回助手首页</button>
            <button type="button" class="assistant-button assistant-button--primary" :disabled="isAnalyzing" @click="handleAnalyze">
              {{ isAnalyzing ? activeToolConfig.loadingLabel : activeToolConfig.actionLabel }}
            </button>
          </div>
        </div>
      </div>

      <template v-if="analysisResult">
        <section class="assistant-result-block">
          <span class="assistant-eyebrow">{{ activeToolConfig.resultEyebrow }}</span>
          <h2>{{ analysisTitle }}</h2>
          <p>{{ analysisBrief }}</p>
        </section>

        <section v-if="normalizedModules.length" class="assistant-result-list">
          <article v-for="item in normalizedModules" :key="item.id" class="assistant-result-card">
            <div class="assistant-result-card__head">
              <strong>{{ item.title }}</strong>
              <span v-if="item.duration">{{ item.duration }}</span>
            </div>
            <p v-if="item.output">{{ item.output }}</p>
            <small v-if="item.summary">{{ item.summary }}</small>
          </article>
        </section>

        <section v-if="normalizedRecommendations.length" class="assistant-recommendation-block">
          <span class="assistant-eyebrow">{{ activeToolConfig.recommendationEyebrow }}</span>
          <div class="assistant-chip-list">
            <span v-for="(item, index) in normalizedRecommendations" :key="`${item}-${index}`" class="assistant-chip">{{ item }}</span>
          </div>
        </section>

        <section v-if="analysisTags.length" class="assistant-recommendation-block">
          <span class="assistant-eyebrow">{{ activeToolConfig.tagEyebrow }}</span>
          <div class="assistant-chip-list">
            <span v-for="tag in analysisTags" :key="tag" class="assistant-chip is-filled">{{ tag }}</span>
          </div>
        </section>

        <footer class="assistant-tool-footer">
          <button type="button" class="assistant-button assistant-button--ghost" @click="resetBreakdown">{{ activeToolConfig.resetLabel }}</button>
          <button type="button" class="assistant-button assistant-button--primary" @click="handlePrimaryAction">{{ activeToolConfig.primaryLabel }}</button>
        </footer>
      </template>
    </article>
  </section>

  <section v-else class="assistant-entry-shell">
    <header class="assistant-entry-hero">
      <span class="assistant-eyebrow">{{ assistantEntryCopy.eyebrow }}</span>
      <h1>{{ assistantEntryCopy.title }}</h1>
      <p>{{ assistantEntryCopy.description }}</p>
      <div v-if="assistantContextTitle || assistantContextMeta.length || assistantContextPartner" class="assistant-inline-note is-context">
        <strong>{{ assistantContextTitle || '当前任务上下文' }}</strong>
        <p>{{ assistantContextSummary }}</p>
      </div>
    </header>

    <div class="assistant-entry-priority">
      <button
        v-for="card in primaryEntryCards"
        :key="card.id"
        type="button"
        class="assistant-entry-card is-featured"
        @click="handleEntryCard(card)"
      >
        <span class="assistant-entry-card__kicker">{{ card.eyebrow }}</span>
        <strong>{{ card.title }}</strong>
        <p>{{ card.description }}</p>
        <small>{{ card.action }}</small>
      </button>
    </div>

    <div class="assistant-entry-secondary-grid">
      <button
        v-for="card in secondaryEntryCards"
        :key="card.id"
        type="button"
        class="assistant-entry-card is-secondary"
        @click="handleEntryCard(card)"
      >
        <div class="assistant-entry-card__copy">
          <span class="assistant-entry-card__kicker">{{ card.eyebrow }}</span>
          <strong>{{ card.title }}</strong>
          <p>{{ card.description }}</p>
        </div>
        <small>{{ card.action }}</small>
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { analyzeTaskBrief } from '../services/api';
import { roleRouteMap } from '../utils/roleRoutes';
import { consumeAssistantDraftHandoff } from '../utils/assistantDraftHandoff';

const route = useRoute();
const router = useRouter();

const isAnalyzing = ref(false);
const errorMessage = ref('');
const analysisResult = ref(null);
const taskBreakdownInput = ref('');
const consumedHandoffToken = ref('');
const assistantAudience = computed(() => (route.path.startsWith('/talent') ? 'talent' : 'enterprise'));

const toolConfigs = {
  'task-breakdown': {
    eyebrow: '任务拆分',
    title: '先把老板的需求拆清楚',
    description: '这里只把模糊需求拆成更适合发布和推进协作的任务结构，不在这里继续筛人或发消息。',
    noteTitle: '发任务会回到真实发布流程',
    noteDescription: '任务拆分只负责把需求梳理清楚；真正发布时，仍然回到企业端正式的发布链继续填写预算、复核和发布方式。',
    inputLabel: '原始需求',
    placeholder: '例如：我们准备为手机新品发布做 8 支视频，需要先梳理内容方向，再完成拍摄、剪辑和上线物料。',
    hintSuffix: '建议先写清结果、交付范围和合作节奏',
    actionLabel: '开始拆分',
    loadingLabel: '正在拆分…',
    resetLabel: '重新输入需求',
    primaryLabel: '带到发布流程',
    primaryTarget: 'publish',
    resultEyebrow: '拆分结果',
    recommendationEyebrow: '补充建议',
    tagEyebrow: '建议标签',
    presetId: 'assistant-task-breakdown',
    presetTitle: '任务拆分',
    presetTags: ['任务拆分', '上下文助手'],
    quickPrompts: [
      { label: '品牌视频需求', text: '我们准备为手机新品发布做 8 支视频，需要先梳理内容方向，再完成拍摄、剪辑和上线物料。' },
      { label: '官网改版需求', text: '要重做品牌官网首页和活动页，需要先拆清内容范围、视觉规范和上线节奏。' },
    ],
  },
  'talent-fit': {
    eyebrow: '人才匹配',
    title: '继续筛选候选人是否值得邀约',
    description: '这里只判断候选人和任务是否匹配，不直接发消息，也不替你回到搜索页继续筛选。',
    noteTitle: '匹配判断完成后回到真实人才搜索',
    noteDescription: '先把候选人的匹配点、风险点和下一步沟通重点梳理清楚；需要继续邀约时，再带着结论回到人才搜索。',
    inputLabel: '候选人与任务背景',
    placeholder: '例如：候选人做过 3C 品牌短视频投放，擅长脚本和后期，但我们这次更看重发布节奏、团队协作和连续 3 周交付能力。',
    hintSuffix: '建议先写任务目标、候选人经验和你最担心的风险点',
    actionLabel: '开始生成',
    loadingLabel: '正在生成…',
    resetLabel: '重新输入内容',
    primaryLabel: '去人才搜索继续筛选',
    primaryTarget: 'market',
    resultEyebrow: '匹配建议',
    recommendationEyebrow: '重点提醒',
    tagEyebrow: '判断标签',
    presetId: 'assistant-talent-fit',
    presetTitle: '人才匹配',
    presetTags: ['人才匹配', '上下文助手'],
    quickPrompts: [
      { label: '短视频候选人', text: '候选人做过 3C 品牌短视频投放，擅长脚本和后期，但我们更看重发布节奏、团队协作和连续 3 周交付能力。' },
      { label: '设计师候选人', text: '候选人作品调性不错，但我们这次项目需要非常强的品牌规范能力和对官网转化页的理解。' },
    ],
  },
  'message-draft': {
    eyebrow: '消息起草',
    title: '把沟通目标整理成可直接发送的消息草稿',
    description: '这里只起草消息，不替你判断人才是否匹配，也不在这里继续发任务。',
    noteTitle: '消息确认后回到真实消息页发送',
    noteDescription: '先把首条邀约、追问或澄清回复写顺；真正发送时，仍然回到企业端消息页。',
    inputLabel: '沟通目标',
    placeholder: '例如：想联系一位擅长 3C 视频的候选人，先介绍项目背景，再确认他下周能否投入 3 天拍摄和 2 天后期。',
    hintSuffix: '建议先写联系对象、要确认的事项和希望对方如何回应',
    actionLabel: '开始生成',
    loadingLabel: '正在生成…',
    resetLabel: '重新输入内容',
    primaryLabel: '带到消息页',
    primaryTarget: 'messages',
    resultEyebrow: '消息草稿',
    recommendationEyebrow: '沟通提醒',
    tagEyebrow: '消息标签',
    presetId: 'assistant-message-draft',
    presetTitle: '消息起草',
    presetTags: ['消息起草', '上下文助手'],
    quickPrompts: [
      { label: '首条邀约', text: '想联系一位擅长 3C 视频的候选人，先介绍项目背景，再确认他下周能否投入 3 天拍摄和 2 天后期。' },
      { label: '修改追问', text: '已经收到第一版交付，想礼貌地指出两处需要修改的镜头节奏和字幕问题。' },
    ],
  },
  'review-draft': {
    eyebrow: '验收说明',
    title: '先把验收反馈和评级说明整理清楚',
    description: '这里只整理验收口径，不直接提交评级，也不在这里推进结算。',
    noteTitle: '验收说明确认后回到真实验收页',
    noteDescription: '先把交付完成度、需要修改的地方和评级理由写清楚；真正提交时，仍然回到正式验收流程。',
    inputLabel: '验收背景',
    placeholder: '例如：本轮交付了 8 支视频，完成度较高，但还有 2 支字幕需要修正。整体节奏不错，沟通及时，准备给出 A 档评级。',
    hintSuffix: '建议先写交付结果、满意点、待修改项和最终评级倾向',
    actionLabel: '开始生成',
    loadingLabel: '正在生成…',
    resetLabel: '重新输入内容',
    primaryLabel: '带到验收页',
    primaryTarget: 'acceptance',
    resultEyebrow: '验收建议',
    recommendationEyebrow: '评级提醒',
    tagEyebrow: '验收标签',
    presetId: 'assistant-review-draft',
    presetTitle: '验收说明',
    presetTags: ['验收说明', '上下文助手'],
    quickPrompts: [
      { label: '基本通过', text: '本轮交付了 8 支视频，完成度较高，但还有 2 支字幕需要修正。整体节奏不错，准备给出 A 档评级。' },
      { label: '需要返工', text: '这批交付没有完全对齐我们确认过的品牌方向，视觉和信息层级还需要再返工一轮。' },
    ],
  },
  'record-summary': {
    eyebrow: '记录总结',
    title: '把合作过程整理成更清楚的记录摘要',
    description: '这里只沉淀关键决定和时间线，不在这里继续处理财务动作或跳去别的工作页。',
    noteTitle: '整理完成后回到真实合作记录页',
    noteDescription: '先把里程碑、争议点和关键决定总结出来；需要继续跟进记录或财务时，再回到合作记录。',
    inputLabel: '合作过程摘要',
    placeholder: '例如：项目经历了方向确认、脚本修改、两轮拍摄和一次补拍，目前首批视频已经上线，但结算前还需要确认剩余素材交接。',
    hintSuffix: '建议先写关键节点、决定和还未关闭的事项',
    actionLabel: '开始生成',
    loadingLabel: '正在生成…',
    resetLabel: '重新输入内容',
    primaryLabel: '带到合作记录',
    primaryTarget: 'records',
    resultEyebrow: '记录摘要',
    recommendationEyebrow: '后续提醒',
    tagEyebrow: '记录标签',
    presetId: 'assistant-record-summary',
    presetTitle: '记录总结',
    presetTags: ['记录总结', '上下文助手'],
    quickPrompts: [
      { label: '项目周报', text: '项目经历了方向确认、脚本修改、两轮拍摄和一次补拍，目前首批视频已经上线，但结算前还需要确认剩余素材交接。' },
      { label: '争议整理', text: '项目执行中对交付边界出现过两次分歧，后来补充了范围说明，目前还剩最后一笔结算需要确认。' },
    ],
  },
};

const enterpriseEntryCards = [
  {
    id: 'task-breakdown',
    eyebrow: '功能 01',
    title: '任务拆分',
    description: '把老板的需求拆成交付物、阶段目标和里程碑。',
    action: '进入功能',
    mode: 'local',
    tool: 'task-breakdown',
  },
  {
    id: 'talent-fit',
    eyebrow: '功能 02',
    title: '人才匹配',
    description: '单独判断候选人是否值得继续邀约，再决定要不要回到人才搜索。',
    action: '进入功能',
    mode: 'local',
    tool: 'talent-fit',
  },
  {
    id: 'message-draft',
    eyebrow: '功能 03',
    title: '消息起草',
    description: '把招聘消息、追问和澄清回复先整理成可直接发送的草稿。',
    action: '进入功能',
    mode: 'local',
    tool: 'message-draft',
  },
  {
    id: 'review-draft',
    eyebrow: '功能 04',
    title: '验收说明',
    description: '把反馈、评级说明和后续动作先整理清楚，再回到验收页提交。',
    action: '进入功能',
    mode: 'local',
    tool: 'review-draft',
  },
  {
    id: 'record-summary',
    eyebrow: '功能 05',
    title: '记录总结',
    description: '先提炼时间线、关键决定和未关闭事项，再回到合作记录沉淀。',
    action: '进入功能',
    mode: 'local',
    tool: 'record-summary',
  },
  {
    id: 'publish-flow',
    eyebrow: '流程入口',
    title: '进入真实发任务流程',
    description: '带着整理好的需求，回到正式发布链继续填写预算、复核和发布方式。',
    action: '进入发布流程',
    mode: 'route',
    target: roleRouteMap.enterprise.publish,
  },
];
const talentEntryCards = [
  {
    id: 'message-draft',
    eyebrow: '功能 01',
    title: '沟通起草',
    description: '先把申请沟通、跟进回复和澄清说明整理成可直接发送的草稿。',
    action: '进入功能',
    mode: 'local',
    tool: 'message-draft',
  },
  {
    id: 'review-draft',
    eyebrow: '功能 02',
    title: '验收说明',
    description: '把交付反馈、补充说明和评级理由先整理清楚，再回到验收页提交。',
    action: '进入功能',
    mode: 'local',
    tool: 'review-draft',
  },
  {
    id: 'record-summary',
    eyebrow: '功能 03',
    title: '记录总结',
    description: '沉淀时间线、关键决定和未关闭事项，再回到合作记录继续推进。',
    action: '进入功能',
    mode: 'local',
    tool: 'record-summary',
  },
];

const entryCards = computed(() => (assistantAudience.value === 'talent' ? talentEntryCards : enterpriseEntryCards));
const availableLocalToolIds = computed(() => entryCards.value.filter((card) => card.mode === 'local').map((card) => card.tool));
const defaultTool = computed(() => (assistantAudience.value === 'talent' ? 'message-draft' : 'task-breakdown'));
const primaryEntryCards = computed(() => (
  assistantAudience.value === 'talent'
    ? entryCards.value.slice(0, 1)
    : entryCards.value.filter((card) => ['task-breakdown', 'publish-flow'].includes(card.id))
));
const secondaryEntryCards = computed(() => (
  assistantAudience.value === 'talent'
    ? entryCards.value.slice(1)
    : entryCards.value.filter((card) => !['task-breakdown', 'publish-flow'].includes(card.id))
));
const assistantEntryCopy = computed(() => (
  assistantAudience.value === 'talent'
    ? {
        eyebrow: '人才助手',
        title: '围绕当前任务继续准备沟通、验收和记录',
        description: '这里保留和当前合作更相关的动作。先进入一个明确功能，再回到真实聊天、验收或记录页继续推进。',
      }
    : {
        eyebrow: '企业助手',
        title: '选择这次要让 AI 帮你完成的动作',
        description: '先进入一个明确功能，再在单一页面里完成输入和生成。需要发任务时，直接回到真实发布流程，不在助手里再造一套发布页。',
      }
));
function queryText(key) {
  return typeof route.query[key] === 'string' ? route.query[key].trim() : '';
}

const assistantContextMeta = computed(() => [
  queryText('contextStage'),
  queryText('contextMilestone'),
].filter(Boolean));
const assistantContextTitle = computed(() => queryText('contextTitle'));
const assistantContextPartner = computed(() => queryText('contextPartner'));
const attachedTaskId = computed(() => queryText('taskId'));
const attachedRecordId = computed(() => queryText('recordId'));
const attachedRoomKey = computed(() => queryText('roomKey') || queryText('room'));
const assistantSurface = computed(() => (queryText('assistantSurface') || queryText('surface') || queryText('source')).toLowerCase());
const hasAttachedContext = computed(() => (
  Boolean(
    assistantContextTitle.value
      || assistantContextPartner.value
      || assistantContextMeta.value.length
      || attachedRecordId.value
      || attachedTaskId.value
      || attachedRoomKey.value
  )
));
const assistantContextSummary = computed(() => {
  const parts = [
    assistantContextPartner.value ? `当前对象：${assistantContextPartner.value}` : '',
    ...assistantContextMeta.value,
  ].filter(Boolean);
  return parts.length
    ? parts.join(' · ')
    : '当前页已带上任务上下文，生成结果会围绕这条任务继续整理。';
});
const preferredContextTool = computed(() => {
  if (!hasAttachedContext.value) return '';
  const surface = assistantSurface.value;
  if (surface.includes('acceptance') || surface.includes('review')) return 'review-draft';
  if (surface.includes('record') || surface.includes('history') || surface.includes('contract') || surface.includes('workspace') || surface.includes('settlement')) return 'record-summary';
  if (surface.includes('messages') || surface.includes('chat')) return 'message-draft';
  if (surface.includes('matching') || surface.includes('recruiting') || surface.includes('application') || surface.includes('opportunity')) {
    return assistantAudience.value === 'enterprise' ? 'talent-fit' : 'message-draft';
  }
  return defaultTool.value;
});

const toolMode = computed(() => {
  const queryTool = typeof route.query.tool === 'string' ? route.query.tool.trim() : '';
  if (availableLocalToolIds.value.includes(queryTool)) return queryTool;
  if (taskBreakdownInput.value.trim()) return defaultTool.value;
  if (hasAttachedContext.value && preferredContextTool.value) return preferredContextTool.value;
  return 'entry';
});
const activeToolConfig = computed(() => toolConfigs[toolMode.value] || toolConfigs['task-breakdown']);

const analysisTitle = computed(() => String(analysisResult.value?.title || deriveBreakdownTitle(taskBreakdownInput.value)).trim() || `AI 已经帮你整理好一版${activeToolConfig.value.eyebrow}`);
const analysisBrief = computed(() => String(analysisResult.value?.brief || analysisResult.value?.originalBrief || activeToolConfig.value.noteDescription).trim());
const analysisTags = computed(() => Array.isArray(analysisResult.value?.tags) ? analysisResult.value.tags.filter(Boolean) : []);
const normalizedRecommendations = computed(() => {
  return Array.isArray(analysisResult.value?.recommendations)
    ? analysisResult.value.recommendations.map((item) => String(item || '').trim()).filter(Boolean)
    : [];
});
const normalizedModules = computed(() => {
  return Array.isArray(analysisResult.value?.modules)
    ? analysisResult.value.modules
        .map((item, index) => {
          if (item && typeof item === 'object') {
            return {
              id: item.id || `module-${index + 1}`,
              title: String(item.title || item.name || item.module || `建议 ${index + 1}`).trim(),
              duration: String(item.duration || item.timeline || item.period || '').trim(),
              output: String(item.output || item.deliverable || item.result || item.goal || '').trim(),
              summary: String(item.summary || item.note || item.description || '').trim(),
            };
          }
          return {
            id: `module-${index + 1}`,
            title: `建议 ${index + 1}`,
            duration: '',
            output: String(item || '').trim(),
            summary: '',
          };
        })
        .filter((item) => item.title || item.output || item.summary)
    : [];
});
const taskBreakdownHint = computed(() => `${taskBreakdownInput.value.trim().length} 字 / ${activeToolConfig.value.hintSuffix}`);

function deriveBreakdownTitle(text) {
  const normalized = String(text || '').trim();
  if (!normalized) return '';
  const [firstLine] = normalized.split(/\n+/);
  return firstLine.slice(0, 30);
}

function openLocalTool(tool = 'task-breakdown') {
  errorMessage.value = '';
  analysisResult.value = null;
  taskBreakdownInput.value = '';
  router.push({
    path: roleRouteMap[assistantAudience.value].assistant,
    query: {
      ...route.query,
      tool,
    },
  });
}

function goBackToEntry() {
  errorMessage.value = '';
  analysisResult.value = null;
  router.push({ path: roleRouteMap[assistantAudience.value].assistant });
}

function handleEntryCard(card) {
  if (card.mode === 'local') {
    openLocalTool(card.tool);
    return;
  }
  router.push(card.target);
}

function resetBreakdown() {
  errorMessage.value = '';
  analysisResult.value = null;
  taskBreakdownInput.value = '';
}

function applyQuickPrompt(text) {
  errorMessage.value = '';
  analysisResult.value = null;
  taskBreakdownInput.value = String(text || '').trim();
}

async function handleAnalyze() {
  errorMessage.value = '';
  const brief = taskBreakdownInput.value.trim();
  if (!brief) {
    errorMessage.value = `先填写${activeToolConfig.value.inputLabel}，再继续。`;
    return;
  }
  isAnalyzing.value = true;
  analysisResult.value = null;
  try {
    const response = await analyzeTaskBrief({
      title: deriveBreakdownTitle(brief),
      brief,
      source: 'TEXT',
      presetId: activeToolConfig.value.presetId,
      presetTitle: activeToolConfig.value.presetTitle,
      presetTags: activeToolConfig.value.presetTags,
    });
    const failed = Boolean(response?.requestError || response?.status === 'FAILED' || response?.success === false);
    if (failed) {
      errorMessage.value = response?.requestError || response?.nextStep || `当前暂时无法生成${activeToolConfig.value.eyebrow}，请稍后再试。`;
      return;
    }
    analysisResult.value = response;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : `当前暂时无法生成${activeToolConfig.value.eyebrow}，请稍后再试。`;
  } finally {
    isAnalyzing.value = false;
  }
}

function handlePrimaryAction() {
  if (activeToolConfig.value.primaryTarget !== 'publish') {
    router.push(roleRouteMap[assistantAudience.value][activeToolConfig.value.primaryTarget]);
    return;
  }
  const title = analysisTitle.value || deriveBreakdownTitle(taskBreakdownInput.value);
  const brief = analysisBrief.value || taskBreakdownInput.value.trim();
  router.push({
    path: roleRouteMap[assistantAudience.value].publish,
    query: {
      entrySource: 'assistant',
      ...(title ? { title } : {}),
      ...(brief ? { brief } : {}),
    },
  });
}

watch(
  () => route.query,
  (query) => {
    const parts = [];
    const handoffToken = typeof query.handoff === 'string' ? query.handoff.trim() : '';
    if (handoffToken && handoffToken !== consumedHandoffToken.value) {
      const handoff = consumeAssistantDraftHandoff(handoffToken);
      if (handoff?.text) parts.push(String(handoff.text));
      consumedHandoffToken.value = handoffToken;
    }
    if (typeof query.title === 'string' && query.title.trim()) {
      parts.push(`任务标题：${query.title.trim()}`);
    }
    if (typeof query.brief === 'string' && query.brief.trim()) {
      parts.push(query.brief.trim());
    }
    const seedText = parts.join('\n\n').trim();
    if (seedText && !taskBreakdownInput.value.trim()) {
      taskBreakdownInput.value = seedText;
    }
    const queryTool = typeof query.tool === 'string' ? query.tool : '';
    const nextTool = seedText
      ? defaultTool.value
      : (!availableLocalToolIds.value.includes(queryTool) && hasAttachedContext.value && preferredContextTool.value)
        ? preferredContextTool.value
        : '';
    if (nextTool && !availableLocalToolIds.value.includes(queryTool)) {
      router.replace({
        path: route.path,
        query: {
          ...query,
          tool: nextTool,
        },
      });
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.assistant-entry-shell,
.assistant-tool-shell {
  max-width: 1080px;
  margin: 0 auto;
  padding: 20px 0 56px;
  display: grid;
  gap: 20px;
}

.assistant-entry-hero,
.assistant-tool-hero {
  display: grid;
  gap: 10px;
  max-width: 760px;
}

.assistant-eyebrow {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #f4f7ef;
  color: #6c7767;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.assistant-entry-hero h1,
.assistant-tool-hero h1 {
  margin: 0;
  font-size: clamp(34px, 4vw, 58px);
  line-height: 1;
  letter-spacing: -0.06em;
}

.assistant-entry-hero p,
.assistant-tool-hero p,
.assistant-inline-note p,
.assistant-inline-alert p,
.assistant-result-block p,
.assistant-result-card p,
.assistant-result-card small,
.assistant-entry-card p {
  margin: 0;
  color: #667262;
  line-height: 1.65;
}

.assistant-entry-priority,
.assistant-entry-secondary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.assistant-entry-priority {
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.85fr);
}

.assistant-entry-secondary-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.assistant-entry-card {
  display: grid;
  gap: 10px;
  min-height: 180px;
  padding: 22px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: linear-gradient(180deg, #ffffff 0%, #fcfdf9 100%);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04);
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.assistant-entry-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.07);
}

.assistant-entry-card.is-featured {
  min-height: 220px;
  padding: 28px;
  border-color: rgba(16, 138, 0, 0.18);
  background:
    radial-gradient(circle at top right, rgba(16, 138, 0, 0.08), transparent 42%),
    linear-gradient(180deg, #f7fbf4 0%, #ffffff 100%);
}

.assistant-entry-card.is-featured strong {
  font-size: 32px;
}

.assistant-entry-card.is-secondary {
  min-height: 148px;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 18px;
  padding: 20px 22px;
  background: #ffffff;
}

.assistant-entry-card strong {
  font-size: 24px;
  line-height: 1.12;
  letter-spacing: -0.03em;
}

.assistant-entry-card__copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.assistant-entry-card__kicker {
  color: #6f7b6c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.assistant-entry-card small {
  margin-top: auto;
  color: #108a00;
  font-size: 15px;
  font-weight: 700;
}

.assistant-tool-card {
  display: grid;
  gap: 20px;
  padding: 28px;
  border-radius: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #ffffff;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
}

.assistant-inline-note,
.assistant-inline-alert,
.assistant-result-block,
.assistant-recommendation-block {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 20px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fafcf8;
}

.assistant-inline-note {
  background: linear-gradient(180deg, #fbfcf8 0%, #f6f8f1 100%);
}

.assistant-inline-alert.is-error {
  background: #fff3f1;
  border-color: rgba(190, 65, 46, 0.16);
  color: #a03a22;
}

.assistant-inline-alert strong,
.assistant-inline-note strong,
.assistant-result-block h2,
.assistant-recommendation-block strong {
  margin: 0;
}

.assistant-result-block h2 {
  font-size: 30px;
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.assistant-compose {
  display: grid;
  gap: 12px;
}

.assistant-quick-prompt-block {
  display: grid;
  gap: 10px;
}

.assistant-quick-prompt-label {
  color: #61705d;
  font-size: 13px;
  font-weight: 700;
}

.assistant-quick-prompt-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.assistant-quick-prompt {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #ffffff;
  color: #324131;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.assistant-quick-prompt:hover {
  transform: translateY(-1px);
  border-color: rgba(16, 138, 0, 0.22);
  background: #f8fbf5;
}

.assistant-compose label {
  color: #576453;
  font-size: 15px;
  font-weight: 600;
}

.assistant-textarea {
  width: 100%;
  min-height: 240px;
  resize: vertical;
  border-radius: 22px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: #fbfcf8;
  padding: 18px 20px;
  font: inherit;
  color: #1c271c;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.assistant-textarea:focus {
  border-color: rgba(16, 138, 0, 0.38);
  box-shadow: 0 0 0 4px rgba(16, 138, 0, 0.12);
}

.assistant-compose__footer,
.assistant-tool-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.assistant-compose__footer span {
  color: #748072;
  font-size: 14px;
}

.assistant-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.assistant-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.assistant-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.assistant-button--primary {
  background: #108a00;
  border-color: #108a00;
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(16, 138, 0, 0.18);
}

.assistant-button--ghost {
  background: #ffffff;
  color: #1c271c;
}

.assistant-result-list {
  display: grid;
  gap: 12px;
}

.assistant-result-card {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-left: 4px solid rgba(16, 138, 0, 0.28);
  background: #f8faf5;
}

.assistant-result-card__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}

.assistant-result-card__head strong {
  font-size: 20px;
  line-height: 1.2;
}

.assistant-result-card__head span {
  color: #70806e;
  font-size: 14px;
  white-space: nowrap;
}

.assistant-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.assistant-chip {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: #f7f8f3;
  color: #425042;
}

.assistant-chip.is-filled {
  background: #edf7e8;
  border-color: rgba(16, 138, 0, 0.18);
}

@media (max-width: 980px) {
  .assistant-entry-secondary-grid {
    grid-template-columns: 1fr;
  }

  .assistant-entry-priority {
    grid-template-columns: 1fr;
  }

  .assistant-entry-card.is-secondary {
    grid-template-columns: 1fr;
    align-items: start;
  }
}
</style>
