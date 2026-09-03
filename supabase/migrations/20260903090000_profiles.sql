-- Profiles: solo lo que Supabase Auth no gestiona ya (ADR-006). 1:1 con auth.users.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  preferred_locale text not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Datos de perfil que auth.users no cubre. Nunca credenciales ni estado de verificacion.';

alter table public.profiles enable row level security;

create policy "un usuario ve y edita su propio perfil"
  on public.profiles for select
  using (id = auth.uid());

create policy "un usuario actualiza su propio perfil"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Crea el profile automaticamente al registrarse en Supabase Auth, para no
-- depender de que el codigo de la app recuerde hacerlo en cada flujo de login.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
