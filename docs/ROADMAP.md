# 3.4. Roadmap del Proyecto: UNSCH Connect

## 1. Visión General

El objetivo de UNSCH Connect es consolidar su posición como la plataforma digital central para la comunidad de la Universidad Nacional de San Cristóbal de Huamanga. El desarrollo se guiará por fases, comenzando con una base sólida (MVP) y expandiéndose hacia funcionalidades más avanzadas de interacción, servicios académicos, personalización y tecnologías emergentes, con una fecha de finalización proyectada para el **8 de diciembre de 2025**.

---

## Fase 1: Producto Mínimo Viable (MVP) - (COMPLETADO - Q2 2024)

Esta fase, consolidada durante nuestra colaboración, se centró en construir el núcleo funcional de la aplicación, estableciendo las bases para la interacción social y la comunicación oficial. Todas las siguientes funcionalidades ya han sido implementadas y probadas.

- **Sistema de Registro y Autenticación por Roles** (Estudiante, Docente, Oficial, Admin) con validaciones específicas.
- **Interacción Social Básica:** Creación de posts, "Me Gusta", "Repostear" y sistema de comentarios en tiempo real.
- **Perfiles de Usuario:** Visualización de información, foto de perfil/portada, posts y reposts del usuario.
- **Módulo de Anuncios Oficiales:** Feed exclusivo para cuentas autorizadas con creación y filtrado de anuncios.
- **Horario Académico Personal:** Calendario interactivo privado con CRUD completo de eventos (crear, leer, editar, eliminar).
- **Configuración de Perfil:** Edición de datos personales y subida de imágenes.
- **Infraestructura Base:** Backend en Firebase (Firestore, Auth), Frontend en Next.js con ShadCN/UI.

---

## Fase 2: Estabilización y Mejoras Clave (Q3 2024: Julio - Septiembre 2024)

Esta fase se enfoca en refinar la experiencia del usuario, corregir bugs y añadir funcionalidades de alto impacto que son esenciales para una red social moderna.

- **[ ] Implementar Sistema de Seguimiento (Follow/Unfollow):**
  - Lógica para seguir y dejar de seguir a otros usuarios.
  - Actualización en tiempo real del conteo de seguidores/siguiendo en los perfiles.
  - **Resultado clave:** Crear un feed personalizado basado en los usuarios que se siguen.
- **[ ] Subida de Imágenes en Publicaciones:**
  - Permitir a los usuarios adjuntar una imagen a sus publicaciones y almacenarla en Firebase Storage.
- **[ ] Refinar la Edición de Perfil:**
  - Permitir cambiar la carrera, ciclo o facultad.
  - Integrar la funcionalidad para cambiar la contraseña de forma segura desde la configuración.
- **[ ] Implementar Funcionalidad de Búsqueda Avanzada:**
  - Búsqueda de usuarios por nombre o código.
  - Búsqueda de publicaciones por contenido.

---

## Fase 3: Expansión de la Interacción Social (Q4 2024: Octubre - Diciembre 2024)

Con una base estable, se añadirán funcionalidades que aumenten la interacción entre los usuarios.

- **[ ] Sistema de Notificaciones Funcional:**
  - Activar notificaciones en la campanita para: nuevos "me gusta", nuevos comentarios y nuevos seguidores.
- **[ ] Mensajería Directa (Chat 1-a-1):**
  - Sistema de chat en tiempo real entre usuarios que se siguen mutuamente.
  - Indicador de mensajes no leídos.
- **[ ] Encuestas en Publicaciones:**
  - Añadir un nuevo tipo de post (`poll`) para que los usuarios puedan crear encuestas interactivas.

---

## Fase 4: Integración de Servicios Académicos (H1 2025: Enero - Junio 2025)

Esta fase comienza a integrar servicios universitarios de manera más profunda en la plataforma.

- **[ ] Integración de Calendario Académico Oficial:**
  - Un calendario público administrado por cuentas `admin` con fechas clave de la universidad (exámenes, matrícula, feriados).
  - Permitir a los usuarios superponer este calendario con su horario personal.
- **[ ] Notificaciones Push (Firebase Cloud Messaging):**
  - Configurar notificaciones push para anuncios oficiales importantes o menciones.
- **[ ] Grupos y Comunidades Temáticas:**
  - Permitir la creación de grupos por carrera, facultad o intereses (ej: "Club de Programación").
  - Feed de publicaciones exclusivo para cada grupo.
  - Roles dentro de los grupos (administrador, moderador, miembro).

---

## Fase 5: Ecosistema Digital y Herramientas de IA (H2 2025: Julio - Diciembre 2025)

La fase final busca convertir UNSCH Connect en una herramienta indispensable, explorando integraciones más profundas y tecnologías emergentes, culminando el 8 de diciembre de 2025.

- **[ ] Marketplace Estudiantil (Julio - Agosto 2025):**
  - Un espacio seguro para que los estudiantes ofrezcan o busquen productos y servicios.
  - Sistema de calificación y reseñas para vendedores.
- **[ ] Módulo de Oportunidades Laborales (Septiembre 2025):**
  - Un espacio para publicar ofertas de prácticas y empleo para egresados.
- **[ ] Implementación de IA con Genkit (Octubre - Noviembre 2025):**
  - Un chatbot de asistencia que responda preguntas frecuentes sobre trámites universitarios.
  - Sugerencias inteligentes de a quién seguir o a qué grupos unirse basadas en la actividad.
- **[ ] Gamificación y Logros (Noviembre 2025):**
  - Sistema de insignias por actividad (ej: "Usuario Activo", "Creador Popular") para incentivar el uso.
- **[ ] Refinamiento Final, Pruebas y Lanzamiento Oficial de la Versión 2.0 (Hasta el 8 de diciembre de 2025):**
  - Periodo de pruebas exhaustivas, corrección de últimos errores y preparación para el lanzamiento a toda la comunidad universitaria.
