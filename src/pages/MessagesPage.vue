<template>
  <section class="workroom-page stack-xl">
    <ContractShellHeader
      eyebrow="消息"
      :title="heroTitle"
      :lead="heroSubtitle"
      :support-copy="shellSupportCopy"
      :pills="shellPills"
      :tabs="shellTabs"
    />

    <section class="workroom-shell">
      <main class="panel workroom-thread stack-md">
        <template v-if="activeRoom">
          <div v-if="!hasShellContext" class="section-header">
            <div>
              <p class="eyebrow">当前会话</p>
              <h2>当前会话</h2>
              <p class="muted">{{ activeRoomHeader }}</p>
            </div>
          </div>
          <div class="mini-chip-row workroom-thread__chips">
            <span class="mini-chip">{{ currentActorLabel }}</span>
            <span class="mini-chip">{{ currentRoomStageLabel }}</span>
            <span v-if="!hasShellContext && activeRoom.taskId" class="mini-chip">合同 {{ activeRoom.taskId }}</span>
            <span v-if="!hasShellContext && currentMilestoneLabel" class="mini-chip">{{ currentMilestoneLabel }}</span>
          </div>

          <div class="message-feed">
            <article v-if="!visible消息.length && !loadingRoomDetail" class="empty-state">
              <strong>当前合同还没有消息</strong>
              <p>先从范围说明、文件上下文、合同条款或下一步决定开始，让沟通继续挂在这份合同下。</p>
            </article>

            <article v-if="loadingRoomDetail && !visible消息.length" class="empty-state">
              <strong>正在加载当前会话...</strong>
              <p>消息、里程碑和文件正在同步中。</p>
            </article>

            <article
              v-for="message in visible消息"
              :key="message.key"
              class="message-row"
              :class="{ 'is-self': message.isSelf, 'is-system': message.isSystem }"
            >
              <template v-if="message.isSystem">
                <span class="soft-pill">系统</span>
                <p>{{ message.text }}</p>
                <small>{{ message.time }}</small>
              </template>
              <template v-else>
                <div class="message-bubble-wrap">
                  <div class="message-meta">
                    <strong>{{ message.author }}</strong>
                    <span>{{ message.time }}</span>
                  </div>
                  <div class="message-bubble">
                    <p v-if="message.text">{{ message.text }}</p>
                    <p v-else-if="message.attachments.length" class="muted message-attachment-note">发送了 {{ message.attachments.length }} 个附件</p>
                    <div v-if="message.attachments.length" class="message-attachments">
                      <button
                        v-for="attachment in message.attachments"
                        :key="attachment.key"
                        type="button"
                        class="attachment-pill"
                        @click.stop.prevent="handleAttachmentOpen(attachment, $event)"
                      >
                        {{ attachment.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </article>
          </div>

          <form class="message-composer" @submit.prevent="handleSendMessage">
            <div class="message-composer__header">
              <strong>下一条消息</strong>
              <p class="muted">
                把范围说明、文件更新、里程碑进展和下一步决定继续挂在同一条会话里。
              </p>
            </div>
            <p v-if="assistantDraftSeed" class="muted message-composer__assistant-note">
              草稿已经带入当前会话，确认后再发送。
            </p>
            <textarea
              v-model.trim="composer"
              rows="4"
              class="text-input message-composer__input"
              placeholder="补充说明、文件备注、交付更新或下一步安排"
            />
            <div class="message-composer__attachments">
              <label class="button-secondary button-secondary--small message-composer__attach-button">
                <input
                  :key="messageFilePickerKey"
                  class="message-composer__file-input"
                  type="file"
                  multiple
                  @change="handleMessageFiles"
                />
                添加文件
              </label>
              <p class="muted">文件上传后会继续挂在这条合同会话里。</p>
              <div v-if="messageFiles.length" class="file-list">
                <span
                  v-for="(file, index) in messageFiles"
                  :key="`${file.name}-${file.size}-${file.lastModified || index}`"
                  class="file-pill"
                >
                  {{ file.name }}
                  <button type="button" class="file-pill__remove" @click="removeMessageFile(index)">移除</button>
                </span>
              </div>
            </div>
            <div class="message-composer__actions">
              <div class="mini-chip-row">
                <span class="mini-chip">{{ currentActorLabel }}</span>
                <span v-if="!hasShellContext && activeRoom.taskId" class="mini-chip">合同 {{ activeRoom.taskId }}</span>
                <span v-if="!hasShellContext && currentMilestoneLabel" class="mini-chip">{{ currentMilestoneLabel }}</span>
                <span v-if="messageFiles.length" class="mini-chip">已添加 {{ messageFiles.length }} 个文件</span>
              </div>
              <div class="toolbar">
                <button class="button-primary" type="submit" :disabled="sendingMessage || (!composer.trim() && !messageFiles.length)">
                  {{ sendingMessage ? '发送中…' : '发送消息' }}
                </button>
              </div>
            </div>
          </form>
        </template>

        <article v-else class="empty-state workroom-thread-empty">
          <strong>先选择一条合同会话</strong>
          <p>选择一条合同会话，把消息、文件、记录和下一步都继续挂在同一份合同下。</p>
          <div v-if="!hasShellContext" class="empty-state__actions">
            <router-link class="button-link" :to="workspaceRoute">打开合同</router-link>
          </div>
        </article>
      </main>

      <aside class="panel workroom-sidebar stack-md">
        <div class="section-header section-header--compact">
          <div>
            <p class="eyebrow">{{ activeRoom ? '上下文' : '合同' }}</p>
            <h2>{{ activeRoom ? (hasShellContext ? '文件与下一步' : '合同上下文') : '选择合同' }}</h2>
          </div>
          <div class="section-head__actions">
            <span class="soft-pill">{{ sidebarRooms.length }}</span>
            <button
              v-if="activeRoom && sidebarRooms.length"
              type="button"
              class="button-secondary button-secondary--small"
              @click="toggleRoomSwitcher"
            >
              {{ showRoomSwitcher ? '收起其他合同' : '切换合同' }}
            </button>
          </div>
        </div>

        <p class="muted workroom-sidebar__hint">
          先把当前合同放在手边，文件、里程碑和下一步都会继续挂在这里。
        </p>

        <div v-if="loadingRooms && !rooms.length" class="info-banner stack-sm">
          <strong>正在加载消息…</strong>
          <p>正在同步当前会话、里程碑和文件。</p>
        </div>

        <div v-if="showRoomSwitcherPanel && sidebarRooms.length" class="section-header section-header--compact workroom-sidebar__subhead">
          <div>
            <p class="eyebrow">{{ activeRoom ? '其他合同' : '合同' }}</p>
            <h2>{{ activeRoom ? '切换合同' : '合同列表' }}</h2>
          </div>
          <span class="soft-pill">{{ sidebarRooms.length }}</span>
        </div>

        <input
          v-if="showRoomSwitcherPanel && (sidebarRooms.length > 4 || roomSearch)"
          v-model.trim="roomSearch"
          class="text-input"
          type="search"
          placeholder="搜索合同、联系人或消息内容"
        />

        <div v-if="showRoomSwitcherPanel" class="room-list">
          <button
            v-for="item in sidebarRooms"
            :key="item.roomKey"
            type="button"
            class="room-card"
            :class="{ 'is-active': item.roomKey === activeRoomKey }"
            @click="selectRoom(item.roomKey)"
          >
            <div class="room-card__topline">
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.counterpart }}</p>
              </div>
              <span class="status-chip">{{ item.stage }}</span>
            </div>
            <p class="room-card__summary">{{ item.summary }}</p>
            <div class="room-card__meta">
              <span>{{ item.time }}</span>
              <span v-if="item.taskId">合同 {{ item.taskId }}</span>
            </div>
          </button>
        </div>

        <p v-else-if="activeRoom && sidebarRooms.length" class="muted workroom-sidebar__compact-note">
          还有 {{ sidebarRooms.length }} 份合同已收起，先保持当前会话在焦点里。
        </p>

        <div v-if="showRoomSwitcherPanel && !sidebarRooms.length && !loadingRooms" class="empty-state is-compact">
          <strong>这里还没有其他合同会话</strong>
          <p>{{ noRoomHint }}</p>
          <div v-if="!hasShellContext" class="empty-state__actions">
            <router-link class="button-link" :to="workspaceRoute">打开合同</router-link>
          </div>
        </div>

        <div v-if="!hasShellContext" class="section-header section-header--compact">
          <div>
            <p class="eyebrow">合同上下文</p>
            <h2>文件与下一步</h2>
          </div>
        </div>

        <template v-if="activeRoom">
          <article v-if="currentMilestoneLabel && !hasShellContext" class="context-card">
            <span class="eyebrow">里程碑</span>
            <strong>{{ currentMilestoneLabel }}</strong>
            <p>只要这份合同还在进行中，消息、验收、记录和助手都会继续挂在这条里程碑下。</p>
          </article>

          <article class="context-card">
            <span class="eyebrow">文件</span>
            <template v-if="roomFilesAndAttachments.length">
              <div class="asset-list">
                <button
                  v-for="asset in roomFilesAndAttachments"
                  :key="asset.key"
                  type="button"
                  class="asset-row"
                  @click.stop.prevent="handleAttachmentOpen(asset, $event)"
                >
                  <strong>{{ asset.name }}</strong>
                  <span>{{ asset.source }}</span>
                </button>
              </div>
            </template>
            <template v-else>
              <strong>还没有文件</strong>
              <p>文件挂到这份合同后，会继续显示在这里。</p>
            </template>
          </article>

      <article class="context-card">
            <span class="eyebrow">下一步</span>
            <template v-if="pendingActions.length">
              <ul class="simple-list">
                <li v-for="item in pendingActions" :key="item">{{ item }}</li>
              </ul>
            </template>
            <template v-else>
              <strong>下一步还没同步过来</strong>
            <p>先在这里继续推进合同，下一步的验收、里程碑或结算会回挂到这条会话里。</p>
          </template>
        </article>

        </template>

        <article v-else class="empty-state is-compact">
          <strong>这里会把合同上下文放在手边</strong>
          <p>先选择一条合同会话，把文件、记录和下一步继续放在这里。</p>
        </article>
      </aside>
    </section>

    <ChatAttachmentPreviewModal
      :open="Boolean(previewAttachment)"
      :attachment="previewAttachment"
      :attachment-meta-text="attachmentMetaText"
      :attachment-download-href="attachmentDownloadHref"
      @close="previewAttachment = null"
    />
    <ActionErrorDialog :message="errorMessage" title="当前消息暂时不可用" eyebrow="消息" />
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ActionErrorDialog from '../components/ActionErrorDialog.vue'
import ChatAttachmentPreviewModal from '../components/chat/ChatAttachmentPreviewModal.vue'
import ContractShellHeader from '../components/ContractShellHeader.vue'
import { getStoredAuthUser, getTaskRoom, getTaskRooms, initiateTaskRoom, sendTaskRoomMessage, uploadTaskAttachmentAsset } from '../services/api'
import { consumeAssistantDraftHandoff, peekAssistantDraftHandoff } from '../utils/assistantDraftHandoff'
import { attachmentMetaText, composerAttachmentPayload, inferAttachmentKind, isSelfMessage as baseIsSelfMessage } from './messageDetailHelpers'

