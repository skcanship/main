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
    <section className="panel animate-fade-up-2 px-6 py-10 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="eyebrow">Protocol</p>
          <h2 className="font-display mt-3 text-4xl">Training Split</h2>
          <p className="mt-4 text-[var(--ink-muted)] leading-relaxed">{split.summary}</p>
        </div>
        <div className="panel-inset min-w-[200px] px-5 py-4">
          <p className="eyebrow text-[var(--ink-muted)]">Today</p>
          <p className="font-display mt-2 text-2xl text-[var(--ink)]">{split.today.scheduled}</p>
          <p className="mt-2 text-sm" style={{ color: actionColor[split.today.action] }}>
            {split.today.actionLabel}
          </p>
        </div>
      </div>

      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)]">{split.today.guidance}</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {split.cycle.map((day) => (
          <span
            key={day}
            className="border border-[var(--line)] px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-[var(--ink-muted)] uppercase"
          >
            {day}
          </span>
        ))}
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {split.days.map((d) => (
          <li
            key={d.date}
            className="panel-inset p-4 transition"
            style={{
              borderColor: d.isToday ? "var(--accent)" : undefined,
              background: d.isToday ? "var(--accent-soft)" : undefined,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs tracking-wide text-[var(--ink-faint)]">{d.date.slice(5)}</span>
              {d.isToday ? <span className="eyebrow text-[10px]">Now</span> : null}
            </div>
            <p className="font-display mt-2 text-lg tracking-wide normal-case">{d.scheduled}</p>
            <p className="mt-1 text-xs" style={{ color: actionColor[d.action] }}>
              {d.actionLabel}
            </p>
            <div className="mt-3 flex gap-4 text-xs text-[var(--ink-muted)]">
              <span>R {d.recoveryScore ?? "—"}</span>
              <span>S {d.strain ?? "—"}</span>
              <span>W {d.whoopWorkouts.length}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
