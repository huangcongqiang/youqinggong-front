<template>
  <MobileSheet
    :open="open && Boolean(attachment)"
    title="附件预览"
    :subtitle="attachment?.name || '当前附件'"
    size="large"
    @close="$emit('close')"
  >
    <div v-if="attachment" class="stack-md message-attachment-preview-card">
      <p class="muted">{{ attachmentMetaText(attachment) }}</p>

      <img
        v-if="attachment.kind === 'image' && attachment.previewUrl"
        :src="attachment.previewUrl"
        :alt="attachment.name"
        class="message-attachment-preview-image"
      />

      <video
        v-else-if="attachment.kind === 'video' && attachment.previewUrl"
        :src="attachment.previewUrl"
        class="message-attachment-preview-video"
        controls
      ></video>

      <div v-else class="message-attachment-preview-empty">
        <strong>{{ attachment.name }}</strong>
        <p class="muted">当前先提供附件记录与基础预览。视频和文档的在线预览会在正式上传服务接入后继续补齐。</p>
      </div>

      <div class="toolbar">
        <a
          v-if="attachmentDownloadHref(attachment)"
          class="button-primary"
          :href="attachmentDownloadHref(attachment)"
          :download="attachment.name"
          target="_blank"
          rel="noreferrer"
        >
          下载附件
        </a>
      </div>
    </div>
  </MobileSheet>
</template>

<script setup>
import MobileSheet from '../mobile/MobileSheet.vue';

defineProps({
  open: {
    type: Boolean,
    default: false
  },
  attachment: {
    type: Object,
    default: null
  },
  attachmentMetaText: {
    type: Function,
    required: true
  },
  attachmentDownloadHref: {
    type: Function,
    required: true
  }
});

defineEmits(['close']);
</script>
