import type { CycleRecord, RecoveryRecord, SleepRecord, WorkoutRecord } from "@/lib/whoop/types";
import { recommendTrainingPlan, type TrainingPlan } from "@/lib/workout-plan";
import { buildSplitAgenda, type SplitAgenda } from "@/lib/split-plan";

export type TodaySummary = {
  recoveryScore: number | null;
  hrvMs: number | null;
  restingHr: number | null;
  sleepDurationHours: number | null;
  sleepPerformance: number | null;
  strain: number | null;
  dateLabel: string;
};

export type TrendPoint = {
  date: string;
  recovery: number | null;
  sleepHours: number | null;
  sleepPerformance: number | null;
  strain: number | null;
};

export type DashboardPayload = {
  connected: true;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  today: TodaySummary;
  trends: TrendPoint[];
  workouts: Array<{
    id: string;
    sport: string;
    start: string;
    strain: number | null;
    avgHr: number | null;
    maxHr: number | null;
    durationMin: number | null;
  }>;
  plan: TrainingPlan;
  split: SplitAgenda;
};

function msToHours(ms: number | undefined | null): number | null {
  if (ms == null || Number.isNaN(ms)) return null;
  return Math.round((ms / 3_600_000) * 10) / 10;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function sleepDurationHours(sleep: SleepRecord): number | null {
  if (sleep.score?.stage_summary?.total_in_bed_time_milli != null) {
    const awake = sleep.score.stage_summary.total_awake_time_milli ?? 0;
    const inBed = sleep.score.stage_summary.total_in_bed_time_milli;
    return msToHours(inBed - awake);
  }
  if (sleep.start && sleep.end) {
    return msToHours(new Date(sleep.end).getTime() - new Date(sleep.start).getTime());
  }
  return null;
}

export function buildDashboardData(args: {
  recoveries: RecoveryRecord[];
  sleeps: SleepRecord[];
  cycles: CycleRecord[];
  workouts: WorkoutRecord[];
  user: { first_name: string; last_name: string; email: string } | null;
}): DashboardPayload {
  const { recoveries, sleeps, cycles, workouts, user } = args;

  const scoredRecoveries = recoveries.filter((r) => r.score_state === "SCORED" && r.score);
  const mainSleeps = sleeps.filter((s) => !s.nap && s.score_state === "SCORED" && s.score);
  const scoredCycles = cycles.filter((c) => c.score);

  const latestRecovery = scoredRecoveries[0] ?? null;
  const latestSleep = mainSleeps[0] ?? null;
  const latestCycle = scoredCycles[0] ?? null;

  const today: TodaySummary = {
    recoveryScore: latestRecovery?.score?.recovery_score ?? null,
    hrvMs: latestRecovery?.score?.hrv_rmssd_milli
      ? Math.round(latestRecovery.score.hrv_rmssd_milli)
      : null,
    restingHr: latestRecovery?.score?.resting_heart_rate ?? null,
    sleepDurationHours: latestSleep ? sleepDurationHours(latestSleep) : null,
    sleepPerformance: latestSleep?.score?.sleep_performance_percentage ?? null,
    strain: latestCycle?.score?.strain != null ? Math.round(latestCycle.score.strain * 10) / 10 : null,
    dateLabel: new Date().toISOString().slice(0, 10),
  };

  const recoveryByDay = new Map<string, number>();
  for (const r of scoredRecoveries) {
    const key = dayKey(r.created_at);
    if (!recoveryByDay.has(key) && r.score) {
      recoveryByDay.set(key, r.score.recovery_score);
    }
  }
  if (today.recoveryScore != null && !recoveryByDay.has(today.dateLabel)) {
    recoveryByDay.set(today.dateLabel, today.recoveryScore);
  }

  const sleepByDay = new Map<string, { hours: number | null; performance: number | null }>();
  const sleepPerfByDate = new Map<string, number>();
  for (const s of mainSleeps) {
    const key = dayKey(s.end || s.start);
    if (!sleepByDay.has(key)) {
      const hours = sleepDurationHours(s);
      const performance = s.score?.sleep_performance_percentage ?? null;
      sleepByDay.set(key, { hours, performance });
      if (performance != null) sleepPerfByDate.set(key, performance);
    }
  }

  const strainByDay = new Map<string, number>();
  for (const c of scoredCycles) {
    const key = dayKey(c.start);
    if (!strainByDay.has(key) && c.score) {
      strainByDay.set(key, Math.round(c.score.strain * 10) / 10);
    }
  }

  const workoutsByDate = new Map<string, Array<{ sport: string; strain: number | null }>>();
  for (const w of workouts) {
    const key = dayKey(w.start);
    const list = workoutsByDate.get(key) ?? [];
    list.push({
      sport: w.sport_name || "Workout",
      strain: w.score?.strain != null ? Math.round(w.score.strain * 10) / 10 : null,
    });
    workoutsByDate.set(key, list);
  }

  const allDays = new Set([...recoveryByDay.keys(), ...sleepByDay.keys(), ...strainByDay.keys()]);
  const trends: TrendPoint[] = [...allDays]
    .sort()
    .slice(-30)
    .map((date) => ({
      date,
      recovery: recoveryByDay.get(date) ?? null,
      sleepHours: sleepByDay.get(date)?.hours ?? null,
      sleepPerformance: sleepByDay.get(date)?.performance ?? null,
      strain: strainByDay.get(date) ?? null,
    }));

  const last7 = trends.slice(-7);
  const avgStrain7d =
    last7.filter((t) => t.strain != null).length > 0
      ? last7.reduce((sum, t) => sum + (t.strain ?? 0), 0) /
        last7.filter((t) => t.strain != null).length
      : null;

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const workoutsLast7d = workouts.filter((w) => new Date(w.start).getTime() >= sevenDaysAgo).length;

  const split = buildSplitAgenda({
    todayIso: today.dateLabel,
    recoveriesByDate: recoveryByDay,
    sleepPerfByDate,
    strainByDate: strainByDay,
    workoutsByDate,
    pastDays: 7,
    futureDays: 7,
  });

  const plan = recommendTrainingPlan({
    recoveryScore: today.recoveryScore,
    sleepPerformance: today.sleepPerformance,
    sleepDurationHours: today.sleepDurationHours,
    todayStrain: today.strain,
    avgStrain7d,
    workoutsLast7d,
    goal: "muscle gain + fat loss",
    splitDay: split.today.scheduled,
    splitAction: split.today.action,
  });

  return {
    connected: true,
    user: user
      ? { firstName: user.first_name, lastName: user.last_name, email: user.email }
      : null,
    today,
    trends,
    workouts: workouts.slice(0, 12).map((w) => {
      const durationMs =
        w.start && w.end ? new Date(w.end).getTime() - new Date(w.start).getTime() : null;
      return {
        id: String(w.id),
        sport: w.sport_name || "Workout",
        start: w.start,
        strain: w.score?.strain != null ? Math.round(w.score.strain * 10) / 10 : null,
        avgHr: w.score?.average_heart_rate ?? null,
        maxHr: w.score?.max_heart_rate ?? null,
        durationMin: durationMs != null ? Math.round(durationMs / 60_000) : null,
      };
    }),
    plan,
    split,
  };
}
