"use client";

import { useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { submitActivity } from "@/lib/actions/progress";
import { calcularMedia, mensajeAutoevaluacion } from "@/lib/domain/autoevaluacion";
import type { AutoevaluacionDescriptoresYml } from "@/lib/content/schema";
import "./autoevaluacion-descriptores.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: AutoevaluacionDescriptoresYml;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

export function AutoevaluacionDescriptores({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ media: number; mensaje: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const niveles: number[] = [];
  for (let n = actividad.escala.min; n <= actividad.escala.max; n++) niveles.push(n);

  const todasRespondidas = actividad.descriptores.every((d) => respuestas[String(d.id)] !== undefined);

  async function handleSubmit() {
    setEnviando(true);
    setError(null);
    try {
      await submitActivity({
        enrollmentId,
        sectionId,
        durationMinutes,
        payload: { tipo: "autoevaluacion-descriptores", respuestas },
      });
      const media = calcularMedia(Object.values(respuestas));
      setResultado({ media, mensaje: mensajeAutoevaluacion(media, actividad.escala.max) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Autoevaluación</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      {resultado ? (
        <div className="ad-resultado">
          <div className="ad-resultado-media">
            {resultado.media}/{actividad.escala.max}
          </div>
          <p className="ad-resultado-msg">{resultado.mensaje}</p>
        </div>
      ) : (
        <>
          <div className="ad-filas">
            {actividad.descriptores.map((d, index) => {
              const id = String(d.id);
              return (
                <div key={id} className="ad-fila">
                  <span className="ad-texto">
                    {index + 1}. {d.texto}
                  </span>
                  <div className="ad-escala">
                    {niveles.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`ad-nivel${respuestas[id] === n ? " ad-seleccionado" : ""}`}
                        onClick={() => setRespuestas((prev) => ({ ...prev, [id]: n }))}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {error && (
            <p className="rh-section-label" style={{ color: "var(--rh-error)" }}>
              {error}
            </p>
          )}

          <div className="rh-actions">
            <button type="button" className="rh-btn rh-btn-primary" disabled={!todasRespondidas || enviando} onClick={handleSubmit}>
              {enviando ? "Guardando…" : "Guardar autoevaluación"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
