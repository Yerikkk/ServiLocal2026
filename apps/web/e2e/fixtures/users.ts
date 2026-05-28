/**
 * Datos de prueba (fixtures) para los tests E2E de ServiLocal2026.
 *
 * Estos usuarios deben existir en la base de datos antes de ejecutar los tests.
 * Para crearlos ejecuta: pnpm --filter api prisma:seed
 *
 * Convención de nombres: *.servilocal.test (dominio ficticio, nunca real)
 */

export const FIXTURES = {
  // ─── Usuarios de prueba ──────────────────────────────────────
  users: {
    client: {
      fullName: 'Carlos Prueba Cliente',
      email: 'cliente@servilocal.test',
      password: 'Test1234!',
      role: 'CLIENT' as const,
    },
    provider: {
      fullName: 'Ana Prueba Proveedora',
      email: 'proveedor@servilocal.test',
      password: 'Test1234!',
      role: 'PROVIDER' as const,
    },
    admin: {
      fullName: 'Admin Prueba Sistema',
      email: 'admin@servilocal.test',
      password: 'Test1234!',
      role: 'ADMIN' as const,
    },
    support: {
      fullName: 'Soporte Prueba Equipo',
      email: 'soporte@servilocal.test',
      password: 'Test1234!',
      role: 'SUPPORT' as const,
    },
  },

  // ─── Credenciales inválidas para tests de error ──────────────
  invalidCredentials: {
    emailNoExiste: 'nadie@noexiste.com',
    passwordIncorrecta: 'ClaveMAL999!',
    emailMalFormato: 'esto-no-es-email',
  },

  // ─── Rutas esperadas por rol post-login ──────────────────────
  panelRoutes: {
    CLIENT: '/panel/cliente',
    PROVIDER: '/panel/proveedor',
    ADMIN: '/panel/admin',
    SUPPORT: '/panel/soporte',
  },
} as const;
