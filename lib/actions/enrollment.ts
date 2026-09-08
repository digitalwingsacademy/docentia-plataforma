"use server";

import { createClient } from "@/lib/supabase/server";

export interface EnrolledCourse {
  title: string;
  summary: string | null;
  content_ref: string;
  version: number;
}

export type EnrollmentResult =
  | { status: "ok"; enrollment: { id: string; course_version: number }; course: EnrolledCourse }
  | { status: "no_organization" }
  | { status: "course_not_found" };

/**
 * Matricula al usuario actual en la version MAS RECIENTE del curso si aun no
 * lo esta (ADR-008: "main representa siempre la version vigente para
 * matriculas nuevas"); si ya existe una matricula, la devuelve tal cual —
 * nunca se cambia de version a una cohorte ya anclada.
 *
 * Devuelve un resultado tipado en vez de lanzar para los estados de negocio
 * esperados (usuario sin organizacion todavia, curso inexistente): un
 * componente de pagina debe poder mostrar un mensaje util, no una pagina de
 * error generica de Next con un digest sin contexto.
 */
export async function getOrCreateEnrollment(courseSlug: string): Promise<EnrollmentResult> {
  const supabase = await createClient();

  // getSession() (lectura local del JWT en cookies) en vez de getUser()
  // (ronda de red hasta el servidor de Supabase Auth): el proxy ya valida
  // la sesion con getUser() antes de dejar pasar la peticion (ver proxy.ts),
  // así que revalidarla otra vez aquí solo añade latencia por navegación
  // sin aportar seguridad extra - el RLS de las consultas de abajo depende
  // del JWT en las cookies, no de esta llamada.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error("No autenticado.");

  // Trae matricula + curso en una sola consulta (embed vía la FK compuesta
  // enrollments->courses) en vez de dos round-trips secuenciales - es el
  // camino caliente de cada navegación dentro de un curso ya matriculado.
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id, course_version, courses(title, summary, content_ref, version)")
    .eq("profile_id", user.id)
    .eq("course_slug", courseSlug)
    .maybeSingle();

  if (existing?.courses) {
    return {
      status: "ok",
      enrollment: { id: existing.id, course_version: existing.course_version },
      course: existing.courses,
    };
  }

  const { data: membership } = await supabase.from("memberships").select("organization_id").limit(1).maybeSingle();
  if (!membership) return { status: "no_organization" };

  const { data: course } = await supabase
    .from("courses")
    .select("slug, version, title, summary, content_ref")
    .eq("slug", courseSlug)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!course) return { status: "course_not_found" };

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
  return {
    status: "ok",
    enrollment: created,
    course: { title: course.title, summary: course.summary, content_ref: course.content_ref, version: course.version },
  };
}
