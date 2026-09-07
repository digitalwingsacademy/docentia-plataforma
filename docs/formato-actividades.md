# Formato de autoría de actividades interactivas

Propuesta de formato YAML para los tipos de actividad identificados en
`docs/analisis-prototipo-idiomas.md`. Un ejemplo real por tipo, extraído del propio prototipo
(no reinventado), para que sirvan directamente al publicar el curso en el paso 5.

## 0. Cómo encaja con lo que ya existe

- `unidad.yml` gana un tipo de sección nuevo: `tipo: actividad` (antes solo admitía
  `video|texto|quiz`). Su `archivo` apunta a un `.yml` (no `.mdx` — es dato estructurado, no
  prosa) con una de las formas descritas abajo.
- El "contenido de referencia" (gramática explicada en prosa, con ejemplos) **no es un tipo
  nuevo**: es una sección `tipo: texto` normal, con el mismo MDX/componentes que ya existen
  (`<Aviso/>`, `<Comparativa/>`...). No hace falta inventar nada para `aGr`.
- Las tablas de descriptores MCER y de rúbrica **sí son datos nuevos** (`tabla-descriptores`,
  `tabla-rubrica`) porque hoy están escritas a mano en HTML y la sección 7 del encargo pide
  convertirlas en datos reutilizables — pero se referencian *desde* una sección `texto` normal
  con un componente MDX nuevo (`<TablaDescriptores src="..." />`, `<Rubrica src="..." />`), no
  como un tipo de sección aparte.
- `seccionTipoSchema` pasa a ser `video | texto | quiz | actividad`.

## 1. Envoltorio común

Todas las actividades autocorregibles comparten estos campos (los tipos de valoración humana
solo usan `id`/`tipo`/`titulo`/`instrucciones`/`duracionMinutos`/`obligatoria`; `modo` y
`reintentos` no significan nada si no hay una respuesta correcta que proteger o repetir):

```yaml
id: string                     # único dentro de la unidad — es el sectionId de progreso
tipo: <uno de los tipos de abajo>
titulo: string
instrucciones: string
duracionMinutos: number
obligatoria: true|false        # default true
modo: practica | evaluacion    # default practica — solo en tipos autocorregibles (ver ADR)
reintentos:                    # solo en tipos autocorregibles
  maximos: number | ilimitado
  mostrarSolucionAl: siempre | agotar_intentos | nunca
```

`modo: practica` → la respuesta correcta viaja en el YAML publicado y se compila al bundle; el
cliente corrige localmente y el feedback es instantáneo. `modo: evaluacion` → la respuesta
correcta **no** se sirve al cliente; el intento se envía al servidor, que corrige contra el YAML
leído server-side y devuelve solo el resultado. El ADR de la sección 4 detalla el mecanismo; aquí
solo importa que cada actividad declara cuál usa.

## 2. Tipos autocorregibles

### 2.1 `rellenar-huecos`

```yaml
id: past-simple-vs-continuous
tipo: rellenar-huecos
titulo: "A Chance Meeting"
instrucciones: "Completa el texto con la forma correcta. Puedes usar el banco de palabras o escribir directamente."
duracionMinutos: 20
modo: practica
reintentos: { maximos: ilimitado, mostrarSolucionAl: nunca }
bancoPalabras: true            # si es false, el hueco es un input libre sin chips
texto: |
  Last summer, I {{1}} my hometown when I suddenly {{2}} into an old school friend. She
  {{3}} outside the old library and {{4}} at her phone. While we {{5}}, it {{6}} to rain
  heavily. When I was young, I {{7}} cycle to school with her. She {{8}} me that she {{9}}
  to London two years earlier. I couldn't believe how much time {{10}}.
huecos:
  - id: 1
    respuesta: "was visiting"
    pista: "Acción larga en curso cuando pasa otra cosa."
  - id: 2
    respuesta: "bumped"
  - id: 3
    respuesta: "was standing"
  - id: 4
    respuesta: "was looking"
  - id: 5
    respuesta: "were talking"
  - id: 6
    respuesta: "started"
  - id: 7
    respuesta: "used to"
  - id: 8
    respuesta: "told"
  - id: 9
    respuesta: "had moved"
    acepta: ["moved"]            # variante que también se acepta como correcta
  - id: 10
    respuesta: "had passed"
```

