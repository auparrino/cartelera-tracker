"""
enrich_tmdb.py

Enriquece los snapshots de Netflix y Ultracine con metadata de TMDb:
production_companies, original_language, genres, release_date.

Requiere TMDB_API_KEY en el entorno. Si no está, sale con código 0
sin escribir nada (para que el resto del pipeline pueda seguir).

Uso:
    TMDB_API_KEY=xxx python scripts/enrich_tmdb.py

Salida:
    public/data/tmdb-cache.json    -> dict slug -> tmdb metadata
    public/data/studio-share.json  -> agregado de market share por estudio
"""
from __future__ import annotations

import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any

import requests

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "data"
SCRIPTS = ROOT / "scripts"

API = "https://api.themoviedb.org/3"
HEADERS = {"User-Agent": "CarteleraTracker/0.1 (academic UNTREF)"}

logging.basicConfig(format="[tmdb] %(asctime)s %(levelname)s %(message)s", level=logging.INFO)
log = logging.getLogger("tmdb")


def search(api_key: str, title: str, kind: str = "movie") -> dict | None:
    url = f"{API}/search/{kind}"
    r = requests.get(
        url,
        params={"api_key": api_key, "query": title, "language": "es-ES"},
        headers=HEADERS,
        timeout=30,
    )
    if r.status_code == 429:
        time.sleep(2)
        return search(api_key, title, kind)
    r.raise_for_status()
    results = r.json().get("results", [])
    return results[0] if results else None


def details(api_key: str, kind: str, tmdb_id: int) -> dict:
    r = requests.get(
        f"{API}/{kind}/{tmdb_id}",
        params={"api_key": api_key, "language": "es-ES"},
        headers=HEADERS,
        timeout=30,
    )
    r.raise_for_status()
    return r.json()


def assign_studio(production_companies: list[dict], mapping: dict) -> str:
    name_map: dict = mapping.get("name_map", {})
    prefixes = mapping.get("name_prefixes", [])
    # Pase 1: nombre exacto. Recorremos en orden para que la primera coincidencia
    # tenga prioridad (los production_companies vienen ordenadas por relevancia).
    for c in production_companies:
        n = (c.get("name") or "").strip()
        if n in name_map:
            return name_map[n]
    # Pase 2: prefijo. Más conservador que el "substring contains" porque
    # evita falsos positivos cruzados (e.g. una compañía "Lionsgate" no
    # debe matchear con "Showtime").
    for c in production_companies:
        n = (c.get("name") or "").strip()
        for p in prefixes:
            if n.startswith(p["prefix"]):
                return p["bucket"]
    return "Independents"


