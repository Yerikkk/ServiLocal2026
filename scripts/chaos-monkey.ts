/**
 * 🐒 SERVILOCAL CHAOS MONKEY — Motor de Ingeniería del Caos
 * ══════════════════════════════════════════════════════════
 *
 * Inspirado en Netflix Chaos Engineering.
 * Inyecta fallos controlados y mide la resiliencia del sistema.
 *
 * Ejecución:  npx tsx scripts/chaos-monkey.ts
 *
 * Requisitos:
 *   - El sistema debe estar corriendo (pnpm dev)
 *   - Docker con PostgreSQL + Redis activos
 */

// ─── Tipos ────────────────────────────────────────────────

interface ChaosExperiment {
  name: string;
  description: string;
  execute: () => Promise<ChaosResult>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ChaosResult {
  experiment: string;
  passed: boolean;
  responseTime: number;
  errorRate: number;
  details: string;
  recoveryTime?: number;
}

// ─── Configuración ────────────────────────────────────────

const API_URL = 'http://localhost:3001/api';
const PAUSE_BETWEEN_EXPERIMENTS_MS = 5000;

// ─── Utilidades ───────────────────────────────────────────

function colorize(text: string, color: 'green' | 'red' | 'yellow' | 'cyan' | 'magenta' | 'bold' | 'dim') {
  const codes: Record<string, string> = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
  };
  return `${codes[color]}${text}\x1b[0m`;
}

function progressBar(current: number, total: number, width = 30): string {
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = ((current / total) * 100).toFixed(0);
  return `[${bar}] ${percent}%`;
}

async function safeFetch(
  url: string,
  options?: RequestInit,
): Promise<{ status: number; time: number; ok: boolean }> {
  const start = Date.now();
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
    return { status: res.status, time: Date.now() - start, ok: res.ok };
  } catch {
    return { status: 0, time: Date.now() - start, ok: false };
  }
}

// ─── Experimentos de Caos ─────────────────────────────────

