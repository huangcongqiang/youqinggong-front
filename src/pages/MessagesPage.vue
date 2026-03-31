<template>
  <section class="page-stack" v-if="pageReady">
    <MobilePageScaffold
      :eyebrow="messageScaffoldEyebrow"
      :title="messageScaffoldTitle"
      :subtitle="messageScaffoldSubtitle"
      :show-back="true"
      :back-label="messageBackLabel"
      @back="goBackFromDetail"
    >
      <template #meta>
        <span class="soft-pill">{{ room ? messageChannelLabel : '等待任务开始' }}</span>
        <span v-if="roomParticipants.length" class="soft-pill">{{ roomParticipants.length }} 人协作</span>
      </template>

      <article v-if="roomsRequestError" class="result-card stack-sm">
        <span class="eyebrow">数据同步失败</span>
        <h3>当前展示的是空态聊天页</h3>
        <p class="muted">{{ roomsRequestError }}</p>
      </article>

      <section class="message-shell-grid is-detail-only">
      <article v-if="room" class="glass-panel stack-md message-chat-panel">
        <div class="message-chat-toolbar">
          <div class="message-chat-toolbar-copy">
            <span class="eyebrow">消息面板</span>
            <p v-if="messagePanelStatusNote" class="muted">{{ messagePanelStatusNote }}</p>
          </div>

          <div class="toolbar message-panel-meta message-panel-meta-compact message-chat-toolbar-actions">
            <button
              v-if="roomTaskDetail"
              class="button-secondary"
              type="button"
              @click="taskDetailModalOpen = true"
            >
              任务详情
            </button>
            <button class="button-secondary" type="button" @click="recordModalOpen = true">
              沟通纪要
            </button>
          </div>
        </div>

        <div class="message-thread-shell">
          <div class="message-feed-shell">
            <div ref="conversationFeedRef" class="conversation-feed conversation-feed-tall">
              <section v-if="showTaskConfirmationCard" class="message-task-confirmation stack-sm">
                <div class="message-task-confirmation-head">
                  <div class="stack-xs">
                    <span class="eyebrow">任务确认</span>
                    <h4>{{ taskConfirmationVersionText }}</h4>
                    <p class="muted">{{ taskConfirmationUpdatedText }}</p>
                  </div>
                  <div class="tag-row message-task-confirmation-status">
                    <span class="soft-pill" :class="taskConfirmationStatusClass(taskConfirmation.status)">
                      {{ taskConfirmation.status }}
                    </span>
                  </div>
                </div>

                <p v-if="taskConfirmationSummaryText" class="muted message-task-confirmation-summary">
                  {{ taskConfirmationSummaryText }}
                </p>

                <div class="message-task-confirmation-facts">
                  <article class="message-task-confirmation-fact">
                    <span class="eyebrow">任务金额</span>
                    <strong>{{ taskConfirmationBudgetText }}</strong>
                  </article>
                  <article class="message-task-confirmation-fact">
                    <span class="eyebrow">预计工期</span>
                    <strong>{{ taskConfirmationPeriodText }}</strong>
                  </article>
                  <article class="message-task-confirmation-fact">
                    <span class="eyebrow">协作安排</span>
                    <strong>{{ taskConfirmationScheduleText }}</strong>
                  </article>
                </div>

                <div v-if="taskConfirmationFocusNotes.length" class="message-task-confirmation-notes">
                  <span
                    v-for="note in visibleTaskConfirmationFocusNotes"
                    :key="note"
                    class="tag-pill tag-pill-muted"
                  >
                    {{ note }}
                  </span>
                  <span
                    v-if="taskConfirmationFocusNotes.length > visibleTaskConfirmationFocusNotes.length"
                    class="soft-pill"
                  >
                    +{{ taskConfirmationFocusNotes.length - visibleTaskConfirmationFocusNotes.length }}
                  </span>
                </div>

                <div class="toolbar message-task-confirmation-actions">
                  <button
                    v-if="audience === 'talent' && taskConfirmation.status !== '已确认'"
                    class="button-primary"
                    type="button"
                    :disabled="isSubmittingTaskAction"
                    @click="openTaskActionModal('confirm')"
                  >
                    确认任务
                  </button>
                  <button
                    v-if="audience === 'talent' && taskConfirmation.status !== '已确认'"
                    class="button-secondary"
                    type="button"
                    :disabled="isSubmittingTaskAction"
                    @click="openTaskActionModal('request_changes')"
                  >
                    提出修改
                  </button>
                  <button
                    v-if="audience === 'enterprise'"
                    class="button-secondary"
                    type="button"
                    :disabled="isSubmittingTaskAction"
                    @click="openTaskActionModal('update')"
                    v-show="canEnterpriseOpenUpdate"
                  >
                    {{ enterpriseTaskActionLabel }}
                  </button>
                  <button
                    v-if="canWithdrawTaskChange"
                    class="button-secondary"
                    type="button"
                    :disabled="isSubmittingTaskAction"
                    @click="openTaskActionModal('withdraw_update')"
                  >
                    撤回本次变更
                  </button>
                  <span v-if="enterpriseWaitingTalentConfirm" class="soft-pill is-warning">
                    {{ taskConfirmationVersionText }}已发出，等待人才确认
                  </span>
                </div>
              </section>

              <article v-if="!visibleMessages.length" class="message-thread-empty">
                <span class="eyebrow">消息线程</span>
                <h4>当前还没有聊天内容</h4>
                <p class="muted">先发一句确认或补充说明，让当前任务继续往下推进。</p>
              </article>

              <article
                v-for="message in visibleMessages"
                :key="message.id || `${message.author}-${message.time}-${message.text}`"
                class="message-row"
              :class="messageRowClass(message)"
            >
              <template v-if="isSystemMessage(message)">
                <span class="message-system-time">{{ message.time || '刚刚' }}</span>
                <p class="message-system-text">{{ message.text }}</p>
              </template>

              <template v-else>
                <div v-if="!isSelfMessage(message)" class="message-avatar">
                  {{ messageAvatarText(message.author) }}
                </div>

                <div class="message-payload" :class="{ 'is-self': isSelfMessage(message) }">
                  <div class="message-meta-line" :class="{ 'is-self': isSelfMessage(message) }">
                    <strong>{{ messageDisplayAuthor(message) }}</strong>
                    <span>{{ message.time || '刚刚' }}</span>
                  </div>

                  <div class="message-bubble" :class="{ 'is-self': isSelfMessage(message), 'is-other': !isSelfMessage(message) }">
                    <p v-if="message.text" class="message-text">{{ message.text }}</p>

                    <div v-if="normalizedMessageAttachments(message).length" class="message-attachments">
                      <button
                        v-for="attachment in normalizedMessageAttachments(message)"
                        :key="attachment.id"
                        type="button"
                        class="message-attachment-card"
                        :class="{ 'is-image': attachment.kind === 'image' }"
                        @click="openAttachmentPreview(attachment)"
                      >
                        <img
                          v-if="attachment.kind === 'image' && attachment.previewUrl"
                          :src="attachment.previewUrl"
                          :alt="attachment.name"
                          class="message-attachment-thumb"
                        />
                        <div v-else class="message-attachment-icon">{{ attachmentKindLabel(attachment.kind) }}</div>
                        <div class="message-attachment-copy">
                          <strong>{{ attachment.name }}</strong>
                          <small>{{ attachmentMetaText(attachment) }}</small>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="isSelfMessage(message)" class="message-avatar is-self">
                  {{ messageAvatarText(message.author) }}
                </div>
              </template>
              </article>
            </div>
          </div>
        </div>

        <div class="message-composer">
          <input
            ref="composerFileInputRef"
            class="message-file-input"
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.zip,.rar,.7z,.fig,.csv"
            @change="handleComposerFilesChange"
          />

          <div v-if="roomQuickReplies.length" class="stack-sm">
            <div class="message-composer-head">
              <h4>常用回复</h4>
              <span class="soft-pill">{{ currentActor }}</span>
            </div>
            <div class="toolbar message-quick-replies">
              <button
                v-for="reply in roomQuickReplies"
                :key="reply"
                type="button"
                class="button-secondary message-quick-reply"
                :disabled="isSendingMessage"
                @mousedown.prevent
                @click="handleQuickReply(reply)"
              >
                {{ reply }}
              </button>
            </div>
          </div>

          <label class="muted" for="message-text">输入消息</label>
          <textarea
            id="message-text"
            ref="messageInputRef"
            v-model="draftMessage"
            class="textarea message-input"
            placeholder="例如：这轮我先回传首页结构，支付放到第二阶段。"
          ></textarea>

          <div v-if="composerAttachments.length" class="message-composer-files">
            <button
              v-for="attachment in composerAttachments"
              :key="attachment.id"
              type="button"
              class="message-composer-file-chip"
              @click="removeComposerAttachment(attachment.id)"
            >
              <span>{{ attachment.name }}</span>
              <small>{{ attachmentMetaText(attachment) }}</small>
            </button>
          </div>

          <div v-if="isSendingMessage" class="message-send-status">
            <span class="soft-pill is-info">发送中</span>
            <p>{{ sendStatusText }}</p>
          </div>

          <p v-if="composerErrorNote" class="soft-pill is-danger">{{ composerErrorNote }}</p>
          <p v-if="recordSuccessNote" class="soft-pill">{{ recordSuccessNote }}</p>

          <div class="toolbar">
            <button class="button-secondary" type="button" :disabled="isSendingMessage" @mousedown.prevent @click="openComposerFilePicker">添加附件</button>
            <button class="button-primary" type="button" :disabled="isSendingMessage" @mousedown.prevent @click="handleSend">{{ sendButtonLabel }}</button>
            <router-link class="button-secondary" :to="primaryRoute">{{ primaryLabel }}</router-link>
          </div>
        </div>
      </article>

      <article v-else class="glass-panel stack-md message-chat-panel message-chat-empty-panel">
        <div class="message-chat-empty-copy stack-sm">
          <span class="eyebrow">聊天</span>
          <h3>还没有聊天房间</h3>
          <p class="muted">先回会话列表或继续主流程。</p>
        </div>

        <div class="toolbar message-chat-empty-actions">
          <button class="button-secondary" type="button" @click="goBackFromDetail">{{ messageBackLabel }}</button>
          <router-link class="button-primary" :to="primaryRoute">{{ primaryLabel }}</router-link>
        </div>
      </article>
      </section>
    </MobilePageScaffold>

    <ChatAttachmentPreviewSheet
      :open="Boolean(attachmentPreview)"
      :attachment="attachmentPreview"
      :attachment-meta-text="attachmentMetaText"
      :attachment-download-href="attachmentDownloadHref"
      @close="attachmentPreview = null"
    />

    <ChatTaskDetailSheet
      :open="taskDetailModalOpen && Boolean(roomTaskDetail)"
      :task-detail="roomTaskDetail"
      :period-text="taskConfirmationPeriodText"
      :schedule-text="taskConfirmationScheduleText"
      :calendar-headline="roomTalentCalendarHeadline"
      :calendar-items="roomTalentCalendarDisplayItems"
      :change-review="taskConfirmationChangeReview"
      :change-review-suggestions="taskConfirmationChangeReviewSuggestions"
      :tags="roomTaskTags"
      :deliverables="roomTaskDeliverables"
      :modules="roomTaskModules"
      :recommendations="roomTaskRecommendations"
      @close="taskDetailModalOpen = false"
    />

    <ChatCommunicationRecordSheet
      :open="recordModalOpen && Boolean(room)"
      :room="room"
      :communication-record="communicationRecord"
      :generate-record-button-label="generateRecordButtonLabel"
      :is-generating-record="isGeneratingRecord"
      :active-room-key="activeRoomKey"
      :generate-record-hint="generateRecordHint"
      @close="recordModalOpen = false"
      @generate="recordConfirmOpen = true"
    />

    <ChatRecordConfirmSheet
      :open="recordConfirmOpen"
      :room="room"
      :communication-record="communicationRecord"
      :is-generating-record="isGeneratingRecord"
      :active-room-key="activeRoomKey"
      @close="recordConfirmOpen = false"
      @confirm="handleGenerateRecord"
    />

    <ChatTaskActionSheet
      :open="taskActionModalOpen && Boolean(taskConfirmation)"
      :task-confirmation="taskConfirmation"
      :task-action-title="taskActionTitle"
      :task-action-mode="taskActionMode"
      :task-action-form="taskActionForm"
      :task-action-error="taskActionError"
      :is-submitting-task-action="isSubmittingTaskAction"
      :task-action-primary-label="taskActionPrimaryLabel"
      :task-confirmation-version-text="taskConfirmationVersionText"
      :task-confirmation-updated-text="taskConfirmationUpdatedText"
      :task-confirmation-budget-text="taskConfirmationBudgetText"
      :task-confirmation-period-text="taskConfirmationPeriodText"
      :task-confirmation-schedule-text="taskConfirmationScheduleText"
      :task-confirmation-change-review="taskConfirmationChangeReview"
      :task-confirmation-change-review-suggestions="taskConfirmationChangeReviewSuggestions"
      :task-confirmation-modification-history="taskConfirmationModificationHistory"
      :task-confirmation-status-class="taskConfirmationStatusClass"
      @close="closeTaskActionModal"
      @submit="submitTaskAction"
    />
  </section>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getStoredAuthUser,
  getTaskRoom,
  getTaskRooms,
  getTencentImRuntimeConfig,
  initiateTaskRoom,
  refreshTaskRoomCommunicationRecord,
  sendTaskRoomMessage,
  uploadTaskAttachmentAsset,
  updateTaskConfirmation
} from '../services/api';
import {
  connectTencentIm,
  ensureTencentTaskGroup,
  getTencentGroupMessages,
  sendTencentGroupAttachment,
  sendTencentGroupText,
  subscribeTencentMessages
} from '../services/tencentIm';
import MobilePageScaffold from '../components/mobile/MobilePageScaffold.vue';
import { findDefaultRoom } from './messageRoomSelection.js';
import {
  buildChildObjectPageContext,
  labelForObjectPageSource,
  readObjectPageContext,
  resolveImmediateOriginContext
} from '../utils/objectPageContext.js';
import {
  attachmentMetaText,
  buildMessagePayloads,
  calendarStateLabel,
  composerAttachmentPayload,
  inferAttachmentKind,
  isLegacyAutoSystemMessage,
  isSystemMessage,
  listOf,
  mergeMessages,
  messageAvatarText,
  messageDisplayAuthor as resolveMessageDisplayAuthor,
  messageRowClass as resolveMessageRowClass,
  normalizeAttachmentValue,
  normalizedMessageAttachments,
  summarizeTaskConfirmationHistory,
  taskConfirmationStatusClass
} from './messageDetailHelpers.js';
import { nextRefreshInterval, shouldRunLiveRefresh } from './messageLiveRefresh.js';
import {
  buildTargetedEmptyRoom,
  enrichRoomItem,
  findRoomForTargetCounterpart,
  findRoomForTask,
  findRoomsForTargetCounterpart,
  roomCounterpartName,
  shouldRefreshRoomDetail
} from './messageRoomRuntimeHelpers.js';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const ChatAttachmentPreviewSheet = defineAsyncComponent(() => import('../components/chat/ChatAttachmentPreviewSheet.vue'));
const ChatTaskDetailSheet = defineAsyncComponent(() => import('../components/chat/ChatTaskDetailSheet.vue'));
const ChatCommunicationRecordSheet = defineAsyncComponent(() => import('../components/chat/ChatCommunicationRecordSheet.vue'));
const ChatRecordConfirmSheet = defineAsyncComponent(() => import('../components/chat/ChatRecordConfirmSheet.vue'));
const ChatTaskActionSheet = defineAsyncComponent(() => import('../components/chat/ChatTaskActionSheet.vue'));

