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

  console.log('Generando servicios para proveedores...');

  const providers = await prisma.user.findMany({
    where: { role: 'PROVIDER' },
    include: { providerProfile: true },
  });

  const categories = await prisma.category.findMany();

  const serviceNames = [
    'Reparación eléctrica domiciliaria',
    'Instalación de puntos de luz',
    'Mantenimiento de sistema eléctrico',
    'Reparación de fugas de agua',
    'Instalación de grifería',
    'Desatascos de tuberías',
    'Limpieza profunda de hogar',
    'Limpieza de vidrios y ventanas',
    'Limpieza post-obra',
    'Reparación de muebles',
    'Fabricación de estanterías',
    'Restauración de madera',
    'Pintura interior de paredes',
    'Pintura exterior de fachadas',
    'Impermeabilización de techos',
    'Mantenimiento de jardines',
    'Poda de árboles',
    'Diseño de paisajes',
    'Apertura de cerraduras',
    'Cambio de cerraduras',
    'Instalación de cerraduras inteligentes',
    'Mantenimiento de aire acondicionado',
    'Instalación de aire acondicionado',
    'Recarga de gas refrigerante',
    'Albañilería general',
    'Construcción de muros',
    'Revestimiento de paredes',
    'Servicio de mudanza',
    'Embalaje de muebles',
    'Transporte de carga',
    'Reparación de computadoras',
    'Instalación de redes',
    'Soporte técnico',
  ];

  let serviceCount = 0;

  for (const provider of providers) {
    if (!provider.providerProfile) continue;

    const numServices = Math.floor(Math.random() * 4) + 2; // 2-5 servicios por proveedor

    for (let i = 0; i < numServices; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const serviceName = serviceNames[Math.floor(Math.random() * serviceNames.length)];

      await prisma.service.create({
        data: {
          providerUserId: provider.id,
          categoryId: category.id,
          name: serviceName,
          description: `Servicio profesional de ${serviceName.toLowerCase()} realizado por ${provider.fullName}. Calidad garantizada con más de 5 años de experiencia en el sector.`,
          referencePrice: Math.floor(Math.random() * 500) + 50,
          estimatedTime: ['1 hora', '2 horas', 'Medio día', '1 día'][Math.floor(Math.random() * 4)],
          isActive: true,
        },
      });
      serviceCount++;
    }
  }

  console.log(`✓ Generados ${serviceCount} servicios para ${providers.length} proveedores.`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
