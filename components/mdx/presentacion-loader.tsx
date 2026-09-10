"use client";

import dynamic from "next/dynamic";

// react-pdf/pdfjs-dist referencia APIs de navegador (DOMMatrix) en la carga
// del modulo, no solo en tiempo de ejecucion - un render de servidor de
// Presentacion (aunque este marcada "use client", React sigue haciendo un
// pase de SSR de los Client Components) revienta con
// "ReferenceError: DOMMatrix is not defined". `ssr:false` evita ese pase,
// pero next/dynamic solo admite esa opcion desde un Client Component, de
// ahi este fichero envoltorio en vez de ponerlo directamente en
// presentacion.tsx o en el page.tsx (Server Component) que la usa.
export const Presentacion = dynamic(() => import("./presentacion").then((m) => m.Presentacion), { ssr: false });
