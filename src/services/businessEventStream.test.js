import { parseBusinessEventChunks, startBusinessLiveSync } from './businessEventStream.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}\nexpected: ${expected}\nactual: ${actual}`);
  }
}

const parsed = parseBusinessEventChunks(
  'event: workspace.feedback.updated\n' +
  'data: {"taskId":"task-001","scope":"workspace"}\n\n' +
  'event: task.acceptance.updated\n' +
  'data: {"taskId":"task-001","scope":"acceptance"}\n\n'
);

assertEqual(parsed.events.length, 2, 'parseBusinessEventChunks should parse multiple SSE frames');
assertEqual(parsed.events[0].event, 'workspace.feedback.updated', 'parseBusinessEventChunks should preserve event name');
assertEqual(parsed.events[0].data.taskId, 'task-001', 'parseBusinessEventChunks should parse JSON payload');
assertEqual(parsed.events[1].data.scope, 'acceptance', 'parseBusinessEventChunks should parse following payloads');
assertEqual(parsed.rest, '', 'parseBusinessEventChunks should leave no rest for complete frames');

const partial = parseBusinessEventChunks(
  'event: task.lifecycle.updated\n' +
  'data: {"taskId":"task-002"}\n'
);

assertEqual(partial.events.length, 0, 'parseBusinessEventChunks should keep partial frames pending');
assert(partial.rest.includes('task-002'), 'parseBusinessEventChunks should preserve incomplete frame content');

const crlfParsed = parseBusinessEventChunks(
  'event: task.lifecycle.updated\r\n' +
  'data: {"taskId":"task-003","scope":"notifications"}\r\n\r\n'
);

assertEqual(crlfParsed.events.length, 1, 'parseBusinessEventChunks should parse CRLF-delimited SSE frames');
assertEqual(crlfParsed.events[0].data.taskId, 'task-003', 'parseBusinessEventChunks should preserve payload for CRLF frames');

const originalFetch = globalThis.fetch;
const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalAbortController = globalThis.AbortController;
const encoder = new TextEncoder();
let visibilityHandler = null;
let fetchCalls = 0;
const localStorageState = new Map([
  ['youqinggong.auth.token', 'test-token'],
  ['youqinggong.auth.expiresAt', '2099-01-01T00:00:00.000Z']
]);

globalThis.window = {
  localStorage: {
    getItem(key) {
      return localStorageState.has(key) ? localStorageState.get(key) : null;
    },
    setItem(key, value) {
      localStorageState.set(key, String(value));
    },
    removeItem(key) {
      localStorageState.delete(key);
    }
  },
  setInterval: globalThis.setInterval.bind(globalThis),
  clearInterval: globalThis.clearInterval.bind(globalThis)
};

globalThis.AbortController = class AbortControllerStub {
  constructor() {
    this.signal = {};
  }

  abort() {}
};

globalThis.document = {
  visibilityState: 'visible',
  addEventListener(type, handler) {
    if (type === 'visibilitychange') {
      visibilityHandler = handler;
    }
  },
  removeEventListener(type, handler) {
    if (type === 'visibilitychange' && visibilityHandler === handler) {
      visibilityHandler = null;
    }
  }
};

globalThis.fetch = async () => {
  fetchCalls += 1;
  if (fetchCalls === 1) {
    throw new Error('stream failed once');
  }

  return {
    ok: true,
    body: {
      getReader() {
        let sent = false;
        return {
          async read() {
            if (sent) {
              return { done: true, value: undefined };
            }
            sent = true;
            return {
              done: false,
              value: encoder.encode('event: system.connected\ndata: {"scope":"stream"}\n\n')
            };
          }
        };
      }
    }
  };
};

const liveSyncStop = startBusinessLiveSync({
  refresh() {},
  fallbackMs: 10000
});

await new Promise((resolve) => setTimeout(resolve, 0));
assertEqual(fetchCalls, 1, 'startBusinessLiveSync should attempt the stream immediately');

visibilityHandler?.();
await new Promise((resolve) => setTimeout(resolve, 0));

assertEqual(fetchCalls, 2, 'startBusinessLiveSync should reconnect the stream after a failure when the page becomes visible again');

liveSyncStop();
globalThis.fetch = originalFetch;
globalThis.window = originalWindow;
globalThis.document = originalDocument;
globalThis.AbortController = originalAbortController;

