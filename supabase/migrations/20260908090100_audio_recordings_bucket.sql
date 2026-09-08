-- Bucket privado para grabaciones de audio del alumno (tipo de actividad
-- grabacion-audio). Ruta de objeto: "{enrollment_id}/{section_id}.<ext>" -
-- mismo patron de join a traves de enrollments que activity_submissions, asi
-- que reutilizamos is_member_of/current_role_in sin logica nueva.
insert into storage.buckets (id, name, public)
values ('audio-recordings', 'audio-recordings', false)
on conflict (id) do nothing;

create policy "el docente sube y actualiza sus propias grabaciones"
  on storage.objects for insert
  with check (
    bucket_id = 'audio-recordings'
    and exists (
      select 1 from public.enrollments e
      where e.id = (storage.foldername(name))[1]::uuid
        and e.profile_id = auth.uid()
    )
  );

create policy "el docente actualiza sus propias grabaciones (re-grabar)"
  on storage.objects for update
  using (
    bucket_id = 'audio-recordings'
    and exists (
      select 1 from public.enrollments e
      where e.id = (storage.foldername(name))[1]::uuid
        and e.profile_id = auth.uid()
    )
  );

create policy "el docente escucha sus propias grabaciones"
  on storage.objects for select
  using (
    bucket_id = 'audio-recordings'
    and exists (
      select 1 from public.enrollments e
      where e.id = (storage.foldername(name))[1]::uuid
        and e.profile_id = auth.uid()
    )
  );

create policy "coordinador/admin escucha las grabaciones de su organizacion"
  on storage.objects for select
  using (
    bucket_id = 'audio-recordings'
    and exists (
      select 1 from public.enrollments e
      where e.id = (storage.foldername(name))[1]::uuid
        and public.current_role_in(e.organization_id) in ('COORDINATOR', 'ADMIN')
    )
  );
