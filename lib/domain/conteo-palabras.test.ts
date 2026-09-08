import { describe, expect, it } from "vitest";
import { contarPalabras } from "./conteo-palabras";

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