const route = useRoute()
const router = useRouter()
const audience = computed(() => (route.meta?.audience === 'talent' ? 'talent' : 'enterprise'))
const authUser = getStoredAuthUser()

const roomPayload = ref(null)
const roomDetail = ref(null)
const activeRoomKey = ref('')
const roomSearch = ref('')
const showRoomSwitcher = ref(false)
const composer = ref('')
const messageFiles = ref([])
const messageFilePickerKey = ref(0)
const sendingMessage = ref(false)
const loadingRooms = ref(false)
const loadingRoomDetail = ref(false)
const errorMessage = ref('')
const previewAttachment = ref(null)

const roomSummary = computed(() => roomPayload.value?.summary || {})
const currentTaskId = computed(() => String(activeRoom.value?.taskId || route.query.taskId || ''))
const currentRoomQuery = computed(() => String(activeRoom.value?.roomKey || activeRoomKey.value || route.query.roomKey || route.query.room || ''))
const hasShellContext = computed(() => Boolean(activeRoom.value?.taskId || currentTaskId.value))
const currentRecordId = computed(() => String(route.query.recordId || '').trim())
const originSourceValue = computed(() => String(route.query.originSource || route.query.source || 'messages').trim())
const originTaskIdValue = computed(() => String(route.query.originTaskId || route.query.taskId || '').trim())
const originRecordIdValue = computed(() => String(route.query.originRecordId || route.query.recordId || '').trim())
const originRoomValue = computed(() => String(route.query.originRoom || route.query.roomKey || route.query.room || '').trim())
const routeNodeId = computed(() => String(route.query.node || '').trim())
const routeContextMilestone = computed(() => String(route.query.contextMilestone || '').trim())
const assistantDraftToken = computed(() => String(route.query.assistantDraftToken || '').trim())
const assistantDraftSeed = computed(() => {
  const raw = route.query.assistantDraft
  const inlineDraft = Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim()
  if (inlineDraft) return inlineDraft
  return assistantDraftToken.value ? String(peekAssistantDraftHandoff(assistantDraftToken.value)?.text || '').trim() : ''
})
const assistantDraftApplyKey = ref('')
const contextQuery = computed(() => ({
  ...(currentTaskId.value ? { taskId: currentTaskId.value } : {}),
  ...(currentRoomQuery.value ? { room: currentRoomQuery.value, roomKey: currentRoomQuery.value } : {}),
  ...(routeNodeId.value ? { node: routeNodeId.value } : {}),
  ...(currentRecordId.value ? { recordId: currentRecordId.value } : {}),
  ...(activeRoom.value?.title ? { contextTitle: activeRoom.value.title } : {}),
  ...(activeRoom.value?.stage ? { contextStage: activeRoom.value.stage } : {}),
  ...(activeRoom.value?.counterpart ? { contextPartner: activeRoom.value.counterpart } : {}),
  ...(routeContextMilestone.value ? { contextMilestone: routeContextMilestone.value } : {}),
  source: 'messages',
  surface: 'messages',
  originSource: originSourceValue.value || 'messages',
  originTaskId: originTaskIdValue.value || currentTaskId.value || '',
  ...(originRecordIdValue.value ? { originRecordId: originRecordIdValue.value } : {}),
  ...(originRoomValue.value ? { originRoom: originRoomValue.value } : {}),
}))
const assistantRoute = computed(() =>
  buildRoute(audience.value === 'talent' ? '/talent/assistant' : '/enterprise/assistant', contextQuery.value)
)

