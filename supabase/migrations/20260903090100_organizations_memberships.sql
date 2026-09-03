-- Organizations (el colegio) + memberships (perfil-organizacion-rol), el
-- pivote de casi toda la RLS del proyecto (ADR-007). Se crean juntas porque
-- las politicas de "organizations" dependen de una funcion que consulta
-- "memberships", y esa funcion debe existir antes de poder referenciarla en
-- un CREATE POLICY (a diferencia del cuerpo de una funcion plpgsql, una
-- expresion de politica se resuelve en el momento de crearla).

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  seats_total integer not null check (seats_total > 0),
  license_starts_on date not null default current_date,
  license_ends_on date,
  billing_email text,
  created_at timestamptz not null default now()
);

create type public.membership_role as enum ('TEACHER', 'COORDINATOR', 'ADMIN');

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role public.membership_role not null default 'TEACHER',
  created_at timestamptz not null default now(),
  unique (profile_id, organization_id)
);

-- Funciones security definer: consultan memberships SIN pasar por su propia
-- RLS, rompiendo la recursion "la politica de memberships necesitaria leer
-- memberships para decidir si puede leer memberships" (patron estandar de
-- Supabase, ver ADR-007). Todas las tablas de dominio posteriores llaman a
-- is_member_of/current_role_in desde sus propias politicas.
create function public.is_member_of(target_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_org_id
      and profile_id = auth.uid()
  );
$$;

create function public.current_role_in(target_org_id uuid)
returns public.membership_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.memberships
  where organization_id = target_org_id
    and profile_id = auth.uid()
  limit 1;
$$;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;

create policy "miembros ven su organizacion"
  on public.organizations for select
  using (public.is_member_of(id));

create policy "un usuario ve sus propias membresias"
  on public.memberships for select
  using (profile_id = auth.uid());

create policy "coordinador/admin ve las membresias de su organizacion"
  on public.memberships for select
  using (
    public.current_role_in(organization_id) in ('COORDINATOR', 'ADMIN')
  );
