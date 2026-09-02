import { unstable_cache } from "next/cache";

export const SPIKE_CONTENT_TAG = "spike-content";

const CONTENT_URL =
  "https://raw.githubusercontent.com/digitalwingsacademy/docentia-contenidos/main/spike/mensaje.txt";

export interface SpikeContent {
  text: string;
  fetchedAt: string;
}

async function fetchSpikeContent(): Promise<SpikeContent> {
  // cache: "no-store" en el fetch nativo: todo el control de cacheado se delega
  // a unstable_cache/revalidateTag (una sola capa de cache, no dos superpuestas).
  const res = await fetch(CONTENT_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`No se pudo leer el contenido del spike: HTTP ${res.status}`);
  }
  return {
    text: (await res.text()).trim(),
    fetchedAt: new Date().toISOString(),
  };
}

export const getSpikeContent = unstable_cache(fetchSpikeContent, ["spike-content"], {
  tags: [SPIKE_CONTENT_TAG],
});
