import type { ReactNode } from "react";

export function Actividad({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 rounded-md border border-dashed border-primary/40 bg-secondary/50 p-4 text-sm">
      <p className="mb-2 font-medium">✏️ Actividad</p>
      {children}
    </div>
  );
}
