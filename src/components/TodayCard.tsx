import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { HudGauge } from "@/components/HudGauge";

function recoveryTone(score: number | null): "moss" | "warn" | "danger" {
  if (score == null) return "moss";
  if (score >= 67) return "moss";
  if (score >= 34) return "warn";
  return "danger";
}

export function TodayCard({ today }: { today: DashboardPayload["today"] }) {
  return (
    <section className="hud-panel animate-rise relative overflow-hidden p-6 sm:p-8">
      <div className="scanline" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="hud-label">Command readout</p>
            <h2 className="font-display mt-2 text-3xl tracking-wide">Today</h2>
            <p className="font-mono mt-1 text-sm text-[var(--ink-muted)]">{today.dateLabel}</p>
          </div>
          <p className="animate-pulse-line font-mono text-xs tracking-[0.3em] text-[var(--moss-bright)]">
            SYSTEMS NOMINAL
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          <HudGauge label="Recovery" value={today.recoveryScore} tone={recoveryTone(today.recoveryScore)} />
          <HudGauge label="Day Strain" value={today.strain} max={21} tone="seal" />
          <HudGauge label="Sleep Perf" value={today.sleepPerformance} tone="moss" unit="%" />
          <div className="flex flex-col justify-center gap-4">
            <div>
              <p className="hud-label">HRV</p>
              <p className="hud-value mt-1 text-3xl">
                {today.hrvMs ?? "—"}
                <span className="text-sm text-[var(--ink-muted)]"> ms</span>
              </p>
            </div>
            <div>
              <p className="hud-label">Resting HR</p>
              <p className="hud-value mt-1 text-3xl">
                {today.restingHr ?? "—"}
                <span className="text-sm text-[var(--ink-muted)]"> bpm</span>
              </p>
            </div>
            <div>
              <p className="hud-label">Sleep duration</p>
              <p className="hud-value mt-1 text-3xl">
                {today.sleepDurationHours ?? "—"}
                <span className="text-sm text-[var(--ink-muted)]"> h</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
