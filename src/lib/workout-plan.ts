/**
 * Workout plan recommendation for the goal: muscle gain + fat loss.
 *
 * Uses recent recovery, sleep, strain, and workout frequency to pick a
 * day type and example exercises (compound lifts + accessories).
 */

export type DayType =
  | "Heavy strength"
  | "Moderate strength"
  | "Hypertrophy"
  | "Conditioning"
  | "Rest";

export type IntensityLabel = "Heavy" | "Moderate" | "Light" | "Rest";

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  notes?: string;
};

export type TrainingPlan = {
  intensity: IntensityLabel;
  dayType: DayType;
  rationale: string;
  focus: string;
  exercises: Exercise[];
  tips: string[];
};

export type PlanInputs = {
  recoveryScore: number | null;
  sleepPerformance: number | null;
  sleepDurationHours: number | null;
  todayStrain: number | null;
  avgStrain7d: number | null;
  workoutsLast7d: number;
  goal?: "muscle gain + fat loss";
};

function intensityFromRecovery(recovery: number | null): IntensityLabel {
  if (recovery == null) return "Moderate";
  if (recovery >= 70) return "Heavy";
  if (recovery >= 40) return "Moderate";
  return recovery >= 25 ? "Light" : "Rest";
}

const PLANS: Record<DayType, Omit<TrainingPlan, "intensity" | "rationale">> = {
  "Heavy strength": {
    dayType: "Heavy strength",
    focus: "Low-rep compound strength — drive progressive overload",
    exercises: [
      { name: "Barbell Back Squat", sets: 4, reps: "3–5", notes: "Leave 1–2 reps in reserve" },
      { name: "Barbell Bench Press", sets: 4, reps: "3–5" },
      { name: "Weighted Pull-Up or Lat Pulldown", sets: 3, reps: "5–8" },
      { name: "Romanian Deadlift", sets: 3, reps: "5–8" },
      { name: "Walking Lunges", sets: 2, reps: "8/leg" },
    ],
    tips: [
      "Rest 2–3 minutes between heavy sets",
      "Keep total session ~45–60 minutes to manage strain",
      "Protein target: ~1.6–2.2 g/kg bodyweight",
    ],
  },
  "Moderate strength": {
    dayType: "Moderate strength",
    focus: "Solid compound work at moderate intensity",
    exercises: [
      { name: "Goblet or Front Squat", sets: 3, reps: "6–8" },
      { name: "Dumbbell Bench Press", sets: 3, reps: "6–8" },
      { name: "Seated Cable Row", sets: 3, reps: "8–10" },
      { name: "Dumbbell Romanian Deadlift", sets: 3, reps: "8–10" },
      { name: "Plank", sets: 3, reps: "30–45s" },
    ],
    tips: [
      "Stop each set 2–3 reps before failure",
      "Optional 10-minute easy Zone 2 finish for fat loss",
    ],
  },
  Hypertrophy: {
    dayType: "Hypertrophy",
    focus: "Higher-volume muscle building with metabolic stress",
    exercises: [
      { name: "Leg Press or Hack Squat", sets: 3, reps: "8–12" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "8–12" },
      { name: "Lat Pulldown", sets: 3, reps: "10–12" },
      { name: "Dumbbell Lateral Raise", sets: 3, reps: "12–15" },
      { name: "Cable Tricep Pushdown", sets: 2, reps: "12–15" },
      { name: "EZ-Bar Curl", sets: 2, reps: "10–12" },
    ],
    tips: [
      "Controlled tempos (2–3s eccentric)",
      "Keep rest ~60–90 seconds between sets",
    ],
  },
  Conditioning: {
    dayType: "Conditioning",
    focus: "Fat-loss friendly cardio + light strength circuit",
    exercises: [
      { name: "Zone 2 Bike or Incline Walk", sets: 1, reps: "25–35 min", notes: "Conversational pace" },
      { name: "Kettlebell Swings", sets: 3, reps: "12–15" },
      { name: "Push-Ups", sets: 3, reps: "10–15" },
      { name: "Bodyweight Squats", sets: 3, reps: "12–20" },
      { name: "Farmer Carries", sets: 3, reps: "30–40m" },
    ],
    tips: [
      "Stay mostly in Zone 2 — protect recovery for heavy days",
      "Hydrate and prioritize sleep tonight",
    ],
  },
  Rest: {
    dayType: "Rest",
    focus: "Active recovery — let adaptation catch up",
    exercises: [
      { name: "Easy Walk Outdoors", sets: 1, reps: "20–40 min" },
      { name: "Mobility Flow (hips, T-spine, shoulders)", sets: 1, reps: "10–15 min" },
      { name: "Light Foam Rolling", sets: 1, reps: "5–10 min" },
    ],
    tips: [
      "Avoid intense training when recovery is low",
      "Aim for earlier bedtime to rebuild sleep debt",
      "A short walk still supports fat loss without spiking strain",
    ],
  },
};

/**
 * Recommend today's training block from WHOOP-derived metrics.
 *
 * Thresholds (as requested):
 * - Recovery ≥ 70 → Heavy
 * - Recovery 40–69 → Moderate
 * - Recovery < 40 → Light / Rest
 *
 * Sleep and recent training load nudge Heavy ↔ Hypertrophy / Conditioning / Rest.
 */
export function recommendTrainingPlan(input: PlanInputs): TrainingPlan {
  const recovery = input.recoveryScore;
  const sleepPerf = input.sleepPerformance;
  const sleepHours = input.sleepDurationHours;
  const workouts7d = input.workoutsLast7d;
  const avgStrain = input.avgStrain7d;

  let intensity = intensityFromRecovery(recovery);
  const sleepPoor =
    (sleepPerf != null && sleepPerf < 70) || (sleepHours != null && sleepHours < 6.5);
  const highRecentLoad = (avgStrain != null && avgStrain >= 14) || workouts7d >= 5;

  // Escalate Rest when both recovery and sleep are compromised
  if (intensity === "Light" && sleepPoor) {
    intensity = "Rest";
  }
  if (recovery != null && recovery < 40 && sleepPoor) {
    intensity = "Rest";
  }

  let dayType: DayType;
  switch (intensity) {
    case "Heavy":
      // If already training hard this week, prefer hypertrophy volume over another heavy day
      dayType = highRecentLoad ? "Hypertrophy" : "Heavy strength";
      break;
    case "Moderate":
      dayType = sleepPoor ? "Conditioning" : highRecentLoad ? "Hypertrophy" : "Moderate strength";
      break;
    case "Light":
      dayType = "Conditioning";
      break;
    case "Rest":
    default:
      dayType = "Rest";
      break;
  }

  const base = PLANS[dayType];
  const parts: string[] = [];
  if (recovery != null) parts.push(`Recovery ${recovery}`);
  if (sleepPerf != null) parts.push(`sleep performance ${sleepPerf}%`);
  if (sleepHours != null) parts.push(`${sleepHours.toFixed(1)}h sleep`);
  if (workouts7d != null) parts.push(`${workouts7d} workouts in 7d`);
  if (avgStrain != null) parts.push(`avg strain ${avgStrain.toFixed(1)}`);

  const rationale = `Goal: muscle gain + fat loss. Based on ${parts.join(", ") || "available WHOOP metrics"}, today's recommendation is ${dayType}.`;

  return {
    intensity,
    ...base,
    rationale,
  };
}
