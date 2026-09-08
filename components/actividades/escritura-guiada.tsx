"use client";

import { useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { submitActivity } from "@/lib/actions/progress";
import type { EscrituraGuiadaYml } from "@/lib/content/schema";
import "./escritura-guiada.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: EscrituraGuiadaYml;
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

export function EscrituraGuiada({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const [textos, setTextos] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const todasCompletas = actividad.secciones.every((s) => textos[s.id]?.trim());

  async function handleSubmit() {
    setEnviando(true);
    setError(null);
    try {
      await submitActivity({
        enrollmentId,
        sectionId,
        durationMinutes,
        payload: { tipo: "escritura-guiada", secciones: textos },
      });
      setEnviado(textos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Escritura guiada</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      {enviado ? (
        <>
          {actividad.secciones.map((s) => (
            <div key={s.id} style={{ marginBottom: "1rem" }}>
              <p className="eg-seccion-titulo">{s.titulo}</p>
              <div className="fo-submitted">{enviado[s.id]}</div>
            </div>
          ))}
          <div className="rh-feedback">
            <div className="rh-feedback-icon">
              <SendIcon />
            </div>
            <p className="rh-feedback-msg">
              <strong>Enviado.</strong> Tu coordinador podrá leerlo en el panel del claustro.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="eg-secciones">
            {actividad.secciones.map((s) => (
              <div key={s.id}>
                <p className="eg-seccion-titulo">{s.titulo}</p>
                <p className="eg-seccion-guia">{s.guia}</p>
                <textarea
                  className="fo-textarea"
                  value={textos[s.id] ?? ""}
                  onChange={(e) => setTextos((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  placeholder={s.placeholder}
                  style={{ minHeight: 110 }}
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="rh-section-label" style={{ color: "var(--rh-error)" }}>
              {error}
            </p>
          )}

          <div className="rh-actions">
            <button type="button" className="rh-btn rh-btn-primary" disabled={!todasCompletas || enviando} onClick={handleSubmit}>
              <SendIcon />
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
