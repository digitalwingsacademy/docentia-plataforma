import Link from "next/link";

const direcciones = [
  {
    href: "/design-lab/direccion-1",
    nombre: "1 — Cuaderno de referencia",
    resumen: "Sobria y premium. Tipografía como protagonista, sin foto, acento petróleo.",
  },
  {
    href: "/design-lab/direccion-2",
    nombre: "2 — Bitácora de aula",
    resumen: "Cálida y editorial. Herencia tipográfica española, textura de papel, acento ocre.",
  },
  {
    href: "/design-lab/direccion-3",
    nombre: "3 — Impulso",
    resumen: "Energía y motivación para un adulto. Progreso vivo, acento verde, sin gamificación infantil.",
  },
];

export default function DesignLabIndex() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 1.5rem", fontFamily: "system-ui, sans-serif" }}>
      <p style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#666", marginBottom: 8 }}>
        Design Lab — herramienta interna
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Tres direcciones visuales</h1>
      <p style={{ color: "#555", marginBottom: 32, lineHeight: 1.6 }}>
        Misma pantalla real — la lección &ldquo;Grammar Reference: Past Tenses in Narrative&rdquo; del
        curso English B1 — con tres sistemas visuales completos y distintos. Cada una tiene su propio
        selector claro/oscuro.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {direcciones.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            style={{
              display: "block",
              padding: "1.2rem 1.4rem",
              border: "1px solid #ddd",
              borderRadius: 10,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{d.nombre}</div>
            <div style={{ color: "#666", fontSize: 14 }}>{d.resumen}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
