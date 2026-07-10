import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Suite: Catálogo de Servicios — /servicios
//
// Valida la carga del catálogo público, el sistema de filtros por categoría,
// la búsqueda de texto, los estados vacíos y la navegación a proveedores.
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Catálogo de Servicios', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/servicios');
    // Esperar a que el hero del catálogo cargue
    await page.waitForSelector('h1', { state: 'visible', timeout: 15_000 });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 1: Carga inicial
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar el título del catálogo', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Encuentra el servicio');
  });

  test('debe mostrar la barra de búsqueda del hero', async ({ page }) => {
    await expect(
      page.getByPlaceholder('Buscar servicio, proveedor o categoría...')
    ).toBeVisible();
  });

  test('debe mostrar las tarjetas KPI (servicios disponibles, verificados, precio)', async ({ page }) => {
    // Esperar que la carga termine (las tarjetas KPI se renderizan después del fetch)
    await page.waitForTimeout(3000);
    await expect(page.getByText('Servicios disponibles', { exact: true })).toBeVisible();
    await expect(page.getByText('Proveedores verificados', { exact: true })).toBeVisible();
    await expect(page.getByText('Precio referencial promedio', { exact: true })).toBeVisible();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 2: Filtros por categoría
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar los chips de filtro de categorías', async ({ page }) => {
    // Esperar a que los chips aparezcan (se cargan desde la API)
    await page.waitForTimeout(3000);
    await expect(page.getByText('Filtrar por categoría')).toBeVisible();
    // El chip "Todas" siempre debe estar
    await expect(page.getByRole('button', { name: 'Todas' })).toBeVisible();
  });

  test('al hacer clic en una categoría, la URL debe actualizarse con categoryId', async ({ page }) => {
    await page.waitForTimeout(3000);
    // Buscar un chip de categoría que no sea "Todas"
    const chips = page.locator('button:has-text("Electricidad")');
    if (await chips.count() > 0) {
      await chips.first().click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('categoryId');
    }
  });

  test('debe poder limpiar los filtros activos', async ({ page }) => {
    await page.waitForTimeout(3000);
    const chips = page.locator('button:has-text("Electricidad")');
    if (await chips.count() > 0) {
      await chips.first().click();
      await page.waitForTimeout(1000);
      // Buscar el botón "Limpiar"
      const limpiar = page.getByRole('button', { name: 'Limpiar' });
      if (await limpiar.isVisible()) {
        await limpiar.click();
        await expect(page).not.toHaveURL(/categoryId/);
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 3: Búsqueda
  // ═══════════════════════════════════════════════════════════════════════════

  test('al escribir en el buscador, debe actualizar los parámetros de la URL', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar servicio, proveedor o categoría...');
    await searchInput.fill('electricidad');
    // Esperar el debounce (350ms) + algo de margen
    await page.waitForTimeout(800);
    expect(page.url()).toContain('search=electricidad');
  });

  test('al buscar algo inexistente, debe mostrar estado vacío', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar servicio, proveedor o categoría...');
    await searchInput.fill('xyznoexiste999');
    await page.waitForTimeout(2000);
    await expect(page.getByText('No se encontraron servicios')).toBeVisible({ timeout: 8000 });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 4: Tarjetas de servicio y navegación
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar al menos una tarjeta de servicio cuando hay datos', async ({ page }) => {
    // Esperar carga de servicios
    await page.waitForTimeout(3000);
    const cards = page.locator('article');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('las tarjetas de servicio deben tener botón "Ver proveedor y solicitar"', async ({ page }) => {
    await page.waitForTimeout(3000);
    const ctaButtons = page.getByRole('link', { name: 'Ver proveedor y solicitar' });
    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 5: CTA inferior
  // ═══════════════════════════════════════════════════════════════════════════

  test('debe mostrar el CTA inferior "¿Eres proveedor de servicios?"', async ({ page }) => {
    await expect(page.getByText('¿Eres proveedor de servicios?').first()).toBeVisible();
  });
});
