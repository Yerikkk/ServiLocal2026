'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { CalendarDays, MapPin, MessageSquare, SendHorizontal, Wrench } from 'lucide-react';
import { api, type ApiError } from '@/lib/api-client';

type Props = {
  providerId: string;
  providerName: string;
  defaultServiceName: string;
  defaultZone: string;
};

export function RequestServiceForm({
  providerId,
  providerName,
  defaultServiceName,
  defaultZone,
}: Props) {
  const router = useRouter();

  const [serviceTitle, setServiceTitle] = useState(defaultServiceName);
  const [serviceZone, setServiceZone] = useState(defaultZone);
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback('');

    if (!serviceTitle.trim() || !serviceZone.trim() || message.trim().length < 10) {
      setFeedbackType('error');
      setFeedback('Completa el servicio, la zona y un mensaje de al menos 10 caracteres.');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/api/service-requests', {
        providerId,
        serviceTitle: serviceTitle.trim(),
        serviceZone: serviceZone.trim(),
        message: message.trim(),
        preferredDate: preferredDate || undefined,
      });

      setFeedbackType('success');
      setFeedback('Solicitud enviada correctamente. Ya puedes verla en tu panel de cliente.');
      setMessage('');
      setPreferredDate('');
    } catch (err) {
      const apiErr = err as ApiError;
      setFeedbackType('error');
      if (apiErr.status === 403) {
        setFeedback('Solo una cuenta cliente puede enviar solicitudes.');
      } else {
        setFeedback(apiErr.message ?? 'No se pudo enviar la solicitud');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-950">
          Solicitar servicio
        </h2>
        <p className="mt-3 leading-8 text-slate-600">
          Envía una solicitud directa a <strong>{providerName}</strong> con el servicio
          que necesitas y una breve descripción.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <InputField
          label="Servicio solicitado"
          icon={<Wrench className="h-5 w-5" />}
          value={serviceTitle}
          onChange={setServiceTitle}
          placeholder="Ej. Instalación eléctrica"
        />

        <InputField
          label="Zona del servicio"
          icon={<MapPin className="h-5 w-5" />}
          value={serviceZone}
          onChange={setServiceZone}
          placeholder="Ej. Talara Alta"
        />

        <InputField
          label="Fecha tentativa"
          icon={<CalendarDays className="h-5 w-5" />}
          value={preferredDate}
          onChange={setPreferredDate}
          placeholder=""
          type="date"
        />

        <div>
          <label className="mb-2 block text-[1rem] font-semibold text-slate-900">
            Mensaje
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-5 top-5 text-slate-400">
              <MessageSquare className="h-5 w-5" />
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe lo que necesitas, el lugar y cualquier detalle importante."
              className="min-h-[130px] w-full rounded-[20px] border border-slate-200 bg-white pl-14 pr-5 pt-4 text-[1rem] text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#1EA8E7] focus:ring-4 focus:ring-[#1EA8E7]/10"
            />
          </div>
        </div>

        {feedback ? (
          <div
            className={
              feedbackType === 'error'
                ? 'rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
                : 'rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'
            }
          >
            {feedback}
            {feedbackType === 'success' ? (
              <div className="mt-2">
                <Link
                  href="/panel/cliente/solicitudes"
                  className="font-semibold text-emerald-800 underline"
                >
                  Ir a mis solicitudes
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-[58px] items-center justify-center gap-3 rounded-[20px] bg-[#1EA8E7] px-6 text-base font-semibold text-white transition hover:bg-[#1198cf] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <SendHorizontal className="h-5 w-5" />
          {submitting ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
    </section>
  );
}

function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[1rem] font-semibold text-slate-900">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-[58px] w-full rounded-[20px] border border-slate-200 bg-white pl-14 pr-5 text-[1rem] text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#1EA8E7] focus:ring-4 focus:ring-[#1EA8E7]/10"
        />
      </div>
    </div>
  );
}