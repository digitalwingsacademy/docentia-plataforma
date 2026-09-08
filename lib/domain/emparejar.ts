import type { Par } from "@/lib/content/schema";

export interface EmparejarResult {
  puntuacion: number;
  total: number;
  resultados: Record<string, boolean>;
}

/** Cada par ya correlaciona termino<->definicion compartiendo `id`, asi que
 * acertar es haber asignado al termino de id X la definicion de ese mismo id. */
export function gradeEmparejar(pares: Par[], respuestas: Record<string, string>): EmparejarResult {
  const resultados: Record<string, boolean> = {};
  let correctos = 0;

  for (const par of pares) {
    const id = String(par.id);
    const correcto = respuestas[id] === id;
    if (correcto) correctos += 1;
    resultados[id] = correcto;
  }

  const total = pares.length;
  const puntuacion = total > 0 ? Math.round((correctos / total) * 10000) / 100 : 0;
  return { puntuacion, total, resultados };
}
