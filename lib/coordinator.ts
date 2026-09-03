import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export interface RosterRow {
  enrollmentId: string;
  teacherName: string | null;
  courseSlug: string;
  courseTitle: string | null;
  percentComplete: number;
  completedSections: number;
  totalSections: number;
}

/** Progreso del claustro para las organizaciones donde el usuario actual es
 * COORDINATOR/ADMIN. RLS ya restringe todo esto a "su" organizacion — esta
 * funcion solo compone dos consultas porque enrollment_progress es una
 * vista y PostgREST no siempre puede embeber profiles/courses sobre ella. */
export async function getCoordinatorRoster(supabase: SupabaseClient<Database>): Promise<RosterRow[]> {
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, course_slug, course_version, profiles(full_name)");

  if (!enrollments || enrollments.length === 0) return [];

  const { data: progress } = await supabase
    .from("enrollment_progress")
    .select("enrollment_id, percent_complete, completed_sections, total_sections");

  const { data: courses } = await supabase.from("courses").select("slug, version, title");

  const progressByEnrollment = new Map(progress?.map((p) => [p.enrollment_id, p]));
  const courseByKey = new Map(courses?.map((c) => [`${c.slug}:${c.version}`, c]));

  return enrollments.map((e) => {
    const p = progressByEnrollment.get(e.id);
    const course = courseByKey.get(`${e.course_slug}:${e.course_version}`);
    return {
      enrollmentId: e.id,
      teacherName: e.profiles?.full_name ?? null,
      courseSlug: e.course_slug,
      courseTitle: course?.title ?? e.course_slug,
      percentComplete: p?.percent_complete ?? 0,
      completedSections: p?.completed_sections ?? 0,
      totalSections: p?.total_sections ?? 0,
    };
  });
}

export function rosterToCsv(rows: RosterRow[]): string {
  const header = "Docente,Curso,Progreso (%),Secciones completadas,Secciones totales";
  const lines = rows.map((r) =>
    [r.teacherName ?? "(sin nombre)", r.courseTitle, r.percentComplete, r.completedSections, r.totalSections]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...lines].join("\n");
}
