import { cookies } from "next/headers";
import { TEMA_COOKIE, esTemaId } from "@/lib/theme";
import { DesignLabComparador } from "./comparador";

// Server Component: resuelve el tema inicial desde la cookie en servidor,
// para que el primer render del cliente coincida exactamente (sin useEffect
// que lo corrija despues, sin parpadeo) - el mismo patron que usara la
// implementacion real en el paso 4.
export default async function DesignLabPage() {
  const cookieStore = await cookies();
  const guardado = cookieStore.get(TEMA_COOKIE)?.value;
  const temaInicial = esTemaId(guardado) ? guardado : "cuaderno";

  return <DesignLabComparador temaInicial={temaInicial} />;
}
