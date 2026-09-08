import { describe, expect, it } from "vitest";
import { clasificarConteo, contarPalabras } from "./conteo-palabras";

describe("contarPalabras", () => {
  it("cuenta palabras separadas por un solo espacio", () => {
    expect(contarPalabras("one two three")).toBe(3);
  });

  it("ignora espacios repetidos y saltos de linea", () => {
    expect(contarPalabras("one   two\nthree")).toBe(3);
  });

  it("ignora espacio en blanco en los extremos", () => {
    expect(contarPalabras("  one two  ")).toBe(2);
  });

  it("devuelve 0 para una cadena vacia o solo espacios", () => {
    expect(contarPalabras("")).toBe(0);
    expect(contarPalabras("   ")).toBe(0);
  });
});

describe("clasificarConteo", () => {
  it("clasifica por debajo del minimo como bajo", () => {
    expect(clasificarConteo(50, 100, 140)).toBe("bajo");
  });

  it("clasifica dentro del rango como dentro, extremos incluidos", () => {
    expect(clasificarConteo(100, 100, 140)).toBe("dentro");
    expect(clasificarConteo(120, 100, 140)).toBe("dentro");
    expect(clasificarConteo(140, 100, 140)).toBe("dentro");
  });

  it("clasifica por encima del maximo como sobre", () => {
    expect(clasificarConteo(150, 100, 140)).toBe("sobre");
  });
});
