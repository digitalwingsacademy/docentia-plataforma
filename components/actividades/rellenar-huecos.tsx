"use client";

import { useMemo, useState } from "react";
import { IBM_Plex_Mono, Noto_Sans, Unbounded } from "next/font/google";
import { markSectionAsRead } from "@/lib/actions/progress";
import { gradeRellenarHuecos } from "@/lib/domain/rellenar-huecos";
import type { RellenarHuecosYml } from "@/lib/content/schema";
import "./rellenar-huecos.css";

const display = Unbounded({ subsets: ["latin"], weight: ["700", "800"], variable: "--rh-font-display" });
const body = Noto_Sans({ subsets: ["latin"], variable: "--rh-font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--rh-font-mono" });

interface Props {
  actividad: RellenarHuecosYml;
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
}

type Segmento = { tipo: "texto"; valor: string } | { tipo: "hueco"; id: string };

function parseTexto(texto: string): Segmento[] {
  const partes = texto.split(/(\{\{[^}]+\}\})/g);
  return partes
    .filter((parte) => parte.length > 0)
    .map((parte) => {
      const match = parte.match(/^\{\{([^}]+)\}\}$/);
      return match ? { tipo: "hueco" as const, id: match[1] ?? "" } : { tipo: "texto" as const, valor: parte };
    });
}

function normalizar(valor: string): string {
  return valor.trim().toLowerCase().replace(/\s+/g, " ");
}

// Barajado deterministico (mismo resultado en servidor y cliente, evita un
// mismatch de hidratacion que Math.random() causaria en el primer render).
function barajarDeterminista<T>(items: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function RellenarHuecos({ actividad, enrollmentId, sectionId, durationMinutes }: Props) {
  const segmentos = useMemo(() => parseTexto(actividad.texto), [actividad.texto]);
  const bancoPalabras = useMemo(
    () => (actividad.bancoPalabras ? barajarDeterminista(actividad.huecos, actividad.huecos.map((h) => h.id).join(",")) : []),
    [actividad.bancoPalabras, actividad.huecos]
  );

  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<"editando" | "corregido">("editando");
  const [intentos, setIntentos] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [resultado, setResultado] = useState<ReturnType<typeof gradeRellenarHuecos> | null>(null);

  const maximos = actividad.reintentos.maximos;
  const sinIntentos = maximos !== "ilimitado" && intentos >= maximos;

  function palabraUsada(palabra: string): boolean {
    return Object.values(respuestas).some((v) => normalizar(v) === normalizar(palabra));
  }

  function handleChipClick(palabra: string) {
    if (palabraUsada(palabra)) return;
    const huecoLibre = actividad.huecos.find((h) => !respuestas[String(h.id)]?.trim());
    if (!huecoLibre) return;
    setRespuestas((prev) => ({ ...prev, [String(huecoLibre.id)]: palabra }));
  }

  function handleComprobar() {
    const result = gradeRellenarHuecos(actividad.huecos, respuestas);
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

  const totalHuecos = actividad.huecos.length;
  const rellenados = actividad.huecos.filter((h) => respuestas[String(h.id)]?.trim()).length;
  const todosRellenos = rellenados === totalHuecos;

  const mensaje = resultado
    ? resultado.puntuacion >= 80
      ? "¡Muy bien!"
      : resultado.puntuacion >= 50
        ? "Vas bien, revisa los huecos en rojo."
        : "Repasa el contenido antes de reintentar."
    : "";

  return (
    <div
      className={`rh-console ${display.variable} ${body.variable} ${mono.variable}`}
      style={{ fontFamily: "var(--rh-font-body)" }}
    >
      <p className="rh-eyebrow">Actividad · Rellenar huecos</p>

      <div className="rh-progress" role="progressbar" aria-valuenow={estado === "corregido" ? resultado?.puntuacion : rellenados} aria-valuemax={totalHuecos}>
        {actividad.huecos.map((h) => {
          const id = String(h.id);
          let clase = "rh-progress-seg";
          if (estado === "corregido" && resultado) {
            clase += resultado.resultados[id]?.correcto ? " rh-ok" : " rh-bad";
          } else if (respuestas[id]?.trim()) {
            clase += " rh-filled";
          }
          return <div key={id} className={clase} />;
        })}
      </div>

      <h3 className="rh-title">{actividad.instrucciones}</h3>

      {actividad.bancoPalabras && (
        <>
          <p className="rh-section-label">Banco de palabras</p>
          <div className="rh-wordbank">
            {bancoPalabras.map((h) => (
              <button
                key={h.id}
                type="button"
                className="rh-chip"
                disabled={estado === "corregido" || palabraUsada(h.respuesta)}
                onClick={() => handleChipClick(h.respuesta)}
              >
                {h.respuesta}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="rh-manuscript">
        {segmentos.map((seg, i) => {
          if (seg.tipo === "texto") return <span key={i}>{seg.valor}</span>;

          const hueco = actividad.huecos.find((h) => String(h.id) === seg.id);
          const valor = respuestas[seg.id] ?? "";
          const res = resultado?.resultados[seg.id];
          const clase = `rh-blank${res ? (res.correcto ? " rh-ok" : " rh-bad") : ""}`;

          return (
            <span key={i} className="rh-blank-wrap">
              <input
                type="text"
                className={clase}
                value={valor}
                disabled={estado === "corregido"}
                onChange={(e) => setRespuestas((prev) => ({ ...prev, [seg.id]: e.target.value }))}
                aria-label={`Hueco ${seg.id}`}
              />
              {res && (res.correcto ? <CheckIcon /> : <CrossIcon />)}
              {res && !res.correcto && hueco?.pista && actividad.reintentos.mostrarSolucionAl !== "nunca" && (
                <span className="rh-hint">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3Z" />
                  </svg>
                  <span>
                    <strong>{res.respuestaCorrecta}</strong> — {hueco.pista}
                  </span>
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div className="rh-actions">
        {estado === "editando" ? (
          <button type="button" className="rh-btn rh-btn-primary" disabled={!todosRellenos || sinIntentos} onClick={handleComprobar}>
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
            <strong>{mensaje}</strong>{" "}
            {sinIntentos ? "No quedan más intentos." : "Pulsa reiniciar para volver a intentarlo."}
          </p>
        </div>
      )}
    </div>
  );
}
