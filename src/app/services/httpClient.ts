export function buildAuthHeaders(getToken: () => string, extraHeaders: HeadersInit = {}) {
  const headers = { ...(extraHeaders as Record<string, string>) };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function readResponsePayload(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text ? { msg: text } : null;
}

function buildRequestError(response: Response, payload: any, fallbackMessage: string) {
  const message = payload?.msg || payload?.message || response.statusText || fallbackMessage;
  const error = new Error(message) as Error & {
    status?: number;
    payload?: any;
    requestError?: string;
  };
  error.status = response.status || 0;
  error.payload = payload;
  error.requestError = message;
  return error;
}

export function unwrapEnvelopePayload<T = any>(
  response: Response,
  payload: any,
  fallbackMessage = "请求失败，请稍后重试。"
): T {
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    Object.prototype.hasOwnProperty.call(payload, "code")
  ) {
    if (payload.code === 0) {
      return payload.data as T;
    }
    throw buildRequestError(response, payload, fallbackMessage);
  }

  if (!response.ok) {
    throw buildRequestError(response, payload, fallbackMessage);
  }

  return payload as T;
}

export function requestErrorMessage(error: unknown, fallbackMessage = "请求失败，请稍后重试。") {
  const candidate = error as {
    payload?: { msg?: string; message?: string };
    requestError?: string;
    message?: string;
  };

  return (
    candidate?.payload?.msg ||
    candidate?.payload?.message ||
    candidate?.requestError ||
    candidate?.message ||
    fallbackMessage
  );
}

