"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { buildJarvisBriefing } from "@/lib/jarvis-briefing";
import { computeNutritionTargets } from "@/lib/nutrition";
import { loadBodyState } from "@/lib/body-metrics";
import { TrendsChart } from "@/components/TrendsChart";
import { TrainingPlanCard } from "@/components/TrainingPlanCard";
import { WorkoutsList } from "@/components/WorkoutsList";
import { BodyMetricsPanel } from "@/components/BodyMetricsPanel";
import { SplitCalendar } from "@/components/SplitCalendar";
import { WeeklyReadinessCard } from "@/components/WeeklyReadinessCard";
import { NutritionCard } from "@/components/NutritionCard";
import { LiftLogPanel } from "@/components/LiftLogPanel";
import { StrainBudgetCard } from "@/components/StrainBudgetCard";
import { RecompCheckInCard } from "@/components/RecompCheckInCard";

const POLL_MS = 45_000;

type PanelTab =
  | "session"
  | "trends"
  | "body"
  | "nutrition"
  | "lifts"
  | "workouts"
  | "recomp"
  | "split"
  | "week";

const TABS: { id: PanelTab; label: string }[] = [
  { id: "session", label: "Session" },
  { id: "week", label: "Week" },
  { id: "split", label: "Split" },
  { id: "trends", label: "Trends" },
  { id: "body", label: "Body" },
  { id: "nutrition", label: "Fuel" },
  { id: "lifts", label: "Lifts" },
  { id: "workouts", label: "Workouts" },
  { id: "recomp", label: "Recomp" },
];

function recoveryTone(score: number | null): string {
  if (score == null) return "var(--moss)";
  if (score >= 67) return "var(--good)";
  if (score >= 34) return "var(--warn)";
  return "var(--bad)";
}

function MetricCell({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="border border-[var(--line)] bg-[rgba(20,12,7,0.65)] px-2.5 py-2">
      <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--ink-muted)] uppercase">{label}</p>
      <p className="metric-num mt-1 text-2xl leading-none" style={{ color: color ?? "var(--ink)" }}>
        {value ?? "—"}
        {unit && value != null && value !== "—" ? (
          <span className="ml-0.5 text-[10px] font-normal tracking-normal text-[var(--ink-muted)] normal-case">
            {unit}
          </span>
        ) : null}
      </p>
    </div>
  );
}

