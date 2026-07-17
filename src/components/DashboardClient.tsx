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
        router.replace("/?error=" + encodeURIComponent("Link WHOOP to arm the system"));
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load command center");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load command center");
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
    <main className="relative mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-8">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="hud-label animate-pulse-line">Tactical OS</p>
          <h1 className="font-display mt-2 text-4xl tracking-[0.06em] text-[var(--ink)] sm:text-5xl">
            Operation Killmonger
          </h1>
          {data?.user ? (
            <p className="mt-2 font-mono text-sm text-[var(--ink-muted)]">
              Operative {data.user.firstName} {data.user.lastName}
            </p>
          ) : (
            <p className="mt-2 text-[var(--ink-muted)]">WHOOP command center</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="border border-[var(--line)] px-4 py-2 font-mono text-xs tracking-wider uppercase transition hover:border-[var(--moss)]"
          >
            Sync
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="border border-[var(--line)] px-4 py-2 font-mono text-xs tracking-wider text-[var(--ink-muted)] uppercase transition hover:border-[var(--danger)] hover:text-[var(--danger)]"
          >
            Disconnect
          </button>
        </div>
      </header>

      {loading ? (
        <p className="font-mono animate-breathe text-[var(--moss)]">Establishing uplink…</p>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mb-6 border border-[var(--danger)]/50 bg-[rgba(196,92,58,0.12)] px-4 py-3 font-mono text-sm text-[#f0b4a0]"
        >
          {error}
        </div>
      ) : null}

      {data ? (
        <div className="space-y-8">
          <TodayCard today={data.today} />
          <BodyMetricsPanel />
          <SplitCalendar split={data.split} />
          <TrainingPlanCard plan={data.plan} />

          <div className="grid gap-8 lg:grid-cols-3">
            <section className="hud-panel p-6">
              <p className="hud-label">Recovery</p>
              <p className="hud-value mt-3 text-4xl text-[var(--moss-bright)]">
                {data.today.recoveryScore ?? "—"}
              </p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                HRV {data.today.hrvMs ?? "—"} ms · RHR {data.today.restingHr ?? "—"} bpm
              </p>
            </section>
            <section className="hud-panel p-6">
              <p className="hud-label">Sleep</p>
              <p className="hud-value mt-3 text-4xl text-[var(--accent-hot)]">
                {data.today.sleepDurationHours ?? "—"}
                <span className="text-lg text-[var(--ink-muted)]"> h</span>
              </p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                Performance {data.today.sleepPerformance ?? "—"}%
              </p>
            </section>
            <section className="hud-panel p-6">
              <p className="hud-label">Strain</p>
              <p className="hud-value mt-3 text-4xl" style={{ color: "#c4a35a" }}>
                {data.today.strain ?? "—"}
              </p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">Physiological load 0–21</p>
            </section>
          </div>

          <TrendsChart trends={data.trends} />
          <WorkoutsList workouts={data.workouts} />
        </div>
      ) : null}
    </main>
  );
}