const rooms = computed(() => {
  const items = Array.isArray(roomPayload.value?.items) ? roomPayload.value.items : []
  return items.map((item, index) => ({
    roomKey: String(item?.roomKey || item?.key || `room-${index}`),
    taskId: String(item?.taskId || item?.taskRoom?.taskId || ''),
    title: item?.taskTitle || item?.title || '未命名合同',
    counterpart: item?.counterpartName || item?.talentName || item?.businessName || item?.partnerName || '当前协作方',
    stage: item?.stage || item?.status || '等待同步',
    summary: item?.lastMessage || item?.focus || item?.summary || '打开消息继续查看这份合同的最新说明。',
    time: item?.lastTime || item?.updatedAt || item?.communicationSavedAt || '刚刚更新',
    unreadCount: String(item?.unreadCount || '0'),
  }))
})

const unreadRoomCount = computed(() => rooms.value.filter((item) => item.unreadCount !== '0').length)

const filteredRooms = computed(() => {
  const keyword = roomSearch.value.trim().toLowerCase()
  if (!keyword) return rooms.value
  return rooms.value.filter((item) => [item.title, item.counterpart, item.summary, item.stage, item.taskId].join(' ').toLowerCase().includes(keyword))
})

const sidebarRooms = computed(() => {
  if (!activeRoomKey.value) return filteredRooms.value
  const others = filteredRooms.value.filter((item) => item.roomKey !== activeRoomKey.value)
  return others.length ? others : filteredRooms.value
})
const showRoomSwitcherPanel = computed(() => !activeRoom.value || !hasShellContext.value || showRoomSwitcher.value)

const activeRoom = computed(() => {
  const detail = roomDetail.value
  if (!detail) return null
  return {
    roomKey: String(detail.roomKey || activeRoomKey.value || ''),
    taskId: String(detail.taskId || detail.taskRoom?.taskId || route.query.taskId || ''),
    title: detail.title || '未命名合同',
    stage: detail.stage || detail.taskRoom?.status || '等待同步',
    focus: detail.focus || '',
    taskDetail: detail.taskDetail || null,
    taskRoom: detail.taskRoom || null,
    pendingActions: Array.isArray(detail.pendingActions) ? detail.pendingActions : [],
    taskTags: Array.isArray(detail.taskTags) ? detail.taskTags : [],
    participants: Array.isArray(detail.participants) ? detail.participants : Array.isArray(detail.members) ? detail.members : [],
    taskConfirmation: detail.taskConfirmation || null,
    messages: Array.isArray(detail.messages) ? detail.messages : [],
    counterpart: detail.counterpartName || detail.businessName || detail.talentName || detail.partnerName || '',
  }
})

