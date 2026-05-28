'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  ChevronDown,
  FolderOpen,
  LogOut,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
  Activity,
  Plus,
  FileText,
  Flag,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { KPICard } from '@/components/ui/kpi-card';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Badge, RoleBadge, UserStatusBadge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
  status: string;
};

type DashboardStats = {
  totalUsers: number;
  totalProviders: number;
  totalClients: number;
  activeUsers: number;
  suspendedUsers: number;
  verifiedProviders: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalCategories: number;
  totalServices: number;
};

type UserItem = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: string;
  trustScore: number;
  slPoints: number;
  lastLoginAt: string | null;
  createdAt: string;
  providerProfile: {
    businessName: string;
    category: string;
    isVerified: boolean;
    serviceZone: string;
  } | null;
};

type AuditItem = {
  id: string;
  actorUserId: string | null;
  action: string;
  ipAddress: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actorUser: { id: string; email: string; fullName: string; role: string } | null;
};

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { services: number };
};

type RequestItem = {
  id: string;
  status: string;
  serviceTitle: string;
  createdAt: string;
  client: { id: string; fullName: string; email: string };
  providerProfile: { businessName: string; user: { fullName: string } };
};

type ReportItem = {
  id: string;
  reason: string;
  description: string | null;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  createdAt: string;
  reporterUser: { id: string; fullName: string; email: string };
  reportedUser: { id: string; fullName: string; email: string; role: string; trustScore: number };
  request: { id: string; serviceTitle: string } | null;
  reviewedByUser: { id: string; fullName: string } | null;
};

type Tab = 'dashboard' | 'users' | 'requests' | 'categories' | 'audit' | 'reports';

function getRolePath(role: CurrentUser['role']) {
  if (role === 'ADMIN') return '/panel/admin';
  if (role === 'PROVIDER') return '/panel/proveedor';
  return '/panel/cliente';
}

