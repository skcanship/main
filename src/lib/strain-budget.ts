import type { SplitAction, SplitDay } from "@/lib/split-plan";
import { isStretchDay } from "@/lib/split-plan";
import type { IntensityLabel } from "@/lib/workout-plan";

export type StrainBudget = {
  /** Suggested max day strain for today (0–21 WHOOP scale) */
  targetMax: number;
  /** Current day strain already accumulated */
  used: number | null;
  /** Strain still available before hitting target */
  remaining: number | null;
  /** Lift allotment vs cardio allotment hints */
  liftBudget: number;
  cardioBudget: number;
  status: "PLENTY" | "MODERATE" | "LOW" | "OVER";
  guidance: string;
};

/**
 * Map recovery + planned intensity to a WHOOP day-strain ceiling,
 * then subtract what's already on the cycle.
 */
export function computeStrainBudget(args: {
  recoveryScore: number | null;
  currentStrain: number | null;
  splitDay: SplitDay;
  splitAction: SplitAction;
  intensity: IntensityLabel;
}): StrainBudget {
  const recovery = args.recoveryScore;
  const used = args.currentStrain;

  let targetMax = 12;
  if (isStretchDay(args.splitDay) || args.splitAction === "DEVIATE_REST" || args.intensity === "Rest") {
    targetMax = 6;
  } else if (args.splitAction === "DEVIATE_LIGHT" || args.intensity === "Light") {
    targetMax = 9;
  } else if (args.intensity === "Heavy" || (recovery != null && recovery >= 70)) {
    targetMax = 16;
  } else if (args.intensity === "Moderate" || (recovery != null && recovery >= 40)) {
    targetMax = 13;
  } else {
    targetMax = 8;
  }

  // Legs are metabolically costly — slightly lower ceiling to protect next day
  if (args.splitDay.startsWith("Legs") && targetMax > 8) {
    targetMax = Math.max(8, targetMax - 1);
  }

  // No cardio day after legs is stretch — already low. On cardio lift days, split budget.
  const isCardioDay =
    args.splitDay.includes("Cardio") && !isStretchDay(args.splitDay) && args.splitAction !== "DEVIATE_REST";

  let liftBudget: number;
  let cardioBudget: number;
  if (isStretchDay(args.splitDay) || args.splitAction === "DEVIATE_REST") {
    liftBudget = 0;
    cardioBudget = Math.min(4, targetMax);
  } else if (args.splitDay.startsWith("Legs")) {
    liftBudget = targetMax;
    cardioBudget = 0;
  } else if (isCardioDay) {
    cardioBudget = Math.min(5, Math.round(targetMax * 0.35));
    liftBudget = Math.max(6, targetMax - cardioBudget);
  } else {
    liftBudget = targetMax;
    cardioBudget = 0;
  }

  const remaining = used == null ? targetMax : Math.round((targetMax - used) * 10) / 10;

  let status: StrainBudget["status"];
  if (remaining == null) status = "MODERATE";
  else if (remaining < 0) status = "OVER";
  else if (remaining <= 2) status = "LOW";
  else if (remaining <= 5) status = "MODERATE";
  else status = "PLENTY";

  let guidance: string;
  if (status === "OVER") {
    guidance = `You're past today's ceiling (${targetMax}). Shut it down — easy walk only. Protect tomorrow.`;
  } else if (isStretchDay(args.splitDay) || args.splitAction === "DEVIATE_REST") {
    guidance = `Mobility day budget ≤ ${targetMax} strain. Skip structured cardio and lifting.`;
  } else if (args.splitDay.startsWith("Legs")) {
    guidance = `Legs + Core budget ≤ ${targetMax}. No cardio finisher — save recovery for tomorrow's mobility day.`;
  } else if (isCardioDay) {
    guidance = `Lift first (~${liftBudget} strain), then Zone 2 (~${cardioBudget}). Stop when remaining hits ~2.`;
  } else {
    guidance = `Train within ${targetMax} day strain. ${remaining != null ? `${remaining} left in the tank.` : ""}`;
  }

  return {
    targetMax,
    used,
    remaining,
    liftBudget,
    cardioBudget,
    status,
    guidance,
  };
}
