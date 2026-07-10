'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Calendar, CheckCircle2, Clock3, Filter, Inbox,
  Mail, MapPin, MessageSquare, Phone, Sparkles, Wrench,
  XCircle, ChevronRight, Play, RotateCcw, ArrowUpRight
} from 'lucide-react';
import { api, type ApiError } from '@/lib/api-client';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SkeletonDashboard } from '@/components/ui/skeleton';

type CurrentUser = {
  id: string; email: string; fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER'; status: string;
};

type ProviderRequestItem = {
  id: string; serviceTitle: string; message: string; serviceZone: string;
  preferredDate?: string | null;
  status: 'PENDING' | 'NEGOTIATION' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string; updatedAt: string;
  client: { id: string; fullName: string; email: string; phone?: string | null };
};

type ProviderRequestsResponse = { total: number; items: ProviderRequestItem[] };

const statusConfig: Record<string, { label: string; glowClass: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pendiente', glowClass: 'sl-status-glow-pending', icon: Clock3 },
  NEGOTIATION: { label: 'En negociación', glowClass: 'sl-status-glow-negotiation', icon: MessageSquare },
  ACCEPTED: { label: 'Aceptada', glowClass: 'sl-status-glow-accepted', icon: CheckCircle2 },
  IN_PROGRESS: { label: 'En proceso', glowClass: 'sl-status-glow-in-progress', icon: RotateCcw },
  COMPLETED: { label: 'Completada', glowClass: 'sl-status-glow-completed', icon: Sparkles },
  CANCELLED: { label: 'Cancelada', glowClass: 'sl-status-glow-cancelled', icon: XCircle },
  EXPIRED: { label: 'Expirada', glowClass: 'sl-status-glow-expired', icon: Clock3 },
};

