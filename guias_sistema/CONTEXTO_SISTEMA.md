# CONTEXTO DEL SISTEMA — ServiLocal2026

**Documento Informativo de Referencia**
**Última Actualización:** 19 de julio de 2026
**Tipo:** Guía de contexto para desarrolladores, evaluadores y profesores

---

## 1. ¿QUÉ ES SERVILOCAL?

**ServiLocal 2026** es una plataforma web de servicios locales que conecta a **proveedores** (técnicos, profesionales independientes, negocios) con **clientes** que necesitan contratar servicios en una zona geográfica determinada. Funciona como un ecosistema digital de confianza, con comunicación en tiempo real, gestión transaccional de solicitudes y un sistema de reputación basado en puntuación.

### Problema que resuelve
- Dificultad para encontrar proveedores confiables de servicios locales (plomería, electricidad, limpieza, etc.)
- Falta de un mecanismo para evaluar la confiabilidad de los proveedores
- Ausencia de una plataforma centralizada para gestionar solicitudes, negociaciones y seguimiento
- Necesidad de comunicación directa en tiempo real entre cliente y proveedor

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Tipo de Arquitectura
**Monolito modular** organizado como un **monorepo pnpm** con 2 aplicaciones principales:

| Aplicación | Tecnología | Puerto | Ubicación |
|---|---|---|---|
| **Frontend (web)** | Next.js 16.2.4 + React 19.2.4 | 3000 | `apps/web/` |
| **Backend (api)** | NestJS 11 + Express | 3001 | `apps/api/` |

### 2.2 Diagrama de Arquitectura

```mermaid
graph TB
    subgraph "Cliente - Navegador"
        FE["Frontend<br/>Next.js 16.2.4<br/>React 19.2.4<br/>Puerto 3000"]
        WS_C["WebSocket Client<br/>socket.io-client"]
    end

    subgraph "Backend - Servidor"
        API["API REST<br/>NestJS 11<br/>Express<br/>Puerto 3001"]
        WS_S["WebSocket Server<br/>Socket.IO"]
        CRON["Tareas Programadas<br/>@nestjs/schedule"]
        THROTTLE["Rate Limiter<br/>@nestjs/throttler"]
    end

    subgraph "Persistencia"
        PG["PostgreSQL 16-alpine<br/>Puerto 5433<br/>Prisma ORM 7.8"]
        REDIS["Redis 7-alpine<br/>Puerto 6379<br/>Cache + Throttle"]
    end

    subgraph "Servicios Auxiliares"
        MAIL["Mailpit<br/>SMTP: 1025<br/>Web: 8025"]
        FS["Sistema de Archivos<br/>/uploads"]
    end

    FE -->|"HTTP REST<br/>Cookies httpOnly"| API
    WS_C -->|"WebSocket<br/>Socket.IO"| WS_S
    API --> PG
    API --> REDIS
    API --> MAIL
    API --> FS
    CRON --> PG
    WS_S --> API
```

### 2.3 Patrones de Comunicación

| Canal | Mecanismo | Uso |
|---|---|---|
| Frontend → Backend | REST API con Cookies httpOnly (JWT) | Todas las operaciones CRUD |
| Backend → Frontend (tiempo real) | WebSockets con Socket.IO | Notificaciones y chat |
| Backend → Base de Datos | Prisma ORM con adaptador PostgreSQL nativo | Persistencia de datos |
| Backend → Cache | Redis via `cache-manager-redis-yet` | Caché de respuestas, throttler |
| Backend → Email | Nodemailer → Mailpit (desarrollo) | Recuperación de contraseña |

---

## 3. STACK TECNOLÓGICO COMPLETO

### 3.1 Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| Next.js | 16.2.4 | Framework React con SSR/SSG |
| React | 19.2.4 | Librería de UI |
| TailwindCSS | 4.x | Framework CSS utilitario |
| Framer Motion | 12.38.0 | Animaciones fluidas |
| Leaflet + React-Leaflet | 1.9.4 / 5.0.0 | Mapas interactivos |
| Lucide React + React Icons | 1.9.0 / 5.6.0 | Sistema de iconos |
| socket.io-client | 4.8.3 | WebSocket para tiempo real |
| Playwright | 1.60.0 | Testing E2E |

