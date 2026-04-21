<template>
  <section class="publish-upwork-shell">
    <header class="publish-upwork-hero">
      <span class="publish-upwork-eyebrow">发布任务 / 第 {{ publishStep + 1 }} 步</span>
      <div class="publish-upwork-hero__grid">
        <div>
          <h1>{{ publishStepTitle }}</h1>
          <p>{{ publishStepSummary }}</p>
        </div>
        <aside class="publish-upwork-context">
          <strong>{{ entrySourceLabel }}</strong>
          <span v-if="selectedTalentName">当前人才：{{ selectedTalentName }}</span>
          <p>{{ contextualSummary }}</p>
        </aside>
      </div>
    </header>

    <ol class="publish-upwork-stepper">
      <li
        v-for="(step, index) in publishSteps"
        :key="step.id"
        class="publish-upwork-stepper__item"
        :class="publishStepClass(index)"
      >
        <span>{{ index + 1 }}</span>
        <strong>{{ step.title }}</strong>
        <small>{{ step.caption }}</small>
      </li>
    </ol>

    <article class="publish-upwork-card">
      <div v-if="errorDialogMessage" class="publish-upwork-alert is-error">
        <strong>当前状态</strong>
        <p>{{ errorDialogMessage }}</p>
      </div>

      <div v-if="draftSavedMessage" class="publish-upwork-alert is-note">
        <strong>草稿已保存</strong>
        <p>{{ draftSavedMessage }}</p>
      </div>

      <template v-if="publishStep === 0">
        <section class="publish-upwork-panel">
          <header class="publish-upwork-panel__header">
            <span class="publish-upwork-panel__eyebrow">起点</span>
            <h2>先选一条发布起点</h2>
            <p>先决定新建还是复用，再决定这是长期合作还是短期项目。</p>
          </header>

          <div class="publish-choice-grid">
            <button
              type="button"
              class="publish-choice-card"
              :class="{ 'is-selected': draft.sourceMode === 'new' }"
              @click="draft.sourceMode = 'new'"
            >
              <span class="publish-choice-card__eyebrow">主要动作</span>
              <strong>我想创建一份新职位</strong>
              <p>从零开始发布这份任务。</p>
            </button>
            <button
              type="button"
              class="publish-choice-card"
              :class="{ 'is-selected': draft.sourceMode === 'rework' }"
              @click="draft.sourceMode = 'rework'"
            >
              <span class="publish-choice-card__eyebrow">次级动作</span>
              <strong>我想基于旧职位重做</strong>
              <p>沿用一份已有职位，再重新修改并发布。</p>
            </button>
          </div>

          <div class="publish-choice-grid">
            <button
              type="button"
              class="publish-choice-card"
              :class="{ 'is-selected': draft.term === 'long_term' }"
              @click="draft.term = 'long_term'"
            >
              <span class="publish-choice-card__eyebrow">项目周期</span>
              <strong>长期项目</strong>
              <p>适合持续合作、按小时推进。</p>
            </button>
            <button
              type="button"
              class="publish-choice-card"
              :class="{ 'is-selected': draft.term === 'short_term' }"
              @click="draft.term = 'short_term'"
            >
              <span class="publish-choice-card__eyebrow">项目周期</span>
              <strong>短期项目</strong>
              <p>适合固定范围、明确交付。</p>
            </button>
          </div>

          <div v-if="selectedTalentName" class="publish-context-card">
            <span class="publish-context-card__eyebrow">当前对象</span>
            <strong>{{ selectedTalentName }}</strong>
            <p>这次会沿着当前人才入口继续发布，任务发布后可以直接进入协商或邀请。</p>
          </div>
        </section>
      </template>

      <template v-else-if="publishStep === 1">
        <section class="publish-upwork-panel">
          <header class="publish-upwork-panel__header">
            <span class="publish-upwork-panel__eyebrow">描述</span>
            <h2>请描述您的需求</h2>
            <p>这里保留最少输入：一个标题，一段简洁描述，然后由 AI 帮你继续拆分任务。</p>
          </header>

          <div class="publish-field-grid">
            <div class="publish-field publish-field--full">
              <label>任务标题</label>
              <input v-model.trim="draft.title" class="publish-input" type="text" placeholder="例如：为新产品发布会制作 8 支短视频" />
            </div>

            <div class="publish-field publish-field--full">
              <label>任务简介</label>
              <textarea
                v-model.trim="draft.brief"
                class="publish-textarea"
                rows="8"
                placeholder="用一句到两句说明你需要什么结果、交付范围、合作节奏和截止时间。"
              ></textarea>
              <div class="publish-helper-line">
                <span>{{ descriptionCountLabel }}</span>
                <span>先把核心结果写清，再进入预算和复核。</span>
              </div>
            </div>
          </div>

          <div v-if="analysisResult" class="publish-analysis-summary-card">
              <span class="publish-choice-card__eyebrow">AI 拆分预览</span>
              <h3>{{ analysisResult.title || 'AI 已经先帮你整理出一版结构' }}</h3>
              <p class="publish-analysis-summary-note">{{ analysisResult.brief || analysisResult.originalBrief || '继续到预算和复核里查看详细建议。' }}</p>
              <div v-if="normalizedAnalysisStandardSkills.length || normalizedAnalysisCustomSkills.length" class="publish-analysis-skill-groups">
                <div v-if="normalizedAnalysisStandardSkills.length" class="publish-analysis-skill-group">
                  <span class="publish-choice-card__eyebrow">标准标签</span>
                  <div class="publish-chip-list publish-chip-list--wrap">
                    <span
                      v-for="tag in normalizedAnalysisStandardSkills"
                      :key="`standard-${tag}`"
                      class="publish-chip is-standard"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
                <div v-if="normalizedAnalysisCustomSkills.length" class="publish-analysis-skill-group">
                  <span class="publish-choice-card__eyebrow">自定义标签</span>
                  <div class="publish-chip-list publish-chip-list--wrap">
                    <span
                      v-for="tag in normalizedAnalysisCustomSkills"
                      :key="`custom-${tag}`"
                      class="publish-chip is-custom"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
          </div>
        </section>
      </template>

      <template v-else-if="publishStep === 2">
        <section class="publish-upwork-panel">
          <header class="publish-upwork-panel__header">
            <span class="publish-upwork-panel__eyebrow">预算</span>
            <h2>告诉我们你的预算</h2>
            <p>先切预算模式，再填写预算范围，不提前展开其它可选模块。</p>
          </header>

          <div class="publish-choice-grid">
            <button
              type="button"
              class="publish-choice-card"
              :class="{ 'is-selected': draft.budgetMode === 'hourly' }"
              @click="draft.budgetMode = 'hourly'"
            >
              <span class="publish-choice-card__eyebrow">模式</span>
              <strong>按时计费</strong>
              <p>适合长期项目与持续协作。</p>
            </button>
            <button
              type="button"
              class="publish-choice-card"
              :class="{ 'is-selected': draft.budgetMode === 'fixed' }"
              @click="draft.budgetMode = 'fixed'"
            >
              <span class="publish-choice-card__eyebrow">模式</span>
              <strong>固定总价</strong>
              <p>适合明确范围和固定交付。</p>
            </button>
          </div>

          <div class="publish-field-grid">
            <div class="publish-field">
              <label>{{ draft.budgetMode === 'hourly' ? '最低时薪' : '最低预算' }}</label>
              <input v-model.trim="draft.budgetMin" class="publish-input" type="text" placeholder="例如：8000" />
            </div>
            <div class="publish-field">
              <label>{{ draft.budgetMode === 'hourly' ? '最高时薪' : '最高预算' }}</label>
              <input v-model.trim="draft.budgetMax" class="publish-input" type="text" placeholder="例如：20000" />
            </div>
          </div>

          <div class="publish-context-card">
            <span class="publish-context-card__eyebrow">预算提示</span>
            <p>{{ budgetSummary }}</p>
          </div>
        </section>
      </template>

      <template v-else-if="publishStep === 3">
        <section class="publish-upwork-panel">
          <header class="publish-upwork-panel__header">
            <span class="publish-upwork-panel__eyebrow">复核</span>
            <h2>先核对这份任务</h2>
            <p>先看标题、描述和预算；如果还有额外限制或备注，再在下面补一句说明。</p>
          </header>

          <article class="publish-review-card">
            <span class="publish-choice-card__eyebrow">核心摘要</span>
            <div class="publish-review-list">
              <div class="publish-review-row">
                <span>标题</span>
                <strong>{{ draft.title || sectionStateLabels.pending }}</strong>
              </div>
              <div class="publish-review-row">
                <span>需求描述</span>
                <strong>{{ draft.brief || sectionStateLabels.pending }}</strong>
              </div>
              <div class="publish-review-row">
                <span>预算</span>
                <strong>{{ budgetSummary }}</strong>
              </div>
              <div class="publish-review-row">
                <span>项目周期</span>
                <strong>{{ draft.term === 'long_term' ? '长期项目' : '短期项目' }}</strong>
              </div>
              <div class="publish-review-row">
                <span>技能要求</span>
                <strong>{{ skillSummaryLabel }}</strong>
              </div>
            </div>
          </article>

          <div v-if="analysisResult" class="publish-analysis-summary-card">
            <span class="publish-choice-card__eyebrow">AI 拆分建议</span>
            <h3>{{ analysisResult.title || 'AI 已经帮你整理好一版任务拆分' }}</h3>
            <p class="publish-analysis-summary-note">{{ analysisResult.brief || analysisResult.originalBrief || '可继续采纳这版建议。' }}</p>
            <div v-if="normalizedAnalysisModules.length" class="publish-analysis-module-list">
              <article v-for="item in normalizedAnalysisModules" :key="item.id" class="publish-analysis-module">
                <div class="publish-analysis-module__head">
                  <strong>{{ item.title }}</strong>
                  <span v-if="item.duration">{{ item.duration }}</span>
                </div>
                <p v-if="item.output">{{ item.output }}</p>
                <small v-if="item.summary">{{ item.summary }}</small>
              </article>
            </div>
            <div v-if="normalizedAnalysisRecommendations.length" class="publish-analysis-recommendation-list">
              <div
                v-for="(item, index) in normalizedAnalysisRecommendations"
                :key="`${item}-${index}`"
                class="publish-analysis-list__item"
              >
                {{ item }}
              </div>
            </div>
            <div v-if="normalizedAnalysisStandardSkills.length || normalizedAnalysisCustomSkills.length" class="publish-analysis-skill-groups">
              <div v-if="normalizedAnalysisStandardSkills.length" class="publish-analysis-skill-group">
                <span class="publish-choice-card__eyebrow">标准标签</span>
                <div class="publish-chip-list publish-chip-list--wrap">
                  <span
                    v-for="tag in normalizedAnalysisStandardSkills"
                    :key="`review-standard-${tag}`"
                    class="publish-chip is-standard"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
              <div v-if="normalizedAnalysisCustomSkills.length" class="publish-analysis-skill-group">
                <span class="publish-choice-card__eyebrow">自定义标签</span>
                <div class="publish-chip-list publish-chip-list--wrap">
                  <span
                    v-for="tag in normalizedAnalysisCustomSkills"
                    :key="`review-custom-${tag}`"
                    class="publish-chip is-custom"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="publish-context-card">
            <span class="publish-context-card__eyebrow">AI 建议</span>
            <p>当前还没有生成 AI 拆分建议。你可以直接继续核对信息，也可以点上方按钮重新生成。</p>
          </div>

          <article class="publish-optional-card publish-optional-card--skills">
            <span class="publish-choice-card__eyebrow">技能要求</span>
            <label>共享预置标签用于标准匹配，自定义补充标签用于更具体的经验和限制。</label>

            <div class="publish-skill-group">
              <div class="publish-skill-group__header">
                <strong>共享预置标签</strong>
                <small>点击即可加入或移除</small>
              </div>
              <div class="publish-chip-list publish-chip-list--wrap">
                <button
                  v-for="tag in sharedSkillOptions"
                  :key="`shared-${tag}`"
                  type="button"
                  class="publish-chip-button"
                  :class="{ 'is-selected': draft.skills.includes(tag) }"
                  @click="toggleStandardSkill(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <div class="publish-skill-group">
              <div class="publish-skill-group__header">
                <strong>自定义补充标签</strong>
                <small>适合补充行业、工具或合作约束</small>
              </div>
              <div class="publish-skill-input-row">
                <input
                  v-model.trim="draft.customSkillDraft"
                  class="publish-input"
                  type="text"
                  placeholder="例如：海外投放经验、A/B 测试、直播运营"
                  @keydown.enter.prevent="addCustomSkillDraft"
                />
                <button type="button" class="button-secondary" @click="addCustomSkillDraft">添加</button>
              </div>
              <div v-if="draft.customSkills.length" class="publish-chip-list publish-chip-list--wrap">
                <button
                  v-for="tag in draft.customSkills"
                  :key="`custom-selected-${tag}`"
                  type="button"
                  class="publish-chip-button is-custom is-selected"
                  @click="removeCustomSkill(tag)"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </article>

          <article class="publish-optional-card publish-optional-card--notes">
            <span class="publish-choice-card__eyebrow">补充说明</span>
            <label>如果还有额外说明、交付限制或合作备注，可以直接写在这里。</label>
            <textarea
              v-model.trim="draft.additionalNotes"
              class="publish-textarea publish-textarea--compact"
              rows="4"
              placeholder="例如：希望每周一同步一次进度，或需要先提交初版再继续扩展。"
            ></textarea>
          </article>
        </section>
      </template>

      <template v-else>
        <section class="publish-upwork-panel">
          <header class="publish-upwork-panel__header">
            <span class="publish-upwork-panel__eyebrow">发布</span>
            <h2>{{ publishResult ? publishResult.title : '选择发布方式' }}</h2>
            <p>{{ publishResult ? publishResult.body : '这里只处理发布方式、优先展示和草稿，不再编辑正文。' }}</p>
          </header>

          <template v-if="publishResult">
            <div class="publish-result-card" :class="`is-${publishResult.tone}`">
              <span class="publish-choice-card__eyebrow">当前状态</span>
              <h3>{{ publishResult.title }}</h3>
              <p>{{ publishResult.body }}</p>
            </div>
            <section v-if="publishRecommendedTalents.length" class="publish-talent-reel">
              <div class="publish-talent-reel__header">
                <div class="publish-talent-reel__header-main">
                  <span class="publish-choice-card__eyebrow">推荐人才</span>
                  <p>先看下方匹配人才，点击卡片进入人才详情。</p>
                </div>
                <span class="publish-talent-reel__hint">左右滑动查看更多</span>
              </div>
              <div class="publish-talent-carousel">
                <router-link
                  v-for="talent in publishRecommendedTalents"
                  :key="talent.id"
                  class="publish-talent-card"
                  :to="talent.detailRoute"
                >
                  <div class="publish-talent-card__top">
                    <div class="publish-talent-card__avatar">
                      <img v-if="talent.avatarUrl" :src="talent.avatarUrl" :alt="talent.name" />
                      <span v-else>{{ talent.avatarLetter }}</span>
                    </div>
                    <div class="publish-talent-card__identity">
                      <strong>{{ talent.name }}</strong>
                      <p>{{ talent.role }}</p>
                    </div>
                  </div>
                  <div class="publish-talent-card__meta">
                    <div class="publish-talent-card__signal">
                      <span class="publish-talent-card__signal-label">评分</span>
                      <strong class="publish-talent-card__signal-value">{{ talent.scoreLabel }}</strong>
                    </div>
                    <div class="publish-talent-card__signal">
                      <span class="publish-talent-card__signal-label">价格</span>
                      <strong class="publish-talent-card__signal-value">{{ talent.priceLabel }}</strong>
                    </div>
                  </div>
                  <div v-if="talent.standardSkills.length || talent.customSkills.length" class="publish-talent-card__tags">
                    <div v-if="talent.standardSkills.length" class="publish-talent-card__tag-group">
                      <span class="publish-talent-card__tag-label">标准标签</span>
                      <div class="publish-chip-list publish-chip-list--wrap">
                      <span
                        v-for="tag in talent.standardSkills"
                        :key="`talent-standard-${talent.id}-${tag}`"
                        class="publish-chip is-standard"
                      >
                        {{ tag }}
                      </span>
                      </div>
                    </div>
                    <div v-if="talent.customSkills.length" class="publish-talent-card__tag-group">
                      <span class="publish-talent-card__tag-label">自定义标签</span>
                      <div class="publish-chip-list publish-chip-list--wrap">
                      <span
                        v-for="tag in talent.customSkills"
                        :key="`talent-custom-${talent.id}-${tag}`"
                        class="publish-chip is-custom"
                      >
                        {{ tag }}
                      </span>
                      </div>
                    </div>
                  </div>
                  <span class="publish-talent-card__cta">查看人才详情 <span aria-hidden="true">→</span></span>
                </router-link>
              </div>
            </section>
          </template>

          <template v-else>
            <div class="publish-choice-grid">
              <button
                type="button"
                class="publish-choice-card"
                :class="{ 'is-selected': draft.publishMode === 'standard' }"
                @click="draft.publishMode = 'standard'"
              >
                <span class="publish-choice-card__eyebrow">默认方案</span>
                <strong>发布标准职位</strong>
                <p>用自然流量进入市场，先发布，再观察匹配反馈。</p>
              </button>
              <button
                type="button"
                class="publish-choice-card"
                :class="{ 'is-selected': draft.publishMode === 'featured' }"
                @click="draft.publishMode = 'featured'"
              >
                <span class="publish-choice-card__eyebrow">优先方案</span>
                <strong>发布优先展示职位</strong>
                <p>优先进入更高曝光和更快审核流，但只在最后一步出现。</p>
              </button>
            </div>

            <div class="publish-context-card">
              <span class="publish-context-card__eyebrow">最终检查</span>
              <p>{{ finalSummary }}</p>
            </div>
          </template>
        </section>
      </template>
    </article>

    <footer class="publish-upwork-actions">
      <button type="button" class="button-secondary" @click="goPrevStep">{{ publishStep === 0 ? '返回工作台' : '返回' }}</button>

      <div class="publish-upwork-actions__right">
        <button v-if="showAiAction" type="button" class="button-secondary" :disabled="isAnalyzing" @click="handleAiAction">
          {{ isAnalyzing ? 'AI 处理中…' : aiActionLabel }}
        </button>
        <button
          v-if="publishStep === 4 && !publishResult"
          type="button"
          class="button-secondary"
          @click="saveDraftManually"
        >
          保存草稿
        </button>
        <button type="button" class="button-primary" :disabled="isPublishing" @click="goNextStep">
          {{ primaryActionLabel }}
        </button>
      </div>
    </footer>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { analyzeTaskBrief, publishTask, selectTaskAssignment } from '../services/api';