const heroTitle = computed(() => activeRoom.value?.title || '合同消息')
const currentRoomStageLabel = computed(() => {
  const rawStage = String(activeRoom.value?.stage || activeRoom.value?.taskDetail?.status || '').trim()
  const confirmationStatus = String(activeRoom.value?.taskConfirmation?.status || '').trim()
  if (confirmationStatus === '已确认' || rawStage.includes('已确认合作') || rawStage.includes('协作中') || rawStage.includes('企业已确认')) {
    return '执行中'
  }
  return rawStage || '待协作'
})
const currentMilestoneLabel = computed(() => {
  const detail = activeRoom.value?.taskDetail || {}
  return String(
    routeContextMilestone.value ||
    detail.currentMilestone ||
    detail.currentMilestoneTitle ||
    detail.milestoneTitle ||
    detail.nodeTitle ||
    ''
  ).trim()
})
const heroSubtitle = computed(() => {
  if (activeRoom.value) {
    if (currentRoomStageLabel.value === '执行中') {
      return currentMilestoneLabel.value
        ? `当前合作已经进入执行中。${currentMilestoneLabel.value} 会继续挂在这份合同下，消息、验收、记录和助手也会一起对齐。`
        : '当前合作已经进入执行中，消息、里程碑、验收、记录和助手都会沿着这份合同继续推进。'
    }
    return currentMilestoneLabel.value
      ? `把会话继续挂在同一份合同下。${currentMilestoneLabel.value} 会保持在当前视图里，文件、验收、记录和助手也会一起对齐。`
      : '把会话继续挂在同一份合同下，里程碑、文件、验收、记录和助手都会沿着这份合同继续推进。'
  }
  return '先选择一份进行中的合同，把消息、文件、记录和下一步都挂在同一条合同线上。'
})
const currentActor = computed(() => currentActorLabel.value)
const currentActorLabel = computed(() => (audience.value === 'enterprise' ? '企业' : '人才'))
const currentUserIds = computed(() => [
  authUser?.platformUserId,
  authUser?.userId,
  authUser?.id,
  authUser?.imUserId,
].map((value) => String(value || '').trim()).filter(Boolean))
const currentUserNames = computed(() => [
  authUser?.displayName,
  authUser?.name,
  authUser?.nickname,
  authUser?.businessName,
  authUser?.companyName,
  authUser?.enterpriseName,
  authUser?.organizationName,
].map((value) => String(value || '').trim()).filter(Boolean))
const noRoomHint = computed(() => (
  '先选择一份进行中的合同，把消息、文件、记录和下一步都挂在同一条合同线上。'
))

function isAffirmative(value) {
  if (typeof value === 'boolean') return value
  const normalized = String(value || '').trim().toLowerCase()
  return ['1', 'true', 'yes', 'y', 'mine', 'self', 'own'].includes(normalized)
}

function isCurrentAudienceRole(value) {
  const normalized = String(value || '').trim().toLowerCase()
  if (!normalized) return false
  if (['me', 'mine', 'self', 'own', '我', '我方', '自己'].includes(normalized)) return true
  const enterpriseRoles = ['enterprise', 'business', 'company', 'client', 'employer', 'owner', 'project_owner', 'publisher', '企业', '企业方', '发布方', '甲方']
  const talentRoles = ['talent', 'freelancer', 'worker', 'candidate', 'provider', 'service_provider', '人才', '人才方', '接单方', '乙方']
  const roleSet = audience.value === 'enterprise' ? enterpriseRoles : talentRoles
  return roleSet.some((role) => normalized === role || normalized.includes(role))
}

function isSelfMessage(message) {
  const author = String(message?.author || message?.senderName || message?.displayName || '').trim()
  const authorUserId = String(message?.authorUserId || message?.senderUserId || message?.platformUserId || message?.userId || message?.imUserId || '').trim()
  const role = message?.authorRole || message?.senderRole || message?.role || message?.audience || message?.senderAudience || ''
  return baseIsSelfMessage({ ...message, author }, currentActor.value)
    || currentUserIds.value.includes(authorUserId)
    || currentUserNames.value.includes(author)
    || isCurrentAudienceRole(role)
}

const activeRoomHeader = computed(() => {
  const room = activeRoom.value
  if (!room) return ''
  return [currentRoomStageLabel.value, currentMilestoneLabel.value, room.focus].filter(Boolean).join(' · ') || '这条会话会继续挂在当前选中的合同下。'
})

const visible消息 = computed(() => {
  const messages = Array.isArray(activeRoom.value?.messages) ? activeRoom.value.messages : []
  return messages.map((message, index) => {
    const author = String(message?.author || message?.senderName || message?.displayName || '合同成员')
    const isSystem = Boolean(message?.isSystem || message?.is系统 || message?.type === 'SYSTEM' || author.includes('系统') || author.includes('System'))
    const isOwnMessage = Boolean(
      isAffirmative(message?.isSelf)
      || isAffirmative(message?.isMine)
      || isSelfMessage({ ...message, author })
    )
    const rawAttachments = Array.isArray(message?.attachments) ? message.attachments : []
    const text = String(message?.text || message?.content || message?.summary || '').trim()
    return {
      key: String(message?.id || `${author}-${message?.time || index}`),
      author,
      time: String(message?.time || message?.createdAt || '刚刚'),
      text,
      isSystem,
      isSelf: !isSystem && isOwnMessage,
      attachments: rawAttachments.map((attachment, attachmentIndex) => normalizeDisplayAttachment(attachment, `${index}-${attachmentIndex}`)),
    }
  })
})

const contextSummary = computed(() => {
  const detail = activeRoom.value?.taskDetail
  return detail?.summary || detail?.brief || activeRoom.value?.focus || '这条会话已经绑定到合同，消息、里程碑、验收和结算都会继续在这里保持关联。'
})

const aiSummaryTitle = computed(() => {
  const detail = activeRoom.value?.taskDetail || {}
  const confirmation = activeRoom.value?.taskConfirmation || {}
  return detail?.ai验收Title || confirmation?.ai验收Title || '助手摘要'
})

