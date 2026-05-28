'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER' | 'SUPPORT';
  status: string;
};

function getRolePath(role: CurrentUser['role']) {
  if (role === 'ADMIN') return '/panel/admin';
  if (role === 'SUPPORT') return '/panel/soporte';
  if (role === 'PROVIDER') return '/panel/proveedor';
  return '/panel/cliente';
}

export function PanelRedirect() {
  const router = useRouter();

  useEffect(() => {
    let ignore = false;

    async function resolvePanel() {
      try {
        const user = await api.get<CurrentUser>('/api/auth/me');
        if (!ignore) {
          router.replace(getRolePath(user.role));
        }
      } catch {
        // En caso de error de red, nos quedamos en la pantalla de carga en lugar de cerrar sesión
      }
    }

    resolvePanel();

    return () => {
      ignore = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[var(--sl-bg)] p-4 md:p-8 justify-center items-center">
      <p className="text-sm font-semibold text-slate-500 animate-pulse">Redirigiendo a tu panel...</p>
    </div>
  );
}