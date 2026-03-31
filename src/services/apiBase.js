const DEFAULT_API_TARGET = 'spring';
const API_TARGET_STORAGE_KEY = 'youqinggong.api.target';

function normalizeApiTarget(value) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return normalized === 'mock' || normalized === 'spring' ? normalized : '';
}

function readQueryApiTarget(search = '') {
  const query = typeof search === 'string' ? search : '';
  if (!query) {
    return '';
  }
  const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query);
  return normalizeApiTarget(params.get('apiTarget'));
}

function readStoredApiTarget(runtime) {
  try {
    return normalizeApiTarget(runtime?.localStorage?.getItem(API_TARGET_STORAGE_KEY));
  } catch (error) {
    return '';
  }
}

function persistApiTarget(runtime, apiTarget) {
  try {
    runtime?.localStorage?.setItem(API_TARGET_STORAGE_KEY, apiTarget);
  } catch (error) {
    // Ignore storage failures so the runtime can still resolve a target.
  }
}

function resolveDefaultApiBase(target, runtime) {
  if (runtime?.location?.protocol && runtime?.location?.hostname) {
    const port = target === 'mock' ? '8080' : '8081';
    return `${runtime.location.protocol}//${runtime.location.hostname}:${port}/api`;
  }
  return target === 'mock' ? 'http://localhost:8080/api' : 'http://localhost:8081/api';
}

export function resolveApiTarget(env = {}, runtime = globalThis) {
  const queryTarget = readQueryApiTarget(runtime?.location?.search);
  if (queryTarget) {
    persistApiTarget(runtime, queryTarget);
    return queryTarget;
  }
  return (
    readStoredApiTarget(runtime) ||
    normalizeApiTarget(env?.VITE_API_TARGET) ||
    DEFAULT_API_TARGET
  );
}

export function resolveApiBase(env = {}, runtime = globalThis) {
  if (env?.VITE_API_BASE) {
    return env.VITE_API_BASE;
  }
  const apiTarget = resolveApiTarget(env, runtime);
  if (apiTarget === 'mock') {
    return env?.VITE_ROOT_MOCK_API_BASE || resolveDefaultApiBase('mock', runtime);
  }
  return env?.VITE_SPRING_API_BASE || resolveDefaultApiBase('spring', runtime);
}
