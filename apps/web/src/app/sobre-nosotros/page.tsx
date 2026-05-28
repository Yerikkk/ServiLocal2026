import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Lock,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const steps = [
  { number: "01", title: "Regístrate gratis", description: "Crea tu cuenta como cliente o proveedor en menos de un minuto.", icon: Users },
  { number: "02", title: "Busca o publica", description: "Los clientes buscan proveedores. Los proveedores publican servicios y reciben solicitudes.", icon: Search },
  { number: "03", title: "Negocia y acuerda", description: "Comunícate por mensajería interna, acuerda condiciones y fecha sin salir de la plataforma.", icon: MessageSquare },
  { number: "04", title: "Completa y crece", description: "El proveedor ejecuta el servicio. Ambos ganan confianza y puntos SL por cada interacción positiva.", icon: Star },
];

const benefits = {
  clients: [
    "Buscar proveedores por categoría, nombre o zona.",
    "Ver la barra de confianza real de cada proveedor.",
    "Enviar solicitudes con descripción y fecha estimada.",
    "Negociar condiciones por mensajería interna.",
    "Guardar proveedores y servicios en favoritos.",
    "Recibir notificaciones de cada cambio de estado.",
  ],
  providers: [
    "Crear tu perfil profesional completo y verificable.",
    "Publicar, editar y gestionar tus servicios.",
    "Recibir solicitudes directas de clientes en tu zona.",
    "Negociar condiciones directamente por cada solicitud.",
    "Hacer crecer tu barra de confianza con cada trabajo completado.",
    "Ganar puntos SL y posicionarte entre los mejores.",
  ],
};

export default function SobreNosotrosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1EA8E7] via-[#1598d0] to-[#0f7fb3] py-20 text-center text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-white/5" />
        <div className="relative mx-auto max-w-3xl px-6">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Sobre nosotros</p>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-[-0.04em] md:text-5xl">
            ¿Qué es ServiLocal?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/85">
            ServiLocal es una plataforma web diseñada para conectar personas que necesitan un servicio con proveedores locales que lo ofrecen. No es un directorio más: construimos un ecosistema de confianza con historial, reputación basada en comportamiento real y control total de cada interacción.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--sl-text-primary)' }}>¿Cómo funciona?</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 sl-stagger">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="sl-card p-7">
                <span className="text-4xl font-extrabold text-[var(--sl-primary)]/10">{step.number}</span>
                <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sl-primary-light)] text-[var(--sl-primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold" style={{ color: 'var(--sl-text-primary)' }}>{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--sl-text-secondary)' }}>{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security */}
      <section className="py-20" style={{ background: 'var(--sl-surface)' }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--sl-text-primary)' }}>¿Por qué es seguro?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Barra de confianza', desc: 'Cada usuario tiene una puntuación de 0 a 100 basada en su comportamiento real dentro del sistema, no en calificaciones subjetivas.' },
              { icon: Lock, title: 'Seguridad completa', desc: 'Autenticación con JWT, contraseñas hasheadas, protección contra fuerza bruta, auditoría de cada acción y control de acceso por roles.' },
              { icon: BarChart3, title: 'Auditoría total', desc: 'Toda acción relevante queda registrada: login, cambios de estado, modificaciones de perfil, cancelaciones y más.' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="sl-card sl-card-interactive p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sl-primary-light)] text-[var(--sl-primary)]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold" style={{ color: 'var(--sl-text-primary)' }}>{item.title}</h3>
                  <p className="mt-3 text-sm leading-7" style={{ color: 'var(--sl-text-secondary)' }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits by role */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-extrabold tracking-[-0.04em]" style={{ color: 'var(--sl-text-primary)' }}>Beneficios por rol</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="sl-card p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[var(--sl-primary)]">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--sl-text-primary)' }}>Para clientes</h3>
            <ul className="mt-5 space-y-3">
              {benefits.clients.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="sl-card p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[var(--sl-primary)]">
              <Wrench className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--sl-text-primary)' }}>Para proveedores</h3>
            <ul className="mt-5 space-y-3">
              {benefits.providers.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[var(--sl-radius-2xl)] bg-gradient-to-br from-[#1EA8E7] via-[#1598d0] to-[#0d7fb3] p-10 text-center shadow-xl md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-white md:text-4xl">¿Listo para empezar?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">Únete a la comunidad de ServiLocal y conecta con personas de confianza.</p>
            <Link href="/registrarse" className="mt-8 inline-flex h-14 items-center gap-2 rounded-2xl bg-white px-8 text-base font-bold text-[var(--sl-primary)] transition hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
              Crear mi cuenta <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
