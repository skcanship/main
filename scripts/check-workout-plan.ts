/**
 * Lightweight sanity checks for training plan + split thresholds.
 * Run: npm run check:plan
 */
import { recommendTrainingPlan } from "../src/lib/workout-plan";
import { buildSplitAgenda, decideSplitAction } from "../src/lib/split-plan";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const restDev = decideSplitAction({
  scheduled: "Legs",
  recoveryScore: 28,
  sleepPerformance: 60,
  isPast: false,
  hadWorkout: false,
});
assert(restDev.action === "DEVIATE_REST", `expected DEVIATE_REST, got ${restDev.action}`);

const light = decideSplitAction({
  scheduled: "Back & Bis",
  recoveryScore: 45,
  sleepPerformance: 80,
  isPast: false,
  hadWorkout: false,
});
assert(light.action === "DEVIATE_LIGHT", `expected DEVIATE_LIGHT, got ${light.action}`);

const go = decideSplitAction({
  scheduled: "Chest / Shoulders / Tris",
  recoveryScore: 78,
  sleepPerformance: 90,
  isPast: false,
  hadWorkout: false,
});
assert(go.action === "EXECUTE", `expected EXECUTE, got ${go.action}`);

const plan = recommendTrainingPlan({
  recoveryScore: 80,
  sleepPerformance: 90,
  sleepDurationHours: 7.5,
  todayStrain: 4,
  avgStrain7d: 10,
  workoutsLast7d: 2,
  splitDay: "Back & Bis",
  splitAction: "EXECUTE",
});
assert(plan.splitDay === "Back & Bis", "split day should pass through");
assert(plan.exercises.length > 0, "should have exercises");

const agenda = buildSplitAgenda({
  todayIso: "2026-07-17",
  cycleAnchorIso: "2026-01-05",
  recoveriesByDate: new Map([["2026-07-17", 30]]),
  sleepPerfByDate: new Map([["2026-07-17", 55]]),
  strainByDate: new Map(),
  workoutsByDate: new Map(),
  pastDays: 2,
  futureDays: 2,
});
assert(agenda.today.action === "DEVIATE_REST" || agenda.today.scheduled === "Rest", "low recovery should rest or be rest day");

console.log("workout-plan + split checks passed");
