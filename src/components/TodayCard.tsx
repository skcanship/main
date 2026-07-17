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
    <section className="panel animate-fade-up px-6 py-10 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Today</p>
          <h2 className="font-display mt-3 text-4xl text-[var(--ink)] sm:text-5xl">Performance</h2>
        </div>
        <p className="text-sm tracking-wide text-[var(--ink-muted)]">{today.dateLabel}</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-8 lg:grid-cols-4">
        <HudGauge label="Recovery" value={today.recoveryScore} tone={recoveryTone(today.recoveryScore)} />
        <HudGauge label="Strain" value={today.strain} max={21} tone="accent" />
        <HudGauge label="Sleep" value={today.sleepPerformance} tone="good" unit="%" />
        <div className="flex flex-col justify-center gap-6">
          <div>
            <p className="eyebrow text-[var(--ink-muted)]">HRV</p>
            <p className="metric-num mt-2 text-4xl">
              {today.hrvMs ?? "—"}
              <span className="ml-1 text-sm tracking-normal text-[var(--ink-muted)] normal-case">ms</span>
            </p>
          </div>
          <div>
            <p className="eyebrow text-[var(--ink-muted)]">Resting HR</p>
            <p className="metric-num mt-2 text-4xl">
              {today.restingHr ?? "—"}
              <span className="ml-1 text-sm tracking-normal text-[var(--ink-muted)] normal-case">bpm</span>
            </p>
          </div>
          <div>
            <p className="eyebrow text-[var(--ink-muted)]">Sleep duration</p>
            <p className="metric-num mt-2 text-4xl">
              {today.sleepDurationHours ?? "—"}
              <span className="ml-1 text-sm tracking-normal text-[var(--ink-muted)] normal-case">h</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
