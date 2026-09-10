// Los tres paquetes de tema: SOLO color y tipografia. La estructura,
// espaciado, iconografia y animacion viven en el CSS de cada superficie
// (esqueleto.css en /design-lab, leccion.css en el producto real) y son
// iguales para los tres - igual que un tema de IDE no mueve los paneles,
// solo cambia la paleta (y a veces la fuente).
//
// Fuente unica compartida por /design-lab y el producto real (paso 4) para
// que nunca haya dos copias de la paleta desincronizadas.

export interface PaletaModo {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  inkMuted: string;
  accent: string;
  accentInk: string;
  border: string;
  good: string;
  error: string;
}

export interface Tema {
  id: "cuaderno" | "bitacora" | "impulso";
  nombre: string;
  resumen: string;
  light: PaletaModo;
  dark: PaletaModo;
  fontDisplay: string; // nombre de la variable CSS definida en fuentes.ts
  fontBody: string;
  fontMono: string;
}

export const temas: Tema[] = [
  {
    id: "cuaderno",
    nombre: "Cuaderno de referencia",
    resumen: "Sobria y premium",
    light: {
      bg: "#f7f5f1",
      surface: "#ffffff",
      surface2: "#efece5",
      ink: "#1c2024",
      inkMuted: "#5b6167",
      accent: "#14524f",
      accentInk: "#f7f5f1",
      border: "#e0dcd3",
      good: "#14524f",
      error: "#9a3324",
    },
    dark: {
      bg: "#14171a",
      surface: "#1b1f22",
      surface2: "#21262a",
      ink: "#ede9df",
      inkMuted: "#a3aaad",
      accent: "#4fa69e",
      accentInk: "#0c1514",
      border: "#2c3236",
      good: "#4fa69e",
      error: "#d98b7a",
    },
    fontDisplay: "--f-libre-caslon",
    fontBody: "--f-source-serif",
    fontMono: "--f-plex-mono",
  },
  {
    id: "bitacora",
    nombre: "Bitácora de aula",
    resumen: "Cálida y editorial",
    light: {
      bg: "#ece6d2",
      surface: "#f5f1e4",
      surface2: "#e2dabf",
      ink: "#3a2e28",
      // Retocado desde #7a6b5a (paso 4): daba 4.12:1 sobre el fondo claro,
      // por debajo de AA - mismo tono, ~4.5pp menos de luminosidad, 4.94:1.
      inkMuted: "#6d5f50",
      // Retocado desde #9c7a2e (paso 4): el original daba 3.75:1 con
      // accentInk sobre el boton, por debajo de AA (4.5:1) - mismo tono,
      // ~7pp menos de luminosidad, 4.89:1.
      accent: "#836926",
      accentInk: "#fbf7ec",
      border: "#d8cfae",
      // Retocado desde #4f7a4a (paso 4): daba 3.99:1 sobre el fondo claro,
      // por debajo de AA - mismo tono, ~4pp menos de luminosidad, 4.83:1.
      good: "#466c41",
      error: "#a6402e",
    },
    dark: {
      bg: "#221d16",
      surface: "#2b241b",
      surface2: "#332b20",
      ink: "#f1e9da",
      inkMuted: "#b3a48d",
      accent: "#d4a94e",
      accentInk: "#221d16",
      border: "#3d3325",
      good: "#7fae77",
      error: "#d9836c",
    },
    fontDisplay: "--f-ibarra",
    fontBody: "--f-vollkorn",
    fontMono: "--f-jetbrains-mono",
  },
  {
    id: "impulso",
    nombre: "Impulso",
    resumen: "Energía y motivación",
    light: {
      bg: "#fafaf7",
      surface: "#ffffff",
      surface2: "#eef1ec",
      ink: "#16211c",
      inkMuted: "#5b675f",
      // Retocado desde #1f8a5f (paso 4): el original daba ~4.1:1 tanto en
      // accentInk sobre el boton como en good sobre el fondo, por debajo de
      // AA (4.5:1) - mismo tono, ~3pp menos de luminosidad, ~4.85:1 en
      // ambos usos.
      accent: "#1c7d56",
      accentInk: "#f2fbf6",
      border: "#dfe6e0",
      good: "#1c7d56",
      error: "#c23b2e",
    },
    dark: {
      bg: "#0f1512",
      surface: "#161e19",
      surface2: "#1c261f",
      ink: "#eaf2ec",
      inkMuted: "#93a49b",
      accent: "#3fcb82",
      accentInk: "#06130c",
      border: "#263029",
      good: "#3fcb82",
      error: "#e0796a",
    },
    fontDisplay: "--f-bricolage",
    fontBody: "--f-hanken",
    fontMono: "--f-space-mono",
  },
];
