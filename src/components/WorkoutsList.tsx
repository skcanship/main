import type { DashboardPayload } from "@/lib/whoop/dashboard";

export function WorkoutsList({ workouts }: { workouts: DashboardPayload["workouts"] }) {
  return (
    <div className="glass-dense p-6 sm:p-8">
      <p className="eyebrow">Activity</p>
      <h2 className="font-display mt-2 text-4xl">Workouts</h2>

      {workouts.length === 0 ? (
        <p className="mt-4 text-[var(--ink-muted)]">No recent workouts.</p>
      ) : (
        <ul className="mt-5 divide-y divide-[var(--line)]">
          {workouts.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium tracking-wide">{w.sport}</p>
                <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
                  {new Date(w.start).toLocaleString()}
                  {w.durationMin != null ? ` · ${w.durationMin} min` : ""}
                </p>
              </div>
              <div className="flex gap-5 text-sm text-[var(--ink-muted)]">
                <span>
                  Strain <span className="text-[var(--ink)]">{w.strain ?? "—"}</span>
                </span>
                <span>
                  Avg HR <span className="text-[var(--ink)]">{w.avgHr ?? "—"}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