### 3.2 Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| NestJS | 11.x | Framework backend modular |
| Express | (via @nestjs/platform-express) | Plataforma HTTP |
| Prisma Client | 7.8.0 | ORM para PostgreSQL |
| @prisma/adapter-pg | 7.8.0 | Adaptador nativo PostgreSQL |
| Argon2 | 0.44.0 | Hash de contraseñas (seguro) |
| Passport.js + JWT | — | Autenticación con tokens |
| @nestjs/throttler | 6.5.0 | Rate limiting (20 req/min/IP) |
| Socket.IO | 4.8.3 | WebSocket server |
| Nodemailer | 8.0.6 | Envío de emails |
| Multer | 2.1.1 | Upload de archivos |
| Helmet | 8.1.0 | Headers de seguridad HTTP |
| Compression | 1.8.1 | Compresión de respuestas |
| @nestjs/schedule | 6.1.3 | Tareas programadas (cron) |
| class-validator | 0.15.1 | Validación de DTOs |

### 3.3 Infraestructura (Desarrollo Local)

| Componente | Versión/Herramienta | Puerto |
|---|---|---|
| PostgreSQL | 16-alpine (Docker) | 5433 |
| Redis | 7-alpine (Docker) | 6379 |
| Mailpit | latest (Docker) | 1025 (SMTP) / 8025 (Web) |
| Docker Compose | — | Orquestación de servicios |
| pnpm | 10.33.2 | Gestor de paquetes |
| Node.js | 18+ | Runtime |

### 3.4 Infraestructura (Producción / Cloud)

| Componente | Proveedor / Servicio | Propósito |
|---|---|---|
| Frontend Hosting | Vercel | Alojamiento del cliente web (Next.js) |
| Base de Datos | Supabase (PostgreSQL) | Persistencia de datos gestionada en la nube |
| Backend API | Vercel Serverless / Render | Ejecución de la API y lógica de negocio |

---

## 4. ESTRUCTURA DEL MONOREPO

```
ServiLocal2026/
├── apps/
│   ├── api/                        # Backend NestJS
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Esquema de base de datos (15 modelos)
│   │   │   ├── seed.ts             # Datos iniciales (~36 usuarios)
│   │   │   └── migrations/         # Migraciones de DB
│   │   ├── src/
│   │   │   ├── main.ts             # Punto de entrada
│   │   │   ├── app.module.ts       # Módulo raíz (15 módulos importados)
│   │   │   ├── common/             # Guards, decorators, upload, websockets
│   │   │   ├── database/           # PrismaService (conexión a DB)
│   │   │   └── modules/            # 15 módulos de negocio
│   │   │       ├── admin/          # Panel administrativo
│   │   │       ├── auth/           # Autenticación (JWT, brute-force)
│   │   │       ├── favorites/      # Proveedores y servicios favoritos
│   │   │       ├── notifications/  # Notificaciones persistentes + push
│   │   │       ├── payments/       # Módulo de pagos (stub)
│   │   │       ├── providers/      # Gestión de proveedores
│   │   │       ├── reports/        # Sistema de reportes de usuarios
│   │   │       ├── request-messages/ # Chat en tiempo real
│   │   │       ├── reviews/        # Reseñas y calificaciones
│   │   │       ├── service-requests/ # Solicitudes de servicio
│   │   │       ├── services/       # Catálogo de servicios
│   │   │       ├── support/        # Panel de soporte
│   │   │       ├── tasks/          # Tareas cron programadas
│   │   │       ├── trust/          # Sistema de confianza (Trust Score)
│   │   │       └── users/          # Gestión de perfiles
│   │   └── uploads/                # Archivos subidos (avatares)
│   │
│   └── web/                        # Frontend Next.js
│       ├── e2e/                    # Pruebas End-to-End (Playwright)
│       │   ├── auth/               # Tests de autenticación
│       │   ├── public/             # Tests de páginas públicas
│       │   ├── fixtures/           # Datos de prueba
│       │   └── helpers/            # Utilidades de testing
│       ├── src/
│       │   ├── app/                # Rutas Next.js (App Router)
│       │   │   ├── page.tsx        # Landing page
│       │   │   ├── iniciar-sesion/ # Página de login
│       │   │   ├── registrarse/    # Página de registro
│       │   │   ├── servicios/      # Catálogo público de servicios
│       │   │   ├── proveedores/    # Catálogo público de proveedores
│       │   │   └── panel/          # Paneles autenticados
│       │   │       ├── admin/      # Panel administrador
│       │   │       ├── cliente/    # Panel cliente
│       │   │       ├── proveedor/  # Panel proveedor
│       │   │       └── soporte/    # Panel soporte
│       │   ├── components/         # Componentes reutilizables
│       │   │   ├── auth/           # Componentes de autenticación
│       │   │   ├── layout/         # Header, footer, sidebar, shell
│       │   │   ├── panel/          # Componentes de dashboard
│       │   │   ├── providers/      # Cards y listados de proveedores
│       │   │   ├── requests/       # Componentes de solicitudes
│       │   │   ├── services/       # Cards y listados de servicios
│       │   │   ├── support/        # Componentes de soporte
│       │   │   └── ui/             # UI genérica (botones, modals, etc.)
│       │   ├── contexts/           # React Context (Socket.IO)
│       │   ├── hooks/              # Custom hooks (notificaciones)
│       │   └── lib/                # Utilidades
│       │       ├── api-client.ts   # Cliente HTTP centralizado
│       │       ├── auth-session.ts # Gestión de sesión
│       │       ├── socket.ts       # Configuración WebSocket
│       │       └── translations.ts # Traducciones (español)
│       └── playwright.config.ts    # Configuración Playwright
│
├── infra/
│   └── docker-compose.yml          # PostgreSQL + Redis + Mailpit
├── scripts/
│   └── tester.ts                    # Script de verificación rápida
├── capture_extra.py                 # Script de captura adicional E2E
├── generate_reportlab.py            # Script de generación de reportes PDF
├── mermaid_render.html              # Herramienta para renderizar diagramas
├── take_screenshots.py              # Script para generar capturas de pantalla
├── guias_sistema/                   # Documentación operativa
├── docs/                            # Documentación adicional
├── package.json                     # Root (scripts dev, build, lint)
└── pnpm-workspace.yaml              # Configuración monorepo
```

