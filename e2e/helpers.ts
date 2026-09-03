import type { Page } from "@playwright/test";
import { createAdminClient } from "../lib/supabase/admin";

/** Genera un magic link real de Supabase y navega el navegador hasta el,
 * dejando que el flujo real (PKCE/cookies) se complete como con un click de
 * verdad — no se simulan cookies a mano. */
export async function loginAs(page: Page, email: string, baseURL: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${baseURL}/auth/callback` },
  });
  if (error) throw error;
  const actionLink = data.properties?.action_link;
  if (!actionLink) throw new Error("No se pudo generar el magic link");

  await page.goto(actionLink);
  // El enlace pasa por /auth/callback/implicit, que hace setSession +
  // completeLoginSetup en el cliente antes de redirigir - mas lento que una
  // navegacion normal, de ahi el timeout generoso.
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/callback"), { timeout: 15000 });
}

export async function deleteTestUser(email: string) {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers();
  const user = data.users.find((u) => u.email === email);
  if (user) await admin.auth.admin.deleteUser(user.id);
}