const aiSummaryText = computed(() => {
  const detail = activeRoom.value?.taskDetail || {}
  const confirmation = activeRoom.value?.taskConfirmation || {}
  return detail?.ai验收Summary || confirmation?.ai验收Summary || contextSummary.value
})

const pendingActions = computed(() => {
  const items = Array.isArray(activeRoom.value?.pendingActions) ? activeRoom.value.pendingActions : []
  const normalized = items.map((item) => (typeof item === 'string' ? item : item?.label || item?.title || '')).filter(Boolean)
  if (normalized.length) return normalized

  const confirmation = activeRoom.value?.taskConfirmation || {}
  const changeReview = confirmation?.changeReview && typeof confirmation.changeReview === 'object' ? confirmation.changeReview : {}
  const suggestionItems = Array.isArray(changeReview?.suggestions)
    ? changeReview.suggestions.map((item) => String(item || '').trim()).filter(Boolean)
    : []
  if (suggestionItems.length) return suggestionItems

  const stage = String(activeRoom.value?.stage || activeRoom.value?.taskDetail?.status || '').trim()
  if (stage.includes('执行')) {
    return [
      '继续同步交付进展、风险和下一次回传时间。',
      '需要验收时，再把当前结果带到验收页继续处理。',
    ]
  }
  if (stage.includes('验收')) {
    return ['继续补齐验收结论，确认是否进入最终评分和结算。']
  }
  if (stage.includes('已完成')) {
    return ['回看记录、验收和结算摘要，补齐最后的收尾信息。']
  }
  return []
})

const roomFilesAndAttachments = computed(() => {
  const detail = activeRoom.value?.taskDetail || {}
  const confirmation = activeRoom.value?.taskConfirmation || {}
  const buckets = [
    detail.assets,
    detail.files,
    detail.attachments,
    detail.assetFiles,
    confirmation.assets,
    confirmation.files,
    confirmation.attachments,
    activeRoom.value?.taskRoom?.assets,
    activeRoom.value?.taskRoom?.files,
  ]
  const seen = new Set()
  const normalized = []

  buckets.forEach((bucket, bucketIndex) => {
    const list = Array.isArray(bucket) ? bucket : bucket ? [bucket] : []
    list.forEach((asset, assetIndex) => {
      if (!asset) return
      const normalizedAsset = normalizeDisplayAttachment(asset, `${bucketIndex}-${assetIndex}`)
      const key = `${normalizedAsset.href}-${normalizedAsset.name}`
      if (seen.has(key)) return
      seen.add(key)
      normalized.push({
        ...normalizedAsset,
        key: String(asset.id || `${bucketIndex}-${assetIndex}-${key}`),
        source: normalizeAssetSource(asset.source || asset.type || 'attachment'),
      })
    })
  })

  return normalized
})

function normalizeAssetSource(value) {
  const normalized = String(value || '').trim().toUpperCase()
  if (!normalized || normalized === 'ATTACHMENT') return '附件'
  if (normalized === 'TASK_PROGRESS' || normalized === 'CONTRACT_MESSAGE') return '附件'
  if (normalized === 'TEXT') return '消息'
  return String(value || '附件')
}

const workspaceRoute = computed(() => {
  return buildRoute(audience.value === 'enterprise' ? '/enterprise/workspace' : '/talent/workspace', contextQuery.value)
})

const acceptanceRoute = computed(() => {
  return buildRoute(audience.value === 'enterprise' ? '/enterprise/acceptance' : '/talent/acceptance', contextQuery.value)
})

const recordsRoute = computed(() => {
  const basePath = audience.value === 'enterprise' ? '/enterprise/records' : '/talent/records'
  const detailPath = currentRecordId.value ? `${basePath}/${encodeURIComponent(currentRecordId.value)}` : basePath
  return buildRoute(detailPath, contextQuery.value)
})
const shellPills = computed(() => ([
  activeRoom.value?.taskId ? `合同 ${activeRoom.value.taskId}` : '暂未关联合同',
  currentRoomStageLabel.value || '等待回复',
  currentMilestoneLabel.value || '',
]).filter(Boolean))
const shellSupportCopy = computed(() => (
  activeRoom.value
    ? currentRoomStageLabel.value === '执行中'
      ? '当前合作已经进入执行中，消息、文件、记录和下一步会继续挂在这份合同下推进。'
      : '消息、文件、记录和下一步会继续挂在这份合同下推进。'
    : '选择一条合同会话，在上下文里查看消息。'
))
const shellTabs = computed(() => {
  if (!hasShellContext.value) return []
  return [
    workspaceRoute.value ? { label: '概览', to: workspaceRoute.value } : null,
    { label: '消息', current: true },
    acceptanceRoute.value ? { label: '验收', to: acceptanceRoute.value } : null,
    recordsRoute.value ? { label: '记录', to: recordsRoute.value } : null,
    assistantRoute.value ? { label: '助手', to: assistantRoute.value } : null,
  ].filter(Boolean)
})

async function loadRoomList() {
  loadingRooms.value = true
  try {
    const payload = await getTaskRooms()
    roomPayload.value = payload
    if (payload?.requestError) {
      errorMessage.value = payload.requestError
      return
    }
    const preferredRoomKey = String(route.query.roomKey || route.query.room || activeRoomKey.value || '')
    const nextRoomKey = preferredRoomKey || rooms.value[0]?.roomKey || ''
    if (nextRoomKey) {
      await selectRoom(nextRoomKey, false)
    }
  } catch (err) {
    errorMessage.value = err?.message || '合同消息暂时无法加载。'
  } finally {
    loadingRooms.value = false
  }
}

