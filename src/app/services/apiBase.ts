const DEFAULT_API_TARGET = "spring";

function isLocalDevelopmentHost(hostname = "") {
  return Boolean(
    hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".test") ||
      /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^192\.168\.\d+\.\d+$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname)
  );
}

function resolveDefaultApiBase(runtime: typeof globalThis) {
  const protocol = runtime.location?.protocol;
  const hostname = runtime.location?.hostname;
  const origin = runtime.location?.origin;

  if (protocol && hostname) {
    if (isLocalDevelopmentHost(hostname)) {
      return `${protocol}//${hostname}:8081/api`;
    }
    if (origin) {
      return `${origin}/api`;
    }
  }

  return "http://localhost:8081/api";
}

export function resolveApiTarget() {
  return DEFAULT_API_TARGET;
}

export function resolveApiBase(
  env: Record<string, string | undefined> = {},
  runtime: typeof globalThis = globalThis
) {
  if (env.VITE_API_BASE) {
    return env.VITE_API_BASE;
  }
  return env.VITE_SPRING_API_BASE || resolveDefaultApiBase(runtime);
}

