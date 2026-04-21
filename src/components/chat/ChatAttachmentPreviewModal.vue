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

      <div v-else class="message-attachment-preview-empty">
        <strong>{{ attachment.name }}</strong>
        <p v-if="attachmentDownloadHref(attachment)" class="muted">当前文件类型不支持在线预览，请点击上方“下载附件”后查看。</p>
        <p v-else class="muted">当前附件暂时没有可用下载地址，请稍后再试。</p>
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
