const AUTH_TOKEN_KEY = 'youqinggong.auth.token';
const AUTH_USER_KEY = 'youqinggong.auth.user';
const AUTH_EXPIRES_KEY = 'youqinggong.auth.expiresAt';

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredAuthToken() {
  if (!hasStorage()) {
    return '';
  }
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

export function getStoredAuthUser() {
  if (!hasStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getStoredAuthExpiresAt() {
  if (!hasStorage()) {
    return '';
  }
  return window.localStorage.getItem(AUTH_EXPIRES_KEY) || '';
}

export function isAuthSessionExpired(expiresAt) {
  if (!expiresAt) {
    return false;
  }
  const expiresAtMs = Date.parse(expiresAt);
  if (Number.isNaN(expiresAtMs)) {
    return false;
  }
  return expiresAtMs <= Date.now();
}

export function hasFreshStoredAuthSession() {
  const token = getStoredAuthToken();
  if (!token) {
    return false;
  }
  return !isAuthSessionExpired(getStoredAuthExpiresAt());
}

export function persistAuthSession(token, user, expiresAt) {
  if (!hasStorage()) {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  if (expiresAt) {
    window.localStorage.setItem(AUTH_EXPIRES_KEY, expiresAt);
  }
}

export function clearStoredAuthSession() {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem(AUTH_EXPIRES_KEY);
}
