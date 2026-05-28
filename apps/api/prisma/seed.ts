import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  UserRole,
  UserStatus,
  ServiceCategory,
  ServiceRequestStatus,
} from '@prisma/client';

const defaultCategories = [
  { name: 'Electricidad', slug: 'electricidad', icon: 'Zap', sortOrder: 1 },
  { name: 'Plomería', slug: 'plomeria', icon: 'Droplets', sortOrder: 2 },
  { name: 'Limpieza', slug: 'limpieza', icon: 'Sparkles', sortOrder: 3 },
  { name: 'Carpintería', slug: 'carpinteria', icon: 'Hammer', sortOrder: 4 },
  { name: 'Pintura', slug: 'pintura', icon: 'Paintbrush', sortOrder: 5 },
  { name: 'Jardinería', slug: 'jardineria', icon: 'Trees', sortOrder: 6 },
  { name: 'Cerrajería', slug: 'cerrajeria', icon: 'KeyRound', sortOrder: 7 },
  { name: 'Aire acondicionado', slug: 'aire-acondicionado', icon: 'Wind', sortOrder: 8 },
  { name: 'Albañilería', slug: 'albanileria', icon: 'Wrench', sortOrder: 9 },
  { name: 'Mudanzas', slug: 'mudanzas', icon: 'Truck', sortOrder: 10 },
  { name: 'Tecnología', slug: 'tecnologia', icon: 'Monitor', sortOrder: 11 },
  { name: 'Otro servicio', slug: 'otro-servicio', icon: 'MoreHorizontal', sortOrder: 99 },
];

