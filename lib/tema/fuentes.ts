import type { TemaId } from "@/lib/theme";
import { fuentesCuaderno } from "./fuentes-cuaderno";
import { fuentesBitacora } from "./fuentes-bitacora";
import { fuentesImpulso } from "./fuentes-impulso";

// A diferencia de app/design-lab/fuentes.ts (que carga las 9 tipografias a
// la vez para poder comparar en caliente), aqui cada peticion real solo
// aplica la clase .variable del tema activo - el navegador no llega a
// precargar las otras 6.
const FUENTES_POR_TEMA: Record<TemaId, { variables: string }> = {
  cuaderno: fuentesCuaderno,
  bitacora: fuentesBitacora,
  impulso: fuentesImpulso,
};

export function variablesFuenteTema(tema: TemaId): string {
  return FUENTES_POR_TEMA[tema].variables;
}
