'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { AuthInput } from './auth-input';
import { AuthPasswordInput } from './auth-password-input';
import { AuthSocialButton } from './auth-social-button';
import { apiUrl } from '@/lib/api-url';
import { redirectAfterLogin, type AuthUser } from '@/lib/auth-session';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDisabled = useMemo(() => {
    return loading || !email.trim() || !password.trim();
  }, [email, password, loading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? 'No se pudo iniciar sesión');
      }

      const user = data?.user as AuthUser | undefined;
      if (user?.role) {
        redirectAfterLogin(user);
        return;
      }

      window.location.replace('/panel');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ocurrió un error inesperado';
      setError(message);
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 22 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mb-10">
        <h2 className="max-w-[380px] text-[3rem] font-extrabold leading-[0.96] tracking-[-0.05em] md:text-[3.35rem]" style={{ color: 'var(--sl-text-primary)' }}>
          Bienvenido de nuevo
        </h2>
        <p className="mt-5 text-[1.04rem] leading-8" style={{ color: 'var(--sl-text-secondary)' }}>
          Ingresa tus credenciales para acceder a tu cuenta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <label
            htmlFor="email"
            className="mb-3 block text-[1rem] font-semibold" style={{ color: 'var(--sl-text-primary)' }}
          >
            Correo electrónico
          </label>
          <AuthInput
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@gmail.com"
          icon={<Mail className="h-5 w-5" />}
          autoComplete="off"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.35 }}
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <label
              htmlFor="password"
              className="text-[1rem] font-semibold text-slate-900"
            >
              Contraseña
            </label>

            <Link
              href="/recuperar-contrasena"
              className="text-[0.95rem] font-medium text-[#19A7E0] transition hover:text-[#0f94ca]"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

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
          transition={{ delay: 0.2, duration: 0.35 }}
          className="flex items-center gap-3"
        >
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-[#19A7E0] focus:ring-[#19A7E0]"
          />
          <label htmlFor="remember" className="text-[1rem]" style={{ color: 'var(--sl-text-secondary)' }}>
            Recordarme
          </label>
        </motion.div>

        {error ? (
          <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.35 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={isDisabled}
          className="flex h-[62px] w-full items-center justify-center rounded-[22px] bg-[#1EA8E7] text-[1.12rem] font-semibold text-white transition hover:bg-[#1099d1] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.35 }}
          className="flex items-center gap-4 py-1"
        >
          <div className="h-px flex-1" style={{ background: 'var(--sl-border)' }} />
          <span className="text-[0.78rem] font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--sl-text-muted)' }}>
            O CONTINUA CON
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--sl-border)' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.35 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <AuthSocialButton 
            icon={<FcGoogle size={20} />}
            onClick={() => setError('El inicio de sesión con Google requiere configuración de API Keys para producción. ¡Próximamente!')}
          >
            Google
          </AuthSocialButton>

          <AuthSocialButton
            icon={<FaFacebookF size={18} className="text-[#1877F2]" />}
            onClick={() => setError('El inicio de sesión con Facebook requiere configuración de API Keys para producción. ¡Próximamente!')}
          >
            Facebook
          </AuthSocialButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.35 }}
          className="pt-3 text-center text-[1rem]" style={{ color: 'var(--sl-text-secondary)' }}
        >
          ¿No tienes una cuenta?{' '}
          <Link
            href="/registrarse"
            className="font-semibold text-[#19A7E0] transition hover:text-[#0f94ca]"
          >
            Regístrate
          </Link>
        </motion.p>
      </form>
    </motion.div>
  );
}
