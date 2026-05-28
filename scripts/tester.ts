import { execSync } from 'child_process';

/**
 * ServiLocal Automated Test & Evaluation Script
 * --------------------------------------------
 * Este script realiza una evaluación rápida del estado del sistema,
 * verificando conectividad, base de datos y autenticación.
 */

const API_URL = 'http://localhost:3001/api';
const WEB_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\n🚀 Iniciando Evaluación Automática de ServiLocal...\n');

  const results: Record<string, { status: string; message: string }> = {
    backend: { status: 'PENDING', message: '' },
    frontend: { status: 'PENDING', message: '' },
    database: { status: 'PENDING', message: '' },
    adminAuth: { status: 'PENDING', message: '' },
  };

  // 1. Verificar Frontend
  try {
    const res = await fetch(WEB_URL);
    if (res.ok) {
      results.frontend = { status: '✅ OK', message: 'Servidor Next.js respondiendo' };
    } else {
      results.frontend = { status: '❌ FAIL', message: `Status: ${res.status}` };
    }
  } catch (e) {
    results.frontend = { status: '❌ FAIL', message: 'No se pudo conectar al frontend (3000)' };
  }

  // 2. Verificar Backend
  try {
    const res = await fetch(`${API_URL}/auth/me`); // endpoint que requiere auth pero responde status
    if (res.status !== 500) {
      results.backend = { status: '✅ OK', message: 'Servidor NestJS operativo' };
    } else {
      results.backend = { status: '❌ FAIL', message: `Error servidor: ${res.status}` };
    }
  } catch (e) {
    results.backend = { status: '❌ FAIL', message: 'No se pudo conectar al backend (3001)' };
  }

  // 3. Verificar Base de Datos (vía categorías)
  try {
    const res = await fetch(`${API_URL}/services/categories`);
    if (res.ok) {
      const data: any = await res.json();
      results.database = { status: '✅ OK', message: `DB conectada. ${data.items?.length || 0} categorías encontradas.` };
    } else {
      results.database = { status: '❌ FAIL', message: 'Error al consultar categorías' };
    }
  } catch (e) {
    results.database = { status: '❌ FAIL', message: 'Fallo de conexión de datos' };
  }

  // 4. Test de Login Admin (Verifica lógica de Auth)
  try {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@servilocal.com', password: 'Admin12345*' }),
    });

    if (loginRes.ok) {
      results.adminAuth = { status: '✅ OK', message: 'Credenciales de administrador válidas' };
    } else {
      results.adminAuth = { status: '❌ FAIL', message: 'Error de autenticación admin (revisa credenciales)' };
    }
  } catch (e) {
    results.adminAuth = { status: '❌ FAIL', message: 'Servicio de Auth no disponible' };
  }

  // --- REPORTE FINAL ---
  console.table(results);

  const allOk = Object.values(results).every(r => r.status.includes('OK'));
  if (allOk) {
    console.log('✨ EVALUACIÓN EXITOSA: El sistema es estable para nuevas modificaciones.\n');
  } else {
    console.log('⚠️ ADVERTENCIA: Se detectaron fallos. Revisa los servicios marcados con FAIL.\n');
  }
}

runTests().catch(err => {
  console.error('❌ Error crítico ejecutando el tester:', err);
  process.exit(1);
});
