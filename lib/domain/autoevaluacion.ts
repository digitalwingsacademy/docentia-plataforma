/** Media de las respuestas de una autoevaluacion por descriptores - no es una
 * "correccion" (no hay respuesta correcta), solo un resumen para mostrar al
 * alumno tras enviar (docs/formato-actividades.md #3.6). */
export function calcularMedia(respuestas: number[]): number {
  if (respuestas.length === 0) return 0;
  const suma = respuestas.reduce((acc, v) => acc + v, 0);
  return Math.round((suma / respuestas.length) * 100) / 100;
}

/** Mensaje cualitativo segun que fraccion de la escala alcanza la media -
 * mismos umbrales que ya usaba el prototipo (3.5/4 y 2.5/4 sobre escala 1-4,
 * generalizados a escala/min-max arbitrarios). */
export function mensajeAutoevaluacion(media: number, max: number): string {
  const fraccion = media / max;
  if (fraccion >= 0.875) return "Excelente — listo/a para continuar.";
  if (fraccion >= 0.625) return "Bien. Repasa las áreas puntuadas más bajo.";
  return "Conviene consolidar estas destrezas antes de seguir.";
}
