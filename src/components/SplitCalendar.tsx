import type { SplitAgenda } from "@/lib/split-plan";

const actionColor: Record<string, string> = {
  EXECUTE: "var(--good)",
  DEVIATE_REST: "var(--bad)",
  DEVIATE_LIGHT: "var(--warn)",
  PUSH_THROUGH: "var(--accent)",
  ACTIVE_RECOVERY: "var(--ink-muted)",
};

export function SplitCalendar({ split }: { split: SplitAgenda }) {
  return (
    <div className="glass-dense p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="eyebrow">Protocol</p>
          <h2 className="font-display mt-2 text-4xl">Training Split</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">{split.summary}</p>
        </div>
        <div className="min-w-[180px] border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-4 py-3">
          <p className="eyebrow text-[var(--ink-muted)]">Today</p>
          <p className="font-display mt-1 text-xl">{split.today.scheduled}</p>
          <p className="mt-1 text-sm" style={{ color: actionColor[split.today.action] }}>
            {split.today.actionLabel}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--ink-muted)]">{split.today.guidance}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {split.cycle.map((day) => (
          <span
            key={day}
            className="border border-[var(--line)] bg-[rgba(5,5,5,0.35)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[var(--ink-muted)] uppercase"
          >
            {day}
          </span>
        ))}
      </div>

      <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {split.days.map((d) => (
          <li
            key={d.date}
            className="border border-[var(--line)] bg-[rgba(5,5,5,0.4)] p-3"
            style={{
              borderColor: d.isToday ? "var(--accent)" : undefined,
              boxShadow: d.isToday ? "inset 0 0 0 1px rgba(194,168,120,0.35)" : undefined,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--ink-faint)]">{d.date.slice(5)}</span>
              {d.isToday ? <span className="eyebrow text-[10px]">Now</span> : null}
            </div>
            <p className="font-display mt-1.5 text-base tracking-wide normal-case">{d.scheduled}</p>
            <p className="mt-1 text-xs" style={{ color: actionColor[d.action] }}>
              {d.actionLabel}
            </p>
            <div className="mt-2 flex gap-3 text-xs text-[var(--ink-muted)]">
              <span>R {d.recoveryScore ?? "—"}</span>
              <span>S {d.strain ?? "—"}</span>
              <span>W {d.whoopWorkouts.length}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
