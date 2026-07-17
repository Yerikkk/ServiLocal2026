'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { RequestServiceForm } from '@/components/requests/request-service-form';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Flag,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react';
import { ReportModal } from '@/components/ui/report-modal';
import { DynamicMap } from '@/components/ui/dynamic-map';

import { apiUrl } from '@/lib/api-url';
import { getProviderCategoryLabel } from '@/lib/provider-display';

type TrustBreakdownItem = {
  key: string;
  label: string;
  points: number;
  maxPoints: number;
  completed: boolean;
  guidance: string;
};

type TrustSummary = {
  score: number;
  levelLabel: string;
  breakdown: TrustBreakdownItem[];
  nextSteps: string[];
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
  serviceName?: string;
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

function isCustomServiceCategory(provider: PublicProvider): boolean {
  const slug = provider.categorySlug?.toLowerCase();
  const legacy = provider.category?.toUpperCase();
  return slug === 'otro-servicio' || legacy === 'OTHER';
}

function getServiceName(provider: PublicProvider) {
  if (isCustomServiceCategory(provider)) {
    return provider.customServiceName?.trim() || provider.serviceName?.trim() || 'Servicio personalizado';
  }
  return getProviderCategoryLabel(provider);
}

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  clientName: string;
  serviceTitle: string;
};

type ReviewsResponse = {
  avgRating: number;
  total: number;
  distribution: Array<{ stars: number; count: number; percentage: number }>;
  items: ReviewItem[];
};

