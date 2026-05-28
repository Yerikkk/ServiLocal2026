'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, ShieldAlert, Globe, Server, RefreshCw } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api-client';

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER' | 'SUPPORT';
  status: string;
};

type ConfigItem = {
  id: string;
  key: string;
  value: string;
  description: string | null;
};

export default function AdminConfigPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // States for configs
  const [configs, setConfigs] = useState<Record<string, string>>({});

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const data = await api.get<CurrentUser>('/api/auth/me');
        if (data.role !== 'ADMIN') { router.replace('/panel'); return; }
        setUser(data);
        await loadConfig();
      } catch {
        router.replace('/iniciar-sesion');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  async function loadConfig() {
    try {
      const items = await api.get<ConfigItem[]>('/api/admin/config');
      const map: Record<string, string> = {};
      items.forEach(i => map[i.key] = i.value);
      
      // Default fallbacks if not in DB yet
      if (!map['PLATFORM_FEE_PERCENTAGE']) map['PLATFORM_FEE_PERCENTAGE'] = '10';
      if (!map['SUPPORT_EMAIL']) map['SUPPORT_EMAIL'] = 'soporte@servilocal.com';
      if (!map['MAINTENANCE_MODE']) map['MAINTENANCE_MODE'] = 'false';
      
      setConfigs(map);
    } catch {
      toast({ title: 'Error', message: 'No se pudo cargar la configuración', type: 'error' });
    }
  }

  const handleChange = (key: string, val: string) => {
    setConfigs(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async (key: string, value: string, description: string) => {
    try {
      setSaving(true);
      await api.patch('/api/admin/config', { key, value, description });
      toast({ title: 'Guardado', message: `Configuración ${key} actualizada exitosamente.`, type: 'success' });
    } catch {
      toast({ title: 'Error', message: 'No se pudo guardar la configuración', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardShell role="ADMIN" userName="Cargando..." userEmail="...">
        <div className="flex h-[60vh] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="ADMIN" userName={user.fullName} userEmail={user.email}>
      <div className="mx-auto max-w-4xl space-y-8 sl-animate-fade-in pb-12">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Configuración Global
          </h1>
          <p className="text-slate-500">
            Ajustes maestros de la plataforma. Los cambios aplicados aquí afectan a todos los usuarios de ServiLocal.
          </p>
        </div>

        <div className="grid gap-6 sl-stagger">
          {/* Platform Settings */}
          <section className="sl-card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <h2 className="font-bold text-slate-800">Plataforma</h2>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-6">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-semibold text-slate-900">Correo de Soporte</label>
                  <p className="text-xs text-slate-500">Email oficial para atención al cliente y disputas.</p>
                </div>
                <div className="flex flex-1 items-center gap-3">
                  <input
                    value={configs['SUPPORT_EMAIL'] ?? ''}
                    onChange={(e) => handleChange('SUPPORT_EMAIL', e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />
                  <Button disabled={saving} onClick={() => handleSave('SUPPORT_EMAIL', configs['SUPPORT_EMAIL'], 'Correo oficial de soporte')} variant="primary">
                    Guardar
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-semibold text-slate-900">Comisión de la Plataforma (%)</label>
                  <p className="text-xs text-slate-500">Porcentaje de cobro sobre transacciones gestionadas.</p>
                </div>
                <div className="flex flex-1 items-center gap-3">
                  <input
                    type="number"
                    value={configs['PLATFORM_FEE_PERCENTAGE'] ?? ''}
                    onChange={(e) => handleChange('PLATFORM_FEE_PERCENTAGE', e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
                  />
                  <Button disabled={saving} onClick={() => handleSave('PLATFORM_FEE_PERCENTAGE', configs['PLATFORM_FEE_PERCENTAGE'], 'Porcentaje de comisión base')} variant="primary">
                    Guardar
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* System Status */}
          <section className="sl-card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-rose-500" />
              <h2 className="font-bold text-slate-800">Estado del Sistema</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-slate-900">Modo Mantenimiento</label>
                    {configs['MAINTENANCE_MODE'] === 'true' && <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>}
                  </div>
                  <p className="text-xs text-slate-500">Bloquea el acceso a todos los usuarios excepto administradores.</p>
                </div>
                <div className="flex flex-1 items-center gap-3">
                  <select
                    value={configs['MAINTENANCE_MODE'] ?? 'false'}
                    onChange={(e) => handleChange('MAINTENANCE_MODE', e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
                  >
                    <option value="false">Desactivado (En línea)</option>
                    <option value="true">Activado (Mantenimiento)</option>
                  </select>
                  <Button disabled={saving} onClick={() => handleSave('MAINTENANCE_MODE', configs['MAINTENANCE_MODE'], 'Activar/Desactivar modo mantenimiento')} variant={configs['MAINTENANCE_MODE'] === 'true' ? 'danger' : 'primary'}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Security Zone */}
          <section className="sl-card overflow-hidden border-rose-200 shadow-sm shadow-rose-100">
            <div className="border-b border-rose-100 bg-rose-50/50 px-6 py-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              <h2 className="font-bold text-rose-900">Zona de Seguridad</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-900">Forzar cierre de sesión global</label>
                  <p className="text-xs text-slate-500">Invalida todas las sesiones activas en la plataforma.</p>
                </div>
                <Button variant="danger" onClick={() => toast({ title: 'Simulación', message: 'Función en desarrollo', type: 'error' })}>
                  Cerrar todas las sesiones
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
