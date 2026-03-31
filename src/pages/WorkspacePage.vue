<template>
  <section class="page-stack workspace-page" v-if="page">
    <MobilePageScaffold
      :eyebrow="isEnterprise ? '企业端协作空间' : '人才端执行台'"
      :title="workspaceScaffoldTitle"
      :subtitle="workspaceScaffoldSubtitle"
    >
      <template #meta>
        <span class="soft-pill">{{ hasTask ? page.taskDetail.status : '未开始合作' }}</span>
        <span v-if="taskOptions.length" class="soft-pill">{{ taskOptions.length }} 个任务</span>
      </template>

      <article v-if="page.requestError" class="result-card stack-sm">
        <span class="eyebrow">数据同步失败</span>
        <h3>当前展示的是空态协作页</h3>
        <p class="muted">{{ page.requestError }}</p>
      </article>

      <SummarySection
        :eyebrow="hasTask ? '当前任务' : '协作准备'"
        :title="hasTask ? workspaceSummaryTitle : emptyWorkspaceHeadline"
        :description="hasTask ? workspaceSummaryDescription : emptyWorkspaceDescription"
        :highlight-label="workspaceHighlightLabel"
        :highlight-value="workspaceHighlightValue"
      >
        <div v-if="hasTask" class="tag-row workspace-summary-tags">
          <span class="soft-pill">
            {{ isEnterprise ? '协作人才' : '合作企业' }} · {{ isEnterprise ? page.summary.talent : page.summary.business }}
          </span>
          <span class="soft-pill">预算 · {{ page.taskDetail.budget || '未填写预算' }}</span>
          <span class="soft-pill">周期 · {{ page.taskDetail.period || page.summary.range || '待确认' }}</span>
        </div>

        <div v-if="hasTask" class="workspace-summary-stack stack-sm">
          <article class="mini-card stack-sm workspace-focus-card workspace-focus-card-inline">
            <div class="workspace-focus-head">
              <div class="stack-xs">
                <span class="eyebrow">{{ workspaceFocusEyebrow }}</span>
                <strong>{{ workspaceFocusTitle }}</strong>
              </div>
              <span v-if="workspaceFocusMeta" class="soft-pill">{{ workspaceFocusMeta }}</span>
            </div>
            <p class="muted">{{ workspaceFocusSummary }}</p>
            <div v-if="workspaceFocusTags.length" class="tag-row workspace-focus-tags">
              <span v-for="item in workspaceFocusTags" :key="item" class="tag-pill tag-pill-muted">{{ item }}</span>
            </div>
          </article>

          <div class="workspace-primary-actions workspace-summary-primary-actions">
            <button class="button-primary" type="button" @click="handleWorkspaceHeroPrimaryAction">
              {{ workspaceHeroPrimaryLabel }}
            </button>
            <button
              v-if="workspaceHeroSecondaryLabel"
              class="button-secondary"
              type="button"
              @click="handleWorkspaceHeroSecondaryAction"
            >
              {{ workspaceHeroSecondaryLabel }}
            </button>
          </div>

          <button
            v-if="workspaceHeroTertiaryLabel"
            class="button-secondary workspace-tertiary-action"
            type="button"
            @click="handleWorkspaceHeroTertiaryAction"
          >
            {{ workspaceHeroTertiaryLabel }}
          </button>

          <div class="workspace-summary-actions workspace-summary-actions-compact">
            <button
              v-if="focusedNode"
              class="button-secondary"
              type="button"
              @click="openNode(focusedNode)"
            >
              当前节点详情
            </button>
            <button class="button-secondary" type="button" @click="openRecordSheet">最近记录</button>
            <button
              v-if="normalizedNodes.length > 1"
              class="button-secondary"
              type="button"
              @click="openNodeOverview"
            >
              节点时间线
            </button>
            <button
              v-if="taskOptions.length > 1"
              class="button-secondary"
              type="button"
              @click="openTaskSwitcher"
            >
              切换任务
            </button>
            <button class="button-secondary" type="button" @click="openTaskDetail">任务详情</button>
            <router-link v-if="workspaceBackRoute" class="button-secondary" :to="workspaceBackRoute">
              {{ workspaceBackLabel }}
            </router-link>
          </div>
        </div>
        <div v-else class="workspace-empty-primary">
          <div class="workspace-empty-primary-card">
            <span class="eyebrow">{{ isEnterprise ? '当前状态' : '执行准备' }}</span>
            <strong>{{ isEnterprise ? '还没有进入协作的任务' : '还没有确认执行中的任务' }}</strong>
            <p class="muted">
              {{ isEnterprise ? '先发布并选中人才，再回这里盯当前节点。' : '先确认一单任务，再回来同步本轮进展。' }}
            </p>
          </div>

          <div class="workspace-summary-actions workspace-summary-actions-single">
            <router-link
              v-if="isEnterprise"
              class="button-primary"
              :to="roleRouteMap.enterprise.publish"
            >
              去发布任务
            </router-link>
            <router-link
              v-else
              class="button-primary"
              :to="roleRouteMap.talent.market"
            >
              去任务广场
            </router-link>
            <router-link
              class="button-secondary"
              :to="isEnterprise ? roleRouteMap.enterprise.home : roleRouteMap.talent.home"
            >
              返回工作台
            </router-link>
          </div>
        </div>
        <p v-if="workspaceInlineResult" class="soft-pill workspace-inline-result">{{ workspaceInlineResult }}</p>
      </SummarySection>

      <MobileLiveSyncStatus
        v-if="liveSyncError || (liveSyncStatus && liveSyncStatus.state !== 'open')"
        :snapshot="liveSyncStatus"
        :error-note="liveSyncError"
      />

    </MobilePageScaffold>

    <MobileSheet
      :open="taskSwitcherVisible"
      title="切换任务"
      subtitle="多任务协作时，先切到当前要处理的这一单。"
      size="medium"
      @close="closeTaskSwitcher"
    >
      <div class="stack-sm">
        <UnifiedListCard
          v-for="task in taskOptions"
          :key="task.taskId"
          eyebrow="任务切换"
          :title="task.title"
          :subtitle="task.status || '待同步'"
          :meta="task.progress || task.completion || '待同步'"
          :status="task.taskId === currentTaskId ? '当前任务' : '可切换'"
          :status-tone="task.taskId === currentTaskId ? 'info' : 'neutral'"
          :tags="[task.taskId || '未生成任务号']"
          clickable
          @select="selectTask(task.taskId)"
        />
      </div>
    </MobileSheet>

    <MobileSheet
      :open="taskDetailVisible"
      title="任务详情"
      :subtitle="page.taskDetail?.title || '当前任务'"
      size="large"
      @close="closeTaskDetail"
    >
      <p class="muted">{{ page.taskDetail?.brief || '待补充' }}</p>
      <DetailAccordion
        :items="taskDetailAccordionItems"
        :default-open-keys="['basic']"
      />
    </MobileSheet>

    <MobileSheet
      :open="Boolean(activeNode)"
      title="阶段节点"
      :subtitle="activeNode?.title || '当前节点'"
      size="large"
      @close="closeNode"
    >
        <div class="mini-card stack-sm workspace-node-sheet-hero">
          <span class="eyebrow">节点结论</span>
          <strong>{{ activeNode?.status || '待开始' }}</strong>
          <p class="muted">{{ compactText(activeNode?.summary, 80) }}</p>
        </div>

        <DetailAccordion
          :items="activeNodeAccordionItems"
          :default-open-keys="['plan']"
        />

        <div class="mini-card stack-sm">
          <h4>{{ isEnterprise ? '企业改进建议' : '企业反馈与 AI 补充' }}</h4>
          <p class="muted">
            {{ activeNode.businessSuggestion.summary || (isEnterprise ? '当前还没有提交新的企业建议。' : '企业暂时还没有补充新的改进建议。') }}
          </p>
          <p class="muted" v-if="activeNode.businessSuggestion.aiSupplement">
            {{ activeNode.businessSuggestion.aiSupplement }}
          </p>
          <p class="muted" v-if="activeNode.businessSuggestion.updatedAt">最近更新：{{ activeNode.businessSuggestion.updatedAt }}</p>
        </div>

        <form v-if="isEnterprise" class="workspace-feedback-form stack-sm" @submit.prevent="submitNodeFeedback">
          <label class="form-field">
            <span>新增改进建议</span>
            <textarea
              v-model.trim="feedbackForm.summary"
              rows="4"
              placeholder="例如：请把本轮交付件按阶段拆开，并补一份给验收用的说明。"
            ></textarea>
          </label>
          <div class="dashboard-module-actions">
            <button class="button-primary" type="submit" :disabled="submittingFeedback">
              {{ submittingFeedback ? '保存中…' : '保存建议' }}
            </button>
            <span v-if="feedbackResult" class="soft-pill">{{ feedbackResult }}</span>
          </div>
        </form>
    </MobileSheet>

    <MobileSheet
      :open="recordSheetVisible"
      title="最近记录"
      :subtitle="page.taskDetail?.title || '当前任务'"
      size="medium"
      @close="closeRecordSheet"
    >
      <div class="workspace-record-list">
        <article v-for="item in recordItems" :key="item.key" class="mini-card stack-sm workspace-record-card">
          <div class="panel-header">
            <div>
              <h4>{{ item.title }}</h4>
              <p class="muted">{{ item.time }}</p>
            </div>
            <span class="soft-pill">{{ item.badge }}</span>
          </div>
          <p class="muted">{{ item.summary }}</p>
        </article>
      </div>
    </MobileSheet>

    <MobileSheet
      :open="nodeOverviewVisible"
      title="节点时间线"
      :subtitle="page.taskDetail?.title || '当前任务'"
      size="medium"
      @close="closeNodeOverview"
    >
      <div class="stack-sm">
        <UnifiedListCard
          v-for="node in normalizedNodes"
          :key="node.id"
          eyebrow="阶段节点"
          :title="node.title"
          :subtitle="compactText(node.summary, 56) || '当前还没有更多节点说明。'"
          :meta="node.workdayLabel || node.plannedDate || '待排期'"
          :status="node.status || '待开始'"
          :status-tone="node.id === focusedNode?.id ? 'info' : 'neutral'"
          :tags="[node.progress || '待同步']"
          clickable
          @select="openNodeFromOverview(node)"
        />
      </div>
    </MobileSheet>

    <MobileSheet
      :open="progressComposerVisible"
      title="提交本轮进展"
      :subtitle="focusedNode?.title || page.taskDetail?.title || '当前任务'"
      size="large"
      @close="closeProgressComposer"
    >
      <form class="stack-md workspace-progress-sheet" @submit.prevent="submitProgressForm">
        <label class="form-field">
          <span>当前阶段</span>
          <input
            v-model.trim="progressForm.stageName"
            class="text-input"
            type="text"
            placeholder="例如：任务确认 / 视觉稿 / 页面开发"
          >
        </label>

        <div class="form-grid">
          <label class="form-field">
            <span>完成度</span>
            <input
              v-model.trim="progressForm.completion"
              class="text-input"
              type="text"
              placeholder="例如：68%"
            >
          </label>
          <label class="form-field">
            <span>附件</span>
            <input class="text-input" type="file" multiple @change="handleProgressFiles">
          </label>
        </div>

        <label class="form-field">
          <span>本轮说明</span>
          <textarea
            v-model.trim="progressForm.progressSummary"
            rows="5"
            placeholder="只写本轮最关键的进展、交付和待确认点。"
          ></textarea>
        </label>

        <label class="form-field">
          <span>需要协助</span>
          <textarea
            v-model.trim="progressForm.supportNeeded"
            rows="3"
            placeholder="例如：需要企业补充素材、确认验收口径或调整工期。"
          ></textarea>
        </label>

        <div class="dashboard-module-actions">
          <button class="button-secondary" type="button" :disabled="submittingProgress" @click="closeProgressComposer">
            取消
          </button>
          <button class="button-primary" type="submit" :disabled="submittingProgress">
            {{ submittingProgress ? '提交中…' : '提交本轮进展' }}
          </button>
        </div>

        <p v-if="progressResult" class="soft-pill workspace-inline-result">{{ progressResult }}</p>
      </form>
    </MobileSheet>

    <MobileSheet
      :open="taskFlowModalOpen"
      title="任务动作"
      :subtitle="taskFlowTitle"
      size="medium"
      @close="closeTaskFlowModal"
    >

        <p class="muted">{{ taskFlowDescription }}</p>

        <div class="dashboard-preview-list">
          <div class="dashboard-preview-item">
            <span class="status-dot"></span>
            <p class="muted">任务：{{ page.taskDetail.title }}</p>
          </div>
          <div class="dashboard-preview-item">
            <span class="status-dot"></span>
            <p class="muted">预算：{{ page.taskDetail.budget || '未填写预算' }}</p>
          </div>
          <div class="dashboard-preview-item">
            <span class="status-dot"></span>
            <p class="muted">当前状态：{{ page.taskDetail.status }}</p>
          </div>
        </div>

        <label class="form-field">
          <span>{{ taskFlowInputLabel }}</span>
          <textarea
            v-model.trim="taskFlowForm.note"
            rows="4"
            :placeholder="taskFlowPlaceholder"
          ></textarea>
        </label>

        <div v-if="taskFlowMode === 'early_grade'" class="form-field">
          <span>交付评级</span>
          <div class="tag-row">
            <button
              v-for="item in deliveryGradeOptions"
              :key="item.value"
              type="button"
              class="button-secondary"
              :class="{ 'is-active-tab': taskFlowForm.grade === item.value }"
              @click="taskFlowForm.grade = item.value"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <p v-if="taskFlowError" class="form-error">{{ taskFlowError }}</p>

        <div class="dashboard-module-actions">
          <button class="button-secondary" type="button" :disabled="submittingTaskFlow" @click="closeTaskFlowModal">
            取消
          </button>
          <button class="button-primary" type="button" :disabled="submittingTaskFlow" @click="submitTaskFlowAction">
            {{ submittingTaskFlow ? '提交中…' : taskFlowPrimaryLabel }}
          </button>
        </div>
    </MobileSheet>
  </section>

  <section v-else-if="loading" class="page-stack workspace-page">
    <article class="glass-panel workspace-loading-shell">
      <div class="workspace-loading-card stack-sm">
        <span class="eyebrow">协作空间加载中</span>
        <h3 class="dashboard-title">正在读取当前任务与协作节点</h3>
        <p class="muted">请稍等，页面会自动同步任务详情、进度和 AI 审核信息。</p>
      </div>
    </article>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MobileLiveSyncStatus from '../components/mobile/MobileLiveSyncStatus.vue';
