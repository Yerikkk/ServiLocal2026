'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  MapPin,
  MessageSquare,
  RefreshCw,
  Star,
  XCircle,
  Hourglass,
  X,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/cn';

/* ─── Types ─────────────────────────────────────── */

type CurrentUser = {
  id: string; email: string; fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
};

type ServiceRequest = {
  id: string;
  serviceTitle: string;
  message: string;
  serviceZone: string;
  preferredDate: string | null;
  expiresAt: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  provider?: {
    providerId: string;
    responsibleName: string;
    businessName: string;
    serviceName: string;
    specialty: string | null;
    serviceZone: string | null;
    isVerified: boolean;
  };
  client?: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
};

type RequestsResponse = { items: ServiceRequest[]; total: number };

type StatusFilter = 'ALL' | ServiceRequest['status'];

/* ─── Status config ─────────────────────────────── */

const STATUS_CONFIG: Record<ServiceRequest['status'], {
  label: string; bg: string; text: string; border: string; icon: React.ElementType;
}> = {
  PENDING:   { label: 'Pendiente',   bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  icon: Hourglass },
  ACCEPTED:  { label: 'Aceptada',    bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   icon: CheckCircle2 },
  COMPLETED: { label: 'Completada',  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelada',   bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    icon: XCircle },
  EXPIRED:   { label: 'Expirada',    bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',  icon: AlertTriangle },
};

const STATUS_OPTIONS: StatusFilter[] = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'EXPIRED'];

/* ─── Helpers ───────────────────────────────────── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return formatDate(iso);
}

const PAGE_SIZE = 10;

/* ─── Main Component ────────────────────────────── */

export function HistorialPanel() {
  const router = useRouter();
  const [user, setUser]       = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal]     = useState(0);
  const [rLoading, setRLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage]       = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Estado para el modal de reseña
  const [reviewModal, setReviewModal] = useState<{ requestId: string; title: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewedRequests, setReviewedRequests] = useState<Set<string>>(new Set());

  /* ── Load user ──────────────────────────────── */
  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const data = await api.get<CurrentUser>('/api/auth/me');
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

  /* ── Load requests ──────────────────────────── */
  const loadRequests = useCallback(async () => {
    if (!user) return;
    setRLoading(true);
    try {
      const endpoint = user.role === 'PROVIDER'
        ? '/api/service-requests/provider/me'
        : '/api/service-requests/client/me';
      const data = await api.get<RequestsResponse>(endpoint);
      setRequests(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { /* silently ignore */ }
    finally { setRLoading(false); }
  }, [user]);

  useEffect(() => { if (user) loadRequests(); }, [user, loadRequests]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  // Verificar qué solicitudes completadas ya tienen reseña
  const checkReviewedRequests = useCallback(async (completedIds: string[]) => {
    const results = await Promise.allSettled(
      completedIds.map((id) => api.get<{ hasReview: boolean }>(`/api/reviews/check/${id}`)),
    );
    const reviewed = new Set<string>();
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value.hasReview) reviewed.add(completedIds[i]);
    });
    setReviewedRequests(reviewed);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'CLIENT') return;
    const completedIds = requests.filter((r) => r.status === 'COMPLETED').map((r) => r.id);
    if (completedIds.length > 0) checkReviewedRequests(completedIds);
  }, [requests, user, checkReviewedRequests]);

  // Enviar reseña
  const submitReview = async () => {
    if (!reviewModal) return;
    setReviewLoading(true);
    try {
      await api.post('/api/reviews', {
        requestId: reviewModal.requestId,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewedRequests((prev) => new Set([...prev, reviewModal.requestId]));
      setReviewModal(null);
      setReviewRating(5);
      setReviewComment('');
    } catch { /* silently ignore */ }
    finally { setReviewLoading(false); }
  };

  /* ── Filter + Paginate ──────────────────────── */
  const filtered = statusFilter === 'ALL'
    ? requests
    : requests.filter((r) => r.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Count by status ────────────────────────── */
  const counts = STATUS_OPTIONS.reduce<Record<StatusFilter, number>>((acc, s) => {
    acc[s] = s === 'ALL' ? requests.length : requests.filter((r) => r.status === s).length;
    return acc;
  }, {} as Record<StatusFilter, number>);

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
      <div className="space-y-6 sl-animate-fade-in max-w-4xl mx-auto">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--sl-primary-light)] text-[var(--sl-primary)]">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>
                Historial de solicitudes
              </h1>
              <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
                {total} solicitud{total !== 1 ? 'es' : ''} en total
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />}
            loading={rLoading} onClick={loadRequests}>
            Actualizar
          </Button>
        </header>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => {
            const cfg = s === 'ALL' ? null : STATUS_CONFIG[s as ServiceRequest['status']];
            const active = statusFilter === s;
            const count = counts[s];
            if (count === 0 && s !== 'ALL') return null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all',
                  active
                    ? 'bg-[var(--sl-primary)] text-white shadow-sm'
                    : 'border border-[var(--sl-border)] hover:bg-[var(--sl-primary-muted)]'
                )}
                style={!active ? { background: 'var(--sl-surface)', color: 'var(--sl-text-secondary)' } : {}}
              >
                {cfg && <cfg.icon className="h-3 w-3" />}
                {s === 'ALL' ? 'Todas' : cfg!.label}
                <span className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-black',
                  active ? 'bg-white/20' : 'bg-[var(--sl-border)]'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {rLoading ? (
          <SkeletonList count={5} />
        ) : paginated.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title={statusFilter === 'ALL' ? 'Sin solicitudes' : `Sin solicitudes ${STATUS_CONFIG[statusFilter as ServiceRequest['status']]?.label.toLowerCase()}`}
            description={
              statusFilter === 'ALL'
                ? (user.role === 'CLIENT'
                  ? 'Aún no has realizado ninguna solicitud. Busca un proveedor y solicita su servicio.'
                  : 'Aún no has recibido solicitudes de clientes.')
                : 'No hay solicitudes con este estado.'
            }
            action={statusFilter !== 'ALL' ? (
              <Button variant="outline" onClick={() => setStatusFilter('ALL')}>Ver todas</Button>
            ) : undefined}
          />
        ) : (
          <div className="space-y-3 sl-stagger">
            {paginated.map((req) => {
              const cfg = STATUS_CONFIG[req.status];
              const Icon = cfg.icon;
              const isOpen = expanded === req.id;
              const other = user.role === 'CLIENT' ? req.provider : req.client;

              return (
                <article
                  key={req.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border transition-all',
                    isOpen ? 'border-[var(--sl-primary)]/30 shadow-md' : 'border-[var(--sl-border)]'
                  )}
                  style={{ background: 'var(--sl-surface)' }}
                >
                  {/* Summary row */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : req.id)}
                    className="flex w-full items-start gap-4 p-5 text-left hover:bg-[var(--sl-primary-muted)] transition-colors"
                  >
                    {/* Status icon */}
                    <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', cfg.bg)}>
                      <Icon className={cn('h-5 w-5', cfg.text)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm truncate" style={{ color: 'var(--sl-text-primary)' }}>
                          {req.serviceTitle}
                        </span>
                        <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold', cfg.bg, cfg.text, cfg.border)}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--sl-text-secondary)' }}>
                        {other && (
                          <span className="truncate">
                            {'businessName' in other ? other.businessName : other.fullName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {req.serviceZone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formatRelative(req.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <ChevronDown className={cn('mt-1 h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
                      style={{ color: 'var(--sl-text-muted)' }} />
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div className="border-t border-[var(--sl-border-light)] px-5 py-5 space-y-4 sl-animate-fade-in">
                      {/* Message */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--sl-text-muted)' }}>
                          Mensaje del cliente
                        </p>
                        <p className="text-sm rounded-xl p-3 leading-relaxed"
                          style={{ background: 'var(--sl-bg)', color: 'var(--sl-text-secondary)' }}>
                          {req.message}
                        </p>
                      </div>

                      {/* Metadata grid */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {req.preferredDate && (
                          <InfoChip icon={<Calendar className="h-3.5 w-3.5" />} label="Fecha preferida"
                            value={formatDate(req.preferredDate)} />
                        )}
                        {req.expiresAt && (
                          <InfoChip icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Expiraba el"
                            value={formatDate(req.expiresAt)} />
                        )}
                        <InfoChip icon={<Clock className="h-3.5 w-3.5" />} label="Creada"
                          value={formatDate(req.createdAt)} />
                        <InfoChip icon={<Clock className="h-3.5 w-3.5" />} label="Actualizada"
                          value={formatDate(req.updatedAt)} />
                        <InfoChip icon={<MapPin className="h-3.5 w-3.5" />} label="Zona"
                          value={req.serviceZone} />
                      </div>

                      {/* Provider/Client info */}
                      {other && (
                        <div className="rounded-xl border border-[var(--sl-border)] p-4"
                          style={{ background: 'var(--sl-bg)' }}>
                          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--sl-text-muted)' }}>
                            {user.role === 'CLIENT' ? 'Proveedor' : 'Cliente'}
                          </p>
                          {'businessName' in other ? (
                            <div className="space-y-0.5">
                              <p className="font-bold text-sm" style={{ color: 'var(--sl-text-primary)' }}>{other.businessName}</p>
                              <p className="text-xs" style={{ color: 'var(--sl-text-secondary)' }}>{other.responsibleName}</p>
                              {other.isVerified && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  ✓ Verificado
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <p className="font-bold text-sm" style={{ color: 'var(--sl-text-primary)' }}>{other.fullName}</p>
                              <p className="text-xs" style={{ color: 'var(--sl-text-secondary)' }}>{other.email}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Botón de reseña para clientes en solicitudes COMPLETED */}
                      {user.role === 'CLIENT' && req.status === 'COMPLETED' && (
                        <div className="pt-1">
                          {reviewedRequests.has(req.id) ? (
                            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="text-sm font-semibold text-amber-700">Ya dejaste una reseña para esta solicitud</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReviewModal({ requestId: req.id, title: req.serviceTitle })}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md hover:scale-[1.01] transition-all"
                            >
                              <Star className="h-4 w-4" />
                              Dejar reseña
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!rLoading && totalPages > 1 && (
          <nav className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon={<ChevronLeft className="h-4 w-4" />}>
              Anterior
            </Button>
            <span className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              {page} / {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              icon={<ChevronRight className="h-4 w-4" />}>
              Siguiente
            </Button>
          </nav>
        )}
      </div>

      {/* ── Modal de reseña ───────────────────── */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && setReviewModal(null)}
        >
          <div className="w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 sl-animate-fade-in"
            style={{ background: 'var(--sl-surface)', border: '1px solid var(--sl-border)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: 'var(--sl-text-primary)' }}>Dejar reseña</h2>
                <p className="text-sm mt-0.5 line-clamp-1" style={{ color: 'var(--sl-text-muted)' }}>{reviewModal.title}</p>
              </div>
              <button onClick={() => setReviewModal(null)} className="rounded-xl p-2 hover:bg-[var(--sl-bg)] transition-colors">
                <X className="h-5 w-5" style={{ color: 'var(--sl-text-muted)' }} />
              </button>
            </div>

            {/* Rating stars */}
            <div>
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--sl-text-secondary)' }}>Calificación</p>
              <div className="flex gap-2">
                {[1,2,3,4,5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110">
                    <Star className={`h-8 w-8 transition-colors ${
                      star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-bold mb-2 block" style={{ color: 'var(--sl-text-secondary)' }}>Comentario (opcional)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Describe tu experiencia con este proveedor..."
                rows={3}
                maxLength={1000}
                className="w-full rounded-xl border border-[var(--sl-border)] bg-[var(--sl-bg)] px-4 py-3 text-sm resize-none outline-none focus:border-[var(--sl-primary)] focus:ring-2 focus:ring-[var(--sl-primary)]/20 transition-all"
                style={{ color: 'var(--sl-text-primary)' }}
              />
              <p className="text-[11px] mt-1 text-right" style={{ color: 'var(--sl-text-muted)' }}>{reviewComment.length}/1000</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setReviewModal(null)}
                className="flex-1 rounded-xl border border-[var(--sl-border)] px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--sl-bg)]"
                style={{ color: 'var(--sl-text-secondary)' }}
              >
                Cancelar
              </button>
              <button onClick={submitReview} disabled={reviewLoading}
                className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-60"
              >
                {reviewLoading ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

/* ─── InfoChip ──────────────────────────────────── */

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--sl-border)] p-3" style={{ background: 'var(--sl-bg)' }}>
      <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold" style={{ color: 'var(--sl-text-muted)' }}>
        {icon} {label}
      </div>
      <p className="text-sm font-bold truncate" style={{ color: 'var(--sl-text-primary)' }}>{value}</p>
    </div>
  );
}
