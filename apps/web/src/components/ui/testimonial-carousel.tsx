'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { cn } from '@/lib/cn';

type Testimonial = {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    name: 'María González',
    role: 'Cliente frecuente',
    avatar: 'M',
    content: 'ServiLocal me ayudó a encontrar un electricista de confianza en menos de 30 minutos. La barra de confianza me dio seguridad total.',
    rating: 5,
  },
  {
    name: 'Carlos Mendoza',
    role: 'Proveedor verificado',
    avatar: 'C',
    content: 'Desde que me registré como proveedor, recibo solicitudes constantes. El sistema de confianza hace que los clientes confíen más en mí.',
    rating: 5,
  },
  {
    name: 'Ana Lucía Paredes',
    role: 'Cliente',
    avatar: 'A',
    content: 'Me encanta poder negociar directamente con el proveedor por el chat. Todo es transparente y seguro.',
    rating: 4,
  },
  {
    name: 'Roberto Silva',
    role: 'Proveedor de plomería',
    avatar: 'R',
    content: 'Los puntos SL y el sistema de recompensas me motivan a dar un mejor servicio. ¡Mi confianza ya está en 95!',
    rating: 5,
  },
  {
    name: 'Patricia Huamán',
    role: 'Cliente',
    avatar: 'P',
    content: 'Necesitaba urgentemente un cerrajero y en ServiLocal encontré uno verificado en mi zona. Excelente plataforma.',
    rating: 5,
  },
];

const gradientBgs = [
  'from-sky-400/10 to-blue-400/10',
  'from-emerald-400/10 to-teal-400/10',
  'from-violet-400/10 to-purple-400/10',
  'from-amber-400/10 to-orange-400/10',
  'from-rose-400/10 to-pink-400/10',
];

export function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  // Get visible testimonials (show 3 on desktop, with wraparound)
  const getVisibleIndices = () => {
    const indices = [];
    for (let i = 0; i < 3; i++) {
      indices.push((current + i) % testimonials.length);
    }
    return indices;
  };

  return (
    <section className="py-20" style={{ background: 'var(--sl-surface)' }}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.04em] md:text-4xl" style={{ color: 'var(--sl-text-primary)' }}>
            Lo que dicen nuestros usuarios
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: 'var(--sl-text-secondary)' }}>
            Miles de usuarios confían en ServiLocal para sus servicios del hogar.
          </p>
        </div>

        <div
          className="relative overflow-hidden py-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Progress bar */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-1 bg-[var(--sl-border)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-[var(--sl-primary)]"
              style={{ 
                width: isPaused ? '100%' : '100%', 
                animation: isPaused ? 'none' : 'sl-progress-fill 5s linear infinite'
              }}
            />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative perspective-1000">
            {getVisibleIndices().map((index, pos) => {
              const t = testimonials[index];
              const isCenter = pos === 1; // Middle card on desktop
              return (
                <div
                  key={`${index}-${current}`}
                  className={cn(
                    "sl-card-premium p-8 bg-gradient-to-br transition-all duration-700 sl-animate-carousel-in group",
                    gradientBgs[index],
                    isCenter ? "scale-105 z-10 shadow-xl border-[var(--sl-primary)]/30 hover:-translate-y-2" : "scale-95 opacity-80 hover:opacity-100 blur-[1px] hover:blur-none hover:scale-100 hover:-translate-y-1"
                  )}
                  style={{ animationDelay: `${pos * 80}ms` }}
                >
                  {/* Quote icon */}
                  <div className="mb-5 relative">
                    <Quote className="h-10 w-10 text-[var(--sl-primary)] opacity-20 absolute -top-4 -left-2 transition-transform duration-500 group-hover:-translate-y-2 group-hover:opacity-40" />
                    <Quote className="h-6 w-6 text-[var(--sl-primary)] relative z-10 transition-transform duration-500 group-hover:scale-110" />
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-7 font-medium relative z-10" style={{ color: 'var(--sl-text-primary)' }}>
                    &ldquo;{t.content}&rdquo;
                  </p>

                  {/* Stars */}
                  <div className="flex gap-1 mt-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700 dark:fill-slate-700'}`}
                      />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4 mt-6 pt-5 border-t border-[var(--sl-border-light)] transition-colors group-hover:border-[var(--sl-primary)]/20">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--sl-primary)] to-blue-600 text-white font-bold text-lg shadow-md ring-2 ring-white dark:ring-slate-800 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--sl-text-primary)' }}>{t.name}</p>
                      <p className="text-xs" style={{ color: 'var(--sl-text-secondary)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sl-surface)] border border-[var(--sl-border)] text-[var(--sl-text-secondary)] hover:bg-[var(--sl-primary-muted)] hover:text-[var(--sl-primary)] transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`sl-carousel-dot transition-all ${i === current ? 'sl-carousel-dot-active' : ''}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sl-surface)] border border-[var(--sl-border)] text-[var(--sl-text-secondary)] hover:bg-[var(--sl-primary-muted)] hover:text-[var(--sl-primary)] transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
