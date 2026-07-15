import type { DashboardPayload } from "@/lib/whoop/dashboard";

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
}) {
  return (
    <div>
      <p className="text-xs tracking-wider text-[var(--ink-muted)] uppercase">{label}</p>
      <p className="font-display mt-1 text-3xl font-bold tracking-tight">
        {value ?? "—"}
        {value != null && unit ? (
          <span className="ml-1 text-base font-medium text-[var(--ink-muted)]">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}

function recoveryTone(score: number | null): string {
  if (score == null) return "var(--ink-muted)";
  if (score >= 67) return "var(--accent)";
  if (score >= 34) return "var(--warn)";
  return "var(--danger)";
}

export function TodayCard({ today }: { today: DashboardPayload["today"] }) {
  return (
    <section className="animate-rise border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-6 backdrop-blur-sm sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Today</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{today.dateLabel}</p>
        </div>
        <p
          className="font-display text-5xl font-bold"
          style={{ color: recoveryTone(today.recoveryScore) }}
        >
          {today.recoveryScore ?? "—"}
          <span className="ml-2 text-sm font-medium tracking-wide text-[var(--ink-muted)] uppercase">
            Recovery
          </span>
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
        <Metric label="HRV" value={today.hrvMs} unit="ms" />
        <Metric label="Resting HR" value={today.restingHr} unit="bpm" />
        <Metric label="Sleep" value={today.sleepDurationHours} unit="h" />
        <Metric label="Day Strain" value={today.strain} />
      </div>
    </section>
  );
}
