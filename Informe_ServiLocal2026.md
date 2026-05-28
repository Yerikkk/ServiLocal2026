ServiLocal — Informe del Sistema

SERVILOCAL
Plataforma de Servicios Locales

Informe de Especificación del Sistema
Versión 1.0 | Documento completo

TABLA DE CONTENIDOS
Descripción General del Sistema
Objetivos
Tipos de Usuarios del Sistema
Módulos del Sistema
Páginas del Sistema
Arquitectura del Sistema
Entidades de Base de Datos
Seguridad del Sistema
Flujo Funcional del Sistema
Priorización para la Versión 1
Requisitos No Funcionales
Mejoras y Fases Futuras
Conclusión
1. Descripción General del Sistema
1.1 Nombre del Sistema

ServiLocal

1.2 Idea General

ServiLocal es una plataforma web diseñada para conectar personas que necesitan un servicio con proveedores locales que lo ofrecen. No se trata de un simple directorio: el sistema busca construir un ecosistema de confianza donde clientes y prestadores puedan interactuar con seguridad, con historial, con reputación medida por comportamiento real y con control total de su actividad.

1.3 Propuesta de Valor

La diferencia de ServiLocal frente a plataformas similares se centra en tres pilares:

Barra de confianza basada en comportamiento real, no en calificaciones manuales.
Sistema de puntos SL que recompensa la actividad positiva y fomenta la fidelización.
Auditoría completa del sistema, garantizando trazabilidad de todas las acciones relevantes.
1.4 Finalidad del Sistema

Resolver el problema de encontrar servicios confiables en la comunidad de forma rápida, organizada y segura, brindando a clientes, proveedores y administradores un entorno digital propio que centralice todo el proceso.

2. Objetivos
2.1 Objetivo General

Desarrollar un sistema web moderno, seguro y responsivo que permita la gestión integral de servicios locales, conectando clientes, proveedores y administradores mediante un entorno digital confiable y diferenciado.

2.2 Objetivos Específicos
Permitir el registro, inicio y cierre de sesión seguro de usuarios por roles.
Mostrar un catálogo de servicios y proveedores con información clara y verificable.
Permitir al cliente solicitar servicios, negociar condiciones y dar seguimiento al estado.
Permitir al proveedor gestionar su perfil profesional y las solicitudes recibidas.
Incorporar mensajería interna privada vinculada a solicitudes activas.
Implementar una barra de confianza dinámica basada en el comportamiento del usuario.
Otorgar puntos SL por actividad positiva dentro del sistema.
Garantizar seguridad de acceso mediante tokens, roles y auditoría de eventos.
Ofrecer paneles personalizados y diferenciados por tipo de usuario.
Diseñar una experiencia moderna, clara, responsiva y profesional.
3. Tipos de Usuarios del Sistema

El sistema maneja tres roles principales, cada uno con acceso, permisos y funciones diferenciadas.

Cliente
Perfil: Persona que busca servicios
Función principal: Buscar, comparar, solicitar y dar seguimiento a servicios

Proveedor
Perfil: Persona que ofrece servicios
Función principal: Publicar servicios, gestionar solicitudes, mantener reputación

Administrador
Perfil: Gestión interna del sistema
Función principal: Supervisar usuarios, categorías, incidencias y auditoría

3.1 Cliente

Es el usuario que accede a la plataforma con el objetivo de encontrar y contratar proveedores de confianza para sus necesidades.

Funciones:
Registrarse e iniciar sesión en la plataforma.
Editar su perfil personal y configurar su cuenta.
Buscar proveedores por categoría, nombre o ubicación referencial.
Ver el detalle de servicios y el perfil de confianza de cada proveedor.
Enviar solicitudes de servicio con descripción y fecha estimada.
Negociar condiciones con el proveedor mediante mensajería interna.
Revisar el historial completo de solicitudes propias.
Guardar proveedores y servicios en favoritos.
Revisar su propia barra de confianza y puntos SL acumulados.
Recibir notificaciones de cambios de estado y mensajes nuevos.
3.2 Proveedor

Es el usuario que ofrece sus servicios dentro del ecosistema, buscando ganar visibilidad y reputación.

