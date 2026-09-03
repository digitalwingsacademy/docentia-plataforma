import type { ReactNode } from "react";

export function Comparativa({ children }: { children: ReactNode }) {
  return <div className="my-4 grid gap-4 sm:grid-cols-2">{children}</div>;
}
