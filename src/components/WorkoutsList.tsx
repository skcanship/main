import type { DashboardPayload } from "@/lib/whoop/dashboard";

export function WorkoutsList({ workouts }: { workouts: DashboardPayload["workouts"] }) {
  return (
    <section className="hud-panel relative overflow-hidden p-6 sm:p-8">
      <div className="scanline" />
      <div className="relative z-10">
        <p className="hud-label">Activity log</p>
        <h2 className="font-display mt-2 text-2xl">WHOOP Workouts</h2>

        {workouts.length === 0 ? (
          <p className="mt-4 text-[var(--ink-muted)]">No recent workouts on signal.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {workouts.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold tracking-wide">{w.sport}</p>
                  <p className="font-mono text-xs text-[var(--ink-muted)]">
                    {new Date(w.start).toLocaleString()}
                    {w.durationMin != null ? ` · ${w.durationMin} min` : ""}
                  </p>
                </div>
                <div className="flex gap-5 font-mono text-sm">
                  <span>
                    <span className="text-[var(--ink-muted)]">STR </span>
                    {w.strain ?? "—"}
                  </span>
                  <span>
                    <span className="text-[var(--ink-muted)]">HR </span>
                    {w.avgHr ?? "—"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
