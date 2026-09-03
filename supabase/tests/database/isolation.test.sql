-- Test de aislamiento multi-colegio (obligatorio, seccion 9 del encargo).
-- Un coordinador de la organizacion B no debe poder leer NADA de la
-- organizacion A: ni enrollments, ni section_progress, ni memberships.
--
-- Los resultados se acumulan en una tabla temporal y se leen con un unico
-- SELECT final, para poder ejecutar este fichero con `supabase db query
-- --linked -f ...` (sin Docker) y ver todas las lineas TAP de una vez.
create extension if not exists pgtap;

begin;
create temporary table _tap_output (line text);
-- El resto del test corre como el rol "authenticated" (para que RLS aplique
-- de verdad: el owner de la tabla la crea como el rol de conexion, que en
-- Supabase suele poder saltarse RLS) - hay que concederle permisos aqui,
-- antes del cambio de rol, o los INSERT posteriores fallarian.
grant insert, select on _tap_output to authenticated;

insert into _tap_output select plan(4);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'coord-a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'coord-b@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'teacher-a@example.com');

insert into public.organizations (id, name, seats_total) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Colegio A', 10),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Colegio B', 10);

insert into public.memberships (profile_id, organization_id, role) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'COORDINATOR'),
  ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-0000-0000-0000-000000000002', 'COORDINATOR'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-0000-0000-0000-000000000001', 'TEACHER');

insert into public.courses (slug, version, title, content_ref, total_sections) values
  ('curso-demo', 1, 'Curso Demo', 'main', 5);

insert into public.enrollments (id, profile_id, organization_id, course_slug, course_version) values
  ('cccccccc-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333',
   'aaaaaaaa-0000-0000-0000-000000000001', 'curso-demo', 1);

insert into public.section_progress (enrollment_id, section_id, status, percent) values
  ('cccccccc-0000-0000-0000-000000000001', 'unidad-1/leccion-1', 'COMPLETED', 100);

-- Actua como el coordinador del colegio B (RLS real, no consulta de admin).
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'role', 'authenticated')::text,
  true
);

insert into _tap_output select is(
  (select count(*) from public.enrollments)::int, 0,
  'coordinador B no ve matriculas del colegio A'
);

insert into _tap_output select is(
  (select count(*) from public.section_progress)::int, 0,
  'coordinador B no ve progreso del colegio A'
);

insert into _tap_output select is(
  (select count(*) from public.memberships)::int, 1,
  'coordinador B solo ve las membresias de su propia organizacion'
);

-- Control positivo: el coordinador del colegio A si ve su propia matricula.
select set_config(
  'request.jwt.claims',
  json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'role', 'authenticated')::text,
  true
);

insert into _tap_output select is(
  (select count(*) from public.enrollments)::int, 1,
  'coordinador A ve la matricula de su propio colegio'
);

insert into _tap_output select * from finish();

select line from _tap_output order by ctid;
rollback;
