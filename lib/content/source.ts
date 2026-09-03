import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

// Fuente de contenido cruda: disco en local, API de contenidos de GitHub en
// remoto. Deliberadamente NUNCA raw.githubusercontent.com - tiene una cache
// de CDN de 5 min propia que confunde la invalidacion por webhook, como
// descubrio el spike de ADR-001 (ver docs/adr/ADR-001-estrategia-contenido.md).

// CONTENT_SOURCE=local es exclusivamente para desarrollo (ADR-002); en
// despliegues reales siempre es "github", asi que esta lectura de disco
// nunca se ejecuta en produccion. Se ignora del trazado de Turbopack para
// no arrastrar el repo entero al bundle de la funcion serverless.
function localPath(relativePath: string): string {
  return path.join(/* turbopackIgnore: true */ process.cwd(), env.CONTENT_PATH, relativePath);
}

function githubContentsUrl(relativePath: string, ref: string): string {
  return `https://api.github.com/repos/${env.CONTENT_GITHUB_OWNER}/${env.CONTENT_GITHUB_REPO}/contents/${relativePath}?ref=${encodeURIComponent(ref)}`;
}

export async function readContentFile(relativePath: string, ref = "main"): Promise<string> {
  if (env.CONTENT_SOURCE === "local") {
    return readFile(/* turbopackIgnore: true */ localPath(relativePath), "utf8");
  }

  const res = await fetch(githubContentsUrl(relativePath, ref), {
    headers: { Accept: "application/vnd.github.raw+json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`No se pudo leer ${relativePath}@${ref} de docentia-contenidos: HTTP ${res.status}`);
  }
  return res.text();
}

export async function listContentDir(relativePath: string, ref = "main"): Promise<string[]> {
  if (env.CONTENT_SOURCE === "local") {
    return readdir(/* turbopackIgnore: true */ localPath(relativePath));
  }

  const res = await fetch(githubContentsUrl(relativePath, ref), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`No se pudo listar ${relativePath}@${ref} de docentia-contenidos: HTTP ${res.status}`);
  }
  const entries = (await res.json()) as Array<{ name: string }>;
  return entries.map((entry) => entry.name);
}
