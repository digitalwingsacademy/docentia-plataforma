# ADR-001 — Estrategia de contenido: dónde vive y cómo se publica sin redesplegar

## Estado
Propuesto — pendiente de validar el spike en una cuenta real de Netlify (ver "Spike" más abajo).

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

## Spike obligatorio (según instrucción del usuario)
El plan del spike es: una app mínima en Netlify que lea un fichero del repo de contenidos, lo cachee con
`revalidateTag`, y un route handler que reciba un webhook y lo invalide — desplegado y comprobado en
producción de verdad antes de construir nada más.

**Este spike está pendiente de ejecución real.** El usuario ha elegido el modelo "tú creas las cuentas
(GitHub/Netlify/Supabase), yo accedo" — hasta que comparta esos accesos no hay una cuenta de Netlify
real contra la que desplegar y verificar. Lo que sí puedo afirmar a partir de la documentación oficial:

- Next.js sobre Netlify soporta App Router, RSC, Server Actions e ISR, y `revalidateTag`/`revalidatePath`
  usan las cabeceras de caché de grano fino de Netlify — es una ruta soportada, no un hack.
- Existen reportes en el foro de soporte de Netlify de comportamiento inesperado con revalidación
  on-demand por tags combinada con rutas dinámicas (`dynamicParams`), incluyendo 404s tras invalidar.
  Esto es exactamente el riesgo que el usuario pedía descartar con un spike antes de comprometerse.

Fuentes: [Next.js — revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag),
[Netlify Support — NextJS unexpected revalidation behaviour](https://answers.netlify.com/t/nextjs-unexpected-revalidation-behaviour-v5-runtime/119854),
[Netlify Support — ISR on-demand revalidation with tags causes 404s](https://answers.netlify.com/t/nextjs-isr-on-demand-revalidation-with-tags-and-dynamicparams-in-app-router-causes-all-routes-to-404/145498).

**Acción**: en cuanto existan las cuentas reales, el primer trabajo de código de este proyecto es el
spike descrito (medio día, aislado, desechable), no el scaffolding completo. Este ADR se marca como
"confirmado" solo cuando el spike pase en producción.

### Plan B si el spike falla
1. `revalidatePath` explícito por ruta conocida (curso/unidad/lección) en vez de tags amplios, invocado
   desde el mismo webhook — más verboso (hay que enumerar rutas afectadas) pero más predecible.
2. Si tampoco es fiable: revalidación por tiempo (`revalidate: 60` en vez de on-demand), aceptando hasta
   ~1 minuto de latencia de publicación. Sigue sin requerir redeploy, que es el requisito no negociable.

## Consecuencias
- Se necesita un GitHub App (mejor que un PAT personal, permisos más granulares) con lectura sobre
  `docentia-contenidos`, y un endpoint `/api/webhooks/content-publish` protegido con secreto compartido.
- Los deploy previews de Netlify (rama de la plataforma) apuntan al mismo `main` de contenidos que
  producción en el MVP — no se modela una rama de contenidos por preview todavía; es una simplificación
  consciente, no una limitación técnica.
- El origen del contenido en local es siempre disco (`CONTENT_SOURCE=local`), nunca la API de GitHub —
  ver ADR-002 y la sección de experiencia de desarrollo local.
