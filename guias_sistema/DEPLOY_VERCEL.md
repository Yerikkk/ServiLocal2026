# Guía de Despliegue en Vercel y GitHub

Esta guía explica paso a paso cómo subir tu proyecto a GitHub y posteriormente desplegar la aplicación frontend (`apps/web`) en Vercel.

> [!WARNING]
> Vercel es ideal para aplicaciones frontend (como React, Next.js, Vite). Sin embargo, si tu backend (`apps/api`) usa NestJS y WebSockets, Vercel **no es la mejor opción** para el backend (ya que Vercel usa funciones serverless que no mantienen conexiones abiertas). El backend debería alojarse en servicios como Render, Railway, Heroku o un VPS (como DigitalOcean/AWS). 

---

## 1. Subir el proyecto a GitHub

### Requisitos previos:
- Tener instalada la herramienta **Git** en tu computadora.
- Tener una cuenta en **[GitHub](https://github.com/)**.

### Paso a paso:

1. **Crea un nuevo repositorio en GitHub**:
   - Ve a GitHub y haz clic en el botón **"New"** (Nuevo repositorio).
   - Ponle un nombre (ej. `ServiLocal2026`).
   - Déjalo como Público o Privado según prefieras.
   - **No marques** la opción de inicializar con un README, `.gitignore` o licencia (tu proyecto ya debería tenerlos).
   - Haz clic en **Create repository**.

2. **Inicializa Git en tu proyecto local**:
   Abre una terminal en la carpeta raíz de tu proyecto (`c:\Proyectos2026\ServiLocal2026`) y ejecuta:
   ```bash
   # Inicializar git si no lo está
   git init

   # Agregar todos los archivos
   git add .

   # Crear el primer commit
   git commit -m "Commit inicial del sistema ServiLocal"
   ```

3. **Conecta tu proyecto local con GitHub**:
   En la página del repositorio que acabas de crear en GitHub, copia los comandos que aparecen en la sección *"…or push an existing repository from the command line"*. Serán similares a estos:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/ServiLocal2026.git
   git push -u origin main
   ```
   *(Pega estos comandos en tu terminal y presiona Enter).*

¡Listo! Tu código ahora está en GitHub.

---

## 2. Desplegar el Frontend (`apps/web`) en Vercel

### Requisitos previos:
- Crear una cuenta en **[Vercel](https://vercel.com/)** e iniciar sesión (idealmente usando tu cuenta de GitHub).

### Paso a paso:

1. **Importar el proyecto en Vercel**:
   - Ve a tu Dashboard de Vercel y haz clic en el botón **"Add New..."** > **"Project"**.
   - En la sección "Import Git Repository", verás tu cuenta de GitHub conectada. Busca el repositorio `ServiLocal2026` y haz clic en **"Import"**.

2. **Configurar el proyecto (IMPORTANTE PARA MONOREPOS)**:
   Dado que este es un monorepo (Turborepo) con varias aplicaciones, debes configurar Vercel para que sepa qué parte desplegar:

   - **Project Name**: `servilocal-web` (o el que prefieras).
   - **Framework Preset**: Vercel lo detectará automáticamente (ej. Next.js o Vite).
   - **Root Directory**: Haz clic en "Edit" y selecciona la carpeta **`apps/web`**.
   
3. **Variables de Entorno (Environment Variables)**:
   - Despliega la sección "Environment Variables".
   - Aquí debes agregar las variables de entorno que necesita tu frontend (las que tengas en tu archivo `.env` de `apps/web`). 
   - Por ejemplo, si tu frontend necesita conectarse a la API, deberás agregar la URL de la API:
     - Name: `VITE_API_URL` (o `NEXT_PUBLIC_API_URL` según tu framework)
     - Value: `https://tu-api-en-produccion.com`

4. **Desplegar**:
   - Haz clic en el botón **"Deploy"**.
   - Vercel comenzará a descargar el código, instalar las dependencias y construir la aplicación web.
   - Si todo sale bien, verás una pantalla de confeti 🎉 y te dará una URL pública (ej. `servilocal-web.vercel.app`) donde podrás ver tu proyecto en vivo.

---

## 3. Flujo de Trabajo Continuo (CI/CD)

A partir de ahora, cada vez que hagas cambios en tu código y quieras subirlos, solo debes ejecutar:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Al hacer `git push` hacia GitHub, **Vercel detectará el cambio automáticamente** y comenzará un nuevo despliegue (deploy) sin que tengas que hacer nada más.
