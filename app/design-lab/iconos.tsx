// Iconos de acierto/fallo, ya dimensionados por CSS (.dl-icon en esqueleto.css)
// en vez de sueltos como en el bug real del hallazgo 19 de la auditoria
// (components/actividades/rellenar-huecos.tsx) - la referencia de como debe
// quedar el icono cuando se corrija esa pantalla en el paso 4.

export function CheckIcon() {
  return (
    <svg className="dl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function CrossIcon() {
  return (
    <svg className="dl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