---

## 5. BASE DE DATOS

### 5.1 Esquema (15 modelos + 1 config)

```mermaid
erDiagram
    User ||--o{ Session : tiene
    User ||--o| ProviderProfile : "tiene (si es proveedor)"
    User ||--o{ AuditLog : genera
    User ||--o{ ServiceRequest : "envía (como cliente)"
    User ||--o{ ServiceRequest : "recibe (como proveedor)"
    User ||--o{ ServiceRequestMessage : envía
    User ||--o{ Service : publica
    User ||--o{ Notification : recibe
    User ||--o{ FavoriteProvider : marca
    User ||--o{ FavoriteService : marca
    User ||--o{ TrustEvent : tiene
    User ||--o{ Review : "escribe/recibe"
    User ||--o{ Report : "reporta/es reportado"

    ServiceRequest ||--o{ ServiceRequestMessage : contiene
    ServiceRequest ||--o{ TrustEvent : genera
    ServiceRequest ||--o| Review : tiene
    ServiceRequest ||--o{ Report : tiene

    Category ||--o{ Service : agrupa
    Category ||--o{ ProviderProfile : asocia

    Service ||--o{ FavoriteService : favoriteada
```

### 5.2 Modelos Principales

| Modelo | Descripción | Campos Clave |
|---|---|---|
| **User** | Usuario del sistema | email, role (ADMIN/CLIENT/PROVIDER/SUPPORT), trustScore, slPoints, status |
| **ProviderProfile** | Perfil profesional del proveedor | ruc (único), businessName, category, serviceZone, isVerified, lat/lng |
| **Session** | Sesiones de usuario | refreshTokenHash, csrfTokenHash, status, expiresAt |
| **ServiceRequest** | Solicitud de servicio | clientUserId, providerUserId, status (ciclo de vida), expiresAt |
| **ServiceRequestMessage** | Mensajes de chat | requestId, senderUserId, content, isRead |
| **Category** | Categorías de servicios | name, slug, icon, sortOrder |
| **Service** | Servicio publicado | name, description, referencePrice, categoryId |
| **Notification** | Notificaciones persistentes | userId, type, title, message, isRead |
| **TrustEvent** | Eventos de confianza | userId, eventType, points, reason |
| **Review** | Reseñas de servicios | rating (1-5), comment, requestId |
| **Report** | Reportes de usuarios | reason, status (PENDING/REVIEWED/DISMISSED) |
| **AuditLog** | Log de auditoría | actorUserId, action, ipAddress, metadata |
| **SystemConfig** | Configuración del sistema | key (único), value |

