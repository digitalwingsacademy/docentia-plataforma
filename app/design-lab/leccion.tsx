"use client";

import { useState } from "react";
import { CheckIcon } from "./iconos";
import {
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

export function Leccion() {
  const [leida, setLeida] = useState(false);

  return (
    <main className="dl-stage">
      <p className="dl-eyebrow">{sesion}</p>
      <h1 className="dl-title">{tituloLeccion}</h1>
      <div className="dl-rule" />

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
  );
}
