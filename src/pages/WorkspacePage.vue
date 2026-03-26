<template>
  <section class="page-stack workspace-page" v-if="page">
    <article class="hero-card workspace-hero stack-md">
      <span class="eyebrow">{{ isEnterprise ? '企业端协作空间' : '人才端执行台' }}</span>
      <h1 class="dashboard-title">{{ isEnterprise ? '多任务协作总览' : '任务执行与进展同步' }}</h1>
      <p class="hero-lead dashboard-lead">
        {{ isEnterprise ? enterpriseLead : talentLead }}
      </p>

      <div class="dashboard-hero-actions">
        <router-link class="button-primary" :to="chatRoute">去聊天</router-link>
        <button class="button-secondary" type="button" @click="openTaskDetail">查看任务详情</button>
      </div>
    </article>

    <article v-if="taskOptions.length" class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">任务切换</span>
          <h3>{{ isEnterprise ? '协作中的任务' : '我当前承接的任务' }}</h3>
        </div>
        <span class="soft-pill">{{ taskOptions.length }} 个任务</span>
      </div>

      <div class="workspace-task-strip">
        <button
          v-for="task in taskOptions"
          :key="task.taskId"
          class="workspace-task-chip"
          :class="{ 'is-active': task.taskId === currentTaskId }"
          type="button"
          @click="selectTask(task.taskId)"
        >
          <span class="workspace-task-chip-title">{{ task.title }}</span>
          <span class="workspace-task-chip-meta">{{ task.status }} · {{ task.progress || task.completion || '待同步' }}</span>
        </button>
      </div>
    </article>

    <article v-if="hasTask" class="glass-panel stack-md">
      <div class="panel-header panel-header-top">
        <div>
          <span class="eyebrow">当前任务</span>
          <h3>{{ page.taskDetail.title }}</h3>
        </div>
        <span class="soft-pill">{{ page.taskDetail.status }}</span>
      </div>

      <p class="muted workspace-task-brief">{{ page.taskDetail.brief }}</p>

      <section class="metric-grid workspace-overview-grid">
        <article class="metric-card workspace-overview-card">
          <span class="eyebrow">{{ isEnterprise ? '协作人才' : '合作企业' }}</span>
          <div class="metric-value">{{ isEnterprise ? page.summary.talent : page.summary.business }}</div>
          <p>{{ isEnterprise ? '当前任务已绑定的人才' : '当前任务的企业需求方' }}</p>
        </article>
        <article class="metric-card workspace-overview-card">
          <span class="eyebrow">预算</span>
          <div class="metric-value">{{ page.taskDetail.budget || '未填写预算' }}</div>
          <p>预算会在任务详情、聊天确认和验收时持续同步。</p>
        </article>
        <article class="metric-card workspace-overview-card">
          <span class="eyebrow">周期</span>
          <div class="metric-value">{{ page.taskDetail.period || page.summary.range }}</div>
          <p>周期按当前确认单和 AI 熟练人才执行效率估算。</p>
        </article>
        <article class="metric-card workspace-overview-card">
          <span class="eyebrow">当前重点</span>
          <strong class="workspace-overview-highlight">{{ page.focus || '继续推进当前节点' }}</strong>
          <p>点击节点可以查看计划、提交、审核和反馈。</p>
        </article>
      </section>
    </article>

    <article v-if="hasTask" class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">任务动作</span>
          <h3>{{ isEnterprise ? '提前完成、取消与验收入口' : '确认提前完成、处理取消申请与查看评级' }}</h3>
        </div>
      </div>

      <div class="dashboard-detail-dual">
        <article class="mini-card stack-sm">
          <div class="panel-header">
            <div>
              <h4>提前完成</h4>
              <p class="muted">{{ earlyCompletionStatusText }}</p>
            </div>
            <span class="soft-pill">{{ earlyCompletion.status || '未发起' }}</span>
          </div>

          <p class="muted">{{ earlyCompletionSummary }}</p>

          <div class="tag-row" v-if="earlyCompletion.aiReviewStatus || earlyCompletion.grade || earlyCompletion.payoutRatio">
            <span v-if="earlyCompletion.aiReviewStatus" class="soft-pill">{{ earlyCompletion.aiReviewStatus }}</span>
            <span v-if="earlyCompletion.grade" class="soft-pill">评级 {{ earlyCompletion.grade }}</span>
            <span v-if="earlyCompletion.payoutRatio" class="soft-pill">结算 {{ earlyCompletion.payoutRatio }}</span>
          </div>

          <div class="dashboard-module-actions">
            <button
              v-if="canRequestEarlyCompletion"
              class="button-primary"
              type="button"
              @click="openTaskFlowModal('early_request')"
            >
              发起提前完成
            </button>
            <router-link
              v-if="canOpenAcceptance"
              class="button-primary"
              :to="acceptanceRoute"
            >
              {{ isEnterprise ? '去验收与评级' : '查看评级结果' }}
            </router-link>
            <button
              v-if="canApproveEarlyCompletion"
              class="button-primary"
              type="button"
              @click="openTaskFlowModal('early_approve')"
            >
              同意提前完成
            </button>
            <button
              v-if="canRejectEarlyCompletion"
              class="button-secondary"
              type="button"
              @click="openTaskFlowModal('early_reject')"
            >
              继续执行
            </button>
            <span v-if="isEnterpriseWaitingGrade" class="soft-pill is-warning">等待企业评级</span>
          </div>
        </article>

        <article class="mini-card stack-sm">
          <div class="panel-header">
            <div>
              <h4>取消任务</h4>
              <p class="muted">{{ cancellationStatusText }}</p>
            </div>
            <span class="soft-pill">{{ cancellationRequest.status || '未发起' }}</span>
          </div>

          <p class="muted">{{ cancellationSummary }}</p>

          <div class="dashboard-module-actions">
            <button
              v-if="canRequestCancellation"
              class="button-secondary"
              type="button"
              @click="openTaskFlowModal('cancel_request')"
            >
              申请取消任务
            </button>
            <button
              v-if="canApproveCancellation"
              class="button-primary"
              type="button"
              @click="openTaskFlowModal('cancel_approve')"
            >
              同意取消
            </button>
            <button
              v-if="canRejectCancellation"
              class="button-secondary"
              type="button"
              @click="openTaskFlowModal('cancel_reject')"
            >
              继续执行
            </button>
            <span v-if="cancellationWaitingCounterpart" class="soft-pill is-warning">等待对方确认</span>
          </div>
        </article>
      </div>

      <article v-if="page.celebrationBanner" class="result-card workspace-celebration-card">
        <span class="eyebrow">高光时刻</span>
        <h3>{{ page.celebrationBanner.title }}</h3>
        <p class="muted">{{ page.celebrationBanner.summary }}</p>
        <div class="tag-row">
          <span class="soft-pill">{{ page.celebrationBanner.badge }}</span>
        </div>
      </article>

      <p v-if="taskFlowResult" class="soft-pill">{{ taskFlowResult }}</p>
    </article>

    <article v-if="hasTask" class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">阶段节点</span>
          <h3>{{ isEnterprise ? '按计划查看交付与反馈' : '按计划提交进展并查看审核' }}</h3>
        </div>
      </div>

      <div class="workspace-node-timeline">
        <button
          v-for="(node, index) in normalizedNodes"
          :key="node.id"
          class="workspace-node-card"
          type="button"
          @click="openNode(node)"
        >
          <span class="workspace-node-rail">
            <span class="workspace-node-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="workspace-node-line"></span>
          </span>
            <div class="workspace-node-main">
              <div class="workspace-node-head">
                <div>
                  <h4>{{ node.title }}</h4>
                  <p>{{ node.summary }}</p>
                </div>
                <span class="soft-pill">{{ node.status }}</span>
              </div>
              <div class="tag-row">
                <span class="soft-pill">{{ node.workdayLabel || '待排期' }}</span>
                <span class="soft-pill">{{ node.plannedDate || '待排期' }}</span>
                <span class="soft-pill">{{ node.stageType || '执行节点' }}</span>
              </div>
              <div class="workspace-node-meta">
                <span>{{ node.progress || '待同步' }}</span>
                <span>{{ node.updatedAt || '待更新' }}</span>
                <span>{{ node.attachments.length ? `${node.attachments.length} 个附件` : '暂无附件' }}</span>
              </div>
              <p class="muted workspace-node-deliverable">计划交付：{{ node.expectedDeliverables || '待补充' }}</p>
            </div>
          </button>
      </div>
    </article>

    <article v-if="hasTask && isEnterprise" class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">最近提交</span>
          <h3>人才最近一轮同步</h3>
        </div>
      </div>

      <article v-if="latestProgress" class="mini-card stack-sm">
        <div class="panel-header">
          <div>
            <h4>{{ latestProgress.stage || '最新进展' }}</h4>
            <p class="muted">{{ latestProgress.time || latestProgress.submittedAt || '刚刚更新' }}</p>
          </div>
          <span class="soft-pill">{{ latestProgress.completion || '待同步' }}</span>
        </div>
        <p class="muted">{{ latestProgress.summary }}</p>
        <div class="tag-row" v-if="listOf(latestProgress.attachments).length">
          <span v-for="item in listOf(latestProgress.attachments)" :key="item" class="tag-pill tag-pill-muted">{{ item }}</span>
        </div>
      </article>
      <p v-else class="muted">当前还没有新的进展提交，节点详情会在人才更新后自动补齐。</p>
    </article>

    <article v-if="hasTask && !isEnterprise" class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">本轮进展</span>
          <h3>提交进展、协助需求和附件</h3>
        </div>
      </div>

      <form class="workspace-progress-form" @submit.prevent="submitProgressForm">
        <label class="form-field">
          <span>阶段名称</span>
          <input v-model.trim="progressForm.stageName" type="text" placeholder="例如：首版页面交付" />
        </label>

        <div class="workspace-progress-grid">
          <label class="form-field">
            <span>完成度</span>
            <input v-model.trim="progressForm.completion" type="text" placeholder="例如：68%" />
          </label>
          <label class="form-field">
            <span>需要的协助</span>
            <select v-model="progressForm.supportNeeded">
              <option value="">暂不需要</option>
              <option v-for="option in page.supportOptions || []" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>
        </div>

        <label class="form-field">
          <span>进展说明</span>
          <textarea
            v-model.trim="progressForm.progressSummary"
            rows="4"
            placeholder="说明本轮做了什么、产出了什么、下一步准备怎么推进。"
          ></textarea>
        </label>

        <label class="form-field">
          <span>上传进度附件</span>
          <input type="file" multiple @change="handleProgressFiles" />
        </label>

        <div v-if="progressFiles.length" class="tag-row">
          <span v-for="file in progressFiles" :key="file.name" class="tag-pill tag-pill-muted">
            {{ file.name }}
          </span>
        </div>

        <div class="dashboard-module-actions">
          <button class="button-primary" type="submit" :disabled="submittingProgress">
            {{ submittingProgress ? '提交中…' : '提交本轮进展' }}
          </button>
          <span v-if="progressResult" class="soft-pill">{{ progressResult }}</span>
        </div>
      </form>
    </article>

    <article v-if="hasTask" class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">最近记录</span>
          <h3>{{ isEnterprise ? '最近几轮进展与 AI 审核' : '最近几轮提交与审核结果' }}</h3>
        </div>
      </div>

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
    </article>

    <article v-if="!hasTask" class="glass-panel stack-md">
      <div class="panel-header">
        <div>
          <span class="eyebrow">暂无协作任务</span>
          <h3>{{ isEnterprise ? '先发布任务，再进入协作空间' : '先接单，再在这里同步进展' }}</h3>
        </div>
      </div>

      <p class="muted">
        {{ isEnterprise ? '企业发布任务并选中人才后，多任务协作会自动出现在这里。' : '人才接单并确认任务后，执行进展、协助需求和附件都会沉淀在这里。' }}
      </p>

      <div class="dashboard-hero-actions">
        <router-link v-if="isEnterprise" class="button-primary" :to="roleRouteMap.enterprise.publish">去发布任务</router-link>
        <router-link v-else class="button-primary" :to="roleRouteMap.talent.market">查看任务广场</router-link>
      </div>
    </article>

    <div v-if="taskDetailVisible" class="dashboard-detail-modal" @click.self="closeTaskDetail">
      <article class="dashboard-detail-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">任务详情</span>
            <h3>{{ page.taskDetail.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeTaskDetail">关闭</button>
        </div>

        <p class="muted">{{ page.taskDetail.brief }}</p>

        <div class="dashboard-detail-dual">
          <div class="mini-card stack-sm">
            <h4>基础信息</h4>
            <ul class="dashboard-detail-list">
              <li>预算：{{ page.taskDetail.budget || '未填写预算' }}</li>
              <li>周期：{{ page.taskDetail.period || page.summary.range }}</li>
              <li>协作安排：{{ page.taskDetail.scheduleNote || '待补充' }}</li>
              <li>状态：{{ page.taskDetail.status }}</li>
              <li>{{ isEnterprise ? '人才' : '企业' }}：{{ isEnterprise ? page.summary.talent : page.summary.business }}</li>
            </ul>
          </div>

          <div class="mini-card stack-sm">
            <h4>交付件</h4>
            <ul class="dashboard-detail-list">
              <li v-for="item in listOf(page.taskDetail.deliverables)" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div v-if="page.taskDetail.calendarPreview?.headline || listOf(page.taskDetail.calendarPreview?.items).length" class="mini-card stack-sm">
          <h4>人才档期</h4>
          <p class="muted">{{ page.taskDetail.calendarPreview?.headline || '待同步' }}</p>
          <div class="tag-row" v-if="listOf(page.taskDetail.calendarPreview?.items).length">
            <span
              v-for="item in listOf(page.taskDetail.calendarPreview?.items)"
              :key="`${item.day}-${item.note}`"
              class="soft-pill"
            >
              {{ item.day }} · {{ item.note }}
            </span>
          </div>
        </div>

        <div class="mini-card stack-sm">
          <h4>AI 拆解模块</h4>
          <ul class="dashboard-detail-list">
            <li v-for="item in listOf(page.taskDetail.modules)" :key="item.name || item">{{ item.name || item }}</li>
          </ul>
        </div>
      </article>
    </div>

    <div v-if="activeNode" class="dashboard-detail-modal" @click.self="closeNode">
      <article class="dashboard-detail-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">阶段节点</span>
            <h3>{{ activeNode.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeNode">关闭</button>
        </div>

        <div class="dashboard-detail-dual workspace-node-modal-grid">
          <div class="mini-card stack-sm">
            <h4>计划信息</h4>
            <ul class="dashboard-detail-list">
              <li>工作日：{{ activeNode.workdayLabel || '待排期' }}</li>
              <li>计划日期：{{ activeNode.plannedDate || '待排期' }}</li>
              <li>节点类型：{{ activeNode.stageType || '执行节点' }}</li>
              <li>计划交付：{{ activeNode.expectedDeliverables || '待补充' }}</li>
            </ul>
          </div>

          <div class="mini-card stack-sm">
            <h4>{{ isEnterprise ? '人才提交' : '本轮提交' }}</h4>
            <p class="muted">{{ activeNode.submissionContent }}</p>
            <div class="tag-row" v-if="activeNode.attachments.length">
              <span v-for="item in activeNode.attachments" :key="item" class="tag-pill tag-pill-muted">{{ item }}</span>
            </div>
            <p class="muted" v-if="activeNode.supportNeeded">协助需求：{{ activeNode.supportNeeded }}</p>
            <p class="muted">{{ activeNode.submissionTime || activeNode.updatedAt }}</p>
          </div>

          <div class="mini-card stack-sm">
            <h4>AI 审核</h4>
            <p class="muted">{{ activeNode.aiReview.summary || '当前还没有 AI 审核摘要。' }}</p>
            <div class="tag-row">
              <span class="soft-pill">{{ activeNode.aiReview.status || '待生成' }}</span>
              <span class="soft-pill" v-if="activeNode.aiReview.score">评分 {{ activeNode.aiReview.score }}</span>
              <span class="soft-pill" v-if="activeNode.aiReview.focus">{{ activeNode.aiReview.focus }}</span>
            </div>
            <ul class="dashboard-detail-list" v-if="listOf(activeNode.aiReview.suggestions).length">
              <li v-for="item in listOf(activeNode.aiReview.suggestions)" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

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
      </article>
    </div>

    <div v-if="taskFlowModalOpen" class="dashboard-detail-modal" @click.self="closeTaskFlowModal">
      <article class="dashboard-detail-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">任务动作</span>
            <h3>{{ taskFlowTitle }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="closeTaskFlowModal">关闭</button>
        </div>

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
      </article>
    </div>
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
import {
  getWorkspaceData,
  submitEarlyCompletion,
  submitTaskCancellation,
  submitTaskProgress,
  submitWorkspaceFeedback
} from '../services/api';
import { roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();

const page = ref(null);
const loading = ref(false);
const taskDetailVisible = ref(false);
const activeNode = ref(null);
const progressFiles = ref([]);
const progressResult = ref('');
const feedbackResult = ref('');
const taskFlowResult = ref('');
const submittingProgress = ref(false);
const submittingFeedback = ref(false);
const taskFlowModalOpen = ref(false);
const taskFlowMode = ref('');
const taskFlowError = ref('');
const submittingTaskFlow = ref(false);
let workspaceRefreshTimer = null;

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
const currentTaskId = computed(() => String(route.query.taskId || page.value?.summary?.taskId || '').trim());
const hasTask = computed(() => Boolean(page.value?.taskDetail?.taskId));
const taskOptions = computed(() => listOf(page.value?.taskOptions));
const chatRoute = computed(() => (isEnterprise.value ? roleRouteMap.enterprise.messages : roleRouteMap.talent.messages));
const acceptanceRoute = computed(() => ({
  path: isEnterprise.value ? roleRouteMap.enterprise.acceptance : roleRouteMap.talent.acceptance,
  query: currentTaskId.value ? { taskId: currentTaskId.value } : {}
}));

const enterpriseLead = '按任务切换查看当前执行情况、节点交付和企业反馈。';
const talentLead = '在这里集中查看任务计划、提交进展、补充协助需求和上传附件。';
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

const latestProgress = computed(() => {
  const items = listOf(page.value?.progressFeed);
  return items.length ? items[items.length - 1] : null;
});

const recordItems = computed(() => {
  const progress = listOf(page.value?.progressFeed).slice(0, 2).map((item, index) => ({
    key: `progress-${index}`,
    title: item.stage || '最新进展',
    time: item.time || item.submittedAt || '刚刚更新',
    badge: item.completion || '进展',
    summary: item.summary || '当前还没有更多进展说明。'
  }));

  const reviews = listOf(page.value?.aiReviewHistory).slice(0, 2).map((item, index) => ({
    key: `review-${index}`,
    title: item.title || 'AI 巡检',
    time: item.focus || 'AI 审核',
    badge: item.status || '已生成',
    summary: item.summary || '当前还没有 AI 建议。'
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

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeNode(node) {
  const aiReview = node?.aiReview && typeof node.aiReview === 'object' ? node.aiReview : {};
  const businessSuggestionObject =
    node?.businessSuggestion && typeof node.businessSuggestion === 'object'
      ? node.businessSuggestion
      : null;
  const enterpriseFeedback =
    node?.enterpriseFeedback && typeof node.enterpriseFeedback === 'object' ? node.enterpriseFeedback : null;

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

  router.replace({
    path: route.path,
    query: {
      ...route.query,
      taskId: nextTaskId
    }
  });
}

function openTaskDetail() {
  taskDetailVisible.value = true;
}

function closeTaskDetail() {
  taskDetailVisible.value = false;
}

function openNode(node) {
  activeNode.value = normalizeNode(node);
  feedbackForm.value.summary = '';
  feedbackResult.value = '';
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

  const result = await submitTaskProgress(page.value.summary.taskId, {
    submitterUserId: page.value.summary.talentUserId || page.value.summary.businessUserId || '',
    stage: progressForm.value.stageName,
    progressText: progressForm.value.progressSummary,
    supportNeeded: progressForm.value.supportNeeded,
    completionPercent: progressForm.value.completion,
    attachmentFiles: progressFiles.value.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type
    }))
  });

  progressResult.value = result?.nextStep || '本轮进展已提交。';
  progressForm.value = {
    stageName: '',
    completion: '',
    progressSummary: '',
    supportNeeded: ''
  };
  progressFiles.value = [];
  await loadPage();
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
  if (typeof window !== 'undefined') {
    workspaceRefreshTimer = window.setInterval(() => {
      if (
        submittingProgress.value ||
        submittingFeedback.value ||
        submittingTaskFlow.value ||
        (typeof document !== 'undefined' && document.visibilityState === 'hidden')
      ) {
        return;
      }
      void loadPage({ silent: true });
    }, 6000);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && workspaceRefreshTimer) {
    window.clearInterval(workspaceRefreshTimer);
  }
});
</script>
