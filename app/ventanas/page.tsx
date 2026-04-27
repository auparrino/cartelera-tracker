import Section from "@/components/Section";

export const revalidate = 3600;

export default function VentanasPage() {
  return (
    <>
      <Section
        number="IV"
        kicker="Time-to-window"
        title="Ventanas"
        subtitle="Distancia entre estreno US, estreno AR y debut en streaming"
      >
        <div className="vintage-card p-6">
          <p className="font-serif text-base sm:text-lg text-ink leading-relaxed">
            Esta sección compara, para cada estudio, la latencia entre tres eventos:{" "}
            <em>estreno doméstico US</em>, <em>estreno comercial AR</em> y{" "}
            <em>llegada a streaming</em> (Netflix, Disney+, Max, Prime Video, Paramount+).
          </p>

          <div className="deco-divider my-5"><span className="ornament">✦</span></div>

          <div className="border border-oxblood/40 bg-oxblood/5 p-5">
            <div className="stamp-tag mb-3">EN PIPELINE — REQUIERE TMDB_API_KEY</div>
            <p className="font-serif text-smoke leading-relaxed">
              La fecha US se obtiene del campo <span className="font-mono text-ink">release_date</span> de TMDb (release_type=3, theatrical). La fecha AR se cruza desde Ultracine cuando el post menciona explícitamente la semana de estreno; o se infiere como la primera aparición en el ranking de taquilla. La fecha de streaming se construye desde JustWatch (módulo VI · Catálogos).
            </p>
            <p className="font-serif italic text-smoke text-sm mt-3 leading-relaxed">
              El tracker está armado para producir tres métricas por estudio:
            </p>
            <ul className="font-serif text-smoke text-sm leading-relaxed mt-2 ml-5 list-disc">
              <li><em>Ventana US → AR</em>: días entre estreno doméstico y debut comercial argentino (mide prioridad regional del estudio).</li>
              <li><em>Ventana cines → streaming</em>: días entre el primer fin de semana en taquilla AR y la primera aparición en JustWatch dentro de la plataforma del estudio.</li>
              <li><em>Hold ratio semana 1 → semana 2</em>: caída relativa entre debut y semana siguiente, indicador de fuerza de marca.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section
        number="IV.b"
        kicker="Hipótesis editoriales a verificar"
        title="Lo que los datos deberían mostrar"
      >
        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              title: "Disney comprime ventanas en LATAM",
              body: "El paquete de eventos (Marvel, Pixar, Lucasfilm) suele estrenar AR el mismo día que US o con menos de 7 días de diferencia. Verificar contra el estándar histórico de 21–35 días que mantenían los estudios en pre-pandemia.",
            },
            {
              title: "Warner consolidó hacia Max",
              body: "Las ventanas cines → streaming colapsan a 30–45 días desde 2024. Relevar si Argentina sigue el mismo calendario que US o si hay rezago.",
            },
            {
              title: "El cine argentino gana hold por boca a boca",
              body: "Producciones locales (Homo Argentum, Cazzu en Risa) deberían mostrar caídas de S1→S2 más leves que los blockbusters dada su trayectoria de larga duración.",
            },
            {
              title: "Streaming no canibaliza pico de cine",
              body: "Las semanas de mayor taquilla absoluta (Wicked, Avatar, Mario Galaxy) coinciden con sostenimiento de horas globales en Netflix. El catálogo no compite con el evento.",
            },
          ].map((h) => (
            <div key={h.title} className="vintage-card p-5">
              <div className="font-deco tracking-deco uppercase text-sm text-oxblood mb-2">{h.title}</div>
              <p className="font-serif italic text-smoke leading-relaxed">{h.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
