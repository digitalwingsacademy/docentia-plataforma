# Docentia — plataforma de formación digital para docentes

Plataforma B2B (el cliente es el colegio) para cursos de capacitación digital del profesorado.
El razonamiento de cada decisión de arquitectura vive en `docs/adr/`; `CLAUDE.md` es el resumen vivo.

## Arrancar en local (menos de 10 minutos, 4 comandos)

Requisitos previos: Node 20+, y acceso a un proyecto de Supabase de **desarrollo** (pide las claves
a quien administre la cuenta si no las tienes).

```bash
git clone git@github.com:digitalwingsacademy/docentia-plataforma.git
cd docentia-plataforma
npm install
npm run setup   # copia .env.example, pide lo que falte, enlaza Supabase, migra, siembra datos
npm run dev
```

`npm run setup` es idempotente — puedes volver a ejecutarlo si cambian las claves o añades una
migración nueva. Pide, con una pista de dónde sacarla, cualquier variable que falte en `.env.local`:
Supabase (URL, publishable key, secret key), el secreto del webhook de contenido, y las claves de
Mux (token + signing key). También necesita `SUPABASE_ACCESS_TOKEN` (Supabase → Account → Access
Tokens) disponible en el entorno para enlazar el proyecto sin tener que iniciar sesión de forma
interactiva.

Al terminar, la app está en `http://localhost:3000` con un colegio demo, un coordinador
(`coordinador@colegiodemo.es`, entra con magic link) y el curso de ejemplo ya sincronizado.

### Contenido en local

Por defecto `CONTENT_SOURCE=local` lee de `../docentia-contenidos` (repo hermano). Clónalo al lado
de este si quieres editar o previsualizar lecciones:

```bash
git clone git@github.com:digitalwingsacademy/docentia-contenidos.git ../docentia-contenidos
```

Sin ese repo clonado, `npm run dev` sigue funcionando para todo lo que no dependa de leer una
lección (auth, panel, etc.) — solo hace falta para renderizar cursos.

## Comandos habituales

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run start` | Build y arranque en modo producción |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Tests de dominio (Vitest) |
| `npm run test:e2e` | Flujos E2E (Playwright) — ver `E2E_BASE_URL` abajo |
| `npm run db:types` | Regenera `lib/database.types.ts` desde el esquema real |
| `npm run db:seed` | Vuelve a sembrar el colegio/coordinador demo (idempotente) |
| `npm run content:sync <slug> [ref]` | Sincroniza `courses.total_sections`/duración desde el contenido real |

Un hook de pre-commit (Husky) ejecuta `typecheck` + `lint` + `test` en cada commit.

### Tests E2E

```bash
npm run test:e2e                                              # contra http://localhost:3000
E2E_BASE_URL=https://docentia-platform.netlify.app npm run test:e2e   # contra un deploy real
```

Los tests generan sesiones reales (magic link vía la Admin API de Supabase) y navegan con un
navegador real — no se simulan cookies a mano. Necesitan `SUPABASE_SECRET_KEY` en el entorno.

## Arquitectura, en una frase por pieza

- **Contenido**: MDX + YAML en `docentia-contenidos`, leído en runtime vía la API de contenidos de
  GitHub (nunca `raw.githubusercontent.com`, ver ADR-001), invalidado por webhook al mergear en
  `main`. `CONTENT_SOURCE=local` en desarrollo lee del disco directamente.
- **Datos**: Supabase Postgres, RLS en cada tabla, sin ORM (`supabase-js` + vistas/RPC para lo
  agregado) — ver ADR-007. Aislamiento multi-colegio cubierto por un test pgTAP
  (`supabase/tests/database/isolation.test.sql`).
- **Auth**: Supabase Auth, magic link. Soporta tanto el flujo PKCE normal como el flujo implícito
  (enlace abierto en otro dispositivo del que lo pidió) — `app/auth/callback/`.
- **Vídeo**: Mux, con URLs de reproducción firmadas, detrás de una interfaz `VideoProvider`
  (`lib/video/`) — ver ADR-003.
- **Progreso/certificados**: `lib/domain/quiz.ts` (corrección, testeada), `lib/actions/progress.ts`
  (registro), `lib/actions/certificate.ts` (emisión con PDF vía `pdf-lib`) — ver ADR-005.

## Desplegar

El site de Netlify (`docentia-platform.netlify.app`) ya está enlazado a este repo — cada push a
`main` dispara un build. Las variables de entorno se gestionan en Netlify (Site settings →
Environment variables), reflejando las mismas claves que `.env.local`. `netlify.toml` fija el
build command y `@netlify/plugin-nextjs`.

**Importante para quien despliegue en una plataforma con dominio interno por deploy (como
Netlify):** los redirects de auth (`app/auth/callback/route.ts`, `proxy.ts`) usan
`x-forwarded-host` en vez de la URL de la petición para construir URLs absolutas — si no, la cookie
de sesión puede acabar fijada en el host interno del deploy en vez del dominio público. Si migras
de plataforma, revisa que ese header (o su equivalente) siga llegando igual.