import { roleRouteMap } from '../utils/roleRoutes';
import { SHARED_SKILL_OPTIONS, buildSharedSkillSelection, isPresetSharedSkill, resolveSharedSkillLabel } from '../utils/sharedSkillTags.js';

const route = useRoute();
const router = useRouter();

const DRAFT_STORAGE_NAMESPACE = 'youqinggong.publish-task-draft';
const DRAFT_SESSION_KEY = 'youqinggong.publish-task-session-key';

const publishStep = ref(0);
const isAnalyzing = ref(false);
const isPublishing = ref(false);
const errorDialogMessage = ref('');
const draftSavedMessage = ref('');
const publishResult = ref(null);
const analysisResult = ref(null);

const sectionStateLabels = {
  pending: '待完善',
  ready: '已就绪',
  optional: '可选',
};

const draft = reactive({
  sourceMode: 'new',
  term: 'short_term',
  title: '',
  brief: '',
  category: '',
  budgetMode: 'fixed',
  budgetMin: '',
  budgetMax: '',
  skills: [],
  customSkills: [],
  customSkillDraft: '',
  screeningQuestions: [],
  preferences: [],
  locationPreference: '',
  additionalNotes: '',
  languagePreference: '',
  contractToHire: false,
  priorityReview: false,
  publishMode: 'standard',
  aiSummary: '',
});

