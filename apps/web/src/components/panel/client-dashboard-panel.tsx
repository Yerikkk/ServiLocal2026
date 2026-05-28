'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Droplets,
  Hammer,
  KeyRound,
  MapPin,
  Paintbrush,
  Search,
  ShieldCheck,
  Sparkles,
  Trees,
  User,
  Wind,
  Wrench,
  Zap,
  FileText,
  Clock,
  CheckCircle,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { KPICard } from '@/components/ui/kpi-card';
import { TrustBar } from '@/components/ui/trust-bar';
import { SkeletonDashboard, SkeletonCard } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge, TrustBadge, StatusBadge, VerifiedBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { translateCategory } from '@/lib/translations';
import { api } from '@/lib/api-client';

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
  status: string;
};

type TrustSummary = {
  score: number;
  levelLabel: string;
};

type PublicProvider = {
  providerId: string;
  responsibleName: string;
  phone?: string | null;
  businessName: string;
  category: string;
  serviceName: string;
  serviceZone: string;
  description: string;
  isVerified: boolean;
  trustSummary: TrustSummary;
};

type PublicProvidersResponse = {
  total: number;
  items: PublicProvider[];
};

type ClientServiceRequestStatus =
  | 'PENDING'
  | 'NEGOTIATION'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

type ClientServiceRequestItem = {
  id: string;
  status: ClientServiceRequestStatus;
};

type ClientServiceRequestsResponse = {
  total: number;
  items: ClientServiceRequestItem[];
};

const quickCategories: Array<{
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}> = [
  { label: 'Electricidad', value: 'ELECTRICIDAD', icon: Zap, color: '#f59e0b' },
  { label: 'Plomería', value: 'PLOMERIA', icon: Droplets, color: '#3b82f6' },
  { label: 'Limpieza', value: 'LIMPIEZA', icon: Sparkles, color: '#8b5cf6' },
  { label: 'Carpintería', value: 'CARPINTERIA', icon: Hammer, color: '#f97316' },
  { label: 'Pintura', value: 'PINTURA', icon: Paintbrush, color: '#ec4899' },
  { label: 'Jardinería', value: 'JARDINERIA', icon: Trees, color: '#10b981' },
  { label: 'Cerrajería', value: 'CERRAJERIA', icon: KeyRound, color: '#6366f1' },
  { label: 'Aire acondicionado', value: 'AIRE_ACONDICIONADO', icon: Wind, color: '#06b6d4' },
];

function getRolePath(role: CurrentUser['role']) {
  if (role === 'ADMIN') return '/panel/admin';
  if (role === 'PROVIDER') return '/panel/proveedor';
  return '/panel/cliente';
}

