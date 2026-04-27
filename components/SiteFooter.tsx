export default function SiteFooter() {
  return (
    <footer className="border-t border-ink/80 bg-ivory mt-12">
      <div className="marquee-rule" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10">
        <div className="text-center">
          <div className="ornament text-2xl mb-4">✦ ◆ ✦</div>
          <p className="font-deco tracking-deco uppercase text-[0.7rem] text-smoke">
            Fuentes · Netflix Tudum · Ultracine · INCAA · TMDb · JustWatch
          </p>
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-smoke/70 mt-3">
            v0.1.0 · MMXXVI · Build académico — uso no comercial
          </p>
          <p className="font-serif italic text-[0.78rem] text-smoke/80 mt-4 max-w-2xl mx-auto">
            Las marcas comerciales referidas pertenecen a sus respectivos titulares. Este sitio
            no está afiliado, patrocinado ni endorsado por The Walt Disney Company, Warner Bros.
            Discovery, Netflix, NBCUniversal, Sony Pictures, Paramount Global o JustWatch.
          </p>
        </div>
      </div>
      <div className="bg-deco-rays-fixed h-3 border-t border-ink/30" aria-hidden />
    </footer>
  );
}
