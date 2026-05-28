'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  LogOut,
  Mail,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type UserRole = 'ADMIN' | 'CLIENT' | 'PROVIDER';

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: string;
};

type RoleDashboardProps = {
  allowedRole: UserRole;
  eyebrow: string;
  title: string;
  subtitle: string;
  checks: string[];
  nextTitle: string;
  nextText: string;
};

function getRolePath(role: UserRole) {
  if (role === 'ADMIN') return '/panel/admin';
  if (role === 'PROVIDER') return '/panel/proveedor';
  return '/panel/cliente';
}

function getRoleLabel(role: UserRole) {
  if (role === 'ADMIN') return 'Administrador';
  if (role === 'PROVIDER') return 'Proveedor';
  return 'Cliente';
}

export function RoleDashboard({
  allowedRole,
  eyebrow,
  title,
  subtitle,
  checks,
  nextTitle,
  nextText,
}: RoleDashboardProps) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');

  const roleLabel = useMemo(() => {
    if (!user) return '';
    return getRoleLabel(user.role);
  }, [user]);

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 401) {
          router.replace('/iniciar-sesion');
          return;
        }

        if (!response.ok) {
          throw new Error('No se pudo obtener la sesión actual');
        }

        const data = (await response.json()) as CurrentUser;

        if (data.role !== allowedRole) {
          router.replace(getRolePath(data.role));
          return;
        }

        if (!ignore) {
          setUser(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : 'No se pudo cargar el panel',
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [allowedRole, router]);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      router.replace('/iniciar-sesion');
    } catch {
      router.replace('/iniciar-sesion');
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-lg text-slate-600">Verificando sesión...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[32px] border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
            {error}
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[34px] bg-[#1EA8E7] text-white shadow-[0_20px_60px_rgba(30,168,231,0.18)]">
          <div className="flex flex-col gap-8 px-7 py-8 md:px-10 md:py-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80">
                {eyebrow}
              </p>
              <h1 className="text-4xl font-extrabold tracking-[-0.05em] md:text-5xl">
                {title}, {user.fullName}
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-8 text-white/90">
                {subtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex h-[56px] items-center justify-center gap-3 rounded-[18px] bg-white px-6 text-base font-semibold text-[#1598d0] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogOut className="h-5 w-5" />
              {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            icon={<User className="h-6 w-6" />}
            label="Nombre"
            value={user.fullName}
          />
          <InfoCard
            icon={<Mail className="h-6 w-6" />}
            label="Correo"
            value={user.email}
          />
          <InfoCard
            icon={
              user.role === 'PROVIDER' ? (
                <Briefcase className="h-6 w-6" />
              ) : (
                <Users className="h-6 w-6" />
              )
            }
            label="Rol"
            value={roleLabel}
          />
          <InfoCard
            icon={<ShieldCheck className="h-6 w-6" />}
            label="Estado"
            value={user.status}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
              Validación del flujo
            </h2>
            <div className="mt-5 space-y-4 text-slate-600">
              {checks.map((item) => (
                <p key={item}>✅ {item}</p>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
              {nextTitle}
            </h2>
            <p className="mt-4 leading-8 text-slate-600">{nextText}</p>
          </div>
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