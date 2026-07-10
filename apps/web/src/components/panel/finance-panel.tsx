'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Zap,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SkeletonList } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { cn } from '@/lib/cn';

type FinanceSummary = {
  currentMonth: {
    completed: number;
    totalEarningsEstimate: number;
    commissionsEstimate: number;
  };
  allTime: {
    totalCompleted: number;
    totalCancelled: number;
    totalExpired: number;
    totalRequests: number;
  };
  monthlyBreakdown: Array<{
    month: string;
    label: string;
    completed: number;
  }>;
  plan: 'FREE' | 'PREMIUM' | 'PRO';
};

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
};

export function FinancePanel() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const data = await api.get<CurrentUser>('/api/auth/me');
        if (data.role !== 'PROVIDER') {
          router.replace('/panel');
          return;
        }
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
      const data = await api.get<FinanceSummary>('/api/providers/me/finance');
      setFinance(data);
    } catch { /* ignore */ }
    finally { setDataLoading(false); }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  if (loading || !user) {
    return (
      <DashboardShell role="PROVIDER" userName="Cargando..." userEmail="">
        <SkeletonList count={4} />
      </DashboardShell>
    );
  }

  const maxCompletedInMonth = Math.max(
    ...(finance?.monthlyBreakdown.map((m) => m.completed) || [0]),
    1,
  );

  return (
    <DashboardShell role="PROVIDER" userName={user.fullName} userEmail={user.email}>
      <div className="space-y-8 sl-animate-fade-in max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--sl-text-primary)' }}>
              Finanzas
            </h1>
            <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              Resumen de tus ingresos y actividad
            </p>
          </div>
        </header>

        {/* Plan & Summary Cards */}
        {finance && (
          <>
            {/* Plan Badge */}
            <div className="rounded-[30px] border border-amber-100 bg-amber-50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
                  <Zap className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg" style={{ color: 'var(--sl-text-primary)' }}>
                    Plan {finance.plan === 'FREE' ? 'Gratis' : finance.plan}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
                    {finance.plan === 'FREE'
                      ? 'Actualiza para desbloquear funciones avanzadas y comisiones más bajas'
                      : 'Estás aprovechando al máximo tu plan'}
                  </p>
                </div>
                <button className="px-5 py-2 rounded-2xl font-semibold text-sm bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                  {finance.plan === 'FREE' ? 'Actualizar' : 'Gestionar plan'}
                </button>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <MetricCard
                icon={<CheckCircle className="h-5 w-5" />}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                label="Completados este mes"
                value={finance.currentMonth.completed}
              />
              <MetricCard
                icon={<DollarSign className="h-5 w-5" />}
                iconBg="bg-sky-50"
                iconColor="text-sky-600"
                label="Ganancias estimadas"
                value={`S/ ${finance.currentMonth.totalEarningsEstimate.toLocaleString()}`}
              />
              <MetricCard
                icon={<BarChart3 className="h-5 w-5" />}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
                label="Total completados"
                value={finance.allTime.totalCompleted}
              />
              <MetricCard
                icon={<Calendar className="h-5 w-5" />}
                iconBg="bg-slate-50"
                iconColor="text-slate-600"
                label="Tasa de éxito"
                value={`${
                  finance.allTime.totalRequests > 0
                    ? Math.round(
                        (finance.allTime.totalCompleted / finance.allTime.totalRequests) * 100,
                      )
                    : 0
                }%`}
              />
            </section>

            {/* All Time Stats */}
            <section className="rounded-[30px] border border-[var(--sl-border)] p-7" style={{ background: 'var(--sl-surface)' }}>
              <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--sl-text-primary)' }}>
                Actividad histórica
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatItem
                  icon={<CheckCircle className="h-5 w-5" />}
                  label="Completados"
                  value={finance.allTime.totalCompleted}
                  color="text-emerald-600"
                  bg="bg-emerald-50"
                />
                <StatItem
                  icon={<XCircle className="h-5 w-5" />}
                  label="Cancelados"
                  value={finance.allTime.totalCancelled}
                  color="text-red-600"
                  bg="bg-red-50"
                />
                <StatItem
                  icon={<Clock className="h-5 w-5" />}
                  label="Expirados"
                  value={finance.allTime.totalExpired}
                  color="text-amber-600"
                  bg="bg-amber-50"
                />
                <StatItem
                  icon={<BarChart3 className="h-5 w-5" />}
                  label="Total solicitudes"
                  value={finance.allTime.totalRequests}
                  color="text-sky-600"
                  bg="bg-sky-50"
                />
              </div>
            </section>

            {/* Monthly Breakdown Chart */}
            <section className="rounded-[30px] border border-[var(--sl-border)] p-7" style={{ background: 'var(--sl-surface)' }}>
              <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--sl-text-primary)' }}>
                Rendimiento mensual
              </h2>
              <div className="space-y-4">
                {finance.monthlyBreakdown.map((item) => {
                  const percentage = (item.completed / maxCompletedInMonth) * 100;
                  return (
                    <div key={item.month} className="flex items-center gap-4">
                      <span className="w-16 text-sm font-semibold" style={{ color: 'var(--sl-text-secondary)' }}>
                        {item.label}
                      </span>
                      <div className="flex-1 h-8 rounded-full overflow-hidden" style={{ background: 'var(--sl-border-light)' }}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#1EA8E7] to-[#10b981] transition-all duration-700"
                          style={{ width: `${Math.max(5, percentage)}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-bold" style={{ color: 'var(--sl-text-primary)' }}>
                        {item.completed}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Proximamente Notice */}
            <div className="rounded-[30px] border border-sky-100 bg-sky-50 p-7">
              <h3 className="font-bold text-lg text-sky-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-sky-600" />
                Próximamente
              </h3>
              <p className="text-sky-700">
                Pronto podrás ver desgloses detallados de comisiones, descargar reportes y conectar métodos de pago directos.
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function MetricCard({
  icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-[30px] border border-[var(--sl-border)] p-6" style={{ background: 'var(--sl-surface)' }}>
      <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl mb-4', iconBg, iconColor)}>
        {icon}
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--sl-text-secondary)' }}>
        {label}
      </p>
      <p className="text-2xl font-extrabold" style={{ color: 'var(--sl-text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="text-center">
      <div className={cn('mx-auto flex h-12 w-12 items-center justify-center rounded-2xl mb-3', bg, color)}>
        {icon}
      </div>
      <p className="text-2xl font-extrabold" style={{ color: 'var(--sl-text-primary)' }}>
        {value}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--sl-text-secondary)' }}>
        {label}
      </p>
    </div>
  );
}
