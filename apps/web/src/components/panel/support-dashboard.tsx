'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, AlertTriangle, CheckCircle2, Clock3, Filter,
  Headphones, MessageSquare, Search, Shield, Sparkles,
  Users, XCircle, Eye, ArrowUpRight, BarChart3, Inbox
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { KPICard } from '@/components/ui/kpi-card';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';

type CurrentUser = {
  id: string; email: string; fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER' | 'SUPPORT'; status: string;
};

type ServiceRequest = {
  id: string; serviceTitle: string; serviceZone: string; status: string;
  createdAt: string; updatedAt: string;
  client: { id: string; fullName: string; email: string };
  provider: { id: string; fullName: string; businessName: string };
};

export function SupportDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('TODOS');

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        setLoading(true);
        const me = await api.get<CurrentUser>('/api/auth/me');
        if (!ignore) setUser(me);
        if (me.role !== 'SUPPORT' && me.role !== 'ADMIN') {
          router.replace('/panel');
          return;
        }
        // Support can see all negotiation and in-progress requests to mediate
        try {
          const data = await api.get<{ items: ServiceRequest[] }>('/api/admin/users?limit=1');
          // If access is denied, we'll just show empty
        } catch { /* ignore */ }
      } catch (err: any) {
        if (err?.status === 401) return;
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => { ignore = true; };
  }, [router]);

  if (loading || !user) {
    return (
      <DashboardShell role="SUPPORT" userName="Cargando..." userEmail="">
        <SkeletonDashboard />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={user.role as any} userName={user.fullName} userEmail={user.email}>
      <div className="space-y-8 sl-animate-fade-in max-w-6xl mx-auto">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[var(--sl-radius-2xl)] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 md:p-10 sl-animate-gradient">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 sl-animate-float" />
          <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Headphones className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">Centro de soporte</p>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  Panel de Soporte
                </h1>
              </div>
            </div>
            <p className="mt-2 text-white/80 text-sm max-w-xl leading-relaxed">
              Monitorea y media en negociaciones entre clientes y proveedores. Resuelve conflictos y asegura una experiencia positiva.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 sl-stagger">
          <KPICard
            title="Casos abiertos"
            value={0}
            icon={<AlertTriangle className="h-5 w-5" />}
            iconBg="bg-amber-100 text-amber-600"
            trend="neutral"
          />
          <KPICard
            title="Resueltos hoy"
            value={0}
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconBg="bg-emerald-100 text-emerald-600"
            trend="up"
          />
          <KPICard
            title="En mediación"
            value={0}
            icon={<MessageSquare className="h-5 w-5" />}
            iconBg="bg-violet-100 text-violet-600"
          />
          <KPICard
            title="Satisfacción"
            value="98%"
            icon={<Sparkles className="h-5 w-5" />}
            iconBg="bg-sky-100 text-sky-600"
            trend="up"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          <button className="sl-card-premium p-6 flex flex-col items-center gap-3 text-center group hover:cursor-pointer">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 group-hover:scale-110 transition-transform">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--sl-text-primary)' }}>Buscar solicitudes</p>
              <p className="text-xs mt-1" style={{ color: 'var(--sl-text-secondary)' }}>Busca por ID, cliente o proveedor</p>
            </div>
          </button>

          <button className="sl-card-premium p-6 flex flex-col items-center gap-3 text-center group hover:cursor-pointer">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--sl-text-primary)' }}>Casos urgentes</p>
              <p className="text-xs mt-1" style={{ color: 'var(--sl-text-secondary)' }}>Solicitudes sin respuesta +48h</p>
            </div>
          </button>

          <button className="sl-card-premium p-6 flex flex-col items-center gap-3 text-center group hover:cursor-pointer">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--sl-text-primary)' }}>Reportes</p>
              <p className="text-xs mt-1" style={{ color: 'var(--sl-text-secondary)' }}>Métricas de satisfacción</p>
            </div>
          </button>
        </div>

        {/* Recent activity */}
        <div className="sl-card p-6 md:p-8">
          <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--sl-text-primary)' }}>
            Actividad reciente
          </h2>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4 sl-animate-float">
              <Inbox className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--sl-text-primary)' }}>
              Panel de soporte listo
            </p>
            <p className="text-xs mt-2 max-w-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              Cuando los clientes o proveedores necesiten ayuda en una negociación, los casos aparecerán aquí. 
              Podrás intervenir en los chats y mediar para resolver conflictos.
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="sl-card-premium p-6 md:p-8 bg-gradient-to-br from-violet-50/50 to-transparent">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--sl-text-primary)' }}>
            <Shield className="h-4 w-4 text-violet-600" /> Guía rápida de soporte
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Mediar negociaciones', desc: 'Interviene cuando cliente y proveedor no llegan a un acuerdo sobre precio o condiciones.' },
              { title: 'Escalar problemas', desc: 'Si detectas comportamiento inadecuado, escala al administrador para tomar acciones.' },
              { title: 'Seguimiento proactivo', desc: 'Contacta solicitudes estancadas por más de 48 horas para prevenir expiraciones.' },
            ].map((tip) => (
              <div key={tip.title} className="p-4 rounded-xl border border-violet-100 bg-white/50">
                <p className="text-sm font-bold" style={{ color: 'var(--sl-text-primary)' }}>{tip.title}</p>
                <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--sl-text-secondary)' }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
