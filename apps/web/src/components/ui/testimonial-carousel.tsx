'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

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
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getVisibleIndices().map((index, pos) => {
              const t = testimonials[index];
              return (
                <div
                  key={`${index}-${current}`}
                  className={`sl-card-premium p-8 bg-gradient-to-br ${gradientBgs[index]} sl-animate-carousel-in`}
                  style={{ animationDelay: `${pos * 80}ms` }}
                >
                  {/* Quote icon */}
                  <div className="mb-5">
                    <Quote className="h-8 w-8 text-[var(--sl-primary)] opacity-40" />
                  </div>

                  {/* Content */}
                  <p className="text-sm leading-7 font-medium" style={{ color: 'var(--sl-text-primary)' }}>
                    &ldquo;{t.content}&rdquo;
                  </p>

                  {/* Stars */}
                  <div className="flex gap-1 mt-5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-[var(--sl-border-light)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sl-primary)] text-white font-bold text-sm shadow-sm">
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
