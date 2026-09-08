import { describe, expect, it } from "vitest";
import { gradeCorreccionErrores, parseFraseError } from "./correccion-errores";
import type { FraseError } from "@/lib/content/schema";

describe("parseFraseError", () => {
  it("separa el texto en segmentos alrededor de <error>...</error>", () => {
    const segmentos = parseFraseError("While I was <error>walk</error> to the station, it started to rain.");
    expect(segmentos).toEqual([
      { tipo: "texto", valor: "While I was " },
      { tipo: "error", valor: "walk" },
      { tipo: "texto", valor: " to the station, it started to rain." },
    ]);
  });

  it("soporta el tramo erroneo al principio de la frase", () => {
    const segmentos = parseFraseError("<error>What you were doing</error> when I called?");
    expect(segmentos[0]).toEqual({ tipo: "error", valor: "What you were doing" });
  });

  it("devuelve un unico segmento de texto si no hay marca de error", () => {
    const segmentos = parseFraseError("No errors here.");
    expect(segmentos).toEqual([{ tipo: "texto", valor: "No errors here." }]);
  });
});

const frases: FraseError[] = [
  { id: 1, texto: "While I was <error>walk</error> to the station.", respuesta: "walking", pista: "Past continuous" },
  { id: 2, texto: "She used to <error>went</error> to the beach.", respuesta: "go" },
];

describe("gradeCorreccionErrores", () => {
  it("puntua 100 cuando todas las correcciones son correctas", () => {
    const result = gradeCorreccionErrores(frases, { "1": "walking", "2": "go" });
    expect(result.puntuacion).toBe(100);
  });

  it("ignora mayusculas y espacios repetidos", () => {
    const result = gradeCorreccionErrores(frases, { "1": "  WALKING ", "2": "go" });
    expect(result.puntuacion).toBe(100);
  });

  it("marca como incorrecta una correccion que no coincide", () => {
    const result = gradeCorreccionErrores(frases, { "1": "walked", "2": "go" });
    expect(result.resultados["1"]).toEqual({ correcto: false, respuestaCorrecta: "walking" });
    expect(result.puntuacion).toBe(50);
  });

  it("trata una frase sin respuesta como incorrecta, no como error", () => {
    const result = gradeCorreccionErrores(frases, { "2": "go" });
    expect(result.resultados["1"]?.correcto).toBe(false);
    expect(result.puntuacion).toBe(50);
  });
});
