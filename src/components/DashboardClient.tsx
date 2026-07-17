"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { TodayCard } from "@/components/TodayCard";
import { TrendsChart } from "@/components/TrendsChart";
import { TrainingPlanCard } from "@/components/TrainingPlanCard";
import { WorkoutsList } from "@/components/WorkoutsList";

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
        router.replace("/?error=" + encodeURIComponent("Please connect your WHOOP account"));
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load dashboard");
      }
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
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 sm:px-10">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-sm font-semibold tracking-[0.28em] text-[var(--accent)] uppercase">
            PulsePlan
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Health Dashboard
          </h1>
          {data?.user ? (
            <p className="mt-2 text-[var(--ink-muted)]">
              Welcome back, {data.user.firstName}
            </p>
          ) : null}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm transition hover:border-[var(--accent)]/50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-md border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink-muted)] transition hover:border-[var(--danger)]/50 hover:text-[var(--danger)]"
          >
            Disconnect
          </button>
        </div>
      </header>

      {loading ? (
        <p className="animate-drift text-[var(--ink-muted)]">Loading WHOOP data…</p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mb-6 border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[#ffb4b4]"
        >
          {error}
        </div>
      ) : null}

      {data ? (
        <div className="space-y-8">
          <TodayCard today={data.today} />

          <div className="grid gap-8 lg:grid-cols-2">
            <section className="border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">Recovery</h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                Score, HRV, and resting heart rate from your latest scored recovery.
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-xs text-[var(--ink-muted)] uppercase">Score</dt>
                  <dd className="font-display mt-1 text-2xl font-bold">{data.today.recoveryScore ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--ink-muted)] uppercase">HRV</dt>
                  <dd className="font-display mt-1 text-2xl font-bold">
                    {data.today.hrvMs ?? "—"}
                    <span className="text-sm text-[var(--ink-muted)]"> ms</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--ink-muted)] uppercase">RHR</dt>
                  <dd className="font-display mt-1 text-2xl font-bold">
                    {data.today.restingHr ?? "—"}
                    <span className="text-sm text-[var(--ink-muted)]"> bpm</span>
                  </dd>
                </div>
              </dl>
            </section>

            <section className="border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">Sleep</h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                Duration and performance from your latest main sleep.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-[var(--ink-muted)] uppercase">Duration</dt>
                  <dd className="font-display mt-1 text-2xl font-bold">
                    {data.today.sleepDurationHours ?? "—"}
                    <span className="text-sm text-[var(--ink-muted)]"> h</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--ink-muted)] uppercase">Performance</dt>
                  <dd className="font-display mt-1 text-2xl font-bold">
                    {data.today.sleepPerformance ?? "—"}
                    <span className="text-sm text-[var(--ink-muted)]"> %</span>
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold">Strain</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Current physiological cycle strain (0–21 scale).
            </p>
            <p className="font-display mt-4 text-4xl font-bold text-[var(--warn)]">
              {data.today.strain ?? "—"}
            </p>
          </section>

          <TrendsChart trends={data.trends} />
          <TrainingPlanCard plan={data.plan} />
          <WorkoutsList workouts={data.workouts} />
        </div>
      ) : null}
    </main>
  );
}
