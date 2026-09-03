/**
 * Registra un asset de Mux ya creado en el manifiesto video_assets, para que
 * <Video id="..." /> pueda resolverlo (ADR-003). Uso:
 *   tsx --env-file=.env.local scripts/register-video-asset.ts <logical_id> <asset_id> <playback_id> [duration_seconds]
 */
import Mux from "@mux/mux-node";
import { createAdminClient } from "../lib/supabase/admin";

async function main() {
  const [logicalId, assetId, playbackId, durationArg] = process.argv.slice(2);
  if (!logicalId || !assetId || !playbackId) {
    console.error("Uso: register-video-asset <logical_id> <asset_id> <playback_id> [duration_seconds]");
    process.exit(1);
  }

  let durationSeconds = durationArg ? Number(durationArg) : null;

  if (!durationSeconds) {
    const mux = new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET });
    const asset = await mux.video.assets.retrieve(assetId);
    durationSeconds = asset.duration ? Math.round(asset.duration) : null;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("video_assets").upsert({
    logical_id: logicalId,
    provider: "mux",
    provider_asset_id: assetId,
    playback_id: playbackId,
    duration_seconds: durationSeconds,
    captions: [],
  });

  if (error) throw error;
  console.log(`Registrado: ${logicalId} -> mux:${assetId} (playback ${playbackId}, ${durationSeconds}s)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
