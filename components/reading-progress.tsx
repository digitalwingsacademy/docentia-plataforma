"use client";

import { useEffect, useRef, useState } from "react";
import { markSectionAsRead } from "@/lib/actions/progress";
import { CheckIcon } from "@/components/leccion/iconos";

interface Props {
  enrollmentId: string;
  sectionId: string;
  durationMinutes: number;
  alreadyCompleted: boolean;
}

// Lectura: IntersectionObserver al final del contenido + boton manual
// (ADR-005) — el scroll automatico solo no es fiable con lectores de
// pantalla o zoom alto, por eso el boton siempre esta disponible.
export function ReadingProgress({ enrollmentId, sectionId, durationMinutes, alreadyCompleted }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [completed, setCompleted] = useState(alreadyCompleted);

  useEffect(() => {
    if (completed || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setCompleted(true);
          void markSectionAsRead({ enrollmentId, sectionId, durationMinutes });
        }
      },
      { threshold: 1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [completed, enrollmentId, sectionId, durationMinutes]);

  return (
    <div className="lc-actions">
      <div ref={sentinelRef} aria-hidden="true" />
      {completed ? (
        <p className="lc-completado">
          <CheckIcon /> Lección marcada como leída.
        </p>
      ) : (
        <button
          type="button"
          className="lc-btn"
          onClick={() => {
            setCompleted(true);
            void markSectionAsRead({ enrollmentId, sectionId, durationMinutes });
          }}
        >
          <CheckIcon />
          Marcar como leída
        </button>
      )}
    </div>
  );
}