Funciones:
Registrarse e iniciar sesión como proveedor.
Completar su perfil profesional: descripción, experiencia, disponibilidad y ubicación referencial.
Publicar, editar y desactivar servicios propios.
Recibir y gestionar solicitudes de clientes (aceptar, rechazar, negociar).
Comunicarse con clientes por mensajería interna.
Revisar sus estadísticas de actividad, solicitudes y reputación.
Consultar y hacer crecer su barra de confianza y puntos SL.
Recibir notificaciones de nuevas solicitudes y mensajes.
3.3 Administrador

Es el usuario con control total sobre el sistema. No interactúa directamente con solicitudes de servicio, sino que supervisa el funcionamiento general.

Funciones:
Gestionar usuarios: ver, activar, desactivar y editar cuentas.
Gestionar proveedores y su información profesional.
Controlar el catálogo de categorías de servicios.
Revisar el registro de auditoría del sistema.
Supervisar solicitudes activas y conflictivas.
Revisar incidencias reportadas por usuarios.
Monitorear estadísticas generales de uso de la plataforma.
Supervisar reputación y comportamiento de usuarios.
4. Módulos del Sistema
4.1 Módulo de Autenticación

Controla el acceso al sistema con seguridad robusta.

Registro de cuenta con nombre, correo, contraseña y rol.
Inicio de sesión con correo y contraseña.
Cierre de sesión con invalidación de sesión activa.
Persistencia de sesión mediante refresh token en cookie HttpOnly.
Restauración de sesión al recargar la página.
Control de acceso por roles (cliente, proveedor, administrador).
Bloqueo temporal de cuenta tras 5 intentos fallidos consecutivos.
Uso de JWT como access token y refresh token como sesión persistente.
Registro de inicio y cierre de sesión en el log de auditoría.

Regla de bloqueo: tras 5 intentos fallidos, la cuenta queda bloqueada por 15 minutos.
El campo lockedUntil en la entidad User controla el tiempo de desbloqueo automático.
El administrador puede desbloquear manualmente desde el panel de gestión.

4.2 Módulo de Perfil de Usuario

Cada usuario tiene un perfil visible y editable según su rol.

Nombre completo, correo y foto o avatar.
Datos personales básicos editables (teléfono, descripción personal).
Configuración de cuenta: cambio de contraseña, preferencias.
Historial de actividad resumida.
Estado de cuenta: activa o inactiva (gestionado por administrador).
El proveedor tiene adicionalmente un perfil profesional con: descripción, años de experiencia, disponibilidad, ubicación referencial y categoría principal.
4.3 Módulo de Servicios

Catálogo de servicios publicados por los proveedores.

Categoría y subcategoría del servicio.
Nombre, descripción y precio referencial.
Tiempo estimado de ejecución.
Proveedor responsable con enlace a su perfil.
Estado del servicio: activo o inactivo.
El proveedor puede publicar, editar y desactivar sus servicios desde su panel.
4.4 Módulo de Solicitudes

Es el núcleo transaccional del sistema. Gestiona todo el ciclo de vida de una solicitud de servicio entre cliente y proveedor.

Estados del ciclo de vida

Pendiente
El cliente creó la solicitud. El proveedor aún no responde.
Quién actúa: Sistema / Proveedor

En negociación
El proveedor propone condiciones o ajustes. Ambos conversan.
Quién actúa: Ambos

Aceptada
Ambas partes acordaron condiciones. El servicio se ejecutará.
Quién actúa: Proveedor

En proceso
El proveedor comenzó la ejecución del servicio.
Quién actúa: Proveedor

Completada
El servicio fue finalizado satisfactoriamente.
Quién actúa: Proveedor / Sistema

Cancelada
La solicitud fue cancelada por el cliente o el proveedor.
Quién actúa: Cualquiera

Expirada
El proveedor no respondió en el tiempo límite (48 horas).
Quién actúa: Sistema

