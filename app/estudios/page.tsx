import Section from "@/components/Section";
import VintageBarChart from "@/components/VintageBarChart";
import { loadAll } from "@/lib/data";
import { fmtInt } from "@/lib/format";

export const revalidate = 3600;

const STUDIO_COLORS: Record<string, string> = {
  Disney: "#5C1A1B",
  Warner: "#2F4A3A",
  "Universal/NBC": "#B8923A",
  Sony: "#A4503A",
  Paramount: "#6B5536",
  "Netflix Originals": "#1A1612",
  Independents: "#7B2D2E",
};

function colorFor(studio: string): string {
  return STUDIO_COLORS[studio] || "#3A332B";
}

export default async function EstudiosPage() {
  const { studio, ultracine } = await loadAll();

  if (!studio || !ultracine) {
    return (
      <Section number="II" title="Estudios">
        <div className="border border-oxblood/40 bg-oxblood/5 p-5">
          <div className="stamp-tag mb-2">EN PIPELINE — REQUIERE TMDB_API_KEY</div>
          <p className="font-serif text-smoke">
            Configurar TMDB_API_KEY en Vercel + GitHub Actions y correr{" "}
            <code className="font-mono">scripts/enrich_tmdb.py</code>.
          </p>
        </div>
      </Section>
    );
  }

  const arWeeks = studio.share.ultracine_ar_weeks_at_1 || {};
  const arEspect = studio.share.ultracine_ar_espectadores || {};
  const mojoStudio = studio.share.mojo_us_gross || {};
  const weeklyAttr = studio.share.ultracine_weekly_studio || [];

  const arBars = Object.entries(arWeeks)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ label: k, value: v, color: colorFor(k) }));

  const arEspectBars = Object.entries(arEspect || {})
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ label: k, value: v, color: colorFor(k) }));

  const usBars = Object.entries(mojoStudio || {})
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ label: k, value: v, color: colorFor(k) }));

  // Streaming AR films share
  const arFilms = (studio.share.by_country_films["Argentina"] || {}) as Record<string, number>;
  const arStreamBars = Object.entries(arFilms)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => ({ label: k, value: v, color: colorFor(k) }));

  // Marquee timeline of weekly attr (color-coded)
  const totalEspect = Object.values(arEspect || {}).reduce((a, b) => a + b, 0);

  return (
    <>
      <Section
        number="II"
        kicker="Demultiplexar la cartelera"
        title="Estudios"
        subtitle="Disney · Warner · Universal · Sony · Paramount · Netflix · ¿quién manda?"
      >
        <p className="font-serif text-smoke max-w-3xl mb-6">
          La distribución argentina opera con consorcios (UIP = Universal+Paramount+Sony, BF, Diamond) que <em>no</em> son estudios. Acá demultiplexamos: cada título del top 1 semanal de Ultracine se cruza con TMDb, se extrae <span className="smallcaps">production_companies</span> y se mapea al bucket de estudio según{" "}
          <span className="font-mono text-sm">scripts/studio_mapping.json</span>.
        </p>
      </Section>

      <Section
        number="II.a"
        kicker="Cines · Argentina"
        title="¿Quién dominó el #1?"
        subtitle={`Semanas con película #1 en cines AR · ${weeklyAttr?.length ?? 0} fines de semana relevados`}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div className="vintage-card p-4 sm:p-6">
            <div className="font-deco tracking-deco uppercase text-sm text-oxblood mb-3">
              Semanas como #1 · por estudio
            </div>
            <VintageBarChart data={arBars} height={300} />
          </div>
          <div className="vintage-card p-4 sm:p-6">
            <div className="font-deco tracking-deco uppercase text-sm text-oxblood mb-3">
              Espectadores acumulados del #1 · por estudio
            </div>
            <VintageBarChart data={arEspectBars} yFormat="millions" height={300} />
          </div>
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
          Total acumulado · {fmtInt(totalEspect)} espectadores · solo cuenta semanas con título #1 atribuible a un estudio.
        </p>
      </Section>

      <Section
        number="II.b"
        kicker="Mercado US · contraste"
        title="Box Office US · cuota por estudio"
        subtitle="Recaudación del último fin de semana en USA · Box Office Mojo"
      >
        <div className="vintage-card p-4 sm:p-6">
          <VintageBarChart data={usBars} yFormat="millions" height={300} />
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
          USD recaudados en el fin de semana doméstico US, agregados por estudio. La aparición de Lionsgate u otros majors menores cae bajo "Independents" según el bucketing del proyecto.
        </p>
      </Section>

      <Section
        number="II.c"
        kicker="Streaming · Argentina"
        title="Cuota en Netflix AR"
        subtitle="Films del Top 10 por estudio · ponderado por ranking (11 − rank)"
      >
        <div className="vintage-card p-4 sm:p-6">
          <VintageBarChart data={arStreamBars} height={280} />
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70 max-w-3xl">
          Lectura clave: en el catálogo de Netflix, los buckets Disney y Warner casi no aparecen porque su contenido vive en sus plataformas propias (Disney+ y Max). Por eso el contraste cines-vs-streaming en estas mismas semanas es estructuralmente asimétrico — esa asimetría es la que hace que el módulo VII Catálogos importe.
        </p>
      </Section>

      <Section
        number="II.d"
        kicker="Bitácora semanal"
        title="Quién fue #1 cada fin de semana"
        subtitle="Semana por semana · cines AR · color = estudio"
      >
        <div className="vintage-card p-4 sm:p-6">
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 font-mono text-sm">
            {[...(weeklyAttr || [])]
              .sort((a, b) => b.post_date.localeCompare(a.post_date))
              .map((w) => (
                <li
                  key={w.post_date}
                  className="flex items-center gap-2 border-b border-ink/10 py-1"
                >
                  <span
                    className="inline-block w-2.5 h-2.5"
                    style={{ background: colorFor(w.studio) }}
                    aria-hidden
                  />
                  <span className="text-smoke text-xs w-20">{w.post_date}</span>
                  <span className="text-ink truncate flex-1">{w.title}</span>
                  <span className="text-oxblood text-xs whitespace-nowrap">
                    {w.studio}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </Section>

      <Section number="II.e" kicker="Glosario" title="Mapping de buckets">
        <div className="grid sm:grid-cols-2 gap-4 font-serif text-base">
          {[
            { name: "Disney", items: ["Walt Disney Pictures", "Walt Disney Animation", "Pixar", "Marvel Studios", "Lucasfilm", "20th Century Studios", "Searchlight Pictures", "Hulu", "Disney+"] },
            { name: "Warner", items: ["Warner Bros. Pictures", "New Line Cinema", "DC Studios", "Castle Rock", "HBO", "Cartoon Network", "Discovery", "Atomic Monster", "Max Originals"] },
            { name: "Universal/NBC", items: ["Universal Pictures", "Focus Features", "Illumination", "DreamWorks Animation", "Blumhouse", "Peacock", "Working Title"] },
            { name: "Sony", items: ["Sony Pictures", "Columbia Pictures", "TriStar", "Sony Pictures Animation", "Screen Gems", "Crunchyroll"] },
            { name: "Paramount", items: ["Paramount Pictures", "Paramount+", "Nickelodeon", "MTV Films", "CBS Studios", "Showtime"] },
            { name: "Netflix Originals", items: ["Netflix Studios", "Netflix Animation", "Netflix International Pictures"] },
          ].map((b) => (
            <div key={b.name} className="vintage-card p-4">
              <div className="flex items-baseline justify-between mb-2">
                <div className="font-deco tracking-deco uppercase text-sm" style={{ color: colorFor(b.name) }}>
                  {b.name}
                </div>
                <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-ledger">Bucket</div>
              </div>
              <ul className="font-serif italic text-smoke text-sm leading-relaxed">
                {b.items.map((i) => (
                  <li key={i}>· {i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
