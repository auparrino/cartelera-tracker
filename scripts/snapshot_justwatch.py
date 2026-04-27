"""
snapshot_justwatch.py  —  scaffold (no se ejecuta por defecto)

Toma un snapshot semanal del catálogo público de cada plataforma en JustWatch
para Argentina:
  - https://www.justwatch.com/ar/proveedor/disney-plus
  - https://www.justwatch.com/ar/proveedor/max
  - https://www.justwatch.com/ar/proveedor/netflix
  - https://www.justwatch.com/ar/proveedor/prime-video
  - https://www.justwatch.com/ar/proveedor/paramount-plus

Política de uso:
  - 1 snapshot por semana, no más.
  - User-Agent identificable y respetuoso.
  - Atribución obligatoria en toda visualización derivada:
      "Datos de catálogo: JustWatch.com · Uso académico no comercial"
  - Si JustWatch contacta para tomar la página: cumplir, sin escalar.

Estado: scaffold. Requiere Playwright instalado y un primer snapshot
manual antes de habilitarlo en el cron.
"""
from __future__ import annotations

import argparse
import logging
import sys

logging.basicConfig(format="[justwatch] %(asctime)s %(levelname)s %(message)s", level=logging.INFO)
log = logging.getLogger("justwatch")

PROVIDERS = {
    "disney-plus": "https://www.justwatch.com/ar/proveedor/disney-plus",
    "max": "https://www.justwatch.com/ar/proveedor/max",
    "netflix": "https://www.justwatch.com/ar/proveedor/netflix",
    "prime-video": "https://www.justwatch.com/ar/proveedor/prime-video",
    "paramount-plus": "https://www.justwatch.com/ar/proveedor/paramount-plus",
}


def main() -> int:
    log.warning(
        "M3 (catálogos JustWatch) está en estado scaffold. "
        "No se ejecuta automáticamente todavía. "
        "Ver scripts/snapshot_justwatch.py y la sección 06 del sitio."
    )
    return 0


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--run", action="store_true", help="(reservado) ejecutar el scrape real")
    args = p.parse_args()
    sys.exit(main())