import {
  getWorkspaceData,
  submitEarlyCompletion,
  submitTaskCancellation,
  submitTaskProgress,
  submitWorkspaceFeedback,
  uploadTaskAttachmentAsset
} from '../services/api';
import { startBusinessLiveSync } from '../services/businessEventStream.js';
import DetailAccordion from '../components/mobile/DetailAccordion.vue';
import MobilePageScaffold from '../components/mobile/MobilePageScaffold.vue';
import MobileSheet from '../components/mobile/MobileSheet.vue';
import SummarySection from '../components/mobile/SummarySection.vue';
import UnifiedListCard from '../components/mobile/UnifiedListCard.vue';
import {
  buildChildObjectPageContext,
  labelForObjectPageSource,
  readObjectPageContext,
  resolveImmediateOriginContext,
  serializeObjectPageContext
} from '../utils/objectPageContext';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();

const page = ref(null);
const loading = ref(false);
const taskSwitcherVisible = ref(false);
const taskDetailVisible = ref(false);
const recordSheetVisible = ref(false);
const nodeOverviewVisible = ref(false);
const progressComposerVisible = ref(false);
const activeNode = ref(null);
const progressFiles = ref([]);
const progressResult = ref('');
const feedbackResult = ref('');
const taskFlowResult = ref('');
const liveSyncStatus = ref(null);
const liveSyncError = ref('');
const submittingProgress = ref(false);
const submittingFeedback = ref(false);
const taskFlowModalOpen = ref(false);
const taskFlowMode = ref('');
const taskFlowError = ref('');
const submittingTaskFlow = ref(false);
let stopBusinessLiveSync = null;

