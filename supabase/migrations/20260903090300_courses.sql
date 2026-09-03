-- Course: metadatos sincronizados desde docentia-contenidos, clave (slug,
-- version) (ADR-008). El contenido en si (texto de lecciones) vive en Git,
-- nunca aqui; total_sections/total_duration_minutes son un resumen
-- denormalizado que el pipeline de publicacion (webhook, ADR-001) mantiene
-- al dia para poder calcular progreso agregado en SQL sin leer Git en cada
-- consulta.
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  version integer not null check (version > 0),
  title text not null,
  summary text,
  content_ref text not null, -- tag o commit SHA de docentia-contenidos para esta version
  total_sections integer not null default 0,
  total_duration_minutes integer not null default 0,
  published_at timestamptz not null default now(),
  unique (slug, version)
);

alter table public.courses enable row level security;

-- Los cursos son metadatos publicos dentro de la app (no hay dato sensible
-- de colegio aqui): cualquier usuario autenticado puede leerlos. El acceso
-- real al contenido de un curso concreto lo determina el Enrollment.
create policy "usuarios autenticados leen cursos"
  on public.courses for select
  using (auth.role() = 'authenticated');
