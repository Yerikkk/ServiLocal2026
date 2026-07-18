'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  CheckCircle,
  Clock,
  Banknote,
  Edit3,
  Hammer,
  KeyRound,
  Layers,
  Paintbrush,
  Plus,
  Power,
  PowerOff,
  Sparkles,
  Tag,
  Trees,
  Wind,
  Wrench,
  X,
  Zap,
  Droplets,
  AlertCircle,
  Package,
  Camera,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { SkeletonList } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { api, type ApiError } from '@/lib/api-client';
import { apiUrl } from '@/lib/api-url';

/* ─── Types ─────────────────────────────────────── */

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'PROVIDER';
};

type Category = {
  id: string;
  name: string;
  slug: string;
  serviceCount?: number;
};

type MyService = {
  id: string;
  name: string;
  description: string;
  referencePrice: string | null;
  estimatedTime: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  category: { id: string; name: string };
  _count?: { favorites: number };
};

type ServiceForm = {
  categoryId: string;
  name: string;
  description: string;
  referencePrice: string;
  estimatedTime: string;
  isActive: boolean;
  imageUrl?: string | null;
};

const EMPTY_FORM: ServiceForm = {
  categoryId: '',
  name: '',
  description: '',
  referencePrice: '',
  estimatedTime: '',
  isActive: true,
  imageUrl: null,
};

/* ─── Category icon map ─────────────────────────── */

const categoryIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  electricidad: { icon: Zap,         color: '#f59e0b' },
  plomeria:     { icon: Droplets,    color: '#3b82f6' },
  limpieza:     { icon: Sparkles,    color: '#8b5cf6' },
  carpinteria:  { icon: Hammer,      color: '#f97316' },
  pintura:      { icon: Paintbrush,  color: '#ec4899' },
  jardineria:   { icon: Trees,       color: '#10b981' },
  cerrajeria:   { icon: KeyRound,    color: '#6366f1' },
  aire_acondicionado: { icon: Wind,  color: '#06b6d4' },
};

function getCategoryDisplay(slug: string) {
  const key = (slug || '').toLowerCase().replace(/-/g, '_');
  return categoryIconMap[key] ?? { icon: Wrench, color: '#64748b' };
}

/* ─── Service Form Modal ────────────────────────── */

