'use client';

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

export function ContactSupportForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/support/contact', formData);
      toast.success('Mensaje enviado correctamente. Te responderemos pronto.');
      setFormData({ fullName: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      toast.error(error.message || 'Ocurrió un error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sl-card p-8">
      <h2 className="text-2xl font-bold" style={{ color: 'var(--sl-text-primary)' }}>¿Necesitas más ayuda?</h2>
      <p className="mt-2 text-sm mb-6" style={{ color: 'var(--sl-text-secondary)' }}>Escríbenos usando este formulario y te responderemos lo antes posible.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--sl-text-primary)' }}>Nombre completo</label>
            <input 
              required
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full rounded-xl border bg-[var(--sl-bg)] px-4 py-2 text-[var(--sl-text-primary)] outline-none border-[var(--sl-border)] focus:border-[var(--sl-primary)] focus:ring-1 focus:ring-[var(--sl-primary)]" 
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--sl-text-primary)' }}>Correo electrónico</label>
            <input 
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl border bg-[var(--sl-bg)] px-4 py-2 text-[var(--sl-text-primary)] outline-none border-[var(--sl-border)] focus:border-[var(--sl-primary)] focus:ring-1 focus:ring-[var(--sl-primary)]" 
              placeholder="tu@correo.com"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--sl-text-primary)' }}>Asunto</label>
          <input 
            required
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full rounded-xl border bg-[var(--sl-bg)] px-4 py-2 text-[var(--sl-text-primary)] outline-none border-[var(--sl-border)] focus:border-[var(--sl-primary)] focus:ring-1 focus:ring-[var(--sl-primary)]" 
            placeholder="¿En qué podemos ayudarte?"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--sl-text-primary)' }}>Mensaje</label>
          <textarea 
            required
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border bg-[var(--sl-bg)] px-4 py-3 text-[var(--sl-text-primary)] outline-none border-[var(--sl-border)] focus:border-[var(--sl-primary)] focus:ring-1 focus:ring-[var(--sl-primary)] resize-none" 
            placeholder="Describe tu consulta o problema..."
          />
        </div>
        <div className="flex items-center justify-between pt-2">
          <a href="mailto:soporte@servilocal.pe" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--sl-text-secondary)' }}>
            <Mail className="h-4 w-4" />
            soporte@servilocal.pe
          </a>
          <Button type="submit" loading={loading} icon={<Send className="h-4 w-4" />}>
            Enviar mensaje
          </Button>
        </div>
      </form>
    </div>
  );
}
