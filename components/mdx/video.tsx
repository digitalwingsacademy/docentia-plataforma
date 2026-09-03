import { resolveVideo } from "@/lib/video/playback";
import { VideoPlayerClient } from "@/components/video-player-client";
import { env } from "@/lib/env";

export interface VideoSectionProps {
  id: string;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

// Server component: <Video id="..." /> en el MDX se sustituye en la pagina
// de la leccion por esta version ligada al enrollment/seccion actuales (ver
// app/cursos/[slug]/[unidad]/[seccion]/page.tsx).
export async function VideoSection({ id, enrollmentId, sectionId, durationMinutes }: VideoSectionProps) {
  const video = await resolveVideo(id);

  if (!video) {
    return (
      <p className="my-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
        Vídeo no disponible (&quot;{id}&quot; no está registrado en el manifiesto).
      </p>
    );
  }

  return (
    <VideoPlayerClient
      playbackId={video.playbackId}
      signedToken={video.signedToken}
      enrollmentId={enrollmentId}
      sectionId={sectionId}
      durationMinutes={durationMinutes}
      envKey={env.NEXT_PUBLIC_MUX_DATA_ENV_KEY}
    />
  );
}