function handleLiveSyncStatus(snapshot) {
  liveSyncStatus.value = snapshot ? { ...snapshot } : null;
  if (snapshot?.state === 'open') {
    liveSyncError.value = '';
  }
}

function handleLiveSyncError() {
  liveSyncError.value = '最近一次实时同步出现波动，页面会自动重连或切到轮询。';
}

const progressForm = ref({
  stageName: '',
  completion: '',
  progressSummary: '',
  supportNeeded: ''
});

const feedbackForm = ref({
  summary: ''
});
const taskFlowForm = ref({
  note: '',
  grade: 'A'
});

const isEnterprise = computed(() => route.meta?.audience === 'enterprise');
const contextDefaults = computed(() => ({
  taskId: page.value?.summary?.taskId || '',
  room: route.query.room,
  recordId: route.query.recordId,
  nodeId: route.query.nodeId,
  tab: route.query.tab
}));
const pageContext = computed(() => readObjectPageContext(route.query, contextDefaults.value));
const originContext = computed(() =>
  resolveImmediateOriginContext({
    entrySource: pageContext.value.source,
    query: route.query,
    defaults: contextDefaults.value,
    allowedSources: ['messages', 'record-detail', 'acceptance', 'records']
  })
);
const currentTaskId = computed(() => pageContext.value.taskId || String(page.value?.summary?.taskId || '').trim());
const currentRoomKey = computed(() => pageContext.value.room);
const currentRecordId = computed(() => pageContext.value.recordId);
const currentNodeId = computed(() => pageContext.value.nodeId);
const currentRecordTab = computed(() => pageContext.value.tab);
const workspaceEntrySource = computed(() => pageContext.value.source);
const hasTask = computed(() => Boolean(page.value?.taskDetail?.taskId));
const taskOptions = computed(() => listOf(page.value?.taskOptions));
function buildWorkspaceChildQuery(overrides = {}) {
  return buildChildObjectPageContext({
    current: pageContext.value,
    origin: originContext.value,
    overrides: {
      source: 'workspace',
      taskId: currentTaskId.value,
      room: currentRoomKey.value,
      recordId: currentRecordId.value,
      nodeId: currentNodeId.value,
      tab: currentRecordTab.value,
      ...overrides
    }
  });
}

function messagesRoute(query) {
  if (currentRoomKey.value) {
    return isEnterprise.value
      ? roleRouteMap.enterprise.messageRoom(currentRoomKey.value, query)
      : roleRouteMap.talent.messageRoom(currentRoomKey.value, query);
  }
  return {
    path: isEnterprise.value ? roleRouteMap.enterprise.messages : roleRouteMap.talent.messages,
    query
  };
}

