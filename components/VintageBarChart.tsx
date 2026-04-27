"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { fmtInt, fmtMillions } from "@/lib/format";

const PALETTE = ["#5C1A1B", "#2F4A3A", "#B8923A", "#A4503A", "#6B5536", "#1A1612", "#7B2D2E"];

type Datum = { label: string; value: number; color?: string };
type FmtToken = "int" | "millions" | "raw";

function pickFmt(token?: FmtToken) {
  if (token === "millions") return (v: number) => fmtMillions(v);
  if (token === "int") return (v: number) => fmtInt(v);
  return (v: number) => String(v);
}

export default function VintageBarChart({
  data,
  height = 320,
  vertical = false,
  yFormat = "raw",
}: {
  data: Datum[];
  height?: number;
  vertical?: boolean;
  yFormat?: FmtToken;
}) {
  const fmt = pickFmt(yFormat);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout={vertical ? "vertical" : "horizontal"}
          margin={{ top: 12, right: 24, left: vertical ? 100 : 8, bottom: 8 }}
        >
          <CartesianGrid stroke="#1A1612" strokeDasharray="2 4" strokeOpacity={0.18} />
          {vertical ? (
            <>
              <XAxis
                type="number"
                stroke="#3A332B"
                tickLine={false}
                axisLine={{ stroke: "#1A1612", strokeOpacity: 0.4 }}
                tickFormatter={fmt}
              />
              <YAxis
                dataKey="label"
                type="category"
                stroke="#3A332B"
                tickLine={false}
                axisLine={{ stroke: "#1A1612", strokeOpacity: 0.4 }}
                width={120}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="label"
                stroke="#3A332B"
                tickLine={false}
                axisLine={{ stroke: "#1A1612", strokeOpacity: 0.4 }}
              />
              <YAxis
                stroke="#3A332B"
                tickLine={false}
                axisLine={{ stroke: "#1A1612", strokeOpacity: 0.4 }}
                tickFormatter={fmt}
                width={64}
              />
            </>
          )}
          <Tooltip
            cursor={{ fill: "rgba(184,146,58,0.12)" }}
            contentStyle={{
              background: "#F4ECD0",
              border: "1px solid #1A1612",
              borderRadius: 0,
              fontFamily: "var(--font-special-elite), monospace",
              fontSize: 12,
            }}
            formatter={(v: number) => fmt(v)}
          />
          <Bar dataKey="value" isAnimationActive={false}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color || PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
