import { Bricolage_Grotesque, Hanken_Grotesk, Space_Mono } from "next/font/google";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["700", "800"], variable: "--f-bricolage" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--f-hanken" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-space-mono" });

export const fuentesImpulso = {
  variables: `${display.variable} ${body.variable} ${mono.variable}`,
};
