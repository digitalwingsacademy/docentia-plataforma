# CLAUDE.md

Plataforma de formación digital para docentes (B2B: el cliente es el colegio, no el docente individual).
Este fichero es la fuente de verdad viva del proyecto — se actualiza cuando cambia una decisión, no solo
cuando se añade código.

## Estado actual
**Vertical slice de la sección 9 completo y verificado en producción real** (2026-09-03). Los 8 ADRs y
el roadmap están aprobados; el spike de ADR-001 pasó en producción antes de empezar esta sección (ver
ADR-001 para el detalle histórico del spike, ya desechado — sustituido por el código real).

Verificado de principio a fin contra `docentia-platform.netlify.app` (Supabase dev, Mux real) con
Playwright y un navegador real (no cookies simuladas a mano): alta de colegio con plazas, invitación de
un docente, login por magic link (PKCE y el flujo implícito de "enlace abierto en otro dispositivo"),
lección leída con progreso persistido, y el coordinador viendo ese progreso en su panel. `npm run
test:e2e` con `E2E_BASE_URL` reproduce esta verificación.

Esa verificación real encontró y corrigió tres bugs que ningún build ni test unitario habían detectado
(detalle en los commits `fix: real end-to-end verification...` y `fix: auth redirects used Netlify's
internal deploy host...`):
- Un módulo de entorno que mezclaba secretos de servidor con variables de cliente reventaba cualquier
  bundle de navegador que lo importara — separado en `lib/env.ts` (servidor) y `lib/env.client.ts`
  (cliente), en ficheros distintos a propósito (importar cualquiera de los dos evalúa el módulo entero).
- Los redirects de auth construían URLs absolutas desde `request.url`, que en Netlify puede reflejar el
  host interno del deploy en vez del dominio público — la cookie de sesión se fijaba en el host
  equivocado. Ahora se usa `x-forwarded-host`. Ver la chuleta más abajo.
- El catálogo solo listaba matrículas ya existentes, así que un docente recién invitado (sin ninguna
  matrícula todavía) no tenía forma de descubrir el curso al que tenía acceso.

Pendiente, no bloqueante para la demo: activar SSO (Google/Microsoft, ADR-006) en cuanto haya acceso a
esos tenants; el proyecto de Supabase de **prod** (`lrngrnszldipgkqifypl`) existe pero el sitio de
Netlify apunta hoy solo a **dev** — no hay todavía una distinción real de entornos de despliegue.

## Decisiones vigentes (ver ADRs para el razonamiento completo)
- **Contenido**: repo separado `docentia-contenidos` (MDX + YAML), leído en runtime vía la API de
  contenidos de GitHub, cacheado con `revalidateTag`, invalidado por webhook al mergear en `main` —
  validado en producción real, ver ADR-001.
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
- **Cuentas reales**: GitHub, Supabase (dev/prod, `eu-west-1`) y Netlify (`docentia-platform.netlify.app`,
  `@netlify/plugin-nextjs`) creadas, conectadas y con la app desplegada de verdad (2026-09-03). El sitio
  de Netlify usa hoy el proyecto de Supabase de **dev** para todo — no hay todavía un entorno de
  producción real separado.

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
- **`request.url` en Netlify no es de fiar para construir redirects absolutos**: dentro de un route
  handler o del proxy, `request.url` puede reflejar el host *interno* del deploy concreto
  (`<deploy-id>--sitio.netlify.app`), no el dominio público que pidió el navegador. Un
  `NextResponse.redirect(`${new URL(request.url).origin}/algo`)` manda al usuario a ese host interno —
  inofensivo para una redirección cualquiera, pero si de camino se fija una cookie (p. ej. una sesión de
  Supabase tras `setSession`), la cookie queda fijada en el host equivocado y toda navegación posterior al
  dominio real parece "no autenticada". Se soluciona leyendo `x-forwarded-host` (y `x-forwarded-proto`)
  primero, cayendo a `request.url` solo si no están presentes — ver `app/auth/callback/route.ts` y
  `proxy.ts`. Esto no lo detecta ningún build ni test unitario: solo aparece probando contra el dominio
  público real desplegado, nunca contra `next dev`/`next start` en local (un único host, sin nada que
  discrepar).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