const chatRoute = computed(() => messagesRoute(buildWorkspaceChildQuery()));
const acceptanceRoute = computed(() => ({
  path: isEnterprise.value ? roleRouteMap.enterprise.acceptance : roleRouteMap.talent.acceptance,
  query: buildWorkspaceChildQuery()
}));

function routeForWorkspaceImmediateSource(source) {
  if (source === 'messages') {
    return messagesRoute(buildWorkspaceChildQuery({ source: 'workspace' }));
  }

  if (source === 'acceptance') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.acceptance : roleRouteMap.talent.acceptance,
      query: buildWorkspaceChildQuery({
        source: 'acceptance',
        nodeId: undefined
      })
    };
  }

  if (source === 'records') {
    return {
      path: isEnterprise.value ? roleRouteMap.enterprise.records : roleRouteMap.talent.records,
      query: currentRecordTab.value ? { tab: currentRecordTab.value } : {}
    };
  }

  if (source === 'record-detail' && currentRecordId.value) {
    return {
      path: isEnterprise.value
        ? roleRouteMap.enterprise.recordDetail(currentRecordId.value)
        : roleRouteMap.talent.recordDetail(currentRecordId.value),
      query: buildWorkspaceChildQuery({
        source: 'record-detail',
        nodeId: undefined
      })
    };
  }

  return null;
}

const workspaceBackRoute = computed(() => {
  const directRoute = routeForWorkspaceImmediateSource(workspaceEntrySource.value);
  if (directRoute) {
    return directRoute;
  }

  if (workspaceEntrySource.value === 'workspace') {
    return routeForWorkspaceImmediateSource(originContext.value.source);
  }

  return null;
});

const workspaceBackLabel = computed(() => {
  const targetSource = workspaceEntrySource.value === 'workspace' ? originContext.value.source : workspaceEntrySource.value;
  return labelForObjectPageSource(targetSource, '返回来源');
});

const enterpriseLead = '切换任务查看执行情况、节点交付、AI 审核和企业反馈。';
const talentLead = '只同步当前任务、本轮进展和必要协助。';
const workspaceScaffoldTitle = computed(() =>
  hasTask.value
    ? page.value?.taskDetail?.title || (isEnterprise.value ? '协作执行台' : '执行工作台')
    : (isEnterprise.value ? '等待协作开始' : '等待开始执行')
);
const workspaceScaffoldSubtitle = computed(() =>
  hasTask.value
    ? (isEnterprise.value ? '只盯当前任务、关键节点和最新同步。' : talentLead)
    : (isEnterprise.value
      ? '先完成发布和选人，再回这里集中盯节点。'
      : '先确认任务，再回这里同步进展与附件。')
);
const workspaceSummaryTitle = computed(() => {
  if (!hasTask.value) {
    return emptyWorkspaceHeadline.value;
  }
  return focusedNode.value?.title || '当前任务';
});
const workspaceSummaryDescription = computed(() => {
  if (!hasTask.value) {
    return emptyWorkspaceDescription.value;
  }

  const nodeSummary = compactText(focusedNode.value?.summary, 92);
  if (nodeSummary) {
    return nodeSummary;
  }

  const taskBrief = compactText(page.value?.taskDetail?.brief, 92);
  if (taskBrief) {
    return taskBrief;
  }

  return workspaceScaffoldSubtitle.value;
});
const workspaceHighlightLabel = computed(() => {
  if (!hasTask.value) {
    return '下一步';
  }
  return focusedNode.value ? '当前状态' : '下一步';
});
const workspaceHighlightValue = computed(() => {
  if (!hasTask.value) {
    return emptyWorkspaceNextStep.value;
  }
  return [focusedNode.value?.status, focusedNode.value?.progress].filter(Boolean).join(' · ') || emptyWorkspaceNextStep.value;
});
const emptyWorkspaceHeadline = computed(() =>
  isEnterprise.value ? '先完成发布与选人' : '先确认任务再开始'
);
const emptyWorkspaceDescription = computed(() =>
  isEnterprise.value
    ? '协作空间只承接已进入合作的任务，不再在首页堆解释。'
    : '这里专门承接已经确认的任务，同步进展时再回到这里。'
);
const emptyWorkspaceNextStep = computed(() =>
  isEnterprise.value ? '发布任务后再回来查看节点' : '从任务广场进入并确认一单任务'
);
const earlyCompletion = computed(() => page.value?.earlyCompletion || { status: '未发起' });
const cancellationRequest = computed(() => page.value?.cancellationRequest || { status: '未发起' });
const currentAudience = computed(() => (isEnterprise.value ? 'enterprise' : 'talent'));
const cancellationWaitingCounterpart = computed(() => cancellationRequest.value.status === '待对方确认取消');
const canRequestEarlyCompletion = computed(() =>
  isEnterprise.value &&
  hasTask.value &&
  !['待人才同意提前完成', '待企业评级', '已完成评级', '已取消'].includes(earlyCompletion.value.status || '') &&
  page.value?.taskDetail?.status !== '已取消'
);
const canApproveEarlyCompletion = computed(() =>
  !isEnterprise.value && earlyCompletion.value.status === '待人才同意提前完成'
);
const canRejectEarlyCompletion = canApproveEarlyCompletion;
const isEnterpriseWaitingGrade = computed(() => isEnterprise.value && earlyCompletion.value.status === '待企业评级');
const canOpenAcceptance = computed(() =>
  hasTask.value &&
  (
    earlyCompletion.value.status === '待企业评级' ||
    earlyCompletion.value.status === '已完成评级' ||
    page.value?.taskDetail?.status === '待双方评分闭环' ||
    page.value?.taskDetail?.status === '已提前完成'
  )
);
const canRequestCancellation = computed(() =>
  hasTask.value &&
  !['待对方确认取消', '已取消'].includes(cancellationRequest.value.status || '') &&
  !['已提前完成', '已取消'].includes(page.value?.taskDetail?.status || '')
);
const canApproveCancellation = computed(() =>
  cancellationWaitingCounterpart.value &&
  cancellationRequest.value.initiatorAudience &&
  cancellationRequest.value.initiatorAudience !== currentAudience.value
);
const canRejectCancellation = canApproveCancellation;
const deliveryGradeOptions = [
  { value: 'S', label: 'S · 100%' },
  { value: 'A', label: 'A · 80%' },
  { value: 'B', label: 'B · 30%' }
];

