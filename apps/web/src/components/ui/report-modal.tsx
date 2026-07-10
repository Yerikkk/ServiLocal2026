'use client';

import { useState } from 'react';
import { api } from '@/lib/api-client';
import { Modal } from './modal';
import { Button } from './button';
import { useToast } from './toast';

export type ReportModalProps = {
  open: boolean;
  onClose: () => void;
  reportedUserId: string;
  requestId?: string;
  reportedUserName: string;
};

const REPORT_REASONS = [
  { value: 'INAPPROPRIATE_CONTENT', label: 'Contenido inapropiado' },
  { value: 'FRAUD', label: 'Fraude o estafa' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Acoso o comportamiento abusivo' },
  { value: 'FAKE_PROFILE', label: 'Perfil falso' },
  { value: 'SERVICE_NOT_PROVIDED', label: 'El servicio no fue brindado' },
  { value: 'OTHER', label: 'Otro' },
];

export function ReportModal({
  open,
  onClose,
  reportedUserId,
  requestId,
  reportedUserName,
}: ReportModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0].value);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (description && ((description || '').length < 10 || (description || '').length > 2000)) {
      toast.error('La descripción debe tener entre 10 y 2000 caracteres');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/reports', {
        reportedUserId,
        requestId,
        reason,
        description: description || undefined,
      });

      toast.success('Reporte enviado correctamente. Lo revisaremos pronto.');
      onClose();
      // Reset form
      setReason(REPORT_REASONS[0].value);
      setDescription('');
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title="Reportar usuario"
      description={`Estás a punto de reportar a ${reportedUserName}. Nuestro equipo revisará el caso.`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--sl-text-primary)' }}>
            Motivo del reporte <span className="text-red-500">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-[var(--sl-border)] px-4 py-2.5 focus:border-[var(--sl-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--sl-primary)]"
            style={{ background: 'var(--sl-surface)', color: 'var(--sl-text-primary)' }}
            required
          >
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--sl-text-primary)' }}>
            Descripción o detalles (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            rows={4}
            className="w-full resize-none rounded-xl border border-[var(--sl-border)] px-4 py-3 placeholder:text-[var(--sl-text-muted)] focus:border-[var(--sl-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--sl-primary)]"
            style={{ background: 'var(--sl-surface)', color: 'var(--sl-text-primary)' }}
            placeholder="Añade detalles que nos ayuden a entender el problema..."
          />
          <p className="mt-1 text-xs" style={{ color: 'var(--sl-text-muted)' }}>
            Mínimo 10 caracteres si decides incluir una descripción.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            loading={loading}
          >
            Enviar reporte
          </Button>
        </div>
      </form>
    </Modal>
  );
}
