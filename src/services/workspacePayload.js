export const WORKSPACE_TASK_MISMATCH_MESSAGE = '当前任务数据与请求不一致，请刷新后重试。';

function listOf(value) {
  return Array.isArray(value) ? value : [];
}

function hasOwn(source, key) {
  return Object.prototype.hasOwnProperty.call(source, key);
}

export function normalizeWorkspacePayload(rawData, fallback, requestedTaskId = '') {
  const safeFallback = fallback && typeof fallback === 'object' ? fallback : {};
  const raw = rawData && typeof rawData === 'object' ? rawData : null;

  if (!raw) {
    return safeFallback;
  }

  const requested = String(requestedTaskId || safeFallback?.summary?.taskId || '').trim();
  const rawTaskId = String(raw?.summary?.taskId || raw?.taskDetail?.taskId || '').trim();

  if (requested && rawTaskId && rawTaskId !== requested) {
    return {
      ...safeFallback,
      summary: {
        ...(safeFallback.summary || {}),
        taskId: requested
      },
      requestError: WORKSPACE_TASK_MISMATCH_MESSAGE,
      requestStatus: 409
    };
  }

  return {
    ...safeFallback,
    ...raw,
    summary: {
      ...(safeFallback.summary || {}),
      ...(raw.summary || {})
    },
    taskDetail: hasOwn(raw, 'taskDetail') ? raw.taskDetail : safeFallback.taskDetail,
    taskOptions: hasOwn(raw, 'taskOptions') ? listOf(raw.taskOptions) : listOf(safeFallback.taskOptions),
    collaborationNodes: hasOwn(raw, 'collaborationNodes')
      ? listOf(raw.collaborationNodes)
      : listOf(safeFallback.collaborationNodes),
    focus: raw.focus || safeFallback.focus,
    pulse: hasOwn(raw, 'pulse') ? listOf(raw.pulse) : listOf(safeFallback.pulse),
    executionChecklist: hasOwn(raw, 'executionChecklist')
      ? listOf(raw.executionChecklist)
      : listOf(safeFallback.executionChecklist),
    progressFeed: hasOwn(raw, 'progressFeed') ? listOf(raw.progressFeed) : listOf(safeFallback.progressFeed),
    assetLibrary: hasOwn(raw, 'assetLibrary') ? listOf(raw.assetLibrary) : listOf(safeFallback.assetLibrary),
    aiReviewHistory: hasOwn(raw, 'aiReviewHistory')
      ? listOf(raw.aiReviewHistory)
      : listOf(safeFallback.aiReviewHistory),
    reviewHistory: hasOwn(raw, 'reviewHistory') ? listOf(raw.reviewHistory) : listOf(safeFallback.reviewHistory),
    supportOptions: hasOwn(raw, 'supportOptions') ? listOf(raw.supportOptions) : listOf(safeFallback.supportOptions),
    acceptance: hasOwn(raw, 'acceptance') ? listOf(raw.acceptance) : listOf(safeFallback.acceptance)
  };
}
