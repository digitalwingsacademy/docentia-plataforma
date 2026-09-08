import { describe, expect, it } from "vitest";
import { gradeClasificar } from "./clasificar";
import type { ItemClasificar } from "@/lib/content/schema";

const items: ItemClasificar[] = [
  { id: 1, texto: "walked", categoriaId: "t" },
  { id: 2, texto: "called", categoriaId: "d" },
  { id: 3, texto: "wanted", categoriaId: "id" },
];

describe("gradeClasificar", () => {
  it("puntua 100 cuando todos los items van a su categoria correcta", () => {
    const result = gradeClasificar(items, { "1": "t", "2": "d", "3": "id" });
    expect(result.puntuacion).toBe(100);
  });

  it("marca como incorrecto un item en la categoria equivocada", () => {
    const result = gradeClasificar(items, { "1": "d", "2": "d", "3": "id" });
    expect(result.resultados["1"]).toBe(false);
    expect(result.puntuacion).toBeCloseTo(66.67, 1);
  });

  it("trata un item sin clasificar como incorrecto, no como error", () => {
    const result = gradeClasificar(items, { "2": "d" });
    expect(result.resultados["1"]).toBe(false);
    expect(result.resultados["3"]).toBe(false);
    expect(result.puntuacion).toBeCloseTo(33.33, 1);
  });
});
