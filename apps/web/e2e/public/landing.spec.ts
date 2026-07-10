import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Página Principal (Landing) — /
//
// Valida que la página de inicio cargue correctamente y que todos los elementos
// clave estén visibles y funcionen para el visitante.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Página Principal (Landing)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Esperar a que el hero se renderice
    await page.waitForSelector('h1', { state: 'visible', timeout: 15_000 });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 1: Hero y estructura principal
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar el título principal del hero', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Encuentra proveedores');
  });

  test('debe mostrar el subtítulo descriptivo del hero', async ({ page }) => {
    await expect(
      page.getByText('ServiLocal conecta clientes con proveedores verificados')
    ).toBeVisible();
  });

  test('debe mostrar los botones CTA del hero', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Crear cuenta gratis' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explorar proveedores' })).toBeVisible();
  });

  test('el botón "Crear cuenta gratis" debe redirigir a /registrarse', async ({ page }) => {
    await page.getByRole('link', { name: 'Crear cuenta gratis' }).click();
    await expect(page).toHaveURL(/registrarse/);
  });

  test('el botón "Explorar proveedores" debe redirigir a /proveedores', async ({ page }) => {
    await page.getByRole('link', { name: 'Explorar proveedores' }).click();
    await expect(page).toHaveURL(/proveedores/);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 2: Categorías de servicio
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar la sección de "Categorías de servicio"', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Categorías de servicio' })).toBeVisible();
  });

  test('debe mostrar las 8 categorías de servicio', async ({ page }) => {
    const categorias = ['Electricidad', 'Plomería', 'Limpieza', 'Carpintería', 'Pintura', 'Jardinería', 'Cerrajería', 'Aire acondicionado'];
    for (const cat of categorias) {
      await expect(page.getByText(cat, { exact: true }).first()).toBeVisible();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 3: Cómo funciona
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar la sección "¿Cómo funciona?"', async ({ page }) => {
    await expect(page.getByText('¿Cómo funciona?')).toBeVisible();
  });

  test('debe mostrar los 4 pasos del flujo', async ({ page }) => {
    await expect(page.getByText('Regístrate')).toBeVisible();
    await expect(page.getByText('Busca o publica')).toBeVisible();
    await expect(page.getByText('Negocia directo')).toBeVisible();
    await expect(page.getByText('Completa y crece')).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 4: Beneficios (¿Por qué ServiLocal?)
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar la sección "¿Por qué ServiLocal?"', async ({ page }) => {
    await expect(page.getByText('¿Por qué ServiLocal?')).toBeVisible();
  });

  test('debe mostrar los beneficios clave del sistema', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Barra de confianza real' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Negociación directa' })).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 5: CTA inferior
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar el CTA inferior "¿Eres proveedor de servicios?"', async ({ page }) => {
    await expect(page.getByText('¿Eres proveedor de servicios?').first()).toBeVisible();
  });

  test('el CTA inferior debe tener un enlace a /registrarse', async ({ page }) => {
    const ctaLink = page.getByRole('link', { name: 'Registrarme como proveedor' });
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toHaveAttribute('href', '/registrarse');
  });
});