Reglas de negocio
El cliente puede cancelar una solicitud en estado Pendiente o En negociación.
El proveedor puede cancelar en cualquier estado hasta Aceptada.
Una vez en estado En proceso, solo el proveedor puede marcarla como Completada.
Si el proveedor no responde en 48 horas, la solicitud pasa automáticamente a Expirada.
La negociación se lleva a cabo exclusivamente por mensajería interna.
Cada cambio de estado genera una notificación para la parte involucrada.
Cada cambio de estado queda registrado en el historial de la solicitud.
4.5 Módulo de Mensajería

Permite la comunicación privada entre cliente y proveedor dentro del sistema.

Las conversaciones son privadas entre el cliente y el proveedor de una solicitud.
Cada conversación está vinculada a una solicitud específica (requestId requerido).
No existen conversaciones independientes sin solicitud asociada: toda comunicación nace de una solicitud activa.
Historial completo de mensajes con fecha y hora.
Indicador visual de mensajes no leídos en el panel y el menú.
Acceso rápido a la conversación desde el detalle de la solicitud.

Decisión de diseño: la mensajería requiere siempre una solicitud activa como contexto.
Esto evita contacto sin intención de servicio y mantiene todas las conversaciones trazables.
Una solicitud puede tener solo una conversación asociada.

4.6 Módulo de Notificaciones

Informa al usuario de eventos relevantes del sistema en tiempo real.

Nueva solicitud recibida → Proveedor → Acción requerida
Solicitud aceptada → Cliente → Informativa
Solicitud rechazada → Cliente → Informativa
Cambio de estado en solicitud → Ambos → Informativa
Mensaje nuevo recibido → Ambos → Acción requerida
Solicitud completada → Ambos → Informativa
Solicitud expirada → Ambos → Alerta
Cuenta desactivada/reactivada → Usuario afectado → Alerta
4.7 Módulo de Favoritos

Permite que el cliente guarde referencias de interés para acceder rápidamente.

El cliente puede marcar proveedores como favoritos.
El cliente puede marcar servicios específicos como favoritos.
Ambos tipos se gestionan con tablas separadas en base de datos (FavoriteProvider y FavoriteService) para evitar ambigüedad.
Visualización clara en la sección de favoritos del panel del cliente.
El cliente puede eliminar favoritos desde el panel o desde el perfil/servicio.
4.8 Módulo de Actividad

Registra y muestra al usuario un resumen de sus acciones recientes dentro de la plataforma.

Solicitudes recientes con estado actual.
Mensajes recientes no leídos.
Cambios de estado recientes.
Últimos servicios o proveedores visitados.
Visible desde el panel de cada rol.
4.9 Módulo de Confianza

Módulo diferenciador de ServiLocal. Reemplaza el sistema de estrellas por una barra de confianza dinámica basada en el comportamiento real del usuario.

Escala de confianza

La confianza va de 0 a 100 puntos y se representa visualmente como una barra de progreso con niveles:

0–29 → Sin reputación suficiente → Gris
30–49 → Confianza baja → Rojo
50–69 → Confianza media → Amarillo
70–89 → Confianza alta → Verde
90–100 → Proveedor / cliente destacado → Azul
Eventos que modifican la confianza
Solicitud completada exitosamente → Sube → +8
Respuesta al cliente en menos de 2 horas → Sube → +3
Uso activo de la plataforma (semanal) → Sube → +2
Cancelación injustificada (sin motivo) → Baja → −10
Cancelación reiterada (3 o más en 30 días) → Baja → −20
Solicitud expirada por falta de respuesta → Baja → −8
Reporte validado por administrador → Baja → −15
Inactividad prolongada (más de 60 días) → Baja → −5

La confianza no puede bajar de 0 ni superar 100.
Cada evento queda registrado en la entidad TrustEvent para trazabilidad completa.
El administrador puede anular manualmente un evento de confianza justificando la razón.

4.10 Módulo de Puntos SL

Sistema de recompensas que incentiva la participación positiva dentro de la plataforma.

Cómo se ganan puntos
Completar una solicitud: +10 puntos.
Primer servicio completado del mes: +5 puntos adicionales.
Responder una solicitud en menos de 1 hora: +3 puntos.
Uso activo semanal de la plataforma: +2 puntos.
Mantener confianza mayor a 80 por 30 días: +5 puntos.
Para qué sirven los puntos
Indicar el nivel de experiencia y participación del usuario.
Desbloquear insignias y reconocimientos visibles en el perfil.
Base para futuros beneficios o descuentos (fase posterior).
4.11 Módulo de Administración

