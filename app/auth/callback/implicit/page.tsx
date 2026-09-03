"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { completeLoginSetup } from "@/lib/actions/auth";

function ImplicitCallback() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return; // React Strict Mode invoca los efectos dos veces en desarrollo
    ranRef.current = true;

    async function run() {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setError("El enlace no es válido o ha caducado. Pide uno nuevo.");
        return;
      }

      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        setError("El enlace no es válido o ha caducado. Pide uno nuevo.");
        return;
      }

      await completeLoginSetup();
      // Navegacion dura (no router.replace): una soft-nav de Next puede
      // reutilizar un RSC payload prefetcheado ANTES del login (sin
      // sesion), sirviendo una version obsoleta y sin cookies de auth
      // todavia propagadas a esa cache de cliente.
      window.location.href = searchParams.get("next") || "/";
    }
    void run();
  }, [searchParams]);

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <a href="/login" className="text-sm text-primary hover:underline">
          Volver a intentarlo
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-muted-foreground">Entrando...</p>
    </main>
  );
}

export default function ImplicitCallbackPage() {
  return (
    <Suspense>
      <ImplicitCallback />
    </Suspense>
  );
}
