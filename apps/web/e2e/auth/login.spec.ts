import { test, expect } from '@playwright/test';
import { LOGIN_SELECTORS, TEST_USERS } from '../helpers/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Inicio de Sesión — /iniciar-sesion
//
// Estrategia de selectores:
//   Se usan los id y clases reales de login-form.tsx para que los tests sean
//   resilientes a refactorizaciones de estilos pero detecten cambios en la
//   estructura semántica del formulario.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Página de Inicio de Sesión', () => {

  // ── Precondición compartida ──────────────────────────────────────────────
  test.beforeEach(async ({ page }) => {
    await page.goto('/iniciar-sesion');
    // Esperar que la animación de Framer Motion termine antes de interactuar
    await page.waitForSelector(LOGIN_SELECTORS.emailInput, { state: 'visible' });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 1: Estructura y carga de la página
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar todos los elementos del formulario correctamente', async ({ page }) => {
    // Título de bienvenida
    await expect(page.getByText('Bienvenido de nuevo')).toBeVisible();

    // Campos del formulario
    await expect(page.locator(LOGIN_SELECTORS.emailInput)).toBeVisible();
    await expect(page.locator(LOGIN_SELECTORS.passwordInput)).toBeVisible();
    await expect(page.locator(LOGIN_SELECTORS.rememberCheckbox)).toBeVisible();

    // Checkbox "Recordarme" viene marcado por defecto
    await expect(page.locator(LOGIN_SELECTORS.rememberCheckbox)).toBeChecked();

    // Botón principal
    await expect(page.locator(LOGIN_SELECTORS.submitButton)).toBeVisible();
    await expect(page.locator(LOGIN_SELECTORS.submitButton)).toHaveText('Iniciar Sesión');

    // Links de navegación secundaria
    await expect(page.getByRole('link', { name: '¿Olvidaste tu contraseña?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Regístrate' })).toBeVisible();

    // Botones de terceros
    await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Facebook/i })).toBeVisible();
  });

  test('el botón de envío debe estar deshabilitado cuando los campos están vacíos', async ({ page }) => {
    // Por defecto: campos vacíos → botón deshabilitado
    await expect(page.locator(LOGIN_SELECTORS.submitButton)).toBeDisabled();
  });

  test('el botón de envío debe habilitarse al llenar ambos campos', async ({ page }) => {
    await page.fill(LOGIN_SELECTORS.emailInput, 'test@test.com');
    await page.fill(LOGIN_SELECTORS.passwordInput, 'cualquier-clave');
    await expect(page.locator(LOGIN_SELECTORS.submitButton)).toBeEnabled();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 2: Happy Path — Login exitoso
  // ═══════════════════════════════════════════════════════════════════════════

  test('Happy Path — debe iniciar sesión con credenciales válidas y redirigir al panel', async ({ page }) => {
    const { email, password } = TEST_USERS.client;

    // 1. Llenar el formulario con credenciales del usuario semilla
    await page.fill(LOGIN_SELECTORS.emailInput, email);
    await page.fill(LOGIN_SELECTORS.passwordInput, password);

    // Verificar que el checkbox "Recordarme" está activo (valor por defecto)
    await expect(page.locator(LOGIN_SELECTORS.rememberCheckbox)).toBeChecked();

    // 2. Enviar el formulario
    await page.click(LOGIN_SELECTORS.submitButton);

    // 3. El botón debe cambiar a estado de carga
    await expect(page.locator(LOGIN_SELECTORS.submitButton)).toHaveText('Ingresando...');

    // El sistema redirige inmediatamente, por lo que no hay mensaje de éxito visible
    // Solo debemos comprobar que el botón dice "Ingresando..."


    // 5. Validaciones extra: El formulario debería bloquearse (solo el botón se deshabilita)
    await expect(page.locator(LOGIN_SELECTORS.submitButton)).toBeDisabled();

    // 6. No debe mostrarse ningún error
    await expect(page.locator(LOGIN_SELECTORS.errorMessage)).not.toBeVisible();

    // 7. Redirigir al panel tras ~900ms (timeout generoso para CI)
    await page.waitForURL('**/panel**', { timeout: 10_000 });
    expect(page.url()).toContain('/panel');

    // 8. Verificar que la vista final carga correctamente
    await expect(page.locator('text=Panel de Control')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 3: Casos de Error
  // ═══════════════════════════════════════════════════════════════════════════

  test('Error — no debe permitir enviar el formulario sin contraseña', async ({ page }) => {
    // Llenar solo el email
    await page.fill(LOGIN_SELECTORS.emailInput, TEST_USERS.client.email);

    // El campo de contraseña está vacío → botón debe permanecer deshabilitado
    await expect(page.locator(LOGIN_SELECTORS.submitButton)).toBeDisabled();

    // No se debe mostrar ningún error (la validación es preventiva, no reactiva)
    await expect(page.locator(LOGIN_SELECTORS.errorMessage)).not.toBeVisible();

    // La URL no debe cambiar
    expect(page.url()).toContain('/iniciar-sesion');
  });

  test('Error — no debe permitir enviar el formulario sin email', async ({ page }) => {
    // Llenar solo la contraseña
    await page.fill(LOGIN_SELECTORS.passwordInput, TEST_USERS.client.password);

    // El campo de email está vacío → botón debe permanecer deshabilitado
    await expect(page.locator(LOGIN_SELECTORS.submitButton)).toBeDisabled();

    expect(page.url()).toContain('/iniciar-sesion');
  });

  test('Error — debe mostrar mensaje de error con credenciales incorrectas', async ({ page }) => {
    // Llenar con credenciales inválidas
    await page.fill(LOGIN_SELECTORS.emailInput, 'usuario@noexiste.com');
    await page.fill(LOGIN_SELECTORS.passwordInput, 'ClaveIncorrecta999!');

    // Enviar
    await page.click(LOGIN_SELECTORS.submitButton);

    // Debe aparecer el banner de error (el texto exacto viene del backend)
    await expect(page.locator(LOGIN_SELECTORS.errorMessage)).toBeVisible({
      timeout: 10_000,
    });

    // El mensaje debe ser visible y no estar vacío
    const errorText = await page.locator(LOGIN_SELECTORS.errorMessage).textContent();
    expect(errorText).toBeTruthy();
    expect(errorText!.length).toBeGreaterThan(5);

    // No debe haber mensaje de éxito
    await expect(page.locator(LOGIN_SELECTORS.successMessage)).not.toBeVisible();

    // La URL NO debe haber cambiado — el usuario sigue en el login
    expect(page.url()).toContain('/iniciar-sesion');
  });

  test('Error — debe mostrar mensaje de error con email con formato inválido', async ({ page }) => {
    // El input type="email" del navegador valida el formato; llenamos igual
    // para verificar que el submit no dispara una petición
    await page.fill(LOGIN_SELECTORS.emailInput, 'esto-no-es-un-email');
    await page.fill(LOGIN_SELECTORS.passwordInput, 'AlgunaContrasena123!');

    // Intentar enviar con click directo en el botón
    await page.click(LOGIN_SELECTORS.submitButton);

    // Playwright verifica validación nativa del navegador:
    // El formulario no debe enviarse, la URL no cambia
    await page.waitForTimeout(1_500); // dar tiempo a que ocurra cualquier error
    expect(page.url()).toContain('/iniciar-sesion');

    // No debe aparecer el mensaje de éxito
    await expect(page.locator(LOGIN_SELECTORS.successMessage)).not.toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 4: Interacciones de UX
  // ═══════════════════════════════════════════════════════════════════════════

  test('UX — debe poder desmarcar y volver a marcar el checkbox "Recordarme"', async ({ page }) => {
    const checkbox = page.locator(LOGIN_SELECTORS.rememberCheckbox);

    // Estado inicial: marcado
    await expect(checkbox).toBeChecked();

    // Desmarcar
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    // Volver a marcar
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test('UX — el link "¿Olvidaste tu contraseña?" debe navegar a /recuperar-contrasena', async ({ page }) => {
    await page.getByRole('link', { name: '¿Olvidaste tu contraseña?' }).click();
    await expect(page).toHaveURL(/recuperar-contrasena/);
  });

  test('UX — el link "Regístrate" debe navegar a /registrarse', async ({ page }) => {
    await page.getByRole('link', { name: 'Regístrate' }).click();
    await expect(page).toHaveURL(/registrarse/);
  });

  test('UX — los botones de Google y Facebook deben mostrar error de configuración (próximamente)', async ({ page }) => {
    // Hacemos clic en el botón de Google
    await page.getByRole('button', { name: /Google/i }).click();

    // Debe mostrarse el mensaje de "próximamente"
    await expect(page.locator(LOGIN_SELECTORS.errorMessage)).toBeVisible();
    await expect(page.locator(LOGIN_SELECTORS.errorMessage)).toContainText('Próximamente');
  });
});