const normalizedNodes = computed(() => listOf(page.value?.collaborationNodes).map(normalizeNode));
const focusedNode = computed(() => {
  if (!normalizedNodes.value.length) {
    return null;
  }
  const inProgress = normalizedNodes.value.find((node) => !['已完成', '已取消'].includes(node.status || ''));
  return inProgress || normalizedNodes.value[0];
});
const focusedNodeIndex = computed(() =>
  focusedNode.value ? normalizedNodes.value.findIndex((node) => node.id === focusedNode.value.id) : -1
);
const upcomingNode = computed(() => {
  if (!normalizedNodes.value.length || focusedNodeIndex.value < 0) {
    return null;
  }
  return normalizedNodes.value[focusedNodeIndex.value + 1] || null;
});

const latestProgress = computed(() => {
  const items = listOf(page.value?.progressFeed);
  return items.length ? items[items.length - 1] : null;
});

const recordItems = computed(() => {
  const progressFeed = listOf(page.value?.progressFeed);
  const reviewFeed = listOf(page.value?.aiReviewHistory);
  const progress = progressFeed.slice(-2).reverse().map((item, index) => ({
    key: `progress-${index}`,
    title: item.stage || '最新进展',
    time: item.time || item.submittedAt || '刚刚更新',
    badge: item.completion || '进展',
    summary: compactText(item.summary, 72) || '当前还没有更多进展说明。'
  }));

  const reviews = reviewFeed.slice(-2).reverse().map((item, index) => ({
    key: `review-${index}`,
    title: item.title || 'AI 巡检',
    time: item.focus || 'AI 审核',
    badge: item.status || '已生成',
    summary: compactText(item.summary, 72) || '当前还没有 AI 建议。'
  }));

  return [...progress, ...reviews];
});

const earlyCompletionStatusText = computed(() => {
  if (earlyCompletion.value.status === '待人才同意提前完成') {
    return 'AI 已审核通过，等待人才确认是否接受提前完成。';
  }
  if (earlyCompletion.value.status === '待企业评级') {
    return '人才已同意提前完成，企业现在需要完成 S / A / B 评级。';
  }
  if (earlyCompletion.value.status === '已完成评级') {
    return `已完成 ${earlyCompletion.value.grade || ''} 级评级，当前按 ${earlyCompletion.value.payoutRatio || '待确认'} 结算。`;
  }
  if (earlyCompletion.value.status === 'AI未通过') {
    return 'AI 暂未通过提前完成，建议继续补充交付与质量说明。';
  }
  if (earlyCompletion.value.status === '人才已驳回') {
    return '人才暂不同意提前完成，任务继续执行。';
  }
  return '只有企业可以发起提前完成，AI 会先审核当前进度和交付质量。';
});

const earlyCompletionSummary = computed(() =>
  earlyCompletion.value.aiReviewSummary ||
  earlyCompletion.value.gradeNote ||
  earlyCompletion.value.talentDecisionNote ||
  earlyCompletion.value.requestNote ||
  '当任务接近完成时，企业可以发起提前完成，AI 会先核对质量与进度。'
);

const cancellationStatusText = computed(() => {
  if (cancellationRequest.value.status === '待对方确认取消') {
    return '当前已经发起取消申请，等待对方确认。';
  }
  if (cancellationRequest.value.status === '已取消') {
    return '任务已取消，历史聊天与协作记录会继续保留。';
  }
  if (cancellationRequest.value.status === '对方已拒绝取消') {
    return '上一条取消申请已被拒绝，任务恢复执行中。';
  }
  return '人才或企业都可以提出取消任务，但必须经过对方确认。';
});

