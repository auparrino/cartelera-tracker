"""
fetch_box_office_mojo.py

Scrapea el chart semanal del mercado doméstico de USA desde Box Office Mojo
(https://www.boxofficemojo.com/weekend/chart/) y produce un JSON con la
foto del último fin de semana relevado.

Uso típico: cruzar US vs AR cada lunes para ver qué títulos viajan y
qué títulos pegan diferente regionalmente.

Limitación: Box Office Mojo solo expone el mercado doméstico US en este
endpoint público. Box-office por país (ya no indexado) requeriría otro
camino. Para la sección de ventanas y de market share comparado, este
JSON cubre el lado US del cruce.
"""
from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from datetime import date
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
PUBLIC = ROOT / "public" / "data"

URL = "https://www.boxofficemojo.com/weekend/chart/"
UA = "CarteleraTracker/0.1 (+academico-UNTREF; contacto: augustoparrino@gmail.com)"

logging.basicConfig(format="[mojo] %(asctime)s %(levelname)s %(message)s", level=logging.INFO)
log = logging.getLogger("mojo")


def parse_money(s: str) -> int | None:
    if not s or s == "-":
        return None
    s = s.replace("$", "").replace(",", "").strip()
    try:
        return int(s)
    except ValueError:
        return None


def parse_pct(s: str) -> float | None:
    if not s or s == "-":
        return None
    m = re.search(r"(-?[0-9.]+)", s)
    return float(m.group(1)) if m else None


def parse_int(s: str) -> int | None:
    if not s or s == "-":
        return None
    s = s.replace(",", "").strip()
    try:
        return int(s)
    except ValueError:
        return None


def fetch_and_parse() -> dict:
    log.info("GET %s", URL)
    r = requests.get(URL, headers={"User-Agent": UA}, timeout=60)
    r.raise_for_status()
    raw_path = RAW / "mojo-weekend.html"
    raw_path.parent.mkdir(parents=True, exist_ok=True)
    raw_path.write_text(r.text, encoding="utf-8")

    soup = BeautifulSoup(r.text, "html.parser")

    # Extract weekend label
    weekend_label = ""
    for h in soup.find_all(["h1", "h2", "h3"]):
        t = h.get_text(" ", strip=True)
        if "Weekend" in t and "Domestic" in t:
            weekend_label = t
            break

    table = soup.find("table")
    rows = []
    if table:
        for tr in table.find_all("tr")[1:]:
            cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
            if len(cells) < 8:
                continue
            rows.append(
                {
                    "rank": parse_int(cells[0]),
                    "rank_last_week": cells[1] if cells[1] != "-" else None,
                    "title": cells[2],
                    "weekend_gross_usd": parse_money(cells[3]),
                    "change_vs_lw_pct": parse_pct(cells[4]),
                    "theaters": parse_int(cells[5]),
                    "theaters_change": parse_int(cells[6]),
                    "average_per_theater_usd": parse_money(cells[7]),
                    "total_domestic_usd": parse_money(cells[8]) if len(cells) > 8 else None,
                    "weeks_in_release": parse_int(cells[9]) if len(cells) > 9 else None,
                }
            )

    out = {
        "source": "Box Office Mojo · Weekend Chart (Domestic US)",
        "source_url": URL,
        "fetched_at": date.today().isoformat(),
        "weekend_label": weekend_label,
        "chart": rows,
    }
    return out


def main() -> int:
    out = fetch_and_parse()
    PUBLIC.mkdir(parents=True, exist_ok=True)
    (PUBLIC / "mojo-weekend.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    log.info("wrote mojo-weekend.json with %d titles · %s", len(out["chart"]), out["weekend_label"])
    return 0


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    args = p.parse_args()
    sys.exit(main())
