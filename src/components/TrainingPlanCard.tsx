import type { TrainingPlan } from "@/lib/workout-plan";

const intensityColor: Record<TrainingPlan["intensity"], string> = {
  Heavy: "var(--moss-bright)",
  Moderate: "var(--accent-hot)",
  Light: "var(--warn)",
  Rest: "var(--ink-muted)",
};

export function TrainingPlanCard({ plan }: { plan: TrainingPlan }) {
  return (
    <section className="hud-panel animate-rise-delay-3 relative overflow-hidden p-6 sm:p-8">
      <div className="scanline" />
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="hud-label">Engagement package</p>
            <h2 className="font-display mt-2 text-2xl">Today&apos;s Protocol</h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--ink-muted)]">{plan.rationale}</p>
          </div>
          <div className="text-right">
            <p className="hud-label">Split day</p>
            <p className="font-display mt-1 text-xl text-[var(--moss-bright)]">{plan.splitDay}</p>
            <p className="mt-1 font-mono text-sm" style={{ color: intensityColor[plan.intensity] }}>
              {plan.intensity} · {plan.dayType}
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm font-semibold tracking-wide text-[var(--accent-hot)]">{plan.focus}</p>

        <ul className="mt-4 divide-y divide-[var(--line)]">
          {plan.exercises.map((ex) => (
            <li key={ex.name} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <div>
                <p className="font-medium tracking-wide">{ex.name}</p>
                {ex.notes ? <p className="text-xs text-[var(--ink-muted)]">{ex.notes}</p> : null}
              </div>
              <p className="font-mono text-sm text-[var(--moss)]">
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
      </div>
    </section>
  );
}
