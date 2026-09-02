# CLAUDE.md

Plataforma de formación digital para docentes (B2B: el cliente es el colegio, no el docente individual).
Este fichero es la fuente de verdad viva del proyecto — se actualiza cuando cambia una decisión, no solo
cuando se añade código.

## Estado actual
Fase 0 completa. Los 8 ADRs y el roadmap están **aprobados** (2026-09-02). Cuentas reales: GitHub
(`digitalwingsacademy/docentia-plataforma` y `digitalwingsacademy/docentia-contenidos`, públicos, rama
`main`), Supabase dev/prod (`eu-west-1` confirmado en ambos), y Netlify (`docentia-platform.netlify.app`,
enlazado al repo vía `@netlify/plugin-nextjs`).

**El spike de ADR-001 pasó en producción real** (2026-09-02): webhook de GitHub → `revalidateTag` →
contenido actualizado en la plataforma sin redeploy, verificado con entregas reales
(`status_code: 200`) y contenido cambiado en vivo. Un hallazgo del spike, no un fallo: la fuente de
fetch para el contenido real debe ser `api.github.com` (o el blob por SHA del payload del webhook), no
`raw.githubusercontent.com` — su caché de CDN de 5 min confunde las pruebas de invalidación. Detalle
completo en ADR-001.

El código del spike (`app/`, `lib/spike-content.ts`) es desechable y **se sustituye**, no se reutiliza
tal cual, al empezar el scaffolding real de la sección 9 (dominio, Supabase, Tailwind/shadcn, MDX). Con
el spike validado, ya no hay bloqueante para arrancar esa sección.

## Decisiones vigentes (ver ADRs para el razonamiento completo)
- **Contenido**: repo separado `docentia-contenidos` (MDX + YAML), leído en runtime, cacheado con
  `revalidateTag`, invalidado por webhook al mergear en `main`. Spike de Netlify pendiente de ejecutar en
  cuenta real antes de darlo por definitivo — ver ADR-001.
- **Vídeo**: Mux, detrás de una interfaz `VideoProvider` — ver ADR-003.
- **Presentaciones**: exportadas a PDF por el autor, renderizadas con pdf.js — ver ADR-004.
- **Progreso**: modelo propio, vocabulario inspirado en xAPI sin implementarlo; SCORM (import y export)
  fuera del MVP — ver ADR-005.
- **Auth**: Supabase Auth (magic link ya, Google/Microsoft Entra preparados pero apagados hasta tener
  acceso admin a esos tenants) — ver ADR-006.
- **Acceso a datos**: `supabase-js` + vistas/funciones SQL para agregaciones, sin ORM (Drizzle/Prisma
  descartados por el problema de convivencia de migraciones) — ver ADR-007.
- **Versionado de cursos**: `(slug, version)`, `Enrollment` ancla su versión al matricularse — ver ADR-008.

## Pendiente de confirmar con el usuario (asumido por defecto, corregible)
- **Naming**: **"Docentia"** confirmado como nombre de trabajo (2026-09-02) — se mantiene como marca y
  como nombre de repos (`docentia-plataforma` / `docentia-contenidos`) hasta nueva indicación; no es
  necesariamente el nombre comercial final.
- **Dominio**: sin dominio propio todavía; se asume Netlify subdomain hasta que se indique uno.
- **Escala año 1**: sin cifra confirmada más allá del escenario de vídeo dado (~500 docentes,
  ~3.000h/mes) usado en ADR-003; se asume una escala pequeña-media (orden de 5-15 colegios) para
  dimensionar planes de Supabase/Netlify hasta indicación contraria.
- **Cuentas reales**: GitHub y Supabase (dev/prod, `eu-west-1`) creadas y accesibles (2026-09-02). Netlify
  aún sin site conectado — pendiente de un Personal Access Token del usuario o de que cree el site
  manualmente ("Import from Git") y comparta el nombre.

