import { describe, expect, it } from "vitest";
import { gradeRellenarHuecos } from "./rellenar-huecos";
import type { Hueco } from "@/lib/content/schema";

const huecos: Hueco[] = [
  { id: 1, respuesta: "was visiting" },
  { id: 2, respuesta: "had moved", acepta: ["moved"] },
  { id: 3, respuesta: "used to" },
];

describe("gradeRellenarHuecos", () => {
  it("puntua 100 cuando todas las respuestas son correctas", () => {
    const result = gradeRellenarHuecos(huecos, {
      "1": "was visiting",
      "2": "had moved",
      "3": "used to",
    });
    expect(result.puntuacion).toBe(100);
    expect(result.resultados["1"]).toEqual({ correcto: true, respuestaCorrecta: "was visiting" });
  });

  it("ignora mayusculas, espacios repetidos y comillas curvas", () => {
    const result = gradeRellenarHuecos(huecos, {
      "1": "  WAS   Visiting ",
      "2": "had moved",
      "3": "used to",
    });
    expect(result.puntuacion).toBe(100);
  });

  it("acepta las variantes lexicas declaradas en `acepta`", () => {
    const result = gradeRellenarHuecos(huecos, { "1": "was visiting", "2": "moved", "3": "used to" });
    expect(result.resultados["2"]?.correcto).toBe(true);
  });

  it("marca como incorrecta una respuesta que no coincide", () => {
    const result = gradeRellenarHuecos(huecos, { "1": "was visited", "2": "had moved", "3": "used to" });
    expect(result.resultados["1"]).toEqual({ correcto: false, respuestaCorrecta: "was visiting" });
    expect(result.puntuacion).toBeCloseTo(66.67, 1);
  });

  it("trata un hueco sin respuesta como incorrecto, no como error", () => {
    const result = gradeRellenarHuecos(huecos, { "2": "had moved", "3": "used to" });
    expect(result.resultados["1"]?.correcto).toBe(false);
    expect(result.puntuacion).toBeCloseTo(66.67, 1);
  });
});