function ensureDraftSessionKey() {
  if (typeof window === 'undefined') {
    return 'server';
  }
  let key = sessionStorage.getItem(DRAFT_SESSION_KEY);
  if (!key) {
    key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(DRAFT_SESSION_KEY, key);
  }
  return key;
}

function buildDraftStorageKey() {
  const sessionKey = ensureDraftSessionKey();
  const entrySource = typeof route.query.entrySource === 'string' ? route.query.entrySource : 'direct';
  const talentUserId = typeof route.query.talentUserId === 'string' ? route.query.talentUserId : 'general';
  return `${DRAFT_STORAGE_NAMESPACE}:${entrySource}:${talentUserId}:${sessionKey}`;
}

const draftStorageKey = ref(buildDraftStorageKey());

function normalizeEntrySourceLabel(source) {
  const normalized = String(source || '').toLowerCase();
  if (normalized.includes('talent') || normalized.includes('market')) return '人才搜索';
  if (normalized.includes('detail') || normalized.includes('profile')) return '人才档案';
  if (normalized.includes('recommend') || normalized.includes('assistant')) return '助手推荐';
  if (normalized.includes('message') || normalized.includes('chat')) return '消息';
  if (normalized.includes('publish')) return '任务发布';
  if (normalized.includes('record') || normalized.includes('history')) return '合作记录';
  return '当前入口';
}