Panel de control total del sistema para el usuario administrador.

Funciones esenciales para la versión 1
Listado completo de usuarios con filtros por rol, estado y fecha de registro.
Activación y desactivación de cuentas de usuario.
Gestión del catálogo de categorías: crear, editar, activar, desactivar.
Visualización del registro de auditoría con filtros por usuario, acción y fecha.
Revisión de incidencias reportadas por usuarios.
Funciones para versiones futuras
Dashboard estadístico avanzado con gráficos de uso.
Panel de moderación de contenido.
Gestión de reportes automáticos.
Control manual de confianza con justificación.
4.12 Módulo de Ayuda y Soporte

Brinda orientación al usuario dentro de la plataforma.

Preguntas frecuentes (FAQ) organizadas por rol.
Guía de uso básica para clientes y proveedores.
Formulario de contacto de soporte.
Reporte de problemas desde cualquier pantalla privada.
5. Páginas del Sistema
5.1 Páginas Públicas

Accesibles sin iniciar sesión. Diseñadas para captar y orientar a nuevos usuarios.

/ → Inicio → Landing page principal con presentación del sistema.
/servicios → Servicios → Catálogo público de servicios disponibles.
/proveedores → Proveedores → Listado de proveedores registrados con filtros.
/sobre-nosotros → Sobre nosotros → Qué es ServiLocal, cómo funciona y por qué es seguro.
/ayuda → Ayuda → Centro de ayuda, FAQ y contacto de soporte.
/ingresar → Ingresar → Formulario de inicio de sesión.
/registrarse → Registrarse → Formulario de creación de cuenta con selección de rol.

La ruta raíz / renderiza directamente la página de Inicio.
No existe /inicio como ruta separada para evitar duplicidades en el router.
La página “Sobre nosotros” integra: descripción, cómo funciona, seguridad y beneficios por rol.

5.2 Páginas Privadas

Requieren sesión activa. El acceso es filtrado por rol en el router del frontend.

/dashboard/cliente → Panel del cliente → Cliente
/dashboard/proveedor → Panel del proveedor → Proveedor
/dashboard/admin → Panel de administración → Administrador
/perfil → Mi perfil → Todos
/mensajes → Mensajes → Cliente, Proveedor
/mensajes/:id → Conversación específica → Cliente, Proveedor
/favoritos → Mis favoritos → Cliente
/actividad → Mi actividad → Todos
/configuracion → Configuración → Todos
/ayuda → Ayuda → Todos
6. Arquitectura del Sistema
6.1 Visión General

ServiLocal utiliza una arquitectura cliente-servidor clásica con separación total entre frontend y backend, comunicados mediante una API REST segura.

Frontend

React + TypeScript
Vite
Tailwind CSS

Backend

NestJS + TypeScript
JWT + Bcrypt
Cookies HttpOnly

Base de datos

PostgreSQL
Prisma ORM
Migraciones versionadas
6.2 Frontend
Tecnologías
React 18 con TypeScript para tipado estático.
Vite como bundler para desarrollo rápido.
TailwindCSS para estilos utilitarios y responsividad.
React Router v6 para navegación y protección de rutas.
Context API o Zustand para estado global de autenticación.
Axios o fetch nativo para consumo de API.
Estructura de carpetas
src/pages/ — vistas completas de cada página.
src/components/ — componentes reutilizables (Button, Card, Modal, etc.).
src/layouts/ — estructuras de página (PublicLayout, PrivateLayout).
src/routes/ — definición de rutas y protección por rol.
src/context/ — contexto de autenticación y estado global.
src/services/ — funciones de llamada a la API.
src/types/ — definición de interfaces TypeScript.
src/utils/ — funciones auxiliares y formateadores.
6.3 Backend
Tecnologías
NestJS con TypeScript — framework modular y escalable.
JWT para access token de corta duración (15 minutos).
Refresh token almacenado en cookie HttpOnly (7 días).
Bcrypt para hashing de contraseñas.
Prisma ORM para acceso tipado a la base de datos.
class-validator para validación de DTOs en cada endpoint.
Módulos del backend
auth — registro, login, logout, refresh de token.
users — gestión de perfiles y configuración de cuenta.
providers — perfiles profesionales de proveedores.
services — catálogo de servicios.
requests — ciclo de vida completo de solicitudes.
messages — mensajería interna y conversaciones.
notifications — emisión y lectura de notificaciones.
favorites — gestión de favoritos del cliente.
trust — cálculo y registro de eventos de confianza.
points — acumulación de puntos SL.
audit — registro automático de acciones del sistema.
admin — endpoints exclusivos del administrador.
categories — gestión del catálogo de categorías.
6.4 Base de Datos

