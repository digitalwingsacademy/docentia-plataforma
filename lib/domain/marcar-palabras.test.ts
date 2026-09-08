import { describe, expect, it } from "vitest";
import { encontrarSpans, gradeMarcarPalabras } from "./marcar-palabras";

describe("encontrarSpans", () => {
  it("encuentra una palabra suelta como span", () => {
    const segmentos = encontrarSpans("First I had no idea.", ["First"]);
    expect(segmentos[0]).toEqual({ tipo: "span", id: "0", valor: "First" });
  });

  it("prefiere una frase larga sobre una mas corta que la contiene", () => {
    const segmentos = encontrarSpans("As a result, she moved to Bristol.", ["As a result", "as"]);
    const spans = segmentos.filter((s) => s.tipo === "span");
    expect(spans).toHaveLength(1);
    expect(spans[0]).toMatchObject({ valor: "As a result" });
  });

  it("no marca substrings dentro de otra palabra", () => {
    const segmentos = encontrarSpans("Nothing happened then.", ["then"]);
    const spans = segmentos.filter((s) => s.tipo === "span");
    expect(spans).toHaveLength(1);
    expect(spans[0]).toMatchObject({ valor: "then" });
  });

  it("reconstruye el texto completo concatenando los segmentos", () => {
    const texto = "First, it started to rain. Then it stopped.";
    const segmentos = encontrarSpans(texto, ["First", "Then"]);
    expect(segmentos.map((s) => s.valor).join("")).toBe(texto);
  });
});

describe("gradeMarcarPalabras", () => {
  it("puntua 100 cuando se marcan todos los spans", () => {
    const result = gradeMarcarPalabras(10, new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]));
    expect(result.puntuacion).toBe(100);
  });

  it("puntua proporcionalmente los spans omitidos", () => {
    const result = gradeMarcarPalabras(10, new Set(["0", "1"]));
    expect(result.puntuacion).toBe(20);
    expect(result.correctos).toBe(2);
  });
});
