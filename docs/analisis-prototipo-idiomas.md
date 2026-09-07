# Análisis del prototipo de idiomas (`referencias/U1_Life_Stories.html`)

Este documento es el entregable de la sección 2 del encargo de idiomas: analiza qué hace el
prototipo, no cómo lo hace, para poder diseñar el sistema de tipos de actividad de la plataforma
sin heredar ni su CSS, ni su HTML, ni su arquitectura Moodle-céntrica.

## 1. Inventario completo de tipos de actividad

El prototipo contiene **21 pantallas de actividad** (una función `aXxx()` por tarjeta) que se
agrupan en **15 mecánicas de interacción distintas** — varias pantallas reutilizan la misma
mecánica con datos distintos (p. ej. `aGf`/`aGv` son dos instancias de "rellenar huecos"; `aWu`,
`aSp` y el paso 2 de `aIn` son tres instancias de "grabación de audio" con duración distinta).

| # | Tipo | Instancias en el HTML | Mecánica de interacción | Corrección | Ítems |
|---|---|---|---|---|---|
| 1 | Rellenar huecos con banco de palabras | `aGf` ("A Chance Meeting"), `aGv` ("Maria's Big Decision") | Clic en chip del banco → se asigna al primer hueco vacío o al hueco seleccionado; también admite escritura libre en el hueco | Automática: comparación de cadena exacta (case-insensitive) contra **una única** respuesta por hueco | 10 + 10 |
| 2 | Emparejar términos y definiciones | `aMt` | Clic en término → clic en definición; term y definición quedan "usados" al instante (sin confirmar acierto), la verificación es un paso posterior explícito | Automática, diferida a un botón "Check" | 10 pares |
| 3 | Clasificar en columnas | `aPh` | Clic en chip (verbo) → clic en una de 3 columnas; el ítem se mueve visualmente a la columna, con botón para quitarlo | Automática, diferida | 15 verbos × 3 categorías |
| 4 | Marcar palabras en un texto | `aMw` | El texto se pre-segmenta detectando automáticamente las substrings de una lista de conectores conocida y las envuelve en `<span>` clicables; clic alterna "marcado" | Automática: compara qué se marcó contra la lista real de conectores (incluye "omitidas", no solo "marcadas mal") | 10 conectores en un texto de ~120 palabras |
| 5 | Ordenar cronológicamente | `aTl` | `<select>` de posición 1–8 por fila, en una tabla con las filas pre-barajadas | Automática, comparando la posición elegida con la real | 8 eventos |
| 6 | Comprensión lectora + opción múltiple | `aRd` ("The Unexpected Gift", 350 palabras) | Clic en una de 4 opciones por pregunta | Automática, resalta la correcta y la elegida si difieren | 6 preguntas |
| 7 | Comprensión auditiva + opción múltiple | `aLs` ("Luis's Story") | Igual que el anterior, pero antes hay un reproductor **simulado** (barra de progreso con `setInterval`, sin audio real) y una transcripción que se revela al "reproducir" | Automática, igual que lectura | 6 preguntas |
| 8 | Corrección de errores | `aEc` | Un `<input>` de texto libre por frase, con un tramo marcado visualmente como erróneo | Automática: cadena exacta contra **una** respuesta, con pista visible tras fallar | 8 frases |
| 9 | Grabación de audio del alumno | `aWu` (60 s), `aSp` (120 s), paso 2 de `aIn` (60 s), `aPt` (180 s) | Cuenta atrás con `setInterval`; "grabar" solo cambia el texto/color del botón, **no hay audio real en ningún punto** | Humana (rúbrica), no autocorregible | 4 instancias, duraciones 60–180 s |
| 10 | Escritura con contador de palabras | `aLt` (target 100–140, mínimo real exigido 80), `aFw` (target 150–200, mínimo real 100), paso 3 de `aIn` (target 70–100, mínimo real 50) | `<textarea>` con contador en vivo que classifica bajo/dentro/sobre el rango | Humana | 3 instancias |
| 11 | Escritura guiada por plantilla | `aLb` (estructura de Labov, 4 secciones), planning template dentro de `aPt` (3 secciones) | Varias `<textarea>` independientes, cada una con su propia guía y placeholder de ejemplo | Humana | 4 + 3 secciones |
| 12 | Foro / interacción escrita | `aFo` | Dos `<textarea>`: publicación (con contador) + respuesta a un compañero (sin contador) | Humana / entre pares | 1 publicación + 1 respuesta |
| 13 | Revisión entre pares | `aPr` | Checklist de 8 criterios (clic para marcar) + comentario libre; exige mínimo 3 criterios marcados y comentario no vacío para "enviar" | Entre pares | 8 criterios |
| 14 | Autoevaluación por descriptores | `aCd` | Grid de botones 1–4 por descriptor; calcula una media y un mensaje cualitativo | Autoevaluación | 10 descriptores |
| 15 | Contenido de referencia | `aGr` (gramática), tabla de descriptores MCER, tabla de contenidos lingüísticos (`.lg`), tabla de rúbrica analítica (`.rt`) | Ninguna — solo lectura | Sin corrección | — |