const filterOptions = ['TODOS', 'PENDING', 'NEGOTIATION', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
const filterLabels: Record<string, string> = {
  TODOS: 'Todas', PENDING: 'Pendientes', NEGOTIATION: 'Negociando',
  ACCEPTED: 'Aceptadas', IN_PROGRESS: 'En proceso', COMPLETED: 'Completadas', CANCELLED: 'Canceladas',
};

export function ProviderServiceRequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [items, setItems] = useState<ProviderRequestItem[]>([]);
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
        if (authUser.role !== 'PROVIDER') {
          router.replace(authUser.role === 'ADMIN' ? '/panel/admin' : '/panel/cliente');
          return;
        }
        const data = await api.get<ProviderRequestsResponse>('/api/service-requests/provider/me');
        if (!ignore) setItems(data.items);
      } catch (err: any) {
        if (err?.status === 401) return;
        if (!ignore) setError(err?.message ?? 'Error al cargar solicitudes');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadPage();
    return () => { ignore = true; };
  }, [router]);

  async function updateStatus(requestId: string, status: string) {
    try {
      setProcessingId(requestId);
      const data = await api.patch<{ request: ProviderRequestItem }>(
        `/api/service-requests/${requestId}/status`, { status },
      );
      setItems((c) => (c || []).map((i) => (i.id === requestId ? data.request : i)));
    } catch (err: any) {
      setError(err?.message ?? 'Error al actualizar');
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
      <DashboardShell role="PROVIDER" userName="Cargando..." userEmail="">
        <SkeletonDashboard />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={user.role} userName={user.fullName} userEmail={user.email}>
      <div className="space-y-8 sl-animate-fade-in max-w-6xl mx-auto">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-[var(--sl-radius-2xl)] bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-8 md:p-10 sl-animate-gradient">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 sl-animate-float" />
          <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60 mb-3">Bandeja de trabajo</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Solicitudes Recibidas
            </h1>
            <p className="mt-3 text-white/80 text-sm max-w-xl leading-relaxed">
              Gestiona las solicitudes de tus clientes. Negocia, acepta y completa trabajos para aumentar tu confianza.
            </p>
            <div className="flex gap-4 mt-6">
              {[
                { label: 'Recibidas', value: (items || []).length, icon: Inbox },
                { label: 'Por atender', value: (items || []).filter(i => i.status === 'PENDING').length, icon: Clock3 },
                { label: 'En proceso', value: (items || []).filter(i => ['NEGOTIATION','ACCEPTED','IN_PROGRESS'].includes(i.status)).length, icon: Sparkles },
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
                  ? 'bg-emerald-600 text-white shadow-md scale-105'
                  : 'bg-[var(--sl-surface)] border border-[var(--sl-border)] hover:border-emerald-500 hover:scale-[1.02]'
              }`}
              style={filter !== f ? { color: 'var(--sl-text-secondary)' } : undefined}
            >
              {filterLabels[f]}
              {counts[f] ? (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  filter === f ? 'bg-white/25' : 'bg-emerald-50 text-emerald-700'
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

        {/* Empty state */}
        {filtered.length === 0 && !error && (
          <div className="sl-card-premium flex flex-col items-center justify-center p-12 text-center sl-animate-slide-up">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mb-6 sl-animate-float">
              <Inbox className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--sl-text-primary)' }}>
              {filter !== 'TODOS' ? 'Sin solicitudes con este filtro' : 'Aún no tienes solicitudes'}
            </h2>
            <p className="mt-3 max-w-md text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              Cuando un cliente te contacte desde tu ficha pública, las solicitudes aparecerán aquí.
            </p>
          </div>
        )}

        {/* Request Cards */}
        <div className="space-y-5 sl-stagger">
          {(filtered || []).map((item) => {
            const sc = statusConfig[item.status];
            const StatusIcon = sc?.icon ?? Clock3;
            const isPending = item.status === 'PENDING';
            const isNegotiating = item.status === 'NEGOTIATION';
            const isAccepted = item.status === 'ACCEPTED';
            const isInProgress = item.status === 'IN_PROGRESS';

            // Calculate urgency (pending for more than 24h)
            const hoursOld = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);
            const isUrgent = isPending && hoursOld > 24;

            return (
              <article key={item.id} className={`sl-card-premium p-0 group ${isUrgent ? 'sl-animate-border-glow' : ''}`}>
                <div className={`h-1 rounded-t-[var(--sl-radius-xl)] ${
                  isUrgent ? 'bg-gradient-to-r from-amber-400 to-red-400'
                  : item.status === 'COMPLETED' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                  : item.status === 'CANCELLED' ? 'bg-gradient-to-r from-red-400 to-red-500'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                }`} />

                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                        {item.client?.fullName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>
                          {item.serviceTitle}
                        </h2>
                        <p className="text-sm font-semibold text-emerald-600 mt-1">
                          Solicitud de {item.client?.fullName || 'Cliente'}
                        </p>
                        {isUrgent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1.5 sl-animate-glow">
                            ⏰ +24h sin responder
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${sc?.glowClass ?? ''}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {sc?.label ?? item.status}
                    </div>
                  </div>

                  {/* Client info + details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                    <DetailChip icon={<Mail className="h-3.5 w-3.5" />} label="Correo" value={item.client?.email || 'No disponible'} />
                    <DetailChip icon={<Phone className="h-3.5 w-3.5" />} label="Teléfono" value={item.client?.phone || 'No disponible'} />
                    <DetailChip icon={<MapPin className="h-3.5 w-3.5" />} label="Zona" value={item.serviceZone} />
                    <DetailChip icon={<Calendar className="h-3.5 w-3.5" />} label="Fecha" value={item.preferredDate ? new Date(item.preferredDate).toLocaleDateString() : 'No indicada'} />
                  </div>

                  {/* Message */}
                  <div className="mt-5 p-4 rounded-2xl border border-[var(--sl-border-light)]" style={{ background: 'var(--sl-bg)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-3.5 w-3.5" style={{ color: 'var(--sl-text-muted)' }} />
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--sl-text-muted)' }}>Mensaje del cliente</span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--sl-text-secondary)' }}>{item.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Link
                      href={`/panel/proveedor/mensajes/${item.id}`}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <MessageSquare className="h-4 w-4" /> Abrir chat
                    </Link>

                    {isPending && (
                      <button disabled={processingId === item.id} onClick={() => updateStatus(item.id, 'NEGOTIATION')}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-bold text-white shadow-md hover:scale-[1.02] transition-all disabled:opacity-50">
                        <MessageSquare className="h-4 w-4" /> Negociar
                      </button>
                    )}

                    {(isPending || isNegotiating) && (
                      <button disabled={processingId === item.id} onClick={() => updateStatus(item.id, 'ACCEPTED')}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-md hover:scale-[1.02] transition-all disabled:opacity-50">
                        <CheckCircle2 className="h-4 w-4" /> Aceptar
                      </button>
                    )}

                    {isAccepted && (
                      <button disabled={processingId === item.id} onClick={() => updateStatus(item.id, 'IN_PROGRESS')}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-md hover:scale-[1.02] transition-all disabled:opacity-50">
                        <Play className="h-4 w-4" /> Iniciar trabajo
                      </button>
                    )}

                    {isInProgress && (
                      <button disabled={processingId === item.id} onClick={() => updateStatus(item.id, 'COMPLETED')}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-md hover:scale-[1.02] transition-all disabled:opacity-50">
                        <Sparkles className="h-4 w-4" /> Completar
                      </button>
                    )}

                    {(isPending || isNegotiating) && (
                      <button disabled={processingId === item.id} onClick={() => updateStatus(item.id, 'CANCELLED')}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-5 text-sm font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-50">
                        <XCircle className="h-4 w-4" /> Rechazar
                      </button>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-[var(--sl-border-light)] flex items-center gap-4">
                    <span className="text-[11px] font-medium" style={{ color: 'var(--sl-text-muted)' }}>
                      Recibida {item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sl-text-muted)' }}>{label}</p>
        <p className="text-xs font-semibold truncate" style={{ color: 'var(--sl-text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}