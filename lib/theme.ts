// Constantes/tipos compartidos por el server action (lib/actions/theme.ts,
// que solo puede exportar funciones async por ser "use server") y por los
// componentes cliente que necesitan el nombre de la cookie y el tipo.
export const TEMA_COOKIE = "docentia-tema";
export type TemaId = "cuaderno" | "bitacora" | "impulso";

export function esTemaId(valor: string | undefined): valor is TemaId {
  return valor === "cuaderno" || valor === "bitacora" || valor === "impulso";
}

// Eje independiente del tema: claro/oscuro. Igual que el tema, se persiste
// en su propia cookie en vez de detectar prefers-color-scheme en servidor -
// el valor resuelto se fija como variables CSS inline, que siempre ganan a
// una media query, así que mezclar ambas fuentes daría un resultado
// inconsistente.
export const MODO_COOKIE = "docentia-modo";
export type ModoId = "light" | "dark";

export function esModoId(valor: string | undefined): valor is ModoId {
  return valor === "light" || valor === "dark";
}
