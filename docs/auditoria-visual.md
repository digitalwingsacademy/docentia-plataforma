# Auditoría visual — estado antes del rediseño

Capturas reales en `docs/auditoria-visual/`, generadas con Playwright contra la app en local
(`localhost:3000`, `CONTENT_SOURCE=local`), con una cuenta de profesor con progreso real en los dos
cursos (`profesor-demo@colegiodemo.es`, ver nota al final) y la coordinadora del seed
(`coordinador@colegiodemo.es`). Todas a 1440px y 390px; una muestra representativa también en
oscuro (el `.dark` de Tailwind inyectado a mano — **hoy no hay ningún control en la UI que lo
active**, ver hallazgo transversal más abajo).

Nomenclatura de fichero: `NN-nombre--viewport--tema.png`.

## Hallazgo transversal (antes de entrar pantalla por pantalla)

Fuera de los ejercicios de idiomas ("Signal", ver más abajo), **toda la aplicación es el tema por
defecto de shadcn/Tailwind sin un solo token propio tocado**: mismo azul de enlace de sistema,
mismo negro puro de botón primario, mismo gris de borde de catálogo, sin una sola tipografía de
personalidad, sin un icono, sin un color de marca. Es exactamente el escenario que preocupa al
comprador: hoy, un coordinador que entra por primera vez no ve nada que distinga esto de un
formulario interno hecho con una librería de componentes de código abierto. Este hallazgo se repite
en casi todas las pantallas de abajo con su propio matiz; aquí solo se nombra una vez para no
repetirlo veinte veces.

## 01 — Login

`01-login--desktop--light.png` / `--mobile--light.png`

- Sin logotipo, sin nombre de marca visible más allá del texto "Docentia" en el `<h1>` — nada que
  ancle la identidad en los primeros tres segundos que pide el encargo.
- Formulario perfectamente centrado en un lienzo de 1440×900 casi vacío: la caja de login ocupa
  ~350px de los 1440, sin ninguna composición alrededor (ni imagen, ni color de fondo, ni una frase
  de posicionamiento). Se lee como una pantalla de "en construcción", no como la puerta de un
  producto que se vende a colegios.
- El botón "Enviar enlace de acceso" es el mismo negro sólido que se repite en *todas* las
  pantallas para *cualquier* acción primaria (ver certificado, invitar, descargar PDF, continuar):
  cero jerarquía de marca, cero memorabilidad.

## 02 — Catálogo ("Tus cursos")

`02-catalogo--desktop--light.png` / `--dark.png` / `--mobile--*.png`

- Dos tarjetas idénticas en forma (borde 1px, radio pequeño, mismo padding) apiladas en una sola
  columna de ~730px dentro de un viewport de 1440px: el 45% derecho de la pantalla es lienzo vacío.
  "Rejilla de tarjetas idénticas" es literalmente lo que el encargo pide evitar, y aquí ni siquiera
  es una rejilla — es una lista de dos.
- No hay nada que diga "para quién" es cada curso, ni una estimación de tiempo prominente (el dato
  existe — `horasEstimadas` — pero no se muestra en esta pantalla en absoluto).
