'use client';

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BadgeCheck,
  Briefcase,
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
  Wrench,
  Clock,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { KPICard } from '@/components/ui/kpi-card';
import { TrustBar } from '@/components/ui/trust-bar';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { VerifiedBadge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';
import { api } from '@/lib/api-client';

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
  status: string;
  phone?: string | null;
};

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
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  levelLabel: string;
  completedChecks: number;
  totalChecks: number;
  breakdown: TrustBreakdownItem[];
  nextSteps: string[];
};

type ProviderProfile = {
  id: string;
  ruc: string;
  businessName: string;
  category: string;
  customServiceName?: string | null;
  specialty?: string | null;
  serviceZone: string;
  description: string;
  isVerified: boolean;
  latitude?: number | null;
  longitude?: number | null;
};

type ProviderResponse = {
  user: CurrentUser;
  providerProfile: ProviderProfile;
  trustSummary: TrustSummary;
};

type UpdateProviderResponse = {
  message: string;
  providerProfile: ProviderProfile;
  trustSummary: TrustSummary;
};

type ProviderServiceRequestsResponse = {
  total: number;
  items: Array<{ id: string; status: string }>;
};

const serviceCategories = [
  { value: 'ELECTRICIDAD', label: 'Electricidad' },
  { value: 'PLOMERIA', label: 'Plomería' },
  { value: 'LIMPIEZA', label: 'Limpieza' },
  { value: 'CARPINTERIA', label: 'Carpintería' },
  { value: 'PINTURA', label: 'Pintura' },
  { value: 'JARDINERIA', label: 'Jardinería' },
  { value: 'CERRAJERIA', label: 'Cerrajería' },
  { value: 'AIRE_ACONDICIONADO', label: 'Aire acondicionado' },
  { value: 'OTHER', label: 'Otro servicio' },
] as const;

const serviceZones = [
  'Talara Alta',
  'Talara Centro',
  'Punta Arenas',
  'Los Órganos',
  'Máncora',
  'Negritos',
  'Lobitos',
  'El Alto',
];

function getRolePath(role: CurrentUser['role']) {
  if (role === 'ADMIN') return '/panel/admin';
  if (role === 'CLIENT') return '/panel/cliente';
  return '/panel/proveedor';
}