const entrySourceLabel = computed(() => normalizeEntrySourceLabel(route.query.entrySource));
const selectedTalentUserId = computed(() => (typeof route.query.talentUserId === 'string' ? route.query.talentUserId : ''));
const selectedTalentName = computed(() => (typeof route.query.talentName === 'string' ? route.query.talentName : ''));

const publishSteps = [
  { id: 'start', title: '起点', caption: '新建 / 复用 + 项目周期' },
  { id: 'description', title: '描述', caption: '一句话到两句话写清需求' },
  { id: 'budget', title: '预算', caption: '只处理预算模式和预算值' },
  { id: 'review', title: '核对', caption: '汇总核心信息，再补可选项' },
  { id: 'finalize', title: '发布', caption: '标准 / 优先展示 / 草稿' },
];

const publishStepTitle = computed(() => {
  if (publishStep.value === 0) return '请先选择您的雇佣方式和项目周期';
  if (publishStep.value === 1) return '请描述您的需求';
  if (publishStep.value === 2) return '告诉我们你的预算';
  if (publishStep.value === 3) return '先核对这份任务，再补可选信息';
  return publishResult.value?.title || '选择发布方式';
});

const publishStepSummary = computed(() => {
  if (publishStep.value === 0) return '先决定新建还是复用，再决定长期或短期。';
  if (publishStep.value === 1) return '这里保留最少输入：标题、需求简介，再由 AI 帮你继续拆分任务。';
  if (publishStep.value === 2) return '这里只处理预算模式和预算值，不提前展开可选模块。';
  if (publishStep.value === 3) return '先看核心摘要，再决定要不要补技能、筛选问题和高级偏好。';
  return publishResult.value?.body || '这里只处理发布方式、优先展示与草稿。';
});

const contextualSummary = computed(() => {
  if (selectedTalentName.value) {
    return '这次会沿着当前人才入口继续发布，发布后可以直接衔接到邀请或协商。';
  }
  return '按照步骤来完成您的招聘规划，使用Ai分析更方便哦';
});

const descriptionCountLabel = computed(() => `${draft.brief.trim().length} 字 / 建议先写清结果、交付范围和合作节奏`);
const budgetSummary = computed(() => {
  const min = draft.budgetMin.trim();
  const max = draft.budgetMax.trim();
  if (!min && !max) {
    return '还没有填写预算。';
  }
  if (draft.budgetMode === 'hourly') {
    return `${min || '未填'} - ${max || '未填'} / 小时`;
  }
  return `${min || '未填'} - ${max || '未填'} / 项目`;
});

const finalSummary = computed(() => {
  const mode = draft.publishMode === 'featured' ? '优先展示' : '标准';
  return `当前会按 ${mode} 方案发布；标题、简介、预算和可选模块都会沿用当前复核内容。`;
});

function readFirstText(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text) return text;
  }
  return '';
}

function nameInitial(name) {
  const normalized = String(name || '').trim();
  return normalized ? normalized.slice(0, 1) : '人';
}

