import { describe, expect, it } from "vitest";
import { pasaAA, ratioContraste } from "./contraste";

describe("ratioContraste", () => {
  it("negro sobre blanco da el maximo ratio (21:1)", () => {
    expect(ratioContraste("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("un color contra si mismo da ratio 1", () => {
    expect(ratioContraste("#14524f", "#14524f")).toBeCloseTo(1, 5);
  });

  it("el orden de los dos colores no importa", () => {
    expect(ratioContraste("#1c2024", "#f7f5f1")).toBeCloseTo(ratioContraste("#f7f5f1", "#1c2024"), 5);
  });
});

describe("pasaAA", () => {
  it("acepta un contraste alto como texto normal", () => {
    expect(pasaAA("#1c2024", "#f7f5f1", "texto-normal")).toBe(true);
  });

  it("rechaza un contraste bajo como texto normal", () => {
    expect(pasaAA("#e0dcd3", "#f7f5f1", "texto-normal")).toBe(false);
  });

  it("un contraste intermedio puede pasar como texto grande/UI pero no como texto normal", () => {
    expect(pasaAA("#9c7a2e", "#ece6d2", "texto-grande-o-ui")).toBe(true);
    expect(pasaAA("#9c7a2e", "#ece6d2", "texto-normal")).toBe(false);
  });
});
