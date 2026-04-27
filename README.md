# Cartelera Tracker — Vol. I

> *Inteligencia de mercado del cine y el streaming · Argentina · Cono Sur · LATAM*

Tracker semanal del mercado audiovisual de Argentina y la región, cruzando taquilla con rankings de plataformas de streaming. Proyecto académico personal de **Augusto Parrino**, en el marco de la Maestría en Generación y Análisis de Información Estadística (UNTREF). Sin fines comerciales.

Diseñado como contrapunto audiovisual de [SEPA Tracker](https://sepa-tracker.vercel.app/), aplicando el mismo método: datos públicos, pipeline reproducible, deploy estático, código abierto.

---

## Fuentes de datos

| Fuente | Cubre | Frecuencia | URL |
|---|---|---|---|
| Netflix Tudum (`all-weeks-global.xlsx`) | Top 10 streaming global · horas vistas · views | semanal | [tudum/top10](https://www.netflix.com/tudum/top10) |
| Netflix Tudum (`all-weeks-countries.xlsx`) | Top 10 por país (≥ 90 países) · ranking | semanal | idem |
| Ultracine | Taquilla AR · fin de semana · #1 con espectadores y salas | semanal | [web.ultracine.com/category/taquilla](https://web.ultracine.com/category/taquilla/) |
| Box Office Mojo | Chart doméstico US · top ~30 títulos · recaudación, salas, weeks | semanal | [boxofficemojo.com/weekend/chart](https://www.boxofficemojo.com/weekend/chart/) |
| INCAA Anuarios | Market share anual de distribuidoras AR | anual (PDF) | [incaa.gob.ar/datos-y-estadisticas](https://www.incaa.gob.ar/datos-y-estadisticas/) |
| TMDb API | `production_companies`, idioma original, géneros, `release_date` | bajo demanda | [themoviedb.org](https://www.themoviedb.org/) — requiere `TMDB_API_KEY` |
| JustWatch (scaffold) | Catálogos por plataforma · altas y bajas | semanal · scaffold | [justwatch.com/ar](https://www.justwatch.com/ar) |

---

## Stack

- **Frontend**: Next.js 14 (App Router) · TypeScript · Tailwind. Recharts para visualización. Estética 1930s-40s (Art Deco / vintage trade press) con tipografías Limelight, Cinzel, Playfair Display, Crimson Pro y Special Elite.
- **Pipeline**: Python 3.12 · pandas · BeautifulSoup · requests · openpyxl · pdfplumber. Salidas en JSON estático bajo `public/data/` (sin backend).
- **Storage**: snapshots en `data/snapshots/YYYY-MM-DD/` versionados en git.
- **CI/CD**: GitHub Actions con cron lunes 14:00 ART (`.github/workflows/weekly-update.yml`). Vercel auto-rebuild al detectar push a `main`.

---

## Estructura

```
cartelera-tracker/
├── app/                        Next.js App Router
│   ├── page.tsx                I  — Panorama
│   ├── estudios/page.tsx       II — Estudios (depende de TMDB_API_KEY)
│   ├── tanques/page.tsx        III — Tanques
│   ├── ventanas/page.tsx       IV — Ventanas (US → AR → streaming)
│   ├── plataformas/page.tsx    V — Plataformas (Netflix global)
│   ├── mercados/page.tsx       VI — Mercados (US ↔ AR)
│   ├── catalogos/page.tsx      VII — Catálogos (scaffold)
│   ├── geografia/page.tsx      VIII — Geografía (AR · UY · PY · CL · BR · MX · CO · PE)
│   └── metodologia/page.tsx    IX — Método y limitaciones
├── components/                 Section, StatPlate, Marquee, BillboardTable, charts
├── lib/                        format helpers + data loader (server)
├── public/data/                JSONs consumidos por el front
│   ├── netflix-global.json
│   ├── netflix-countries.json
│   ├── ultracine-weekly.json
│   ├── mojo-weekend.json
│   ├── studio-share.json       (solo si TMDB_API_KEY)
│   └── tmdb-cache.json         (solo si TMDB_API_KEY)
├── scripts/
│   ├── fetch_netflix_tudum.py
│   ├── fetch_box_office_mojo.py
│   ├── scrape_ultracine.py
│   ├── enrich_tmdb.py
│   ├── snapshot_justwatch.py
│   ├── build_aggregates.py     orquesta los anteriores en orden
│   └── studio_mapping.json     production_company_id → bucket
├── data/snapshots/YYYY-MM-DD/  histórico semanal (git)
├── data/raw/                   cache local (gitignored)
├── .github/workflows/weekly-update.yml
└── README.md
```

---

## Cómo correrlo localmente

```bash
# 1. Datos
pip install -r requirements.txt
python scripts/build_aggregates.py        # corre todos los scrapers
# (opcional) export TMDB_API_KEY=xxx; python scripts/enrich_tmdb.py

# 2. Sitio
npm install
npm run dev                                # http://localhost:3000
npm run build && npm start                 # build de producción
```

---

## Limitaciones conocidas — documentadas

- **Netflix Tudum no publica horas/views por país.** Solo a nivel global. La "demanda local" se aproxima usando ranking 1–10 (proxy 11 − rank).
- **Ultracine es texto narrativo, no tablas.** El parser extrae robustamente el total semanal y el #1 con espectadores y salas. Los puestos 2–10 se capturan parcialmente cuando el redactor cita posición + cifra explícitamente. Para el detalle full top 10 se necesita complementar con boletines INCAA o un convenio con Ultracine.
- **Atribución por estudio requiere TMDb.** Los nombres de Netflix Tudum y Ultracine no permiten inferir el estudio sin ambigüedad. El enrichment con TMDb (variable `TMDB_API_KEY`) es la única vía válida; el bucket-mapping curado vive en `scripts/studio_mapping.json`. Sin la key, las secciones por estudio quedan en estado scaffold con la intención editorial documentada.
- **JustWatch (M3) está en scaffold.** Política de uso académico, 1 snapshot por semana, atribución obligatoria. No se ejecuta en el cron hasta validar primer pase manual.
- **INCAA reporta por distribuidora local, no por estudio.** UIP es Universal+Paramount+Sony. La demultiplexación se hace contra TMDb production_companies, no contra los nombres del distribuidor.
- **Box Office Mojo solo expone el mercado doméstico US** en su chart público; las páginas internacionales (incluyendo Argentina) fueron deprecadas en 2023.

---

## Avisos

Las marcas comerciales y nombres de obras audiovisuales pertenecen a sus respectivos titulares. Este sitio no está afiliado, patrocinado ni endorsado por The Walt Disney Company, Warner Bros. Discovery, Netflix, NBCUniversal, Sony Pictures, Paramount Global ni JustWatch. Ante cualquier solicitud razonable de baja por parte de una fuente, se cumplirá sin escalar el conflicto.

Datos de catálogo (cuando se active M3): JustWatch.com · Uso académico no comercial.

This product uses the TMDb API but is not endorsed or certified by TMDb.

---

## Licencia

Código bajo MIT. Los datos pertenecen a sus respectivas fuentes; lo que reside en este repo son agregados públicos derivados, citados con atribución.