PostgreSQL con Prisma ORM. Las migraciones deben ser versionadas y documentadas. Se recomienda usar semillas (seeds) para datos iniciales en desarrollo.

Motor: PostgreSQL 15+.
ORM: Prisma con generación automática de tipos TypeScript.
Las relaciones entre entidades se manejan con claves foráneas explícitas.
Se recomienda índices en campos de búsqueda frecuente: email, userId, status, createdAt.
7. Entidades de Base de Datos

Se detallan todas las entidades con sus campos, tipos y justificación de diseño.

7.1 User
id → UUID → Identificador único del usuario.
fullName → String → Nombre completo visible en el perfil.
email → String (único) → Correo electrónico usado para autenticarse.
passwordHash → String → Contraseña hasheada con bcrypt (factor 12).
role → Enum: CLIENT | PROVIDER | ADMIN → Rol que determina el acceso y panel.
isActive → Boolean (default: true) → Indica si la cuenta está activa.
trustScore → Int (default: 50) → Puntuación de confianza entre 0 y 100.
slPoints → Int (default: 0) → Puntos SL acumulados.
failedLoginAttempts → Int (default: 0) → Contador de intentos fallidos consecutivos.
lockedUntil → DateTime? → Fecha y hora de desbloqueo automático.
lastLoginAt → DateTime? → Último inicio de sesión exitoso.
createdAt → DateTime → Fecha de registro.
updatedAt → DateTime → Última actualización del registro.
7.2 RefreshToken
id → UUID → Identificador único.
userId → UUID (FK User) → Usuario al que pertenece el token.
tokenHash → String → Hash del refresh token (nunca se guarda en texto plano).
expiresAt → DateTime → Fecha de expiración del token (7 días).
revokedAt → DateTime? → Fecha de revocación al cerrar sesión.
createdAt → DateTime → Fecha de creación.
7.3 ProviderProfile
id → UUID → Identificador único.
userId → UUID (FK User, único) → Relación 1:1 con el usuario proveedor.
description → String → Descripción profesional del proveedor.
experienceYears → Int → Años de experiencia declarados.
availability → String → Disponibilidad horaria (ej: Lunes a Viernes 9–18 h).
location → String → Ubicación referencial (distrito, ciudad).
categoryId → UUID (FK Category) → Categoría principal de servicios del proveedor.
createdAt → DateTime → Fecha de creación del perfil profesional.
updatedAt → DateTime → Última actualización.
7.4 Category
id → UUID → Identificador único.
name → String (único) → Nombre de la categoría (ej: Plomería, Electricidad).
description → String? → Descripción opcional de la categoría.
isActive → Boolean (default: true) → Controla si la categoría aparece en el catálogo.
7.5 Service
id → UUID → Identificador único.
providerId → UUID (FK ProviderProfile) → Proveedor que publica el servicio.
categoryId → UUID (FK Category) → Categoría a la que pertenece el servicio.
title → String → Nombre del servicio.
description → String → Descripción detallada.
priceReference → Decimal? → Precio referencial (puede ser rango o estimado).
estimatedTime → String? → Tiempo estimado de ejecución (ej: 2 horas, 1 día).
isActive → Boolean (default: true) → Indica si el servicio está visible en el catálogo.
createdAt → DateTime → Fecha de publicación.
updatedAt → DateTime → Última actualización.
7.6 ServiceRequest
id → UUID → Identificador único.
clientId → UUID (FK User) → Cliente que genera la solicitud.
providerId → UUID (FK User) → Proveedor al que se dirige la solicitud.
serviceId → UUID (FK Service) → Servicio solicitado.
status → Enum (ver estados) → Estado actual del ciclo de vida.
description → String → Descripción del trabajo requerido por el cliente.
scheduledDate → DateTime? → Fecha estimada que propone el cliente.
cancelReason → String? → Razón de cancelación (obligatoria al cancelar).
expiresAt → DateTime → Fecha de expiración automática (48 horas tras creación).
createdAt → DateTime → Fecha de creación.
updatedAt → DateTime → Última actualización.
7.7 Conversation y Message

