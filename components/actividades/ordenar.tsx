"use client";

import { useMemo, useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { markSectionAsRead } from "@/lib/actions/progress";
import { gradeOrdenar } from "@/lib/domain/ordenar";
import type { OrdenarYml } from "@/lib/content/schema";
import { barajarDeterminista, CheckIcon, CrossIcon } from "./shared";
import "./ordenar.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: OrdenarYml;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

export function Ordenar({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const eventosBarajados = useMemo(
    () => barajarDeterminista(actividad.eventos, actividad.eventos.map((e) => e.id).join(",")),
    [actividad.eventos]
  );
  const posicionesDisponibles = useMemo(
    () => [...new Set(actividad.eventos.map((e) => e.posicion))].sort((a, b) => a - b),
    [actividad.eventos]
  );

  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [estado, setEstado] = useState<"editando" | "corregido">("editando");
  const [intentos, setIntentos] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [resultado, setResultado] = useState<ReturnType<typeof gradeOrdenar> | null>(null);

  const maximos = actividad.reintentos.maximos;
  const sinIntentos = maximos !== "ilimitado" && intentos >= maximos;
  const todosAsignados = Object.keys(respuestas).length === actividad.eventos.length;

  function handleComprobar() {
    const result = gradeOrdenar(actividad.eventos, respuestas);
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
        ? "Vas bien, revisa las filas en rojo."
        : "Busca pistas de edad/secuencia y vuelve a intentarlo."
    : "";

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Ordenar</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      <div className="or-rows">
        {eventosBarajados.map((evento) => {
          const id = String(evento.id);
          const res = resultado?.resultados[id];
          const clase = `or-row${res !== undefined ? (res ? " or-ok" : " or-bad") : ""}`;
          return (
            <div key={id} className={clase}>
              <span className="or-texto">{evento.texto}</span>
              <select
                className="or-select"
                value={respuestas[id] ?? ""}
                disabled={estado === "corregido"}
                onChange={(e) => setRespuestas((prev) => ({ ...prev, [id]: Number(e.target.value) }))}
                aria-label={`Posición de "${evento.texto}"`}
              >
                <option value="" disabled>
                  —
                </option>
                {posicionesDisponibles.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {res !== undefined && (res ? <CheckIcon /> : <CrossIcon />)}
            </div>
          );
        })}
      </div>

      <div className="rh-actions">
        {estado === "editando" ? (
          <button type="button" className="rh-btn rh-btn-primary" disabled={!todosAsignados || sinIntentos} onClick={handleComprobar}>
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
