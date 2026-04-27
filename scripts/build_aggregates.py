"""
build_aggregates.py

Orquesta los pipelines en orden, ideal para correr desde GitHub Actions.

Orden:
  1. fetch_netflix_tudum.py     — XLSX globales y por país
  2. fetch_box_office_mojo.py   — chart semanal US
  3. scrape_ultracine.py        — taquilla AR (incremental, cachea HTML)
  4. enrich_tmdb.py             — solo si TMDB_API_KEY está en el entorno
  5. snapshot_justwatch.py      — scaffold; no se ejecuta hasta confirmar TOS

Cada paso es tolerante a fallos: si uno explota, el siguiente sigue.
Esto permite que un cambio puntual de schema en una fuente no rompa
todo el ciclo semanal.
"""
from __future__ import annotations

import logging
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PY = sys.executable

logging.basicConfig(format="[build] %(asctime)s %(levelname)s %(message)s", level=logging.INFO)
log = logging.getLogger("build")

STEPS = [
    ["scripts/fetch_netflix_tudum.py"],
    ["scripts/fetch_box_office_mojo.py"],
    ["scripts/scrape_ultracine.py", "--max-pages", "8"],
    ["scripts/enrich_tmdb.py"],
    ["scripts/snapshot_justwatch.py"],
]


def main() -> int:
    failures = 0
    for cmd in STEPS:
        full = [PY, *cmd]
        log.info("RUN %s", " ".join(cmd))
        try:
            subprocess.run(full, cwd=str(ROOT), check=True)
        except subprocess.CalledProcessError as e:
            log.warning("step failed (rc=%s): %s — continuing", e.returncode, " ".join(cmd))
            failures += 1
    log.info("done · failures=%d", failures)
    # Soft exit 0; the workflow se commitea aunque haya fallas parciales.
    return 0


if __name__ == "__main__":
    sys.exit(main())
