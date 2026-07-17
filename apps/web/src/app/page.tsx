'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronRight,
  Clock,
  Droplets,
  Hammer,
  KeyRound,
  Lock,
  MessageSquare,
  Paintbrush,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Trees,
  Users,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { TestimonialCarousel } from '@/components/ui/testimonial-carousel';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
};


const categories = [
  { label: 'Electricidad', icon: Zap, color: '#f59e0b' },
  { label: 'Plomería', icon: Droplets, color: '#3b82f6' },
  { label: 'Limpieza', icon: Sparkles, color: '#8b5cf6' },
  { label: 'Carpintería', icon: Hammer, color: '#f97316' },
  { label: 'Pintura', icon: Paintbrush, color: '#ec4899' },
  { label: 'Jardinería', icon: Trees, color: '#10b981' },
  { label: 'Cerrajería', icon: KeyRound, color: '#6366f1' },
  { label: 'Aire acondicionado', icon: Wind, color: '#06b6d4' },
];

const features = [
  {
    icon: ShieldCheck,
    title: 'Barra de confianza real',
    description: 'Cada usuario tiene un puntaje de 0 a 100 basado en su comportamiento real. No en calificaciones subjetivas.',
  },
  {
    icon: MessageSquare,
    title: 'Negociación directa',
    description: 'Comunícate con el proveedor por mensajería interna. Acuerda condiciones, precio y fecha sin intermediarios.',
  },
  {
    icon: Clock,
    title: 'Solicitudes con tiempo',
    description: 'Si un proveedor no responde en 48 horas, la solicitud expira automáticamente. Tu tiempo vale.',
  },
  {
    icon: Lock,
    title: 'Seguridad completa',
    description: 'Autenticación JWT, protección contra fuerza bruta, auditoría de acciones y control de acceso por roles.',
  },
];

const stats = [
  { value: 12, suffix: '+', label: 'Categorías de servicio' },
  { value: 100, suffix: '%', label: 'Gratis para usar' },
  { value: 48, suffix: 'h', label: 'Tiempo máximo de respuesta' },
  { value: 7, suffix: '', label: 'Estados de solicitud' },
];

