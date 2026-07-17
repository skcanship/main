"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { TodayCard } from "@/components/TodayCard";
import { TrendsChart } from "@/components/TrendsChart";
import { TrainingPlanCard } from "@/components/TrainingPlanCard";
import { WorkoutsList } from "@/components/WorkoutsList";
import { BodyMetricsPanel } from "@/components/BodyMetricsPanel";
import { SplitCalendar } from "@/components/SplitCalendar";

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
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6 py-8 sm:px-10">
        <div>
          <p className="font-display text-sm tracking-[0.35em]">Operation Killmonger</p>
          {data?.user ? (
            <p className="mt-3 text-sm text-[var(--ink-muted)]">
              Welcome back, {data.user.firstName}
            </p>
          ) : (
            <p className="mt-3 text-sm text-[var(--ink-muted)]">Performance dashboard</p>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => void load()} className="btn-ghost">
            Refresh
          </button>
          <button type="button" onClick={() => void logout()} className="btn-ghost">
            Disconnect
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-0 pb-16 sm:px-0">
        {loading ? (
          <p className="px-6 text-sm tracking-wide text-[var(--ink-muted)] sm:px-10">Loading…</p>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="mx-6 mb-6 border border-[var(--bad)]/40 bg-[rgba(196,122,106,0.1)] px-4 py-3 text-sm text-[#e8b4a8] sm:mx-10"
          >
            {error}
          </div>
        ) : null}

        {data ? (
          <div className="space-y-0">
            <TodayCard today={data.today} />
            <BodyMetricsPanel />
            <SplitCalendar split={data.split} />
            <TrainingPlanCard plan={data.plan} />

            <div className="grid lg:grid-cols-3">
              <section className="panel px-6 py-10 sm:px-8">
                <p className="eyebrow">Recovery</p>
                <p className="metric-num mt-4 text-5xl text-[var(--good)]">
                  {data.today.recoveryScore ?? "—"}
                </p>
                <p className="mt-3 text-sm text-[var(--ink-muted)]">
                  HRV {data.today.hrvMs ?? "—"} ms · RHR {data.today.restingHr ?? "—"} bpm
                </p>
              </section>
              <section className="panel px-6 py-10 sm:px-8">
                <p className="eyebrow">Sleep</p>
                <p className="metric-num mt-4 text-5xl text-[var(--accent)]">
                  {data.today.sleepDurationHours ?? "—"}
                  <span className="text-xl text-[var(--ink-muted)] normal-case tracking-normal"> h</span>
                </p>
                <p className="mt-3 text-sm text-[var(--ink-muted)]">
                  Performance {data.today.sleepPerformance ?? "—"}%
                </p>
              </section>
              <section className="panel px-6 py-10 sm:px-8">
                <p className="eyebrow">Strain</p>
                <p className="metric-num mt-4 text-5xl">{data.today.strain ?? "—"}</p>
                <p className="mt-3 text-sm text-[var(--ink-muted)]">Daily load · 0–21</p>
              </section>
            </div>

            <TrendsChart trends={data.trends} />
            <WorkoutsList workouts={data.workouts} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
