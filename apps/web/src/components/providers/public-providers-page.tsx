'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BadgeCheck,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Wrench,
  X,
  Zap,
  Droplets,
  Sparkles,
  Hammer,
  Paintbrush,
  Trees,
  KeyRound,
  Wind,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TrustBar } from '@/components/ui/trust-bar';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/ui/badge';
import { KPICard } from '@/components/ui/kpi-card';
import { SkeletonList } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DynamicMap } from '@/components/ui/dynamic-map';
import { Map as MapIcon, Grid } from 'lucide-react';

import { apiUrl } from '@/lib/api-url';
import { getProviderCategoryKey } from '@/lib/provider-display';

type TrustSummary = {
  score: number;
  levelLabel: string;
};

type PublicProvider = {
  providerId: string;
  responsibleName: string;
  phone?: string | null;
  businessName: string;
  categoryId?: string;
  categorySlug?: string | null;
  categoryName?: string | null;
  category?: string | null;
  serviceName: string;
  customServiceName?: string | null;
  specialty?: string | null;
  serviceZone: string;
  description: string;
  isVerified: boolean;
  updatedAt: string;
  trustSummary: TrustSummary;
  latitude?: number | null;
  longitude?: number | null;
};

type PublicProvidersResponse = {
  total: number;
  items: PublicProvider[];
};

const categoryOptions = [
  { value: '', label: 'Todas las categorías', icon: Wrench, color: '#64748b' },
  { value: 'ELECTRICIDAD', label: 'Electricidad', icon: Zap, color: '#f59e0b' },
  { value: 'PLOMERIA', label: 'Plomería', icon: Droplets, color: '#3b82f6' },
  { value: 'LIMPIEZA', label: 'Limpieza', icon: Sparkles, color: '#8b5cf6' },
  { value: 'CARPINTERIA', label: 'Carpintería', icon: Hammer, color: '#f97316' },
  { value: 'PINTURA', label: 'Pintura', icon: Paintbrush, color: '#ec4899' },
  { value: 'JARDINERIA', label: 'Jardinería', icon: Trees, color: '#10b981' },
  { value: 'CERRAJERIA', label: 'Cerrajería', icon: KeyRound, color: '#6366f1' },
  { value: 'AIRE_ACONDICIONADO', label: 'Aire acondicionado', icon: Wind, color: '#06b6d4' },
  { value: 'OTHER', label: 'Otro servicio', icon: Wrench, color: '#64748b' },
] as const;

const zoneOptions = [
  '',
  'Talara Alta',
  'Talara Centro',
  'Punta Arenas',
  'Los Órganos',
  'Máncora',
  'Negritos',
  'Lobitos',
  'El Alto',
] as const;

const sortOptions = [
  { value: 'trust_desc', label: 'Mayor confianza' },
  { value: 'trust_asc', label: 'Menor confianza' },
  { value: 'updated_desc', label: 'Actualizados recientemente' },
  { value: 'name_asc', label: 'Nombre A-Z' },
] as const;

function getCategoryIcon(categoryValue: string) {
  const cat = categoryOptions.find(c => c.value === categoryValue);
  return cat ? cat : categoryOptions[0];
}

