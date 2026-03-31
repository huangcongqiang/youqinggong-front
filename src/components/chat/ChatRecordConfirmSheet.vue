<template>
  <MobileSheet
    :open="open"
    title="结束本轮沟通"
    subtitle="确认现在生成 AI 沟通纪要？"
    size="medium"
    @close="$emit('close')"
  >
    <div class="stack-md chat-record-confirm-card">
      <div class="stack-sm">
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
        <button class="button-secondary" type="button" :disabled="isGeneratingRecord" @click="$emit('close')">
          再聊一会
        </button>
        <button class="button-primary" type="button" :disabled="isGeneratingRecord || !activeRoomKey" @click="$emit('confirm')">
          {{ isGeneratingRecord ? 'AI 正在整理纪要...' : '确认并生成纪要' }}
        </button>
      </div>
    </div>
  </MobileSheet>
</template>

<script setup>
import MobileSheet from '../mobile/MobileSheet.vue';

defineProps({
  open: { type: Boolean, default: false },
  room: { type: Object, default: null },
  communicationRecord: { type: Object, default: null },
  isGeneratingRecord: { type: Boolean, default: false },
  activeRoomKey: { type: String, default: '' }
});

defineEmits(['close', 'confirm']);
</script>
