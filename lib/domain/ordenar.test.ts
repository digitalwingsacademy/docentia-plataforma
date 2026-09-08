import { describe, expect, it } from "vitest";
import { gradeOrdenar } from "./ordenar";
import type { Evento } from "@/lib/content/schema";

// Huecos deliberados en la numeracion (6 -> 8), como en el timeline real de
// Ana: gradeOrdenar no debe asumir posiciones consecutivas.
const eventos: Evento[] = [
  { id: "a", texto: "She was born in a small town in Galicia.", posicion: 1 },
  { id: "b", texto: "Her family moved to Madrid when she was twelve.", posicion: 3 },
  { id: "c", texto: "She started her own design company.", posicion: 8 },
];

describe("gradeOrdenar", () => {
  it("puntua 100 cuando cada evento tiene su posicion real, huecos incluidos", () => {
    const result = gradeOrdenar(eventos, { a: 1, b: 3, c: 8 });
    expect(result.puntuacion).toBe(100);
  });

  it("marca como incorrecto un evento en la posicion equivocada", () => {
    const result = gradeOrdenar(eventos, { a: 1, b: 8, c: 3 });
    expect(result.resultados.b).toBe(false);
    expect(result.resultados.c).toBe(false);
    expect(result.puntuacion).toBeCloseTo(33.33, 1);
  });

  it("trata un evento sin posicion asignada como incorrecto, no como error", () => {
    const result = gradeOrdenar(eventos, { a: 1 });
    expect(result.resultados.b).toBe(false);
    expect(result.puntuacion).toBeCloseTo(33.33, 1);
  });
});
