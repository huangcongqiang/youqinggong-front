<template>
  <div v-if="open && attachment" class="dashboard-detail-modal" @click.self="$emit('close')">
    <article class="dashboard-detail-card stack-md message-attachment-preview-card">
      <div class="panel-header">
        <div class="stack-sm">
          <span class="eyebrow">附件预览</span>
          <h3>{{ attachment.name }}</h3>
          <p class="muted">{{ attachmentMetaText(attachment) }}</p>
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
          <button class="button-secondary" type="button" @click="$emit('close')">关闭</button>
        </div>
      </div>

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
    </article>
  </div>
</template>

<script setup>
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