function normalizeTagList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/[,，、\n]/)
      .map((item) => String(item ?? '').trim())
      .filter(Boolean);
  }
  if (value && typeof value === 'object') {
    return normalizeTagList(value.skills || value.customSkills || value.tags || value.items || value.list);
  }
  return [];
}

function dedupeTagList(value) {
  return Array.from(new Set(normalizeTagList(value)));
}

const sharedSkillOptions = computed(() => SHARED_SKILL_OPTIONS);

const analysisSkillBuckets = computed(() => {
  const explicitStandard = dedupeTagList(analysisResult.value?.skills);
  const explicitCustom = dedupeTagList(analysisResult.value?.customSkills);
  const legacyTags = dedupeTagList(analysisResult.value?.tags);
  const selection = buildSharedSkillSelection(explicitStandard, [...explicitCustom, ...legacyTags]);
  return {
    standardSkills: dedupeTagList(selection.skills),
    customSkills: dedupeTagList(selection.customSkills),
  };
});

const normalizedAnalysisStandardSkills = computed(() => analysisSkillBuckets.value.standardSkills);
const normalizedAnalysisCustomSkills = computed(() => analysisSkillBuckets.value.customSkills);

const skillSummaryLabel = computed(() => {
  const standard = dedupeTagList(draft.skills);
  const custom = dedupeTagList(draft.customSkills);
  if (!standard.length && !custom.length) {
    return '尚未选择技能标签';
  }
  const preview = [...standard.slice(0, 2), ...custom.slice(0, 1)];
  const previewLabel = preview.length ? `，例如：${preview.join('、')}` : '';
  if (!standard.length) {
    return `${custom.length} 个自定义标签${previewLabel}`;
  }
  if (!custom.length) {
    return `${standard.length} 个共享标签${previewLabel}`;
  }
  return `${standard.length} 个共享标签 + ${custom.length} 个自定义标签${previewLabel}`;
});

function toggleStandardSkill(tag) {
  const normalized = String(tag || '').trim();
  if (!normalized) {
    return;
  }
  const next = dedupeTagList(draft.skills);
  const index = next.indexOf(normalized);
  if (index >= 0) {
    next.splice(index, 1);
  } else {
    next.push(normalized);
  }
  draft.skills = next;
}

function addCustomSkillDraft() {
  const normalized = String(draft.customSkillDraft || '').trim();
  if (!normalized) {
    return;
  }
  const resolved = resolveSharedSkillLabel(normalized);
  if (isPresetSharedSkill(resolved)) {
    toggleStandardSkill(resolved);
    draft.customSkillDraft = '';
    return;
  }
  const next = dedupeTagList(draft.customSkills);
  if (!next.includes(resolved)) {
    next.push(resolved);
  }
  draft.customSkills = next;
  draft.customSkillDraft = '';
}

function removeCustomSkill(tag) {
  const normalized = String(tag || '').trim();
  if (!normalized) {
    return;
  }
  draft.customSkills = dedupeTagList(draft.customSkills).filter((item) => item !== normalized);
}

const publishRecommendedTalents = computed(() => {
  const source = Array.isArray(publishResult.value?.recommendedTalents) && publishResult.value.recommendedTalents.length
    ? publishResult.value.recommendedTalents
    : Array.isArray(publishResult.value?.matchingPreview)
      ? publishResult.value.matchingPreview
      : [];
  return source
    .map((item, index) => {
      const slug = readFirstText(item?.slug);
      const name = readFirstText(item?.name, item?.talentName, `推荐人才 ${index + 1}`);
      const role = readFirstText(item?.role, item?.headline, '专业方向未公开');
      const scoreLabel = readFirstText(item?.score, item?.rating, '暂无');
      const priceLabel = readFirstText(
        item?.priceLabel,
        item?.budgetLabel,
        item?.priceRange,
        item?.rateRange,
        item?.expectedRate,
        item?.quote,
        item?.budget,
        `发布预算 · ${budgetSummary.value}`,
      );
      const tagSelection = buildSharedSkillSelection(
        dedupeTagList(item?.skills || item?.headlineTags || item?.tags),
        dedupeTagList(item?.customSkills)
      );
      return {
        id: readFirstText(item?.talentUserId, item?.platformUserId, item?.id, slug, `talent-${index + 1}`),
        name,
        role,
        scoreLabel,
        priceLabel,
        standardSkills: tagSelection.skills.slice(0, 3),
        customSkills: tagSelection.customSkills.slice(0, 2),
        avatarUrl: readFirstText(item?.avatar, item?.avatarUrl, item?.photo, item?.photoUrl),
        avatarLetter: nameInitial(name),
        detailRoute: slug ? roleRouteMap.enterprise.talentDetail(slug) : roleRouteMap.enterprise.market,
      };
    })
    .filter((item) => item.name)
    .slice(0, 8);
});

const normalizedAnalysisModules = computed(() => {
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

const normalizedAnalysisRecommendations = computed(() => {
  return Array.isArray(analysisResult.value?.recommendations)
    ? analysisResult.value.recommendations
        .map((item) => String(item || '').trim())
        .filter(Boolean)
    : [];
});

const aiActionLabel = computed(() => {
  if (publishStep.value === 0) return '用 AI 拆分任务';
  if (publishStep.value === 1) return '用 AI 拆分任务';
  if (publishStep.value === 3) return '刷新 AI 建议';
  return '';
});

const showAiAction = computed(() => [0, 1, 3].includes(publishStep.value) && !publishResult.value);
const primaryActionLabel = computed(() => {
  if (publishResult.value) {
    return publishResult.value.actionLabel;
  }
  if (publishStep.value === 4) {
    return isPublishing.value ? '正在发布…' : '发布职位';
  }
  return '继续';
});

function publishStepClass(index) {
  return {
    'is-current': publishStep.value === index,
    'is-complete': publishStep.value > index,
  };
}

function openErrorDialog(message) {
  errorDialogMessage.value = message;
}

function clearNotice() {
  errorDialogMessage.value = '';
  draftSavedMessage.value = '';
}

function restoreDraft() {
  if (typeof window === 'undefined') {
    return;
  }
  const raw = localStorage.getItem(draftStorageKey.value);
  if (!raw) {
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.draft || typeof parsed.draft !== 'object') {
      return;
    }
    Object.assign(draft, {
      ...draft,
      ...parsed.draft,
      preferences: Array.isArray(parsed.draft.preferences)
        ? parsed.draft.preferences
        : Array.isArray(parsed.draft['条合作偏好'])
          ? parsed.draft['条合作偏好']
          : [],
      skills: dedupeTagList(parsed.draft.skills || parsed.draft.standardSkills),
      customSkills: dedupeTagList(parsed.draft.customSkills),
      screeningQuestions: Array.isArray(parsed.draft.screeningQuestions) ? parsed.draft.screeningQuestions : [],
    });
    if (typeof parsed.publishStep === 'number') {
      publishStep.value = Math.max(0, Math.min(4, parsed.publishStep));
    }
    if (parsed.analysisResult) {
      analysisResult.value = parsed.analysisResult;
    }
  } catch (error) {
    console.warn('restore publish draft failed', error);
  }
}

function hydrateFromRoute() {
  if (route.query.brief) draft.brief = `${route.query.brief}`;
  if (route.query.title) draft.title = `${route.query.title}`;
}

function persistDraft() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(
    draftStorageKey.value,
    JSON.stringify({
      draft: {
        ...draft,
        preferences: draft.preferences,
      },
      publishStep: publishStep.value,
      analysisResult: analysisResult.value,
    }),
  );
}

