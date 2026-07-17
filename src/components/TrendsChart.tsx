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
    label: t.date.slice(5),
  }));

  if (data.length === 0) {
    return (
      <section className="panel px-6 py-10 sm:px-10">
        <p className="eyebrow">Trends</p>
        <h2 className="font-display mt-3 text-4xl">History</h2>
        <p className="mt-4 text-[var(--ink-muted)]">No trend data yet.</p>
      </section>
    );
  }

  return (
    <section className="panel animate-fade-up-1 px-6 py-10 sm:px-10">
      <p className="eyebrow">Trends</p>
      <h2 className="font-display mt-3 text-4xl">Last 7–30 Days</h2>
      <p className="mt-3 text-sm text-[var(--ink-muted)]">Recovery, sleep, and strain over time</p>

      <div className="mt-8 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(247,244,239,0.06)" vertical={false} />
            <XAxis dataKey="label" stroke="#6b6661" tick={{ fill: "#9a9590", fontSize: 12 }} />
            <YAxis stroke="#6b6661" tick={{ fill: "#9a9590", fontSize: 12 }} width={36} />
            <Tooltip
              contentStyle={{
                background: "#121212",
                border: "1px solid rgba(247,244,239,0.12)",
                borderRadius: 0,
              }}
              labelStyle={{ color: "#f7f4ef" }}
            />
            <Legend />
            <Line type="monotone" dataKey="recovery" name="Recovery" stroke="#8fbc8f" strokeWidth={1.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="sleepHours" name="Sleep (h)" stroke="#c2a878" strokeWidth={1.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="strain" name="Strain" stroke="#f7f4ef" strokeWidth={1.5} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