async function ensureRoomFromTaskContext() {
  const taskId = String(route.query.taskId || '')
  const roomKey = String(route.query.roomKey || route.query.room || '')
  if (!taskId || roomKey) return
  try {
    const created = await initiateTaskRoom({
      taskId,
      counterpartPlatformUserId: String(route.query.counterpartPlatformUserId || ''),
      counterpartName: String(route.query.counterpartName || ''),
    })
    if (created?.requestError || created?.message) {
      if (created?.requestError || created?.status === 'FAILED' || created?.success === false) {
        errorMessage.value = created.requestError || created.message || '当前暂时无法打开合同会话。'
        return
      }
    }
    const roomKeyFromResponse = String(created?.roomKey || created?.room?.roomKey || '')
    if (roomKeyFromResponse) {
      activeRoomKey.value = roomKeyFromResponse
    }
  } catch (err) {
    errorMessage.value = err?.message || '当前暂时无法打开合同会话。'
  }
}

async function selectRoom(roomKey, updateRoute = true) {
  if (!roomKey) return
  activeRoomKey.value = roomKey
  showRoomSwitcher.value = false
  loadingRoomDetail.value = true
  try {
    const payload = await getTaskRoom(roomKey)
    roomDetail.value = payload
    if (payload?.requestError) {
      errorMessage.value = payload.requestError
    }
    if (updateRoute) {
      const nextTaskId = String(payload?.taskId || route.query.taskId || '').trim()
      const sameTask = !nextTaskId || nextTaskId === currentTaskId.value
      await router.replace({
        path: route.path,
        query: {
          ...(nextTaskId ? { taskId: nextTaskId } : {}),
          room: roomKey,
          roomKey,
          ...(sameTask && routeNodeId.value ? { node: routeNodeId.value } : {}),
          ...(sameTask && routeContextMilestone.value ? { contextMilestone: routeContextMilestone.value } : {}),
          ...(sameTask && currentRecordId.value ? { recordId: currentRecordId.value } : {}),
          source: 'messages',
          surface: 'messages',
          originSource: sameTask ? (originSourceValue.value || 'messages') : 'messages',
          originTaskId: sameTask ? (originTaskIdValue.value || nextTaskId) : nextTaskId,
          ...(sameTask && originRecordIdValue.value ? { originRecordId: originRecordIdValue.value } : {}),
          originRoom: sameTask ? (originRoomValue.value || roomKey) : roomKey,
        },
      })
    }
  } catch (err) {
    errorMessage.value = err?.message || '当前暂时无法加载这份合同。'
  } finally {
    loadingRoomDetail.value = false
  }
}

function toggleRoomSwitcher() {
  if (!sidebarRooms.value.length) return
  showRoomSwitcher.value = !showRoomSwitcher.value
}

async function handleSendMessage() {
  const nextMessage = composer.value.trim()
  if (!activeRoomKey.value) {
    errorMessage.value = '请先选择一份合同，再发送消息。'
    return
  }
  if (!nextMessage && !messageFiles.value.length) {
    errorMessage.value = '请先输入消息或添加文件，再发送。'
    return
  }
  if (messageFiles.value.length && !currentTaskId.value) {
    errorMessage.value = '请先选择一份已同步的合同，再添加文件。'
    return
  }
  sendingMessage.value = true
  try {
    const uploadedFiles = []
    for (const file of messageFiles.value) {
      const uploaded = await uploadTaskAttachmentAsset(currentTaskId.value, file, {
        scene: 'TASK_PROGRESS',
        source: 'TASK_PROGRESS',
        fileType: 'CONTRACT_MESSAGE',
      })
      uploadedFiles.push(normalizeComposerAttachment(uploaded, file))
    }

    const attachments = composerAttachmentPayload(uploadedFiles)
    const payload = await sendTaskRoomMessage(activeRoomKey.value, {
      content: nextMessage,
      text: nextMessage,
      messageType: 'TEXT',
      attachments,
      files: attachments,
      attachmentFiles: attachments,
      attachmentNames: attachments.map((item) => item.name).filter(Boolean),
    })
    if (payload?.requestError || payload?.status === 'FAILED' || payload?.success === false) {
      errorMessage.value = payload?.requestError || payload?.message || '当前暂时无法发送这条消息。'
      return
    }
    composer.value = ''
    messageFiles.value = []
    messageFilePickerKey.value += 1
    await selectRoom(activeRoomKey.value, false)
    await loadRoomList()
  } catch (err) {
    errorMessage.value = err?.message || '当前暂时无法发送这条消息。'
  } finally {
    sendingMessage.value = false
  }
}

function handleMessageFiles(event) {
  const files = Array.from(event?.target?.files || [])
  if (!files.length) return

  const seen = new Set(messageFiles.value.map((file) => `${file.name}-${file.size}-${file.lastModified || 0}`))
  const nextFiles = [...messageFiles.value]
  files.forEach((file) => {
    const key = `${file.name}-${file.size}-${file.lastModified || 0}`
    if (seen.has(key)) return
    seen.add(key)
    nextFiles.push(file)
  })
  messageFiles.value = nextFiles
  event.target.value = ''
}

function removeMessageFile(index) {
  messageFiles.value = messageFiles.value.filter((_, fileIndex) => fileIndex !== index)
}

function normalizeAttachmentName(source, fallback = '附件') {
  if (typeof source === 'string') {
    const raw = source.trim()
    if (!raw) return fallback
    try {
      const url = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://app.cyxss.xyz')
      return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || fallback)
    } catch {
      return raw
    }
  }
  return String(
    source?.name ||
    source?.filename ||
    source?.fileName ||
    source?.label ||
    source?.title ||
    fallback
  ).trim()
}

function looksLikeUploadId(value) {
  return /^upload[-_]/i.test(String(value || '').trim())
}

function resolveAttachmentHref(value) {
  const raw = String(value || '').trim()
  if (!raw || raw === '#') return ''
  if (/^(https?:|blob:|data:)/i.test(raw)) return raw
  if (typeof window === 'undefined') return raw
  try {
    return new URL(raw.startsWith('/') ? raw : `/${raw}`, window.location.origin).toString()
  } catch {
    return raw
  }
}

