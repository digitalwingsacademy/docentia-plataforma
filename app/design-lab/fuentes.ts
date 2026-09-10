// Las 9 tipografias de las 3 ternas (paso 2) cargadas todas a la vez, para
// poder cambiar de tema en caliente en el comparador. Esto es deliberado
// SOLO para esta herramienta interna de revision: la implementacion real en
// el producto (paso 4) debe cargar unicamente la terna del tema activo,
// resuelto en servidor a partir de la cookie, no las 9 de golpe.
import {
  Libre_Caslon_Display,
  Source_Serif_4,
  IBM_Plex_Mono,
  Ibarra_Real_Nova,
  Vollkorn,
  JetBrains_Mono,
  Bricolage_Grotesque,
  Hanken_Grotesk,
  Space_Mono,
} from "next/font/google";

export const libreCaslon = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", variable: "--f-libre-caslon" });
export const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--f-source-serif" });
export const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--f-plex-mono" });

export const ibarra = Ibarra_Real_Nova({ subsets: ["latin"], weight: ["600", "700"], variable: "--f-ibarra" });
export const vollkorn = Vollkorn({ subsets: ["latin"], variable: "--f-vollkorn" });
export const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--f-jetbrains-mono" });

export const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["700", "800"], variable: "--f-bricolage" });
export const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--f-hanken" });
export const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-space-mono" });

export const todasLasVariables = [
  libreCaslon.variable,
  sourceSerif.variable,
  plexMono.variable,
  ibarra.variable,
  vollkorn.variable,
  jetbrainsMono.variable,
  bricolage.variable,
  hanken.variable,
  spaceMono.variable,
].join(" ");
