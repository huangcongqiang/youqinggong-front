import { uploadTaskAttachmentRuntime } from './uploadWorkflow.js';

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

const calls = [];
const file = {
  name: '字段映射说明.md',
  size: 88,
  type: 'text/markdown'
};

function createHeaders(values = {}) {
  const normalized = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [String(key).toLowerCase(), value])
  );
  return {
    get(name) {
      return normalized[String(name).toLowerCase()] || null;
    }
  };
}

async function fakeFetch(url, options = {}) {
  calls.push({ url, options });
  if (url.endsWith('/uploads/presign')) {
    return {
      ok: true,
      headers: createHeaders({ 'content-type': 'application/json' }),
      json: async () => ({
        uploadId: 'upload-001',
        method: 'PUT',
        uploadUrl: '/api/uploads/upload-001/binary',
        downloadUrl: '/api/uploads/upload-001/content',
        objectKey: 'task-progress/task-001/upload-001/field-map.md'
      })
    };
  }

  if (url.endsWith('/api/uploads/upload-001/binary')) {
    return {
      ok: true,
      headers: createHeaders({ 'content-type': 'application/json' }),
      json: async () => ({
        uploadId: 'upload-001',
        status: 'UPLOADED'
      })
    };
  }

  if (url.endsWith('/tasks/task-001/files')) {
    return {
      ok: true,
      headers: createHeaders({ 'content-type': 'application/json' }),
      json: async () => ({
        uploadId: 'upload-001',
        name: '字段映射说明.md',
        url: '/api/uploads/upload-001/content',
        objectKey: 'task-progress/task-001/upload-001/field-map.md',
        mimeType: 'text/markdown',
        source: 'TASK_PROGRESS'
      })
    };
  }

  throw new Error(`unexpected url: ${url}`);
}

const result = await uploadTaskAttachmentRuntime(
  {
    apiBase: 'http://localhost:8080/api',
    getToken: () => 'token-001',
    fetchImpl: fakeFetch
  },
  {
    taskId: 'task-001',
    scene: 'TASK_PROGRESS',
    source: 'TASK_PROGRESS',
    file
  }
);

assertEqual(calls.length, 3, 'uploadTaskAttachmentRuntime should complete presign, binary upload, and register calls');
assertEqual(calls[0].url, 'http://localhost:8080/api/uploads/presign', 'presign should target uploads endpoint');
assertEqual(calls[1].url, 'http://localhost:8080/api/uploads/upload-001/binary', 'binary upload should follow returned uploadUrl');
assertEqual(calls[2].url, 'http://localhost:8080/api/tasks/task-001/files', 'register should target task files endpoint');
assertEqual(result.uploadId, 'upload-001', 'normalized attachment should expose upload id');
assertEqual(result.objectKey, 'task-progress/task-001/upload-001/field-map.md', 'normalized attachment should expose object key');
assertEqual(result.url, '/api/uploads/upload-001/content', 'normalized attachment should expose download url as canonical url');
assertEqual(result.source, 'TASK_PROGRESS', 'normalized attachment should preserve source');
assertEqual(result.mimeType, 'text/markdown', 'normalized attachment should preserve mime type');
assert(calls[0].options.headers.Authorization === 'Bearer token-001', 'presign should include auth header');