### 5.3 Índices de Base de Datos
- **22 índices explícitos** (`@@index`) definidos en el schema
- **Índices implícitos** por `@unique` y `@id` en cada modelo
- **Índices ausentes notables:** No hay índices GIN para búsquedas de texto completo

---

## 6. FUNCIONALIDADES DEL SISTEMA

### 6.1 Resumen de Módulos (Backend)

| # | Módulo | Funcionalidad | Estado |
|---|---|---|---|
| 1 | `AuthModule` | Registro, Login (brute-force protection), JWT+Cookies, Refresh, CSRF, Password Reset | ✅ |
| 2 | `UsersModule` | Gestión de perfil de usuario | ✅ |
| 3 | `ProvidersModule` | Exploración pública de proveedores (búsqueda, filtros, ordenamiento) | ✅ |
| 4 | `ServicesModule` | Catálogo de servicios (CRUD, búsqueda, categorías, paginación) | ✅ |
| 5 | `ServiceRequestsModule` | Solicitudes de servicio (ciclo PENDING→COMPLETED) | ✅ |
| 6 | `RequestMessagesModule` | Chat en tiempo real (REST + WebSocket push) | ✅ |
| 7 | `NotificationsModule` | Notificaciones persistentes + push en tiempo real | ✅ |
| 8 | `TrustModule` | Trust Score (0-100) y Puntos SL (recompensas) | ✅ |
| 9 | `ReviewsModule` | Reseñas de servicios (rating 1-5 + comentario) | ✅ |
| 10 | `ReportsModule` | Reportes de usuarios (con revisión admin) | ✅ |
| 11 | `FavoritesModule` | Proveedores y servicios favoritos | ✅ |
| 12 | `AdminModule` | Dashboard estadístico, gestión usuarios/categorías, auditoría | ✅ |
| 13 | `TasksModule` | Tareas cron (expiración, penalización, recompensas) | ✅ |
| 14 | `SupportModule` | Panel de soporte técnico | ✅ |
| 15 | `PaymentsModule` | Módulo de pagos | ⚠️ Stub |

### 6.2 Resumen de la API REST (~60 endpoints)

| Módulo | Endpoints | Autenticación | Cache |
|---|---|---|---|
| Auth | 7 | Parcial | No |
| Users | 4 | JWT | No |
| Providers | 6 | Parcial | Sí (públicos) |
| Services | 5 | Parcial | Sí (públicos) |
| ServiceRequests | 4 | JWT | No |
| RequestMessages | 2 | JWT | No |
| Notifications | 4 | JWT | No |
| Favorites | 5 | JWT | No |
| Reviews | 3 | JWT | No |
| Reports | 3 | JWT | No |
| Admin | 10 | JWT + ADMIN | No |
| Trust | 2 | JWT | No |
| Upload | 2 | JWT | No |
| Support | 1 | JWT + SUPPORT | No |
| Payments | 2 | JWT | No |

### 6.3 Ciclo de Vida de una Solicitud de Servicio

```mermaid
stateDiagram-v2
    [*] --> PENDING: Cliente crea solicitud
    PENDING --> NEGOTIATION: Proveedor responde
    PENDING --> EXPIRED: 48h sin respuesta (cron)
    PENDING --> CANCELLED: Cliente cancela
    NEGOTIATION --> ACCEPTED: Proveedor acepta
    NEGOTIATION --> CANCELLED: Cualquiera cancela
    ACCEPTED --> IN_PROGRESS: Proveedor inicia trabajo
    ACCEPTED --> CANCELLED: Cualquiera cancela
    IN_PROGRESS --> COMPLETED: Proveedor marca completado
    IN_PROGRESS --> CANCELLED: Cliente cancela
    COMPLETED --> [*]
    CANCELLED --> [*]
    EXPIRED --> [*]
```

---

## 7. SEGURIDAD

### 7.1 Mecanismos Implementados

