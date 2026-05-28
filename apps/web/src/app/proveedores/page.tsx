import { Suspense } from 'react';
import { PublicProvidersPage } from '@/components/providers/public-providers-page';

export default function ProveedoresPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-lg text-slate-600">Cargando proveedores...</p>
          </div>
        </div>
      </main>
    }>
      <PublicProvidersPage />
    </Suspense>
  );
}