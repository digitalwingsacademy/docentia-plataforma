// Iconos ya dimensionados por CSS (.lc-icon en leccion.css) - la referencia
// validada en app/design-lab/iconos.tsx, para no repetir el bug real del
// hallazgo 19 de la auditoria (icono suelto sin clase de tamaño en
// components/actividades/rellenar-huecos.tsx).

export function CheckIcon() {
  return (
    <svg className="lc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
