import { describe, expect, it } from "vitest";
import { calcularMedia, mensajeAutoevaluacion } from "./autoevaluacion";

describe("calcularMedia", () => {
  it("calcula la media de las respuestas", () => {
    expect(calcularMedia([4, 4, 4, 4])).toBe(4);
    expect(calcularMedia([1, 2, 3, 4])).toBe(2.5);
  });

  it("devuelve 0 sin respuestas", () => {
    expect(calcularMedia([])).toBe(0);
  });
});

describe("mensajeAutoevaluacion", () => {
  it("da el mensaje mas alto en o por encima del 87.5% de la escala", () => {
    expect(mensajeAutoevaluacion(3.5, 4)).toBe("Excelente — listo/a para continuar.");
    expect(mensajeAutoevaluacion(4, 4)).toBe("Excelente — listo/a para continuar.");
  });

  it("da el mensaje intermedio entre 62.5% y 87.5%", () => {
    expect(mensajeAutoevaluacion(2.5, 4)).toBe("Bien. Repasa las áreas puntuadas más bajo.");
  });

  it("da el mensaje mas bajo por debajo del 62.5%", () => {
    expect(mensajeAutoevaluacion(1.5, 4)).toBe("Conviene consolidar estas destrezas antes de seguir.");
  });
});
