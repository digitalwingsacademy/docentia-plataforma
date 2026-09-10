import { Libre_Caslon_Display, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";

const display = Libre_Caslon_Display({ subsets: ["latin"], weight: "400", variable: "--f-libre-caslon" });
const body = Source_Serif_4({ subsets: ["latin"], variable: "--f-source-serif" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--f-plex-mono" });

export const fuentesCuaderno = {
  variables: `${display.variable} ${body.variable} ${mono.variable}`,
};
