/**
 * Base URL del backend sin barra final ni sufijo /api duplicado.
 * Evita rutas como /api/api/... cuando NEXT_PUBLIC_API_URL termina en /api.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
