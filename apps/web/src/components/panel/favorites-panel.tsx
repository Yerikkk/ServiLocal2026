'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Bookmark,
  BookmarkX,
  DollarSign,
  Hammer,
  Heart,
  KeyRound,
  Layers,
  MapPin,
  Paintbrush,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trees,
  User,
  Wind,
  Wrench,
  Zap,
  Droplets,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { VerifiedBadge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api-client';
import { getProviderCategoryKey } from '@/lib/provider-display';

/* ─── Types ─────────────────────────────────────── */

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
  status: string;
};

type FavoriteProvider = {
  favoriteId: string;
  providerId: string;
  responsibleName: string;
  phone: string | null;
  businessName: string;
  categoryId?: string;
  categoryName?: string | null;
  categorySlug?: string | null;
  category?: string | null;
  serviceName: string;
  serviceZone: string;
  isVerified: boolean;
  createdAt: string;
};

type FavoriteService = {
  favoriteId: string;
  service: {
    id: string;
    name: string;
    description: string;
    referencePrice: string | null;
    categoryName: string;
    providerName: string;
    isVerified: boolean;
  };
  createdAt: string;
};

type Tab = 'providers' | 'services';

/* ─── Category icon map ─────────────────────────── */

const categoryIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  ELECTRICIDAD: { icon: Zap,         color: '#f59e0b' },
  PLOMERIA:     { icon: Droplets,    color: '#3b82f6' },
  LIMPIEZA:     { icon: Sparkles,    color: '#8b5cf6' },
  CARPINTERIA:  { icon: Hammer,      color: '#f97316' },
  PINTURA:      { icon: Paintbrush,  color: '#ec4899' },
  JARDINERIA:   { icon: Trees,       color: '#10b981' },
  CERRAJERIA:   { icon: KeyRound,    color: '#6366f1' },
  AIRE_ACONDICIONADO: { icon: Wind,  color: '#06b6d4' },
};

function getCategoryDisplay(category?: string | null) {
  if (!category) return { icon: Wrench, color: '#64748b' };
  return categoryIconMap[category] ?? { icon: Wrench, color: '#64748b' };
}

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ─── Component ─────────────────────────────────── */

