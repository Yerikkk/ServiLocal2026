import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration — ServiLocal2026
 *
 * Modo: PRESENTACIÓN
 *   - headless: false  → el navegador es visible durante la ejecución
 *   - video: 'on'      → graba video de cada test
 *   - reporter: html   → genera un reporte HTML interactivo
 *
 * Para ejecutar: pnpm evaluar:sistema
 * Para ver reporte: pnpm ver:reporte
 */
export default defineConfig({
  // ─── Directorio donde viven los tests E2E ───────────────────
  testDir: './e2e',

  // ─── Timeouts ────────────────────────────────────────────────
  /** Tiempo máximo por test completo */
  timeout: 30_000,
  /** Tiempo máximo para que cada expect/assertion se cumpla */
  expect: {
    timeout: 8_000,
  },

  // ─── Ejecución ───────────────────────────────────────────────
  /** Ejecuta los tests de forma secuencial (ideal para presentaciones) */
  fullyParallel: false,
  workers: 1,

  // ─── Comportamiento en CI ────────────────────────────────────
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // ─── Reportero principal: HTML interactivo ───────────────────
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],   // imprime resultados en consola en tiempo real
  ],

  // ─── Configuración global del navegador ─────────────────────
  use: {
    /** URL base del frontend (Next.js dev server) */
    baseURL: 'http://localhost:3000',

    /** Navegador visible — modo presentación */
    headless: false,

    /** Graba video de todos los tests */
    video: 'on',

    /** Captura screenshot al fallar un test */
    screenshot: 'only-on-failure',

    /** Guarda trazas completas al fallar (útil para debug) */
    trace: 'retain-on-failure',

    /** Viewport estándar desktop */
    viewport: { width: 1280, height: 720 },

    /** Tiempo de espera de acciones (click, fill, etc.) */
    actionTimeout: 10_000,

    /** Idioma del navegador */
    locale: 'es-ES',
    timezoneId: 'America/Bogota',
  },

  // ─── Proyectos (navegadores) ─────────────────────────────────
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // ─── Servidor de desarrollo ──────────────────────────────────
  /**
   * Playwright levantará automáticamente el servidor si no está corriendo.
   * Si ya tienes `pnpm dev` corriendo, simplemente lo reutilizará.
   */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
