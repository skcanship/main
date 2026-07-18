"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { buildJarvisBriefing } from "@/lib/jarvis-briefing";
import { computeNutritionTargets } from "@/lib/nutrition";
import { loadBodyState } from "@/lib/body-metrics";
import { StrainBudgetCard } from "@/components/StrainBudgetCard";
import { RecompCheckInCard } from "@/components/RecompCheckInCard";
import { isCheckInDue, loadCheckIns } from "@/lib/recomp-checkin";

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
      <main className="flex min-h-screen items-center justify-center bg-[#050505]">
        <motion.p
          className="text-sm tracking-[0.25em] text-[var(--accent)] uppercase"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Morning systems online…
        </motion.p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6">
        <p className="text-[var(--bad)]">{error || "Unable to load morning command"}</p>
      </main>
    );
  }

  const brief = buildJarvisBriefing(data);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(194,168,120,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(94,234,212,0.08), transparent 50%), linear-gradient(160deg, #12100e, #050505 55%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between gap-3">
          <p className="font-display text-sm tracking-[0.28em]">ShankoFIT</p>
          <a href="/dashboard" className="btn-ghost !py-2 !px-3">
            Full dashboard
          </a>
        </header>

        <div className="mt-6 flex flex-1 flex-col justify-center gap-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-[#5eead4]/30 bg-[rgba(4,18,22,0.85)] p-5 backdrop-blur-xl"
          >
            <p className="font-mono text-[10px] tracking-[0.35em] text-[#5eead4] uppercase">
              Morning Command
            </p>
            <p className="font-mono mt-3 text-sm text-[#b6f0e8]">{brief.greeting}</p>
            <p className="font-mono mt-2 text-sm text-[#b6f0e8]">{brief.recoveryLine}</p>
            <p className="font-mono mt-2 text-sm text-[#b6f0e8]">{brief.intensityLine}</p>
            <p className="mt-4 font-display text-2xl text-[#e8fffb] sm:text-3xl">{brief.liftLine}</p>
            <p className="font-mono mt-2 text-xs text-[#7ecfc4]">{brief.weekLine}</p>
            <p
              className="font-mono mt-4 inline-block border px-2 py-1 text-xs tracking-wider"
              style={{
                borderColor:
                  brief.verdict === "GO"
                    ? "#5eead466"
                    : brief.verdict === "REST"
                      ? "#c47a6a66"
                      : "#c2a87866",
                color:
                  brief.verdict === "GO"
                    ? "#5eead4"
                    : brief.verdict === "REST"
                      ? "#c47a6a"
                      : "#c2a878",
              }}
            >
              {brief.statusLabel}
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="glass-dense p-5">
              <p className="eyebrow">Today&apos;s lift</p>
              <p className="font-display mt-2 text-2xl leading-tight">{data.split.today.scheduled}</p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">{data.plan.focus}</p>
              <p className="mt-3 text-xs tracking-wide text-[var(--accent)] uppercase">
                Intensity · {data.plan.intensity}
              </p>
            </div>
            <div className="glass-dense p-5">
              <p className="eyebrow">Protein target</p>
              <p className="metric-num mt-2 text-5xl text-[var(--accent)]">{proteinG}g</p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">Hit this before midnight. Recomp fuel.</p>
            </div>
          </div>

          <StrainBudgetCard budget={data.strainBudget} />

          {checkInDue ? <RecompCheckInCard compact /> : null}

          <div className="flex flex-wrap gap-3 pt-1">
            <a href="/dashboard#session" className="btn-primary">
              Go · start session
            </a>
            <a href="/dashboard" className="btn-ghost">
              Open command center
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
