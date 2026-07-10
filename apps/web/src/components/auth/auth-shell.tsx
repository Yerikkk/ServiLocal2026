'use client';

import { Suspense, type ReactNode } from 'react';
import { AuthBrandPanel } from './auth-brand-panel';
import { useTheme } from '@/components/ui/theme-provider';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { usePathname, useSearchParams } from 'next/navigation';
import { fetchAuthMe, getRolePath } from '@/lib/auth-session';

type AuthShellProps = {
  children: ReactNode;
};

function AuthShellInner({ children }: AuthShellProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);

    const recoveryRoutes = ['/recuperar-contrasena', '/restablecer-contrasena'];
    if (recoveryRoutes.some((r) => pathname.startsWith(r))) return;

    if (searchParams.get('sesion') === 'cerrada') return;

    let ignore = false;

    async function checkAuth() {
      const user = await fetchAuthMe();
      if (!ignore && user?.role) {
        window.location.replace(getRolePath(user.role));
      }
    }

    checkAuth();

    return () => {
      ignore = true;
    };
  }, [pathname, searchParams]);

  const isDark = theme === 'dark' || (theme === 'system' && mounted && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const sessionClosed = searchParams.get('sesion') === 'cerrada';

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[0.96fr_1.04fr]" style={{ background: 'var(--sl-bg)' }}>
      <div className="bg-[var(--sl-primary)] px-4 py-4 md:px-5 md:py-5 lg:sticky lg:top-0 lg:h-screen lg:px-6 lg:py-6">
        <AuthBrandPanel />
      </div>

      <div className="relative min-h-screen px-6 py-10 md:px-10 lg:px-14 xl:px-18" style={{ background: 'var(--sl-surface)' }}>
        <div className="absolute left-6 top-6 md:left-10 md:top-10 flex gap-2 z-10">
          <Link
            href="/"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--sl-border)] px-4 text-sm font-medium transition-all hover:bg-[var(--sl-primary-muted)]"
            style={{ background: 'var(--sl-surface)', color: 'var(--sl-text-secondary)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver al inicio</span>
          </Link>
        </div>
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
              "absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--sl-border)] transition-all hover:bg-[var(--sl-primary-muted)]",
              "md:right-10 md:top-10"
            )}
            style={{ background: 'var(--sl-surface)', color: 'var(--sl-text-secondary)' }}
            title="Alternar tema"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        )}
        {sessionClosed ? (
          <div className="mx-auto mt-4 w-full max-w-[500px] rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 md:mt-12">
            Sesión cerrada correctamente. Puedes iniciar sesión de nuevo.
          </div>
        ) : null}
        <div className="mx-auto mt-8 w-full max-w-[500px] md:mt-12">{children}</div>
      </div>
    </div>
  );
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--sl-bg)' }}>
          <p className="text-sm text-slate-500 animate-pulse">Cargando...</p>
        </div>
      }
    >
      <AuthShellInner>{children}</AuthShellInner>
    </Suspense>
  );
}