const route = useRoute();
const router = useRouter();
const roomsLoaded = ref(false);
const rooms = ref([]);
const room = ref(null);
const activeRoomKey = ref('');
const draftMessage = ref('');
const roomsRequestError = ref('');
const conversationFeedRef = ref(null);
const messageInputRef = ref(null);
const composerFileInputRef = ref(null);
const imConfig = ref(null);
const currentConversationId = ref('');
const audience = computed(() => resolveAudience(route));
const fallbackActor = computed(() => {
  const authUser = getStoredAuthUser();
  return authUser?.displayName || (audience.value === 'talent' ? '当前人才账号' : '当前企业账号');
});
const runtimeUser = computed(() => imConfig.value?.currentUser || {});
const communicationRecord = computed(() => (room.value ? room.value.communicationRecord || null : null));
const visibleMessages = computed(() =>
  (room.value?.messages || []).filter((message) => !isLegacyAutoSystemMessage(message) && !message?.hidden)
);
const roomParticipants = computed(() => {
  const members = room.value?.members || imConfig.value?.members || [];
  if (members.length) {
    return members.map((item) => item.displayName).filter(Boolean);
  }
  return room.value?.participants || [];
});
const pageReady = computed(() => roomsLoaded.value);
const currentActor = computed(() => runtimeUser.value.displayName || imConfig.value?.displayName || fallbackActor.value);
const communicationRecordSummary = computed(() => {
  if (communicationRecord.value?.summary) {
    return communicationRecord.value.summary;
  }
  return '聊天记录会持续保存。建议在这一轮沟通结束后，再统一生成 AI 沟通纪要。';
});
const generateRecordButtonLabel = computed(() => {
  if (!communicationRecord.value) {
    return '结束本轮沟通并生成纪要';
  }
  return communicationRecord.value.status === '待更新' ? '结束本轮沟通并更新纪要' : '重新生成纪要';
});
const generateRecordHint = computed(() => {
  if (!communicationRecord.value) {
    return '当这一轮讨论收束后，再统一生成纪要，会比逐条消息实时摘要更稳定。';
  }
  return communicationRecord.value.status === '待更新'
    ? '本轮有新消息尚未进入纪要。确认沟通结束后，再更新一次会更合适。'
    : '当前纪要已经是最新版本。如果本轮继续有新消息，状态会自动变成“待更新”。';
});
const draftAuthor = ref('星河智能');
const composerAttachments = ref([]);
const attachmentPreview = ref(null);
const recordModalOpen = ref(false);
const recordConfirmOpen = ref(false);
const taskActionModalOpen = ref(false);
const taskDetailModalOpen = ref(false);
const taskActionError = ref('');
const taskActionMode = ref('');
const taskActionForm = ref({
  note: '',
  summary: '',
  scopeNote: '',
  period: '',
  scheduleNote: '',
  budget: ''
});
const isGeneratingRecord = ref(false);
const isSendingMessage = ref(false);
const isSubmittingTaskAction = ref(false);
const recordSuccessNote = ref('');
const composerErrorNote = ref('');
let unsubscribeMessages = null;
let recordSuccessTimer = null;
let liveRefreshTimer = null;

const primaryRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.market : roleRouteMap.enterprise.publish
);
const primaryLabel = computed(() => (audience.value === 'talent' ? '去看任务广场' : '去发布任务'));
const messageScaffoldEyebrow = computed(() => (room.value ? '' : (audience.value === 'talent' ? '人才端聊天' : '企业端聊天')));
const messageScaffoldTitle = computed(() =>
  room.value ? roomHeaderTitle.value : (audience.value === 'talent' ? '人才协作聊天' : '企业协作聊天')
);
const messageScaffoldSubtitle = computed(() => (room.value ? '' : ''));
const messageChannelLabel = computed(() => {
  if (imConfig.value?.enabled) {
    return '实时聊天';
  }
  if (room.value?.provider) {
    return room.value.provider;
  }
  return '同步记录';
});
const roomHeaderTitle = computed(() => roomTaskDetail.value?.title || room.value?.taskTitle || room.value?.title || '当前聊天');
const roomConversationTitle = computed(() =>
  room.value?.counterpartName || roomCounterpartName(room.value, audience.value) || roomHeaderTitle.value || '当前协作会话'
);
const roomConversationMeta = computed(() => {
  if (!room.value) {
    return '';
  }
  return [room.value.stage, roomParticipants.value.length ? `${roomParticipants.value.length} 位协作成员` : '', messageChannelLabel.value]
    .filter(Boolean)
    .join(' · ');
});
const taskConfirmation = computed(() => (room.value?.taskConfirmation ? room.value.taskConfirmation : null));
const taskConfirmationHistory = computed(() =>
  Array.isArray(taskConfirmation.value?.history) ? taskConfirmation.value.history : []
);
const taskConfirmationModificationHistory = computed(() =>
  summarizeTaskConfirmationHistory(taskConfirmationHistory.value)
);
const taskConfirmationVersionText = computed(() => `第 ${taskConfirmation.value?.version || 1} 版任务确认单`);
const roomTaskDetail = computed(() => (room.value?.taskDetail ? room.value.taskDetail : null));
const taskConfirmationBudgetText = computed(() => roomTaskDetail.value?.budget || taskConfirmation.value?.budget || '未填写预算');
const taskConfirmationPeriodText = computed(() => taskConfirmation.value?.period || roomTaskDetail.value?.period || '待确认');
const taskConfirmationScheduleText = computed(() => taskConfirmation.value?.scheduleNote || roomTaskDetail.value?.scheduleNote || '待补充');
const taskConfirmationChangeReview = computed(() => taskConfirmation.value?.changeReview || null);
const taskConfirmationChangeReviewSuggestions = computed(() => listOf(taskConfirmationChangeReview.value?.suggestions));
const roomTalentCalendar = computed(() => room.value?.talentCalendar || roomTaskDetail.value?.calendarPreview || null);
const roomTalentCalendarHeadline = computed(() => roomTalentCalendar.value?.headline || '');
const roomTalentCalendarItems = computed(() =>
  Array.isArray(roomTalentCalendar.value?.items) ? roomTalentCalendar.value.items : []
);
const roomTalentCalendarDisplayItems = computed(() =>
  roomTalentCalendarItems.value.map((item) => `${item.day} · ${calendarStateLabel(item.state)}`)
);
const roomTaskTags = computed(() => listOf(roomTaskDetail.value?.tags));
const roomTaskDeliverables = computed(() => listOf(roomTaskDetail.value?.deliverables));
const roomTaskModules = computed(() => listOf(roomTaskDetail.value?.modules));
const roomTaskRecommendations = computed(() => listOf(roomTaskDetail.value?.recommendations));
const taskConfirmationUpdatedText = computed(() => {
  if (!taskConfirmation.value) {
    return '';
  }
  return `${taskConfirmation.value.updatedBy || '系统'} · ${taskConfirmation.value.updatedAt || '刚刚'}`;
});
const taskConfirmationSummaryText = computed(() => compactText(taskConfirmation.value?.summary, 110));
const showTaskConfirmationCard = computed(() => {
  if (!taskConfirmation.value) {
    return false;
  }
  return taskConfirmation.value.status !== '已确认' || canWithdrawTaskChange.value;
});
const visibleTaskConfirmationFocusNotes = computed(() => taskConfirmationFocusNotes.value.slice(0, 2));
const taskConfirmationFocusNotes = computed(() => {
  const notes = [];
  if (roomTalentCalendarHeadline.value) {
    notes.push(`档期：${compactText(roomTalentCalendarHeadline.value, 26)}`);
  }
  if (taskConfirmation.value?.scopeNote) {
    notes.push(`范围：${compactText(taskConfirmation.value.scopeNote, 28)}`);
  }
  if (taskConfirmation.value?.changeRequest) {
    notes.push(`修改：${compactText(taskConfirmation.value.changeRequest, 28)}`);
  }
  if (taskConfirmationChangeReview.value?.summary) {
    notes.push(`AI：${compactText(taskConfirmationChangeReview.value.summary, 28)}`);
  }
  if (taskConfirmationModificationHistory.value.length) {
    notes.push('完整版本记录见任务详情');
  }
  return notes.slice(0, 3);
});
const messagePanelStatusNote = computed(() => {
  if (!room.value) {
    return '';
  }
  if (showTaskConfirmationCard.value) {
    return '当前先处理待确认或待修改事项，再继续消息同步。';
  }
  if (taskConfirmation.value?.status === '已确认') {
    return `${taskConfirmationVersionText.value}已同步，后续说明和附件会继续留在当前线程。`;
  }
  if (!visibleMessages.value.length) {
    return '';
  }
  return '当前线程会持续保留最新说明、附件和沟通纪要。';
});
const latestTaskConfirmationHistoryEntry = computed(() => taskConfirmationHistory.value[taskConfirmationHistory.value.length - 1] || null);
const enterpriseWaitingTalentConfirm = computed(() =>
  audience.value === 'enterprise' &&
  taskConfirmation.value?.pendingAudience === 'talent' &&
  taskConfirmation.value?.status === '待人才确认'
);
const canWithdrawTaskChange = computed(() =>
  enterpriseWaitingTalentConfirm.value &&
  Number(taskConfirmation.value?.version || 1) > 1 &&
  latestTaskConfirmationHistoryEntry.value?.action === '企业重新发送确认'
);
const canEnterpriseOpenUpdate = computed(() =>
  audience.value === 'enterprise' &&
  (
    !enterpriseWaitingTalentConfirm.value ||
    Number(taskConfirmation.value?.version || 1) === 1
  )
);
const targetCounterpartPlatformUserId = computed(() =>
  typeof route.query.counterpartPlatformUserId === 'string' ? route.query.counterpartPlatformUserId.trim() : ''
);
const targetCounterpartName = computed(() =>
  typeof route.query.counterpartName === 'string' ? route.query.counterpartName.trim() : ''
);
const targetTaskId = computed(() => (typeof route.query.taskId === 'string' ? route.query.taskId.trim() : ''));
const contextDefaults = computed(() => ({
  taskId: typeof route.query.taskId === 'string' ? route.query.taskId.trim() : String(room.value?.taskDetail?.taskId || room.value?.taskId || '').trim(),
  room: typeof route.query.room === 'string' ? route.query.room.trim() : String(activeRoomKey.value || '').trim(),
  recordId: String(
    room.value?.recordId ||
      room.value?.taskDetail?.recordId ||
      room.value?.taskRoom?.recordId ||
      room.value?.communicationRecord?.recordId ||
      ''
  ).trim(),
  tab: typeof route.query.tab === 'string' ? route.query.tab.trim() : ''
}));
const pageContext = computed(() => readObjectPageContext(route.query, contextDefaults.value));
const originContext = computed(() =>
  resolveImmediateOriginContext({
    entrySource: pageContext.value.source,
    query: route.query,
    defaults: contextDefaults.value,
    allowedSources: ['workspace', 'record-detail', 'acceptance', 'records']
  })
);
const currentRecordId = computed(() => pageContext.value.recordId || contextDefaults.value.recordId);
const currentRecordTab = computed(() => pageContext.value.tab || contextDefaults.value.tab);
const currentTaskContextId = computed(() => pageContext.value.taskId || contextDefaults.value.taskId);
const currentRoomContextKey = computed(() => pageContext.value.room || contextDefaults.value.room);
const currentNodeId = computed(() => pageContext.value.nodeId);
const messageBackTargetSource = computed(() => {
  if (pageContext.value.source && pageContext.value.source !== 'messages') {
    return pageContext.value.source;
  }
  return originContext.value.source;
});
const roomQuickReplies = computed(() => {
  if (room.value?.quickRepliesByAudience && typeof room.value.quickRepliesByAudience === 'object') {
    return room.value.quickRepliesByAudience[audience.value] || room.value.quickRepliesByAudience.enterprise || [];
  }
  return room.value?.quickReplies || [];
});
const sendButtonLabel = computed(() => {
  if (!isSendingMessage.value) {
    return '发送消息';
  }
  if (!activeRoomKey.value && targetCounterpartPlatformUserId.value) {
    return '正在建立聊天...';
  }
  if (composerAttachments.value.some((item) => item.kind === 'image')) {
    return '图片发送中...';
  }
  if (composerAttachments.value.length) {
    return '附件发送中...';
  }
  return '消息发送中...';
});
const sendStatusText = computed(() => {
  if (!activeRoomKey.value && targetCounterpartPlatformUserId.value) {
    return '正在建立与当前人才的聊天房间，建立成功后会自动发送这条消息。';
  }
  if (composerAttachments.value.some((item) => item.kind === 'image')) {
    return '图片较大时会稍慢一些，发送完成后会自动滚到最新消息。';
  }
  if (composerAttachments.value.length) {
    return '正在处理附件上传与消息同步，请稍候。';
  }
  return '正在发送当前消息，请稍候。';
});
const taskActionTitle = computed(() => {
  if (taskActionMode.value === 'request_changes') {
    return '提出任务修改';
  }
  if (taskActionMode.value === 'withdraw_update') {
    return '撤回本次变更';
  }
  if (taskActionMode.value === 'update') {
    return taskConfirmation.value?.status === '已确认'
      ? '发起任务变更（范围 / 工期 / 金额）'
      : '补充信息或修改范围 / 工期后重新发送';
  }
  return '确认当前任务';
});
const taskActionPrimaryLabel = computed(() => {
  if (taskActionMode.value === 'request_changes') {
    return '提交修改意见';
  }
  if (taskActionMode.value === 'withdraw_update') {
    return '确认撤回';
  }
  if (taskActionMode.value === 'update') {
    return taskConfirmation.value?.status === '已确认' ? '提交变更并重新发送' : '提交补充并重新发送';
  }
  return '确认任务';
});
const enterpriseTaskActionLabel = computed(() => {
  if (taskConfirmation.value?.status === '待企业修改') {
    return '修改工期 / 范围后重新发送';
  }
  if (taskConfirmation.value?.status === '已确认') {
    return '发起任务变更';
  }
  return '补充信息 / 修改任务';
});
const messageBackLabel = computed(() =>
  labelForObjectPageSource(messageBackTargetSource.value, '返回会话列表')
);

