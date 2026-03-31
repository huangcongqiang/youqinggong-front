<template>
  <section class="page-stack chat-inbox-page">
    <MobilePageScaffold
      title="聊天"
      subtitle=""
    >
      <template #meta>
        <span v-if="rooms.length" class="soft-pill">{{ summaryText }}</span>
        <span v-if="unreadRooms" class="soft-pill">{{ unreadText }}</span>
      </template>

      <article v-if="requestError" class="result-card stack-sm">
        <h3>暂时没拉到会话列表</h3>
        <p class="muted">{{ requestError }}</p>
      </article>

      <article v-if="hasTargetCounterpart" class="glass-panel stack-sm chat-inbox-focus-card">
        <div class="chat-inbox-focus-head">
          <div class="chat-inbox-focus-copy">
            <span class="eyebrow">{{ targetMatchedRoom ? '继续会话' : '准备聊天' }}</span>
            <h3>{{ targetCounterpartName || '当前对象' }}</h3>
            <p class="muted">{{ targetRoomHint }}</p>
          </div>
          <div class="chat-inbox-focus-meta">
            <span class="soft-pill">{{ targetRoomStatus }}</span>
            <span v-if="targetTaskId" class="soft-pill">当前任务</span>
          </div>
        </div>
        <div class="toolbar chat-inbox-focus-actions">
          <button class="button-primary" type="button" :disabled="isOpeningTargetRoom" @click="openTargetConversation">
            {{ isOpeningTargetRoom ? '正在进入...' : (targetMatchedRoom ? '继续聊天' : '发起聊天') }}
          </button>
          <button v-if="targetMatchedRoom" class="button-secondary" type="button" @click="clearTargetQuery">
            回列表
          </button>
        </div>
      </article>

      <article class="glass-panel stack-sm chat-inbox-shell">
        <div class="chat-inbox-toolbar">
          <div class="chat-inbox-toolbar-copy">
            <span class="eyebrow">{{ hasTargetCounterpart ? '其他会话' : '会话列表' }}</span>
            <h3>{{ hasTargetCounterpart ? '最近会话' : '会话' }}</h3>
          </div>
          <span class="soft-pill">{{ filteredRooms.length }} / {{ rooms.length }}</span>
        </div>

        <input
          v-model="search"
          class="text-input room-search-input chat-inbox-search"
          type="text"
          placeholder="搜索任务、对象、消息"
        />

        <div class="chat-inbox-list">
          <UnifiedListCard
            v-for="item in filteredRooms"
            :key="item.roomKey"
            :eyebrow="roomEyebrow(item)"
            :title="item.taskTitle || item.title || '未命名任务'"
            :subtitle="roomSubtitle(item)"
            :meta="roomMeta(item)"
            :status="roomStatus(item)"
            :status-tone="roomStatusTone(item)"
            clickable
            @select="openRoom(item)"
          >
            <p class="muted chat-inbox-room-preview">{{ roomPreview(item) }}</p>
          </UnifiedListCard>

          <article v-if="!filteredRooms.length && !isLoading" class="mini-card stack-sm chat-inbox-empty-card">
            <h3>当前还没有聊天</h3>
            <p class="muted">从详情页发起聊天后，会回到这里继续处理。</p>
            <router-link
              class="button-secondary"
              :to="audience === 'talent' ? roleRouteMap.talent.market : roleRouteMap.enterprise.market"
            >
              {{ audience === 'talent' ? '去任务广场' : '去人才广场' }}
            </router-link>
          </article>
        </div>
      </article>
    </MobilePageScaffold>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MobilePageScaffold from '../components/mobile/MobilePageScaffold.vue';
import UnifiedListCard from '../components/mobile/UnifiedListCard.vue';
import { getTaskRooms, initiateTaskRoom } from '../services/api';
import { resolveAudience, roleRouteMap } from '../utils/roleRoutes';
import { sortRoomsByActivity } from './messageRoomSelection.js';

const route = useRoute();
const router = useRouter();

const rooms = ref([]);
const requestError = ref('');
const isLoading = ref(true);
const search = ref('');
const isOpeningTargetRoom = ref(false);
let refreshTimer = null;

const audience = computed(() => resolveAudience(route));
const targetCounterpartPlatformUserId = computed(() =>
  typeof route.query.counterpartPlatformUserId === 'string' ? route.query.counterpartPlatformUserId.trim() : ''
);
const targetCounterpartName = computed(() =>
  typeof route.query.counterpartName === 'string' ? route.query.counterpartName.trim() : ''
);
const targetTaskId = computed(() =>
  typeof route.query.taskId === 'string' ? route.query.taskId.trim() : ''
);
const hasTargetCounterpart = computed(() => Boolean(targetCounterpartPlatformUserId.value));
const sortedRooms = computed(() => sortRoomsByActivity(rooms.value));
const targetTaskRoom = computed(() =>
  targetTaskId.value
    ? sortedRooms.value.find((item) => String(item.taskId || '').trim() === targetTaskId.value) || null
    : null
);
const filteredRooms = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) {
    return sortedRooms.value;
  }
  return sortedRooms.value.filter((item) =>
    [item.taskTitle, item.title, item.counterpartName, item.lastMessage, item.stage]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
  );
});
const targetMatchedRoom = computed(() =>
  sortedRooms.value.find((item) => item.counterpartPlatformUserId === targetCounterpartPlatformUserId.value) || null
);
const summaryText = computed(() => `${rooms.value.length} 个会话`);
const unreadRooms = computed(() =>
  rooms.value.filter((item) => Number.parseInt(String(item.unreadCount || '0'), 10) > 0).length
);
const unreadText = computed(() => (unreadRooms.value ? `${unreadRooms.value} 个未读` : '无未读'));
const targetRoomStatus = computed(() => {
  if (isOpeningTargetRoom.value) {
    return '处理中';
  }
  if (targetMatchedRoom.value) {
    return '已有会话';
  }
  return '新建会话';
});
const targetRoomHint = computed(() => {
  if (targetTaskRoom.value) {
    return '已定位到当前任务会话。';
  }
  if (targetMatchedRoom.value) {
    return `已找到与 ${targetCounterpartName.value || '当前对象'} 的最近会话。`;
  }
  return `还没有与 ${targetCounterpartName.value || '当前对象'} 的聊天，会先建立会话。`;
});

