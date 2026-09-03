import Mux from "@mux/mux-node";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const mux = new Mux({ tokenId: env.MUX_TOKEN_ID, tokenSecret: env.MUX_TOKEN_SECRET });

export interface ResolvedVideo {
  playbackId: string;
  signedToken: string;
  durationSeconds: number | null;
}

/**
 * Resuelve un <Video id="..." /> del contenido a su playback real (ADR-003):
 * lee el manifiesto video_assets y firma un token de reproduccion de corta
 * duracion, para que la URL no se pueda compartir indefinidamente.
 */
export async function resolveVideo(logicalId: string): Promise<ResolvedVideo | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("video_assets")
    .select("playback_id, duration_seconds")
    .eq("logical_id", logicalId)
    .maybeSingle();

  if (!data) return null;

  const signedToken = await mux.jwt.signPlaybackId(data.playback_id, {
    keyId: env.MUX_SIGNING_KEY_ID,
    keySecret: env.MUX_SIGNING_KEY_PRIVATE,
    expiration: "6h",
  });

  return { playbackId: data.playback_id, signedToken, durationSeconds: data.duration_seconds };
}