### Hallazgos que no encajan limpiamente en las 15 filas de tu inventario

Coincido en las 15 mecánicas — mi paso adicional fue distinguir **mecánica** de **pantalla**,
porque hay 3 pantallas que son **composiciones** de varias mecánicas, no un tipo nuevo:

- **`aIn` (actividad integradora)**: encadena *listening simulado* (tipo 7 sin las preguntas) →
  *grabación* (tipo 9, 60 s) → *escritura con contador* (tipo 10, 70–100 palabras) en una sola
  pantalla con tres pasos numerados. Esto no es un tipo 16: es evidencia de que el sistema necesita
  una noción de **sección compuesta** (varios bloques de actividad en secuencia bajo un único
  título/instrucción), no solo "una sección = un tipo".
- **`aPt` (Project Task, el podcast final)**: instrucciones de referencia + 3 bloques de
  *escritura guiada* (tipo 11, reutilizando la mecánica de Labov con otras preguntas) + un
  **checklist personal** (visualmente la misma mecánica que el checklist de revisión entre pares,
  tipo 13, pero aquí es autochequeo antes de grabar, no evaluación de otro) + *grabación* (tipo 9,
  180 s). Confirma que "checklist de criterios" merece ser su propio bloque reutilizable, no algo
  atado solo a peer-review.
- **`aCu` (Cultural Moment)**: *contenido de referencia* (dos textos paralelos, tipo 15) +
  **dos** prompts de reflexión corta independientes (una variante ligera del tipo 10/11, sin
  contador de palabras ni plantilla, solo "una pregunta, una caja de texto").

**Recomendación de diseño que se deriva de esto**: el sistema de tipos debe registrar
*bloques atómicos* (huecos, opción-múltiple, grabación, escritura, checklist, referencia...) y
permitir que una sección los **componga en secuencia** con textos de enlace entre bloques. Si el
sistema solo admite "un tipo por sección", `aIn`, `aPt` y `aCu` no se pueden representar sin
duplicar código o forzarlos a un tipo que no son.

### Otras cosas que detecté al leer el JS con detalle

- **Inconsistencia real del prototipo, no a replicar**: en `aLt`, `aFw` y el paso 3 de `aIn`, el
  mínimo de palabras exigido para poder enviar es sistemáticamente **más bajo** que el extremo
  inferior del rango mostrado como objetivo (80 vs. 100–140; 100 vs. 150–200; 50 vs. 70–100). Es
  un patrón consistente (parece deliberado: un "suelo" que evita envíos triviales, distinto del
  "objetivo" que se muestra como guía), no un error aislado — pero el sistema de tipos debe
  **declarar ambos números explícitamente** (`palabras_minimas_envio` y `palabras_objetivo`), no
  inferir uno del otro.
- **El gap-fill ya admite escritura libre además del banco de palabras** (el `<input>` no está
  bloqueado), pero la corrección compara contra **una sola cadena exacta**. Esto confirma, con un
  caso real, la necesidad de `acepta: [...]` con variantes que ya proponías en tu formato YAML.
