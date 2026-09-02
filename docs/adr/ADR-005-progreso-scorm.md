# ADR-005 — Modelo de progreso y postura sobre SCORM / xAPI / cmi5

## Estado
Confirmado (2026-09-02).

## Contexto
Hay que trackear el progreso por docente y sección, con criterios de completado distintos según el tipo
de sección, y calcular horas para el certificado. El usuario pregunta explícitamente por SCORM,
distinguiendo importar (terceros → nuestra plataforma) de exportar (nuestros cursos → Moodle de un
colegio), y propone diseñar el vocabulario con xAPI/cmi5 en mente sin implementarlo aún.

## Decisión sobre SCORM
Se confirma la intuición del usuario: **ni importar ni exportar SCORM entran en el MVP.**

- **(a) Importar SCORM de terceros**: además de chocar con la experiencia visual propia (SCORM corre
  dentro de un iframe con su propio motor de reproducción, imposible de adaptar al diseño de la
  plataforma), exige mantener un runtime SCORM en cliente (`window.API`/`API_1484_11`) y el ciclo de vida
  `cmi.core.lesson_status` — trabajo considerable para algo que no es el producto. No se implementa.
- **(b) Exportar nuestros cursos como paquete SCORM/cmi5**: comercialmente interesante ("si ya tenéis
  Moodle, os damos el paquete"), pero técnicamente exige una segunda renderización autocontenida del
  contenido MDX (un paquete `.zip` con `imsmanifest.xml` que corre standalone dentro del iframe de
  Moodle, sin nuestro backend de progreso) y limita la experiencia a lo que Moodle sabe pintar — que es
  precisamente lo que se quiere evitar. Queda como ítem de roadmap comercial post-MVP (ver
  `docs/roadmap.md`), no se empieza ni se bloquea nada por ello ahora.

## Decisión sobre el vocabulario de progreso
Se adopta el vocabulario de **xAPI** (actor / verbo / objeto / resultado) como guía de diseño interno,
**sin implementar xAPI ni un Learning Record Store real en el MVP**. Concretamente: los eventos que la
plataforma genera internamente (`section_viewed`, `section_completed`, `quiz_attempted`, `quiz_passed`,
`course_completed`) se nombran y estructuran de forma que mapeen 1:1 a verbos xAPI (`experienced`,
`completed`, `attempted`, `passed`) el día que haga falta emitir statements de verdad — pero hoy son
simplemente filas en `SectionProgress`/`QuizAttempt`, no un formato xAPI serializado. Esto evita
comprometerse a la complejidad del estándar ahora sin cerrar la puerta a emitirlo después.

## Modelo de progreso

**Criterio de completado por tipo de sección** (configurable, no hardcodeado por tipo):
- **Vídeo**: ≥ 90% visto. Se mide con checkpoints periódicos del reproductor (no solo el evento `ended`),
  para que cuente aunque el usuario haga scrubbing hacia el final.
- **Lectura**: `IntersectionObserver` al final del contenido **+** botón manual "marcar como leída". El
  botón manual es necesario por accesibilidad (lectores de pantalla, zoom alto) y porque el scroll
  automático por sí solo no es fiable como único criterio.
- **Quiz**: aprobado si la nota ≥ `passingScore` definido en `quiz.yml` de esa sección.

**Agregación**: `SectionProgress` es la única fuente de verdad por sección. El progreso de unidad y de
curso se **calcula al leer** (vista o función SQL sobre `SectionProgress` + la estructura del curso), no
se duplica en más tablas — evita bugs de desincronización entre "lo que dice la sección" y "lo que dice
el agregado".

**Horas para el certificado**: se calculan como la suma de la *duración estimada* (declarada en el
frontmatter de cada sección/`curso.yml`) de las secciones completadas — **no** un cronómetro de tiempo
real en pantalla. Decisión deliberada: un contador de tiempo de pantalla es fácil de inflar (dejar la
pestaña abierta) o de infravalorar (pestañas en segundo plano), y es más defendible frente a un colegio
o una inspección decir "el curso declara X horas de contenido y el docente completó las secciones
equivalentes a X horas" que un reloj de pared manipulable.

**Intentos de quiz**: se guardan todas las respuestas, la nota y el número de intento; `quiz.yml` define
el máximo de intentos permitidos y si cuenta el mejor intento o el último para considerar la sección
aprobada.

## Consecuencias
- `SectionProgress`, `QuizAttempt` y las vistas de agregación son las tablas que hay que cubrir con tests
  de dominio desde el principio (cálculo de nota, cálculo de % agregado), tal como piden las reglas de
  trabajo.
- Si en el futuro se decide emitir xAPI/cmi5 de verdad (por ejemplo para integrarse con el LRS de un
  colegio), el trabajo es un adaptador que traduce estas filas a statements — no una reescritura del
  modelo de datos.
