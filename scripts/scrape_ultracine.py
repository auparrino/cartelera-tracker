"""
scrape_ultracine.py

Recolecta datos de taquilla argentina desde el blog Ultracine
(https://web.ultracine.com/category/taquilla/), parseando los posts
semanales de "Taquilla del fin de semana".

Limitación documentada:
los posts son texto narrativo, no tablas estructuradas, así que la
cobertura es:
  - Total de entradas vendidas el fin de semana (siempre presente).
  - Película #1 con espectadores y salas (siempre presente).
  - Películas #2 y #3 cuando el redactor las menciona explícitamente
    con cifras (no siempre).
  - Acumulado y % de variación cuando el texto los explicita.

El detalle del top 4-10 NO está disponible en formato parseable; se
documenta en /08-metodologia y queda como tarea de mejora futura
(complementar con boletines INCAA o pedido directo a Ultracine).
"""
from __future__ import annotations

import argparse
import json
import logging
import re
import sys
import time
from datetime import date
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "ultracine"
PUBLIC = ROOT / "public" / "data"

UA = "CarteleraTracker/0.1 (+academico-UNTREF; contacto: augustoparrino@gmail.com)"
HEADERS = {"User-Agent": UA, "Accept-Language": "es-AR,es;q=0.9"}

LISTING_BASE = "https://web.ultracine.com/category/taquilla/"

logging.basicConfig(format="[ultracine] %(asctime)s %(levelname)s %(message)s", level=logging.INFO)
log = logging.getLogger("ultracine")


def get(url: str) -> str:
    r = requests.get(url, headers=HEADERS, timeout=60)
    r.raise_for_status()
    # Ultracine declara <meta charset="utf-8"> pero requests a veces detecta latin-1
    # por el Content-Type del header. Forzar utf-8 evita los � en títulos con tildes.
    r.encoding = "utf-8"
    return r.text


SLUG_DATE_RE = re.compile(r"/(\d{4})/(\d{2})/(\d{2})/([^/]+)/?$")
WEEKEND_RE = re.compile(r"taquilla[-\s]del[-\s]fin[-\s]de[-\s]semana", re.IGNORECASE)
LARGO_RE = re.compile(r"fin[-\s]de[-\s]semana[-\s]largo", re.IGNORECASE)


def collect_post_urls(max_pages: int = 6) -> list[dict]:
    """Recorre las páginas del listado y extrae URLs de posts semanales."""
    found: dict[str, dict] = {}
    for page in range(1, max_pages + 1):
        url = LISTING_BASE if page == 1 else f"{LISTING_BASE}page/{page}/"
        log.info("listing page %d: %s", page, url)
        try:
            html = get(url)
        except requests.HTTPError as e:
            log.warning("listing %d failed: %s", page, e)
            break
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.find_all("a", href=True):
            href = a["href"]
            m = SLUG_DATE_RE.search(href)
            if not m:
                continue
            slug = m.group(4)
            if not (WEEKEND_RE.search(slug) or LARGO_RE.search(slug)):
                continue
            if href in found:
                continue
            found[href] = {
                "url": href,
                "year": int(m.group(1)),
                "month": int(m.group(2)),
                "day": int(m.group(3)),
                "slug": slug,
                "post_date": f"{m.group(1)}-{m.group(2)}-{m.group(3)}",
            }
        time.sleep(0.6)
    posts = sorted(found.values(), key=lambda p: p["post_date"], reverse=True)
    log.info("collected %d weekend posts", len(posts))
    return posts


NUM_RE = r"[0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{1,3}(?:\.[0-9]{3})*"
TITLE_QUOTED = r"[«\"“”«»‘’']\s*([^«»\"“”«»‘’']{2,80}?)\s*[»\"“”«»‘’']"


def to_int(s: str) -> int:
    return int(s.replace(".", "").replace(",", ""))


_BAD_TITLE_TOKENS = re.compile(
    r"(perdi[óo]|por\s+abajo|por\s+arriba|de\s+taquilla|de\s+pantall|disminuy|aument|cre[cz]i|baj[óo]\s+un|subi[óo]\s+un|%|^\(|^\d|posici[óo]n|puesto|lugar|debut[óo]|asistentes|espectadores|entradas|salas|pantallas|acumulado|convocatoria)",
    re.IGNORECASE,
)


def _looks_like_title(t: str) -> bool:
    if not t or len(t) < 2 or len(t) > 80:
        return False
    if _BAD_TITLE_TOKENS.search(t):
        return False
    # debe contener al menos una letra
    if not re.search(r"[A-Za-zÁÉÍÓÚÑáéíóúñ]", t):
        return False
    return True


