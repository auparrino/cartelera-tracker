import Section from "@/components/Section";
import StatPlate from "@/components/StatPlate";
import Marquee from "@/components/Marquee";
import BillboardTable from "@/components/BillboardTable";
import VintageLineChart from "@/components/VintageLineChart";
import { loadAll } from "@/lib/data";
import { fmtDateAR, fmtInt, fmtMillions } from "@/lib/format";
import Link from "next/link";

export const revalidate = 3600;

export default async function HomePage() {
  const { global, countries, ultracine, mojo, studio } = await loadAll();

  if (!global || !countries || !ultracine) {
    return (
      <div className="mt-20 text-center font-serif italic text-smoke">
        Esperando primer ciclo de pipeline. Ejecutar <code>scripts/fetch_netflix_tudum.py</code> y{" "}
        <code>scripts/scrape_ultracine.py</code>.
      </div>
    );
  }

  const ultraSorted = [...ultracine.weekly_totals]
    .filter((w) => w.total_entradas != null)
    .sort((a, b) => a.post_date.localeCompare(b.post_date));
  const lastWeek = ultraSorted[ultraSorted.length - 1];
  const prevWeek = ultraSorted[ultraSorted.length - 2];
  const ytdSum = ultraSorted
    .filter((w) => w.post_date.startsWith("2026"))
    .reduce((acc, w) => acc + (w.total_entradas || 0), 0);

  const arLatest = countries.by_country_latest["Argentina"] || [];
  const arFilm1 = arLatest.find((x) => x.category === "Films" && x.rank === 1);
  const arTV1 = arLatest.find((x) => x.category === "TV" && x.rank === 1);

  // Build the rolling line chart of weekly box-office tickets
  const lineData = ultraSorted.map((w) => ({
    week: w.post_date.slice(5),
    entradas: w.total_entradas,
  }));

  // Latest global Films English top 5 for the marquee strip
  const globalTop = global.latest_top10
    .filter((t) => t.category.startsWith("Films"))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);

  return (
    <>
      <Section
        number="I"
        kicker="Vol. I — Edición Inaugural"
        title="Panorama"
        subtitle="Pulso semanal del mercado audiovisual argentino — taquilla, streaming, geografía"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatPlate
            numeral="№ I"
            label="Última semana relevada · Cines AR"
            value={lastWeek ? fmtInt(lastWeek.total_entradas) : "—"}
            context={lastWeek ? `entradas · ${fmtDateAR(lastWeek.post_date)}` : undefined}
            footnote={`Fuente · Ultracine`}
          />
          <StatPlate
            numeral="№ II"
            label="Variación vs. semana anterior"
            value={
              lastWeek && prevWeek && prevWeek.total_entradas
                ? `${
                    ((lastWeek.total_entradas! - prevWeek.total_entradas) /
                      prevWeek.total_entradas) *
                      100 >=
                    0
                      ? "+"
                      : ""
                  }${(
                    ((lastWeek.total_entradas! - prevWeek.total_entradas) /
                      prevWeek.total_entradas) *
                      100
                  ).toFixed(1)}%`
                : "—"
            }
            context={`${
              lastWeek && prevWeek && prevWeek.total_entradas != null
                ? `de ${fmtInt(prevWeek.total_entradas)} a ${fmtInt(lastWeek.total_entradas!)}`
                : ""
            }`}
            footnote={prevWeek ? `vs ${fmtDateAR(prevWeek.post_date)}` : undefined}
          />
          <StatPlate
            numeral="№ III"
            label="Acumulado 2026 (semanas relevadas)"
            value={fmtInt(ytdSum)}
            context={`${ultraSorted.filter((w) => w.post_date.startsWith("2026")).length} fines de semana parseados`}
            footnote="Excluye feriados extralargos sin reporte"
          />
          <StatPlate
            numeral="№ IV"
            label="Países foco · Streaming"
            value={countries.countries_focus.length.toString()}
            context={countries.countries_focus.join(" · ")}
            footnote={`Última semana: ${fmtDateAR(countries.latest_week)}`}
          />
        </div>
      </Section>

      <Marquee pre="★ Atracción Principal ★" post={`Semana del ${fmtDateAR(lastWeek?.post_date || "")}`}>
        {lastWeek?.top1_title || arFilm1?.title || "—"}
      </Marquee>

      <Section number="II" kicker="Pulso semanal" title="La taquilla, semana a semana">
        <p className="font-serif text-smoke mb-4 max-w-3xl">
          Entradas vendidas en cines argentinos · {ultraSorted.length} fines de semana relevados
          desde <em>{fmtDateAR(ultraSorted[0]?.post_date || "")}</em> hasta{" "}
          <em>{fmtDateAR(ultraSorted[ultraSorted.length - 1]?.post_date || "")}</em>. Datos
          recolectados de los reportes semanales del blog Ultracine.
        </p>
        <div className="vintage-card p-4 sm:p-6">
          <VintageLineChart
            data={lineData}
            xKey="week"
            series={[{ key: "entradas", label: "Entradas vendidas" }]}
            yFormat="millions"
            height={320}
          />
        </div>
      </Section>

      <Section
        number="III"
        kicker="Doble Función"
        title="Lo que está mirando Argentina"
        subtitle="Top 1 de Netflix esta semana · Películas y series"
      >
        <div className="grid md:grid-cols-2 gap-5">
          <BillboardTable
            caption="Cines · Argentina"
            rightLabel="Espectadores · Salas"
            rows={
              lastWeek?.top1_title
                ? [
                    {
                      rank: 1,
                      title: lastWeek.top1_title,
                      meta: `Líder de taquilla · ${fmtDateAR(lastWeek.post_date)}`,
                      right: fmtInt(lastWeek.top1_espectadores),
                      rightSub: `${fmtInt(lastWeek.top1_salas)} salas`,
                      highlight: true,
                    },
                    ...(ultracine.weekly.find((w) => w.post_date === lastWeek.post_date)?.others?.map((o) => ({
                      rank: o.rank,
                      title: o.title,
                      meta: `Posición ${o.rank}`,
                      right: fmtInt(o.espectadores),
                      rightSub: `${fmtInt(o.salas)} salas`,
                    })) ?? []),
                  ]
                : []
            }
          />
          <BillboardTable
            caption="Netflix · Argentina"
            rightLabel="Semanas en Top 10"
            rows={arLatest.slice(0, 10).map((r) => ({
              rank: r.rank,
              title: r.title,
              meta: r.category === "Films" ? "Película" : r.season || "Serie",
              right: r.weeks_in_top10.toString(),
              rightSub: r.weeks_in_top10 === 1 ? "semana" : "semanas",
              highlight: r.rank === 1,
            }))}
          />
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
          Fuente · Ultracine + Netflix Tudum (all-weeks-countries.xlsx) · semana cerrada el {fmtDateAR(countries.latest_week)}
        </p>
      </Section>

      <Section
        number="IV"
        kicker="Indicador global"
        title="Lo que mira el planeta"
        subtitle="Top global de Netflix esta semana · horas vistas, en millones"
      >
        <div className="grid md:grid-cols-2 gap-5">
          <BillboardTable
            caption="Films · Top global Netflix"
            rightLabel="Horas vistas"
            rows={globalTop.map((g) => ({
              rank: g.rank,
              title: g.title,
              meta: `${g.category} · ${g.weeks_in_top10}ª semana en Top 10`,
              right: g.hours_viewed != null ? fmtMillions(g.hours_viewed) + " h" : "—",
              rightSub: g.views != null ? `${fmtMillions(g.views)} views` : undefined,
              highlight: g.rank === 1,
            }))}
          />
          <BillboardTable
            caption="TV · Top global Netflix"
            rightLabel="Horas vistas"
            rows={global.latest_top10
              .filter((t) => t.category.startsWith("TV"))
              .sort((a, b) => a.rank - b.rank)
              .slice(0, 5)
              .map((g) => ({
                rank: g.rank,
                title: g.title,
                meta: `${g.category} · ${g.weeks_in_top10}ª semana en Top 10`,
                right: g.hours_viewed != null ? fmtMillions(g.hours_viewed) + " h" : "—",
                rightSub: g.views != null ? `${fmtMillions(g.views)} views` : undefined,
                highlight: g.rank === 1,
              }))}
          />
        </div>
      </Section>

      {mojo && studio?.share?.ultracine_ar_weeks_at_1 ? (
        <Section
          number="V"
          kicker="Cruce internacional"
          title="US ↔ AR · esta semana"
          subtitle={`Box Office Mojo · ${mojo.weekend_label}`}
        >
          <div className="grid md:grid-cols-2 gap-5">
            <div className="vintage-card p-5">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-smoke/80 mb-2">
                US #1 · cines doméstico
              </div>
              <div className="font-display text-2xl text-ink leading-tight">
                {mojo.chart[0]?.title || "—"}
              </div>
              <div className="font-serif italic text-smoke text-sm mt-3">
                $ {fmtMillions(mojo.chart[0]?.weekend_gross_usd || 0)} · {fmtInt(mojo.chart[0]?.theaters)} salas · semana {mojo.chart[0]?.weeks_in_release}
              </div>
            </div>
            <div className="vintage-card p-5">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-smoke/80 mb-2">
                AR #1 · cines argentinos
              </div>
              <div className="font-display text-2xl text-ink leading-tight">
                {lastWeek?.top1_title || "—"}
              </div>
              <div className="font-serif italic text-smoke text-sm mt-3">
                {fmtInt(lastWeek?.top1_espectadores)} espectadores · {fmtInt(lastWeek?.top1_salas)} salas
              </div>
            </div>
          </div>

          <div className="mt-6 vintage-card p-5">
            <div className="font-deco tracking-deco uppercase text-sm text-oxblood mb-3">
              Acumulado · estudios al frente del #1 en cines AR
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(studio.share.ultracine_ar_weeks_at_1)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => {
                  const colors: Record<string, string> = {
                    Disney: "#5C1A1B",
                    Warner: "#2F4A3A",
                    "Universal/NBC": "#B8923A",
                    Sony: "#A4503A",
                    Paramount: "#6B5536",
                    "Netflix Originals": "#1A1612",
                    Independents: "#7B2D2E",
                  };
                  return (
                    <div
                      key={k}
                      className="px-4 py-3 border border-ink/40"
                      style={{ background: `${colors[k] || "#3A332B"}12` }}
                    >
                      <div className="font-deco tracking-deco uppercase text-xs" style={{ color: colors[k] || "#3A332B" }}>
                        {k}
                      </div>
                      <div className="font-display text-2xl text-ink mt-1">
                        {v}
                      </div>
                      <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
                        sem. al #1
                      </div>
                    </div>
                  );
                })}
            </div>
            <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
              Atribución por production_companies · TMDb · cobertura {(studio.share.ultracine_weekly_studio?.length ?? 0)} fines de semana
            </p>
          </div>
        </Section>
      ) : null}

      <div className="my-12 text-center">
        <div className="ornament text-2xl">✦ ✦ ✦</div>
        <p className="font-serif italic text-smoke mt-3 text-lg">
          Continúa la lectura por las secciones numeradas.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3 font-deco tracking-deco uppercase text-[0.7rem]">
          <Link href="/estudios" className="border border-ink px-3 py-2 hover:bg-ink hover:text-ivory transition">
            II · Estudios
          </Link>
          <Link href="/tanques" className="border border-ink px-3 py-2 hover:bg-ink hover:text-ivory transition">
            III · Tanques
          </Link>
          <Link href="/ventanas" className="border border-ink px-3 py-2 hover:bg-ink hover:text-ivory transition">
            IV · Ventanas
          </Link>
          <Link href="/plataformas" className="border border-ink px-3 py-2 hover:bg-ink hover:text-ivory transition">
            V · Plataformas
          </Link>
          <Link href="/geografia" className="border border-ink px-3 py-2 hover:bg-ink hover:text-ivory transition">
            VII · Geografía
          </Link>
          <Link href="/metodologia" className="border border-ink px-3 py-2 hover:bg-ink hover:text-ivory transition">
            VIII · Método
          </Link>
        </div>
      </div>
    </>
  );
}
