"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
      <section className="hud-panel p-6">
        <p className="hud-label">Body systems online…</p>
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
    <section className="hud-panel animate-rise-delay-1 relative overflow-hidden p-6 sm:p-8">
      <div className="scanline" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="hud-label">Subject vitals</p>
            <h2 className="font-display mt-2 text-2xl tracking-wide text-[var(--ink)]">Body Metrics</h2>
          </div>
          <div className="text-right">
            <p className="hud-label">BMI</p>
            <p className="hud-value text-3xl text-[var(--moss-bright)]">{bmi}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="border border-[var(--line)] bg-[rgba(90,44,7,0.25)] p-4">
            <p className="hud-label">Height</p>
            <p className="hud-value mt-2 text-3xl">{heightLabel(metrics)}</p>
          </div>
          <div className="border border-[var(--line)] bg-[rgba(90,44,7,0.25)] p-4">
            <p className="hud-label">Weight</p>
            <p className="hud-value mt-2 text-3xl">
              {metrics.weightLbs}
              <span className="text-base text-[var(--ink-muted)]"> lb</span>
            </p>
          </div>
          <div className="border border-[var(--line)] bg-[rgba(90,44,7,0.25)] p-4">
            <p className="hud-label">Δ last log</p>
            <p className="hud-value mt-2 text-3xl" style={{ color: delta <= 0 ? "var(--moss-bright)" : "var(--warn)" }}>
              {delta > 0 ? `+${delta}` : delta}
              <span className="text-base text-[var(--ink-muted)]"> lb</span>
            </p>
          </div>
          <div className="border border-[var(--line)] bg-[rgba(90,44,7,0.25)] p-4">
            <p className="hud-label">Target bias</p>
            <p className="mt-2 text-lg font-semibold tracking-wide text-[var(--accent-hot)]">Recomp</p>
            <p className="text-sm text-[var(--ink-muted)]">Muscle ↑ · Fat ↓</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="hud-label">Update weight</span>
            <input
              type="number"
              step="0.1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-36 border border-[var(--line)] bg-[var(--seal-ink)] px-3 py-2 font-mono text-[var(--ink)] outline-none focus:border-[var(--moss)]"
            />
          </label>
          <button
            type="button"
            onClick={commitWeight}
            className="border border-[var(--moss)] bg-[var(--seal)] px-5 py-2 text-sm font-semibold tracking-wider text-[var(--ink)] uppercase transition hover:bg-[var(--seal-deep)]"
          >
            Log vitals
          </button>
        </div>

        <div className="mt-6 h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8C8D68" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#5A2C07" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#b7b39a" tick={{ fill: "#b7b39a", fontSize: 11 }} />
              <YAxis
                domain={["dataMin - 2", "dataMax + 2"]}
                stroke="#b7b39a"
                tick={{ fill: "#b7b39a", fontSize: 11 }}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: "#140c07",
                  border: "1px solid rgba(140,141,104,0.35)",
                }}
              />
              <Area type="monotone" dataKey="weight" stroke="#8C8D68" fill="url(#weightFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
