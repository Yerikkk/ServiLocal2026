'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Search, ArrowRight, User, ArrowLeft } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { translateStatus } from '@/lib/translations';
import { api } from '@/lib/api-client';

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
};

type ChatListItem = {
  id: string;
  serviceTitle: string;
  status: string;
  updatedAt: string;
  otherParty: {
    id: string;
    name: string;
    isVerified?: boolean;
  };
};

type Props = {
  role: 'CLIENT' | 'PROVIDER';
};

export function ChatListPanel({ role }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [items, setItems] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setLoading(true);
        const authUser = await api.get<CurrentUser>('/api/auth/me');
        
        if (authUser.role !== role) {
          router.replace('/iniciar-sesion');
          return;
        }
        
        if (!ignore) setUser(authUser);

        const endpoint = role === 'CLIENT' ? '/api/service-requests/client/me' : '/api/service-requests/provider/me';
        const data = await api.get<{ items: any[] }>(endpoint);

        if (!ignore) {
          const mapped = data.items.map((req: any) => ({
            id: req.id,
            serviceTitle: req.serviceTitle,
            status: req.status,
            updatedAt: req.updatedAt,
            otherParty: {
              id: role === 'CLIENT' ? req.provider?.providerId || '' : req.client?.id || '',
              name: role === 'CLIENT' ? req.provider?.businessName || 'Proveedor' : req.client?.fullName || 'Cliente',
            }
          }));
          setItems(mapped);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Error al cargar');
          // If error occurs before user is set, create a fallback so it doesn't crash
          if (!user) {
            setUser({ id: '', email: '', fullName: 'Usuario', role });
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => { ignore = true; };
  }, [role, router]);

  if (loading || !user) {
    return (
      <DashboardShell role={role} userName="Cargando..." userEmail="">
        <SkeletonDashboard />
      </DashboardShell>
    );
  }

  const filtered = (items || []).filter(item =>
    (item.serviceTitle?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.otherParty.name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <DashboardShell role={role} userName={user.fullName} userEmail={user.email}>
      <div className="space-y-6 sl-animate-fade-in max-w-4xl mx-auto">
        <Link
          href={`/panel/${role === 'CLIENT' ? 'cliente' : 'proveedor'}`}
          className="inline-flex items-center gap-2 text-[0.98rem] transition hover:text-[var(--sl-primary)]"
          style={{ color: 'var(--sl-text-secondary)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel principal
        </Link>
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>Mis Mensajes</h1>
            <p className="mt-2" style={{ color: 'var(--sl-text-secondary)' }}>Comunícate con tus {role === 'CLIENT' ? 'proveedores' : 'clientes'} sobre tus solicitudes.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'var(--sl-text-muted)' }} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[var(--sl-border)] outline-none focus:border-[var(--sl-primary)] focus:ring-2 focus:ring-[var(--sl-primary)]/20 transition-all"
              style={{ background: 'var(--sl-surface)', color: 'var(--sl-text-primary)' }}
            />
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState 
            icon={<MessageSquare />} 
            title={search ? "No se encontraron chats" : "Aún no tienes mensajes"} 
            description={search ? "Intenta con otra búsqueda" : `Cuando inicies una solicitud, podrás comunicarte con los ${role === 'CLIENT' ? 'proveedores' : 'clientes'} aquí.`}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              const dateStr = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : '';
              const rolePath = role === 'CLIENT' ? 'cliente' : 'proveedor';
              
              return (
                <Link 
                  key={item.id} 
                  href={`/panel/${rolePath}/mensajes/${item.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--sl-border)] hover:border-[var(--sl-primary)] transition-all bg-[var(--sl-surface)] group shadow-sm hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--sl-primary-muted)] text-[var(--sl-primary)] font-bold text-lg">
                    {item.otherParty.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold truncate text-[1.05rem]" style={{ color: 'var(--sl-text-primary)' }}>
                        {item.otherParty.name}
                      </h3>
                      <span className="text-xs shrink-0 ml-2 font-medium" style={{ color: 'var(--sl-text-muted)' }}>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm truncate font-medium" style={{ color: 'var(--sl-text-secondary)' }}>
                        {item.serviceTitle}
                      </p>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {translateStatus(item.status)}
                      </span>
                    </div>
                  </div>
                  
                  <ArrowRight className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" style={{ color: 'var(--sl-primary)' }} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