const cancellationSummary = computed(() =>
  cancellationRequest.value.counterpartyDecisionNote ||
  cancellationRequest.value.reason ||
  '如果任务范围、预算或合作基础发生重大变化，可以发起取消流程。'
);
const workspacePrimaryLabel = computed(() =>
  hasTask.value
    ? '去聊天'
    : (isEnterprise.value ? '去发布任务' : '查看任务广场')
);
const workspaceSecondaryLabel = computed(() => {
  if (!hasTask.value) {
    return '';
  }
  if (canOpenAcceptance.value) {
    return isEnterprise.value ? '去验收与评级' : '查看评级结果';
  }
  if (isEnterprise.value && canRequestEarlyCompletion.value) {
    return '发起提前完成';
  }
  if (canRequestCancellation.value) {
    return '申请取消';
  }
  return '查看任务详情';
});
const showWorkspaceSecondaryAction = computed(() => Boolean(workspaceSecondaryLabel.value));
const workspaceFocusEyebrow = computed(() => (isEnterprise.value ? '最新同步' : '当前结论'));
const workspaceFocusTitle = computed(() => {
  if (!hasTask.value) {
    return '';
  }
  if (latestProgress.value?.stage) {
    return latestProgress.value.stage;
  }
  return focusedNode.value?.title || page.value?.taskDetail?.title || '当前任务';
});
const workspaceFocusSummary = computed(() => {
  if (!hasTask.value) {
    return '';
  }
  return (
    compactText(latestProgress.value?.summary, 96) ||
    compactText(focusedNode.value?.summary, 96) ||
    compactText(page.value?.taskDetail?.brief, 96) ||
    '当前还没有更多同步说明。'
  );
});
const workspaceFocusMeta = computed(() => {
  if (!hasTask.value) {
    return '';
  }
  return (
    latestProgress.value?.time ||
    latestProgress.value?.submittedAt ||
    focusedNode.value?.plannedDate ||
    focusedNode.value?.workdayLabel ||
    ''
  );
});
const workspaceFocusTags = computed(() => {
  if (!hasTask.value) {
    return [];
  }

  const tags = [];
  if (focusedNode.value?.status) {
    tags.push(`当前状态 · ${focusedNode.value.status}`);
  }
  if (focusedNode.value?.progress) {
    tags.push(`完成度 · ${focusedNode.value.progress}`);
  }
  if (upcomingNode.value?.title) {
    tags.push(`下一步 · ${upcomingNode.value.title}`);
  }
  if (focusedNode.value?.expectedDeliverablesText) {
    tags.push(`交付 · ${compactText(focusedNode.value.expectedDeliverablesText, 24)}`);
  }

  return tags.slice(0, 3);
});
const workspaceInlineResult = computed(() => taskFlowResult.value || progressResult.value || '');
const workspaceHeroPrimaryLabel = computed(() => {
  if (!hasTask.value) {
    return isEnterprise.value ? '去发布任务' : '去任务广场';
  }
  if (!isEnterprise.value) {
    return '提交本轮进展';
  }
  if (showWorkspaceSecondaryAction.value) {
    return workspaceSecondaryLabel.value;
  }
  return workspacePrimaryLabel.value;
});
const workspaceHeroSecondaryLabel = computed(() => {
  if (!hasTask.value) {
    return '';
  }
  if (!isEnterprise.value) {
    return workspacePrimaryLabel.value;
  }
  if (showWorkspaceSecondaryAction.value) {
    return workspacePrimaryLabel.value;
  }
  return '';
});
const workspaceHeroTertiaryLabel = computed(() => {
  if (!hasTask.value || isEnterprise.value || !showWorkspaceSecondaryAction.value) {
    return '';
  }
  return workspaceSecondaryLabel.value;
});
const taskDetailAccordionItems = computed(() => {
  if (!hasTask.value) {
    return [];
  }

  const taskDetail = page.value?.taskDetail || {};
  const calendarItems = listOf(taskDetail.calendarPreview?.items).map((item) => `${item.day} · ${item.note || '待同步'}`);
  const deliverables = listOf(taskDetail.deliverables);
  const modules = listOf(taskDetail.modules).map((item) => item?.name || item);

  return [
    {
      key: 'basic',
      badge: '任务基础',
      title: '范围、工期与协作安排',
      summary: taskDetail.status || '待同步',
      list: [
        `预算：${taskDetail.budget || '未填写预算'}`,
        `周期：${taskDetail.period || page.value?.summary?.range || '待确认'}`,
        `协作安排：${taskDetail.scheduleNote || '待补充'}`,
        `${isEnterprise.value ? '人才' : '企业'}：${isEnterprise.value ? page.value?.summary?.talent || '待同步' : page.value?.summary?.business || '待同步'}`
      ]
    },
    {
      key: 'deliverables',
      badge: '交付件',
      title: '本任务需要交付什么',
      summary: deliverables.length ? `${deliverables.length} 项交付件` : '暂无交付件清单',
      list: deliverables.length ? deliverables : ['当前还没有补充具体交付件。']
    },
    {
      key: 'calendar',
      badge: '档期',
      title: '近期档期与节奏',
      summary: taskDetail.calendarPreview?.headline || '当前还没有同步真实档期',
      list: calendarItems.length ? calendarItems : ['当前还没有同步真实档期。']
    },
    {
      key: 'modules',
      badge: 'AI 拆解',
      title: 'AI 拆解模块',
      summary: modules.length ? `${modules.length} 个模块` : '暂无模块拆解',
      list: modules.length ? modules : ['当前还没有补充 AI 拆解模块。']
    }
  ];
});
const activeNodeAccordionItems = computed(() => {
  if (!activeNode.value) {
    return [];
  }

  const node = activeNode.value;
  const attachmentItems = listOf(node.attachments)
    .map((item) => attachmentLabel(item))
    .filter(Boolean);
  const aiSuggestions = listOf(node.aiReview?.suggestions)
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  const aiFocusList = listOf(node.aiReview?.focus)
    .map((item) => String(item || '').trim())
    .filter(Boolean);

  return [
    {
      key: 'plan',
      badge: '计划',
      title: '工作日与计划交付',
      summary: node.workdayLabel || node.plannedDate || node.status || '待同步',
      list: [
        `工作日：${node.workdayLabel || '待排期'}`,
        `计划日期：${node.plannedDate || '待排期'}`,
        `节点类型：${node.stageType || '待同步'}`,
        `计划交付：${node.expectedDeliverablesText || '当前还没有补充明确交付件。'}`
      ]
    },
    {
      key: 'submission',
      badge: '提交',
      title: '人才本轮提交',
      summary: node.submissionTime || '当前还没有新的提交时间',
      body: node.submissionContent || '当前还没有新的提交说明。',
      list: [
        ...(attachmentItems.length ? attachmentItems.map((item) => `附件：${item}`) : []),
        ...(node.supportNeeded ? [`协助需求：${node.supportNeeded}`] : []),
        ...(!attachmentItems.length && !node.supportNeeded ? ['当前还没有附件或协助需求。'] : [])
      ]
    },
    {
      key: 'ai',
      badge: 'AI',
      title: 'AI 审核与建议',
      summary: node.aiReview?.summary || '当前还没有新的 AI 审核结论。',
      list: [
        ...(node.aiReview?.status ? [`审核状态：${node.aiReview.status}`] : []),
        ...(node.aiReview?.score ? [`综合评分：${node.aiReview.score}`] : []),
        ...aiFocusList.map((item) => `关注点：${item}`),
        ...aiSuggestions.map((item) => `建议：${item}`),
        ...(!node.aiReview?.status && !node.aiReview?.score && !aiFocusList.length && !aiSuggestions.length
          ? ['当前还没有新的 AI 审核建议。']
          : [])
      ]
    }
  ];
});

const taskFlowTitle = computed(() => {
  switch (taskFlowMode.value) {
    case 'early_request':
      return '发起提前完成';
    case 'early_approve':
      return '确认提前完成';
    case 'early_reject':
      return '继续执行任务';
    case 'early_grade':
      return '完成交付评级';
    case 'cancel_request':
      return '申请取消任务';
    case 'cancel_approve':
      return '同意取消任务';
    case 'cancel_reject':
      return '拒绝取消任务';
    default:
      return '处理任务动作';
  }
});

const taskFlowDescription = computed(() => {
  switch (taskFlowMode.value) {
    case 'early_request':
      return '提交给 AI 的说明越清楚，越容易快速判断当前任务是否适合提前完成。';
    case 'early_approve':
      return '如果你认为当前交付质量已经足够进入完结与评级，可以直接同意。';
    case 'early_reject':
      return '如果还有关键交付未完成，可以说明原因，任务会继续保持执行中。';
    case 'early_grade':
      return '企业按 S / A / B 给出最终交付评级，并决定 100% / 80% / 30% 结算比例。';
    case 'cancel_request':
      return '取消任务需要对方同意，建议把取消原因写清楚，减少来回确认。';
    case 'cancel_approve':
      return '确认后任务会进入已取消状态，但历史记录会继续保留。';
    case 'cancel_reject':
      return '如果你希望继续执行，可以说明理由，任务会恢复执行中。';
    default:
      return '围绕当前任务继续处理关键动作。';
  }
});

