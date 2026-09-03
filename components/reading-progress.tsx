"use client";

import { useEffect, useRef, useState } from "react";
import { markSectionAsRead } from "@/lib/actions/progress";

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
    <div className="mt-8 flex flex-col items-center gap-3 border-t pt-6">
      <div ref={sentinelRef} aria-hidden="true" />
      {completed ? (
        <p className="text-sm text-green-700">✓ Lección marcada como leída.</p>
      ) : (
        <button
          onClick={() => {
            setCompleted(true);
            void markSectionAsRead({ enrollmentId, sectionId, durationMinutes });
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Marcar como leída
        </button>
      )}
    </div>
  );
}
