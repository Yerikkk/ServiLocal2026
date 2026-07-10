import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  sessionId: string;
  exp?: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode base64 to string in Next.js edge runtime
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload) as JwtPayload;
    
    // Check if token is expired
    if (parsed.exp && parsed.exp * 1000 < Date.now()) {
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect routes under /panel
  if (!pathname.startsWith('/panel')) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get('access_token');
  const token = tokenCookie?.value;

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/iniciar-sesion';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  const payload = decodeJwt(token);
  if (!payload || !payload.role) {
    const url = request.nextUrl.clone();
    url.pathname = '/iniciar-sesion';
    url.searchParams.set('redirect', pathname);
    
    const response = NextResponse.redirect(url);
    response.cookies.delete('access_token');
    return response;
  }

  const { role } = payload;

  // Protect Admin panel
  if (pathname.startsWith('/panel/admin') && role !== 'ADMIN') {
    const url = request.nextUrl.clone();
    url.pathname = '/panel';
    return NextResponse.redirect(url);
  }

  // Protect Provider panel
  if (pathname.startsWith('/panel/proveedor') && role !== 'PROVIDER') {
    const url = request.nextUrl.clone();
    url.pathname = '/panel';
    return NextResponse.redirect(url);
  }

  // Protect Client panel
  if (pathname.startsWith('/panel/cliente') && role !== 'CLIENT') {
    const url = request.nextUrl.clone();
    url.pathname = '/panel';
    return NextResponse.redirect(url);
  }

  // Protect Support panel
  if (pathname.startsWith('/panel/soporte') && role !== 'SUPPORT' && role !== 'ADMIN') {
    const url = request.nextUrl.clone();
    url.pathname = '/panel';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/panel/:path*'],
};
