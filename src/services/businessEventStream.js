import { getStoredAuthToken } from './authSession.js';
import { resolveApiBase } from './apiBase.js';
import { buildAuthHeaders } from './httpClient.js';

const API_BASE = resolveApiBase(import.meta.env, typeof window === 'undefined' ? globalThis : window);
const STREAM_PATH = '/events/stream';

function isoNow() {
  return new Date().toISOString();
}

export function parseBusinessEventChunks(buffer) {
  const normalizedBuffer = typeof buffer === 'string' ? buffer.replace(/\r\n/g, '\n') : '';
  const events = [];
  let rest = normalizedBuffer;

  while (true) {
    const frameEnd = rest.indexOf('\n\n');
    if (frameEnd < 0) {
      break;
    }

    const frame = rest.slice(0, frameEnd);
    rest = rest.slice(frameEnd + 2);

    if (!frame.trim()) {
      continue;
    }

    let eventName = 'message';
    const dataLines = [];
    for (const rawLine of frame.split('\n')) {
      const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim() || eventName;
        continue;
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (!dataLines.length) {
      continue;
    }

    const rawData = dataLines.join('\n');
    let payload = rawData;
    try {
      payload = JSON.parse(rawData);
    } catch (error) {
      payload = rawData;
    }

    if (payload && typeof payload === 'object' && !Array.isArray(payload) && !payload.type) {
      payload.type = eventName;
    }

    events.push({
      event: eventName,
      data: payload
    });
  }

  return { events, rest };
}

export function connectBusinessEventStream({ onOpen, onEvent, onError, onStatusChange, onSyncError } = {}) {
  const token = getStoredAuthToken();
  if (!token || typeof fetch !== 'function') {
    onStatusChange?.({
      state: 'disabled',
      transport: 'stream',
      reason: token ? 'fetch_unavailable' : 'missing_token',
      fallbackActive: false,
      reconnectCount: 0,
      lastConnectedAt: '',
      lastErrorAt: ''
    });
    return () => {};
  }

  const controller = new AbortController();
  const decoder = new TextDecoder();
  let active = true;

  onStatusChange?.({
    state: 'connecting',
    transport: 'stream',
    reason: 'connect',
    fallbackActive: false,
    reconnectCount: 0,
    lastConnectedAt: '',
    lastErrorAt: ''
  });

  (async () => {
    try {
      const response = await fetch(`${API_BASE}${STREAM_PATH}`, {
        method: 'GET',
        headers: buildAuthHeaders(getStoredAuthToken, {
          Accept: 'text/event-stream'
        }),
        signal: controller.signal
      });

      if (!response.ok || !response.body) {
        const error = new Error(`Event stream failed: ${response.status}`);
        error.status = response.status;
        throw error;
      }

      const openedAt = isoNow();
      onOpen?.();
      onStatusChange?.({
        state: 'open',
        transport: 'stream',
        reason: 'connected',
        fallbackActive: false,
        reconnectCount: 0,
        lastConnectedAt: openedAt,
        lastErrorAt: ''
      });

      const reader = response.body.getReader();
      let buffer = '';

      while (active) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parsed = parseBusinessEventChunks(buffer);
        buffer = parsed.rest;

        for (const item of parsed.events) {
          onEvent?.(item.data, item.event);
        }
      }

      if (active) {
        const closedError = new Error('Event stream closed');
        closedError.stage = 'closed';
        throw closedError;
      }
    } catch (error) {
      if (active && error?.name !== 'AbortError') {
        const meta = {
          stage: error?.stage || 'connect',
          status: error?.status ?? ''
        };
        onSyncError?.(error, meta);
        onError?.(error, meta);
      }
    }
  })();

  return () => {
    active = false;
    controller.abort();
  };
}

