import 'dotenv/config';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  UserRole,
  UserStatus,
  ServiceRequestStatus,
} from '@prisma/client';

/* ─── Category definitions ────────────────────────────────────────── */

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

/* ─── Services per category ───────────────────────────────────────── */

const servicesByCategory: Record<string, Array<{ name: string; description: string; minPrice: number; maxPrice: number; times: string[] }>> = {
  electricidad: [
    { name: 'Reparación eléctrica domiciliaria', description: 'Diagnóstico y reparación de fallas eléctricas en el hogar. Incluye revisión de tablero eléctrico, circuitos y puntos de energía.', minPrice: 80, maxPrice: 250, times: ['1-2 horas', '2-3 horas'] },
    { name: 'Instalación de puntos de luz', description: 'Instalación profesional de nuevos puntos de luz, interruptores y tomacorrientes con cableado normado.', minPrice: 60, maxPrice: 180, times: ['1 hora', '2 horas'] },
    { name: 'Mantenimiento de tablero eléctrico', description: 'Revisión completa del tablero eléctrico, ajuste de llaves térmicas, verificación de puesta a tierra y balanceo de cargas.', minPrice: 120, maxPrice: 300, times: ['2 horas', '3 horas'] },
    { name: 'Instalación de luminarias y lámparas', description: 'Montaje e instalación de todo tipo de luminarias: empotradas, colgantes, LED y apliques de pared.', minPrice: 40, maxPrice: 150, times: ['30 min', '1 hora'] },
    { name: 'Cableado estructurado residencial', description: 'Tendido de cableado eléctrico para viviendas nuevas o ampliaciones. Trabajo con materiales certificados.', minPrice: 200, maxPrice: 800, times: ['Medio día', '1 día'] },
  ],
  plomeria: [
    { name: 'Reparación de fugas de agua', description: 'Detección y reparación de fugas en tuberías, grifos, tanques y conexiones. Trabajo garantizado sin romper paredes innecesariamente.', minPrice: 60, maxPrice: 200, times: ['1 hora', '2 horas'] },
    { name: 'Instalación de grifería', description: 'Instalación profesional de grifos, mezcladores, duchas y accesorios de baño y cocina de cualquier marca.', minPrice: 50, maxPrice: 120, times: ['30 min', '1 hora'] },
    { name: 'Desatascos de tuberías', description: 'Servicio de destape y limpieza de tuberías obstruidas. Uso de equipo profesional para un trabajo limpio y efectivo.', minPrice: 80, maxPrice: 250, times: ['1 hora', '2 horas'] },
    { name: 'Instalación de terma', description: 'Instalación completa de termas eléctricas y a gas, incluyendo conexiones de agua y desagüe.', minPrice: 150, maxPrice: 350, times: ['2-3 horas', 'Medio día'] },
    { name: 'Mantenimiento de cisterna', description: 'Limpieza, desinfección y reparación de cisternas y tanques de agua elevados.', minPrice: 100, maxPrice: 280, times: ['2 horas', '3 horas'] },
  ],
  limpieza: [
    { name: 'Limpieza profunda de hogar', description: 'Limpieza integral del hogar: pisos, baños, cocina, ventanas y áreas comunes. Incluimos productos ecológicos de primera calidad.', minPrice: 80, maxPrice: 250, times: ['3-4 horas', 'Medio día'] },
    { name: 'Limpieza de vidrios y ventanas', description: 'Limpieza profesional de vidrios, mamparas y ventanas interiores y exteriores con productos especializados.', minPrice: 50, maxPrice: 150, times: ['1-2 horas', '2-3 horas'] },
    { name: 'Limpieza post-obra', description: 'Limpieza especializada después de trabajos de construcción o remodelación. Retiro de escombros, polvo y residuos.', minPrice: 150, maxPrice: 400, times: ['Medio día', '1 día'] },
    { name: 'Desinfección de espacios', description: 'Servicio de desinfección profunda con nebulización o aspersión para hogares y oficinas.', minPrice: 100, maxPrice: 300, times: ['1-2 horas', '2-3 horas'] },
    { name: 'Limpieza de muebles tapizados', description: 'Lavado y desinfección de sofás, sillones, colchones y alfombras con equipo profesional de inyección-extracción.', minPrice: 60, maxPrice: 200, times: ['1-2 horas', '2-3 horas'] },
  ],
  carpinteria: [
    { name: 'Reparación de muebles', description: 'Arreglo de muebles dañados: puertas que no cierran, cajones rotos, bisagras flojas y restauración de acabados.', minPrice: 60, maxPrice: 200, times: ['1-2 horas', '2-3 horas'] },
    { name: 'Fabricación de estanterías', description: 'Diseño y fabricación de estantes, repisas y libreros a medida. Trabajo en madera, melamina o MDF.', minPrice: 150, maxPrice: 500, times: ['1 día', '2 días'] },
    { name: 'Restauración de puertas', description: 'Restauración completa de puertas de madera: lijado, masillado, pintura o barniz y cambio de herrajes.', minPrice: 100, maxPrice: 350, times: ['Medio día', '1 día'] },
    { name: 'Instalación de closets', description: 'Fabricación e instalación de closets y guardarropas empotrados a medida con acabados de primera.', minPrice: 300, maxPrice: 1200, times: ['2 días', '3 días'] },
    { name: 'Armado de muebles', description: 'Servicio de armado profesional de muebles comprados: escritorios, camas, estantes y más.', minPrice: 40, maxPrice: 120, times: ['1 hora', '2 horas'] },
  ],
  pintura: [
    { name: 'Pintura interior de paredes', description: 'Pintado profesional de interiores con preparación de superficie, empastado y acabado impecable en látex o acrílico.', minPrice: 100, maxPrice: 400, times: ['1 día', '2 días'] },
    { name: 'Pintura exterior de fachadas', description: 'Pintado de fachadas y exteriores con pintura resistente a la intemperie. Incluye preparación y protección de áreas.', minPrice: 200, maxPrice: 800, times: ['2 días', '3 días'] },
    { name: 'Impermeabilización de techos', description: 'Aplicación de impermeabilizante profesional en techos y azoteas para prevenir filtraciones y humedad.', minPrice: 150, maxPrice: 500, times: ['1 día', '2 días'] },
    { name: 'Empastado y resane de paredes', description: 'Preparación profesional de superficies: empastado, resane de grietas, lijado y aplicación de base.', minPrice: 80, maxPrice: 300, times: ['Medio día', '1 día'] },
    { name: 'Pintura decorativa', description: 'Acabados decorativos especiales: estuco veneciano, efecto piedra, degradados y murales artísticos.', minPrice: 200, maxPrice: 600, times: ['1 día', '2 días'] },
  ],
  jardineria: [
    { name: 'Mantenimiento de jardines', description: 'Servicio completo de mantenimiento: poda, riego, abono, control de plagas y limpieza de áreas verdes.', minPrice: 60, maxPrice: 200, times: ['2-3 horas', 'Medio día'] },
    { name: 'Poda de árboles', description: 'Poda técnica de árboles y arbustos: formación, aclareo y reducción. Incluye retiro de residuos vegetales.', minPrice: 80, maxPrice: 300, times: ['2 horas', 'Medio día'] },
    { name: 'Diseño de jardines', description: 'Diseño paisajístico personalizado con selección de especies, distribución de plantas y plan de riego.', minPrice: 150, maxPrice: 500, times: ['1 día', '2 días'] },
    { name: 'Instalación de césped', description: 'Instalación de césped natural o artificial, incluyendo preparación del terreno y sistema de drenaje.', minPrice: 200, maxPrice: 800, times: ['1 día', '2 días'] },
    { name: 'Control de plagas en jardín', description: 'Fumigación y tratamiento fitosanitario para proteger tus plantas de plagas, hongos y enfermedades.', minPrice: 70, maxPrice: 180, times: ['1 hora', '2 horas'] },
  ],
  cerrajeria: [
    { name: 'Apertura de cerraduras', description: 'Apertura de puertas sin daño con técnicas profesionales. Servicio disponible las 24 horas.', minPrice: 40, maxPrice: 120, times: ['15-30 min', '30 min'] },
    { name: 'Cambio de cerraduras', description: 'Reemplazo de cerraduras de todo tipo: sobreponer, embutir, multipunto. Marcas reconocidas con garantía.', minPrice: 60, maxPrice: 200, times: ['30 min', '1 hora'] },
    { name: 'Instalación de cerraduras digitales', description: 'Instalación de cerraduras inteligentes con código, huella dactilar o app móvil para mayor seguridad.', minPrice: 150, maxPrice: 400, times: ['1 hora', '2 horas'] },
    { name: 'Duplicado de llaves', description: 'Duplicado profesional de llaves de seguridad, multipunto, automotrices y de alta seguridad.', minPrice: 20, maxPrice: 80, times: ['10-15 min', '30 min'] },
    { name: 'Refuerzo de seguridad', description: 'Instalación de cerrojos adicionales, mirillas digitales, cadenas de seguridad y barras anti-palanca.', minPrice: 80, maxPrice: 250, times: ['1 hora', '2 horas'] },
  ],
  'aire-acondicionado': [
    { name: 'Mantenimiento de aire acondicionado', description: 'Limpieza completa de filtros, serpentines, drenaje y verificación de gas refrigerante para óptimo rendimiento.', minPrice: 80, maxPrice: 200, times: ['1 hora', '2 horas'] },
    { name: 'Instalación de aire acondicionado', description: 'Instalación profesional de equipos split, ventana o cassette con canalización de tuberías y cableado eléctrico.', minPrice: 200, maxPrice: 600, times: ['Medio día', '1 día'] },
    { name: 'Recarga de gas refrigerante', description: 'Recarga de gas R410A, R22 o R32 con detección previa de fugas para garantizar eficiencia del equipo.', minPrice: 100, maxPrice: 300, times: ['1 hora', '2 horas'] },
    { name: 'Reparación de aire acondicionado', description: 'Diagnóstico y reparación de fallas: compresor, tarjeta electrónica, ventilador y problemas de enfriamiento.', minPrice: 120, maxPrice: 400, times: ['2 horas', 'Medio día'] },
  ],
  albanileria: [
    { name: 'Albañilería general', description: 'Trabajos de albañilería: levantamiento de muros, tarrajeo, asentado de ladrillos y acabados en concreto.', minPrice: 150, maxPrice: 500, times: ['1 día', '2 días'] },
    { name: 'Construcción de muros', description: 'Construcción de muros divisorios, cercos perimétricos y tabiques en ladrillo, bloqueta o drywall.', minPrice: 200, maxPrice: 800, times: ['2 días', '3 días'] },
    { name: 'Revestimiento de pisos y paredes', description: 'Instalación de cerámicos, porcelanato, mayólica y piedra natural con acabados de primera calidad.', minPrice: 150, maxPrice: 600, times: ['1 día', '2 días'] },
    { name: 'Reparación de fisuras y grietas', description: 'Tratamiento profesional de fisuras en paredes y techos con materiales especializados para evitar filtraciones.', minPrice: 80, maxPrice: 250, times: ['2-3 horas', 'Medio día'] },
  ],
  mudanzas: [
    { name: 'Servicio de mudanza local', description: 'Mudanza completa dentro de la ciudad con personal capacitado, camión equipado y protección de muebles.', minPrice: 200, maxPrice: 600, times: ['Medio día', '1 día'] },
    { name: 'Embalaje profesional', description: 'Servicio de embalaje con materiales de protección: cajas, burbujas, stretch film y protectores de esquinas.', minPrice: 80, maxPrice: 250, times: ['2-3 horas', 'Medio día'] },
    { name: 'Transporte de carga', description: 'Transporte de objetos pesados, electrodomésticos, materiales de construcción y mercadería en general.', minPrice: 100, maxPrice: 400, times: ['2 horas', 'Medio día'] },
    { name: 'Desmontaje y montaje de muebles', description: 'Desarmado y armado de muebles para mudanzas. Incluye protección y manejo cuidadoso de cada pieza.', minPrice: 60, maxPrice: 200, times: ['1-2 horas', '2-3 horas'] },
  ],
  tecnologia: [
    { name: 'Reparación de computadoras', description: 'Diagnóstico y reparación de PCs y laptops: formateo, cambio de componentes, eliminación de virus y optimización.', minPrice: 60, maxPrice: 200, times: ['1-2 horas', '2-3 horas'] },
    { name: 'Instalación de redes WiFi', description: 'Configuración de redes inalámbricas, instalación de routers, access points y extensores de señal para hogar y oficina.', minPrice: 80, maxPrice: 250, times: ['1-2 horas', '2-3 horas'] },
    { name: 'Soporte técnico a domicilio', description: 'Asistencia técnica presencial para configuración de equipos, impresoras, correos, software y respaldos.', minPrice: 50, maxPrice: 150, times: ['1 hora', '2 horas'] },
    { name: 'Instalación de cámaras de seguridad', description: 'Instalación de sistemas de videovigilancia CCTV con cámaras IP, DVR/NVR y acceso remoto desde celular.', minPrice: 200, maxPrice: 600, times: ['Medio día', '1 día'] },
    { name: 'Cableado de red estructurado', description: 'Tendido de cableado de red Cat 5e/Cat 6, instalación de puntos de red, patch panels y organización de rack.', minPrice: 150, maxPrice: 500, times: ['Medio día', '1 día'] },
  ],
  'otro-servicio': [
    { name: 'Reparación general del hogar', description: 'Servicio de manitas para reparaciones menores: colgar cuadros, arreglar cortinas, ajustar puertas y más.', minPrice: 40, maxPrice: 120, times: ['1 hora', '2 horas'] },
    { name: 'Instalaciones diversas', description: 'Instalación de accesorios, soportes de TV, cortinas, persianas, repisas y elementos decorativos.', minPrice: 50, maxPrice: 150, times: ['1 hora', '2 horas'] },
    { name: 'Fumigación y control de plagas', description: 'Servicio profesional de fumigación para eliminar cucarachas, hormigas, mosquitos, roedores y termitas.', minPrice: 80, maxPrice: 250, times: ['1-2 horas', '2-3 horas'] },
  ],
};

