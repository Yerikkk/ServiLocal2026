'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Calendar, CheckCircle2, Clock3, Filter,
  MapPin, MessageSquare, Sparkles, User, Wrench, XCircle,
  ChevronRight, Inbox, ArrowUpRight, RotateCcw
} from 'lucide-react';
import { api, type ApiError } from '@/lib/api-client';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SkeletonDashboard } from '@/components/ui/skeleton';

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
  status: string;
};

type ClientRequestItem = {
  id: string;
  serviceTitle: string;
  message: string;
  serviceZone: string;
  preferredDate?: string | null;
  status: 'PENDING' | 'NEGOTIATION' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  provider: {
    providerId: string;
    responsibleName: string;
    businessName: string;
    serviceName: string;
    specialty?: string | null;
    serviceZone?: string | null;
    isVerified: boolean;
  };
};

type ClientRequestsResponse = { total: number; items: ClientRequestItem[] };

const statusConfig: Record<string, { label: string; glowClass: string; icon: React.ElementType; step: number }> = {
  PENDING: { label: 'Pendiente', glowClass: 'sl-status-glow-pending', icon: Clock3, step: 1 },
  NEGOTIATION: { label: 'En negociación', glowClass: 'sl-status-glow-negotiation', icon: MessageSquare, step: 2 },
  ACCEPTED: { label: 'Aceptada', glowClass: 'sl-status-glow-accepted', icon: CheckCircle2, step: 3 },
  IN_PROGRESS: { label: 'En proceso', glowClass: 'sl-status-glow-in-progress', icon: RotateCcw, step: 4 },
  COMPLETED: { label: 'Completada', glowClass: 'sl-status-glow-completed', icon: Sparkles, step: 5 },
  CANCELLED: { label: 'Cancelada', glowClass: 'sl-status-glow-cancelled', icon: XCircle, step: -1 },
  EXPIRED: { label: 'Expirada', glowClass: 'sl-status-glow-expired', icon: Clock3, step: -1 },
};

