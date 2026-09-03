import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateEnrollment } from "@/lib/actions/enrollment";
import { getCourseStructure } from "@/lib/content/course";
import { flattenSections } from "@/lib/content/flatten";
import { NoOrganizationMessage } from "@/components/no-organization";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const result = await getOrCreateEnrollment(slug);
  if (result.status === "no_organization") return <NoOrganizationMessage />;
  if (result.status === "course_not_found") notFound();
  const enrollment = result.enrollment;

  const { data: course } = await supabase
    .from("courses")
    .select("title, summary, content_ref, version")
    .eq("slug", slug)
    .eq("version", enrollment.course_version)
    .maybeSingle();
  if (!course) notFound();

  const structure = await getCourseStructure(slug, course.content_ref);
  const sections = flattenSections(structure);

  const { data: progressRows } = await supabase
    .from("section_progress")
    .select("section_id, status")
    .eq("enrollment_id", enrollment.id);

  const statusBySection = new Map(progressRows?.map((p) => [p.section_id, p.status]));
  const firstIncomplete = sections.find((s) => statusBySection.get(s.sectionId) !== "COMPLETED") ?? sections[0];

  // Agrupa preservando el orden ya establecido por flattenSections (por
  // unidad.orden, luego seccion.orden) - las unidades son la unidad visual
  // de navegacion del curso, no una lista plana de lecciones.
  const unidades: { unidadDir: string; unidadTitulo: string; sections: typeof sections }[] = [];
  for (const section of sections) {
    const last = unidades.at(-1);
    if (last && last.unidadDir === section.unidadDir) {
      last.sections.push(section);
    } else {
      unidades.push({ unidadDir: section.unidadDir, unidadTitulo: section.unidadTitulo, sections: [section] });
    }
  }

  const { data: certificate } = await supabase
    .from("certificates")
    .select("verification_code")
    .eq("enrollment_id", enrollment.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Tus cursos
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{course.title}</h1>
      <p className="mt-1 text-muted-foreground">{course.summary}</p>

      {certificate ? (
        <Link
          href={`/certificados/${certificate.verification_code}`}
          className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Ver certificado
        </Link>
      ) : (
        firstIncomplete && (
          <Link
            href={`/cursos/${slug}/${firstIncomplete.unidadDir}/${firstIncomplete.sectionId}`}
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Continuar
          </Link>
        )
      )}

      <div className="mt-8 flex flex-col gap-6">
        {unidades.map((unidad, unidadIndex) => {
          const completedCount = unidad.sections.filter(
            (s) => statusBySection.get(s.sectionId) === "COMPLETED"
          ).length;
          return (
            <section key={unidad.unidadDir}>
              <div className="flex items-baseline justify-between border-b pb-1.5">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Unidad {unidadIndex + 1} — {unidad.unidadTitulo}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{unidad.sections.length}
                </span>
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {unidad.sections.map((section) => {
                  const status = statusBySection.get(section.sectionId) ?? "NOT_STARTED";
                  return (
                    <li key={section.sectionId}>
                      <Link
                        href={`/cursos/${slug}/${section.unidadDir}/${section.sectionId}`}
                        className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-secondary"
                      >
                        <span>{section.titulo}</span>
                        <span className="text-xs text-muted-foreground">
                          {status === "COMPLETED" ? "✓" : `${section.duracionMinutos} min`}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
