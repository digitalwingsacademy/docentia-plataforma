import type { ItemClasificar } from "@/lib/content/schema";

export interface ClasificarResult {
  puntuacion: number;
  total: number;
  resultados: Record<string, boolean>;
}

export function gradeClasificar(items: ItemClasificar[], respuestas: Record<string, string>): ClasificarResult {
  const resultados: Record<string, boolean> = {};
  let correctos = 0;

  for (const item of items) {
    const id = String(item.id);
    const correcto = respuestas[id] === item.categoriaId;
    if (correcto) correctos += 1;
    resultados[id] = correcto;
  }

  const total = items.length;
  const puntuacion = total > 0 ? Math.round((correctos / total) * 10000) / 100 : 0;
  return { puntuacion, total, resultados };
}
