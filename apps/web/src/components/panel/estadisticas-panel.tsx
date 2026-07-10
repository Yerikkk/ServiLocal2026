'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Package,
  Users,
  Activity,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { KPICard } from '@/components/ui/kpi-card';
import { TrustBar } from '@/components/ui/trust-bar';
import { SkeletonList } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/cn';

/* ─── Types ─────────────────────────────────────── */

type CurrentUser = {
  id: string; email: string; fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
};

type TrustSummary = {
  score: number;
  slPoints: number;
  levelLabel: string;
  levelColor: string;
  recentEvents: TrustEvent[];
};

type TrustEvent = {
  id: string;
  eventType: string;
  points: number;
  reason: string;
  createdAt: string;
};

type ProviderRequest = {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
};

type RequestsResponse = { items: ProviderRequest[]; total: number };

/* ─── Helpers ───────────────────────────────────── */

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function getTrustLevel(score: number) {
  if (score >= 90) return { label: 'Destacado',        color: '#3b82f6', bg: 'bg-blue-50' };
  if (score >= 70) return { label: 'Confianza alta',   color: '#10b981', bg: 'bg-emerald-50' };
  if (score >= 50) return { label: 'Confianza media',  color: '#f59e0b', bg: 'bg-amber-50' };
  if (score >= 30) return { label: 'Confianza baja',   color: '#ef4444', bg: 'bg-red-50' };
  return           { label: 'Sin reputación',           color: '#94a3b8', bg: 'bg-slate-50' };
}

const EVENT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  REQUEST_COMPLETED:  { label: 'Solicitud completada',   icon: CheckCircle2, color: '#10b981' },
  FAST_RESPONSE:      { label: 'Respuesta rápida',        icon: Clock,        color: '#3b82f6' },
  WEEKLY_ACTIVE:      { label: 'Uso activo semanal',      icon: Activity,     color: '#6366f1' },
  CANCEL_NO_REASON:   { label: 'Cancelación sin razón',   icon: AlertTriangle,color: '#ef4444' },
  CANCEL_REPEATED:    { label: 'Cancelaciones reiteradas',icon: AlertTriangle,color: '#dc2626' },
  REQUEST_EXPIRED:    { label: 'Solicitud expirada',      icon: AlertTriangle,color: '#f59e0b' },
  ADMIN_REPORT:       { label: 'Reporte de admin',        icon: ShieldCheck,  color: '#7c3aed' },
  INACTIVITY:         { label: 'Inactividad prolongada',  icon: Clock,        color: '#94a3b8' },
};

/* ─── Main Component ────────────────────────────── */

