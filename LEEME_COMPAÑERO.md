# 🚀 ServiLocal 2026 — Guía de Arranque para el Equipo

> Sigue estos pasos **en orden**. Si los ejecutas así, el sistema levantará sin errores.

---

## ✅ Requisitos previos

Asegúrate de tener instaladas las siguientes herramientas antes de continuar:

| Herramienta | Versión mínima | Verificar con |
|---|---|---|
| **Node.js** | v20 LTS | `node -v` |
| **pnpm** | v9+ | `pnpm -v` |
| **Docker Desktop** | Última estable | `docker -v` |
| **Git** | Cualquiera | `git -v` |

---

## 📋 Pasos de configuración

### 1. Instalar dependencias

Desde la **raíz** del proyecto (donde está este archivo), ejecuta:

```bash
pnpm install
```

> Esto instala las dependencias de todos los workspaces (`apps/api`, `apps/web`, etc.) en un solo paso gracias a pnpm workspaces.

---

### 2. Configurar las variables de entorno

Copia el archivo de ejemplo y renómbralo:

```bash
# En Windows (PowerShell)
Copy-Item apps\api\.env.example apps\api\.env

# En macOS / Linux
cp apps/api/.env.example apps/api/.env
```

> ⚠️ **No modifiques los valores.** Las credenciales ya están alineadas con la configuración de Docker que levantarás en el siguiente paso.

---

### 3. Levantar los servicios de infraestructura (Docker)

Desde la **raíz** del proyecto, ejecuta:

```bash
docker compose -f infra/docker-compose.yml up -d
```

Esto levantará en segundo plano:
- 🐘 **PostgreSQL** en el puerto `5433`
- 🔴 **Redis** en el puerto `6379`
- 📬 **Mailpit** (SMTP de prueba) en los puertos `1025` (SMTP) y `8025` (UI web)

Puedes verificar que todo esté corriendo con:

```bash
docker compose -f infra/docker-compose.yml ps
```

---

### 4. Ejecutar las migraciones y el Seed de Prisma

Esto aplica el esquema de base de datos y carga los datos iniciales (usuarios admin, demo, categorías, etc.):

```bash
pnpm --filter api prisma:migrate
pnpm --filter api prisma:seed
```

> Si ves el mensaje `🌱 Seed completado` (o similar), todo salió bien.

---

### 5. Levantar el proyecto completo

```bash
pnpm dev
```

Este comando arranca en paralelo:
- **API (NestJS)** → `http://localhost:3001`
- **Web (Next.js)** → `http://localhost:3000`

Abre el navegador en **http://localhost:3000** y listo. 🎉

---

## 🔑 Credenciales de acceso (datos del Seed)

| Rol | Email | Contraseña |
|---|---|---|
| Administrador | `admin@servilocal.com` | `Admin12345*` |
| Usuario demo | `demo@servilocal.com` | `Demo12345*` |

---

## 📬 Herramientas de desarrollo incluidas

| Herramienta | URL | Descripción |
|---|---|---|
| API REST | http://localhost:3001 | Backend NestJS |
| Web App | http://localhost:3000 | Frontend Next.js |
| Mailpit UI | http://localhost:8025 | Bandeja de correos de prueba |
| Prisma Studio | `pnpm --filter api prisma studio` | Explorador visual de la BD |

---

## 🛑 Cómo detener todo

```bash
# Detener el servidor de desarrollo (Ctrl+C en la terminal donde corre pnpm dev)

# Detener y eliminar los contenedores Docker
docker compose -f infra/docker-compose.yml down
```

---

## 🐛 Solución de problemas comunes

**`Error: P1001 - Can't reach database server`**
→ Verifica que Docker esté corriendo y que el puerto `5433` no esté ocupado.

**`pnpm: command not found`**
→ Instala pnpm: `npm install -g pnpm`

**Puerto 3000 o 3001 en uso**
→ Cierra cualquier otro proceso que use esos puertos o reinicia Docker.

---

*Documento generado automáticamente — ServiLocal 2026*
