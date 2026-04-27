import Section from "@/components/Section";

export const revalidate = 3600;

export default function CatalogosPage() {
  const platforms = [
    { slug: "disney-plus", name: "Disney+", url: "https://www.justwatch.com/ar/proveedor/disney-plus" },
    { slug: "max", name: "Max", url: "https://www.justwatch.com/ar/proveedor/max" },
    { slug: "netflix", name: "Netflix", url: "https://www.justwatch.com/ar/proveedor/netflix" },
    { slug: "prime-video", name: "Prime Video", url: "https://www.justwatch.com/ar/proveedor/prime-video" },
    { slug: "paramount-plus", name: "Paramount+", url: "https://www.justwatch.com/ar/proveedor/paramount-plus" },
  ];

  return (
    <>
      <Section
        number="VI"
        kicker="Watch on the catalogues"
        title="Catálogos"
        subtitle="Altas, bajas y composición · Argentina · vía JustWatch"
      >
        <div className="border border-oxblood/40 bg-oxblood/5 p-6">
          <div className="stamp-tag mb-3">EN PIPELINE — SCAFFOLD</div>
          <p className="font-serif text-base text-ink leading-relaxed">
            El módulo VI captura un snapshot semanal del catálogo público de cada plataforma, calcula altas y bajas comparando semana N vs N-1, y agrupa los títulos por estudio (cruzando con TMDb). El scaffold del scraper vive en{" "}
            <span className="font-mono text-ink">scripts/snapshot_justwatch.py</span> con la política de uso documentada (1 snapshot/semana, User-Agent identificable, atribución obligatoria, cumplimiento ante reclamo).
          </p>
          <p className="font-serif italic text-smoke mt-4 leading-relaxed">
            La página se hidrata cuando el primer snapshot esté tomado y el comparativo semana a semana esté disponible. Hasta ese momento, las plataformas que se relevan son:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {platforms.map((p) => (
            <a
              key={p.slug}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="vintage-card p-5 hover:bg-gilt/15 transition block"
            >
              <div className="font-deco tracking-deco uppercase text-sm text-oxblood">{p.name}</div>
              <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70 mt-1">
                /ar/proveedor/{p.slug}
              </div>
              <div className="font-serif italic text-smoke text-sm mt-3">
                Catálogo público · Argentina
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 vintage-card p-5">
          <div className="font-deco tracking-deco uppercase text-sm text-oxblood mb-3">
            Atribución JustWatch
          </div>
          <p className="font-serif italic text-smoke leading-relaxed">
            Datos de catálogo: <span className="text-ink">JustWatch.com</span> · Uso académico no comercial.
            Cada visualización derivada de JustWatch incluye este footer en lugar del logo o marca de la plataforma. El proyecto cumple con la política de no uso comercial / BI estipulada por JustWatch.
          </p>
        </div>
      </Section>
    </>
  );
}
