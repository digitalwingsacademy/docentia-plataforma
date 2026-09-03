import type { ReactNode } from "react";

const STYLES: Record<string, string> = {
  info: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100",
  importante:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
};

export function Aviso({ tipo = "info", children }: { tipo?: "info" | "importante"; children: ReactNode }) {
  return (
    <div className={`my-4 rounded-md border-l-4 p-4 text-sm ${STYLES[tipo] ?? STYLES.info}`} role="note">
      {children}
    </div>
  );
}
