'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCheck,
  ChevronRight,
  FileText,
  Info,
  MessageSquare,
  ShieldCheck,
  Star,
  Zap,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useNotifications, type Notification } from '@/hooks/use-notifications';

/* ─── Notification type → icon / color ─────── */

type IconMeta = { icon: React.ElementType; bg: string; text: string };

function getIconMeta(type: string): IconMeta {
  const map: Record<string, IconMeta> = {
    SERVICE_REQUEST_CREATED:   { icon: FileText,     bg: 'bg-blue-100',    text: 'text-blue-600' },
    SERVICE_REQUEST_ACCEPTED:  { icon: CheckCheck,   bg: 'bg-emerald-100', text: 'text-emerald-600' },
    SERVICE_REQUEST_CANCELLED: { icon: X,            bg: 'bg-red-100',     text: 'text-red-500' },
    SERVICE_REQUEST_COMPLETED: { icon: Star,         bg: 'bg-amber-100',   text: 'text-amber-600' },
    SERVICE_REQUEST_EXPIRED:   { icon: ShieldCheck,  bg: 'bg-slate-100',   text: 'text-slate-500' },
    NEW_MESSAGE:               { icon: MessageSquare,bg: 'bg-violet-100',  text: 'text-violet-600' },
    TRUST_EVENT:               { icon: ShieldCheck,  bg: 'bg-emerald-100', text: 'text-emerald-600' },
    SL_POINTS:                 { icon: Zap,          bg: 'bg-amber-100',   text: 'text-amber-600' },
    SYSTEM:                    { icon: Info,          bg: 'bg-sky-100',     text: 'text-sky-600' },
  };
  return map[type] ?? { icon: Bell, bg: 'bg-slate-100', text: 'text-slate-500' };
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `Hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `Hace ${days} día${days !== 1 ? 's' : ''}`;
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

/* ─── Single Notification Row ─────────────── */

function NotifRow({
  notif,
  onRead,
}: {
  notif: Notification;
  onRead: (id: string) => void;
}) {
  const meta = getIconMeta(notif.type);
  const Icon = meta.icon;

  return (
    <button
      onClick={() => !notif.isRead && onRead(notif.id)}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--sl-primary-muted)]',
        !notif.isRead && 'bg-[var(--sl-primary-muted)]/50'
      )}
    >
      {/* Icon */}
      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', meta.bg)}>
        <Icon className={cn('h-4 w-4', meta.text)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn('text-sm leading-snug', notif.isRead ? '' : 'font-semibold')}
            style={{ color: 'var(--sl-text-primary)' }}
          >
            {notif.title}
          </p>
          {!notif.isRead && (
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[var(--sl-primary)]" />
          )}
        </div>
        <p className="mt-0.5 text-xs line-clamp-2" style={{ color: 'var(--sl-text-secondary)' }}>
          {notif.message}
        </p>
        <p className="mt-1 text-[10px] font-medium" style={{ color: 'var(--sl-text-muted)' }}>
          {formatRelative(notif.createdAt)}
        </p>
      </div>
    </button>
  );
}

/* ─── Bell Button + Dropdown ─────────────── */

type NotificationsBellProps = {
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN' | 'SUPPORT';
};

export function NotificationsBell({ role }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);
  const containerRef    = useRef<HTMLDivElement>(null);

  const panelBase = role === 'PROVIDER' ? '/panel/proveedor' : role === 'ADMIN' ? '/panel/admin' : '/panel/cliente';

  const {
    unreadCount,
    notifications,
    dropdownLoading,
    loadDropdown,
    markAsRead,
    markAllAsRead,
  } = useNotifications(true);

  /* Open dropdown → load items */
  function handleToggle() {
    if (!open) loadDropdown();
    setOpen((v) => !v);
  }

  /* Close on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  /* Close on Escape */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const BellIcon = unreadCount > 0 ? BellRing : Bell;

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        id="notifications-bell-btn"
        onClick={handleToggle}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-xl transition-all',
          open
            ? 'bg-[var(--sl-primary)] text-white shadow-sm'
            : 'hover:bg-[var(--sl-primary-muted)]'
        )}
        style={!open ? { color: 'var(--sl-text-secondary)' } : {}}
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <BellIcon className={cn('h-[18px] w-[18px]', unreadCount > 0 && !open && 'sl-animate-bounce')} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-11 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[var(--sl-border)] shadow-xl sl-animate-scale-in"
          style={{ background: 'var(--sl-surface)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--sl-border-light)] px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" style={{ color: 'var(--sl-primary)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--sl-text-primary)' }}>
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[var(--sl-primary)] px-1.5 py-0.5 text-[10px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={async () => { await markAllAsRead(); }}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition hover:bg-[var(--sl-primary-muted)]"
                style={{ color: 'var(--sl-primary)' }}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Items */}
          <div className="max-h-[360px] overflow-y-auto">
            {dropdownLoading ? (
              /* Loading skeleton */
              <div className="space-y-0 divide-y divide-[var(--sl-border-light)]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <div className="h-8 w-8 rounded-xl sl-animate-shimmer shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded sl-animate-shimmer" />
                      <div className="h-2.5 w-full rounded sl-animate-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--sl-border-light)]">
                  <Bell className="h-7 w-7" style={{ color: 'var(--sl-text-muted)' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--sl-text-primary)' }}>
                  Todo al día
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--sl-text-secondary)' }}>
                  No tienes notificaciones por ahora.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--sl-border-light)]">
                {notifications.map((n) => (
                  <NotifRow
                    key={n.id}
                    notif={n}
                    onRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--sl-border-light)] px-4 py-2.5">
            <Link
              href={`${panelBase}/notificaciones`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition hover:bg-[var(--sl-primary-muted)]"
              style={{ color: 'var(--sl-primary)' }}
            >
              Ver todas las notificaciones
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
