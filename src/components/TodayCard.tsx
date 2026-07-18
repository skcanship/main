import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { HudGauge } from "@/components/HudGauge";

function recoveryTone(score: number | null): "good" | "warn" | "bad" {
  if (score == null) return "good";
  if (score >= 67) return "good";
  if (score >= 34) return "warn";
  return "bad";
}

export function TodayCard({ today }: { today: DashboardPayload["today"] }) {
  return (
    <div className="glass-dense p-6 sm:p-9">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Today</p>
          <h2 className="font-display mt-2 text-4xl tracking-tight sm:text-5xl">Performance</h2>
        </div>
        <p className="text-sm text-[var(--ink-muted)]">{today.dateLabel}</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        <HudGauge label="Recovery" value={today.recoveryScore} tone={recoveryTone(today.recoveryScore)} />
        <HudGauge label="Strain" value={today.strain} max={21} tone="accent" />
        <HudGauge label="Sleep" value={today.sleepPerformance} tone="good" unit="%" />
        <div className="flex flex-col justify-center gap-5">
          <div>
            <p className="eyebrow text-[var(--ink-muted)]">HRV</p>
            <p className="metric-num mt-1 text-3xl">
              {today.hrvMs ?? "—"}
              <span className="ml-1 text-sm font-medium tracking-normal text-[var(--ink-muted)]">ms</span>
            </p>
          </div>
          <div>
            <p className="eyebrow text-[var(--ink-muted)]">Resting HR</p>
            <p className="metric-num mt-1 text-3xl">
              {today.restingHr ?? "—"}
              <span className="ml-1 text-sm font-medium tracking-normal text-[var(--ink-muted)]">bpm</span>
            </p>
          </div>
          <div>
            <p className="eyebrow text-[var(--ink-muted)]">Sleep</p>
            <p className="metric-num mt-1 text-3xl">
              {today.sleepDurationHours ?? "—"}
              <span className="ml-1 text-sm font-medium tracking-normal text-[var(--ink-muted)]">h</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
