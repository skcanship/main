/**
 * Weekly recomp check-in — weight, waist, energy, mood.
 * Stored locally; produces a simple lean-out / stall / eat-more verdict.
 */

export type RecompCheckIn = {
  id: string;
  date: string;
  weightLbs: number;
  waistIn: number;
  energy: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  notes?: string;
};

export type RecompVerdict = {
  code: "LEANING_OUT" | "STALLING" | "NEED_FOOD" | "BASELINE";
  label: string;
  detail: string;
};

const STORAGE_KEY = "shankofit_recomp_checkins_v2";
const LEGACY_KEYS = ["shankofit_recomp_checkins_v1"];

export function loadCheckIns(): RecompCheckIn[] {
  if (typeof window === "undefined") return [];
  try {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as RecompCheckIn[]).sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

export function saveCheckIns(items: RecompCheckIn[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 52)));
}

export function addCheckIn(entry: Omit<RecompCheckIn, "id">): RecompCheckIn[] {
  const item: RecompCheckIn = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  // one check-in per date
  const next = [item, ...loadCheckIns().filter((c) => c.date !== entry.date)].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  saveCheckIns(next);
  return next;
}

export function daysSinceLastCheckIn(items: RecompCheckIn[]): number | null {
  if (!items.length) return null;
  const last = items[0].date;
  const ms = Date.now() - new Date(`${last}T12:00:00.000Z`).getTime();
  return Math.floor(ms / 86_400_000);
}

export function isCheckInDue(items: RecompCheckIn[], everyDays = 7): boolean {
  const days = daysSinceLastCheckIn(items);
  return days == null || days >= everyDays;
}

/**
 * Compare latest vs previous check-in for recomp signal.
 * Prefer waist down + stable/up energy over scale alone.
 */
export function verdictFromCheckIns(items: RecompCheckIn[]): RecompVerdict {
  if (items.length < 2) {
    return {
      code: "BASELINE",
      label: "Baseline",
      detail: "Log another check-in next week to see if you're leaning out, stalling, or under-eating.",
    };
  }

  const [latest, prev] = items;
  const dWeight = latest.weightLbs - prev.weightLbs;
  const dWaist = latest.waistIn - prev.waistIn;
  const avgEnergy = (latest.energy + prev.energy) / 2;

  // Leaning out: waist down (or flat) with controlled weight change
  if (dWaist <= -0.5 || (dWaist < 0 && dWeight <= 1.5)) {
    return {
      code: "LEANING_OUT",
      label: "Leaning out",
      detail: `Waist ${dWaist >= 0 ? "+" : ""}${dWaist.toFixed(1)}" · weight ${dWeight >= 0 ? "+" : ""}${dWeight.toFixed(1)} lb. Keep protein high and training progressive.`,
    };
  }

  // Need food: energy crashing or weight dumping fast with flat/up waist
  if (avgEnergy <= 2.5 || (dWeight <= -2 && dWaist >= 0)) {
    return {
      code: "NEED_FOOD",
      label: "Need more food",
      detail: "Energy is soft or weight is dropping without waist progress — bump calories toward the top of your band.",
    };
  }

  // Stalling: little change
  if (Math.abs(dWaist) < 0.4 && Math.abs(dWeight) < 1) {
    return {
      code: "STALLING",
      label: "Stalling",
      detail: "Scale and waist barely moved. Nudge progression in the lift log and tighten calorie consistency.",
    };
  }

  if (dWeight >= 1.5 && dWaist > 0.3) {
    return {
      code: "STALLING",
      label: "Recomp drift",
      detail: "Weight and waist both up — check weekend calories and keep Zone 2 on Back/Push days.",
    };
  }

  return {
    code: "BASELINE",
    label: "Tracking",
    detail: `Δ weight ${dWeight >= 0 ? "+" : ""}${dWeight.toFixed(1)} lb · Δ waist ${dWaist >= 0 ? "+" : ""}${dWaist.toFixed(1)}". Stay the course this week.`,
  };
}