La conversación agrupa los mensajes de una solicitud. Existe relación 1:1 entre solicitud y conversación.

Conversation
id → Identificador único.
requestId (FK ServiceRequest, único) → Solicitud a la que pertenece (relación 1:1).
clientId (FK User) → Cliente participante.
providerId (FK User) → Proveedor participante.
createdAt → Fecha de inicio de la conversación.
Message
id → Identificador único.
conversationId (FK Conversation) → Conversación a la que pertenece.
senderId (FK User) → Usuario que envía el mensaje.
content → Contenido del mensaje.
isRead → Indica si fue leído por el destinatario.
createdAt → Fecha y hora de envío.
7.8 FavoriteProvider y FavoriteService

Se usan dos tablas separadas en lugar de un campo ambiguo para mantener la integridad del modelo.

FavoriteProvider
id → Identificador único.
userId (FK User) → Cliente que guarda el favorito.
providerId (FK User) → Proveedor guardado como favorito.
createdAt → Fecha en que se guardó.
FavoriteService
id → Identificador único.
userId (FK User) → Cliente que guarda el favorito.
serviceId (FK Service) → Servicio guardado como favorito.
createdAt → Fecha en que se guardó.
7.9 Notification
id → UUID → Identificador único.
userId → UUID (FK User) → Usuario destinatario.
title → String → Título corto de la notificación.
content → String → Descripción detallada del evento.
type → Enum → Categoría: INFO, ACTION, ALERT.
isRead → Boolean (default: false) → Indica si fue leída.
createdAt → DateTime → Fecha de emisión.
7.10 AuditLog
id → UUID → Identificador único.
action → String → Acción registrada (ej: LOGIN, LOGOUT, UPDATE_PROFILE).
userId → UUID? → Usuario que ejecutó la acción (nulo si es acción del sistema).
email → String? → Correo del usuario al momento de la acción.
ipAddress → String → Dirección IP de origen.
userAgent → String? → Agente de usuario del navegador.
metadata → JSON? → Datos adicionales relevantes de la acción.
createdAt → DateTime → Fecha y hora exacta del evento.
7.11 TrustEvent
id → UUID → Identificador único.
userId → UUID (FK User) → Usuario afectado por el evento.
type → String → Tipo de evento (ej: REQUEST_COMPLETED, CANCELLATION).
pointsChange → Int → Variación de confianza (positiva o negativa).
reason → String → Descripción del motivo del cambio.
requestId → UUID? (FK ServiceRequest) → Solicitud relacionada si aplica.
createdAt → DateTime → Fecha del evento.
8. Seguridad del Sistema
8.1 Autenticación y Tokens
Contraseñas hasheadas con bcrypt, factor de costo 12.
Access token JWT de duración corta: 15 minutos.
Refresh token de duración larga: 7 días, almacenado hasheado en base de datos.
El refresh token se transmite únicamente como cookie HttpOnly, Secure y SameSite=Strict.
Al cerrar sesión, el refresh token se invalida (revokedAt).
Al renovar el access token, se rota el refresh token (rotación de tokens).
8.2 Control de Acceso
Todas las rutas privadas requieren un access token válido en el header Authorization.
Los endpoints de administrador validan adicionalmente que el rol sea ADMIN.
El frontend protege las rutas con un componente PrivateRoute que verifica sesión y rol.
El backend valida el rol en cada endpoint sensible, independientemente del frontend.
8.3 Protección contra Ataques
Throttling: límite de 10 solicitudes por segundo por IP en endpoints de autenticación.
Rate limiting global: 100 solicitudes por minuto por IP en todos los endpoints.
Bloqueo temporal: 5 intentos fallidos de login bloquean la cuenta por 15 minutos.
Sanitización de entradas: class-validator en todos los DTOs del backend.
Protección CSRF: el uso de cookies SameSite=Strict mitiga los ataques CSRF.
Headers de seguridad: uso de Helmet en NestJS para configurar headers HTTP seguros.
8.4 Auditoría
Toda acción relevante del sistema queda registrada en AuditLog de forma automática.
Los eventos auditados incluyen: login, logout, cambio de contraseña, modificación de perfil, cambios de estado de solicitudes, activaciones y desactivaciones de cuentas.
Los logs son de solo lectura: ningún usuario puede modificarlos, solo el administrador puede visualizarlos.
9. Flujo Funcional del Sistema
9.1 Flujo de Registro e Inicio de Sesión
El usuario accede a /registrarse y completa nombre, correo, contraseña y rol.
El sistema valida los datos, hashea la contraseña y crea la cuenta.
Se genera un access token y un refresh token automáticamente.
El usuario es redirigido a su panel según el rol seleccionado.
En sesiones posteriores: el usuario accede a /ingresar, ingresa correo y contraseña.
El sistema valida, verifica que la cuenta esté activa y no bloqueada.
Se emiten nuevos tokens y se redirige al panel correspondiente.
9.2 Flujo Completo de una Solicitud
El cliente busca un proveedor en el catálogo y revisa su perfil y barra de confianza.
El cliente crea una solicitud indicando descripción y fecha estimada.
El proveedor recibe una notificación de nueva solicitud.
El proveedor puede: aceptar (pasa a Aceptada), rechazar (pasa a Cancelada) o abrir negociación.
Si hay negociación, ambos conversan por mensajería hasta llegar a un acuerdo.
El proveedor acepta formalmente: la solicitud pasa a Aceptada.
El proveedor inicia el trabajo y cambia el estado a En proceso.
Al finalizar, el proveedor marca la solicitud como Completada.
El sistema actualiza automáticamente la confianza y los puntos SL de ambos usuarios.
Todo el ciclo queda registrado en historial de actividad y en auditoría.
9.3 Flujo de Expiración Automática
Al crear una solicitud, el sistema calcula expiresAt = createdAt + 48 horas.
Un job programado revisa periódicamente las solicitudes en estado Pendiente.
Si la fecha actual supera expiresAt, el estado cambia automáticamente a Expirada.
El sistema notifica a ambos usuarios del evento.
Se registra un TrustEvent negativo para el proveedor por falta de respuesta.
10. Priorización para la Versión 1

