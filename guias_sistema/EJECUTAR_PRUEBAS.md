# Guía de Pruebas Automatizadas (E2E)

El proyecto ServiLocal2026 cuenta con un sistema de pruebas automatizadas (End-to-End) utilizando **Playwright**. Este sistema abre un navegador Chromium (Chrome) real y simula interacciones de usuario para verificar que la plataforma funcione correctamente.

## Requisitos Previos
1. El proyecto y sus dependencias deben estar instalados (`pnpm install`).
2. El contenedor de base de datos (PostgreSQL) de Docker debe estar en ejecución (`pnpm docker:up`).
3. **¡IMPORTANTE!** El sistema completo (API y Web) debe estar en ejecución en otra terminal. Playwright solo ejecuta las pruebas sobre lo que ya está corriendo.
   - Abre otra terminal y ejecuta: `pnpm dev`
   - Espera a que tanto el backend (puerto 3001) como el frontend (puerto 3000) estén listos.

## Cómo iniciar las pruebas

Abre tu terminal actual en la **raíz del proyecto** (`C:\Proyectos2026\ServiLocal2026`) y ejecuta el siguiente comando:


```bash
pnpm --filter web evaluar:sistema
```

### ¿Qué hace este comando?
- Abre un navegador en modo "presentación" (es decir, verás el navegador abriéndose e interactuando solo, simulando los clics y el rellenado de formularios de un humano).
- Ejecuta todas las validaciones definidas (inicio de sesión exitoso, inicio de sesión fallido, validaciones de los campos, etc.).
- Comprueba exhaustivamente la interfaz y la respuesta del servidor.

## Ver los Resultados

Si todo fue exitoso o si hubo errores, Playwright genera un reporte visual HTML detallado. Para abrirlo y verlo en tu navegador, ejecuta:

```bash
pnpm --filter web ver:reporte
```

## Usuarios Utilizados en las Pruebas

Playwright utiliza internamente usuarios de prueba (`*.servilocal.test`) para sus operaciones automatizadas. Estos son los usuarios limpios creados específicamente con ese propósito, lo que evita corromper las cuentas de demostración.
