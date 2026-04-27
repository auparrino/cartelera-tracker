export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("es-AR").format(n);
}

export function fmtMillions(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + " B";
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + " M";
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + " K";
  return n.toString();
}

export function fmtDateAR(iso: string): string {
  // iso = YYYY-MM-DD
  const [y, m, d] = iso.split("-");
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  const mi = parseInt(m, 10) - 1;
  return `${parseInt(d, 10)} ${months[mi] ?? m}. ${y}`;
}

export function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(0)}%`;
}

export const COUNTRY_CODE: Record<string, string> = {
  Argentina: "AR",
  Uruguay: "UY",
  Paraguay: "PY",
  Chile: "CL",
  Brazil: "BR",
  Mexico: "MX",
  Colombia: "CO",
  Peru: "PE",
};
