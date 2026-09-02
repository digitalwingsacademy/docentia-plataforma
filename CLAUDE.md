# CLAUDE.md

Plataforma de formación digital para docentes (B2B: el cliente es el colegio, no el docente individual).
Este fichero es la fuente de verdad viva del proyecto — se actualiza cuando cambia una decisión, no solo
cuando se añade código.

## Estado actual
Fase 0: ADRs escritos (`docs/adr/`), pendientes de aprobación del usuario antes de generar scaffolding y
el vertical slice del MVP (ver `docs/roadmap.md`). Todavía no hay código de aplicación.

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
- **Naming**: se ha usado el placeholder **"Docentia"** como marca y `docentia-plataforma` /
  `docentia-contenidos` como nombres de repo. Pendiente de confirmación o renombrado.
- **Dominio**: sin dominio propio todavía; se asume Netlify subdomain hasta que se indique uno.
- **Escala año 1**: sin cifra confirmada más allá del escenario de vídeo dado (~500 docentes,
  ~3.000h/mes) usado en ADR-003; se asume una escala pequeña-media (orden de 5-15 colegios) para
  dimensionar planes de Supabase/Netlify hasta indicación contraria.
- **Cuentas reales** (GitHub org, Netlify, Supabase dev/prod en UE): a crear por el usuario, que
  compartirá acceso — sin esto, el spike de ADR-001 y el despliegue real de la sección 9 no pueden
  ejecutarse de verdad.

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
