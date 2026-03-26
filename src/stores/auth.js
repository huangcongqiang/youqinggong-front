import { reactive } from 'vue';
import {
  clearStoredAuthSession,
  getAuthMe,
  getStoredAuthExpiresAt,
  getStoredAuthToken,
  getStoredAuthUser,
  isAuthSessionExpired,
  loginAuth,
  logoutAuth,
  persistAuthSession,
  registerAuth
} from '../services/api';

const authState = reactive({
  initialized: false,
  loading: false,
  token: getStoredAuthToken(),
  user: getStoredAuthUser(),
  expiresAt: getStoredAuthExpiresAt()
});

function applySession(token, user, expiresAt = '') {
  authState.token = token || '';
  authState.user = user || null;
  authState.expiresAt = expiresAt || '';

  if (token && user) {
    persistAuthSession(token, user, expiresAt);
    return;
  }

  clearStoredAuthSession();
}

export function useAuthState() {
  return authState;
}

export async function hydrateAuthSession() {
  if (!authState.token) {
    authState.initialized = true;
    authState.user = getStoredAuthUser();
    authState.expiresAt = getStoredAuthExpiresAt();
    return authState;
  }

  if (isAuthSessionExpired(authState.expiresAt)) {
    applySession('', null, '');
    authState.initialized = true;
    return authState;
  }

  const result = await getAuthMe();
  if (result?.authenticated && result.user) {
    applySession(authState.token, result.user, result.expiresAt || authState.expiresAt);
  } else {
    applySession('', null, '');
  }

  authState.initialized = true;
  return authState;
}

export async function refreshAuthSession() {
  if (!authState.token) {
    return authState;
  }

  if (isAuthSessionExpired(authState.expiresAt)) {
    applySession('', null, '');
    return authState;
  }

  const result = await getAuthMe();
  if (result?.authenticated && result.user) {
    applySession(authState.token, result.user, result.expiresAt || authState.expiresAt);
  } else {
    applySession('', null, '');
  }
  return authState;
}

export async function registerWithAccount(payload) {
  authState.loading = true;
  try {
    const result = await registerAuth(payload);
    if (result?.success && result.token && result.user) {
      applySession(result.token, result.user, result.expiresAt || '');
    }
    return result;
  } finally {
    authState.loading = false;
  }
}

export async function loginWithAccount(payload) {
  authState.loading = true;
  try {
    const result = await loginAuth(payload);
    if (result?.success && result.token && result.user) {
      applySession(result.token, result.user, result.expiresAt || '');
    }
    return result;
  } finally {
    authState.loading = false;
  }
}

export async function signOut() {
  authState.loading = true;
  try {
    await logoutAuth();
  } finally {
    applySession('', null, '');
    authState.loading = false;
    authState.initialized = true;
  }
}
