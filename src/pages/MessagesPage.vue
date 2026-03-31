<template>
  <section class="page-stack" v-if="pageReady">
    <section class="message-shell-grid">
      <article class="glass-panel stack-md message-room-panel">
        <div class="message-room-header">
          <div>
            <h3>最近会话</h3>
            <p class="muted">按任务查看当前协作。</p>
          </div>
          <span class="message-room-count">{{ filteredRooms.length }} / {{ rooms.length }}</span>
        </div>

        <div class="stack-sm">
          <input
            v-model="roomSearch"
            class="text-input room-search-input"
            type="text"
            placeholder="搜索任务或协作对象"
          />
          <div class="room-filter-toolbar">
            <button
              v-for="item in roomFilterOptions"
              :key="item.value"
              type="button"
              class="room-filter-button"
              :class="{ 'is-active-tab': roomFilter === item.value }"
              @click="roomFilter = item.value"
            >
              <span>{{ item.label }}</span>
              <em>{{ roomFilterCount(item.value) }}</em>
            </button>
          </div>
        </div>

        <div class="message-room-list">
          <button
            v-for="item in filteredRooms"
            :key="item.roomKey"
            type="button"
            class="room-card-button"
            :class="{ 'is-active': item.roomKey === activeRoomKey }"
            @click="selectRoom(item.roomKey, { preserveEntryContext: false })"
          >
            <div class="room-card-topline">
              <div class="room-card-copy stack-xs">
                <h4 class="room-card-title">{{ item.taskTitle || item.title }}</h4>
                <p class="muted room-card-subtitle">{{ roomCardSubtitle(item) }}</p>
              </div>
              <span class="soft-pill" :class="roomStateClass(item)">{{ roomStateLabel(item) }}</span>
            </div>

            <p class="muted room-card-last-message">{{ item.lastMessage || item.focus || '进入会话查看详情。' }}</p>

            <div class="meta-inline room-card-meta">
              <span class="room-card-time">{{ item.lastTime }}</span>
              <span v-if="item.unreadCount !== '0'" class="room-card-meta-note">{{ item.unreadCount }} 条未读</span>
              <span v-else-if="item.communicationSavedAt" class="room-card-meta-note">纪要 {{ item.communicationSavedAt }}</span>
            </div>
          </button>

          <div v-if="!filteredRooms.length" class="mini-card stack-sm room-empty-card">
            <strong>没有找到匹配的会话</strong>
            <p class="muted">换个关键词，或者切回“全部”看看最近任务。</p>
          </div>
        </div>
      </article>

      <article v-if="room" class="glass-panel stack-md message-chat-panel">
        <div class="message-chat-header">
          <div class="stack-xs">
            <div v-if="messageEntryLabel || currentNodeId" class="tag-row message-entry-tag-row">
              <span v-if="messageEntryLabel" class="soft-pill">{{ messageEntryLabel }}</span>
              <span v-if="currentNodeId" class="soft-pill">节点 {{ currentNodeId }}</span>
            </div>
            <h3>{{ roomHeaderTitle }}</h3>
            <p class="muted">{{ roomHeaderSubtitle }}</p>
          </div>

          <div class="toolbar message-panel-meta">
            <span class="soft-pill">{{ roomParticipants.length }} 位协作成员</span>
            <span class="soft-pill">{{ messageTransportLabel }}</span>
            <router-link
              v-if="messageBackRoute"
              class="button-secondary"
              :to="messageBackRoute"
            >
              返回来源
            </router-link>
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
              <section v-if="taskConfirmation" class="message-task-confirmation stack-sm">
                <div class="message-task-confirmation-head">
                  <div class="stack-xs">
                    <span class="eyebrow">当前确认</span>
                    <h4>{{ taskConfirmationVersionText }}</h4>
                    <p class="muted">{{ taskConfirmationUpdatedText }}</p>
                  </div>
                  <div class="toolbar message-task-confirmation-status">
                    <span class="soft-pill" :class="taskConfirmationStatusClass(taskConfirmation.status)">
                      {{ taskConfirmation.status }}
                    </span>
                  </div>
                </div>

                <p v-if="taskConfirmationSummaryText" class="muted message-task-confirmation-summary">
                  {{ taskConfirmationSummaryText }}
                </p>

                <div class="message-task-confirmation-facts message-task-confirmation-facts-desktop">
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
                    v-for="note in taskConfirmationFocusNotes"
                    :key="note"
                    class="tag-pill tag-pill-muted"
                  >
                    {{ note }}
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
                <p class="muted">先发一句确认或补充说明，让这条任务会话真正开始流转。</p>
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

          <div class="toolbar">
            <button class="button-secondary" type="button" :disabled="isSendingMessage" @mousedown.prevent @click="openComposerFilePicker">添加附件</button>
            <button class="button-primary" type="button" :disabled="isSendingMessage" @mousedown.prevent @click="handleSend">{{ sendButtonLabel }}</button>
            <router-link class="button-secondary" :to="primaryRoute">{{ primaryLabel }}</router-link>
          </div>
        </div>
      </article>

      <aside v-if="room" class="glass-panel stack-md message-context-panel">
        <div class="message-context-header">
          <div>
            <span class="eyebrow">当前上下文</span>
            <h3>任务与沟通摘要</h3>
          </div>
          <span class="soft-pill">{{ roomTaskDetail?.status || room?.stage || '待处理' }}</span>
        </div>

        <article class="mini-card stack-sm">
          <div class="panel-header">
            <div class="stack-xs">
              <strong>{{ roomTaskDetail?.title || roomHeaderTitle }}</strong>
              <p class="muted">{{ roomHeaderSubtitle || '进入当前会话后，预算、工期和协作安排会同步到这里。' }}</p>
            </div>
            <button
              v-if="roomTaskDetail"
              class="button-secondary"
              type="button"
              @click="taskDetailModalOpen = true"
            >
              查看详情
            </button>
          </div>

          <div class="dashboard-preview-list">
            <div class="dashboard-preview-item">
              <div class="stack-xs">
                <strong>任务金额</strong>
                <p>{{ taskConfirmationBudgetText }}</p>
              </div>
            </div>
            <div class="dashboard-preview-item">
              <div class="stack-xs">
                <strong>确认工期</strong>
                <p>{{ taskConfirmationPeriodText }}</p>
              </div>
            </div>
            <div class="dashboard-preview-item">
              <div class="stack-xs">
                <strong>协作安排</strong>
                <p>{{ taskConfirmationScheduleText }}</p>
              </div>
            </div>
          </div>

          <div v-if="roomTaskDetail?.tags?.length" class="tag-row">
            <span v-for="tag in roomTaskDetail.tags.slice(0, 4)" :key="tag" class="soft-pill">{{ tag }}</span>
          </div>
        </article>

        <article v-if="linkedRecord" class="mini-card stack-sm">
          <div class="panel-header">
            <div class="stack-xs">
              <strong>当前记录</strong>
              <p class="muted">{{ linkedRecordSummary }}</p>
            </div>
            <router-link v-if="recordDetailRoute" class="button-secondary" :to="recordDetailRoute">
              查看记录
            </router-link>
          </div>

          <div class="dashboard-preview-list">
            <div class="dashboard-preview-item">
              <div class="stack-xs">
                <strong>记录阶段</strong>
                <p>{{ linkedRecordStage }}</p>
              </div>
            </div>
            <div class="dashboard-preview-item">
              <div class="stack-xs">
                <strong>记录金额</strong>
                <p>{{ linkedRecordAmount }}</p>
              </div>
            </div>
            <div class="dashboard-preview-item">
              <div class="stack-xs">
                <strong>{{ audience === 'talent' ? '企业评级' : '我的评级' }}</strong>
                <p>{{ linkedRecordRating }}</p>
              </div>
            </div>
          </div>

          <div v-if="linkedRecordTags.length" class="tag-row">
            <span v-for="tag in linkedRecordTags" :key="tag" class="soft-pill">{{ tag }}</span>
          </div>

          <p v-if="linkedRecordTimelineItem" class="muted">
            最近留痕：{{ linkedRecordTimelineItem.time || '待同步' }} · {{ linkedRecordTimelineItem.title || linkedRecordTimelineItem.note || '已更新' }}
          </p>
        </article>

        <article v-if="taskConfirmationChangeReview?.summary" class="mini-card stack-sm">
          <div class="panel-header">
            <div class="stack-xs">
              <strong>AI 修改建议</strong>
              <p class="muted">{{ taskConfirmationChangeReview.summary }}</p>
            </div>
            <span v-if="taskConfirmationChangeReview.status" class="soft-pill">{{ taskConfirmationChangeReview.status }}</span>
          </div>
          <div class="tag-row" v-if="taskConfirmationChangeReview.recommendedPeriod">
            <span class="soft-pill">建议工期 {{ taskConfirmationChangeReview.recommendedPeriod }}</span>
          </div>
          <ul v-if="listOf(taskConfirmationChangeReview.suggestions).length" class="dashboard-detail-list">
            <li v-for="item in listOf(taskConfirmationChangeReview.suggestions).slice(0, 3)" :key="item">{{ item }}</li>
          </ul>
        </article>

        <article class="mini-card stack-sm">
          <div class="panel-header">
            <div class="stack-xs">
              <strong>沟通纪要</strong>
              <p class="muted">{{ communicationRecord?.summary || communicationRecordSummary }}</p>
            </div>
            <button class="button-secondary" type="button" @click="recordModalOpen = true">查看纪要</button>
          </div>
          <div class="tag-row">
            <span class="soft-pill">{{ communicationRecord?.status || '未生成' }}</span>
            <span class="soft-pill">{{ communicationRecord?.savedAt || room?.lastTime || '待生成' }}</span>
          </div>
        </article>

        <div class="dashboard-module-actions message-context-actions">
          <router-link class="button-secondary" :to="workspaceRoute">去协作空间</router-link>
          <router-link v-if="canOpenAcceptanceRoute" class="button-secondary" :to="acceptanceRoute">去验收页</router-link>
          <router-link class="button-secondary" :to="primaryRoute">{{ primaryLabel }}</router-link>
        </div>
      </aside>

      <article v-else class="glass-panel stack-md message-chat-panel message-chat-empty-panel">
        <div class="panel-header">
          <div class="stack-sm">
            <span class="eyebrow">聊天</span>
            <h3>还没有聊天房间</h3>
            <p class="muted">企业发布任务并选中人才后，新的协商房间会出现在这里。现在可以先去发布任务。</p>
          </div>
        </div>

        <div class="dashboard-preview-list">
          <div class="dashboard-preview-item">
            <div class="stack-xs">
              <strong>企业端</strong>
              <p>先发布任务，再从推荐人才里选人，系统会自动创建会话。</p>
            </div>
          </div>
          <div class="dashboard-preview-item">
            <div class="stack-xs">
              <strong>人才端</strong>
              <p>被选中后，聊天列表和工作台都会同步出现待确认提醒。</p>
            </div>
          </div>
        </div>

        <div class="toolbar">
          <router-link class="button-primary" :to="primaryRoute">{{ primaryLabel }}</router-link>
        </div>
      </article>
    </section>

    <ChatAttachmentPreviewModal
      :open="Boolean(attachmentPreview)"
      :attachment="attachmentPreview"
      :attachment-meta-text="attachmentMetaText"
      :attachment-download-href="attachmentDownloadHref"
      @close="attachmentPreview = null"
    />

    <ChatTaskDetailModal
      :open="taskDetailModalOpen && Boolean(roomTaskDetail)"
      :task-detail="roomTaskDetail"
      :period-text="taskConfirmationPeriodText"
      :schedule-text="taskConfirmationScheduleText"
      :calendar-headline="roomTalentCalendarHeadline"
      :calendar-items="roomTalentCalendarDisplayItems"
      :change-review="taskConfirmationChangeReview"
      :change-review-suggestions="taskChangeReviewSuggestions"
      :tags="roomTaskTags"
      :deliverables="roomTaskDeliverables"
      :modules="roomTaskModules"
      :recommendations="roomTaskRecommendations"
      @close="taskDetailModalOpen = false"
    />

    <ChatCommunicationRecordModal
      :open="recordModalOpen && Boolean(room)"
      :room="room"
      :communication-record="communicationRecord"
      :communication-record-summary="communicationRecordSummary"
      :generate-record-button-label="generateRecordButtonLabel"
      :is-generating-record="isGeneratingRecord"
      :active-room-key="activeRoomKey"
      :generate-record-hint="generateRecordHint"
      @close="recordModalOpen = false"
      @generate="recordConfirmOpen = true"
    />

    <ChatRecordConfirmModal
      :open="recordConfirmOpen"
      :room="room"
      :communication-record="communicationRecord"
      :is-generating-record="isGeneratingRecord"
      :active-room-key="activeRoomKey"
      @close="recordConfirmOpen = false"
      @confirm="handleGenerateRecord"
    />

    <ChatTaskActionModal
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
      :task-change-review-suggestions="taskChangeReviewSuggestions"
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
  getOrderRecordDetail,
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
import {
  attachmentMetaText,
  buildMessagePayloads,
  calendarStateLabel,
  composerAttachmentPayload as buildComposerAttachmentPayload,
  inferAttachmentKind,
  isLegacyAutoSystemMessage,
  isSelfMessage as baseIsSelfMessage,
  isSystemMessage,
  listOf,
  mergeMessages,
  messageAvatarText,
  messageDisplayAuthor as baseMessageDisplayAuthor,
  messageRowClass as baseMessageRowClass,
  normalizeAttachmentValue,
  normalizedMessageAttachments,
  summarizeTaskConfirmationHistory,
  taskConfirmationStatusClass
} from './messageDetailHelpers.js';
import {
  nextRefreshInterval as resolveRefreshInterval,
  shouldRunLiveRefresh as shouldRunLiveRefreshBase
} from './messageLiveRefresh.js';
import { findDefaultRoom, findRoomByTaskId as findRoomByTaskIdInList, roomSortKey } from './messageRoomSelection.js';
import {
  buildTargetedEmptyRoom as buildTargetedEmptyRoomModel,
  enrichRoomItem as baseEnrichRoomItem,
  findRoomForTargetCounterpart as findRoomForTargetCounterpartInList,
  findRoomForTask,
  findRoomsForTargetCounterpart as findRoomsForTargetCounterpartInList,
  roomCounterpartName as baseRoomCounterpartName,
  shouldRefreshRoomDetail
} from './messageRoomRuntimeHelpers.js';
import {
  buildCenterReturnQuery as buildCenterReturnQueryFromContext,
  readObjectPageContext,
  resolveImmediateOriginContext
} from '../utils/objectPageContext.js';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const ChatAttachmentPreviewModal = defineAsyncComponent(() => import('../components/chat/ChatAttachmentPreviewModal.vue'));
const ChatTaskDetailModal = defineAsyncComponent(() => import('../components/chat/ChatTaskDetailModal.vue'));
const ChatCommunicationRecordModal = defineAsyncComponent(() => import('../components/chat/ChatCommunicationRecordModal.vue'));
const ChatRecordConfirmModal = defineAsyncComponent(() => import('../components/chat/ChatRecordConfirmModal.vue'));
const ChatTaskActionModal = defineAsyncComponent(() => import('../components/chat/ChatTaskActionModal.vue'));

