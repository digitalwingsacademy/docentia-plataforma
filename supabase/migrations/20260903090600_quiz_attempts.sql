-- QuizAttempt: se guardan todas las respuestas, nota e intento (ADR-005).
-- quiz.yml (contenido) define passingScore y el maximo de intentos; la
-- correccion la hace la funcion de dominio en la app (testeada en Vitest),
-- esta tabla solo persiste el resultado.
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  section_id text not null,
  attempt_number integer not null,
  answers jsonb not null,
  score numeric(5, 2) not null check (score between 0 and 100),
  passed boolean not null,
  submitted_at timestamptz not null default now(),
  unique (enrollment_id, section_id, attempt_number)
);

alter table public.quiz_attempts enable row level security;

create policy "el docente ve y crea sus propios intentos"
  on public.quiz_attempts for all
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = quiz_attempts.enrollment_id
        and e.profile_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.enrollments e
      where e.id = quiz_attempts.enrollment_id
        and e.profile_id = auth.uid()
    )
  );

create policy "coordinador/admin ve los intentos de su organizacion"
  on public.quiz_attempts for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = quiz_attempts.enrollment_id
        and public.current_role_in(e.organization_id) in ('COORDINATOR', 'ADMIN')
    )
  );
