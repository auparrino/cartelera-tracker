"""
fetch_netflix_tudum.py

Descarga los XLSX oficiales de Netflix Tudum Top 10 (global y por país),
filtra Cono Sur + LATAM relevante, y produce los snapshots JSON que consume
el frontend.

Fuente: https://www.netflix.com/tudum/top10
- all-weeks-global.xlsx     -> incluye weekly_hours_viewed, runtime, weekly_views
- all-weeks-countries.xlsx  -> incluye ranking 1..10 por país y semana, sin horas

Limitación documentada: Netflix solo publica horas/views a nivel global.
A nivel país solo hay ranking. Usamos el ranking como proxy de demanda.
"""
from __future__ import annotations

import argparse
import json
import logging
import sys
from datetime import date
from pathlib import Path

import pandas as pd
import requests

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
SNAPSHOTS = ROOT / "data" / "snapshots"
PUBLIC = ROOT / "public" / "data"

URL_COUNTRIES = "https://www.netflix.com/tudum/top10/data/all-weeks-countries.xlsx"
URL_GLOBAL = "https://www.netflix.com/tudum/top10/data/all-weeks-global.xlsx"

# Países foco del proyecto. Cono Sur + LATAM grandes.
FOCUS_COUNTRIES = {
    "Argentina": "AR",
    "Uruguay": "UY",
    "Paraguay": "PY",
    "Chile": "CL",
    "Brazil": "BR",
    "Mexico": "MX",
    "Colombia": "CO",
    "Peru": "PE",
}

UA = "CarteleraTracker/0.1 (+academico-UNTREF; contacto: augustoparrino@gmail.com)"

logging.basicConfig(
    format="[netflix] %(asctime)s %(levelname)s %(message)s",
    level=logging.INFO,
)
log = logging.getLogger("netflix")


def download(url: str, dest: Path) -> None:
    log.info("GET %s", url)
    r = requests.get(url, headers={"User-Agent": UA}, timeout=120)
    r.raise_for_status()
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(r.content)
    log.info("wrote %s (%d bytes)", dest, len(r.content))


def load_xlsx(path: Path) -> pd.DataFrame:
    return pd.read_excel(path, sheet_name=0)


def normalize_week(s: pd.Series) -> pd.Series:
    return pd.to_datetime(s).dt.date.astype(str)


def build_country_data(df: pd.DataFrame) -> dict:
    df = df.copy()
    df["week"] = normalize_week(df["week"])
    df = df[df["country_name"].isin(FOCUS_COUNTRIES.keys())].copy()

    latest_week = df["week"].max()

    out: dict = {
        "source": "Netflix Tudum (all-weeks-countries.xlsx)",
        "source_url": URL_COUNTRIES,
        "fetched_at": date.today().isoformat(),
        "latest_week": latest_week,
        "countries_focus": list(FOCUS_COUNTRIES.keys()),
        "weeks": sorted(df["week"].unique(), reverse=True),
        "by_country_latest": {},
        "longest_runs": {},
        "title_geography": {},
    }

    for country in FOCUS_COUNTRIES.keys():
        sub = df[df["country_name"] == country]
        if sub.empty:
            continue
        latest = sub[sub["week"] == sub["week"].max()].sort_values(["category", "weekly_rank"])
        out["by_country_latest"][country] = [
            {
                "category": r.category,
                "rank": int(r.weekly_rank),
                "title": r.show_title,
                "season": (r.season_title if pd.notna(r.season_title) else None),
                "weeks_in_top10": int(r.cumulative_weeks_in_top_10),
            }
            for r in latest.itertuples()
        ]
        # Top longevidad histórica país
        long_runs = (
            sub.groupby(["show_title", "category"])["cumulative_weeks_in_top_10"]
            .max()
            .reset_index()
            .sort_values("cumulative_weeks_in_top_10", ascending=False)
            .head(15)
        )
        out["longest_runs"][country] = [
            {
                "title": r.show_title,
                "category": r.category,
                "max_weeks": int(r.cumulative_weeks_in_top_10),
            }
            for r in long_runs.itertuples()
        ]

    # Cobertura geográfica: mismo show_title presente en cuántos países foco la última semana
    last4 = df[df["week"] >= sorted(df["week"].unique())[-4]]
    cov = (
        last4.groupby(["show_title", "category"])["country_name"]
        .nunique()
        .reset_index()
        .rename(columns={"country_name": "countries_count"})
    )
    cov = cov.sort_values("countries_count", ascending=False)
    titles_top = cov.head(40)
    geo: dict = {}
    for r in titles_top.itertuples():
        title = r.show_title
        rows = last4[last4["show_title"] == title]
        per_country = (
            rows.groupby("country_name")["weekly_rank"].min().to_dict()
        )
        geo[title] = {
            "category": r.category,
            "countries_present": int(r.countries_count),
            "best_rank_by_country": {k: int(v) for k, v in per_country.items()},
        }
    out["title_geography"] = geo

    return out


