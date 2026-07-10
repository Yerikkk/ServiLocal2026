import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL no está definido');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log('=== VERIFICANDO DATOS ACTUALES EN BASE DE DATOS ===\n');

  const users = await prisma.user.findMany();
  console.log(`📊 Usuarios totales: ${users.length}`);
  console.log(`   - ADMIN: ${users.filter(u => u.role === 'ADMIN').length}`);
  console.log(`   - CLIENT: ${users.filter(u => u.role === 'CLIENT').length}`);
  console.log(`   - PROVIDER: ${users.filter(u => u.role === 'PROVIDER').length}`);
  console.log(`   - SUPPORT: ${users.filter(u => u.role === 'SUPPORT').length}`);

  const services = await prisma.service.findMany();
  console.log(`\n📊 Servicios totales: ${services.length}`);

  const categories = await prisma.category.findMany();
  console.log(`📊 Categorías totales: ${categories.length}`);

  const providerProfiles = await prisma.providerProfile.findMany();
  console.log(`📊 Perfiles de proveedor: ${providerProfiles.length}`);

  const serviceRequests = await prisma.serviceRequest.findMany();
  console.log(`📊 Solicitudes de servicio: ${serviceRequests.length}`);

  console.log('\n=== LISTA DE USUARIOS ===');
  users.forEach(user => {
    console.log(`- ${user.email} | ${user.fullName} | ${user.role} | ${user.status}`);
  });

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
