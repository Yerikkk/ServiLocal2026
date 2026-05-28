'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gift,
  ShieldCheck,
  Star,
  TrendingUp,
  Zap,
  Award,
  ChevronRight,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { TrustBar } from '@/components/ui/trust-bar';
import { SkeletonList } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/cn';

/* ─── Types ─────────────────────────────────────── */

type CurrentUser = {
  id: string; email: string; fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
};

type TrustEvent = {
  id: string;
  eventType: string;
  points: number;
  reason: string;
  createdAt: string;
  request?: { id: string; serviceTitle: string } | null;
};

type TrustSummary = {
  score: number;
  slPoints: number;
  levelLabel: string;
  levelColor: string;
  recentEvents: TrustEvent[];
};

type AllEventsResponse = {
  total: number;
  items: TrustEvent[];
};

/* ─── Points tiers ──────────────────────────────── */

type Tier = {
  name: string; points: number; icon: string; color: string;
  perks: string[];
};

const TIERS: Tier[] = [
  {
    name: 'Bronce',  points: 0,    icon: '🥉', color: '#cd7f32',
    perks: ['Acceso a la plataforma', 'Publicar hasta 3 servicios'],
  },
  {
    name: 'Plata',   points: 50,   icon: '🥈', color: '#94a3b8',
    perks: ['Badge de Plata en perfil', 'Publicar hasta 10 servicios', 'Acceso a estadísticas'],
  },
  {
    name: 'Oro',     points: 150,  icon: '🥇', color: '#f59e0b',
    perks: ['Badge de Oro en perfil', 'Prioridad en búsquedas', 'Publicar servicios ilimitados'],
  },
  {
    name: 'Platino', points: 400,  icon: '💎', color: '#6366f1',
    perks: ['Badge Platino destacado', 'Sello "Proveedor Élite"', 'Acceso anticipado a features'],
  },
];

/* ─── How to earn ───────────────────────────────── */

const HOW_TO_EARN = [
  { icon: CheckCircle2, label: 'Completar una solicitud',               points: '+10 pts', color: '#10b981' },
  { icon: Clock,        label: 'Responder en menos de 1 hora',          points: '+3 pts',  color: '#3b82f6' },
  { icon: Activity,     label: 'Uso activo semanal de la plataforma',   points: '+2 pts',  color: '#6366f1' },
  { icon: Star,         label: 'Primera completación del mes',           points: '+5 pts',  color: '#f59e0b' },
  { icon: ShieldCheck,  label: 'Mantener confianza alta 30 días',       points: '+5 pts',  color: '#8b5cf6' },
];

/* ─── Helpers ───────────────────────────────────── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const EVENT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  REQUEST_COMPLETED:  { label: 'Solicitud completada',     icon: CheckCircle2, color: '#10b981' },
  FAST_RESPONSE:      { label: 'Respuesta rápida (<2h)',   icon: Clock,        color: '#3b82f6' },
  WEEKLY_ACTIVE:      { label: 'Uso activo semanal',       icon: Activity,     color: '#6366f1' },
  CANCEL_NO_REASON:   { label: 'Cancelación sin razón',    icon: AlertTriangle,color: '#ef4444' },
  CANCEL_REPEATED:    { label: 'Cancelaciones reiteradas', icon: AlertTriangle,color: '#dc2626' },
  REQUEST_EXPIRED:    { label: 'Solicitud expirada',       icon: AlertTriangle,color: '#f59e0b' },
  ADMIN_REPORT:       { label: 'Reporte de admin',         icon: ShieldCheck,  color: '#7c3aed' },
  INACTIVITY:         { label: 'Inactividad',              icon: Clock,        color: '#94a3b8' },
};

/* ─── Main Component ────────────────────────────── */

