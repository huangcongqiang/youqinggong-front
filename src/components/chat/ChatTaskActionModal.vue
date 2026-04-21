<template>
  <div v-if="open && taskConfirmation" class="dashboard-detail-modal" @click.self="$emit('close')">
    <article class="dashboard-detail-card stack-md chat-task-action-card">
      <div class="panel-header">
        <div class="stack-sm">
          <span class="eyebrow">Terms & milestones</span>
          <h3>{{ taskActionTitle }}</h3>
          <p class="muted">{{ taskConfirmation.summary }}</p>
        </div>
        <button class="button-secondary" type="button" @click="$emit('close')">Close</button>
      </div>

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
            <strong>Budget</strong>
            <p>{{ taskConfirmationBudgetText }}</p>
          </div>
        </div>
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>Timeline</strong>
            <p>{{ taskConfirmationPeriodText }}</p>
          </div>
        </div>
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>Working arrangement</strong>
            <p>{{ taskConfirmationScheduleText }}</p>
          </div>
        </div>
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>Scope note</strong>
            <p>{{ taskConfirmation.scopeNote }}</p>
          </div>
        </div>
      </div>

      <template v-if="taskActionMode === 'update'">
        <label class="muted" for="task-summary">合同摘要</label>
        <textarea id="task-summary" v-model="taskActionForm.summary" class="textarea message-input" placeholder="For example: confirm the scope, timeline, milestones, and who owns the next step."></textarea>
        <label class="muted" for="task-budget">Budget</label>
        <input id="task-budget" v-model="taskActionForm.budget" class="text-input" type="text" placeholder="For example: 26000 or $26000. Leave blank to keep the budget open." />
        <label class="muted" for="task-period">Timeline</label>
        <input id="task-period" v-model="taskActionForm.period" class="text-input" type="text" placeholder="For example: 3 working days / 5 working days" />
        <p class="muted">Updating the timeline here will sync across messages, the contract overview, and the contract detail view.</p>
        <label class="muted" for="task-scope-note">Scope note</label>
        <textarea id="task-scope-note" v-model="taskActionForm.scopeNote" class="textarea message-input" placeholder="For example: phase one covers the job post, invite flow, messages, and review. The rest moves to the next phase."></textarea>
        <label class="muted" for="task-schedule-note">Working arrangement note</label>
        <textarea id="task-schedule-note" v-model="taskActionForm.scheduleNote" class="textarea message-input" placeholder="For example: lock scope first, then move into review and polish based on the freelancer's current availability."></textarea>
        <p class="muted">Use this note to explain the schedule, what happens first, and whether timing should adapt to the talent's current availability.</p>
        <section v-if="taskConfirmationChangeReview?.summary" class="dashboard-detail-section stack-sm">
          <h4>Assistant change guidance</h4>
          <div class="tag-row" v-if="taskConfirmationChangeReview.status || taskConfirmationChangeReview.recommendedPeriod">
            <span v-if="taskConfirmationChangeReview.status" class="soft-pill">{{ taskConfirmationChangeReview.status }}</span>
            <span v-if="taskConfirmationChangeReview.recommendedPeriod" class="soft-pill">建议时间安排 {{ taskConfirmationChangeReview.recommendedPeriod }}</span>
          </div>
          <p v-if="taskConfirmationChangeReview.requestedChange" class="muted">人才备注： {{ taskConfirmationChangeReview.requestedChange }}</p>
          <p v-if="taskConfirmationChangeReview.updateNote" class="muted">企业备注： {{ taskConfirmationChangeReview.updateNote }}</p>
          <p class="muted">{{ taskConfirmationChangeReview.summary }}</p>
          <ul class="dashboard-detail-list" v-if="taskChangeReviewSuggestions.length">
            <li v-for="item in taskChangeReviewSuggestions" :key="item">{{ item }}</li>
          </ul>
        </section>
      </template>

      <p v-if="taskActionMode === 'withdraw_update'" class="muted">
        Withdrawing this update restores the previously confirmed scope, timeline, and budget. The freelancer will no longer see this pending change.
      </p>

      <template v-if="taskActionMode === 'request_changes' || taskActionMode === 'update'">
        <label class="muted" for="task-action-note">{{ taskActionMode === 'request_changes' ? 'Requested changes' : 'Additional note' }}</label>
        <textarea id="task-action-note" v-model="taskActionForm.note" class="textarea message-input" :placeholder="taskActionMode === 'request_changes' ? 'For example: the current timeline is too short, so review notes and file handoff need a separate buffer.' : 'For example: phase one was reduced based on the last review. Please confirm again.'"></textarea>
      </template>

      <p v-if="taskActionError" class="form-error">{{ taskActionError }}</p>

      <section v-if="taskConfirmationModificationHistory.length" class="dashboard-detail-section stack-sm">
        <h4>Version history</h4>
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
                <span class="soft-pill">Version {{ item.version || 1 }}</span>
                <span class="soft-pill" :class="taskConfirmationStatusClass(item.status)">{{ item.status }}</span>
              </div>
            </div>
            <p v-if="item.note" class="muted">{{ item.note }}</p>
            <div v-if="item.aiSuggestion?.summary" class="dashboard-preview-item">
              <div class="stack-xs">
                <strong>Assistant review</strong>
                <div class="tag-row" v-if="item.aiSuggestion.status || item.aiSuggestion.recommendedPeriod">
                  <span v-if="item.aiSuggestion.status" class="soft-pill">{{ item.aiSuggestion.status }}</span>
                  <span v-if="item.aiSuggestion.recommendedPeriod" class="soft-pill">建议时间安排 {{ item.aiSuggestion.recommendedPeriod }}</span>
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
        <button class="button-secondary" type="button" :disabled="isSubmittingTaskAction" @click="$emit('close')">Cancel</button>
        <button class="button-primary" type="button" :disabled="isSubmittingTaskAction" @click="$emit('submit')">
          {{ isSubmittingTaskAction ? 'Submitting...' : taskActionPrimaryLabel }}
        </button>
      </div>
    </article>
  </div>
</template>

<script setup>
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
  taskChangeReviewSuggestions: { type: Array, default: () => [] },
  taskConfirmationModificationHistory: { type: Array, default: () => [] },
  taskConfirmationStatusClass: { type: Function, required: true }
});

defineEmits(['close', 'submit']);
</script>