function saveDraftManually() {
  persistDraft();
  draftSavedMessage.value = '当前浏览器里的草稿已经保存，可以稍后回到最后一步继续发布。';
}

async function handleAiAction() {
  clearNotice();
  if (publishStep.value === 0) {
    publishStep.value = 1;
    return;
  }
  const currentStep = publishStep.value;
  if (!draft.title.trim() && !draft.brief.trim()) {
    openErrorDialog('发布前先补全任务标题和任务简介。');
    return;
  }
  if (!draft.title.trim()) {
    openErrorDialog('先补任务标题。');
    return;
  }
  isAnalyzing.value = true;
  try {
    const payload = {
      title: draft.title,
      brief: draft.brief,
      source: 'TEXT',
      presetId: '',
      presetTitle: '',
      presetTags: [],
    };
    const result = await analyzeTaskBrief(payload);
    analysisResult.value = result;
    draft.aiSummary = result?.brief || result?.originalBrief || draft.aiSummary;
    const nextAnalysisStandardSkills = normalizedAnalysisStandardSkills.value;
    const nextAnalysisCustomSkills = normalizedAnalysisCustomSkills.value;
    if (nextAnalysisStandardSkills.length) {
      draft.skills = dedupeTagList([...draft.skills, ...nextAnalysisStandardSkills]);
    }
    if (nextAnalysisCustomSkills.length) {
      draft.customSkills = dedupeTagList([...draft.customSkills, ...nextAnalysisCustomSkills]);
    }
    publishStep.value = currentStep === 1 ? 2 : 3;
  } catch (error) {
    openErrorDialog(error instanceof Error ? error.message : '当前暂时无法生成 AI 拆分，请稍后重试。');
  } finally {
    isAnalyzing.value = false;
  }
}

function validateDescriptionStep() {
  if (!draft.title.trim() && !draft.brief.trim()) {
    openErrorDialog('发布前先补全任务标题和任务简介。');
    return false;
  }
  if (!draft.title.trim()) {
    openErrorDialog('先补任务标题。');
    return false;
  }
  if (!draft.brief.trim()) {
    openErrorDialog('先补任务简介。');
    return false;
  }
  return true;
}

function validateBudgetStep() {
  if (!draft.budgetMin.trim() && !draft.budgetMax.trim()) {
    openErrorDialog('先补预算。');
    return false;
  }
  const min = Number(draft.budgetMin);
  const max = Number(draft.budgetMax);
  if (draft.budgetMin.trim() && draft.budgetMax.trim() && Number.isFinite(min) && Number.isFinite(max) && min > max) {
    openErrorDialog('先把预算区间调整正确。');
    return false;
  }
  return true;
}

function goPrevStep() {
  clearNotice();
  if (publishResult.value) {
    publishResult.value = null;
    return;
  }
  if (publishStep.value === 0) {
    router.push(roleRouteMap.enterprise.home);
    return;
  }
  publishStep.value -= 1;
}

async function goNextStep() {
  clearNotice();
  if (publishResult.value) {
    router.push(publishResult.value.nextRoute || roleRouteMap.enterprise.home);
    return;
  }
  if (publishStep.value === 1 && !validateDescriptionStep()) {
    return;
  }
  if (publishStep.value === 2 && !validateBudgetStep()) {
    return;
  }
  if (publishStep.value < 4) {
    publishStep.value += 1;
    return;
  }
  await submitJobPost();
}

async function submitJobPost() {
  if (isPublishing.value) return;
  if (!validateDescriptionStep() || !validateBudgetStep()) {
    return;
  }
  isPublishing.value = true;
  try {
    const response = await publishTask({
      title: draft.title,
      brief: draft.brief,
      source: 'TEXT',
      budget: budgetSummary.value,
      category: draft.category,
      skills: dedupeTagList([...draft.skills, ...draft.customSkills]),
      scope: draft.term === 'long_term' ? '长期项目' : '短期项目',
      timeline: draft.term === 'long_term' ? '长期合作' : '短期交付',
      talentLevel: '',
      collaborationMode: draft.sourceMode,
      budgetMode: draft.budgetMode,
      budgetMin: draft.budgetMin || null,
      budgetMax: draft.budgetMax || null,
      locationPreference: draft.locationPreference,
      languagePreference: draft.languagePreference,
      screeningQuestions: draft.screeningQuestions,
      collaborationPreferences: draft.preferences,
      additionalNotes: draft.additionalNotes,
      contractToHire: draft.contractToHire,
      priorityReview: draft.publishMode === 'featured',
      aiSummary: analysisResult.value?.brief || draft.aiSummary,
    });

    const failed = Boolean(response?.requestError || response?.status === 'FAILED' || response?.success === false);
    if (failed) {
      openErrorDialog(response?.requestError || response?.nextStep || '当前服务不可用，暂时无法生成真实任务，请稍后重试。');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(draftStorageKey.value);
    }

    if (selectedTalentUserId.value && response?.taskId) {
      const assignment = await selectTaskAssignment(response.taskId, selectedTalentUserId.value);
      const assignmentFailed = Boolean(assignment?.requestError || assignment?.status === 'FAILED' || assignment?.success === false);
      if (assignmentFailed) {
        openErrorDialog(assignment?.requestError || assignment?.nextStep || '当前暂时无法创建协商房间，请稍后重试。');
        return;
      }
      if (assignment?.nextRoute) {
        router.push(assignment.nextRoute);
        return;
      }
      if (assignment?.roomKey) {
        router.push(roleRouteMap.enterprise.messageRoom(assignment.roomKey, { taskId: response.taskId, source: 'publish' }));
        return;
      }
      openErrorDialog('协作已经创建，但消息入口还没同步好，请稍后再试。');
      return;
    }

    publishResult.value = {
      tone: 'success',
      title: '任务已发布',
      body: '任务已发布，并且为您推荐了合适的人选。',
      actionLabel: '继续进入企业工作台',
      nextRoute: response?.nextRoute || roleRouteMap.enterprise.home,
      recommendedTalents: Array.isArray(response?.recommendedTalents) ? response.recommendedTalents : [],
      matchingPreview: Array.isArray(response?.matchingPreview) ? response.matchingPreview : [],
    };
  } catch (error) {
    openErrorDialog(error instanceof Error ? error.message : '当前服务不可用，暂时无法生成真实任务，请稍后重试。');
  } finally {
    isPublishing.value = false;
  }
}

