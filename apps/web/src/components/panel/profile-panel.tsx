'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  Shield, 
  Star, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building2,
  Briefcase,
  MapPin,
  Clock,
  Fingerprint
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { api, type ApiError } from '@/lib/api-client';

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  trustScore: number;
  slPoints: number;
  createdAt: string;
  providerProfile?: {
    ruc: string;
    businessName: string;
    specialty?: string;
    experienceYears?: number;
    availability?: string;
    serviceZone: string;
    description: string;
  };
};

export function ProfilePanel({ role }: { role: 'CLIENT' | 'PROVIDER' | 'ADMIN' }) {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Provider states
  const [businessName, setBusinessName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [availability, setAvailability] = useState('');
  const [serviceZone, setServiceZone] = useState('');
  const [description, setDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await api.get<CurrentUser>('/api/users/me');
        setUser(data);
        setFullName(data.fullName || '');
        setPhone(data.phone || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatarUrl || '');

        if (data.providerProfile) {
          setBusinessName(data.providerProfile.businessName || '');
          setSpecialty(data.providerProfile.specialty || '');
          setExperienceYears(data.providerProfile.experienceYears || 0);
          setAvailability(data.providerProfile.availability || '');
          setServiceZone(data.providerProfile.serviceZone || '');
          setDescription(data.providerProfile.description || '');
        }
      } catch (err: any) {
        if (err?.status === 401) return; // api client handles redirect
        setError(err?.message ?? 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const body: any = {
        fullName,
        phone,
        bio,
        avatarUrl,
      };

      if (user?.role === 'PROVIDER') {
        body.providerProfile = {
          businessName,
          specialty,
          experienceYears: Number(experienceYears),
          availability,
          serviceZone,
          description,
        };
      }

      const updated = await api.patch<CurrentUser>('/api/users/profile', body);
      setUser(updated);
      setSuccess('Perfil actualizado correctamente');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert('La subida real de imágenes se implementará con un servicio de almacenamiento (S3/Cloudinary). Por ahora, guardaremos una URL de ejemplo.');
      setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`);
    }
  };

  if (loading) {
    return (
      <DashboardShell role={role} userName="Cargando..." userEmail="">
        <SkeletonDashboard />
      </DashboardShell>
    );
  }

  if (!user) return null;

  return (
    <DashboardShell role={role} userName={user.fullName} userEmail={user.email}>
      <div className="max-w-4xl mx-auto space-y-8 sl-animate-fade-in">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>Mi Perfil</h1>
          <p className="mt-2" style={{ color: 'var(--sl-text-secondary)' }}>Gestiona tu información personal y cómo te ven los demás.</p>
        </header>

        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          {/* Left Column: Avatar & Stats */}
          <aside className="space-y-6">
            <div className="sl-card p-6 text-center">
              <div className="relative inline-block group">
                <div 
                  className="w-32 h-32 rounded-3xl overflow-hidden bg-[var(--sl-primary-muted)] border-4 border-[var(--sl-surface)] shadow-lg flex items-center justify-center cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-[var(--sl-primary)]" />
                  )}
                </div>
                <button 
                  onClick={handleAvatarClick}
                  className="absolute bottom-[-8px] right-[-8px] bg-[var(--sl-primary)] text-white p-2.5 rounded-2xl shadow-xl hover:scale-110 transition-transform"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              
              <h2 className="mt-6 font-bold text-xl" style={{ color: 'var(--sl-text-primary)' }}>{user.fullName}</h2>
              <p className="text-sm font-medium uppercase tracking-wider mt-1" style={{ color: 'var(--sl-primary)' }}>
                {user.role === 'CLIENT' ? 'Cliente' : user.role === 'PROVIDER' ? 'Proveedor' : 'Admin'}
              </p>
            </div>

            <div className="sl-card p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2" style={{ color: 'var(--sl-text-secondary)' }}>
                  <Shield className="w-4 h-4" /> Confianza
                </span>
                <span className="font-bold text-[var(--sl-success)]">{user.trustScore}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2" style={{ color: 'var(--sl-text-secondary)' }}>
                  <Star className="w-4 h-4" /> Puntos SL
                </span>
                <span className="font-bold text-[var(--sl-primary)]">{user.slPoints}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2" style={{ color: 'var(--sl-text-secondary)' }}>
                  <Calendar className="w-4 h-4" /> Miembro desde
                </span>
                <span className="font-medium" style={{ color: 'var(--sl-text-primary)' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </aside>

          {/* Right Column: Form */}
          <main className="space-y-6">
            <form onSubmit={handleSave} className="sl-card p-8 space-y-8">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-2xl text-sm font-medium border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" /> {success}
                </div>
              )}

              {/* Personal Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 px-1" style={{ color: 'var(--sl-text-primary)' }}>
                  <User className="w-5 h-5 text-[var(--sl-primary)]" /> Datos Personales
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] outline-none focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary-muted)] transition-all"
                        placeholder="Tu nombre"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        value={user.email}
                        disabled
                        title="El correo no se puede modificar por seguridad"
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] opacity-60 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] outline-none focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary-muted)] transition-all"
                        placeholder="Tu celular"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>Biografía</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full p-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] outline-none focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary-muted)] transition-all resize-none"
                    placeholder="Cuéntanos un poco sobre ti..."
                  />
                </div>
              </div>

              {/* Provider Section */}
              {user.role === 'PROVIDER' && user.providerProfile && (
                <div className="space-y-6 pt-4 border-t border-[var(--sl-border)]">
                  <h3 className="text-lg font-bold flex items-center gap-2 px-1" style={{ color: 'var(--sl-text-primary)' }}>
                    <Building2 className="w-5 h-5 text-[var(--sl-primary)]" /> Información de Negocio
                  </h3>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>RUC / Identificación Fiscal</label>
                      <div className="relative">
                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          value={user.providerProfile.ruc}
                          disabled
                          title="El RUC está verificado y no se puede modificar manualmente"
                          className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] opacity-60 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>Nombre Comercial</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] outline-none focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary-muted)] transition-all"
                          placeholder="Nombre de tu negocio"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>Especialidad</label>
                      <input 
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full h-12 px-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] outline-none focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary-muted)] transition-all"
                        placeholder="Ej. Plomería experta"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>Años de Experiencia</label>
                      <input 
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full h-12 px-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] outline-none focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary-muted)] transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>Zona de Servicio</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          value={serviceZone}
                          onChange={(e) => setServiceZone(e.target.value)}
                          className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] outline-none focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary-muted)] transition-all"
                          placeholder="Ej. Lima Norte, Miraflores..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>Disponibilidad</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          value={availability}
                          onChange={(e) => setAvailability(e.target.value)}
                          className="w-full h-12 pl-12 pr-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] outline-none focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary-muted)] transition-all"
                          placeholder="Ej. Lun-Vie 8am-6pm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold px-1" style={{ color: 'var(--sl-text-secondary)' }}>Descripción del Servicio</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full p-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-bg)] outline-none focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary-muted)] transition-all resize-none"
                      placeholder="Describe detalladamente lo que ofreces..."
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-12 h-12 rounded-2xl bg-[var(--sl-primary)] text-white font-bold shadow-lg hover:bg-[var(--sl-primary-hover)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </DashboardShell>
  );
}