- La barra de progreso es una línea de 4px sin ninguna otra señal (no hay indicación de "sigues
  aquí" ni de qué sesión toca). "100% completado" y "20% completado" son el único texto de estado.
- Oscuro: fondo `#0a0a0a` puro de shadcn, sin ningún matiz cálido — dos negros distintos si se
  compara con el shell de `.rh-console` en las actividades (ver hallazgo del ejercicio 11).

## 03 — Página de curso (Competencia Digital, completo)

`03-curso-digital-overview--desktop--light.png` / `--mobile--light.png`

- Estructura de datos correcta y honesta (3/3, 2/2 por unidad, ✓ por sección) — el problema es
  puramente de tratamiento: check marks son el carácter Unicode `✓` en el mismo gris que el texto,
  no un icono con peso propio; "Ver certificado" es, otra vez, el botón negro genérico.
- Sin ninguna jerarquía entre "esto ya lo hiciste" y "esto es lo próximo": todo el listado tiene el
  mismo peso visual una vez que todo está completo, no hay momento de cierre ni de celebración.

## 08 — Página de curso (English B1, en curso)

`08-curso-idiomas-overview--desktop--light.png` / `--mobile--light.png`

- Aquí se nota más el problema: 5 unidades, 20 secciones, y la única jerarquía es un `<h2>` de
  encabezado de unidad idéntico repetido 5 veces. Con contenido real y denso (nombres de ejercicio
  largos como *"Gap-fill: Past Simple vs Past Continuous — 'A Chance Meeting'"*) la lista se vuelve
  una pared de texto azul de enlace, todos del mismo tamaño, sin distinguir lectura de ejercicio de
  entrega humana.
- El botón "Continuar" no dice a dónde continúa ni cuánto queda — exactamente el punto que marca el
  encargo ("Continuar en la sesión 3" en vez de "Continuar" a secas). Hoy es literalmente solo
  "Continuar".
- Las duraciones (`20 min`, `35 min`...) están ahí pero en gris apagado alineadas a la derecha,
  fáciles de no ver — es justo el dato que un docente necesita para decidir si empieza algo en un
  hueco entre clases, y hoy es lo menos visible de la fila.

## 04 — Lección de texto

`04-leccion-texto--desktop--light.png` / `--dark.png` / `--mobile--*.png`

- Esta es probablemente la mejor pantalla del estado actual: MDX real, con una imagen de contexto,
  una nota (`<Aviso>`) en amarillo, un recuadro `<Actividad>` con borde discontinuo. Pero:
  - El emoji **✏️** funciona literalmente como icono de sección en `<Actividad>` — es justo lo que
    el encargo prohíbe explícitamente.
  - El ancho de línea del cuerpo es de ~490px de texto en un contenedor de 672px (`max-w-2xl`): no
    es el problema de Moodle (1300px), pero tampoco está diseñado — es lo que sale de aplicar
    `prose` de Tailwind Typography sin fijar una medida propia.
  - La única imagen de todo el producto es esta foto de stock de Unsplash (aula genérica,
    sonriente) — no se repite en ningún otro sitio con el mismo tratamiento, así que no es un
    lenguaje visual, es una excepción.
  - `<Aviso>` usa un amarillo/ámbar de aviso también usado como si fuera de marca — no hay ningún
    otro color en toda la lección, así que el ámbar del aviso *es* el acento de facto del producto
    hoy, por accidente.

## 05 — Lección de vídeo

`05-leccion-video--desktop--light.png`

- El reproductor es un rectángulo negro con un triángulo de play blanco centrado y nada más:
  ninguna moldura, ninguna relación visual con el resto de la lección (podría ser cualquier
  `<video>` sin estilizar). La tabla de niveles DigCompEdu debajo es una tabla HTML por defecto,
  sin cebra, sin énfasis en la fila relevante.

## 06 — Quiz

`06-quiz--desktop--light.png`

- Cada pregunta es un `<fieldset>` con borde propio — cinco preguntas, cinco cajas idénticas
  apiladas, otra vez "todo es una tarjeta". Radios nativos del navegador sin ningún estilo. Botón
  "Enviar respuestas" en gris apagado en vez del negro habitual (inconsistencia de qué botón es
  "primario" entre pantallas).
- No hay ninguna indicación de cuántas preguntas hay respondidas / cuántas faltan mientras se
  rellena.

## 07 — Certificado

`07-certificado--desktop--light.png` / `--mobile--light.png`

- Texto plano centrado, sin marco, sin sello, sin marca, sin color: `total_hours`, fecha y código
  de verificación están todos correctos (dato real, ya verificado), pero el objeto en sí no
  transmite nada que un colegio quiera imprimir y colgar en la sala de profesores. Tal cual está,
  un PDF generado a partir de esto sería indistinguible de un justificante administrativo.

## 09 / 10 — Ejercicios de valoración humana (grabación de audio, foro)

`09-ejercicio-grabacion-audio--desktop--light.png`, `10-ejercicio-foro--desktop--light.png`

- Aquí sí vive la identidad "Signal" (ver docs/identidad-visual-idiomas.md): tipografía de
  titulares en mayúsculas con carácter, temporizador circular con acento coral, banco de palabras
  en monoespaciada. Es, con diferencia, lo más cuidado del producto.
- Pero el panel "Signal" está insertado dentro de una página que sigue siendo shadcn puro
  alrededor: el `<h1>` de la lección, la miga de pan y el enlace "Siguiente" que la rodean son
  tipografía y color completamente distintos a los del panel. Es un salto de identidad visual
  dentro de la misma pantalla, no una transición.
- El icono del cronómetro de preparación es un círculo con borde de 4px sin relleno — funciona,
  pero es el único elemento "gráfico" de estas pantallas aparte de los iconos de check/cruz.

## 11 — Ejercicio de rellenar huecos (estado en blanco)

`11-ejercicio-rellenar-huecos--desktop--light.png` / `--dark.png` / `--mobile--*.png`

- En blanco funciona bien: banco de palabras legible, huecos subrayados claros, barra de progreso
  segmentada. El contraste entre esta pantalla y el resto del producto (02, 03, 06...) es tan
  grande que **se nota que son de dos productos distintos** — confirma que "Signal" es una buena
  base para extender, no algo que haya que inventar de cero.

## 19 — Ejercicio de rellenar huecos, estado corregido — **defecto real, no solo de estilo**

`19-ejercicio-corregido--desktop--light.png`

Este es el hallazgo más importante de toda la auditoría porque es exactamente la pantalla que el
encargo señala como la que más nos diferencia de Moodle ("que la corrección se sienta"), y hoy
**está rota, no solo sin pulir**:

- Los iconos de acierto/fallo (✓/✗) se renderizan a su tamaño nativo de SVG sin estilo — decenas de
  píxeles de alto, más grandes que el propio texto de la frase — porque en el componente
  (`components/actividades/rellenar-huecos.tsx`) se usan sueltos, sin la clase que los dimensiona.
  El mismo patrón se repite en `ordenar.tsx`, `emparejar.tsx`, `opcion-multiple.tsx` y
  `correccion-errores.tsx` — cualquier pantalla de corrección de estos tipos tendrá el mismo
  problema en cuanto se corrija con datos reales (las capturas 12/13/14/16 no lo muestran porque se
  capturaron *sin* corregir).
- Los huecos ya rellenados pasan de "hueco subrayado dentro de la frase" a una pastilla de fondo
  rojo con el texto recortado a un ancho fijo ("was lookir", "had passec", "were talki") — la frase
  deja de leerse como frase: se convierte en una columna vertical de fragmentos de texto, iconos
  gigantes y pistas, perdiendo toda la legibilidad que sí tenía en blanco.
- No se ha tocado nada de esto en esta auditoría (es solo diagnóstico), pero debe ser lo primero
  que se corrija al aplicar el sistema nuevo a esta pantalla — hoy mismo, en producción, cualquier
  profesor que corrija este ejercicio ve esto.

## 12 / 13 / 14 / 16 — Resto de mecánicas de ejercicio (en blanco)

`12-ejercicio-emparejar`, `13-ejercicio-clasificar`, `14-ejercicio-marcar-palabras`,
`16-ejercicio-correccion-errores` (todas `--desktop--light.png`)

- Mismo patrón "Signal" correcto en blanco. Emparejar reutiliza el patrón de dos columnas de
  tarjetas — funciona, aunque con 10 pares se genera una lista larga sin ningún agrupamiento visual.
- Corrección de errores usa cursiva + subrayado ondulado rojo para marcar el error — es el único
  sitio de todo el producto donde se usa cursiva, una decisión tipográfica aislada sin relación con
  el resto del sistema.

## 15 — Escritura libre

`15-ejercicio-escritura-libre--desktop--light.png`

- Contador de palabras correcto y presente ("Objetivo: 100–140 palabras (mínimo para enviar: 80)")
  — el dato honesto que pide el encargo ya existe aquí; solo falta tratamiento visual (hoy es texto
  gris plano, sin color de estado cuando se está dentro/fuera de rango salvo al escribir).

## 17 — Panel del coordinador

`17-panel-coordinador--desktop--light.png` / `--dark.png` / `--mobile--*.png`

- Tabla HTML plana: columnas Docente/Curso/Progreso, texto negro sobre blanco, ningún color de
  estado. "100% (6/6)" y "20% (4/20)" tienen el mismo peso visual — el encargo pide explícitamente
  que lo que necesita atención se vea de un vistazo, y hoy hace falta leer cada número.
  "(sin nombre)" para las matrículas de prueba sin metadata es un recordatorio de que no hay ningún
  tratamiento de estado vacío/incompleto en los datos de persona.
- "Invitar" y "Exportar CSV" son dos estilos de botón distintos (negro sólido vs. contorno) sin que
  quede claro por qué uno es primario y otro no.

## 18 — Error 404

`18-404--desktop--light.png` / `--mobile--light.png`

- Página de error por defecto de Next.js, sin ningún elemento de la marca. Un docente que teclea
  mal una URL cae fuera del producto por completo.

## Qué decisiones existentes merece la pena conservar

- El **modelo de datos de progreso** (`section_progress`, `enrollment_progress`) es honesto y ya
  está corregido (ver `fix: clamp enrollment_progress.percent_complete to 100%` en el historial) —
  el problema de las pantallas de arriba es 100% de presentación, nunca de qué dato mostrar.
- La **identidad "Signal"** (`docs/identidad-visual-idiomas.md`, `components/actividades/*`):
  paleta consola-de-radio, tipografía de titulares con carácter, tratamiento de acierto/error con
  icono + color. Es la semilla más sólida que tenemos para "esto no es Moodle" — extenderla al
  resto del producto es más barato que empezar de cero, una vez arreglado el defecto de iconos del
  hallazgo 19.
- La **jerarquía de información ya presente en el contenido** (migas de pan, "siguiente:", conteo
  de unidad `3/3`) es la correcta — el encargo pide reforzarla visualmente, no rediseñar qué
  información se muestra.

## Nota técnica: un bug real encontrado (y corregido) al hacer esta auditoría

Al intentar capturar la lección de texto, el servidor devolvía **500** en cualquier sección
`tipo: texto` de cualquier curso: `components/mdx/presentacion.tsx` (el visor de PDF, `react-pdf`)
se evalúa en el servidor pese a ser `"use client"` — React sigue haciendo un pase de SSR de los
Client Components — y `pdfjs-dist` referencia `DOMMatrix` (API de navegador) al cargar el módulo,
no solo al ejecutarlo. Sin esto, ninguna lección de texto habría podido capturarse ni auditarse.
Corregido con un envoltorio `next/dynamic({ ssr: false })` en un fichero cliente nuevo
(`components/mdx/presentacion-loader.tsx`) — cero cambios de lógica de negocio ni de contenido,
solo evita que ese módulo se cargue en el servidor. No es parte del rediseño visual; se documenta
aquí porque bloqueaba la propia auditoría y porque es un bug de producción real que ya estaba antes
de este trabajo.

## Nota sobre las cuentas de prueba usadas

`profesor-demo@colegiodemo.es` — profesor con el curso de Competencia Digital 100% completo (con
certificado emitido) y English B1 al 20% (S1 completa + arranque de S2), matriculado vía el
`Colegio Demo` del seed existente. Creado para poder capturar estados reales (progreso parcial,
certificado, panel con datos) sin inventar contenido de relleno. Queda en la base de datos de dev
para las próximas rondas de capturas (antes/después).
