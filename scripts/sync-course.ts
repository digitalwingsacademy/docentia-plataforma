/**
 * Sincroniza manualmente los metadatos de un curso (uso en desarrollo o para
 * forzar una resincronizacion). En produccion esto lo hace el webhook.
 * Uso: tsx --env-file=.env.local scripts/sync-course.ts <slug> [ref]
 */
import { syncCourse } from "../lib/content/sync-course";

async function main() {
  const [slug, ref = "main"] = process.argv.slice(2);
  if (!slug) {
    console.error("Uso: sync-course <slug> [ref]");
    process.exit(1);
  }
  const result = await syncCourse(slug, ref);
  console.log("Sincronizado:", result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
