import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateEnrollment } from "@/lib/actions/enrollment";
import { getCourseStructure } from "@/lib/content/course";
import { flattenSections } from "@/lib/content/flatten";

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const enrollment = await getOrCreateEnrollment(slug);

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

      <ul className="mt-8 flex flex-col gap-1">
        {sections.map((section) => {
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
    </main>
  );
}
