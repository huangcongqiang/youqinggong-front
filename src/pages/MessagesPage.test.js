import fs from 'node:fs';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const source = fs.readFileSync(new URL('./MessagesPage.vue', import.meta.url), 'utf8');

assert(
  source.includes('isSelfMessage as baseIsSelfMessage'),
  'MessagesPage should import baseIsSelfMessage from messageDetailHelpers.'
);

assert(
  source.includes('function isSelfMessage(message) {') &&
    source.includes('baseIsSelfMessage({ ...message, author }, currentActor.value)') &&
    source.includes('currentUserIds.value.includes(authorUserId)') &&
    source.includes('currentUserNames.value.includes(author)') &&
    source.includes('isCurrentAudienceRole(role)'),
  'MessagesPage should identify self messages by role, current user id, and current user display name.'
);

assert(
  source.includes('v-else-if="message.attachments.length" class="muted message-attachment-note"')
    && source.includes('发送了 {{ message.attachments.length }} 个附件')
    && source.includes("const text = String(message?.text || message?.content || message?.summary || '').trim()")
    && !source.includes("|| '消息内容暂时不可用。'"),
  'MessagesPage should not render an unavailable-content fallback for attachment-only messages.'
);

assert(
  source.includes('ChatAttachmentPreviewModal')
    && source.includes('@click.stop.prevent="handleAttachmentOpen(attachment, $event)"')
    && source.includes('function handleAttachmentOpen(attachment, event = null)')
    && source.includes('event?.preventDefault?.()')
    && source.includes('event?.stopPropagation?.()')
    && source.includes('function attachmentDownloadHref(attachment)')
    && source.includes('function resolveAttachmentHref(value)')
    && source.includes("source?.previewUrl ||")
    && source.includes("source?.href ||")
    && source.includes("source?.fileUrl ||")
    && source.includes("source?.path ||")
    && source.includes('function openAttachmentUrl(attachment)')
    && source.includes("window.open(href, '_blank', 'noopener,noreferrer')")
    && !source.includes(':href="attachment.href"'),
  'MessagesPage should open attachments through explicit preview/download handling instead of a raw placeholder link.'
);

assert(
  source.includes("kind: inferAttachmentKind(type, name)")
    && source.includes("!['attachment', 'file', 'other'].includes(rawKind.toLowerCase()) ? rawKind : inferredKind"),
  'MessagesPage should infer image/video attachment kinds instead of preserving generic file kinds.'
);
