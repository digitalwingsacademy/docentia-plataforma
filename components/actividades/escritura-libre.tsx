"use client";

import { useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { submitActivity } from "@/lib/actions/progress";
import { clasificarConteo, contarPalabras } from "@/lib/domain/conteo-palabras";
import type { EscrituraLibreYml } from "@/lib/content/schema";
import "./escritura-libre.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: EscrituraLibreYml;
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

export function EscrituraLibre({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const [promptId, setPromptId] = useState<string | null>(actividad.opcionesPrompt ? null : "");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<{ texto: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const palabras = contarPalabras(texto);
  const clasificacion = clasificarConteo(palabras, actividad.palabrasObjetivo.min, actividad.palabrasObjetivo.max);
  const cumpleMinimo = palabras >= actividad.palabrasMinimasEnvio;
  const promptElegido = actividad.opcionesPrompt?.find((p) => p.id === promptId);
  const puedeEnviar = cumpleMinimo && promptId !== null && !enviando;

  async function handleSubmit() {
    setEnviando(true);
    setError(null);
    try {
      await submitActivity({
        enrollmentId,
        sectionId,
        durationMinutes,
        payload: { tipo: "escritura-libre", promptId, texto },
      });
      setEnviado({ texto });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Escritura libre</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      {enviado ? (
        <>
          {promptElegido && <p className="rh-section-label">{promptElegido.texto}</p>}
          <div className="fo-submitted">{enviado.texto}</div>
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
          {actividad.opcionesPrompt && (
            <div className="el-prompts">
              {actividad.opcionesPrompt.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`el-prompt${promptId === p.id ? " el-prompt-selected" : ""}`}
                  onClick={() => setPromptId(p.id)}
                >
                  {p.texto}
                </button>
              ))}
            </div>
          )}

          {actividad.incluirLista && (
            <>
              <p className="rh-section-label">Incluye</p>
              <ul className="el-lista">
                {actividad.incluirLista.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}

          <div className="fo-field">
            <textarea
              className="fo-textarea"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe aquí..."
              style={{ minHeight: 200 }}
            />
            <div className={`fo-counter el-${clasificacion}`}>
              <span>
                Objetivo: {actividad.palabrasObjetivo.min}–{actividad.palabrasObjetivo.max} palabras (mínimo para enviar:{" "}
                {actividad.palabrasMinimasEnvio})
              </span>
              <span>{palabras} palabras</span>
            </div>
          </div>

          {error && (
            <p className="rh-section-label" style={{ color: "var(--rh-error)" }}>
              {error}
            </p>
          )}

          <div className="rh-actions">
            <button type="button" className="rh-btn rh-btn-primary" disabled={!puedeEnviar} onClick={handleSubmit}>
              <SendIcon />
              {enviando ? "Enviando…" : "Enviar"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