const firstNames = ['Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Carmen', 'Carlos', 'Laura', 'Miguel', 'Sofía', 'José', 'Lucía', 'Jorge', 'Elena', 'Diego', 'Patricia', 'Roberto', 'Marta', 'Fernando', 'Paula'];
const lastNames = ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez'];
const serviceZones = ['Talara Alta', 'Talara Centro', 'Punta Arenas', 'Los Órganos', 'Máncora', 'Negritos', 'Lobitos', 'El Alto'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const adminSeedPassword = process.env.ADMIN_SEED_PASSWORD;
  const demoUserPassword = process.env.DEMO_USER_PASSWORD;
  const e2eTestPassword = process.env.E2E_TEST_PASSWORD;

  if (!connectionString) {
    throw new Error('DATABASE_URL no está definido');
  }

  if (!adminSeedPassword) {
    throw new Error('ADMIN_SEED_PASSWORD no está definido');
  }

  if (!demoUserPassword) {
    throw new Error('DEMO_USER_PASSWORD no está definido');
  }

  if (!e2eTestPassword) {
    throw new Error('E2E_TEST_PASSWORD no está definido');
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  const prisma = new PrismaClient({ adapter });

  console.log('Seeding Database...');

  // 1. Categories
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, sortOrder: cat.sortOrder },
    });
  }

  const adminPasswordHash = await argon2.hash(adminSeedPassword);
  const demoPasswordHash = await argon2.hash(demoUserPassword);

  // 2. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@servilocal.com' },
    update: {
      fullName: 'Administrador',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'admin@servilocal.com',
      fullName: 'Administrador',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // 3. Create 20 Providers
  const providerIds: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const fn = getRandomElement(firstNames);
    const ln = getRandomElement(lastNames);
    const email = `proveedor${i}@ejemplo.com`;
    const category = getRandomElement(Object.values(ServiceCategory));

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName: `${fn} ${ln}`,
        passwordHash: demoPasswordHash,
        role: UserRole.PROVIDER,
        status: UserStatus.ACTIVE,
        phone: `9${Math.floor(10000000 + Math.random() * 90000000)}`,
        trustScore: Math.floor(Math.random() * 60) + 40,
        providerProfile: {
          create: {
            ruc: `10${Math.floor(100000000 + Math.random() * 900000000)}`,
            businessName: `Servicios ${ln} EIRL`,
            category,
            customServiceName: category === ServiceCategory.OTHER ? 'Reparación General' : null,
            specialty: 'Mantenimiento integral y reparaciones rápidas',
            serviceZone: getRandomElement(serviceZones),
            description: `Soy ${fn}, ofrezco servicios profesionales de alta calidad. Tengo más de 5 años de experiencia brindando soluciones garantizadas y eficientes a mis clientes en toda la zona.`,
            isVerified: Math.random() > 0.3,
          },
        },
      },
    });
    providerIds.push(user.id);
  }
  console.log('Generated 20 providers.');

  // 4. Create 15 Clients
  const clientIds: string[] = [];
  for (let i = 1; i <= 15; i++) {
    const fn = getRandomElement(firstNames);
    const ln = getRandomElement(lastNames);
    const email = `cliente${i}@ejemplo.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName: `${fn} ${ln}`,
        passwordHash: demoPasswordHash,
        role: UserRole.CLIENT,
        status: UserStatus.ACTIVE,
        phone: `9${Math.floor(10000000 + Math.random() * 90000000)}`,
      },
    });
    clientIds.push(user.id);
  }
  console.log('Generated 15 clients.');

  // 5. Create Service Requests
  let requestCount = 0;
  for (const clientId of clientIds) {
    const numRequests = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numRequests; i++) {
      const providerId = getRandomElement(providerIds);
      const statuses = Object.values(ServiceRequestStatus);
      const status = getRandomElement(statuses);

      await prisma.serviceRequest.create({
        data: {
          clientUserId: clientId,
          providerUserId: providerId,
          serviceTitle: 'Reparación en domicilio',
          message: 'Hola, me gustaría saber si tienen disponibilidad para este trabajo.',
          serviceZone: getRandomElement(serviceZones),
          preferredDate: new Date(Date.now() + Math.random() * 10000000000),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status,
        },
      });
      requestCount++;
    }
  }
  console.log(`Generated ${requestCount} service requests.`);

  // 6. Generate some Audit Logs for realism
  for (let i = 0; i < 20; i++) {
    await prisma.auditLog.create({
      data: {
        actorUserId: getRandomElement([...clientIds, ...providerIds]),
        action: 'PROFILE_UPDATED',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
  }
  console.log('Generated 20 audit logs.');

  // ─────────────────────────────────────────────────────────────────────────
  // 7. E2E Test Users
  //    Usuarios dedicados para las pruebas automatizadas de Playwright.
  //    Usan upsert puro: se crean si no existen, se actualizan si ya están.
  //    NUNCA eliminan ni afectan registros existentes.
  //    Contraseña: valor de E2E_TEST_PASSWORD en .env (actualmente "Test1234!")
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nSeeding E2E test users...');

  const e2ePasswordHash = await argon2.hash(e2eTestPassword);

  // 7a. Cliente de prueba E2E
  const e2eClient = await prisma.user.upsert({
    where: { email: 'cliente@servilocal.test' },
    update: {
      fullName: 'Carlos Prueba Cliente',
      passwordHash: e2ePasswordHash,
      role: UserRole.CLIENT,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'cliente@servilocal.test',
      fullName: 'Carlos Prueba Cliente',
      passwordHash: e2ePasswordHash,
      role: UserRole.CLIENT,
      status: UserStatus.ACTIVE,
      phone: '987654321',
    },
  });
  console.log(`  ✓ E2E CLIENT   → ${e2eClient.email}`);

  // 7b. Proveedor de prueba E2E (con ProviderProfile)
  const e2eProvider = await prisma.user.upsert({
    where: { email: 'proveedor@servilocal.test' },
    update: {
      fullName: 'Ana Prueba Proveedora',
      passwordHash: e2ePasswordHash,
      role: UserRole.PROVIDER,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'proveedor@servilocal.test',
      fullName: 'Ana Prueba Proveedora',
      passwordHash: e2ePasswordHash,
      role: UserRole.PROVIDER,
      status: UserStatus.ACTIVE,
      phone: '987654322',
    },
  });

  // Crear o actualizar el ProviderProfile asociado
  await prisma.providerProfile.upsert({
    where: { userId: e2eProvider.id },
    update: {
      businessName: 'Servicios E2E Prueba EIRL',
      serviceZone: 'Talara Centro',
      description: 'Perfil de proveedor creado exclusivamente para pruebas E2E automatizadas.',
    },
    create: {
      userId: e2eProvider.id,
      ruc: '10999999991',
      businessName: 'Servicios E2E Prueba EIRL',
      category: ServiceCategory.ELECTRICIDAD,
      specialty: 'Pruebas automatizadas',
      serviceZone: 'Talara Centro',
      description: 'Perfil de proveedor creado exclusivamente para pruebas E2E automatizadas.',
      isVerified: true,
    },
  });
  console.log(`  ✓ E2E PROVIDER → ${e2eProvider.email}`);

  // 7c. Administrador de prueba E2E
  const e2eAdmin = await prisma.user.upsert({
    where: { email: 'admin@servilocal.test' },
    update: {
      fullName: 'Admin Prueba Sistema',
      passwordHash: e2ePasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'admin@servilocal.test',
      fullName: 'Admin Prueba Sistema',
      passwordHash: e2ePasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      phone: '987654323',
    },
  });
  console.log(`  ✓ E2E ADMIN    → ${e2eAdmin.email}`);

  // 7d. Soporte de prueba E2E
  const e2eSupport = await prisma.user.upsert({
    where: { email: 'soporte@servilocal.test' },
    update: {
      fullName: 'Soporte Prueba Equipo',
      passwordHash: e2ePasswordHash,
      role: UserRole.SUPPORT,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'soporte@servilocal.test',
      fullName: 'Soporte Prueba Equipo',
      passwordHash: e2ePasswordHash,
      role: UserRole.SUPPORT,
      status: UserStatus.ACTIVE,
      phone: '987654324',
    },
  });
  console.log(`  ✓ E2E SUPPORT  → ${e2eSupport.email}`);

  console.log('\nSeeding completed successfully!');
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});