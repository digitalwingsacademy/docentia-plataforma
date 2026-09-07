import type { Hueco } from "@/lib/content/schema";

export interface ResultadoHueco {
  correcto: boolean;
  respuestaCorrecta: string;
}

export interface RellenarHuecosResult {
  puntuacion: number;
  total: number;
  resultados: Record<string, ResultadoHueco>;
}

// Normaliza antes de comparar: mayusculas/minusculas, espacios repetidos y
// comillas curvas frente a rectas no deben distinguir una respuesta correcta
// de una incorrecta (docs/formato-actividades.md #2.1).
function normalizar(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ");
}

function esCorrecta(hueco: Hueco, respuesta: string | undefined): boolean {
  if (!respuesta) return false;
  const candidatas = [hueco.respuesta, ...(hueco.acepta ?? [])].map(normalizar);
  return candidatas.includes(normalizar(respuesta));
}

/** Correccion de rellenar-huecos en modo practica — funcion pura, se llama
 * directamente desde el cliente (no hay tabla de intentos que proteger). */
export function gradeRellenarHuecos(
  huecos: Hueco[],
  respuestas: Record<string, string>
): RellenarHuecosResult {
  const resultados: Record<string, ResultadoHueco> = {};
  let correctos = 0;

  for (const hueco of huecos) {
    const id = String(hueco.id);
    const correcto = esCorrecta(hueco, respuestas[id]);
    if (correcto) correctos += 1;
    resultados[id] = { correcto, respuestaCorrecta: hueco.respuesta };
  }

  const total = huecos.length;
  const puntuacion = total > 0 ? Math.round((correctos / total) * 10000) / 100 : 0;

  return { puntuacion, total, resultados };
}