const taskFlowInputLabel = computed(() => (taskFlowMode.value === 'early_grade' ? '评级说明' : '补充说明'));
const taskFlowPlaceholder = computed(() => {
  switch (taskFlowMode.value) {
    case 'early_request':
      return '例如：当前页面、附件和 AI 审核记录已经足够支撑验收，希望提前完成。';
    case 'early_reject':
      return '例如：还差一轮关键附件和交付说明，希望继续执行。';
    case 'cancel_request':
      return '例如：任务目标变化较大，当前预算与周期已不再适合继续推进。';
    case 'cancel_reject':
      return '例如：当前任务已经接近完成，建议继续执行并走正常验收。';
    case 'early_grade':
      return '例如：交付完整、质量高、沟通顺畅，给出 S 级评级。';
    default:
      return '可补充你对当前动作的说明。';
  }
});

const taskFlowPrimaryLabel = computed(() => {
  switch (taskFlowMode.value) {
    case 'early_request':
      return '提交 AI 审核';
    case 'early_approve':
      return '确认提前完成';
    case 'early_reject':
      return '继续执行';
    case 'early_grade':
      return '提交评级';
    case 'cancel_request':
      return '发起取消申请';
    case 'cancel_approve':
      return '确认取消';
    case 'cancel_reject':
      return '拒绝取消';
    default:
      return '提交';
  }
});