export function ClientDashboardPanel() {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [providers, setProviders] = useState<PublicProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickSearch, setQuickSearch] = useState('');
  const [requestsSummary, setRequestsSummary] = useState({
    total: 0,
    pending: 0,
    negotiation: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    expired: 0,
  });

  const verifiedProviders = useMemo(
    () => providers.filter((provider) => provider.isVerified),
    [providers],
  );

  const featuredProviders = useMemo(
    () => verifiedProviders.slice(0, 4),
    [verifiedProviders],
  );

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const authUser = await api.get<CurrentUser>('/api/auth/me');

        if (authUser.role !== 'CLIENT') {
          router.replace(getRolePath(authUser.role));
          return;
        }

        const [providersData, requestsData] = await Promise.all([
          api.get<PublicProvidersResponse>('/api/providers/public?sort=trust_desc&verifiedOnly=true'),
          api.get<ClientServiceRequestsResponse>('/api/service-requests/client/me'),
        ]);
        
        const pending = requestsData.items.filter((item) => item.status === 'PENDING').length;
        const negotiation = requestsData.items.filter((item) => item.status === 'NEGOTIATION').length;
        const accepted = requestsData.items.filter((item) => item.status === 'ACCEPTED').length;
        const inProgress = requestsData.items.filter((item) => item.status === 'IN_PROGRESS').length;
        const completed = requestsData.items.filter((item) => item.status === 'COMPLETED').length;
        const cancelled = requestsData.items.filter((item) => item.status === 'CANCELLED').length;
        const expired = requestsData.items.filter((item) => item.status === 'EXPIRED').length;

        if (!ignore) {
          setUser(authUser);
          setProviders(providersData.items);
          setRequestsSummary({
            total: requestsData.total,
            pending,
            negotiation,
            accepted,
            inProgress,
            completed,
            cancelled,
            expired,
          });
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el panel del cliente',
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, [router]);

  function handleQuickSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = quickSearch.trim();
    if (!query) {
      router.push('/proveedores');
      return;
    }
    router.push(`/proveedores?search=${encodeURIComponent(query)}&sort=trust_desc`);
  }

  if (loading || !user) {
    return (
      <DashboardShell role="CLIENT" userName="Cargando..." userEmail="">
        <SkeletonDashboard />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell role="CLIENT" userName={user?.fullName ?? ''} userEmail={user?.email ?? ''}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          {error}
        </div>
      </DashboardShell>
    );
  }

  const activeRequests = requestsSummary.pending + requestsSummary.negotiation + requestsSummary.accepted + requestsSummary.inProgress;

  return (
    <DashboardShell role="CLIENT" userName={user.fullName} userEmail={user.email} notificationCount={activeRequests}>
      <div className="space-y-8 sl-animate-fade-in">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-[var(--sl-radius-2xl)] bg-gradient-to-br from-[#1EA8E7] via-[#1598d0] to-[#0d7fb3] p-8 text-white shadow-xl md:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-white/5" />
          
          <div className="relative">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Hola, {user.fullName.split(' ')[0]}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-white/90">
              Bienvenido a tu panel de control. Busca servicios confiables, explora categorías y revisa el estado de tus solicitudes desde un solo lugar.
            </p>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Solicitudes activas"
            value={activeRequests}
            icon={<Clock className="h-5 w-5" />}
            iconBg="bg-blue-100 text-blue-600"
            trend={activeRequests > 0 ? 'up' : 'neutral'}
            trendValue={activeRequests > 0 ? 'En curso' : 'Sin actividad'}
          />
          <KPICard
            title="Completadas"
            value={requestsSummary.completed}
            icon={<CheckCircle className="h-5 w-5" />}
            iconBg="bg-emerald-100 text-emerald-600"
          />
          <KPICard
            title="En negociación"
            value={requestsSummary.negotiation}
            icon={<MessageSquare className="h-5 w-5" />}
            iconBg="bg-amber-100 text-amber-600"
          />
          <KPICard
            title="Proveedores en tu zona"
            value={providers.length}
            icon={<MapPin className="h-5 w-5" />}
          />
        </section>

        {/* Quick Search */}
        <section className="sl-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Buscar proveedor o servicio
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Escribe un servicio o palabra clave para encontrar al profesional ideal.
            </p>
          </div>

          <form onSubmit={handleQuickSearch} className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-5 w-5" />
              </span>
              <input
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder="Ej. electricidad, limpieza, carpintería..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-[var(--sl-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--sl-primary)]/10"
              />
            </div>
            <Button type="submit" size="lg" icon={<Search className="h-4 w-4" />}>
              Buscar
            </Button>
          </form>
        </section>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Categories */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Explorar categorías
              </h2>
              <Link href="/proveedores" className="text-sm font-semibold text-[var(--sl-primary)] hover:underline">
                Ver directorio completo &rarr;
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.value}
                    href={`/proveedores?category=${item.value}&sort=trust_desc`}
                    className="sl-card sl-card-interactive group flex items-center gap-4 p-4"
                  >
                    <div 
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{item.label}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Proveedores disponibles</p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 text-slate-300 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Featured Providers */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Proveedores Destacados
            </h2>
            <div className="flex flex-col gap-4">
              {featuredProviders.length === 0 ? (
                <EmptyState
                  icon={<ShieldCheck className="h-6 w-6" />}
                  title="Sin destacados"
                  description="Aún no hay proveedores verificados."
                />
              ) : (
                featuredProviders.map((provider) => (
                  <Link
                    key={provider.providerId}
                    href={`/proveedores/${provider.providerId}`}
                    className="sl-card sl-card-interactive p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold">
                        {provider.businessName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-slate-900 text-sm">
                          {provider.businessName}
                        </h3>
                        <p className="truncate text-xs text-slate-500">
                          {translateCategory(provider.category)}
                        </p>
                      </div>
                      {provider.isVerified && <VerifiedBadge />}
                    </div>
                    <div className="mt-3">
                      <TrustBar score={provider.trustSummary.score} size="sm" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}