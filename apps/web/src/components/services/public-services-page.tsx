'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Hammer,
  KeyRound,
  Layers,
  Paintbrush,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trees,
  Wrench,
  Wind,
  X,
  Zap,
  Droplets,
  ArrowRight,
  Tag,
  Package,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/ui/kpi-card';
import { SkeletonList } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { VerifiedBadge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/* ─── Types ──────────────────────────────────────────── */

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  serviceCount?: number;
};

type PublicService = {
  id: string;
  name: string;
  description: string;
  referencePrice: string | null;
  estimatedTime: string | null;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  // Backend returns a flat 'provider' object in the public listing
  provider: {
    id: string;
    name: string;
    isVerified: boolean;
    serviceZone: string;
  };
};

type PublicServicesResponse = {
  total: number;
  items: PublicService[];
  page: number;
  totalPages: number;
};

type CategoryApiItem = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  serviceCount?: number;
};

/* ─── Category icon map ──────────────────────────────── */

const categoryIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  electricidad: { icon: Zap, color: '#f59e0b' },
  plomeria: { icon: Droplets, color: '#3b82f6' },
  limpieza: { icon: Sparkles, color: '#8b5cf6' },
  carpinteria: { icon: Hammer, color: '#f97316' },
  pintura: { icon: Paintbrush, color: '#ec4899' },
  jardineria: { icon: Trees, color: '#10b981' },
  cerrajeria: { icon: KeyRound, color: '#6366f1' },
  aire_acondicionado: { icon: Wind, color: '#06b6d4' },
};

function getCategoryDisplay(slug: string) {
  const key = slug.toLowerCase().replace(/-/g, '_');
  return categoryIconMap[key] ?? { icon: Wrench, color: '#64748b' };
}

function getTrustLevel(score: number) {
  if (score >= 90) return { label: 'Destacado', color: '#3b82f6' };
  if (score >= 70) return { label: 'Confianza alta', color: '#10b981' };
  if (score >= 50) return { label: 'Confianza media', color: '#f59e0b' };
  if (score >= 30) return { label: 'Confianza baja', color: '#ef4444' };
  return { label: 'Sin reputación', color: '#94a3b8' };
}

const PAGE_SIZE = 12;

/* ─── Component ──────────────────────────────────────── */

