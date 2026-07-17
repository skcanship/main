import type { DashboardPayload } from "@/lib/whoop/dashboard";

export function WorkoutsList({ workouts }: { workouts: DashboardPayload["workouts"] }) {
  return (
    <section className="border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold">Workouts</h2>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">Recent activity from WHOOP</p>

      {workouts.length === 0 ? (
        <p className="mt-4 text-[var(--ink-muted)]">No workouts found in the recent window.</p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--line)]">
          {workouts.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{w.sport}</p>
                <p className="text-xs text-[var(--ink-muted)]">
                  {new Date(w.start).toLocaleString()}
                  {w.durationMin != null ? ` · ${w.durationMin} min` : ""}
                </p>
              </div>
              <div className="flex gap-5 text-sm">
                <span>
                  <span className="text-[var(--ink-muted)]">Strain </span>
                  {w.strain ?? "—"}
                </span>
                <span>
                  <span className="text-[var(--ink-muted)]">Avg HR </span>
                  {w.avgHr ?? "—"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