function roomSubtitle(item) {
  const pieces = [];
  if (item.counterpartName) {
    pieces.push(item.counterpartName);
  }
  if (item.stage) {
    pieces.push(item.stage);
  }
  return pieces.join(' · ') || '等待进入详情';
}

function roomEyebrow(item) {
  if (item.stage) {
    return '当前阶段';
  }
  return '最近消息';
}

function roomPreview(item) {
  return item.lastMessage || item.focus || roomSubtitle(item);
}

function roomMeta(item) {
  return item.lastTime || item.communicationSavedAt || '等待新消息';
}

function roomStatus(item) {
  if (Number.parseInt(String(item.unreadCount || '0'), 10) > 0) {
    return `${item.unreadCount} 条未读`;
  }
  return '';
}

function roomStatusTone(item) {
  if (Number.parseInt(String(item.unreadCount || '0'), 10) > 0) {
    return 'warning';
  }
  return 'neutral';
}

async function loadRooms() {
  isLoading.value = true;
  const payload = await getTaskRooms();
  requestError.value = payload?.requestError || '';
  rooms.value = Array.isArray(payload?.items) ? payload.items : [];
  isLoading.value = false;
}

async function openRoom(item) {
  await router.push(
    audience.value === 'talent'
      ? roleRouteMap.talent.messageRoom(item.roomKey, item.taskId ? { taskId: item.taskId } : {})
      : roleRouteMap.enterprise.messageRoom(item.roomKey, item.taskId ? { taskId: item.taskId } : {})
  );
}

async function openTargetConversation() {
  if (!hasTargetCounterpart.value || isOpeningTargetRoom.value) {
    return;
  }

  isOpeningTargetRoom.value = true;
  try {
    if (targetMatchedRoom.value?.roomKey) {
      await openRoom(targetMatchedRoom.value);
      return;
    }

    const created = await initiateTaskRoom({
      counterpartPlatformUserId: targetCounterpartPlatformUserId.value,
      counterpartName: targetCounterpartName.value
    });

    if (created?.status === 'FAILED' || created?.requestError || !created?.roomKey) {
      requestError.value = created?.requestError || created?.message || '当前暂时无法建立聊天房间，请稍后再试。';
      return;
    }

    const roomItem = created.room && typeof created.room === 'object'
      ? created.room
      : { roomKey: created.roomKey, taskId: created.taskId || '' };
    await openRoom(roomItem);
  } finally {
    isOpeningTargetRoom.value = false;
  }
}

function clearTargetQuery() {
  router.replace({
    path: audience.value === 'talent' ? roleRouteMap.talent.messages : roleRouteMap.enterprise.messages,
    query: {}
  });
}

async function openTaskConversationIfNeeded() {
  if (!targetTaskRoom.value) {
    return false;
  }
  await openRoom(targetTaskRoom.value);
  return true;
}

function scheduleRefresh() {
  if (typeof window === 'undefined') {
    return;
  }
  refreshTimer = window.setInterval(() => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }
    void loadRooms();
  }, 8000);
}

onMounted(async () => {
  await loadRooms();
  if (await openTaskConversationIfNeeded()) {
    scheduleRefresh();
    return;
  }
  if (hasTargetCounterpart.value) {
    await openTargetConversation();
  }
  scheduleRefresh();
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && refreshTimer) {
    window.clearInterval(refreshTimer);
  }
});

watch(
  () => [route.query.counterpartPlatformUserId, route.query.counterpartName, route.query.taskId],
  async () => {
    await loadRooms();
    if (await openTaskConversationIfNeeded()) {
      return;
    }
    if (hasTargetCounterpart.value) {
      await openTargetConversation();
    }
  }
);
</script>

<style scoped>
.chat-inbox-page {
  gap: 12px;
}

.chat-inbox-focus-card,
.chat-inbox-shell {
  padding: 16px;
}

.chat-inbox-focus-head,
.chat-inbox-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.chat-inbox-focus-copy,
.chat-inbox-toolbar-copy {
  min-width: 0;
}

.chat-inbox-focus-copy h3,
.chat-inbox-toolbar-copy h3 {
  margin: 6px 0 0;
  font-size: 24px;
  line-height: 1.08;
}

.chat-inbox-focus-copy .muted {
  margin-top: 6px;
}

.chat-inbox-focus-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.chat-inbox-focus-actions {
  gap: 10px;
}

.chat-inbox-search {
  margin-top: 0;
}

.chat-inbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-inbox-room-preview {
  margin: 0;
}

.chat-inbox-empty-card {
  padding: 16px;
}

@media (max-width: 640px) {
  .chat-inbox-focus-head,
  .chat-inbox-toolbar,
  .chat-inbox-focus-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .chat-inbox-focus-meta {
    justify-content: flex-start;
  }
}
</style>
