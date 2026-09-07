# Identidad visual de las actividades de idiomas — decisión

Complementa `docs/analisis-prototipo-idiomas.md` y `docs/formato-actividades.md`: aquellos cubren
qué mecánicas existen y cómo se autoran en YAML; este documento fija **cómo se ven** al
renderizarse, para que el diseño no quede implícito en el primer componente que se escriba.

## Decisión

Se exploraron dos direcciones visuales para el tipo de sección `actividad` (ver §5 de
`analisis-prototipo-idiomas.md`): **"Field Notes"** (cuaderno de campo — tinta/papel, apoyado en
que la unidad trata de narrativa personal) y **"Signal"** (consola de estudio de radio — apoyado
en que la tarea final de la unidad es un mini-podcast y en que escuchar/grabar es una competencia
central del tipo 9 de la tabla de mecánicas). **Se elige "Signal"** (2026-09-07).

## Sistema de color

| Token | Rol | Claro | Oscuro (nativo) |
|---|---|---|---|
| `--bg` | fondo de página | `#f4f6f8` | `#10131a` |
| `--surface` | tarjetas/bloques | `#ffffff` | `#1a1e27` |
| `--ink` | texto principal | `#11151c` | `#f4f6f8` |
| `--ink-muted` | texto secundario, eyebrows | `#565f6e` | `#9aa2b1` |
| `--accent` (coral, "on air") | interactivo primario | `#d43f22` | `#ff6b4a` |
| `--amber` | estado de aviso / hueco vacío | `#a86400` | `#ffbe4d` |
| `--cyan` | estado "correcto" | `#0f7d69` | `#4fe0c8` |
| `--error` | estado "incorrecto" | `#c0392b` | `#ff7b68` |
| `--border` | bordes, divisores | `#dbe0e6` | `#2a2f3b` |

El tema es **dark-native** (la versión oscura es la identidad "real" de consola; la clara es su
traducción a "estudio de día"), pero ambas están completas — ninguna es un simple invertido de la
otra en luminosidad.

## Tipografía

- Titulares/eyebrows: **Unbounded** (800/700), mayúsculas con tracking abierto — da la energía
  "cartel de emisora" sin caer en Space Grotesk/Inter, que están sobreusados como fuente "segura".
- Cuerpo de texto: **Noto Sans** — elegida específicamente porque tiene la cobertura Unicode más
  completa para símbolos fonéticos IPA (`/t/`, `/ɪd/`, `/wəz/`), el requisito real que señala
  `analisis-prototipo-idiomas.md` §5. Se comparte con la dirección "Field Notes" descartada: la
  legibilidad del cuerpo no debe depender de qué tema esté activo.
- Datos/etiquetas (chips del banco de palabras, contadores, transcripciones): **IBM Plex Mono** —
  refuerza la lectura "consola" (canal, nivel, transcripción monoespaciada) y da a los símbolos
  fonéticos un tracking fijo que ayuda a distinguirlos letra a letra.

## Motivos de layout que vienen de la mecánica, no son decoración

- El indicador de progreso es un **medidor segmentado** (barras tipo VU-meter), no una barra lisa
  con degradado — coherente con el motivo "consola" y, a diferencia de una barra continua, hace
  visible de un vistazo cuántos pasos discretos quedan (relevante para las secciones compuestas de
  `aIn`/`aPt` de §1 del análisis, donde el progreso es por bloque, no continuo).
- Los chips del banco de palabras llevan un borde interior en vez de radio completo tipo "pill" en
  todas partes — evita el patrón genérico de "todo con `rounded-lg`" y se lee como "etiqueta de
  canal" de una mesa de mezclas.
- Los estados de corrección (correcto/incorrecto) usan color **+ icono** (check / aspa), nunca solo
  color de fondo — corrige directamente el hallazgo de accesibilidad de §6 del análisis ("el
  acierto y el error se comunican solo por color").
- Objetivos táctiles ≥44 px en chips y botones — corrige el hallazgo de §6 sobre los 24–30 px del
  prototipo original.

## Prototipo de referencia

La comparación interactiva (ambas propuestas, con toggle de tema) se construyó como artifact
efímero sobre el ejercicio real `past-simple-vs-continuous` de `formato-actividades.md` §2.1; este
documento es la fuente de verdad persistente de la decisión, no el artifact.

## Pendiente

Los tokens de arriba están pensados para trasladarse a variables CSS reales cuando se implemente
el primer componente `<Actividad tipo="rellenar-huecos">` (ver hito correspondiente del encargo de
idiomas, aún no planificado en `docs/roadmap.md`).