function rawAttachmentHref(source) {
  if (typeof source === 'string') {
    return /^https?:\/\//i.test(source) || source.startsWith('/') || source.startsWith('blob:') || source.startsWith('data:') ? source : ''
  }
  const uploadId = String(source?.uploadId || '').trim()
  const id = String(source?.id || '').trim()
  return String(
    source?.downloadHref ||
    source?.downloadUrl ||
    source?.previewUrl ||
    source?.url ||
    source?.href ||
    source?.fileUrl ||
    source?.path ||
    (uploadId ? `/api/uploads/${encodeURIComponent(uploadId)}/content` : '') ||
    (looksLikeUploadId(id) ? `/api/uploads/${encodeURIComponent(id)}/content` : '')
  ).trim()
}

function normalizeDisplayAttachment(source, fallbackKey = 'attachment') {
  const name = normalizeAttachmentName(source)
  const type = String(source?.type || source?.mimeType || source?.fileType || 'application/octet-stream').trim()
  const rawKind = String(source?.kind || '').trim()
  const inferredKind = inferAttachmentKind(type, name)
  const kind = rawKind && !['attachment', 'file', 'other'].includes(rawKind.toLowerCase()) ? rawKind : inferredKind
  const href = resolveAttachmentHref(rawAttachmentHref(source))
  const previewUrl = resolveAttachmentHref(source?.previewUrl || (kind === 'image' ? href : ''))
  return {
    key: String(source?.id || source?.uploadId || `${fallbackKey}-${name}`),
    id: String(source?.id || source?.uploadId || ''),
    name,
    type,
    kind,
    size: Number(source?.size || source?.fileSize || 0),
    previewUrl,
    downloadUrl: href,
    href,
  }
}

function attachmentDownloadHref(attachment) {
  return resolveAttachmentHref(
    attachment?.href ||
    attachment?.downloadUrl ||
    attachment?.downloadHref ||
    attachment?.url ||
    attachment?.fileUrl ||
    attachment?.path ||
    attachment?.previewUrl ||
    rawAttachmentHref(attachment)
  )
}

function handleAttachmentOpen(attachment, event = null) {
  event?.preventDefault?.()
  event?.stopPropagation?.()
  const href = attachmentDownloadHref(attachment)
  const normalizedAttachment = normalizeDisplayAttachment({ ...attachment, downloadUrl: href }, attachment?.key || 'attachment')
  previewAttachment.value = {
    ...normalizedAttachment,
    previewUrl: normalizedAttachment.kind === 'image' ? (normalizedAttachment.previewUrl || href) : '',
    downloadUrl: href,
  }
}

function clear助手DraftQuery() {
  if (!route.query.assistantDraftToken && !route.query.assistantDraft && !route.query.assistantSurface) return
  const query = { ...route.query }
  delete query.assistantDraftToken
  delete query.assistantDraft
  delete query.assistantSurface
  router.replace({ path: route.path, query })
}

function normalizeComposerAttachment(item, fallbackFile = null) {
  const source = item && typeof item === 'object' ? item : {}
  const name = fallbackFile?.name || source.name || source.filename || source.fileName || '附件'
  const downloadUrl = source.downloadUrl || source.downloadHref || source.url || ''
  const type = source.mimeType || source.type || fallbackFile?.type || 'application/octet-stream'
  return {
    id: source.uploadId || source.id || '',
    name,
    type,
    kind: inferAttachmentKind(type, name),
    size: source.size || fallbackFile?.size || 0,
    previewUrl: downloadUrl,
    downloadUrl,
  }
}

watch(
  [assistantDraftSeed, assistantDraftToken],
  ([value, token]) => {
    const applyKey = `${token || 'inline'}::${value}`
    if (!value || assistantDraftApplyKey.value === applyKey) return
    if (!composer.value.trim()) {
      composer.value = value
    } else if (!composer.value.includes(value)) {
      composer.value = `${composer.value}\n\n${value}`.trim()
    }
    assistantDraftApplyKey.value = applyKey
    if (token) consumeAssistantDraftHandoff(token)
    clear助手DraftQuery()
  },
  { immediate: true }
)

watch(
  () => route.query.roomKey || route.query.room,
  async (value) => {
    const nextRoomKey = String(value || '')
    if (nextRoomKey && nextRoomKey !== activeRoomKey.value) {
      await selectRoom(nextRoomKey, false)
    }
  }
)

watch(
  () => [route.query.taskId, route.query.roomKey || route.query.room],
  async ([taskId, room], previous = []) => {
    const nextTaskId = String(taskId || '').trim()
    const nextRoomKey = String(room || '').trim()
    const previousTaskId = String(previous?.[0] || '').trim()
    if (!nextTaskId || nextRoomKey || nextTaskId === previousTaskId) return
    const activeTaskId = String(activeRoom.value?.taskId || roomDetail.value?.taskId || '').trim()
    if (activeTaskId === nextTaskId) return
    activeRoomKey.value = ''
    roomDetail.value = null
    await ensureRoomFromTaskContext()
    await loadRoomList()
  }
)

onMounted(async () => {
  await ensureRoomFromTaskContext()
  await loadRoomList()
})

function buildRoute(path, query = {}) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    params.set(key, String(value))
  })
  const serialized = params.toString()
  return serialized ? `${path}?${serialized}` : path
}
</script>

