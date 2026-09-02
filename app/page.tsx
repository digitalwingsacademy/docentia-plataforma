import { getSpikeContent } from "@/lib/spike-content";

export default async function SpikePage() {
  const content = await getSpikeContent();

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 640 }}>
      <h1>Spike ADR-001 — revalidación de contenido</h1>
      <p>
        Este texto viene de <code>docentia-contenidos</code> vía{" "}
        <code>unstable_cache</code>. Si el timestamp no cambia tras editar y
        publicar el fichero fuente, la caché sigue activa; si cambia sin haber
        redesplegado la plataforma, la invalidación por webhook funciona.
      </p>
      <blockquote style={{ borderLeft: "4px solid #ccc", paddingLeft: "1rem" }}>
        {content.text}
      </blockquote>
      <p>
        <strong>Generado en:</strong> {content.fetchedAt}
      </p>
    </main>
  );
}
