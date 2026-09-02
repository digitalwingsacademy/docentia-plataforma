# ADR-007 — Acceso a datos: supabase-js frente a ORM tipado, migraciones y RLS

## Estado
Propuesto.

## Contexto
El usuario pide decidir explícitamente si las consultas de dominio van con `supabase-js` o con un ORM
tipado (Drizzle o Prisma) contra el mismo Postgres, y advierte que la convivencia de migraciones de un
ORM con las de Supabase CLI y con RLS es "la fuente de líos más habitual" de esta combinación.

## Opciones consideradas

**Prisma + Supabase CLI**: el motor de migraciones de Prisma quiere ser dueño del esquema y su `diff`
no entiende bien `ROW LEVEL SECURITY`/`CREATE POLICY` escritas a mano — tiende a proponer resets o a
pelearse con SQL que Prisma no generó él mismo. Es la combinación con más fricción real reportada por la
comunidad. Descartado.

**Drizzle + Supabase CLI, con Drizzle como dueño de las migraciones**: mismo problema de fondo que
Prisma en menor medida (Drizzle es más "SQL con tipos encima", pero seguiría siendo un segundo sistema de
migraciones compitiendo con `supabase/migrations`). Descartado como "dueño del esquema".

**Drizzle solo como cliente de consultas tipado, sin gestionar migraciones**: coexistencia viable —
`drizzle-kit` se usa únicamente para mantener un fichero de esquema TypeScript que *refleja* las tablas
(no las crea), y las migraciones reales siguen siendo SQL a mano bajo `supabase/migrations`, incluidas
las políticas RLS. Da consultas de dominio con mejor seguridad de tipos en joins/agregaciones complejas
que el embedding de PostgREST. Coste: dos representaciones del esquema (SQL real + espejo Drizzle) que
hay que mantener sincronizadas a mano o con un test de contrato.

**`supabase-js` (PostgREST) + vistas/funciones SQL para lo complejo**: una única fuente de esquema
(las migraciones de Supabase CLI), tipos generados directamente de la base con `supabase gen types
typescript` (siempre sincronizados por construcción, no hay fichero espejo que se pueda desincronizar), y
las consultas de agregación realmente complejas (progreso de unidad/curso, dashboards del coordinador)
se resuelven como vistas o funciones SQL (`security invoker`, respetando RLS) invocadas vía `.rpc()`. Un
único sistema de migraciones, cero coexistencia que gestionar.

## Decisión
**`supabase-js` para todo — auth, storage y dominio — apoyado en vistas/funciones SQL para las consultas
agregadas complejas.** No se introduce Drizzle ni Prisma.

Razón: el propio usuario marca "esto lo vamos a mantener dos personas, no un equipo" y "prioriza
soluciones aburridas y mantenibles" como principios rectores. La opción de un ORM tipado (incluso "solo
como cliente") introduce una segunda representación del esquema que puede desincronizarse silenciosamente
de las migraciones reales — es justo la clase de lío que el usuario pide evitar explícitamente. Con
`supabase-js` + vistas/RPC hay **un único sistema de migraciones** (Supabase CLI) y punto: no hay
pregunta de convivencia que responder porque no hay dos sistemas.

El coste que se acepta a cambio: la seguridad de tipos de las consultas complejas depende de escribir
bien las vistas/funciones y de los tipos generados (`Database` types), no de un query builder que
infiera tipos por join. Se mitiga cubriendo esas vistas/funciones con tests de dominio (como ya exigen
las reglas de trabajo) en vez de confiar solo en el compilador.

Si con el tiempo la complejidad de las consultas de dominio supera lo que es razonable resolver en SQL
(vistas/funciones cada vez más enrevesadas), revisar esta decisión hacia "Drizzle como cliente de
consultas, sin migraciones propias" es la vía de escape ya evaluada arriba — no hace falta re-litigar
Prisma en ese momento, ya está descartado por el problema de migraciones.

## Diseño de RLS: aislamiento multi-colegio

`Membership` (perfil–organización–rol) es la tabla sobre la que se apoyan casi todas las políticas. Para
evitar el problema clásico de recursión (la política de `Membership` necesitaría consultar `Membership`
para decidir si puede leer `Membership`), se usa el patrón estándar de Supabase: una función
`SECURITY DEFINER`, p. ej. `is_member_of(org_id uuid) returns boolean` y `current_role_in(org_id uuid)
returns text`, que consulta `Membership` sin pasar por su propia RLS, y esa función es la que se invoca
desde las políticas de **todas las demás tablas** (`Enrollment`, `SectionProgress`, `QuizAttempt`,
`Certificate`, etc.):

```sql
create policy "coordinador ve progreso de su organización"
  on section_progress for select
  using (
    exists (
      select 1 from enrollment e
      where e.id = section_progress.enrollment_id
        and is_member_of(e.organization_id)
    )
  );
```

Cada migración que crea una tabla de dominio incluye sus políticas RLS en el mismo fichero — no se
añaden "después" — tal como exige el usuario.

## Test de aislamiento obligatorio
Se implementa con `supabase test db` (pgTAP), colocado junto a la migración que crea cada tabla sensible:
crear dos organizaciones, un coordinador y un docente en cada una, y comprobar que el coordinador de la
organización A obtiene **cero filas** al consultar `SectionProgress`/`Enrollment` de la organización B,
tanto por el cliente REST (`supabase-js` con el JWT del coordinador A) como por una consulta directa a
Postgres con ese mismo contexto de usuario. Este es el test explícitamente pedido en la sección 9 del
encargo, y debe poder ejecutarse en CI contra el proyecto de Supabase de dev.

## Consecuencias
- `supabase gen types typescript` se ejecuta como parte de `npm run setup` y tras cada migración nueva,
  y su salida se versiona (para que el build no dependa de tener red hacia Supabase en cada `npm run
  build`).
- Toda consulta de dominio se hace server-side (Server Actions/Route Handlers) con el contexto de usuario
  autenticado — nunca con la `service_role` key salvo en tareas administrativas explícitas y auditadas
  (p. ej. alta de organizaciones por un admin nuestro), que se documentan como tales.
