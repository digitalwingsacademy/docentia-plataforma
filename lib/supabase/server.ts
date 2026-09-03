import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { env } from "@/lib/env";

// Cliente para Server Components/Server Actions/Route Handlers: usa el
// contexto de usuario autenticado (nunca la service_role) para que RLS se
// aplique como a cualquier otra peticion (ADR-007).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Se llama desde un Server Component sin poder escribir cookies;
          // el middleware ya se encarga de refrescar la sesion en ese caso.
        }
      },
    },
  });
}
