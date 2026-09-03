"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useRef } from "react";
import { recordSectionProgress } from "@/lib/actions/progress";

interface Props {
  playbackId: string;
  signedToken: string;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
  envKey?: string;
}

// Checkpoints periodicos (no solo el evento "ended"): asi cuenta el progreso
// aunque el usuario haga scrubbing hacia el final, tal como pide ADR-005.
const CHECKPOINT_SECONDS = 15;

export function VideoPlayerClient({ playbackId, signedToken, enrollmentId, sectionId, durationMinutes, envKey }: Props) {
  const lastReported = useRef(0);

  function reportPercent(percent: number) {
    if (percent - lastReported.current < 5 && percent < 100) return;
    lastReported.current = percent;
    void recordSectionProgress({ enrollmentId, sectionId, percent, durationMinutes });
  }

  return (
    <MuxPlayer
      playbackId={playbackId}
      tokens={{ playback: signedToken }}
      envKey={envKey}
      metadata={{ video_id: sectionId }}
      streamType="on-demand"
      onTimeUpdate={(event) => {
        const video = event.target as HTMLVideoElement;
        if (!video.duration) return;
        const percent = (video.currentTime / video.duration) * 100;
        if (Math.floor(video.currentTime) % CHECKPOINT_SECONDS === 0) {
          reportPercent(percent);
        }
      }}
      onEnded={() => reportPercent(100)}
      className="aspect-video w-full rounded-md"
    />
  );
}