const route = useRoute();
const router = useRouter();
const MOBILE_CHAT_BREAKPOINT = 820;
let roomLoadToken = 0;
const roomsLoaded = ref(false);
const rooms = ref([]);
const room = ref(null);
const activeRoomKey = ref('');
const draftMessage = ref('');
const conversationFeedRef = ref(null);
const messageInputRef = ref(null);
const composerFileInputRef = ref(null);
const imConfig = ref(null);
const currentConversationId = ref('');
const isMobile = ref(false);
const audience = computed(() => resolveAudience(route));
const isForcedMockMode = computed(() => route.query.mock === '1');
const fallbackActor = computed(() => (audience.value === 'talent' ? '陈一宁' : '星河智能'));
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
const roomSearch = ref('');
const roomFilter = ref('all');
const roomFilterOptions = [
  { value: 'all', label: '全部' },
  { value: 'reply', label: '待回复' },
  { value: 'record', label: '纪要待更新' }
];
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
const recordContext = ref(null);
let unsubscribeMessages = null;
let recordSuccessTimer = null;
let liveRefreshTimer = null;
let recordLoadToken = 0;
const FALLBACK_REFRESH_MS = 5000;
const IM_CONNECTED_REFRESH_MS = 15000;

const primaryRoute = computed(() => ({
  path: audience.value === 'talent' ? roleRouteMap.talent.market : roleRouteMap.enterprise.publish,
  query: buildMessageContextQuery(undefined, route.query, {
    source: 'messages'
  })
}));
const primaryLabel = computed(() => (audience.value === 'talent' ? '去看任务广场' : '去发布任务'));
const pageContext = computed(() =>
  readObjectPageContext(route.query, {
    taskId: resolveRoomTaskId(),
    recordId: resolveRoomRecordId(room.value, false),
    room: normalizedQueryValue(route.query.room || activeRoomKey.value)
  })
);
const messageEntrySource = computed(() => normalizedQueryValue(route.query.source));
const currentTaskId = computed(() => resolveRoomTaskId() || normalizedQueryValue(route.query.taskId));
const currentRecordId = computed(() => resolveRoomRecordId(room.value, true));
const currentRecordTab = computed(() => normalizedQueryValue(route.query.tab));
const currentNodeId = computed(() => normalizedQueryValue(route.query.nodeId));
const currentItemId = computed(() => normalizedQueryValue(route.query.itemId));
const currentGroupKey = computed(() => normalizedQueryValue(route.query.group));
const currentApprovalId = computed(() => normalizedQueryValue(route.query.approvalId));
const originSource = computed(() => normalizedQueryValue(route.query.originSource));
const originItemId = computed(() => normalizedQueryValue(route.query.originItemId));
const originGroupKey = computed(() => normalizedQueryValue(route.query.originGroup));
const originApprovalId = computed(() => normalizedQueryValue(route.query.originApprovalId));
const originTaskId = computed(() => normalizedQueryValue(route.query.originTaskId));
const originRecordId = computed(() => normalizedQueryValue(route.query.originRecordId));
const originRoomKey = computed(() => normalizedQueryValue(route.query.originRoom));
const messageOriginContext = computed(() =>
  resolveImmediateOriginContext({
    entrySource: messageEntrySource.value,
    query: route.query,
    defaults: {
      approvalId: currentApprovalId.value,
      taskId: currentTaskId.value,
      recordId: currentRecordId.value,
      room: normalizedQueryValue(route.query.room || activeRoomKey.value)
    },
    allowedSources: [
      'approvals',
      'notifications',
      'records',
      'record-detail',
      'workspace',
      'acceptance',
      'dashboard-enterprise',
      'dashboard-talent'
    ]
  })
);

