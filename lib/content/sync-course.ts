import { createAdminClient } from "@/lib/supabase/admin";
import { getCourseStructure, summarizeCourse } from "./course";

/**
 * Sincroniza los metadatos de un curso (courses.total_sections/
 * total_duration_minutes, ADR-005/ADR-007) desde el contenido real. La
 * usan tanto el seed/setup local como el webhook de publicacion - es la
 * unica via para que la fila de `courses` no se desincronice del contenido.
 */
export async function syncCourse(slug: string, contentRef: string) {
  const structure = await getCourseStructure(slug, contentRef);
  const { totalSections, totalMinutes } = summarizeCourse(structure);

  const supabase = createAdminClient();
  const { error } = await supabase.from("courses").upsert(
    {
      slug,
      version: structure.curso.version,
      title: structure.curso.titulo,
      summary: structure.curso.resumen,
      content_ref: contentRef,
      total_sections: totalSections,
      total_duration_minutes: totalMinutes,
    },
    { onConflict: "slug,version" }
  );
  if (error) throw error;

  return { slug, version: structure.curso.version, totalSections, totalMinutes };
}
