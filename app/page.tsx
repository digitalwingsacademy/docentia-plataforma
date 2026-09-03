import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CatalogPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: progress } = await supabase
    .from("enrollment_progress")
    .select("enrollment_id, course_slug, course_version, percent_complete")
    .eq("profile_id", user?.id ?? "");

  const { data: courses } = await supabase.from("courses").select("slug, version, title, summary");

  const coursesBySlugVersion = new Map(courses?.map((c) => [`${c.slug}:${c.version}`, c]));

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Tus cursos</h1>

      {!progress || progress.length === 0 ? (
        <p className="mt-4 text-muted-foreground">Todavía no tienes cursos asignados.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {progress.map((enrollment) => {
            const course = coursesBySlugVersion.get(`${enrollment.course_slug}:${enrollment.course_version}`);
            return (
              <li key={enrollment.enrollment_id} className="rounded-lg border p-4">
                <Link href={`/cursos/${enrollment.course_slug}`} className="text-lg font-medium hover:underline">
                  {course?.title ?? enrollment.course_slug}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{course?.summary}</p>
                <div className="mt-3 h-2 w-full rounded-full bg-secondary">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${enrollment.percent_complete ?? 0}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {enrollment.percent_complete ?? 0}% completado
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
