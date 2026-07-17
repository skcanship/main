"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  calcBmi,
  heightLabel,
  loadBodyState,
  logWeight,
  type BodyMetrics,
  type WeightEntry,
} from "@/lib/body-metrics";

export function BodyMetricsPanel() {
  const [metrics, setMetrics] = useState<BodyMetrics | null>(null);
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [draft, setDraft] = useState("160");

  useEffect(() => {
    const state = loadBodyState();
    setMetrics(state.metrics);
    setHistory(state.history);
    setDraft(String(state.metrics.weightLbs));
  }, []);

  const chartData = useMemo(
    () => history.map((h) => ({ date: h.date.slice(5), weight: h.weightLbs })),
    [history]
  );

  if (!metrics) {
    return (
      <section className="panel px-6 py-10 sm:px-10">
        <p className="text-[var(--ink-muted)]">Loading vitals…</p>
      </section>
    );
  }

  const bmi = calcBmi(metrics);
  const delta =
    history.length >= 2 ? history[history.length - 1].weightLbs - history[history.length - 2].weightLbs : 0;

  function commitWeight() {
    const next = Number(draft);
    if (!Number.isFinite(next) || next < 80 || next > 400) return;
    const saved = logWeight(metrics!, history, Math.round(next * 10) / 10);
    setMetrics(saved.metrics);
    setHistory(saved.history);
  }

  return (
    <section className="panel animate-fade-up-1 px-6 py-10 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Subject</p>
          <h2 className="font-display mt-3 text-4xl">Body</h2>
        </div>
        <div className="text-right">
          <p className="eyebrow text-[var(--ink-muted)]">BMI</p>
          <p className="metric-num mt-1 text-3xl text-[var(--accent)]">{bmi}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px bg-[var(--line)] sm:grid-cols-4">
        {[
          { label: "Height", value: heightLabel(metrics) },
          { label: "Weight", value: `${metrics.weightLbs} lb` },
          {
            label: "Change",
            value: `${delta > 0 ? "+" : ""}${delta} lb`,
          },
          { label: "Goal", value: "Recomp" },
        ].map((item) => (
          <div key={item.label} className="bg-[var(--bg-elevated)] px-4 py-5">
            <p className="eyebrow text-[var(--ink-muted)]">{item.label}</p>
            <p className="metric-num mt-3 text-2xl sm:text-3xl">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-2">
          <span className="eyebrow text-[var(--ink-muted)]">Update weight</span>
          <input
            type="number"
            step="0.1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-36 border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <button type="button" onClick={commitWeight} className="btn-primary">
          Log
        </button>
      </div>

      <div className="mt-8 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c2a878" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#c2a878" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#6b6661" tick={{ fill: "#9a9590", fontSize: 11 }} />
            <YAxis
              domain={["dataMin - 2", "dataMax + 2"]}
              stroke="#6b6661"
              tick={{ fill: "#9a9590", fontSize: 11 }}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: "#121212",
                border: "1px solid rgba(247,244,239,0.12)",
                borderRadius: 0,
              }}
            />
            <Area type="monotone" dataKey="weight" stroke="#c2a878" fill="url(#weightFill)" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
