import type { Metadata } from 'next';
import { StaticContentPage } from '@/components/layout/static-content-page';

export const metadata: Metadata = {
  title: 'Política de privacidad | ServiLocal',
  description: 'Cómo ServiLocal trata tus datos personales.',
};

export default function PrivacidadPage() {
  return (
    <StaticContentPage
      title="Política de privacidad"
      subtitle="Tratamiento de datos personales en ServiLocal"
    >
      <p>
        Recopilamos datos necesarios para operar la cuenta: nombre, correo, teléfono opcional y, en
        el caso de proveedores, información profesional como RUC, zona de servicio y descripción.
      </p>
      <p>
        Las contraseñas se almacenan de forma segura (hash). Las sesiones usan tokens con cookies
        HttpOnly y protección CSRF en operaciones sensibles.
      </p>
      <p>
        No vendemos tus datos a terceros. Las acciones relevantes quedan registradas en auditoría
        para seguridad y soporte.
      </p>
      <p>
        Puedes solicitar corrección de datos desde tu perfil o escribiendo a soporte@servilocal.pe.
      </p>
    </StaticContentPage>
  );
}
