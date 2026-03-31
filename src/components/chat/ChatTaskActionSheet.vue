<template>
  <MobileSheet
    :open="open && Boolean(taskConfirmation)"
    title="任务确认"
    :subtitle="taskActionTitle"
    size="large"
    @close="$emit('close')"
  >
    <div v-if="taskConfirmation" class="stack-md chat-task-action-card">
      <p class="muted">{{ taskConfirmation.summary }}</p>

      <div class="dashboard-preview-list">
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>当前版本</strong>
            <p>{{ taskConfirmationVersionText }}</p>
          </div>
        </div>
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>当前状态</strong>
            <p>{{ taskConfirmation.status }} · {{ taskConfirmationUpdatedText }}</p>
          </div>
        </div>
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>任务金额</strong>
            <p>{{ taskConfirmationBudgetText }}</p>
          </div>
        </div>
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>预计工期</strong>
            <p>{{ taskConfirmationPeriodText }}</p>
          </div>
        </div>
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>协作安排</strong>
            <p>{{ taskConfirmationScheduleText }}</p>
          </div>
        </div>
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>范围说明</strong>
            <p>{{ taskConfirmation.scopeNote }}</p>
          </div>
        </div>
      </div>

      <template v-if="taskActionMode === 'update'">
        <label class="muted" for="task-summary">任务摘要</label>
        <textarea id="task-summary" v-model="taskActionForm.summary" class="textarea message-input" placeholder="例如：第一阶段先确认官网分流、企业端发布任务、人才端接单和聊天协作主链路。"></textarea>
        <label class="muted" for="task-budget">任务金额</label>
        <input id="task-budget" v-model="taskActionForm.budget" class="text-input" type="text" placeholder="例如：26000 或 ￥26000，留空则显示未填写预算" />
        <label class="muted" for="task-period">预计工期</label>
        <input id="task-period" v-model="taskActionForm.period" class="text-input" type="text" placeholder="例如：3 个 AI 协同工作日 / 5 个 AI 协同工作日" />
        <p class="muted">这里修改的是当前版本的确认工期，聊天页、协作空间和任务详情都会同步更新。</p>
        <label class="muted" for="task-scope-note">范围说明</label>
        <textarea id="task-scope-note" v-model="taskActionForm.scopeNote" class="textarea message-input" placeholder="例如：首版只覆盖发布任务、推荐人才、聊天确认和协作验收，支付与高级筛选放到下一阶段。"></textarea>
        <label class="muted" for="task-schedule-note">协作安排说明</label>
        <textarea id="task-schedule-note" v-model="taskActionForm.scheduleNote" class="textarea message-input" placeholder="例如：第一阶段先锁范围，第二阶段补验收与整理，按熟练使用 AI 工具的人才效率推进。"></textarea>
        <p class="muted">协作安排用于说明为什么这样排期、第一阶段先做什么，以及是否要结合人才近期档期调整节奏。</p>
        <section v-if="taskConfirmationChangeReview?.summary" class="dashboard-detail-section stack-sm">
          <h4>AI 修改建议</h4>
          <div class="tag-row" v-if="taskConfirmationChangeReview.status || taskConfirmationChangeReview.recommendedPeriod">
            <span v-if="taskConfirmationChangeReview.status" class="soft-pill">{{ taskConfirmationChangeReview.status }}</span>
            <span v-if="taskConfirmationChangeReview.recommendedPeriod" class="soft-pill">建议工期 {{ taskConfirmationChangeReview.recommendedPeriod }}</span>
          </div>
          <p v-if="taskConfirmationChangeReview.requestedChange" class="muted">人才反馈：{{ taskConfirmationChangeReview.requestedChange }}</p>
          <p v-if="taskConfirmationChangeReview.updateNote" class="muted">企业补充：{{ taskConfirmationChangeReview.updateNote }}</p>
          <p class="muted">{{ taskConfirmationChangeReview.summary }}</p>
          <ul class="dashboard-detail-list" v-if="taskConfirmationChangeReviewSuggestions.length">
            <li v-for="item in taskConfirmationChangeReviewSuggestions" :key="item">{{ item }}</li>
          </ul>
        </section>
      </template>

      <p v-if="taskActionMode === 'withdraw_update'" class="muted">
        撤回后，会恢复到上一版已确认的任务范围、工期和金额，人才端将不再看到当前这次待确认变更。
      </p>

      <template v-if="taskActionMode === 'request_changes' || taskActionMode === 'update'">
        <label class="muted" for="task-action-note">{{ taskActionMode === 'request_changes' ? '修改意见' : '附加说明' }}</label>
        <textarea id="task-action-note" v-model="taskActionForm.note" class="textarea message-input" :placeholder="taskActionMode === 'request_changes' ? '例如：当前工期过短，希望把验收说明和附件整理时间单独留出来。' : '例如：已根据反馈压缩第一阶段范围，请再次确认。'"></textarea>
      </template>

      <p v-if="taskActionError" class="form-error">{{ taskActionError }}</p>

      <section v-if="taskConfirmationModificationHistory.length" class="dashboard-detail-section stack-sm">
        <h4>版本记录</h4>
        <div class="task-confirmation-history">
          <article
            v-for="item in taskConfirmationModificationHistory"
            :key="item.id || `${item.version}-${item.time}`"
            class="task-confirmation-history-item"
          >
            <div class="panel-header">
              <div class="stack-xs">
                <strong>{{ item.action }}</strong>
                <p class="muted">{{ item.actor }} · {{ item.time }}</p>
              </div>
              <div class="toolbar">
                <span class="soft-pill">第 {{ item.version || 1 }} 版</span>
                <span class="soft-pill" :class="taskConfirmationStatusClass(item.status)">{{ item.status }}</span>
              </div>
            </div>
            <p v-if="item.note" class="muted">{{ item.note }}</p>
            <div v-if="item.aiSuggestion?.summary" class="dashboard-preview-item">
              <div class="stack-xs">
                <strong>AI 复核</strong>
                <div class="tag-row" v-if="item.aiSuggestion.status || item.aiSuggestion.recommendedPeriod">
                  <span v-if="item.aiSuggestion.status" class="soft-pill">{{ item.aiSuggestion.status }}</span>
                  <span v-if="item.aiSuggestion.recommendedPeriod" class="soft-pill">建议工期 {{ item.aiSuggestion.recommendedPeriod }}</span>
                </div>
                <p class="muted">{{ item.aiSuggestion.summary }}</p>
              </div>
            </div>
            <ul v-if="item.changes?.length" class="dashboard-detail-list">
              <li v-for="change in item.changes" :key="change">{{ change }}</li>
            </ul>
          </article>
        </div>
      </section>

      <div class="toolbar chat-record-confirm-toolbar">
        <button class="button-secondary" type="button" :disabled="isSubmittingTaskAction" @click="$emit('close')">取消</button>
        <button class="button-primary" type="button" :disabled="isSubmittingTaskAction" @click="$emit('submit')">
          {{ isSubmittingTaskAction ? '提交中...' : taskActionPrimaryLabel }}
        </button>
      </div>
    </div>
  </MobileSheet>
</template>

<script setup>
import MobileSheet from '../mobile/MobileSheet.vue';

defineProps({
  open: { type: Boolean, default: false },
  taskConfirmation: { type: Object, default: null },
  taskActionTitle: { type: String, default: '' },
  taskActionMode: { type: String, default: '' },
  taskActionForm: { type: Object, required: true },
  taskActionError: { type: String, default: '' },
  isSubmittingTaskAction: { type: Boolean, default: false },
  taskActionPrimaryLabel: { type: String, default: '' },
  taskConfirmationVersionText: { type: String, default: '' },
  taskConfirmationUpdatedText: { type: String, default: '' },
  taskConfirmationBudgetText: { type: String, default: '' },
  taskConfirmationPeriodText: { type: String, default: '' },
  taskConfirmationScheduleText: { type: String, default: '' },
  taskConfirmationChangeReview: { type: Object, default: null },
  taskConfirmationChangeReviewSuggestions: { type: Array, default: () => [] },
  taskConfirmationModificationHistory: { type: Array, default: () => [] },
  taskConfirmationStatusClass: { type: Function, required: true }
});

defineEmits(['close', 'submit']);
</script>
