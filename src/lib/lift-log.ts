/**
 * Progressive overload lift log — stored in localStorage.
 */

export type LiftDayKey = "back_bis" | "chest_shoulders_tris" | "legs_core";

export type LiftEntry = {
  id: string;
  date: string;
  dayKey: LiftDayKey;
  exercise: string;
  weightLbs: number;
  reps: number;
  sets: number;
  notes?: string;
};

export const LIFT_DAY_OPTIONS: { key: LiftDayKey; label: string; lifts: string[] }[] = [
  {
    key: "back_bis",
    label: "Back & Bis",
    lifts: [
      "Weighted Pull-Ups / Lat Pulldown",
      "Barbell / Chest-Supported Row",
      "Seated Cable Row",
      "EZ-Bar Curl",
      "Incline Dumbbell Curl",
    ],
  },
  {
    key: "chest_shoulders_tris",
    label: "Chest / Shoulders / Tris",
    lifts: [
      "Bench Press",
      "Incline Dumbbell Press",
      "Overhead Press",
      "Lateral Raises",
      "Tricep Pushdown",
    ],
  },
  {
    key: "legs_core",
    label: "Legs + Core",
    lifts: [
      "Back / Front Squat",
      "Romanian Deadlift",
      "Walking Lunges",
      "Leg Press / Hack Squat",
      "Hanging Knee Raises",
    ],
  },
];

const STORAGE_KEY = "shankofit_lift_log_v1";

export function loadLiftLog(): LiftEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LiftEntry[];
  } catch {
    return [];
  }
}

export function saveLiftLog(entries: LiftEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-400)));
}

export function addLiftEntry(entry: Omit<LiftEntry, "id">): LiftEntry[] {
  const next: LiftEntry = { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  const all = [...loadLiftLog(), next].sort((a, b) => b.date.localeCompare(a.date));
  saveLiftLog(all);
  return all;
}

export function deleteLiftEntry(id: string): LiftEntry[] {
  const all = loadLiftLog().filter((e) => e.id !== id);
  saveLiftLog(all);
  return all;
}

/** Best estimated 1RM-ish volume proxy: weight * reps for comparison */
export function entryScore(e: LiftEntry): number {
  return e.weightLbs * e.reps * e.sets;
}

export function previousBest(entries: LiftEntry[], exercise: string, beforeDate: string): LiftEntry | null {
  const prior = entries
    .filter((e) => e.exercise === exercise && e.date < beforeDate)
    .sort((a, b) => entryScore(b) - entryScore(a));
  return prior[0] ?? null;
}
