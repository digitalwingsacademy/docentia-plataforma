-- Alta en una organizacion solo por invitacion explicita, nunca por dominio
-- de email automatico (ADR-006). Al primer login con este email, una server
-- action resuelve la invitacion pendiente y crea el Membership.
create extension if not exists citext;

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  email citext not null,
  role public.membership_role not null default 'TEACHER',
  invited_by uuid not null references public.profiles (id),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, email)
);

alter table public.organization_invitations enable row level security;

create policy "coordinador/admin gestiona invitaciones de su organizacion"
  on public.organization_invitations for all
  using (public.current_role_in(organization_id) in ('COORDINATOR', 'ADMIN'))
  with check (public.current_role_in(organization_id) in ('COORDINATOR', 'ADMIN'));

-- Resuelve las invitaciones pendientes de un email y crea las membresias
-- correspondientes. security definer porque se ejecuta en el callback de
-- login, antes de que el usuario tenga ninguna membership todavia.
create function public.accept_pending_invitations(target_profile_id uuid, target_email citext)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.memberships (profile_id, organization_id, role)
  select target_profile_id, oi.organization_id, oi.role
  from public.organization_invitations oi
  where oi.email = target_email
    and oi.accepted_at is null
  on conflict (profile_id, organization_id) do nothing;

  update public.organization_invitations
  set accepted_at = now()
  where email = target_email
    and accepted_at is null;
end;
$$;
