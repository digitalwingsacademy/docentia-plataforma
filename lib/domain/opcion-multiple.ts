import type { QuizPregunta } from "@/lib/content/schema";

export interface OpcionMultipleResult {
  puntuacion: number;
  total: number;
  resultados: Record<string, boolean>;
}

export function gradeOpcionMultiple(preguntas: QuizPregunta[], respuestas: Record<string, string>): OpcionMultipleResult {
  const resultados: Record<string, boolean> = {};
  let correctos = 0;

  for (const pregunta of preguntas) {
    const correcto = respuestas[pregunta.id] === pregunta.respuestaCorrectaId;
    if (correcto) correctos += 1;
    resultados[pregunta.id] = correcto;
  }

  const total = preguntas.length;
  const puntuacion = total > 0 ? Math.round((correctos / total) * 10000) / 100 : 0;
  return { puntuacion, total, resultados };
}