export function PublicProvidersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialSearch = searchParams.get('search') ?? '';
  const initialCategory = searchParams.get('category') ?? '';
  const initialZone = searchParams.get('zone') ?? '';
  const initialVerifiedOnly = searchParams.get('verifiedOnly') === 'true';
  const initialSort = searchParams.get('sort') ?? 'trust_desc';

  const [providers, setProviders] = useState<PublicProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [zoneFilter, setZoneFilter] = useState(initialZone);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);
  const [sort, setSort] = useState(initialSort);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const paramsKey = searchParams.toString();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (categoryFilter) params.set('category', categoryFilter);
    if (zoneFilter) params.set('zone', zoneFilter);
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    if (sort && sort !== 'trust_desc') params.set('sort', sort);

    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
    
    // Only update the URL if the state actually differs from current URL
    // We check window.location to avoid React state staleness
    const currentPath = window.location.pathname + window.location.search;
    if (nextUrl !== currentPath) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [debouncedSearch, categoryFilter, zoneFilter, verifiedOnly, sort, pathname, router]);

  // Sync state from URL when navigating back/forward
  useEffect(() => {
    const urlSearch = searchParams.get('search') ?? '';
    if (urlSearch !== debouncedSearch) {
      setSearchInput(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    const urlCategory = searchParams.get('category') ?? '';
    if (urlCategory !== categoryFilter) setCategoryFilter(urlCategory);
    
    const urlZone = searchParams.get('zone') ?? '';
    if (urlZone !== zoneFilter) setZoneFilter(urlZone);
    
    const urlVerified = searchParams.get('verifiedOnly') === 'true';
    if (urlVerified !== verifiedOnly) setVerifiedOnly(urlVerified);
    
    const urlSort = searchParams.get('sort') ?? 'trust_desc';
    if (urlSort !== sort) setSort(urlSort);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;
    async function loadProviders() {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (categoryFilter) params.set('category', categoryFilter);
        if (zoneFilter) params.set('zone', zoneFilter);
        if (verifiedOnly) params.set('verifiedOnly', 'true');
        if (sort) params.set('sort', sort);

        const query = params.toString();
        const response = await fetch(apiUrl(`/api/providers/public${query ? `?${query}` : ''}`), {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) throw new Error('No se pudo cargar el directorio de proveedores');
        const data = (await response.json()) as PublicProvidersResponse;
        if (!ignore) setProviders(data.items);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'Error de carga');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadProviders();
    return () => { ignore = true; };
  }, [debouncedSearch, categoryFilter, zoneFilter, verifiedOnly, sort]);

  const totalProviders = useMemo(() => (providers || []).length, [providers]);
  const averageTrust = useMemo(() => {
    if (!(providers || []).length) return 0;
    const total = (providers || []).reduce((acc, item) => acc + item.trustSummary.score, 0);
    return Math.round(total / (providers || []).length);
  }, [providers]);

  const mapLocations = useMemo(() => {
    return (providers || []).map((p, i) => {
      // Use actual coordinates if available, otherwise use mock data near Talara
      let lat = p.latitude ?? null;
      let lng = p.longitude ?? null;

      if (lat === null || lng === null) {
        const latOffset = (Math.sin(i * 10) * 0.02);
        const lngOffset = (Math.cos(i * 10) * 0.02);
        lat = -4.5772 + latOffset;
        lng = -81.2719 + lngOffset;
      }

      return {
        id: p.providerId,
        lat: lat,
        lng: lng,
        title: p.businessName,
        description: `${p.serviceName} - ${p.serviceZone} (Confianza: ${p.trustSummary.score})`
      };
    });
  }, [providers]);

  function clearFilters() {
    setSearchInput('');
    setDebouncedSearch('');
    setCategoryFilter('');
    setZoneFilter('');
    setVerifiedOnly(false);
    setSort('trust_desc');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-[var(--sl-bg)] pb-20">
        {/* Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--sl-primary)] via-[#1598d0] to-[#0d7fb3] pt-20 pb-24 text-center text-white">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-white/5" />
          <div className="relative mx-auto max-w-4xl px-6">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Directorio público</p>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Encuentra proveedores de confianza
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
              Busca por servicio, categoría o zona. Revisa la confianza del perfil y contacta al profesional adecuado.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 space-y-8 -mt-12 relative z-10">
          {/* Stats */}
          <section className="grid gap-5 sm:grid-cols-3">
            <KPICard title="Resultados" value={totalProviders} icon={<Search className="h-5 w-5" />} iconBg="bg-blue-100 text-blue-600" />
            <KPICard title="Verificados" value={providers.filter((item) => item.isVerified).length} icon={<BadgeCheck className="h-5 w-5" />} iconBg="bg-emerald-100 text-emerald-600" />
            <KPICard title="Confianza promedio" value={`${averageTrust}/100`} icon={<ShieldCheck className="h-5 w-5" />} iconBg="bg-violet-100 text-violet-600" />
          </section>

          {/* Filters */}
          <section className="sl-card p-6 md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sl-primary-light)] text-[var(--sl-primary)]">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>Búsqueda y filtros</h2>
                <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>Ajusta los parámetros para encontrar lo que necesitas.</p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--sl-text-muted)' }} />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Busca por negocio, responsable o servicio..."
                  className="h-12 w-full rounded-xl border border-[var(--sl-border)] pl-12 pr-4 text-sm outline-none transition-all focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary)]/10"
                  style={{ background: 'var(--sl-bg)', color: 'var(--sl-text-primary)' }}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-12 w-full rounded-xl border border-[var(--sl-border)] px-4 text-sm outline-none transition-all focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary)]/10"
                style={{ background: 'var(--sl-bg)', color: 'var(--sl-text-primary)' }}
              >
                {categoryOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="h-12 w-full rounded-xl border border-[var(--sl-border)] px-4 text-sm outline-none transition-all focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary)]/10"
                style={{ background: 'var(--sl-bg)', color: 'var(--sl-text-primary)' }}
              >
                {zoneOptions.map((item) => <option key={item} value={item}>{item || 'Todas las zonas'}</option>)}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[var(--sl-border-light)] pt-5">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 rounded-lg border border-[var(--sl-border)] px-3 text-sm outline-none w-full sm:w-auto"
                style={{ background: 'var(--sl-surface)', color: 'var(--sl-text-primary)' }}
              >
                {sortOptions.map((item) => <option key={item.value} value={item.value}>Ordenar: {item.label}</option>)}
              </select>

              <div className="flex bg-[var(--sl-surface)] rounded-lg border border-[var(--sl-border)] p-1 h-10 w-full sm:w-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 sm:px-4 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-[var(--sl-primary)] text-white shadow-sm' : 'text-[var(--sl-text-secondary)] hover:text-[var(--sl-text-primary)]'}`}
                >
                  <Grid className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cuadrícula</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex-1 sm:px-4 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-[var(--sl-primary)] text-white shadow-sm' : 'text-[var(--sl-text-secondary)] hover:text-[var(--sl-text-primary)]'}`}
                >
                  <MapIcon className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Mapa</span>
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold select-none" style={{ color: 'var(--sl-text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--sl-border)] text-[var(--sl-primary)] focus:ring-[var(--sl-primary)]"
                />
                Solo verificados
              </label>

              <div className="flex-1" />

              <Button variant="outline" size="sm" onClick={clearFilters} icon={<X className="h-4 w-4" />} className="w-full sm:w-auto">
                Limpiar
              </Button>
            </div>
          </section>

          {/* Results */}
          {loading ? (
            <SkeletonList count={3} />
          ) : error ? (
            <EmptyState icon={<ShieldCheck />} title="Ocurrió un error" description={error} />
          ) : providers.length === 0 ? (
            <EmptyState 
              icon={<Search />} 
              title="No se encontraron resultados" 
              description="Ajusta la búsqueda, cambia la zona o limpia los filtros para ver más proveedores disponibles en ServiLocal."
              action={
                <Button onClick={clearFilters} variant="primary">Restablecer filtros</Button>
              }
            />
          ) : viewMode === 'map' ? (
            <section className="sl-animate-fade-in bg-[var(--sl-surface)] p-2 rounded-3xl shadow-sm border border-[var(--sl-border)]">
               <DynamicMap locations={mapLocations} height="600px" className="rounded-[20px]" />
            </section>
          ) : (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 sl-stagger">
              {(providers || []).map((provider) => {
                const catData = getCategoryIcon(getProviderCategoryKey(provider));
                const Icon = catData.icon;

                return (
                  <Link
                    key={provider.providerId}
                    href={`/proveedores/${provider.providerId}`}
                    className="sl-card sl-card-interactive flex flex-col p-6 group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div 
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${catData.color}15`, color: catData.color }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      {provider.isVerified && <VerifiedBadge />}
                    </div>

                    <h2 className="text-xl font-bold tracking-tight line-clamp-1 group-hover:text-[var(--sl-primary)] transition-colors" style={{ color: 'var(--sl-text-primary)' }}>
                      {provider.businessName}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-[var(--sl-primary)] line-clamp-1">
                      {provider.serviceName}
                    </p>

                    <div className="mt-4 space-y-2 text-sm flex-1" style={{ color: 'var(--sl-text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" style={{ color: 'var(--sl-text-muted)' }} />
                        <span className="truncate">{provider.responsibleName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" style={{ color: 'var(--sl-text-muted)' }} />
                        <span className="truncate">{provider.serviceZone}</span>
                      </div>
                      {provider.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" style={{ color: 'var(--sl-text-muted)' }} />
                          <span>{provider.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--sl-border-light)]">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold" style={{ color: 'var(--sl-text-secondary)' }}>Confianza</span>
                        <span className="font-bold" style={{ color: 'var(--sl-text-primary)' }}>{provider.trustSummary.score}/100</span>
                      </div>
                      <TrustBar score={provider.trustSummary.score} size="sm" />
                      <p className="mt-2 text-xs font-medium" style={{ color: 'var(--sl-text-secondary)' }}>
                        {provider.trustSummary.levelLabel}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}