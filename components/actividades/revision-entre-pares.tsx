"use client";

import { useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { submitActivity } from "@/lib/actions/progress";
import type { RevisionEntreParesYml } from "@/lib/content/schema";
import { CheckIcon } from "./shared";
import "./revision-entre-pares.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: RevisionEntreParesYml;
  criterios: string[];
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

export function RevisionEntrePares({ actividad, criterios, enrollmentId, sectionId, durationMinutes }: Props) {
  const [marcados, setMarcados] = useState<Set<number>>(new Set());
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<{ marcados: number; comentario: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cumpleMinimo = marcados.size >= actividad.minimoCriteriosMarcados;
  const cumpleComentario = !actividad.comentarioObligatorio || comentario.trim().length > 0;
  const puedeEnviar = cumpleMinimo && cumpleComentario && !enviando;

  function toggle(i: number) {
    setMarcados((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function handleSubmit() {
    setEnviando(true);
    setError(null);
    try {
      await submitActivity({
        enrollmentId,
        sectionId,
        durationMinutes,
        payload: { tipo: "revision-entre-pares", criteriosMarcados: [...marcados].map((i) => criterios[i]), comentario },
      });
      setEnviado({ marcados: marcados.size, comentario });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Revisión entre pares</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      {enviado ? (
        <>
          <p className="rh-section-label">Tu comentario</p>
          <div className="fo-submitted">{enviado.comentario}</div>
          <div className="rh-feedback">
            <div className="rh-feedback-icon">
              <SendIcon />
            </div>
            <p className="rh-feedback-msg">
              <strong>Enviado.</strong> {enviado.marcados} criterios marcados.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="rp-checklist">
            {criterios.map((criterio, i) => {
              const marcado = marcados.has(i);
              return (
                <button key={i} type="button" className={`rp-criterio${marcado ? " rp-marcado" : ""}`} onClick={() => toggle(i)}>
                  <span className="rp-check">{marcado && <CheckIcon />}</span>
                  {criterio}
                </button>
              );
            })}
          </div>
          <p className="rp-contador">
            Marcados: {marcados.size} / {criterios.length} (mínimo {actividad.minimoCriteriosMarcados})
          </p>

          <div className="fo-field">
            <label className="fo-label" htmlFor="rp-comentario">
              Comentario constructivo
            </label>
            <textarea
              id="rp-comentario"
              className="fo-textarea"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="2–3 frases de feedback positivo + 1–2 sugerencias..."
              style={{ minHeight: 100 }}
            />
          </div>

          {error && (
            <p className="rh-section-label" style={{ color: "var(--rh-error)" }}>
              {error}
            </p>
          )}

          <div className="rh-actions">
            <button type="button" className="rh-btn rh-btn-primary" disabled={!puedeEnviar} onClick={handleSubmit}>
              <SendIcon />
              {enviando ? "Enviando…" : "Enviar revisión"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