const statusSnapshots = [];
const syncErrors = [];
visibilityHandler = null;
fetchCalls = 0;

globalThis.window = {
  localStorage: {
    getItem(key) {
      return localStorageState.has(key) ? localStorageState.get(key) : null;
    },
    setItem(key, value) {
      localStorageState.set(key, String(value));
    },
    removeItem(key) {
      localStorageState.delete(key);
    }
  },
  setInterval: globalThis.setInterval.bind(globalThis),
  clearInterval: globalThis.clearInterval.bind(globalThis)
};

globalThis.AbortController = class AbortControllerStub {
  constructor() {
    this.signal = {};
  }

  abort() {}
};

globalThis.document = {
  visibilityState: 'visible',
  addEventListener(type, handler) {
    if (type === 'visibilitychange') {
      visibilityHandler = handler;
    }
  },
  removeEventListener(type, handler) {
    if (type === 'visibilitychange' && visibilityHandler === handler) {
      visibilityHandler = null;
    }
  }
};

globalThis.fetch = async () => {
  fetchCalls += 1;
  if (fetchCalls === 1) {
    throw new Error('stream failed once');
  }
  return {
    ok: true,
    body: {
      getReader() {
        let sent = false;
        return {
          async read() {
            if (sent) {
              return { done: true, value: undefined };
            }
            sent = true;
            return {
              done: false,
              value: encoder.encode('event: system.connected\ndata: {"scope":"stream"}\n\n')
            };
          }
        };
      }
    }
  };
};

const statusStop = startBusinessLiveSync({
  refresh() {},
  fallbackMs: 10000,
  onStatusChange(snapshot) {
    statusSnapshots.push(snapshot);
  },
  onSyncError(error, meta) {
    syncErrors.push({
      message: error?.message ?? '',
      stage: meta?.stage ?? '',
      status: meta?.status ?? ''
    });
  }
});

await new Promise((resolve) => setTimeout(resolve, 0));

assert(statusSnapshots.some((snapshot) => snapshot.state === 'connecting' && snapshot.transport === 'stream'), 'startBusinessLiveSync should report connecting state for the stream');
assert(statusSnapshots.some((snapshot) => snapshot.state === 'fallback' && snapshot.transport === 'poll'), 'startBusinessLiveSync should report fallback state after stream failures');
assertEqual(syncErrors[0]?.stage, 'connect', 'startBusinessLiveSync should report the connection stage when the stream fails');

visibilityHandler?.();
await new Promise((resolve) => setTimeout(resolve, 0));

const openSnapshot = statusSnapshots.find((snapshot) => snapshot.state === 'open');
assert(openSnapshot, 'startBusinessLiveSync should report an open state after reconnecting');
assertEqual(openSnapshot.transport, 'stream', 'startBusinessLiveSync should report stream transport after reconnecting');
assertEqual(openSnapshot.reconnectCount, 1, 'startBusinessLiveSync should increment reconnect count after one failed reconnect');
assert(openSnapshot.lastConnectedAt, 'startBusinessLiveSync should report the last connected timestamp');

statusStop();

assert(statusSnapshots[statusSnapshots.length - 1]?.state === 'disposed', 'startBusinessLiveSync should report a disposed state when stopped');

localStorageState.delete('youqinggong.auth.token');
const disabledSnapshots = [];
let disabledFetchCalls = 0;
globalThis.fetch = async () => {
  disabledFetchCalls += 1;
  throw new Error('should not fetch without a token');
};

const disabledStop = startBusinessLiveSync({
  refresh() {},
  onStatusChange(snapshot) {
    disabledSnapshots.push(snapshot);
  }
});

assertEqual(disabledFetchCalls, 0, 'startBusinessLiveSync should not attempt the stream without a token');
assertEqual(disabledSnapshots[0]?.state, 'disabled', 'startBusinessLiveSync should report disabled when no auth token is available');
assertEqual(disabledSnapshots[0]?.reason, 'missing_token', 'startBusinessLiveSync should explain why the stream is disabled');

disabledStop();
localStorageState.set('youqinggong.auth.token', 'test-token');
globalThis.fetch = originalFetch;
globalThis.window = originalWindow;
globalThis.document = originalDocument;
globalThis.AbortController = originalAbortController;
