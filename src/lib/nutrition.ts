/**
 * Recomp nutrition targets for muscle gain + fat loss.
 * Defaults assume moderately active trainee.
 */

export type NutritionTargets = {
  weightLbs: number;
  proteinG: number;
  proteinPerLb: number;
  caloriesLow: number;
  caloriesHigh: number;
  carbsHintG: number;
  fatHintG: number;
  note: string;
};

export function computeNutritionTargets(weightLbs: number): NutritionTargets {
  const w = Math.max(90, Math.min(400, weightLbs));
  // Recomp: high protein, slight deficit-to-maintenance band
  const proteinPerLb = 1.0;
  const proteinG = Math.round(w * proteinPerLb);
  // ~12–14 kcal/lb maintenance-ish band for lean recomp; adjust with activity
  const caloriesLow = Math.round(w * 12);
  const caloriesHigh = Math.round(w * 14);
  const fatHintG = Math.round((caloriesLow * 0.25) / 9);
  const carbsHintG = Math.round((caloriesHigh - proteinG * 4 - fatHintG * 9) / 4);

  return {
    weightLbs: w,
    proteinG,
    proteinPerLb,
    caloriesLow,
    caloriesHigh,
    carbsHintG: Math.max(120, carbsHintG),
    fatHintG,
    note: "Hit protein daily. Land calories in the band — bias high on hard lift days, low on mobility days.",
  };
}

const NUTRITION_LOG_KEY = "shankofit_nutrition_log_v1";

export type NutritionDayLog = {
  date: string;
  proteinHit: boolean;
  calorieHit: boolean;
};

export function loadNutritionLogs(): NutritionDayLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NUTRITION_LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NutritionDayLog[];
  } catch {
    return [];
  }
}

export function saveNutritionLogs(logs: NutritionDayLog[]) {
  localStorage.setItem(NUTRITION_LOG_KEY, JSON.stringify(logs.slice(-60)));
}

export function upsertNutritionLog(entry: NutritionDayLog): NutritionDayLog[] {
  const logs = loadNutritionLogs().filter((l) => l.date !== entry.date);
  const next = [...logs, entry].sort((a, b) => a.date.localeCompare(b.date));
  saveNutritionLogs(next);
  return next;
}