La versión 1 de ServiLocal debe tener una base funcional completa. Los módulos se organizan por prioridad para garantizar un producto utilizable desde el primer despliegue.

Esencial
Autenticación (registro, login, logout, JWT) → Sin esto no existe el sistema.
Perfiles de usuario y proveedor → Base de toda interacción.
Catálogo de servicios y proveedores → Propósito principal de la plataforma.
Ciclo de solicitudes completo → Valor central del producto.
Panel diferenciado por rol → Experiencia funcional mínima.
Importante
Mensajería interna → Necesaria para negociación.
Notificaciones básicas → Facilita el seguimiento de solicitudes.
Historial de actividad → Transparencia para el usuario.
Diferenciador
Barra de confianza → Elemento clave de la propuesta de valor.
Puntos SL → Refuerza fidelización.
Favoritos → Mejora experiencia del cliente.
Soporte
Auditoría del sistema → Necesaria para seguridad y control.
Panel de administrador básico → Gestión de usuarios y categorías.
11. Requisitos No Funcionales
11.1 Rendimiento
El tiempo de carga inicial de la aplicación debe ser inferior a 3 segundos en conexión promedio.
Las consultas más frecuentes (catálogo, perfil, solicitudes) deben tener índices en base de datos.
La paginación es obligatoria en todos los listados para evitar cargar grandes volúmenes de datos.
11.2 Usabilidad
Interfaz clara con jerarquía visual definida. Botones y acciones principales siempre visibles.
Mensajes de error comprensibles para el usuario (no mensajes técnicos crudos).
Confirmación visual en todas las acciones destructivas (cancelar solicitud, eliminar favorito).
Carga optimista en acciones frecuentes para reducir la sensación de latencia.
11.3 Responsividad
Diseño adaptable a escritorio (1280px+), tablet (768px) y móvil (320px+).
El menú de navegación debe colapsar en dispositivos móviles.
Las tablas de datos deben ser scrolleables horizontalmente en pantallas pequeñas.
11.4 Mantenibilidad
Código organizado en módulos separados tanto en frontend como en backend.
Nombres de variables, funciones y componentes descriptivos y en inglés.
Todo endpoint del backend debe tener su DTO de validación correspondiente.
Las migraciones de base de datos deben ser versionadas y nunca editadas retroactivamente.
11.5 Escalabilidad

