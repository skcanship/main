/**
 * Sanity checks for split + training plan.
 * Run: npm run check:plan
 */
import { recommendTrainingPlan } from "../src/lib/workout-plan";
import { buildSplitAgenda, decideSplitAction } from "../src/lib/split-plan";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const restDev = decideSplitAction({
  scheduled: "Legs + Core",
  recoveryScore: 28,
  sleepPerformance: 60,
  isPast: false,
  hadWorkout: false,
});
assert(restDev.action === "DEVIATE_REST", `expected DEVIATE_REST, got ${restDev.action}`);

const light = decideSplitAction({
  scheduled: "Back & Bis + Cardio",
  recoveryScore: 45,
  sleepPerformance: 80,
  isPast: false,
  hadWorkout: false,
});
assert(light.action === "DEVIATE_LIGHT", `expected DEVIATE_LIGHT, got ${light.action}`);

const go = decideSplitAction({
  scheduled: "Chest / Shoulders / Tris + Cardio",
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
  splitDay: "Back & Bis + Cardio",
  splitAction: "EXECUTE",
});
assert(plan.splitDay === "Back & Bis + Cardio", "split day should pass through");
assert(
  plan.exercises.some((e) => e.name.toLowerCase().includes("cardio")),
  "back day should include cardio"
);

const legs = recommendTrainingPlan({
  recoveryScore: 75,
  sleepPerformance: 85,
  sleepDurationHours: 7,
  todayStrain: 5,
  avgStrain7d: 10,
  workoutsLast7d: 3,
  splitDay: "Legs + Core",
  splitAction: "EXECUTE",
});
assert(
  legs.exercises.some((e) => e.name.toLowerCase().includes("plank") || e.name.toLowerCase().includes("knee")),
  "legs should include core"
);
assert(
  !legs.exercises.some((e) => e.name.toLowerCase().includes("zone 2")),
  "no cardio finisher on leg day"
);

const agenda = buildSplitAgenda({
  todayIso: "2026-07-17",
  recoveriesByDate: new Map([["2026-07-17", 70]]),
  sleepPerfByDate: new Map(),
  strainByDate: new Map(),
  workoutsByDate: new Map(),
  pastDays: 1,
  futureDays: 2,
});
assert(agenda.today.scheduled === "Stretch / Mobility", `today should be Stretch / Mobility, got ${agenda.today.scheduled}`);
const tomorrow = agenda.days.find((d) => d.date === "2026-07-18");
assert(tomorrow?.scheduled === "Back & Bis + Cardio", `tomorrow should be Back & Bis + Cardio, got ${tomorrow?.scheduled}`);

console.log("workout-plan + split checks passed");
