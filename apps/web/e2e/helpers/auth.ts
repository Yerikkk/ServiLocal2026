/**
 * Helpers de autenticación reutilizables para los tests E2E.
 *
 * Centraliza la lógica de login para que cada spec no tenga
 * que reimplementarla. Si el formulario cambia, solo se
 * actualiza este archivo.
 */
import { type Page } from '@playwright/test';

export const TEST_USERS = {
  /** Usuario semilla (debe existir en la BD de pruebas via prisma/seed.ts) */
  client: {
    email: 'cliente@servilocal.test',
    password: 'Test1234!',
    role: 'CLIENT',
  },
  provider: {
    email: 'proveedor@servilocal.test',
    password: 'Test1234!',
    role: 'PROVIDER',
  },
  admin: {
    email: 'admin@servilocal.test',
    password: 'Test1234!',
    role: 'ADMIN',
  },
} as const;

/** Selectores del formulario de login (sincronizados con login-form.tsx) */
export const LOGIN_SELECTORS = {
  emailInput: '#email',
  passwordInput: '#password',
  rememberCheckbox: '#remember',
  submitButton: 'button[type="submit"]',
  errorMessage: '.text-red-700',
  successMessage: '.text-emerald-700',
} as const;

/**
 * Realiza el flujo de login completo vía UI.
 * Útil para tests que requieren estar autenticado como pre-condición.
 */
export async function loginAs(
  page: Page,
  user: keyof typeof TEST_USERS,
): Promise<void> {
  const { email, password } = TEST_USERS[user];

  await page.goto('/iniciar-sesion');
  await page.fill(LOGIN_SELECTORS.emailInput, email);
  await page.fill(LOGIN_SELECTORS.passwordInput, password);
  await page.click(LOGIN_SELECTORS.submitButton);

  // Esperar redirección al panel antes de continuar
  await page.waitForURL('**/panel**', { timeout: 10_000 });
}
