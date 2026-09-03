import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { contentTag } from "@/lib/content/course";
import { syncCourse } from "@/lib/content/sync-course";
import { env } from "@/lib/env";

function isValidSignature(payload: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signatureHeader);
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

interface GithubPushPayload {
  ref: string;
  after: string;
  commits: Array<{ added: string[]; modified: string[]; removed: string[] }>;
}

// Deriva que cursos ha tocado el push mirando las rutas cambiadas
// (cursos/<slug>/...), en vez de invalidar siempre todo el contenido.
function extractCourseSlugs(payload: GithubPushPayload): string[] {
  const slugs = new Set<string>();
  for (const commit of payload.commits ?? []) {
    for (const filePath of [...commit.added, ...commit.modified, ...commit.removed]) {
      const match = /^cursos\/([^/]+)\//.exec(filePath);
      const slug = match?.[1];
      if (slug) slugs.add(slug);
    }
  }
  return [...slugs];
}

export async function POST(request: NextRequest) {
  const payloadText = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!isValidSignature(payloadText, signature, env.CONTENT_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Firma invalida" }, { status: 401 });
  }

  if (request.headers.get("x-github-event") === "ping") {
    return NextResponse.json({ pong: true });
  }

  const payload = JSON.parse(payloadText) as GithubPushPayload;
  if (payload.ref !== "refs/heads/main") {
    return NextResponse.json({ skipped: true, reason: "rama distinta de main" });
  }

  const slugs = extractCourseSlugs(payload);
  const synced = [];

  for (const slug of slugs) {
    // Se resuelve por el SHA exacto del commit (payload.after), no por
    // "main": es contenido inmutable y evita la cache de 5 min de GitHub que
    // confundio las pruebas del spike (ADR-001). El bump de `version` real
    // (cambios estructurales) lo decide el propio autor en curso.yml.
    revalidateTag(contentTag(slug), "max");
    try {
      synced.push(await syncCourse(slug, payload.after));
    } catch (error) {
      console.error(`No se pudo sincronizar metadatos del curso ${slug}`, error);
    }
  }

  return NextResponse.json({ revalidated: slugs, synced });
}
