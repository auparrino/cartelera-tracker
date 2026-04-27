import path from "node:path";
import fs from "node:fs/promises";

const DATA_DIR = path.join(process.cwd(), "public", "data");

async function readJson<T>(name: string): Promise<T | null> {
  try {
    const buf = await fs.readFile(path.join(DATA_DIR, name), "utf-8");
    return JSON.parse(buf) as T;
  } catch {
    return null;
  }
}

export type NetflixGlobal = {
  source: string;
  source_url: string;
  fetched_at: string;
  latest_week: string;
  latest_top10: Array<{
    category: string;
    rank: number;
    title: string;
    season: string | null;
    hours_viewed: number | null;
    views: number | null;
    runtime_hours: number | null;
    weeks_in_top10: number;
  }>;
  rolling_26w_by_category: Array<{ week: string; category: string; hours_viewed: number }>;
  top_year: Array<{
    title: string;
    category: string;
    total_hours: number;
    total_views: number | null;
    weeks_charted: number;
    best_rank: number;
  }>;
};

export type NetflixCountries = {
  source: string;
  source_url: string;
  fetched_at: string;
  latest_week: string;
  countries_focus: string[];
  weeks: string[];
  by_country_latest: Record<
    string,
    Array<{
      category: string;
      rank: number;
      title: string;
      season: string | null;
      weeks_in_top10: number;
    }>
  >;
  longest_runs: Record<string, Array<{ title: string; category: string; max_weeks: number }>>;
  title_geography: Record<
    string,
    {
      category: string;
      countries_present: number;
      best_rank_by_country: Record<string, number>;
    }
  >;
};

export type UltracineWeekly = {
  source: string;
  source_url: string;
  fetched_at: string;
  post_count: number;
  first_post: string | null;
  last_post: string | null;
  weekly: Array<{
    url: string;
    post_date: string;
    headline?: string;
    total_entradas?: number;
    variacion_pct?: number;
    top1?: { title: string; espectadores: number; salas: number };
    others?: Array<{ rank: number; title: string; espectadores: number; salas: number }>;
    raw_excerpt?: string;
  }>;
  weekly_totals: Array<{
    post_date: string;
    total_entradas: number | null;
    variacion_pct: number | null;
    top1_title: string | null;
    top1_espectadores: number | null;
    top1_salas: number | null;
  }>;
};

export type StudioShare = {
  source: string;
  share: {
    by_country_films: Record<string, Record<string, number>>;
    by_country_tv: Record<string, Record<string, number>>;
    ultracine_ar_weeks_at_1?: Record<string, number>;
    ultracine_ar_espectadores?: Record<string, number>;
    mojo_us_gross?: Record<string, number>;
    ultracine_weekly_studio?: Array<{
      post_date: string;
      title: string;
      studio: string;
      espectadores: number | null;
      salas: number | null;
    }>;
  };
} | null;

export type MojoWeekend = {
  source: string;
  source_url: string;
  fetched_at: string;
  weekend_label: string;
  chart: Array<{
    rank: number | null;
    rank_last_week: string | null;
    title: string;
    weekend_gross_usd: number | null;
    change_vs_lw_pct: number | null;
    theaters: number | null;
    theaters_change: number | null;
    average_per_theater_usd: number | null;
    total_domestic_usd: number | null;
    weeks_in_release: number | null;
  }>;
};

export async function loadAll() {
  const [global, countries, ultracine, studio, mojo] = await Promise.all([
    readJson<NetflixGlobal>("netflix-global.json"),
    readJson<NetflixCountries>("netflix-countries.json"),
    readJson<UltracineWeekly>("ultracine-weekly.json"),
    readJson<StudioShare>("studio-share.json"),
    readJson<MojoWeekend>("mojo-weekend.json"),
  ]);
  return { global, countries, ultracine, studio, mojo };
}
