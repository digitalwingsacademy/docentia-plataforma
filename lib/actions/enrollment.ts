"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Matricula al usuario actual en la version MAS RECIENTE del curso si aun no
 * lo esta (ADR-008: "main representa siempre la version vigente para
 * matriculas nuevas"); si ya existe una matricula, la devuelve tal cual —
 * nunca se cambia de version a una cohorte ya anclada.
 */
export async function getOrCreateEnrollment(courseSlug: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id, course_version")
    .eq("profile_id", user.id)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  if (existing) return existing;

  const { data: membership } = await supabase.from("memberships").select("organization_id").limit(1).maybeSingle();
  if (!membership) throw new Error("No perteneces a ninguna organización todavía.");

  const { data: course } = await supabase
    .from("courses")
    .select("slug, version")
    .eq("slug", courseSlug)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!course) throw new Error(`Curso "${courseSlug}" no encontrado.`);

  const { data: created, error } = await supabase
    .from("enrollments")
    .insert({
      profile_id: user.id,
      organization_id: membership.organization_id,
      course_slug: course.slug,
      course_version: course.version,
    })
    .select("id, course_version")
    .single();

  if (error) throw error;
  return created;
}
