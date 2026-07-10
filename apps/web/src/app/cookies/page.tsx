import type { Metadata } from 'next';
import { StaticContentPage } from '@/components/layout/static-content-page';

export const metadata: Metadata = {
  title: 'Política de cookies | ServiLocal',
  description: 'Uso de cookies en ServiLocal.',
};

export default function CookiesPage() {
  return (
    <StaticContentPage
      title="Política de cookies"
      subtitle="Cookies y almacenamiento local en tu navegador"
    >
      <p>
        ServiLocal utiliza cookies esenciales para mantener tu sesión iniciada, refrescar tokens de
        acceso y proteger formularios con tokens CSRF.
      </p>
      <p>
        También pueden usarse preferencias de interfaz (por ejemplo, tema claro u oscuro) guardadas
        en el navegador.
      </p>
      <p>
        Puedes eliminar las cookies desde la configuración de tu navegador; ten en cuenta que
        deberás volver a iniciar sesión.
      </p>
    </StaticContentPage>
  );
}
