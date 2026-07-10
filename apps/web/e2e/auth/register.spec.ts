import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Registro de Usuarios — /registrarse
//
// Valida el formulario dual (Cliente/Proveedor), la alternancia de pestañas,
// los campos dinámicos, las validaciones del lado del cliente y los enlaces
// de navegación secundaria.
// ─────────────────────────────────────────────────────────────────────────────

const REGISTER_SELECTORS = {
  fullNameInput: '#fullName',
  emailInput: '#email',
  phoneInput: '#phone',
  passwordInput: '#password',
  confirmPasswordInput: '#confirmPassword',
  termsCheckbox: '#terms',
  submitButton: 'button[type="submit"]',
  feedbackError: '.text-red-700',
  feedbackSuccess: '.text-emerald-700',
  // Provider-only
  rucInput: '#ruc',
  businessNameInput: '#businessName',
  categorySelect: '#category',
  serviceZoneSelect: '#serviceZone',
  descriptionTextarea: '#description',
};

test.describe('Página de Registro', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/registrarse');
    await page.waitForSelector(REGISTER_SELECTORS.fullNameInput, { state: 'visible', timeout: 10_000 });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 1: Estructura del formulario
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar el título "Crea tu cuenta"', async ({ page }) => {
    await expect(page.getByText('Crea tu cuenta')).toBeVisible();
  });

  test('debe mostrar las tarjetas de selección de rol (Cliente y Proveedor)', async ({ page }) => {
    await expect(page.getByText('Busco Servicios')).toBeVisible();
    await expect(page.getByText('Ofrezco Servicios')).toBeVisible();
  });

  test('debe mostrar los campos comunes: nombre, email, teléfono, contraseña', async ({ page }) => {
    await expect(page.locator(REGISTER_SELECTORS.fullNameInput)).toBeVisible();
    await expect(page.locator(REGISTER_SELECTORS.emailInput)).toBeVisible();
    await expect(page.locator(REGISTER_SELECTORS.phoneInput)).toBeVisible();
    await expect(page.locator(REGISTER_SELECTORS.passwordInput)).toBeVisible();
    await expect(page.locator(REGISTER_SELECTORS.confirmPasswordInput)).toBeVisible();
  });

  test('debe mostrar el checkbox de términos y condiciones', async ({ page }) => {
    await expect(page.locator(REGISTER_SELECTORS.termsCheckbox)).toBeVisible();
    await expect(page.getByText('Acepto los')).toBeVisible();
  });

  test('debe mostrar el botón "Crear Cuenta"', async ({ page }) => {
    await expect(page.locator(REGISTER_SELECTORS.submitButton)).toBeVisible();
    await expect(page.locator(REGISTER_SELECTORS.submitButton)).toHaveText('Crear Cuenta');
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 2: Alternancia de roles (Cliente ↔ Proveedor)
  // ═══════════════════════════════════════════════════════════════════════════

  test('por defecto, el rol seleccionado debe ser "Cliente" (Busco Servicios)', async ({ page }) => {
    // La tarjeta "Busco Servicios" debe tener estilos activos
    const clientCard = page.getByText('Busco Servicios').locator('..');
    await expect(clientCard).toBeVisible();
    // El campo de DNI opcional del cliente debe estar visible
    await expect(page.locator('#documentNumber')).toBeVisible();
  });

  test('al hacer clic en "Ofrezco Servicios", deben aparecer los campos de proveedor', async ({ page }) => {
    await page.getByText('Ofrezco Servicios').click();
    await page.waitForTimeout(500); // AnimatePresence animation

    // Los campos exclusivos del proveedor deben estar visibles
    await expect(page.locator(REGISTER_SELECTORS.rucInput)).toBeVisible();
    await expect(page.locator(REGISTER_SELECTORS.businessNameInput)).toBeVisible();
    await expect(page.locator(REGISTER_SELECTORS.categorySelect)).toBeVisible();
    await expect(page.locator(REGISTER_SELECTORS.serviceZoneSelect)).toBeVisible();
    await expect(page.locator(REGISTER_SELECTORS.descriptionTextarea)).toBeVisible();
  });

  test('al volver a "Busco Servicios", los campos de proveedor deben desaparecer', async ({ page }) => {
    // Primero cambiar a proveedor
    await page.getByText('Ofrezco Servicios').click();
    await page.waitForTimeout(500);
    await expect(page.locator(REGISTER_SELECTORS.rucInput)).toBeVisible();

    // Volver a cliente
    await page.getByText('Busco Servicios').click();
    await page.waitForTimeout(500);
    await expect(page.locator(REGISTER_SELECTORS.rucInput)).not.toBeVisible();
    await expect(page.locator('#documentNumber')).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 3: Validaciones del formulario
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar error si se envía sin aceptar términos', async ({ page }) => {
    await page.fill(REGISTER_SELECTORS.fullNameInput, 'Test User');
    await page.fill(REGISTER_SELECTORS.emailInput, 'test@test.com');
    await page.fill(REGISTER_SELECTORS.phoneInput, '999888777');
    await page.fill(REGISTER_SELECTORS.passwordInput, 'Test1234!');
    await page.fill(REGISTER_SELECTORS.confirmPasswordInput, 'Test1234!');

    await page.click(REGISTER_SELECTORS.submitButton);
    await expect(page.locator(REGISTER_SELECTORS.feedbackError)).toContainText(
      'Debes aceptar los términos'
    );
  });

  test('debe mostrar error si las contraseñas no coinciden', async ({ page }) => {
    await page.fill(REGISTER_SELECTORS.fullNameInput, 'Test User');
    await page.fill(REGISTER_SELECTORS.emailInput, 'test@test.com');
    await page.fill(REGISTER_SELECTORS.phoneInput, '999888777');
    await page.fill(REGISTER_SELECTORS.passwordInput, 'Clave1234!');
    await page.fill(REGISTER_SELECTORS.confirmPasswordInput, 'OtraClave99!');
    await page.locator(REGISTER_SELECTORS.termsCheckbox).check();

    await page.click(REGISTER_SELECTORS.submitButton);
    await expect(page.locator(REGISTER_SELECTORS.feedbackError)).toContainText(
      'Las contraseñas no coinciden'
    );
  });

  test('debe mostrar error si la contraseña tiene menos de 8 caracteres', async ({ page }) => {
    await page.fill(REGISTER_SELECTORS.fullNameInput, 'Test User');
    await page.fill(REGISTER_SELECTORS.emailInput, 'test@test.com');
    await page.fill(REGISTER_SELECTORS.phoneInput, '999888777');
    await page.fill(REGISTER_SELECTORS.passwordInput, 'Ab1!');
    await page.fill(REGISTER_SELECTORS.confirmPasswordInput, 'Ab1!');
    await page.locator(REGISTER_SELECTORS.termsCheckbox).check();

    await page.click(REGISTER_SELECTORS.submitButton);
    await expect(page.locator(REGISTER_SELECTORS.feedbackError)).toContainText(
      'al menos 8 caracteres'
    );
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 4: Navegación secundaria
  // ═══════════════════════════════════════════════════════════════════════════

  test('el enlace "Inicia Sesión" debe navegar a /iniciar-sesion', async ({ page }) => {
    await page.getByRole('link', { name: 'Inicia Sesión' }).click();
    await expect(page).toHaveURL(/iniciar-sesion/);
  });
});
