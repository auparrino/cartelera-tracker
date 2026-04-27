import Section from "@/components/Section";

export const revalidate = 3600;

export default function MetodologiaPage() {
  return (
    <>
      <Section
        number="VIII"
        kicker="Cómo se construye"
        title="Metodología"
        subtitle="Fuentes, frecuencia, limitaciones, código abierto"
      >
        <div className="vintage-card p-6">
          <h3 className="font-deco tracking-deco uppercase text-sm text-oxblood mb-3">
            Cadencia · Lunes 14:00 ART
          </h3>
          <p className="font-serif text-base text-ink leading-relaxed">
            El pipeline corre como GitHub Action programada los lunes a las 14:00 hora argentina, después de que Netflix Tudum publique los datos de la semana cerrada el domingo. El workflow ejecuta en orden los scripts de <span className="font-mono">scripts/</span>, regenera los JSON en <span className="font-mono">public/data/</span> y commitea los cambios; Vercel rebuildea automáticamente al detectar el push a <span className="font-mono">main</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-6">
          {[
            {
              title: "Netflix Tudum",
              kicker: "Streaming · Top 10",
              body: "XLSX oficiales actualizados semanalmente. all-weeks-global.xlsx incluye horas vistas, runtime y views; all-weeks-countries.xlsx incluye ranking por país. Cobertura: junio 2021 — presente.",
              limit: "Limitación: Netflix solo publica horas/views a nivel global. A nivel país solo hay ranking 1–10. La 'demanda local' se aproxima sumando 11 − rank.",
              url: "https://www.netflix.com/tudum/top10",
            },
            {
              title: "Ultracine",
              kicker: "Taquilla · Argentina",
              body: "Posts semanales del blog Ultracine.com con el reporte de fin de semana. Parser tolerante con regex; extrae total de entradas vendidas y la película #1 con espectadores y salas.",
              limit: "Limitación: el detalle de top 4–10 está en texto narrativo no estructurado. La cobertura del 4–10 es parcial (solo cuando el redactor cita la posición y la cifra explícitamente). Se documenta como brecha y se compensará con boletines INCAA.",
              url: "https://web.ultracine.com/category/taquilla/",
            },
            {
              title: "Box Office Mojo",
              kicker: "Taquilla · USA",
              body: "Chart semanal del mercado doméstico de USA. ~30 títulos por fin de semana con recaudación, salas, average por sala, change vs. last week y total acumulado. Sirve de contrapunto al chart AR para ver qué títulos viajan y qué títulos pegan diferente regionalmente.",
              limit: "Limitación: solo expone mercado doméstico US en su endpoint público. Las páginas internacionales (incluyendo Argentina) fueron deprecadas en 2023.",
              url: "https://www.boxofficemojo.com/weekend/chart/",
            },
            {
              title: "INCAA",
              kicker: "Anuarios · Argentina",
              body: "PDFs de los Anuarios Estadísticos del INCAA con market share anual de distribuidoras. Provee el contexto histórico 2018–2024 para contrastar el dato semanal con el anual.",
              limit: "Limitación: el anuario reporta por distribuidora local (UIP, BF, Diamond), no por estudio. UIP debe demultiplexarse en Universal+Paramount+Sony usando production_companies de TMDb.",
              url: "https://www.incaa.gob.ar/datos-y-estadisticas",
            },
            {
              title: "TMDb",
              kicker: "Enrichment · production_companies",
              body: "API gratuita de The Movie Database. Provee production_companies, original_language, genres y release_date para cada título. El mapping a buckets de estudio se mantiene en scripts/studio_mapping.json.",
              limit: "Limitación: requiere API key (variable TMDB_API_KEY). Sin la key, el enrichment se saltea y las secciones que dependen de atribución por estudio quedan en estado scaffold.",
              url: "https://www.themoviedb.org/",
            },
            {
              title: "JustWatch",
              kicker: "Catálogos · scaffold",
              body: "Páginas públicas /ar/proveedor/* scrapeadas con Playwright. 1 snapshot/semana por plataforma. Comparativo N vs N-1 produce altas y bajas.",
              limit: "Limitación: política de uso restringe BI comercial. Se usa en modo académico, con atribución obligatoria 'Datos de catálogo: JustWatch.com · Uso académico no comercial' en cada visualización derivada.",
              url: "https://www.justwatch.com/ar",
            },
          ].map((s) => (
            <div key={s.title} className="vintage-card p-5 flex flex-col">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-smoke/80">
                {s.kicker}
              </div>
              <div className="font-deco tracking-deco uppercase text-base text-oxblood mt-1">
                {s.title}
              </div>
              <p className="font-serif text-base text-ink mt-3 leading-relaxed">{s.body}</p>
              <p className="font-serif italic text-smoke text-sm mt-3 leading-relaxed border-t border-ink/15 pt-3">
                {s.limit}
              </p>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[10px] tracking-[0.18em] uppercase text-oxblood hover:text-ink mt-auto pt-3"
              >
                ↗ Fuente original
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Section number="VIII.b" kicker="Stack" title="Cómo está hecho">
        <div className="vintage-card p-6 font-serif text-base text-ink leading-relaxed">
          <ul className="list-disc ml-5 space-y-2">
            <li>
              <strong>Frontend</strong>: Next.js 14 (App Router), TypeScript, Tailwind. Visualizaciones con Recharts. Despliegue a Vercel.
            </li>
            <li>
              <strong>Pipeline de datos</strong>: Python 3.12, Pandas, BeautifulSoup, requests. Salidas en JSON estático bajo <span className="font-mono">public/data/</span>; sin backend.
            </li>
            <li>
              <strong>Storage histórico</strong>: snapshots Parquet/JSON versionados en git bajo <span className="font-mono">data/snapshots/YYYY-MM-DD/</span>.
            </li>
            <li>
              <strong>CI</strong>: GitHub Actions con cron lunes 14:00 ART. Commit&nbsp;+ push al detectar nuevos datos; Vercel rebuildea.
            </li>
            <li>
              <strong>Repositorio</strong>: <span className="font-mono">cartelera-tracker/</span> · código abierto · MIT.
            </li>
          </ul>
        </div>
      </Section>

      <Section number="VIII.c" kicker="Aviso editorial" title="Sobre la naturaleza de este proyecto">
        <div className="vintage-card p-6 font-serif italic text-smoke leading-relaxed">
          <p>
            Cartelera Tracker es un proyecto académico personal de Augusto Parrino, en el marco de la Maestría en Generación y Análisis de Información Estadística de la Universidad Nacional de Tres de Febrero (UNTREF). No tiene fines comerciales, no monetiza tráfico, no compite con productos de terceros. Las marcas, logos y nombres de las plataformas, estudios, distribuidores y obras audiovisuales referidas pertenecen a sus respectivos titulares y se citan únicamente como referencia descriptiva.
          </p>
          <p className="mt-3">
            Si una fuente solicita la baja de su atribución o el cese de uso de su material, se cumplirá con la solicitud sin escalar el conflicto. El proyecto está diseñado para ser respetuoso del trabajo del periodismo de industria (Ultracine, Variety Latino, Otros Cines) y de los servicios públicos de datos (Netflix Tudum, INCAA), no para sustituirlos.
          </p>
        </div>
      </Section>
    </>
  );
}
