"use client";

import { useEffect, useRef, useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { submitActivity } from "@/lib/actions/progress";
import { createClient } from "@/lib/supabase/client";
import type { GrabacionAudioYml } from "@/lib/content/schema";
import "./grabacion-audio.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

const BUCKET = "audio-recordings";

interface Props {
  actividad: GrabacionAudioYml;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

type Fase = "preparacion" | "lista" | "grabando" | "subiendo" | "enviado" | "error";

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0M12 19v3" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}

export function GrabacionAudio({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const [fase, setFase] = useState<Fase>(actividad.preparacionSegundos > 0 ? "preparacion" : "lista");
  const [segundos, setSegundos] = useState(actividad.preparacionSegundos > 0 ? actividad.preparacionSegundos : actividad.duracionGrabacionSegundos);
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const segundosGrabadosRef = useRef(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // No resetea `segundos`: el llamador es responsable de dejarlo en el valor
  // de partida antes de invocar esto (evita un setState sincrono dentro del
  // cuerpo del efecto de montaje, que dispara cascading-renders en React).
  function iniciarIntervalo(alTerminar: () => void) {
    intervalRef.current = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          alTerminar();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function saltarPreparacion() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setFase("lista");
  }

  useEffect(() => {
    if (fase === "preparacion") iniciarIntervalo(() => setFase("lista"));
  }, [fase]);

  async function empezarGrabacion() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      segundosGrabadosRef.current = 0;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        void subirGrabacion(new Blob(chunksRef.current, { type: mimeType || "audio/webm" }));
      };

      recorderRef.current = recorder;
      recorder.start();
      setFase("grabando");
      setSegundos(actividad.duracionGrabacionSegundos);
      iniciarIntervalo(() => {
        segundosGrabadosRef.current = actividad.duracionGrabacionSegundos;
        recorder.stop();
      });
    } catch {
      setError("No se pudo acceder al micrófono. Revisa los permisos del navegador e inténtalo de nuevo.");
      setFase("error");
    }
  }

  function detenerGrabacion() {
    if (!recorderRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    segundosGrabadosRef.current = actividad.duracionGrabacionSegundos - segundos;
    recorderRef.current.stop();
  }

  async function subirGrabacion(blob: Blob) {
    setFase("subiendo");
    try {
      const supabase = createClient();
      const path = `${enrollmentId}/${sectionId}.webm`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, blob, {
        upsert: true,
        contentType: blob.type || "audio/webm",
      });
      if (uploadError) throw uploadError;

      const { data: signed, error: signedError } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
      if (signedError) throw signedError;
      setPlaybackUrl(signed.signedUrl);

      await submitActivity({
        enrollmentId,
        sectionId,
        durationMinutes,
        payload: { tipo: "grabacion-audio", storagePath: path, duracionSegundos: segundosGrabadosRef.current },
      });
      setFase("enviado");
    } catch {
      setError("No se pudo subir la grabación. Comprueba tu conexión e inténtalo de nuevo.");
      setFase("error");
    }
  }

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Grabación de audio</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      {error && <p className="ga-error">{error}</p>}

      {fase === "preparacion" && (
        <>
          <p className="rh-section-label">Notas de preparación (no se guardan)</p>
          <textarea
            className="ga-notes"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="¿Cuándo? ¿Dónde? ¿Qué pasó? ¿Cómo te sentiste?"
          />
          <div className="ga-timer-row">
            <div className="ga-timer">
              <span className="ga-timer-num">{segundos}</span>
              <span className="ga-timer-label">preparación</span>
            </div>
          </div>
          <div className="rh-actions">
            <button type="button" className="rh-btn rh-btn-secondary" onClick={saltarPreparacion}>
              Empezar ya
            </button>
          </div>
        </>
      )}

      {(fase === "lista" || fase === "grabando" || fase === "error") && (
        <>
          <div className="ga-timer-row">
            <div className="ga-timer">
              <span className="ga-timer-num">{fase === "grabando" ? segundos : actividad.duracionGrabacionSegundos}</span>
              <span className="ga-timer-label">segundos</span>
            </div>
          </div>
          <div className="rh-actions">
            {fase === "grabando" ? (
              <button type="button" className="rh-btn rh-btn-primary ga-record-btn ga-recording" onClick={detenerGrabacion}>
                <StopIcon />
                Detener grabación
              </button>
            ) : (
              <button type="button" className="rh-btn rh-btn-primary ga-record-btn" onClick={empezarGrabacion}>
                <MicIcon />
                Empezar grabación
              </button>
            )}
          </div>
        </>
      )}

      {fase === "subiendo" && (
        <div className="rh-feedback">
          <p className="rh-feedback-msg">
            <strong>Subiendo tu grabación…</strong>
          </p>
        </div>
      )}

      {fase === "enviado" && (
        <>
          {playbackUrl && (
            <div className="ga-player">
              <audio controls src={playbackUrl} />
            </div>
          )}
          <div className="rh-feedback">
            <div className="rh-feedback-icon">
              <MicIcon />
            </div>
            <p className="rh-feedback-msg">
              <strong>Grabación enviada.</strong> Tu coordinador podrá escucharla en el panel del claustro.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