function isFailedResult(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED');
}

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function compactText(value, limit = 72) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, Math.max(0, limit - 3)).trim()}...`;
}

function attachmentLabel(item) {
  if (typeof item === 'string') {
    return item.trim();
  }
  if (item && typeof item === 'object') {
    return String(item.fileName || item.name || item.label || item.url || '').trim();
  }
  return '';
}

function normalizeNode(node) {
  const aiReview = node?.aiReview && typeof node.aiReview === 'object' ? node.aiReview : {};
  const businessSuggestionObject =
    node?.businessSuggestion && typeof node.businessSuggestion === 'object'
      ? node.businessSuggestion
      : null;
  const enterpriseFeedback =
    node?.enterpriseFeedback && typeof node.enterpriseFeedback === 'object' ? node.enterpriseFeedback : null;

  const expectedDeliverablesList = listOf(node?.expectedDeliverables)
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  const expectedDeliverablesText = expectedDeliverablesList.length
    ? expectedDeliverablesList.join(' / ')
    : String(node?.expectedDeliverables || '').trim();

  return {
    id: node?.nodeId || node?.id || '',
    title: node?.title || '未命名节点',
    status: node?.status || '待开始',
    progress: node?.completion || node?.progress || '',
    updatedAt: node?.time || node?.updatedAt || '',
    summary: node?.summary || node?.talentSubmission?.content || '当前还没有节点说明。',
    workdayLabel: node?.workdayLabel || '',
    plannedDate: node?.plannedDate || '',
    expectedDeliverables: node?.expectedDeliverables || '',
    expectedDeliverablesText,
    stageType: node?.stageType || '',
    supportNeeded: node?.supportNeeded || '',
    attachments: listOf(node?.attachments).length ? listOf(node.attachments) : listOf(node?.talentSubmission?.attachments),
    submissionTime: node?.talentSubmission?.time || node?.time || '',
    submissionContent: node?.talentSubmission?.content || node?.summary || '',
    aiReview,
    businessSuggestion: {
      summary:
        businessSuggestionObject?.summary ||
        enterpriseFeedback?.text ||
        node?.enterpriseSuggestion ||
        '',
      aiSupplement:
        businessSuggestionObject?.aiSupplement ||
        enterpriseFeedback?.aiInterpretation ||
        node?.aiInterpretation ||
        '',
      updatedAt: businessSuggestionObject?.updatedAt || enterpriseFeedback?.updatedAt || '',
      author: businessSuggestionObject?.author || ''
    }
  };
}

async function loadPage(options = {}) {
  const silent = Boolean(options.silent);
  if (!silent) {
    loading.value = true;
  }
  try {
    page.value = await getWorkspaceData(currentTaskId.value);
  } finally {
    if (!silent) {
      loading.value = false;
    }
  }
}

function selectTask(taskId) {
  const nextTaskId = String(taskId || '').trim();
  if (!nextTaskId || nextTaskId === currentTaskId.value) {
    return;
  }
  closeTaskSwitcher();

  router.replace({
    path: route.path,
    query: serializeObjectPageContext({ taskId: nextTaskId })
  });
}

function openTaskSwitcher() {
  taskSwitcherVisible.value = true;
}

function closeTaskSwitcher() {
  taskSwitcherVisible.value = false;
}

function openTaskDetail() {
  taskDetailVisible.value = true;
}

function closeTaskDetail() {
  taskDetailVisible.value = false;
}

function openRecordSheet() {
  recordSheetVisible.value = true;
}

function closeRecordSheet() {
  recordSheetVisible.value = false;
}

function openNodeOverview() {
  nodeOverviewVisible.value = true;
}

function closeNodeOverview() {
  nodeOverviewVisible.value = false;
}

function openProgressComposer() {
  progressComposerVisible.value = true;
}

function closeProgressComposer() {
  progressComposerVisible.value = false;
}

function handleWorkspaceHeroPrimaryAction() {
  if (!hasTask.value) {
    handleWorkspacePrimaryAction();
    return;
  }
  if (!isEnterprise.value) {
    openProgressComposer();
    return;
  }
  if (showWorkspaceSecondaryAction.value) {
    handleWorkspaceSecondaryAction();
    return;
  }
  handleWorkspacePrimaryAction();
}

function handleWorkspaceHeroSecondaryAction() {
  if (!hasTask.value) {
    return;
  }
  if (!isEnterprise.value) {
    handleWorkspacePrimaryAction();
    return;
  }
  if (showWorkspaceSecondaryAction.value) {
    handleWorkspacePrimaryAction();
  }
}

function handleWorkspaceHeroTertiaryAction() {
  if (!hasTask.value || isEnterprise.value || !showWorkspaceSecondaryAction.value) {
    return;
  }
  handleWorkspaceSecondaryAction();
}

function handleWorkspacePrimaryAction() {
  if (hasTask.value) {
    router.push(chatRoute.value);
    return;
  }

  router.push(isEnterprise.value ? roleRouteMap.enterprise.publish : roleRouteMap.talent.market);
}

function handleWorkspaceSecondaryAction() {
  if (!hasTask.value) {
    return;
  }
  if (canOpenAcceptance.value) {
    router.push(acceptanceRoute.value);
    return;
  }
  if (isEnterprise.value && canRequestEarlyCompletion.value) {
    openTaskFlowModal('early_request');
    return;
  }
  if (canRequestCancellation.value) {
    openTaskFlowModal('cancel_request');
    return;
  }
  openTaskDetail();
}

function openNode(node) {
  closeNodeOverview();
  activeNode.value = normalizeNode(node);
  feedbackForm.value.summary = '';
  feedbackResult.value = '';
}

function openNodeFromOverview(node) {
  openNode(node);
}

function closeNode() {
  activeNode.value = null;
  feedbackForm.value.summary = '';
  feedbackResult.value = '';
}

function openTaskFlowModal(mode) {
  taskFlowMode.value = mode;
  taskFlowError.value = '';
  taskFlowResult.value = '';
  taskFlowForm.value = {
    note: '',
    grade: earlyCompletion.value.grade || 'A'
  };
  taskFlowModalOpen.value = true;
}

function closeTaskFlowModal() {
  taskFlowModalOpen.value = false;
  taskFlowMode.value = '';
  taskFlowError.value = '';
}

function handleProgressFiles(event) {
  progressFiles.value = Array.from(event.target.files || []);
}

async function submitProgressForm() {
  if (!page.value?.summary?.taskId) {
    return;
  }

  submittingProgress.value = true;
  progressResult.value = '';

  let attachmentFiles = [];
  try {
    attachmentFiles = await Promise.all(
      progressFiles.value.map((file) =>
        uploadTaskAttachmentAsset(page.value.summary.taskId, file, {
          scene: 'TASK_PROGRESS',
          source: 'TASK_PROGRESS'
        })
      )
    );
  } catch (error) {
    progressResult.value = error?.requestError || error?.message || '本轮附件上传失败，请稍后再试。';
    submittingProgress.value = false;
    return;
  }

  const result = await submitTaskProgress(page.value.summary.taskId, {
    submitterUserId: page.value.summary.talentUserId || page.value.summary.businessUserId || '',
    stage: progressForm.value.stageName,
    progressText: progressForm.value.progressSummary,
    supportNeeded: progressForm.value.supportNeeded,
    completionPercent: progressForm.value.completion,
    attachmentFiles
  });

  if (isFailedResult(result)) {
    progressResult.value = result?.requestError || result?.nextStep || '本轮进展提交失败，请稍后再试。';
    submittingProgress.value = false;
    return;
  }

  progressResult.value = result?.nextStep || '本轮进展已提交。';
  progressForm.value = {
    stageName: '',
    completion: '',
    progressSummary: '',
    supportNeeded: ''
  };
  progressFiles.value = [];
  await loadPage();
  progressComposerVisible.value = false;
  submittingProgress.value = false;
}

async function submitNodeFeedback() {
  if (!activeNode.value?.id || !page.value?.summary?.taskId) {
    return;
  }

  submittingFeedback.value = true;
  feedbackResult.value = '';

  const result = await submitWorkspaceFeedback(page.value.summary.taskId, {
    nodeId: activeNode.value.id,
    summary: feedbackForm.value.summary
  });

  if (isFailedResult(result)) {
    feedbackResult.value = result?.requestError || result?.nextStep || '企业建议保存失败，请稍后再试。';
    submittingFeedback.value = false;
    return;
  }

  feedbackResult.value = result?.nextStep || '企业建议已记录。';

  if (result?.businessSuggestion) {
    activeNode.value = {
      ...activeNode.value,
      businessSuggestion: {
        summary: result.businessSuggestion.summary || '',
        aiSupplement: result.businessSuggestion.aiSupplement || '',
        updatedAt: result.businessSuggestion.updatedAt || '',
        author: result.businessSuggestion.author || ''
      }
    };
  }

  await loadPage();
  submittingFeedback.value = false;
}

async function submitTaskFlowAction() {
  if (!page.value?.summary?.taskId || !taskFlowMode.value) {
    return;
  }

  submittingTaskFlow.value = true;
  taskFlowError.value = '';

  try {
    let result = null;

    if (taskFlowMode.value.startsWith('early_')) {
      const action = taskFlowMode.value.replace('early_', '');
      result = await submitEarlyCompletion(page.value.summary.taskId, {
        action,
        note: taskFlowForm.value.note,
        grade: taskFlowForm.value.grade
      });
    } else if (taskFlowMode.value.startsWith('cancel_')) {
      const action = taskFlowMode.value.replace('cancel_', '');
      result = await submitTaskCancellation(page.value.summary.taskId, {
        action,
        reason: taskFlowForm.value.note
      });
    }

    if (result?.actionBlocked) {
      taskFlowError.value = result.actionMessage || '当前动作暂时不可执行。';
      return;
    }

    if (isFailedResult(result)) {
      taskFlowError.value = result?.requestError || result?.nextStep || '任务动作提交失败，请稍后再试。';
      return;
    }

    taskFlowResult.value = result?.nextStep || '任务状态已更新。';
    closeTaskFlowModal();
    await loadPage();
  } finally {
    submittingTaskFlow.value = false;
  }
}

watch(
  () => [route.query.taskId, route.meta?.audience],
  async () => {
    await loadPage();
  }
);

onMounted(async () => {
  await loadPage();
  stopBusinessLiveSync = startBusinessLiveSync({
    refresh: () => loadPage({ silent: true }),
    acceptsEvent(event) {
      const taskId = String(currentTaskId.value || '').trim();
      return !taskId || !event?.taskId || event.taskId === taskId;
    },
    shouldPause() {
      return submittingProgress.value || submittingFeedback.value || submittingTaskFlow.value;
    },
    onStatusChange: handleLiveSyncStatus,
    onSyncError: handleLiveSyncError
  });
});

onBeforeUnmount(() => {
  stopBusinessLiveSync?.();
  stopBusinessLiveSync = null;
});
</script>

<style scoped>
.workspace-quick-entry-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.workspace-quick-entry {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid rgba(120, 190, 255, 0.14);
  border-radius: 999px;
  background: rgba(8, 15, 28, 0.68);
  color: var(--text-soft);
  font-size: 13px;
  font-weight: 600;
}

.workspace-node-card-focus {
  width: 100%;
}

.workspace-node-followup {
  margin: 0;
}
</style>
