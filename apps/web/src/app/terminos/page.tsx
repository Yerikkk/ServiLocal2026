import type { Metadata } from 'next';
import { StaticContentPage } from '@/components/layout/static-content-page';

export const metadata: Metadata = {
  title: 'Términos de servicio | ServiLocal',
  description: 'Condiciones de uso de la plataforma ServiLocal.',
};

export default function TerminosPage() {
  return (
    <StaticContentPage
      title="Términos de servicio"
      subtitle="Condiciones generales de uso de ServiLocal"
    >
      <p>
        ServiLocal es una plataforma que conecta clientes con proveedores de servicios locales.
        Al registrarte aceptas utilizar la plataforma de forma responsable y veraz.
      </p>
      <p>
        Los precios mostrados son referenciales; el acuerdo final se establece entre cliente y
        proveedor mediante la negociación en cada solicitud.
      </p>
      <p>
        ServiLocal puede suspender cuentas que incumplan las normas de convivencia, generen
        reportes fundados o afecten la confianza de la comunidad.
      </p>
      <p className="text-xs" style={{ color: 'var(--sl-text-muted)' }}>
        Documento informativo para la versión actual del sistema. El texto legal definitivo puede
        actualizarse antes del lanzamiento público.
      </p>
    </StaticContentPage>
  );
}