export function PublicProviderDetailsPage() {
  const params = useParams<{ providerId: string }>();
  const router = useRouter();
  const providerId = params?.providerId;

  const [provider, setProvider] = useState<PublicProvider | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const trustBarWidth = useMemo(
    () => `${Math.max(0, Math.min(100, provider?.trustSummary.score ?? 0))}%`,
    [provider],
  );

  const mapLocation = useMemo(() => {
    if (!provider) return [];
    
    // Use actual coordinates if available, otherwise default to Talara center
    let lat = provider.latitude ?? -4.5772;
    let lng = provider.longitude ?? -81.2719;
    
    return [
      {
        id: provider.providerId,
        lat,
        lng,
        title: provider.businessName,
        description: `${provider.serviceZone} - ${provider.trustSummary.levelLabel}`
      }
    ];
  }, [provider]);

  useEffect(() => {
    let ignore = false;

    async function loadProvider() {
      try {
        setLoading(true);
        setError('');

        if (!providerId) {
          throw new Error('Proveedor no encontrado');
        }

        const response = await fetch(apiUrl(`/api/providers/public/${providerId}`), {
          method: 'GET',
          cache: 'no-store',
        });

        if (response.status === 404) {
          router.replace('/proveedores');
          return;
        }

        if (!response.ok) {
          throw new Error('No se pudo cargar el perfil público del proveedor');
        }

        const data = (await response.json()) as PublicProvider;

        if (!ignore) {
          setProvider(data);
        }

        // Cargar reseñas
        loadReviews();
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el perfil público del proveedor',
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    async function loadReviews() {
      if (!providerId) return;
      try {
        setReviewsLoading(true);
        const res = await fetch(apiUrl(`/api/reviews/provider/${providerId}`), {
          method: 'GET',
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setReviews(data);
        }
      } catch { /* ignore */ }
      finally {
        if (!ignore) setReviewsLoading(false);
      }
    }

    loadProvider();

    return () => {
      ignore = true;
    };
  }, [providerId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-lg text-slate-600">Cargando perfil público...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[30px] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!provider) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--sl-bg)] pt-24 pb-12 px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[0.98rem] text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al directorio
          </button>
          
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-red-600"
            title="Reportar proveedor"
          >
            <Flag className="h-4 w-4" />
            Reportar
          </button>
        </div>

        {/* Header Section */}
        <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[var(--sl-primary)] via-blue-600 to-indigo-700 text-white shadow-xl sl-animate-slide-up">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative px-7 py-8 md:px-10 md:py-12 z-10">
            <div className="flex flex-wrap items-center gap-3">
              {provider.isVerified ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                  <BadgeCheck className="h-4 w-4" />
                  Proveedor verificado
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4" />
                  Verificación pendiente
                </span>
              )}

              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
                <Wrench className="h-4 w-4" />
                {getServiceName(provider)}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em] md:text-5xl">
              {provider.businessName}
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/90">
              {provider.description}
            </p>
          </div>
        </section>

        {/* Info Cards Grid */}
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              icon={<User className="h-6 w-6" />}
              label="Responsable"
              value={provider.responsibleName}
            />
            <InfoCard
              icon={<Phone className="h-6 w-6" />}
              label="Teléfono"
              value={provider.phone || 'No disponible'}
            />
            <InfoCard
              icon={<MapPin className="h-6 w-6" />}
              label="Zona"
              value={provider.serviceZone}
            />
            <InfoCard
              icon={<Briefcase className="h-6 w-6" />}
              label="Especialidad"
              value={provider.specialty?.trim() || 'Sin especialidad definida'}
            />
          </section>

          {/* Map Section */}
          <section className="sl-card p-6 rounded-3xl shadow-sm border border-[var(--sl-border)]">
            <h2 className="text-xl font-bold tracking-tight mb-4" style={{ color: 'var(--sl-text-primary)' }}>
              Ubicación
            </h2>
            <DynamicMap locations={mapLocation} height="400px" className="rounded-2xl" />
          </section>

        {/* Details and Sidebar Grid */}
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
              Información del proveedor
            </h2>

            <div className="mt-5 space-y-5 text-slate-600">
              <div className="rounded-[20px] bg-slate-50 px-5 py-4">
                <p className="text-sm font-medium text-slate-400">Categoría</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {getProviderCategoryLabel(provider)}
                </p>
              </div>

              {isCustomServiceCategory(provider) && provider.customServiceName ? (
                <div className="rounded-[20px] bg-slate-50 px-5 py-4">
                  <p className="text-sm font-medium text-slate-400">
                    Servicio personalizado
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {provider.customServiceName}
                  </p>
                </div>
              ) : null}

              <div className="rounded-[20px] bg-slate-50 px-5 py-4">
                <p className="text-sm font-medium text-slate-400">
                  Descripción profesional
                </p>
                <p className="mt-2 text-base leading-8 text-slate-700">
                  {provider.description}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
                  Confianza
                </h2>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-[#1EA8E7]">
                  {provider.trustSummary.levelLabel}
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-extrabold tracking-[-0.05em] text-slate-950">
                    {provider.trustSummary.score}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">de 100 puntos</p>
                </div>
              </div>

              <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#1EA8E7]"
                  style={{ width: trustBarWidth }}
                />
              </div>

              <div className="mt-5 space-y-3">
                {(provider.trustSummary?.breakdown || []).map((item) => (
                  <div
                    key={item.key}
                    className="rounded-[18px] bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-slate-800">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-500">
                        {item.points}/{item.maxPoints}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección de Reseñas */}
            <div className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
                Reseñas
              </h2>
              
              {reviewsLoading ? (
                <div className="mt-4 space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="rounded-[18px] bg-slate-50 px-4 py-3">
                      <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.total > 0 ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-extrabold text-slate-950">
                      {reviews.avgRating.toFixed(1)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1,2,3,4,5].map((star) => (
                          <span key={star}>
                            {star <= Math.round(reviews.avgRating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {reviews.total} {reviews.total === 1 ? 'reseña' : 'reseñas'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    {(reviews.items || []).slice(0, 3).map((review) => (
                      <div key={review.id} className="rounded-[18px] bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold text-slate-900">{review.clientName}</p>
                          <div className="flex items-center gap-1 text-amber-400 text-sm">
                            {[1,2,3,4,5].map((star) => (
                              <span key={star}>
                                {star <= review.rating ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString('es-PE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : ''} • {review.serviceTitle}
                        </p>
                        {review.comment && (
                          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-slate-500">Aún no hay reseñas.</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Sé el primero en contratar y calificar a este proveedor!
                  </p>
                </div>
              )}
            </div>
          </aside>
        </section>

        {/* B) Nueva Sección: Formulario de Solicitud de Servicio */}
        <section>
          <RequestServiceForm
            providerId={provider.providerId}
            providerName={provider.businessName}
            defaultServiceName={getServiceName(provider)}
            defaultZone={provider.serviceZone}
          />
        </section>

        <ReportModal
          open={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportedUserId={provider.providerId}
          reportedUserName={provider.businessName}
        />
      </div>
    </main>
    <Footer />
    </>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="sl-card-premium sl-glass-premium group relative overflow-hidden p-6 hover:shadow-lg transition-all duration-300">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--sl-primary)]/5 blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
      <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sl-primary-muted)] text-[var(--sl-primary)] shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3 group-hover:shadow-md">
        {icon}
      </div>
      <p className="relative z-10 text-sm font-medium" style={{ color: 'var(--sl-text-secondary)' }}>{label}</p>
      <p className="relative z-10 mt-2 text-xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-[var(--sl-primary)]" style={{ color: 'var(--sl-text-primary)' }}>
        {value}
      </p>
    </article>
  );
}