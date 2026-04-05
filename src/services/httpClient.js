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
  return text ? { msg: text } : null;
}

function buildRequestError(response, payload, fallbackMessage) {
  const message = payload?.msg || response?.statusText || fallbackMessage;
  const error = new Error(message);
  error.status = response?.status || 0;
  error.payload = payload;
  error.requestError = message;
  return error;
}

export function unwrapEnvelopePayload(response, payload, fallbackMessage = '请求失败，请稍后重试。') {
  if (payload && typeof payload === 'object' && !Array.isArray(payload) && Object.prototype.hasOwnProperty.call(payload, 'code')) {
    if (payload.code === 0) {
      return payload.data;
    }
    throw buildRequestError(response, payload, fallbackMessage);
  }
  if (!response.ok) {
    throw buildRequestError(response, payload, fallbackMessage);
  }
  return payload;
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
  if (error?.payload?.msg) {
    return error.payload.msg;
  }
  if (typeof error?.requestError === 'string' && error.requestError.trim()) {
    return error.requestError;
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