function resolvedOriginContext() {
  if (messageOriginContext.value.source) {
    return {
      source: messageOriginContext.value.source,
      itemId: messageOriginContext.value.itemId,
      group: messageOriginContext.value.group,
      approvalId: messageOriginContext.value.approvalId,
      taskId: messageOriginContext.value.taskId,
      recordId: messageOriginContext.value.recordId,
      room: messageOriginContext.value.room
    };
  }

  return {};
}

function buildCenterReturnQuery() {
  return buildCenterReturnQueryFromContext({
    current: {
      ...pageContext.value,
      itemId: currentItemId.value,
      group: currentGroupKey.value,
      approvalId: currentApprovalId.value,
      taskId: currentTaskId.value,
      recordId: currentRecordId.value,
      room: normalizedQueryValue(route.query.room || activeRoomKey.value)
    },
    origin: resolvedOriginContext()
  });
}

const recordDetailRoute = computed(() => {
  if (!currentRecordId.value) {
    return null;
  }
  return {
    path: audience.value === 'talent'
      ? roleRouteMap.talent.recordDetail(currentRecordId.value)
      : roleRouteMap.enterprise.recordDetail(currentRecordId.value),
    query: buildMessageContextQuery(undefined, route.query, {
      source: 'messages',
      nodeId: undefined,
      tab: currentRecordTab.value || undefined
    })
  };
});
const workspaceRoute = computed(() => ({
  path: audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace,
  query: buildMessageContextQuery(undefined, route.query, {
    source: 'messages'
  })
}));
const acceptanceRoute = computed(() => ({
  path: audience.value === 'talent' ? roleRouteMap.talent.acceptance : roleRouteMap.enterprise.acceptance,
  query: buildMessageContextQuery(undefined, route.query, {
    source: 'messages',
    nodeId: undefined
  })
}));
const canOpenAcceptanceRoute = computed(() =>
  Boolean(
    roomTaskDetail.value?.taskId &&
    ['待双方评分闭环', '已提前完成', '已完成评级'].includes(String(roomTaskDetail.value?.status || ''))
  )
);
const messageEntryLabel = computed(() => {
  if (messageEntrySource.value === 'approvals') {
    return '审批中心';
  }
  if (messageEntrySource.value === 'notifications') {
    return '通知中心';
  }
  if (messageEntrySource.value === 'records') {
    return '记录列表';
  }
  if (messageEntrySource.value === 'record-detail') {
    return '记录详情';
  }
  if (messageEntrySource.value === 'workspace') {
    return '协作空间';
  }
  if (messageEntrySource.value === 'dashboard-enterprise') {
    return '企业工作台';
  }
  if (messageEntrySource.value === 'dashboard-talent') {
    return '人才工作台';
  }
  return '';
});
const messageBackRoute = computed(() => {
  if (messageEntrySource.value === 'approvals') {
    return {
      path: roleRouteMap.enterprise.approvals,
      query: buildCenterReturnQuery()
    };
  }

  if (messageEntrySource.value === 'notifications') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.notifications : roleRouteMap.enterprise.notifications,
      query: buildCenterReturnQuery()
    };
  }

  if (messageEntrySource.value === 'workspace') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace,
      query: buildMessageContextQuery(room.value, route.query, {
        source: 'workspace'
      })
    };
  }

  if (messageEntrySource.value === 'acceptance') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.acceptance : roleRouteMap.enterprise.acceptance,
      query: buildMessageContextQuery(room.value, route.query, {
        source: 'acceptance',
        nodeId: undefined
      })
    };
  }

  if (messageEntrySource.value === 'records') {
    return {
      path: audience.value === 'talent' ? roleRouteMap.talent.records : roleRouteMap.enterprise.records,
      query: currentRecordTab.value ? { tab: currentRecordTab.value } : {}
    };
  }

  if (messageEntrySource.value === 'record-detail' && currentRecordId.value) {
    return {
      path: audience.value === 'talent'
        ? roleRouteMap.talent.recordDetail(currentRecordId.value)
        : roleRouteMap.enterprise.recordDetail(currentRecordId.value),
      query: buildMessageContextQuery(room.value, route.query, {
        source: 'record-detail',
        nodeId: undefined,
        tab: currentRecordTab.value || undefined
      })
    };
  }

  if (messageEntrySource.value === 'dashboard-enterprise') {
    return { path: roleRouteMap.enterprise.home };
  }

  if (messageEntrySource.value === 'dashboard-talent') {
    return { path: roleRouteMap.talent.home };
  }

  return null;
});

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

