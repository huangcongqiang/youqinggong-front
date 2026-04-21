export function listOf(value) {
  return Array.isArray(value) ? value : [];
}

export function isSystemMessage(message) {
  return String(message?.type || '').toUpperCase() === 'SYSTEM';
}

export function isLegacyAutoSystemMessage(message) {
  if (!isSystemMessage(message)) {
    return false;
  }
  const text = String(message?.text || '');
  return (
    text.startsWith('消息已写入任务房间') ||
    text.includes('建议下一轮直接回传首页首屏或信息层级稿') ||
    text.includes('已记录报价或支付相关讨论') ||
    text.includes('已同步到联调重点')
  );
}

export function isSelfMessage(message, currentActor) {
  return !isSystemMessage(message) && message?.author === currentActor;
}

export function messageRowClass(message, currentActor) {
  return {
    'is-system': isSystemMessage(message),
    'is-self': isSelfMessage(message, currentActor),
    'is-other': !isSystemMessage(message) && !isSelfMessage(message, currentActor)
  };
}

export function messageAvatarText(author) {
  const normalized = String(author || '').trim();
  if (!normalized) {
    return '?';
  }
  return normalized.slice(0, 1);
}

export function messageDisplayAuthor(message, currentActor) {
  if (isSystemMessage(message)) {
    return '系统';
  }
  return isSelfMessage(message, currentActor) ? '我' : String(message?.author || '协作者');
}

export function calendarStateLabel(state) {
  if (state === 'open') {
    return '可安排';
  }
  if (state === 'busy') {
    return '进行中';
  }
  if (state === 'closed') {
    return '已暂停';
  }
  return '待确认';
}

export function summarizeTaskConfirmationHistory(history) {
  const items = Array.isArray(history) ? history : [];
  if (!items.length) {
    return [];
  }

  const versionMap = new Map();

  items.forEach((item, index) => {
    const version = Number(item?.version || 1);
    const existing = versionMap.get(version);
    const changes = Array.isArray(item?.changes) ? item.changes.filter(Boolean) : [];
    const aiSuggestion = item?.aiSuggestion && typeof item.aiSuggestion === 'object' ? item.aiSuggestion : null;

    if (!existing) {
      versionMap.set(version, {
        id: item?.id || `version-${version}-${index}`,
        version,
        action: item?.action || `版本 ${version}`,
        actor: item?.actor || '系统',
        status: item?.status || '待验收',
        note: item?.note || '',
        summary: item?.summary || '',
        scopeNote: item?.scopeNote || '',
        period: item?.period || '',
        scheduleNote: item?.scheduleNote || '',
        budget: item?.budget || '',
        time: item?.time || '',
        timestamp: Number(item?.timestamp || 0),
        changes: [...changes],
        aiSuggestion
      });
      return;
    }

    if (Number(item?.timestamp || 0) >= Number(existing.timestamp || 0)) {
      existing.id = item?.id || existing.id;
      existing.action = item?.action || existing.action;
      existing.actor = item?.actor || existing.actor;
      existing.status = item?.status || existing.status;
      existing.note = item?.note || existing.note;
      existing.summary = item?.summary || existing.summary;
      existing.scopeNote = item?.scopeNote || existing.scopeNote;
      existing.period = item?.period || existing.period;
      existing.scheduleNote = item?.scheduleNote || existing.scheduleNote;
      existing.budget = item?.budget || existing.budget;
      existing.time = item?.time || existing.time;
      existing.timestamp = Number(item?.timestamp || existing.timestamp || 0);
      if (aiSuggestion) {
        existing.aiSuggestion = aiSuggestion;
      }
    }

    changes.forEach((change) => {
      if (!existing.changes.includes(change)) {
        existing.changes.push(change);
      }
    });
  });

  return Array.from(versionMap.values()).sort((left, right) => left.version - right.version);
}

export function inferAttachmentKind(type, name) {
  const normalizedType = String(type || '').toLowerCase();
  const normalizedName = String(name || '').toLowerCase();
  if (normalizedType.startsWith('image/')) {
    return 'image';
  }
  if (normalizedType.startsWith('video/')) {
    return 'video';
  }
  if (normalizedName.endsWith('.zip') || normalizedName.endsWith('.rar') || normalizedName.endsWith('.7z')) {
    return 'archive';
  }
  if (
    normalizedName.endsWith('.js') ||
    normalizedName.endsWith('.ts') ||
    normalizedName.endsWith('.java') ||
    normalizedName.endsWith('.py') ||
    normalizedName.endsWith('.vue') ||
    normalizedName.endsWith('.sql')
  ) {
    return 'code';
  }
  if (
    normalizedName.endsWith('.pdf') ||
    normalizedName.endsWith('.doc') ||
    normalizedName.endsWith('.docx') ||
    normalizedName.endsWith('.md') ||
    normalizedName.endsWith('.txt') ||
    normalizedName.endsWith('.fig') ||
    normalizedName.endsWith('.xls') ||
    normalizedName.endsWith('.xlsx') ||
    normalizedName.endsWith('.ppt') ||
    normalizedName.endsWith('.pptx')
  ) {
    return 'document';
  }
  return 'other';
}

