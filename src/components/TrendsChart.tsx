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
      <section className="hud-panel p-6 sm:p-8">
        <p className="hud-label">Telemetry</p>
        <h2 className="font-display mt-2 text-2xl">Trend Matrix</h2>
        <p className="mt-3 text-[var(--ink-muted)]">Awaiting WHOOP signal history.</p>
      </section>
    );
  }

  return (
    <section className="hud-panel animate-rise-delay-1 relative overflow-hidden p-6 sm:p-8">
      <div className="scanline" />
      <div className="relative z-10">
        <p className="hud-label">Telemetry</p>
        <h2 className="font-display mt-2 text-2xl">Trend Matrix · 7–30d</h2>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">Recovery, sleep hours, strain</p>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(140,141,104,0.12)" vertical={false} />
              <XAxis dataKey="label" stroke="#b7b39a" tick={{ fill: "#b7b39a", fontSize: 12 }} />
              <YAxis stroke="#b7b39a" tick={{ fill: "#b7b39a", fontSize: 12 }} width={36} />
              <Tooltip
                contentStyle={{
                  background: "#140c07",
                  border: "1px solid rgba(140,141,104,0.35)",
                }}
                labelStyle={{ color: "#f3efe6" }}
              />
              <Legend />
              <Line type="monotone" dataKey="recovery" name="Recovery" stroke="#8C8D68" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="sleepHours" name="Sleep (h)" stroke="#c4a35a" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="strain" name="Strain" stroke="#5A2C07" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
