'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Home,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  User,
  Users,
  Wrench,
  X,
  Moon,
  Sun,
  Gift,
  CreditCard,
  History,
  LifeBuoy,
  Headphones,
  BookOpen,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTheme } from '@/components/ui/theme-provider';
import { useEffect } from 'react';
import { NotificationsBell } from '@/components/ui/notifications-bell';
import { logoutSession } from '@/lib/auth-session';

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};

const clientLinks: SidebarLink[] = [
  { href: '/panel/cliente', label: 'Inicio', icon: Home },
  { href: '/panel/cliente/perfil', label: 'Mi Perfil', icon: User },
  { href: '/panel/cliente/solicitudes', label: 'Mis solicitudes', icon: FileText },
  { href: '/panel/cliente/mensajes', label: 'Mensajes', icon: MessageSquare },
  { href: '/panel/cliente/notificaciones', label: 'Notificaciones', icon: Bell },
  { href: '/panel/cliente/favoritos', label: 'Mis favoritos', icon: Heart },
  { href: '/servicios', label: 'Catálogo de servicios', icon: Layers },
  { href: '/proveedores', label: 'Buscar proveedores', icon: Search },
  { href: '/panel/cliente/recompensas', label: 'Recompensas', icon: Gift },
  { href: '/panel/cliente/historial', label: 'Historial', icon: History },
  { href: '/ayuda', label: 'Soporte', icon: LifeBuoy },
];

const providerLinks: SidebarLink[] = [
  { href: '/panel/proveedor', label: 'Inicio', icon: Home },
  { href: '/panel/proveedor/perfil', label: 'Mi Perfil', icon: User },
  { href: '/panel/proveedor/solicitudes', label: 'Solicitudes', icon: FileText },
  { href: '/panel/proveedor/mensajes', label: 'Mensajes', icon: MessageSquare },
  { href: '/panel/proveedor/notificaciones', label: 'Notificaciones', icon: Bell },
  { href: '/panel/proveedor/servicios', label: 'Mis Servicios', icon: Package },
  { href: '/panel/proveedor/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { href: '/panel/proveedor/historial', label: 'Historial', icon: History },
  { href: '/panel/proveedor/finanzas', label: 'Facturación', icon: CreditCard },
  { href: '/panel/proveedor/recompensas', label: 'Recompensas', icon: Gift },
  { href: '/panel/proveedor/resenas', label: 'Reseñas', icon: Star },
];

const adminLinks: SidebarLink[] = [
  { href: '/panel/admin', label: 'Panel de Control', icon: BarChart3 },
  { href: '/panel/admin/configuracion', label: 'Configuración', icon: Settings },
];

const supportLinks: SidebarLink[] = [
  { href: '/panel/soporte', label: 'Centro de Soporte', icon: Headphones },
];

type DashboardShellProps = {
  children: React.ReactNode;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN' | 'SUPPORT';
  userName: string;
  userEmail: string;
  notificationCount?: number;
};

export function DashboardShell({ children, role, userName, userEmail, notificationCount = 0 }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && mounted && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const links = role === 'ADMIN' ? adminLinks : role === 'SUPPORT' ? supportLinks : role === 'PROVIDER' ? providerLinks : clientLinks;
  const roleLabel = role === 'ADMIN' ? 'Administrador' : role === 'SUPPORT' ? 'Soporte' : role === 'PROVIDER' ? 'Proveedor' : 'Cliente';
  const roleColor = role === 'ADMIN' ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400' : role === 'SUPPORT' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400' : role === 'PROVIDER' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400';

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    await logoutSession();
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden">
          <Image src="/images/logo.png" alt="ServiLocal Logo" fill className="object-cover p-1" priority />
        </div>
        {!collapsed && (
          <span className="text-lg font-extrabold tracking-[-0.04em]" style={{ color: 'var(--sl-text-primary)' }}>
            Servi<span className="text-[var(--sl-primary)]">Local</span>
          </span>
        )}
      </div>

      {/* User card */}
      <Link 
        href={`/panel/${role === 'ADMIN' ? 'admin' : role === 'PROVIDER' ? 'proveedor' : 'cliente'}/perfil`}
        className={cn('mx-3 rounded-2xl p-3 transition-all hover:bg-[var(--sl-primary)]/10 group', collapsed && 'px-2')} 
        style={{ background: 'var(--sl-primary-muted)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-primary)] text-white font-bold text-sm group-hover:scale-105 transition-transform">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: 'var(--sl-text-primary)' }}>{userName}</p>
              <span className={cn('inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold', roleColor)}>
                {roleLabel}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Nav links */}
      <nav className="mt-4 flex-1 space-y-1 px-3">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-[var(--sl-primary)] text-white shadow-sm'
                  : 'hover:bg-[var(--sl-primary-muted)]',
                collapsed && 'justify-center px-2',
              )}
              style={!active ? { color: 'var(--sl-text-secondary)' } : undefined}
              title={collapsed ? link.label : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{link.label}</span>}
              {link.badge && link.badge > 0 && !collapsed ? (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto space-y-1 px-3 pb-4">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[var(--sl-primary-muted)]',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? (isDark ? 'Modo claro' : 'Modo oscuro') : undefined}
          style={{ color: 'var(--sl-text-secondary)' }}
        >
          {isDark ? <Sun className="h-[18px] w-[18px] shrink-0" /> : <Moon className="h-[18px] w-[18px] shrink-0" />}
          {!collapsed && <span>{isDark ? 'Modo claro' : 'Modo oscuro'}</span>}
        </button>
        <Link
          href={`/panel/${role === 'ADMIN' ? 'admin' : role === 'PROVIDER' ? 'proveedor' : 'cliente'}/configuracion`}
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-[var(--sl-primary-muted)]',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Configuración' : undefined}
          style={{ color: 'var(--sl-text-secondary)' }}
        >
          <Settings className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Configuración</span>}
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400',
            collapsed && 'justify-center px-2',
          )}
          title={collapsed ? 'Cerrar sesión' : undefined}
          style={{ color: 'var(--sl-text-secondary)' }}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>{loggingOut ? 'Saliendo...' : 'Cerrar sesión'}</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[var(--sl-bg)]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex md:flex-col border-r border-[var(--sl-border)] transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64',
        )}
        style={{ background: 'var(--sl-surface)' }}
      >
        {sidebarContent}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-xl border border-[var(--sl-border)] py-2 text-xs transition hover:bg-[var(--sl-primary-muted)]"
          style={{ color: 'var(--sl-text-muted)' }}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Colapsar</>}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col shadow-xl sl-animate-slide-right" style={{ background: 'var(--sl-surface)' }}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 hover:bg-[var(--sl-primary-muted)]"
              style={{ color: 'var(--sl-text-muted)' }}
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar — desktop + mobile */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--sl-border)] backdrop-blur-sm px-4" style={{ background: 'color-mix(in srgb, var(--sl-surface) 90%, transparent)' }}>
          {/* Left — hamburger (mobile only) */}
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 hover:bg-[var(--sl-primary-muted)] md:hidden"
            style={{ color: 'var(--sl-text-secondary)' }}
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Centre — logo (mobile only) */}
          <span className="text-sm font-bold md:hidden" style={{ color: 'var(--sl-text-primary)' }}>
            Servi<span className="text-[var(--sl-primary)]">Local</span>
          </span>

          {/* Right — always visible */}
          <div className="flex items-center gap-2 ml-auto">
            <NotificationsBell role={role} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
