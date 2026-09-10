"use client";

import { useState } from "react";
import { CheckIcon, CrossIcon } from "./iconos";
import { pasaAA, ratioContraste } from "./contraste";
import type { PaletaModo, Tema } from "@/lib/tema/temas";
import { fonicaTeaser, seccionesSesion } from "./contenido-leccion";

interface Props {
  activo: Tema;
  paleta: PaletaModo;
  modo: "light" | "dark";
}

interface Swatch {
  etiqueta: string;
  hex: string;
  contra?: { etiqueta: string; hex: string };
}

function Insignia({ ratio, pasa }: { ratio: number; pasa: boolean }) {
  return (
    <span className={`dl-badge ${pasa ? "dl-badge-pass" : "dl-badge-fail"}`}>
      {pasa ? <CheckIcon /> : <CrossIcon />}
      {ratio.toFixed(2)}:1
    </span>
  );
}

type EstadoHueco = "vacio" | "correcto" | "incorrecto";

function Hueco({ estado, respuesta, pista }: { estado: EstadoHueco; respuesta: string; pista?: string }) {
  return (
    <span className="dl-hueco-wrap">
      <span className={`dl-hueco dl-hueco-${estado}`}>{estado === "vacio" ? "……………" : respuesta}</span>
      {estado === "correcto" && <CheckIcon />}
      {estado === "incorrecto" && (
        <>
          <CrossIcon />
          {pista && <span className="dl-hueco-pista">{pista}</span>}
        </>
      )}
    </span>
  );
}

type EstadoEnvio = "idle" | "guardando" | "guardado" | "error";

function EnvioDemo() {
  const [estado, setEstado] = useState<EstadoEnvio>("idle");

  function simular(destino: EstadoEnvio) {
    setEstado("guardando");
    setTimeout(() => setEstado(destino), 700);
  }

  return (
    <div className="dl-envio">
      <div className="dl-actions" style={{ marginTop: 0 }}>
        <button className="dl-btn" disabled={estado === "guardando"} onClick={() => simular("guardado")}>
          Guardar respuesta
        </button>
        <button className="dl-btn dl-btn-secondary" disabled={estado === "guardando"} onClick={() => simular("error")}>
          Simular error
        </button>
      </div>
      {estado === "guardando" && <p className="dl-envio-estado dl-envio-cargando">Guardando tu respuesta…</p>}
      {estado === "guardado" && (
        <p className="dl-envio-estado dl-envio-ok">
          <CheckIcon /> Respuesta guardada.
        </p>
      )}
      {estado === "error" && (
        <p className="dl-envio-estado dl-envio-error">
          <CrossIcon /> Error al guardar, inténtalo de nuevo.
        </p>
      )}
    </div>
  );
}

