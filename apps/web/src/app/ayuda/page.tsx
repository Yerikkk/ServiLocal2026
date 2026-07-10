import {
  ChevronDown,
  HelpCircle,
  Mail,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ContactSupportForm } from "@/components/support/contact-support-form";

const faqClients = [
  { q: "¿Cómo solicito un servicio?", a: "Busca un proveedor en el directorio, revisa su perfil y barra de confianza, y envía una solicitud con la descripción del trabajo y fecha estimada." },
  { q: "¿Puedo cancelar una solicitud?", a: "Sí. Puedes cancelar una solicitud mientras esté en estado Pendiente o En negociación. Una vez aceptada, solo el proveedor puede gestionar cambios." },
  { q: "¿Qué es la barra de confianza?", a: "Es una puntuación de 0 a 100 que refleja el comportamiento real del usuario: solicitudes completadas, tiempos de respuesta, cancelaciones, etc." },
  { q: "¿Qué son los puntos SL?", a: "Son puntos de recompensa que ganas por actividad positiva: completar servicios, responder rápido, mantener alta confianza. Indican tu nivel de participación." },
  { q: "¿Puedo guardar proveedores favoritos?", a: "Sí. Desde cualquier perfil de proveedor o servicio puedes marcarlo como favorito para acceder rápidamente desde tu panel." },
];

const faqProviders = [
  { q: "¿Cómo publico mis servicios?", a: "Desde tu panel de proveedor puedes crear servicios indicando categoría, nombre, descripción, precio referencial y tiempo estimado." },
  { q: "¿Qué pasa si no respondo una solicitud?", a: "Si no respondes en 48 horas, la solicitud pasa automáticamente a estado Expirada y tu barra de confianza baja −8 puntos." },
  { q: "¿Cómo mejoro mi confianza?", a: "Completando solicitudes (+8), respondiendo rápido (+3), manteniéndote activo (+2) y evitando cancelaciones injustificadas." },
  { q: "¿Qué significa estar verificado?", a: "El administrador de ServiLocal valida tu identidad y datos profesionales. Los proveedores verificados aparecen primero en las búsquedas." },
];

const faqGeneral = [
  { q: "¿Es gratis usar ServiLocal?", a: "Sí. Crear tu cuenta, buscar proveedores, enviar solicitudes y comunicarte por mensajería es completamente gratuito." },
  { q: "¿Mis datos están seguros?", a: "Sí. Usamos autenticación JWT, contraseñas hasheadas, protección contra fuerza bruta y toda acción queda registrada en auditoría." },
  { q: "¿Cómo contacto al soporte?", a: "Puedes escribirnos a soporte@servilocal.pe o usar el formulario de contacto en esta misma página." },
];

function FaqSection({ title, items }: { title: string; items: { q: string; a: string }[] }) {
  return (
    <div>
      <h3 className="mb-5 text-xl font-bold" style={{ color: 'var(--sl-text-primary)' }}>{title}</h3>
      <div className="space-y-3 sl-stagger">
        {items.map((item) => (
          <details key={item.q} className="group sl-card overflow-hidden">
            <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-sm font-semibold transition hover:bg-[var(--sl-primary-muted)]" style={{ color: 'var(--sl-text-primary)' }}>
              {item.q}
              <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" style={{ color: 'var(--sl-text-muted)' }} />
            </summary>
            <div className="border-t border-[var(--sl-border-light)] px-6 py-4 text-sm leading-7" style={{ color: 'var(--sl-text-secondary)' }}>
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

export default function AyudaPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1EA8E7] via-[#1598d0] to-[#0f7fb3] py-16 text-center text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="mx-auto max-w-3xl px-6 relative">
          <HelpCircle className="mx-auto mb-4 h-12 w-12 text-white/60" />
          <h1 className="text-4xl font-extrabold tracking-[-0.04em] md:text-5xl">Centro de ayuda</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">Preguntas frecuentes, guía de uso y contacto de soporte.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-4xl space-y-10 px-5 py-20 lg:px-8">
        <FaqSection title="Para clientes" items={faqClients} />
        <FaqSection title="Para proveedores" items={faqProviders} />
        <FaqSection title="General" items={faqGeneral} />
      </section>

      {/* Contact */}
      <section className="mx-auto w-full max-w-4xl px-5 pb-20 lg:px-8">
        <ContactSupportForm />
      </section>

      <Footer />
    </div>
  );
}
