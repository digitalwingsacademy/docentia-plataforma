"use client";

import { useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { markSectionAsRead } from "@/lib/actions/progress";
import { gradeClasificar } from "@/lib/domain/clasificar";
import type { ClasificarYml } from "@/lib/content/schema";
import { CheckIcon } from "./shared";
import "./clasificar.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: ClasificarYml;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

export function Clasificar({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<"editando" | "corregido">("editando");
  const [intentos, setIntentos] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [resultado, setResultado] = useState<ReturnType<typeof gradeClasificar> | null>(null);

  const maximos = actividad.reintentos.maximos;
  const sinIntentos = maximos !== "ilimitado" && intentos >= maximos;
  const todosClasificados = Object.keys(respuestas).length === actividad.items.length;

  function handleChipClick(id: string) {
    if (estado === "corregido" || respuestas[id]) return;
    setSeleccionado(id === seleccionado ? null : id);
  }

  function handleColumnaClick(categoriaId: string) {
    if (estado === "corregido" || !seleccionado) return;
    setRespuestas((prev) => ({ ...prev, [seleccionado]: categoriaId }));
    setSeleccionado(null);
  }

  function handleQuitar(id: string) {
    if (estado === "corregido") return;
    setRespuestas((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleComprobar() {
    const result = gradeClasificar(actividad.items, respuestas);
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
    setSeleccionado(null);
    setResultado(null);
    setEstado("editando");
  }

  const mensaje = resultado
    ? resultado.puntuacion >= 80
      ? "¡Muy bien!"
      : resultado.puntuacion >= 50
        ? "Vas bien, revisa los items en rojo."
        : "Repasa la regla antes de reintentar."
    : "";

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Clasificar</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      <p className="rh-section-label">Banco de items</p>
      <div className="cl-bank">
        {actividad.items
          .filter((item) => !respuestas[String(item.id)])
          .map((item) => {
            const id = String(item.id);
            return (
              <button
                key={id}
                type="button"
                className={`cl-chip${id === seleccionado ? " cl-selected" : ""}`}
                disabled={estado === "corregido"}
                onClick={() => handleChipClick(id)}
              >
                {item.texto}
              </button>
            );
          })}
      </div>

      <div className="cl-columns">
        {actividad.categorias.map((cat) => (
          <div key={cat.id} className="cl-column" onClick={() => handleColumnaClick(cat.id)}>
            <div className="cl-column-head">{cat.etiqueta}</div>
            <span className="cl-column-ex">e.g. {cat.ejemplo}</span>
            {actividad.items
              .filter((item) => respuestas[String(item.id)] === cat.id)
              .map((item) => {
                const id = String(item.id);
                const res = resultado?.resultados[id];
                let clase = "cl-tag";
                if (res !== undefined) clase += res ? " cl-ok" : " cl-bad";
                return (
                  <div key={id} className={clase} onClick={(e) => e.stopPropagation()}>
                    <span>{item.texto}</span>
                    {estado === "editando" && (
                      <button type="button" onClick={() => handleQuitar(id)} aria-label={`Quitar ${item.texto}`}>
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      <div className="rh-actions">
        {estado === "editando" ? (
          <button type="button" className="rh-btn rh-btn-primary" disabled={!todosClasificados || sinIntentos} onClick={handleComprobar}>
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
