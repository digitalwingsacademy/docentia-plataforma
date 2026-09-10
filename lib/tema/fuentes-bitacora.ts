import { Ibarra_Real_Nova, Vollkorn, JetBrains_Mono } from "next/font/google";

const display = Ibarra_Real_Nova({ subsets: ["latin"], weight: ["600", "700"], variable: "--f-ibarra" });
const body = Vollkorn({ subsets: ["latin"], variable: "--f-vollkorn" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600"], variable: "--f-jetbrains-mono" });

export const fuentesBitacora = {
  variables: `${display.variable} ${body.variable} ${mono.variable}`,
};
