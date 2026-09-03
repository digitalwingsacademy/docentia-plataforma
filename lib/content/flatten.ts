import type { CourseStructure } from "./course";

export interface FlatSection {
  sectionId: string;
  unidadDir: string;
  archivo: string;
  tipo: "video" | "texto" | "quiz";
  titulo: string;
  duracionMinutos: number;
  unidadTitulo: string;
}

/** Aplana curso -> unidades -> secciones en un solo orden (por unidad.orden,
 * luego seccion.orden) - la estructura vive en Git, este es el unico sitio
 * que decide "cual es la siguiente seccion" para toda la app. */
export function flattenSections(structure: CourseStructure): FlatSection[] {
  return [...structure.unidades]
    .sort((a, b) => a.unidad.orden - b.unidad.orden)
    .flatMap(({ dir, unidad }) =>
      [...unidad.secciones]
        .sort((a, b) => a.orden - b.orden)
        .map((seccion) => ({
          sectionId: seccion.id,
          unidadDir: dir,
          archivo: seccion.archivo,
          tipo: seccion.tipo,
          titulo: seccion.titulo,
          duracionMinutos: seccion.duracionMinutos,
          unidadTitulo: unidad.titulo,
        }))
    );
}
