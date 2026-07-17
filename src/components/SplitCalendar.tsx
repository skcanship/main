import type { SplitAgenda } from "@/lib/split-plan";

const actionColor: Record<string, string> = {
  EXECUTE: "var(--moss-bright)",
  DEVIATE_REST: "var(--danger)",
  DEVIATE_LIGHT: "var(--warn)",
  PUSH_THROUGH: "var(--accent-hot)",
  ACTIVE_RECOVERY: "var(--moss)",
};

export function SplitCalendar({ split }: { split: SplitAgenda }) {
  return (
    <section className="hud-panel animate-rise-delay-2 relative overflow-hidden p-6 sm:p-8">
      <div className="scanline" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="hud-label">Tactical split</p>
            <h2 className="font-display mt-2 text-2xl tracking-wide">Mission Calendar</h2>
            <p className="mt-2 max-w-2xl text-[var(--ink-muted)]">{split.summary}</p>
          </div>
          <div className="border border-[var(--line)] px-4 py-3">
            <p className="hud-label">Today</p>
            <p className="font-display mt-1 text-xl text-[var(--moss-bright)]">{split.today.scheduled}</p>
            <p className="font-mono mt-1 text-xs" style={{ color: actionColor[split.today.action] }}>
              {split.today.actionLabel}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--ink-muted)]">{split.today.guidance}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {split.cycle.map((day) => (
            <span
              key={day}
              className="border border-[var(--line)] px-3 py-1 font-mono text-[10px] tracking-wider text-[var(--ink-muted)] uppercase"
            >
              {day}
            </span>
          ))}
        </div>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {split.days.map((d) => (
            <li
              key={d.date}
              className="border border-[var(--line)] p-3 transition"
              style={{
                background: d.isToday ? "rgba(90,44,7,0.45)" : "rgba(12,8,5,0.35)",
                boxShadow: d.isToday ? "inset 0 0 0 1px rgba(140,141,104,0.45)" : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[var(--ink-muted)]">{d.date.slice(5)}</span>
                {d.isToday ? <span className="hud-label text-[10px]">NOW</span> : null}
              </div>
              <p className="mt-1 font-semibold tracking-wide">{d.scheduled}</p>
              <p className="font-mono mt-1 text-[11px]" style={{ color: actionColor[d.action] }}>
                {d.actionLabel}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 font-mono text-[11px] text-[var(--ink-muted)]">
                <span>R {d.recoveryScore ?? "—"}</span>
                <span>S {d.strain ?? "—"}</span>
                <span>W {d.whoopWorkouts.length}</span>
              </div>
              {d.whoopWorkouts.length > 0 ? (
                <p className="mt-1 truncate text-xs text-[var(--moss)]">
                  {d.whoopWorkouts.map((w) => w.sport).join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
