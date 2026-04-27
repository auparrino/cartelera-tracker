import Section from "@/components/Section";
import VintageBarChart from "@/components/VintageBarChart";
import VintageLineChart from "@/components/VintageLineChart";
import { loadAll } from "@/lib/data";
import { fmtMillions, fmtInt } from "@/lib/format";

export const revalidate = 3600;

export default async function PlataformasPage() {
  const { global } = await loadAll();
  if (!global) return null;

  // Aggregated hours by category last 26w
  const byWeek: Record<string, Record<string, number>> = {};
  for (const r of global.rolling_26w_by_category) {
    const w = r.week.slice(5);
    if (!byWeek[w]) byWeek[w] = {};
    byWeek[w][r.category] = r.hours_viewed;
  }
  const lineData = Object.entries(byWeek)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([w, cats]) => ({ week: w, ...cats }));

  // Sum hours by category over period (proxy of category mix)
  const totals: Record<string, number> = {};
  for (const r of global.rolling_26w_by_category) {
    totals[r.category] = (totals[r.category] || 0) + r.hours_viewed;
  }
  const totalsData = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  return (
    <>
      <Section
        number="V"
        kicker="Net­flix · global"
        title="Plataformas"
        subtitle="Composición de la demanda en el catálogo más grande del mundo"
      >
        <p className="font-serif text-smoke max-w-3xl mb-4">
          Netflix Tudum es la única plataforma que publica horas vistas semanales de forma sistemática. Estos cortes son el espejo más fiel de la demanda global de SVOD. Disney+, Max, Prime Video y Paramount+ no publican datos comparables; se infieren vía catálogo (sección VI).
        </p>

        <div className="vintage-card p-4 sm:p-6">
          <div className="font-deco tracking-deco uppercase text-sm text-oxblood mb-3">
            Horas vistas por categoría · últimas 26 semanas
          </div>
          <VintageLineChart
            data={lineData}
            xKey="week"
            series={[
              { key: "Films (English)", label: "Films · English" },
              { key: "Films (Non-English)", label: "Films · Non-English" },
              { key: "TV (English)", label: "TV · English" },
              { key: "TV (Non-English)", label: "TV · Non-English" },
            ]}
            yFormat="millions"
            height={360}
          />
        </div>

        <div className="vintage-card p-4 sm:p-6 mt-6">
          <div className="font-deco tracking-deco uppercase text-sm text-oxblood mb-3">
            Mix acumulado · 26 semanas (horas)
          </div>
          <VintageBarChart data={totalsData} yFormat="millions" height={280} />
        </div>
      </Section>

      <Section
        number="V.b"
        kicker="Lección regional"
        title="El no-inglés no es marginal"
      >
        <p className="font-serif text-base sm:text-lg text-smoke max-w-3xl leading-relaxed">
          La proporción de horas en idioma no-inglés en el global de Netflix oscila típicamente entre el 30% y el 45% del total. Para un equipo de market intelligence latinoamericano esto es una pista directa: la programación local doblada o subtitulada compite directamente contra la producción original anglosajona, no en una liga separada. Las cifras de las últimas 26 semanas:
        </p>
        <ul className="mt-4 grid sm:grid-cols-2 gap-3 font-mono text-sm">
          {Object.entries(totals)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, hrs]) => {
              const total = Object.values(totals).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? (hrs / total) * 100 : 0;
              return (
                <li key={cat} className="flex justify-between border-b border-ink/20 pb-1">
                  <span className="smallcaps text-ink">{cat}</span>
                  <span className="text-oxblood">{fmtMillions(hrs)} h · {pct.toFixed(1)}%</span>
                </li>
              );
            })}
        </ul>
        <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
          Fuente · Netflix Tudum · all-weeks-global.xlsx · ventana móvil 26 semanas hasta {global.latest_week}. Total acumulado: {fmtInt(Object.values(totals).reduce((a, b) => a + b, 0))} h.
        </p>
      </Section>
    </>
  );
}
