"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addLiftEntry,
  deleteLiftEntry,
  LIFT_DAY_OPTIONS,
  loadLiftLog,
  previousBest,
  type LiftDayKey,
  type LiftEntry,
} from "@/lib/lift-log";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function LiftLogPanel() {
  const [entries, setEntries] = useState<LiftEntry[]>([]);
  const [dayKey, setDayKey] = useState<LiftDayKey>("back_bis");
  const day = LIFT_DAY_OPTIONS.find((d) => d.key === dayKey)!;
  const [exercise, setExercise] = useState(day.lifts[0]);
  const [weight, setWeight] = useState("135");
  const [reps, setReps] = useState("8");
  const [sets, setSets] = useState("3");

  useEffect(() => {
    setEntries(loadLiftLog());
  }, []);

  useEffect(() => {
    const next = LIFT_DAY_OPTIONS.find((d) => d.key === dayKey)!;
    setExercise(next.lifts[0]);
  }, [dayKey]);

  const recent = useMemo(() => entries.slice(0, 12), [entries]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const w = Number(weight);
    const r = Number(reps);
    const s = Number(sets);
    if (!Number.isFinite(w) || !Number.isFinite(r) || !Number.isFinite(s)) return;
    const date = todayIso();
    const next = addLiftEntry({
      date,
      dayKey,
      exercise,
      weightLbs: w,
      reps: r,
      sets: s,
    });
    setEntries(next);
  }

  return (
    <div className="glass-dense p-6 sm:p-8">
      <div>
        <p className="eyebrow">Progression</p>
        <h2 className="font-display mt-2 text-4xl">Lift Log</h2>
        <p className="mt-3 max-w-xl text-sm text-[var(--ink-muted)]">
          Log top sets so Back / Push / Legs actually move week to week.
        </p>
      </div>

      <form onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="eyebrow text-[var(--ink-muted)]">Day</span>
          <select
            value={dayKey}
            onChange={(e) => setDayKey(e.target.value as LiftDayKey)}
            className="border border-[var(--line)] bg-[rgba(5,5,5,0.5)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            {LIFT_DAY_OPTIONS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="eyebrow text-[var(--ink-muted)]">Exercise</span>
          <select
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="border border-[var(--line)] bg-[rgba(5,5,5,0.5)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          >
            {day.lifts.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="eyebrow text-[var(--ink-muted)]">Weight</span>
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="border border-[var(--line)] bg-[rgba(5,5,5,0.5)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="eyebrow text-[var(--ink-muted)]">Reps</span>
          <input
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="border border-[var(--line)] bg-[rgba(5,5,5,0.5)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="eyebrow text-[var(--ink-muted)]">Sets</span>
          <input
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            className="border border-[var(--line)] bg-[rgba(5,5,5,0.5)] px-3 py-2.5 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          />
        </label>
        <div className="flex items-end lg:col-span-6">
          <button type="submit" className="btn-primary">
            Log set
          </button>
        </div>
      </form>

      <ul className="mt-6 divide-y divide-[var(--line)]">
        {recent.length === 0 ? (
          <li className="py-3 text-sm text-[var(--ink-muted)]">No lifts logged yet — add today’s top sets.</li>
        ) : (
          recent.map((entry) => {
            const prev = previousBest(entries, entry.exercise, entry.date);
            const improved =
              prev != null && entry.weightLbs * entry.reps > prev.weightLbs * prev.reps;
            return (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium tracking-wide">{entry.exercise}</p>
                  <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                    {entry.date} · {LIFT_DAY_OPTIONS.find((d) => d.key === entry.dayKey)?.label}
                    {improved ? " · PR pace ↑" : ""}
                    {prev
                      ? ` · prev ${prev.weightLbs}×${prev.reps}`
                      : " · first logged set"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="metric-num text-xl">
                    {entry.sets}×{entry.reps} @ {entry.weightLbs}
                  </p>
                  <button
                    type="button"
                    className="text-xs tracking-wide text-[var(--ink-muted)] uppercase hover:text-[var(--bad)]"
                    onClick={() => setEntries(deleteLiftEntry(entry.id))}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
