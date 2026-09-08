/** Cuenta palabras separadas por espacio en blanco, ignorando extremos y
 * espacios repetidos. Compartido por foro y (mas adelante) escritura-libre /
 * escritura-guiada, que validan minimos de palabras del mismo modo. */
export function contarPalabras(texto: string): number {
  const limpio = texto.trim();
  if (!limpio) return 0;
  return limpio.split(/\s+/).length;
}

export type ClasificacionConteo = "bajo" | "dentro" | "sobre";

/** Clasifica un recuento de palabras frente a un rango objetivo, para
 * colorear el contador (usado por escritura-libre). */
export function clasificarConteo(n: number, min: number, max: number): ClasificacionConteo {
  if (n < min) return "bajo";
  if (n > max) return "sobre";
  return "dentro";
}
