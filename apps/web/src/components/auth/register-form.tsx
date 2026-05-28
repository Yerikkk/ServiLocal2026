'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useState, type FormEvent, type ReactNode } from 'react';
import {
  Briefcase,
  Building2,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { AuthInput } from './auth-input';
import { AuthPasswordInput } from './auth-password-input';
import { AuthSocialButton } from './auth-social-button';

type RegisterRole = 'CLIENT' | 'PROVIDER';
type FeedbackType = 'error' | 'info' | 'success';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

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

export function RegisterForm() {
  const [role, setRole] = useState<RegisterRole>('CLIENT');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [ruc, setRuc] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [serviceZone, setServiceZone] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('info');
  const [loading, setLoading] = useState(false);

  const isOtherService = category === 'OTHER';

  const selectClassName =
    'h-[62px] w-full rounded-[22px] border border-slate-200 bg-white px-5 text-[1.02rem] text-slate-900 outline-none transition-all duration-200 focus:border-[#1EA8E7] focus:ring-4 focus:ring-[#1EA8E7]/10';

  const textareaClassName =
    'min-h-[130px] w-full rounded-[22px] border border-slate-200 bg-white px-5 py-4 text-[1.02rem] text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#1EA8E7] focus:ring-4 focus:ring-[#1EA8E7]/10';

  function resetProviderOnlyFields() {
    setRuc('');
    setBusinessName('');
    setCategory('');
    setCustomServiceName('');
    setSpecialty('');
    setServiceZone('');
    setDescription('');
  }

  function handleRoleChange(nextRole: RegisterRole) {
    setRole(nextRole);
    setFeedback('');
    setFeedbackType('info');

    if (nextRole === 'CLIENT') {
      resetProviderOnlyFields();
    } else {
      setDocumentNumber('');
    }
  }

  function getErrorMessage(data: unknown) {
    if (!data || typeof data !== 'object') {
      return 'No se pudo completar el registro';
    }

    const maybeMessage = (data as { message?: unknown }).message;

    if (Array.isArray(maybeMessage)) {
      return maybeMessage.join(', ');
    }

    if (typeof maybeMessage === 'string') {
      return maybeMessage;
    }

    return 'No se pudo completar el registro';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback('');

    if (!acceptTerms) {
      setFeedbackType('error');
      setFeedback('Debes aceptar los términos para continuar.');
      return;
    }

    if (password.length < 8) {
      setFeedbackType('error');
      setFeedback('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setFeedbackType('error');
      setFeedback('Las contraseñas no coinciden.');
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setFeedbackType('error');
      setFeedback('Completa los campos principales para continuar.');
      return;
    }

    if (role === 'PROVIDER') {
      if (!ruc.trim()) {
        setFeedbackType('error');
        setFeedback('Para ofrecer servicios, el RUC es obligatorio.');
        return;
      }

      if (!businessName.trim() || !category || !serviceZone || !description.trim()) {
        setFeedbackType('error');
        setFeedback(
          'Completa los datos del negocio, categoría, zona y descripción del servicio.',
        );
        return;
      }

      if (isOtherService && !customServiceName.trim()) {
        setFeedbackType('error');
        setFeedback('Debes indicar el nombre del servicio personalizado.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload =
        role === 'CLIENT'
          ? {
              accountType: 'CLIENT',
              fullName: fullName.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim(),
              documentNumber: documentNumber.trim() || undefined,
              password,
              confirmPassword,
            }
          : {
              accountType: 'PROVIDER',
              fullName: fullName.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim(),
              ruc: ruc.trim(),
              businessName: businessName.trim(),
              category,
              customServiceName: isOtherService
                ? customServiceName.trim()
                : undefined,
              specialty: specialty.trim() || undefined,
              serviceZone,
              description: description.trim(),
              password,
              confirmPassword,
            };

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      setFeedbackType('success');
      setFeedback('Cuenta creada correctamente. Redirigiendo al inicio de sesión...');

      setFullName('');
      setEmail('');
      setPhone('');
      setDocumentNumber('');
      setRuc('');
      setBusinessName('');
      setCategory('');
      setCustomServiceName('');
      setSpecialty('');
      setServiceZone('');
      setDescription('');
      setPassword('');
      setConfirmPassword('');
      setAcceptTerms(false);

      setTimeout(() => {
        window.location.href = '/iniciar-sesion';
      }, 1200);
    } catch (error) {
      setFeedbackType('error');
      setFeedback(
        error instanceof Error ? error.message : 'No se pudo completar el registro',
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
      <div className="mb-8">
        <h2 className="max-w-[380px] text-[3rem] font-extrabold leading-[0.96] tracking-[-0.05em] text-slate-950 md:text-[3.35rem]">
          Crea tu cuenta
        </h2>
        <p className="mt-4 text-[1.04rem] leading-8 text-slate-500">
          Únete a la comunidad de ServiLocal
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <RoleCard
            active={role === 'CLIENT'}
            title="Busco Servicios"
            subtitle="Encuentra proveedores"
            icon={<Users className="h-6 w-6" />}
            onClick={() => handleRoleChange('CLIENT')}
          />

          <RoleCard
            active={role === 'PROVIDER'}
            title="Ofrezco Servicios"
            subtitle="Haz crecer tu negocio"
            icon={<Briefcase className="h-6 w-6" />}
            onClick={() => handleRoleChange('PROVIDER')}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35 }}
        >
          <label
            htmlFor="fullName"
            className="mb-3 block text-[1rem] font-semibold text-slate-900"
          >
            {role === 'PROVIDER' ? 'Nombre del responsable' : 'Nombre completo'}
          </label>
          <AuthInput
            id="fullName"
            name="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ingresa tu nombre completo"
            icon={<User className="h-5 w-5" />}
            autoComplete="off"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35 }}
        >
          <label
            htmlFor="email"
            className="mb-3 block text-[1rem] font-semibold text-slate-900"
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
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <label
            htmlFor="phone"
            className="mb-3 block text-[1rem] font-semibold text-slate-900"
          >
            Teléfono / WhatsApp
          </label>
          <AuthInput
            id="phone"
            name="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="999888777"
            icon={<Phone className="h-5 w-5" />}
            autoComplete="off"
          />
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {role === 'CLIENT' ? (
            <motion.div
              key="client-fields"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="documentNumber"
                  className="mb-3 block text-[1rem] font-semibold text-slate-900"
                >
                  Documento (DNI o RUC){' '}
                  <span className="font-normal text-slate-400">opcional</span>
                </label>
                <AuthInput
                  id="documentNumber"
                  name="documentNumber"
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej. 12345678 o 20123456789"
                  icon={<FileText className="h-5 w-5" />}
                  autoComplete="off"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="provider-fields"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5 rounded-[26px] border border-sky-100 bg-sky-50/45 p-5"
            >
              <div className="mb-1">
                <p className="text-[0.9rem] font-semibold uppercase tracking-[0.18em] text-sky-600">
                  Datos del proveedor
                </p>
                <p className="mt-2 text-[0.98rem] leading-7 text-slate-500">
                  Completa esta información para crear un perfil profesional más confiable.
                </p>
              </div>

              <div>
                <label
                  htmlFor="ruc"
                  className="mb-3 block text-[1rem] font-semibold text-slate-900"
                >
                  RUC
                </label>
                <AuthInput
                  id="ruc"
                  name="ruc"
                  type="text"
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value)}
                  placeholder="20123456789"
                  icon={<FileText className="h-5 w-5" />}
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="businessName"
                  className="mb-3 block text-[1rem] font-semibold text-slate-900"
                >
                  Nombre comercial o razón social
                </label>
                <AuthInput
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ingresa el nombre de tu negocio"
                  icon={<Building2 className="h-5 w-5" />}
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-3 block text-[1rem] font-semibold text-slate-900"
                >
                  Categoría principal
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Wrench className="h-5 w-5" />
                  </span>
                  <select
                    id="category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${selectClassName} pl-14`}
                  >
                    <option value="">Selecciona una categoría</option>
                    {serviceCategories.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isOtherService ? (
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5 rounded-[22px] border border-dashed border-sky-200 bg-white/80 p-4"
                  >
                    <div>
                      <label
                        htmlFor="customServiceName"
                        className="mb-3 block text-[1rem] font-semibold text-slate-900"
                      >
                        Nombre del servicio
                      </label>
                      <AuthInput
                        id="customServiceName"
                        name="customServiceName"
                        type="text"
                        value={customServiceName}
                        onChange={(e) => setCustomServiceName(e.target.value)}
                        placeholder="Ej. Soldadura"
                        icon={<Wrench className="h-5 w-5" />}
                        autoComplete="off"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="specialty"
                        className="mb-3 block text-[1rem] font-semibold text-slate-900"
                      >
                        Especialidad o subcategoría{' '}
                        <span className="font-normal text-slate-400">opcional</span>
                      </label>
                      <AuthInput
                        id="specialty"
                        name="specialty"
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        placeholder="Ej. Rejas, estructuras metálicas, puertas"
                        icon={<FileText className="h-5 w-5" />}
                        autoComplete="off"
                      />
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div>
                <label
                  htmlFor="serviceZone"
                  className="mb-3 block text-[1rem] font-semibold text-slate-900"
                >
                  Zona de atención
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <select
                    id="serviceZone"
                    name="serviceZone"
                    value={serviceZone}
                    onChange={(e) => setServiceZone(e.target.value)}
                    className={`${selectClassName} pl-14`}
                  >
                    <option value="">Selecciona tu zona principal</option>
                    {serviceZones.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-3 block text-[1rem] font-semibold text-slate-900"
                >
                  Descripción corta del servicio
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isOtherService
                      ? 'Ej. Fabricación y reparación de rejas, puertas metálicas y estructuras.'
                      : 'Ej. Especialista en instalaciones eléctricas residenciales y mantenimiento preventivo.'
                  }
                  className={textareaClassName}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.35 }}
        >
          <label
            htmlFor="password"
            className="mb-3 block text-[1rem] font-semibold text-slate-900"
          >
            Contraseña
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
          transition={{ delay: 0.28, duration: 0.35 }}
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

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.35 }}
          className="flex items-start gap-3"
        >
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-[#19A7E0] focus:ring-[#19A7E0]"
          />
          <label htmlFor="terms" className="text-[0.98rem] leading-7 text-slate-600">
            Acepto los{' '}
            <span className="font-medium text-[#19A7E0]">Términos de Servicio</span>{' '}
            y la{' '}
            <span className="font-medium text-[#19A7E0]">Política de Privacidad</span>
          </label>
        </motion.div>

        {feedback ? (
          <div
            className={
              feedbackType === 'error'
                ? 'rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
                : feedbackType === 'success'
                  ? 'rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'
                  : 'rounded-[20px] border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700'
            }
          >
            {feedback}
          </div>
        ) : null}

        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.35 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="flex h-[62px] w-full items-center justify-center rounded-[22px] bg-[#1EA8E7] text-[1.12rem] font-semibold text-white transition hover:bg-[#1099d1] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="flex items-center gap-4 py-1"
        >
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-slate-400">
            O REGÍSTRATE CON
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.35 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <AuthSocialButton icon={<FcGoogle size={20} />}>
            Google
          </AuthSocialButton>

          <AuthSocialButton
            icon={<FaFacebookF size={18} className="text-[#1877F2]" />}
          >
            Facebook
          </AuthSocialButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.35 }}
          className="pt-2 text-center text-[1rem] text-slate-500"
        >
          Ya tienes una cuenta?{' '}
          <Link
            href="/iniciar-sesion"
            className="font-semibold text-[#19A7E0] transition hover:text-[#0f94ca]"
          >
            Inicia Sesión
          </Link>
        </motion.p>
      </form>
    </motion.div>
  );
}

function RoleCard({
  active,
  title,
  subtitle,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-[24px] border px-5 py-6 text-left transition-all duration-300',
        active
          ? 'border-[#6cc8ef] bg-[#eef8fd] shadow-[0_10px_24px_rgba(30,168,231,0.08)]'
          : 'border-slate-200 bg-white hover:border-slate-300',
      ].join(' ')}
    >
      <div
        className={[
          'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl',
          active ? 'bg-[#d9f1fb] text-[#19A7E0]' : 'bg-slate-100 text-slate-500',
        ].join(' ')}
      >
        {icon}
      </div>

      <div className="text-[1.4rem] font-semibold tracking-[-0.03em] text-slate-950">
        {title}
      </div>
      <div className="mt-2 text-[0.97rem] text-slate-500">{subtitle}</div>
    </button>
  );
}