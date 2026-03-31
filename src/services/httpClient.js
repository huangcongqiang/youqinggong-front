export function buildAuthHeaders(getToken, extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = typeof getToken === 'function' ? getToken() : '';
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function readResponsePayload(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : null;
}

export function cloneFallbackState(fallback) {
  if (typeof fallback === 'function') {
    return fallback();
  }
  if (Array.isArray(fallback)) {
    return [...fallback];
  }
  if (fallback && typeof fallback === 'object') {
    return { ...fallback };
  }
  return fallback;
}

export function requestErrorMessage(error, fallbackMessage) {
  if (error?.payload?.message) {
    return error.payload.message;
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }
  return fallbackMessage;
}

export function attachRequestError(fallback, error, fallbackMessage = '请求失败，请稍后重试。') {
  const state = cloneFallbackState(fallback);
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    return state;
  }
  return {
    ...state,
    requestError: requestErrorMessage(error, fallbackMessage),
    requestStatus: error?.status || 0
  };
}