/* ─── Review templates ────────────────────────────────────────────── */

const reviewComments5 = [
  'Excelente trabajo, muy profesional y puntual. Totalmente recomendado.',
  'Superó mis expectativas. Trabajo impecable y muy limpio. Volvería a contratarlo sin duda.',
  'Muy buen servicio, llegó a tiempo y dejó todo perfecto. 100% recomendable.',
  'Profesional de primera. Explicó todo el proceso y el resultado fue excelente.',
  'Increíble atención al detalle. Se nota la experiencia y el compromiso con su trabajo.',
  'El mejor profesional que he contratado. Rápido, eficiente y con precios justos.',
  'Trabajo de alta calidad. Cumplió con todo lo prometido y más. Muy satisfecho.',
  'Excelente persona y excelente profesional. Lo recomiendo ampliamente a todos.',
];

const reviewComments4 = [
  'Buen trabajo en general, cumplió con lo acordado. Recomendable.',
  'Muy buen servicio, aunque demoró un poco más de lo esperado. El resultado final es bueno.',
  'Trabajo de buena calidad. Atento y amable. Lo volvería a contratar.',
  'Buen profesional, explicó bien el proceso. Pequeños detalles por mejorar pero en general muy bien.',
  'Cumplió con el trabajo de manera satisfactoria. El precio fue justo por el resultado.',
  'Buen servicio, llegó puntual y fue respetuoso. El acabado quedó muy bien.',
];