La normalización (mayúsculas, espacios sobrantes, comillas rectas/curvas) la aplica siempre la
función de corrección antes de comparar; `acepta` es solo para variantes **léxicas** de verdad
(otra forma verbal aceptable, contracción, ortografía UK/US) — no hace falta enumerar
capitalizaciones.

### 2.2 `opcion-multiple`

Generaliza comprensión lectora y auditiva: el estímulo puede ser texto o audio. Reutiliza la
misma forma de pregunta que ya usa `quiz.yml` (`enunciado`/`opciones`/`respuestaCorrectaId`).

```yaml
id: reading-unexpected-gift
tipo: opcion-multiple
titulo: 'Reading: "The Unexpected Gift"'
instrucciones: "Lee el texto (skimming, luego scanning) y responde."
duracionMinutos: 25
modo: practica
reintentos: { maximos: 2, mostrarSolucionAl: agotar_intentos }
estimulo:
  tipo: texto
  contenido: |
    It was a Tuesday morning in November when everything changed for Laura Chen. She was
    rushing through the crowded streets of Bristol... [texto íntegro del prototipo]
preguntas:
  - id: p1
    enunciado: "Where was Laura when she found the envelope?"
    opciones:
      - { id: a, texto: "At her workplace" }
      - { id: b, texto: "On the streets of Bristol" }
      - { id: c, texto: "In Edinburgh" }
      - { id: d, texto: "Outside a house" }
    respuestaCorrectaId: b
  # ... 5 preguntas más
```

Para escucha, el estímulo cambia de forma y necesita un asset de audio registrado (mismo patrón
que `VideoAsset`, ver sección 3 del ADR de audio):

```yaml
id: listening-luis-story
tipo: opcion-multiple
titulo: "Listening: Luis's Story"
estimulo:
  tipo: audio
  audioId: luis-story                 # resuelve a un fichero real en Storage
  transcripcion: |
    Hi, I'm Luis. I want to tell you about a time that changed my life completely...
  mostrarTranscripcionTrasIntento: true
preguntas: [ ... ]
```

### 2.3 `emparejar`

```yaml
id: matching-life-events-vocab
tipo: emparejar
titulo: "Matching: Life Events, Phrasal Verbs & Emotions"
instrucciones: "Empareja cada término con su definición."
duracionMinutos: 20
modo: practica
reintentos: { maximos: ilimitado, mostrarSolucionAl: nunca }
pares:
  - id: 1
    termino: "graduate"
    definicion: "to successfully complete university studies"
  - id: 2
    termino: "be promoted"
    definicion: "to be given a more important or higher-paid job"
  # ... hasta 10 pares
```

### 2.4 `clasificar`

```yaml
id: pronunciation-ed-endings
tipo: clasificar
titulo: "Pronunciation: -ed Endings"
instrucciones: "Clasifica cada verbo según la pronunciación de su terminación -ed."
duracionMinutos: 15
modo: practica
reintentos: { maximos: ilimitado, mostrarSolucionAl: nunca }
categorias:
  - id: t
    etiqueta: "/t/"
    ejemplo: "walked"
  - id: d
    etiqueta: "/d/"
    ejemplo: "called"
  - id: id
    etiqueta: "/ɪd/"
    ejemplo: "wanted"
items:
  - { id: 1, texto: "walked", categoriaId: t }
  - { id: 2, texto: "called", categoriaId: d }
  - { id: 3, texto: "wanted", categoriaId: id }
  # ... 15 verbos
```

### 2.5 `marcar-palabras`

```yaml
id: discourse-connectors
tipo: marcar-palabras
titulo: "Mark the Words: Discourse Connectors"
instrucciones: "Marca las 10 expresiones conectoras del texto."
duracionMinutos: 20
modo: practica
reintentos: { maximos: ilimitado, mostrarSolucionAl: nunca }
texto: |
  First I had no idea what to expect. I arrived in the city on a cold January morning and
  while I was waiting for my luggage, I met an elderly man... [texto íntegro]
palabrasCorrectas:
  - "First"
  - "while"
  - "Then"
  - "however"
  - "As a result"
  # ... 10 en total
```

El autor escribe las expresiones exactas a marcar (case-sensitive respecto al texto); el
renderer localiza esas substrings dentro de `texto` (igual mecánica que el prototipo) y las hace
clicables — la diferencia es que aquí la lista de "correctas" vive en el YAML, no en un array
JS embebido en el cliente.