def parse_post(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    art = soup.find("article") or soup.find("div", class_="entry-content")
    if not art:
        return {}
    title_el = soup.find("h1") or soup.find("title")
    title_text = title_el.get_text(" ", strip=True) if title_el else ""
    text = art.get_text(" \n ", strip=True)
    text = re.sub(r"\s+", " ", text)

    out: dict = {"headline": title_text}

    # Total entradas del fin de semana
    m = re.search(rf"se\s+vendieron\s+({NUM_RE})\s+entradas", text, re.IGNORECASE)
    if m:
        out["total_entradas"] = to_int(m.group(1))

    # Variación interanual / vs semana anterior
    m = re.search(r"(?:asistencia|taquilla)\s+(?:disminuy[óo]|baj[óo]|cay[óo])\s+un?\s*([0-9]+)%", text, re.IGNORECASE)
    if m:
        out["variacion_pct"] = -int(m.group(1))
    else:
        m = re.search(r"(?:asistencia|taquilla)\s+(?:aument[óo]|subi[óo]|creci[óo])\s+un?\s*([0-9]+)%", text, re.IGNORECASE)
        if m:
            out["variacion_pct"] = int(m.group(1))

    # Película líder: «TITULO» lideró el ranking con N espectadores en N salas
    pattern_top1 = re.compile(
        rf"{TITLE_QUOTED}\s+(?:lider[óo]|encabez[óo]|mantuvo|sigui[óo]|sigue|qued[óo]|domin[óo])\s+(?:el\s+)?(?:ranking|primer|primera|liderazgo)?[^.]{{0,80}}?con\s+({NUM_RE})\s+(?:espectadores|asistentes|entradas)\s+en\s+({NUM_RE})\s+(?:salas|pantallas)",
        re.IGNORECASE,
    )
    m = pattern_top1.search(text)
    if not m:
        # Fallback: busca «TITULO» ... primera posición ... con N espectadores en N salas
        pattern_alt = re.compile(
            rf"{TITLE_QUOTED}[^.]{{0,200}}?(?:primer|primera)\s+(?:posici[óo]n|puesto|lugar)[^.]{{0,200}}?con\s+({NUM_RE})\s+(?:espectadores|asistentes|entradas)\s+en\s+({NUM_RE})\s+(?:salas|pantallas)",
            re.IGNORECASE,
        )
        m = pattern_alt.search(text)
    if not m:
        # Fallback super flexible: primer match de «TITULO» seguido de N espectadores en N salas
        m = re.search(
            rf"{TITLE_QUOTED}[^.]{{0,140}}?con\s+({NUM_RE})\s+(?:espectadores|asistentes|entradas)\s+en\s+({NUM_RE})\s+(?:salas|pantallas)",
            text,
            re.IGNORECASE,
        )
    if m:
        cand_title = m.group(1).strip().strip(",.:;-—")
        if _looks_like_title(cand_title):
            out["top1"] = {
                "title": cand_title,
                "espectadores": to_int(m.group(2)),
                "salas": to_int(m.group(3)),
            }

    # Buscar #2 y #3 (debutó en segundo / tercer puesto, etc.)
    extras = []
    for nth_word, nth_n in [("segund", 2), ("tercer", 3), ("cuart", 4), ("quint", 5)]:
        pat = re.compile(
            rf"{TITLE_QUOTED}[^.]{{0,180}}?{nth_word}[oa]?\s+(?:posici[óo]n|puesto|lugar)[^.]{{0,180}}?con\s+({NUM_RE})\s+(?:espectadores|asistentes|entradas)\s+en\s+({NUM_RE})\s+(?:salas|pantallas)",
            re.IGNORECASE,
        )
        mm = pat.search(text)
        if not mm:
            pat2 = re.compile(
                rf"{nth_word}[oa]?\s+(?:posici[óo]n|puesto|lugar)[^.]{{0,180}}?{TITLE_QUOTED}[^.]{{0,180}}?con\s+({NUM_RE})\s+(?:espectadores|asistentes|entradas)\s+en\s+({NUM_RE})\s+(?:salas|pantallas)",
                re.IGNORECASE,
            )
            mm = pat2.search(text)
        if mm:
            cand = mm.group(1).strip().strip(",.:;-—")
            if _looks_like_title(cand):
                extras.append(
                    {
                        "rank": nth_n,
                        "title": cand,
                        "espectadores": to_int(mm.group(2)),
                        "salas": to_int(mm.group(3)),
                    }
                )
    if extras:
        out["others"] = extras

    out["raw_excerpt"] = text[:600]
    return out


def main(max_pages: int = 6, refresh_html: bool = False) -> int:
    RAW.mkdir(parents=True, exist_ok=True)

    posts = collect_post_urls(max_pages=max_pages)
    parsed: list[dict] = []
    for p in posts:
        cache = RAW / f"{p['post_date']}_{p['slug']}.html"
        if cache.exists() and not refresh_html:
            html = cache.read_text(encoding="utf-8")
        else:
            try:
                html = get(p["url"])
                cache.write_text(html, encoding="utf-8")
                time.sleep(0.8)
            except Exception as e:
                log.warning("fetch %s failed: %s", p["url"], e)
                continue
        data = parse_post(html)
        data.update(p)
        parsed.append(data)
        log.info(
            "parsed %s | total=%s | top1=%s",
            p["post_date"],
            data.get("total_entradas"),
            (data.get("top1") or {}).get("title"),
        )

    # Build aggregates
    parsed_sorted = sorted(parsed, key=lambda d: d["post_date"])

    out = {
        "source": "Ultracine — web.ultracine.com/category/taquilla",
        "source_url": LISTING_BASE,
        "fetched_at": date.today().isoformat(),
        "post_count": len(parsed_sorted),
        "first_post": parsed_sorted[0]["post_date"] if parsed_sorted else None,
        "last_post": parsed_sorted[-1]["post_date"] if parsed_sorted else None,
        "weekly": parsed_sorted,
        "weekly_totals": [
            {
                "post_date": d["post_date"],
                "total_entradas": d.get("total_entradas"),
                "variacion_pct": d.get("variacion_pct"),
                "top1_title": (d.get("top1") or {}).get("title"),
                "top1_espectadores": (d.get("top1") or {}).get("espectadores"),
                "top1_salas": (d.get("top1") or {}).get("salas"),
            }
            for d in parsed_sorted
        ],
    }

    PUBLIC.mkdir(parents=True, exist_ok=True)
    (PUBLIC / "ultracine-weekly.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    log.info("wrote %s", PUBLIC / "ultracine-weekly.json")
    return 0


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--max-pages", type=int, default=6)
    p.add_argument("--refresh-html", action="store_true")
    args = p.parse_args()
    sys.exit(main(max_pages=args.max_pages, refresh_html=args.refresh_html))
