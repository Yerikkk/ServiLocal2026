import Link from 'next/link';
import Image from 'next/image';
import { Wrench, Mail } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--sl-border)] pt-16 pb-8 overflow-hidden" style={{ background: 'var(--sl-surface)' }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--sl-text-primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-[var(--sl-primary)] to-transparent opacity-50" />
      
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          {/* Brand & Info */}
          <div className="md:col-span-1 sl-animate-slide-up" style={{ animationDelay: '0ms' }}>
            <Link href="/" className="flex items-center gap-2.5 mb-4 inline-flex group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 overflow-hidden">
                <Image src="/images/logo.png" alt="ServiLocal Logo" fill className="object-cover p-1" />
              </div>
              <span className="text-xl font-bold tracking-[-0.03em] transition-colors group-hover:text-[var(--sl-primary)]" style={{ color: 'var(--sl-text-primary)' }}>
                Servi<span className="text-[var(--sl-primary)]">Local</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--sl-text-secondary)' }}>
              La plataforma líder para encontrar profesionales de confianza en tu zona. Simplificamos la conexión entre talento local y necesidades del hogar.
            </p>
            <div className="flex gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sl-primary-muted)] text-[var(--sl-primary)] hover:bg-[var(--sl-primary)] hover:text-white hover:scale-110 hover:-translate-y-1 transition-all">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sl-primary-muted)] text-[var(--sl-primary)] hover:bg-[var(--sl-primary)] hover:text-white hover:scale-110 hover:-translate-y-1 transition-all">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sl-primary-muted)] text-[var(--sl-primary)] hover:bg-[var(--sl-primary)] hover:text-white hover:scale-110 hover:-translate-y-1 transition-all">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sl-primary-muted)] text-[var(--sl-primary)] hover:bg-[var(--sl-primary)] hover:text-white hover:scale-110 hover:-translate-y-1 transition-all">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div className="sl-animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--sl-text-primary)' }}>Plataforma</h3>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              <li><Link href="/servicios" className="hover:text-[var(--sl-primary)] hover:translate-x-1 inline-block transition-all">Catálogo de servicios</Link></li>
              <li><Link href="/proveedores" className="hover:text-[var(--sl-primary)] hover:translate-x-1 inline-block transition-all">Buscar proveedores</Link></li>
              <li><Link href="/sobre-nosotros" className="hover:text-[var(--sl-primary)] hover:translate-x-1 inline-block transition-all">Cómo funciona</Link></li>
              <li><Link href="/registrarse" className="hover:text-[var(--sl-primary)] hover:translate-x-1 inline-block transition-all">Únete como profesional</Link></li>
              <li><Link href="/panel/cliente/recompensas" className="hover:text-[var(--sl-primary)] hover:translate-x-1 inline-block transition-all">Programa de puntos</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="sl-animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--sl-text-primary)' }}>Soporte</h3>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              <li><Link href="/ayuda" className="hover:text-[var(--sl-primary)] transition-colors flex items-center gap-2 group"><span className="w-0 overflow-hidden group-hover:w-2 transition-all">&rarr;</span> Centro de ayuda</Link></li>
              <li><Link href="/ayuda" className="hover:text-[var(--sl-primary)] transition-colors flex items-center gap-2 group"><span className="w-0 overflow-hidden group-hover:w-2 transition-all">&rarr;</span> Preguntas frecuentes</Link></li>
              <li><Link href="/ayuda" className="hover:text-[var(--sl-primary)] transition-colors flex items-center gap-2 group"><span className="w-0 overflow-hidden group-hover:w-2 transition-all">&rarr;</span> Guías de seguridad</Link></li>
              <li><a href="mailto:soporte@servilocal.com" className="hover:text-[var(--sl-primary)] transition-colors flex items-center gap-2"><Mail className="h-4 w-4"/> Contacto</a></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div className="sl-animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--sl-text-primary)' }}>Legal</h3>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              <li><Link href="/terminos" className="hover:text-[var(--sl-primary)] hover:translate-x-1 inline-block transition-all">Términos de servicio</Link></li>
              <li><Link href="/privacidad" className="hover:text-[var(--sl-primary)] hover:translate-x-1 inline-block transition-all">Política de privacidad</Link></li>
              <li><Link href="/cookies" className="hover:text-[var(--sl-primary)] hover:translate-x-1 inline-block transition-all">Política de cookies</Link></li>
              <li><Link href="/confianza" className="hover:text-[var(--sl-primary)] hover:translate-x-1 inline-block transition-all">Auditoría y confianza</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 relative flex flex-col md:flex-row justify-center items-center gap-4 sl-animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--sl-border)] to-transparent" />
          <p className="text-sm text-center" style={{ color: 'var(--sl-text-muted)' }}>
            © {new Date().getFullYear()} ServiLocal. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