## Modelo de dominio (resumen — el detalle vive en el esquema SQL cuando exista)
- `Organization` — el colegio: plazas, licencia, facturación.
- `Profile` — 1:1 con `auth.users`, solo lo que Supabase Auth no gestiona.
- `Membership` — perfil–organización–rol (`TEACHER`/`COORDINATOR`/`ADMIN`); pivote de casi toda la RLS.
- `Course` — metadatos sincronizados desde el repo de contenidos, clave `(slug, version)`.
- `Enrollment` — perfil + curso + versión + organización, ancla de cohorte.
- `SectionProgress` — estado/% por sección de un `Enrollment`, fuente de verdad única del progreso.
- `QuizAttempt` — intentos de cuestionario con respuestas y nota.
- `Certificate` — emisión + código de verificación público, ligado a la versión cursada.
- `VideoAsset` — id lógico → proveedor + asset concreto (Mux hoy).

Frontera estricta: el **contenido** (texto de las lecciones, estructura de unidades) vive en Git, nunca
en Postgres. En la BD solo entra estado del usuario y los metadatos mínimos para consultar/indexar.

## Convenciones (se completan cuando exista código)
- TypeScript estricto, sin `any` sin comentario que lo justifique.
- Commits atómicos en inglés, Conventional Commits.
- Plan mode antes de tocar más de 3 ficheros.
- Tests de dominio desde el día uno: parsing de contenido, corrección de quizzes, cálculo de progreso.
- Toda tabla nueva trae sus políticas RLS en la misma migración, nunca "después".

## Chuleta Next.js App Router (para quien viene de un SSR artesanal con Vite+React)
Se rellena a medida que aparezcan patrones sin equivalente directo, con el porqué — no antes de que
exista código real al que referirse.

- **Route Handlers (`app/api/.../route.ts`)**: no son "Express endpoints". Cada método HTTP es una
  función exportada (`GET`, `POST`...) en vez de un router con middlewares encadenados; no hay `req/res`
  mutables, se recibe un `Request` (Web API estándar) y se devuelve un `Response`/`NextResponse`. Si en tu
  SSR artesanal montabas rutas de API a mano con Express, esto es el equivalente, pero sin la capa de
  routing/middleware — el enrutado ya lo hace la carpeta.
- **`unstable_cache` + `revalidateTag`**: sustituye a "invalidar caché a mano" (un `Map` en memoria, un
  Redis con TTL que borrabas tú mismo). Envuelves la función que hace el trabajo caro con `unstable_cache`
  y le pones una o varias `tags`; en cualquier otro sitio del servidor (típicamente un route handler de
  webhook) llamas a `revalidateTag(tag)` y Next invalida solo esa entrada, sin que tengas que saber la
  clave de caché exacta ni tocar la función original. Ojo: es una caché *de datos* de Next (persistente
  entre requests en el servidor), distinta de la caché nativa de `fetch` — mezclar las dos es confuso, por
  eso el `fetch` interno de `getSpikeContent` usa `cache: "no-store"` y delega todo el control a la tag.
  Sigue con el prefijo `unstable_` en Next 16 (API estable pendiente, `use cache` es la futura sustituta).
  Ojo si se actualiza Next: en la v16, `revalidateTag` pasó a exigir un segundo argumento (un perfil
  `cacheLife` como `"max"`, o `{ expire }`) — antes de la v16 se llamaba solo con el tag.
- **Por qué no `runtime = "edge"` en Netlify**: en un SSR artesanal, "edge" suena a "más rápido, más
  cerca". En Netlify da igual: las funciones ya se ejecutan en la región configurada, así que el edge
  runtime de Next no aporta latencia extra ganada y sí quita APIs de Node disponibles (por ejemplo,
  `node:crypto` tal y como se usa en el webhook del spike). Por eso ningún route handler de este proyecto
  fija `runtime = "edge"`.
