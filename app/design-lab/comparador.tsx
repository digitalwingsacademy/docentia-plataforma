"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { todasLasVariables } from "./fuentes";
import { temas, type Tema } from "@/lib/tema/temas";
import { setTema as persistirTema } from "@/lib/actions/theme";
import type { TemaId } from "@/lib/theme";
import { curso } from "./contenido-leccion";
import { Leccion } from "./leccion";
import { Sistema } from "./sistema";
import "./esqueleto.css";

interface Props {
  temaInicial: TemaId;
}

type Vista = "leccion" | "sistema";

export function DesignLabComparador({ temaInicial }: Props) {
  const [temaId, setTemaId] = useState<TemaId>(temaInicial);
  const [modo, setModo] = useState<"light" | "dark">("light");
  const [vista, setVista] = useState<Vista>("leccion");

  function elegirTema(id: TemaId) {
    setTemaId(id);
    void persistirTema(id);
  }

  const activo = useMemo<Tema>(() => temas.find((t) => t.id === temaId) ?? temas[0]!, [temaId]);
  const paleta = modo === "light" ? activo.light : activo.dark;

  const estilo = {
    "--tema-bg": paleta.bg,
    "--tema-surface": paleta.surface,
    "--tema-surface-2": paleta.surface2,
    "--tema-ink": paleta.ink,
    "--tema-ink-muted": paleta.inkMuted,
    "--tema-accent": paleta.accent,
    "--tema-accent-ink": paleta.accentInk,
    "--tema-border": paleta.border,
    "--tema-good": paleta.good,
    "--tema-error": paleta.error,
    "--tema-font-display": `var(${activo.fontDisplay})`,
    "--tema-font-body": `var(${activo.fontBody})`,
    "--tema-font-mono": `var(${activo.fontMono})`,
  } as CSSProperties;

  return (
    <div className={`dl ${todasLasVariables}`} style={estilo}>
      <div className="dl-bar">
        <Link href="/">← Docentia</Link>
        <span style={{ color: "var(--tema-ink-muted)", fontSize: "0.85rem" }}>{curso}</span>
        <div className="dl-spacer" />
        <div className="dl-switcher" role="group" aria-label="Elegir tema">
          {temas.map((t) => (
            <button key={t.id} aria-pressed={t.id === temaId} onClick={() => elegirTema(t.id)}>
              {t.nombre}
            </button>
          ))}
        </div>
        <button className="dl-toggle" onClick={() => setModo(modo === "light" ? "dark" : "light")}>
          {modo === "light" ? "Oscuro" : "Claro"}
        </button>
      </div>

      <div className="dl-tabs" role="tablist" aria-label="Vista del design lab">
        <button role="tab" aria-selected={vista === "leccion"} onClick={() => setVista("leccion")}>
          Lección
        </button>
        <button role="tab" aria-selected={vista === "sistema"} onClick={() => setVista("sistema")}>
          Sistema
        </button>
      </div>

      {vista === "leccion" ? <Leccion key={`${temaId}-${modo}`} /> : <Sistema activo={activo} paleta={paleta} modo={modo} />}

      <footer className="dl-footer">
        <strong>
          {activo.nombre} — {activo.resumen}.
        </strong>{" "}
        Mismo esqueleto (estructura, espaciado, iconos, animación) que los otros dos temas — solo
        cambian la paleta y la tipografía, igual que un tema de IDE.
      </footer>
    </div>
  );
}
