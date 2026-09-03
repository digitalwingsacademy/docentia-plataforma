"use client";

import { useState } from "react";
import { submitQuizAttempt, type SubmitQuizResult } from "@/lib/actions/progress";
import type { QuizYml } from "@/lib/content/schema";

interface Props {
  quiz: QuizYml;
  enrollmentId: string;
  courseSlug: string;
  unidadDir: string;
  sectionId: string;
  contentRef: string;
  durationMinutes: number;
}

export function QuizPlayer({ quiz, enrollmentId, courseSlug, unidadDir, sectionId, contentRef, durationMinutes }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitQuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = quiz.preguntas.every((p) => answers[p.id]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const submitted = await submitQuizAttempt({
        enrollmentId,
        courseSlug,
        unidadDir,
        sectionId,
        contentRef,
        durationMinutes,
        answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })),
      });
      setResult(submitted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el cuestionario.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-md border p-6 text-center">
        <p className="text-2xl font-semibold">{result.score}%</p>
        <p className={result.passed ? "mt-1 text-green-700" : "mt-1 text-red-700"}>
          {result.passed ? "¡Aprobado!" : "No alcanzas la nota mínima todavía."}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {result.correctCount} de {result.total} correctas.
        </p>
        {!result.passed && result.attemptsRemaining > 0 && (
          <button
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
            className="mt-4 rounded-md border px-4 py-2 text-sm"
          >
            Reintentar ({result.attemptsRemaining} intento{result.attemptsRemaining === 1 ? "" : "s"} restante
            {result.attemptsRemaining === 1 ? "" : "s"})
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {quiz.preguntas.map((pregunta, index) => (
        <fieldset key={pregunta.id} className="rounded-md border p-4">
          <legend className="px-1 text-sm font-medium">
            {index + 1}. {pregunta.enunciado}
          </legend>
          <div className="mt-2 flex flex-col gap-2">
            {pregunta.opciones.map((opcion) => (
              <label key={opcion.id} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={pregunta.id}
                  value={opcion.id}
                  checked={answers[pregunta.id] === opcion.id}
                  onChange={() => setAnswers((prev) => ({ ...prev, [pregunta.id]: opcion.id }))}
                />
                {opcion.texto}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {submitting ? "Corrigiendo..." : "Enviar respuestas"}
      </button>
    </div>
  );
}
