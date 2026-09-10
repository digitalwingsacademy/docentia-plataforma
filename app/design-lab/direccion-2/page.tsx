"use client";

import { useState } from "react";
import { Ibarra_Real_Nova, Vollkorn, JetBrains_Mono } from "next/font/google";
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
import "./direccion-2.css";

const display = Ibarra_Real_Nova({ subsets: ["latin"], weight: ["600", "700"], variable: "--d2-display" });
const body = Vollkorn({ subsets: ["latin"], variable: "--d2-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--d2-mono" });

export default function Direccion2() {
  const [tema, setTema] = useState<"light" | "dark">("light");
  const [leida, setLeida] = useState(false);

  return (
    <div className={`d2 ${display.variable} ${body.variable} ${mono.variable}`} data-theme={tema}>
      <div className="d2-bar">
        <a href="/design-lab">← Design Lab</a>
        <span style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>{curso}</span>
        <div className="d2-spacer" />
        <button className="d2-toggle" onClick={() => setTema(tema === "light" ? "dark" : "light")}>
          {tema === "light" ? "Oscuro" : "Claro"}
        </button>
      </div>

      <main className="d2-stage">
        <p className="d2-eyebrow">{sesion}</p>
        <h1 className="d2-title">{tituloLeccion}</h1>

        <div className="d2-progress">
          {seccionesSesion.map((s) => (
            <div key={s.titulo} className={`d2-progress-item${s.actual ? " d2-current" : ""}`}>
              {s.titulo}
            </div>
          ))}
        </div>

        <p className="d2-lede">{introduccion}</p>

        {secciones.map((s) => (
          <div className="d2-section" key={s.titulo}>
            <h2>{s.titulo}</h2>
            <p>{s.texto}</p>
            <p className="d2-example">{s.ejemplo}</p>
            {s.nota && <p className="d2-note">{s.nota}</p>}
          </div>
        ))}

        <div className="d2-aviso">
          <span className="d2-aviso-label">Importante</span>
          {avisoImportante}
        </div>
        <div className="d2-aviso">
          <span className="d2-aviso-label">Nota</span>
          {avisoInfo}
        </div>

        <div className="d2-actions">
          <button className={`d2-btn${leida ? " d2-done" : ""}`} onClick={() => setLeida(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path className="d2-check-path" d="M20 6 9 17l-5-5" />
            </svg>
            {leida ? "Marcada como leída" : "Marcar como leída"}
          </button>
        </div>

        <div className="d2-next">
          <p className="d2-next-label">A continuación</p>
          <a className="d2-next-link" href="#">
            {siguienteTitulo}
          </a>
          <p className="d2-next-meta">{siguienteDuracion}</p>
          <p className="d2-teaser">{fonicaTeaser}</p>
        </div>
      </main>

      <footer className="d2-footer">
        <strong>Bitácora de aula — cálida y editorial.</strong> Transmite cercanía y cuidado humano,
        como el buen cuaderno de un compañero de claustro. Convence a un comprador que valora la
        conexión pedagógica por encima de la tecnología pura. Sacrifica algo de percepción de
        solidez técnica: puede leerse más artesanal que enterprise.
      </footer>
    </div>
  );
}
