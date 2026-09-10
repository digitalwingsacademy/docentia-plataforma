import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { createClient } from "@/lib/supabase/server";
import { TEMA_COOKIE, MODO_COOKIE, esTemaId, esModoId } from "@/lib/theme";
import { LeccionShell, type PasoSesion } from "@/components/leccion/leccion-shell";
import { getOrCreateEnrollment } from "@/lib/actions/enrollment";
import { getActividad, getChecklist, getCourseStructure, getQuiz, getSectionMdx, getTablaRubrica } from "@/lib/content/course";
import { RellenarHuecos } from "@/components/actividades/rellenar-huecos";
import { Foro } from "@/components/actividades/foro";
import { GrabacionAudio } from "@/components/actividades/grabacion-audio";
import { Emparejar } from "@/components/actividades/emparejar";
import { Clasificar } from "@/components/actividades/clasificar";
import { Ordenar } from "@/components/actividades/ordenar";
import { OpcionMultiple } from "@/components/actividades/opcion-multiple";
import { MarcarPalabras } from "@/components/actividades/marcar-palabras";
import { EscrituraLibre } from "@/components/actividades/escritura-libre";
import { EscrituraGuiada } from "@/components/actividades/escritura-guiada";
import { RevisionEntrePares } from "@/components/actividades/revision-entre-pares";
import { CorreccionErrores } from "@/components/actividades/correccion-errores";
import { AutoevaluacionDescriptores } from "@/components/actividades/autoevaluacion-descriptores";
import { flattenSections } from "@/lib/content/flatten";
import { Aviso } from "@/components/mdx/aviso";
import { Actividad } from "@/components/mdx/actividad";
import { Descargable } from "@/components/mdx/descargable";
import { Comparativa } from "@/components/mdx/comparativa";
import { Presentacion } from "@/components/mdx/presentacion-loader";
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
  const { enrollment, course } = result;

  // Independientes entre si (una necesita content_ref, la otra solo
  // enrollment.id) - en paralelo en vez de en cadena, ahorra una ronda de
  // red completa en cada navegacion dentro de una seccion. Se piden todas
  // las filas de progreso del enrollment (no solo la seccion actual) para
  // poder marcar como completados los pasos ya leidos de la unidad.
  const [structure, { data: progressRows }] = await Promise.all([
    getCourseStructure(slug, course.content_ref),
    supabase.from("section_progress").select("section_id, status").eq("enrollment_id", enrollment.id),
  ]);

  const sections = flattenSections(structure);
  const index = sections.findIndex((s) => s.unidadDir === unidadDir && s.sectionId === sectionId);
  const section = sections[index];
  if (!section) notFound();

  const next = sections[index + 1];
  const statusBySection = new Map(progressRows?.map((p) => [p.section_id, p.status]));

  if (section.tipo === "actividad" || section.tipo === "quiz") {
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
            <ActividadSection
              slug={slug}
              unidadDir={unidadDir}
              archivo={section.archivo}
              contentRef={course.content_ref}
              enrollmentId={enrollment.id}
              sectionId={sectionId}
              durationMinutes={section.duracionMinutos}
            />
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

  const cookieStore = await cookies();
  const temaGuardado = cookieStore.get(TEMA_COOKIE)?.value;
  const modoGuardado = cookieStore.get(MODO_COOKIE)?.value;
  const temaId = esTemaId(temaGuardado) ? temaGuardado : "cuaderno";
  const modo = esModoId(modoGuardado) ? modoGuardado : "light";

  const pasos: PasoSesion[] = sections
    .filter((s) => s.unidadDir === unidadDir)
    .map((s) => ({
      titulo: s.titulo,
      estado: s.sectionId === sectionId ? "actual" : statusBySection.get(s.sectionId) === "COMPLETED" ? "completado" : "pendiente",
    }));

  return (
    <LeccionShell
      cursoHref={`/cursos/${slug}`}
      cursoTitulo={course.title}
      unidadTitulo={section.unidadTitulo}
      seccionTitulo={section.titulo}
      pasos={pasos}
      siguiente={next ? { href: `/cursos/${slug}/${next.unidadDir}/${next.sectionId}`, titulo: next.titulo, duracionMinutos: next.duracionMinutos } : null}
      temaId={temaId}
      modo={modo}
      debajoDelContenido={
        section.tipo === "texto" ? (
          <ReadingProgress
            enrollmentId={enrollment.id}
            sectionId={sectionId}
            durationMinutes={section.duracionMinutos}
            alreadyCompleted={statusBySection.get(sectionId) === "COMPLETED"}
          />
        ) : null
      }
    >
      <LessonContent
        slug={slug}
        unidadDir={unidadDir}
        archivo={section.archivo}
        contentRef={course.content_ref}
        enrollmentId={enrollment.id}
        sectionId={sectionId}
        durationMinutes={section.duracionMinutos}
      />
    </LeccionShell>
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

async function ActividadSection({
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
  const actividad = await getActividad(slug, unidadDir, archivo, contentRef);
  switch (actividad.tipo) {
    case "rellenar-huecos":
      return (
        <RellenarHuecos actividad={actividad} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />
      );
    case "foro":
      return <Foro actividad={actividad} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />;
    case "grabacion-audio": {
      const [checklistPrevia, rubrica] = await Promise.all([
        actividad.checklistPrevia ? getChecklist(slug, unidadDir, actividad.checklistPrevia, contentRef) : null,
        actividad.rubricaId ? getTablaRubrica(slug, unidadDir, actividad.rubricaId, contentRef) : null,
      ]);
      return (
        <GrabacionAudio
          actividad={actividad}
          enrollmentId={enrollmentId}
          sectionId={sectionId}
          durationMinutes={durationMinutes}
          checklistPrevia={checklistPrevia?.criterios}
          rubrica={rubrica ?? undefined}
        />
      );
    }
    case "emparejar":
      return <Emparejar actividad={actividad} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />;
    case "clasificar":
      return <Clasificar actividad={actividad} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />;
    case "ordenar":
      return <Ordenar actividad={actividad} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />;
    case "opcion-multiple":
      return (
        <OpcionMultiple actividad={actividad} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />
      );
    case "marcar-palabras":
      return (
        <MarcarPalabras actividad={actividad} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />
      );
    case "escritura-libre":
      return (
        <EscrituraLibre actividad={actividad} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />
      );
    case "escritura-guiada":
      return (
        <EscrituraGuiada actividad={actividad} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />
      );
    case "revision-entre-pares": {
      const checklist = await getChecklist(slug, unidadDir, actividad.checklist, contentRef);
      return (
        <RevisionEntrePares
          actividad={actividad}
          criterios={checklist.criterios}
          enrollmentId={enrollmentId}
          sectionId={sectionId}
          durationMinutes={durationMinutes}
        />
      );
    }
    case "correccion-errores":
      return (
        <CorreccionErrores actividad={actividad} enrollmentId={enrollmentId} sectionId={sectionId} durationMinutes={durationMinutes} />
      );
    case "autoevaluacion-descriptores":
      return (
        <AutoevaluacionDescriptores
          actividad={actividad}
          enrollmentId={enrollmentId}
          sectionId={sectionId}
          durationMinutes={durationMinutes}
        />
      );
  }
}