### 2.6 `ordenar`

```yaml
id: timeline-ana-life
tipo: ordenar
titulo: "Timeline: Order the Events in Ana's Life"
instrucciones: "Asigna el orden cronológico correcto a cada evento."
duracionMinutos: 25
obligatoria: false              # AMPLIACIÓN en el prototipo original
modo: practica
reintentos: { maximos: ilimitado, mostrarSolucionAl: nunca }
eventos:
  - id: 1
    texto: "She was born in a small town in Galicia."
    posicion: 1
  - id: 2
    texto: "She used to walk to school with her brother every day."
    posicion: 2
  # ... 8 eventos, con huecos deliberados en la numeración igual que el original (5, 7 no aparecen)
```

### 2.7 `correccion-errores`

```yaml
id: narrative-tense-errors
tipo: correccion-errores
titulo: "Error Correction: Narrative Tenses"
instrucciones: "Cada frase tiene un error subrayado. Escribe la forma correcta."
duracionMinutos: 20
modo: practica
reintentos: { maximos: ilimitado, mostrarSolucionAl: nunca }
frases:
  - id: 1
    texto: 'While I was <error>walk</error> to the station, it started to rain.'
    respuesta: "walking"
    pista: "Past continuous: was/were + -ing"
  - id: 2
    texto: 'She used to <error>went</error> to the beach every summer.'
    respuesta: "go"
    pista: "used to + infinitivo (forma base, no pasado)"
  # ... 8 frases
```

`<error>...</error>` marca el tramo a resaltar; el renderer lo pinta, nunca HTML libre.

## 3. Tipos de valoración humana

Ninguno usa `modo` ni `reintentos` (no hay respuesta correcta que proteger). Guardan la entrega y,
si aplica, la rúbrica asociada para mostrarla *antes* de entregar (sección 6 del encargo).

### 3.1 `grabacion-audio`

```yaml
id: warmup-memorable-moment
tipo: grabacion-audio
titulo: "Warm-up: Tell Us About a Memorable Moment"
instrucciones: 'Record 60 seconds: a memorable moment from your life. When? What happened? How did you feel?'
duracionMinutos: 20
duracionGrabacionSegundos: 60
preparacionSegundos: 30          # tiempo de notas antes de grabar; 0 si no aplica
rubricaId: null                  # sin rúbrica formal (es solo activación, sección 1)
```

```yaml
id: project-task-podcast
tipo: grabacion-audio
titulo: 'PROJECT TASK: "My Life Story So Far"'
duracionGrabacionSegundos: 180
preparacionSegundos: 0
plantillaPlanificacion:          # ver 3.3 — este tipo puede incluir una guiada antes de grabar
  - titulo: "OPENING — Introduce yourself (30 sec)"
    guia: "Hi, my name is… today I'm going to tell you about three important moments…"
  - titulo: "EVENTS 1, 2 & 3 — Main narrative (2 min)"
    guia: "Event 1 (past simple + continuous)… Event 2 (used to)… Event 3 (emotions)…"
  - titulo: "EVALUATION + INTERCULTURAL (30 sec)"
    guia: "Looking back… / Intercultural: In my narrative I tend to…"
checklistPrevia: project-task-checklist   # referencia a un bloque `checklist` (sección 4)
rubricaId: life-story-analytic-rubric     # referencia a una `tabla-rubrica`
```

### 3.2 `escritura-libre`

```yaml
id: letter-to-friend
tipo: escritura-libre
titulo: "Writing: Letter to a Friend"
instrucciones: 'Your English-speaking friend Alex has written asking what you have been up to. Write back describing a recent experience.'
duracionMinutos: 35
palabrasObjetivo: { min: 100, max: 140 }
palabrasMinimasEnvio: 80          # suelo real para poder enviar (evita entregas triviales)
opcionesPrompt: null               # null = un solo prompt fijo; ver escritura-libre con elección abajo
rubricaId: null
```

Con elección de prompt (como `aFw`):