function inboxRoute() {
  return {
    path: audience.value === 'talent' ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages,
    query: {}
  };
}

function buildMessageDetailContextQuery(overrides = {}) {
  return buildChildObjectPageContext({
    current: pageContext.value,
    origin: originContext.value,
    overrides: {
      source: 'messages',
      taskId: currentTaskContextId.value,
      room: currentRoomContextKey.value,
      recordId: currentRecordId.value,
      nodeId: currentNodeId.value,
      tab: currentRecordTab.value,
      ...overrides
    }
  });
}

function routeForImmediateSource(source) {
  if (source === 'workspace') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace,
      query: buildMessageDetailContextQuery({
        source: 'workspace'
      })
    };
  }

  if (source === 'acceptance') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.acceptance : roleRouteMap.enterprise.acceptance,
      query: buildMessageDetailContextQuery({
        source: 'acceptance',
        nodeId: undefined
      })
    };
  }

  if (source === 'record-detail' && currentRecordId.value) {
    return {
      path: audience.value === 'talent'
        ? roleRouteMap.talent.recordDetail(currentRecordId.value)
        : roleRouteMap.enterprise.recordDetail(currentRecordId.value),
      query: buildMessageDetailContextQuery({
        source: 'record-detail',
        nodeId: undefined
      })
    };
  }

  if (source === 'records') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.records : roleRouteMap.enterprise.records,
      query: currentRecordTab.value ? { tab: currentRecordTab.value } : {}
    };
  }

  return null;
}

