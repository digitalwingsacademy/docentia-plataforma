import type { QuizYml } from "@/lib/content/schema";

export interface QuizAnswer {
  questionId: string;
  optionId: string;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
}

/** Corrección de un intento de quiz — nunca se confía en una nota calculada
 * en el cliente (ADR-005/ADR-007: toda consulta/mutación de dominio server-side). */
export function gradeQuiz(quiz: QuizYml, answers: QuizAnswer[]): QuizResult {
  const total = quiz.preguntas.length;
  const correctCount = quiz.preguntas.filter((pregunta) => {
    const answer = answers.find((a) => a.questionId === pregunta.id);
    return answer?.optionId === pregunta.respuestaCorrectaId;
  }).length;

  const score = total > 0 ? Math.round((correctCount / total) * 10000) / 100 : 0;

  return { score, passed: score >= quiz.passingScore, correctCount, total };
}

/** Nota final de una seccion de quiz segun el criterio de aprobado
 * (mejor_intento o ultimo_intento, ADR-005), a partir de las notas de todos
 * los intentos ya guardados. */
export function resolveFinalScore(
  criterio: QuizYml["criterioAprobado"],
  attemptScores: number[]
): number | null {
  if (attemptScores.length === 0) return null;
  return criterio === "mejor_intento" ? Math.max(...attemptScores) : (attemptScores.at(-1) ?? null);
}