| Mecanismo | Detalle |
|---|---|
| **Hash de contraseñas** | Argon2 (CPU-intensivo, resistente a ataques) |
| **Autenticación JWT** | Access token (15 min TTL), Refresh token (1-30 días) |
| **Cookies httpOnly** | `access_token`, `refresh_token` (no accesibles por JavaScript) |
| **CSRF Protection** | Token CSRF en cookie + validación en header `X-CSRF-Token` |
| **Rate Limiting** | 20 requests/minuto por IP (Redis-backed) |
| **Brute-force Protection** | Bloqueo de cuenta tras 5 intentos fallidos durante 15 minutos |
| **Helmet** | Headers de seguridad HTTP (CSP, X-Frame-Options, etc.) |
| **Validación de entrada** | class-validator con whitelist + forbidNonWhitelisted |
| **CORS estricto** | Solo orígenes permitidos en `CORS_ORIGINS` |

---

## 8. DATOS DE PRUEBA (SEED)

### 8.1 Cuentas Disponibles

| Rol | Cantidad | Patrón de Email | Contraseña |
|---|---|---|---|
| **Admin** | 1 | `admin@servilocal.com` | `Admin12345*` |
| **Proveedores** | 20 | `proveedor{1-20}@ejemplo.com` | `Demo12345*` |
| **Clientes** | 15 | `cliente{1-15}@ejemplo.com` | `Demo12345*` |
| **E2E - Cliente** | 1 | `cliente@servilocal.test` | `Test1234!` |
| **E2E - Proveedor** | 1 | `proveedor@servilocal.test` | `Test1234!` |
| **E2E - Admin** | 1 | `admin@servilocal.test` | `Test1234!` |
| **E2E - Soporte** | 1 | `soporte@servilocal.test` | `Test1234!` |

### 8.2 Datos Seed Incluidos
- 20 proveedores con perfiles completos y 3-5 servicios cada uno
- 15 clientes con solicitudes, reseñas y chats simulados
- Categorías de servicios predefinidas
- Eventos de confianza y notificaciones asignadas

---

## 9. TESTING

### 9.1 Pruebas E2E (Playwright)

| Suite | Archivo | Cobertura |
|---|---|---|
| Login | `e2e/auth/login.spec.ts` | Login exitoso, fallido, validaciones de campo |
| Registro | `e2e/auth/register.spec.ts` | Registro de cliente y proveedor, validaciones |
| Landing | `e2e/public/landing.spec.ts` | Página principal, navegación |
| Navegación | `e2e/public/navigation.spec.ts` | Flujos de navegación |
| Servicios | `e2e/public/services.spec.ts` | Catálogo público, búsqueda, filtros |

**Configuración:** Navegador Chromium visible (headless: false), video grabado, reportes HTML.

### 9.2 Script de Verificación Rápida
Archivo `scripts/tester.ts` — Verifica conectividad del frontend, backend, base de datos y autenticación admin.

---

## 10. TAREAS PROGRAMADAS (CRON)

| Tarea | Frecuencia | Función |
|---|---|---|
| Expiración de solicitudes | Cada hora | Expira solicitudes PENDING que superan 48h |
| Penalización por inactividad | Diario | Aplica penalización de trust a usuarios inactivos |
| Recompensa semanal | Lunes 1:00 AM | Otorga puntos SL por actividad semanal |
| Recompensa trust sostenido | Diario 2:00 AM | Recompensa a usuarios con trust score alto sostenido |

---

## 11. PANELES DE USUARIO (FRONTEND)

### 11.1 Panel del Cliente (`/panel/cliente`)
- Dashboard personal
- Solicitudes de servicio (crear, ver historial)
- Mensajes / Chat con proveedores
- Notificaciones
- Favoritos (proveedores y servicios)
- Recompensas (puntos SL)
- Perfil y configuración

### 11.2 Panel del Proveedor (`/panel/proveedor`)
- Dashboard con estadísticas
- Gestión de servicios publicados
- Solicitudes recibidas
- Mensajes / Chat con clientes
- Reseñas recibidas
- Estadísticas de rendimiento
- Finanzas
- Notificaciones, recompensas, perfil y configuración

### 11.3 Panel Administrativo (`/panel/admin`)
- Dashboard estadístico general (31 queries al DB)
- Configuración del sistema

### 11.4 Panel de Soporte (`/panel/soporte`)
- Acceso a herramientas de soporte técnico

---

## 12. PÁGINAS PÚBLICAS

