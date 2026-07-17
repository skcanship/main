import type { TrainingPlan } from "@/lib/workout-plan";

const intensityColor: Record<TrainingPlan["intensity"], string> = {
  Heavy: "var(--good)",
  Moderate: "var(--accent)",
  Light: "var(--warn)",
  Rest: "var(--ink-muted)",
};

export function TrainingPlanCard({ plan }: { plan: TrainingPlan }) {
  return (
    <div className="glass-dense p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="eyebrow">Session</p>
          <h2 className="font-display mt-2 text-4xl">Today&apos;s Work</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">{plan.rationale}</p>
        </div>
        <div className="text-right">
          <p className="eyebrow text-[var(--ink-muted)]">Split</p>
          <p className="font-display mt-1 text-xl">{plan.splitDay}</p>
          <p className="mt-1 text-sm" style={{ color: intensityColor[plan.intensity] }}>
            {plan.intensity} · {plan.dayType}
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm font-medium tracking-wide text-[var(--accent)]">{plan.focus}</p>

      <ul className="mt-3 divide-y divide-[var(--line)]">
        {plan.exercises.map((ex) => (
          <li key={ex.name} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
            <div>
              <p className="font-medium tracking-wide">{ex.name}</p>
              {ex.notes ? <p className="text-xs text-[var(--ink-muted)]">{ex.notes}</p> : null}
            </div>
            <p className="text-sm text-[var(--ink-muted)]">
              {ex.sets} × {ex.reps}
            </p>
          </li>
        ))}
      </ul>

      <ul className="mt-5 space-y-1 text-sm text-[var(--ink-muted)]">
        {plan.tips.map((tip) => (
          <li key={tip}>— {tip}</li>
        ))}
      </ul>
    </div>
  );
}
