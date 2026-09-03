"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// PDF en vez de embeber Slides/Canva: funciona offline tras la primera
// carga y sirve directamente como descargable (ADR-004).
export function Presentacion({ src }: { src: string }) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);

  return (
    <div className="my-4 flex flex-col items-center gap-2 rounded-md border p-3">
      <Document file={src} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        <Page pageNumber={page} width={640} />
      </Document>
      {numPages > 1 && (
        <div className="flex items-center gap-3 text-sm">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            ← Anterior
          </button>
          <span>
            {page} / {numPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={page >= numPages}>
            Siguiente →
          </button>
        </div>
      )}
      <a href={src} download className="text-xs text-muted-foreground hover:underline">
        Descargar PDF
      </a>
    </div>
  );
}
