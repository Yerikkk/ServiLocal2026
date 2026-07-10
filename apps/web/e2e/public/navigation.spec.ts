import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Navegación Global
//
// Valida que los enlaces principales del Navbar y Footer funcionen
// correctamente, que las rutas clave existan y que las redirecciones
// sean las esperadas para un visitante no autenticado.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Navegación Global', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { state: 'visible', timeout: 15_000 });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 1: Navbar — Enlaces principales
  // ═══════════════════════════════════════════════════════════════════════════

  test('el logo "ServiLocal" debe estar visible en el navbar', async ({ page }) => {
    await expect(page.getByText('ServiLocal').first()).toBeVisible();
  });

  test('hacer clic en el logo debe llevar a la página de inicio (/)', async ({ page }) => {
    // Navegar primero a otra página
    await page.goto('/servicios');
    await page.waitForSelector('h1', { state: 'visible' });
    // Clic en el logo
    await page.locator('header a').first().click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('el enlace "Servicios" del navbar debe navegar a /servicios', async ({ page }) => {
    await page.getByRole('link', { name: 'Servicios' }).first().click();
    await expect(page).toHaveURL(/servicios/);
  });

  test('el enlace "Proveedores" del navbar debe navegar a /proveedores', async ({ page }) => {
    await page.getByRole('link', { name: 'Proveedores' }).first().click();
    await expect(page).toHaveURL(/proveedores/);
  });

  test('el enlace "Sobre nosotros" del navbar debe navegar a /sobre-nosotros', async ({ page }) => {
    await page.getByRole('link', { name: 'Sobre nosotros' }).first().click();
    await expect(page).toHaveURL(/sobre-nosotros/);
  });

  test('el enlace "Ayuda" del navbar debe navegar a /ayuda', async ({ page }) => {
    await page.getByRole('link', { name: 'Ayuda' }).first().click();
    await expect(page).toHaveURL(/ayuda/);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 2: Navbar — Autenticación (visitante no logueado)
  // ═══════════════════════════════════════════════════════════════════════════

  test('el botón "Ingresar" debe estar visible para usuarios no autenticados', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Ingresar' }).first()).toBeVisible();
  });

  test('el botón "Ingresar" debe navegar a /iniciar-sesion', async ({ page }) => {
    await page.getByRole('link', { name: 'Ingresar' }).first().click();
    await expect(page).toHaveURL(/iniciar-sesion/);
  });

  test('el botón "Registrarse" del navbar debe navegar a /registrarse', async ({ page }) => {
    await page.getByRole('link', { name: 'Registrarse' }).first().click();
    await expect(page).toHaveURL(/registrarse/);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 3: Rutas públicas accesibles
  // ═══════════════════════════════════════════════════════════════════════════

  test('la ruta /sobre-nosotros debe cargar correctamente', async ({ page }) => {
    await page.goto('/sobre-nosotros');
    // No debe dar error 404
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('la ruta /ayuda debe cargar correctamente', async ({ page }) => {
    await page.goto('/ayuda');
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('la ruta /terminos debe cargar correctamente', async ({ page }) => {
    await page.goto('/terminos');
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('la ruta /privacidad debe cargar correctamente', async ({ page }) => {
    await page.goto('/privacidad');
    await expect(page.locator('body')).not.toContainText('404');
  });
});
