-- Enrollment: ancla de cohorte. Guarda course_slug + course_version fijados
-- al matricularse (ADR-008) - nunca se recalculan contra la version actual
-- del curso, aunque este se actualice despues.
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  course_slug text not null,
  course_version integer not null,
  enrolled_at timestamptz not null default now(),
  foreign key (course_slug, course_version) references public.courses (slug, version),
  unique (profile_id, course_slug)
);

comment on column public.enrollments.course_slug is
  'Junto a course_version, ancla esta cohorte a la version del curso vigente al matricularse (ADR-008).';

alter table public.enrollments enable row level security;

create policy "el docente ve sus propias matriculas"
  on public.enrollments for select
  using (profile_id = auth.uid());

create policy "coordinador/admin ve las matriculas de su organizacion"
  on public.enrollments for select
  using (public.current_role_in(organization_id) in ('COORDINATOR', 'ADMIN'));

create policy "un usuario se matricula a si mismo en su organizacion"
  on public.enrollments for insert
  with check (
    profile_id = auth.uid()
    and public.is_member_of(organization_id)
  );
