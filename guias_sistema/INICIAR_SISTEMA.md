# Guía para Iniciar ServiLocal2026

Este documento detalla los pasos necesarios para levantar el sistema completo en modo desarrollo en tu entorno local.

## 1. Requisitos Previos

Asegúrate de tener instalados:
- **Node.js** (v18 o superior)
- **pnpm** (gestor de paquetes usado en el monorepo)
- **Docker Desktop** (para la base de datos y servicios auxiliares)

## 2. Iniciar la Infraestructura (Base de Datos)

El proyecto depende de PostgreSQL y Redis. Se ejecutan fácilmente usando Docker.

1. Abre tu terminal.
2. Asegúrate de tener **Docker Desktop abierto** y corriendo.
3. Ejecuta el siguiente comando para levantar los contenedores en segundo plano:
   ```bash
   pnpm docker:up
   ```
   *(Esto iniciará PostgreSQL en el puerto 5433, Redis en el 6379 y Mailpit en el 1025/8025).*

## 3. Iniciar el Sistema (API y Frontend)

El proyecto es un monorepo que contiene tanto el backend (API en NestJS) como el frontend (Web en Next.js).

1. En la raíz del proyecto, instala las dependencias si no lo has hecho:
   ```bash
   pnpm install
   ```
2. Ejecuta el comando principal para arrancar ambos servicios simultáneamente:
   ```bash
   pnpm dev
   ```

## 4. Acceder a las Aplicaciones

Una vez que ambos servidores estén listos, puedes acceder desde tu navegador:

- **Frontend (Web):** [http://localhost:3000](http://localhost:3000)
- **Backend (API Base):** [http://localhost:3001/api](http://localhost:3001/api)
- **Caja de Correos (Mailpit):** [http://localhost:8025](http://localhost:8025)

## 5. Detener el Sistema

Para detener los servidores de desarrollo de Node.js, simplemente presiona `Ctrl + C` en la terminal donde ejecutaste `pnpm dev`.

Para detener los contenedores de la base de datos (Docker):
```bash
pnpm docker:down
```
