import type { WeeklyReadiness } from "@/lib/weekly-readiness";

const modeColor: Record<WeeklyReadiness["mode"], string> = {
  PUSH: "var(--good)",
  MAINTAIN: "var(--accent)",
  DELOAD: "var(--bad)",
};

export function WeeklyReadinessCard({ weekly }: { weekly: WeeklyReadiness }) {
  return (
    <div className="glass-dense p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">This week</p>
          <h2 className="font-display mt-2 text-4xl">Readiness</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--ink-muted)]">{weekly.summary}</p>
        </div>
        <div className="text-right">
          <p className="metric-num text-5xl" style={{ color: modeColor[weekly.mode] }}>
            {weekly.score}
          </p>
          <p className="mt-1 text-sm font-semibold tracking-wide" style={{ color: modeColor[weekly.mode] }}>
            {weekly.label}
          </p>
        </div>
      </div>

      {weekly.deloadSuggested ? (
        <div className="mt-5 border border-[var(--bad)]/40 bg-[rgba(196,122,106,0.12)] px-4 py-3 text-sm text-[#e8b4a8]">
          Deload detector: fatigue pattern spotted (low recovery and/or stacked hard strain). Pull volume
          back this week.
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Avg recovery", value: weekly.avgRecovery ?? "—" },
          { label: "Avg sleep", value: weekly.avgSleepPerf != null ? `${weekly.avgSleepPerf}%` : "—" },
          { label: "Avg strain", value: weekly.avgStrain ?? "—" },
          { label: "Low days", value: weekly.lowRecoveryDays },
        ].map((item) => (
          <div key={item.label} className="border border-[var(--line)] bg-[rgba(5,5,5,0.35)] p-3">
            <p className="eyebrow text-[var(--ink-muted)]">{item.label}</p>
            <p className="metric-num mt-2 text-2xl">{item.value}</p>
          </div>
        ))}
      </div>

      {weekly.drivers.length ? (
        <p className="mt-4 text-xs tracking-wide text-[var(--ink-muted)]">{weekly.drivers.join(" · ")}</p>
      ) : null}
    </div>
  );
}
