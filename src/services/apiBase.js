const DEFAULT_API_TARGET = 'spring';

function resolveDefaultApiBase(runtime) {
  if (runtime?.location?.protocol && runtime?.location?.hostname) {
    return `${runtime.location.protocol}//${runtime.location.hostname}:8081/api`;
  }
  return 'http://localhost:8081/api';
}

export function resolveApiTarget() {
  return DEFAULT_API_TARGET;
}

export function resolveApiBase(env = {}, runtime = globalThis) {
  if (env?.VITE_API_BASE) {
    return env.VITE_API_BASE;
  }
  return env?.VITE_SPRING_API_BASE || resolveDefaultApiBase(runtime);
}
