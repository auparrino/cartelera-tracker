import Section from "@/components/Section";
import BillboardTable from "@/components/BillboardTable";
import { loadAll } from "@/lib/data";
import { COUNTRY_CODE, fmtDateAR } from "@/lib/format";

export const revalidate = 3600;

export default async function GeografiaPage() {
  const { countries } = await loadAll();
  if (!countries) return null;

  const COUNTRIES = countries.countries_focus;

  // Build matrix title -> {country: best_rank}
  const titles = Object.entries(countries.title_geography).slice(0, 25);

  // Cosas que están en AR pero no en BR (insight cultural)
  const arOnly: Array<{ title: string; category: string; rank: number }> = [];
  const arItems = countries.by_country_latest["Argentina"] || [];
  const brSet = new Set(
    (countries.by_country_latest["Brazil"] || []).map((x) => x.title)
  );
  for (const it of arItems) {
    if (!brSet.has(it.title) && it.rank <= 5) {
      arOnly.push({ title: it.title, category: it.category, rank: it.rank });
    }
  }

  return (
    <>
      <Section
        number="VII"
        kicker="Mapa de demanda"
        title="Geografía"
        subtitle={`Cuánto se solapa el gusto entre AR · UY · PY · CL · BR · MX · CO · PE · semana del ${fmtDateAR(countries.latest_week)}`}
      >
        <p className="font-serif text-smoke max-w-3xl mb-4">
          Cada celda muestra el mejor rango (1 = mejor) que un título alcanzó en esa semana en cada país foco. Vacío = no estuvo en el Top 10 de ese país. Lectura: cuanto más cerca de "1" en todos los países, más universal el éxito; cuanta más dispersión, más contenido de nicho regional.
        </p>

        <div className="vintage-card overflow-x-auto">
          <table className="w-full font-serif text-sm">
            <thead>
              <tr className="border-b border-ink/40">
                <th className="text-left px-3 py-3 font-deco tracking-deco uppercase text-[0.65rem] text-smoke">
                  Título
                </th>
                <th className="text-left px-2 py-3 font-deco tracking-deco uppercase text-[0.65rem] text-smoke">
                  Tipo
                </th>
                {COUNTRIES.map((c) => (
                  <th
                    key={c}
                    className="text-center px-2 py-3 font-deco tracking-deco uppercase text-[0.65rem] text-smoke"
                  >
                    {COUNTRY_CODE[c] || c.slice(0, 2).toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {titles.map(([title, info]) => (
                <tr key={title} className="border-b border-ink/15 hover:bg-gilt/10">
                  <td className="px-3 py-2 text-ink truncate max-w-[280px]">{title}</td>
                  <td className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-smoke">
                    {info.category}
                  </td>
                  {COUNTRIES.map((c) => {
                    const rank = info.best_rank_by_country[c];
                    const intensity = rank ? Math.max(0, 1 - rank / 11) : 0;
                    return (
                      <td
                        key={c}
                        className="text-center px-2 py-2 font-mono"
                        style={{
                          backgroundColor: rank
                            ? `rgba(92, 26, 27, ${0.08 + intensity * 0.5})`
                            : "transparent",
                          color: rank && rank <= 3 ? "#F1E6CB" : "#1A1612",
                          fontWeight: rank && rank <= 3 ? 700 : 400,
                        }}
                      >
                        {rank ?? "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
          Fuente · Netflix Tudum · last 4 weeks rolling · {COUNTRIES.length} países · {titles.length} títulos con presencia en ≥ 2 países
        </p>
      </Section>

      <Section
        number="VII.b"
        kicker="Lecturas culturales"
        title="Lo que pega solo en Argentina"
        subtitle="Top 5 AR · ausentes del Top 10 de Brasil esta semana"
      >
        <BillboardTable
          rows={arOnly.map((x, i) => ({
            rank: x.rank,
            title: x.title,
            meta: x.category === "Films" ? "Película" : "Serie",
            right: "AR",
            rightSub: "no en BR",
            highlight: i === 0,
          }))}
        />
        <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
          Lectura · diferenciación cultural Cono Sur vs. mercado paulista; útil para programar adquisiciones específicas.
        </p>
      </Section>

      <Section number="VII.c" kicker="Carrera de la longevidad" title="Lo más longevo en cada país">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COUNTRIES.map((c) => {
            const list = (countries.longest_runs[c] || []).slice(0, 6);
            return (
              <div key={c} className="vintage-card p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="font-deco tracking-deco uppercase text-sm text-oxblood">{c}</div>
                  <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-ledger">
                    {COUNTRY_CODE[c] || c.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <ol className="font-serif text-sm space-y-1">
                  {list.map((t, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate">
                        <span className="num-roman text-xs mr-2">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        {t.title}
                      </span>
                      <span className="font-mono text-xs text-oxblood whitespace-nowrap">
                        {t.max_weeks}w
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 font-mono text-[9px] tracking-[0.18em] uppercase text-smoke/60">
                  Semanas máximas en Top 10 (acumulado histórico)
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
