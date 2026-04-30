import { resolveApiBase } from "./apiBase";
import { getStoredAuthToken } from "./authSession";
import { buildAuthHeaders } from "./httpClient";

export interface BusinessRealtimeEvent {
  type?: string;
  scope?: string;
  taskId?: string;
  roomKey?: string;
  status?: string;
  occurredAt?: string;
  [key: string]: unknown;
}

const API_BASE = resolveApiBase(
  import.meta.env as Record<string, string | undefined>,
  typeof window === "undefined" ? globalThis : window
);

export function openBusinessEventStream(
  onEvent: (event: BusinessRealtimeEvent) => void,
  onError?: (error: unknown) => void
) {
  if (typeof window === "undefined" || typeof fetch === "undefined") {
    return () => {};
  }

  let cancelled = false;
  let retryTimer: number | undefined;
  let controller = new AbortController();

  const connect = async () => {
    const token = getStoredAuthToken();
    if (!token || cancelled) {
      return;
    }

    controller = new AbortController();
    try {
      const response = await fetch(`${API_BASE}/events/stream`, {
        headers: buildAuthHeaders(getStoredAuthToken, {
          Accept: "text/event-stream"
        }),
        signal: controller.signal
      });
      if (!response.ok || !response.body) {
        throw new Error(`Event stream unavailable: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let eventEnd = buffer.indexOf("\n\n");
        while (eventEnd >= 0) {
          const block = buffer.slice(0, eventEnd);
          buffer = buffer.slice(eventEnd + 2);
          const data = block
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");
          if (data) {
            onEvent(JSON.parse(data) as BusinessRealtimeEvent);
          }
          eventEnd = buffer.indexOf("\n\n");
        }
      }
    } catch (error) {
      if (!cancelled && (error as { name?: string })?.name !== "AbortError") {
        onError?.(error);
        retryTimer = window.setTimeout(connect, 5000);
      }
    }
  };

  void connect();

  return () => {
    cancelled = true;
    controller.abort();
    if (retryTimer) {
      window.clearTimeout(retryTimer);
    }
  };
}
