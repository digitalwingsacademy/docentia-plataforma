import { describe, expect, it } from "vitest";
import { gradeEmparejar } from "./emparejar";
import type { Par } from "@/lib/content/schema";

const pares: Par[] = [
  { id: 1, termino: "graduate", definicion: "to successfully complete university studies" },
  { id: 2, termino: "retire", definicion: "to stop working permanently, usually due to age" },
  { id: 3, termino: "grow up", definicion: "to develop from child into adult" },
];

describe("gradeEmparejar", () => {
  it("puntua 100 cuando cada termino se empareja con su propia definicion", () => {
    const result = gradeEmparejar(pares, { "1": "1", "2": "2", "3": "3" });
    expect(result.puntuacion).toBe(100);
    expect(result.resultados["1"]).toBe(true);
  });

  it("marca como incorrecta una pareja cruzada", () => {
    const result = gradeEmparejar(pares, { "1": "2", "2": "1", "3": "3" });
    expect(result.resultados["1"]).toBe(false);
    expect(result.resultados["2"]).toBe(false);
    expect(result.resultados["3"]).toBe(true);
    expect(result.puntuacion).toBeCloseTo(33.33, 1);
  });

  it("trata un termino sin emparejar como incorrecto, no como error", () => {
    const result = gradeEmparejar(pares, { "2": "2", "3": "3" });
    expect(result.resultados["1"]).toBe(false);
    expect(result.puntuacion).toBeCloseTo(66.67, 1);
  });
});
