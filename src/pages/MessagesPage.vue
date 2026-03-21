<template>
  <section class="page-stack" v-if="room">
    <article class="hero-card">
      <div class="panel-header panel-header-top">
        <div class="stack-sm">
          <span class="eyebrow">项目沟通测试</span>
          <h1 class="page-hero-title">围绕任务范围、阶段进度和修改反馈持续协作。</h1>
          <p class="hero-lead hero-lead-compact">
            这里已经补了多组测试会话。你可以切换不同任务房间，直接发消息，验证企业端和人才端在项目推进中的沟通节奏。
          </p>
        </div>

        <div class="chip-row">
          <span class="tag-pill">任务房间切换</span>
          <span class="tag-pill">腾讯 IM 实时消息</span>
          <span class="tag-pill">AI 协作提醒</span>
          <span class="tag-pill" :class="{ 'tag-pill-muted': !imConfig?.enabled }">{{ imStatusLabel }}</span>
          <router-link class="button-secondary" :to="workspaceRoute">查看任务协作区</router-link>
        </div>
      </div>
    </article>

    <section class="message-shell-grid">
      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div>
            <span class="eyebrow">会话列表</span>
            <h3>任务房间</h3>
          </div>
          <span class="soft-pill">{{ rooms.length }} 个房间</span>
        </div>

        <div class="room-summary-grid" v-if="roomSummary">
          <div class="mini-card stack-sm">
            <span class="muted">活跃房间</span>
            <strong class="room-summary-value">{{ roomSummary.activeRooms }}</strong>
          </div>
          <div class="mini-card stack-sm">
            <span class="muted">待回复</span>
            <strong class="room-summary-value">{{ roomSummary.waitingReply }}</strong>
          </div>
          <div class="mini-card stack-sm">
            <span class="muted">有未读</span>
            <strong class="room-summary-value">{{ roomSummary.unreadRooms }}</strong>
          </div>
        </div>

        <div class="message-room-list">
          <button
            v-for="item in rooms"
            :key="item.roomKey"
            type="button"
            class="room-card-button"
            :class="{ 'is-active': item.roomKey === activeRoomKey }"
            @click="selectRoom(item.roomKey)"
          >
            <div class="room-card-head">
              <div>
                <h4>{{ item.title }}</h4>
                <p class="muted">{{ item.taskId }} · {{ item.stage }}</p>
              </div>
              <span v-if="item.unreadCount !== '0'" class="soft-pill">{{ item.unreadCount }} 条未读</span>
              <span v-else class="soft-pill">已读</span>
            </div>

            <p class="muted">{{ item.focus }}</p>

            <div class="meta-inline">
              <span>{{ item.lastTime }}</span>
              <span>{{ item.lastMessage }}</span>
            </div>

            <div class="tag-row">
              <span v-for="tag in item.taskTags || []" :key="tag" class="tag-pill tag-pill-muted">{{ tag }}</span>
            </div>
          </button>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <div class="panel-header">
          <div class="stack-sm">
            <div class="title-line">
              <span class="status-dot"></span>
              <div>
                <h3>{{ room.title }}</h3>
                <p class="muted">{{ room.taskId }} · {{ room.stage }}</p>
              </div>
            </div>
            <p class="muted">{{ room.focus }}</p>
          </div>

          <div class="stack-sm message-panel-meta">
            <span class="soft-pill">{{ room.provider }}</span>
            <span class="soft-pill">{{ roomParticipants.length }} 位协作成员</span>
            <span v-if="roomBinding.providerRoomId" class="soft-pill">{{ roomBinding.providerRoomId }}</span>
          </div>
        </div>

        <div class="result-card stack-sm" v-if="imConfig">
          <span class="eyebrow">当前消息来源</span>
          <p class="muted">
            {{ imConfig.enabled ? '当前已接入腾讯 IM 实时消息，消息收发会优先走腾讯 IM。' : '当前还没填入腾讯 IM 配置，页面继续使用演示消息数据。' }}
          </p>
          <div class="tag-row">
            <span class="soft-pill">{{ imConfig.status }}</span>
            <span class="soft-pill">{{ imConfig.groupId || roomBinding.providerRoomId || room.roomId }}</span>
            <span class="soft-pill">{{ runtimeUser.platformUserId || '平台用户未识别' }}</span>
            <span class="soft-pill">{{ runtimeUser.imUserId || imConfig.userId || currentActor }}</span>
          </div>
        </div>

        <div class="tag-row">
          <span v-for="item in roomParticipants" :key="item" class="soft-pill">{{ item }}</span>
        </div>

        <div class="conversation-feed conversation-feed-tall">
          <article
            v-for="message in room.messages"
            :key="`${message.author}-${message.time}-${message.text}`"
            class="message-bubble"
            :class="bubbleClass(message)"
          >
            <div class="message-bubble-head">
              <div class="title-line">
                <span class="status-dot"></span>
                <div>
                  <h4>{{ message.author }}</h4>
                  <p class="muted">{{ message.type }}</p>
                </div>
              </div>
              <span class="muted">{{ message.time || '刚刚' }}</span>
            </div>
            <p class="muted">{{ message.text }}</p>

            <div v-if="message.attachments?.length" class="tag-row">
              <span v-for="file in message.attachments" :key="file" class="tag-pill tag-pill-muted">{{ file }}</span>
            </div>
          </article>
        </div>

        <div class="stack-sm">
          <h4>快捷回复</h4>
          <div class="toolbar">
            <button
              v-for="reply in room.quickReplies || []"
              :key="reply"
              type="button"
              class="button-secondary"
              @click="handleQuickReply(reply)"
            >
              {{ reply }}
            </button>
          </div>
        </div>

        <div class="message-composer">
          <label class="muted" for="message-author">发送身份</label>
          <select id="message-author" v-model="draftAuthor" class="select-input">
            <option :value="currentActor">{{ currentActor }}</option>
            <option value="AI 系统消息">AI 系统消息</option>
          </select>

          <label class="muted" for="message-text">测试消息</label>
          <textarea
            id="message-text"
            v-model="draftMessage"
            class="textarea message-input"
            placeholder="例如：这轮我先回传首页结构，支付放到第二阶段。"
          ></textarea>

          <div class="toolbar">
            <button class="button-primary" type="button" @click="handleSend">{{ imConfig?.enabled ? '通过腾讯 IM 发送' : '发送测试消息' }}</button>
            <router-link class="button-secondary" :to="primaryRoute">{{ primaryLabel }}</router-link>
          </div>
        </div>
      </article>
    </section>

    <section class="split-grid">
      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="当前重点"
          title="把沟通尽快转成可执行事项"
          description="这部分展示当前房间里最适合继续确认的事项，方便你顺着真实项目节奏测会话。"
        />

        <div class="stack-sm">
          <div v-for="item in room.pendingActions || []" :key="item" class="list-row">
            <div>
              <h4>{{ item }}</h4>
              <p class="muted">建议在确认后同步到协作空间或下一轮 AI 拆解记录中。</p>
            </div>
            <span class="soft-pill">待处理</span>
          </div>
        </div>
      </article>

      <article class="glass-panel stack-md">
        <SectionTitle
          eyebrow="下一步"
          title="沟通完成后继续进入执行"
          description="项目沟通不是单独存在的一页，而是贯穿任务确认、进度同步和验收前反馈的过程。"
        />

        <div class="stack-sm">
          <div class="mini-card stack-sm">
            <h4>企业端建议</h4>
            <p class="muted">先确认范围、预算和工期，再进入人才选择或协作空间，减少后续回头改范围。</p>
          </div>
          <div class="mini-card stack-sm">
            <h4>人才端建议</h4>
            <p class="muted">把关键进度、附件和风险说明都回写到任务工作区，避免只在聊天里留痕。</p>
          </div>
        </div>

        <div class="toolbar">
          <router-link class="button-primary" :to="workspaceRoute">进入协作空间</router-link>
          <router-link class="button-secondary" :to="secondaryRoute">{{ secondaryLabel }}</router-link>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SectionTitle from '../components/SectionTitle.vue';