const reviewComments3 = [
  'Trabajo aceptable, cumplió con lo básico. Hay espacio para mejorar en los detalles.',
  'El servicio fue regular, tardó más de lo esperado pero el resultado es funcional.',
  'Cumplió con el trabajo pero la comunicación podría mejorar. Resultado aceptable.',
];

/* ─── Request messages ────────────────────────────────────────────── */

const clientMessages = [
  'Hola, necesito este servicio lo antes posible. ¿Cuándo podrías venir?',
  'Buenos días, me interesa su servicio. ¿Podría darme más detalles sobre el precio?',
  'Hola, vi su perfil y me gustaría solicitar una cotización para este trabajo.',
  'Buenas tardes, tengo una emergencia en casa. ¿Tiene disponibilidad esta semana?',
  'Hola, me recomendaron su trabajo. ¿Cuánto cobraría aproximadamente?',
  'Buen día, necesito este servicio urgente. ¿Puede venir mañana?',
];

const providerMessages = [
  '¡Hola! Claro, puedo atenderle. Déjeme revisar mi agenda y le confirmo el horario.',
  'Buenos días, gracias por contactarme. El precio depende del alcance del trabajo. ¿Puede enviarme fotos?',
  'Con gusto le atiendo. Tengo disponibilidad esta semana. ¿Le parece el jueves por la mañana?',
  'Hola, gracias por su confianza. Puedo ir a hacer una evaluación sin costo para darle un presupuesto exacto.',
  'Buenas tardes, sí tengo disponibilidad. El precio base es desde S/ 80 dependiendo de la complejidad.',
  'Hola, encantado de ayudarle. Para darle un precio justo necesitaría ver el trabajo primero. ¿Le parece si coordino una visita?',
];

