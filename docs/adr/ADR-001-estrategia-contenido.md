# ADR-001 — Estrategia de contenido: dónde vive y cómo se publica sin redesplegar

## Estado
**Confirmado y validado en producción (2026-09-02).** El spike se ejecutó de verdad contra
`docentia-platform.netlify.app` y `docentia-contenidos` — ver resultado en "Spike" más abajo. La
arquitectura de la Opción B queda cerrada; el único ajuste que introduce el spike es la fuente de fetch
(ver "Consecuencias").

## Contexto
El contenido es el corazón del negocio y debe poder publicarse (nueva lección, corrección, curso nuevo)
sin redesplegar la plataforma. La hipótesis de partida del usuario es separar dos repositorios:
`plataforma/` (código de la app) y `contenidos/` (cursos en MDX + YAML), leyendo el contenido en runtime
y cacheándolo con invalidación por webhook al hacer merge en `main`.

## Opciones consideradas

| # | Opción | A favor | En contra |
|---|--------|---------|-----------|
| A | Mono-repo, contenido leído en build-time | Cero complejidad de fetch/caché; tipado fuerte en build | Publicar contenido exige redeploy completo; mezcla el ciclo de vida de código y de contenido en el mismo pipeline de CI |
| B | Repo de contenidos separado + fetch runtime + webhook de invalidación (hipótesis del usuario) | Publicar = merge de un PR, sin tocar la plataforma; contenido revisable con PRs como código | Depende de que la invalidación por tags funcione de forma fiable en Netlify (riesgo real, ver spike); una capa más de fetch+caché que mantener |
| C | Contenido en object storage (R2/S3), sincronizado desde Git por CI | Menos dependencia de la disponibilidad/rate-limit de la API de GitHub en producción; invalidación por versión de ruta en vez de tags (más robusta) | Una pieza de infraestructura más (el job de sync); sigue habiendo que resolver invalidación, solo que con otro mecanismo |
| D | CMS git-based (Decap/Sveltia/TinaCMS) sobre el repo de contenidos | El socio no técnico podría editar sin tocar YAML/MDX a mano ni saber Git | Soporte de MDX con componentes custom desigual entre herramientas (TinaCMS razonable, Decap flojo); esquema del CMS que mantener sincronizado con los esquemas Zod |
| E | CMS headless SaaS (Sanity/Payload/Strapi), BD como fuente de verdad | Editor pulido, previsualización nativa | Contradice el principio de "contenido versionado en Git con PRs" que pide el propio usuario; un proveedor SaaS (o BD) más de la que depender |

## Decisión
**Opción B** como base del MVP: repo `docentia-contenidos` separado, leído en runtime, cacheado con
`unstable_cache`/`revalidateTag`, invalidado por webhook de GitHub al mergear en `main`.

Para el MVP, quien escribe el contenido es el propio usuario (perfil técnico) editando MDX/YAML
directamente vía PR — así lo ha confirmado. Por eso **la opción D no entra en el MVP**, pero se deja
documentada como ruta de mejora: TinaCMS puede montarse *sobre el mismo repo y formato* (no obliga a
cambiar de B) el día que el socio necesite escribir directamente, sin tener que revisar esta decisión.

## Spike ejecutado (2026-09-02) — resultado: PASA

Código: app Next.js 16 mínima en la raíz de `docentia-plataforma` (`app/`, `lib/spike-content.ts`,
desechable, no es el scaffolding de la sección 9). Desplegada en `docentia-platform.netlify.app` vía
`@netlify/plugin-nextjs`. Contenido de prueba en `docentia-contenidos/spike/mensaje.txt`.

**Prueba real**: edición del fichero fuente + push a `main` → webhook de GitHub (evento `push`, firma
HMAC-SHA256 verificada) → `POST /api/webhooks/content-publish` → `revalidateTag`. Verificado con
`gh api .../hooks/.../deliveries`: entrega real con `status_code: 200`. La página estática `/` y la ruta
dinámica `/api/spike-content` reflejaron el contenido nuevo sin ningún redeploy de la plataforma.

