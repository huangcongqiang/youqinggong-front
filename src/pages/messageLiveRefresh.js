export const FALLBACK_REFRESH_MS = 5000;
export const IM_CONNECTED_REFRESH_MS = 15000;

export function shouldRunLiveRefresh({
  visibilityState,
  isSendingMessage,
  isGeneratingRecord,
  isSubmittingTaskAction
}) {
  if (visibilityState === 'hidden') {
    return false;
  }
  return !isSendingMessage && !isGeneratingRecord && !isSubmittingTaskAction;
}

export function nextRefreshInterval(isRealtimeEnabled) {
  return isRealtimeEnabled ? IM_CONNECTED_REFRESH_MS : FALLBACK_REFRESH_MS;
}