```yaml
id: best-worst-day
tipo: escritura-libre
titulo: '"The Best/Worst Day of My Life"'
palabrasObjetivo: { min: 150, max: 200 }
palabrasMinimasEnvio: 100
opcionesPrompt:
  - id: best
    texto: '"It was the best day of my life"'
  - id: worst
    texto: '"It was the worst day of my life"'
incluirLista:                     # checklist informativo, no evaluado automáticamente
  - "Past simple"
  - "Past continuous"
  - "Used to"
  - "3+ connectors"
  - "Emotion adjective"
  - "Phrasal verb"
```

### 3.3 `escritura-guiada`

```yaml
id: labov-narrative-structure
tipo: escritura-guiada
titulo: "Guided Writing: Labov Narrative Structure"
instrucciones: "Escribe una narración personal siguiendo las 4 fases."
duracionMinutos: 35
secciones:
  - id: orientation
    titulo: "1. ORIENTATION"
    guia: "Who? Where? When? Set the scene."
    placeholder: 'e.g. "It was a warm July evening. I was travelling alone in Portugal..."'
  - id: complication
    titulo: "2. COMPLICATION"
    guia: "What happened? Main problem or turning point."
    placeholder: 'e.g. "While I was waiting at the station, I suddenly realised..."'
  - id: resolution
    titulo: "3. RESOLUTION"
    guia: "How was it resolved?"
    placeholder: 'e.g. "Eventually, a kind stranger helped me..."'
  - id: evaluation
    titulo: "4. EVALUATION"
    guia: "Why was this important? What did you learn?"
    placeholder: 'e.g. "Looking back, I think this experience taught me..."'
rubricaId: null
```

### 3.4 `foro`

```yaml
id: five-life-events
tipo: foro
titulo: "Forum: The Five Most Important Events in My Life"
instrucciones: "Publica 5 eventos clave de tu vida. Responde a un compañero con una pregunta de seguimiento."
duracionMinutos: 25
palabrasMinimasPublicacion: 50
requiereRespuesta: true
```

**Alcance reducido para esta tanda** (per sección 6 del encargo): el foro se implementa como
publicación + una respuesta libre, sin hilos anidados, sin notificaciones ni menciones. Cualquier
ampliación (hilos, @menciones, moderación) queda en `docs/roadmap.md`, no se construye a medias.

### 3.5 `revision-entre-pares`

```yaml
id: letter-peer-review
tipo: revision-entre-pares
titulo: "Peer Review Workshop"
instrucciones: "Revisa la carta de tu compañero con esta checklist. Añade un comentario constructivo."
duracionMinutos: 25
checklist: letter-review-criteria     # referencia a un bloque `checklist` (sección 4)
minimoCriteriosMarcados: 3
comentarioObligatorio: true
```

**Alcance reducido para esta tanda**: el emparejamiento alumno↔alumno se hace por asignación
manual del coordinador (no hay algoritmo de reparto automático); queda documentado en el
roadmap como mejora futura, no se construye ahora.

### 3.6 `autoevaluacion-descriptores`

```yaml
id: can-do-tracker-u1
tipo: autoevaluacion-descriptores
titulo: "Can-Do Tracker — Autoevaluación Final U1"
instrucciones: "Selecciona tu nivel en cada descriptor: 1 = No puedo … 4 = Puedo con soltura."
duracionMinutos: 10
escala: { min: 1, max: 4 }
descriptores:
  - id: 1
    texto: "I can understand the main information in short narratives in clear, standard speech."
  - id: 2
    texto: "I can understand narratives (holidays, anecdotes) spoken at a slow, clear pace."
  # ... 10 descriptores
```

## 4. Bloques reutilizables (no son secciones por sí solos)

### 4.1 `checklist`

Vive como fichero propio y se **referencia por id** desde `revision-entre-pares` o
`grabacion-audio` (campo `checklistPrevia`) — así el mismo mecanismo sirve para "evaluar a otro"
y para "autochequeo antes de grabar", que es exactamente lo que hacían `aPr` y `aPt` con la misma
mecánica visual y dos intenciones distintas.

```yaml
id: project-task-checklist
criterios:
  - "Event 1: past simple + past continuous (when/while)"
  - "Event 2: used to (habits/states that changed)"
  - "Event 3: emotional vocabulary (≥3 emotion adjectives)"
  - "Sequence connectors throughout"
  - "Labov evaluation section at the end"
  - "Intercultural comparison (60 words)"
  - "Total: 3 minutes (~350–400 spoken words)"
```

