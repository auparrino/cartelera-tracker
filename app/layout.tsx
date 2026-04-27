import type { Metadata } from "next";
import { Cinzel, Crimson_Pro, Limelight, Playfair_Display, Special_Elite } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const limelight = Limelight({ subsets: ["latin"], weight: "400", variable: "--font-limelight", display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-cinzel", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700", "900"], style: ["normal", "italic"], variable: "--font-playfair", display: "swap" });
const crimson = Crimson_Pro({ subsets: ["latin"], weight: ["400", "500", "700"], style: ["normal", "italic"], variable: "--font-crimson", display: "swap" });
const elite = Special_Elite({ subsets: ["latin"], weight: "400", variable: "--font-special-elite", display: "swap" });

export const metadata: Metadata = {
  title: "Cartelera Tracker — Vol. I",
  description:
    "Tracker semanal del mercado audiovisual en Argentina y Cono Sur. Taquilla, streaming y catálogos cruzados con datos públicos. Proyecto académico — Maestría UNTREF · Uso no comercial.",
  authors: [{ name: "Augusto Parrino" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${limelight.variable} ${cinzel.variable} ${playfair.variable} ${crimson.variable} ${elite.variable}`}>
      <body className="font-body min-h-screen">
        <SiteHeader />
        <main className="mx-auto max-w-6xl px-5 sm:px-8 pb-24">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
