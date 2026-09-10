import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { temas } from "@/lib/tema/temas";
import { variablesFuenteTema } from "@/lib/tema/fuentes";
import type { TemaId, ModoId } from "@/lib/theme";
import { ThemeSwitcher } from "./theme-switcher";
import { CheckIcon } from "./iconos";
import "./leccion.css";

export interface PasoSesion {
  titulo: string;
  estado: "pendiente" | "actual" | "completado";
}

interface Siguiente {
  href: string;
  titulo: string;
  duracionMinutos: number;
}

interface Props {
  cursoHref: string;
  cursoTitulo: string;
  unidadTitulo: string;
  seccionTitulo: string;
  pasos: PasoSesion[];
  siguiente?: Siguiente | null;
  temaId: TemaId;
  modo: ModoId;
  children: ReactNode;
  /** Contenido no tipografico que va despues de la prosa (p. ej. el
   * control de "marcar como leida") - fuera de .lc-prose a proposito, para
   * que sus reglas de espaciado entre parrafos no lo afecten. */
  debajoDelContenido?: ReactNode;
}

export function LeccionShell({
  cursoHref,
  cursoTitulo,
  unidadTitulo,
  seccionTitulo,
  pasos,
  siguiente,
  temaId,
  modo,
  children,
  debajoDelContenido,
}: Props) {
  const activo = temas.find((t) => t.id === temaId) ?? temas[0]!;
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
    <div className={`lc ${variablesFuenteTema(temaId)}`} style={estilo}>
      <div className="lc-bar">
        <Link href={cursoHref}>← {cursoTitulo}</Link>
        <div className="lc-spacer" />
        <ThemeSwitcher temaId={temaId} modo={modo} />
      </div>

      <main className="lc-stage">
        <p className="lc-eyebrow">{unidadTitulo}</p>
        <h1 className="lc-title">{seccionTitulo}</h1>
        <div className="lc-rule" />

        {pasos.length > 1 && (
          <div className="lc-progress">
            {pasos.map((p) => (
              <div
                key={p.titulo}
                className={`lc-progress-item${p.estado === "actual" ? " lc-current" : ""}${p.estado === "completado" ? " lc-done" : ""}`}
              >
                {p.estado === "completado" && <CheckIcon />}
                {p.titulo}
              </div>
            ))}
          </div>
        )}

        <div className="lc-prose">{children}</div>
        {debajoDelContenido}

        {siguiente && (
          <div className="lc-next">
            <p className="lc-next-label">A continuación</p>
            <Link className="lc-next-link" href={siguiente.href}>
              {siguiente.titulo}
            </Link>
            <p className="lc-next-meta">{siguiente.duracionMinutos} min</p>
          </div>
        )}
      </main>
    </div>
  );
}
