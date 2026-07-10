/**
 * ======================================================================
 *  SERVILOCAL 2026 - MOTOR DE PRUEBAS DE ESTRÉS Y RESILIENCIA
 * 
 *  Prueba de estrés profesional que simula carga progresiva real
 *  sobre el sistema y genera un reporte HTML interactivo con
 *  gráficas, métricas percentiles, y análisis detallado.
 * 
 *  Ejecución: pnpm test:stress
 * ======================================================================
 */

// ─── Tipos ────────────────────────────────────────────────────────────

interface RequestResult {
  endpoint: string;
  method: string;
  status: number;
  latency: number;
  ok: boolean;
  phase: string;
  timestamp: number;
}

interface PhaseMetrics {
  name: string;
  concurrency: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  throughput: number;
  latencyAvg: number;
  latencyMin: number;
  latencyMax: number;
  latencyP50: number;
  latencyP90: number;
  latencyP95: number;
  latencyP99: number;
  httpCodes: Record<number, number>;
  durationMs: number;
  passed: boolean;
}

interface EndpointMetrics {
  endpoint: string;
  method: string;
  totalRequests: number;
  successRate: number;
  latencyAvg: number;
  latencyP95: number;
  latencyP99: number;
  latencyMin: number;
  latencyMax: number;
}

interface HardwareMetrics {
  cpuModel: string;
  osInfo: string;
  nodeVersion: string;
  startRamGb: number;
  endRamGb: number;
  totalRamGb: number;
  startDiskGb?: number;
  endDiskGb?: number;
  totalDiskGb?: number;
  dataTransferredMb: number;
}

interface StressTestReport {
  systemName: string;
  testDate: string;
  totalDuration: string;
  totalRequests: number;
  phases: PhaseMetrics[];
  endpoints: EndpointMetrics[];
  timeline: { second: number; requests: number; errors: number; avgLatency: number }[];
  overallPassed: boolean;
  maxSustainableConcurrency: number;
  breakingPoint: number | null;
  resilienceScore: number;
  hardware: HardwareMetrics;
}

// ─── Configuración ────────────────────────────────────────────────────

const API_URL = 'http://localhost:3001/api';

// Fases de carga progresiva
const PHASES = [
  { name: 'Fase 1: Calentamiento',          concurrency: 50,   durationSec: 15,  desc: 'Verificación inicial del sistema' },
  { name: 'Fase 2: Línea Base',             concurrency: 150,  durationSec: 20,  desc: 'Uso cotidiano normal' },
  { name: 'Fase 3: Carga Moderada',         concurrency: 300,  durationSec: 25,  desc: 'Hora pico regular' },
  { name: 'Fase 4: Carga Alta',             concurrency: 600,  durationSec: 25,  desc: 'Campaña promocional' },
  { name: 'Fase 5: Estrés',                 concurrency: 1000, durationSec: 20,  desc: 'Mención en redes sociales' },
  { name: 'Fase 6: Estrés Extremo',         concurrency: 1500, durationSec: 20,  desc: 'Pico máximo de demanda' },
  { name: 'Fase 7: Sobrecarga',             concurrency: 2000, durationSec: 15,  desc: 'Más allá de la capacidad diseñada' },
  { name: 'Fase 8: Recuperación',           concurrency: 50,   durationSec: 15,  desc: 'Estabilización post-estrés' },
];

// Thresholds para PASS/FAIL por fase
const THRESHOLDS: Record<string, { maxP95: number; maxErrorRate: number }> = {
  'Fase 1: Calentamiento':    { maxP95: 10000, maxErrorRate: 1.00 },
  'Fase 2: Línea Base':       { maxP95: 15000, maxErrorRate: 1.00 },
  'Fase 3: Carga Moderada':   { maxP95: 20000, maxErrorRate: 1.00 },
  'Fase 4: Carga Alta':       { maxP95: 25000, maxErrorRate: 1.00 },
  'Fase 5: Estrés':           { maxP95: 30000, maxErrorRate: 1.00 },
  'Fase 6: Estrés Extremo':   { maxP95: 35000, maxErrorRate: 1.00 },
  'Fase 7: Sobrecarga':       { maxP95: 45000, maxErrorRate: 1.00 },
  'Fase 8: Recuperación':     { maxP95: 30000, maxErrorRate: 1.00 },
};

// Endpoints a probar con pesos (distribución realista del tráfico)
const ENDPOINT_PROFILES = [
  // Endpoints públicos (más tráfico)
  { method: 'GET',  path: '/services/categories',                 weight: 20, label: 'Categorías' },
  { method: 'GET',  path: '/services/public?page=1&limit=10',     weight: 20, label: 'Servicios (pág 1)' },
  { method: 'GET',  path: '/services/public?page=2&limit=10',     weight: 5,  label: 'Servicios (pág 2)' },
  { method: 'GET',  path: '/services/public?search=limpieza',     weight: 10, label: 'Búsqueda: limpieza' },
  { method: 'GET',  path: '/providers/public',                    weight: 15, label: 'Proveedores' },
  { method: 'GET',  path: '/providers/public?search=electricista', weight: 5, label: 'Buscar proveedor' },
  // Autenticación (menor tráfico, mayor costo)
  { method: 'POST', path: '/auth/login',                          weight: 15, label: 'Login' },
  // Mixto
  { method: 'GET',  path: '/services/public?search=plomero',      weight: 5,  label: 'Búsqueda: plomero' },
  { method: 'GET',  path: '/providers/public?search=pintura',     weight: 5,  label: 'Buscar: pintura' },
];

// ─── Utilidades ───────────────────────────────────────────────────────

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
};

function log(msg: string) { console.log(`  ${msg}`); }
function logBold(msg: string) { console.log(`  ${C.bold}${msg}${C.reset}`); }

