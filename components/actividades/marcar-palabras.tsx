"use client";

import { useMemo, useState } from "react";
import { Noto_Sans, Unbounded } from "next/font/google";
import { markSectionAsRead } from "@/lib/actions/progress";
import { encontrarSpans, gradeMarcarPalabras } from "@/lib/domain/marcar-palabras";
import type { MarcarPalabrasYml } from "@/lib/content/schema";
import { CheckIcon } from "./shared";
import "./marcar-palabras.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });

interface Props {
  actividad: MarcarPalabrasYml;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

export function MarcarPalabras({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const segmentos = useMemo(() => encontrarSpans(actividad.texto, actividad.palabrasCorrectas), [actividad.texto, actividad.palabrasCorrectas]);
  const totalSpans = useMemo(() => segmentos.filter((s) => s.tipo === "span").length, [segmentos]);

  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [estado, setEstado] = useState<"editando" | "corregido">("editando");
  const [intentos, setIntentos] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [resultado, setResultado] = useState<ReturnType<typeof gradeMarcarPalabras> | null>(null);

  const maximos = actividad.reintentos.maximos;
  const sinIntentos = maximos !== "ilimitado" && intentos >= maximos;

  function handleToggle(id: string) {
    if (estado === "corregido") return;
    setMarcados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleComprobar() {
    const result = gradeMarcarPalabras(totalSpans, marcados);
    setResultado(result);
    setEstado("corregido");
    setIntentos((n) => n + 1);
    if (!completado) {
      setCompletado(true);
      void markSectionAsRead({ enrollmentId, sectionId, durationMinutes });
    }
  }

  function handleReiniciar() {
    setMarcados(new Set());
    setResultado(null);
    setEstado("editando");
  }

  const mensaje = resultado
    ? resultado.puntuacion >= 80
      ? "¡Muy bien!"
      : resultado.puntuacion >= 50
        ? "Bien, pero se te han escapado algunos (borde discontinuo)."
        : "Repasa los conectores antes de reintentar."
    : "";

  return (
    <div className={`rh-console ${display.variable} ${body.variable}`} style={{ fontFamily: "var(--rh-font-body)" }}>
      <p className="rh-eyebrow">Actividad · Marcar palabras</p>
      <h3 className="rh-title">{actividad.instrucciones}</h3>

      <div className="mp-texto">
        {segmentos.map((seg, i) => {
          if (seg.tipo === "texto") return <span key={i}>{seg.valor}</span>;
          const marcado = marcados.has(seg.id);
          let clase = "mp-span";
          if (estado === "corregido") clase += marcado ? " mp-ok" : " mp-omitido";
          else if (marcado) clase += " mp-marcado";
          return (
            <span key={i} className={clase} onClick={() => handleToggle(seg.id)}>
              {seg.valor}
            </span>
          );
        })}
      </div>
      <p className="mp-contador">
        Marcados: {estado === "corregido" ? resultado?.correctos : marcados.size} / {totalSpans}
      </p>

      <div className="rh-actions">
        {estado === "editando" ? (
          <button type="button" className="rh-btn rh-btn-primary" disabled={sinIntentos} onClick={handleComprobar}>
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
            {resultado.correctos}/{resultado.total}
          </div>
          <p className="rh-feedback-msg">
            <strong>{mensaje}</strong> {sinIntentos ? "No quedan más intentos." : "Pulsa reiniciar para volver a intentarlo."}
          </p>
        </div>
      )}
    </div>
  );
}
