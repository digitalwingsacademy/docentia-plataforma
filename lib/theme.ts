// Constantes/tipos compartidos por el server action (lib/actions/theme.ts,
// que solo puede exportar funciones async por ser "use server") y por los
// componentes cliente que necesitan el nombre de la cookie y el tipo.
export const TEMA_COOKIE = "docentia-tema";
export type TemaId = "cuaderno" | "bitacora" | "impulso";

export function esTemaId(valor: string | undefined): valor is TemaId {
  return valor === "cuaderno" || valor === "bitacora" || valor === "impulso";
}
