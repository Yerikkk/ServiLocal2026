import { getApiBaseUrl } from './api-url';
import { disconnectSocket } from './socket';

export type UserRole = 'ADMIN' | 'CLIENT' | 'PROVIDER' | 'SUPPORT';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status?: string;
};

const API_URL = getApiBaseUrl();

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith('csrf_token='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export function getRolePath(role: UserRole | string): string {
  switch (role) {
    case 'ADMIN':
      return '/panel/admin';
    case 'SUPPORT':
      return '/panel/soporte';
    case 'PROVIDER':
      return '/panel/proveedor';
    default:
      return '/panel/cliente';
  }
}

/** Limpia la cookie CSRF accesible desde el cliente (las httpOnly las borra el servidor). */
export function clearClientAuthCookies() {
  if (typeof document === 'undefined') return;

  const expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  const variants = [
    'csrf_token=; path=/; expires=' + expires,
    'csrf_token=; path=/; max-age=0',
  ];

  if (host && host !== 'localhost') {
    variants.push(`csrf_token=; path=/; domain=${host}; expires=${expires}`);
  }
  if (host === 'localhost') {
    variants.push(`csrf_token=; path=/; domain=localhost; expires=${expires}`);
  }

  for (const cookie of variants) {
    document.cookie = cookie;
  }
}

let meCache: { user: AuthUser | null; at: number } | null = null;
const ME_CACHE_MS = 15_000;

export function invalidateAuthCache() {
  meCache = null;
}

export async function fetchAuthMe(options?: {
  force?: boolean;
}): Promise<AuthUser | null> {
  const force = options?.force ?? false;
  const now = Date.now();

  if (!force && meCache && now - meCache.at < ME_CACHE_MS) {
    return meCache.user;
  }

  try {
    const res = await fetch(apiUrl('/api/auth/me'), {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    if (!res.ok) {
      meCache = { user: null, at: now };
      return null;
    }

    const user = (await res.json()) as AuthUser;
    meCache = { user, at: now };
    return user;
  } catch {
    return null;
  }
}

function apiUrl(path: string): string {
  const base = API_URL;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Cierra sesión en el servidor (con CSRF), desconecta sockets y recarga en login.
 * Usa navegación completa para evitar estado React obsoleto.
 */
export async function logoutSession(): Promise<void> {
  if (typeof window === 'undefined') return;

  disconnectSocket();
  invalidateAuthCache();

  const csrf = getCsrfToken();

  try {
    await fetch(apiUrl('/api/auth/logout'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
      },
    });
  } catch {
    /* Aunque falle la red, forzamos salida local */
  }

  clearClientAuthCookies();
  window.location.replace('/iniciar-sesion?sesion=cerrada');
}

export function redirectAfterLogin(user: { role: UserRole | string }) {
  invalidateAuthCache();
  window.location.replace(getRolePath(user.role));
}
