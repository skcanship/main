"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { buildJarvisBriefing } from "@/lib/jarvis-briefing";
import { computeNutritionTargets } from "@/lib/nutrition";
import { loadBodyState } from "@/lib/body-metrics";
import { isCheckInDue, loadCheckIns } from "@/lib/recomp-checkin";
import { RecompCheckInCard } from "@/components/RecompCheckInCard";

const POLL_MS = 45_000;

export default function MorningCommandClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [proteinG, setProteinG] = useState(154);
  const [checkInDue, setCheckInDue] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/whoop/dashboard", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/?error=" + encodeURIComponent("Connect WHOOP to continue"));
          return;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load");
        setData(json);
        setLastSync(new Date());
        const weight = loadBodyState().metrics.weightLbs;
        setProteinG(computeNutritionTargets(weight).proteinG);
        setCheckInDue(isCheckInDue(loadCheckIns(), 7));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!opts?.silent) setLoading(false);
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

  if (loading && !data) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#050505]">
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
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#050505] px-6">
        <p className="text-[var(--bad)]">{error || "Unable to load morning command"}</p>
      </main>
    );
  }

  const brief = buildJarvisBriefing(data);

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#0c0805]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(90,44,7,0.45), transparent 55%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(140,141,104,0.14), transparent 50%), linear-gradient(160deg, #140c07, #0c0805 55%)",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-sm tracking-[0.28em]">ShankoFIT</p>
            <p className="font-mono text-[10px] text-[var(--ink-muted)]">
              Live
              {lastSync
                ? ` · ${lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : ""}
            </p>
          </div>
          <a href="/dashboard" className="btn-primary !px-3 !py-2 !text-[10px]">
            Command panel
          </a>
        </header>

        <div className="mt-4 grid flex-1 content-start gap-2 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dense border border-[var(--moss)]/40 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--moss-bright)] uppercase">
                Morning Command
              </p>
              <p
                className="font-mono border px-2 py-0.5 text-[10px] tracking-wider"
                style={{
                  borderColor:
                    brief.verdict === "GO"
                      ? "#8C8D6866"
                      : brief.verdict === "REST"
                        ? "#c45c3a66"
                        : "#A8A97E66",
                  color:
                    brief.verdict === "GO"
                      ? "#8C8D68"
                      : brief.verdict === "REST"
                        ? "#c45c3a"
                        : "#A8A97E",
                }}
              >
                {brief.statusLabel}
              </p>
            </div>
            <p className="font-display mt-3 text-2xl leading-tight sm:text-3xl">{brief.liftLine}</p>
            <div className="mt-3 space-y-1 font-mono text-xs text-[var(--ink-muted)]">
              <p>{brief.recoveryLine}</p>
              <p>{brief.intensityLine}</p>
              <p className="text-[var(--moss-bright)]">{brief.weekLine}</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="glass-dense p-3">
              <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--ink-muted)] uppercase">
                Recovery
              </p>
              <p className="metric-num mt-1 text-3xl text-[var(--good)]">
                {data.today.recoveryScore ?? "—"}
              </p>
            </div>
            <div className="glass-dense p-3">
              <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--ink-muted)] uppercase">
                Strain left
              </p>
              <p className="metric-num mt-1 text-3xl text-[var(--accent)]">
                {data.strainBudget.remaining ?? "—"}
              </p>
            </div>
            <div className="glass-dense p-3">
              <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--ink-muted)] uppercase">
                Lift
              </p>
              <p className="font-display mt-1 text-sm leading-snug">{data.split.today.scheduled}</p>
            </div>
            <div className="glass-dense p-3">
              <p className="font-mono text-[9px] tracking-[0.2em] text-[var(--ink-muted)] uppercase">
                Protein
              </p>
              <p className="metric-num mt-1 text-3xl text-[var(--accent)]">{proteinG}g</p>
            </div>
          </div>

          {checkInDue ? (
            <div className="max-h-64 overflow-y-auto">
              <RecompCheckInCard compact />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <a href="/dashboard#session" className="btn-primary !py-2.5">
              Open command panel
            </a>
            <button type="button" onClick={() => void load({ silent: true })} className="btn-ghost !py-2.5">
              Sync now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
