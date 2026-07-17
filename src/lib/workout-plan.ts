/**
 * Operation Killmonger — session prescription tied to the user's split
 * and WHOOP recovery-aware deviation actions.
 */

import { isStretchDay, type SplitAction, type SplitDay } from "@/lib/split-plan";

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
  splitDay: SplitDay;
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
  splitDay: SplitDay;
  splitAction: SplitAction;
};

const CARDIO_FINISHER: Exercise = {
  name: "Zone 2 Cardio (Bike / Incline Walk / Easy Jog)",
  sets: 1,
  reps: "25–35 min",
  notes: "Conversational pace — after lifts",
};

const SPLIT_SESSIONS: Record<SplitDay, { focus: string; exercises: Exercise[]; tips: string[] }> = {
  "Back & Bis + Cardio": {
    focus: "Pull strength + arms, then Zone 2 cardio",
    exercises: [
      { name: "Weighted Pull-Ups or Lat Pulldown", sets: 4, reps: "6–8" },
      { name: "Barbell or Chest-Supported Row", sets: 4, reps: "6–8" },
      { name: "Seated Cable Row", sets: 3, reps: "8–12" },
      { name: "Face Pulls", sets: 3, reps: "12–15" },
      { name: "EZ-Bar Curl", sets: 3, reps: "8–12" },
      { name: "Incline Dumbbell Curl", sets: 2, reps: "10–12" },
      CARDIO_FINISHER,
    ],
    tips: [
      "Drive elbows, full stretch on rows",
      "Keep biceps work strict — no swing",
      "Cardio after lifting, keep it Zone 2",
    ],
  },
  "Chest / Shoulders / Tris + Cardio": {
    focus: "Press strength + shoulders, then Zone 2 cardio",
    exercises: [
      { name: "Barbell or Dumbbell Bench Press", sets: 4, reps: "5–8" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "8–10" },
      { name: "Overhead Press", sets: 3, reps: "6–8" },
      { name: "Lateral Raises", sets: 3, reps: "12–15" },
      { name: "Cable Tricep Pushdown", sets: 3, reps: "10–12" },
      { name: "Overhead Tricep Extension", sets: 2, reps: "10–12" },
      CARDIO_FINISHER,
    ],
    tips: [
      "Leave 1–2 reps in reserve on heavy presses",
      "Control the eccentric on laterals",
      "Cardio after pressing — legs get tomorrow’s focus soon",
    ],
  },
  "Legs + Core": {
    focus: "Lower-body strength + trunk stability (no separate cardio finisher)",
    exercises: [
      { name: "Back Squat or Front Squat", sets: 4, reps: "5–8" },
      { name: "Romanian Deadlift", sets: 3, reps: "6–8" },
      { name: "Walking Lunges", sets: 3, reps: "8/leg" },
      { name: "Leg Press or Hack Squat", sets: 3, reps: "8–12" },
      { name: "Calf Raises", sets: 3, reps: "10–15" },
      { name: "Hanging Knee Raises", sets: 3, reps: "10–15" },
      { name: "Cable Woodchoppers", sets: 3, reps: "10/side" },
      { name: "Plank", sets: 3, reps: "40–60s" },
    ],
    tips: [
      "Brace hard — protect the spine",
      "Core after legs while the trunk is primed",
      "No cardio today — tomorrow is Stretch / Mobility (no cardio after legs)",
    ],
  },
  "Stretch / Mobility": {
    focus: "Recovery mobility — no hard training, no cardio",
    exercises: [
      { name: "90/90 Hip Flow", sets: 2, reps: "8/side" },
      { name: "World’s Greatest Stretch", sets: 2, reps: "5/side" },
      { name: "T-Spine Openers (quadruped or bench)", sets: 2, reps: "8/side" },
      { name: "Couch Stretch / Hip Flexor", sets: 2, reps: "60s/side" },
      { name: "Hamstring + Calf Soft Tissue", sets: 1, reps: "8–10 min" },
      { name: "Easy Walk (optional)", sets: 1, reps: "15–25 min", notes: "Walk only — not cardio intervals" },
    ],
    tips: [
      "This replaces rest days — treat it as intentional recovery",
      "No structured cardio the day after legs",
      "Prioritize protein + earlier sleep",
    ],
  },
};

function intensityFromRecovery(recovery: number | null): IntensityLabel {
  if (recovery == null) return "Moderate";
  if (recovery >= 70) return "Heavy";
  if (recovery >= 40) return "Moderate";
  return recovery >= 25 ? "Light" : "Rest";
}

function lighten(exercises: Exercise[]): Exercise[] {
  return exercises.map((e) => ({
    ...e,
    sets: Math.max(1, e.sets - 1),
    notes: e.notes ? `${e.notes} · reduced volume` : "Reduced volume",
  }));
}

export function recommendTrainingPlan(input: PlanInputs): TrainingPlan {
  const splitDay = input.splitDay;
  const base = SPLIT_SESSIONS[splitDay];
  let intensity = intensityFromRecovery(input.recoveryScore);
  let exercises = base.exercises;
  let dayType: DayType = isStretchDay(splitDay)
    ? "Rest"
    : splitDay === "Legs + Core"
      ? intensity === "Heavy"
        ? "Heavy strength"
        : "Hypertrophy"
      : intensity === "Heavy"
        ? "Heavy strength"
        : intensity === "Moderate"
          ? "Hypertrophy"
          : "Conditioning";

  if (input.splitAction === "DEVIATE_REST") {
    intensity = "Rest";
    dayType = "Rest";
    exercises = SPLIT_SESSIONS["Stretch / Mobility"].exercises;
  } else if (input.splitAction === "DEVIATE_LIGHT" || input.splitAction === "ACTIVE_RECOVERY") {
    intensity = input.splitAction === "ACTIVE_RECOVERY" ? "Rest" : "Light";
    dayType = input.splitAction === "ACTIVE_RECOVERY" ? "Rest" : "Conditioning";
    exercises =
      input.splitAction === "ACTIVE_RECOVERY"
        ? SPLIT_SESSIONS["Stretch / Mobility"].exercises
        : lighten(base.exercises);
  }

  const parts: string[] = [];
  if (input.recoveryScore != null) parts.push(`Recovery ${input.recoveryScore}`);
  if (input.sleepPerformance != null) parts.push(`sleep ${input.sleepPerformance}%`);
  parts.push(`split: ${splitDay}`);
  parts.push(`action: ${input.splitAction}`);

  return {
    intensity,
    dayType,
    splitDay,
    focus: base.focus,
    exercises,
    tips: base.tips,
    rationale: `Operation Killmonger protocol — ${parts.join(" · ")}. Goal: muscle gain + fat loss.`,
  };
}