export function ProviderProfilePanel() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [ruc, setRuc] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [serviceZone, setServiceZone] = useState('');
  const [latitude, setLatitude] = useState<string | number | undefined>('');
  const [longitude, setLongitude] = useState<string | number | undefined>('');
  const [description, setDescription] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [trustSummary, setTrustSummary] = useState<TrustSummary | null>(null);
  const [requestsSummary, setRequestsSummary] = useState({
    total: 0,
    pending: 0,
    negotiation: 0,
    accepted: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    expired: 0,
  });

  const isOtherService = category === 'OTHER';

  const selectClassName =
    'h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-[var(--sl-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--sl-primary)]/10';
  
  const textareaClassName =
    'min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none transition-all focus:border-[var(--sl-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--sl-primary)]/10';

  function applyProfileData(data: ProviderResponse) {
    setUser(data.user);
    setRuc(data.providerProfile.ruc);
    setBusinessName(data.providerProfile.businessName);
    setCategory(data.providerProfile.category);
    setCustomServiceName(data.providerProfile.customServiceName ?? '');
    setSpecialty(data.providerProfile.specialty ?? '');
    setServiceZone(data.providerProfile.serviceZone);
    setLatitude(data.providerProfile.latitude ?? '');
    setLongitude(data.providerProfile.longitude ?? '');
    setDescription(data.providerProfile.description);
    setIsVerified(data.providerProfile.isVerified);
    setTrustSummary(data.trustSummary);
  }

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        setLoading(true);

        const authUser = await api.get<CurrentUser>('/api/auth/me');

        if (authUser.role !== 'PROVIDER') {
          router.replace(getRolePath(authUser.role));
          return;
        }

        const [data, requestsData] = await Promise.all([
          api.get<ProviderResponse>('/api/providers/me'),
          api.get<ProviderServiceRequestsResponse>('/api/service-requests/provider/me'),
        ]);
        
        if (!ignore) {
          applyProfileData(data);
          setRequestsSummary({
            total: requestsData.total,
            pending: (requestsData.items || []).filter((i) => i.status === 'PENDING').length,
            negotiation: (requestsData.items || []).filter((i) => i.status === 'NEGOTIATION').length,
            accepted: (requestsData.items || []).filter((i) => i.status === 'ACCEPTED').length,
            inProgress: (requestsData.items || []).filter((i) => i.status === 'IN_PROGRESS').length,
            completed: (requestsData.items || []).filter((i) => i.status === 'COMPLETED').length,
            cancelled: (requestsData.items || []).filter((i) => i.status === 'CANCELLED').length,
            expired: (requestsData.items || []).filter((i) => i.status === 'EXPIRED').length,
          });
        }
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfile();
    return () => { ignore = true; };
  }, [router]);

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextValue = event.target.value;
    setCategory(nextValue);
    if (nextValue !== 'OTHER') setCustomServiceName('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ruc.trim() || !businessName.trim() || !category || !serviceZone) {
      toast({ type: 'warning', title: 'Campos incompletos', message: 'Completa los campos principales del perfil.' });
      return;
    }
    if (isOtherService && !customServiceName.trim()) {
      toast({ type: 'warning', title: 'Servicio no especificado', message: 'Debes indicar el nombre del servicio personalizado.' });
      return;
    }
    if (description.trim().length < 10) {
      toast({ type: 'warning', title: 'Descripción muy corta', message: 'La descripción debe tener al menos 10 caracteres.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ruc: ruc.trim(),
        businessName: businessName.trim(),
        category,
        customServiceName: isOtherService ? customServiceName.trim() : undefined,
        specialty: specialty.trim() || undefined,
        serviceZone,
        latitude: latitude !== '' ? Number(latitude) : undefined,
        longitude: longitude !== '' ? Number(longitude) : undefined,
        description: description.trim(),
      };

      const updateData = await api.patch<UpdateProviderResponse>('/api/providers/me', payload);
      setRuc(updateData.providerProfile.ruc);
      setBusinessName(updateData.providerProfile.businessName);
      setCategory(updateData.providerProfile.category);
      setCustomServiceName(updateData.providerProfile.customServiceName ?? '');
      setSpecialty(updateData.providerProfile.specialty ?? '');
      setServiceZone(updateData.providerProfile.serviceZone);
      setLatitude(updateData.providerProfile.latitude ?? '');
      setLongitude(updateData.providerProfile.longitude ?? '');
      setDescription(updateData.providerProfile.description);
      setIsVerified(updateData.providerProfile.isVerified);
      setTrustSummary(updateData.trustSummary);

      toast({ type: 'success', title: 'Perfil actualizado', message: 'Tus cambios se han guardado correctamente.' });
    } catch (err) {
      toast({ type: 'error', title: 'Error al guardar', message: err instanceof Error ? err.message : 'Error desconocido' });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <DashboardShell role="PROVIDER" userName="Cargando..." userEmail="">
        <SkeletonDashboard />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell role="PROVIDER" userName={user?.fullName ?? ''} userEmail={user?.email ?? ''}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">{error}</div>
      </DashboardShell>
    );
  }

  const activeRequests = requestsSummary.pending + requestsSummary.negotiation + requestsSummary.accepted + requestsSummary.inProgress;

  return (
    <DashboardShell role="PROVIDER" userName={user.fullName} userEmail={user.email} notificationCount={activeRequests}>
      <div className="space-y-8 sl-animate-fade-in">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-[var(--sl-radius-2xl)] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-8 text-white shadow-xl md:p-10">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-white/10" />
          <div className="relative">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Hola, {user.fullName.split(' ')[0]}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-white/90">
              Mantén actualizados tus datos comerciales y revisa las solicitudes entrantes. Un perfil completo y verificado atrae a más clientes.
            </p>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Confianza"
            value={`${trustSummary?.score ?? 0}/100`}
            icon={<BadgeCheck className="h-5 w-5" />}
            iconBg="bg-blue-100 text-blue-600"
            trend={trustSummary?.score && trustSummary.score >= 70 ? 'up' : 'neutral'}
            trendValue={trustSummary?.levelLabel}
          />
          <KPICard
            title="Solicitudes activas"
            value={activeRequests}
            icon={<Clock className="h-5 w-5" />}
            iconBg="bg-emerald-100 text-emerald-600"
            trend={activeRequests > 0 ? 'up' : 'neutral'}
            trendValue={activeRequests > 0 ? 'Por atender' : ''}
          />
          <KPICard
            title="Trabajos completados"
            value={requestsSummary.completed}
            icon={<CheckCircle className="h-5 w-5" />}
            iconBg="bg-teal-100 text-teal-600"
          />
          <KPICard
            title="Contacto"
            value={user.phone ?? '-'}
            icon={<Phone className="h-5 w-5" />}
            iconBg="bg-slate-100 text-slate-600"
          />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="sl-card p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Perfil profesional
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Esta información será la base de tu visibilidad en el directorio.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-900">RUC</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    value={ruc} 
                    disabled 
                    title="El RUC está verificado y no se puede modificar manualmente"
                    className={`${selectClassName} pl-10 opacity-60 cursor-not-allowed`} 
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-900">Nombre comercial</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ej. Servicios Eléctricos Talara" className={`${selectClassName} pl-10`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900">Categoría principal</label>
                <div className="relative">
                  <Wrench className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select value={category} onChange={handleCategoryChange} className={`${selectClassName} pl-10 appearance-none`}>
                    <option value="">Selecciona una categoría</option>
                    {serviceCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
              </div>

              {isOtherService ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900">Servicio personalizado</label>
                  <div className="relative">
                    <Wrench className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={customServiceName} onChange={(e) => setCustomServiceName(e.target.value)} placeholder="Ej. Soldadura" className={`${selectClassName} pl-10`} />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-900">Especialidad <span className="font-normal text-slate-400">(opcional)</span></label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ej. Mantenimiento industrial" className={`${selectClassName} pl-10`} />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-900">Zona de atención principal</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select value={serviceZone} onChange={(e) => setServiceZone(e.target.value)} className={`${selectClassName} pl-10 appearance-none`}>
                    <option value="">Selecciona tu zona</option>
                    {serviceZones.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900">Latitud <span className="font-normal text-slate-400">(opcional)</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number" 
                    step="0.0000001" 
                    value={latitude} 
                    onChange={(e) => setLatitude(e.target.value)} 
                    placeholder="Ej. -4.576" 
                    className={`${selectClassName} pl-10`} 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-900">Longitud <span className="font-normal text-slate-400">(opcional)</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="number" 
                    step="0.0000001" 
                    value={longitude} 
                    onChange={(e) => setLongitude(e.target.value)} 
                    placeholder="Ej. -81.275" 
                    className={`${selectClassName} pl-10`} 
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-semibold text-slate-900">Descripción del servicio</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe en pocas líneas tu experiencia y el tipo de trabajos que realizas." className={textareaClassName} />
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button type="submit" loading={saving} size="lg" className="w-full sm:w-auto" icon={<Save className="h-4 w-4" />}>
                  Guardar cambios
                </Button>
              </div>
            </div>
          </form>

          {/* Sidebar Modules */}
          <aside className="space-y-6">
            {/* Status */}
            <div className="sl-card p-6">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-4">Estado del perfil</h2>
              <div className="space-y-3">
                <div className={cn("flex items-center gap-3 p-3 rounded-xl border", isVerified ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700")}>
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-semibold">{isVerified ? 'Perfil verificado por ServiLocal' : 'Verificación pendiente'}</span>
                </div>
                {(trustSummary?.nextSteps || []).length ? (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700 space-y-2">
                    <p className="font-semibold">Siguientes pasos:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {(trustSummary?.nextSteps || []).map(step => <li key={step}>{step}</li>)}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-600">
                    ✅ Tu perfil cubre todos los factores base actuales.
                  </div>
                )}
              </div>
            </div>

            {/* Trust Breakdown */}
            <div className="sl-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">Auditoría de Confianza</h2>
                <span className="text-xs font-bold text-slate-500">{trustSummary?.completedChecks}/{trustSummary?.totalChecks} factores</span>
              </div>
              <TrustBar score={trustSummary?.score ?? 0} size="lg" />
              <div className="mt-6 space-y-3">
                {trustSummary?.breakdown.map((item) => (
                  <div key={item.key} className={cn("rounded-xl border p-3 flex flex-col gap-1.5 transition-colors", item.completed ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100")}>
                    <div className="flex items-center justify-between gap-3">
                      <span className={cn("text-sm font-semibold", item.completed ? "text-slate-900" : "text-slate-500")}>{item.label}</span>
                      <span className={cn("text-xs font-bold", item.completed ? "text-emerald-600" : "text-slate-400")}>{item.points}/{item.maxPoints}</span>
                    </div>
                    {!item.completed && <p className="text-xs text-slate-500">{item.guidance}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Requests Inbox mini */}
            <div className="sl-card p-6">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-4">Bandeja de solicitudes</h2>
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
                  <span className="text-slate-600">Nuevas / Pendientes</span>
                  <span className="font-bold text-slate-900">{requestsSummary.pending}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1 border-b border-slate-100">
                  <span className="text-slate-600">En negociación</span>
                  <span className="font-bold text-slate-900">{requestsSummary.negotiation}</span>
                </div>
                <div className="flex items-center justify-between text-sm py-1">
                  <span className="text-slate-600">Aceptadas / En curso</span>
                  <span className="font-bold text-slate-900">{requestsSummary.accepted + requestsSummary.inProgress}</span>
                </div>
              </div>
              <Link href="/panel/proveedor/solicitudes" className="block">
                <Button variant="outline" className="w-full">
                  Ver todas las solicitudes
                </Button>
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </DashboardShell>
  );
}