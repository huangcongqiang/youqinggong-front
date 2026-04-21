<template>
  <div v-if="open" class="dashboard-detail-modal" @click.self="$emit('close')">
    <article class="dashboard-detail-card stack-md chat-record-confirm-card">
      <div class="stack-sm">
        <span class="eyebrow">Wrap this conversation</span>
        <h3>Generate the assistant recap now?</h3>
        <p class="muted">
          The full conversation stays here. This action only turns the current conversation into a recap with decisions, open items, and a short summary.
        </p>
      </div>

      <div class="dashboard-preview-list">
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>当前会话</strong>
            <p>{{ room?.title || '当前合同会话' }}</p>
          </div>
        </div>
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>Latest message</strong>
            <p>{{ room?.lastMessage || 'No recent message yet' }}</p>
          </div>
        </div>
        <div class="dashboard-preview-item">
          <div class="stack-xs">
            <strong>当前摘要状态</strong>
            <p>{{ communicationRecord?.status || 'Not generated yet' }}</p>
          </div>
        </div>
      </div>

      <div class="toolbar chat-record-confirm-toolbar">
        <button class="button-secondary" type="button" :disabled="isGeneratingRecord" @click="$emit('close')">
          Keep chatting
        </button>
        <button class="button-primary" type="button" :disabled="isGeneratingRecord || !activeRoomKey" @click="$emit('confirm')">
          {{ isGeneratingRecord ? '助手正在准备摘要…' : '确认并生成摘要' }}
        </button>
      </div>
    </article>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  room: { type: Object, default: null },
  communicationRecord: { type: Object, default: null },
  isGeneratingRecord: { type: Boolean, default: false },
  activeRoomKey: { type: String, default: '' }
});

defineEmits(['close', 'confirm']);
</script>
