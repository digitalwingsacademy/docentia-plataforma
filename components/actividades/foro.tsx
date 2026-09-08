"use client";

import { useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { submitActivity } from "@/lib/actions/progress";
import { contarPalabras } from "@/lib/domain/conteo-palabras";
import type { ForoYml } from "@/lib/content/schema";
import "./foro.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: ForoYml;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13M22 2 15 22l-4-9-9-4Z" />
    </svg>
  );
}

export function Foro({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const [publicacion, setPublicacion] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<{ publicacion: string; respuesta: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const palabras = contarPalabras(publicacion);
  const cumpleMinimo = palabras >= actividad.palabrasMinimasPublicacion;
  const cumpleRespuesta = !actividad.requiereRespuesta || respuesta.trim().length > 0;
  const puedeEnviar = cumpleMinimo && cumpleRespuesta && !enviando;

  async function handleSubmit() {
    setEnviando(true);
    setError(null);
    try {
      await submitActivity({
        enrollmentId,
        sectionId,
        durationMinutes,
        payload: { tipo: "foro", publicacion, respuesta },
      });
      setEnviado({ publicacion, respuesta });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo publicar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Foro</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      {enviado ? (
        <>
          <p className="rh-section-label">Tu publicación</p>
          <div className="fo-submitted">{enviado.publicacion}</div>
          {actividad.requiereRespuesta && (
            <>
              <p className="rh-section-label" style={{ marginTop: "1.2rem" }}>
                Tu respuesta
              </p>
              <div className="fo-submitted">{enviado.respuesta}</div>
            </>
          )}
          <div className="rh-feedback">
            <div className="rh-feedback-icon">
              <SendIcon />
            </div>
            <p className="rh-feedback-msg">
              <strong>Publicado.</strong> Tu coordinador podrá verlo en el panel del claustro.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="fo-field">
            <label className="fo-label" htmlFor="fo-publicacion">
              Tu publicación
            </label>
            <textarea
              id="fo-publicacion"
              className="fo-textarea"
              value={publicacion}
              onChange={(e) => setPublicacion(e.target.value)}
              placeholder="Escribe aquí..."
            />
            <div className={`fo-counter${cumpleMinimo ? " fo-ok" : ""}`}>
              <span>Mínimo {actividad.palabrasMinimasPublicacion} palabras</span>
              <span>{palabras} palabras</span>
            </div>
          </div>

          {actividad.requiereRespuesta && (
            <div className="fo-field">
              <label className="fo-label" htmlFor="fo-respuesta">
                Responde a un compañero con una pregunta
              </label>
              <textarea
                id="fo-respuesta"
                className="fo-textarea fo-reply"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                placeholder="Escribe tu respuesta..."
              />
            </div>
          )}

          {error && (
            <p className="rh-section-label" style={{ color: "var(--rh-error)" }}>
              {error}
            </p>
          )}

          <div className="rh-actions">
            <button type="button" className="rh-btn rh-btn-primary" disabled={!puedeEnviar} onClick={handleSubmit}>
              <SendIcon />
              {enviando ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
