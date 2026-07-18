import type { TrendPoint } from "@/lib/whoop/dashboard";

export type WeekMode = "PUSH" | "MAINTAIN" | "DELOAD";

export type WeeklyReadiness = {
  score: number; // 0–100
  mode: WeekMode;
  label: string;
  summary: string;
  avgRecovery: number | null;
  avgSleepPerf: number | null;
  avgStrain: number | null;
  lowRecoveryDays: number;
  hardStrainDays: number;
  deloadSuggested: boolean;
  drivers: string[];
};

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

/**
 * Weekly readiness from the last ~7 trend points.
 * Suggests PUSH / MAINTAIN / DELOAD for recomp without burnout.
 */
export function computeWeeklyReadiness(trends: TrendPoint[]): WeeklyReadiness {
  const last7 = trends.slice(-7);
  const recoveries = last7.map((t) => t.recovery).filter((n): n is number => n != null);
  const sleeps = last7.map((t) => t.sleepPerformance).filter((n): n is number => n != null);
  const strains = last7.map((t) => t.strain).filter((n): n is number => n != null);

  const avgRecovery = avg(recoveries);
  const avgSleepPerf = avg(sleeps);
  const avgStrain = avg(strains);

  const lowRecoveryDays = recoveries.filter((r) => r < 34).length;
  const hardStrainDays = strains.filter((s) => s >= 14).length;

  // Blend: recovery & sleep push score up; chronic low recovery / high strain pull it down
  let score = 55;
  if (avgRecovery != null) score += (avgRecovery - 50) * 0.55;
  if (avgSleepPerf != null) score += (avgSleepPerf - 70) * 0.25;
  if (avgStrain != null) {
    if (avgStrain > 14) score -= (avgStrain - 14) * 3;
    else if (avgStrain < 8) score += 4; // room to push
  }
  score -= lowRecoveryDays * 6;
  score -= Math.max(0, hardStrainDays - 3) * 4;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const deloadSuggested =
    lowRecoveryDays >= 3 || (avgRecovery != null && avgRecovery < 40) || (hardStrainDays >= 4 && (avgRecovery == null || avgRecovery < 55));

  let mode: WeekMode;
  if (deloadSuggested || score < 40) mode = "DELOAD";
  else if (score >= 70 && (avgRecovery == null || avgRecovery >= 60)) mode = "PUSH";
  else mode = "MAINTAIN";

  const drivers: string[] = [];
  if (avgRecovery != null) drivers.push(`Avg recovery ${avgRecovery}`);
  if (avgSleepPerf != null) drivers.push(`Avg sleep perf ${avgSleepPerf}%`);
  if (avgStrain != null) drivers.push(`Avg strain ${avgStrain}`);
  if (lowRecoveryDays) drivers.push(`${lowRecoveryDays} low-recovery day${lowRecoveryDays > 1 ? "s" : ""}`);
  if (hardStrainDays) drivers.push(`${hardStrainDays} hard-strain day${hardStrainDays > 1 ? "s" : ""}`);

  const label =
    mode === "PUSH" ? "Push week" : mode === "DELOAD" ? "Deload week" : "Maintain week";

  const summary =
    mode === "PUSH"
      ? "Week looks primed — add load on compounds, keep cardio Zone 2, chase progressive overload."
      : mode === "DELOAD"
        ? "Fatigue signal is elevated — cut volume ~40–50%, keep technique crisp, protect sleep. Resume push next week."
        : "Solid baseline — hold intensity, nudge one lift forward, don’t stack extra hard days.";

  return {
    score,
    mode,
    label,
    summary,
    avgRecovery,
    avgSleepPerf,
    avgStrain,
    lowRecoveryDays,
    hardStrainDays,
    deloadSuggested,
    drivers,
  };
}
