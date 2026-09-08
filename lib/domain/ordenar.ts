import type { Evento } from "@/lib/content/schema";

export interface OrdenarResult {
  puntuacion: number;
  total: number;
  resultados: Record<string, boolean>;
}

export function gradeOrdenar(eventos: Evento[], respuestas: Record<string, number>): OrdenarResult {
  const resultados: Record<string, boolean> = {};
  let correctos = 0;

  for (const evento of eventos) {
    const id = String(evento.id);
    const correcto = respuestas[id] === evento.posicion;
    if (correcto) correctos += 1;
    resultados[id] = correcto;
  }

  const total = eventos.length;
  const puntuacion = total > 0 ? Math.round((correctos / total) * 10000) / 100 : 0;
  return { puntuacion, total, resultados };
}