| Ruta | Descripción |
|---|---|
| `/` | Landing page |
| `/servicios` | Catálogo público de servicios (búsqueda, categoría, paginación) |
| `/proveedores` | Catálogo público de proveedores (búsqueda, filtros, zona) |
| `/iniciar-sesion` | Página de login |
| `/registrarse` | Página de registro (cliente o proveedor) |
| `/recuperar-contrasena` | Recuperación de contraseña por email |
| `/restablecer-contrasena` | Restablecimiento de contraseña |
| `/sobre-nosotros` | Información del proyecto |
| `/confianza` | Sistema de confianza explicado |
| `/ayuda` | Centro de ayuda |
| `/terminos` | Términos y condiciones |
| `/privacidad` | Política de privacidad |
| `/cookies` | Política de cookies |

---

## 13. COMANDOS PRINCIPALES

| Comando | Descripción |
|---|---|
| `pnpm install` | Instalar todas las dependencias del monorepo |
| `pnpm dev` | Iniciar API + Frontend en modo desarrollo |
| `pnpm dev:api` | Iniciar solo el backend |
| `pnpm dev:web` | Iniciar solo el frontend |
| `pnpm build` | Construir ambas aplicaciones para producción |
| `pnpm --filter web evaluar:sistema` | Ejecutar pruebas E2E con Playwright |
| `pnpm --filter web ver:reporte` | Ver reporte HTML de pruebas |
| `docker compose -f infra/docker-compose.yml up -d` | Levantar infraestructura |
| `docker compose -f infra/docker-compose.yml down` | Detener infraestructura |

---

## 14. VARIABLES DE ENTORNO CLAVE

| Variable | Descripción | Valor por defecto (dev) |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://servilocal_user:servilocal_pass@localhost:5433/servilocal_db` |
| `REDIS_URL` | Conexión a Redis | `redis://localhost:6379` |
| `AUTH_ACCESS_SECRET` | Secreto para JWT | `servilocal_access_secret_dev_2026` |
| `AUTH_ACCESS_TTL_SECONDS` | TTL del access token | 900 (15 min) |
| `AUTH_REFRESH_TTL_DAYS` | TTL del refresh token | 30 días |
| `CORS_ORIGINS` | Orígenes CORS permitidos | `http://localhost:3000` |
| `MAIL_HOST` / `MAIL_PORT` | Servidor de correo | `localhost` / `1025` |

---

## 15. CONSIDERACIONES TÉCNICAS IMPORTANTES

### 15.1 Puntos Fuertes
- ✅ Arquitectura modular bien separada (15 módulos NestJS independientes)
- ✅ Autenticación robusta (JWT + CSRF + Argon2 + brute-force)
- ✅ Sistema de caché Redis para endpoints públicos
- ✅ Rate limiting global con almacenamiento persistente (Redis)
- ✅ WebSockets para comunicación en tiempo real
- ✅ Sistema de confianza y recompensas (Trust Score + Puntos SL)
- ✅ Pruebas E2E automatizadas con Playwright (modo presentación)
- ✅ Documentación de despliegue y usuarios en `guias_sistema/`
- ✅ Datos seed realistas y completos (36+ cuentas)

### 15.2 Aspectos a Considerar
- ⚠️ `listPublicProviders()` carga TODOS los proveedores en memoria antes de filtrar
- ⚠️ Dashboard admin ejecuta 31 queries paralelas a la DB por cada carga
- ⚠️ Argon2 es CPU-bound y bloquea el event loop de Node.js bajo alta concurrencia
- ⚠️ No hay connection pool explícito configurado en Prisma/PostgreSQL
- ⚠️ Búsquedas de texto usan `ILIKE` sin índices GIN dedicados
- ⚠️ Node.js corre en modo single-thread (sin cluster mode)
- ⚠️ No hay health check endpoint
- ⚠️ No hay circuit breaker ni graceful degradation

### 15.3 Capacidad Estimada
- **Uso óptimo:** Hasta ~100-150 usuarios concurrentes
- **Punto de inflexión:** ~250 usuarios (degradación visible)
- **Punto de ruptura estimado:** ~350 usuarios concurrentes
- **Throughput máximo sostenible:** ~370 req/s @ 200 usuarios

---

> **Nota:** Este documento es una referencia informativa generada a partir del análisis del código fuente del proyecto. Para instrucciones operativas, consulte las otras guías en esta carpeta: `INICIAR_SISTEMA.md`, `EJECUTAR_PRUEBAS.md`, `USUARIOS_SISTEMA.md`.
