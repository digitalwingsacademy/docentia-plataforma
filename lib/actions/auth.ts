"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface MagicLinkResult {
  ok: boolean;
  message: string;
}

export async function sendMagicLink(formData: FormData): Promise<MagicLinkResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { ok: false, message: "Escribe tu email." };
  }

  const supabase = await createClient();
  const site = process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${site}/auth/callback` },
  });

  if (error) {
    return { ok: false, message: "No se pudo enviar el enlace. Intentalo de nuevo en unos minutos." };
  }

  return { ok: true, message: `Te hemos enviado un enlace de acceso a ${email}.` };
}

/** Resuelve invitaciones pendientes para el usuario ya autenticado (via
 * cookies) y crea el Membership correspondiente (ADR-006). Idempotente
 * (on conflict do nothing) — se puede llamar en cada login, no solo el
 * primero. Compartido por el callback PKCE y por el de flujo implicito. */
export async function completeLoginSetup() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    await supabase.rpc("accept_pending_invitations", {
      target_profile_id: user.id,
      target_email: user.email,
    });
  }
}

// Listo para activarse en cuanto haya acceso admin a Google Workspace /
// Microsoft Entra (ADR-006) - hoy no se muestra el boton correspondiente
// porque el login page comprueba que el client id exista.
export async function signInWithProvider(provider: "google" | "azure") {
  const supabase = await createClient();
  const site = process.env.URL ?? process.env.DEPLOY_PRIME_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${site}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/login?error=sso");
  }

  redirect(data.url);
}
