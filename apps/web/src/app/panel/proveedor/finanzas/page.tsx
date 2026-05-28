'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, CheckCircle2, CreditCard, Package,
  Sparkles, TrendingUp, Wallet, XCircle, AlertCircle,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { KPICard } from '@/components/ui/kpi-card';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';

type CurrentUser = {
  id: string; email: string; fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER'; status: string;
};

type MonthlyItem = { month: string; label: string; completed: number };

type FinanceSummary = {
  currentMonth: { completed: number; totalEarningsEstimate: number; commissionsEstimate: number };
  allTime: { totalCompleted: number; totalCancelled: number; totalExpired: number; totalRequests: number };
  monthlyBreakdown: MonthlyItem[];
  plan: 'FREE' | 'PREMIUM';
};

export default function FinanzasPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const me = await api.get<CurrentUser>('/api/auth/me');
        if (!ignore) setUser(me);
        if (me.role !== 'PROVIDER') router.replace('/panel');
      } catch { router.replace('/iniciar-sesion'); }
      finally { if (!ignore) setLoading(false); }
    }
    init();
    return () => { ignore = true; };
  }, [router]);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    api.get<FinanceSummary>('/api/providers/me/finance')
      .then(setFinance)
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user]);

  if (loading || !user) {
    return (
      <DashboardShell role="PROVIDER" userName="Cargando..." userEmail="">
        <SkeletonDashboard />
      </DashboardShell>
    );
  }

  const breakdown = finance?.monthlyBreakdown ?? [];
  const maxCompleted = Math.max(...breakdown.map((b) => b.completed), 1);
  const allTime = finance?.allTime;
  const successRate = allTime && allTime.totalRequests > 0
    ? Math.round((allTime.totalCompleted / allTime.totalRequests) * 100)
    : 0;

  return (
    <DashboardShell role="PROVIDER" userName={user.fullName} userEmail={user.email}>
      <div className="space-y-8 max-w-6xl mx-auto sl-animate-fade-in">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-[var(--sl-radius-2xl)] bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-8 md:p-10 sl-animate-gradient">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 sl-animate-float" />
          <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60 mb-3">Actividad</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Mis Finanzas</h1>
            <p className="mt-3 text-white/80 text-sm max-w-xl leading-relaxed">
              Visualiza tu actividad y el rendimiento de tus servicios en la plataforma.
            </p>
            {/* Plan badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              {finance?.plan === 'FREE' ? (
                <>
                  <Wallet className="h-4 w-4 text-white/80" />
                  <span className="text-sm font-semibold text-white">Plan Gratuito</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span className="text-sm font-semibold text-white">Plan Premium</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info notice: sin pasarela de pago */}
        <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
          <p className="text-sm text-blue-700">
            <strong>Módulo de actividad:</strong> Los datos reflejan la actividad real de tus solicitudes en la plataforma.
            La integración con pasarela de pago estará disponible en la versión Premium.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 sl-stagger">
          <KPICard
            title="Completadas este mes"
            value={finance?.currentMonth.completed ?? 0}
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconBg="bg-emerald-100 text-emerald-600"
            trend="up"
          />
          <KPICard
            title="Total completadas"
            value={allTime?.totalCompleted ?? 0}
            icon={<Package className="h-5 w-5" />}
            iconBg="bg-teal-100 text-teal-600"
          />
          <KPICard
            title="Tasa de éxito"
            value={allTime?.totalRequests ? `${successRate}%` : '—'}
            icon={<TrendingUp className="h-5 w-5" />}
            iconBg="bg-cyan-100 text-cyan-600"
          />
          <KPICard
            title="Canceladas / Expiradas"
            value={`${allTime?.totalCancelled ?? 0} / ${allTime?.totalExpired ?? 0}`}
            icon={<XCircle className="h-5 w-5" />}
            iconBg="bg-rose-100 text-rose-600"
          />
        </div>

        {/* Bar chart mensual */}
        <div className="sl-card-premium p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--sl-text-primary)' }}>Solicitudes completadas</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--sl-text-secondary)' }}>Últimos 6 meses</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'var(--sl-primary-light)', color: 'var(--sl-primary)' }}>
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          {breakdown.length === 0 || breakdown.every((b) => b.completed === 0) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100">
                <BarChart3 className="h-7 w-7 text-slate-400" />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--sl-text-secondary)' }}>Aún no hay solicitudes completadas</p>
              <p className="text-xs" style={{ color: 'var(--sl-text-muted)' }}>Los datos aparecerán aquí cuando completes tus primeros servicios.</p>
            </div>
          ) : (
            <div className="flex items-end gap-3 h-44">
              {breakdown.map((b) => {
                const heightPct = maxCompleted > 0 ? (b.completed / maxCompleted) * 100 : 0;
                const isCurrentMonth = b.month === new Date().toISOString().slice(0, 7);
                return (
                  <div key={b.month} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--sl-text-secondary)' }}>
                      {b.completed > 0 ? b.completed : ''}
                    </span>
                    <div className="relative w-full flex items-end justify-center" style={{ height: '120px' }}>
                      <div
                        className="w-full rounded-t-xl transition-all duration-700"
                        style={{
                          height: `${Math.max(heightPct, b.completed > 0 ? 8 : 0)}%`,
                          background: isCurrentMonth
                            ? 'linear-gradient(to top, #10b981, #34d399)'
                            : 'var(--sl-primary-light)',
                          opacity: b.completed === 0 ? 0.3 : 1,
                          minHeight: b.completed > 0 ? '8px' : '3px',
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: 'var(--sl-text-muted)' }}>
                      {b.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary table */}
        {allTime && allTime.totalRequests > 0 && (
          <div className="sl-card-premium overflow-hidden">
            <div className="border-b border-[var(--sl-border-light)] px-6 py-4 flex items-center gap-2" style={{ background: 'var(--sl-bg)' }}>
              <CreditCard className="h-4 w-4" style={{ color: 'var(--sl-primary)' }} />
              <h2 className="font-bold" style={{ color: 'var(--sl-text-primary)' }}>Resumen de actividad</h2>
            </div>
            <div className="divide-y divide-[var(--sl-border-light)]">
              {[
                { label: 'Total de solicitudes', value: allTime.totalRequests, color: 'text-slate-600' },
                { label: 'Completadas', value: allTime.totalCompleted, color: 'text-emerald-600' },
                { label: 'Canceladas', value: allTime.totalCancelled, color: 'text-red-500' },
                { label: 'Expiradas', value: allTime.totalExpired, color: 'text-amber-500' },
                { label: 'Tasa de éxito', value: `${successRate}%`, color: 'text-violet-600' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm font-medium" style={{ color: 'var(--sl-text-secondary)' }}>{row.label}</span>
                  <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
