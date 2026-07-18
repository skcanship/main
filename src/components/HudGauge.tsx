"use client";

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
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const stroke =
    tone === "warn" ? "var(--warn)" : tone === "bad" ? "var(--bad)" : tone === "accent" ? "var(--accent)" : "var(--good)";

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(247,244,239,0.08)" strokeWidth="3" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="metric-num text-3xl text-[var(--ink)]">
            {value ?? "—"}
            {value != null && unit ? (
              <span className="ml-0.5 text-sm font-normal tracking-normal text-[var(--ink-muted)] normal-case">
                {unit}
              </span>
            ) : null}
          </span>
        </div>
      </div>
      <p className="eyebrow mt-3 text-[var(--ink-muted)]">{label}</p>
    </div>
  );
}
