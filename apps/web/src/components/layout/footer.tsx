import Link from 'next/link';
import { Wrench, Mail } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="border-t border-[var(--sl-border)] pt-16 pb-8" style={{ background: 'var(--sl-surface)' }}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          {/* Brand & Info */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 inline-flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--sl-primary)] shadow-sm">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-[-0.03em]" style={{ color: 'var(--sl-text-primary)' }}>
                Servi<span className="text-[var(--sl-primary)]">Local</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--sl-text-secondary)' }}>
              La plataforma líder para encontrar profesionales de confianza en tu zona. Simplificamos la conexión entre talento local y necesidades del hogar.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[var(--sl-text-muted)] hover:text-[var(--sl-primary)] transition-colors">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-[var(--sl-text-muted)] hover:text-[var(--sl-primary)] transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-[var(--sl-text-muted)] hover:text-[var(--sl-primary)] transition-colors">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-[var(--sl-text-muted)] hover:text-[var(--sl-primary)] transition-colors">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--sl-text-primary)' }}>Plataforma</h3>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              <li><Link href="/proveedores" className="hover:text-[var(--sl-primary)] transition-colors">Buscar proveedores</Link></li>
              <li><Link href="/sobre-nosotros" className="hover:text-[var(--sl-primary)] transition-colors">Cómo funciona</Link></li>
              <li><Link href="/registrarse" className="hover:text-[var(--sl-primary)] transition-colors">Únete como profesional</Link></li>
              <li><Link href="/panel/cliente/recompensas" className="hover:text-[var(--sl-primary)] transition-colors">Programa de puntos</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--sl-text-primary)' }}>Soporte</h3>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              <li><Link href="/ayuda" className="hover:text-[var(--sl-primary)] transition-colors">Centro de ayuda</Link></li>
              <li><Link href="/ayuda" className="hover:text-[var(--sl-primary)] transition-colors">Preguntas frecuentes</Link></li>
              <li><Link href="/ayuda" className="hover:text-[var(--sl-primary)] transition-colors">Guías de seguridad</Link></li>
              <li><a href="mailto:soporte@servilocal.com" className="hover:text-[var(--sl-primary)] transition-colors flex items-center gap-2"><Mail className="h-4 w-4"/> Contacto</a></li>
            </ul>
          </div>

          {/* Links 3 */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--sl-text-primary)' }}>Legal</h3>
            <ul className="space-y-3 text-sm" style={{ color: 'var(--sl-text-secondary)' }}>
              <li><Link href="/terminos" className="hover:text-[var(--sl-primary)] transition-colors">Términos de servicio</Link></li>
              <li><Link href="/privacidad" className="hover:text-[var(--sl-primary)] transition-colors">Política de privacidad</Link></li>
              <li><Link href="/cookies" className="hover:text-[var(--sl-primary)] transition-colors">Política de cookies</Link></li>
              <li><Link href="/confianza" className="hover:text-[var(--sl-primary)] transition-colors">Auditoría y confianza</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--sl-border)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm" style={{ color: 'var(--sl-text-muted)' }}>
            © {new Date().getFullYear()} ServiLocal. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm" style={{ color: 'var(--sl-text-muted)' }}>
            <span className="flex items-center gap-1">Hecho con <span className="text-red-500">❤</span> en Perú</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