def main() -> int:
    api_key = os.environ.get("TMDB_API_KEY")
    if not api_key:
        log.warning("TMDB_API_KEY no está configurada. Saltando enrichment.")
        return 0

    mapping = json.loads((SCRIPTS / "studio_mapping.json").read_text(encoding="utf-8"))

    cache_path = PUBLIC / "tmdb-cache.json"
    cache: dict[str, Any] = {}
    if cache_path.exists():
        cache = json.loads(cache_path.read_text(encoding="utf-8"))

    titles_to_resolve: list[tuple[str, str]] = []  # (title, kind)

    g = json.loads((PUBLIC / "netflix-global.json").read_text(encoding="utf-8"))
    for entry in g.get("latest_top10", []) + g.get("top_year", []):
        kind = "movie" if entry["category"].startswith("Films") else "tv"
        titles_to_resolve.append((entry["title"], kind))

    c = json.loads((PUBLIC / "netflix-countries.json").read_text(encoding="utf-8"))
    for country, items in c.get("by_country_latest", {}).items():
        for it in items:
            kind = "movie" if it["category"] == "Films" else "tv"
            titles_to_resolve.append((it["title"], kind))

    u = json.loads((PUBLIC / "ultracine-weekly.json").read_text(encoding="utf-8"))
    for w in u.get("weekly_totals", []):
        if w.get("top1_title"):
            titles_to_resolve.append((w["top1_title"], "movie"))

    seen = set()
    for title, kind in titles_to_resolve:
        key = f"{kind}::{title}"
        if key in seen or key in cache:
            continue
        seen.add(key)
        try:
            hit = search(api_key, title, kind)
            if not hit:
                cache[key] = {"resolved": False}
            else:
                d = details(api_key, kind, hit["id"])
                cache[key] = {
                    "resolved": True,
                    "tmdb_id": hit["id"],
                    "kind": kind,
                    "title": title,
                    "production_companies": d.get("production_companies", []),
                    "original_language": d.get("original_language"),
                    "genres": [g_["name"] for g_ in d.get("genres", [])],
                    "release_date": d.get("release_date") or d.get("first_air_date"),
                    "studio": assign_studio(d.get("production_companies", []), mapping),
                }
            time.sleep(0.25)
        except Exception as e:
            log.warning("fail %s: %s", title, e)
            cache[key] = {"resolved": False, "error": str(e)}

    cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    log.info("wrote cache with %d entries", len(cache))

    # Build studio share aggregate
    share: dict[str, dict] = {
        "by_country_films": {},
        "by_country_tv": {},
        "ultracine_ar_weeks_at_1": {},
        "ultracine_ar_espectadores": {},
        "mojo_us_gross": {},
        "ultracine_weekly_studio": [],
    }

    for country, items in c.get("by_country_latest", {}).items():
        bucket: dict[str, int] = {}
        bucket_tv: dict[str, int] = {}
        for it in items:
            key = f"{'movie' if it['category']=='Films' else 'tv'}::{it['title']}"
            meta = cache.get(key)
            if not meta or not meta.get("resolved"):
                continue
            studio = meta.get("studio", "Independents")
            target = bucket if it["category"] == "Films" else bucket_tv
            target[studio] = target.get(studio, 0) + (11 - int(it["rank"]))
        share["by_country_films"][country] = bucket
        share["by_country_tv"][country] = bucket_tv

    # Ultracine — atribución por estudio para cines AR
    weeks_count: dict[str, int] = {}
    espectadores_acum: dict[str, int] = {}
    weekly_attr: list[dict] = []
    for w in u.get("weekly_totals", []):
        if not w.get("top1_title"):
            continue
        key = f"movie::{w['top1_title']}"
        meta = cache.get(key)
        studio = meta.get("studio", "Independents") if meta and meta.get("resolved") else "Independents"
        weeks_count[studio] = weeks_count.get(studio, 0) + 1
        espectadores_acum[studio] = espectadores_acum.get(studio, 0) + (w.get("top1_espectadores") or 0)
        weekly_attr.append(
            {
                "post_date": w["post_date"],
                "title": w["top1_title"],
                "studio": studio,
                "espectadores": w.get("top1_espectadores"),
                "salas": w.get("top1_salas"),
            }
        )
    share["ultracine_ar_weeks_at_1"] = weeks_count
    share["ultracine_ar_espectadores"] = espectadores_acum
    share["ultracine_weekly_studio"] = weekly_attr

    # Mojo US — atribución por estudio para mercado doméstico US
    mojo_path = PUBLIC / "mojo-weekend.json"
    if mojo_path.exists():
        m = json.loads(mojo_path.read_text(encoding="utf-8"))
        # Resolver títulos US faltantes en cache
        new_titles = []
        for ent in m.get("chart", []):
            t = ent.get("title")
            if not t:
                continue
            k = f"movie::{t}"
            if k in cache:
                continue
            new_titles.append(t)
        for t in new_titles:
            try:
                hit = search(api_key, t, "movie")
                if not hit:
                    cache[f"movie::{t}"] = {"resolved": False}
                    continue
                d = details(api_key, "movie", hit["id"])
                cache[f"movie::{t}"] = {
                    "resolved": True,
                    "tmdb_id": hit["id"],
                    "kind": "movie",
                    "title": t,
                    "production_companies": d.get("production_companies", []),
                    "original_language": d.get("original_language"),
                    "genres": [g_["name"] for g_ in d.get("genres", [])],
                    "release_date": d.get("release_date"),
                    "studio": assign_studio(d.get("production_companies", []), mapping),
                }
                time.sleep(0.25)
            except Exception as e:
                log.warning("US fail %s: %s", t, e)
        # Re-write cache
        cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

        mojo_studio: dict[str, int] = {}
        for ent in m.get("chart", []):
            t = ent.get("title")
            gross = ent.get("weekend_gross_usd") or 0
            if not t:
                continue
            meta = cache.get(f"movie::{t}")
            studio = meta.get("studio", "Independents") if meta and meta.get("resolved") else "Independents"
            mojo_studio[studio] = mojo_studio.get(studio, 0) + gross
        share["mojo_us_gross"] = mojo_studio

    (PUBLIC / "studio-share.json").write_text(
        json.dumps({"source": "TMDb (enrich)", "share": share}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    log.info("wrote studio-share.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
