import Section from "@/components/Section";
import BillboardTable from "@/components/BillboardTable";
import { loadAll } from "@/lib/data";
import { fmtInt, fmtMillions } from "@/lib/format";

export const revalidate = 3600;

export default async function TanquesPage() {
  const { global, ultracine } = await loadAll();

  if (!global || !ultracine) return null;

  // Top tanques globales año móvil — Netflix
  const topGlobalFilms = global.top_year
    .filter((t) => t.category.startsWith("Films"))
    .slice(0, 10);
  const topGlobalTV = global.top_year
    .filter((t) => t.category.startsWith("TV"))
    .slice(0, 10);

  // Cines AR: ranking acumulado de top1 por número de semanas como #1
  const top1Counts: Record<string, { weeks: number; espectadores: number; salas: number }> = {};
  for (const w of ultracine.weekly_totals) {
    if (!w.top1_title) continue;
    const k = w.top1_title;
    if (!top1Counts[k]) top1Counts[k] = { weeks: 0, espectadores: 0, salas: 0 };
    top1Counts[k].weeks += 1;
    top1Counts[k].espectadores += w.top1_espectadores || 0;
    top1Counts[k].salas = Math.max(top1Counts[k].salas, w.top1_salas || 0);
  }
  const arTop1 = Object.entries(top1Counts)
    .sort((a, b) => b[1].weeks - a[1].weeks)
    .slice(0, 12);

  return (
    <>
      <Section
        number="III"
        kicker="Mass-market giants"
        title="Tanques"
        subtitle="Las franquicias y eventos que mueven el mercado"
      >
        <p className="font-serif text-smoke max-w-3xl mb-6">
          Un tanque es un título que sostiene primer puesto múltiples semanas o que acumula horas de visualización descomunales en su ventana. Aquí el ranking de los últimos 52 weeks con datos públicos.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          <BillboardTable
            caption="Top año · Films global Netflix"
            rightLabel="Horas vistas"
            rows={topGlobalFilms.map((t, i) => ({
              rank: i + 1,
              title: t.title,
              meta: `${t.category} · ${t.weeks_charted} semanas en chart · mejor #${t.best_rank}`,
              right: fmtMillions(t.total_hours) + " h",
              rightSub: t.total_views ? `${fmtMillions(t.total_views)} views` : undefined,
              highlight: i === 0,
            }))}
          />
          <BillboardTable
            caption="Top año · TV global Netflix"
            rightLabel="Horas vistas"
            rows={topGlobalTV.map((t, i) => ({
              rank: i + 1,
              title: t.title,
              meta: `${t.category} · ${t.weeks_charted} semanas en chart · mejor #${t.best_rank}`,
              right: fmtMillions(t.total_hours) + " h",
              rightSub: t.total_views ? `${fmtMillions(t.total_views)} views` : undefined,
              highlight: i === 0,
            }))}
          />
        </div>
      </Section>

      <Section
        number="III.b"
        kicker="Quién dominó la pantalla grande"
        title="Líderes seriales en cines AR"
        subtitle="Cuántos fines de semana al frente · período relevado"
      >
        <BillboardTable
          rightLabel="Sem. en #1 · espectadores acumulados"
          rows={arTop1.map(([title, info], i) => ({
            rank: i + 1,
            title,
            meta: `${info.weeks} fin${info.weeks === 1 ? "" : "es"} de semana en primer puesto · pico ${fmtInt(info.salas)} salas`,
            right: info.weeks.toString(),
            rightSub: `${fmtInt(info.espectadores)} esp.`,
            highlight: i === 0,
          }))}
        />
        <p className="mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70">
          Fuente · Ultracine — solo se contabilizan fines de semana donde el #1 fue extraído correctamente del texto del posteo. La cobertura cubre {ultracine.weekly_totals.length} fines de semana.
        </p>
      </Section>
    </>
  );
}
