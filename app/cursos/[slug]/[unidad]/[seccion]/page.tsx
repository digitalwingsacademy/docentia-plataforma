import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateEnrollment } from "@/lib/actions/enrollment";
import { getCourseStructure, getQuiz, getSectionMdx } from "@/lib/content/course";
import { flattenSections } from "@/lib/content/flatten";
import { Aviso } from "@/components/mdx/aviso";
import { Actividad } from "@/components/mdx/actividad";
import { Descargable } from "@/components/mdx/descargable";
import { Comparativa } from "@/components/mdx/comparativa";
import { Presentacion } from "@/components/mdx/presentacion";
import { VideoSection } from "@/components/mdx/video";
import { ReadingProgress } from "@/components/reading-progress";
import { QuizPlayer } from "@/components/quiz-player";
import { NoOrganizationMessage } from "@/components/no-organization";

interface PageParams {
  slug: string;
  unidad: string;
  seccion: string;
}

export default async function SectionPage({ params }: { params: Promise<PageParams> }) {
  const { slug, unidad: unidadDir, seccion: sectionId } = await params;
  const supabase = await createClient();

  const result = await getOrCreateEnrollment(slug);
  if (result.status === "no_organization") return <NoOrganizationMessage />;
  if (result.status === "course_not_found") notFound();
  const enrollment = result.enrollment;

  const { data: course } = await supabase
    .from("courses")
    .select("title, content_ref, version")
    .eq("slug", slug)
    .eq("version", enrollment.course_version)
    .maybeSingle();
  if (!course) notFound();

  const structure = await getCourseStructure(slug, course.content_ref);
  const sections = flattenSections(structure);
  const index = sections.findIndex((s) => s.unidadDir === unidadDir && s.sectionId === sectionId);
  const section = sections[index];
  if (!section) notFound();

  const next = sections[index + 1];

  const { data: progress } = await supabase
    .from("section_progress")
    .select("status")
    .eq("enrollment_id", enrollment.id)
    .eq("section_id", sectionId)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/cursos/${slug}`} className="text-sm text-muted-foreground hover:underline">
        ← {course.title}
      </Link>
      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{section.unidadTitulo}</p>
      <h1 className="text-2xl font-semibold">{section.titulo}</h1>

      <article className="prose prose-neutral mt-6 max-w-none dark:prose-invert">
        {section.tipo === "quiz" ? (
          <QuizPlayerSection
            slug={slug}
            unidadDir={unidadDir}
            sectionId={sectionId}
            contentRef={course.content_ref}
            enrollmentId={enrollment.id}
            durationMinutes={section.duracionMinutos}
          />
        ) : (
          <>
            <LessonContent
              slug={slug}
              unidadDir={unidadDir}
              archivo={section.archivo}
              contentRef={course.content_ref}
              enrollmentId={enrollment.id}
              sectionId={sectionId}
              durationMinutes={section.duracionMinutos}
            />
            {section.tipo === "texto" && (
              <ReadingProgress
                enrollmentId={enrollment.id}
                sectionId={sectionId}
                durationMinutes={section.duracionMinutos}
                alreadyCompleted={progress?.status === "COMPLETED"}
              />
            )}
          </>
        )}
      </article>

      {next && (
        <Link
          href={`/cursos/${slug}/${next.unidadDir}/${next.sectionId}`}
          className="mt-8 inline-block text-sm text-primary hover:underline"
        >
          Siguiente: {next.titulo} →
        </Link>
      )}
    </main>
  );
}

async function LessonContent({
  slug,
  unidadDir,
  archivo,
  contentRef,
  enrollmentId,
  sectionId,
  durationMinutes,
}: {
  slug: string;
  unidadDir: string;
  archivo: string;
  contentRef: string;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}) {
  const mdx = await getSectionMdx(slug, unidadDir, archivo, contentRef);

  return (
    <MDXRemote
      source={mdx}
      components={{
        Aviso,
        Actividad,
        Descargable,
        Comparativa,
        Presentacion,
        Video: (props: { id: string }) => (
          <VideoSection {...props} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />
        ),
      }}
      options={{ parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm] } }}
    />
  );
}

async function QuizPlayerSection({
  slug,
  unidadDir,
  sectionId,
  contentRef,
  enrollmentId,
  durationMinutes,
}: {
  slug: string;
  unidadDir: string;
  sectionId: string;
  contentRef: string;
  enrollmentId: string;
  durationMinutes: number;
}) {
  const quiz = await getQuiz(slug, unidadDir, contentRef);
  return (
    <QuizPlayer
      quiz={quiz}
      enrollmentId={enrollmentId}
      courseSlug={slug}
      unidadDir={unidadDir}
      sectionId={sectionId}
      contentRef={contentRef}
      durationMinutes={durationMinutes}
    />
  );
}
