import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

type StaticContentPageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function StaticContentPage({ title, subtitle, children }: StaticContentPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1EA8E7] via-[#1598d0] to-[#0f7fb3] py-16 text-center text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="relative mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-extrabold tracking-[-0.04em] md:text-5xl">{title}</h1>
          {subtitle ? (
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{subtitle}</p>
          ) : null}
        </div>
      </section>
      <section className="mx-auto w-full max-w-3xl px-5 py-16 lg:px-8">
        <div
          className="sl-card space-y-4 p-8 text-sm leading-7"
          style={{ color: 'var(--sl-text-secondary)' }}
        >
          {children}
        </div>
      </section>
      <Footer />
    </div>
  );
}
