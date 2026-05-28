/**
 * Cliente HTTP para la API REST de Mailpit.
 *
 * Mailpit expone su API en http://localhost:8025/api/v1/
 * Úsalo en tests para verificar emails enviados por el backend
 * (ej.: recuperación de contraseña, notificaciones).
 *
 * Docs: https://mailpit.axllent.org/docs/usage/api-v1/
 */

const MAILPIT_BASE = 'http://localhost:8025/api/v1';

export interface MailpitMessage {
  ID: string;
  From: { Address: string; Name: string };
  To: Array<{ Address: string; Name: string }>;
  Subject: string;
  Date: string;
  Snippet: string;
}

export interface MailpitListResponse {
  messages: MailpitMessage[];
  total: number;
  count: number;
}

/**
 * Devuelve la lista de mensajes en la bandeja de Mailpit.
 */
export async function getMailpitMessages(
  limit = 10,
): Promise<MailpitListResponse> {
  const response = await fetch(
    `${MAILPIT_BASE}/messages?limit=${limit}`,
  );
  if (!response.ok) {
    throw new Error(`Mailpit error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<MailpitListResponse>;
}

/**
 * Obtiene el último email enviado a una dirección específica.
 * Lanza un error si no se encuentra ningún mensaje para ese destinatario.
 */
export async function getLastEmailFor(
  recipientEmail: string,
): Promise<MailpitMessage> {
  const { messages } = await getMailpitMessages(50);
  const found = messages.find((msg) =>
    msg.To.some((to) => to.Address === recipientEmail),
  );
  if (!found) {
    throw new Error(
      `No se encontró ningún email para: ${recipientEmail}`,
    );
  }
  return found;
}

/**
 * Elimina todos los mensajes de Mailpit (útil en beforeEach/afterAll).
 */
export async function clearMailpit(): Promise<void> {
  await fetch(`${MAILPIT_BASE}/messages`, { method: 'DELETE' });
}
