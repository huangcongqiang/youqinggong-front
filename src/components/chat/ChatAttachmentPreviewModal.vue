<template>
  <div v-if="open && attachment" class="dashboard-detail-modal" @click.self="$emit('close')">
    <article class="dashboard-detail-card stack-md message-attachment-preview-card">
      <div class="panel-header">
        <div class="stack-sm">
          <span class="eyebrow">Attachment preview</span>
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
            Download attachment
          </a>
          <button class="button-secondary" type="button" @click="$emit('close')">Close</button>
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
        <p class="muted">This view currently shows the attachment record and a basic preview. Rich preview for video and documents will expand once the full upload service is in place.</p>
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