export function PublicServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Filters from URL
  const initialSearch = searchParams.get('search') ?? '';
  const initialCategoryId = searchParams.get('categoryId') ?? '';
  const initialPage = Number(searchParams.get('page') ?? '1');

  // State
  const [services, setServices] = useState<PublicService[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [page, setPage] = useState(initialPage);

  // Debounce search
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (categoryId) params.set('categoryId', categoryId);
    if (page > 1) params.set('page', String(page));
    const nextUrl = params.toString() ? `${pathname}?${params}` : pathname;
    const currentPath = window.location.pathname + window.location.search;
    if (nextUrl !== currentPath) router.replace(nextUrl, { scroll: false });
  }, [debouncedSearch, categoryId, page, pathname, router]);

  // Load categories once
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch(`${API_URL}/api/services/categories`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const rawItems: CategoryApiItem[] = data.items ?? data ?? [];
          setCategories(rawItems);
        }
      } finally {
        setCatLoading(false);
      }
    }
    loadCats();
  }, []);

  // Load services on filter change
  const loadServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (categoryId) params.set('categoryId', categoryId);
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));

      const res = await fetch(
        `${API_URL}/api/services/public?${params}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('Error al cargar el catálogo de servicios');
      const data: PublicServicesResponse = await res.json();
      setServices(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / PAGE_SIZE));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de carga');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryId, page]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId]);

  function clearFilters() {
    setSearchInput('');
    setDebouncedSearch('');
    setCategoryId('');
    setPage(1);
  }

  const hasFilters = !!debouncedSearch || !!categoryId;

  const avgPrice = useMemo(() => {
    const priced = services.filter((s) => s.referencePrice);
    if (!priced.length) return null;
    const avg = priced.reduce((acc, s) => acc + parseFloat(s.referencePrice!), 0) / priced.length;
    return avg.toFixed(0);
  }, [services]);

  const verifiedCount = useMemo(
    () => services.filter((s) => s.provider?.isVerified).length,
    [services]
  );

  /* ─── Render ─────────────────────────────────────── */

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-[var(--sl-bg)] pb-20">

        {/* ── Hero ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--sl-primary)] via-[#1598d0] to-[#0d7fb3] pt-20 pb-28 text-white">
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-white/[0.03]" />

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
              <Package className="h-3.5 w-3.5" />
              Catálogo de servicios
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              Encuentra el servicio
              <br />
              <span className="text-white/85">que necesitas hoy</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80 leading-relaxed">
              Explora el catálogo completo de servicios ofrecidos por proveedores verificados.
              Compara precios, tiempos estimados y niveles de confianza antes de solicitar.
            </p>

            {/* Hero search bar */}
            <div className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-2xl bg-white/10 p-2 backdrop-blur-md border border-white/20 shadow-xl">
              <Search className="ml-3 h-5 w-5 shrink-0 text-white/60" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar servicio, proveedor o categoría..."
                className="flex-1 bg-transparent py-2 text-sm text-white placeholder-white/50 outline-none"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setDebouncedSearch(''); }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 lg:px-8 -mt-10 relative z-10 space-y-8">

          {/* ── KPI Strip ────────────────────────────── */}
          <section className="grid gap-4 sm:grid-cols-3">
            <KPICard
              title="Servicios disponibles"
              value={total}
              icon={<Layers className="h-5 w-5" />}
              iconBg="bg-blue-100 text-blue-600"
            />
            <KPICard
              title="Proveedores verificados"
              value={verifiedCount}
              icon={<BadgeCheck className="h-5 w-5" />}
              iconBg="bg-emerald-100 text-emerald-600"
            />
            <KPICard
              title="Precio referencial promedio"
              value={avgPrice ? `S/ ${avgPrice}` : '—'}
              icon={<DollarSign className="h-5 w-5" />}
              iconBg="bg-violet-100 text-violet-600"
            />
          </section>

          {/* ── Category chips ───────────────────────── */}
          {!catLoading && categories.length > 0 && (
            <section className="sl-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--sl-primary)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--sl-text-primary)' }}>
                  Filtrar por categoría
                </span>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition hover:bg-[var(--sl-primary-muted)]"
                    style={{ color: 'var(--sl-text-secondary)' }}
                  >
                    <X className="h-3.5 w-3.5" /> Limpiar
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {/* All */}
                <button
                  onClick={() => setCategoryId('')}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    !categoryId
                      ? 'bg-[var(--sl-primary)] text-white shadow-sm'
                      : 'border border-[var(--sl-border)] text-[var(--sl-text-secondary)] hover:border-[var(--sl-primary)] hover:text-[var(--sl-primary)]'
                  }`}
                  style={!categoryId ? {} : { background: 'var(--sl-surface)' }}
                >
                  <Wrench className="h-3.5 w-3.5" />
                  Todas
                </button>

                {categories.map((cat) => {
                  const catDisplay = getCategoryDisplay(cat.slug);
                  const Icon = catDisplay.icon;
                  const active = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryId(active ? '' : cat.id)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        active
                          ? 'text-white shadow-sm'
                          : 'border border-[var(--sl-border)] hover:border-opacity-100'
                      }`}
                      style={
                        active
                          ? { backgroundColor: catDisplay.color }
                          : {
                              background: 'var(--sl-surface)',
                              color: 'var(--sl-text-secondary)',
                              borderColor: 'var(--sl-border)',
                            }
                      }
                    >
                      <Icon className="h-3.5 w-3.5" style={active ? {} : { color: catDisplay.color }} />
                      {cat.name}
                      {cat.serviceCount !== undefined && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                            active ? 'bg-white/20 text-white' : 'bg-[var(--sl-border)] text-[var(--sl-text-muted)]'
                          }`}
                        >
                          {cat.serviceCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── Active filter tags ───────────────────── */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2 sl-animate-fade-in">
              <span className="text-xs font-semibold" style={{ color: 'var(--sl-text-muted)' }}>
                Filtros activos:
              </span>
              {debouncedSearch && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sl-primary)]/30 bg-[var(--sl-primary-muted)] px-3 py-1 text-xs font-semibold text-[var(--sl-primary)]">
                  <Search className="h-3 w-3" />
                  "{debouncedSearch}"
                  <button onClick={() => { setSearchInput(''); setDebouncedSearch(''); }} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {categoryId && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sl-primary)]/30 bg-[var(--sl-primary-muted)] px-3 py-1 text-xs font-semibold text-[var(--sl-primary)]">
                  <Tag className="h-3 w-3" />
                  {categories.find(c => c.id === categoryId)?.name ?? 'Categoría'}
                  <button onClick={() => setCategoryId('')} className="ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* ── Results header ───────────────────────── */}
          {!loading && !error && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: 'var(--sl-text-secondary)' }}>
                {total > 0
                  ? `${total} servicio${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`
                  : 'Sin resultados'}
                {totalPages > 1 && ` · Página ${page} de ${totalPages}`}
              </p>
            </div>
          )}

          {/* ── Service cards ────────────────────────── */}
          {loading ? (
            <SkeletonList count={6} />
          ) : error ? (
            <EmptyState
              icon={<ShieldCheck />}
              title="No se pudo cargar el catálogo"
              description={error}
              action={<Button onClick={loadServices} variant="primary">Reintentar</Button>}
            />
          ) : services.length === 0 ? (
            <EmptyState
              icon={<Search />}
              title="No se encontraron servicios"
              description={
                hasFilters
                  ? 'Ajusta los filtros o limpia la búsqueda para ver más servicios disponibles.'
                  : 'Aún no hay servicios publicados en la plataforma.'
              }
              action={
                hasFilters ? (
                  <Button onClick={clearFilters} variant="primary">Limpiar filtros</Button>
                ) : undefined
              }
            />
          ) : (
            <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 sl-stagger">
              {services.map((service) => {
                const catDisplay = getCategoryDisplay(service.category.slug);
                const CatIcon = catDisplay.icon;
                // Backend public listing doesn't expose trustScore; use a placeholder
                const trust = { label: service.provider.isVerified ? 'Verificado' : 'Activo', color: service.provider.isVerified ? '#10b981' : '#64748b' };
                const provider = service.provider;

                return (
                  <article
                    key={service.id}
                    className="sl-card-premium flex flex-col group cursor-pointer"
                  >
                    {/* Card header */}
                    <div className="p-6 pb-4 flex-1 flex flex-col">
                      {/* Category badge + verified */}
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold"
                          style={{
                            backgroundColor: `${catDisplay.color}18`,
                            color: catDisplay.color,
                          }}
                        >
                          <CatIcon className="h-3.5 w-3.5" />
                          {service.category.name}
                        </div>
                        {provider.isVerified && <VerifiedBadge />}
                      </div>

                      {/* Service name */}
                      <h2
                        className="text-xl font-extrabold tracking-tight leading-snug group-hover:text-[var(--sl-primary)] transition-colors line-clamp-2"
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

                      {/* Meta info */}
                      <div className="mt-4 space-y-2">
                        {service.referencePrice && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                              <DollarSign className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-bold" style={{ color: 'var(--sl-text-primary)' }}>
                              S/ {parseFloat(service.referencePrice).toFixed(2)}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--sl-text-muted)' }}>
                              referencial
                            </span>
                          </div>
                        )}
                        {service.estimatedTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <Clock className="h-3.5 w-3.5" />
                            </div>
                            <span style={{ color: 'var(--sl-text-secondary)' }}>
                              {service.estimatedTime}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mx-6 border-t border-[var(--sl-border-light)]" />

                    {/* Provider info */}
                    <div className="p-5 space-y-3">
                      <Link
                        href={`/proveedores/${provider.id}`}
                        className="flex items-center gap-3 group/prov"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-primary)] text-white text-sm font-bold shadow-sm group-hover/prov:scale-105 transition-transform">
                          {provider.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold group-hover/prov:text-[var(--sl-primary)] transition-colors" style={{ color: 'var(--sl-text-primary)' }}>
                            {provider.name}
                          </p>
                          {provider.serviceZone && (
                            <p className="text-xs truncate" style={{ color: 'var(--sl-text-muted)' }}>
                              {provider.serviceZone}
                            </p>
                          )}
                        </div>
                        {provider.isVerified && (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                            ✓ Verificado
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* CTA */}
                    <div className="px-5 pb-5">
                      <Link
                        href={`/proveedores/${provider.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--sl-primary)] py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--sl-primary-hover)] hover:shadow-md active:scale-[0.98] group-hover:gap-3"
                      >
                        Ver proveedor y solicitar
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {/* ── Pagination ───────────────────────────── */}
          {!loading && !error && totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 pt-4 sl-animate-fade-in" aria-label="Paginación">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                icon={<ChevronLeft className="h-4 w-4" />}
              >
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-9 min-w-9 rounded-xl text-sm font-semibold transition-all px-2 ${
                        pageNum === page
                          ? 'bg-[var(--sl-primary)] text-white shadow-sm'
                          : 'hover:bg-[var(--sl-primary-muted)]'
                      }`}
                      style={pageNum !== page ? { color: 'var(--sl-text-secondary)' } : {}}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                icon={<ChevronRight className="h-4 w-4" />}
              >
                Siguiente
              </Button>
            </nav>
          )}

          {/* ── Bottom CTA ───────────────────────────── */}
          <section className="rounded-3xl overflow-hidden relative bg-gradient-to-br from-[var(--sl-primary)] via-[#1598d0] to-[#0d7fb3] p-8 md:p-12 text-center text-white mt-8">
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white" />
              <div className="absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-white" />
            </div>
            <div className="relative">
              <h2 className="text-2xl font-extrabold md:text-3xl">
                ¿Eres proveedor de servicios?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/80">
                Únete a ServiLocal, publica tus servicios y conecta con clientes de tu zona. Construye tu reputación con nuestra barra de confianza.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/registrarse"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[var(--sl-primary)] shadow-md transition hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Registrarme como proveedor
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sobre-nosotros"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Saber más
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