/* ─── Service request titles ─────────────────────────────────────── */

const requestTitlesByCategory: Record<string, string[]> = {
  electricidad: ['Reparación de cortocircuito', 'Instalación de tomacorrientes', 'Problema con la luz', 'Revisión del tablero eléctrico', 'Instalación de luminarias'],
  plomeria: ['Fuga en la cocina', 'Grifo dañado', 'Tubería tapada', 'Instalación de ducha', 'Problema con el desagüe'],
  limpieza: ['Limpieza general del departamento', 'Limpieza post-mudanza', 'Limpieza de oficina', 'Desinfección del hogar', 'Lavado de alfombras'],
  carpinteria: ['Puerta que no cierra bien', 'Fabricar repisa a medida', 'Arreglar cajón roto', 'Restaurar mesa antigua', 'Armado de escritorio'],
  pintura: ['Pintar habitación', 'Pintar fachada exterior', 'Empastado de paredes', 'Impermeabilizar azotea', 'Retoques de pintura'],
  jardineria: ['Mantenimiento del jardín', 'Poda de árboles grandes', 'Diseño de jardín pequeño', 'Instalar césped artificial', 'Fumigación de plantas'],
  cerrajeria: ['Me quedé afuera de casa', 'Cambiar cerradura dañada', 'Instalar cerradura nueva', 'Duplicar llaves', 'Reforzar puerta principal'],
  'aire-acondicionado': ['Mantenimiento del aire', 'El aire no enfría', 'Instalar split nuevo', 'Recarga de gas', 'Ruido extraño en el equipo'],
  albanileria: ['Levantar muro divisorio', 'Instalar cerámicos', 'Reparar grieta en pared', 'Tarrajeo de paredes', 'Construir vereda'],
  mudanzas: ['Mudanza a nuevo departamento', 'Transportar muebles', 'Embalar cosas frágiles', 'Mudanza de oficina', 'Mover electrodomésticos'],
  tecnologia: ['PC muy lenta', 'Configurar WiFi', 'Instalar cámaras', 'Reparar laptop', 'Cableado de red en oficina'],
  'otro-servicio': ['Reparación general', 'Colgar TV en pared', 'Instalar cortinas', 'Fumigación de casa', 'Mantenimiento general'],
};

