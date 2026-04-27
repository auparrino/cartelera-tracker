"use client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { fmtInt, fmtMillions } from "@/lib/format";

type Datum = Record<string, string | number | null>;
type FmtToken = "int" | "millions" | "raw";

const PALETTE = ["#5C1A1B", "#2F4A3A", "#B8923A", "#A4503A", "#6B5536", "#1A1612", "#7B2D2E"];

function pickFmt(token?: FmtToken) {
  if (token === "millions") return (v: number) => fmtMillions(v);
  if (token === "int") return (v: number) => fmtInt(v);
  return (v: number) => String(v);
}

export default function VintageLineChart({
  data,
  xKey,
  series,
  height = 300,
  yFormat = "raw",
  reference,
}: {
  data: Datum[];
  xKey: string;
  series: { key: string; label: string }[];
  height?: number;
  yFormat?: FmtToken;
  reference?: { y: number; label: string } | null;
}) {
  const fmt = pickFmt(yFormat);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid stroke="#1A1612" strokeDasharray="2 4" strokeOpacity={0.18} />
          <XAxis
            dataKey={xKey}
            stroke="#3A332B"
            tickLine={false}
            axisLine={{ stroke: "#1A1612", strokeOpacity: 0.4 }}
            tickMargin={8}
          />
          <YAxis
            stroke="#3A332B"
            tickLine={false}
            axisLine={{ stroke: "#1A1612", strokeOpacity: 0.4 }}
            tickFormatter={fmt}
            tickMargin={6}
            width={64}
          />
          <Tooltip
            contentStyle={{
              background: "#F4ECD0",
              border: "1px solid #1A1612",
              borderRadius: 0,
              fontFamily: "var(--font-special-elite), monospace",
              fontSize: 12,
            }}
            labelStyle={{ color: "#1A1612", fontWeight: 700 }}
            formatter={(v: number) => fmt(v)}
          />
          {reference ? (
            <ReferenceLine
              y={reference.y}
              stroke="#5C1A1B"
              strokeDasharray="4 4"
              label={{ value: reference.label, fill: "#5C1A1B", fontSize: 11, position: "right" }}
            />
          ) : null}
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={2}
              dot={{ r: 2.5, fill: PALETTE[i % PALETTE.length] }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
