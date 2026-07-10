'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAuthMe, getRolePath } from '@/lib/auth-session';

export function PanelRedirect() {
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function resolvePanel() {
      const user = await fetchAuthMe({ force: true });

      if (ignore) return;

      if (user?.role) {
        window.location.replace(getRolePath(user.role));
        return;
      }

      setError('No hay sesión activa.');
      window.location.replace('/iniciar-sesion');
    }

    const timeout = window.setTimeout(() => {
      if (!ignore) {
        setError('La conexión tardó demasiado.');
      }
    }, 12_000);

    resolvePanel().finally(() => {
      window.clearTimeout(timeout);
    });

    return () => {
      ignore = true;
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--sl-bg)] p-8">
      <p className="text-sm font-semibold text-slate-500 animate-pulse">
        {error || 'Redirigiendo a tu panel...'}
      </p>
      {error ? (
        <Link
          href="/iniciar-sesion"
          className="text-sm font-semibold text-[var(--sl-primary)] hover:underline"
        >
          Ir a iniciar sesión
        </Link>
      ) : null}
    </div>
  );
}