export default function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [tab, setTab] = useState<PanelTab>("session");
  const [proteinG, setProteinG] = useState(154);
  const [weightLbs, setWeightLbs] = useState(154);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent ?? false;
      if (!silent) setLoading(true);
      else setSyncing(true);
      setError(null);
      try {
        const res = await fetch("/api/whoop/dashboard", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/?error=" + encodeURIComponent("Connect WHOOP to continue"));
          return;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
        setData(json);
        setLastSync(new Date());
        const body = loadBodyState().metrics;
        setWeightLbs(body.weightLbs);
        setProteinG(computeNutritionTargets(body.weightLbs).proteinG);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        if (!silent) setLoading(false);
        setSyncing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const poll = window.setInterval(() => void load({ silent: true }), POLL_MS);
    return () => window.clearInterval(poll);
  }, [load]);

  useEffect(() => {
    const tick = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#session") setTab("session");
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  const brief = data ? buildJarvisBriefing(data) : null;
  const clock = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#0c0805]">
      <header className="shrink-0 border-b border-[var(--line)] bg-[rgba(12,8,5,0.92)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-display text-sm tracking-[0.28em]">ShankoFIT</p>
              <span className="inline-flex items-center gap-1.5 border border-[var(--moss)]/40 bg-[rgba(140,141,104,0.12)] px-1.5 py-0.5 font-mono text-[9px] tracking-[0.18em] text-[var(--moss-bright)] uppercase">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${syncing ? "animate-pulse bg-[var(--warn)]" : "bg-[var(--moss)]"}`}
                />
                Live
              </span>
            </div>
            <p className="truncate font-mono text-[10px] text-[var(--ink-muted)]">
              {data?.user?.firstName ? `${data.user.firstName} · ` : ""}
              {clock}
              {lastSync ? ` · synced ${lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <a href="/morning" className="btn-ghost !px-2.5 !py-1.5 !text-[10px]">
              Morning
            </a>
            <button
              type="button"
              onClick={() => void load({ silent: true })}
              className="btn-ghost !px-2.5 !py-1.5 !text-[10px]"
            >
              Sync
            </button>
            <button type="button" onClick={() => void logout()} className="btn-ghost !px-2.5 !py-1.5 !text-[10px]">
              Disconnect
            </button>
          </div>
        </div>
      </header>

      {loading && !data ? (
        <div className="flex flex-1 items-center justify-center">
          <motion.p
            className="text-sm tracking-[0.2em] text-[var(--accent)] uppercase"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            Syncing ShankoFIT…
          </motion.p>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mx-3 mt-2 shrink-0 border border-[var(--bad)]/40 bg-[rgba(196,122,106,0.12)] px-3 py-2 text-sm text-[#e8b4a8] sm:mx-4"
        >
          {error}
        </div>
      ) : null}

      {data && brief ? (
        <div className="mx-auto flex min-h-0 w-full max-w-[1400px] flex-1 flex-col gap-2 overflow-hidden p-2 sm:p-3">
          {/* Live vitals strip */}
          <div className="grid shrink-0 grid-cols-3 gap-1.5 sm:grid-cols-6 lg:grid-cols-8">
            <MetricCell
              label="Recovery"
              value={data.today.recoveryScore}
              color={recoveryTone(data.today.recoveryScore)}
            />
            <MetricCell label="Sleep" value={data.today.sleepDurationHours} unit="h" />
            <MetricCell label="Sleep %" value={data.today.sleepPerformance} unit="%" />
            <MetricCell label="Strain" value={data.today.strain} color="var(--accent)" />
            <MetricCell label="HRV" value={data.today.hrvMs} unit="ms" />
            <MetricCell label="RHR" value={data.today.restingHr} unit="bpm" />
            <MetricCell label="Weight" value={weightLbs} unit="lb" />
            <MetricCell label="Protein" value={proteinG} unit="g" color="var(--accent)" />
          </div>

          {/* Command row — always visible */}
          <div className="grid min-h-0 shrink-0 gap-2 lg:grid-cols-12 lg:h-[38%]">
            <section className="glass-dense flex min-h-0 flex-col overflow-hidden p-3 lg:col-span-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.3em] text-[var(--moss-bright)] uppercase">
                    Command
                  </p>
                  <p className="font-display mt-1 text-xl leading-tight">{brief.statusLabel}</p>
                </div>
                <p className="font-mono text-[10px] text-[var(--ink-muted)]">{data.today.dateLabel}</p>
              </div>
              <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto font-mono text-xs leading-snug text-[var(--ink-muted)]">
                <p>
                  <span className="text-[var(--moss)]">&gt;</span> {brief.greeting}
                </p>
                <p>
                  <span className="text-[var(--moss)]">&gt;</span> {brief.recoveryLine}
                </p>
                <p>
                  <span className="text-[var(--moss)]">&gt;</span> {brief.intensityLine}
                </p>
                <p className="text-[var(--ink)]">
                  <span className="text-[var(--moss)]">&gt;</span> {brief.liftLine}
                </p>
                <p>
                  <span className="text-[var(--moss)]">&gt;</span> {brief.weekLine}
                </p>
              </div>
            </section>

            <section className="glass-dense flex min-h-0 flex-col overflow-hidden p-3 lg:col-span-4">
              <p className="eyebrow">Today</p>
              <p className="font-display mt-1 text-2xl leading-tight">{data.split.today.scheduled}</p>
              <p className="mt-1 text-xs text-[var(--accent)] uppercase tracking-wide">
                {data.plan.intensity} · {data.plan.dayType}
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-[var(--ink-muted)]">{data.plan.focus}</p>
              <ul className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto border-t border-[var(--line)] pt-2">
                {data.plan.exercises.slice(0, 6).map((ex) => (
                  <li key={ex.name} className="flex justify-between gap-2 text-xs">
                    <span className="truncate text-[var(--ink)]">{ex.name}</span>
                    <span className="shrink-0 text-[var(--ink-muted)]">
                      {ex.sets}×{ex.reps}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="glass-dense flex min-h-0 flex-col gap-2 overflow-hidden p-3 lg:col-span-4">
              <div className="grid grid-cols-3 gap-1.5">
                <MetricCell label="Ceiling" value={data.strainBudget.targetMax} />
                <MetricCell label="Used" value={data.strainBudget.used} />
                <MetricCell
                  label="Left"
                  value={data.strainBudget.remaining}
                  color={
                    data.strainBudget.status === "OVER"
                      ? "var(--bad)"
                      : data.strainBudget.status === "LOW"
                        ? "var(--warn)"
                        : "var(--good)"
                  }
                />
              </div>
              <div className="h-1 w-full overflow-hidden bg-[rgba(247,244,239,0.08)]">
                <div
                  className="h-full bg-[var(--moss)] transition-all duration-500"
                  style={{
                    width: `${
                      data.strainBudget.used == null
                        ? 0
                        : Math.min(
                            100,
                            Math.round((data.strainBudget.used / data.strainBudget.targetMax) * 100)
                          )
                    }%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[10px] tracking-[0.18em] text-[var(--ink-muted)] uppercase">
                  Week · {data.weekly.label}
                </p>
                <p className="metric-num text-2xl text-[var(--accent)]">{data.weekly.score}</p>
              </div>
              <p className="line-clamp-3 text-xs leading-relaxed text-[var(--ink-muted)]">
                {data.strainBudget.guidance}
              </p>
              <p className="mt-auto font-mono text-[10px] text-[var(--moss-bright)]">
                Lift ~{data.strainBudget.liftBudget} · Cardio ~{data.strainBudget.cardioBudget}
              </p>
            </section>
          </div>

          {/* In-panel tabs — no page scroll parade */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[var(--line)] bg-[rgba(20,12,7,0.55)]">
            <div className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-[var(--line)] p-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase transition-colors ${
                    tab === t.id
                      ? "bg-[var(--seal)] text-[var(--ink)] border border-[var(--moss)]"
                      : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="panel-dense min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
              {tab === "session" ? <TrainingPlanCard plan={data.plan} /> : null}
              {tab === "week" ? <WeeklyReadinessCard weekly={data.weekly} /> : null}
              {tab === "split" ? <SplitCalendar split={data.split} /> : null}
              {tab === "trends" ? <TrendsChart trends={data.trends} /> : null}
              {tab === "body" ? <BodyMetricsPanel /> : null}
              {tab === "nutrition" ? <NutritionCard /> : null}
              {tab === "lifts" ? <LiftLogPanel /> : null}
              {tab === "workouts" ? <WorkoutsList workouts={data.workouts} /> : null}
              {tab === "recomp" ? <RecompCheckInCard /> : null}
              {tab === "session" ? (
                <div className="mt-2">
                  <StrainBudgetCard budget={data.strainBudget} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
