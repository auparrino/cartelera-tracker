# Deploy

## 1 · Inicializar git y subir a GitHub

```bash
git init
git add .
git commit -m "Cartelera Tracker · Vol. I · scaffold + datos reales (week 17 · 2026)"
git branch -M main
git remote add origin git@github.com:augustoparrino/cartelera-tracker.git
git push -u origin main
```

Sugerencia: nombrar el repo `cartelera-tracker` y la URL será `https://github.com/augustoparrino/cartelera-tracker`.

## 2 · Vercel

1. Importar el repo desde el dashboard de Vercel (Add New Project · Import Git Repository).
2. Framework preset: **Next.js** (auto-detect).
3. Configurar variables de entorno (Settings · Environment Variables):
   - `TMDB_API_KEY` = tu API key de TMDb (la generada en `themoviedb.org/settings/api`).
4. Dominio sugerido: `cartelera-tracker.vercel.app`.

## 3 · GitHub Actions · TMDB_API_KEY

El workflow `.github/workflows/weekly-update.yml` corre el pipeline los lunes a las 14:00 ART. Para que el enrichment con TMDb pueda correrse en el cron, agregar el secreto:

1. Settings · Secrets and variables · Actions · New repository secret.
2. Name: `TMDB_API_KEY`
3. Value: la misma key que pusiste en Vercel.

El workflow ya lee `secrets.TMDB_API_KEY` y lo expone como variable de entorno al script. Si no existe, `enrich_tmdb.py` saltea el enrichment y deja las secciones dependientes en estado scaffold sin romper la corrida.

## 4 · Primer run del pipeline en CI

En el dashboard de GitHub, pestaña **Actions**, correr el workflow `Weekly data update` con `Run workflow` (manual dispatch). Esto valida la pipeline punta a punta y commitea los datos refrescados a `main`. Vercel detectará el push y rebuildeará.

## 5 · Atribución JustWatch (cuando se active M3)

Antes de habilitar el scraper de catálogos, agregar en cada visualización derivada de JustWatch el footer literal:

> Datos de catálogo: JustWatch.com · Uso académico no comercial

El scaffold del scraper vive en `scripts/snapshot_justwatch.py` y la página se hidrata desde `public/data/justwatch-*.json` (a generar).
