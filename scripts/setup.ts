/**
 * npm run setup — configuracion guiada de desarrollo local (idempotente).
 * Copia .env.example -> .env.local si falta, pregunta por lo que no este
 * relleno explicando de donde sacarlo, enlaza el proyecto de Supabase de
 * dev, aplica migraciones + seed, y genera los tipos TypeScript.
 */
import { existsSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { execSync } from "node:child_process";

const ENV_LOCAL = ".env.local";
const ENV_EXAMPLE = ".env.example";

const HINTS: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: "Supabase → tu proyecto de dev → Project Settings → API → Project URL",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "Supabase → Project Settings → API → Publishable key",
  SUPABASE_SECRET_KEY: "Supabase → Project Settings → API → Secret key (no la compartas)",
  CONTENT_WEBHOOK_SECRET: "Cualquier cadena aleatoria larga; debe coincidir con el webhook de GitHub en docentia-contenidos",
  MUX_TOKEN_ID: "Mux → Settings → Access Tokens",
  MUX_TOKEN_SECRET: "Mux → Settings → Access Tokens (se muestra una sola vez al crearlo)",
};

const REQUIRED_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "CONTENT_WEBHOOK_SECRET",
  "MUX_TOKEN_ID",
  "MUX_TOKEN_SECRET",
];

function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    const key = match?.[1];
    if (key !== undefined) result[key] = match?.[2] ?? "";
  }
  return result;
}

function serializeEnvFile(original: string, values: Record<string, string>): string {
  const lines = original.split("\n").map((line) => {
    const key = /^([A-Z0-9_]+)=/.exec(line)?.[1];
    if (key !== undefined && key in values) {
      return `${key}=${values[key]}`;
    }
    return line;
  });
  return lines.join("\n");
}

async function main() {
  if (!existsSync(ENV_LOCAL)) {
    copyFileSync(ENV_EXAMPLE, ENV_LOCAL);
    console.log(`Creado ${ENV_LOCAL} a partir de ${ENV_EXAMPLE}.`);
  }

  const raw = readFileSync(ENV_LOCAL, "utf8");
  const values = parseEnvFile(raw);
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  for (const key of REQUIRED_KEYS) {
    if (!values[key]) {
      const hint = HINTS[key] ?? "";
      const answer = await rl.question(`${key} (${hint}): `);
      values[key] = answer.trim();
    }
  }
  rl.close();

  writeFileSync(ENV_LOCAL, serializeEnvFile(raw, values), "utf8");
  console.log(`${ENV_LOCAL} actualizado.`);

  const projectRef = /https:\/\/([a-z0-9]+)\.supabase\.co/.exec(values.NEXT_PUBLIC_SUPABASE_URL ?? "")?.[1];
  if (!projectRef) {
    console.error("No se pudo extraer el project ref de NEXT_PUBLIC_SUPABASE_URL. Revisa el valor.");
    process.exit(1);
  }

  console.log(`Enlazando con el proyecto de Supabase ${projectRef}...`);
  execSync(`supabase link --project-ref ${projectRef}`, { stdio: "inherit" });

  console.log("Aplicando migraciones...");
  execSync("supabase db push", { stdio: "inherit" });

  console.log("Generando tipos TypeScript...");
  execSync("npm run db:types", { stdio: "inherit" });

  console.log("Sembrando datos de desarrollo...");
  execSync("npm run db:seed", { stdio: "inherit" });

  console.log("Sincronizando metadatos del curso de ejemplo...");
  execSync("npm run content:sync -- competencia-digital-docente-nivel-1 main", { stdio: "inherit" });

  console.log("\nListo. Arranca la app con: npm run dev");
}

main().catch((error) => {
  console.error("Setup fallido:", error);
  process.exit(1);
});