const requestMessages = [
  'Hola, me gustaría saber si tienen disponibilidad para este trabajo. Necesito que sea lo antes posible.',
  'Buenos días, necesito una cotización para este servicio. Mi dirección es en la zona indicada.',
  'Hola, vi su perfil y me interesa contratarlo. ¿Podría venir a evaluar el trabajo?',
  'Buenas tardes, tengo una urgencia y necesito este servicio pronto. ¿Cuándo puede atenderme?',
  'Hola, me recomendaron sus servicios. ¿Tiene disponibilidad para esta semana?',
  'Buen día, necesito este trabajo para mi casa. ¿Cuál sería el precio aproximado?',
];

/* ─── Helpers ─────────────────────────────────────────────────────── */

const firstNames = ['Juan', 'María', 'Pedro', 'Ana', 'Luis', 'Carmen', 'Carlos', 'Laura', 'Miguel', 'Sofía', 'José', 'Lucía', 'Jorge', 'Elena', 'Diego', 'Patricia', 'Roberto', 'Marta', 'Fernando', 'Paula'];
const lastNames = ['García', 'Fernández', 'González', 'Rodríguez', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez'];
const serviceZones = ['Talara Alta', 'Talara Centro', 'Punta Arenas', 'Los Órganos', 'Máncora', 'Negritos', 'Lobitos', 'El Alto'];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function roundToTen(n: number): number {
  return Math.round(n / 10) * 10;
}

/* ─── Main ────────────────────────────────────────────────────────── */

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const adminSeedPassword = process.env.ADMIN_SEED_PASSWORD;
  const demoUserPassword = process.env.DEMO_USER_PASSWORD;
  const e2eTestPassword = process.env.E2E_TEST_PASSWORD;

  if (!connectionString) throw new Error('DATABASE_URL no está definido');
  if (!adminSeedPassword) throw new Error('ADMIN_SEED_PASSWORD no está definido');
  if (!demoUserPassword) throw new Error('DEMO_USER_PASSWORD no está definido');
  if (!e2eTestPassword) throw new Error('E2E_TEST_PASSWORD no está definido');

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log('🌱 Seeding Database...\n');

  // ─── 1. Categories ────────────────────────────────────────────
  console.log('📁 Creando categorías...');
  const categoryMap: Record<string, string> = {};
  for (const cat of defaultCategories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, sortOrder: cat.sortOrder },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`   ✓ ${defaultCategories.length} categorías\n`);

  // ─── 2. Admin User ────────────────────────────────────────────
  const adminPasswordHash = await argon2.hash(adminSeedPassword);
  const demoPasswordHash = await argon2.hash(demoUserPassword);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@servilocal.com' },
    update: { fullName: 'Administrador', passwordHash: adminPasswordHash, role: UserRole.ADMIN, status: UserStatus.ACTIVE },
    create: { email: 'admin@servilocal.com', fullName: 'Administrador', passwordHash: adminPasswordHash, role: UserRole.ADMIN, status: UserStatus.ACTIVE },
  });
  console.log(`👤 Admin: ${admin.email}`);

  // ─── 3. Create 20 Providers ────────────────────────────────────
  console.log('\n👷 Creando proveedores...');
  const providerData: Array<{ id: string; categorySlug: string }> = [];

  for (let i = 1; i <= 20; i++) {
    const fn = rand(firstNames);
    const ln = rand(lastNames);
    const email = `proveedor${i}@ejemplo.com`;
    const categoryObj = defaultCategories[i % defaultCategories.length]; // distribute evenly
    const categoryId = categoryMap[categoryObj.slug];

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName: `${fn} ${ln}`,
        passwordHash: demoPasswordHash,
        role: UserRole.PROVIDER,
        status: UserStatus.ACTIVE,
        phone: `9${randInt(10000000, 99999999)}`,
        trustScore: randInt(45, 98),
        slPoints: randInt(10, 500),
        bio: `Profesional con experiencia en ${categoryObj.name.toLowerCase()}. Comprometido con la calidad y la puntualidad.`,
        providerProfile: {
          create: {
            ruc: `10${randInt(100000000, 999999999)}`,
            businessName: `Servicios ${ln} EIRL`,
            categoryId,
            customServiceName: categoryObj.slug === 'otro-servicio' ? 'Reparación General' : null,
            specialty: `Especialista en ${categoryObj.name.toLowerCase()} con más de ${randInt(3, 15)} años de experiencia`,
            experienceYears: randInt(3, 15),
            serviceZone: rand(serviceZones),
            description: `Soy ${fn} ${ln}, ofrezco servicios profesionales de ${categoryObj.name.toLowerCase()} de alta calidad. Cuento con experiencia comprobada, herramientas profesionales y garantía en todos mis trabajos. Mi compromiso es brindar soluciones eficientes y duraderas.`,
            isVerified: Math.random() > 0.25,
          },
        },
      },
    });
    providerData.push({ id: user.id, categorySlug: categoryObj.slug });
  }
  console.log(`   ✓ ${providerData.length} proveedores\n`);

  // ─── 4. Create 15 Clients ─────────────────────────────────────
  console.log('👥 Creando clientes...');
  const clientIds: string[] = [];

  for (let i = 1; i <= 15; i++) {
    const fn = rand(firstNames);
    const ln = rand(lastNames);
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
        phone: `9${randInt(10000000, 99999999)}`,
        trustScore: randInt(40, 90),
        slPoints: randInt(0, 200),
      },
    });
    clientIds.push(user.id);
  }
  console.log(`   ✓ ${clientIds.length} clientes\n`);

  // ─── 5. Create Services ───────────────────────────────────────
  console.log('📦 Generando servicios...');
  let serviceCount = 0;

  for (const provider of providerData) {
    const catServices = servicesByCategory[provider.categorySlug] || servicesByCategory['otro-servicio'];
    const numServices = Math.min(catServices.length, randInt(3, 5));
    const shuffled = [...catServices].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numServices; i++) {
      const svc = shuffled[i];
      const price = roundToTen(randInt(svc.minPrice, svc.maxPrice));

      await prisma.service.create({
        data: {
          providerUserId: provider.id,
          categoryId: categoryMap[provider.categorySlug],
          name: svc.name,
          description: svc.description,
          referencePrice: price,
          estimatedTime: rand(svc.times),
          isActive: true,
        },
      });
      serviceCount++;
    }
  }
  console.log(`   ✓ ${serviceCount} servicios generados\n`);

  // ─── 6. Create Service Requests ────────────────────────────────
  console.log('📋 Generando solicitudes...');
  let requestCount = 0;
  const completedRequestIds: Array<{ id: string; clientId: string; providerId: string }> = [];

  for (const clientId of clientIds) {
    const numRequests = randInt(2, 4);
    for (let i = 0; i < numRequests; i++) {
      const provider = rand(providerData);
      const titles = requestTitlesByCategory[provider.categorySlug] || requestTitlesByCategory['otro-servicio'];
      const statuses: ServiceRequestStatus[] = [
        ServiceRequestStatus.PENDING,
        ServiceRequestStatus.NEGOTIATION,
        ServiceRequestStatus.ACCEPTED,
        ServiceRequestStatus.IN_PROGRESS,
        ServiceRequestStatus.COMPLETED,
        ServiceRequestStatus.COMPLETED,
        ServiceRequestStatus.CANCELLED,
        ServiceRequestStatus.EXPIRED,
      ];
      const status = rand(statuses);

      const request = await prisma.serviceRequest.create({
        data: {
          clientUserId: clientId,
          providerUserId: provider.id,
          serviceTitle: rand(titles),
          message: rand(requestMessages),
          serviceZone: rand(serviceZones),
          preferredDate: new Date(Date.now() + randInt(1, 30) * 86400000),
          expiresAt: new Date(Date.now() + 7 * 86400000),
          status,
        },
      });
      requestCount++;

      if (status === ServiceRequestStatus.COMPLETED) {
        completedRequestIds.push({ id: request.id, clientId, providerId: provider.id });
      }
    }
  }
  console.log(`   ✓ ${requestCount} solicitudes (${completedRequestIds.length} completadas)\n`);

  // ─── 7. Create Messages in active requests ────────────────────
  console.log('💬 Generando mensajes de chat...');
  const activeRequests = await prisma.serviceRequest.findMany({
    where: { status: { in: ['NEGOTIATION', 'ACCEPTED', 'IN_PROGRESS'] } },
    take: 20,
  });

  let msgCount = 0;
  for (const req of activeRequests) {
    const numMessages = randInt(2, 5);
    for (let m = 0; m < numMessages; m++) {
      const isClient = m % 2 === 0;
      await prisma.serviceRequestMessage.create({
        data: {
          requestId: req.id,
          senderUserId: isClient ? req.clientUserId : req.providerUserId,
          content: isClient ? rand(clientMessages) : rand(providerMessages),
          isRead: m < numMessages - 1,
          createdAt: new Date(Date.now() - (numMessages - m) * 3600000),
        },
      });
      msgCount++;
    }
  }
  console.log(`   ✓ ${msgCount} mensajes en ${activeRequests.length} solicitudes\n`);

  // ─── 8. Create Reviews ────────────────────────────────────────
  console.log('⭐ Generando reseñas...');
  let reviewCount = 0;

  for (const req of completedRequestIds) {
    // 80% chance of having a review
    if (Math.random() > 0.8) continue;

    const rating = randInt(1, 100) <= 40 ? 5 : randInt(1, 100) <= 70 ? 4 : 3;
    const comments = rating === 5 ? reviewComments5 : rating === 4 ? reviewComments4 : reviewComments3;

    try {
      await prisma.review.create({
        data: {
          requestId: req.id,
          clientUserId: req.clientId,
          providerUserId: req.providerId,
          rating,
          comment: rand(comments),
        },
      });
      reviewCount++;
    } catch {
      // Skip if review already exists for this request (unique constraint)
    }
  }
  console.log(`   ✓ ${reviewCount} reseñas\n`);

  // ─── 9. Create Notifications ──────────────────────────────────
  console.log('🔔 Generando notificaciones...');
  const notifTypes = [
    { type: 'REQUEST_NEW', title: 'Nueva solicitud recibida', message: 'Has recibido una nueva solicitud de servicio. Revísala y responde pronto.' },
    { type: 'REQUEST_ACCEPTED', title: 'Solicitud aceptada', message: 'Tu solicitud de servicio ha sido aceptada. Coordina con el proveedor.' },
    { type: 'REQUEST_COMPLETED', title: 'Servicio completado', message: '¡Tu servicio ha sido marcado como completado! No olvides dejar una reseña.' },
    { type: 'REVIEW_RECEIVED', title: 'Nueva reseña recibida', message: 'Un cliente ha dejado una reseña sobre tu servicio. ¡Revísala!' },
    { type: 'TRUST_UPDATED', title: 'Tu confianza ha cambiado', message: 'Tu puntaje de confianza ha sido actualizado basado en tu actividad reciente.' },
  ];

  let notifCount = 0;
  for (const provider of providerData.slice(0, 10)) {
    const numNotifs = randInt(2, 4);
    for (let n = 0; n < numNotifs; n++) {
      const notif = rand(notifTypes);
      await prisma.notification.create({
        data: {
          userId: provider.id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          isRead: Math.random() > 0.4,
          createdAt: new Date(Date.now() - randInt(1, 14) * 86400000),
        },
      });
      notifCount++;
    }
  }
  for (const clientId of clientIds.slice(0, 8)) {
    const numNotifs = randInt(1, 3);
    for (let n = 0; n < numNotifs; n++) {
      const notif = rand(notifTypes);
      await prisma.notification.create({
        data: {
          userId: clientId,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          isRead: Math.random() > 0.5,
          createdAt: new Date(Date.now() - randInt(1, 14) * 86400000),
        },
      });
      notifCount++;
    }
  }
  console.log(`   ✓ ${notifCount} notificaciones\n`);

  // ─── 10. Trust Events ──────────────────────────────────────────
  console.log('🛡️  Generando eventos de confianza...');
  const trustTypes = [
    { type: 'SERVICE_COMPLETED', points: 5, reason: 'Servicio completado exitosamente' },
    { type: 'POSITIVE_REVIEW', points: 3, reason: 'Reseña positiva recibida' },
    { type: 'PROFILE_VERIFIED', points: 10, reason: 'Perfil verificado por el sistema' },
    { type: 'ON_TIME_RESPONSE', points: 2, reason: 'Respuesta dentro del tiempo esperado' },
    { type: 'CONSISTENT_QUALITY', points: 4, reason: 'Calidad consistente mantenida' },
  ];

  let trustCount = 0;
  for (const provider of providerData) {
    const numEvents = randInt(3, 8);
    for (let t = 0; t < numEvents; t++) {
      const te = rand(trustTypes);
      await prisma.trustEvent.create({
        data: {
          userId: provider.id,
          eventType: te.type,
          points: te.points,
          reason: te.reason,
          createdAt: new Date(Date.now() - randInt(1, 60) * 86400000),
        },
      });
      trustCount++;
    }
  }
  console.log(`   ✓ ${trustCount} eventos de confianza\n`);

  // ─── 11. Audit Logs ────────────────────────────────────────────
  console.log('📝 Generando logs de auditoría...');
  const auditActions = ['LOGIN', 'PROFILE_UPDATED', 'SERVICE_CREATED', 'REQUEST_SENT', 'REQUEST_ACCEPTED', 'REVIEW_SUBMITTED', 'PASSWORD_CHANGED'];
  for (let i = 0; i < 30; i++) {
    await prisma.auditLog.create({
      data: {
        actorUserId: rand([...clientIds, ...providerData.map(p => p.id)]),
        action: rand(auditActions),
        ipAddress: `192.168.1.${randInt(1, 254)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
  }
  console.log(`   ✓ 30 logs de auditoría\n`);

  // ─── 12. Favorites ─────────────────────────────────────────────
  console.log('❤️  Generando favoritos...');
  let favCount = 0;
  for (const clientId of clientIds.slice(0, 10)) {
    const numFavs = randInt(1, 3);
    const shuffledProviders = [...providerData].sort(() => Math.random() - 0.5);
    for (let f = 0; f < numFavs; f++) {
      try {
        await prisma.favoriteProvider.create({
          data: { userId: clientId, providerId: shuffledProviders[f].id },
        });
        favCount++;
      } catch { /* skip duplicates */ }
    }
  }
  console.log(`   ✓ ${favCount} proveedores favoritos\n`);

  // ─── 13. E2E Test Users ────────────────────────────────────────
  console.log('🧪 Creando usuarios E2E...');
  const e2ePasswordHash = await argon2.hash(e2eTestPassword);

  const e2eClient = await prisma.user.upsert({
    where: { email: 'cliente@servilocal.test' },
    update: { fullName: 'Carlos Prueba Cliente', passwordHash: e2ePasswordHash, role: UserRole.CLIENT, status: UserStatus.ACTIVE },
    create: { email: 'cliente@servilocal.test', fullName: 'Carlos Prueba Cliente', passwordHash: e2ePasswordHash, role: UserRole.CLIENT, status: UserStatus.ACTIVE, phone: '987654321' },
  });
  console.log(`   ✓ E2E CLIENT   → ${e2eClient.email}`);

  const e2eProvider = await prisma.user.upsert({
    where: { email: 'proveedor@servilocal.test' },
    update: { fullName: 'Ana Prueba Proveedora', passwordHash: e2ePasswordHash, role: UserRole.PROVIDER, status: UserStatus.ACTIVE },
    create: { email: 'proveedor@servilocal.test', fullName: 'Ana Prueba Proveedora', passwordHash: e2ePasswordHash, role: UserRole.PROVIDER, status: UserStatus.ACTIVE, phone: '987654322' },
  });

  const defaultCategory = await prisma.category.findUnique({ where: { slug: 'electricidad' } });
  await prisma.providerProfile.upsert({
    where: { userId: e2eProvider.id },
    update: { businessName: 'Servicios E2E Prueba EIRL', serviceZone: 'Talara Centro', description: 'Perfil de proveedor creado exclusivamente para pruebas E2E automatizadas.' },
    create: { userId: e2eProvider.id, ruc: '10999999991', businessName: 'Servicios E2E Prueba EIRL', categoryId: defaultCategory!.id, specialty: 'Pruebas automatizadas', serviceZone: 'Talara Centro', description: 'Perfil de proveedor creado exclusivamente para pruebas E2E automatizadas.', isVerified: true },
  });
  console.log(`   ✓ E2E PROVIDER → ${e2eProvider.email}`);

  const e2eAdmin = await prisma.user.upsert({
    where: { email: 'admin@servilocal.test' },
    update: { fullName: 'Admin Prueba Sistema', passwordHash: e2ePasswordHash, role: UserRole.ADMIN, status: UserStatus.ACTIVE },
    create: { email: 'admin@servilocal.test', fullName: 'Admin Prueba Sistema', passwordHash: e2ePasswordHash, role: UserRole.ADMIN, status: UserStatus.ACTIVE, phone: '987654323' },
  });
  console.log(`   ✓ E2E ADMIN    → ${e2eAdmin.email}`);

  const e2eSupport = await prisma.user.upsert({
    where: { email: 'soporte@servilocal.test' },
    update: { fullName: 'Soporte Prueba Equipo', passwordHash: e2ePasswordHash, role: UserRole.SUPPORT, status: UserStatus.ACTIVE },
    create: { email: 'soporte@servilocal.test', fullName: 'Soporte Prueba Equipo', passwordHash: e2ePasswordHash, role: UserRole.SUPPORT, status: UserStatus.ACTIVE, phone: '987654324' },
  });
  console.log(`   ✓ E2E SUPPORT  → ${e2eSupport.email}`);

  console.log('\n✅ Seeding completed successfully!');
  console.log('────────────────────────────────────────');
  console.log(`   Categorías:     ${defaultCategories.length}`);
  console.log(`   Proveedores:    ${providerData.length}`);
  console.log(`   Clientes:       ${clientIds.length}`);
  console.log(`   Servicios:      ${serviceCount}`);
  console.log(`   Solicitudes:    ${requestCount}`);
  console.log(`   Mensajes:       ${msgCount}`);
  console.log(`   Reseñas:        ${reviewCount}`);
  console.log(`   Notificaciones: ${notifCount}`);
  console.log(`   Trust Events:   ${trustCount}`);
  console.log(`   Favoritos:      ${favCount}`);
  console.log('────────────────────────────────────────\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});