export function AdminDashboardPanel() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');

  // Dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Users
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('');
  const [usersPage, setUsersPage] = useState(1);

  // Requests
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [requestsPage, setRequestsPage] = useState(1);

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  // Audit
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);

  // Reports
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportsPending, setReportsPending] = useState(0);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsFilter, setReportsFilter] = useState('PENDING');

  const apiFetch = async (path: string, opts: RequestInit = {}) => {
    const method = opts.method?.toUpperCase() ?? 'GET';
    const body = opts.body ? JSON.parse(opts.body as string) : undefined;
    if (method === 'GET') return api.get(`/api${path}`);
    if (method === 'POST') return api.post(`/api${path}`, body);
    if (method === 'PATCH') return api.patch(`/api${path}`, body);
    return api.get(`/api${path}`);
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        setLoading(true);
        const data = await api.get<CurrentUser>('/api/auth/me');
        if (data.role !== 'ADMIN') { router.replace('/panel'); return; }
        if (!ignore) setUser(data);
      } catch {
        if (!ignore) setError('No se pudo cargar la sesión');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => { ignore = true; };
  }, [router]);

  useEffect(() => {
    if (!user) return;
    if (tab === 'dashboard') loadDashboard();
    if (tab === 'users') loadUsers();
    if (tab === 'requests') loadRequests();
    if (tab === 'categories') loadCategories();
    if (tab === 'audit') loadAudit();
    if (tab === 'reports') loadReports();
  }, [tab, user, usersPage, usersSearch, usersRoleFilter, requestsPage, auditPage, reportsPage, reportsFilter]);

  async function loadDashboard() {
    try {
      const data = await api.get<DashboardStats>('/api/admin/dashboard');
      setStats(data);
    } catch { /* ignore */ }
  }

  async function loadUsers() {
    try {
      const params = new URLSearchParams({ page: String(usersPage), limit: '15' });
      if (usersSearch) params.set('search', usersSearch);
      if (usersRoleFilter) params.set('role', usersRoleFilter);
      const data = await api.get<{ items: UserItem[]; total: number }>(`/api/admin/users?${params}`);
      setUsers(data.items);
      setUsersTotal(data.total);
    } catch { /* ignore */ }
  }

  async function loadRequests() {
    try {
      const params = new URLSearchParams({ page: String(requestsPage), limit: '15' });
      const data = await api.get<{ items: RequestItem[]; total: number }>(`/api/admin/requests?${params}`);
      setRequests(data.items);
      setRequestsTotal(data.total);
    } catch { /* ignore */ }
  }

  async function loadCategories() {
    try {
      const data = await api.get<{ items: CategoryItem[] }>('/api/admin/categories');
      setCategories(data.items);
    } catch { /* ignore */ }
  }

  async function loadAudit() {
    try {
      const params = new URLSearchParams({ page: String(auditPage), limit: '20' });
      const data = await api.get<{ items: AuditItem[]; total: number }>(`/api/admin/audit-logs?${params}`);
      setAuditLogs(data.items);
      setAuditTotal(data.total);
    } catch { /* ignore */ }
  }

  async function loadReports() {
    try {
      const params = new URLSearchParams({ page: String(reportsPage), limit: '20', status: reportsFilter });
      const data = await api.get<{ items: ReportItem[]; total: number; pendingCount: number }>(`/api/reports?${params}`);
      setReports(data.items);
      setReportsTotal(data.total);
      setReportsPending(data.pendingCount);
    } catch { /* ignore */ }
  }

  async function handleReviewReport(reportId: string, action: 'REVIEWED' | 'DISMISSED') {
    try {
      await api.patch(`/api/reports/${reportId}/review`, { action });
      toast({
        type: action === 'REVIEWED' ? 'error' : 'success',
        title: action === 'REVIEWED' ? 'Sanción aplicada' : 'Reporte desestimado',
        message: action === 'REVIEWED'
          ? 'Se redujo el Trust Score del usuario reportado.'
          : 'El reporte fue desestimado correctamente.',
      });
      loadReports();
    } catch { /* ignore */ }
  }

  async function handleToggleUserStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/api/admin/users/${userId}/status`, { status: newStatus });
      toast({ type: 'success', title: 'Estado actualizado', message: `Usuario ${newStatus === 'ACTIVE' ? 'activado' : 'suspendido'} correctamente.` });
      loadUsers();
    } catch { /* ignore */ }
  }

  async function handleToggleVerify(userId: string, currentlyVerified: boolean) {
    try {
      await api.patch(`/api/admin/users/${userId}/verify`, { verified: !currentlyVerified });
      toast({ type: 'success', title: 'Verificación actualizada', message: `Proveedor ${!currentlyVerified ? 'verificado' : 'desverificado'} correctamente.` });
      loadUsers();
    } catch { /* ignore */ }
  }

  async function handleCreateCategory() {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    try {
      await api.post('/api/admin/categories', { name: newCatName.trim() });
      setNewCatName('');
      toast({ type: 'success', title: 'Categoría creada', message: 'La categoría se ha creado exitosamente.' });
      loadCategories();
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo crear la categoría.' });
    }
    setCatLoading(false);
  }

  async function handleToggleCategoryActive(catId: string, active: boolean) {
    try {
      await api.patch(`/api/admin/categories/${catId}`, { isActive: !active });
      toast({ type: 'success', title: 'Categoría actualizada', message: `Categoría ${!active ? 'activada' : 'desactivada'}.` });
      loadCategories();
    } catch { /* ignore */ }
  }

  if (loading || !user) {
    return (
      <DashboardShell role="ADMIN" userName="Cargando..." userEmail="">
        <SkeletonDashboard />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell role="ADMIN" userName={user.fullName} userEmail={user.email}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
      </DashboardShell>
    );
  }

  const tabsItems: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'dashboard', label: 'Resumen', icon: <BarChart3 className="h-4 w-4" /> },
    { key: 'users', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
    { key: 'requests', label: 'Solicitudes', icon: <FileText className="h-4 w-4" /> },
    { key: 'categories', label: 'Categorías', icon: <FolderOpen className="h-4 w-4" /> },
    { key: 'audit', label: 'Auditoría', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'reports', label: 'Reportes', icon: <Flag className="h-4 w-4" />, badge: reportsPending },
  ];

  return (
    <DashboardShell role="ADMIN" userName={user.fullName} userEmail={user.email}>
      <div className="space-y-6 sl-animate-fade-in">
        
        {/* Sub-nav tabs */}
        <nav className="flex flex-wrap gap-2 mb-8">
          {tabsItems.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                tab === t.key
                  ? 'bg-violet-600 text-white shadow-sm ring-2 ring-violet-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        {tab === 'dashboard' && stats && (
          <div className="space-y-6 sl-stagger">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Métricas Generales</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard title="Usuarios totales" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} iconBg="bg-blue-100 text-blue-600" />
              <KPICard title="Proveedores" value={stats.totalProviders} icon={<Wrench className="h-5 w-5" />} iconBg="bg-indigo-100 text-indigo-600" />
              <KPICard title="Clientes" value={stats.totalClients} icon={<UserCheck className="h-5 w-5" />} iconBg="bg-violet-100 text-violet-600" />
              <KPICard title="Activos vs Suspendidos" value={`${stats.activeUsers} / ${stats.suspendedUsers}`} icon={<Activity className="h-5 w-5" />} iconBg="bg-emerald-100 text-emerald-600" />
            </div>

            <h2 className="text-xl font-bold tracking-tight text-slate-900 pt-4">Actividad del Sistema</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard title="Solicitudes totales" value={stats.totalRequests} icon={<BookOpen className="h-5 w-5" />} iconBg="bg-slate-100 text-slate-600" />
              <KPICard title="Solicitudes pendientes" value={stats.pendingRequests} icon={<Activity className="h-5 w-5" />} iconBg="bg-amber-100 text-amber-600" trend="neutral" />
              <KPICard title="Completadas" value={stats.completedRequests} icon={<BadgeCheck className="h-5 w-5" />} iconBg="bg-teal-100 text-teal-600" trend="up" />
              <KPICard title="Categorías" value={stats.totalCategories} icon={<FolderOpen className="h-5 w-5" />} iconBg="bg-rose-100 text-rose-600" />
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-5 sl-animate-fade-in">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={usersSearch}
                  onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
                  placeholder="Buscar por nombre o correo..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
              <select
                value={usersRoleFilter}
                onChange={(e) => { setUsersRoleFilter(e.target.value); setUsersPage(1); }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
              >
                <option value="">Todos los roles</option>
                <option value="CLIENT">Cliente</option>
                <option value="PROVIDER">Proveedor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="sl-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Usuario</th>
                      <th className="px-6 py-4">Rol</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4">Verificado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{u.fullName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <RoleBadge role={u.role as 'ADMIN' | 'CLIENT' | 'PROVIDER' | 'SUPPORT'} />
                        </td>
                        <td className="px-6 py-4">
                          <UserStatusBadge status={u.status} />
                        </td>
                        <td className="px-6 py-4">
                          {u.providerProfile ? (
                            u.providerProfile.isVerified
                              ? <BadgeCheck className="h-5 w-5 text-emerald-500" />
                              : <ShieldAlert className="h-5 w-5 text-amber-500" />
                          ) : <span className="text-xs text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleUserStatus(u.id, u.status)}
                            >
                              {u.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                            </Button>
                            {u.role === 'PROVIDER' && u.providerProfile && (
                              <Button
                                variant={u.providerProfile.isVerified ? "outline" : "primary"}
                                size="sm"
                                onClick={() => handleToggleVerify(u.id, u.providerProfile!.isVerified)}
                              >
                                {u.providerProfile.isVerified ? 'Quitar verif.' : 'Verificar'}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No se encontraron usuarios.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {usersTotal > 15 && (
              <div className="flex items-center justify-center gap-3">
                <Button disabled={usersPage <= 1} onClick={() => setUsersPage((p) => p - 1)} variant="outline">
                  Anterior
                </Button>
                <span className="text-sm font-semibold text-slate-500">Página {usersPage}</span>
                <Button disabled={usersPage * 15 >= usersTotal} onClick={() => setUsersPage((p) => p + 1)} variant="outline">
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === 'requests' && (
          <div className="space-y-5 sl-animate-fade-in">
            <div className="sl-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Servicio</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Proveedor</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requests.map((r) => (
                      <tr key={r.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-semibold text-slate-900">{r.serviceTitle}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{r.client.fullName}</p>
                          <p className="text-xs text-slate-500">{r.client.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{r.providerProfile.businessName}</p>
                          <p className="text-xs text-slate-500">{r.providerProfile.user.fullName}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Badge className="border-slate-200 bg-slate-100 text-slate-700">{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No hay solicitudes registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {requestsTotal > 15 && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button disabled={requestsPage <= 1} onClick={() => setRequestsPage((p) => p - 1)} variant="outline">Anterior</Button>
                <span className="text-sm font-semibold text-slate-500">Página {requestsPage}</span>
                <Button disabled={requestsPage * 15 >= requestsTotal} onClick={() => setRequestsPage((p) => p + 1)} variant="outline">Siguiente</Button>
              </div>
            )}
          </div>
        )}

        {tab === 'categories' && (
          <div className="space-y-6 sl-animate-fade-in">
            <div className="sl-card p-6">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-4">Nueva categoría</h2>
              <div className="flex gap-3 max-w-md">
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nombre de la categoría..."
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
                <Button loading={catLoading} disabled={!newCatName.trim()} onClick={handleCreateCategory} icon={<Plus className="h-4 w-4" />}>
                  Añadir
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 sl-stagger">
              {categories.map((cat) => (
                <div key={cat.id} className="sl-card flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-start justify-between">
                      <p className="font-bold text-slate-900">{cat.name}</p>
                      <Badge className={cat.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}>
                        {cat.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{cat._count.services} servicios vinculados</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      variant={cat.isActive ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleCategoryActive(cat.id, cat.isActive)}
                    >
                      {cat.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'audit' && (
          <div className="space-y-5 sl-animate-fade-in">
            <div className="sl-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Fecha / Hora</th>
                      <th className="px-6 py-4">Acción</th>
                      <th className="px-6 py-4">Actor</th>
                      <th className="px-6 py-4">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="whitespace-nowrap px-6 py-3 text-xs text-slate-500 font-medium">
                          {new Date(log.createdAt).toLocaleString('es-PE')}
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-xs font-semibold text-slate-600">
                          {log.actorUser ? `${log.actorUser.fullName}` : 'Sistema'}
                        </td>
                        <td className="px-6 py-3 text-xs font-mono text-slate-400">
                          {log.ipAddress ?? '—'}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          No hay registros de auditoría.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {auditTotal > 20 && (
              <div className="flex items-center justify-center gap-3">
                <Button disabled={auditPage <= 1} onClick={() => setAuditPage((p) => p - 1)} variant="outline">
                  Anterior
                </Button>
                <span className="text-sm font-semibold text-slate-500">Página {auditPage}</span>
                <Button disabled={auditPage * 20 >= auditTotal} onClick={() => setAuditPage((p) => p + 1)} variant="outline">
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === 'reports' && (
          <div className="space-y-5 sl-animate-fade-in">
            {/* Filter tabs */}
            <div className="flex gap-2">
              {(['PENDING', 'REVIEWED', 'DISMISSED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setReportsFilter(s); setReportsPage(1); }}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    reportsFilter === s
                      ? 'bg-violet-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s === 'PENDING' ? 'Pendientes' : s === 'REVIEWED' ? 'Sancionados' : 'Desestimados'}
                  {s === 'PENDING' && reportsPending > 0 && (
                    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">
                      {reportsPending}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="sl-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Reportado por</th>
                      <th className="px-6 py-4">Usuario Reportado</th>
                      <th className="px-6 py-4">Motivo</th>
                      <th className="px-6 py-4">Fecha</th>
                      {reportsFilter === 'PENDING' && <th className="px-6 py-4 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reports.map((r) => (
                      <tr key={r.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800">{r.reporterUser.fullName}</p>
                          <p className="text-xs text-slate-500">{r.reporterUser.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{r.reportedUser.fullName}</p>
                          <p className="text-xs text-slate-500">{r.reportedUser.email}</p>
                          <p className="text-xs text-slate-400">Trust: {r.reportedUser.trustScore}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-100">
                            {r.reason.replace(/_/g, ' ')}
                          </span>
                          {r.description && (
                            <p className="text-xs text-slate-500 mt-1 max-w-xs truncate">{r.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString('es-PE')}
                        </td>
                        {reportsFilter === 'PENDING' && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleReviewReport(r.id, 'REVIEWED')}
                              >
                                Sancionar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReviewReport(r.id, 'DISMISSED')}
                              >
                                Desestimar
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={reportsFilter === 'PENDING' ? 5 : 4} className="py-10 text-center text-slate-500">
                          No hay reportes {reportsFilter === 'PENDING' ? 'pendientes' : reportsFilter === 'REVIEWED' ? 'sancionados' : 'desestimados'}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {reportsTotal > 20 && (
              <div className="flex items-center justify-center gap-3">
                <Button disabled={reportsPage <= 1} onClick={() => setReportsPage((p) => p - 1)} variant="outline">Anterior</Button>
                <span className="text-sm font-semibold text-slate-500">Página {reportsPage}</span>
                <Button disabled={reportsPage * 20 >= reportsTotal} onClick={() => setReportsPage((p) => p + 1)} variant="outline">Siguiente</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