<style scoped>
.workroom-page { display: grid; gap: 24px; }
.panel {
  padding: 24px;
  border-radius: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.06);
}
.stack-xl,.stack-lg,.stack-md,.stack-sm{display:grid}.stack-xl{gap:32px}.stack-lg{gap:24px}.stack-md{gap:18px}.stack-sm{gap:12px}
.eyebrow{margin:0;font-size:.76rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#108a00}
.muted{margin:0;color:#52606d;line-height:1.7}
.workroom-hero{background:radial-gradient(circle at top left, rgba(16,138,0,.08), transparent 28%), radial-gradient(circle at 88% 18%, rgba(245,196,66,.12), transparent 24%), #fffef8}
.workroom-hero__topline,.workroom-hero__actions,.section-header,.thread-header-actions,.room-card__topline,.message-meta,.message-composer__actions,.info-banner__topline{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
.workroom-hero__titleblock h1{margin:6px 0 10px;font-size:2.4rem;line-height:1;color:#111827}
.context-card,.room-card{border-radius:22px;border:1px solid rgba(17,24,39,.08);background:#fff}
.workroom-nav{display:flex;flex-wrap:wrap;gap:12px;padding:16px 20px}
.workroom-nav__link{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 16px;border-radius:999px;border:1px solid rgba(17,24,39,.1);color:#52606d;text-decoration:none;font-weight:600;background:#fff}
.workroom-nav__link.is-active,.workroom-nav__link.router-link-active,.workroom-nav__link.router-link-exact-active{border-color:rgba(16,138,0,.2);background:#f3fff0;color:#165a0f}
.workroom-shell{display:grid;grid-template-columns:minmax(0,1fr) 332px;gap:24px;align-items:start}
.section-header--compact h2,.section-header h2{margin:6px 0 0;color:#111827}
.soft-pill,.status-chip,.mini-chip,.button-primary,.button-secondary,.attachment-pill{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 14px;border-radius:999px;text-decoration:none}
.soft-pill,.mini-chip,.attachment-pill,.button-secondary{border:1px solid rgba(17,24,39,.12);background:#fff;color:#111827}.status-chip{border:1px solid rgba(16,138,0,.24);background:#f3fff0;color:#165a0f}.button-primary{min-height:46px;padding:0 20px;border:1px solid #108a00;background:#108a00;color:#fff;font-weight:700}.button-secondary{min-height:46px;padding:0 20px;font-weight:700}.button-secondary--small{min-height:38px;padding:0 16px;font-size:.92rem}
.attachment-pill{font:inherit;cursor:pointer}
.text-input,.message-composer__input{width:100%;border:1px solid rgba(17,24,39,.12);border-radius:18px;padding:14px 16px;background:#fff;color:#111827}
.room-list,.simple-list,.asset-list{display:grid;gap:12px}.room-card{padding:18px;text-align:left;cursor:pointer}.room-card.is-active{border-color:rgba(16,138,0,.36);box-shadow:0 20px 40px rgba(16,138,0,.08)}
.room-card strong,.context-card strong,.message-meta strong{color:#111827}.room-card p,.context-card p,.simple-list{margin:0;color:#52606d;line-height:1.65}.room-card__meta{display:flex;justify-content:space-between;gap:12px;margin-top:10px;color:#6b7280;font-size:.9rem}
.info-banner,.empty-state{padding:18px;border-radius:22px;border:1px solid rgba(17,24,39,.08);background:#f8faf7}.empty-state.is-compact{padding:16px}.empty-state__actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.message-feed{display:grid;align-content:start;gap:14px;min-height:440px;max-height:720px;overflow:auto;padding-right:6px}
.message-row{display:flex;justify-content:flex-start}.message-row.is-self{justify-content:flex-end}.message-row.is-self .message-bubble-wrap{justify-items:end}.message-row.is-self .message-meta{justify-content:flex-end;text-align:right}
.message-bubble-wrap{max-width:min(640px,100%);display:grid;gap:8px}.message-meta span{color:#6b7280;font-size:.9rem}.message-bubble{padding:16px 18px;border-radius:20px;background:#f8fafb;border:1px solid rgba(17,24,39,.08)}.message-row.is-self .message-bubble{background:#f3fff0;border-color:rgba(16,138,0,.22)}
.message-bubble p{margin:0;color:#111827;line-height:1.7}.message-attachment-note{font-size:.92rem}.message-attachments,.mini-chip-row{display:flex;flex-wrap:wrap;gap:10px}.message-composer{display:grid;gap:14px;padding-top:8px;border-top:1px solid rgba(17,24,39,.08)}
.message-composer__header strong{display:block;color:#111827;font-size:1rem;margin-bottom:4px}
.message-composer__header p{margin:0}
.message-composer__attachments{display:grid;gap:10px}
.message-composer__attach-button{width:max-content;cursor:pointer}
.message-composer__file-input{display:none}
.file-list{display:flex;flex-wrap:wrap;gap:10px}
.file-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;border:1px solid rgba(17,24,39,.12);background:#f7f9fb;color:#111827;font-size:.92rem}
.file-pill__remove{border:0;background:transparent;color:#4b5563;font-weight:700;cursor:pointer;padding:0}
.context-card{padding:18px;display:grid;gap:10px}.simple-list{margin:0;padding-left:18px}.workroom-thread-empty{min-height:520px;display:grid;place-items:center;text-align:center}
.context-kv-list{display:grid;gap:10px;padding-top:2px}.context-kv{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:10px 0;border-top:1px solid rgba(17,24,39,.06)}.context-kv:first-child{border-top:0;padding-top:0}.context-kv span{color:#6b7280}.context-kv strong{color:#111827;text-align:right}
.asset-row{display:grid;gap:4px;padding:12px 14px;border:1px solid rgba(17,24,39,.08);border-radius:18px;background:#fff;text-decoration:none;text-align:left;font:inherit;cursor:pointer}.asset-row strong{font-size:.95rem}.asset-row span{color:#6b7280;font-size:.88rem}
.section-head__actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.workroom-sidebar__hint{padding-right:8px}
.workroom-sidebar__compact-note{margin:0;color:#5f6c59;line-height:1.65}
.workroom-thread__chips{margin-top:-2px}
@media (max-width: 1240px){.workroom-shell{grid-template-columns:minmax(0,1fr)}.workroom-sidebar,.workroom-thread{order:unset}}
@media (max-width: 720px){.panel{padding:20px}.workroom-hero__topline,.workroom-hero__actions,.section-header,.thread-header-actions,.message-composer__actions{flex-direction:column;align-items:stretch}.workroom-hero__titleblock h1{font-size:1.9rem}}
</style>
