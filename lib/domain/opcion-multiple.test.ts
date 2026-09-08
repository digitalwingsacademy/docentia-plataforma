import { describe, expect, it } from "vitest";
import { gradeOpcionMultiple } from "./opcion-multiple";
import type { QuizPregunta } from "@/lib/content/schema";

const preguntas: QuizPregunta[] = [
  {
    id: "p1",
    enunciado: "Where was Laura when she found the envelope?",
    opciones: [
      { id: "a", texto: "At her workplace" },
      { id: "b", texto: "On the streets of Bristol" },
    ],
    respuestaCorrectaId: "b",
  },
  {
    id: "p2",
    enunciado: "Who wrote the letter?",
    opciones: [
      { id: "a", texto: "Robert" },
      { id: "b", texto: "Margaret" },
    ],
    respuestaCorrectaId: "b",
  },
];

describe("gradeOpcionMultiple", () => {
  it("puntua 100 cuando todas las respuestas son correctas", () => {
    const result = gradeOpcionMultiple(preguntas, { p1: "b", p2: "b" });
    expect(result.puntuacion).toBe(100);
  });

  it("marca como incorrecta una respuesta que no coincide", () => {
    const result = gradeOpcionMultiple(preguntas, { p1: "a", p2: "b" });
    expect(result.resultados.p1).toBe(false);
    expect(result.puntuacion).toBe(50);
  });

  it("trata una pregunta sin responder como incorrecta, no como error", () => {
    const result = gradeOpcionMultiple(preguntas, { p1: "b" });
    expect(result.resultados.p2).toBe(false);
    expect(result.puntuacion).toBe(50);
  });
});
