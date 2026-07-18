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
      <div className="glass-dense p-6 sm:p-8">
        <p className="eyebrow">Trends</p>
        <h2 className="font-display mt-2 text-4xl">History</h2>
        <p className="mt-3 text-[var(--ink-muted)]">No trend data yet.</p>
      </div>
    );
  }

  return (
    <div className="glass-dense p-6 sm:p-8">
      <p className="eyebrow">Trends</p>
      <h2 className="font-display mt-2 text-4xl">Last 7–30 Days</h2>
      <div className="mt-6 h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(247,244,239,0.06)" vertical={false} />
            <XAxis dataKey="label" stroke="#6b6661" tick={{ fill: "#a8a29a", fontSize: 12 }} />
            <YAxis stroke="#6b6661" tick={{ fill: "#a8a29a", fontSize: 12 }} width={36} />
            <Tooltip
              contentStyle={{
                background: "#121212",
                border: "1px solid rgba(247,244,239,0.12)",
                borderRadius: 0,
              }}
              labelStyle={{ color: "#f7f4ef" }}
            />
            <Legend />
            <Line type="monotone" dataKey="recovery" name="Recovery" stroke="#8C8D68" strokeWidth={1.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="sleepHours" name="Sleep (h)" stroke="#A8A97E" strokeWidth={1.5} dot={false} connectNulls />
            <Line type="monotone" dataKey="strain" name="Strain" stroke="#5A2C07" strokeWidth={1.5} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