### 4.2 `tabla-descriptores`

```yaml
id: mcer-descriptors-u1
descriptores:
  - texto: "Comprende información principal sobre narraciones breves en lengua estándar clara."
    destreza: listening
    fase: "S2"
    nivel: "3"
  - texto: "Relata experiencias con sentimientos; narra historias."
    destreza: speaking
    fase: "S4"
    nivel: "3–4"
  # ...
```

### 4.3 `tabla-rubrica`

```yaml
id: life-story-analytic-rubric
niveles: ["1 — Insuficiente", "2 — Básico", "3 — Competente", "4 — Excelente"]
criterios:
  - nombre: "Corrección gramatical"
    descripciones:
      - "Errores de tiempos impiden comprensión."
      - "Past simple dominado; continuous con errores."
      - "Buen control; contraste correcto en mayoría."
      - "Integración fluida de past simple, continuous y used to."
  # ... 5 criterios × 4 descripciones
```

## 5. Sección compuesta: `secuencia`

Para `aIn`, `aPt` y `aCu`, que encadenan varios bloques con una sola instrucción general. Cada
`bloque` es la forma interna (sin `id`/`tipo` de sección, ya está en el envoltorio) de uno de los
tipos anteriores; se numeran automáticamente en la interfaz ("Paso 1", "Paso 2"...).

```yaml
id: integrative-listen-mediate-write
tipo: secuencia
titulo: "Actividad Integradora: Listen → Mediate → Write"
instrucciones: "⭐ ACTIVIDAD INTEGRADORA. Completa los 3 pasos en orden."
duracionMinutos: 30
bloques:
  - tipo: opcion-multiple           # aquí sin preguntas: solo el estímulo de audio + transcripción
    titulo: "Listening"
    estimulo:
      tipo: audio
      audioId: carmen-story
      transcripcion: "My name is Carmen and I want to tell you about something..."
      mostrarTranscripcionTrasIntento: true
    preguntas: []
  - tipo: grabacion-audio
    titulo: "Mediation Speaking"
    instrucciones: "Reformulate Carmen's story for a classmate. Summarise + add your reaction."
    duracionGrabacionSegundos: 60
  - tipo: escritura-libre
    titulo: "Written Summary"
    palabrasObjetivo: { min: 70, max: 100 }
    palabrasMinimasEnvio: 50
```

El progreso de una `secuencia` se completa cuando **todos** sus bloques tienen una entrega (no
hay nota agregada — cada bloque se guarda como su propio intento/entrega, igual que si fuera una
sección independiente; `secuencia` es solo el envoltorio de presentación y de "obligar el orden").

## 6. Validación en CI (`content:validate`)

Reglas nuevas que el validador debe comprobar, además de las que ya existen:

- Todo `rellenar-huecos` tiene, para cada hueco referenciado en `{{n}}` dentro de `texto`, una
  entrada correspondiente en `huecos` con `respuesta` no vacía — y viceversa (ningún hueco
  declarado que no aparezca en el texto).
- Todo `opcion-multiple` tiene ≥2 opciones por pregunta y exactamente un `respuestaCorrectaId`
  que coincide con un `id` real de `opciones`.
- Todo `emparejar` no tiene `termino` ni `definicion` duplicados dentro del mismo ejercicio.
- Todo `clasificar` referencia, en cada `items[].categoriaId`, una `categorias[].id` real.
- Todo `marcar-palabras` tiene cada entrada de `palabrasCorrectas` como substring literal de
  `texto` (si no, el ítem nunca sería marcable).
- Todo `ordenar` tiene posiciones sin duplicados (los huecos en la numeración, como en el
  ejemplo de Ana, son válidos a propósito — solo se valida que no se repita un número).
- Todo `audioId` referenciado (en `opcion-multiple` o dentro de una `secuencia`) existe en el
  manifiesto de audio.
- Todo `checklistPrevia`/`checklist`/`rubricaId` referenciado por id existe como fichero real.
- `modo: evaluacion` es incompatible con `mostrarSolucionAl: siempre` (contradicción: no se
  puede ocultar la respuesta en el servidor y a la vez prometer mostrarla siempre en cliente).

---

¿Sigo con el paso 3 (dos propuestas visuales de una pantalla de ejercicio) o ajustamos antes
algo de este formato?
