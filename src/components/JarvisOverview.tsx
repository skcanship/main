"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { buildJarvisBriefing, type JarvisBriefing } from "@/lib/jarvis-briefing";

const verdictColor: Record<JarvisBriefing["verdict"], string> = {
  GO: "#5eead4",
  MODERATE: "#c2a878",
  LIGHT: "#d4a84b",
  REST: "#c47a6a",
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
    <p className="font-mono text-sm leading-relaxed text-[#b6f0e8] sm:text-[15px]">
      <span className="mr-2 text-[#5eead4]">&#62;</span>
      {shown}
      <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-[#5eead4]" />
    </p>
  );
}

export function JarvisOverview({ data }: { data: DashboardPayload }) {
  const brief = buildJarvisBriefing(data);
  const accent = verdictColor[brief.verdict];

  return (
    <div className="relative overflow-hidden border border-[#5eead4]/35 bg-[rgba(4,18,22,0.82)] p-5 shadow-[0_0_40px_rgba(94,234,212,0.08)] backdrop-blur-xl sm:p-7">
      <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-[#5eead4]" />
      <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-[#5eead4]" />
      <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#5eead4]" />
      <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#5eead4]" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(94,234,212,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.35em] text-[#5eead4] uppercase">
              J.A.R.V.I.S. // Daily Briefing
            </p>
            <motion.h2
              className="font-display mt-2 text-3xl tracking-wide text-[#e8fffb] sm:text-4xl"
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
            <p className="font-mono text-[10px] tracking-[0.25em] text-[#9adfd6] uppercase">Status</p>
            <p className="font-mono mt-1 text-sm font-semibold tracking-wider" style={{ color: accent }}>
              {brief.statusLabel}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 border-t border-[#5eead4]/20 pt-5">
          <TypeLine text={brief.greeting} delay={100} />
          <TypeLine text={brief.recoveryLine} delay={700} />
          <TypeLine text={brief.intensityLine} delay={1600} />
          <TypeLine text={brief.liftLine} delay={2600} />
          <TypeLine text={brief.weekLine} delay={3400} />
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <div className="border border-[#5eead4]/20 bg-[rgba(0,0,0,0.25)] px-3 py-2.5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#7ecfc4] uppercase">Recovery</p>
            <p className="font-mono mt-1 text-2xl text-[#e8fffb]">
              {data.today.recoveryScore ?? "—"}
            </p>
          </div>
          <div className="border border-[#5eead4]/20 bg-[rgba(0,0,0,0.25)] px-3 py-2.5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#7ecfc4] uppercase">Intensity</p>
            <p className="font-mono mt-1 text-lg text-[#e8fffb]">{data.plan.intensity}</p>
          </div>
          <div className="border border-[#5eead4]/20 bg-[rgba(0,0,0,0.25)] px-3 py-2.5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#7ecfc4] uppercase">Lift</p>
            <p className="font-mono mt-1 text-sm leading-snug text-[#e8fffb]">
              {data.split.today.scheduled}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
