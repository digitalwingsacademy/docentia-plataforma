import type { ReactNode } from "react";

const ETIQUETAS: Record<string, string> = {
  info: "Nota",
  importante: "Importante",
};

export function Aviso({ tipo = "info", children }: { tipo?: "info" | "importante"; children: ReactNode }) {
  return (
    <div className="lc-aviso" role="note">
      <span className="lc-aviso-label">{ETIQUETAS[tipo] ?? ETIQUETAS.info}</span>
      {children}
    </div>
  );
}
