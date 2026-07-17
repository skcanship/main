/**
 * Operation Killmonger training split + recovery-aware deviation logic.
 *
 * Cycle (repeat):
 * 1. Back & Bis + Cardio
 * 2. Chest / Shoulders / Tris + Cardio
 * 3. Legs + Core
 * 4. Stretch / Mobility  ← day after legs (no cardio)
 *
 * Rules:
 * - Core lives on leg days
 * - Cardio on other training days
 * - No cardio the day after legs (Stretch / Mobility)
 */

export const SPLIT_CYCLE = [
  "Back & Bis + Cardio",
  "Chest / Shoulders / Tris + Cardio",
  "Legs + Core",
  "Stretch / Mobility",
] as const;

export type SplitDay = (typeof SPLIT_CYCLE)[number];

export type SplitAction = "EXECUTE" | "DEVIATE_REST" | "DEVIATE_LIGHT" | "PUSH_THROUGH" | "ACTIVE_RECOVERY";

export type SplitDayPlan = {
  date: string;
  dayIndex: number;
  scheduled: SplitDay;
  isToday: boolean;
  isPast: boolean;
  recoveryScore: number | null;
  sleepPerformance: number | null;
  strain: number | null;
  whoopWorkouts: Array<{ sport: string; strain: number | null }>;
  action: SplitAction;
  actionLabel: string;
  guidance: string;
};

export type SplitAgenda = {
  cycle: readonly SplitDay[];
  today: SplitDayPlan;
  days: SplitDayPlan[];
  summary: string;
};

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return dayKey(d);
}

function daysBetween(a: string, b: string): number {
  const ms = new Date(`${b}T12:00:00.000Z`).getTime() - new Date(`${a}T12:00:00.000Z`).getTime();
  return Math.round(ms / 86_400_000);
}

export function isStretchDay(day: SplitDay): boolean {
  return day === "Stretch / Mobility";
}

/**
 * Decide whether to stick to the split or deviate based on WHOOP recovery/sleep.
 */
export function decideSplitAction(args: {
  scheduled: SplitDay;
  recoveryScore: number | null;
  sleepPerformance: number | null;
  isPast: boolean;
  hadWorkout: boolean;
}): { action: SplitAction; actionLabel: string; guidance: string } {
  const { scheduled, recoveryScore, sleepPerformance, isPast, hadWorkout } = args;
  const recovery = recoveryScore;
  const sleepPoor = sleepPerformance != null && sleepPerformance < 70;

  if (isPast) {
    if (isStretchDay(scheduled)) {
      return {
        action: hadWorkout ? "PUSH_THROUGH" : "EXECUTE",
        actionLabel: hadWorkout ? "Hard session on mobility day" : "Mobility completed",
        guidance: hadWorkout
          ? "You trained hard on a stretch/mobility day — watch tomorrow’s recovery before stacking load."
          : "Stretch/mobility day respected. Good for adaptation.",
      };
    }
    return {
      action: hadWorkout ? "EXECUTE" : "DEVIATE_REST",
      actionLabel: hadWorkout ? "Session logged" : "Missed / mobility instead",
      guidance: hadWorkout
        ? `Completed ${scheduled}.`
        : `No WHOOP workout logged for ${scheduled}.`,
    };
  }

  // Upcoming / today — stretch/mobility day
  if (isStretchDay(scheduled)) {
    if (recovery != null && recovery >= 75 && !sleepPoor) {
      return {
        action: "ACTIVE_RECOVERY",
        actionLabel: "Full mobility session",
        guidance:
          "Recovery is high — run a thorough stretch/mobility block. Still no hard cardio or lifting today.",
      };
    }
    return {
      action: "EXECUTE",
      actionLabel: "Stretch / mobility",
      guidance:
        "Prioritize hips, T-spine, and soft tissue. No cardio today (day after legs in the cycle). Protect tomorrow’s Back & Bis + Cardio.",
    };
  }

  // Training day
  if (recovery != null && recovery < 34) {
    return {
      action: "DEVIATE_REST",
      actionLabel: "Mobility instead",
      guidance: `Recovery ${recovery} is too low for ${scheduled}. Swap to stretch/mobility — resume the split tomorrow without cramming.`,
    };
  }

  if (recovery != null && recovery < 50) {
    return {
      action: "DEVIATE_LIGHT",
      actionLabel: "Lighten the session",
      guidance: `Recovery ${recovery} suggests cutting volume ~40% on ${scheduled}. Keep the pattern, drop intensity; shorten cardio if included.`,
    };
  }

  if (sleepPoor && recovery != null && recovery < 60) {
    return {
      action: "DEVIATE_LIGHT",
      actionLabel: "Sleep-compromised — go light",
      guidance: `Sleep performance is low. Run a shorter ${scheduled} session.`,
    };
  }

  if (recovery != null && recovery >= 70) {
    return {
      action: "EXECUTE",
      actionLabel: "Green light — full session",
      guidance: `Recovery supports a full ${scheduled} day. Push progressive overload within technique.`,
    };
  }

  return {
    action: "EXECUTE",
    actionLabel: "Proceed as planned",
    guidance: `Follow ${scheduled}. Stay 1–2 reps in reserve if you feel flat mid-session.`,
  };
}

