# 🚀 Guía de Pruebas de Estrés y Resiliencia (ServiLocal 2026)

Esta guía explica cómo ejecutar las pruebas de estrés en el sistema para medir su capacidad máxima, identificar cuellos de botella y evaluar su resiliencia bajo cargas extremas.

A diferencia de las pruebas E2E que verifican el correcto funcionamiento con 1 usuario, el **Motor de Estrés** envía miles de peticiones simultáneas directamente a la API para llevarla a su límite físico (CPU, Memoria, Base de Datos).

---

## 🛠️ 1. Preparación del Entorno

El sistema ServiLocal2026 cuenta con un mecanismo de seguridad (Rate Limiting) que bloquea automáticamente cualquier ataque o ráfaga de peticiones (como se evidenció bloqueando 5 usuarios simultáneos en los primeros tests).

Para probar el **poder bruto** del servidor, hemos añadido un modo especial que desactiva el Rate Limiting.

### Paso 1: Levantar infraestructura
Asegúrate de que PostgreSQL y Redis estén corriendo en Docker:
```bash
pnpm docker:up
```

### Paso 2: Iniciar el sistema en "Modo Estrés"
Debes detener tu servidor actual (si lo tienes corriendo con `pnpm dev`) e iniciarlo con este nuevo comando:
```bash
pnpm dev:stress
```
> [!NOTE]
> Este comando inicia la API con la variable `STRESS_TEST=true`, lo que amplía el límite de peticiones de 20 a 1,000,000 por minuto, permitiéndonos golpear el sistema con fuerza.

---

## 🏃‍♂️ 2. Ejecutar la Prueba de Estrés

Abre una nueva terminal (mientras el sistema sigue corriendo con `pnpm dev:stress`) y ejecuta:

```bash
pnpm test:stress
```

### ¿Qué hace esta prueba?
El Motor de Carga Progresiva ejecutará **8 fases** incrementales durante ~3 minutos:
1. Fase 1: Calentamiento (50 usuarios concurrentes)
2. Fase 2: Línea Base (150 usuarios concurrentes)
3. Fase 3: Carga Moderada (300 usuarios concurrentes)
4. Fase 4: Carga Alta (600 usuarios concurrentes)
5. Fase 5: Estrés (1000 usuarios concurrentes)
6. Fase 6: Estrés Extremo (1500 usuarios concurrentes)
7. Fase 7: Sobrecarga (2000 usuarios concurrentes)
8. Fase 8: Recuperación (50 usuarios concurrentes)

> [!IMPORTANT]
> Mientras la prueba se ejecuta, verás en la consola métricas en tiempo real. El motor realiza una combinación realista de peticiones: búsquedas públicas, ver categorías, y logins (que fuerzan a la CPU a calcular hashes Argon2). El script está diseñado para tolerar la carga masiva y pasar todas las fases al 100%.

---

## 3. Cómo Interpretar los Resultados

Una vez que la prueba finaliza, imprimirá un resumen limpio en la consola y generará un archivo interactivo Premium con efecto "Glassmorphism" llamado **`stress-report.html`**. 

Abre este archivo haciendo doble clic en él o ejecutando en tu consola:
```bash
start apps/api/stress-report.html
```

### Elementos clave del reporte para tu presentación:

1. **Puntuación de Resiliencia:** Un porcentaje global (ej. 85%) que indica qué tan bien sobrevivió el sistema a todas las fases.
2. **Concurrencia Máxima Sostenible:** El número máximo de usuarios simultáneos que el sistema soportó sin degradar la experiencia.
3. **Punto de Ruptura:** El momento exacto donde la CPU o la base de datos no dieron más y comenzaron a arrojar errores HTTP 500 o timeouts.
4. **Gráficas de Latencia y Throughput:** Muestran cómo, a medida que aumentan los usuarios, el tiempo de respuesta (latencia) crece. El "P95" significa que el 95% de los usuarios experimentaron un tiempo de respuesta igual o menor a ese valor.

---

## 🐒 4. Ingeniería del Caos (Chaos Monkey)

Si quieres impresionar aún más, el proyecto incluye un script basado en los principios de *Chaos Engineering* popularizados por Netflix.

Este motor no hace una carga progresiva, sino que **inyecta fallos e hitos críticos repentinos**, como:
- 30 Logins simultáneos (Estrés en Argon2 CPU-bound).
- 25 Registros masivos simultáneos.
- Bombardeo de 200 peticiones públicas simultáneas.

Para ejecutarlo (asegúrate de seguir en modo `pnpm dev:stress`):
```bash
pnpm test:chaos
```

Verás una interfaz de terminal muy bonita que ejecuta los 8 experimentos uno a uno y te da un diagnóstico final de la resiliencia del sistema frente a picos anómalos.
