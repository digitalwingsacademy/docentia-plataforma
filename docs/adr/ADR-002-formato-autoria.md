# ADR-002 — Formato de autoría: MDX + YAML, esquema, componentes, validación

## Estado
Confirmado (2026-09-02).

## Contexto
El contenido debe ser autorable por una persona técnica (el usuario, en el MVP), validable en CI, y
capaz de referenciar vídeo/descargables/quizzes sin HTML libre, para poder mantener consistencia visual
y no depender de lo que cada autor decida escribir.

## Decisión

### Estructura de carpetas
Se adopta la propuesta del usuario casi tal cual, con un añadido: un fichero de versión de esquema para
poder evolucionar `curso.yml`/`unidad.yml` sin romper cursos antiguos.

```
contenidos/
  schema-version.txt          # ej. "1" — permite migraciones de esquema controladas
  cursos/
    competencia-digital-docente-nivel-1/
      curso.yml                # metadatos, versión (ver ADR-008), estructura, orden de unidades
      unidades/
        01-introduccion/
          unidad.yml
          01-que-es-la-competencia-digital.mdx
          02-marco-europeo.mdx
          quiz.yml
      recursos/                # imágenes y descargables locales al curso
```

### Validación con Zod
`curso.yml` y `unidad.yml` se validan con esquemas Zod compartidos entre el validador de contenido y la
plataforma (mismo paquete, para que un cambio de esquema rompa ambos lados a la vez, no solo uno).
Reglas mínimas de `content:validate`:
- Enlaces internos resuelven a una sección/curso existente.
- Todo `<Video id="..." />` referenciado existe en el manifiesto de vídeos (ver ADR-003).
- Todo quiz tiene al menos una respuesta correcta por pregunta y un `passingScore` definido.
- El campo `orden` de unidades/secciones no tiene huecos ni duplicados.
- No hay ficheros `.mdx` huérfanos (no referenciados desde ningún `unidad.yml`).

Este comando falla en CI del repo de contenidos (no de la plataforma) en cada PR — es la revisión
automática que sustituye a un CMS con validación integrada.

### MDX: markdown estándar + componentes cerrados, nunca HTML libre
Los autores escriben markdown estándar (encabezados, listas, negrita, enlaces, imágenes con `![]()`,
bloques de código con fences — esto ya cubre "código" de la sección 3 sin inventar un componente nuevo)
y, para lo que markdown no cubre, un conjunto **cerrado** de componentes:

`<Video />`, `<Presentacion />`, `<Quiz />`, `<Aviso />`, `<Actividad />`, `<Descargable />`, `<Comparativa />`

Se prohíbe HTML crudo en MDX (no solo por estética: HTML libre es la puerta de entrada a estilos
inconsistentes y, si algún día el contenido no lo escribe solo el propio equipo, a inyección). Si un
autor necesita algo que no cubre la lista, se añade un componente nuevo — como pide el usuario.

### Compilación de MDX: `next-mdx-remote`, no `@next/mdx`
Decisión técnica que condiciona la implementación: como el contenido se resuelve en **runtime** (viene
de un fetch al repo de contenidos o del disco en local, no de ficheros conocidos en build-time dentro de
`app/`), la vía nativa `@next/mdx` no aplica — está pensada para MDX que vive dentro del propio proyecto
Next.js y se compila en build. Se usa `next-mdx-remote` (o `mdx-bundler` si hiciera falta importar
componentes definidos dentro del propio MDX, que no es el caso aquí porque los componentes son un
conjunto cerrado inyectado por la plataforma), compilando el string MDX a algo serializable dentro de la
capa de caché de ADR-001.

### Previsualización local
No hace falta una herramienta aparte: con `CONTENT_SOURCE=local` y `CONTENT_PATH=../docentia-contenidos`,
`npm run dev` ya lee del disco y recarga al guardar. `content:preview` es, como mucho, un alias del mismo
comando con esas variables ya fijadas, para no tener que recordarlas.

## Versionado de cursos
Se trata en detalle en ADR-008 (afecta al modelo de datos, no solo al formato).

## Consecuencias
- El repo de contenidos necesita su propio `package.json`/CI mínimo para ejecutar `content:validate`
  independientemente de la plataforma — es un repo distinto, con su propio pipeline.
- Los esquemas Zod de `curso.yml`/`unidad.yml`/`quiz.yml` se publican como paquete compartido (o se
  duplican deliberadamente con un test de contrato) para que el validador de contenidos y la plataforma
  no diverjan.
