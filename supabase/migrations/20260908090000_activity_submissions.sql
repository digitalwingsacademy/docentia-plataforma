-- ActivitySubmission: entrega generica para actividades de valoracion humana
-- (grabacion-audio, foro y, mas adelante, escritura-libre/escritura-guiada/
-- revision-entre-pares). Una tabla por tipo habria significado repetir el
-- mismo par de politicas RLS una y otra vez; el payload jsonb basta porque
-- ninguno de estos tipos tiene una nota que calcular en SQL todavia (no hay
-- UI de calificacion por el coordinador en esta tanda, solo "guardar la
-- entrega" - ver docs/formato-actividades.md #3).
create table public.activity_submissions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  section_id text not null,
  payload jsonb not null,
  submitted_at timestamptz not null default now(),
  unique (enrollment_id, section_id)
);

comment on column public.activity_submissions.payload is
  'Forma libre segun el tipo de actividad, p.ej. {tipo:"foro", publicacion, respuesta} o '
  '{tipo:"grabacion-audio", storagePath, duracionSegundos}. No se valida en SQL a proposito.';

alter table public.activity_submissions enable row level security;

create policy "el docente ve y actualiza sus propias entregas"
  on public.activity_submissions for all
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = activity_submissions.enrollment_id
        and e.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.enrollments e
      where e.id = activity_submissions.enrollment_id
        and e.profile_id = auth.uid()
    )
  );

create policy "coordinador/admin ve las entregas de su organizacion"
  on public.activity_submissions for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = activity_submissions.enrollment_id
        and public.current_role_in(e.organization_id) in ('COORDINATOR', 'ADMIN')
    )
  );
