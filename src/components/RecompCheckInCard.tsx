"use client";

import { useEffect, useMemo, useState } from "react";
import { loadBodyState } from "@/lib/body-metrics";
import {
  addCheckIn,
  isCheckInDue,
  loadCheckIns,
  verdictFromCheckIns,
  type RecompCheckIn,
} from "@/lib/recomp-checkin";

const verdictColor = {
  LEANING_OUT: "var(--good)",
  STALLING: "var(--warn)",
  NEED_FOOD: "var(--bad)",
  BASELINE: "var(--accent)",
} as const;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function RecompCheckInCard({ compact = false }: { compact?: boolean }) {
  const [items, setItems] = useState<RecompCheckIn[]>([]);
  const [weight, setWeight] = useState("160");
  const [waist, setWaist] = useState("32");
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const loaded = loadCheckIns();
    setItems(loaded);
    const body = loadBodyState().metrics;
    setWeight(String(body.weightLbs));
    if (loaded[0]) {
      setWaist(String(loaded[0].waistIn));
      setEnergy(loaded[0].energy);
      setMood(loaded[0].mood);
    }
    setOpen(isCheckInDue(loaded, 7));
  }, []);

  const verdict = useMemo(() => verdictFromCheckIns(items), [items]);
  const due = isCheckInDue(items, 7);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const w = Number(weight);
    const waistN = Number(waist);
    if (!Number.isFinite(w) || !Number.isFinite(waistN)) return;
    const next = addCheckIn({
      date: todayIso(),
      weightLbs: Math.round(w * 10) / 10,
      waistIn: Math.round(waistN * 10) / 10,
      energy: energy as 1 | 2 | 3 | 4 | 5,
      mood: mood as 1 | 2 | 3 | 4 | 5,
    });
    setItems(next);
    setOpen(false);
  }

  return (
    <div className="glass-dense p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Physique</p>
          <h2 className="font-display mt-1 text-3xl">Recomp Check-In</h2>
        </div>
        {due ? (
          <span className="border border-[var(--accent)]/50 bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--accent)] uppercase">
            Due
          </span>
        ) : null}
      </div>

      <div className="mt-4 border border-[var(--line)] bg-[rgba(5,5,5,0.35)] p-3">
        <p className="text-sm font-semibold" style={{ color: verdictColor[verdict.code] }}>
          {verdict.label}
        </p>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">{verdict.detail}</p>
      </div>

      {!compact || open ? (
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="eyebrow text-[var(--ink-muted)]">Weight (lb)</span>
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="border border-[var(--line)] bg-[rgba(5,5,5,0.5)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="eyebrow text-[var(--ink-muted)]">Waist (in)</span>
            <input
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              className="border border-[var(--line)] bg-[rgba(5,5,5,0.5)] px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="eyebrow text-[var(--ink-muted)]">Energy 1–5</span>
            <input
              type="range"
              min={1}
              max={5}
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
            />
            <span className="text-sm text-[var(--ink-muted)]">{energy}</span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="eyebrow text-[var(--ink-muted)]">Mood 1–5</span>
            <input
              type="range"
              min={1}
              max={5}
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
            />
            <span className="text-sm text-[var(--ink-muted)]">{mood}</span>
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              Save check-in
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn-ghost mt-4" onClick={() => setOpen(true)}>
          Log this week
        </button>
      )}

      {items[0] && !compact ? (
        <p className="mt-3 text-xs text-[var(--ink-muted)]">
          Last: {items[0].date} · {items[0].weightLbs} lb · {items[0].waistIn}&quot; waist
        </p>
      ) : null}
    </div>
  );
}
