"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { temas } from "@/lib/tema/temas";
import { setTema, setModo } from "@/lib/actions/theme";
import type { TemaId, ModoId } from "@/lib/theme";

interface Props {
  temaId: TemaId;
  modo: ModoId;
}

// Version real del selector de skin validado en app/design-lab: cambia la
// cookie en servidor y refresca los Server Components de la pantalla
// actual para que el nuevo tema/modo se resuelva en el siguiente render,
// sin recarga completa de página.
export function ThemeSwitcher({ temaId, modo }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function elegirTema(id: TemaId) {
    startTransition(async () => {
      await setTema(id);
      router.refresh();
    });
  }

  function alternarModo() {
    startTransition(async () => {
      await setModo(modo === "light" ? "dark" : "light");
      router.refresh();
    });
  }

  return (
    <>
      <div className="lc-switcher" role="group" aria-label="Elegir tema visual">
        {temas.map((t) => (
          <button key={t.id} type="button" aria-pressed={t.id === temaId} onClick={() => elegirTema(t.id)}>
            {t.nombre}
          </button>
        ))}
      </div>
      <button type="button" className="lc-toggle" onClick={alternarModo}>
        {modo === "light" ? "Oscuro" : "Claro"}
      </button>
    </>
  );
}