export function RecompensasPanel() {
  const router = useRouter();
  const [user, setUser]       = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [trust, setTrust]     = useState<TrustSummary | null>(null);
  const [allEvents, setAllEvents] = useState<TrustEvent[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

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

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [trustData, eventsData] = await Promise.all([
        api.get<TrustSummary>('/api/trust/me'),
        api.get<AllEventsResponse>('/api/trust/me/events?take=50'),
      ]);
      setTrust(trustData);
      setAllEvents(eventsData.items ?? []);
    } catch { /* ignore */ }
    finally { setDataLoading(false); }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  /* ── Tier derivation ────────────────────────── */
  const currentPoints = trust?.slPoints ?? 0;
  const currentTier   = [...TIERS].reverse().find((t) => currentPoints >= t.points) ?? TIERS[0];
  const nextTier      = TIERS.find((t) => t.points > currentPoints);
  const progressPct   = nextTier
    ? Math.min(100, ((currentPoints - currentTier.points) / (nextTier.points - currentTier.points)) * 100)
    : 100;

  /* ── Skeleton ───────────────────────────────── */
  if (loading || !user) {
    return (
      <DashboardShell role="CLIENT" userName="Cargando..." userEmail="">
        <SkeletonList count={4} />
      </DashboardShell>
    );
  }

  const roleForShell = user.role === 'PROVIDER' ? 'PROVIDER' : 'CLIENT';
  const eventsToShow = showAllEvents ? allEvents : allEvents.slice(0, 8);

  /* ─── Render ────────────────────────────────── */
  return (
    <DashboardShell role={roleForShell} userName={user.fullName} userEmail={user.email}>
      <div className="space-y-8 sl-animate-fade-in max-w-4xl mx-auto">

        {/* Header */}
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>
              Recompensas y SL Points
            </h1>
            <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              Acumula puntos siendo activo y sube de nivel en ServiLocal
            </p>
          </div>
        </header>

        {/* ── Points card ─────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl p-6 md:p-8"
          style={{ background: 'linear-gradient(135deg, var(--sl-primary) 0%, #1598d0 60%, #0d7fb3 100%)' }}>
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white/70 mb-1">Tus SL Points</p>
              <div className="flex items-end gap-3">
                <span className="text-6xl font-black text-white tabular-nums">
                  {currentPoints.toLocaleString()}
                </span>
                <div className="mb-2 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1">
                  <span className="text-lg">{currentTier.icon}</span>
                  <span className="text-sm font-bold text-white">{currentTier.name}</span>
                </div>
              </div>
            </div>

            {/* Confianza */}
            {trust && (
              <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 sm:min-w-[200px]">
                <p className="text-xs font-semibold text-white/70 mb-2">Confianza</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-black text-white">{trust.score}</span>
                  <span className="text-white/60 text-sm">/100</span>
                  <span className="text-xs font-bold rounded-full bg-white/20 px-2 py-0.5 text-white">
                    {trust.levelLabel}
                  </span>
                </div>
                <TrustBar score={trust.score} size="sm" />
              </div>
            )}
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="relative mt-5">
              <div className="flex justify-between text-xs text-white/70 mb-2">
                <span>{currentTier.name} — {currentPoints} pts</span>
                <span>{nextTier.name} — {nextTier.points} pts</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-white/70">
                Te faltan <span className="font-bold text-white">{nextTier.points - currentPoints}</span> pts para alcanzar nivel {nextTier.name}
              </p>
            </div>
          )}
        </section>

        {/* ── Tier ladder ─────────────────────── */}
        <section>
          <h2 className="text-base font-extrabold mb-4" style={{ color: 'var(--sl-text-primary)' }}>
            Niveles ServiLocal
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => {
              const isCurrent = tier.name === currentTier.name;
              const unlocked  = currentPoints >= tier.points;
              return (
                <div
                  key={tier.name}
                  className={cn(
                    'relative rounded-2xl border p-5 transition-all',
                    isCurrent && 'ring-2',
                    !unlocked && 'opacity-60'
                  )}
                  style={{
                    background: isCurrent ? `${tier.color}10` : 'var(--sl-surface)',
                    borderColor: isCurrent ? tier.color : 'var(--sl-border)',
                    ...(isCurrent ? { '--tw-ring-color': tier.color } as React.CSSProperties : {}),
                  }}
                >
                  {isCurrent && (
                    <span
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-black text-white"
                      style={{ backgroundColor: tier.color }}
                    >
                      Nivel actual
                    </span>
                  )}
                  <div className="text-3xl mb-2">{tier.icon}</div>
                  <p className="font-extrabold text-sm mb-0.5" style={{ color: tier.color }}>{tier.name}</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--sl-text-muted)' }}>
                    desde {tier.points} pts
                  </p>
                  <ul className="space-y-1.5">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--sl-text-secondary)' }}>
                        <span style={{ color: tier.color }}>✓</span> {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── How to earn ─────────────────────── */}
        <section className="rounded-2xl border border-[var(--sl-border)] p-6"
          style={{ background: 'var(--sl-surface)' }}>
          <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={{ color: 'var(--sl-text-primary)' }}>
            <TrendingUp className="h-4 w-4" style={{ color: 'var(--sl-primary)' }} />
            Cómo ganar puntos
          </h2>
          <div className="space-y-3">
            {HOW_TO_EARN.map(({ icon: Icon, label, points, color }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${color}18`, color }}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="flex-1 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>{label}</p>
                <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-black text-emerald-700">
                  {points}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Points history ───────────────────── */}
        {allEvents.length > 0 && (
          <section>
            <h2 className="text-base font-extrabold mb-4 flex items-center gap-2" style={{ color: 'var(--sl-text-primary)' }}>
              <Award className="h-4 w-4" style={{ color: 'var(--sl-primary)' }} />
              Historial de actividad
            </h2>
            <div className="overflow-hidden rounded-2xl border border-[var(--sl-border)]"
              style={{ background: 'var(--sl-surface)' }}>
              {eventsToShow.map((ev, idx) => {
                const cfg = EVENT_CONFIG[ev.eventType] ?? { label: ev.eventType, icon: Star, color: '#64748b' };
                const Icon = cfg.icon;
                const isPositive = ev.points > 0;
                return (
                  <div key={ev.id}
                    className={cn('flex items-center gap-4 px-5 py-4', idx !== 0 && 'border-t border-[var(--sl-border-light)]')}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--sl-text-primary)' }}>
                        {ev.reason}
                      </p>
                      {ev.request && (
                        <p className="text-xs truncate mt-0.5" style={{ color: 'var(--sl-text-muted)' }}>
                          "{ev.request.serviceTitle}"
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={cn(
                        'rounded-full px-3 py-1 text-xs font-black',
                        isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                      )}>
                        {isPositive ? '+' : ''}{ev.points} pts
                      </span>
                      <p className="mt-1 text-[10px]" style={{ color: 'var(--sl-text-muted)' }}>
                        {formatDate(ev.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {allEvents.length > 8 && (
                <button
                  onClick={() => setShowAllEvents((v) => !v)}
                  className="flex w-full items-center justify-center gap-2 border-t border-[var(--sl-border-light)] py-3 text-xs font-semibold transition hover:bg-[var(--sl-primary-muted)]"
                  style={{ color: 'var(--sl-primary)' }}
                >
                  {showAllEvents ? 'Ver menos' : `Ver los ${allEvents.length - 8} eventos anteriores`}
                  <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', showAllEvents && 'rotate-90')} />
                </button>
              )}
            </div>
          </section>
        )}

      </div>
    </DashboardShell>
  );
}
