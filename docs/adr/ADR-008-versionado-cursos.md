# ADR-008 — Versionado de cursos y qué pasa con el progreso al editar contenido publicado

## Estado
Propuesto.

## Contexto
Pregunta concreta del usuario: si se edita una lección de un curso que ya están cursando 200 docentes,
¿qué pasa con su progreso? Hace falta una estrategia explícita, no un "ya se verá".

## Decisión

### Dos tipos de cambio, dos tratamientos distintos
1. **Cambio no estructural** (typo, cambio de redacción que no altera objetivos, sustitución de una
   imagen, re-subida del mismo vídeo): se publica **en el sitio**, bajo la misma `version` del curso. El
   progreso existente sigue siendo válido porque `SectionProgress` está indexado por `sectionId`, cuya
   identidad no cambia.
2. **Cambio estructural** (reordenar/añadir/quitar secciones, cambiar preguntas o respuestas correctas de
   un quiz, cambiar el `passingScore`, cambiar el criterio de completado de una sección): exige **bump de
   `version`** en `curso.yml` (entero simple: 1, 2, 3...). Regla práctica para decidir cuál es cuál: si el
   cambio podría hacer que el progreso ya guardado de alguien deje de tener sentido tal cual está, es
   estructural.

### Cómo se ancla una cohorte a una versión
`Enrollment` guarda `course_slug` + `course_version`, fijados en el momento en que el docente **se
matricula** (no cuando el colegio compra plazas). Un docente que empieza el curso el 3 de marzo queda
anclado a la versión vigente ese día; uno que empieza el 10 de abril, tras un bump a v2, arranca ya en
v2. Cada `Enrollment` calcula siempre su progreso contra la estructura de **su propia versión** — nunca
se mezcla la estructura de v1 con progreso pensado para v2.

### Mecanismo concreto de resolución de contenido por versión
Cada bump de versión se etiqueta en el repo de contenidos (p. ej. tag
`competencia-digital-docente-nivel-1@v2`). La tabla `Course` guarda, por versión, la referencia exacta de
contenido (`content_ref`: tag o commit SHA) que le corresponde. `main` en el repo de contenidos
representa siempre la versión más reciente para matrículas **nuevas**; las cohortes ya ancladas resuelven
su contenido contra el `content_ref` fijo de su versión, no contra `main`. Esto encaja directamente con
el mecanismo de fetch runtime de ADR-001: qué commit/tag pedir a la API de contenidos es una función de
`(course_slug, course_version)`, no un valor fijo.

### Certificados
El certificado de un `Enrollment` refleja siempre el contenido y las horas de **la versión que ese
docente cursó realmente**, nunca la versión actual del curso — importante para que el certificado siga
siendo veraz aunque el curso cambie mucho después.

### Migrar una cohorte de versión a mitad de curso
Fuera de alcance del MVP. Es una operación con pérdida potencial de sentido (secciones eliminadas cuyo
progreso ya no aplica, secciones nuevas que aparecen como pendientes) que debería ser una acción manual y
explícita de un admin en el futuro, nunca automática. Se deja documentada como decisión consciente de
diseño, no como bug pendiente.

## Consecuencias
- `Course` es una tabla por `(slug, version)`, no por `slug` solo — el modelo de datos de la sección 7
  debe reflejar esto explícitamente (clave `(slug, version)` o un id sintético con un unique compuesto).
- El validador de contenido (`content:validate`, ADR-002) debe poder comprobar, dado un cambio en un PR,
  si toca campos "estructurales" y avisar si el autor no ha bumpeado `version` — como mínimo un aviso en
  CI, no necesariamente un bloqueo automático en el MVP (juzgar "¿esto es estructural?" con precisión
  total es difícil; un aviso que el autor revisa es más razonable que un falso bloqueo).
