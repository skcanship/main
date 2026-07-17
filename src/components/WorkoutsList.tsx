import type { DashboardPayload } from "@/lib/whoop/dashboard";

export function WorkoutsList({ workouts }: { workouts: DashboardPayload["workouts"] }) {
  return (
    <section className="panel px-6 py-10 sm:px-10">
      <p className="eyebrow">Activity</p>
      <h2 className="font-display mt-3 text-4xl">Workouts</h2>

      {workouts.length === 0 ? (
        <p className="mt-6 text-[var(--ink-muted)]">No recent workouts.</p>
      ) : (
        <ul className="mt-8 divide-y divide-[var(--line)]">
          {workouts.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium tracking-wide">{w.sport}</p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  {new Date(w.start).toLocaleString()}
                  {w.durationMin != null ? ` · ${w.durationMin} min` : ""}
                </p>
              </div>
              <div className="flex gap-6 text-sm text-[var(--ink-muted)]">
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
    </section>
  );
}