const steps = [
  { number: '01', title: 'Regístrate', description: 'Crea tu cuenta gratis como cliente o proveedor.', icon: Users },
  { number: '02', title: 'Busca o publica', description: 'Encuentra proveedores por zona, categoría o nombre.', icon: Search },
  { number: '03', title: 'Negocia directo', description: 'Acuerda condiciones por chat interno y acepta.', icon: MessageSquare },
  { number: '04', title: 'Completa y crece', description: 'Tu confianza y puntos SL crecen con cada trabajo exitoso.', icon: Star },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ─── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1EA8E7] via-[#1598d0] to-[#0d7fb3]">
        {/* Decorative circles and particles */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-[80px]" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-white/10 blur-[60px]" />
        <div className="absolute right-1/4 bottom-10 h-40 w-40 rounded-full bg-white/10 blur-[40px] sl-animate-float" />
        
        {/* Floating particles */}
        <div className="absolute top-20 left-1/4 h-3 w-3 rounded-full bg-white/40 blur-[1px] animate-[sl-particle-drift_10s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 right-1/3 h-4 w-4 rounded-full bg-white/30 blur-[2px] animate-[sl-particle-drift_15s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-1/4 left-1/3 h-2 w-2 rounded-full bg-white/50 animate-[sl-particle-drift_12s_ease-in-out_infinite_4s]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 text-center lg:px-8 lg:pb-28 lg:pt-24">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl"
          >
            <motion.p
              variants={fadeUp} custom={0}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              La plataforma premium de servicios
            </motion.p>

            <motion.h1
              variants={fadeUp} custom={1}
              className="text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] text-white md:text-6xl lg:text-7xl sl-animate-float-3d"
            >
              Encuentra proveedores{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-200 sl-animate-gradient-text drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                de confianza
              </span>
              <br />en tu zona
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={2}
              className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/80 md:text-xl"
            >
              ServiLocal conecta clientes con proveedores verificados. Barra de confianza real,
              negociación directa y un sistema transparente para que contrates sin riesgos.
            </motion.p>

            <motion.div
              variants={fadeUp} custom={3}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/registrarse"
                className="inline-flex h-14 items-center gap-2.5 rounded-2xl bg-white px-8 text-base font-bold text-[var(--sl-primary)] shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:scale-[1.03] active:scale-[0.98]"
              >
                Crear cuenta gratis
                <ArrowRight className="h-5 w-5 sl-animate-wiggle" />
              </Link>
              <Link
                href="/proveedores"
                className="inline-flex h-14 items-center gap-2.5 rounded-2xl border-2 border-white/30 bg-white/5 backdrop-blur-sm px-8 text-base font-bold text-white transition-all hover:bg-white/20 hover:border-white/50 active:scale-[0.98]"
              >
                Explorar proveedores
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp} custom={4}
            initial="hidden" animate="visible"
            className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 backdrop-blur-sm px-4 py-5 text-center">
                <p className="text-3xl font-extrabold text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-xs font-medium text-white/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Categories ─────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.04em] md:text-4xl" style={{ color: 'var(--sl-text-primary)' }}>
            Categorías de servicio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: 'var(--sl-text-secondary)' }}>
            Busca por tipo de servicio y encuentra profesionales especializados.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                href={`/proveedores?category=${(cat.label || '').toUpperCase().replace(/\s/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}
                className="sl-card sl-card-interactive group flex flex-col items-center gap-4 p-6 text-center"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110 group-hover:rotate-3 shadow-sm group-hover:shadow-md"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold transition-colors group-hover:text-[var(--sl-primary)]" style={{ color: 'var(--sl-text-primary)' }}>{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── How it works ────────────────────────────────── */}
      <section className="py-20" style={{ background: 'var(--sl-surface)' }}>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-[-0.04em] md:text-4xl" style={{ color: 'var(--sl-text-primary)' }}>
              ¿Cómo funciona?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: 'var(--sl-text-secondary)' }}>
              Cuatro pasos simples para conectar con el proveedor ideal.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 sl-stagger">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative sl-card sl-card-3d p-8 overflow-hidden group">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--sl-primary)]/5 transition-transform group-hover:scale-150" />
                  <span className="text-5xl font-black text-[var(--sl-primary)]/10 group-hover:text-[var(--sl-primary)]/20 transition-colors">{step.number}</span>
                  <div className="relative mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--sl-primary-light)] text-[var(--sl-primary)] shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="relative mt-5 text-xl font-bold transition-colors group-hover:text-[var(--sl-primary)]" style={{ color: 'var(--sl-text-primary)' }}>{step.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed" style={{ color: 'var(--sl-text-secondary)' }}>{step.description}</p>
                  
                  {/* Connector line for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-[var(--sl-border)] z-10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features ────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.04em] md:text-4xl" style={{ color: 'var(--sl-text-primary)' }}>
            ¿Por qué ServiLocal?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: 'var(--sl-text-secondary)' }}>
            No somos un directorio más. Construimos un ecosistema de confianza.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 sl-stagger">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            // Alternating zigzag layout
            const isEven = idx % 2 === 0;
            return (
              <div key={feature.title} className={`sl-card-premium sl-glass-premium p-8 lg:p-10 flex flex-col justify-center ${isEven ? 'md:translate-y-0' : 'md:translate-y-12'} group relative overflow-hidden`}>
                {/* Decorative background glow on hover */}
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--sl-primary)]/10 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />
                
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--sl-primary)] to-blue-600 text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_20px_rgba(30,168,231,0.4)] relative z-10">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-2xl font-bold relative z-10 transition-colors group-hover:text-[var(--sl-primary)]" style={{ color: 'var(--sl-text-primary)' }}>{feature.title}</h3>
                <p className="mt-4 text-base leading-relaxed relative z-10" style={{ color: 'var(--sl-text-secondary)' }}>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Testimonials Carousel ────────────────────────── */}
      <TestimonialCarousel />

      {/* ─── CTA ─────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-[var(--sl-radius-2xl)] bg-gradient-to-br from-[#1EA8E7] via-[#1598d0] to-[#0d7fb3] p-10 text-center shadow-xl md:p-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-white md:text-4xl">
              ¿Eres proveedor de servicios?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              Crea tu perfil, publica tus servicios y recibe solicitudes de clientes en tu zona.
              Tu confianza crece con cada trabajo.
            </p>
            <Link
              href="/registrarse"
              className="mt-8 inline-flex h-14 items-center gap-2.5 rounded-2xl bg-white px-8 text-base font-bold text-[var(--sl-primary)] shadow-lg transition hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Registrarme como proveedor
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
