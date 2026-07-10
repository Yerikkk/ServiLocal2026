'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MessageSquare, Star, ThumbsUp, Award, Quote, RefreshCw
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { KPICard } from '@/components/ui/kpi-card';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';

type CurrentUser = {
  id: string; email: string; fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER'; status: string;
};

type TrustSummary = { score: number; slPoints: number; levelLabel: string; levelColor: string; recentEvents: unknown[] };

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  service: string;
  client: { id: string; fullName: string };
};

type ReviewsResponse = {
  avgRating: number;
  total: number;
  distribution: { stars: number; count: number; percentage: number }[];
  items: ReviewItem[];
};

export default function ResenasProveedorPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [trustScore, setTrustScore] = useState<number>(50);
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
    Promise.all([
      api.get<ReviewsResponse>('/api/reviews/me/received'),
      api.get<TrustSummary>('/api/trust/me'),
    ])
      .then(([rev, trust]) => {
        setReviews(rev);
        setTrustScore(trust.score);
      })
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

  const avgRating = reviews?.avgRating ?? 0;
  const totalReviews = reviews?.total ?? 0;
  const distribution = reviews?.distribution ?? [5,4,3,2,1].map((s) => ({ stars: s, count: 0, percentage: 0 }));
  const recommendPct = totalReviews > 0
    ? Math.round((distribution.filter((d) => d.stars >= 4).reduce((s, d) => s + d.count, 0) / totalReviews) * 100)
    : 0;

  return (
    <DashboardShell role="PROVIDER" userName={user.fullName} userEmail={user.email}>
      <div className="space-y-8 max-w-6xl mx-auto sl-animate-fade-in">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-[var(--sl-radius-2xl)] bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-8 md:p-10 sl-animate-gradient">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5 sl-animate-float" />
          <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60 mb-3">Reputación</p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Mis Reseñas</h1>
            <p className="mt-3 text-white/80 text-sm max-w-xl leading-relaxed">
              Tu reputación es tu mejor herramienta. Cada reseña positiva aumenta tu confianza y atrae más clientes.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 sl-stagger">
          <KPICard title="Calificación" value={totalReviews > 0 ? avgRating.toFixed(1) : '—'} icon={<Star className="h-5 w-5" />} iconBg="bg-amber-100 text-amber-600" />
          <KPICard title="Total reseñas" value={totalReviews} icon={<MessageSquare className="h-5 w-5" />} iconBg="bg-violet-100 text-violet-600" />
          <KPICard title="Recomendaciones" value={totalReviews > 0 ? `${recommendPct}%` : '—'} icon={<ThumbsUp className="h-5 w-5" />} iconBg="bg-emerald-100 text-emerald-600" trend={totalReviews > 0 ? 'up' : undefined} />
          <KPICard title="Trust Score" value={`${trustScore}/100`} icon={<Award className="h-5 w-5" />} iconBg="bg-sky-100 text-sky-600" />
        </div>

        {/* Empty state */}
        {!dataLoading && totalReviews === 0 && (
          <div className="sl-card-premium p-12 flex flex-col items-center justify-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50">
              <Star className="h-8 w-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--sl-text-primary)' }}>Aún no tienes reseñas</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--sl-text-secondary)' }}>
                Cuando completes solicitudes, tus clientes podrán dejarte una reseña desde su historial.
              </p>
            </div>
          </div>
        )}

        {/* Rating Distribution + Avg Card */}
        {totalReviews > 0 && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Average */}
            <div className="sl-card-premium p-8 flex flex-col items-center justify-center text-center">
              <div className="relative">
                <svg viewBox="0 0 120 120" className="w-32 h-32">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="var(--sl-border)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke="url(#ratingGradient)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(avgRating / 5) * 326.73} 326.73`}
                    transform="rotate(-90 60 60)"
                    className="sl-animate-progress"
                  />
                  <defs>
                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold" style={{ color: 'var(--sl-text-primary)' }}>{avgRating.toFixed(1)}</span>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm font-bold" style={{ color: 'var(--sl-text-primary)' }}>Calificación promedio</p>
              <p className="text-xs mt-1" style={{ color: 'var(--sl-text-secondary)' }}>Basada en {totalReviews} reseña{totalReviews !== 1 ? 's' : ''}</p>
            </div>

            {/* Distribution */}
            <div className="lg:col-span-2 sl-card-premium p-6 md:p-8">
              <h3 className="text-lg font-bold mb-6" style={{ color: 'var(--sl-text-primary)' }}>Distribución de estrellas</h3>
              <div className="space-y-3">
                {distribution.map((r) => (
                  <div key={r.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16 shrink-0">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold" style={{ color: 'var(--sl-text-primary)' }}>{r.stars}</span>
                    </div>
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--sl-border-light)' }}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 sl-animate-progress"
                        style={{ width: `${r.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold w-10 text-right" style={{ color: 'var(--sl-text-secondary)' }}>
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Review Cards */}
        {reviews && reviews.items.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--sl-text-primary)' }}>Reseñas recientes</h2>
            <div className="space-y-4 sl-stagger">
              {(reviews.items || []).map((review) => (
                <div key={review.id} className="sl-card-premium p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 font-bold text-lg">
                        {review.client?.fullName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--sl-text-primary)' }}>{review.client?.fullName || 'Cliente'}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--sl-text-muted)' }}>{review.service}</p>
                        <div className="flex gap-0.5 mt-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: 'var(--sl-text-muted)' }}>
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                  {review.comment && (
                    <div className="mt-4 p-4 rounded-2xl border border-[var(--sl-border-light)] relative" style={{ background: 'var(--sl-bg)' }}>
                      <Quote className="absolute top-3 right-3 h-5 w-5 opacity-10" style={{ color: 'var(--sl-text-muted)' }} />
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--sl-text-secondary)' }}>
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
