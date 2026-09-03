import { describe, expect, it } from "vitest";
import { gradeQuiz, resolveFinalScore } from "./quiz";
import type { QuizYml } from "@/lib/content/schema";

const quiz: QuizYml = {
  passingScore: 70,
  maxIntentos: 3,
  criterioAprobado: "mejor_intento",
  preguntas: [
    {
      id: "p1",
      enunciado: "¿2+2?",
      opciones: [
        { id: "a", texto: "3" },
        { id: "b", texto: "4" },
      ],
      respuestaCorrectaId: "b",
    },
    {
      id: "p2",
      enunciado: "¿Capital de Francia?",
      opciones: [
        { id: "a", texto: "Madrid" },
        { id: "b", texto: "París" },
      ],
      respuestaCorrectaId: "b",
    },
  ],
};

describe("gradeQuiz", () => {
  it("aprueba con todas las respuestas correctas", () => {
    const result = gradeQuiz(quiz, [
      { questionId: "p1", optionId: "b" },
      { questionId: "p2", optionId: "b" },
    ]);
    expect(result).toEqual({ score: 100, passed: true, correctCount: 2, total: 2 });
  });

  it("suspende por debajo del passingScore", () => {
    const result = gradeQuiz(quiz, [
      { questionId: "p1", optionId: "a" },
      { questionId: "p2", optionId: "b" },
    ]);
    expect(result.score).toBe(50);
    expect(result.passed).toBe(false);
  });

  it("trata una pregunta sin responder como incorrecta, no como error", () => {
    const result = gradeQuiz(quiz, [{ questionId: "p1", optionId: "b" }]);
    expect(result.correctCount).toBe(1);
    expect(result.score).toBe(50);
  });
});

describe("resolveFinalScore", () => {
  it("devuelve null sin intentos", () => {
    expect(resolveFinalScore("mejor_intento", [])).toBeNull();
  });

  it("mejor_intento se queda con la nota mas alta", () => {
    expect(resolveFinalScore("mejor_intento", [40, 90, 60])).toBe(90);
  });

  it("ultimo_intento se queda con la ultima nota, no la mas alta", () => {
    expect(resolveFinalScore("ultimo_intento", [90, 40])).toBe(40);
  });
});