const experiments: ChaosExperiment[] = [
  // ─── 1. Verificación de línea base ───
  {
    name: '🏁 Línea Base del Sistema',
    description: 'Verificar que el sistema responde correctamente antes de comenzar las pruebas',
    severity: 'LOW',
    async execute() {
      const endpoints = [
        '/services/categories',
        '/services/public?page=1&limit=10',
        '/providers/public',
      ];

      const results = await Promise.all(
        endpoints.map(ep => safeFetch(`${API_URL}${ep}`))
      );

      const allOk = results.every(r => r.ok);
      const avgTime = results.reduce((s, r) => s + r.time, 0) / results.length;

      return {
        experiment: '🏁 Línea Base del Sistema',
        passed: allOk,
        responseTime: avgTime,
        errorRate: allOk ? 0 : 1,
        details: allOk
          ? `Todos los endpoints respondieron OK. Tiempo promedio: ${avgTime.toFixed(0)}ms`
          : '❌ El sistema no está respondiendo correctamente. Abortando pruebas.',
      };
    },
  },

  // ─── 2. Avalancha de búsquedas ───
  {
    name: '🌊 Avalancha de Búsquedas',
    description: 'Ejecutar 150 búsquedas simultáneas en catálogo de servicios y proveedores',
    severity: 'HIGH',
    async execute() {
      const searchTerms = [
        'plomero', 'electricista', 'limpieza', 'pintura',
        'carpintería', 'mecánico', 'jardinero', 'albañil',
        'cerrajero', 'fumigación', 'mudanza', 'reparación',
      ];

      const requests = Array.from({ length: 150 }, (_, i) => {
        const term = searchTerms[i % searchTerms.length];
        const endpoint = i % 2 === 0
          ? `/services/public?search=${term}&page=1&limit=10`
          : `/providers/public?search=${term}`;
        return safeFetch(`${API_URL}${endpoint}`);
      });

      const results = await Promise.all(requests);
      const errors = results.filter(r => !r.ok);
      const times = results.map(r => r.time).sort((a, b) => a - b);
      const p50 = times[Math.floor(times.length * 0.5)];
      const p95 = times[Math.floor(times.length * 0.95)];
      const p99 = times[Math.floor(times.length * 0.99)];
      const avgTime = times.reduce((s, t) => s + t, 0) / times.length;

      return {
        experiment: '🌊 Avalancha de Búsquedas',
        passed: errors.length < results.length * 0.15 && p95 < 8000,
        responseTime: avgTime,
        errorRate: errors.length / results.length,
        details: `150 búsquedas simultáneas. ` +
          `Éxitos: ${results.length - errors.length}/${results.length}. ` +
          `P50: ${p50}ms | P95: ${p95}ms | P99: ${p99}ms`,
      };
    },
  },

  // ─── 3. Ráfaga de autenticación ───
  {
    name: '⚡ Ráfaga de Autenticación',
    description: 'Login simultáneo de 30 usuarios diferentes (estrés en Argon2 CPU-bound)',
    severity: 'CRITICAL',
    async execute() {
      const logins = Array.from({ length: 30 }, (_, i) => {
        const idx = (i % 15) + 1;
        return safeFetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `cliente${idx}@ejemplo.com`,
            password: 'Demo12345*',
          }),
        });
      });

      const results = await Promise.all(logins);
      const errors = results.filter(r => !r.ok);
      const times = results.map(r => r.time).sort((a, b) => a - b);
      const avgTime = times.reduce((s, t) => s + t, 0) / times.length;
      const maxTime = times[times.length - 1];
      const p95 = times[Math.floor(times.length * 0.95)];

      return {
        experiment: '⚡ Ráfaga de Autenticación',
        passed: errors.length < 10 && maxTime < 15000,
        responseTime: avgTime,
        errorRate: errors.length / results.length,
        details: `30 logins simultáneos (Argon2 hash × 30). ` +
          `Éxitos: ${results.length - errors.length}/${results.length}. ` +
          `Avg: ${avgTime.toFixed(0)}ms | P95: ${p95}ms | Max: ${maxTime}ms`,
      };
    },
  },

  // ─── 4. Registros masivos ───
  {
    name: '💣 Registros Masivos',
    description: 'Registrar 25 usuarios nuevos simultáneamente (estrés máximo en Argon2 + DB writes)',
    severity: 'CRITICAL',
    async execute() {
      const timestamp = Date.now();
      const registrations = Array.from({ length: 25 }, (_, i) =>
        safeFetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `chaos_${timestamp}_${i}@test.com`,
            fullName: `Chaos Test User ${i}`,
            password: 'ChaosTest123!',
            confirmPassword: 'ChaosTest123!',
            accountType: i % 3 === 0 ? 'PROVIDER' : 'CLIENT',
            phone: '999888777',
            ...(i % 3 === 0 ? {
              businessName: `Chaos Business ${i}`,
              ruc: `20${timestamp}`.slice(0, 10) + (i % 10),
              category: 'placeholder',
              serviceZone: 'Zona Chaos',
              description: 'Test de estrés automatizado',
            } : {}),
          }),
        })
      );

      const results = await Promise.all(registrations);
      const successes = results.filter(r => r.ok || r.status === 201);
      const errors = results.filter(r => !r.ok && r.status !== 201);
      const times = results.map(r => r.time).sort((a, b) => a - b);
      const avgTime = times.reduce((s, t) => s + t, 0) / times.length;
      const maxTime = times[times.length - 1];

      // Nota: Algunos pueden fallar por validación (categoryId inválida), eso es esperado
      const realErrors = errors.filter(r => r.status === 0 || r.status >= 500);

      return {
        experiment: '💣 Registros Masivos',
        passed: realErrors.length < results.length * 0.3,
        responseTime: avgTime,
        errorRate: realErrors.length / results.length,
        details: `25 registros simultáneos. ` +
          `Server errors: ${realErrors.length}. ` +
          `Validation errors (esperados): ${errors.length - realErrors.length}. ` +
          `Avg: ${avgTime.toFixed(0)}ms | Max: ${maxTime}ms`,
      };
    },
  },

  // ─── 5. Flood de endpoints públicos ───
  {
    name: '🔥 Flood de Endpoints Públicos',
    description: 'Bombardear TODOS los endpoints públicos con 200 requests simultáneos',
    severity: 'HIGH',
    async execute() {
      const publicEndpoints = [
        '/services/categories',
        '/services/public?page=1&limit=10',
        '/services/public?page=2&limit=10',
        '/services/public?search=limpieza',
        '/providers/public',
        '/providers/public?search=electricista',
      ];

      const requests = Array.from({ length: 200 }, (_, i) => {
        const ep = publicEndpoints[i % publicEndpoints.length];
        return safeFetch(`${API_URL}${ep}`);
      });

      const results = await Promise.all(requests);
      const errors = results.filter(r => !r.ok);
      const throttled = results.filter(r => r.status === 429);
      const serverErrors = results.filter(r => r.status >= 500);
      const times = results.map(r => r.time).sort((a, b) => a - b);
      const avgTime = times.reduce((s, t) => s + t, 0) / times.length;
      const p95 = times[Math.floor(times.length * 0.95)];

      return {
        experiment: '🔥 Flood de Endpoints Públicos',
        passed: serverErrors.length < results.length * 0.1,
        responseTime: avgTime,
        errorRate: errors.length / results.length,
        details: `200 requests a endpoints públicos. ` +
          `HTTP 429 (rate limited): ${throttled.length}. ` +
          `HTTP 5xx (server error): ${serverErrors.length}. ` +
          `Avg: ${avgTime.toFixed(0)}ms | P95: ${p95}ms`,
      };
    },
  },

  // ─── 6. Carga mixta realista ───
  {
    name: '🎭 Carga Mixta Realista',
    description: 'Simular 100 usuarios con mezcla realista: 40% anónimos, 35% clientes, 25% proveedores',
    severity: 'HIGH',
    async execute() {
      const allResults: { status: number; time: number; ok: boolean; type: string }[] = [];

      // 40 visitantes anónimos
      const anonymous = Array.from({ length: 40 }, (_, i) => {
        const endpoints = [
          '/services/categories',
          '/services/public?page=1&limit=10',
          '/providers/public',
        ];
        return safeFetch(`${API_URL}${endpoints[i % endpoints.length]}`)
          .then(r => ({ ...r, type: 'anónimo' }));
      });

      // 35 logins de clientes
      const clients = Array.from({ length: 35 }, (_, i) => {
        const idx = (i % 15) + 1;
        return safeFetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `cliente${idx}@ejemplo.com`,
            password: 'Demo12345*',
          }),
        }).then(r => ({ ...r, type: 'cliente' }));
      });

      // 25 logins de proveedores
      const providers = Array.from({ length: 25 }, (_, i) => {
        const idx = (i % 20) + 1;
        return safeFetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `proveedor${idx}@ejemplo.com`,
            password: 'Demo12345*',
          }),
        }).then(r => ({ ...r, type: 'proveedor' }));
      });

      const results = await Promise.all([...anonymous, ...clients, ...providers]);
      const errors = results.filter(r => !r.ok);
      const times = results.map(r => r.time).sort((a, b) => a - b);
      const avgTime = times.reduce((s, t) => s + t, 0) / times.length;
      const p95 = times[Math.floor(times.length * 0.95)];

      // Desglose por tipo
      const byType = (type: string) => {
        const typeResults = results.filter(r => r.type === type);
        const typeErrors = typeResults.filter(r => !r.ok);
        const typeAvg = typeResults.reduce((s, r) => s + r.time, 0) / typeResults.length;
        return `${type}: ${typeResults.length - typeErrors.length}/${typeResults.length} OK (avg ${typeAvg.toFixed(0)}ms)`;
      };

      return {
        experiment: '🎭 Carga Mixta Realista',
        passed: errors.length < results.length * 0.2 && p95 < 10000,
        responseTime: avgTime,
        errorRate: errors.length / results.length,
        details: `100 usuarios simultáneos. ${byType('anónimo')} | ${byType('cliente')} | ${byType('proveedor')}. P95: ${p95}ms`,
      };
    },
  },

  // ─── 7. Test de recuperación ───
  {
    name: '🔄 Test de Recuperación Post-Estrés',
    description: 'Después de la carga anterior, medir cuánto tarda el sistema en recuperarse',
    severity: 'MEDIUM',
    async execute() {
      const measurements: { time: number; iteration: number }[] = [];

      // Tomar 10 mediciones cada 1 segundo
      for (let i = 0; i < 10; i++) {
        const result = await safeFetch(`${API_URL}/services/categories`);
        measurements.push({ time: result.time, iteration: i + 1 });
        process.stdout.write(`\r   Medición ${i + 1}/10: ${result.time}ms `);
        await new Promise(r => setTimeout(r, 1000));
      }
      console.log('');

      const firstResponse = measurements[0].time;
      const lastResponse = measurements[measurements.length - 1].time;
      const minTime = Math.min(...measurements.map(m => m.time));
      const trend = lastResponse < firstResponse;

      // Encontrar cuándo se estabilizó (respuesta < 300ms)
      const stableIdx = measurements.findIndex(m => m.time < 300);
      const recoverySeconds = stableIdx >= 0 ? (stableIdx + 1) : -1;

      return {
        experiment: '🔄 Test de Recuperación Post-Estrés',
        passed: trend || lastResponse < 500,
        responseTime: lastResponse,
        errorRate: 0,
        details: `Primera: ${firstResponse}ms → Última: ${lastResponse}ms. ` +
          `Mínima: ${minTime}ms. ` +
          (recoverySeconds > 0
            ? `Estabilizado en ~${recoverySeconds}s`
            : 'No se estabilizó por debajo de 300ms'),
        recoveryTime: recoverySeconds > 0 ? recoverySeconds * 1000 : undefined,
      };
    },
  },

  // ─── 8. Estrés de conexiones WebSocket ───
  {
    name: '🔌 Estrés de Conexiones Concurrentes',
    description: 'Enviar 300 requests simultáneos a un mismo endpoint (saturar pool de conexiones)',
    severity: 'CRITICAL',
    async execute() {
      const BATCH_SIZE = 300;

      const requests = Array.from({ length: BATCH_SIZE }, () =>
        safeFetch(`${API_URL}/providers/public`)
      );

      const results = await Promise.all(requests);
      const errors = results.filter(r => !r.ok);
      const timeouts = results.filter(r => r.status === 0);
      const serverErrors = results.filter(r => r.status >= 500);
      const throttled = results.filter(r => r.status === 429);
      const times = results.map(r => r.time).sort((a, b) => a - b);
      const avgTime = times.reduce((s, t) => s + t, 0) / times.length;
      const p50 = times[Math.floor(times.length * 0.5)];
      const p95 = times[Math.floor(times.length * 0.95)];
      const p99 = times[Math.floor(times.length * 0.99)];
      const maxTime = times[times.length - 1];

      return {
        experiment: '🔌 Estrés de Conexiones Concurrentes',
        passed: serverErrors.length < BATCH_SIZE * 0.2 && timeouts.length < BATCH_SIZE * 0.1,
        responseTime: avgTime,
        errorRate: errors.length / BATCH_SIZE,
        details: `${BATCH_SIZE} requests al endpoint más pesado (providers/public). ` +
          `Timeouts: ${timeouts.length}. Server errors: ${serverErrors.length}. ` +
          `Rate limited: ${throttled.length}. ` +
          `P50: ${p50}ms | P95: ${p95}ms | P99: ${p99}ms | Max: ${maxTime}ms`,
      };
    },
  },
];

