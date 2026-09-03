import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: allCourses } = await supabase
    .from("courses")
    .select("slug, version, title, summary")
    .order("version", { ascending: false });

  // Un docente recien invitado no tiene ninguna matricula todavia (se crea
  // al entrar en /cursos/[slug], no antes) - el catalogo tiene que mostrar
  // los cursos disponibles igualmente, o nunca podria empezar ninguno.
  // Se muestra la version mas reciente de cada slug (ADR-008: "main" es
  // siempre la version vigente para matriculas nuevas).
  const latestBySlug = new Map<string, { slug: string; version: number; title: string; summary: string | null }>();
  for (const course of allCourses ?? []) {
    if (!latestBySlug.has(course.slug)) latestBySlug.set(course.slug, course);
  }

  const { data: progress } = await supabase
    .from("enrollment_progress")
    .select("enrollment_id, course_slug, percent_complete")
    .eq("profile_id", user?.id ?? "");

  const progressBySlug = new Map(progress?.map((p) => [p.course_slug, p]));

  const courses = [...latestBySlug.values()];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Tus cursos</h1>

      {courses.length === 0 ? (
        <p className="mt-4 text-muted-foreground">Todavía no hay cursos publicados.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {courses.map((course) => {
            const enrollment = progressBySlug.get(course.slug);
            const percent = enrollment?.percent_complete ?? 0;
            return (
              <li key={course.slug} className="rounded-lg border p-4">
                <Link href={`/cursos/${course.slug}`} className="text-lg font-medium hover:underline">
                  {course.title}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{course.summary}</p>
                <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {enrollment ? `${percent}% completado` : "Sin empezar"}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
