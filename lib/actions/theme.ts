"use server";

import { cookies } from "next/headers";
import { TEMA_COOKIE, type TemaId } from "@/lib/theme";

/** Guarda la preferencia de tema visual del usuario (paso 3 del rediseño:
 * un esqueleto, tres paquetes de tema seleccionables). Cookie, no perfil en
 * base de datos - es una preferencia de presentación, no dato de negocio;
 * si mas adelante se quiere que viaje entre dispositivos, es un cambio
 * aislado y posterior. No httpOnly: el cliente necesita leerla para aplicar
 * el tema antes de la hidratación y evitar parpadeo. */
export async function setTema(tema: TemaId) {
  const cookieStore = await cookies();
  cookieStore.set(TEMA_COOKIE, tema, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
}
