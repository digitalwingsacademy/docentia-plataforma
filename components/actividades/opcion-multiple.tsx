"use client";

import { useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { markSectionAsRead } from "@/lib/actions/progress";
import { gradeOpcionMultiple } from "@/lib/domain/opcion-multiple";
import type { OpcionMultipleYml } from "@/lib/content/schema";
import { CheckIcon, CrossIcon } from "./shared";
import "./opcion-multiple.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: OpcionMultipleYml;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

export function OpcionMultiple({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<"editando" | "corregido">("editando");
  const [intentos, setIntentos] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [resultado, setResultado] = useState<ReturnType<typeof gradeOpcionMultiple> | null>(null);

  const maximos = actividad.reintentos.maximos;
  const sinIntentos = maximos !== "ilimitado" && intentos >= maximos;
  const todasRespondidas = actividad.preguntas.every((p) => respuestas[p.id]);

  function handleComprobar() {
    const result = gradeOpcionMultiple(actividad.preguntas, respuestas);
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
        ? "Vas bien, revisa las preguntas en rojo."
        : "Vuelve a leer el texto antes de reintentar."
    : "";

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Opción múltiple</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      <div className="om-pasaje">{actividad.estimulo.contenido}</div>

      <div className="om-preguntas">
        {actividad.preguntas.map((pregunta, index) => {
          const res = resultado?.resultados[pregunta.id];
          return (
            <fieldset key={pregunta.id}>
              <legend className="om-pregunta-enunciado">
                {index + 1}. {pregunta.enunciado}
              </legend>
              <div className="om-opciones">
                {pregunta.opciones.map((opcion) => {
                  const seleccionada = respuestas[pregunta.id] === opcion.id;
                  let clase = "om-opcion";
                  if (estado === "corregido") {
                    clase += " om-disabled";
                    if (opcion.id === pregunta.respuestaCorrectaId) clase += " om-ok";
                    else if (seleccionada) clase += " om-bad";
                  } else if (seleccionada) {
                    clase += " om-selected";
                  }
                  return (
                    <label key={opcion.id} className={clase}>
                      <input
                        type="radio"
                        name={pregunta.id}
                        checked={seleccionada}
                        disabled={estado === "corregido"}
                        onChange={() => setRespuestas((prev) => ({ ...prev, [pregunta.id]: opcion.id }))}
                      />
                      {opcion.texto}
                      {estado === "corregido" && opcion.id === pregunta.respuestaCorrectaId && <CheckIcon />}
                      {estado === "corregido" && seleccionada && opcion.id !== pregunta.respuestaCorrectaId && <CrossIcon />}
                    </label>
                  );
                })}
              </div>
              {res === false && pregunta.explicacion && (
                <p className="rh-section-label" style={{ marginTop: "0.5rem" }}>
                  {pregunta.explicacion}
                </p>
              )}
            </fieldset>
          );
        })}
      </div>

      <div className="rh-actions">
        {estado === "editando" ? (
          <button type="button" className="rh-btn rh-btn-primary" disabled={!todasRespondidas || sinIntentos} onClick={handleComprobar}>
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
            {Object.values(resultado.resultados).filter(Boolean).length}/{resultado.total}
          </div>
          <p className="rh-feedback-msg">
            <strong>{mensaje}</strong> {sinIntentos ? "No quedan más intentos." : "Pulsa reiniciar para volver a intentarlo."}
          </p>
        </div>
      )}
    </div>
  );
}
