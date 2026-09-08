/** Cuenta palabras separadas por espacio en blanco, ignorando extremos y
 * espacios repetidos. Compartido por foro y (mas adelante) escritura-libre /
 * escritura-guiada, que validan minimos de palabras del mismo modo. */
export function contarPalabras(texto: string): number {
  const limpio = texto.trim();
  if (!limpio) return 0;
  return limpio.split(/\s+/).length;
}