La arquitectura modular permite agregar las siguientes funcionalidades en fases posteriores sin rediseñar el sistema:

Sistema de pagos integrado.
Geolocalización de proveedores en mapa.
Soporte de archivos adjuntos en solicitudes y mensajes.
Panel de estadísticas avanzadas con gráficos.
Reportes automáticos periódicos.
Soporte en tiempo real con WebSockets (mensajería en vivo).
Sistema de denuncias con flujo de revisión por moderador.
Recuperación de contraseña por correo electrónico.
Verificación de identidad de proveedores.
12. Mejoras y Fases Futuras
Fase 2 — Comunicación avanzada
Mensajería en tiempo real con WebSockets.
Soporte para archivos adjuntos en mensajes (imágenes, documentos).
Notificaciones push en dispositivos móviles.
Recuperación de contraseña por correo electrónico.
Fase 3 — Reputación y confianza avanzada
Sistema de reseñas y comentarios públicos (complementario a la barra de confianza).
Verificación de identidad de proveedores (documento o video).
Insignias y niveles visibles en el perfil.
Panel de moderación de contenido reportado.
Sistema formal de denuncias con flujo de revisión.
Fase 4 — Geolocalización y pagos
Mapa interactivo de proveedores por zona.
Filtro de búsqueda por radio de distancia.
Integración de pagos en línea dentro de la solicitud.
Facturación o comprobante de servicio descargable.
Fase 5 — Analítica e inteligencia
Dashboard estadístico con gráficos de uso para el administrador.
Recomendaciones personalizadas de proveedores para el cliente.
Informes periódicos automáticos por rol.
Detección de comportamientos anómalos para protección del sistema.
13. Conclusión

ServiLocal no es un directorio de servicios: es una plataforma integral donde la confianza, la seguridad y la transparencia son el eje central de cada interacción. La combinación de una barra de confianza basada en comportamiento real con un sistema de puntos que recompensa la actividad positiva la distingue de cualquier solución similar en el mercado local.

La arquitectura propuesta — React + NestJS + PostgreSQL — es moderna, modular y preparada para escalar. La versión 1 tiene alcance bien definido y priorizado para garantizar un producto funcional, seguro y diferenciado desde el primer lanzamiento.

Los pilares sobre los que descansa ServiLocal son:

Autenticación robusta con roles y auditoría completa.
Módulos separados y bien delimitados con lógica de negocio clara.
Confianza medida por comportamiento, no por opinión subjetiva.
Ciclo de solicitudes con estados bien definidos y reglas explícitas.
Base de datos limpia con entidades sin ambigüedad.
Experiencia de usuario moderna, responsiva y diferenciada por rol.

Con esta base, ServiLocal está preparado para iniciar su desarrollo por módulos de forma ordenada, con claridad en las reglas de negocio y en los criterios de calidad esperados para cada entrega.

Este documento constituye la especificación base para el desarrollo de ServiLocal v1.
Toda decisión de implementación no contemplada aquí debe documentarse y adjuntarse como anexo.
Se recomienda revisión de este informe al inicio de cada sprint para mantener la coherencia del sistema.