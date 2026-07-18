"use client";

import { useEffect, useMemo, useState } from "react";
import { loadBodyState } from "@/lib/body-metrics";
import {
  computeNutritionTargets,
  loadNutritionLogs,
  upsertNutritionLog,
  type NutritionDayLog,
  type NutritionTargets,
} from "@/lib/nutrition";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function NutritionCard() {
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [logs, setLogs] = useState<NutritionDayLog[]>([]);
  const [proteinHit, setProteinHit] = useState(false);
  const [calorieHit, setCalorieHit] = useState(false);

  useEffect(() => {
    const { metrics } = loadBodyState();
    setTargets(computeNutritionTargets(metrics.weightLbs));
    const all = loadNutritionLogs();
    setLogs(all);
    const today = all.find((l) => l.date === todayIso());
    if (today) {
      setProteinHit(today.proteinHit);
      setCalorieHit(today.calorieHit);
    }
  }, []);

  const weekHits = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);
    const key = cutoff.toISOString().slice(0, 10);
    const recent = logs.filter((l) => l.date >= key);
    return {
      protein: recent.filter((l) => l.proteinHit).length,
      calories: recent.filter((l) => l.calorieHit).length,
      days: recent.length,
    };
  }, [logs]);

  function saveToday(nextProtein: boolean, nextCal: boolean) {
    setProteinHit(nextProtein);
    setCalorieHit(nextCal);
    setLogs(upsertNutritionLog({ date: todayIso(), proteinHit: nextProtein, calorieHit: nextCal }));
  }

  if (!targets) {
    return (
      <div className="glass-dense p-6">
        <p className="text-[var(--ink-muted)]">Loading nutrition…</p>
      </div>
    );
  }

  return (
    <div className="glass-dense p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Fuel</p>
          <h2 className="font-display mt-2 text-4xl">Nutrition</h2>
          <p className="mt-3 max-w-xl text-sm text-[var(--ink-muted)]">{targets.note}</p>
        </div>
        <p className="text-sm text-[var(--ink-muted)]">Based on {targets.weightLbs} lb</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="border border-[var(--line)] bg-[rgba(5,5,5,0.35)] p-4">
          <p className="eyebrow text-[var(--ink-muted)]">Protein</p>
          <p className="metric-num mt-2 text-3xl text-[var(--accent)]">{targets.proteinG}g</p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">~{targets.proteinPerLb} g/lb</p>
        </div>
        <div className="border border-[var(--line)] bg-[rgba(5,5,5,0.35)] p-4">
          <p className="eyebrow text-[var(--ink-muted)]">Calories</p>
          <p className="metric-num mt-2 text-2xl">
            {targets.caloriesLow}–{targets.caloriesHigh}
          </p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">recomp band</p>
        </div>
        <div className="border border-[var(--line)] bg-[rgba(5,5,5,0.35)] p-4">
          <p className="eyebrow text-[var(--ink-muted)]">Carbs hint</p>
          <p className="metric-num mt-2 text-3xl">{targets.carbsHintG}g</p>
        </div>
        <div className="border border-[var(--line)] bg-[rgba(5,5,5,0.35)] p-4">
          <p className="eyebrow text-[var(--ink-muted)]">Fat hint</p>
          <p className="metric-num mt-2 text-3xl">{targets.fatHintG}g</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => saveToday(!proteinHit, calorieHit)}
          className={`btn-ghost ${proteinHit ? "!border-[var(--good)] !text-[var(--good)]" : ""}`}
        >
          {proteinHit ? "Protein hit ✓" : "Log protein hit"}
        </button>
        <button
          type="button"
          onClick={() => saveToday(proteinHit, !calorieHit)}
          className={`btn-ghost ${calorieHit ? "!border-[var(--good)] !text-[var(--good)]" : ""}`}
        >
          {calorieHit ? "Calories in band ✓" : "Log calories in band"}
        </button>
      </div>

      <p className="mt-4 text-xs text-[var(--ink-muted)]">
        Last 7 days logged: protein {weekHits.protein}/{Math.max(weekHits.days, 7)} · calories{" "}
        {weekHits.calories}/{Math.max(weekHits.days, 7)}
      </p>
    </div>
  );
}
