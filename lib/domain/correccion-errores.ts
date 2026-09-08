import type { FraseError } from "@/lib/content/schema";

export type SegmentoError = { tipo: "texto"; valor: string } | { tipo: "error"; valor: string };

/** Separa una frase en segmentos texto/error buscando <error>...</error> -
 * nunca se interpreta como HTML (dangerouslySetInnerHTML), solo se localiza
 * el tramo marcado para resaltarlo visualmente. */
export function parseFraseError(texto: string): SegmentoError[] {
  const partes = texto.split(/(<error>.*?<\/error>)/g);
  return partes
    .filter((parte) => parte.length > 0)
    .map((parte) => {
      const match = parte.match(/^<error>(.*?)<\/error>$/);
      return match ? { tipo: "error" as const, valor: match[1] ?? "" } : { tipo: "texto" as const, valor: parte };
    });
}

function normalizar(valor: string): string {
  return valor.trim().toLowerCase().replace(/\s+/g, " ");
}

export interface ResultadoFrase {
  correcto: boolean;
  respuestaCorrecta: string;
}

export interface CorreccionErroresResult {
  puntuacion: number;
  total: number;
  resultados: Record<string, ResultadoFrase>;
}

export function gradeCorreccionErrores(frases: FraseError[], respuestas: Record<string, string>): CorreccionErroresResult {
  const resultados: Record<string, ResultadoFrase> = {};
  let correctos = 0;

  for (const frase of frases) {
    const id = String(frase.id);
    const respuesta = respuestas[id];
    const correcto = !!respuesta && normalizar(respuesta) === normalizar(frase.respuesta);
    if (correcto) correctos += 1;
    resultados[id] = { correcto, respuestaCorrecta: frase.respuesta };
  }

  const total = frases.length;
  const puntuacion = total > 0 ? Math.round((correctos / total) * 10000) / 100 : 0;
  return { puntuacion, total, resultados };
}