- **El progreso (`0/22`) es un contador manual e independiente**: el círculo `.cc` de cada
  actividad se marca a mano y no comprueba que la actividad se haya intentado ni acertado. Es
  exactamente el antipatrón que tu encargo pide evitar ("el progreso debe derivarse de los
  intentos, no ser un contador aparte que se desincronice") — buena confirmación de que esa regla
  es necesaria, no solo prudente.
- **No existe ningún límite de reintentos** en ninguna actividad autocorregible: "Check" y "Reset"
  se pueden pulsar indefinidamente sin distinguir intento 1 de intento 5.
- Las duraciones de grabación reales usadas son 60 s (calentamiento y mediación), 120 s
  (monólogo extendido) y 180 s (podcast final) — útiles como valores por defecto al definir el
  tipo "grabación de audio".

## 2. Autocorregibles vs. valoración humana

**Autocorregibles** (tipos 1–8 de la tabla): rellenar huecos, opción múltiple (lectura y
escucha), emparejar, clasificar, marcar palabras, ordenar y corrección de errores. Todas comparten
la misma forma: una función pura `(definición, respuestas) → (puntuación, feedback por ítem)` es
suficiente y no necesita intervención humana en ningún punto.

**Requieren valoración humana** (tipos 9–13): grabación de audio, escritura (las tres variantes),
foro y revisión entre pares. Ninguna tiene hoy una "respuesta correcta" — su corrección es
inherentemente cualitativa. El sistema puede autocalcular señales objetivas (duración grabada,
recuento de palabras dentro/fuera de rango) pero no una nota.

**Autoevaluación, no corrección** (tipo 14): el Can-Do Tracker no lo corrige nadie; el propio
alumno se puntúa. Conceptualmente es más parecido a una encuesta que a un ejercicio.

**Sin corrección, es contenido** (tipo 15): gramática de referencia, tabla de descriptores MCER,
tabla de contenidos lingüísticos, tabla de rúbrica. Estas cuatro son datos estructurados que hoy
están *escritos a mano en HTML* — exactamente lo que la sección 7 del encargo pide convertir en
datos reutilizables.

## 3. Necesidades de audio, grabación y almacenamiento

| Necesidad | Dónde aparece | Estado en el prototipo |
|---|---|---|
| Audio de escucha real | `aLs` (Luis's Story, ~3 min), paso 1 de `aIn` (Carmen, ~90 s) | **No existe**: barra de progreso con `setInterval` fijo, transcripción ya escrita que se revela al "reproducir" |
| Grabación del alumno | `aWu`, `aSp`, paso 2 de `aIn`, `aPt` | **No existe**: cuenta atrás falsa, ningún acceso a micrófono ni `MediaRecorder` |
| Almacenamiento de intentos/respuestas | Las 15 mecánicas | **No existe**: todo vive en variables JS globales (`dC`, `lSl`, `mMp`, `phPl`...), se pierde al recargar |
| Almacenamiento de audio (escucha) | Igual que arriba | Necesita un fichero real servido con URL firmada — candidato: Supabase Storage, no Mux (no es vídeo, y los clips son cortos) |
| Almacenamiento de grabaciones del alumno | `aWu`, `aSp`, `aIn`, `aPt` | Necesita bucket privado de Supabase Storage con URL firmada de subida y de lectura (solo el propio alumno y su coordinador deberían poder escucharla) |

Ninguna actividad de esta unidad necesita vídeo — es una diferencia útil respecto al curso de
competencia digital, donde el `VideoProvider`/Mux ya cubre esa necesidad. El audio (escucha y
grabación) es un tipo de medio nuevo para la plataforma.

## 4. Estructura pedagógica: ¿modelo de contenido o metadato?

El prototipo organiza **una sola unidad** ("U1 — Life Stories") en 5 "sesiones" (S1–S5), y cada
sesión en 2–7 actividades. Las etiquetas de sesión ("Pre-Task", "Task Cycle 1/2/3", "Project
Task") son terminología TBLT (Willis & Willis), no una jerarquía estructural nueva: cada sesión es,
en la práctica, un bloque de actividades con una intención pedagógica común y una duración
estimada conjunta (60–75 min).

**Recomendación**: no crear un nivel de jerarquía nuevo entre "unidad" y "sección". El modelo
`curso → unidad → sección` que ya existe encaja si:

- Cada **sesión** del prototipo (S1…S5) se modela como una **unidad** de nuestro curso (`unidad.yml`
  con `orden` y `titulo` = el nombre de la sesión, p. ej. "Task Cycle 1 — Input y análisis").
- Cada **actividad** del prototipo se modela como una **sección** de tipo `actividad` dentro de esa
  unidad — igual que hoy una sección es de tipo `texto`, `video` o `quiz`.
- La etiqueta TBLT (Pre-Task, Task Cycle N, Project Task) y la distinción
  obligatoria/ampliación son **metadatos de la unidad y de la sección** respectivamente, no
  estructura: `unidad.yml` gana un campo opcional `fase` (string libre, solo descriptivo) y cada
  sección gana `obligatoria: true|false` (ya implícito hoy, pero nunca declarado explícitamente en
  el curso de competencia digital porque allí todo es obligatorio).
- El curso entero ("English B1") pasa a tener **más de una unidad** con el patrón "5 sesiones ≈ 5
  unidades" — el curso de competencia digital, en cambio, seguirá teniendo 2 unidades cortas. No
  hace falta que todos los cursos tengan la misma cadencia.

Esto significa que **no hace falta ningún cambio en el esquema de `curso.yml`/`unidad.yml`**
existente (ADR-002): la sesión ya cabe como unidad, la fase como un campo nuevo y opcional. Lo que
sí es nuevo es el **tipo de sección** `actividad` (con su subtipo: huecos, opción-múltiple,
emparejar...) sumado a los ya existentes `texto`, `video`, `quiz`.

## 5. Qué es genérico y qué es específico de idiomas

Hallazgo central: **las 15 mecánicas son genéricas**. Ninguna depende de que el idioma de destino
sea inglés — "clasificar en columnas" sirve igual para fonética que para clasificar ejemplos de
"buenas prácticas" frente a "señales de alerta" en el curso de competencia digital (ese curso ya
tiene ese contraste en prosa, en
`01-herramientas-digitales-en-el-aula.mdx`/`02-buenas-practicas-y-seguridad.mdx` — sería su
primer candidato real de reutilización). "Marcar palabras" sirve para conectores discursivos en
inglés o para identificar señales de una mala herramienta educativa en un texto en español.
"Autoevaluación por descriptores" es MCER aquí, pero el mecanismo (N afirmaciones, escala 1–4,
media final) es el mismo que serviría para un autochequeo de competencia digital por área
DigCompEdu.

Lo que **sí es específico de idiomas** no es la mecánica sino:

- El **contenido** de cada instancia (los textos, las respuestas, el vocabulario).
- Dos necesidades transversales que el curso de competencia digital no tiene: **audio** (escucha
  y grabación) y **símbolos fonéticos** (`/t/`, `/ɪd/`, `/wəz/`) que exigen una fuente tipográfica
  con buen soporte IPA — ninguna de las dos afecta al sistema de tipos en sí, son requisitos del
  renderizado y del pipeline de medios.
- Los **datos de referencia** (tabla de descriptores MCER, rúbrica de 5 criterios) son
  instancias de dos mecanismos genéricos — "tabla de descriptores" y "rúbrica analítica" — que el
  curso de competencia digital podría reutilizar con sus propios criterios el día que se decida
  formalizar algo similar allí.

## 6. Qué falta para ser producto

- **Persistencia**: cero. Todo el estado vive en variables JS globales del `<script>`; recargar la
  página borra cualquier progreso, respuesta o grabación.
- **Seguridad de las respuestas**: las respuestas correctas de las 8 mecánicas autocorregibles
  viajan al cliente en claro (`data-a`, arrays `RDQ`/`LSQ`/`GFA`...). Cualquiera con el inspector
  del navegador las ve antes de responder. Aceptable para "modo práctica"; inaceptable si algo de
  esto cuenta para un certificado — de aquí sale el ADR de modo práctica/evaluación que pide la
  sección 4 del encargo.
- **Reintentos**: no existen como concepto (ver hallazgo en la sección 1).
- **Accesibilidad**: todas las interacciones son `onclick` sobre `<div>`/`<span>` sin `role`, sin
  `tabindex`, sin manejo de teclado y sin foco visible propio (dependen del navegador). El acierto
  y el error se comunican **solo por color** (verde/rojo en fondo y borde) sin icono ni texto
  redundante. No hay ninguna región `aria-live` para anunciar el resultado de "Check". El audio no
  existe, así que tampoco existe su transcripción accesible (aunque, curiosamente, el listening
  *sí* incluye ya una transcripción completa — solo que se revela como refuerzo tras reproducir,
  no como alternativa accesible declarada).
- **i18n**: instrucciones en español, contenido en inglés — es una decisión pedagógica correcta a
  mantener (el aprendiz necesita las instrucciones en su idioma materno), pero confirma que la
  cadena de UI-chrome (botones "Comprobar", "Reiniciar", "Cerrar") debe salir del diccionario de
  interfaz de la plataforma, nunca hardcodeada en el contenido del curso.
- **Táctil/móvil**: los objetivos de clic más pequeños (`.wbc`, `.vc`, `.cdb`) rondan 24–30 px de
  alto con padding reducido — por debajo del mínimo de 44 px que pide la sección 8. Varias
  interacciones dependen de `:hover` (los chips cambian de aspecto al pasar el ratón) sin
  equivalente táctil.

---

Con esto, el inventario coincide con el tuyo (15/15) y añado tres hallazgos que creo que merece la
pena tener en cuenta antes de fijar el formato YAML: la necesidad de **secciones compuestas** (por
`aIn`, `aPt`, `aCu`), el **checklist** como bloque reutilizable independiente de peer-review, y el
mapeo **sesión → unidad** que evita tener que tocar el esquema de curso existente.

¿Sigo con el paso 2 (formato de autoría en YAML, con un ejemplo de cada tipo) o quieres que ajuste
algo de este análisis primero?