const roomHeaderTitle = computed(() => roomTaskDetail.value?.title || room.value?.taskTitle || room.value?.title || '当前聊天');
const roomHeaderSubtitle = computed(() => {
  if (!room.value) {
    return '';
  }

  const pieces = [];
  const counterpartName = room.value.counterpartName || roomCounterpartName(room.value);
  if (counterpartName) {
    pieces.push(`协作对象：${counterpartName}`);
  }
  if (room.value.stage) {
    pieces.push(room.value.stage);
  }
  return pieces.join(' · ');
});
const messageTransportLabel = computed(() => {
  if (room.value?.provider === 'Tencent IM') {
    return '消息来源：Tencent IM';
  }
  if (imConfig.value?.status === 'CONNECT_FAILED' || imConfig.value?.status === 'SEND_FAILED_FALLBACK') {
    return '消息来源：聊天记录（IM 降级）';
  }
  return '消息来源：聊天记录';
});
const linkedRecord = computed(() => recordContext.value?.record || null);
const linkedRecordStage = computed(() => linkedRecord.value?.stage || linkedRecord.value?.statusGroup || linkedRecord.value?.status || '待同步');
const linkedRecordAmount = computed(() => linkedRecord.value?.amountValue || linkedRecord.value?.amount || '未填写金额');
const linkedRecordRating = computed(() => linkedRecord.value?.rating?.value || linkedRecord.value?.myGrade || '待评级');
const linkedRecordSummary = computed(() =>
  linkedRecord.value?.summary ||
  linkedRecord.value?.detail ||
  linkedRecord.value?.task?.brief ||
  '这条合作记录的关键结果、时间线和资产都会继续沉淀在记录详情里。'
);
const linkedRecordTags = computed(() => {
  if (Array.isArray(linkedRecord.value?.sections?.taskTags)) {
    return linkedRecord.value.sections.taskTags.slice(0, 3);
  }
  if (Array.isArray(linkedRecord.value?.tags)) {
    return linkedRecord.value.tags.slice(0, 3);
  }
  return [];
});
const linkedRecordTimelineItem = computed(() => {
  const items = Array.isArray(linkedRecord.value?.timeline) ? linkedRecord.value.timeline : [];
  return items.length ? items[items.length - 1] : null;
});
const filteredRooms = computed(() => {
  const keyword = roomSearch.value.trim().toLowerCase();
  return rooms.value
    .map((item) => enrichCurrentRoomItem(item))
    .filter((item) => matchesRoomFilter(item, roomFilter.value))
    .filter((item) => {
      if (!keyword) {
        return true;
      }
      return [item.title, item.taskTitle, item.counterpartName, item.taskId, item.stage, item.focus, item.lastMessage]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    })
    .sort((left, right) => roomSortKey(right) - roomSortKey(left));
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
const roomTalentCalendar = computed(() => room.value?.talentCalendar || roomTaskDetail.value?.calendarPreview || null);
const roomTalentCalendarHeadline = computed(() => roomTalentCalendar.value?.headline || '');
const roomTalentCalendarItems = computed(() =>
  Array.isArray(roomTalentCalendar.value?.items) ? roomTalentCalendar.value.items : []
);
const roomTalentCalendarDisplayItems = computed(() =>
  roomTalentCalendarItems.value.map((item) => `${item.day} · ${calendarStateLabel(item.state)}`)
);
const taskChangeReviewSuggestions = computed(() => listOf(taskConfirmationChangeReview.value?.suggestions));
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
const taskConfirmationSummaryText = computed(() => compactText(taskConfirmation.value?.summary, 118));
const taskConfirmationFocusNotes = computed(() => {
  const notes = [];
  if (taskConfirmation.value?.changeRequest) {
    notes.push(`修改：${compactText(taskConfirmation.value.changeRequest, 34)}`);
  }
  if (taskConfirmation.value?.scopeNote) {
    notes.push(`范围：${compactText(taskConfirmation.value.scopeNote, 34)}`);
  }
  if (taskConfirmationChangeReview.value?.summary) {
    notes.push(`AI：${compactText(taskConfirmationChangeReview.value.summary, 34)}`);
  }
  if (roomTalentCalendarHeadline.value) {
    notes.push(`档期：${compactText(roomTalentCalendarHeadline.value, 26)}`);
  }
  if (taskConfirmationModificationHistory.value.length > 1) {
    notes.push(`版本记录 ${taskConfirmationModificationHistory.value.length} 次`);
  }
  return notes.slice(0, 4);
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
function normalizedQueryValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveRoomTaskId(roomData = room.value) {
  return normalizedQueryValue(
    roomData?.taskDetail?.taskId ||
      roomData?.taskId ||
      route.query.taskId
  );
}

function resolveRoomRecordId(roomData = room.value, fallbackToQuery = true) {
  return normalizedQueryValue(
    roomData?.recordId ||
      roomData?.taskDetail?.recordId ||
      roomData?.taskRoom?.recordId ||
      roomData?.communicationRecord?.recordId ||
      roomData?.communicationRecord?.id ||
      (fallbackToQuery ? route.query.recordId : '')
  );
}

function buildMessageContextQuery(roomData = room.value, baseQuery = route.query, overrides = {}) {
  const nextQuery = {
    ...(baseQuery || {}),
    ...overrides
  };

  const taskId = resolveRoomTaskId(roomData);
  const roomKey = normalizedQueryValue(roomData?.roomKey || activeRoomKey.value || route.query.room);
  const recordId = resolveRoomRecordId(roomData, !roomData);
  const hasExplicitNodeId = Object.prototype.hasOwnProperty.call(overrides, 'nodeId');
  const nodeId = normalizedQueryValue(
    hasExplicitNodeId ? overrides.nodeId : baseQuery?.nodeId ?? route.query.nodeId
  );
  const hasExplicitItemId = Object.prototype.hasOwnProperty.call(overrides, 'itemId');
  const itemId = normalizedQueryValue(
    hasExplicitItemId ? overrides.itemId : baseQuery?.itemId ?? route.query.itemId
  );
  const hasExplicitGroup = Object.prototype.hasOwnProperty.call(overrides, 'group');
  const group = normalizedQueryValue(
    hasExplicitGroup ? overrides.group : baseQuery?.group ?? route.query.group
  );
  const hasExplicitApprovalId = Object.prototype.hasOwnProperty.call(overrides, 'approvalId');
  const approvalId = normalizedQueryValue(
    hasExplicitApprovalId ? overrides.approvalId : baseQuery?.approvalId ?? route.query.approvalId
  );
  const origin = resolvedOriginContext();
  const hasExplicitOriginSource = Object.prototype.hasOwnProperty.call(overrides, 'originSource');
  const nextOriginSource = normalizedQueryValue(
    hasExplicitOriginSource ? overrides.originSource : baseQuery?.originSource ?? origin.source
  );
  const hasExplicitOriginItemId = Object.prototype.hasOwnProperty.call(overrides, 'originItemId');
  const nextOriginItemId = normalizedQueryValue(
    hasExplicitOriginItemId ? overrides.originItemId : baseQuery?.originItemId ?? origin.itemId
  );
  const hasExplicitOriginGroup = Object.prototype.hasOwnProperty.call(overrides, 'originGroup');
  const nextOriginGroup = normalizedQueryValue(
    hasExplicitOriginGroup ? overrides.originGroup : baseQuery?.originGroup ?? origin.group
  );
  const hasExplicitOriginApprovalId = Object.prototype.hasOwnProperty.call(overrides, 'originApprovalId');
  const nextOriginApprovalId = normalizedQueryValue(
    hasExplicitOriginApprovalId ? overrides.originApprovalId : baseQuery?.originApprovalId ?? origin.approvalId
  );
  const hasExplicitOriginTaskId = Object.prototype.hasOwnProperty.call(overrides, 'originTaskId');
  const nextOriginTaskId = normalizedQueryValue(
    hasExplicitOriginTaskId ? overrides.originTaskId : baseQuery?.originTaskId ?? origin.taskId
  );
  const hasExplicitOriginRecordId = Object.prototype.hasOwnProperty.call(overrides, 'originRecordId');
  const nextOriginRecordId = normalizedQueryValue(
    hasExplicitOriginRecordId ? overrides.originRecordId : baseQuery?.originRecordId ?? origin.recordId
  );
  const hasExplicitOriginRoom = Object.prototype.hasOwnProperty.call(overrides, 'originRoom');
  const nextOriginRoom = normalizedQueryValue(
    hasExplicitOriginRoom ? overrides.originRoom : baseQuery?.originRoom ?? origin.room
  );

  if (taskId) {
    nextQuery.taskId = taskId;
  }
  if (roomKey) {
    nextQuery.room = roomKey;
  }
  if (Object.prototype.hasOwnProperty.call(overrides, 'source')) {
    if (overrides.source) {
      nextQuery.source = overrides.source;
    } else {
      delete nextQuery.source;
    }
  } else {
    const preservedSource = normalizedQueryValue(nextQuery.source);
    nextQuery.source = preservedSource || 'messages';
  }
  if (recordId) {
    nextQuery.recordId = recordId;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'recordId')) {
    delete nextQuery.recordId;
  }
  if (nodeId) {
    nextQuery.nodeId = nodeId;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'nodeId')) {
    delete nextQuery.nodeId;
  }
  if (itemId) {
    nextQuery.itemId = itemId;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'itemId')) {
    delete nextQuery.itemId;
  }
  if (group) {
    nextQuery.group = group;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'group')) {
    delete nextQuery.group;
  }
  if (approvalId) {
    nextQuery.approvalId = approvalId;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'approvalId')) {
    delete nextQuery.approvalId;
  }
  if (nextOriginSource) {
    nextQuery.originSource = nextOriginSource;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'originSource')) {
    delete nextQuery.originSource;
  }
  if (nextOriginItemId) {
    nextQuery.originItemId = nextOriginItemId;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'originItemId')) {
    delete nextQuery.originItemId;
  }
  if (nextOriginGroup) {
    nextQuery.originGroup = nextOriginGroup;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'originGroup')) {
    delete nextQuery.originGroup;
  }
  if (nextOriginApprovalId) {
    nextQuery.originApprovalId = nextOriginApprovalId;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'originApprovalId')) {
    delete nextQuery.originApprovalId;
  }
  if (nextOriginTaskId) {
    nextQuery.originTaskId = nextOriginTaskId;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'originTaskId')) {
    delete nextQuery.originTaskId;
  }
  if (nextOriginRecordId) {
    nextQuery.originRecordId = nextOriginRecordId;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'originRecordId')) {
    delete nextQuery.originRecordId;
  }
  if (nextOriginRoom) {
    nextQuery.originRoom = nextOriginRoom;
  } else if (Object.prototype.hasOwnProperty.call(nextQuery, 'originRoom')) {
    delete nextQuery.originRoom;
  }

  return nextQuery;
}

