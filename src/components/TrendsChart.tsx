"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/whoop/dashboard";

export function TrendsChart({ trends }: { trends: TrendPoint[] }) {
  const data = trends.map((t) => ({
    ...t,
    label: t.date.slice(5), // MM-DD
  }));

  if (data.length === 0) {
    return (
      <section className="border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-6 sm:p-8">
        <h2 className="font-display text-2xl font-semibold">Last 7–30 days</h2>
        <p className="mt-3 text-[var(--ink-muted)]">No trend data yet. Wear your WHOOP and check back.</p>
      </section>
    );
  }

  return (
    <section className="animate-rise-delay-1 border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold">Last 7–30 days</h2>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        Recovery, sleep hours, and daily strain trends from your WHOOP cycles.
      </p>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(232,240,236,0.08)" vertical={false} />
            <XAxis dataKey="label" stroke="#8fa89c" tick={{ fill: "#8fa89c", fontSize: 12 }} />
            <YAxis stroke="#8fa89c" tick={{ fill: "#8fa89c", fontSize: 12 }} width={36} />
            <Tooltip
              contentStyle={{
                background: "#12201c",
                border: "1px solid rgba(232,240,236,0.12)",
                borderRadius: 4,
              }}
              labelStyle={{ color: "#e8f0ec" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="recovery"
              name="Recovery"
              stroke="#3dffa8"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="sleepHours"
              name="Sleep (h)"
              stroke="#7eb6ff"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="strain"
              name="Strain"
              stroke="#f0c35a"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
