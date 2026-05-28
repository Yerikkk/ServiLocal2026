import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicServicesPage } from '@/components/services/public-services-page';

export const metadata: Metadata = {
  title: 'Catálogo de Servicios | ServiLocal',
  description:
    'Explora el catálogo completo de servicios locales. Filtra por categoría, compara precios referenciales y conoce el nivel de confianza de cada proveedor.',
  keywords: ['servicios locales', 'catálogo', 'proveedor', 'confianza', 'ServiLocal'],
  openGraph: {
    title: 'Catálogo de Servicios — ServiLocal',
    description: 'Encuentra el servicio que necesitas con proveedores verificados de tu zona.',
    type: 'website',
  },
};

export default function ServiciosPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[var(--sl-bg)] px-6 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[30px] border border-[var(--sl-border)] bg-[var(--sl-surface)] p-8 shadow-sm">
              <p className="text-lg" style={{ color: 'var(--sl-text-secondary)' }}>
                Cargando catálogo de servicios...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <PublicServicesPage />
    </Suspense>
  );
}
