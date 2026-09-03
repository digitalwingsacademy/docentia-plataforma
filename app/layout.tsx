import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Docentia — Formación digital para docentes",
  description: "Plataforma de formación digital para el claustro de tu colegio.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" style={{ colorScheme: "light dark" }} className={cn("font-sans", geist.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