export function FavoritesPanel() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser]                       = useState<CurrentUser | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [tab, setTab]                         = useState<Tab>('providers');

  const [providers, setProviders]             = useState<FavoriteProvider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [removingProvider, setRemovingProvider] = useState<string | null>(null);

  const [services, setServices]               = useState<FavoriteService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [removingService, setRemovingService] = useState<string | null>(null);

  /* ── Load user ──────────────────────────────── */
  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        setLoading(true);
        const data = await api.get<CurrentUser>('/api/auth/me');
        if (data.role !== 'CLIENT') { router.replace('/panel'); return; }
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

  /* ── Load providers ─────────────────────────── */
  const loadProviders = useCallback(async () => {
    setProvidersLoading(true);
    try {
      const data = await api.get<{ items: FavoriteProvider[]; total: number }>(
        '/api/favorites/providers'
      );
      setProviders(data.items ?? []);
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo cargar los proveedores favoritos.' });
    } finally {
      setProvidersLoading(false);
    }
  }, [toast]);

  /* ── Load services ──────────────────────────── */
  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const data = await api.get<{ items: FavoriteService[]; total: number }>(
        '/api/favorites/services'
      );
      setServices(data.items ?? []);
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo cargar los servicios favoritos.' });
    } finally {
      setServicesLoading(false);
    }
  }, [toast]);

  /* ── Load on tab change ─────────────────────── */
  useEffect(() => {
    if (!user) return;
    if (tab === 'providers') loadProviders();
    else loadServices();
  }, [user, tab, loadProviders, loadServices]);

  /* ── Remove provider ────────────────────────── */
  async function handleRemoveProvider(providerId: string) {
    setRemovingProvider(providerId);
    try {
      await api.post(`/api/favorites/providers/${providerId}`);
      setProviders((prev) => (prev || []).filter((p) => p.providerId !== providerId));
      toast({ type: 'success', title: 'Eliminado', message: 'Proveedor removido de tus favoritos.' });
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el favorito.' });
    } finally {
      setRemovingProvider(null);
    }
  }

  /* ── Remove service ─────────────────────────── */
  async function handleRemoveService(serviceId: string) {
    setRemovingService(serviceId);
    try {
      await api.post(`/api/favorites/services/${serviceId}`);
      setServices((prev) => (prev || []).filter((s) => s.service.id !== serviceId));
      toast({ type: 'success', title: 'Eliminado', message: 'Servicio removido de tus favoritos.' });
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo eliminar el favorito.' });
    } finally {
      setRemovingService(null);
    }
  }

  /* ── Skeleton / loading ─────────────────────── */
  if (loading || !user) {
    return (
      <DashboardShell role="CLIENT" userName="Cargando..." userEmail="">
        <SkeletonList count={4} />
      </DashboardShell>
    );
  }

  const totalFavs = (tab === 'providers' ? providers : services).length;

  /* ─── Render ────────────────────────────────── */
  return (
    <DashboardShell role="CLIENT" userName={user.fullName} userEmail={user.email}>
      <div className="space-y-6 sl-animate-fade-in max-w-5xl mx-auto">

        {/* Header */}
        <header>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-500">
              <Heart className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>
              Mis Favoritos
            </h1>
          </div>
          <p className="ml-[52px] text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
            Proveedores y servicios que guardaste para acceder rápidamente.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-2">
          {([
            { key: 'providers', label: 'Proveedores', icon: User,   count: providers.length },
            { key: 'services',  label: 'Servicios',   icon: Layers, count: services.length  },
          ] as const).map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                tab === key
                  ? 'bg-[var(--sl-primary)] text-white shadow-sm'
                  : 'border border-[var(--sl-border)] hover:bg-[var(--sl-primary-muted)]'
              }`}
              style={tab !== key ? { background: 'var(--sl-surface)', color: 'var(--sl-text-secondary)' } : {}}
            >
              <Icon className="h-4 w-4" />
              {label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  tab === key ? 'bg-white/20 text-white' : 'bg-[var(--sl-border)] text-[var(--sl-text-muted)]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── PROVIDERS TAB ─────────────────────── */}
        {tab === 'providers' && (
          <>
            {providersLoading ? (
              <SkeletonList count={3} />
            ) : providers.length === 0 ? (
              <EmptyState
                icon={<User />}
                title="Sin proveedores favoritos"
                description="Cuando encuentres un proveedor de confianza, guárdalo aquí para contactarlo fácilmente la próxima vez."
                action={
                  <Link href="/proveedores">
                    <Button variant="primary" icon={<Search className="h-4 w-4" />}>
                      Explorar proveedores
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 sl-stagger">
                {providers.map((prov) => {
                  const catDisplay = getCategoryDisplay(getProviderCategoryKey(prov));
                  const Icon = catDisplay.icon;
                  const isRemoving = removingProvider === prov.providerId;

                  return (
                    <article
                      key={prov.favoriteId}
                      className="sl-card-premium flex flex-col group"
                    >
                      {/* Card body */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Category badge + verified */}
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold"
                            style={{ backgroundColor: `${catDisplay.color}18`, color: catDisplay.color }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {prov.serviceName}
                          </div>
                          {prov.isVerified && <VerifiedBadge />}
                        </div>

                        {/* Avatar + name */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-primary)] text-white text-lg font-black shadow-sm group-hover:scale-105 transition-transform">
                            {prov.businessName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <h2
                              className="truncate text-base font-extrabold leading-tight"
                              style={{ color: 'var(--sl-text-primary)' }}
                            >
                              {prov.businessName}
                            </h2>
                            <p className="text-sm truncate" style={{ color: 'var(--sl-text-secondary)' }}>
                              {prov.responsibleName}
                            </p>
                          </div>
                        </div>

                        {/* Zone */}
                        <div className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--sl-text-secondary)' }}>
                          <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--sl-text-muted)' }} />
                          <span className="truncate">{prov.serviceZone}</span>
                        </div>

                        {/* Added date */}
                        <p className="mt-auto pt-3 text-xs" style={{ color: 'var(--sl-text-muted)' }}>
                          Guardado el {formatDate(prov.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 px-5 pb-5 pt-0">
                        <Link
                          href={`/proveedores/${prov.providerId}`}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--sl-primary)] py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--sl-primary-hover)] hover:shadow-md active:scale-[0.98]"
                        >
                          Ver perfil
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          loading={isRemoving}
                          onClick={() => handleRemoveProvider(prov.providerId)}
                          icon={<BookmarkX className="h-4 w-4 text-rose-500" />}
                          className="px-3"
                        >
                          {!isRemoving && ''}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── SERVICES TAB ──────────────────────── */}
        {tab === 'services' && (
          <>
            {servicesLoading ? (
              <SkeletonList count={3} />
            ) : services.length === 0 ? (
              <EmptyState
                icon={<Bookmark />}
                title="Sin servicios favoritos"
                description="Guarda servicios que te interesen para encontrarlos rápidamente cuando los necesites."
                action={
                  <Link href="/servicios">
                    <Button variant="primary" icon={<Search className="h-4 w-4" />}>
                      Explorar servicios
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 sl-stagger">
                {services.map((fav) => {
                  const { service } = fav;
                  const isRemoving = removingService === service.id;

                  return (
                    <article
                      key={fav.favoriteId}
                      className="sl-card-premium flex flex-col group"
                    >
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Category badge + verified */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 rounded-xl bg-[var(--sl-primary-muted)] px-3 py-1.5 text-xs font-bold text-[var(--sl-primary)]">
                            <Tag className="h-3.5 w-3.5" />
                            {service.categoryName}
                          </div>
                          {service.isVerified && <VerifiedBadge />}
                        </div>

                        {/* Service name */}
                        <h2
                          className="text-base font-extrabold leading-snug line-clamp-2 group-hover:text-[var(--sl-primary)] transition-colors"
                          style={{ color: 'var(--sl-text-primary)' }}
                        >
                          {service.name}
                        </h2>

                        {/* Description */}
                        <p
                          className="mt-2 text-sm leading-relaxed line-clamp-3 flex-1"
                          style={{ color: 'var(--sl-text-secondary)' }}
                        >
                          {service.description}
                        </p>

                        {/* Price */}
                        {service.referencePrice && (
                          <div className="mt-3 flex items-center gap-2 text-sm">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                              <DollarSign className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-bold" style={{ color: 'var(--sl-text-primary)' }}>
                              S/ {parseFloat(service.referencePrice).toFixed(2)}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--sl-text-muted)' }}>referencial</span>
                          </div>
                        )}

                        {/* Provider */}
                        <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
                          <Wrench className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--sl-text-muted)' }} />
                          <span className="truncate font-medium">{service.providerName}</span>
                        </div>

                        {/* Added date */}
                        <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs" style={{ color: 'var(--sl-text-muted)' }}>
                          <Clock className="h-3 w-3" />
                          Guardado el {formatDate(fav.createdAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 px-5 pb-5 pt-0">
                        <Link
                          href="/servicios"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--sl-primary)] py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--sl-primary-hover)] hover:shadow-md active:scale-[0.98]"
                        >
                          Ver en catálogo
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          loading={isRemoving}
                          onClick={() => handleRemoveService(service.id)}
                          icon={<BookmarkX className="h-4 w-4 text-rose-500" />}
                          className="px-3"
                        >
                          {!isRemoving && ''}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Bottom tip */}
        {totalFavs > 0 && (
          <p className="text-center text-xs pb-2" style={{ color: 'var(--sl-text-muted)' }}>
            Tienes {totalFavs} {tab === 'providers' ? 'proveedor' : 'servicio'}{totalFavs !== 1 ? 'es' : ''} guardado{totalFavs !== 1 ? 's' : ''}.
            Haz clic en{' '}
            <BookmarkX className="inline h-3 w-3 text-rose-400" />
            {' '}para eliminar cualquiera.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
