-- Certificate: emision + codigo de verificacion publico. Refleja siempre la
-- version que el docente curso realmente (ADR-008), nunca la version actual
-- del curso.
create extension if not exists pgcrypto with schema extensions;

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments (id) on delete cascade,
  verification_code text not null unique default encode(extensions.gen_random_bytes(6), 'hex'),
  total_hours numeric(6, 2) not null,
  issued_at timestamptz not null default now()
);

alter table public.certificates enable row level security;

create policy "el docente ve sus propios certificados"
  on public.certificates for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = certificates.enrollment_id
        and e.profile_id = auth.uid()
    )
  );

create policy "coordinador/admin ve los certificados de su organizacion"
  on public.certificates for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = certificates.enrollment_id
        and public.current_role_in(e.organization_id) in ('COORDINATOR', 'ADMIN')
    )
  );

-- La verificacion publica de un certificado (pagina /verificar/[codigo]) no
-- requiere sesion: se resuelve con este RPC en vez de una politica publica
-- de "select using (true)", para no exponer toda la tabla via PostgREST.
create function public.verify_certificate(code text)
returns table (
  verification_code text,
  issued_at timestamptz,
  total_hours numeric,
  course_title text,
  teacher_name text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    c.verification_code,
    c.issued_at,
    c.total_hours,
    co.title,
    p.full_name
  from public.certificates c
  join public.enrollments e on e.id = c.enrollment_id
  join public.courses co on co.slug = e.course_slug and co.version = e.course_version
  join public.profiles p on p.id = e.profile_id
  where c.verification_code = code;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;