watch(draft, persistDraft, { deep: true });
watch(publishStep, persistDraft);
watch(analysisResult, persistDraft);

onMounted(async () => {
  restoreDraft();
  hydrateFromRoute();
});
</script>

<style scoped>
.publish-upwork-shell {
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px;
  border-radius: 32px;
  background: linear-gradient(180deg, #ffffff 0%, #fafbf7 100%);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 24px;
}

.publish-upwork-hero {
  display: grid;
  gap: 18px;
}

.publish-upwork-eyebrow,
.publish-upwork-panel__eyebrow,
.publish-choice-card__eyebrow,
.publish-context-card__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  width: fit-content;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #f4f7ef;
  color: #6c7767;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.publish-upwork-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 340px);
  gap: 28px;
  align-items: end;
}

.publish-upwork-hero h1 {
  margin: 0;
  font-size: clamp(44px, 5.8vw, 76px);
  line-height: 0.94;
  letter-spacing: -0.06em;
}

.publish-upwork-hero p {
  margin: 10px 0 0;
  color: #667262;
  line-height: 1.65;
  font-size: 20px;
}

.publish-upwork-context {
  display: grid;
  gap: 8px;
  padding: 22px;
  border-radius: 24px;
  background: linear-gradient(180deg, #fbfcf8 0%, #f6f8f1 100%);
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.publish-upwork-context strong {
  font-size: 20px;
  line-height: 1.2;
}

.publish-upwork-stepper {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.publish-upwork-stepper__item {
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 22px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: #f7f8f3;
}

.publish-upwork-stepper__item span {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e9ecf6;
  color: #28417a;
  font-weight: 700;
}

.publish-upwork-stepper__item strong,
.publish-upwork-stepper__item small {
  display: block;
}

.publish-upwork-stepper__item small {
  color: #72806f;
  line-height: 1.45;
}

.publish-upwork-stepper__item.is-current {
  border-color: rgba(16, 138, 0, 0.35);
  background: #f3fbef;
}

.publish-upwork-stepper__item.is-current span,
.publish-upwork-stepper__item.is-complete span {
  background: #108a00;
  color: #ffffff;
}

.publish-upwork-card {
  padding: 32px;
  border-radius: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #ffffff;
  display: grid;
  gap: 18px;
}

.publish-upwork-alert {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 18px;
}

.publish-upwork-alert strong {
  font-size: 15px;
}

.publish-upwork-alert p {
  margin: 0;
  line-height: 1.6;
}

.publish-upwork-alert.is-error {
  background: #fff3f1;
  color: #a03a22;
}

.publish-upwork-alert.is-note {
  background: #f4f7ef;
  color: #566452;
}

.publish-upwork-panel {
  display: grid;
  gap: 24px;
}

.publish-upwork-panel__header {
  display: grid;
  gap: 12px;
}

.publish-upwork-panel__header h2 {
  margin: 0;
  font-size: clamp(32px, 4.6vw, 54px);
  line-height: 0.98;
  letter-spacing: -0.05em;
}

.publish-upwork-panel__header p {
  margin: 0;
  color: #667262;
  line-height: 1.65;
}

.publish-choice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.publish-choice-card {
  text-align: left;
  padding: 22px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: linear-gradient(180deg, #ffffff 0%, #fafcf8 100%);
  cursor: pointer;
}

.publish-choice-card--compact {
  padding: 18px;
}

.publish-choice-card.is-selected {
  border-color: rgba(16, 138, 0, 0.35);
  background: linear-gradient(180deg, #f5fbf1 0%, #eff9ea 100%);
  box-shadow: 0 18px 30px rgba(16, 138, 0, 0.08);
}

.publish-choice-card strong {
  display: block;
  margin-top: 12px;
  font-size: 24px;
  line-height: 1.12;
  letter-spacing: -0.04em;
}

.publish-choice-card p {
  margin: 10px 0 0;
  color: #667262;
  line-height: 1.65;
}

.publish-context-card,
.publish-analysis-summary-card,
.publish-review-card,
.publish-optional-card,
.publish-result-card {
  display: grid;
  gap: 12px;
  padding: 22px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: linear-gradient(180deg, #ffffff 0%, #fafcf8 100%);
}

.publish-context-card p,
.publish-analysis-summary-card p,
.publish-result-card p {
  margin: 0;
  color: #667262;
  line-height: 1.65;
}

.publish-result-card.is-success {
  border-color: rgba(16, 138, 0, 0.22);
  background: linear-gradient(180deg, #f5fbf1 0%, #ffffff 100%);
}

.publish-talent-reel {
  display: grid;
  gap: 14px;
}

.publish-talent-reel__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 14px;
}

.publish-talent-reel__header-main {
  display: grid;
  gap: 8px;
}

.publish-talent-reel__header p {
  margin: 0;
  color: #667262;
  line-height: 1.6;
}

.publish-talent-reel__hint {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f4f7ef;
  border: 1px solid rgba(17, 24, 39, 0.08);
  color: #5f6b5b;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.publish-talent-carousel {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 280px);
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x proximity;
}

.publish-talent-card {
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: 22px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: linear-gradient(180deg, #ffffff 0%, #fafcf8 100%);
  color: #121212;
  text-decoration: none;
  scroll-snap-align: start;
  align-content: start;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.publish-talent-card:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 138, 0, 0.18);
  box-shadow: 0 18px 36px rgba(19, 36, 12, 0.08);
}

.publish-talent-card__top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.publish-talent-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(135deg, #dff1d8 0%, #edf7e8 100%);
  color: #187236;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  flex: 0 0 auto;
}

.publish-talent-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.publish-talent-card__identity {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.publish-talent-card__identity strong {
  font-size: 20px;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.publish-talent-card__identity p {
  margin: 0;
  color: #667262;
  line-height: 1.5;
}

.publish-talent-card__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.publish-talent-card__signal {
  display: grid;
  gap: 4px;
  min-height: 58px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #f4f7ef;
}

.publish-talent-card__signal-label {
  color: #667262;
  font-size: 12px;
  line-height: 1;
}

.publish-talent-card__signal-value {
  color: #243124;
  font-weight: 700;
  line-height: 1.25;
}

.publish-talent-card__tags {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fbfcf8 0%, #f5f8ef 100%);
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.publish-talent-card__tag-group {
  display: grid;
  gap: 8px;
}

.publish-talent-card__tag-label {
  color: #667262;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.publish-talent-card__cta {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid rgba(17, 24, 39, 0.08);
  color: #108a00;
  font-weight: 700;
}

.publish-field-grid,
.publish-review-grid,
.publish-optional-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.publish-field,
.publish-optional-card {
  display: grid;
  gap: 8px;
}

.publish-field--full,
.publish-optional-card--full {
  grid-column: 1 / -1;
}

.publish-field label,
.publish-optional-card label {
  color: #576453;
  font-size: 15px;
  font-weight: 600;
}

.publish-input,
.publish-textarea,
.publish-select {
  width: 100%;
  border: 1px solid rgba(17, 24, 39, 0.12);
  background: #ffffff;
  color: #1c271c;
  border-radius: 18px;
  padding: 16px 18px;
  font: inherit;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.publish-input:focus,
.publish-textarea:focus,
.publish-select:focus {
  border-color: rgba(16, 138, 0, 0.48);
  box-shadow: 0 0 0 4px rgba(16, 138, 0, 0.12);
}

.publish-textarea {
  resize: vertical;
  min-height: 180px;
}

.publish-textarea--compact {
  min-height: 120px;
}

.publish-helper-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #748072;
  font-size: 14px;
}

.publish-analysis-skill-groups {
  display: grid;
  gap: 14px;
}

.publish-analysis-skill-group {
  display: grid;
  gap: 10px;
}

.publish-chip-list,
.publish-analysis-list,
.publish-analysis-recommendation-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.publish-chip-list--wrap {
  flex-wrap: wrap;
}

.publish-chip,
.publish-analysis-list__item {
  border-radius: 18px;
}

.publish-chip,
.publish-analysis-list__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  background: #f7f8f3;
}

.publish-chip.is-filled {
  background: #edf7e8;
  border-color: rgba(16, 138, 0, 0.22);
  cursor: pointer;
}

.publish-chip.is-standard {
  background: #ecf5e7;
  color: #426034;
}

.publish-chip.is-custom {
  background: #fff3e8;
  color: #9a5b20;
}

.publish-chip-button {
  appearance: none;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 999px;
  padding: 10px 14px;
  background: #f3f6ef;
  color: #44514a;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.publish-chip-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.publish-chip-button.is-selected {
  background: #108a00;
  color: #ffffff;
  border-color: rgba(16, 138, 0, 0.5);
}

.publish-chip-button.is-custom {
  background: #fff4eb;
  color: #9a5b20;
}

.publish-chip-button.is-custom.is-selected {
  background: #ea7d2f;
  color: #ffffff;
  border-color: rgba(234, 125, 47, 0.55);
}

.publish-optional-card--skills {
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 22px;
  background: #fbfcf8;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.publish-skill-group {
  display: grid;
  gap: 12px;
}

.publish-skill-group__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.publish-skill-group__header strong {
  font-size: 15px;
}

.publish-skill-group__header small {
  color: #72806f;
}

.publish-skill-input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.publish-analysis-module-list,
.publish-list {
  display: grid;
  gap: 12px;
}

.publish-analysis-module {
  display: grid;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #f8faf5;
}

.publish-analysis-module__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
}

.publish-analysis-module__head strong {
  font-size: 18px;
  line-height: 1.3;
}

.publish-analysis-module__head span {
  color: #70806e;
  font-size: 14px;
  white-space: nowrap;
}

.publish-analysis-module p,
.publish-analysis-module small {
  margin: 0;
  color: #667262;
  line-height: 1.6;
}

.publish-list__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #fbfcf8;
}

.publish-list__item span {
  line-height: 1.5;
}

.publish-empty-note {
  margin: 0;
  color: #748072;
  line-height: 1.6;
  font-size: 14px;
}

.publish-inline-input {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.publish-review-list {
  display: grid;
  gap: 12px;
}

.publish-review-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
}

.publish-review-row:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.publish-review-row span {
  color: #70806e;
}

.publish-review-row strong {
  text-align: right;
}

.publish-upwork-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.publish-upwork-actions__right {
  display: flex;
  gap: 12px;
  align-items: center;
}

@media (max-width: 980px) {
  .publish-upwork-shell {
    padding: 24px;
  }

  .publish-upwork-hero__grid,
  .publish-upwork-stepper,
  .publish-choice-grid,
  .publish-field-grid,
  .publish-review-grid,
  .publish-optional-grid {
    grid-template-columns: 1fr;
  }

  .publish-helper-line,
  .publish-review-row,
  .publish-upwork-actions,
  .publish-upwork-actions__right,
  .publish-inline-input {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