const filterOptions = ['TODOS', 'PENDING', 'NEGOTIATION', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
const filterLabels: Record<string, string> = {
  TODOS: 'Todas', PENDING: 'Pendientes', NEGOTIATION: 'Negociando',
  ACCEPTED: 'Aceptadas', IN_PROGRESS: 'En proceso', COMPLETED: 'Completadas', CANCELLED: 'Canceladas',
};

function ProgressTimeline({ status }: { status: string }) {
  const config = statusConfig[status];
  if (!config || config.step < 0) return null;

  const steps = [
    { label: 'Enviada', step: 1 },
    { label: 'Negociando', step: 2 },
    { label: 'Aceptada', step: 3 },
    { label: 'En proceso', step: 4 },
    { label: 'Completada', step: 5 },
  ];

  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((s, i) => (
        <div key={s.step} className="flex items-center flex-1">
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold transition-all duration-500 ${
            s.step <= config.step
              ? 'bg-[var(--sl-primary)] text-white shadow-md scale-100'
              : 'bg-[var(--sl-border)] text-[var(--sl-text-muted)] scale-90'
          }`}>
            {s.step <= config.step ? '✓' : s.step}
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-[2px] mx-1 rounded-full overflow-hidden bg-[var(--sl-border)]">
              <div
                className="h-full bg-[var(--sl-primary)] transition-all duration-700 rounded-full"
                style={{ width: s.step < config.step ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ClientServiceRequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [items, setItems] = useState<ClientRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('TODOS');

  useEffect(() => {
    let ignore = false;
    async function loadPage() {
      try {
        setLoading(true);
        setError('');
        const authUser = await api.get<CurrentUser>('/api/auth/me');
        if (!ignore) setUser(authUser);
        if (authUser.role !== 'CLIENT') {
          router.replace(authUser.role === 'ADMIN' ? '/panel/admin' : '/panel/proveedor');
          return;
        }
        const data = await api.get<ClientRequestsResponse>('/api/service-requests/client/me');
        if (!ignore) setItems(data.items);
      } catch (err: any) {
        if (err?.status === 401) return;
        if (!ignore) setError(err?.message ?? 'No se pudieron cargar tus solicitudes');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadPage();
    return () => { ignore = true; };
  }, [router]);

  async function cancelRequest(requestId: string) {
    try {
      setProcessingId(requestId);
      setError('');
      const data = await api.patch<{ request: ClientRequestItem }>(
        `/api/service-requests/${requestId}/status`, { status: 'CANCELLED' },
      );
      setItems((c) => (c || []).map((item) => (item.id === requestId ? data.request : item)));
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo cancelar la solicitud');
    } finally {
      setProcessingId(null);
    }
  }

  const filtered = useMemo(() => {
    if (filter === 'TODOS') return items || [];
    return (items || []).filter((i) => i.status === filter);
  }, [items, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { TODOS: (items || []).length };
    (items || []).forEach((i) => { c[i.status] = (c[i.status] || 0) + 1; });
    return c;
  }, [items]);

  if (loading || !user) {
    return (
      <DashboardShell role="CLIENT" userName="Cargando..." userEmail="">
        <SkeletonDashboard />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={user.role} userName={user.fullName} userEmail={user.email}>
      <div className="space-y-8 sl-animate-fade-in max-w-6xl mx-auto">

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-[var(--sl-radius-2xl)] bg-gradient-to-br from-[#1EA8E7] via-[#1598d0] to-[#0891b2] p-8 md:p-10 sl-animate-gradient">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 sl-animate-float" />
          <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60 mb-3">
              Panel de solicitudes
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Mis Solicitudes
            </h1>
            <p className="mt-3 text-white/80 text-sm max-w-xl leading-relaxed">
              Revisa el estado de cada solicitud enviada. Puedes chatear con tus proveedores y cancelar las que aún no fueron aceptadas.
            </p>

            {/* Quick Stats */}
            <div className="flex gap-4 mt-6">
              {[
                { label: 'Total', value: (items || []).length, icon: Inbox },
                { label: 'Activas', value: (items || []).filter(i => !['COMPLETED','CANCELLED','EXPIRED'].includes(i.status)).length, icon: Sparkles },
                { label: 'Completadas', value: (items || []).filter(i => i.status === 'COMPLETED').length, icon: CheckCircle2 },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2.5 rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-3">
                  <s.icon className="h-4 w-4 text-white/70" />
                  <div>
                    <p className="text-xl font-extrabold text-white leading-none">{s.value}</p>
                    <p className="text-[10px] font-semibold text-white/60 mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          <Filter className="h-4 w-4 mt-2.5 mr-1" style={{ color: 'var(--sl-text-muted)' }} />
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-[var(--sl-primary)] text-white shadow-md scale-105'
                  : 'bg-[var(--sl-surface)] border border-[var(--sl-border)] hover:border-[var(--sl-primary)] hover:scale-[1.02]'
              }`}
              style={filter !== f ? { color: 'var(--sl-text-secondary)' } : undefined}
            >
              {filterLabels[f]}
              {counts[f] ? (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === f ? 'bg-white/25' : 'bg-[var(--sl-primary-muted)] text-[var(--sl-primary)]'
                }`}>
                  {counts[f]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 font-medium sl-animate-slide-up">
            ⚠️ {error}
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 && !error && (
          <div className="sl-card-premium flex flex-col items-center justify-center p-12 text-center sl-animate-slide-up">
            <div className="w-20 h-20 rounded-3xl bg-[var(--sl-primary-muted)] flex items-center justify-center mb-6 sl-animate-float">
              <Inbox className="w-10 h-10 text-[var(--sl-primary)]" />
            </div>
            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--sl-text-primary)' }}>
              {filter !== 'TODOS' ? 'No hay solicitudes con este filtro' : 'Aún no tienes solicitudes'}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: 'var(--sl-text-secondary)' }}>
              {filter !== 'TODOS' 
                ? 'Prueba seleccionando otro filtro para ver tus solicitudes.'
                : 'Busca un proveedor en el directorio y envía tu primera solicitud de servicio.'
              }
            </p>
            {filter === 'TODOS' && (
              <Link
                href="/proveedores"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-[var(--sl-primary)] px-6 text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition-all"
              >
                Explorar proveedores <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}

        {/* Request Cards */}
        <div className="space-y-5 sl-stagger">
          {(filtered || []).map((item) => {
            const sc = statusConfig[item.status];
            const StatusIcon = sc?.icon ?? Clock3;
            const isCancellable = item.status === 'PENDING' || item.status === 'NEGOTIATION';

            return (
              <article
                key={item.id}
                className="sl-card-premium p-0 group"
              >
                {/* Top color accent */}
                <div className={`h-1 rounded-t-[var(--sl-radius-xl)] ${
                  item.status === 'COMPLETED' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : item.status === 'CANCELLED' ? 'bg-gradient-to-r from-red-400 to-red-500'
                  : item.status === 'IN_PROGRESS' ? 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                  : 'bg-gradient-to-r from-[var(--sl-primary)] to-sky-400'
                }`} />

                <div className="p-6 md:p-8">
                  {/* Header row */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Provider avatar */}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-primary-light)] text-[var(--sl-primary)] font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                        {item.provider?.businessName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>
                          {item.serviceTitle}
                        </h2>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-sm font-semibold text-[var(--sl-primary)]">
                            {item.provider?.businessName || 'Proveedor'}
                          </span>
                          {item.provider?.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                              ✓ Verificado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status badge with glow */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${sc?.glowClass ?? ''}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {sc?.label ?? item.status}
                    </div>
                  </div>

                  {/* Progress timeline */}
                  {sc?.step > 0 && (
                    <div className="mt-6 mb-4">
                      <ProgressTimeline status={item.status} />
                    </div>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                    <DetailChip icon={<User className="h-3.5 w-3.5" />} label="Responsable" value={item.provider?.responsibleName || 'No disponible'} />
                    <DetailChip icon={<Wrench className="h-3.5 w-3.5" />} label="Servicio" value={item.provider?.serviceName || 'No disponible'} />
                    <DetailChip icon={<MapPin className="h-3.5 w-3.5" />} label="Zona" value={item.serviceZone} />
                    <DetailChip
                      icon={<Calendar className="h-3.5 w-3.5" />}
                      label="Fecha"
                      value={item.preferredDate ? new Date(item.preferredDate).toLocaleDateString() : 'No indicada'}
                    />
                  </div>

                  {/* Message preview */}
                  <div className="mt-5 p-4 rounded-2xl border border-[var(--sl-border-light)]" style={{ background: 'var(--sl-bg)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-3.5 w-3.5" style={{ color: 'var(--sl-text-muted)' }} />
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--sl-text-muted)' }}>
                        Tu mensaje
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--sl-text-secondary)' }}>
                      {item.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Link
                      href={`/panel/cliente/mensajes/${item.id}`}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--sl-primary)] px-5 text-sm font-bold text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <MessageSquare className="h-4 w-4" /> Abrir chat
                    </Link>
                    <Link
                      href={`/proveedores/${item.provider?.providerId || ''}`}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--sl-border)] px-5 text-sm font-semibold hover:bg-[var(--sl-primary-muted)] hover:border-[var(--sl-primary)] transition-all"
                      style={{ color: 'var(--sl-text-primary)' }}
                    >
                      Ver proveedor <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    {isCancellable && (
                      <button
                        type="button"
                        disabled={processingId === item.id}
                        onClick={() => cancelRequest(item.id)}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-5 text-sm font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" /> Cancelar
                      </button>
                    )}
                  </div>

                  {/* Time footer */}
                  <div className="mt-5 pt-4 border-t border-[var(--sl-border-light)] flex items-center gap-4">
                    <span className="text-[11px] font-medium" style={{ color: 'var(--sl-text-muted)' }}>
                      Creada {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--sl-text-muted)' }}>
                      Actualizada {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}

function DetailChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: 'var(--sl-bg)' }}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-primary-muted)] text-[var(--sl-primary)]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sl-text-muted)' }}>{label}</p>
        <p className="text-xs font-semibold truncate" style={{ color: 'var(--sl-text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}