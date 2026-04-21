import { buildAuthHeaders, readResponsePayload, requestErrorMessage, unwrapEnvelopePayload } from './httpClient.js';

function resolveRequestUrl(apiBase, url) {
  if (!url) {
    return apiBase;
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const normalizedBase = String(apiBase || '').trim().replace(/\/+$/, '');
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  if (!normalizedBase) {
    return normalizedPath;
  }
  if (/^https?:\/\//i.test(normalizedBase)) {
    const baseUrl = new URL(normalizedBase);
    if (normalizedPath === '/api' || normalizedPath.startsWith('/api/')) {
      return `${baseUrl.origin}${normalizedPath}`;
    }
  }
  return `${normalizedBase}${normalizedPath}`;
}

async function requestJson(fetchImpl, url, options, fallbackMessage) {
  const response = await fetchImpl(url, options);
  const payload = await readResponsePayload(response);
  try {
    return unwrapEnvelopePayload(response, payload, fallbackMessage);
  } catch (error) {
    error.requestError = requestErrorMessage(error, fallbackMessage);
    throw error;
  }
}

function normalizeUploadErrorMessage(error, fallbackMessage) {
  const rawMessage = requestErrorMessage(error, fallbackMessage);
  if (
    error?.status === 413
    || /413\s+Request\s+Entity\s+Too\s+Large/i.test(rawMessage)
    || /Request\s+Entity\s+Too\s+Large/i.test(rawMessage)
  ) {
    return '上传文件过大，请压缩后再试（单个文件建议不超过 200MB）。';
  }
  return rawMessage;
}

function rethrowUploadError(error, fallbackMessage) {
  const message = normalizeUploadErrorMessage(error, fallbackMessage);
  const wrappedError = new Error(message);
  wrappedError.status = error?.status || 0;
  wrappedError.payload = error?.payload || null;
  wrappedError.requestError = message;
  throw wrappedError;
}

function normalizeRegisteredAttachment(file, presign, registered, source) {
  const downloadUrl = String(registered?.downloadUrl || registered?.url || presign?.downloadUrl || '').trim();
  return {
    name: String(file?.name || registered?.name || '未命名附件'),
    size: Number(file?.size || 0),
    type: String(file?.type || registered?.mimeType || 'application/octet-stream'),
    downloadUrl,
    url: downloadUrl,
    objectKey: String(registered?.objectKey || presign?.objectKey || '').trim(),
    mimeType: String(registered?.mimeType || file?.type || 'application/octet-stream'),
    source: String(registered?.source || source || 'TASK_PROGRESS'),
    uploadId: String(registered?.uploadId || presign?.uploadId || '').trim()
  };
}

export async function uploadTaskAttachmentRuntime(runtime, payload) {
  const file = payload?.file;
  const taskId = String(payload?.taskId || '').trim();
  if (!file || !taskId) {
    throw new Error('上传附件缺少任务或文件上下文。');
  }

  const scene = String(payload?.scene || 'TASK_PROGRESS').trim() || 'TASK_PROGRESS';
  const source = String(payload?.source || scene).trim() || scene;
  const fetchImpl = runtime?.fetchImpl || fetch;
  const apiBase = String(runtime?.apiBase || '').trim();
  const getToken = runtime?.getToken;

  const presign = await requestJson(
    fetchImpl,
    resolveRequestUrl(apiBase, '/uploads/presign'),
    {
      method: 'POST',
      headers: buildAuthHeaders(getToken, {
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size || 0,
        scene,
        taskId
      })
    },
    '当前暂时无法创建上传会话，请稍后再试。'
  );

  try {
    await requestJson(
      fetchImpl,
      resolveRequestUrl(apiBase, String(presign?.uploadUrl || '')),
      {
        method: String(presign?.method || 'PUT').toUpperCase(),
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      },
      '当前暂时无法上传附件，请稍后再试。'
    );
  } catch (error) {
    rethrowUploadError(error, '当前暂时无法上传附件，请稍后再试。');
  }

  const registered = await requestJson(
    fetchImpl,
    resolveRequestUrl(apiBase, `/tasks/${taskId}/files`),
    {
      method: 'POST',
      headers: buildAuthHeaders(getToken, {
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        uploadId: presign?.uploadId,
        name: file.name,
        fileType: payload?.fileType || '',
        source
      })
    },
    '当前暂时无法登记附件，请稍后再试。'
  );

  return normalizeRegisteredAttachment(file, presign, registered, source);
}

export async function uploadStandaloneAttachmentRuntime(runtime, payload) {
  const file = payload?.file;
  if (!file) {
    throw new Error('上传附件缺少文件上下文。');
  }

  const scene = String(payload?.scene || 'ONBOARDING_MATERIAL').trim() || 'ONBOARDING_MATERIAL';
  const source = String(payload?.source || scene).trim() || scene;
  const fetchImpl = runtime?.fetchImpl || fetch;
  const apiBase = String(runtime?.apiBase || '').trim();
  const getToken = runtime?.getToken;

  const presign = await requestJson(
    fetchImpl,
    resolveRequestUrl(apiBase, '/uploads/presign'),
    {
      method: 'POST',
      headers: buildAuthHeaders(getToken, {
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size || 0,
        scene
      })
    },
    '当前暂时无法创建上传会话，请稍后再试。'
  );

  try {
    await requestJson(
      fetchImpl,
      resolveRequestUrl(apiBase, String(presign?.uploadUrl || '')),
      {
        method: String(presign?.method || 'PUT').toUpperCase(),
        headers: {
          'Content-Type': file.type || 'application/octet-stream'
        },
        body: file
      },
      '当前暂时无法上传附件，请稍后再试。'
    );
  } catch (error) {
    rethrowUploadError(error, '当前暂时无法上传附件，请稍后再试。');
  }

  return {
    name: String(file?.name || '未命名附件'),
    size: Number(file?.size || 0),
    type: String(file?.type || 'application/octet-stream'),
    downloadUrl: String(presign?.downloadUrl || '').trim(),
    url: String(presign?.downloadUrl || '').trim(),
    objectKey: String(presign?.objectKey || '').trim(),
    mimeType: String(file?.type || 'application/octet-stream'),
    source,
    uploadId: String(presign?.uploadId || '').trim()
  };
}
