"use client";

import { useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { markSectionAsRead } from "@/lib/actions/progress";
import { gradeCorreccionErrores, parseFraseError } from "@/lib/domain/correccion-errores";
import type { CorreccionErroresYml } from "@/lib/content/schema";
import { CheckIcon, CrossIcon } from "./shared";
import "./correccion-errores.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: CorreccionErroresYml;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

export function CorreccionErrores({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<"editando" | "corregido">("editando");
  const [intentos, setIntentos] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [resultado, setResultado] = useState<ReturnType<typeof gradeCorreccionErrores> | null>(null);

  const maximos = actividad.reintentos.maximos;
  const sinIntentos = maximos !== "ilimitado" && intentos >= maximos;
  const todasCompletas = actividad.frases.every((f) => respuestas[String(f.id)]?.trim());

  function handleComprobar() {
    const result = gradeCorreccionErrores(actividad.frases, respuestas);
    setResultado(result);
    setEstado("corregido");
    setIntentos((n) => n + 1);
    if (!completado) {
      setCompletado(true);
      void markSectionAsRead({ enrollmentId, sectionId, durationMinutes });
    }
  }

  function handleReiniciar() {
    setRespuestas({});
    setResultado(null);
    setEstado("editando");
  }

  const mensaje = resultado
    ? resultado.puntuacion >= 80
      ? "¡Muy bien!"
      : resultado.puntuacion >= 50
        ? "Vas bien, revisa las frases en rojo."
        : "Repasa la referencia de gramática antes de reintentar."
    : "";

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Corrección de errores</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      <div className="ce-frases">
        {actividad.frases.map((frase, index) => {
          const id = String(frase.id);
          const segmentos = parseFraseError(frase.texto);
          const res = resultado?.resultados[id];
          const inputClase = `ce-input${res ? (res.correcto ? " ce-ok" : " ce-bad") : ""}`;

          return (
            <div key={id} className="ce-frase">
              <p className="ce-texto">
                {index + 1}.{" "}
                {segmentos.map((seg, i) =>
                  seg.tipo === "error" ? (
                    <span key={i} className="ce-error">
                      {seg.valor}
                    </span>
                  ) : (
                    <span key={i}>{seg.valor}</span>
                  )
                )}
              </p>
              <div className="ce-input-row">
                <label className="ce-label" htmlFor={`ce-${id}`}>
                  Corrección:
                </label>
                <input
                  id={`ce-${id}`}
                  type="text"
                  className={inputClase}
                  value={respuestas[id] ?? ""}
                  disabled={estado === "corregido"}
                  onChange={(e) => setRespuestas((prev) => ({ ...prev, [id]: e.target.value }))}
                  placeholder="Escribe la forma correcta"
                />
                {res && (res.correcto ? <CheckIcon /> : <CrossIcon />)}
              </div>
              {res && !res.correcto && frase.pista && actividad.reintentos.mostrarSolucionAl !== "nunca" && (
                <p className="rh-section-label" style={{ marginTop: "0.5rem" }}>
                  <strong>{res.respuestaCorrecta}</strong> — {frase.pista}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rh-actions">
        {estado === "editando" ? (
          <button type="button" className="rh-btn rh-btn-primary" disabled={!todasCompletas || sinIntentos} onClick={handleComprobar}>
            <CheckIcon />
            Comprobar
          </button>
        ) : (
          <button type="button" className="rh-btn rh-btn-secondary" disabled={sinIntentos} onClick={handleReiniciar}>
            Reiniciar
          </button>
        )}
      </div>

      {resultado && (
        <div className="rh-feedback">
          <div className="rh-feedback-icon">
            <CheckIcon />
          </div>
          <div className="rh-feedback-score">
            {Object.values(resultado.resultados).filter((r) => r.correcto).length}/{resultado.total}
          </div>
          <p className="rh-feedback-msg">
            <strong>{mensaje}</strong> {sinIntentos ? "No quedan más intentos." : "Pulsa reiniciar para volver a intentarlo."}
          </p>
        </div>
      )}
    </div>
  );
}