// ─── Motor de Ejecución ───────────────────────────────────

async function verifySystemIsUp(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/services/categories`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function runChaosMonkey() {
  console.log('');
  console.log(colorize('  ╔══════════════════════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('  ║                                                              ║', 'cyan'));
  console.log(colorize('  ║   🐒  SERVILOCAL CHAOS MONKEY                                ║', 'cyan'));
  console.log(colorize('  ║       Motor de Ingeniería del Caos v1.0                       ║', 'cyan'));
  console.log(colorize('  ║       Inspirado en Netflix Chaos Engineering                  ║', 'cyan'));
  console.log(colorize('  ║                                                              ║', 'cyan'));
  console.log(colorize('  ╚══════════════════════════════════════════════════════════════╝', 'cyan'));
  console.log('');

  // Verificar que el sistema esté corriendo
  console.log(colorize('  ⏳ Verificando conexión con el sistema...', 'dim'));
  const isUp = await verifySystemIsUp();
  if (!isUp) {
    console.log(colorize('\n  ❌ ERROR: No se puede conectar al sistema.', 'red'));
    console.log(colorize('  Asegúrate de que el sistema esté corriendo:', 'red'));
    console.log(colorize('    1. Docker: docker compose -f infra/docker-compose.yml up -d', 'yellow'));
    console.log(colorize('    2. Dev server: pnpm dev', 'yellow'));
    console.log('');
    process.exit(1);
  }
  console.log(colorize('  ✅ Sistema conectado y respondiendo.\n', 'green'));

  const allResults: ChaosResult[] = [];
  const startTime = Date.now();

  for (let i = 0; i < experiments.length; i++) {
    const experiment = experiments[i];

    console.log(colorize(`  ┌─────────────────────────────────────────────────────────────`, 'dim'));
    console.log(colorize(`  │ ${progressBar(i + 1, experiments.length)} Experimento ${i + 1}/${experiments.length}`, 'bold'));
    console.log(colorize(`  │`, 'dim'));
    console.log(colorize(`  │ ${experiment.name}`, 'bold'));
    console.log(colorize(`  │ ${experiment.description}`, 'dim'));
    console.log(colorize(`  │ Severidad: ${
      experiment.severity === 'CRITICAL' ? colorize(experiment.severity, 'red') :
      experiment.severity === 'HIGH' ? colorize(experiment.severity, 'yellow') :
      experiment.severity === 'MEDIUM' ? colorize(experiment.severity, 'cyan') :
      colorize(experiment.severity, 'green')
    }`, 'dim'));
    console.log(colorize(`  └─────────────────────────────────────────────────────────────`, 'dim'));

    try {
      const result = await experiment.execute();
      allResults.push(result);

      const statusIcon = result.passed ? colorize('✅ PASÓ', 'green') : colorize('❌ FALLÓ', 'red');
      console.log(`\n   Resultado: ${statusIcon}`);
      console.log(`   Tiempo de respuesta: ${colorize(`${result.responseTime.toFixed(0)}ms`, 'cyan')}`);
      console.log(`   Tasa de error: ${colorize(`${(result.errorRate * 100).toFixed(1)}%`,
        result.errorRate < 0.05 ? 'green' : result.errorRate < 0.15 ? 'yellow' : 'red')}`);
      console.log(`   ${colorize(result.details, 'dim')}`);
      if (result.recoveryTime) {
        console.log(`   Tiempo de recuperación: ${colorize(`${result.recoveryTime}ms`, 'magenta')}`);
      }
    } catch (err) {
      console.log(`   ${colorize('❌ ERROR INESPERADO durante el experimento:', 'red')} ${err}`);
      allResults.push({
        experiment: experiment.name,
        passed: false,
        responseTime: 0,
        errorRate: 1,
        details: `Error inesperado: ${err}`,
      });
    }

    // Pausa entre experimentos
    if (i < experiments.length - 1) {
      console.log(colorize(`\n   ⏸️  Pausa de ${PAUSE_BETWEEN_EXPERIMENTS_MS / 1000}s para estabilización...`, 'dim'));
      await new Promise(r => setTimeout(r, PAUSE_BETWEEN_EXPERIMENTS_MS));
    }
  }

  // ─── Reporte Final ────────────────────────────────────────

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const passed = allResults.filter(r => r.passed).length;
  const total = allResults.length;
  const score = Math.round((passed / total) * 100);

  console.log('\n');
  console.log(colorize('  ╔══════════════════════════════════════════════════════════════╗', 'magenta'));
  console.log(colorize('  ║                                                              ║', 'magenta'));
  console.log(colorize('  ║   📋  REPORTE FINAL DE CAOS                                  ║', 'magenta'));
  console.log(colorize('  ║                                                              ║', 'magenta'));
  console.log(colorize('  ╚══════════════════════════════════════════════════════════════╝', 'magenta'));
  console.log('');

  // Tabla de resultados
  console.log('  ┌──────────────────────────────────────┬──────────┬───────────┬──────────┐');
  console.log('  │ Experimento                          │ Resultado│ Tiempo    │ Errores  │');
  console.log('  ├──────────────────────────────────────┼──────────┼───────────┼──────────┤');

  for (const r of allResults) {
    const name = r.experiment.padEnd(36).slice(0, 36);
    const status = r.passed ? '  ✅ OK  ' : '  ❌ FAIL';
    const time = `${r.responseTime.toFixed(0)}ms`.padStart(7);
    const errors = `${(r.errorRate * 100).toFixed(1)}%`.padStart(6);
    console.log(`  │ ${name} │${status} │  ${time} │  ${errors} │`);
  }

  console.log('  └──────────────────────────────────────┴──────────┴───────────┴──────────┘');

  // Score de resiliencia
  console.log('');
  const scoreColor = score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red';
  const scoreBar = progressBar(passed, total, 40);

  console.log(colorize(`  🏆 PUNTUACIÓN DE RESILIENCIA: ${score}% (${passed}/${total} pasaron)`, scoreColor));
  console.log(colorize(`     ${scoreBar}`, scoreColor));
  console.log('');

  if (score >= 80) {
    console.log(colorize('  ✨ VEREDICTO: El sistema es RESILIENTE bajo condiciones de estrés.', 'green'));
    console.log(colorize('     Puede manejar cargas significativas sin fallos críticos.', 'green'));
  } else if (score >= 60) {
    console.log(colorize('  ⚠️ VEREDICTO: Resiliencia ACEPTABLE con áreas de mejora.', 'yellow'));
    console.log(colorize('     El sistema funciona bajo carga moderada pero muestra debilidades.', 'yellow'));
  } else if (score >= 40) {
    console.log(colorize('  ⚠️ VEREDICTO: Resiliencia PARCIAL. Se requieren optimizaciones.', 'yellow'));
    console.log(colorize('     Cuellos de botella evidentes en operaciones concurrentes.', 'yellow'));
  } else {
    console.log(colorize('  🔴 VEREDICTO: El sistema es VULNERABLE bajo estrés.', 'red'));
    console.log(colorize('     Se necesitan mejoras críticas de rendimiento y escalabilidad.', 'red'));
  }

  console.log('');
  console.log(colorize(`  ⏱️  Tiempo total de ejecución: ${totalTime} segundos`, 'dim'));
  console.log(colorize(`  📅 Fecha: ${new Date().toLocaleString('es-ES')}`, 'dim'));
  console.log('');
}

// ─── Punto de entrada ─────────────────────────────────────

runChaosMonkey().catch(err => {
  console.error(colorize('\n  ❌ Error crítico ejecutando Chaos Monkey:', 'red'), err);
  process.exit(1);
});