function ServiceFormModal({
  open,
  onClose,
  onSave,
  categories,
  initialData,
  isEdit,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (form: ServiceForm) => Promise<void>;
  categories: Category[];
  initialData?: Partial<ServiceForm>;
  isEdit?: boolean;
}) {
  const [form, setForm] = useState<ServiceForm>({ ...EMPTY_FORM, ...initialData });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceForm, string>>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, ...initialData });
      setErrors({});
      setUploadError('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        setUploadError('');
        const formData = new FormData();
        formData.append('file', file);
        
        const result = await api.upload<{ url: string }>('/api/upload/image', formData);
        setForm((prev) => ({ ...prev, imageUrl: result.url }));
      } catch (err) {
        const apiErr = err as ApiError;
        setUploadError(apiErr.message ?? 'Error al subir la imagen');
      } finally {
        setUploading(false);
      }
    }
  };

  function set<K extends keyof ServiceForm>(key: K, value: ServiceForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ServiceForm, string>> = {};
    if (!form.categoryId) newErrors.categoryId = 'Selecciona una categoría';
    if (!form.name.trim() || form.name.trim().length < 3)
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    if (!form.description.trim() || form.description.trim().length < 10)
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    if (form.referencePrice && isNaN(parseFloat(form.referencePrice)))
      newErrors.referencePrice = 'El precio debe ser un número válido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar servicio' : 'Publicar nuevo servicio'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--sl-text-primary)' }}>
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-4 focus:ring-[var(--sl-primary)]/10"
            style={{
              borderColor: errors.categoryId ? '#ef4444' : 'var(--sl-border)',
              background: 'var(--sl-bg)',
              color: 'var(--sl-text-primary)',
            }}
          >
            <option value="">Selecciona una categoría...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />{errors.categoryId}
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--sl-text-primary)' }}>
            Nombre del servicio <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ej: Instalación eléctrica residencial"
            maxLength={80}
            className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-4 focus:ring-[var(--sl-primary)]/10"
            style={{
              borderColor: errors.name ? '#ef4444' : 'var(--sl-border)',
              background: 'var(--sl-bg)',
              color: 'var(--sl-text-primary)',
            }}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.name
              ? <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.name}</p>
              : <span />
            }
            <span className="text-xs" style={{ color: 'var(--sl-text-muted)' }}>{form.name.length}/80</span>
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--sl-text-primary)' }}>
            Imagen del servicio
          </label>
          <div className="mt-2">
            {form.imageUrl ? (
              <div className="relative">
                <img
                  src={form.imageUrl}
                  alt="Imagen del servicio"
                  className="w-full h-48 object-cover rounded-xl border border-[var(--sl-border)]"
                />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, imageUrl: null }))}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex flex-col items-center justify-center gap-2 w-full h-48 rounded-xl border-2 border-dashed border-[var(--sl-border)] bg-[var(--sl-bg)] hover:bg-[var(--sl-primary-muted)] transition"
              >
                {uploading ? (
                  <div className="h-6 w-6 sl-animate-spin rounded-full border-2 border-[var(--sl-primary)] border-t-transparent" />
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-[var(--sl-text-muted)]" />
                    <p className="text-sm font-medium text-[var(--sl-text-muted)]">Subir imagen del servicio</p>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          {uploadError && (
            <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
              <AlertCircle className="h-3 w-3" />
              {uploadError}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--sl-text-primary)' }}>
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Describe detalladamente qué incluye el servicio, materiales, experiencia requerida..."
            rows={4}
            maxLength={600}
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-[var(--sl-primary)]/10"
            style={{
              borderColor: errors.description ? '#ef4444' : 'var(--sl-border)',
              background: 'var(--sl-bg)',
              color: 'var(--sl-text-primary)',
            }}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.description
              ? <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3 w-3" />{errors.description}</p>
              : <span />
            }
            <span className="text-xs" style={{ color: 'var(--sl-text-muted)' }}>{form.description.length}/600</span>
          </div>
        </div>

        {/* Price + Time */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--sl-text-primary)' }}>
              Precio referencial (S/)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'var(--sl-text-muted)' }}>S/</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.referencePrice}
                onChange={(e) => set('referencePrice', e.target.value)}
                placeholder="0.00"
                className="h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:ring-4 focus:ring-[var(--sl-primary)]/10"
                style={{
                  borderColor: errors.referencePrice ? '#ef4444' : 'var(--sl-border)',
                  background: 'var(--sl-bg)',
                  color: 'var(--sl-text-primary)',
                }}
              />
            </div>
            {errors.referencePrice && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />{errors.referencePrice}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold" style={{ color: 'var(--sl-text-primary)' }}>
              Tiempo estimado
            </label>
            <input
              type="text"
              value={form.estimatedTime}
              onChange={(e) => set('estimatedTime', e.target.value)}
              placeholder="Ej: 2–3 horas"
              className="h-11 w-full rounded-xl border px-4 text-sm outline-none transition focus:ring-4 focus:ring-[var(--sl-primary)]/10"
              style={{
                borderColor: 'var(--sl-border)',
                background: 'var(--sl-bg)',
                color: 'var(--sl-text-primary)',
              }}
            />
          </div>
        </div>

        {/* Active toggle (only for edit) */}
        {isEdit && (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--sl-border)] p-4 transition hover:bg-[var(--sl-primary-muted)]">
            <div className={`relative h-6 w-11 rounded-full transition-colors ${form.isActive ? 'bg-[var(--sl-primary)]' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`} />
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
            />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--sl-text-primary)' }}>
                {form.isActive ? 'Servicio activo' : 'Servicio pausado'}
              </p>
              <p className="text-xs" style={{ color: 'var(--sl-text-secondary)' }}>
                {form.isActive
                  ? 'Visible en el catálogo público'
                  : 'Oculto del catálogo (puedes reactivarlo en cualquier momento)'}
              </p>
            </div>
          </label>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--sl-border-light)]">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={saving} icon={isEdit ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}>
            {isEdit ? 'Guardar cambios' : 'Publicar servicio'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Main Component ────────────────────────────── */

export function ProviderServicesPanel() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser]       = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<MyService[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [svcLoading, setSvcLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen]     = useState(false);
  const [editTarget, setEditTarget]   = useState<MyService | null>(null);

  /* ── Load user ──────────────────────────────── */
  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        setLoading(true);
        const [userData, catData] = await Promise.all([
          api.get<CurrentUser>('/api/auth/me'),
          fetch(apiUrl('/api/services/categories'))
            .then((r) => (r.ok ? r.json() : { items: [] })),
        ]);
        if (userData.role !== 'PROVIDER') { router.replace('/panel'); return; }
        if (!ignore) {
          setUser(userData);
          setCategories(catData.items ?? []);
        }
      } catch {
        if (!ignore) router.replace('/iniciar-sesion');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => { ignore = true; };
  }, [router]);

  /* ── Load services ──────────────────────────── */
  const loadServices = useCallback(async () => {
    setSvcLoading(true);
    try {
      const data = await api.get<{ items: MyService[]; total: number }>('/api/services/me');
      setServices(data.items ?? []);
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo cargar tus servicios.' });
    } finally {
      setSvcLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) loadServices();
  }, [user, loadServices]);

  /* ── Create service ─────────────────────────── */
  async function handleCreate(form: ServiceForm) {
    const body: Record<string, unknown> = {
      categoryId: form.categoryId,
      name: form.name.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl,
    };
    if (form.referencePrice) body.referencePrice = form.referencePrice;
    if (form.estimatedTime.trim()) body.estimatedTime = form.estimatedTime.trim();

    await api.post('/api/services', body);
    toast({ type: 'success', title: 'Servicio publicado', message: 'Tu servicio ya aparece en el catálogo.' });
    loadServices();
  }

  /* ── Edit service ───────────────────────────── */
  async function handleEdit(form: ServiceForm) {
    if (!editTarget) return;
    const body: Record<string, unknown> = {
      categoryId: form.categoryId,
      name: form.name.trim(),
      description: form.description.trim(),
      isActive: form.isActive,
      imageUrl: form.imageUrl,
    };
    if (form.referencePrice) body.referencePrice = form.referencePrice;
    else body.referencePrice = null;
    if (form.estimatedTime.trim()) body.estimatedTime = form.estimatedTime.trim();
    else body.estimatedTime = null;

    await api.patch(`/api/services/${editTarget.id}`, body);
    toast({ type: 'success', title: 'Cambios guardados', message: 'El servicio fue actualizado correctamente.' });
    loadServices();
  }

  /* ── Toggle active ──────────────────────────── */
  async function handleToggle(svc: MyService) {
    setTogglingId(svc.id);
    try {
      await api.patch(`/api/services/${svc.id}`, { isActive: !svc.isActive });
      setServices((prev) =>
        prev.map((s) => (s.id === svc.id ? { ...s, isActive: !s.isActive } : s))
      );
      toast({
        type: 'success',
        title: svc.isActive ? 'Servicio pausado' : 'Servicio activado',
        message: svc.isActive
          ? 'El servicio fue ocultado del catálogo.'
          : 'El servicio es visible nuevamente en el catálogo.',
      });
    } catch {
      toast({ type: 'error', title: 'Error', message: 'No se pudo cambiar el estado del servicio.' });
    } finally {
      setTogglingId(null);
    }
  }

  function openEdit(svc: MyService) {
    setEditTarget(svc);
    setModalOpen(true);
  }

  function openCreate() {
    setEditTarget(null);
    setModalOpen(true);
  }

  /* ── Skeleton ───────────────────────────────── */
  if (loading || !user) {
    return (
      <DashboardShell role="PROVIDER" userName="Cargando..." userEmail="">
        <SkeletonList count={4} />
      </DashboardShell>
    );
  }

  const activeCount   = (services || []).filter((s) => s.isActive).length;
  const inactiveCount = (services || []).filter((s) => !s.isActive).length;

  /* ─── Render ────────────────────────────────── */
  return (
    <DashboardShell role="PROVIDER" userName={user.fullName} userEmail={user.email}>
      <div className="space-y-6 sl-animate-fade-in max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--sl-primary-light)] text-[var(--sl-primary)]">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--sl-text-primary)' }}>
                Mis Servicios
              </h1>
              <p className="text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
                Publica y gestiona los servicios que ofreces a tus clientes.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={openCreate}
          >
            Publicar servicio
          </Button>
        </header>

        {/* Stats strip */}
        {(services || []).length > 0 && (
          <div className="grid grid-cols-3 gap-4 sl-animate-fade-in">
            {[
              { label: 'Total',    value: (services || []).length, color: 'bg-blue-50 text-blue-600',    icon: Layers },
              { label: 'Activos',  value: activeCount,     color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle },
              { label: 'Pausados', value: inactiveCount,   color: 'bg-amber-50 text-amber-600',  icon: PowerOff },
            ].map(({ label, value, color, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center rounded-2xl border border-[var(--sl-border)] p-4 text-center"
                style={{ background: 'var(--sl-surface)' }}
              >
                <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xl font-black" style={{ color: 'var(--sl-text-primary)' }}>{value}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--sl-text-secondary)' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Services list */}
        {svcLoading ? (
          <SkeletonList count={4} />
        ) : (services || []).length === 0 ? (
          <EmptyState
            icon={<Package />}
            title="Aún no tienes servicios publicados"
            description="Publica tu primer servicio para que los clientes puedan encontrarte en el catálogo y solicitarte."
            action={
              <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
                Publicar mi primer servicio
              </Button>
            }
          />
        ) : (
          <div className="space-y-4 sl-stagger">
            {(services || []).map((svc) => {
              const catDisplay = getCategoryDisplay(svc.category?.name?.toLowerCase() || '');
              const Icon = catDisplay.icon;
              const isToggling = togglingId === svc.id;

              return (
                <article
                  key={svc.id}
                  className={`sl-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center transition-opacity ${
                    !svc.isActive ? 'opacity-70' : ''
                  }`}
                >
                  {/* Category icon */}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${catDisplay.color}18`, color: catDisplay.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2
                        className="text-base font-bold truncate"
                        style={{ color: 'var(--sl-text-primary)' }}
                      >
                        {svc.name}
                      </h2>
                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        svc.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {svc.isActive
                          ? <><CheckCircle className="h-2.5 w-2.5" /> Activo</>
                          : <><PowerOff className="h-2.5 w-2.5" /> Pausado</>
                        }
                      </span>
                    </div>

                    <p
                      className="text-sm line-clamp-2 mb-2"
                      style={{ color: 'var(--sl-text-secondary)' }}
                    >
                      {svc.description}
                    </p>

                    {/* Meta chips */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--sl-border-light)] px-2.5 py-1 font-medium" style={{ color: 'var(--sl-text-secondary)' }}>
                        <Tag className="h-3 w-3" />
                        {svc.category?.name || 'Sin categoría'}
                      </span>
                      {svc.referencePrice && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">
                          <Banknote className="h-3 w-3" />
                          S/ {parseFloat(svc.referencePrice).toFixed(2)}
                        </span>
                      )}
                      {svc.estimatedTime && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                          <Clock className="h-3 w-3" />
                          Tiempo est. {svc.estimatedTime}
                        </span>
                      )}
                      {svc._count?.favorites !== undefined && svc._count.favorites > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-600">
                          ♥ {svc._count.favorites} guardado{svc._count.favorites !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggle(svc)}
                      disabled={isToggling}
                      title={svc.isActive ? 'Pausar servicio' : 'Activar servicio'}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                        svc.isActive
                          ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isToggling
                        ? <span className="h-4 w-4 sl-animate-spin rounded-full border-2 border-current border-t-transparent" />
                        : svc.isActive
                          ? <PowerOff className="h-4 w-4" />
                          : <Power className="h-4 w-4" />
                      }
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(svc)}
                      title="Editar servicio"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sl-primary-muted)] text-[var(--sl-primary)] transition hover:bg-[var(--sl-primary)] hover:text-white"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <ServiceFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); }}
        onSave={editTarget ? handleEdit : handleCreate}
        categories={categories}
        isEdit={!!editTarget}
        initialData={
          editTarget
            ? {
                categoryId:     editTarget.category?.id || '',
                name:           editTarget.name,
                description:    editTarget.description,
                referencePrice: editTarget.referencePrice ?? '',
                estimatedTime:  editTarget.estimatedTime ?? '',
                isActive:       editTarget.isActive,
                imageUrl:       editTarget.imageUrl,
              }
            : undefined
        }
      />
    </DashboardShell>
  );
}