**Confirmado**:
- `revalidateTag` + webhook funciona de forma fiable en Netlify con Next.js 16 (`@netlify/plugin-nextjs`
  5.15.13, cache "Netlify Durable" activa). No se reprodujo el riesgo citado en los foros de Netlify
  (404s / comportamiento inesperado con `dynamicParams`).
- El patrón es *stale-while-revalidate*, no invalidación síncrona: tras el webhook, la petición
  inmediatamente siguiente puede servir aún el valor anterior mientras se refresca en segundo plano; la
  petición de después ya trae el valor nuevo. Es el comportamiento esperado de ISR on-demand, no un bug
  — pero importa para las expectativas de "instantaneidad" que se comuniquen comercialmente.
- Next 16 cambió la firma de `revalidateTag` (ahora exige un segundo argumento, un perfil `cacheLife`
  como `"max"` o `{ expire }`) — ver chuleta en `CLAUDE.md`.

**Hallazgo no anticipado — fuente de fetch importa**: usar `raw.githubusercontent.com` como origen (una
de las opciones que planteaba la sección 4 del encargo) introduce una caché de CDN propia de GitHub
(`Cache-Control: max-age=300`, Fastly) **independiente** de la de Next/Netlify. Esto puede hacer parecer
que la invalidación falla cuando en realidad el mecanismo de Next/Netlify ya refrescó, pero GitHub sigue
sirviendo bytes de hace hasta 5 minutos desde el edge que atienda la petición saliente de la función. La
API de contenidos (`api.github.com/repos/.../contents/...`) cachea solo 60s — mejor, pero no cero. Se
recoge como consecuencia (ver abajo), no cambia la decisión de arquitectura.

Fuentes: [Next.js — revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag),
[Netlify — Next.js 16 is ready to deploy on Netlify](https://www.netlify.com/changelog/next-js-16-deploy-on-netlify/),
[Netlify Support — NextJS unexpected revalidation behaviour](https://answers.netlify.com/t/nextjs-unexpected-revalidation-behaviour-v5-runtime/119854)
(riesgo planteado, no reproducido).

### Plan B (no necesario — el spike pasó, se deja documentado por si una regresión futura lo requiere)
1. `revalidatePath` explícito por ruta conocida (curso/unidad/lección) en vez de tags amplios, invocado
   desde el mismo webhook — más verboso (hay que enumerar rutas afectadas) pero más predecible.
2. Si tampoco fuera fiable: revalidación por tiempo (`revalidate: 60` en vez de on-demand), aceptando
   hasta ~1 minuto de latencia de publicación. Sigue sin requerir redeploy, que es el requisito no
   negociable.

## Consecuencias
- Se necesita un GitHub App (mejor que un PAT personal, permisos más granulares) con lectura sobre
  `docentia-contenidos`, y un endpoint `/api/webhooks/content-publish` protegido con secreto compartido.
- Los deploy previews de Netlify (rama de la plataforma) apuntan al mismo `main` de contenidos que
  producción en el MVP — no se modela una rama de contenidos por preview todavía; es una simplificación
  consciente, no una limitación técnica.
- El origen del contenido en local es siempre disco (`CONTENT_SOURCE=local`), nunca la API de GitHub —
  ver ADR-002 y la sección de experiencia de desarrollo local.
- **Nuevo, a raíz del spike**: el scaffolding real (sección 9) debe leer contenido vía
  `api.github.com/repos/.../contents/...` (o, mejor aún, resolviendo por el SHA de commit/blob que trae
  el propio payload del webhook, que es inmutable y evita cualquier caché intermedia) — no vía
  `raw.githubusercontent.com`, cuya caché de CDN de 5 minutos no depende de nuestra invalidación y puede
  confundirse con un fallo del mecanismo.
- No comunicar "publicación instantánea" cara al cliente: el patrón real es *stale-while-revalidate* (la
  petición inmediatamente posterior al webhook puede servir aún el contenido anterior); en la práctica
  observada, la actualización visible tarda segundos, no hasta el próximo build — pero no es
  estrictamente síncrona con el merge.
