"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { buildJarvisBriefing, type JarvisBriefing } from "@/lib/jarvis-briefing";

const verdictColor: Record<JarvisBriefing["verdict"], string> = {
  GO: "#8C8D68",
  MODERATE: "#A8A97E",
  LIGHT: "#d4a017",
  REST: "#c45c3a",
};

function TypeLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    let i = 0;
    let intervalId: number | undefined;
    const start = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length && intervalId != null) window.clearInterval(intervalId);
      }, 14);
    }, delay);
    return () => {
      window.clearTimeout(start);
      if (intervalId != null) window.clearInterval(intervalId);
    };
  }, [text, delay]);

  return (
    <p className="font-mono text-sm leading-relaxed text-[var(--ink-muted)] sm:text-[15px]">
      <span className="mr-2 text-[var(--moss-bright)]">&#62;</span>
      <span className="text-[var(--ink)]">{shown}</span>
      <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-[var(--moss)]" />
    </p>
  );
}

export function JarvisOverview({ data }: { data: DashboardPayload }) {
  const brief = buildJarvisBriefing(data);
  const accent = verdictColor[brief.verdict];

  return (
    <div className="glass-dense relative overflow-hidden p-5 sm:p-7">
      <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-[var(--moss)]" />
      <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-[var(--moss)]" />
      <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[var(--moss)]" />
      <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[var(--moss)]" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--moss-bright)] uppercase">
              J.A.R.V.I.S. // Daily Briefing
            </p>
            <motion.h2
              className="font-display mt-2 text-3xl tracking-wide text-[var(--ink)] sm:text-4xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              System Overview
            </motion.h2>
          </div>

          <div
            className="border px-3 py-2 text-center"
            style={{ borderColor: `${accent}66`, background: `${accent}14` }}
          >
            <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--ink-muted)] uppercase">
              Status
            </p>
            <p className="font-mono mt-1 text-sm font-semibold tracking-wider" style={{ color: accent }}>
              {brief.statusLabel}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-[var(--line)] pt-5">
          <TypeLine text={brief.greeting} delay={100} />
          <TypeLine text={brief.recoveryLine} delay={700} />
          <TypeLine text={brief.intensityLine} delay={1600} />
          <TypeLine text={brief.liftLine} delay={2600} />
          <TypeLine text={brief.weekLine} delay={3400} />
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <div className="border border-[var(--line)] bg-[rgba(90,44,7,0.25)] px-3 py-2.5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--ink-muted)] uppercase">
              Recovery
            </p>
            <p className="font-mono mt-1 text-2xl text-[var(--ink)]">
              {data.today.recoveryScore ?? "—"}
            </p>
          </div>
          <div className="border border-[var(--line)] bg-[rgba(90,44,7,0.25)] px-3 py-2.5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--ink-muted)] uppercase">
              Intensity
            </p>
            <p className="font-mono mt-1 text-lg text-[var(--ink)]">{data.plan.intensity}</p>
          </div>
          <div className="border border-[var(--line)] bg-[rgba(90,44,7,0.25)] px-3 py-2.5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--ink-muted)] uppercase">
              Lift
            </p>
            <p className="font-mono mt-1 text-sm leading-snug text-[var(--ink)]">
              {data.split.today.scheduled}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
