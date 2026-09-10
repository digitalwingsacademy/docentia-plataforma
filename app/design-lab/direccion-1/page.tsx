"use client";

import { useState } from "react";
import { Libre_Caslon_Display, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
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
import "./direccion-1.css";

const display = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", variable: "--d1-display" });
const body = Source_Serif_4({ subsets: ["latin"], variable: "--d1-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--d1-mono" });

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function Direccion1() {
  const [tema, setTema] = useState<"light" | "dark">("light");
  const [leida, setLeida] = useState(false);

  return (
    <div className={`d1 ${display.variable} ${body.variable} ${mono.variable}`} data-theme={tema}>
      <div className="d1-bar">
        <a href="/design-lab">← Design Lab</a>
        <span style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>{curso}</span>
        <div className="d1-spacer" />
        <button className="d1-toggle" onClick={() => setTema(tema === "light" ? "dark" : "light")}>
          {tema === "light" ? "Oscuro" : "Claro"}
        </button>
      </div>

      <main className="d1-stage">
        <p className="d1-eyebrow">{sesion}</p>
        <h1 className="d1-title">{tituloLeccion}</h1>
        <div className="d1-rule" />

        <div className="d1-progress">
          {seccionesSesion.map((s) => (
            <div key={s.titulo} className={`d1-progress-item${s.actual ? " d1-current" : ""}`}>
              {s.titulo}
            </div>
          ))}
        </div>

        <p className="d1-lede">{introduccion}</p>

        {secciones.map((s) => (
          <div className="d1-section" key={s.titulo}>
            <h2>{s.titulo}</h2>
            <p>{s.texto}</p>
            <p className="d1-example">{s.ejemplo}</p>
            {s.nota && <p className="d1-note">{s.nota}</p>}
          </div>
        ))}

        <div className="d1-aviso">
          <span className="d1-aviso-label">Importante</span>
          {avisoImportante}
        </div>
        <div className="d1-aviso">
          <span className="d1-aviso-label">Nota</span>
          {avisoInfo}
        </div>

        <div className="d1-actions">
          <button className="d1-btn" onClick={() => setLeida(true)}>
            <CheckIcon />
            {leida ? "Marcada como leída" : "Marcar como leída"}
          </button>
        </div>

        <div className="d1-next">
          <p className="d1-next-label">A continuación</p>
          <a className="d1-next-link" href="#">
            {siguienteTitulo}
          </a>
          <p className="d1-next-meta">{siguienteDuracion}</p>
          <p className="d1-teaser">{fonicaTeaser}</p>
        </div>
      </main>

      <footer className="d1-footer">
        <strong>Cuaderno de referencia — sobria y premium.</strong> Transmite autoridad y cuidado
        editorial, como una publicación que un profesional respeta. Convence a un comprador que valora
        la percepción de prestigio institucional. Sacrifica calidez inmediata: puede sentirse distante
        en el primer vistazo, aunque la lectura en sí sea muy cómoda.
      </footer>
    </div>
  );
}
