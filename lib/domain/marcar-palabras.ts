export type SegmentoMarcarPalabras = { tipo: "texto"; valor: string } | { tipo: "span"; id: string; valor: string };

function escapeRegExp(valor: string): string {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Localiza las apariciones literales de `palabrasCorrectas` dentro de
 * `texto` y las convierte en spans clicables. Ordena las frases de mas
 * larga a mas corta para que una frase como "As a result" no quede
 * eclipsada por una mas corta como "as" (docs/formato-actividades.md #2.5). */
export function encontrarSpans(texto: string, palabrasCorrectas: string[]): SegmentoMarcarPalabras[] {
  const ordenadas = [...palabrasCorrectas].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(${ordenadas.map(escapeRegExp).join("|")})\\b`, "g");

  const segmentos: SegmentoMarcarPalabras[] = [];
  let ultimo = 0;
  let contador = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(texto))) {
    if (match.index > ultimo) segmentos.push({ tipo: "texto", valor: texto.slice(ultimo, match.index) });
    segmentos.push({ tipo: "span", id: String(contador++), valor: match[0] });
    ultimo = match.index + match[0].length;
  }
  if (ultimo < texto.length) segmentos.push({ tipo: "texto", valor: texto.slice(ultimo) });

  return segmentos;
}

export interface MarcarPalabrasResult {
  puntuacion: number;
  total: number;
  correctos: number;
}

/** Todo span encontrado por encontrarSpans es, por construccion, una
 * respuesta correcta (solo se hacen clicables las palabras/frases reales) -
 * el acierto es haberlo marcado, no haber distinguido correcto de incorrecto. */
export function gradeMarcarPalabras(totalSpans: number, marcados: Set<string>): MarcarPalabrasResult {
  const correctos = Math.min(marcados.size, totalSpans);
  const puntuacion = totalSpans > 0 ? Math.round((correctos / totalSpans) * 10000) / 100 : 0;
  return { puntuacion, total: totalSpans, correctos };
}
