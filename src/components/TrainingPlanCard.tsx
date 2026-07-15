import type { TrainingPlan } from "@/lib/workout-plan";

const intensityColor: Record<TrainingPlan["intensity"], string> = {
  Heavy: "var(--accent)",
  Moderate: "var(--warn)",
  Light: "#7eb6ff",
  Rest: "var(--ink-muted)",
};

export function TrainingPlanCard({ plan }: { plan: TrainingPlan }) {
  return (
    <section className="animate-rise-delay-2 border border-[var(--line)] bg-[var(--bg-elevated)]/70 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Training Plan Recommendation</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--ink-muted)]">{plan.rationale}</p>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-wider text-[var(--ink-muted)] uppercase">Day type</p>
          <p
            className="font-display mt-1 text-2xl font-bold"
            style={{ color: intensityColor[plan.intensity] }}
          >
            {plan.dayType}
          </p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">Intensity: {plan.intensity}</p>
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-[var(--accent)]">{plan.focus}</p>

      <ul className="mt-4 divide-y divide-[var(--line)]">
        {plan.exercises.map((ex) => (
          <li key={ex.name} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <div>
              <p className="font-medium">{ex.name}</p>
              {ex.notes ? <p className="text-xs text-[var(--ink-muted)]">{ex.notes}</p> : null}
            </div>
            <p className="text-sm text-[var(--ink-muted)]">
              {ex.sets} × {ex.reps}
            </p>
          </li>
        ))}
      </ul>

      <ul className="mt-5 space-y-1.5 text-sm text-[var(--ink-muted)]">
        {plan.tips.map((tip) => (
          <li key={tip}>— {tip}</li>
        ))}
      </ul>
    </section>
  );
}
