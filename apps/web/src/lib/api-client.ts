/**
 * Centralized API client for ServiLocal.
 *
 * – Automatically reads the `csrf_token` cookie and sends it as
 *   `X-CSRF-Token` header on every mutation (POST / PUT / PATCH / DELETE).
 * – Always sends `credentials: 'include'` so that httpOnly cookies
 *   (access_token, refresh_token) travel with every request.
 * – On 401, attempts a single token-refresh; if refresh also fails the
 *   user is redirected to the login page.
 * – Provides typed helpers: `api.get<T>()`, `api.post<T>()`, etc.
 */

import { getApiBaseUrl } from './api-url';
import {
  getCsrfToken,
  invalidateAuthCache,
  logoutSession,
} from './auth-session';

export { logoutSession, invalidateAuthCache };

const API_URL = getApiBaseUrl();

function isMutation(method: string) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes((method || '').toUpperCase());
}

/* ──────────────────────────── refresh ──────────────────────────── */

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const csrf = getCsrfToken();
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
        },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/* ──────────────────────────── core fetch ──────────────────────── */

export type ApiError = {
  status: number;
  message: string;
  raw?: unknown;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  _retried = false,
): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  // JSON body by default
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach CSRF token on mutations
  if (isMutation(method)) {
    const csrf = getCsrfToken();
    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    credentials: 'include',
    headers,
  });

  // 401 → try refresh once
  if (res.status === 401 && !_retried) {
    const isLogout = path === '/api/auth/logout';
    if (!isLogout) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return request<T>(path, options, true);
      }
    }

    invalidateAuthCache();

    if (typeof window !== 'undefined' && !isLogout) {
      window.location.replace('/iniciar-sesion');
    }
    throw { status: 401, message: 'Sesión expirada' } satisfies ApiError;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw {
      status: res.status,
      message: body?.message ?? `Error ${res.status}`,
      raw: body,
    } satisfies ApiError;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

/* ──────────────────────── public helpers ──────────────────────── */

export const api = {
  get<T>(path: string, opts?: RequestInit) {
    return request<T>(path, { ...opts, method: 'GET' });
  },
  post<T>(path: string, body?: unknown, opts?: RequestInit) {
    return request<T>(path, {
      ...opts,
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },
  patch<T>(path: string, body?: unknown, opts?: RequestInit) {
    return request<T>(path, {
      ...opts,
      method: 'PATCH',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },
  put<T>(path: string, body?: unknown, opts?: RequestInit) {
    return request<T>(path, {
      ...opts,
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(path: string, opts?: RequestInit) {
    return request<T>(path, { ...opts, method: 'DELETE' });
  },
  upload<T>(path: string, formData: FormData, opts?: RequestInit) {
    return request<T>(path, {
      ...opts,
      method: 'POST',
      body: formData,
      // Don't set Content-Type, let fetch set it with boundary
    });
  },
  logout() {
    return logoutSession();
  },
};