export function Sistema({ activo, paleta, modo }: Props) {
  const swatches: Swatch[] = [
    { etiqueta: "bg", hex: paleta.bg },
    { etiqueta: "surface", hex: paleta.surface },
    { etiqueta: "surface-2", hex: paleta.surface2 },
    { etiqueta: "ink", hex: paleta.ink, contra: { etiqueta: "bg", hex: paleta.bg } },
    { etiqueta: "ink-muted", hex: paleta.inkMuted, contra: { etiqueta: "bg", hex: paleta.bg } },
    { etiqueta: "accent", hex: paleta.accent },
    { etiqueta: "accent-ink", hex: paleta.accentInk, contra: { etiqueta: "accent", hex: paleta.accent } },
    { etiqueta: "border", hex: paleta.border },
    { etiqueta: "good", hex: paleta.good, contra: { etiqueta: "bg", hex: paleta.bg } },
    { etiqueta: "error", hex: paleta.error, contra: { etiqueta: "bg", hex: paleta.bg } },
  ];

  return (
    <main className="dl-stage">
      <section className="dl-sys-section">
        <h2 className="dl-sys-h2">Paleta — {activo.nombre} ({modo})</h2>
        <p className="dl-note" style={{ marginBottom: "1.2rem" }}>
          Contraste AA para texto normal (≥4.5:1) de cada color de tinta contra su fondo declarado.
        </p>
        <div className="dl-swatch-grid">
          {swatches.map((s) => (
            <div className="dl-swatch" key={s.etiqueta}>
              <div className="dl-swatch-muestra" style={{ background: s.hex }} />
              <div className="dl-swatch-info">
                <span className="dl-swatch-nombre">--tema-{s.etiqueta}</span>
                <span className="dl-swatch-hex">{s.hex}</span>
                {s.contra && (
                  <Insignia
                    ratio={ratioContraste(s.hex, s.contra.hex)}
                    pasa={pasaAA(s.hex, s.contra.hex, "texto-normal")}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dl-sys-section">
        <h2 className="dl-sys-h2">Escala tipográfica</h2>
        <div className="dl-typescale">
          <div className="dl-typescale-row">
            <span className="dl-eyebrow" style={{ marginBottom: 0 }}>
              Sesión 2 — Task Cycle 1
            </span>
            <span className="dl-note">eyebrow · mono</span>
          </div>
          <div className="dl-typescale-row">
            <span className="dl-title" style={{ fontSize: "2rem", marginBottom: 0 }}>
              Grammar Reference
            </span>
            <span className="dl-note">título · display, 2rem</span>
          </div>
          <div className="dl-typescale-row">
            <span className="dl-lede" style={{ marginBottom: 0 }}>
              Antes de practicar, repasa cómo funcionan en una narración real los tres tiempos.
            </span>
            <span className="dl-note">lede · body, 1.15rem</span>
          </div>
          <div className="dl-typescale-row">
            <span style={{ fontSize: "1.05rem" }}>Texto de sección a tamaño de lectura habitual.</span>
            <span className="dl-note">cuerpo · body, 1.05rem</span>
          </div>
          <div className="dl-typescale-row">
            <span className="dl-teaser" style={{ marginTop: 0 }}>
              {fonicaTeaser}
            </span>
            <span className="dl-note">dato/IPA · mono, 0.88rem</span>
          </div>
        </div>
      </section>

      <section className="dl-sys-section">
        <h2 className="dl-sys-h2">Botones</h2>
        <div className="dl-actions" style={{ marginTop: 0, flexWrap: "wrap" }}>
          <button className="dl-btn">
            <CheckIcon />
            Primario
          </button>
          <button className="dl-btn dl-btn-secondary">Secundario</button>
          <button className="dl-btn" disabled>
            Deshabilitado
          </button>
        </div>
        <p className="dl-note" style={{ marginTop: "0.8rem" }}>
          Tabula hasta aquí para ver el anillo de foco.
        </p>
      </section>

      <section className="dl-sys-section">
        <h2 className="dl-sys-h2">Hueco corregible (rellenar-huecos)</h2>
        <p className="dl-example">
          Last summer, I <Hueco estado="vacio" respuesta="" /> my hometown when I suddenly{" "}
          <Hueco estado="correcto" respuesta="bumped" /> into an old school friend. She{" "}
          <Hueco estado="incorrecto" respuesta="was standing" pista="Acción larga en curso (past continuous)." /> outside the
          old library.
        </p>
      </section>

      <section className="dl-sys-section">
        <h2 className="dl-sys-h2">Pasos de sesión</h2>
        <div className="dl-progress">
          {seccionesSesion.map((s, i) => (
            <div
              key={s.titulo}
              className={`dl-progress-item${s.actual ? " dl-current" : ""}${i === 0 ? " dl-done" : ""}`}
            >
              {i === 0 && <CheckIcon />} {s.titulo}
            </div>
          ))}
        </div>
      </section>

      <section className="dl-sys-section">
        <h2 className="dl-sys-h2">Envío con carga</h2>
        <EnvioDemo />
      </section>
    </main>
  );
}