const messageBackRoute = computed(() => routeForImmediateSource(messageBackTargetSource.value) || inboxRoute());

function isFailedResult(result) {
  return Boolean(result?.requestError || result?.success === false || result?.status === 'FAILED');
}

function compactText(value, limit = 80) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, Math.max(0, limit - 3)).trim()}...`;
}

function isSelfMessage(message) {
  return !isSystemMessage(message) && message?.author === currentActor.value;
}

function messageRowClass(message) {
  return resolveMessageRowClass(message, currentActor.value);
}

function messageDisplayAuthor(message) {
  return resolveMessageDisplayAuthor(message, currentActor.value);
}

function openAttachmentPreview(attachment) {
  const normalized = normalizeAttachmentValue(attachment);
  if (!normalized) {
    return;
  }
  attachmentPreview.value = normalized;
}

function attachmentDownloadHref(attachment) {
  const normalized = normalizeAttachmentValue(attachment);
  if (!normalized) {
    return '';
  }
  return normalized.downloadUrl || normalized.previewUrl || '';
}

function openComposerFilePicker() {
  composerFileInputRef.value?.click?.();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

async function buildComposerAttachment(file) {
  const kind = inferAttachmentKind(file.type, file.name);
  const attachment = {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    type: file.type || 'application/octet-stream',
    kind,
    size: file.size || 0,
    previewUrl: '',
    downloadUrl: '',
    file
  };

  attachment.downloadUrl = await readFileAsDataUrl(file);
  if (kind === 'image' || kind === 'video') {
    attachment.previewUrl = attachment.downloadUrl;
  }

  return attachment;
}

async function handleComposerFilesChange(event) {
  const files = Array.from(event?.target?.files || []);
  if (!files.length) {
    return;
  }

  composerErrorNote.value = '';

  const nextAttachments = await Promise.all(files.map((file) => buildComposerAttachment(file)));
  const attachmentBucket = new Map(composerAttachments.value.map((item) => [item.id, item]));
  nextAttachments.forEach((attachment) => {
    attachmentBucket.set(attachment.id, attachment);
  });
  composerAttachments.value = Array.from(attachmentBucket.values());

  if (event?.target) {
    event.target.value = '';
  }
}

function removeComposerAttachment(attachmentId) {
  composerAttachments.value = composerAttachments.value.filter((attachment) => attachment.id !== attachmentId);
}

async function uploadComposerAttachments(taskId, attachments) {
  if (!listOf(attachments).length) {
    return [];
  }
  if (!taskId) {
    throw new Error('当前房间缺少任务上下文，暂时无法上传聊天附件。');
  }

  return Promise.all(
    listOf(attachments).map(async (attachment) => {
      if (!attachment?.file) {
        return attachment;
      }
      const uploaded = await uploadTaskAttachmentAsset(taskId, attachment.file, {
        scene: 'CHAT_ATTACHMENT',
        source: 'CHAT_ATTACHMENT',
        fileType: attachment.kind || ''
      });
      const resolvedDownloadUrl = uploaded.downloadUrl || uploaded.url || attachment.downloadUrl || '';
      const resolvedPreviewUrl =
        attachment.previewUrl ||
        ((attachment.kind === 'image' || attachment.kind === 'video') ? resolvedDownloadUrl : '');
      return {
        ...attachment,
        ...uploaded,
        kind: attachment.kind,
        previewUrl: resolvedPreviewUrl,
        downloadUrl: resolvedDownloadUrl,
        type: uploaded.mimeType || uploaded.type || attachment.type,
        size: uploaded.size || attachment.size,
        source: uploaded.source || 'CHAT_ATTACHMENT'
      };
    })
  );
}

async function persistComposerMessages(text, attachments) {
  const payloads = buildMessagePayloads(text, attachments, draftAuthor.value);
  let nextRoom = room.value;

  for (const payload of payloads) {
    nextRoom = await sendTaskRoomMessage(activeRoomKey.value, payload);
    if (isFailedResult(nextRoom)) {
      const error = new Error(nextRoom?.requestError || nextRoom?.nextStep || '发送消息失败');
      error.payload = nextRoom;
      throw error;
    }
  }

  return nextRoom;
}

function isConversationNearBottom() {
  const element = conversationFeedRef.value;
  if (!element) {
    return true;
  }

  const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
  return remaining < 48;
}

function scrollConversationToBottom(behavior = 'auto') {
  const element = conversationFeedRef.value;
  if (!element) {
    return;
  }

  element.scrollTo({
    top: element.scrollHeight,
    behavior
  });
}

async function settleConversationViewport(options = {}) {
  const {
    stickToBottom = true,
    restoreWindowScroll = true,
    keepComposerFocus = true
  } = options;

  const pageScrollX = typeof window !== 'undefined' ? window.scrollX : 0;
  const pageScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

  await nextTick();

  if (stickToBottom) {
    scrollConversationToBottom('auto');
  }

  if (restoreWindowScroll && typeof window !== 'undefined') {
    window.scrollTo({
      top: pageScrollY,
      left: pageScrollX,
      behavior: 'auto'
    });
  }

  if (keepComposerFocus && messageInputRef.value?.focus) {
    try {
      messageInputRef.value.focus({ preventScroll: true });
    } catch {
      messageInputRef.value.focus();
      if (restoreWindowScroll && typeof window !== 'undefined') {
        window.scrollTo({
          top: pageScrollY,
          left: pageScrollX,
          behavior: 'auto'
        });
      }
    }
  }
}

function enrichCurrentRoomItem(item) {
  return enrichRoomItem(item, activeRoomKey.value, communicationRecord.value);
}

function openTaskActionModal(mode) {
  taskActionMode.value = mode;
  taskActionError.value = '';
  taskActionForm.value = {
    note: taskConfirmation.value?.changeRequest || '',
    summary: taskConfirmation.value?.summary || '',
    scopeNote: taskConfirmation.value?.scopeNote || '',
    period: taskConfirmation.value?.period || roomTaskDetail.value?.period || '',
    scheduleNote: taskConfirmation.value?.scheduleNote || '',
    budget:
      roomTaskDetail.value?.budget && roomTaskDetail.value.budget !== '未填写预算'
        ? roomTaskDetail.value.budget
        : ''
  };
  taskActionModalOpen.value = true;
}

function closeTaskActionModal() {
  taskActionModalOpen.value = false;
  taskActionMode.value = '';
  taskActionError.value = '';
}

function clearRoomSelection() {
  activeRoomKey.value = '';
  room.value = null;
  imConfig.value = null;
  currentConversationId.value = '';
  draftAuthor.value = fallbackActor.value;
  recordModalOpen.value = false;
  recordConfirmOpen.value = false;
  taskDetailModalOpen.value = false;
  closeTaskActionModal();
}

function goBackFromDetail() {
  router.push(messageBackRoute.value);
}

function applyStoredRoom(baseRoom, runtime, status, extraNotes = []) {
  const normalizedStatus = status || runtime?.status || 'SYNC_ONLY';
  const mergedNotes = [...(runtime?.notes || []), ...extraNotes]
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);

  imConfig.value = {
    ...(runtime || {}),
    enabled: false,
    status: normalizedStatus,
    notes: mergedNotes
  };
  currentConversationId.value = '';
  room.value = {
    ...baseRoom,
    provider: '聊天记录',
    taskRoom: baseRoom.taskRoom || runtime?.taskRoom,
    members: baseRoom.members || runtime?.members || []
  };
}

async function selectRoom(roomKey) {
  activeRoomKey.value = roomKey;
  recordModalOpen.value = false;
  recordConfirmOpen.value = false;
  taskDetailModalOpen.value = false;
  closeTaskActionModal();
  recordSuccessNote.value = '';
  const baseRoom = await getTaskRoom(roomKey);
  room.value = baseRoom;
  draftAuthor.value = fallbackActor.value;
  const nextTaskId = typeof baseRoom?.taskId === 'string' ? baseRoom.taskId.trim() : '';
  if (route.query.room !== roomKey || route.query.taskId !== nextTaskId) {
    router.replace({
      query: {
        ...buildMessageDetailContextQuery({
          room: roomKey,
          taskId: nextTaskId || undefined
        }),
        room: roomKey,
        taskId: nextTaskId || undefined,
        counterpartPlatformUserId: undefined,
        counterpartName: undefined,
        talentSlug: undefined
      }
    });
  }
  await loadTencentRoom(roomKey, baseRoom);
  await settleConversationViewport({ stickToBottom: true, restoreWindowScroll: false, keepComposerFocus: false });
}

function syncRoomList(updatedRoom) {
  rooms.value = rooms.value.map((item) =>
    item.roomKey === updatedRoom.roomKey
      ? {
          ...item,
          taskTitle: updatedRoom.taskDetail?.title || updatedRoom.taskTitle || item.taskTitle,
          counterpartName: updatedRoom.counterpartName || roomCounterpartName(updatedRoom, audience.value) || item.counterpartName,
          counterpartPlatformUserId:
            updatedRoom.counterpartPlatformUserId || item.counterpartPlatformUserId || '',
          stage: updatedRoom.stage,
          focus: updatedRoom.focus,
          lastTime: updatedRoom.lastTime || item.lastTime,
          lastTimestamp: updatedRoom.lastTimestamp || item.lastTimestamp || 0,
          lastMessage: updatedRoom.lastMessage || item.lastMessage,
          unreadCount: updatedRoom.unreadCount || '0',
          communicationStatus: updatedRoom.communicationRecord?.status || item.communicationStatus || '未生成',
          communicationSavedAt: updatedRoom.communicationRecord?.savedAt || item.communicationSavedAt || '',
          taskTags: updatedRoom.taskTags || item.taskTags,
          taskConfirmation: updatedRoom.taskConfirmation || item.taskConfirmation,
          quickRepliesByAudience: updatedRoom.quickRepliesByAudience || item.quickRepliesByAudience
        }
      : item
  );
}

function buildTargetedEmptyRoomValue() {
  return buildTargetedEmptyRoom({
    targetCounterpartName: targetCounterpartName.value,
    targetCounterpartPlatformUserId: targetCounterpartPlatformUserId.value,
    matchingRooms: findRoomsForTargetCounterpart(rooms.value, targetCounterpartPlatformUserId.value)
  });
}

function showTargetedEmptyRoom() {
  if (!targetCounterpartPlatformUserId.value) {
    return;
  }
  clearRoomSelection();
  room.value = buildTargetedEmptyRoomValue();
}

async function syncRouteRoomSelection(items = rooms.value) {
  const normalizedRoomKey = typeof route.query.room === 'string' ? route.query.room.trim() : '';

  if (normalizedRoomKey) {
    if (normalizedRoomKey !== activeRoomKey.value || !room.value) {
      await selectRoom(normalizedRoomKey);
    }
    return;
  }

  const taskRoom = findRoomForTask(items, targetTaskId.value);
  if (taskRoom?.roomKey) {
    if (taskRoom.roomKey !== activeRoomKey.value || !room.value) {
      await selectRoom(taskRoom.roomKey);
    }
    return;
  }

  if (targetTaskId.value) {
    clearRoomSelection();
    return;
  }

  const targetedRoom = findRoomForTargetCounterpart(items, targetCounterpartPlatformUserId.value);
  if (targetedRoom?.roomKey) {
    if (targetedRoom.roomKey !== activeRoomKey.value || !room.value) {
      await selectRoom(targetedRoom.roomKey);
    }
    return;
  }

  if (targetCounterpartPlatformUserId.value) {
    showTargetedEmptyRoom();
    return;
  }

  const defaultRoom = findDefaultRoom(items);
  if (defaultRoom?.roomKey) {
    if (defaultRoom.roomKey !== activeRoomKey.value || !room.value) {
      await selectRoom(defaultRoom.roomKey);
    }
    return;
  }

  clearRoomSelection();
}

function markCommunicationRecordPending(roomData) {
  if (!roomData?.communicationRecord) {
    return;
  }

  roomData.communicationRecord = {
    ...roomData.communicationRecord,
    status: '待更新',
    recordNote: '聊天记录已继续追加。若要同步本轮最新结论，请在这一轮沟通结束后重新生成纪要。'
  };
}

async function ensureActiveRoomForSend() {
  if (activeRoomKey.value) {
    return activeRoomKey.value;
  }
  if (!targetCounterpartPlatformUserId.value) {
    return '';
  }

  const created = await initiateTaskRoom({
    counterpartPlatformUserId: targetCounterpartPlatformUserId.value,
    counterpartName: targetCounterpartName.value
  });
  if (isFailedResult(created)) {
    recordSuccessNote.value = created?.requestError || created?.message || created?.nextStep || '当前暂时无法建立聊天房间，请稍后再试。';
    return '';
  }
  const nextRoomKey = typeof created?.roomKey === 'string' ? created.roomKey.trim() : '';
  if (!nextRoomKey) {
    recordSuccessNote.value = '当前暂时无法建立聊天房间，请稍后再试。';
    return '';
  }

  const roomItem = created?.room && typeof created.room === 'object' ? created.room : null;
  if (roomItem) {
    rooms.value = [enrichCurrentRoomItem(roomItem), ...rooms.value.filter((item) => item.roomKey !== nextRoomKey)];
  }
  await selectRoom(nextRoomKey);
  return nextRoomKey;
}

async function handleSend() {
  const normalizedText = draftMessage.value.trim();
  const localComposerAttachments = composerAttachments.value.slice();
  const attachments = composerAttachmentPayload();
  if (!normalizedText && !attachments.length) {
    return;
  }

  const shouldStickToBottom = isConversationNearBottom();
  let nextRoom;
  isSendingMessage.value = true;
  recordSuccessNote.value = '';
  composerErrorNote.value = '';
  try {
    const ensuredRoomKey = await ensureActiveRoomForSend();
    if (!ensuredRoomKey) {
      return;
    }
    const taskId = currentTaskContextId.value || targetTaskId.value || normalizedQueryValue(room.value?.taskId);
    const uploadedAttachments = await uploadComposerAttachments(taskId, localComposerAttachments);

    if (imConfig.value?.enabled) {
      try {
        if (normalizedText) {
          await sendTencentGroupText(imConfig.value, normalizedText);
        }

        for (const attachment of localComposerAttachments) {
          await sendTencentGroupAttachment(imConfig.value, attachment);
        }

        const realtimeMessages = await getTencentGroupMessages(imConfig.value);
        const persistedRoom = await persistComposerMessages(normalizedText, uploadedAttachments);
        nextRoom = {
          ...persistedRoom,
          provider: 'Tencent IM',
          messages: realtimeMessages.length ? realtimeMessages : persistedRoom.messages,
          lastTime: '刚刚',
          lastMessage: persistedRoom.lastMessage,
          unreadCount: '0'
        };
      } catch (error) {
        nextRoom = await persistComposerMessages(normalizedText, uploadedAttachments);
        imConfig.value = {
          ...imConfig.value,
          enabled: false,
          status: 'SEND_FAILED_FALLBACK',
          notes: [
            '腾讯 IM 发送失败，当前已切换为已同步聊天记录视图。',
            error?.message ? `失败原因：${error.message}` : '失败原因：请检查腾讯 IM 群组与用户配置。'
          ]
        };
        currentConversationId.value = '';
        nextRoom = {
          ...nextRoom,
          provider: '聊天记录'
        };
      }
    } else {
      nextRoom = await persistComposerMessages(normalizedText, uploadedAttachments);
    }

    room.value = nextRoom;
    markCommunicationRecordPending(room.value);
    syncRoomList(nextRoom);
    draftMessage.value = '';
    composerAttachments.value = [];
    if (composerFileInputRef.value) {
      composerFileInputRef.value.value = '';
    }
    await settleConversationViewport({ stickToBottom: shouldStickToBottom, restoreWindowScroll: true, keepComposerFocus: true });
  } catch (error) {
    composerErrorNote.value =
      error?.payload?.requestError ||
      error?.payload?.nextStep ||
      error?.message ||
      '当前暂时无法发送消息，请稍后再试。';
  } finally {
    isSendingMessage.value = false;
  }
}

async function handleQuickReply(reply) {
  draftMessage.value = reply;
  await handleSend();
}

async function handleGenerateRecord() {
  if (!activeRoomKey.value || isGeneratingRecord.value) {
    return;
  }

  isGeneratingRecord.value = true;

  try {
    const nextRoom = await refreshTaskRoomCommunicationRecord(activeRoomKey.value);
    if (isFailedResult(nextRoom)) {
      recordSuccessNote.value = nextRoom?.requestError || nextRoom?.nextStep || '当前暂时无法生成沟通纪要，请稍后再试。';
      return;
    }
    room.value = {
      ...nextRoom,
      provider: room.value?.provider || nextRoom.provider
    };
    syncRoomList(nextRoom);
    recordConfirmOpen.value = false;
    recordModalOpen.value = true;
    recordSuccessNote.value = `本轮沟通纪要已更新，可直接查看这次的结论与待办。`;
    if (typeof window !== 'undefined') {
      if (recordSuccessTimer) {
        window.clearTimeout(recordSuccessTimer);
      }
      recordSuccessTimer = window.setTimeout(() => {
        recordSuccessNote.value = '';
      }, 3200);
    }
  } finally {
    isGeneratingRecord.value = false;
  }
}

async function submitTaskAction() {
  if (!room.value?.taskId || !taskActionMode.value || isSubmittingTaskAction.value) {
    return;
  }

  isSubmittingTaskAction.value = true;
  taskActionError.value = '';
  try {
    const nextRoom = await updateTaskConfirmation(room.value.taskId, {
      action: taskActionMode.value,
      note: taskActionForm.value.note,
      summary: taskActionForm.value.summary,
      scopeNote: taskActionForm.value.scopeNote,
      period: taskActionForm.value.period,
      scheduleNote: taskActionForm.value.scheduleNote,
      budget: taskActionForm.value.budget
    });
    if (isFailedResult(nextRoom)) {
      taskActionError.value = nextRoom?.requestError || nextRoom?.nextStep || '当前任务确认单暂时无法更新，请稍后再试。';
      return;
    }
    if (nextRoom?.actionBlocked) {
      taskActionError.value = nextRoom.actionMessage || '当前任务还在等待对方处理，暂时不能继续修改。';
      room.value = {
        ...room.value,
        ...nextRoom
      };
      syncRoomList(room.value);
      return;
    }
    room.value = {
      ...room.value,
      ...nextRoom
    };
    syncRoomList(room.value);
    closeTaskActionModal();
    await settleConversationViewport({ stickToBottom: true, restoreWindowScroll: false, keepComposerFocus: false });
  } finally {
    isSubmittingTaskAction.value = false;
  }
}

async function refreshMessageSurface() {
  if (
    !shouldRunLiveRefresh({
      visibilityState: typeof document !== 'undefined' ? document.visibilityState : 'visible',
      isSendingMessage: isSendingMessage.value,
      isGeneratingRecord: isGeneratingRecord.value,
      isSubmittingTaskAction: isSubmittingTaskAction.value
    })
  ) {
    return;
  }

  const payload = await getTaskRooms();
  roomsRequestError.value = payload?.requestError || '';
  const nextRooms = (payload.items || []).map((item) => enrichCurrentRoomItem(item));
  const previousActiveSummary = rooms.value.find((item) => item.roomKey === activeRoomKey.value) || null;
  rooms.value = nextRooms;

  if (!activeRoomKey.value) {
    await syncRouteRoomSelection(nextRooms);
    return;
  }

  const activeSummary = nextRooms.find((item) => item.roomKey === activeRoomKey.value);
  if (!activeSummary) {
    await syncRouteRoomSelection(nextRooms);
    return;
  }

  const needsDetailRefresh = shouldRefreshRoomDetail(previousActiveSummary, activeSummary);

  if (!needsDetailRefresh) {
    return;
  }

  const shouldStickToBottom = isConversationNearBottom();
  const nextRoom = await getTaskRoom(activeRoomKey.value);
  room.value = {
    ...room.value,
    ...nextRoom
  };
  if (shouldStickToBottom) {
    await settleConversationViewport({ stickToBottom: true, restoreWindowScroll: false, keepComposerFocus: false });
  }
}

function clearLiveRefreshTimer() {
  if (typeof window !== 'undefined' && liveRefreshTimer) {
    window.clearTimeout(liveRefreshTimer);
    liveRefreshTimer = null;
  }
}

function scheduleLiveRefresh() {
  if (typeof window === 'undefined') {
    return;
  }
  clearLiveRefreshTimer();
  liveRefreshTimer = window.setTimeout(async () => {
    try {
      await refreshMessageSurface();
    } finally {
      scheduleLiveRefresh();
    }
  }, nextRefreshInterval(Boolean(imConfig.value?.enabled)));
}

onMounted(async () => {
  unsubscribeMessages = subscribeTencentMessages((payload) => {
    if (!payload?.conversationID || payload.conversationID !== currentConversationId.value || !room.value) {
      return;
    }

    const shouldStickToBottom = isConversationNearBottom();
    room.value = {
      ...room.value,
      messages: mergeMessages(room.value.messages, payload.messages),
      lastTime: payload.messages[payload.messages.length - 1]?.time || room.value.lastTime,
      lastMessage: payload.messages[payload.messages.length - 1]?.text || room.value.lastMessage
    };
    markCommunicationRecordPending(room.value);
    syncRoomList(room.value);
    if (shouldStickToBottom) {
      void settleConversationViewport({ stickToBottom: true, restoreWindowScroll: false, keepComposerFocus: false });
    }
  });

  const payload = await getTaskRooms();
  roomsRequestError.value = payload?.requestError || '';
  rooms.value = (payload.items || []).map((item) => enrichCurrentRoomItem(item));
  roomsLoaded.value = true;
  await syncRouteRoomSelection();

  scheduleLiveRefresh();
});

onBeforeUnmount(() => {
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }
  if (typeof window !== 'undefined' && recordSuccessTimer) {
    window.clearTimeout(recordSuccessTimer);
  }
  clearLiveRefreshTimer();
});

watch(
  () => [route.query.room, route.query.taskId, route.query.counterpartPlatformUserId, route.query.counterpartName],
  async () => {
    await syncRouteRoomSelection();
  }
);

async function loadTencentRoom(roomKey, baseRoom) {
  const runtime = await getTencentImRuntimeConfig(audience.value, roomKey);
  imConfig.value = runtime;
  currentConversationId.value = runtime?.groupId ? `GROUP${runtime.groupId}` : '';
  draftAuthor.value = runtime?.currentUser?.displayName || fallbackActor.value;

  if (!runtime?.enabled) {
    applyStoredRoom(baseRoom, runtime, runtime?.status || 'DISABLED');
    return;
  }

  try {
    await connectTencentIm(runtime);
    await ensureTencentTaskGroup(runtime);
    const realtimeMessages = await getTencentGroupMessages(runtime);
    room.value = {
      ...baseRoom,
      provider: 'Tencent IM',
      taskRoom: baseRoom.taskRoom || runtime.taskRoom,
      members: baseRoom.members || runtime.members || [],
      messages: realtimeMessages.length ? realtimeMessages : baseRoom.messages
    };
  } catch (error) {
    applyStoredRoom(baseRoom, runtime, 'CONNECT_FAILED', [
      '腾讯 IM 连接失败，当前继续展示已同步的聊天记录。',
      error?.message ? `失败原因：${error.message}` : '失败原因：请检查用户签名、群组 ID 和腾讯 IM 控制台配置。'
    ]);
  }
}

</script>