export function EstadisticasPanel() {
  const router = useRouter();
  const [user, setUser]       = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [trust, setTrust]     = useState<TrustSummary | null>(null);
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  /* ── Load user + data ───────────────────────── */
  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const data = await api.get<CurrentUser>('/api/auth/me');
        if (data.role !== 'PROVIDER') { router.replace('/panel'); return; }
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

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [trustData, reqData] = await Promise.all([
        api.get<TrustSummary>('/api/trust/me'),
        api.get<RequestsResponse>('/api/service-requests/provider/me'),
      ]);
      setTrust(trustData);
      setRequests(reqData.items ?? []);
    } catch { /* ignore */ }
    finally { setDataLoading(false); }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  /* ── Stats derivation ───────────────────────── */
  const completed  = (requests || []).filter((r) => r.status === 'COMPLETED').length;
  const pending    = (requests || []).filter((r) => r.status === 'PENDING').length;
  const accepted   = (requests || []).filter((r) => r.status === 'ACCEPTED').length;
  const cancelled  = (requests || []).filter((r) => r.status === 'CANCELLED').length;
  const expired    = (requests || []).filter((r) => r.status === 'EXPIRED').length;
  const total      = (requests || []).length;
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  /* ── Skeleton ───────────────────────────────── */
  if (loading || !user) {
    return (
      <DashboardShell role="PROVIDER" userName="Cargando..." userEmail="">
        <SkeletonList count={4} />
      </DashboardShell>
    );
  }

  const trustLevel = trust ? getTrustLevel(trust.score) : getTrustLevel(0);

  /* ─── Render ────────────────────────────────── */
  return (
    <DashboardShell role="PROVIDER" userName={user.fullName} userEmail={user.email}>
      <div className="space-y-8 sl-animate-fade-in max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--sl-primary-light)] text-[var(--sl-primary)]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>
              Mis Estadísticas
            </h1>
            <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              Métricas de rendimiento y confianza de tu cuenta
            </p>
          </div>
        </header>

        {/* ── Trust Card ──────────────────────── */}
        {trust && (
          <section
            className="rounded-3xl p-6 md:p-8 space-y-5"
            style={{ background: 'var(--sl-surface)', border: '1px solid var(--sl-border)' }}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5" style={{ color: 'var(--sl-primary)' }} />
                  <h2 className="text-lg font-extrabold" style={{ color: 'var(--sl-text-primary)' }}>
                    Puntuación de confianza
                  </h2>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black tabular-nums" style={{ color: trustLevel.color }}>
                    {trust.score}
                  </span>
                  <span className="mb-1 text-lg font-bold" style={{ color: 'var(--sl-text-muted)' }}>/100</span>
                  <span className={cn('mb-1.5 rounded-full px-3 py-1 text-sm font-bold', trustLevel.bg)}
                    style={{ color: trustLevel.color }}>
                    {trust.levelLabel}
                  </span>
                </div>
              </div>

              {/* SL Points */}
              <div className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <Zap className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-amber-700">{trust.slPoints.toLocaleString()}</p>
                  <p className="text-xs font-semibold text-amber-600">SL Points acumulados</p>
                </div>
              </div>
            </div>

            <TrustBar score={trust.score} showLabel size="lg" />
          </section>
        )}

        {/* ── KPI Grid ────────────────────────── */}
        <section className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <KPICard title="Total solicitudes" value={total}     icon={<Package className="h-5 w-5" />}   iconBg="bg-slate-100 text-slate-600" />
          <KPICard title="Completadas"        value={completed} icon={<CheckCircle2 className="h-5 w-5" />} iconBg="bg-emerald-100 text-emerald-600" />
          <KPICard title="En curso"           value={pending + accepted} icon={<Clock className="h-5 w-5" />} iconBg="bg-blue-100 text-blue-600" />
          <KPICard title="Canceladas"         value={cancelled} icon={<AlertTriangle className="h-5 w-5" />} iconBg="bg-red-100 text-red-500" />
          <KPICard title="Tasa de éxito"      value={`${successRate}%`} icon={<TrendingUp className="h-5 w-5" />} iconBg="bg-violet-100 text-violet-600" />
        </section>

        {/* ── Request status bar ──────────────── */}
        {total > 0 && (
          <section className="rounded-2xl border border-[var(--sl-border)] p-6"
            style={{ background: 'var(--sl-surface)' }}>
            <h2 className="text-base font-extrabold mb-4" style={{ color: 'var(--sl-text-primary)' }}>
              Distribución de solicitudes
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Completadas',  count: completed, color: '#10b981', pct: (completed / total) * 100 },
                { label: 'Pendientes',   count: pending,   color: '#f59e0b', pct: (pending / total) * 100 },
                { label: 'Aceptadas',    count: accepted,  color: '#3b82f6', pct: (accepted / total) * 100 },
                { label: 'Canceladas',   count: cancelled, color: '#ef4444', pct: (cancelled / total) * 100 },
                { label: 'Expiradas',    count: expired,   color: '#94a3b8', pct: (expired / total) * 100 },
              ].filter((row) => row.count > 0).map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between mb-1.5 text-xs font-semibold" style={{ color: 'var(--sl-text-secondary)' }}>
                    <span>{row.label}</span>
                    <span>{row.count} ({Math.round(row.pct)}%)</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--sl-border-light)' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Recent trust events ──────────────── */}
        {trust && (trust.recentEvents || []).length > 0 && (
          <section>
            <h2 className="text-base font-extrabold mb-4" style={{ color: 'var(--sl-text-primary)' }}>
              Actividad de confianza reciente
            </h2>
            <div className="overflow-hidden rounded-2xl border border-[var(--sl-border)]"
              style={{ background: 'var(--sl-surface)' }}>
              {(trust.recentEvents || []).map((ev, idx) => {
                const cfg = EVENT_CONFIG[ev.eventType] ?? {
                  label: ev.eventType, icon: Star, color: '#64748b'
                };
                const Icon = cfg.icon;
                const isPositive = ev.points > 0;
                return (
                  <div
                    key={ev.id}
                    className={cn(
                      'flex items-center gap-4 px-5 py-4',
                      idx !== 0 && 'border-t border-[var(--sl-border-light)]'
                    )}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--sl-text-primary)' }}>
                        {ev.reason}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--sl-text-muted)' }}>
                        {formatDate(ev.createdAt)}
                      </p>
                    </div>
                    <span className={cn(
                      'shrink-0 rounded-full px-3 py-1 text-xs font-black',
                      isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    )}>
                      {isPositive ? '+' : ''}{ev.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </DashboardShell>
  );
}
