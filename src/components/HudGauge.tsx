"use client";

export function HudGauge({
  label,
  value,
  max = 100,
  unit,
  tone = "moss",
}: {
  label: string;
  value: number | null;
  max?: number;
  unit?: string;
  tone?: "moss" | "seal" | "warn" | "danger";
}) {
  const pct = value == null ? 0 : Math.max(0, Math.min(1, value / max));
  const r = 54;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const stroke =
    tone === "seal" ? "#5A2C07" : tone === "warn" ? "#d4a017" : tone === "danger" ? "#c45c3a" : "#8C8D68";

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(140,141,104,0.15)" strokeWidth="6" />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
          <circle
            cx="70"
            cy="70"
            r="62"
            fill="none"
            stroke="rgba(90,44,7,0.35)"
            strokeWidth="1"
            strokeDasharray="4 6"
            className="animate-ring origin-center"
            style={{ transformOrigin: "70px 70px" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="hud-value text-3xl font-normal text-[var(--ink)]">
            {value ?? "—"}
            {value != null && unit ? <span className="text-sm text-[var(--ink-muted)]">{unit}</span> : null}
          </span>
        </div>
      </div>
      <p className="hud-label mt-2">{label}</p>
    </div>
  );
}
