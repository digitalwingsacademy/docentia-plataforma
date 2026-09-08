import type { TablaRubricaYml } from "@/lib/content/schema";
import "./tabla-rubrica.css";

interface Props {
  tabla: TablaRubricaYml;
}

/** Presentacional, sin estado: se usa dentro de GrabacionAudio como
 * referencia de criterios antes de grabar, nunca se corrige contra ella
 * (docs/formato-actividades.md #4.3). */
export function TablaRubrica({ tabla }: Props) {
  return (
    <div className="tr-wrap">
      <table className="tr-tabla">
        <thead>
          <tr>
            <th>Criterio</th>
            {tabla.niveles.map((nivel) => (
              <th key={nivel}>{nivel}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tabla.criterios.map((criterio) => (
            <tr key={criterio.nombre}>
              <th scope="row">{criterio.nombre}</th>
              {criterio.descripciones.map((desc, i) => (
                <td key={i}>{desc}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
