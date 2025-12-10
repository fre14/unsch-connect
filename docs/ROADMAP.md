# 3.4. Roadmap del Proyecto: UNSCH Connect

## 1. Visión General

El objetivo de UNSCH Connect es consolidar su posición como la plataforma digital central para la comunidad de la Universidad Nacional de San Cristóbal de Huamanga. El desarrollo se guiará por fases, comenzando con una base sólida (MVP) y expandiéndose hacia funcionalidades más avanzadas de interacción, servicios académicos y personalización.

---

## Fase 1: Producto Mínimo Viable (MVP) - (COMPLETADO - Q1 2024)

Esta fase se centró en construir el núcleo funcional de la aplicación, estableciendo las bases para la interacción social y la comunicación oficial. Todas las siguientes funcionalidades ya han sido implementadas y probadas.

### 1.1. Funcionalidades de Usuario y Autenticación
- **Sistema de Registro por Roles:**
  - Formulario de registro discriminado para: Estudiante, Docente, Cuenta Oficial y Administrador.
  - Validación de correo institucional (`@unsch.edu.pe`).
  - Validación de campos específicos por rol (código de estudiante, DNI, etc.).
  - Validación de códigos de verificación secretos para roles de `official` y `admin`.
- **Inicio y Cierre de Sesión:** Autenticación segura usando Firebase Authentication.
- **Recuperación de Contraseña:** Flujo completo a través de correo electrónico.

### 1.2. Interacción Social (Core)
- **Feed Principal (`/home/community`):**
  - Creación de publicaciones de texto.
  - Visualización de publicaciones en orden cronológico inverso.
  - Funcionalidad de "Me Gusta" (`like`) en tiempo real.
  - Funcionalidad de "Repostear" (`repost`).
  - Sistema de comentarios anidados por publicación.
- **Perfiles de Usuario (`/home/profile`):**
  - Visualización de información del usuario (nombre, biografía, foto de perfil y portada).
  - Pestañas para separar publicaciones originales de `reposts`.
  - Conteo de seguidores y seguidos (funcionalidad de seguimiento por implementar).

### 1.3. Comunicación Institucional
- **Módulo de Anuncios Oficiales (`/home/announcements`):**
  - Feed exclusivo para publicaciones de cuentas con rol `official` o `admin`.
  - Sistema de filtrado de anuncios por categoría (Rectorado, Facultad, etc.).
  - Creación de anuncios restringida a roles autorizados.

### 1.4. Herramientas de Productividad
- **Horario Académico (`/home/schedule`):**
  - Calendario interactivo privado para cada usuario.
  - CRUD completo (Crear, Leer, Actualizar, Eliminar) para eventos personales (clases, tareas, eventos).
  - Interfaz visual que marca los días con eventos programados.

### 1.5. Infraestructura y Arquitectura
- **Backend:** Firebase (Firestore como base de datos NoSQL, Firebase Authentication).
- **Frontend:** Next.js 15 (App Router), React, TypeScript.
- **UI/UX:** ShadCN/UI con Tailwind CSS, diseño responsivo (`mobile-first`) y modo oscuro por defecto.
- **Seguridad:** Reglas de seguridad en Firestore que protegen datos privados y restringen acciones por rol.

---

## Fase 2: Estabilización y Mejoras Clave (Q3 2024: Julio - Septiembre 2024)

Esta fase se enfoca en refinar la experiencia del usuario, corregir bugs y añadir funcionalidades de alto impacto que son esenciales para una red social moderna.

- **[ ] Implementar Sistema de Seguimiento (Follow/Unfollow):**
  - Lógica para seguir y dejar de seguir a otros usuarios desde sus perfiles.
  - Actualización en tiempo real del conteo de seguidores/siguiendo.
  - **Resultado clave:** Crear un feed personalizado basado en los usuarios que se siguen.
- **[ ] Subida de Imágenes en Publicaciones:**
  - Permitir a los usuarios adjuntar una imagen a sus publicaciones.
  - Almacenar imágenes de forma segura en Firebase Storage.
- **[ ] Sistema de Notificaciones Funcional:**
  - Activar notificaciones en la campanita para: nuevos "me gusta", nuevos comentarios y nuevos seguidores.
  - Notificaciones push (vía Firebase Cloud Messaging) para anuncios importantes.
- **[ ] Implementar Funcionalidad de Búsqueda Avanzada:**
  - Búsqueda de usuarios por nombre o código.
  - Búsqueda de publicaciones por contenido.
- **[ ] Refinar la Edición de Perfil:**
  - Permitir cambiar la carrera, ciclo o facultad.
  - Integrar la funcionalidad para cambiar la contraseña de forma segura desde la configuración.

---

## Fase 3: Expansión de la Interacción y Servicios (Q4 2024: Octubre - Diciembre 2024)

Con una base estable, se añadirán funcionalidades que aumenten la interacción y comiencen a integrar servicios universitarios de manera más profunda.

- **[ ] Mensajería Directa (Chat 1-a-1):**
  - Sistema de chat en tiempo real entre usuarios que se siguen mutuamente.
  - Indicador de mensajes no leídos.
  - Notificaciones en tiempo real para nuevos mensajes.
- **[ ] Encuestas en Publicaciones:**
  - Añadir un nuevo tipo de post (`poll`) para que los usuarios puedan crear encuestas interactivas con opciones y ver resultados en tiempo real.
- **[ ] Integración de Calendario Académico Oficial:**
  - Un calendario público administrado por cuentas `admin` con fechas clave de la universidad (exámenes parciales, finales, matrícula, feriados).
  - Los usuarios podrían superponer este calendario con su horario personal para una mejor planificación.

---

## Fase 4: Ecosistema Digital y Monetización (H1 2025: Enero - Junio 2025)

Esta fase busca convertir UNSCH Connect en una herramienta indispensable para la vida universitaria, explorando integraciones más profundas y tecnologías emergentes.

- **[ ] Grupos y Comunidades Temáticas:**
  - Permitir la creación de grupos por carrera, facultad o intereses (ej: "Club de Programación", "Debate Político").
  - Feed de publicaciones exclusivo para cada grupo.
  - Roles dentro de los grupos (administrador, moderador, miembro).
- **[ ] Marketplace Estudiantil:**
  - Un espacio seguro para que los estudiantes ofrezcan o busquen productos (libros, apuntes) y servicios (clases particulares, proyectos).
  - Sistema de calificación y reseñas para vendedores.
- **[ ] Módulo de Oportunidades Laborales:**
  - Un espacio para que empresas y la propia universidad publiquen ofertas de prácticas pre-profesionales y empleo para egresados.
- **[ ] Implementación de IA (Genkit):**
  - Un chatbot de asistencia que responda preguntas frecuentes sobre trámites universitarios, usando información oficial.
  - Sugerencias inteligentes de a quién seguir o a qué grupos unirse basadas en la actividad del usuario.
- **[ ] Gamificación y Logros:**
  - Sistema de insignias por actividad (ej: "Usuario Activo", "Creador Popular"), participación o logros académicos para incentivar el uso de la plataforma.
