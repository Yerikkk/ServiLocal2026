import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL no está definido');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log('Obteniendo lista de usuarios...');

  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' },
  });

  let output = '# Usuarios Registrados en ServiLocal2026\n\n';
  output += `Total de usuarios: ${users.length}\n`;
  output += `Fecha de generación: ${new Date().toLocaleString('es-PE')}\n\n`;

  output += '## Por Rol:\n\n';
  
  const admins = users.filter(u => u.role === 'ADMIN');
  const clients = users.filter(u => u.role === 'CLIENT');
  const providers = users.filter(u => u.role === 'PROVIDER');
  const support = users.filter(u => u.role === 'SUPPORT');

  output += `### ADMIN (${admins.length})\n`;
  admins.forEach(u => {
    output += `- ${u.email} | ${u.fullName} | Estado: ${u.status}\n`;
  });

  output += `\n### CLIENT (${clients.length})\n`;
  clients.forEach(u => {
    output += `- ${u.email} | ${u.fullName} | Estado: ${u.status}\n`;
  });

  output += `\n### PROVIDER (${providers.length})\n`;
  providers.forEach(u => {
    output += `- ${u.email} | ${u.fullName} | Estado: ${u.status} | Confianza: ${u.trustScore}\n`;
  });

  output += `\n### SUPPORT (${support.length})\n`;
  support.forEach(u => {
    output += `- ${u.email} | ${u.fullName} | Estado: ${u.status}\n`;
  });

  output += '\n## Lista Completa:\n\n';
  output += '| Email | Nombre | Rol | Estado | Confianza | Puntos SL |\n';
  output += '|-------|--------|-----|--------|-----------|----------|\n';
  
  users.forEach(u => {
    output += `| ${u.email} | ${u.fullName} | ${u.role} | ${u.status} | ${u.trustScore} | ${u.slPoints} |\n`;
  });

  output += '\n## Credenciales de Prueba:\n\n';
  output += '### Usuario Admin:\n';
  output += '- Email: admin@servilocal.com\n';
  output += '- Contraseña: Admin12345*\n\n';
  
  output += '### Usuarios E2E (Pruebas Automatizadas):\n';
  output += '- Email: cliente@servilocal.test | Contraseña: Test1234!\n';
  output += '- Email: proveedor@servilocal.test | Contraseña: Test1234!\n';
  output += '- Email: admin@servilocal.test | Contraseña: Test1234!\n';
  output += '- Email: soporte@servilocal.test | Contraseña: Test1234!\n\n';

  output += '### Usuarios Demo (Proveedores y Clientes):\n';
  output += '- Email: proveedor1@ejemplo.com | Contraseña: Demo12345*\n';
  output += '- Email: cliente1@ejemplo.com | Contraseña: Demo12345*\n';
  output += '- (Y así sucesivamente hasta proveedor20 y cliente15)\n';

  // Guardar en archivo
  const outputPath = path.join(__dirname, '../../../archivos_lectura/USUARIOS_REGISTRADOS.md');
  fs.writeFileSync(outputPath, output);
  
  console.log(`✓ Archivo creado: ${outputPath}`);
  console.log(`✓ Total usuarios: ${users.length}`);
  
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
