'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, Wrench, X, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTheme } from '@/components/ui/theme-provider';

import { fetchAuthMe } from '@/lib/auth-session';

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
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    fetchAuthMe().then((data) => {
      if (data) setUser({ role: data.role, fullName: data.fullName });
      else setUser(null);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((winScroll / height) * 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && mounted && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className={cn(
      "sticky top-0 z-50 transition-all duration-300",
      scrolled ? "sl-glass-premium border-b border-[var(--sl-border)] shadow-sm" : "bg-transparent border-b border-transparent"
    )}>
      {/* Scroll Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-cyan-400 via-[var(--sl-primary)] to-blue-500 transition-all duration-150 ease-out z-50"
        style={{ width: `${scrollProgress}%` }}
      />
      
      <div className={cn(
        "mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8 transition-all duration-300",
        scrolled ? "h-16" : "h-20"
      )}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110 group-hover:rotate-3 overflow-hidden">
            <Image src="/images/logo.png" alt="ServiLocal Logo" fill className="object-cover p-1" priority />
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
              href={(user.role === 'ADMIN' ? '/panel/admin' : user.role === 'PROVIDER' ? '/panel/proveedor' : '/panel/cliente')}
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

