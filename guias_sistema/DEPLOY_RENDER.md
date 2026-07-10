# Guía de Despliegue del Backend en Render

Esta guía explica cómo desplegar la API (Backend en NestJS) de tu monorepo en **Render**, aprovechando su capa gratuita (Free Tier). Render es ideal para alojar aplicaciones Node.js y APIs que requieren conexiones persistentes, como WebSockets.

---

## 1. Crear una cuenta en Render

1. Ve a **[Render.com](https://render.com/)**.
2. Haz clic en **"Get Started"** (Comenzar).
3. Selecciona **"GitHub"** como método de registro. Esto es muy importante porque permitirá a Render acceder a tu repositorio directamente.
4. Autoriza a Render en GitHub.

---

## 2. Crear una Base de Datos PostgreSQL (Opcional, si usas Prisma)

Si tu API requiere una base de datos PostgreSQL en producción, puedes crear una gratuita en Render:

1. En el Dashboard de Render, haz clic en el botón **"New +"** y selecciona **"PostgreSQL"**.
2. Rellena los datos:
   - **Name**: `servilocal-db`
   - **Database / User**: Déjalos por defecto o pon un nombre de tu preferencia.
   - **Region**: Selecciona la más cercana a tus usuarios (ej. US East).
   - **Instance Type**: Selecciona **Free**.
3. Haz clic en **"Create Database"**.
4. Una vez creada, baja a la sección **"Connections"** y copia el **"Internal Database URL"** (si tu API estará en Render) o el **"External Database URL"** (si necesitas acceder desde fuera). Esta URL la usarás como tu `DATABASE_URL`.

---

## 3. Crear el Web Service para la API

1. En el Dashboard, haz clic en **"New +"** y selecciona **"Web Service"**.
2. En la sección "Connect a repository", elige "Build and deploy from a Git repository" y haz clic en **Next**.
3. Selecciona tu repositorio de GitHub `ServiLocal2026`. (Si no lo ves, haz clic en "Configure account" para darle permisos a Render sobre ese repositorio específico).
4. Configura el Web Service con los siguientes datos:
   
   - **Name**: `servilocal-api` (o el que prefieras).
   - **Region**: Usa la misma región que tu base de datos.
   - **Branch**: `main`
   - **Root Directory**: _(Déjalo vacío)_ - Render ejecutará los comandos desde la raíz del proyecto.
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     npm install -g pnpm && pnpm install && pnpm --filter api build
     ```
     *(Nota: Como usamos un monorepo con pnpm, instalamos pnpm primero y luego instalamos las dependencias y construimos solo la API).*
   
   - **Start Command**:
     ```bash
     pnpm --filter api start:prod
     ```
   
   - **Instance Type**: Asegúrate de seleccionar el plan **Free** (Gratis).

---

## 4. Configurar Variables de Entorno (Environment Variables)

Antes de hacer clic en "Create Web Service", baja a la sección **"Environment Variables"** o haz clic en "Advanced" y agrega todas las variables necesarias para tu backend (las que tienes en tu `.env` de `apps/api`), por ejemplo:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | *(Pega aquí la URL de tu base de datos, ej. la que creaste en el paso 2)* |
| `JWT_SECRET` | *(Una contraseña segura y larga para tus tokens JWT)* |
| `PORT` | `10000` *(Render prefiere el puerto 10000 por defecto)* |
| `FRONTEND_URL` | *(La URL de tu frontend en Vercel, ej. `https://servilocal-web.vercel.app` para CORS)* |

*(Asegúrate de incluir cualquier otra variable que utilice tu backend, como claves de Redis si usas caché, etc).*

---

## 5. ¡Desplegar!

1. Una vez puestas las variables, haz clic en el botón **"Create Web Service"**.
2. Render comenzará a clonar tu repositorio, ejecutar el comando de *Build* y finalmente iniciar la aplicación.
3. Puedes ver los logs (registros) en tiempo real en la pantalla. Si todo sale bien, verás un mensaje de "Your service is live 🎉".
4. Arriba a la izquierda, Render te asignará una URL pública (ej. `https://servilocal-api-abcd.onrender.com`).

> [!TIP]
> Si tu proyecto utiliza Prisma, asegúrate de que tu `Build Command` incluya la generación del cliente y las migraciones. Por ejemplo:
> `npm install -g pnpm && pnpm install && pnpm --filter api exec prisma generate && pnpm --filter api build && pnpm --filter api exec prisma migrate deploy`

---

## 6. Actualizaciones continuas (CI/CD)

Al igual que Vercel, Render está conectado a tu GitHub. Cada vez que hagas un `git push` a la rama `main`, Render detectará el cambio y automáticamente desplegará la nueva versión de tu API.

> [!NOTE]
> **Sobre el plan gratuito de Render**: Los servicios web gratuitos se "duermen" (spin down) después de 15 minutos de inactividad. Esto significa que la primera petición después de un tiempo puede tardar un poco más en responder (unos 30-50 segundos) mientras el servidor vuelve a encenderse. Para evitarlo, tendrías que pasar a un plan de pago.
