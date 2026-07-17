import type { TrainingPlan } from "@/lib/workout-plan";

const intensityColor: Record<TrainingPlan["intensity"], string> = {
  Heavy: "var(--good)",
  Moderate: "var(--accent)",
  Light: "var(--warn)",
  Rest: "var(--ink-muted)",
};

export function TrainingPlanCard({ plan }: { plan: TrainingPlan }) {
  return (
    <section className="panel animate-fade-up-3 px-6 py-10 sm:px-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="eyebrow">Session</p>
          <h2 className="font-display mt-3 text-4xl">Today&apos;s Work</h2>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink-muted)]">{plan.rationale}</p>
        </div>
        <div className="text-right">
          <p className="eyebrow text-[var(--ink-muted)]">Split</p>
          <p className="font-display mt-2 text-2xl">{plan.splitDay}</p>
          <p className="mt-2 text-sm" style={{ color: intensityColor[plan.intensity] }}>
            {plan.intensity} · {plan.dayType}
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm font-medium tracking-wide text-[var(--accent)]">{plan.focus}</p>

      <ul className="mt-4 divide-y divide-[var(--line)]">
        {plan.exercises.map((ex) => (
          <li key={ex.name} className="flex flex-wrap items-baseline justify-between gap-2 py-4">
            <div>
              <p className="font-medium tracking-wide">{ex.name}</p>
              {ex.notes ? <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{ex.notes}</p> : null}
            </div>
            <p className="text-sm text-[var(--ink-muted)]">
              {ex.sets} × {ex.reps}
            </p>
          </li>
        ))}
      </ul>

      <ul className="mt-6 space-y-1.5 text-sm text-[var(--ink-muted)]">
        {plan.tips.map((tip) => (
          <li key={tip}>— {tip}</li>
        ))}
      </ul>
    </section>
  );
}
