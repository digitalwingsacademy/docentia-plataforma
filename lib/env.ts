import { z } from "zod";

// Server-only. Un componente/fichero "use client" nunca debe importar esto
// — usa lib/env.client.ts, que vive aparte por eso mismo (ver el comentario
// de ese fichero).
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("Falta NEXT_PUBLIC_SUPABASE_URL. Sácalo de Supabase → Project Settings → API → Project URL."),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Supabase → Project Settings → API → Publishable key."),
  SUPABASE_SECRET_KEY: z
    .string()
    .min(1, "Falta SUPABASE_SECRET_KEY. Supabase → Project Settings → API → Secret key. NUNCA la expongas al cliente."),

  CONTENT_SOURCE: z.enum(["local", "github"]).default("local"),
  CONTENT_PATH: z.string().default("../docentia-contenidos"),
  CONTENT_GITHUB_OWNER: z.string().default("digitalwingsacademy"),
  CONTENT_GITHUB_REPO: z.string().default("docentia-contenidos"),
  CONTENT_WEBHOOK_SECRET: z
    .string()
    .min(1, "Falta CONTENT_WEBHOOK_SECRET. Debe coincidir con el secreto configurado en el webhook de GitHub."),

  MUX_TOKEN_ID: z.string().min(1, "Falta MUX_TOKEN_ID. Mux → Settings → Access Tokens."),
  MUX_TOKEN_SECRET: z.string().min(1, "Falta MUX_TOKEN_SECRET. Mux → Settings → Access Tokens."),
  // Firma URLs de reproducción (ADR-003: "URLs firmadas, no enlaces libres").
  MUX_SIGNING_KEY_ID: z.string().min(1, "Falta MUX_SIGNING_KEY_ID. Mux → Settings → Signing Keys."),
  MUX_SIGNING_KEY_PRIVATE: z
    .string()
    .min(1, "Falta MUX_SIGNING_KEY_PRIVATE. Se muestra una sola vez al crear la signing key en Mux."),
  NEXT_PUBLIC_MUX_DATA_ENV_KEY: z.string().optional(),

  // Opcionales: si no existen, los botones de SSO correspondientes no se muestran (ADR-006).
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  AZURE_OAUTH_CLIENT_ID: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(
      `Configuración de entorno inválida. Revisa tu .env.local (copia .env.example si no existe):\n${details}`
    );
  }
  return parsed.data;
}

// Validado una vez al importar, en vez de en cada request: si falta algo, la
// app falla al arrancar con un mensaje claro en vez de un error críptico de
// conexión más adelante (requisito explícito de la sección 2 del encargo).
export const env = loadEnv();
