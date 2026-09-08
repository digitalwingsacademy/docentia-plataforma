import { load as parseYaml } from "js-yaml";
import { unstable_cache } from "next/cache";
import { listContentDir, readContentFile } from "./source";
import {
  actividadYmlSchema,
  checklistYmlSchema,
  cursoYmlSchema,
  quizYmlSchema,
  tablaRubricaYmlSchema,
  unidadYmlSchema,
  type ActividadYml,
  type ChecklistYml,
  type CursoYml,
  type QuizYml,
  type TablaRubricaYml,
  type UnidadYml,
} from "./schema";

export function contentTag(slug: string): string {
  return `content:${slug}`;
}

export interface CourseStructure {
  curso: CursoYml;
  unidades: Array<{ dir: string; unidad: UnidadYml }>;
}

// Version sin cachear: la usan el webhook y los scripts (sync-course,
// seed), que corren fuera de una request de Next y no tienen el
// incrementalCache que unstable_cache necesita para funcionar.
export async function loadCourseStructureUncached(slug: string, ref: string): Promise<CourseStructure> {
  const cursoRaw = await readContentFile(`cursos/${slug}/curso.yml`, ref);
  const curso = cursoYmlSchema.parse(parseYaml(cursoRaw));

  const unidades = await Promise.all(
    curso.unidades.map(async (dir) => {
      const unidadRaw = await readContentFile(`cursos/${slug}/unidades/${dir}/unidad.yml`, ref);
      const unidad = unidadYmlSchema.parse(parseYaml(unidadRaw));
      return { dir, unidad };
    })
  );

  return { curso, unidades };
}

export function getCourseStructure(slug: string, ref: string) {
  return unstable_cache(() => loadCourseStructureUncached(slug, ref), ["course-structure", slug, ref], {
    tags: [contentTag(slug)],
  })();
}

async function loadSectionMdx(
  slug: string,
  unidadDir: string,
  archivo: string,
  ref: string
): Promise<string> {
  return readContentFile(`cursos/${slug}/unidades/${unidadDir}/${archivo}`, ref);
}

export function getSectionMdx(slug: string, unidadDir: string, archivo: string, ref: string) {
  return unstable_cache(
    () => loadSectionMdx(slug, unidadDir, archivo, ref),
    ["section-mdx", slug, unidadDir, archivo, ref],
    { tags: [contentTag(slug)] }
  )();
}

async function loadQuiz(slug: string, unidadDir: string, ref: string): Promise<QuizYml> {
  const raw = await readContentFile(`cursos/${slug}/unidades/${unidadDir}/quiz.yml`, ref);
  return quizYmlSchema.parse(parseYaml(raw));
}

export function getQuiz(slug: string, unidadDir: string, ref: string) {
  return unstable_cache(() => loadQuiz(slug, unidadDir, ref), ["quiz", slug, unidadDir, ref], {
    tags: [contentTag(slug)],
  })();
}

async function loadActividad(slug: string, unidadDir: string, archivo: string, ref: string): Promise<ActividadYml> {
  const raw = await readContentFile(`cursos/${slug}/unidades/${unidadDir}/${archivo}`, ref);
  return actividadYmlSchema.parse(parseYaml(raw));
}

export function getActividad(slug: string, unidadDir: string, archivo: string, ref: string) {
  return unstable_cache(
    () => loadActividad(slug, unidadDir, archivo, ref),
    ["actividad", slug, unidadDir, archivo, ref],
    { tags: [contentTag(slug)] }
  )();
}

async function loadChecklist(slug: string, unidadDir: string, archivo: string, ref: string): Promise<ChecklistYml> {
  const raw = await readContentFile(`cursos/${slug}/unidades/${unidadDir}/${archivo}`, ref);
  return checklistYmlSchema.parse(parseYaml(raw));
}

/** Bloque reutilizable referenciado desde revision-entre-pares (y, mas
 * adelante, checklistPrevia de grabacion-audio) - docs/formato-actividades.md #4.1. */
export function getChecklist(slug: string, unidadDir: string, archivo: string, ref: string) {
  return unstable_cache(
    () => loadChecklist(slug, unidadDir, archivo, ref),
    ["checklist", slug, unidadDir, archivo, ref],
    { tags: [contentTag(slug)] }
  )();
}

async function loadTablaRubrica(slug: string, unidadDir: string, archivo: string, ref: string): Promise<TablaRubricaYml> {
  const raw = await readContentFile(`cursos/${slug}/unidades/${unidadDir}/${archivo}`, ref);
  return tablaRubricaYmlSchema.parse(parseYaml(raw));
}

/** Bloque de referencia mostrado antes de una entrega (docs/formato-actividades.md #4.3) -
 * nunca se corrige automaticamente contra ella, es solo transparencia de criterios. */
export function getTablaRubrica(slug: string, unidadDir: string, archivo: string, ref: string) {
  return unstable_cache(
    () => loadTablaRubrica(slug, unidadDir, archivo, ref),
    ["tabla-rubrica", slug, unidadDir, archivo, ref],
    { tags: [contentTag(slug)] }
  )();
}

/** Suma de secciones y minutos declarados en todo el curso - lo que
 * `courses.total_sections`/`total_duration_minutes` sincroniza en BD para
 * poder calcular progreso agregado en SQL (ver migracion enrollment_progress). */
export function summarizeCourse(structure: CourseStructure): { totalSections: number; totalMinutes: number } {
  const allSections = structure.unidades.flatMap((u) => u.unidad.secciones);
  return {
    totalSections: allSections.length,
    totalMinutes: allSections.reduce((sum, s) => sum + s.duracionMinutos, 0),
  };
}

export { listContentDir };
