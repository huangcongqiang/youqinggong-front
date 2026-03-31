<template>
  <div v-if="open && room" class="dashboard-detail-modal" @click.self="$emit('close')">
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
          <button class="button-primary" type="button" :disabled="isGeneratingRecord || !activeRoomKey" @click="$emit('generate')">
            {{ isGeneratingRecord ? 'AI 正在整理纪要...' : generateRecordButtonLabel }}
          </button>
          <button class="button-secondary" type="button" @click="$emit('close')">关闭</button>
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
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  room: { type: Object, default: null },
  communicationRecord: { type: Object, default: null },
  communicationRecordSummary: { type: String, default: '' },
  generateRecordButtonLabel: { type: String, default: '生成纪要' },
  isGeneratingRecord: { type: Boolean, default: false },
  activeRoomKey: { type: String, default: '' },
  generateRecordHint: { type: String, default: '' }
});

defineEmits(['close', 'generate']);
</script>