export function formatAttachmentSize(size) {
  const value = Number(size || 0);
  if (!value) {
    return '';
  }
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function normalizeAttachmentValue(attachment, index = 0) {
  if (!attachment) {
    return null;
  }

  if (typeof attachment === 'string') {
    return {
      id: `attachment-${index}-${attachment}`,
      name: attachment,
      type: 'application/octet-stream',
      kind: inferAttachmentKind('', attachment),
      size: 0,
      previewUrl: '',
      downloadUrl: ''
    };
  }

  const name = String(attachment.name || '').trim();
  if (!name) {
    return null;
  }

  return {
    id: String(attachment.id || `attachment-${index}-${name}`),
    name,
    type: String(attachment.type || 'application/octet-stream'),
    kind: String(attachment.kind || inferAttachmentKind(attachment.type, name)),
    size: Number(attachment.size || 0),
    previewUrl: String(attachment.previewUrl || ''),
    downloadUrl: String(attachment.downloadUrl || attachment.previewUrl || '')
  };
}

export function normalizedMessageAttachments(message) {
  if (!Array.isArray(message?.attachments)) {
    return [];
  }
  return message.attachments
    .map((attachment, index) => normalizeAttachmentValue(attachment, index))
    .filter(Boolean);
}

export function attachmentKindLabel(kind) {
  if (kind === 'image') {
    return '图片';
  }
  if (kind === 'video') {
    return '视频';
  }
  if (kind === 'archive') {
    return '压缩包';
  }
  if (kind === 'code') {
    return '代码';
  }
  if (kind === 'document') {
    return '文档';
  }
  return '文件';
}

export function attachmentMetaText(attachment) {
  const normalized = normalizeAttachmentValue(attachment);
  if (!normalized) {
    return 'File';
  }
  const sizeText = formatAttachmentSize(normalized.size);
  return sizeText ? `${attachmentKindLabel(normalized.kind)} · ${sizeText}` : attachmentKindLabel(normalized.kind);
}

export function composerAttachmentPayload(attachments) {
  return listOf(attachments).map((attachment) => ({
    id: attachment.id,
    name: attachment.name,
    type: attachment.type,
    kind: attachment.kind,
    size: attachment.size,
    previewUrl: attachment.previewUrl,
    downloadUrl: attachment.downloadUrl
  }));
}

export function buildMessagePayloads(text, attachments, author) {
  const payloads = [];
  const isSystemAuthor = String(author || '').trim() === 'AI 系统消息' || String(author || '').trim().toLowerCase() === 'ai system message';
  if (text) {
    payloads.push({
      author,
      type: isSystemAuthor ? 'SYSTEM' : 'TEXT',
      text,
      attachments: []
    });
  }

  listOf(attachments).forEach((attachment) => {
    payloads.push({
      author,
      type: isSystemAuthor ? 'SYSTEM' : 'TEXT',
      text: '',
      attachments: [
        {
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          kind: attachment.kind,
          size: attachment.size,
          previewUrl: attachment.previewUrl,
          downloadUrl: attachment.downloadUrl
        }
      ]
    });
  });

  return payloads;
}

export function taskConfirmationStatusClass(status) {
  if (status === '待人才确认' || status === 'Needs talent confirmation') {
    return 'is-warning';
  }
  if (status === '待企业修改' || status === 'Needs client revision') {
    return 'is-danger';
  }
  if (status === '已修改' || status === 'Revised') {
    return 'is-info';
  }
  if (status === '已确认' || status === 'Confirmed') {
    return 'is-success';
  }
  return 'is-info';
}

export function mergeMessages(currentMessages = [], nextMessages = []) {
  const bucket = new Map();
  [...currentMessages, ...nextMessages].forEach((item) => {
    const key = item.id || `${item.author}-${item.time}-${item.text}`;
    bucket.set(key, item);
  });
  return Array.from(bucket.values());
}
