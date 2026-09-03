-- Progreso agregado por matricula: calculado al leer sobre section_progress
-- + el resumen sincronizado en courses, nunca duplicado en otra tabla
-- (ADR-005). El progreso a nivel de unidad, que si depende de la estructura
-- del curso, se calcula en la capa de aplicacion combinando esto con el
-- contenido (Git) - la base de datos no conoce la estructura de unidades.
--
-- security invoker (por defecto): respeta el RLS de section_progress y
-- enrollments de quien invoque la vista, no hace falta una politica propia.
create view public.enrollment_progress as
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
      then round(100.0 * count(sp.id) filter (where sp.status = 'COMPLETED') / co.total_sections, 1)
    else 0
  end as percent_complete,
  coalesce(sum(sp.duration_minutes) filter (where sp.status = 'COMPLETED'), 0) as completed_minutes
from public.enrollments e
join public.courses co on co.slug = e.course_slug and co.version = e.course_version
left join public.section_progress sp on sp.enrollment_id = e.id
group by e.id, e.profile_id, e.organization_id, e.course_slug, e.course_version, co.total_sections;
