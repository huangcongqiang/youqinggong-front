<template>
  <div v-if="open && room" class="dashboard-detail-modal" @click.self="$emit('close')">
    <article class="dashboard-detail-card stack-md chat-record-modal-card">
      <div class="panel-header">
        <div class="stack-sm">
          <span class="eyebrow">助手摘要</span>
          <h3>{{ communicationRecord?.title || '会话摘要' }}</h3>
          <p class="muted">{{ communicationRecord?.summary || communicationRecordSummary }}</p>
        </div>

        <div class="toolbar">
          <span class="soft-pill">{{ communicationRecord?.status || '尚未生成' }}</span>
          <span class="soft-pill">{{ communicationRecord?.savedAt || room?.lastTime || '待处理' }}</span>
          <button class="button-primary" type="button" :disabled="isGeneratingRecord || !activeRoomKey" @click="$emit('generate')">
            {{ isGeneratingRecord ? '正在生成摘要...' : generateRecordButtonLabel }}
          </button>
          <button class="button-secondary" type="button" @click="$emit('close')">关闭</button>
        </div>
      </div>

      <p class="muted">{{ communicationRecord?.recordNote || generateRecordHint }}</p>

      <section v-if="!communicationRecord" class="dashboard-detail-section stack-sm chat-record-empty-state">
        <h4>暂时还没有摘要</h4>
        <p class="muted">
          等当前会话进入一个清晰节点后，再点击“{{ generateRecordButtonLabel }}”。系统会把这段会话整理成决定、待处理事项和一段简短摘要。
        </p>
      </section>

      <section v-if="communicationRecord?.keyPoints?.length" class="dashboard-detail-section stack-sm">
        <h4>会话总结</h4>
        <div v-for="item in communicationRecord.keyPoints" :key="item" class="dashboard-preview-item">
          <p class="muted">{{ item }}</p>
        </div>
      </section>

      <section v-if="communicationRecord?.decisions?.length" class="dashboard-detail-section stack-sm">
        <h4>已记录决定</h4>
        <div v-for="item in communicationRecord.decisions" :key="item" class="dashboard-preview-item">
          <p class="muted">{{ item }}</p>
        </div>
      </section>

      <section v-if="communicationRecord?.openItems?.length" class="dashboard-detail-section stack-sm">
        <h4>待处理事项</h4>
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
  generateRecordButtonLabel: { type: String, default: '生成摘要' },
  isGeneratingRecord: { type: Boolean, default: false },
  activeRoomKey: { type: String, default: '' },
  generateRecordHint: { type: String, default: '' }
});

defineEmits(['close', 'generate']);
</script>