function isCurrentRoomRequest(roomKey, requestToken) {
  return requestToken === roomLoadToken && activeRoomKey.value === roomKey;
}

function messageRowClass(message) {
  return baseMessageRowClass(message, currentActor.value);
}

function isSelfMessage(message) {
  return baseIsSelfMessage(message, currentActor.value);
}

function messageDisplayAuthor(message) {
  return baseMessageDisplayAuthor(message, currentActor.value);
}

async function loadRecordContext() {
  const recordId = currentRecordId.value;
  if (!recordId) {
    recordContext.value = null;
    return;
  }

  const requestToken = ++recordLoadToken;
  const nextRecordContext = await getOrderRecordDetail(audience.value, recordId);
  if (requestToken !== recordLoadToken || currentRecordId.value !== recordId) {
    return;
  }
  recordContext.value = nextRecordContext;
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

function composerAttachmentPayloadValue() {
  return buildComposerAttachmentPayload(composerAttachments.value);
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
  return baseEnrichRoomItem(item, activeRoomKey.value, communicationRecord.value);
}

function roomCardSubtitle(item) {
  const pieces = [];
  if (item?.counterpartName) {
    pieces.push(item.counterpartName);
  } else if (item?.taskId) {
    pieces.push(item.taskId);
  }
  if (item?.stage) {
    pieces.push(item.stage);
  }
  return pieces.join(' · ');
}

function roomNeedsReply(item) {
  return (
    item.unreadCount !== '0' ||
    /确认|反馈|回复|补充|待/.test(String(item.focus || '')) ||
    Boolean(item.taskConfirmation?.pendingAudience)
  );
}

function roomRecordPending(item) {
  return String(item.communicationStatus || '') === '待更新';
}

function roomStateLabel(item) {
  if (item.taskConfirmation?.status) {
    const version = Number(item.taskConfirmation?.version || 1);
    return `V${version} · ${item.taskConfirmation.status}`;
  }
  if (item.unreadCount !== '0') {
    return '有未读';
  }
  if (roomRecordPending(item)) {
    return '纪要待更新';
  }
  if (roomNeedsReply(item)) {
    return '待回复';
  }
  return '已同步';
}

function roomStateClass(item) {
  if (item.taskConfirmation?.status === '待人才确认') {
    return 'is-warning';
  }
  if (item.taskConfirmation?.status === '待企业修改') {
    return 'is-danger';
  }
  if (item.unreadCount !== '0') {
    return 'is-danger';
  }
  if (roomRecordPending(item)) {
    return 'is-warning';
  }
  if (roomNeedsReply(item)) {
    return 'is-info';
  }
  return 'is-success';
}

function matchesRoomFilter(item, filter) {
  if (filter === 'reply') {
    return roomNeedsReply(item);
  }
  if (filter === 'record') {
    return roomRecordPending(item);
  }
  return true;
}

function roomFilterCount(filter) {
  return rooms.value
    .map((item) => enrichCurrentRoomItem(item))
    .filter((item) => matchesRoomFilter(item, filter))
    .length;
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

function syncViewportMode() {
  if (typeof window === 'undefined') {
    isMobile.value = false;
    return;
  }

  const nextIsMobile = window.innerWidth <= MOBILE_CHAT_BREAKPOINT;
  const wasMobile = isMobile.value;
  isMobile.value = nextIsMobile;

  if (wasMobile !== nextIsMobile && !nextIsMobile && !route.query.room && rooms.value.length && !room.value) {
    selectRoom(rooms.value[0].roomKey);
  }
}

function applyMockRoom(baseRoom, runtime, status, extraNotes = []) {
  const normalizedStatus = status || runtime?.status || 'MOCK_FALLBACK';
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

async function selectRoomWithOptions(roomKey, options = {}) {
  const preserveEntryContext = options.preserveEntryContext !== false;
  const requestToken = ++roomLoadToken;
  activeRoomKey.value = roomKey;
  recordModalOpen.value = false;
  recordConfirmOpen.value = false;
  taskDetailModalOpen.value = false;
  closeTaskActionModal();
  recordSuccessNote.value = '';
  const baseRoom = await getTaskRoom(roomKey);
  if (!isCurrentRoomRequest(roomKey, requestToken)) {
    return;
  }
  room.value = baseRoom;
  draftAuthor.value = fallbackActor.value;
  if (route.query.room !== roomKey) {
    router.replace({
      query: buildMessageContextQuery(baseRoom, route.query, {
        room: roomKey,
        source: preserveEntryContext ? route.query.source : undefined,
        nodeId: preserveEntryContext ? route.query.nodeId : undefined,
        tab: preserveEntryContext ? route.query.tab : undefined,
        itemId: preserveEntryContext ? route.query.itemId : undefined,
        group: preserveEntryContext ? route.query.group : undefined,
        approvalId: preserveEntryContext ? route.query.approvalId : undefined,
        originSource: preserveEntryContext ? route.query.originSource : undefined,
        originItemId: preserveEntryContext ? route.query.originItemId : undefined,
        originGroup: preserveEntryContext ? route.query.originGroup : undefined,
        originApprovalId: preserveEntryContext ? route.query.originApprovalId : undefined,
        originTaskId: preserveEntryContext ? route.query.originTaskId : undefined,
        originRecordId: preserveEntryContext ? route.query.originRecordId : undefined,
        originRoom: preserveEntryContext ? route.query.originRoom : undefined,
        counterpartPlatformUserId: undefined,
        counterpartName: undefined,
        talentSlug: undefined
      })
    });
  }
  await loadTencentRoom(roomKey, baseRoom, requestToken);
  if (!isCurrentRoomRequest(roomKey, requestToken)) {
    return;
  }
  await settleConversationViewport({ stickToBottom: true, restoreWindowScroll: false, keepComposerFocus: false });
}

async function selectRoom(roomKey, options = {}) {
  await selectRoomWithOptions(roomKey, options);
}

function findRoomByTaskId(taskId) {
  return findRoomByTaskIdInList(rooms.value, normalizedQueryValue(taskId));
}

function syncRoomList(updatedRoom) {
  rooms.value = rooms.value.map((item) =>
    item.roomKey === updatedRoom.roomKey
      ? {
          ...item,
          taskTitle: updatedRoom.taskDetail?.title || updatedRoom.taskTitle || item.taskTitle,
          counterpartName: updatedRoom.counterpartName || roomCounterpartName(updatedRoom) || item.counterpartName,
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

function buildTargetedEmptyRoom() {
  return buildTargetedEmptyRoomModel({
    targetCounterpartName: targetCounterpartName.value,
    targetCounterpartPlatformUserId: targetCounterpartPlatformUserId.value,
    matchingRooms: findRoomsForTargetCounterpart()
  });
}

function findRoomsForTargetCounterpart(items = rooms.value) {
  return findRoomsForTargetCounterpartInList(items, targetCounterpartPlatformUserId.value);
}

function findRoomForTargetCounterpart(items = rooms.value) {
  return findRoomForTargetCounterpartInList(items, targetCounterpartPlatformUserId.value);
}

function showTargetedEmptyRoom() {
  if (!targetCounterpartPlatformUserId.value) {
    return;
  }
  activeRoomKey.value = '';
  room.value = buildTargetedEmptyRoom();
  draftAuthor.value = fallbackActor.value;
}

function roomCounterpartName(roomData) {
  return baseRoomCounterpartName(roomData, audience.value);
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
  const nextRoomKey = typeof created?.roomKey === 'string' ? created.roomKey.trim() : '';
  if (!nextRoomKey) {
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
  const attachments = composerAttachmentPayloadValue();
  if (!normalizedText && !attachments.length) {
    return;
  }

  const shouldStickToBottom = isConversationNearBottom();
  let nextRoom;
  isSendingMessage.value = true;
  composerErrorNote.value = '';
  try {
    const ensuredRoomKey = await ensureActiveRoomForSend();
    if (!ensuredRoomKey) {
      return;
    }
    const taskId = resolveRoomTaskId();
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
    composerErrorNote.value = error?.requestError || error?.message || '当前暂时无法发送消息，请稍后再试。';
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
      taskActionError.value = nextRoom?.requestError || '任务确认更新失败，请稍后重试。';
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

function shouldRunLiveRefresh() {
  return shouldRunLiveRefreshBase({
    visibilityState: typeof document !== 'undefined' ? document.visibilityState : 'visible',
    isSendingMessage: isSendingMessage.value,
    isGeneratingRecord: isGeneratingRecord.value,
    isSubmittingTaskAction: isSubmittingTaskAction.value
  });
}

async function refreshMessageSurface() {
  if (!shouldRunLiveRefresh()) {
    return;
  }

  const payload = await getTaskRooms();
  const nextRooms = (payload.items || []).map((item) => enrichCurrentRoomItem(item));
  const previousActiveSummary = rooms.value.find((item) => item.roomKey === activeRoomKey.value) || null;
  rooms.value = nextRooms;

  if (targetCounterpartPlatformUserId.value && !activeRoomKey.value) {
    const targetedRoom = findRoomForTargetCounterpart(nextRooms);
    if (targetedRoom?.roomKey) {
      await selectRoom(targetedRoom.roomKey);
      return;
    }
    showTargetedEmptyRoom();
    return;
  }

  if (!activeRoomKey.value) {
    return;
  }

  const activeSummary = nextRooms.find((item) => item.roomKey === activeRoomKey.value);
  if (!activeSummary) {
    if (targetCounterpartPlatformUserId.value) {
      showTargetedEmptyRoom();
      return;
    }
    if (nextRooms[0]?.roomKey) {
      await selectRoom(nextRooms[0].roomKey);
    }
    return;
  }

  const needsDetailRefresh = shouldRefreshRoomDetail(previousActiveSummary, activeSummary);

  if (!needsDetailRefresh) {
    return;
  }

  const shouldStickToBottom = isConversationNearBottom();
  const refreshingRoomKey = activeRoomKey.value;
  const nextRoom = await getTaskRoom(refreshingRoomKey);
  if (activeRoomKey.value !== refreshingRoomKey) {
    return;
  }
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

function nextRefreshInterval() {
  return resolveRefreshInterval(Boolean(imConfig.value?.enabled));
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
  }, nextRefreshInterval());
}

onMounted(async () => {
  syncViewportMode();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', syncViewportMode);
  }

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
  rooms.value = (payload.items || []).map((item) => enrichCurrentRoomItem(item));
  roomsLoaded.value = true;
  await loadRecordContext();

  const initialRoomKey = route.query.room;
  const initialTaskId = normalizedQueryValue(route.query.taskId);
  if (initialRoomKey) {
    await selectRoom(initialRoomKey, { preserveEntryContext: true });
  } else if (initialTaskId) {
    const taskMatchedRoom = findRoomByTaskId(initialTaskId);
    if (taskMatchedRoom?.roomKey) {
      await selectRoom(taskMatchedRoom.roomKey, { preserveEntryContext: true });
    } else if (targetCounterpartPlatformUserId.value) {
      showTargetedEmptyRoom();
    } else {
      const defaultRoom = findDefaultRoom(rooms.value);
      if (defaultRoom?.roomKey) {
        await selectRoom(defaultRoom.roomKey, { preserveEntryContext: false });
      }
    }
  } else {
    const targetedRoom = findRoomForTargetCounterpart(rooms.value);
    if (targetedRoom?.roomKey) {
      await selectRoom(targetedRoom.roomKey, { preserveEntryContext: false });
    } else if (targetCounterpartPlatformUserId.value) {
      showTargetedEmptyRoom();
    } else {
      const defaultRoom = findDefaultRoom(rooms.value);
      if (defaultRoom?.roomKey) {
        await selectRoom(defaultRoom.roomKey, { preserveEntryContext: false });
      }
    }
  }

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
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', syncViewportMode);
  }
});

watch(
  () => [route.query.room, route.query.taskId, route.query.counterpartPlatformUserId, route.query.counterpartName],
  async ([nextRoomKey, nextTaskId, nextCounterpartPlatformUserId]) => {
    const normalizedRoomKey = typeof nextRoomKey === 'string' ? nextRoomKey : '';
    const normalizedTaskId = typeof nextTaskId === 'string' ? nextTaskId.trim() : '';

    if (normalizedRoomKey) {
      if (normalizedRoomKey !== activeRoomKey.value || !room.value) {
        await selectRoom(normalizedRoomKey, { preserveEntryContext: true });
      }
      return;
    }

    if (normalizedTaskId) {
      const taskMatchedRoom = findRoomByTaskId(normalizedTaskId);
      if (taskMatchedRoom?.roomKey) {
        if (taskMatchedRoom.roomKey !== activeRoomKey.value || !room.value) {
          await selectRoom(taskMatchedRoom.roomKey, { preserveEntryContext: true });
        }
      }
      return;
    }

    const normalizedCounterpart = typeof nextCounterpartPlatformUserId === 'string'
      ? nextCounterpartPlatformUserId.trim()
      : '';

    if (normalizedCounterpart) {
      const targetedRoom = findRoomForTargetCounterpart(rooms.value);
      if (targetedRoom?.roomKey) {
        if (targetedRoom.roomKey !== activeRoomKey.value) {
          await selectRoom(targetedRoom.roomKey, { preserveEntryContext: false });
        }
      } else {
        showTargetedEmptyRoom();
      }
      return;
    }

    if (!normalizedRoomKey) {
      if (rooms.value.length && !room.value) {
        const defaultRoom = findDefaultRoom(rooms.value);
        if (defaultRoom?.roomKey) {
          await selectRoom(defaultRoom.roomKey, { preserveEntryContext: false });
        }
      }
      return;
    }
  }
);

watch(
  () => [currentRecordId.value, audience.value],
  async () => {
    await loadRecordContext();
  },
  { immediate: true }
);

async function loadTencentRoom(roomKey, baseRoom, requestToken = roomLoadToken) {
  const runtime = await getTencentImRuntimeConfig(audience.value, roomKey);
  if (!isCurrentRoomRequest(roomKey, requestToken)) {
    return;
  }
  imConfig.value = runtime;
  currentConversationId.value = runtime?.groupId ? `GROUP${runtime.groupId}` : '';
  draftAuthor.value = runtime?.currentUser?.displayName || fallbackActor.value;

  if (isForcedMockMode.value) {
    applyMockRoom(baseRoom, runtime, 'FORCED_MOCK', ['当前页面正在展示已同步的聊天记录。']);
    return;
  }

  if (!runtime?.enabled) {
    applyMockRoom(baseRoom, runtime, runtime?.status || 'MOCK_FALLBACK');
    return;
  }

  try {
    await connectTencentIm(runtime);
    await ensureTencentTaskGroup(runtime);
    const realtimeMessages = await getTencentGroupMessages(runtime);
    if (!isCurrentRoomRequest(roomKey, requestToken)) {
      return;
    }
    room.value = {
      ...baseRoom,
      provider: 'Tencent IM',
      taskRoom: baseRoom.taskRoom || runtime.taskRoom,
      members: baseRoom.members || runtime.members || [],
      messages: realtimeMessages.length ? realtimeMessages : baseRoom.messages
    };
  } catch (error) {
    if (!isCurrentRoomRequest(roomKey, requestToken)) {
      return;
    }
    applyMockRoom(baseRoom, runtime, 'CONNECT_FAILED', [
      '腾讯 IM 连接失败，当前继续展示已同步的聊天记录。',
      error?.message ? `失败原因：${error.message}` : '失败原因：请检查用户签名、群组 ID 和腾讯 IM 控制台配置。'
    ]);
  }
}
</script>
