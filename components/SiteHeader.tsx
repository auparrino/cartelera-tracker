import Link from "next/link";

const NAV = [
  { href: "/", label: "I · Panorama" },
  { href: "/estudios", label: "II · Estudios" },
  { href: "/tanques", label: "III · Tanques" },
  { href: "/ventanas", label: "IV · Ventanas" },
  { href: "/plataformas", label: "V · Plataformas" },
  { href: "/mercados", label: "VI · Mercados" },
  { href: "/catalogos", label: "VII · Catálogos" },
  { href: "/geografia", label: "VIII · Geografía" },
  { href: "/metodologia", label: "IX · Método" },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-ink/80 bg-ivory">
      {/* Marquee bulb strip */}
      <div className="bg-deco-rays-fixed h-3 border-b border-ink/30" aria-hidden />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-8 pb-6">
        <div className="flex items-baseline justify-between gap-4">
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-smoke/80">
            Vol. I · MMXXVI · Edición Semanal
          </div>
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-smoke/80 hidden sm:block">
            Buenos Aires · Cono Sur · Latinoamérica
          </div>
        </div>

        <div className="double-rule my-3" />

        <Link href="/" className="block group">
          <h1
            className="font-display text-center text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] text-ink"
            style={{ letterSpacing: "0.04em" }}
          >
            CARTELERA <span className="text-oxblood">TRACKER</span>
          </h1>
          <p className="font-deco text-center mt-2 tracking-deco text-[0.7rem] sm:text-[0.78rem] text-smoke uppercase">
            ★ Inteligencia de Mercado del Cine y el Streaming ★
          </p>
        </Link>

        <div className="double-rule my-4" />

        <p className="font-serif italic text-center text-smoke text-sm sm:text-base max-w-3xl mx-auto">
          Proyecto académico · Maestría en Generación y Análisis de Información Estadística (UNTREF) · Uso no comercial
        </p>

        <nav className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 font-deco text-[0.62rem] sm:text-[0.7rem] tracking-deco uppercase">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-smoke hover:text-oxblood transition-colors border-b border-transparent hover:border-oxblood pb-0.5"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="marquee-rule" />
    </header>
  );
}
