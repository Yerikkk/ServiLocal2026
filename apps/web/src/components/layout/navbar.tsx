'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, Wrench, X, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTheme } from '@/components/ui/theme-provider';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const navLinks = [
  { href: '/servicios', label: 'Servicios' },
  { href: '/proveedores', label: 'Proveedores' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
  { href: '/ayuda', label: 'Ayuda' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ role: string; fullName: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check session
    fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && mounted && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--sl-border)] sl-glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sl-primary)] shadow-sm transition group-hover:shadow-md group-hover:scale-105">
            <Wrench className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--sl-text-primary)' }}>
            Servi<span className="text-[var(--sl-primary)]">Local</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
                pathname === link.href
                  ? 'bg-[var(--sl-primary-muted)] text-[var(--sl-primary)] font-semibold'
                  : 'hover:bg-[var(--sl-primary-muted)]',
              )}
              style={pathname !== link.href ? { color: 'var(--sl-text-secondary)' } : undefined}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2 mr-2 h-6 w-px" style={{ background: 'var(--sl-border)' }} />
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-[var(--sl-primary-muted)]"
            style={{ color: 'var(--sl-text-secondary)' }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          {user ? (
            <Link
              href={user.role === 'ADMIN' ? '/panel/admin' : user.role === 'PROVIDER' ? '/panel/proveedor' : '/panel/cliente'}
              className="ml-2 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--sl-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--sl-primary-hover)] hover:shadow-md active:scale-[0.98]"
            >
              Mi Panel
            </Link>
          ) : (
            <>
              <Link
                href="/iniciar-sesion"
                className="ml-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-[var(--sl-primary-muted)]"
                style={{ color: 'var(--sl-text-secondary)' }}
              >
                Ingresar
              </Link>
              <Link
                href="/registrarse"
                className="ml-1 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--sl-primary)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--sl-primary-hover)] hover:shadow-md active:scale-[0.98]"
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-[var(--sl-primary-muted)] md:hidden"
          style={{ color: 'var(--sl-text-secondary)' }}
          aria-label="Menú"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[var(--sl-border)] px-5 pb-5 pt-3 md:hidden sl-animate-fade-in" style={{ background: 'var(--sl-surface)' }}>
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block rounded-xl px-4 py-3 text-sm font-medium transition',
                  pathname === link.href
                    ? 'bg-[var(--sl-primary-muted)] text-[var(--sl-primary)] font-semibold'
                    : 'hover:bg-[var(--sl-primary-muted)]',
                )}
                style={pathname !== link.href ? { color: 'var(--sl-text-secondary)' } : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-3 h-px" style={{ background: 'var(--sl-border-light)' }} />
            <button
              onClick={() => {
                setTheme(isDark ? 'light' : 'dark');
                setMobileOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-[var(--sl-primary-muted)]"
              style={{ color: 'var(--sl-text-secondary)' }}
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              {isDark ? 'Modo claro' : 'Modo oscuro'}
            </button>
            <div className="my-3 h-px" style={{ background: 'var(--sl-border-light)' }} />
            {user ? (
              <Link
                href={user.role === 'ADMIN' ? '/panel/admin' : user.role === 'PROVIDER' ? '/panel/proveedor' : '/panel/cliente'}
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-xl bg-[var(--sl-primary)] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Mi Panel
              </Link>
            ) : (
              <>
                <Link
                  href="/iniciar-sesion"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-[var(--sl-primary-muted)]"
                  style={{ color: 'var(--sl-text-secondary)' }}
                >
                  Ingresar
                </Link>
                <Link
                  href="/registrarse"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 block rounded-xl bg-[var(--sl-primary)] px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

