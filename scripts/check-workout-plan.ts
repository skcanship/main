/**
 * Lightweight sanity checks for training plan thresholds.
 * Run: npx tsx scripts/check-workout-plan.ts
 */
import { recommendTrainingPlan } from "../src/lib/workout-plan";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const heavy = recommendTrainingPlan({
  recoveryScore: 82,
  sleepPerformance: 90,
  sleepDurationHours: 7.5,
  todayStrain: 4,
  avgStrain7d: 10,
  workoutsLast7d: 2,
});
assert(heavy.intensity === "Heavy", `expected Heavy, got ${heavy.intensity}`);
assert(heavy.dayType === "Heavy strength", `expected Heavy strength, got ${heavy.dayType}`);

const moderate = recommendTrainingPlan({
  recoveryScore: 55,
  sleepPerformance: 85,
  sleepDurationHours: 7,
  todayStrain: 6,
  avgStrain7d: 11,
  workoutsLast7d: 3,
});
assert(moderate.intensity === "Moderate", `expected Moderate, got ${moderate.intensity}`);

const rest = recommendTrainingPlan({
  recoveryScore: 28,
  sleepPerformance: 55,
  sleepDurationHours: 5.5,
  todayStrain: 2,
  avgStrain7d: 15,
  workoutsLast7d: 5,
});
assert(rest.intensity === "Rest", `expected Rest, got ${rest.intensity}`);
assert(rest.dayType === "Rest", `expected Rest day type`);

console.log("workout-plan checks passed");
