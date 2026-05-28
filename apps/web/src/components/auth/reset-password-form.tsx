'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthPasswordInput } from './auth-password-input';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type FeedbackType = 'info' | 'error' | 'success';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<FeedbackType>('info');
  const [loading, setLoading] = useState(false);

  function getErrorMessage(data: unknown) {
    if (!data || typeof data !== 'object') {
      return 'No se pudo restablecer la contraseña';
    }

    const maybeMessage = (data as { message?: unknown }).message;

    if (Array.isArray(maybeMessage)) {
      return maybeMessage.join(', ');
    }

    if (typeof maybeMessage === 'string') {
      return maybeMessage;
    }

    return 'No se pudo restablecer la contraseña';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setMessageType('error');
      setMessage('El enlace de recuperación es inválido.');
      return;
    }

    if (password.length < 8) {
      setMessageType('error');
      setMessage('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setMessageType('error');
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setMessageType('success');
      setMessage('Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...');

      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        window.location.href = '/iniciar-sesion';
      }, 1200);
    } catch (error) {
      setMessageType('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo restablecer la contraseña',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 22 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Link
        href="/iniciar-sesion"
        className="mb-8 inline-flex items-center gap-2 text-[0.98rem] text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio de sesión
      </Link>

      <div className="mb-10">
        <h2 className="max-w-[420px] text-[3rem] font-extrabold leading-[0.96] tracking-[-0.05em] text-slate-950 md:text-[3.35rem]">
          Restablece tu contraseña
        </h2>
        <p className="mt-4 text-[1.04rem] leading-8 text-slate-500">
          Escribe una nueva contraseña segura para tu cuenta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <label
            htmlFor="password"
            className="mb-3 block text-[1rem] font-semibold text-slate-900"
          >
            Nueva contraseña
          </label>

          <AuthPasswordInput
            id="password"
            name="password"
            value={password}
            onChange={setPassword}
            placeholder="********"
            autoComplete="new-password"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35 }}
        >
          <label
            htmlFor="confirmPassword"
            className="mb-3 block text-[1rem] font-semibold text-slate-900"
          >
            Confirmar contraseña
          </label>

          <AuthPasswordInput
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="********"
            autoComplete="new-password"
          />
        </motion.div>

        {message ? (
          <div
            className={
              messageType === 'error'
                ? 'rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
                : messageType === 'success'
                  ? 'rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'
                  : 'rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700'
            }
          >
            {message}
          </div>
        ) : null}

        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="flex h-[62px] w-full items-center justify-center rounded-[22px] bg-[#1EA8E7] text-[1.12rem] font-semibold text-white transition hover:bg-[#1099d1] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </motion.button>
      </form>
    </motion.div>
  );
}