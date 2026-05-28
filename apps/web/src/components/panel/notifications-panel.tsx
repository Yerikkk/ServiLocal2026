'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellRing,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Info,
  MessageSquare,
  ShieldCheck,
  Star,
  X,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/cn';

/* ─── Types ─────────────────────────────────────── */

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
};

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown> | null;
};

type NotificationsResponse = {
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
};

/* ─── Helpers ───────────────────────────────────── */

type IconMeta = { icon: React.ElementType; bg: string; text: string; label: string };

function getIconMeta(type: string): IconMeta {
  const map: Record<string, IconMeta> = {
    SERVICE_REQUEST_CREATED:   { icon: FileText,      bg: 'bg-blue-100',    text: 'text-blue-600',    label: 'Solicitud' },
    SERVICE_REQUEST_ACCEPTED:  { icon: CheckCircle2,  bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Aceptada' },
    SERVICE_REQUEST_CANCELLED: { icon: X,             bg: 'bg-red-100',     text: 'text-red-500',     label: 'Cancelada' },
    SERVICE_REQUEST_COMPLETED: { icon: Star,          bg: 'bg-amber-100',   text: 'text-amber-600',   label: 'Completada' },
    SERVICE_REQUEST_EXPIRED:   { icon: ShieldCheck,   bg: 'bg-slate-100',   text: 'text-slate-500',   label: 'Expirada' },
    NEW_MESSAGE:               { icon: MessageSquare, bg: 'bg-violet-100',  text: 'text-violet-600',  label: 'Mensaje' },
    TRUST_EVENT:               { icon: ShieldCheck,   bg: 'bg-emerald-100', text: 'text-emerald-600', label: 'Confianza' },
    SL_POINTS:                 { icon: Zap,           bg: 'bg-amber-100',   text: 'text-amber-600',   label: 'SL Points' },
    SYSTEM:                    { icon: Info,           bg: 'bg-sky-100',     text: 'text-sky-600',     label: 'Sistema' },
  };
  return map[type] ?? { icon: Bell, bg: 'bg-slate-100', text: 'text-slate-500', label: 'Notificación' };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
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
  return formatDate(iso);
}

const PAGE_SIZE = 20;

/* ─── Main Component ────────────────────────────── */

export function NotificationsPanel() {
  const router = useRouter();

  const [user, setUser]         = useState<CurrentUser | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notifs, setNotifs]     = useState<Notification[]>([]);
  const [total, setTotal]       = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [page, setPage]         = useState(1);
  const [nLoading, setNLoading] = useState(false);
  const [unreadOnly, setUnreadOnly]   = useState(false);
  const [markingAll, setMarkingAll]   = useState(false);

  /* ── Load user ──────────────────────────────── */
  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const data = await api.get<CurrentUser>('/api/auth/me');
        if (data.role === 'ADMIN') { router.replace('/panel/admin'); return; }
        if (!ignore) setUser(data);
      } catch {
        if (!ignore) router.replace('/iniciar-sesion');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => { ignore = true; };
  }, [router]);

  /* ── Load notifications ─────────────────────── */
  const loadNotifs = useCallback(async () => {
    setNLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        ...(unreadOnly ? { unreadOnly: 'true' } : {}),
      });
      const data = await api.get<NotificationsResponse>(`/api/notifications?${params}`);
      setNotifs(data.items ?? []);
      setTotal(data.total ?? 0);
      setUnreadCount(data.unreadCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch { /* silently ignore */ }
    finally { setNLoading(false); }
  }, [page, unreadOnly]);

  useEffect(() => {
    if (user) loadNotifs();
  }, [user, loadNotifs]);

  useEffect(() => { setPage(1); }, [unreadOnly]);

  /* ── Mark single ────────────────────────────── */
  async function handleMarkRead(id: string) {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  }

  /* ── Mark all ───────────────────────────────── */
  async function handleMarkAll() {
    setMarkingAll(true);
    try {
      await api.patch('/api/notifications/read-all');
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
    finally { setMarkingAll(false); }
  }

  /* ── Skeleton ───────────────────────────────── */
  if (loading || !user) {
    return (
      <DashboardShell role="CLIENT" userName="Cargando..." userEmail="">
        <SkeletonList count={5} />
      </DashboardShell>
    );
  }

  const roleForShell = user.role === 'PROVIDER' ? 'PROVIDER' : 'CLIENT';

  /* ─── Render ────────────────────────────────── */
  return (
    <DashboardShell role={roleForShell} userName={user.fullName} userEmail={user.email}>
      <div className="space-y-6 sl-animate-fade-in max-w-3xl mx-auto">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl',
              unreadCount > 0 ? 'bg-[var(--sl-primary-light)] text-[var(--sl-primary)]' : 'bg-[var(--sl-border-light)] text-[var(--sl-text-muted)]'
            )}>
              {unreadCount > 0
                ? <BellRing className="h-5 w-5 sl-animate-bounce" />
                : <Bell className="h-5 w-5" />
              }
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>
                Notificaciones
              </h1>
              <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
                {unreadCount > 0
                  ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
                  : 'Estás al día con todas tus notificaciones'}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              loading={markingAll}
              icon={<CheckCheck className="h-4 w-4" />}
              onClick={handleMarkAll}
            >
              Marcar todas como leídas
            </Button>
          )}
        </header>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setUnreadOnly(false)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              !unreadOnly
                ? 'bg-[var(--sl-primary)] text-white shadow-sm'
                : 'border border-[var(--sl-border)] hover:bg-[var(--sl-primary-muted)]'
            )}
            style={unreadOnly ? { background: 'var(--sl-surface)', color: 'var(--sl-text-secondary)' } : {}}
          >
            Todas
            <span className={cn(
              'ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
              !unreadOnly ? 'bg-white/20' : 'bg-[var(--sl-border)]'
            )}>
              {total}
            </span>
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              unreadOnly
                ? 'bg-[var(--sl-primary)] text-white shadow-sm'
                : 'border border-[var(--sl-border)] hover:bg-[var(--sl-primary-muted)]'
            )}
            style={!unreadOnly ? { background: 'var(--sl-surface)', color: 'var(--sl-text-secondary)' } : {}}
          >
            Sin leer
            {unreadCount > 0 && (
              <span className={cn(
                'ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                unreadOnly ? 'bg-white/20' : 'bg-red-100 text-red-600'
              )}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* List */}
        {nLoading ? (
          <SkeletonList count={5} />
        ) : notifs.length === 0 ? (
          <EmptyState
            icon={<Bell />}
            title={unreadOnly ? 'No hay notificaciones sin leer' : 'Sin notificaciones'}
            description={
              unreadOnly
                ? 'Estás al día. ¡Bien hecho!'
                : 'Aquí aparecerán las actualizaciones de tus solicitudes, mensajes y actividad.'
            }
            action={
              unreadOnly
                ? <Button variant="outline" onClick={() => setUnreadOnly(false)}>Ver todas</Button>
                : undefined
            }
          />
        ) : (
          <div
            className="overflow-hidden rounded-2xl border border-[var(--sl-border)] sl-animate-fade-in"
            style={{ background: 'var(--sl-surface)' }}
          >
            {notifs.map((n, idx) => {
              const meta = getIconMeta(n.type);
              const Icon = meta.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkRead(n.id)}
                  className={cn(
                    'w-full flex items-start gap-4 px-5 py-4 text-left transition-colors',
                    'hover:bg-[var(--sl-primary-muted)]',
                    !n.isRead && 'bg-[var(--sl-primary-muted)]/40',
                    idx !== 0 && 'border-t border-[var(--sl-border-light)]',
                  )}
                >
                  {/* Icon */}
                  <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', meta.bg)}>
                    <Icon className={cn('h-5 w-5', meta.text)} />
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'text-sm',
                            n.isRead ? 'font-medium' : 'font-bold'
                          )}
                          style={{ color: 'var(--sl-text-primary)' }}
                        >
                          {n.title}
                        </span>
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold',
                          meta.bg, meta.text
                        )}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-[var(--sl-primary)]" />
                        )}
                      </div>
                    </div>
                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: 'var(--sl-text-secondary)' }}
                    >
                      {n.message}
                    </p>
                    <p className="mt-2 text-xs font-medium" style={{ color: 'var(--sl-text-muted)' }}>
                      {formatRelative(n.createdAt)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!nLoading && totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Paginación">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon={<ChevronLeft className="h-4 w-4" />}
            >
              Anterior
            </Button>
            <span className="text-sm font-medium" style={{ color: 'var(--sl-text-secondary)' }}>
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              icon={<ChevronRight className="h-4 w-4" />}
            >
              Siguiente
            </Button>
          </nav>
        )}
      </div>
    </DashboardShell>
  );
}