export function buildSplitAgenda(args: {
  todayIso?: string;
  /**
   * Anchor date for day 0 of the cycle (Back & Bis + Cardio).
   * Default: aligned so *today* is Stretch / Mobility and *tomorrow* is Back & Bis + Cardio.
   */
  cycleAnchorIso?: string;
  recoveriesByDate: Map<string, number>;
  sleepPerfByDate: Map<string, number>;
  strainByDate: Map<string, number>;
  workoutsByDate: Map<string, Array<{ sport: string; strain: number | null }>>;
  pastDays?: number;
  futureDays?: number;
}): SplitAgenda {
  const todayIso = args.todayIso ?? dayKey(new Date());
  // Stretch / Mobility is index 3 → anchor = today - 3 so today lands on mobility, tomorrow on Back & Bis + Cardio
  const stretchIndex = SPLIT_CYCLE.indexOf("Stretch / Mobility");
  const anchor = args.cycleAnchorIso ?? addDays(todayIso, -stretchIndex);
  const pastDays = args.pastDays ?? 7;
  const futureDays = args.futureDays ?? 7;

  const start = addDays(todayIso, -pastDays);
  const total = pastDays + futureDays + 1;
  const days: SplitDayPlan[] = [];

  for (let i = 0; i < total; i++) {
    const date = addDays(start, i);
    const offset = daysBetween(anchor, date);
    const dayIndex = ((offset % SPLIT_CYCLE.length) + SPLIT_CYCLE.length) % SPLIT_CYCLE.length;
    const scheduled = SPLIT_CYCLE[dayIndex];
    const isToday = date === todayIso;
    const isPast = date < todayIso;
    const recoveryScore = args.recoveriesByDate.get(date) ?? null;
    const sleepPerformance = args.sleepPerfByDate.get(date) ?? null;
    const strain = args.strainByDate.get(date) ?? null;
    const whoopWorkouts = args.workoutsByDate.get(date) ?? [];
    const decision = decideSplitAction({
      scheduled,
      recoveryScore,
      sleepPerformance,
      isPast,
      hadWorkout: whoopWorkouts.length > 0,
    });

    days.push({
      date,
      dayIndex,
      scheduled,
      isToday,
      isPast,
      recoveryScore,
      sleepPerformance,
      strain,
      whoopWorkouts,
      action: decision.action,
      actionLabel: decision.actionLabel,
      guidance: decision.guidance,
    });
  }

  const today = days.find((d) => d.isToday)!;
  if (today.recoveryScore == null) {
    const latest = [...args.recoveriesByDate.entries()].sort((a, b) => b[0].localeCompare(a[0]))[0];
    if (latest) {
      today.recoveryScore = latest[1];
      const decision = decideSplitAction({
        scheduled: today.scheduled,
        recoveryScore: today.recoveryScore,
        sleepPerformance: today.sleepPerformance,
        isPast: false,
        hadWorkout: today.whoopWorkouts.length > 0,
      });
      today.action = decision.action;
      today.actionLabel = decision.actionLabel;
      today.guidance = decision.guidance;
    }
  }

  let summary: string;
  if (today.action === "DEVIATE_REST") {
    summary = `Protocol deviation: stretch/mobility today instead of ${today.scheduled}. Resume the split tomorrow.`;
  } else if (today.action === "DEVIATE_LIGHT") {
    summary = `Protocol modification: lighten ${today.scheduled} based on recovery.`;
  } else if (isStretchDay(today.scheduled)) {
    summary = `Protocol locked: Stretch / Mobility today. Tomorrow: Back & Bis + Cardio.`;
  } else {
    summary = `Protocol locked: execute ${today.scheduled}.`;
  }

  return { cycle: SPLIT_CYCLE, today, days, summary };
}
