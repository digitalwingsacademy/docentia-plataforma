-- Bug real (2026-09-09): competencia-digital-docente-nivel-1 mostraba 120% de
-- progreso porque courses.total_sections se quedo desactualizado (se anadio
-- una seccion de contenido nueva sin volver a ejecutar content:sync para ese
-- curso) mientras una matricula ya habia completado todas las secciones
-- reales. La causa de fondo (total_sections desincronizado) se corrigio
-- re-sincronizando, pero un porcentaje nunca deberia poder superar el 100%
-- pase lo que pase con el sincronismo - se anade como red de seguridad.
create or replace view public.enrollment_progress as
select
  e.id as enrollment_id,
  e.profile_id,
  e.organization_id,
  e.course_slug,
  e.course_version,
  co.total_sections,
  count(sp.id) filter (where sp.status = 'COMPLETED') as completed_sections,
  case
    when co.total_sections > 0
      then least(100.0, round(100.0 * count(sp.id) filter (where sp.status = 'COMPLETED') / co.total_sections, 1))
    else 0
  end as percent_complete,
  coalesce(sum(sp.duration_minutes) filter (where sp.status = 'COMPLETED'), 0) as completed_minutes
from public.enrollments e
join public.courses co on co.slug = e.course_slug and co.version = e.course_version
left join public.section_progress sp on sp.enrollment_id = e.id
group by e.id, e.profile_id, e.organization_id, e.course_slug, e.course_version, co.total_sections;
