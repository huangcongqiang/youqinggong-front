<template>
  <section class="page-stack" v-if="pageReady">
    <section class="message-shell-grid">
      <article class="glass-panel stack-md message-room-panel">
        <div class="panel-header">
          <div>
            <span class="eyebrow">会话列表</span>
            <h3>任务房间</h3>
          </div>
          <span class="soft-pill">{{ filteredRooms.length }} / {{ rooms.length }} 个房间</span>
        </div>

        <div class="stack-sm">
          <input
            v-model="roomSearch"
            class="text-input room-search-input"
            type="text"
            placeholder="搜索任务名、协作对象或最后一条消息"
          />
          <div class="toolbar room-filter-toolbar">
            <button
              v-for="item in roomFilterOptions"
              :key="item.value"
              type="button"
              class="button-secondary room-filter-button"
              :class="{ 'is-active-tab': roomFilter === item.value }"
              @click="roomFilter = item.value"
            >
              {{ item.label }}
              <span class="soft-pill">{{ roomFilterCount(item.value) }}</span>
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
            @click="selectRoom(item.roomKey)"
          >
            <div class="room-card-head">
              <div>
                <h4 class="room-card-title">{{ item.taskTitle || item.title }}</h4>
                <p class="muted room-card-subtitle">{{ roomCardSubtitle(item) }}</p>
              </div>
              <span v-if="item.unreadCount !== '0'" class="soft-pill">{{ item.unreadCount }} 条未读</span>
              <span v-else class="soft-pill">已读</span>
            </div>

            <p class="muted room-card-focus">{{ item.focus }}</p>

            <div class="meta-inline">
              <span class="room-card-time">{{ item.lastTime }}</span>
              <span class="room-card-last-message">{{ item.lastMessage }}</span>
            </div>

            <div class="tag-row">
              <span class="soft-pill" :class="roomStateClass(item)">{{ roomStateLabel(item) }}</span>
              <span v-if="item.communicationSavedAt" class="soft-pill">纪要 {{ item.communicationSavedAt }}</span>
              <span v-for="tag in item.taskTags || []" :key="tag" class="tag-pill tag-pill-muted">{{ tag }}</span>
            </div>
          </button>

          <div v-if="!filteredRooms.length" class="mini-card stack-sm room-empty-card">
            <strong>没有找到匹配的聊天</strong>
            <p class="muted">可以换个关键词，或者切回“全部”查看所有任务房间。</p>
          </div>
        </div>
      </article>

      <article v-if="room" class="glass-panel stack-md message-chat-panel">
        <div class="panel-header">
          <div class="stack-sm">
            <div class="title-line">
              <span class="status-dot"></span>
              <div>
                <h3>{{ roomHeaderTitle }}</h3>
                <p class="muted">{{ roomHeaderSubtitle }}</p>
              </div>
            </div>
            <p class="muted">{{ room.focus }}</p>
          </div>

          <div class="stack-sm message-panel-meta">
            <span class="soft-pill">{{ roomParticipants.length }} 位协作成员</span>
          </div>
        </div>

        <div class="tag-row">
          <span v-for="item in roomParticipants" :key="item" class="soft-pill">{{ item }}</span>
        </div>

        <div class="message-thread-shell">
          <div class="message-feed-shell">
            <div ref="conversationFeedRef" class="conversation-feed conversation-feed-tall">
              <section v-if="taskConfirmation" class="message-task-confirmation stack-sm">
                <div class="panel-header">
                  <div class="stack-xs">
                    <span class="eyebrow">任务确认</span>
                    <h4>{{ taskConfirmationVersionText }}</h4>
                    <p class="muted">{{ taskConfirmationUpdatedText }}</p>
                  </div>
                  <div class="toolbar">
                    <span class="soft-pill">{{ taskConfirmationVersionText }}</span>
                    <span class="soft-pill" :class="taskConfirmationStatusClass(taskConfirmation.status)">
                      {{ taskConfirmation.status }}
                    </span>
                  </div>
                </div>

                <p class="muted">{{ taskConfirmation.summary }}</p>

                <div class="dashboard-preview-list">
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
                  <div v-if="roomTalentCalendarHeadline" class="dashboard-preview-item">
                    <div class="stack-xs">
                      <strong>人才档期</strong>
                      <p>{{ roomTalentCalendarHeadline }}</p>
                    </div>
                  </div>
                  <div v-if="taskConfirmation.changeRequest" class="dashboard-preview-item">
                    <div class="stack-xs">
                      <strong>最近修改意见</strong>
                      <p>{{ taskConfirmation.changeRequest }}</p>
                    </div>
                  </div>
                  <div v-if="taskConfirmationChangeReview?.summary" class="dashboard-preview-item">
                    <div class="stack-xs">
                      <strong>AI 修改建议</strong>
                      <p>{{ taskConfirmationChangeReview.summary }}</p>
                      <p v-if="taskConfirmationChangeReview.updateNote" class="muted">企业补充：{{ taskConfirmationChangeReview.updateNote }}</p>
                    </div>
                  </div>
                </div>

                <div v-if="taskConfirmationModificationHistoryPreview.length" class="stack-sm">
                  <strong>最近版本记录</strong>
                  <div class="task-confirmation-history">
                    <article
                      v-for="item in taskConfirmationModificationHistoryPreview"
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
                      <ul v-if="listOf(item.changes).length" class="dashboard-detail-list">
                        <li v-for="change in listOf(item.changes)" :key="change">{{ change }}</li>
                      </ul>
                    </article>
                  </div>
                </div>

                <div class="toolbar">
                  <button
                    v-if="roomTaskDetail"
                    class="button-secondary"
                    type="button"
                    @click="taskDetailModalOpen = true"
                  >
                    查看任务详情
                  </button>
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
              <h4>快捷回复</h4>
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

          <div class="toolbar">
            <button class="button-secondary" type="button" :disabled="isSendingMessage" @mousedown.prevent @click="openComposerFilePicker">添加附件</button>
            <button class="button-primary" type="button" :disabled="isSendingMessage" @mousedown.prevent @click="handleSend">{{ sendButtonLabel }}</button>
            <router-link class="button-secondary" :to="primaryRoute">{{ primaryLabel }}</router-link>
          </div>
        </div>
      </article>

      <article v-else class="glass-panel stack-md message-chat-panel message-chat-empty-panel">
        <div class="panel-header">
          <div class="stack-sm">
            <span class="eyebrow">聊天</span>
            <h3>还没有聊天房间</h3>
            <p class="muted">企业发布任务并选中人才后，新的协商房间会出现在左侧列表。现在可以先去发布任务，或者返回对应工作台继续处理。</p>
          </div>
        </div>

        <div class="dashboard-preview-list">
          <div class="dashboard-preview-item">
            <div class="stack-xs">
              <strong>企业端</strong>
              <p>先发布任务，再从推荐人才里选人，系统会自动创建协商房间。</p>
            </div>
          </div>
          <div class="dashboard-preview-item">
            <div class="stack-xs">
              <strong>人才端</strong>
              <p>被选中后，聊天列表和工作台都会同步出现待确认任务提醒。</p>
            </div>
          </div>
        </div>

        <div class="toolbar">
          <router-link class="button-primary" :to="primaryRoute">{{ primaryLabel }}</router-link>
        </div>
      </article>
    </section>

    <button
      v-if="room"
      type="button"
      class="chat-record-fab"
      :class="{ 'is-success': Boolean(recordSuccessNote) }"
      @click="recordModalOpen = true"
    >
      <span class="chat-record-fab-icon">纪要</span>
      <span class="chat-record-fab-copy">
        <strong>{{ communicationRecord?.status || '未生成' }}</strong>
        <small>{{ communicationRecord?.savedAt || '点击查看' }}</small>
      </span>
    </button>

    <div v-if="recordSuccessNote" class="chat-record-fab-toast">
      <span class="soft-pill">已完成</span>
      <p>{{ recordSuccessNote }}</p>
    </div>

    <div v-if="attachmentPreview" class="dashboard-detail-modal" @click.self="attachmentPreview = null">
      <article class="dashboard-detail-card stack-md message-attachment-preview-card">
        <div class="panel-header">
          <div class="stack-sm">
            <span class="eyebrow">附件预览</span>
            <h3>{{ attachmentPreview.name }}</h3>
            <p class="muted">{{ attachmentMetaText(attachmentPreview) }}</p>
          </div>
          <button class="button-secondary" type="button" @click="attachmentPreview = null">关闭</button>
        </div>

        <img
          v-if="attachmentPreview.kind === 'image' && attachmentPreview.previewUrl"
          :src="attachmentPreview.previewUrl"
          :alt="attachmentPreview.name"
          class="message-attachment-preview-image"
        />

        <video
          v-else-if="attachmentPreview.kind === 'video' && attachmentPreview.previewUrl"
          :src="attachmentPreview.previewUrl"
          class="message-attachment-preview-video"
          controls
        ></video>

        <div v-else class="message-attachment-preview-empty">
          <strong>{{ attachmentPreview.name }}</strong>
          <p class="muted">当前先提供附件记录与基础预览。视频和文档的在线预览会在正式上传服务接入后继续补齐。</p>
        </div>
      </article>
    </div>

    <div v-if="taskDetailModalOpen && roomTaskDetail" class="dashboard-detail-modal" @click.self="taskDetailModalOpen = false">
      <article class="dashboard-detail-card stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">{{ roomTaskDetail.company || '任务详情' }}</span>
            <h3>{{ roomTaskDetail.title }}</h3>
          </div>
          <button class="button-secondary" type="button" @click="taskDetailModalOpen = false">关闭</button>
        </div>

        <div class="tag-row">
          <span class="soft-pill">{{ roomTaskDetail.status || '待处理' }}</span>
          <span class="soft-pill">预算 {{ roomTaskDetail.budget || '未填写预算' }}</span>
          <span class="soft-pill">工期 {{ roomTaskDetail.period || '待确认' }}</span>
        </div>

        <div class="dashboard-detail-section">
          <h4>任务说明</h4>
          <p class="muted">{{ roomTaskDetail.brief || '待补充' }}</p>
        </div>

        <div class="dashboard-detail-dual">
          <div class="mini-card stack-sm">
            <h4>任务与工期</h4>
            <ul class="dashboard-detail-list">
              <li>当前确认工期：{{ taskConfirmationPeriodText }}</li>
              <li>协作安排：{{ taskConfirmationScheduleText }}</li>
              <li v-if="roomTalentCalendarHeadline">人才档期：{{ roomTalentCalendarHeadline }}</li>
            </ul>
          </div>
          <div class="mini-card stack-sm">
            <h4>技能标签</h4>
            <div class="tag-row">
              <span v-for="tag in roomTaskDetail.tags || []" :key="tag" class="soft-pill">{{ tag }}</span>
            </div>
          </div>
          <div class="mini-card stack-sm">
            <h4>核心交付件</h4>
            <div class="tag-row">
              <span v-for="item in roomTaskDetail.deliverables || []" :key="item" class="soft-pill">{{ item }}</span>
            </div>
          </div>
        </div>

        <div v-if="roomTalentCalendarItems.length" class="dashboard-detail-section">
          <h4>近期档期</h4>
          <div class="tag-row">
            <span v-for="item in roomTalentCalendarItems" :key="`${item.day}-${item.note}`" class="soft-pill">
              {{ item.day }} · {{ calendarStateLabel(item.state) }}
            </span>
          </div>
        </div>

        <div v-if="taskConfirmationChangeReview?.summary" class="dashboard-detail-section">
          <h4>AI 修改建议</h4>
          <div class="tag-row" v-if="taskConfirmationChangeReview.status || taskConfirmationChangeReview.recommendedPeriod">
            <span v-if="taskConfirmationChangeReview.status" class="soft-pill">{{ taskConfirmationChangeReview.status }}</span>
            <span v-if="taskConfirmationChangeReview.recommendedPeriod" class="soft-pill">建议工期 {{ taskConfirmationChangeReview.recommendedPeriod }}</span>
          </div>
          <p v-if="taskConfirmationChangeReview.requestedChange" class="muted">人才反馈：{{ taskConfirmationChangeReview.requestedChange }}</p>
          <p v-if="taskConfirmationChangeReview.updateNote" class="muted">企业补充：{{ taskConfirmationChangeReview.updateNote }}</p>
          <p class="muted">{{ taskConfirmationChangeReview.summary }}</p>
          <ul class="dashboard-detail-list" v-if="listOf(taskConfirmationChangeReview.suggestions).length">
            <li v-for="item in listOf(taskConfirmationChangeReview.suggestions)" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div v-if="roomTaskDetail.modules?.length" class="dashboard-detail-section">
          <h4>AI 拆解模块</h4>
          <ul class="dashboard-detail-list">
            <li v-for="module in roomTaskDetail.modules" :key="module.name || module">{{ module.name || module }}</li>
          </ul>
        </div>

        <div v-if="roomTaskDetail.recommendations?.length" class="dashboard-detail-section">
          <h4>执行建议</h4>
          <ul class="dashboard-detail-list">
            <li v-for="item in roomTaskDetail.recommendations" :key="item">{{ item }}</li>
          </ul>
        </div>
      </article>
    </div>

    <div v-if="recordModalOpen && room" class="dashboard-detail-modal" @click.self="recordModalOpen = false">
      <article class="dashboard-detail-card stack-md chat-record-modal-card">
        <div class="panel-header">
          <div class="stack-sm">
            <span class="eyebrow">AI 沟通纪要</span>
            <h3>{{ communicationRecord?.title || '本轮沟通纪要' }}</h3>
            <p class="muted">{{ communicationRecord?.summary || communicationRecordSummary }}</p>
          </div>

          <div class="toolbar">
            <span class="soft-pill">{{ communicationRecord?.status || '未生成' }}</span>
            <span class="soft-pill">{{ communicationRecord?.savedAt || room?.lastTime || '待生成' }}</span>
            <button class="button-primary" type="button" :disabled="isGeneratingRecord || !activeRoomKey" @click="recordConfirmOpen = true">
              {{ isGeneratingRecord ? 'AI 正在整理纪要...' : generateRecordButtonLabel }}
            </button>
            <button class="button-secondary" type="button" @click="recordModalOpen = false">关闭</button>
          </div>
        </div>

        <p class="muted">{{ communicationRecord?.recordNote || generateRecordHint }}</p>

        <section v-if="!communicationRecord" class="dashboard-detail-section stack-sm chat-record-empty-state">
          <h4>当前还没有纪要</h4>
          <p class="muted">
            建议在这一轮沟通收束后，再点击“{{ generateRecordButtonLabel }}”，系统会根据当前聊天内容整理结论、待办和沟通摘要。
          </p>
        </section>

        <section v-if="communicationRecord?.keyPoints?.length" class="dashboard-detail-section stack-sm">
          <h4>聊天摘要</h4>
          <div v-for="item in communicationRecord.keyPoints" :key="item" class="dashboard-preview-item">
            <p class="muted">{{ item }}</p>
          </div>
        </section>

        <section v-if="communicationRecord?.decisions?.length" class="dashboard-detail-section stack-sm">
          <h4>已记录结论</h4>
          <div v-for="item in communicationRecord.decisions" :key="item" class="dashboard-preview-item">
            <p class="muted">{{ item }}</p>
          </div>
        </section>

        <section v-if="communicationRecord?.openItems?.length" class="dashboard-detail-section stack-sm">
          <h4>待继续确认</h4>
          <div v-for="item in communicationRecord.openItems" :key="item" class="dashboard-preview-item">
            <p class="muted">{{ item }}</p>
          </div>
        </section>
      </article>
    </div>

    <div v-if="recordConfirmOpen" class="dashboard-detail-modal" @click.self="recordConfirmOpen = false">
      <article class="dashboard-detail-card stack-md chat-record-confirm-card">
        <div class="stack-sm">
          <span class="eyebrow">结束本轮沟通</span>
          <h3>确认现在生成 AI 沟通纪要？</h3>
          <p class="muted">
            聊天记录会继续保留。这里的动作只是在当前聊天基础上，整理出这一轮的结论、待办和沟通摘要。
          </p>
        </div>

        <div class="dashboard-preview-list">
          <div class="dashboard-preview-item">
            <div class="stack-xs">
              <strong>当前房间</strong>
              <p>{{ room?.title || '当前聊天房间' }}</p>
            </div>
          </div>
          <div class="dashboard-preview-item">
            <div class="stack-xs">
              <strong>最近一条消息</strong>
              <p>{{ room?.lastMessage || '暂无最新消息' }}</p>
            </div>
          </div>
          <div class="dashboard-preview-item">
            <div class="stack-xs">
              <strong>当前纪要状态</strong>
              <p>{{ communicationRecord?.status || '未生成' }}</p>
            </div>
          </div>
        </div>

        <div class="toolbar chat-record-confirm-toolbar">
          <button class="button-secondary" type="button" :disabled="isGeneratingRecord" @click="recordConfirmOpen = false">
            再聊一会
          </button>
          <button class="button-primary" type="button" :disabled="isGeneratingRecord || !activeRoomKey" @click="handleGenerateRecord">
            {{ isGeneratingRecord ? 'AI 正在整理纪要...' : '确认并生成纪要' }}
          </button>
        </div>
      </article>
    </div>

    <div v-if="taskActionModalOpen && taskConfirmation" class="dashboard-detail-modal" @click.self="closeTaskActionModal">
      <article class="dashboard-detail-card stack-md chat-task-action-card">
        <div class="panel-header">
          <div class="stack-sm">
            <span class="eyebrow">任务确认</span>
            <h3>{{ taskActionTitle }}</h3>
            <p class="muted">{{ taskConfirmation.summary }}</p>
          </div>
          <button class="button-secondary" type="button" @click="closeTaskActionModal">关闭</button>
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
            <ul class="dashboard-detail-list" v-if="listOf(taskConfirmationChangeReview.suggestions).length">
              <li v-for="item in listOf(taskConfirmationChangeReview.suggestions)" :key="item">{{ item }}</li>
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
              <ul v-if="listOf(item.changes).length" class="dashboard-detail-list">
                <li v-for="change in listOf(item.changes)" :key="change">{{ change }}</li>
              </ul>
            </article>
          </div>
        </section>

        <div class="toolbar chat-record-confirm-toolbar">
          <button class="button-secondary" type="button" :disabled="isSubmittingTaskAction" @click="closeTaskActionModal">取消</button>
          <button class="button-primary" type="button" :disabled="isSubmittingTaskAction" @click="submitTaskAction">
            {{ isSubmittingTaskAction ? '提交中...' : taskActionPrimaryLabel }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getTaskRoom,
  getTaskRooms,
  getTencentImRuntimeConfig,
  initiateTaskRoom,
  refreshTaskRoomCommunicationRecord,
  sendTaskRoomMessage,
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
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const MOBILE_CHAT_BREAKPOINT = 820;
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
let unsubscribeMessages = null;
let recordSuccessTimer = null;
let liveRefreshTimer = null;
const FALLBACK_REFRESH_MS = 5000;
const IM_CONNECTED_REFRESH_MS = 15000;

const primaryRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.market : roleRouteMap.enterprise.publish
);
const primaryLabel = computed(() => (audience.value === 'talent' ? '去看任务广场' : '去发布任务'));
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
const filteredRooms = computed(() => {
  const keyword = roomSearch.value.trim().toLowerCase();
  return rooms.value
    .map((item) => enrichRoomItem(item))
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
const taskConfirmationModificationHistoryPreview = computed(() =>
  taskConfirmationModificationHistory.value.slice(-2)
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
const taskConfirmationUpdatedText = computed(() => {
  if (!taskConfirmation.value) {
    return '';
  }
  return `${taskConfirmation.value.updatedBy || '系统'} · ${taskConfirmation.value.updatedAt || '刚刚'}`;
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

function isSystemMessage(message) {
  return String(message?.type || '').toUpperCase() === 'SYSTEM';
}

function isLegacyAutoSystemMessage(message) {
  if (!isSystemMessage(message)) {
    return false;
  }
  const text = String(message?.text || '');
  return (
    text.startsWith('消息已写入任务房间') ||
    text.includes('建议下一轮直接回传首页首屏或信息层级稿') ||
    text.includes('已记录报价或支付相关讨论') ||
    text.includes('已同步到联调重点')
  );
}

function isSelfMessage(message) {
  return !isSystemMessage(message) && message?.author === currentActor.value;
}

function messageRowClass(message) {
  return {
    'is-system': isSystemMessage(message),
    'is-self': isSelfMessage(message),
    'is-other': !isSystemMessage(message) && !isSelfMessage(message)
  };
}

function messageAvatarText(author) {
  const normalized = String(author || '').trim();
  if (!normalized) {
    return '?';
  }
  return normalized.slice(0, 1);
}

function messageDisplayAuthor(message) {
  return isSelfMessage(message) ? '我' : String(message?.author || '协作成员');
}

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function calendarStateLabel(state) {
  if (state === 'open') {
    return '可接单';
  }
  if (state === 'busy') {
    return '执行中';
  }
  if (state === 'closed') {
    return '暂停接单';
  }
  return '待同步';
}

function summarizeTaskConfirmationHistory(history) {
  const items = Array.isArray(history) ? history : [];
  if (!items.length) {
    return [];
  }

  const versionMap = new Map();

  items.forEach((item, index) => {
    const version = Number(item?.version || 1);
    const existing = versionMap.get(version);
    const changes = Array.isArray(item?.changes) ? item.changes.filter(Boolean) : [];
    const aiSuggestion = item?.aiSuggestion && typeof item.aiSuggestion === 'object' ? item.aiSuggestion : null;

    if (!existing) {
      versionMap.set(version, {
        id: item?.id || `version-${version}-${index}`,
        version,
        action: item?.action || `第 ${version} 版`,
        actor: item?.actor || '系统',
        status: item?.status || '待确认',
        note: item?.note || '',
        summary: item?.summary || '',
        scopeNote: item?.scopeNote || '',
        period: item?.period || '',
        scheduleNote: item?.scheduleNote || '',
        budget: item?.budget || '',
        time: item?.time || '',
        timestamp: Number(item?.timestamp || 0),
        changes: [...changes],
        aiSuggestion
      });
      return;
    }

    if (Number(item?.timestamp || 0) >= Number(existing.timestamp || 0)) {
      existing.id = item?.id || existing.id;
      existing.action = item?.action || existing.action;
      existing.actor = item?.actor || existing.actor;
      existing.status = item?.status || existing.status;
      existing.note = item?.note || existing.note;
      existing.summary = item?.summary || existing.summary;
      existing.scopeNote = item?.scopeNote || existing.scopeNote;
      existing.period = item?.period || existing.period;
      existing.scheduleNote = item?.scheduleNote || existing.scheduleNote;
      existing.budget = item?.budget || existing.budget;
      existing.time = item?.time || existing.time;
      existing.timestamp = Number(item?.timestamp || existing.timestamp || 0);
      if (aiSuggestion) {
        existing.aiSuggestion = aiSuggestion;
      }
    }

    changes.forEach((change) => {
      if (!existing.changes.includes(change)) {
        existing.changes.push(change);
      }
    });
  });

  return Array.from(versionMap.values()).sort((left, right) => left.version - right.version);
}

function inferAttachmentKind(type, name) {
  const normalizedType = String(type || '').toLowerCase();
  const normalizedName = String(name || '').toLowerCase();
  if (normalizedType.startsWith('image/')) {
    return 'image';
  }
  if (normalizedType.startsWith('video/')) {
    return 'video';
  }
  if (normalizedName.endsWith('.zip') || normalizedName.endsWith('.rar') || normalizedName.endsWith('.7z')) {
    return 'archive';
  }
  if (
    normalizedName.endsWith('.js') ||
    normalizedName.endsWith('.ts') ||
    normalizedName.endsWith('.java') ||
    normalizedName.endsWith('.py') ||
    normalizedName.endsWith('.vue') ||
    normalizedName.endsWith('.sql')
  ) {
    return 'code';
  }
  if (
    normalizedName.endsWith('.pdf') ||
    normalizedName.endsWith('.doc') ||
    normalizedName.endsWith('.docx') ||
    normalizedName.endsWith('.md') ||
    normalizedName.endsWith('.txt') ||
    normalizedName.endsWith('.fig') ||
    normalizedName.endsWith('.xls') ||
    normalizedName.endsWith('.xlsx') ||
    normalizedName.endsWith('.ppt') ||
    normalizedName.endsWith('.pptx')
  ) {
    return 'document';
  }
  return 'other';
}

function formatAttachmentSize(size) {
  const value = Number(size || 0);
  if (!value) {
    return '';
  }
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeAttachmentValue(attachment, index = 0) {
  if (!attachment) {
    return null;
  }

  if (typeof attachment === 'string') {
    return {
      id: `attachment-${index}-${attachment}`,
      name: attachment,
      type: 'application/octet-stream',
      kind: inferAttachmentKind('', attachment),
      size: 0,
      previewUrl: ''
    };
  }

  const name = String(attachment.name || '').trim();
  if (!name) {
    return null;
  }

  return {
    id: String(attachment.id || `attachment-${index}-${name}`),
    name,
    type: String(attachment.type || 'application/octet-stream'),
    kind: String(attachment.kind || inferAttachmentKind(attachment.type, name)),
    size: Number(attachment.size || 0),
    previewUrl: String(attachment.previewUrl || '')
  };
}

function normalizedMessageAttachments(message) {
  if (!Array.isArray(message?.attachments)) {
    return [];
  }
  return message.attachments
    .map((attachment, index) => normalizeAttachmentValue(attachment, index))
    .filter(Boolean);
}

function attachmentKindLabel(kind) {
  if (kind === 'image') {
    return '图片';
  }
  if (kind === 'video') {
    return '视频';
  }
  if (kind === 'archive') {
    return '压缩包';
  }
  if (kind === 'code') {
    return '代码';
  }
  if (kind === 'document') {
    return '文档';
  }
  return '文件';
}

function attachmentMetaText(attachment) {
  const normalized = normalizeAttachmentValue(attachment);
  if (!normalized) {
    return '文件';
  }
  const sizeText = formatAttachmentSize(normalized.size);
  return sizeText ? `${attachmentKindLabel(normalized.kind)} · ${sizeText}` : attachmentKindLabel(normalized.kind);
}

function openAttachmentPreview(attachment) {
  const normalized = normalizeAttachmentValue(attachment);
  if (!normalized) {
    return;
  }
  attachmentPreview.value = normalized;
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
    file
  };

  if (kind === 'image') {
    attachment.previewUrl = await readFileAsDataUrl(file);
  }

  return attachment;
}

async function handleComposerFilesChange(event) {
  const files = Array.from(event?.target?.files || []);
  if (!files.length) {
    return;
  }

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

function composerAttachmentPayload() {
  return composerAttachments.value.map((attachment) => ({
    id: attachment.id,
    name: attachment.name,
    type: attachment.type,
    kind: attachment.kind,
    size: attachment.size,
    previewUrl: attachment.previewUrl
  }));
}

function persistMessagePayloads(text, attachments) {
  const payloads = [];
  if (text) {
    payloads.push({
      author: draftAuthor.value,
      type: draftAuthor.value === 'AI 系统消息' ? 'SYSTEM' : 'TEXT',
      text,
      attachments: []
    });
  }

  attachments.forEach((attachment) => {
    payloads.push({
      author: draftAuthor.value,
      type: draftAuthor.value === 'AI 系统消息' ? 'SYSTEM' : 'TEXT',
      text: '',
      attachments: [
        {
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          kind: attachment.kind,
          size: attachment.size,
          previewUrl: attachment.previewUrl
        }
      ]
    });
  });

  return payloads;
}

async function persistComposerMessages(text, attachments) {
  const payloads = persistMessagePayloads(text, attachments);
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

function enrichRoomItem(item) {
  if (item.roomKey === activeRoomKey.value && communicationRecord.value) {
    return {
      ...item,
      communicationStatus: communicationRecord.value.status || item.communicationStatus || '已生成',
      communicationSavedAt: communicationRecord.value.savedAt || item.communicationSavedAt || ''
    };
  }
  return item;
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

function roomSortKey(item) {
  const numericTimestamp = Number(item.lastTimestamp || 0);
  if (Number.isFinite(numericTimestamp) && numericTimestamp > 0) {
    return numericTimestamp;
  }
  return parseRoomTime(item.lastTime);
}

function parseRoomTime(value) {
  const text = String(value || '');
  const match = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return 0;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

function roomFilterCount(filter) {
  return rooms.value
    .map((item) => enrichRoomItem(item))
    .filter((item) => matchesRoomFilter(item, filter))
    .length;
}

function taskConfirmationStatusClass(status) {
  if (status === '待人才确认') {
    return 'is-warning';
  }
  if (status === '待企业修改') {
    return 'is-danger';
  }
  if (status === '已修改') {
    return 'is-info';
  }
  if (status === '已确认') {
    return 'is-success';
  }
  return 'is-info';
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
  if (route.query.room !== roomKey) {
    router.replace({
      query: {
        ...route.query,
        room: roomKey,
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
  const matchingRooms = findRoomsForTargetCounterpart();
  const hasMultipleMatches = matchingRooms.length > 1;
  return {
    roomKey: '',
    taskId: '',
    title: targetCounterpartName.value ? `与 ${targetCounterpartName.value} 的聊天` : '还没有聊天',
    taskTitle: '',
    counterpartName: targetCounterpartName.value,
    counterpartPlatformUserId: targetCounterpartPlatformUserId.value,
    stage: '等待任务开始',
    focus: targetCounterpartName.value
      ? hasMultipleMatches
        ? `当前与 ${targetCounterpartName.value} 已有多个任务房间，请先从上方会话列表选择要继续沟通的任务。`
        : `当前还没有与 ${targetCounterpartName.value} 建立聊天。你可以直接发送第一条消息，系统会自动建立沟通房间。`
      : '当企业发布任务并选中人才后，新的协商房间会出现在这里。',
    taskDetail: null,
    members: [],
    participants: targetCounterpartName.value ? [targetCounterpartName.value] : [],
    quickReplies: [],
    quickRepliesByAudience: {
      enterprise: [],
      talent: []
    },
    taskTags: [],
    messages: []
  };
}

function findRoomsForTargetCounterpart(items = rooms.value) {
  if (!targetCounterpartPlatformUserId.value) {
    return [];
  }
  return items.filter((item) => item.counterpartPlatformUserId === targetCounterpartPlatformUserId.value);
}

function findRoomForTargetCounterpart(items = rooms.value) {
  const matches = findRoomsForTargetCounterpart(items);
  if (matches.length !== 1) {
    return null;
  }
  return matches[0];
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
  const members = Array.isArray(roomData?.members) ? roomData.members : [];
  const currentAudience = audience.value === 'talent' ? 'talent' : 'enterprise';
  const counterpart = members.find((item) => item?.audience && item.audience !== currentAudience && item.audience !== 'system');
  return counterpart?.displayName || '';
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
    rooms.value = [enrichRoomItem(roomItem), ...rooms.value.filter((item) => item.roomKey !== nextRoomKey)];
  }
  await selectRoom(nextRoomKey);
  return nextRoomKey;
}

async function handleSend() {
  const normalizedText = draftMessage.value.trim();
  const attachments = composerAttachmentPayload();
  if (!normalizedText && !attachments.length) {
    return;
  }

  const shouldStickToBottom = isConversationNearBottom();
  let nextRoom;
  isSendingMessage.value = true;
  try {
    const ensuredRoomKey = await ensureActiveRoomForSend();
    if (!ensuredRoomKey) {
      return;
    }

    if (imConfig.value?.enabled) {
      try {
        if (normalizedText) {
          await sendTencentGroupText(imConfig.value, normalizedText);
        }

        for (const attachment of composerAttachments.value) {
          await sendTencentGroupAttachment(imConfig.value, attachment);
        }

        const realtimeMessages = await getTencentGroupMessages(imConfig.value);
        const persistedRoom = await persistComposerMessages(normalizedText, composerAttachments.value);
        nextRoom = {
          ...persistedRoom,
          provider: 'Tencent IM',
          messages: realtimeMessages.length ? realtimeMessages : persistedRoom.messages,
          lastTime: '刚刚',
          lastMessage: persistedRoom.lastMessage,
          unreadCount: '0'
        };
      } catch (error) {
        nextRoom = await persistComposerMessages(normalizedText, composerAttachments.value);
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
      nextRoom = await persistComposerMessages(normalizedText, composerAttachments.value);
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
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
    return false;
  }
  return !isSendingMessage.value && !isGeneratingRecord.value && !isSubmittingTaskAction.value;
}

async function refreshMessageSurface() {
  if (!shouldRunLiveRefresh()) {
    return;
  }

  const payload = await getTaskRooms();
  const nextRooms = (payload.items || []).map((item) => enrichRoomItem(item));
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

  const needsDetailRefresh =
    !previousActiveSummary ||
    previousActiveSummary.lastTimestamp !== activeSummary.lastTimestamp ||
    previousActiveSummary.stage !== activeSummary.stage ||
    previousActiveSummary.communicationSavedAt !== activeSummary.communicationSavedAt ||
    previousActiveSummary.lastMessage !== activeSummary.lastMessage;

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

function nextRefreshInterval() {
  return imConfig.value?.enabled ? IM_CONNECTED_REFRESH_MS : FALLBACK_REFRESH_MS;
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
  rooms.value = (payload.items || []).map((item) => enrichRoomItem(item));
  roomsLoaded.value = true;

  const initialRoomKey = route.query.room;
  if (initialRoomKey) {
    await selectRoom(initialRoomKey);
  } else {
    const targetedRoom = findRoomForTargetCounterpart(rooms.value);
    if (targetedRoom?.roomKey) {
      await selectRoom(targetedRoom.roomKey);
    } else if (targetCounterpartPlatformUserId.value) {
      showTargetedEmptyRoom();
    } else if (rooms.value[0]?.roomKey) {
      await selectRoom(rooms.value[0].roomKey);
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
  () => [route.query.room, route.query.counterpartPlatformUserId, route.query.counterpartName],
  async ([nextRoomKey, nextCounterpartPlatformUserId]) => {
    const normalizedRoomKey = typeof nextRoomKey === 'string' ? nextRoomKey : '';

    if (normalizedRoomKey) {
      if (normalizedRoomKey !== activeRoomKey.value || !room.value) {
        await selectRoom(normalizedRoomKey);
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
          await selectRoom(targetedRoom.roomKey);
        }
      } else {
        showTargetedEmptyRoom();
      }
      return;
    }

    if (!normalizedRoomKey) {
      if (rooms.value.length && !room.value) {
        await selectRoom(rooms.value[0].roomKey);
      }
      return;
    }
  }
);

async function loadTencentRoom(roomKey, baseRoom) {
  const runtime = await getTencentImRuntimeConfig(audience.value, roomKey);
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
    room.value = {
      ...baseRoom,
      provider: 'Tencent IM',
      taskRoom: baseRoom.taskRoom || runtime.taskRoom,
      members: baseRoom.members || runtime.members || [],
      messages: realtimeMessages.length ? realtimeMessages : baseRoom.messages
    };
  } catch (error) {
    applyMockRoom(baseRoom, runtime, 'CONNECT_FAILED', [
      '腾讯 IM 连接失败，当前继续展示已同步的聊天记录。',
      error?.message ? `失败原因：${error.message}` : '失败原因：请检查用户签名、群组 ID 和腾讯 IM 控制台配置。'
    ]);
  }
}

function mergeMessages(currentMessages = [], nextMessages = []) {
  const bucket = new Map();
  [...currentMessages, ...nextMessages].forEach((item) => {
    const key = item.id || `${item.author}-${item.time}-${item.text}`;
    bucket.set(key, item);
  });
  return Array.from(bucket.values());
}
</script>
