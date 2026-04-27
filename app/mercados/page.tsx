import Section from "@/components/Section";
import BillboardTable from "@/components/BillboardTable";
import VintageBarChart from "@/components/VintageBarChart";
import { loadAll } from "@/lib/data";
import { fmtInt, fmtMillions, fmtDateAR, fmtPct } from "@/lib/format";

export const revalidate = 3600;

// Loose normalization helps detect when a US title matches an AR title.
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const KEYWORDS = (s: string) => norm(s).split(" ").filter((w) => w.length >= 4);

function shareKeywords(a: string, b: string): boolean {
  const ka = new Set(KEYWORDS(a));
  if (ka.size === 0) return false;
  const kb = KEYWORDS(b);
  let hits = 0;
  for (const w of kb) if (ka.has(w)) hits += 1;
  return hits >= Math.min(2, ka.size);
}

export default async function MercadosPage() {
  const { mojo, ultracine, countries } = await loadAll();

  if (!mojo || !ultracine || !countries) {
    return (
      <div className="mt-20 text-center font-serif italic text-smoke">
        Esperando datos. Ejecutar <code>scripts/fetch_box_office_mojo.py</code>.
      </div>
    );
  }

  const lastUltracine = [...ultracine.weekly_totals]
    .filter((w) => w.total_entradas != null)
    .sort((a, b) => a.post_date.localeCompare(b.post_date))
    .slice(-1)[0];

  const lastUltraWeekly = ultracine.weekly[ultracine.weekly.length - 1];

  // Build the AR side: top1 + others (ranks 2-5 if extracted)
  const arRanking: Array<{ rank: number; title: string; espectadores: number; salas: number }> = [];
  if (lastUltraWeekly?.top1) {
    arRanking.push({ rank: 1, ...lastUltraWeekly.top1 });
  }
  for (const o of lastUltraWeekly?.others || []) {
    arRanking.push(o);
  }
  arRanking.sort((a, b) => a.rank - b.rank);

  // Mojo top 10
  const usTop = mojo.chart.slice(0, 10);

  // Cross-reference: which US titles are also charting in AR (top 5 ultracine)
  const crossRows = usTop.map((u) => {
    const arHit = arRanking.find((a) => shareKeywords(a.title, u.title));
    return {
      us_rank: u.rank,
      us_title: u.title,
      ar_rank: arHit?.rank ?? null,
      ar_title: arHit?.title ?? null,
      us_gross: u.weekend_gross_usd,
      us_theaters: u.theaters,
      ar_espectadores: arHit?.espectadores ?? null,
      ar_salas: arHit?.salas ?? null,
      weeks_us: u.weeks_in_release,
      change_us: u.change_vs_lw_pct,
    };
  });

  // Quick aggregate: US weekend total
  const usWeekendTotal = mojo.chart.reduce(
    (acc, c) => acc + (c.weekend_gross_usd || 0),
    0,
  );

  // top studios approx via title? Skip — needs TMDb. But we can show concentration top10 vs total.
  const top10Share =
    mojo.chart.slice(0, 10).reduce((acc, c) => acc + (c.weekend_gross_usd || 0), 0) /
    Math.max(1, usWeekendTotal);

  // Bar: US weekend gross top 10
  const usBars = usTop.map((c) => ({
    label: (c.title || "").slice(0, 22),
    value: c.weekend_gross_usd || 0,
  }));

  return (
    <>
      <Section
        number="VI"
        kicker="Cruce internacional"
        title="Mercados"
        subtitle={`Box Office Mojo · ${mojo.weekend_label} · vs Argentina semana del ${fmtDateAR(lastUltracine?.post_date || "")}`}
      >
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="vintage-card p-5">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke/80 mb-2">
              Mercado US · fin de semana
            </div>
            <div className="font-display text-3xl text-ink">$ {fmtMillions(usWeekendTotal)}</div>
            <div className="font-serif italic text-smoke text-sm mt-2">
              {mojo.chart.length} títulos en chart · concentración top 10 ·{" "}
              <span className="text-oxblood">{(top10Share * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="vintage-card p-5">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke/80 mb-2">
              Mercado AR · fin de semana
            </div>
            <div className="font-display text-3xl text-ink">
              {fmtInt(lastUltracine?.total_entradas)}
            </div>
            <div className="font-serif italic text-smoke text-sm mt-2">
              entradas · variación vs sem. previa{" "}
              <span className="text-oxblood">{fmtPct(lastUltracine?.variacion_pct ?? null)}</span>
            </div>
          </div>
          <div className="vintage-card p-5">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-smoke/80 mb-2">
              Líder doble
            </div>
            <div className="font-display text-2xl text-ink leading-tight">
              {usTop[0]?.title || "—"}
            </div>
            <div className="font-serif italic text-smoke text-sm mt-2">
              US #1 ·{" "}
              {arRanking.find((a) => shareKeywords(a.title, usTop[0]?.title || ""))
                ? "También charteando en AR"
                : "Aún no en AR"}
            </div>
          </div>
        </div>

        <div className="vintage-card p-4 sm:p-6">
          <div className="font-deco tracking-deco uppercase text-sm text-oxblood mb-3">
            Recaudación US · top 10 fin de semana (USD)
          </div>
          <VintageBarChart data={usBars} yFormat="millions" height={320} />
        </div>
      </Section>

      <Section
        number="VI.b"
        kicker="¿Qué viaja?"
        title="US ↔ AR · cruce semanal"
        subtitle="Cómo se traslada el chart doméstico al mercado argentino"
      >
        <div className="vintage-card overflow-x-auto">
          <table className="w-full font-serif text-sm">
            <thead>
              <tr className="border-b border-ink/40">
                <th className="text-left px-3 py-3 font-deco tracking-deco uppercase text-[0.65rem] text-smoke">
                  US
                </th>
                <th className="text-left px-3 py-3 font-deco tracking-deco uppercase text-[0.65rem] text-smoke">
                  Título
                </th>
                <th className="text-right px-3 py-3 font-deco tracking-deco uppercase text-[0.65rem] text-smoke">
                  Recaudación US
                </th>
                <th className="text-right px-3 py-3 font-deco tracking-deco uppercase text-[0.65rem] text-smoke">
                  Sem.
                </th>
                <th className="text-right px-3 py-3 font-deco tracking-deco uppercase text-[0.65rem] text-smoke">
                  Δ vs LW
                </th>
                <th className="text-center px-3 py-3 font-deco tracking-deco uppercase text-[0.65rem] text-smoke">
                  AR
                </th>
                <th className="text-right px-3 py-3 font-deco tracking-deco uppercase text-[0.65rem] text-smoke">
                  AR · espectadores
                </th>
              </tr>
            </thead>
            <tbody>
              {crossRows.map((r) => (
                <tr
                  key={`${r.us_rank}-${r.us_title}`}
                  className={`border-b border-ink/15 ${r.ar_rank ? "bg-gilt/10" : ""}`}
                >
                  <td className="px-3 py-2 num-roman text-base">
                    {String(r.us_rank).padStart(2, "0")}
                  </td>
                  <td className="px-3 py-2 text-ink">{r.us_title}</td>
                  <td className="px-3 py-2 text-right font-mono text-sm">
                    $ {fmtMillions(r.us_gross || 0)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-smoke">
                    {r.weeks_us ?? "—"}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-mono text-sm ${
                      (r.change_us ?? 0) < 0 ? "text-oxblood" : "text-forest"
                    }`}
                  >
                    {r.change_us != null ? `${r.change_us > 0 ? "+" : ""}${r.change_us.toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-sm">
                    {r.ar_rank ? (
                      <span className="num-roman text-base">
                        #{String(r.ar_rank).padStart(2, "0")}
                      </span>
                    ) : (
                      <span className="text-smoke/50">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-sm">
                    {r.ar_espectadores != null ? fmtInt(r.ar_espectadores) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
          Fuente · Box Office Mojo (US) + Ultracine (AR) · cruce por keywords del título; un faltante en AR puede ser por título no estrenado o por discrepancia de transliteración.
        </p>
      </Section>

      <Section
        number="VI.c"
        kicker="Detalle US"
        title="Box Office Mojo · ranking completo"
        subtitle={`${mojo.weekend_label} · ${mojo.chart.length} títulos en pantalla doméstica`}
      >
        <BillboardTable
          rightLabel="Recaudación · cines"
          rows={mojo.chart.map((c) => ({
            rank: c.rank ?? "—",
            title: c.title,
            meta: `Sem. ${c.weeks_in_release ?? "—"} · ${fmtInt(c.theaters)} salas · prom. $ ${fmtInt(c.average_per_theater_usd)} / sala`,
            right: c.weekend_gross_usd != null ? `$ ${fmtMillions(c.weekend_gross_usd)}` : "—",
            rightSub:
              c.total_domestic_usd != null
                ? `acum. $ ${fmtMillions(c.total_domestic_usd)}`
                : undefined,
            highlight: c.rank === 1,
          }))}
        />
      </Section>
    </>
  );
}
