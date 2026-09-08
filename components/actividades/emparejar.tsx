"use client";

import { useMemo, useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { markSectionAsRead } from "@/lib/actions/progress";
import { gradeEmparejar } from "@/lib/domain/emparejar";
import type { EmparejarYml } from "@/lib/content/schema";
import { barajarDeterminista, CheckIcon, CrossIcon } from "./shared";
import "./emparejar.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: EmparejarYml;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

export function Emparejar({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const definiciones = useMemo(
    () => barajarDeterminista(actividad.pares, actividad.pares.map((p) => p.id).join(",")),
    [actividad.pares]
  );

  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [definicionesUsadas, setDefinicionesUsadas] = useState<Set<string>>(new Set());
  const [estado, setEstado] = useState<"editando" | "corregido">("editando");
  const [intentos, setIntentos] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [resultado, setResultado] = useState<ReturnType<typeof gradeEmparejar> | null>(null);

  const maximos = actividad.reintentos.maximos;
  const sinIntentos = maximos !== "ilimitado" && intentos >= maximos;
  const todosAsignados = Object.keys(respuestas).length === actividad.pares.length;

  function handleTerminoClick(id: string) {
    if (estado === "corregido" || respuestas[id]) return;
    setSeleccionado(id === seleccionado ? null : id);
  }

  function handleDefinicionClick(parId: string) {
    if (estado === "corregido" || !seleccionado || definicionesUsadas.has(parId)) return;
    setRespuestas((prev) => ({ ...prev, [seleccionado]: parId }));
    setDefinicionesUsadas((prev) => new Set(prev).add(parId));
    setSeleccionado(null);
  }

  function handleComprobar() {
    const result = gradeEmparejar(actividad.pares, respuestas);
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
    setDefinicionesUsadas(new Set());
    setSeleccionado(null);
    setResultado(null);
    setEstado("editando");
  }

  const mensaje = resultado
    ? resultado.puntuacion >= 80
      ? "¡Muy bien!"
      : resultado.puntuacion >= 50
        ? "Vas bien, revisa las parejas en rojo."
        : "Repasa el vocabulario antes de reintentar."
    : "";

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Emparejar</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      <div className="em-grid">
        <div>
          <p className="em-col-label">Términos</p>
          <div className="em-items">
            {actividad.pares.map((par) => {
              const id = String(par.id);
              const res = resultado?.resultados[id];
              let clase = "em-item";
              if (res !== undefined) clase += res ? " em-ok" : " em-bad";
              else if (id === seleccionado) clase += " em-selected";
              else if (respuestas[id]) clase += " em-used";
              return (
                <button
                  key={id}
                  type="button"
                  className={clase}
                  disabled={estado === "corregido" || !!respuestas[id]}
                  onClick={() => handleTerminoClick(id)}
                >
                  {par.termino}
                  {res !== undefined && (res ? <CheckIcon /> : <CrossIcon />)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="em-col-label">Definiciones</p>
          <div className="em-items">
            {definiciones.map((par) => {
              const id = String(par.id);
              const usada = definicionesUsadas.has(id);
              // Si esta definicion fue la asignada a algun termino, hereda su color de correccion.
              const terminoAsignado = Object.entries(respuestas).find(([, defId]) => defId === id)?.[0];
              const res = terminoAsignado ? resultado?.resultados[terminoAsignado] : undefined;
              let clase = "em-item";
              if (res !== undefined) clase += res ? " em-ok" : " em-bad";
              else if (usada) clase += " em-used";
              return (
                <button
                  key={id}
                  type="button"
                  className={clase}
                  disabled={estado === "corregido" || usada}
                  onClick={() => handleDefinicionClick(id)}
                >
                  {par.definicion}
                </button>
              );
            })}
          </div>
        </div>
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
