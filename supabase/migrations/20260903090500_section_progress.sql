-- SectionProgress: unica fuente de verdad del progreso por seccion (ADR-005).
-- section_id identifica la leccion dentro del contenido (Git), no una FK a
-- una tabla de secciones - la estructura del curso no vive en Postgres.
create type public.section_status as enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

create table public.section_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  section_id text not null,
  status public.section_status not null default 'NOT_STARTED',
  percent integer not null default 0 check (percent between 0 and 100),
  duration_minutes integer not null default 0,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (enrollment_id, section_id)
);

comment on column public.section_progress.duration_minutes is
  'Duracion declarada de la seccion (frontmatter del contenido), copiada aqui al completarse. '
  'Las horas del certificado suman esta columna, nunca un cronometro de pantalla (ADR-005).';

alter table public.section_progress enable row level security;

create policy "el docente ve y actualiza el progreso de sus propias matriculas"
  on public.section_progress for all
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = section_progress.enrollment_id
        and e.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.enrollments e
      where e.id = section_progress.enrollment_id
        and e.profile_id = auth.uid()
    )
  );

create policy "coordinador/admin ve el progreso de su organizacion"
  on public.section_progress for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = section_progress.enrollment_id
        and public.current_role_in(e.organization_id) in ('COORDINATOR', 'ADMIN')
    )
  );
