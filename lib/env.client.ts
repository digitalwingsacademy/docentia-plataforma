import { z } from "zod";

// En un fichero aparte de proposito (no solo un export distinto dentro de
// env.ts): importar cualquier cosa de un modulo evalua el modulo entero, asi
// que si "clientEnv" viviera junto a "env" (con variables server-only), un
// componente cliente que solo necesita clientEnv arrastraria igualmente la
// validacion de los secretos de servidor y fallaria con "undefined" en el
// navegador. Cualquier fichero con "use client" importa SOLO este modulo.
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("Falta NEXT_PUBLIC_SUPABASE_URL. Sácalo de Supabase → Project Settings → API → Project URL."),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Supabase → Project Settings → API → Publishable key."),
  NEXT_PUBLIC_MUX_DATA_ENV_KEY: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;

function loadClientEnv(): ClientEnv {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_MUX_DATA_ENV_KEY: process.env.NEXT_PUBLIC_MUX_DATA_ENV_KEY,
  });
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Configuración de entorno inválida (cliente). Revisa tu .env.local:\n${details}`);
  }
  return parsed.data;
}

export const clientEnv = loadClientEnv();
