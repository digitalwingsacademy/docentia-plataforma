import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { env } from "@/lib/env";

// Cliente con la service_role key: SOLO para tareas administrativas
// explicitas y auditadas (alta de organizaciones, scripts de seed/sync de
// contenido). Nunca se usa para servir una peticion de usuario (ADR-007).
export function createAdminClient() {
  return createSupabaseClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
