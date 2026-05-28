'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
// A) Importación agregada
import { RequestServiceForm } from '@/components/requests/request-service-form';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Wrench,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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
  category:
    | 'ELECTRICIDAD'
    | 'PLOMERIA'
    | 'LIMPIEZA'
    | 'CARPINTERIA'
    | 'PINTURA'
    | 'JARDINERIA'
    | 'CERRAJERIA'
    | 'AIRE_ACONDICIONADO'
    | 'OTHER';
  customServiceName?: string | null;
  specialty?: string | null;
  serviceZone: string;
  description: string;
  isVerified: boolean;
  updatedAt: string;
  trustSummary: TrustSummary;
};

const categoryLabels: Record<PublicProvider['category'], string> = {
  ELECTRICIDAD: 'Electricidad',
  PLOMERIA: 'Plomería',
  LIMPIEZA: 'Limpieza',
  CARPINTERIA: 'Carpintería',
  PINTURA: 'Pintura',
  JARDINERIA: 'Jardinería',
  CERRAJERIA: 'Cerrajería',
  AIRE_ACONDICIONADO: 'Aire acondicionado',
  OTHER: 'Otro servicio',
};

function getServiceName(provider: PublicProvider) {
  if (provider.category === 'OTHER') {
    return provider.customServiceName?.trim() || 'Servicio personalizado';
  }
  return categoryLabels[provider.category];
}

export function PublicProviderDetailsPage() {
  const params = useParams<{ providerId: string }>();
  const router = useRouter();
  const providerId = params?.providerId;

  const [provider, setProvider] = useState<PublicProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const trustBarWidth = useMemo(
    () => `${Math.max(0, Math.min(100, provider?.trustSummary.score ?? 0))}%`,
    [provider],
  );

  useEffect(() => {
    let ignore = false;

    async function loadProvider() {
      try {
        setLoading(true);
        setError('');

        if (!providerId) {
          throw new Error('Proveedor no encontrado');
        }

        const response = await fetch(
          `${API_URL}/api/providers/public/${providerId}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

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
    <main className="min-h-screen bg-slate-50 px-6 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-[0.98rem] text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al directorio
        </button>

        {/* Header Section */}
        <section className="overflow-hidden rounded-[34px] bg-[#1EA8E7] text-white shadow-[0_20px_60px_rgba(30,168,231,0.18)]">
          <div className="px-7 py-8 md:px-10 md:py-10">
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
                  {categoryLabels[provider.category]}
                </p>
              </div>

              {provider.category === 'OTHER' && provider.customServiceName ? (
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
                {provider.trustSummary.breakdown.map((item) => (
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

            <div className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
                Próximamente
              </h2>
              <p className="mt-4 leading-8 text-slate-600">
                Aquí conectaremos reseñas, historial de trabajos y más señales
                reales para fortalecer la confianza del proveedor.
              </p>
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
      </div>
    </main>
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
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#1EA8E7]">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">
        {value}
      </p>
    </article>
  );
}