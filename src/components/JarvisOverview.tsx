"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { buildJarvisBriefing, type JarvisBriefing } from "@/lib/jarvis-briefing";

const verdictColor: Record<JarvisBriefing["verdict"], string> = {
  GO: "#30d158",
  MODERATE: "#5ac8fa",
  LIGHT: "#ffd60a",
  REST: "#ff453a",
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
      }, 12);
    }, delay);
    return () => {
      window.clearTimeout(start);
      if (intervalId != null) window.clearInterval(intervalId);
    };
  }, [text, delay]);

  return (
    <p className="text-sm leading-relaxed text-[var(--ink-muted)] sm:text-[15px]">
      <span className="mr-2 text-[var(--accent)]">&#62;</span>
      <span className="text-[var(--ink)]">{shown}</span>
      <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-[var(--accent)]" />
    </p>
  );
}

export function JarvisOverview({ data }: { data: DashboardPayload }) {
  const brief = buildJarvisBriefing(data);
  const accent = verdictColor[brief.verdict];

  return (
    <div className="glass-dense relative p-5 sm:p-8">
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">J.A.R.V.I.S. · Daily Briefing</p>
            <motion.h2
              className="font-display mt-2 text-3xl tracking-tight sm:text-4xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              System Overview
            </motion.h2>
          </div>

          <div
            className="rounded-full px-3 py-2 text-center"
            style={{ border: `1px solid ${accent}66`, background: `${accent}18` }}
          >
            <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--ink-muted)] uppercase">
              Status
            </p>
            <p className="mt-0.5 text-xs font-bold tracking-wider" style={{ color: accent }}>
              {brief.statusLabel}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
          <TypeLine text={brief.greeting} delay={80} />
          <TypeLine text={brief.recoveryLine} delay={600} />
          <TypeLine text={brief.intensityLine} delay={1400} />
          <TypeLine text={brief.liftLine} delay={2300} />
          <TypeLine text={brief.weekLine} delay={3000} />
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {[
            { label: "Recovery", value: data.today.recoveryScore ?? "—" },
            { label: "Intensity", value: data.plan.intensity },
            { label: "Lift", value: data.split.today.scheduled },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-black/30 px-3 py-3"
            >
              <p className="eyebrow text-[var(--ink-muted)]">{item.label}</p>
              <p className="metric-num mt-1 text-xl tracking-tight">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