import {
  getTaskRoom,
  getTaskRooms,
  getTencentImRuntimeConfig,
  sendTaskRoomMessage
} from '../services/api';
import {
  connectTencentIm,
  ensureTencentTaskGroup,
  getTencentGroupMessages,
  sendTencentGroupText,
  subscribeTencentMessages
} from '../services/tencentIm';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';

const route = useRoute();
const router = useRouter();
const rooms = ref([]);
const room = ref(null);
const roomSummary = ref(null);
const activeRoomKey = ref('');
const draftMessage = ref('');
const imConfig = ref(null);
const currentConversationId = ref('');
const audience = computed(() => resolveAudience(route));
const fallbackActor = computed(() => (audience.value === 'talent' ? '陈一宁' : '星河智能'));
const runtimeUser = computed(() => imConfig.value?.currentUser || {});
const roomBinding = computed(() => room.value?.taskRoom || imConfig.value?.taskRoom || {});
const roomParticipants = computed(() => {
  const members = room.value?.members || imConfig.value?.members || [];
  if (members.length) {
    return members.map((item) => item.displayName).filter(Boolean);
  }
  return room.value?.participants || [];
});
const currentActor = computed(() => runtimeUser.value.displayName || imConfig.value?.displayName || fallbackActor.value);
const draftAuthor = ref('星河智能');
let unsubscribeMessages = null;

const workspaceRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.workspace : roleRouteMap.enterprise.workspace
);
const primaryRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.market : roleRouteMap.enterprise.publish
);
const secondaryRoute = computed(() =>
  audience.value === 'talent' ? roleRouteMap.talent.acceptance : roleRouteMap.enterprise.market
);
const primaryLabel = computed(() => (audience.value === 'talent' ? '去看任务广场' : '去发布任务'));
const secondaryLabel = computed(() => (audience.value === 'talent' ? '去看验收评分' : '去看人才广场'));
const imStatusLabel = computed(() => (imConfig.value?.enabled ? '腾讯 IM 已连接' : '演示消息'));

function bubbleClass(message) {
  return {
    'is-system': message.type === 'SYSTEM',
    'is-self': message.author === currentActor.value
  };
}

async function selectRoom(roomKey) {
  activeRoomKey.value = roomKey;
  const baseRoom = await getTaskRoom(roomKey);
  room.value = baseRoom;
  draftAuthor.value = fallbackActor.value;
  router.replace({ query: { ...route.query, room: roomKey } });
  await loadTencentRoom(roomKey, baseRoom);
}

function syncRoomList(updatedRoom) {
  rooms.value = rooms.value.map((item) =>
    item.roomKey === updatedRoom.roomKey
      ? {
          ...item,
          stage: updatedRoom.stage,
          focus: updatedRoom.focus,
          lastTime: updatedRoom.lastTime || item.lastTime,
          lastMessage: updatedRoom.lastMessage || item.lastMessage,
          unreadCount: updatedRoom.unreadCount || '0',
          taskTags: updatedRoom.taskTags || item.taskTags
        }
      : item
  );
}

async function handleSend() {
  if (!draftMessage.value.trim() || !activeRoomKey.value) {
    return;
  }

  let nextRoom;
  if (imConfig.value?.enabled) {
    const realtimeMessages = await sendTencentGroupText(imConfig.value, draftMessage.value);
    nextRoom = {
      ...room.value,
      messages: realtimeMessages.length ? realtimeMessages : room.value.messages,
      lastTime: '刚刚',
      lastMessage: draftMessage.value,
      unreadCount: '0'
    };
  } else {
    nextRoom = await sendTaskRoomMessage(activeRoomKey.value, {
      author: draftAuthor.value,
      type: draftAuthor.value === 'AI 系统消息' ? 'SYSTEM' : 'TEXT',
      text: draftMessage.value
    });
  }

  room.value = nextRoom;
  syncRoomList(nextRoom);
  draftMessage.value = '';
}

async function handleQuickReply(reply) {
  draftMessage.value = reply;
  await handleSend();
}

onMounted(async () => {
  unsubscribeMessages = subscribeTencentMessages((payload) => {
    if (!payload?.conversationID || payload.conversationID !== currentConversationId.value || !room.value) {
      return;
    }

    room.value = {
      ...room.value,
      messages: mergeMessages(room.value.messages, payload.messages),
      lastTime: payload.messages[payload.messages.length - 1]?.time || room.value.lastTime,
      lastMessage: payload.messages[payload.messages.length - 1]?.text || room.value.lastMessage
    };
    syncRoomList(room.value);
  });

  const payload = await getTaskRooms();
  roomSummary.value = payload.summary;
  rooms.value = payload.items || [];

  const initialRoomKey = route.query.room || rooms.value[0]?.roomKey || 'launch-sprint';
  await selectRoom(initialRoomKey);
});

onBeforeUnmount(() => {
  if (unsubscribeMessages) {
    unsubscribeMessages();
  }
});

async function loadTencentRoom(roomKey, baseRoom) {
  const runtime = await getTencentImRuntimeConfig(audience.value, roomKey);
  imConfig.value = runtime;
  currentConversationId.value = runtime?.groupId ? `GROUP${runtime.groupId}` : '';
  draftAuthor.value = runtime?.currentUser?.displayName || fallbackActor.value;

  if (!runtime?.enabled) {
    room.value = {
      ...baseRoom,
      provider: 'Tencent IM（演示数据）',
      taskRoom: baseRoom.taskRoom || runtime.taskRoom,
      members: baseRoom.members || runtime.members || []
    };
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
    imConfig.value = {
      ...runtime,
      enabled: false,
      status: 'CONNECT_FAILED',
      notes: ['腾讯 IM 登录失败，当前继续使用演示消息数据。']
    };
    room.value = {
      ...baseRoom,
      provider: 'Tencent IM（演示数据）',
      taskRoom: baseRoom.taskRoom || runtime.taskRoom,
      members: baseRoom.members || runtime.members || []
    };
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
