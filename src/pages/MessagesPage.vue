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
const composer = ref('')
const messageFiles = ref([])
const messageFilePickerKey = ref(0)
const sendingMessage = ref(false)
const loadingRooms = ref(false)
const loadingRoomDetail = ref(false)
const errorMessage = ref('')
const previewAttachment = ref(null)

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
    : '选择一条合同会话，继续查看消息。'
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
.workroom-hero__topline,.workroom-hero__actions,.section-header,.thread-header-actions,.message-meta,.message-composer__actions,.info-banner__topline{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
.workroom-hero__titleblock h1{margin:6px 0 10px;font-size:2.4rem;line-height:1;color:#111827}
.workroom-nav{display:flex;flex-wrap:wrap;gap:12px;padding:16px 20px}
.workroom-nav__link{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 16px;border-radius:999px;border:1px solid rgba(17,24,39,.1);color:#52606d;text-decoration:none;font-weight:600;background:#fff}
.workroom-nav__link.is-active,.workroom-nav__link.router-link-active,.workroom-nav__link.router-link-exact-active{border-color:rgba(16,138,0,.2);background:#f3fff0;color:#165a0f}
.workroom-shell{display:grid;grid-template-columns:minmax(0,1fr);gap:24px;align-items:start}
.workroom-thread{width:min(100%,980px);margin:0 auto}
.section-header--compact h2,.section-header h2{margin:6px 0 0;color:#111827}
.soft-pill,.status-chip,.mini-chip,.button-primary,.button-secondary,.attachment-pill{display:inline-flex;align-items:center;justify-content:center;min-height:34px;padding:0 14px;border-radius:999px;text-decoration:none}
.soft-pill,.mini-chip,.attachment-pill,.button-secondary{border:1px solid rgba(17,24,39,.12);background:#fff;color:#111827}.status-chip{border:1px solid rgba(16,138,0,.24);background:#f3fff0;color:#165a0f}.button-primary{min-height:46px;padding:0 20px;border:1px solid #108a00;background:#108a00;color:#fff;font-weight:700}.button-secondary{min-height:46px;padding:0 20px;font-weight:700}.button-secondary--small{min-height:38px;padding:0 16px;font-size:.92rem}
.attachment-pill{font:inherit;cursor:pointer}
.text-input,.message-composer__input{width:100%;border:1px solid rgba(17,24,39,.12);border-radius:18px;padding:14px 16px;background:#fff;color:#111827}
.message-meta strong{color:#111827}
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
.workroom-thread-empty{min-height:520px;display:grid;place-items:center;text-align:center}
.context-kv-list{display:grid;gap:10px;padding-top:2px}.context-kv{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:10px 0;border-top:1px solid rgba(17,24,39,.06)}.context-kv:first-child{border-top:0;padding-top:0}.context-kv span{color:#6b7280}.context-kv strong{color:#111827;text-align:right}
.section-head__actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.workroom-thread__chips{margin-top:-2px}
@media (max-width: 720px){.panel{padding:20px}.workroom-hero__topline,.workroom-hero__actions,.section-header,.thread-header-actions,.message-composer__actions{flex-direction:column;align-items:stretch}.workroom-hero__titleblock h1{font-size:1.9rem}}
</style>
