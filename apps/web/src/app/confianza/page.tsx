import type { Metadata } from 'next';
import Link from 'next/link';
import { StaticContentPage } from '@/components/layout/static-content-page';

export const metadata: Metadata = {
  title: 'Auditoría y confianza | ServiLocal',
  description: 'Cómo funciona la barra de confianza y la auditoría en ServiLocal.',
};

export default function ConfianzaPage() {
  return (
    <StaticContentPage
      title="Auditoría y confianza"
      subtitle="Transparencia, reputación y trazabilidad"
    >
      <p>
        La barra de confianza (0–100) refleja el comportamiento real en la plataforma: solicitudes
        completadas, tiempos de respuesta, cancelaciones y eventos positivos o negativos registrados
        automáticamente.
      </p>
      <p>
        Los puntos SL recompensan la participación activa y el buen desempeño. No sustituyen la
        confianza, pero ayudan a identificar usuarios comprometidos.
      </p>
      <p>
        Las acciones sensibles (inicio de sesión, cambios de estado, reportes) pueden quedar
        registradas en el log de auditoría para revisión por administradores.
      </p>
      <p>
        Si detectas un comportamiento inadecuado, puedes reportar a un usuario desde su perfil o
        desde una solicitud activa.
      </p>
      <p>
        <Link href="/ayuda" className="font-semibold text-[var(--sl-primary)] hover:underline">
          Ir al centro de ayuda
        </Link>
      </p>
    </StaticContentPage>
  );
}
