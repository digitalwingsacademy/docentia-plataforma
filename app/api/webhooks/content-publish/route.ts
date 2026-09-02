import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { SPIKE_CONTENT_TAG } from "@/lib/spike-content";

function isValidSignature(payload: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signatureHeader);
  // timingSafeEqual lanza si los buffers tienen longitud distinta, así que se
  // comprueba antes en vez de dejar que la excepción escape como un 500.
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: NextRequest) {
  const secret = process.env.CONTENT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CONTENT_WEBHOOK_SECRET no configurado" }, { status: 500 });
  }

  // Se lee como texto crudo (no .json()) porque la firma HMAC de GitHub se
  // calcula sobre los bytes exactos del body, antes de cualquier parseo.
  const payload = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!isValidSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Firma invalida" }, { status: 401 });
  }

  // Next 16 exige un segundo argumento: el perfil de cacheLife que tendrá la
  // entrada una vez refrescada. "max" porque aquí el ciclo de vida lo marca
  // el webhook (evento), no un TTL — justo lo que evita el spike.
  revalidateTag(SPIKE_CONTENT_TAG, "max");

  return NextResponse.json({
    revalidated: true,
    tag: SPIKE_CONTENT_TAG,
    now: new Date().toISOString(),
  });
}
