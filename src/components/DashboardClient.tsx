"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { TodayCard } from "@/components/TodayCard";
import { TrendsChart } from "@/components/TrendsChart";
import { TrainingPlanCard } from "@/components/TrainingPlanCard";
import { WorkoutsList } from "@/components/WorkoutsList";
import { BodyMetricsPanel } from "@/components/BodyMetricsPanel";
import { SplitCalendar } from "@/components/SplitCalendar";
import { FlowSection, FadeIn } from "@/components/FlowSection";
import { JarvisOverview } from "@/components/JarvisOverview";
import { WeeklyReadinessCard } from "@/components/WeeklyReadinessCard";
import { NutritionCard } from "@/components/NutritionCard";
import { LiftLogPanel } from "@/components/LiftLogPanel";
import { StrainBudgetCard } from "@/components/StrainBudgetCard";
import { RecompCheckInCard } from "@/components/RecompCheckInCard";

export default function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/whoop/dashboard");
      if (res.status === 401) {
        router.replace("/?error=" + encodeURIComponent("Connect WHOOP to continue"));
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
  }

  return (
    <main className="overflow-x-hidden bg-black">
      <header className="nav-blur sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <div>
            <p className="font-display text-[15px] tracking-tight">ShankoFIT</p>
            {data?.user ? (
              <p className="text-xs text-[var(--ink-muted)]">{data.user.firstName}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <a href="/morning" className="btn-ghost !py-2 !px-3 text-xs">
              Morning
            </a>
            <button type="button" onClick={() => void load()} className="btn-ghost !py-2 !px-3 text-xs">
              Refresh
            </button>
            <button type="button" onClick={() => void logout()} className="btn-ghost !py-2 !px-3 text-xs">
              Disconnect
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
          <div className="aurora-orb h-72 w-72 bg-[rgba(90,200,250,0.18)]" />
          <motion.p
            className="relative z-10 text-sm font-semibold tracking-[0.24em] text-[var(--accent)] uppercase"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            Syncing insights…
          </motion.p>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mx-5 mt-4 border border-[var(--bad)]/40 bg-[rgba(196,122,106,0.12)] px-4 py-3 text-sm text-[#e8b4a8] sm:mx-8"
        >
          {error}
        </div>
      ) : null}

      {data ? (
        <>
          <FlowSection index={0}>
            <FadeIn>
              <JarvisOverview data={data} />
            </FadeIn>
          </FlowSection>

          <FlowSection index={1}>
            <FadeIn>
              <TodayCard today={data.today} />
            </FadeIn>
          </FlowSection>

          <FlowSection index={2}>
            <FadeIn>
              <StrainBudgetCard budget={data.strainBudget} />
            </FadeIn>
          </FlowSection>

          <FlowSection index={3}>
            <FadeIn>
              <WeeklyReadinessCard weekly={data.weekly} />
            </FadeIn>
          </FlowSection>

          <FlowSection index={4}>
            <FadeIn>
              <RecompCheckInCard />
            </FadeIn>
          </FlowSection>

          <FlowSection index={5}>
            <FadeIn>
              <NutritionCard />
            </FadeIn>
          </FlowSection>

          <FlowSection index={0}>
            <FadeIn>
              <LiftLogPanel />
            </FadeIn>
          </FlowSection>

          <FlowSection index={1}>
            <FadeIn>
              <BodyMetricsPanel />
            </FadeIn>
          </FlowSection>

          <FlowSection index={2}>
            <FadeIn>
              <SplitCalendar split={data.split} />
            </FadeIn>
          </FlowSection>

          <FlowSection index={3} id="session">
            <FadeIn>
              <TrainingPlanCard plan={data.plan} />
            </FadeIn>
          </FlowSection>

          <FlowSection index={2}>
            <FadeIn>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="glass-dense p-6">
                  <p className="eyebrow">Recovery</p>
                  <p className="metric-num mt-3 text-5xl text-[var(--good)]">
                    {data.today.recoveryScore ?? "—"}
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">
                    HRV {data.today.hrvMs ?? "—"} · RHR {data.today.restingHr ?? "—"}
                  </p>
                </div>
                <div className="glass-dense p-6">
                  <p className="eyebrow">Sleep</p>
                  <p className="metric-num mt-3 text-5xl text-[var(--accent)]">
                    {data.today.sleepDurationHours ?? "—"}
                    <span className="text-lg text-[var(--ink-muted)] normal-case tracking-normal"> h</span>
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">
                    Perf {data.today.sleepPerformance ?? "—"}%
                  </p>
                </div>
                <div className="glass-dense p-6">
                  <p className="eyebrow">Strain</p>
                  <p className="metric-num mt-3 text-5xl">{data.today.strain ?? "—"}</p>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">Daily load 0–21</p>
                </div>
              </div>
            </FadeIn>
          </FlowSection>

          <FlowSection index={0}>
            <FadeIn>
              <TrendsChart trends={data.trends} />
            </FadeIn>
          </FlowSection>

          <FlowSection index={1}>
            <FadeIn>
              <WorkoutsList workouts={data.workouts} />
            </FadeIn>
          </FlowSection>
        </>
      ) : null}
    </main>
  );
}
