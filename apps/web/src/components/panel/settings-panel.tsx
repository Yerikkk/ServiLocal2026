'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Moon, Sun, Monitor, Bell, Shield, KeyRound } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { useTheme } from '@/components/ui/theme-provider';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { api, type ApiError } from '@/lib/api-client';

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
  status: string;
  phone?: string | null;
};

export function SettingsPanel({ rolePath }: { rolePath: 'cliente' | 'proveedor' | 'admin' }) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings states
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [activeTab, setActiveTab] = useState<'apariencia' | 'notificaciones' | 'seguridad' | 'contrasena'>('apariencia');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadUser() {
      try {
        const data = await api.get<CurrentUser>('/api/auth/me');
        if (!ignore) setUser(data);
      } catch {
        if (!ignore) toast({ type: 'error', title: 'Error', message: 'No se pudo cargar la configuración.' });
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadUser();
    return () => { ignore = true; };
  }, [toast]);

  async function handleSavePrefs() {
    setSaving(true);
    // Simulate API call for preferences
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast({ type: 'success', title: 'Ajustes guardados', message: 'Tus preferencias han sido actualizadas exitosamente.' });
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      setChangingPassword(true);
      const result = await api.patch<{ message: string }>('/api/users/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setPasswordSuccess(result.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      toast({ type: 'success', title: 'Contraseña actualizada', message: result.message });
    } catch (err) {
      const apiErr = err as ApiError;
      setPasswordError(apiErr.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading || !user) {
    return (
      <DashboardShell role={rolePath.toUpperCase() as any} userName="Cargando..." userEmail="">
        <SkeletonDashboard />
      </DashboardShell>
    );
  }

  const inputClasses = "w-full h-11 px-4 rounded-xl border border-[var(--sl-border)] outline-none focus:border-[var(--sl-primary)] focus:ring-4 focus:ring-[var(--sl-primary)]/10 transition-all";

  return (
    <DashboardShell role={user.role} userName={user.fullName} userEmail={user.email}>
      <div className="space-y-8 sl-animate-fade-in max-w-4xl mx-auto">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>Configuración</h1>
          <p className="mt-2" style={{ color: 'var(--sl-text-secondary)' }}>Administra tus preferencias de cuenta, notificaciones y apariencia.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-[250px_1fr]">
          {/* Menu lateral de configuración */}
          <aside className="space-y-1">
            <button 
              onClick={() => setActiveTab('apariencia')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${activeTab === 'apariencia' ? 'bg-[var(--sl-primary-muted)] text-[var(--sl-primary)]' : 'text-[var(--sl-text-secondary)] hover:bg-[var(--sl-primary-muted)]'}`}
            >
              <Monitor className="h-5 w-5" /> Apariencia
            </button>
            <button 
              onClick={() => setActiveTab('notificaciones')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${activeTab === 'notificaciones' ? 'bg-[var(--sl-primary-muted)] text-[var(--sl-primary)]' : 'text-[var(--sl-text-secondary)] hover:bg-[var(--sl-primary-muted)]'}`}
            >
              <Bell className="h-5 w-5" /> Notificaciones
            </button>
            <button 
              onClick={() => setActiveTab('seguridad')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${activeTab === 'seguridad' ? 'bg-[var(--sl-primary-muted)] text-[var(--sl-primary)]' : 'text-[var(--sl-text-secondary)] hover:bg-[var(--sl-primary-muted)]'}`}
            >
              <Shield className="h-5 w-5" /> Privacidad y Seguridad
            </button>
            <button 
              onClick={() => setActiveTab('contrasena')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${activeTab === 'contrasena' ? 'bg-[var(--sl-primary-muted)] text-[var(--sl-primary)]' : 'text-[var(--sl-text-secondary)] hover:bg-[var(--sl-primary-muted)]'}`}
            >
              <KeyRound className="h-5 w-5" /> Contraseña
            </button>
          </aside>

          {/* Contenido de configuración */}
          <div className="space-y-6 min-h-[400px]">
            
            {/* Section: Apariencia */}
            {activeTab === 'apariencia' && (
            <section className="sl-card p-6 md:p-8 sl-animate-fade-in">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--sl-text-primary)' }}>Apariencia</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--sl-text-secondary)' }}>Personaliza cómo se ve ServiLocal en tu dispositivo.</p>
              
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-[var(--sl-primary)] bg-[var(--sl-primary-light)]' : 'border-[var(--sl-border)] hover:border-[var(--sl-primary)]'}`}
                >
                  <Sun className={`h-8 w-8 ${theme === 'light' ? 'text-[var(--sl-primary)]' : 'text-slate-400'}`} />
                  <span className={`text-sm font-semibold ${theme === 'light' ? 'text-[var(--sl-primary)]' : ''}`} style={theme !== 'light' ? { color: 'var(--sl-text-secondary)' } : undefined}>Claro</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-[var(--sl-primary)] bg-[var(--sl-primary-light)]' : 'border-[var(--sl-border)] hover:border-[var(--sl-primary)]'}`}
                >
                  <Moon className={`h-8 w-8 ${theme === 'dark' ? 'text-[var(--sl-primary)]' : 'text-slate-400'}`} />
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-[var(--sl-primary)]' : ''}`} style={theme !== 'dark' ? { color: 'var(--sl-text-secondary)' } : undefined}>Oscuro</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === 'system' ? 'border-[var(--sl-primary)] bg-[var(--sl-primary-light)]' : 'border-[var(--sl-border)] hover:border-[var(--sl-primary)]'}`}
                >
                  <Monitor className={`h-8 w-8 ${theme === 'system' ? 'text-[var(--sl-primary)]' : 'text-slate-400'}`} />
                  <span className={`text-sm font-semibold ${theme === 'system' ? 'text-[var(--sl-primary)]' : ''}`} style={theme !== 'system' ? { color: 'var(--sl-text-secondary)' } : undefined}>Sistema</span>
                </button>
              </div>
            </section>
            )}

            {/* Section: Notificaciones */}
            {activeTab === 'notificaciones' && (
            <section className="sl-card p-6 md:p-8 sl-animate-fade-in">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--sl-text-primary)' }}>Notificaciones</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-[var(--sl-border-light)] rounded-xl hover:bg-[var(--sl-primary-muted)] cursor-pointer transition-colors">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--sl-text-primary)' }}>Correos electrónicos</p>
                    <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>Recibe actualizaciones sobre tus solicitudes por email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifs}
                    onChange={(e) => setEmailNotifs(e.target.checked)}
                    className="w-5 h-5 rounded border-[var(--sl-border)] text-[var(--sl-primary)] focus:ring-[var(--sl-primary)]"
                  />
                </label>
                <label className="flex items-center justify-between p-4 border border-[var(--sl-border-light)] rounded-xl hover:bg-[var(--sl-primary-muted)] cursor-pointer transition-colors">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--sl-text-primary)' }}>Notificaciones Push</p>
                    <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>Recibe alertas instantáneas en tu navegador.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifs}
                    onChange={(e) => setPushNotifs(e.target.checked)}
                    className="w-5 h-5 rounded border-[var(--sl-border)] text-[var(--sl-primary)] focus:ring-[var(--sl-primary)]"
                  />
                </label>
              </div>
            </section>
            )}

            {/* Section: Seguridad */}
            {activeTab === 'seguridad' && (
            <section className="sl-card p-6 md:p-8 sl-animate-fade-in">
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--sl-text-primary)' }}>Seguridad</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-[var(--sl-border-light)] rounded-xl hover:bg-[var(--sl-primary-muted)] cursor-pointer transition-colors">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--sl-text-primary)' }}>Autenticación de dos pasos</p>
                    <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>Añade una capa extra de seguridad a tu cuenta.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(e) => setTwoFactor(e.target.checked)}
                    className="w-5 h-5 rounded border-[var(--sl-border)] text-[var(--sl-primary)] focus:ring-[var(--sl-primary)]"
                  />
                </label>
              </div>
            </section>
            )}

            {/* Section: Contraseña */}
            {activeTab === 'contrasena' && (
            <section className="sl-card p-6 md:p-8 sl-animate-fade-in">
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--sl-text-primary)' }}>Cambiar Contraseña</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--sl-text-secondary)' }}>
                La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y un carácter especial.
              </p>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--sl-text-secondary)' }}>Contraseña Actual</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={inputClasses}
                    style={{ background: 'var(--sl-bg)', color: 'var(--sl-text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--sl-text-secondary)' }}>Nueva Contraseña</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className={inputClasses}
                    style={{ background: 'var(--sl-bg)', color: 'var(--sl-text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--sl-text-secondary)' }}>Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className={inputClasses}
                    style={{ background: 'var(--sl-bg)', color: 'var(--sl-text-primary)' }}
                  />
                </div>

                {passwordError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {passwordSuccess}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    loading={changingPassword}
                    disabled={!currentPassword || !newPassword || !confirmNewPassword}
                    size="lg"
                  >
                    Cambiar contraseña
                  </Button>
                </div>
              </form>
            </section>
            )}

            {activeTab !== 'contrasena' && (
              <div className="flex justify-end pt-4">
                <Button loading={saving} onClick={handleSavePrefs} size="lg">
                  Guardar preferencias
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