export function startBusinessLiveSync({
  refresh,
  acceptsEvent,
  fallbackMs = 6000,
  shouldPause,
  onStatusChange,
  onSyncError
} = {}) {
  if (typeof refresh !== 'function') {
    return () => {};
  }

  if (!getStoredAuthToken()) {
    onStatusChange?.({
      state: 'disabled',
      transport: 'stream',
      reason: 'missing_token',
      fallbackActive: false,
      reconnectCount: 0,
      lastConnectedAt: '',
      lastErrorAt: ''
    });
    return () => {};
  }

  let stopStream = null;
  let fallbackTimer = null;
  let disposed = false;
  let reconnectCount = 0;
  let lastConnectedAt = '';
  let lastErrorAt = '';
  let fallbackActive = false;

  const reportStatus = (state, overrides = {}) => {
    onStatusChange?.({
      state,
      transport: overrides.transport ?? (fallbackActive ? 'poll' : 'stream'),
      reason: overrides.reason ?? '',
      fallbackActive: overrides.fallbackActive ?? fallbackActive,
      reconnectCount,
      lastConnectedAt: overrides.lastConnectedAt ?? lastConnectedAt,
      lastErrorAt: overrides.lastErrorAt ?? lastErrorAt
    });
  };

  const reportSyncError = (error, meta = {}) => {
    lastErrorAt = isoNow();
    onSyncError?.(error, {
      ...meta,
      reconnectCount,
      lastErrorAt
    });
  };

  const canRefresh = (event) => {
    if (disposed) {
      return false;
    }
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      reportStatus('paused', {
        reason: 'hidden',
        transport: fallbackActive ? 'poll' : 'stream'
      });
      return false;
    }
    if (typeof shouldPause === 'function' && shouldPause(event)) {
      reportStatus('paused', {
        reason: 'should_pause',
        transport: fallbackActive ? 'poll' : 'stream'
      });
      return false;
    }
    if (typeof acceptsEvent === 'function' && event && !acceptsEvent(event)) {
      return false;
    }
    return true;
  };

  const stopFallback = () => {
    if (typeof window !== 'undefined' && fallbackTimer) {
      window.clearInterval(fallbackTimer);
    }
    fallbackTimer = null;
    fallbackActive = false;
  };

  const startFallback = (reason = 'stream_error') => {
    if (typeof window === 'undefined' || fallbackTimer) {
      return;
    }
    fallbackActive = true;
    reportStatus('fallback', {
      reason,
      transport: 'poll',
      fallbackActive: true
    });
    fallbackTimer = window.setInterval(() => {
      if (!canRefresh()) {
        return;
      }
      void refresh({ reason: 'poll' });
    }, fallbackMs);
  };

  const startStream = () => {
    stopStream?.();
    stopStream = connectBusinessEventStream({
      onStatusChange(snapshot) {
        if (snapshot.state === 'connecting') {
          reportStatus('connecting', {
            reason: snapshot.reason,
            transport: 'stream',
            fallbackActive
          });
          return;
        }
        if (snapshot.state === 'open') {
          lastConnectedAt = snapshot.lastConnectedAt || isoNow();
          stopFallback();
          reportStatus('open', {
            reason: snapshot.reason,
            transport: 'stream',
            fallbackActive: false,
            lastConnectedAt
          });
        }
      },
      onOpen() {
      },
      onEvent(event) {
        if (!event || event.type === 'system.connected') {
          return;
        }
        if (!canRefresh(event)) {
          return;
        }
        void refresh({ reason: 'event', event });
      },
      onSyncError(error, meta) {
        reportSyncError(error, meta);
      },
      onError(error, meta) {
        stopStream = null;
        reconnectCount += 1;
        lastErrorAt = isoNow();
        startFallback(meta?.stage === 'closed' ? 'stream_closed' : 'stream_error');
      }
    });
  };

  startStream();

  const handleVisibilityChange = () => {
    if (disposed || typeof document === 'undefined') {
      return;
    }
    if (document.visibilityState === 'hidden') {
      reportStatus('paused', {
        reason: 'hidden',
        transport: fallbackActive ? 'poll' : 'stream'
      });
      return;
    }
    void refresh({ reason: 'focus' });
    if (!stopStream) {
      startStream();
      return;
    }
    stopStream?.();
    startStream();
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return () => {
    disposed = true;
    stopFallback();
    stopStream?.();
    stopStream = null;
    reportStatus('disposed', {
      reason: 'disposed',
      transport: 'stream',
      fallbackActive: false
    });
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
}
