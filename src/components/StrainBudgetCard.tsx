import type { StrainBudget } from "@/lib/strain-budget";

const statusColor: Record<StrainBudget["status"], string> = {
  PLENTY: "#30d158",
  MODERATE: "#5ac8fa",
  LOW: "#ffd60a",
  OVER: "#ff453a",
};

export function StrainBudgetCard({ budget }: { budget: StrainBudget }) {
  const pct =
    budget.used == null ? 0 : Math.min(100, Math.round((budget.used / budget.targetMax) * 100));

  return (
    <div className="glass-dense p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">WHOOP</p>
          <h2 className="font-display mt-1 text-3xl">Strain Budget</h2>
        </div>
        <p className="text-sm font-semibold tracking-wide" style={{ color: statusColor[budget.status] }}>
          {budget.status}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="border border-[var(--line)] bg-[rgba(5,5,5,0.35)] p-3">
          <p className="eyebrow text-[var(--ink-muted)]">Ceiling</p>
          <p className="metric-num mt-1 text-2xl">{budget.targetMax}</p>
        </div>
        <div className="border border-[var(--line)] bg-[rgba(5,5,5,0.35)] p-3">
          <p className="eyebrow text-[var(--ink-muted)]">Used</p>
          <p className="metric-num mt-1 text-2xl">{budget.used ?? "—"}</p>
        </div>
        <div className="border border-[var(--line)] bg-[rgba(5,5,5,0.35)] p-3">
          <p className="eyebrow text-[var(--ink-muted)]">Left</p>
          <p className="metric-num mt-1 text-2xl" style={{ color: statusColor[budget.status] }}>
            {budget.remaining ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden bg-[rgba(247,244,239,0.08)]">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: statusColor[budget.status] }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--ink-muted)]">
        <span>Lift ~{budget.liftBudget}</span>
        <span>Cardio ~{budget.cardioBudget}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">{budget.guidance}</p>
    </div>
  );
}
