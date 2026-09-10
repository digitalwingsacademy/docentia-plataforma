// Ratio de contraste WCAG 2.x entre dos colores hex, para anotar cada
// combinacion de la paleta con un pasa/no-pasa real en vez de "a ojo".

function canalLineal(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminanciaRelativa(hex: string): number {
  const limpio = hex.replace("#", "");
  const r = parseInt(limpio.slice(0, 2), 16);
  const g = parseInt(limpio.slice(2, 4), 16);
  const b = parseInt(limpio.slice(4, 6), 16);
  return 0.2126 * canalLineal(r) + 0.7152 * canalLineal(g) + 0.0722 * canalLineal(b);
}

export function ratioContraste(hexA: string, hexB: string): number {
  const lA = luminanciaRelativa(hexA);
  const lB = luminanciaRelativa(hexB);
  const [claro, oscuro] = lA > lB ? [lA, lB] : [lB, lA];
  return (claro + 0.05) / (oscuro + 0.05);
}

export type NivelAA = "texto-normal" | "texto-grande-o-ui";

const UMBRAL: Record<NivelAA, number> = {
  "texto-normal": 4.5,
  "texto-grande-o-ui": 3,
};

export function pasaAA(hexA: string, hexB: string, nivel: NivelAA = "texto-normal"): boolean {
  return ratioContraste(hexA, hexB) >= UMBRAL[nivel];
}
