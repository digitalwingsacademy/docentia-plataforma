-- Hallazgo de la prueba end-to-end del vertical slice: el panel de
-- coordinador necesita leer el nombre de los docentes de su organizacion,
-- pero la unica politica de profiles era "cada uno ve su propio perfil".
create policy "coordinador/admin ve perfiles de su organizacion"
  on public.profiles for select
  using (
    exists (
      select 1 from public.memberships target
      where target.profile_id = profiles.id
        and public.current_role_in(target.organization_id) in ('COORDINATOR', 'ADMIN')
    )
  );
