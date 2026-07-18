"use client";

import { m, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { CountUp } from "@/components/CountUp";

const tones = {
  good: { stroke: "#30d158", glow: "rgba(48,209,88,0.35)" },
  warn: { stroke: "#ffd60a", glow: "rgba(255,214,10,0.3)" },
  bad: { stroke: "#ff453a", glow: "rgba(255,69,58,0.3)" },
  accent: { stroke: "#5ac8fa", glow: "rgba(90,200,250,0.35)" },
};

export function HudGauge({
  label,
  value,
  max = 100,
  unit,
  tone = "good",
}: {
  label: string;
  value: number | null;
  max?: number;
  unit?: string;
  tone?: "good" | "warn" | "bad" | "accent";
}) {
  const pct = value == null ? 0 : Math.max(0, Math.min(1, value / max));
  const r = 54;
  const c = 2 * Math.PI * r;
  const progress = useMotionValue(0);
  const dashOffset = useTransform(progress, (p) => c * (1 - p));
  const colors = tones[tone];

  useEffect(() => {
    const controls = animate(progress, pct, {
      duration: 1.25,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [pct, progress]);

  return (
    <m.div
      className="flex flex-col items-center"
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90 drop-shadow-[0_0_18px_var(--glow)]" viewBox="0 0 140 140" style={{ ["--glow" as string]: colors.glow }}>
          <circle cx="70" cy="70" r={r} fill="none" className="ring-track" strokeWidth="8" />
          <m.circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="metric-num text-3xl text-[var(--ink)]">
            <CountUp value={value} />
            {value != null && unit ? (
              <span className="ml-0.5 text-sm font-medium tracking-normal text-[var(--ink-muted)]">
                {unit}
              </span>
            ) : null}
          </span>
        </div>
      </div>
      <p className="eyebrow mt-3 text-[var(--ink-muted)]">{label}</p>
    </m.div>
  );
}
