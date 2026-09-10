"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { todasLasVariables } from "./fuentes";
import { temas, type Tema } from "./temas";
import { setTema as persistirTema } from "@/lib/actions/theme";
import type { TemaId } from "@/lib/theme";
import {
  curso,
  sesion,
  tituloLeccion,
  introduccion,
  secciones,
  avisoImportante,
  avisoInfo,
  seccionesSesion,
  siguienteTitulo,
  siguienteDuracion,
  fonicaTeaser,
} from "./contenido-leccion";
import "./esqueleto.css";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

interface Props {
  temaInicial: TemaId;
}

export function DesignLabComparador({ temaInicial }: Props) {
  const [temaId, setTemaId] = useState<TemaId>(temaInicial);
  const [modo, setModo] = useState<"light" | "dark">("light");
  const [leida, setLeida] = useState(false);

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

      <main className="dl-stage">
        <p className="dl-eyebrow">{sesion}</p>
        <h1 className="dl-title">{tituloLeccion}</h1>
        <div className="dl-rule" key={`${temaId}-${modo}`} />

        <div className="dl-progress">
          {seccionesSesion.map((s) => (
            <div key={s.titulo} className={`dl-progress-item${s.actual ? " dl-current" : ""}`}>
              {s.titulo}
            </div>
          ))}
        </div>

        <p className="dl-lede">{introduccion}</p>

        {secciones.map((s) => (
          <div className="dl-section" key={s.titulo}>
            <h2>{s.titulo}</h2>
            <p>{s.texto}</p>
            <p className="dl-example">{s.ejemplo}</p>
            {s.nota && <p className="dl-note">{s.nota}</p>}
          </div>
        ))}

        <div className="dl-aviso">
          <span className="dl-aviso-label">Importante</span>
          {avisoImportante}
        </div>
        <div className="dl-aviso">
          <span className="dl-aviso-label">Nota</span>
          {avisoInfo}
        </div>

        <div className="dl-actions">
          <button className="dl-btn" onClick={() => setLeida(true)}>
            <CheckIcon />
            {leida ? "Marcada como leída" : "Marcar como leída"}
          </button>
        </div>

        <div className="dl-next">
          <p className="dl-next-label">A continuación</p>
          <a className="dl-next-link" href="#">
            {siguienteTitulo}
          </a>
          <p className="dl-next-meta">{siguienteDuracion}</p>
          <p className="dl-teaser">{fonicaTeaser}</p>
        </div>
      </main>

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
