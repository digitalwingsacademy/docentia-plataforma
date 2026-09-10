"use client";

import { useState } from "react";
import { Bricolage_Grotesque, Hanken_Grotesk, Space_Mono } from "next/font/google";
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
} from "../contenido-leccion";
import "./direccion-3.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["700", "800"], variable: "--d3-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--d3-body" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--d3-mono" });

const completadas = 0; // 5 secciones de la sesion, 0 completadas hasta ahora (esta es la primera)

export default function Direccion3() {
  const [tema, setTema] = useState<"light" | "dark">("light");
  const [leida, setLeida] = useState(false);

  return (
    <div className={`d3 ${display.variable} ${body.variable} ${mono.variable}`} data-theme={tema}>
      <svg className="d3-blob" viewBox="0 0 200 200" aria-hidden="true">
        <path
          fill="currentColor"
          style={{ color: "var(--accent)" }}
          d="M45.3,-58.5C58.6,-49.7,69.2,-35.6,73.6,-19.7C78,-3.8,76.2,13.9,68.7,28.6C61.2,43.3,48,55,32.9,63.1C17.8,71.2,0.8,75.7,-16.5,73.6C-33.8,71.5,-51.4,62.8,-62.6,48.9C-73.8,35,-78.6,15.9,-76.5,-1.9C-74.4,-19.7,-65.4,-36.2,-52.4,-45.3C-39.4,-54.4,-22.4,-56.1,-4.9,-49.8C12.6,-43.5,32.1,-67.3,45.3,-58.5Z"
          transform="translate(100 100)"
        />
      </svg>

      <div className="d3-bar">
        <a href="/design-lab">← Design Lab</a>
        <span style={{ color: "var(--ink-muted)", fontSize: "0.85rem", fontWeight: 600 }}>{curso}</span>
        <div className="d3-spacer" />
        <button className="d3-toggle" onClick={() => setTema(tema === "light" ? "dark" : "light")}>
          {tema === "light" ? "OSCURO" : "CLARO"}
        </button>
      </div>

      <main className="d3-stage">
        <p className="d3-eyebrow">
          <svg width="8" height="8" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="4" fill="currentColor" />
          </svg>
          {sesion}
        </p>
        <h1 className="d3-title">{tituloLeccion}</h1>

        <div className="d3-progress-label">
          <span>Progreso de la sesión</span>
          <span>{completadas}/5</span>
        </div>
        <div className="d3-progress">
          {seccionesSesion.map((s, i) => (
            <div
              key={s.titulo}
              className={`d3-progress-seg${s.actual ? " d3-current" : i < completadas ? " d3-done" : ""}`}
              title={s.titulo}
            />
          ))}
        </div>

        <p className="d3-lede">{introduccion}</p>

        {secciones.map((s) => (
          <div className="d3-section" key={s.titulo}>
            <h2>{s.titulo}</h2>
            <p>{s.texto}</p>
            <p className="d3-example">{s.ejemplo}</p>
            {s.nota && <p className="d3-note">{s.nota}</p>}
          </div>
        ))}

        <div className="d3-aviso">
          <span className="d3-aviso-label">Importante</span>
          {avisoImportante}
        </div>
        <div className="d3-aviso">
          <span className="d3-aviso-label">Nota</span>
          {avisoInfo}
        </div>

        <div className="d3-actions">
          <button className={`d3-btn${leida ? " d3-done" : ""}`} onClick={() => setLeida(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {leida ? "¡Lección marcada!" : "Marcar como leída"}
          </button>
        </div>

        <div className="d3-next">
          <p className="d3-next-label">A continuación</p>
          <a className="d3-next-link" href="#">
            {siguienteTitulo}
          </a>
          <p className="d3-next-meta">{siguienteDuracion}</p>
          <p className="d3-teaser">{fonicaTeaser}</p>
        </div>
      </main>

      <footer className="d3-footer">
        <strong>Impulso — energía y motivación.</strong> Hace que el progreso se sienta tangible y
        gratificante, para un adulto profesional, no gamificado. Convence a un comprador que quiere
        combatir el abandono típico de la formación online. Sacrifica parte de la seriedad
        institucional si no se vigila el tono de voz y la tipografía.
      </footer>
    </div>
  );
}