def build_global_data(df: pd.DataFrame) -> dict:
    df = df.copy()
    df["week"] = normalize_week(df["week"])
    latest_week = df["week"].max()

    latest = df[df["week"] == latest_week].copy()

    # 26 weeks rolling
    weeks_sorted = sorted(df["week"].unique())
    last_26 = weeks_sorted[-26:]
    last_52 = weeks_sorted[-52:]

    rolling = df[df["week"].isin(last_26)].copy()

    # Hours por categoría / semana
    cat_week = (
        rolling.groupby(["week", "category"])["weekly_hours_viewed"].sum().reset_index()
    )

    # Top hours último año
    last_year = df[df["week"].isin(last_52)].copy()
    top_year = (
        last_year.groupby(["show_title", "category"])
        .agg(
            total_hours=("weekly_hours_viewed", "sum"),
            total_views=("weekly_views", "sum"),
            weeks_charted=("week", "nunique"),
            best_rank=("weekly_rank", "min"),
        )
        .reset_index()
        .sort_values("total_hours", ascending=False)
        .head(40)
    )

    out = {
        "source": "Netflix Tudum (all-weeks-global.xlsx)",
        "source_url": URL_GLOBAL,
        "fetched_at": date.today().isoformat(),
        "latest_week": latest_week,
        "latest_top10": [
            {
                "category": r.category,
                "rank": int(r.weekly_rank),
                "title": r.show_title,
                "season": (r.season_title if pd.notna(r.season_title) else None),
                "hours_viewed": int(r.weekly_hours_viewed) if pd.notna(r.weekly_hours_viewed) else None,
                "views": int(r.weekly_views) if pd.notna(r.weekly_views) else None,
                "runtime_hours": float(r.runtime) if pd.notna(r.runtime) else None,
                "weeks_in_top10": int(r.cumulative_weeks_in_top_10),
            }
            for r in latest.sort_values(["category", "weekly_rank"]).itertuples()
        ],
        "rolling_26w_by_category": [
            {"week": r.week, "category": r.category, "hours_viewed": int(r.weekly_hours_viewed)}
            for r in cat_week.itertuples()
        ],
        "top_year": [
            {
                "title": r.show_title,
                "category": r.category,
                "total_hours": int(r.total_hours),
                "total_views": int(r.total_views) if pd.notna(r.total_views) else None,
                "weeks_charted": int(r.weeks_charted),
                "best_rank": int(r.best_rank),
            }
            for r in top_year.itertuples()
        ],
    }

    return out


def maybe_archive_snapshot(country_data: dict, global_data: dict) -> None:
    week = country_data.get("latest_week")
    if not week:
        return
    snap = SNAPSHOTS / week
    snap.mkdir(parents=True, exist_ok=True)
    (snap / "netflix-countries.json").write_text(json.dumps(country_data, ensure_ascii=False, indent=2), encoding="utf-8")
    (snap / "netflix-global.json").write_text(json.dumps(global_data, ensure_ascii=False, indent=2), encoding="utf-8")
    log.info("archived snapshot %s", snap)


def main(skip_download: bool = False) -> int:
    countries_path = RAW / "netflix-countries.xlsx"
    global_path = RAW / "netflix-global.xlsx"

    if not skip_download or not countries_path.exists():
        download(URL_COUNTRIES, countries_path)
    if not skip_download or not global_path.exists():
        download(URL_GLOBAL, global_path)

    log.info("loading XLSX into pandas")
    df_countries = load_xlsx(countries_path)
    df_global = load_xlsx(global_path)

    log.info("building country aggregates")
    country_data = build_country_data(df_countries)
    log.info("building global aggregates")
    global_data = build_global_data(df_global)

    PUBLIC.mkdir(parents=True, exist_ok=True)
    (PUBLIC / "netflix-countries.json").write_text(
        json.dumps(country_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (PUBLIC / "netflix-global.json").write_text(
        json.dumps(global_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    log.info("wrote public/data JSONs")

    maybe_archive_snapshot(country_data, global_data)
    return 0


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--skip-download", action="store_true", help="reuse cached XLSX in data/raw")
    args = p.parse_args()
    sys.exit(main(skip_download=args.skip_download))
