'use client';

import type { ReactNode } from 'react';
import { AuthBrandPanel } from './auth-brand-panel';
import { useTheme } from '@/components/ui/theme-provider';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { usePathname, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    // Rutas de recuperación: permitir acceso aunque haya sesión activa
    const recoveryRoutes = ['/recuperar-contrasena', '/restablecer-contrasena'];
    if (recoveryRoutes.some((r) => pathname.startsWith(r))) return;

    // Check if already authenticated to prevent back-button logout bug
    async function checkAuth() {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
        if (res.ok) {
          router.replace('/panel');
        }
      } catch { /* ignore */ }
    }
    checkAuth();
  }, [router, pathname]);

  const isDark = theme === 'dark' || (theme === 'system' && mounted && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[0.96fr_1.04fr]" style={{ background: 'var(--sl-bg)' }}>
      <div className="bg-[var(--sl-primary)] px-4 py-4 md:px-5 md:py-5 lg:sticky lg:top-0 lg:h-screen lg:px-6 lg:py-6">
        <AuthBrandPanel />
      </div>

      <div className="relative min-h-screen px-6 py-10 md:px-10 lg:px-14 xl:px-18" style={{ background: 'var(--sl-surface)' }}>
        {/* Navigation Actions */}
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
        <div className="mx-auto mt-8 w-full max-w-[500px] md:mt-12">{children}</div>
      </div>
    </div>
  );
}