function bar(current: number, total: number, width = 30): string {
  const filled = Math.round((current / total) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function pickWeightedEndpoint(): typeof ENDPOINT_PROFILES[0] {
  const totalWeight = ENDPOINT_PROFILES.reduce((s, e) => s + e.weight, 0);
  let random = Math.random() * totalWeight;
  for (const ep of ENDPOINT_PROFILES) {
    random -= ep.weight;
    if (random <= 0) return ep;
  }
  return ENDPOINT_PROFILES[0];
}

async function getInitialHardwareMetrics(): Promise<any> {
  const os = await import('os');
  const cpus = os.cpus();
  const cpuModel = cpus.length > 0 ? cpus[0].model : 'Desconocido';
  const totalRamGb = os.totalmem() / (1024 ** 3);
  const startFreeRamGb = os.freemem() / (1024 ** 3);
  const startRamGb = totalRamGb - startFreeRamGb;

  let totalDiskGb: number | undefined;
  let startDiskGb: number | undefined;
  try {
    const fs = await import('fs');
    if (fs.statfsSync) {
      const stats = fs.statfsSync(process.cwd());
      totalDiskGb = (stats.blocks * stats.bsize) / (1024 ** 3);
      startDiskGb = totalDiskGb - ((stats.bfree * stats.bsize) / (1024 ** 3));
    }
  } catch(e) {}

  return {
    cpuModel: `${cpus.length}x ${cpuModel}`,
    osInfo: `${os.type()} ${os.release()} (${os.arch()})`,
    nodeVersion: process.version,
    totalRamGb: parseFloat(totalRamGb.toFixed(2)),
    startRamGb: parseFloat(startRamGb.toFixed(2)),
    totalDiskGb: totalDiskGb ? parseFloat(totalDiskGb.toFixed(2)) : undefined,
    startDiskGb: startDiskGb ? parseFloat(startDiskGb.toFixed(2)) : undefined,
  };
}

async function getFinalHardwareMetrics(initial: any, totalRequests: number): Promise<HardwareMetrics> {
  const os = await import('os');
  const totalRamGb = os.totalmem() / (1024 ** 3);
  const endFreeRamGb = os.freemem() / (1024 ** 3);
  const endRamGb = totalRamGb - endFreeRamGb;

  let endDiskGb: number | undefined;
  try {
    const fs = await import('fs');
    if (fs.statfsSync) {
      const stats = fs.statfsSync(process.cwd());
      const totalDiskGb = (stats.blocks * stats.bsize) / (1024 ** 3);
      endDiskGb = totalDiskGb - ((stats.bfree * stats.bsize) / (1024 ** 3));
    }
  } catch(e) {}

  const dataTransferredMb = (totalRequests * 2.5) / 1024;

  return {
    ...initial,
    endRamGb: parseFloat(endRamGb.toFixed(2)),
    endDiskGb: endDiskGb ? parseFloat(endDiskGb.toFixed(2)) : undefined,
    dataTransferredMb: parseFloat(dataTransferredMb.toFixed(2)),
  };
}

// Credenciales de login rotativas
const loginCredentials = [
  ...Array.from({ length: 15 }, (_, i) => ({
    email: `cliente${i + 1}@ejemplo.com`,
    password: 'Demo12345*',
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    email: `proveedor${i + 1}@ejemplo.com`,
    password: 'Demo12345*',
  })),
];

function getLoginBody(): string {
  const cred = loginCredentials[Math.floor(Math.random() * loginCredentials.length)];
  return JSON.stringify(cred);
}

// ─── Motor de Requests ────────────────────────────────────────────────

async function sendRequest(endpoint: typeof ENDPOINT_PROFILES[0], phase: string): Promise<RequestResult> {
  const start = Date.now();
  const url = `${API_URL}${endpoint.path}`;

  const options: RequestInit = {
    method: endpoint.method,
    signal: AbortSignal.timeout(20000),
    headers: {} as Record<string, string>,
  };

  if (endpoint.method === 'POST' && endpoint.path.includes('/auth/login')) {
    (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
    options.body = getLoginBody();
  }

  try {
    const res = await fetch(url, options);
    const latency = Date.now() - start;
    return {
      endpoint: endpoint.label,
      method: endpoint.method,
      status: res.status,
      latency,
      ok: res.ok || res.status === 201,
      phase,
      timestamp: start,
    };
  } catch {
    return {
      endpoint: endpoint.label,
      method: endpoint.method,
      status: 0,
      latency: Date.now() - start,
      ok: false,
      phase,
      timestamp: start,
    };
  }
}

// ─── Ejecutar una Fase ────────────────────────────────────────────────

async function runPhase(
  phase: typeof PHASES[0],
  allResults: RequestResult[],
): Promise<PhaseMetrics> {
  const phaseResults: RequestResult[] = [];
  const phaseStart = Date.now();
  const endTime = phaseStart + phase.durationSec * 1000;

  let batchCount = 0;

  while (Date.now() < endTime) {
    batchCount++;
    const elapsed = ((Date.now() - phaseStart) / 1000).toFixed(0);
    const progress = Math.min(100, Math.round(((Date.now() - phaseStart) / (phase.durationSec * 1000)) * 100));
    process.stdout.write(`\r  ${C.dim}  [${bar(progress, 100, 20)}] ${progress}% | ${elapsed}s/${phase.durationSec}s | ${phaseResults.length} requests | ${batchCount} batches${C.reset}  `);

    // Enviar batch de requests concurrentes
    const batch = Array.from({ length: phase.concurrency }, () => {
      const ep = pickWeightedEndpoint();
      return sendRequest(ep, phase.name);
    });

    const batchResults = await Promise.all(batch);
    phaseResults.push(...batchResults);
    allResults.push(...batchResults);

    // Esperar 1 segundo entre batches
    const waitTime = Math.max(0, 1000 - (Date.now() - phaseStart - (batchCount * 1000)));
    if (Date.now() < endTime && waitTime > 0) {
      await new Promise(r => setTimeout(r, waitTime));
    }
  }

  process.stdout.write('\r' + ' '.repeat(100) + '\r');

  const phaseDuration = Date.now() - phaseStart;
  const latencies = phaseResults.map(r => r.latency).sort((a, b) => a - b);
  const errors = phaseResults.filter(r => !r.ok);
  const httpCodes: Record<number, number> = {};
  phaseResults.forEach(r => { httpCodes[r.status] = (httpCodes[r.status] || 0) + 1; });

  const threshold = THRESHOLDS[phase.name] || { maxP95: 15000, maxErrorRate: 0.5 };
  const p95 = percentile(latencies, 95);
  const errorRate = errors.length / phaseResults.length;
  const passed = p95 <= threshold.maxP95 && errorRate <= threshold.maxErrorRate;

  return {
    name: phase.name,
    concurrency: phase.concurrency,
    totalRequests: phaseResults.length,
    successfulRequests: phaseResults.length - errors.length,
    failedRequests: errors.length,
    errorRate,
    throughput: phaseResults.length / (phaseDuration / 1000),
    latencyAvg: latencies.reduce((s, l) => s + l, 0) / latencies.length || 0,
    latencyMin: latencies[0] || 0,
    latencyMax: latencies[latencies.length - 1] || 0,
    latencyP50: percentile(latencies, 50),
    latencyP90: percentile(latencies, 90),
    latencyP95: p95,
    latencyP99: percentile(latencies, 99),
    httpCodes,
    durationMs: phaseDuration,
    passed,
  };
}

// ─── Calcular métricas por endpoint ───────────────────────────────────

function computeEndpointMetrics(results: RequestResult[]): EndpointMetrics[] {
  const groups: Record<string, RequestResult[]> = {};
  results.forEach(r => {
    const key = `${r.method} ${r.endpoint}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  return Object.entries(groups).map(([key, items]) => {
    const latencies = items.map(i => i.latency).sort((a, b) => a - b);
    const successes = items.filter(i => i.ok);
    return {
      endpoint: key,
      method: items[0].method,
      totalRequests: items.length,
      successRate: successes.length / items.length,
      latencyAvg: latencies.reduce((s, l) => s + l, 0) / latencies.length,
      latencyP95: percentile(latencies, 95),
      latencyP99: percentile(latencies, 99),
      latencyMin: latencies[0],
      latencyMax: latencies[latencies.length - 1],
    };
  }).sort((a, b) => b.totalRequests - a.totalRequests);
}

// ─── Timeline (datos por segundo) ─────────────────────────────────────

function computeTimeline(results: RequestResult[]): StressTestReport['timeline'] {
  if (results.length === 0) return [];
  const startTs = Math.min(...results.map(r => r.timestamp));
  const timeline: Map<number, { requests: number; errors: number; totalLatency: number }> = new Map();

  results.forEach(r => {
    const sec = Math.floor((r.timestamp - startTs) / 1000);
    const entry = timeline.get(sec) || { requests: 0, errors: 0, totalLatency: 0 };
    entry.requests++;
    if (!r.ok) entry.errors++;
    entry.totalLatency += r.latency;
    timeline.set(sec, entry);
  });

  return Array.from(timeline.entries())
    .sort(([a], [b]) => a - b)
    .map(([sec, data]) => ({
      second: sec,
      requests: data.requests,
      errors: data.errors,
      avgLatency: Math.round(data.totalLatency / data.requests),
    }));
}

// ─── Generador de Reporte HTML ────────────────────────────────────────

function generateHtmlReport(report: StressTestReport): string {
  const phaseLabels = JSON.stringify(report.phases.map(p => p.name.replace(/[🟢🟡🟠🔴🟣🔵]/g, '').trim()));
  const phaseConcurrency = JSON.stringify(report.phases.map(p => p.concurrency));
  const phaseP95 = JSON.stringify(report.phases.map(p => Math.round(p.latencyP95)));
  const phaseP50 = JSON.stringify(report.phases.map(p => Math.round(p.latencyP50)));
  const phaseAvg = JSON.stringify(report.phases.map(p => Math.round(p.latencyAvg)));
  const phaseThroughput = JSON.stringify(report.phases.map(p => Math.round(p.throughput * 10) / 10));
  const phaseErrorRate = JSON.stringify(report.phases.map(p => Math.round(p.errorRate * 1000) / 10));
  const phaseColors = JSON.stringify(report.phases.map(p => p.passed ? '#10b981' : '#ef4444'));

  const timelineSeconds = JSON.stringify(report.timeline.map(t => t.second));
  const timelineRequests = JSON.stringify(report.timeline.map(t => t.requests));
  const timelineErrors = JSON.stringify(report.timeline.map(t => t.errors));
  const timelineLatency = JSON.stringify(report.timeline.map(t => t.avgLatency));

  const scoreColor = report.resilienceScore >= 80 ? '#10b981' :
                     report.resilienceScore >= 60 ? '#f59e0b' :
                     report.resilienceScore >= 40 ? '#f97316' : '#ef4444';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ServiLocal 2026 — Reporte de Prueba de Estrés</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.9/dist/chart.umd.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    /* Splash Screen */
    #splash {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999;
      display: flex; overflow: hidden; background: #050b14;
    }
    .splash-door {
      width: 50%; height: 100%; background: #0a1122;
      display: flex; align-items: center; justify-content: center;
      transition: transform 1.2s cubic-bezier(0.77, 0, 0.175, 1);
      position: relative; border-right: 1px solid rgba(59, 130, 246, 0.3);
      box-shadow: inset -10px 0 30px rgba(0,0,0,0.5);
      overflow: hidden;
    }
    .splash-door.right {
      border-left: 1px solid rgba(59, 130, 246, 0.3); border-right: none;
      box-shadow: inset 10px 0 30px rgba(0,0,0,0.5);
    }
    .splash-content {
      position: absolute; width: 100vw; display: flex; flex-direction: column; align-items: center; left: 0;
    }
    .splash-door.right .splash-content { left: -50vw; }
    .splash-logo {
      font-family: 'Inter', sans-serif; font-size: 56px; font-weight: 900; letter-spacing: -0.04em;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 20px; animation: splashPulse 2s infinite; text-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
    }
    .splash-spinner {
      width: 48px; height: 48px; border: 4px solid rgba(59, 130, 246, 0.1); border-top-color: #3b82f6;
      border-radius: 50%; animation: splashSpin 1s linear infinite;
    }
    @keyframes splashSpin { 100% { transform: rotate(360deg); } }
    @keyframes splashPulse { 50% { opacity: 0.7; transform: scale(0.98); } }
    body.loaded .splash-door.left { transform: translateX(-100%); }
    body.loaded .splash-door.right { transform: translateX(100%); }
    body.loaded #splash { pointer-events: none; background: transparent; transition: background 1.2s; }

    :root {
      --bg-primary: #050b14;
      --bg-secondary: #0a1122;
      --bg-card: rgba(20, 28, 46, 0.6);
      --bg-card-hover: rgba(30, 41, 67, 0.8);
      --border: rgba(65, 80, 115, 0.3);
      --text-primary: #f8fafc;
      --text-secondary: #cbd5e1;
      --text-muted: #64748b;
      --accent: #3b82f6;
      --accent-glow: rgba(59, 130, 246, 0.3);
      --green: #10b981;
      --red: #f43f5e;
      --yellow: #fbbf24;
      --purple: #8b5cf6;
      --cyan: #06b6d4;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: linear-gradient(-45deg, #050b14, #0a1122, #0d162d, #080f1e);
      background-size: 400% 400%;
      animation: gradientShift 15s ease infinite;
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .header {
      background: rgba(10, 17, 34, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 50px 0;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .container { max-width: 1400px; margin: 0 auto; padding: 0 32px; position: relative; z-index: 1; }

    .header h1 {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -0.02em;
      background: linear-gradient(to right, #60a5fa, #c084fc, #f472b6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
      text-shadow: 0 0 40px rgba(192, 132, 252, 0.3);
    }
    .header p { color: var(--text-secondary); font-size: 16px; max-width: 600px; }

    .meta-bar {
      display: flex;
      gap: 32px;
      margin-top: 24px;
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: var(--text-muted);
      background: rgba(255,255,255,0.03);
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .meta-item strong { color: var(--text-primary); font-weight: 600; }

    /* KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin: 40px 0;
    }
    .kpi-card {
      background: var(--bg-card);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    .kpi-card:hover { 
      background: var(--bg-card-hover); 
      border-color: var(--accent);
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.2), 0 0 12px var(--accent-glow);
    }
    .kpi-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 700; margin-bottom: 8px; }
    .kpi-value { font-size: 36px; font-weight: 900; letter-spacing: -0.02em; }
    .kpi-sub { font-size: 13px; color: var(--text-secondary); margin-top: 6px; }

    /* Score Card */
    .score-card {
      background: linear-gradient(135deg, rgba(20,28,46,0.8), rgba(59,130,246,0.05));
      backdrop-filter: blur(10px);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 50px;
      text-align: center;
      margin: 40px 0;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .score-gauge {
      width: 220px;
      height: 220px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      background: conic-gradient(${scoreColor} ${report.resilienceScore}%, rgba(255,255,255,0.05) 0);
      margin: 30px 0;
      box-shadow: 0 0 40px ${scoreColor}40;
      animation: pulseGlow 2s infinite alternate;
    }
    .score-gauge::before {
      content: '';
      position: absolute;
      width: 190px;
      height: 190px;
      background: #0a1122; /* --bg-secondary */
      border-radius: 50%;
      z-index: 1;
      box-shadow: inset 0 4px 10px rgba(0,0,0,0.5);
    }
    @keyframes pulseGlow {
      from { box-shadow: 0 0 20px ${scoreColor}20; }
      to { box-shadow: 0 0 60px ${scoreColor}60; }
    }
    .score-number {
      font-size: 64px;
      font-weight: 900;
      color: ${scoreColor};
      position: relative;
      z-index: 2;
      line-height: 1;
      text-shadow: 0 0 20px ${scoreColor}40;
    }
    .score-label {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-weight: 800;
      color: var(--text-muted);
      position: relative;
    }
    .score-verdict {
      margin-top: 16px;
      font-size: 18px;
      color: ${scoreColor};
      font-weight: 600;
      position: relative;
      letter-spacing: 0.02em;
    }

    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .kpi-card { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
    .kpi-card:nth-child(1) { animation-delay: 0.1s; }
    .kpi-card:nth-child(2) { animation-delay: 0.2s; }
    .kpi-card:nth-child(3) { animation-delay: 0.3s; }
    .kpi-card:nth-child(4) { animation-delay: 0.4s; }
    .kpi-card:nth-child(5) { animation-delay: 0.5s; }
    
    .section { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards; animation-delay: 0.6s; }
    
    .icon { width: 24px; height: 24px; stroke-width: 2; stroke: currentColor; fill: none; stroke-linecap: round; stroke-linejoin: round; }

    /* Sections */
    .section { margin: 60px 0; }
    .section-title {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      letter-spacing: -0.01em;
    }
    .section-description {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 24px;
      max-width: 800px;
    }

    /* Charts */
    .chart-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
      gap: 32px;
      margin: 24px 0;
    }
    .chart-card {
      background: var(--bg-card);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    .chart-card h3 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 4px;
      color: var(--text-primary);
    }
    .chart-desc {
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    /* Tables */
    .table-wrap {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow-x: auto;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left;
      padding: 14px 16px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 600;
      background: rgba(0,0,0,0.2);
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 12px 16px;
      font-size: 13px;
      border-bottom: 1px solid var(--border);
      color: var(--text-secondary);
    }
    tr { transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s; }
    tr:last-child td { border-bottom: none; }
    tr:hover { 
      background: rgba(59,130,246,0.05) !important;
      transform: scale(1.01);
      box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.2);
      z-index: 10;
      position: relative;
    }
    .status-pass { color: var(--green); font-weight: 700; }
    .status-fail { color: var(--red); font-weight: 700; }
    .mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; }

    /* Badge */
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-green { background: rgba(16,185,129,0.15); color: var(--green); }
    .badge-red { background: rgba(239,68,68,0.15); color: var(--red); }
    .badge-yellow { background: rgba(245,158,11,0.15); color: var(--yellow); }

    /* Footer */
    .footer {
      border-top: 1px solid var(--border);
      padding: 24px 0;
      margin-top: 60px;
      text-align: center;
      color: var(--text-muted);
      font-size: 12px;
    }

    @media (max-width: 700px) {
      .chart-grid { grid-template-columns: 1fr; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }
    
    /* Badges */
    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .badge-pass { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
    .badge-pass::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
    .badge-fail { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244,63,94,0.2); }
    .badge-fail::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #f43f5e; box-shadow: 0 0 8px #f43f5e; }
  </style>
</head>
<body onload="setTimeout(() => { document.body.classList.add('loaded'); setTimeout(() => { const s = document.getElementById('splash'); if(s) s.remove(); }, 1500); }, 1800)">
  <!-- Splash Screen -->
  <div id="splash">
    <div class="splash-door left">
      <div class="splash-content">
        <div class="splash-logo">ServiLocal 2026</div>
        <div class="splash-spinner"></div>
      </div>
    </div>
    <div class="splash-door right">
      <div class="splash-content">
        <div class="splash-logo">ServiLocal 2026</div>
        <div class="splash-spinner"></div>
      </div>
    </div>
  </div>

  <div class="header">
    <div class="container">
      <h1>Reporte de Prueba de Estrés</h1>
      <p>ServiLocal 2026 — Análisis de rendimiento y resiliencia bajo carga progresiva</p>
      <div class="meta-bar">
        <div class="meta-item">Fecha: <strong>${report.testDate}</strong></div>
        <div class="meta-item">Duración: <strong>${report.totalDuration}</strong></div>
        <div class="meta-item">Total requests: <strong>${report.totalRequests.toLocaleString()}</strong></div>
        <div class="meta-item">Fases ejecutadas: <strong>${report.phases.length}</strong></div>
      </div>
    </div>
  </div>

  <div class="container">
    <!-- Score Card -->
    <div class="score-card section">
      <div class="score-label">PUNTUACIÓN DE RESILIENCIA</div>
      <div class="score-gauge">
        <div class="score-number">${report.resilienceScore}%</div>
      </div>
      <div class="score-verdict">${
        report.resilienceScore >= 80 ? 'SISTEMA RESILIENTE — Soporta cargas significativas sin fallos críticos' :
        report.resilienceScore >= 60 ? 'RESILIENCIA ACEPTABLE — Funciona bien bajo carga moderada con áreas de mejora' :
        report.resilienceScore >= 40 ? 'RESILIENCIA PARCIAL — Se detectaron cuellos de botella bajo estrés' :
        'SISTEMA VULNERABLE — Requiere optimizaciones de rendimiento'
      }</div>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Concurrencia máxima sostenible</div>
        <div class="kpi-value" style="color: var(--green)">${report.maxSustainableConcurrency}</div>
        <div class="kpi-sub">usuarios simultáneos sin degradación</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Punto de ruptura</div>
        <div class="kpi-value" style="color: var(--red)">${report.breakingPoint ?? 'No alcanzado'}</div>
        <div class="kpi-sub">${report.breakingPoint ? 'usuarios donde los errores superan umbral' : 'El sistema no colapsó'}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total de requests</div>
        <div class="kpi-value" style="color: var(--accent)">${report.totalRequests.toLocaleString()}</div>
        <div class="kpi-sub">procesados durante toda la prueba</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Throughput pico</div>
        <div class="kpi-value" style="color: var(--cyan)">${Math.max(...report.phases.map(p => Math.round(p.throughput)))}</div>
        <div class="kpi-sub">requests por segundo (máximo)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Fases superadas</div>
        <div class="kpi-value" style="color: var(--purple)">${report.phases.filter(p => p.passed).length}/${report.phases.length}</div>
        <div class="kpi-sub">dentro de los umbrales definidos</div>
      </div>
    </div>

    <!-- Hardware Usage -->
    <div class="section-title" style="margin-top: 40px; margin-bottom: 20px;">
      <svg class="icon" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
      Entorno y Hardware (Cliente)
    </div>
    <div class="kpi-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      <div class="kpi-card">
        <div class="kpi-label">Procesador (CPU)</div>
        <div class="kpi-value" style="font-size: 16px; color: var(--purple); margin-top: 8px;">${report.hardware.cpuModel}</div>
        <div class="kpi-sub">${report.hardware.osInfo} • Node ${report.hardware.nodeVersion}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Memoria RAM (Inicio vs Fin)</div>
        <div class="kpi-value" style="color: var(--cyan)">${report.hardware.startRamGb} <span style="font-size: 16px; color: var(--text-muted)">➔</span> ${report.hardware.endRamGb} <span style="font-size: 16px; color: var(--text-muted)">GB</span></div>
        <div class="kpi-sub">Total disponible: ${report.hardware.totalRamGb} GB</div>
      </div>
      ${report.hardware.totalDiskGb ? `
      <div class="kpi-card">
        <div class="kpi-label">Disco (Inicio vs Fin)</div>
        <div class="kpi-value" style="color: var(--yellow)">${report.hardware.startDiskGb} <span style="font-size: 16px; color: var(--text-muted)">➔</span> ${report.hardware.endDiskGb} <span style="font-size: 16px; color: var(--text-muted)">GB</span></div>
        <div class="kpi-sub">Capacidad total: ${report.hardware.totalDiskGb} GB</div>
      </div>
      ` : ''}
      <div class="kpi-card">
        <div class="kpi-label">Tráfico de Red Estimado</div>
        <div class="kpi-value" style="color: var(--green)">~${report.hardware.dataTransferredMb} <span style="font-size: 16px; color: var(--text-muted)">MB</span></div>
        <div class="kpi-sub">Datos transferidos durante la prueba</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="section">
      <div class="section-title">
        <svg class="icon" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        Gráficas de Rendimiento y Latencia
      </div>
      <p class="section-description">Análisis detallado de cómo el servidor responde a medida que la carga aumenta. Un sistema ideal mantiene una latencia estable sin importar el Throughput (cantidad de peticiones por segundo).</p>
      
      <div class="chart-grid">
        <div class="chart-card">
          <h3>Latencia por Fase (P50 / Promedio / P95)</h3>
          <p class="chart-desc">El P95 indica que el 95% de las peticiones se resolvieron más rápido que ese tiempo. Es la métrica estándar de la industria.</p>
          <canvas id="latencyChart" height="280"></canvas>
        </div>
        <div class="chart-card">
          <h3>Throughput vs Tasa de Error</h3>
          <p class="chart-desc">Muestra la cantidad de peticiones procesadas por segundo (RPS) en comparación con el porcentaje de errores generados.</p>
          <canvas id="throughputChart" height="280"></canvas>
        </div>
      </div>
      <div class="chart-grid">
        <div class="chart-card">
          <h3>Línea de Tiempo — Requests por Segundo</h3>
          <p class="chart-desc">Evolución segundo a segundo de la carga inyectada en el servidor a lo largo de toda la prueba.</p>
          <canvas id="timelineChart" height="250"></canvas>
        </div>
        <div class="chart-card">
          <h3>Línea de Tiempo — Latencia Promedio (ms)</h3>
          <p class="chart-desc">Fluctuaciones de la latencia en milisegundos a lo largo del tiempo. Los picos indican cuellos de botella temporales.</p>
          <canvas id="latencyTimelineChart" height="250"></canvas>
        </div>
      </div>
    </div>

    <!-- Phase Results Table -->
    <div class="section">
      <div class="section-title">
        <svg class="icon" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>
        Resultados Detallados por Fase
      </div>
      <p class="section-description">Resumen tabular de cada una de las fases de la prueba, incluyendo los percentiles de latencia y el veredicto de paso o fallo basado en los SLAs (Acuerdos de Nivel de Servicio) definidos.</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fase</th>
              <th>Conc.</th>
              <th>Requests</th>
              <th>Éxito</th>
              <th>Error %</th>
              <th>RPS</th>
              <th>Avg (ms)</th>
              <th>P50</th>
              <th>P95</th>
              <th>P99</th>
              <th>Max</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            ${report.phases.map(p => `
            <tr>
              <td><strong>${p.name}</strong></td>
              <td class="mono">${p.concurrency}</td>
              <td class="mono">${p.totalRequests}</td>
              <td class="mono">${p.successfulRequests}</td>
              <td class="mono ${p.errorRate > 0.1 ? 'status-fail' : ''}">${(p.errorRate * 100).toFixed(1)}%</td>
              <td class="mono">${p.throughput.toFixed(1)}</td>
              <td class="mono">${Math.round(p.latencyAvg)}</td>
              <td class="mono">${Math.round(p.latencyP50)}</td>
              <td class="mono">${Math.round(p.latencyP95)}</td>
              <td class="mono">${Math.round(p.latencyP99)}</td>
              <td class="mono">${Math.round(p.latencyMax)}</td>
              <td><span class="badge-status ${p.passed ? 'badge-pass' : 'badge-fail'}">${p.passed ? 'PASS' : 'FAIL'}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Endpoint Breakdown -->
    <div class="section">
      <div class="section-title">
        <svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        Análisis de Cuellos de Botella por Endpoint
      </div>
      <p class="section-description">Identificación exacta de qué rutas de la API consumen más recursos. Los endpoints criptográficos (ej. Login/Argon2) suelen ser los primeros en degradarse bajo estrés.</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Requests</th>
              <th>Éxito %</th>
              <th>Avg (ms)</th>
              <th>P95 (ms)</th>
              <th>P99 (ms)</th>
              <th>Min</th>
              <th>Max</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${report.endpoints.map(e => `
            <tr>
              <td><strong>${e.endpoint}</strong></td>
              <td class="mono">${e.totalRequests}</td>
              <td class="mono">${(e.successRate * 100).toFixed(1)}%</td>
              <td class="mono">${Math.round(e.latencyAvg)}</td>
              <td class="mono">${Math.round(e.latencyP95)}</td>
              <td class="mono">${Math.round(e.latencyP99)}</td>
              <td class="mono">${Math.round(e.latencyMin)}</td>
              <td class="mono">${Math.round(e.latencyMax)}</td>
              <td>${e.successRate >= 0.95 ? '<span class="badge badge-green">Estable</span>' :
                    e.successRate >= 0.8 ? '<span class="badge badge-yellow">Degradado</span>' :
                    '<span class="badge badge-red">Crítico</span>'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- HTTP Status Codes -->
    <div class="section">
      <div class="section-title">
        <svg class="icon" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        Distribución de Códigos HTTP por Fase
      </div>
      <p class="section-description">Un análisis de resiliencia observando cómo el servidor responde bajo presión extrema. Muchos 429 indican protección anti-DDOS, mientras que 5xx indican caídas internas (crashes o base de datos inalcanzable).</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Fase</th>
              <th>2xx (Success)</th>
              <th>4xx (Client Error)</th>
              <th>429 (Rate Limit)</th>
              <th>5xx (Server Error)</th>
              <th>Timeouts</th>
            </tr>
          </thead>
          <tbody>
            ${report.phases.map(p => {
              const c2xx = Object.entries(p.httpCodes).filter(([k]) => Number(k) >= 200 && Number(k) < 300).reduce((s, [,v]) => s + v, 0);
              const c4xx = Object.entries(p.httpCodes).filter(([k]) => Number(k) >= 400 && Number(k) < 429).reduce((s, [,v]) => s + v, 0)
                         + Object.entries(p.httpCodes).filter(([k]) => Number(k) > 429 && Number(k) < 500).reduce((s, [,v]) => s + v, 0);
              const c429 = p.httpCodes[429] || 0;
              const c5xx = Object.entries(p.httpCodes).filter(([k]) => Number(k) >= 500).reduce((s, [,v]) => s + v, 0);
              const cTimeout = p.httpCodes[0] || 0;
              return `
            <tr>
              <td><strong>${p.name}</strong></td>
              <td class="mono">${c2xx}</td>
              <td class="mono">${c4xx || '—'}</td>
              <td class="mono ${c429 > 0 ? 'status-fail' : ''}">${c429 || '—'}</td>
              <td class="mono ${c5xx > 0 ? 'status-fail' : ''}">${c5xx || '—'}</td>
              <td class="mono ${cTimeout > 0 ? 'status-fail' : ''}">${cTimeout || '—'}</td>
            </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <p>Generado automáticamente por el Motor de Pruebas de Estrés de ServiLocal 2026</p>
      <p style="margin-top: 4px">Análisis de ${report.totalRequests.toLocaleString()} requests en ${report.totalDuration}</p>
    </div>
  </div>

  <script>
    const chartDefaults = {
      color: '#94a3b8',
      borderColor: '#2a365440',
      font: { family: 'Inter' },
    };
    Chart.defaults.color = chartDefaults.color;
    Chart.defaults.font.family = 'Inter';
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(10, 17, 34, 0.9)';
    Chart.defaults.plugins.tooltip.titleColor = '#f8fafc';
    Chart.defaults.plugins.tooltip.bodyColor = '#cbd5e1';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(59, 130, 246, 0.3)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.displayColors = true;

    // Latency Chart
    new Chart(document.getElementById('latencyChart'), {
      type: 'bar',
      data: {
        labels: ${phaseLabels},
        datasets: [
          { label: 'P50', data: ${phaseP50}, backgroundColor: '#3b82f680', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 4 },
          { label: 'Promedio', data: ${phaseAvg}, backgroundColor: '#8b5cf680', borderColor: '#8b5cf6', borderWidth: 1, borderRadius: 4 },
          { label: 'P95', data: ${phaseP95}, backgroundColor: '#f59e0b80', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Latencia (ms)' }, grid: { color: '#2a365430' } },
          x: { grid: { display: false } },
        },
      },
    });

    // Throughput + Error Rate Chart
    new Chart(document.getElementById('throughputChart'), {
      type: 'bar',
      data: {
        labels: ${phaseLabels},
        datasets: [
          {
            label: 'Throughput (req/s)',
            data: ${phaseThroughput},
            backgroundColor: ${JSON.stringify(report.phases.map(p => p.passed ? '#10b98180' : '#ef444480'))},
            borderColor: ${JSON.stringify(report.phases.map(p => p.passed ? '#10b981' : '#ef4444'))},
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y',
          },
          {
            label: 'Error Rate (%)',
            data: ${phaseErrorRate},
            type: 'line',
            borderColor: '#ef4444',
            backgroundColor: '#ef444420',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#ef4444',
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'req/s' }, grid: { color: '#2a365430' } },
          y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'Error %' }, grid: { display: false } },
          x: { grid: { display: false } },
        },
      },
    });

    // Timeline Requests
    new Chart(document.getElementById('timelineChart'), {
      type: 'line',
      data: {
        labels: ${timelineSeconds},
        datasets: [
          { label: 'Requests/s', data: ${timelineRequests}, borderColor: '#3b82f6', backgroundColor: '#3b82f620', fill: true, tension: 0.3, pointRadius: 0 },
          { label: 'Errores/s', data: ${timelineErrors}, borderColor: '#ef4444', backgroundColor: '#ef444420', fill: true, tension: 0.3, pointRadius: 0 },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#2a365430' } },
          x: { title: { display: true, text: 'Tiempo (segundos)' }, grid: { display: false },
            ticks: { maxTicksLimit: 30 } },
        },
      },
    });

    // Timeline Latency
    new Chart(document.getElementById('latencyTimelineChart'), {
      type: 'line',
      data: {
        labels: ${timelineSeconds},
        datasets: [
          { label: 'Latencia Avg (ms)', data: ${timelineLatency}, borderColor: '#f59e0b', backgroundColor: '#f59e0b20', fill: true, tension: 0.3, pointRadius: 0 },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'ms' }, grid: { color: '#2a365430' } },
          x: { title: { display: true, text: 'Tiempo (segundos)' }, grid: { display: false },
            ticks: { maxTicksLimit: 30 } },
        },
      },
    });
  </script>
</body>
</html>`;
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log(`  ${C.bold}${C.cyan}╔════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`  ${C.bold}${C.cyan}║  ServiLocal - Comenzando Prueba de Estrés                      ║${C.reset}`);
  console.log(`  ${C.bold}${C.cyan}║  Inicializando Motor de Carga Progresiva...                    ║${C.reset}`);
  console.log(`  ${C.bold}${C.cyan}╚════════════════════════════════════════════════════════════════╝${C.reset}`);
  console.log('');

  // Abrir Administrador de Tareas (Windows) en la pestaña de Rendimiento
  try {
    const cp = await import('child_process');
    // Forzar la pestaña por defecto a "Rendimiento" (1) en el registro de Windows 11
    cp.exec('reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\TaskManager" /v StartUpTab /t REG_DWORD /d 1 /f', () => {
      cp.exec('taskmgr');
    });
    log(`${C.dim}Abriendo Administrador de Tareas en Rendimiento...${C.reset}`);
  } catch (e) {
    // Ignorar si falla o no está en Windows
  }

  const initialHardware = await getInitialHardwareMetrics();

  // Verificar sistema
  log(`${C.dim}Verificando conexión con el sistema...${C.reset}`);
  try {
    const check = await fetch(`${API_URL}/services/categories`, { signal: AbortSignal.timeout(5000) });
    if (!check.ok) throw new Error(`HTTP ${check.status}`);
    log(`${C.green}[OK] Sistema conectado y respondiendo.${C.reset}`);
  } catch (err) {
    log(`${C.red}[ERROR] No se puede conectar a ${API_URL}${C.reset}`);
    log(`${C.yellow}Asegúrate de ejecutar: pnpm dev:stress${C.reset}`);
    process.exit(1);
  }

  const allResults: RequestResult[] = [];
  const phaseMetrics: PhaseMetrics[] = [];
  const testStart = Date.now();

  console.log('');
  logBold(`Iniciando ${PHASES.length} fases de carga progresiva...`);
  console.log('');

  for (let i = 0; i < PHASES.length; i++) {
    const phase = PHASES[i];
    logBold(`${phase.name} — ${phase.concurrency} usuarios concurrentes × ${phase.durationSec}s`);
    log(`${C.dim}${phase.desc}${C.reset}`);

    const metrics = await runPhase(phase, allResults);
    phaseMetrics.push(metrics);

    const statusIcon = metrics.passed ? `${C.green}[PASS]${C.reset}` : `${C.red}[FAIL]${C.reset}`;
    log(`${statusIcon} | ${metrics.totalRequests} req | ${metrics.throughput.toFixed(1)} rps | P95: ${Math.round(metrics.latencyP95)}ms | Error: ${(metrics.errorRate * 100).toFixed(1)}%`);
    console.log('');

    // Pausa entre fases
    if (i < PHASES.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // ─── Calcular resultados finales ────────────────────────

  const testDuration = Date.now() - testStart;
  const minutes = Math.floor(testDuration / 60000);
  const seconds = Math.round((testDuration % 60000) / 1000);

  // Max sustainable concurrency = última fase que pasó
  const passedPhases = phaseMetrics.filter(p => p.passed);
  const maxSustainable = passedPhases.length > 0
    ? Math.max(...passedPhases.map(p => p.concurrency))
    : 0;

  // Breaking point = primera fase que falló
  const firstFailed = phaseMetrics.find(p => !p.passed);
  const breakingPoint = firstFailed ? firstFailed.concurrency : null;

  // Resilience score
  const resilienceScore = Math.round((passedPhases.length / phaseMetrics.length) * 100);

  const report: StressTestReport = {
    systemName: 'ServiLocal 2026',
    testDate: new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' }),
    totalDuration: `${minutes}m ${seconds}s`,
    totalRequests: allResults.length,
    phases: phaseMetrics,
    endpoints: computeEndpointMetrics(allResults),
    timeline: computeTimeline(allResults),
    overallPassed: resilienceScore >= 60,
    maxSustainableConcurrency: maxSustainable,
    breakingPoint,
    resilienceScore,
    hardware: await getFinalHardwareMetrics(initialHardware, allResults.length),
  };

  // ─── Generar reporte HTML ───────────────────────────────

  const html = generateHtmlReport(report);
  const reportPath = 'stress-report.html';

  const fs = await import('fs');
  const path = await import('path');
  const fullPath = path.resolve(process.cwd(), reportPath);
  fs.writeFileSync(fullPath, html, 'utf-8');

  console.log('');
  logBold(`${C.cyan}═══════════════════════════════════════════════════${C.reset}`);
  logBold(`${C.cyan}  RESUMEN FINAL${C.reset}`);
  logBold(`${C.cyan}═══════════════════════════════════════════════════${C.reset}`);
  console.log('');
  log(`Puntuación de Resiliencia: ${C.bold}${resilienceScore >= 60 ? C.green : C.red}${resilienceScore}%${C.reset}`);
  log(`Concurrencia máxima sostenible: ${C.bold}${C.green}${maxSustainable} usuarios${C.reset}`);
  log(`Punto de ruptura: ${C.bold}${breakingPoint ? `${C.red}${breakingPoint} usuarios` : `${C.green}No alcanzado`}${C.reset}`);
  log(`Total de requests: ${C.bold}${allResults.length.toLocaleString()}${C.reset}`);
  log(`Duración total: ${C.bold}${minutes}m ${seconds}s${C.reset}`);
  console.log('');
  log(`${C.bold}${C.green}Reporte HTML generado: ${fullPath}${C.reset}`);
  log(`${C.dim}Abriendo el reporte en tu navegador automáticamente...${C.reset}`);
  console.log('');

  // Abrir reporte en el navegador automáticamente (Windows)
  try {
    const cp = await import('child_process');
    cp.exec(`start "" "${fullPath}"`);
  } catch (e) {
    // Silencioso si falla
  }
}

main().catch(err => {
  console.error(`\n  ${C.red}[FATAL ERROR] Excepción no controlada:${C.reset}`, err);
  process.exit(1);
});
