"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { buildJarvisBriefing } from "@/lib/jarvis-briefing";
import { computeNutritionTargets } from "@/lib/nutrition";
import { loadBodyState } from "@/lib/body-metrics";
import { StrainBudgetCard } from "@/components/StrainBudgetCard";
import { RecompCheckInCard } from "@/components/RecompCheckInCard";
import { isCheckInDue, loadCheckIns } from "@/lib/recomp-checkin";
import { CountUp } from "@/components/CountUp";

export default function MorningCommandClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [proteinG, setProteinG] = useState(160);
  const [checkInDue, setCheckInDue] = useState(false);

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
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setData(json);
      const weight = loadBodyState().metrics.weightLbs;
      setProteinG(computeNutritionTargets(weight).proteinG);
      setCheckInDue(isCheckInDue(loadCheckIns(), 7));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
        <div className="aurora-orb h-80 w-80 bg-[rgba(90,200,250,0.2)]" />
        <m.p
          className="relative z-10 text-sm font-semibold tracking-[0.28em] text-[var(--accent)] uppercase"
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          Morning systems online
        </m.p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6">
        <p className="text-[var(--bad)]">{error || "Unable to load morning command"}</p>
      </main>
    );
  }

  const brief = buildJarvisBriefing(data);
  const statusColor =
    brief.verdict === "GO" ? "#30d158" : brief.verdict === "REST" ? "#ff453a" : "#5ac8fa";

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(90,200,250,0.2), transparent 55%), radial-gradient(ellipse 40% 35% at 90% 80%, rgba(48,209,88,0.1), transparent 50%), #000",
        }}
      />
      <div className="aurora-orb -left-10 top-24 h-72 w-72 bg-[rgba(90,200,250,0.18)]" />
      <div className="aurora-orb -right-8 bottom-20 h-64 w-64 bg-[rgba(191,90,242,0.12)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-5 sm:px-8">
        <header className="flex items-center justify-between gap-3">
          <p className="font-display text-[15px] tracking-tight">ShankoFIT</p>
          <a href="/dashboard" className="btn-ghost !py-2 !px-4 text-xs">
            Command center
          </a>
        </header>

        <div className="mt-5 flex flex-1 flex-col justify-center gap-3.5 pb-8">
          <m.div
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-dense p-6 sm:p-7"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Morning Command</p>
                <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
                  Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}
                  {data.user ? `, ${data.user.firstName}` : ""}
                </h1>
              </div>
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase"
                style={{
                  color: statusColor,
                  background: `${statusColor}22`,
                  border: `1px solid ${statusColor}55`,
                }}
              >
                {brief.statusLabel}
              </span>
            </div>
            <div className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-[13px] leading-relaxed text-[var(--ink-muted)] sm:text-sm">
              <p>{brief.recoveryLine}</p>
              <p>{brief.intensityLine}</p>
              <p className="font-display text-xl tracking-tight text-[var(--ink)] sm:text-2xl">
                {brief.liftLine}
              </p>
              <p className="text-xs text-[var(--accent)]">{brief.weekLine}</p>
            </div>
          </m.div>

          <m.div
            className="grid gap-3 sm:grid-cols-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.65 }}
          >
            <div className="glass-dense p-5">
              <p className="eyebrow">Today&apos;s lift</p>
              <p className="font-display mt-2 text-2xl leading-tight tracking-tight">
                {data.split.today.scheduled}
              </p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">{data.plan.focus}</p>
              <p className="mt-3 text-xs font-semibold tracking-wide text-[var(--accent)] uppercase">
                {data.plan.intensity}
              </p>
            </div>
            <div className="glass-dense p-5">
              <p className="eyebrow">Protein</p>
              <p className="metric-num mt-2 text-5xl text-[var(--accent)]">
                <CountUp value={proteinG} />
                <span className="text-xl text-[var(--ink-muted)]">g</span>
              </p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">Hit before midnight.</p>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.65 }}
          >
            <StrainBudgetCard budget={data.strainBudget} />
          </m.div>

          {checkInDue ? (
            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.65 }}
            >
              <RecompCheckInCard compact />
            </m.div>
          ) : null}

          <m.div
            className="flex flex-wrap gap-3 pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
          >
            <a href="/dashboard#session" className="btn-primary">
              Go · start session
            </a>
            <a href="/dashboard" className="btn-ghost">
              Open insights
            </a>
          </m.div>
        </div>
      </div>
    </main>
  );
}
