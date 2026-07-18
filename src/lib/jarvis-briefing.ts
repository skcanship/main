import type { DashboardPayload } from "@/lib/whoop/dashboard";
import { isStretchDay } from "@/lib/split-plan";

export type JarvisBriefing = {
  greeting: string;
  recoveryLine: string;
  intensityLine: string;
  liftLine: string;
  verdict: "GO" | "MODERATE" | "LIGHT" | "REST";
  statusLabel: string;
};

function recoveryQuality(score: number | null): { word: string; detail: string } {
  if (score == null) {
    return { word: "unknown", detail: "Recovery signal is still calibrating — proceed with caution." };
  }
  if (score >= 67) {
    return { word: "strong", detail: `Recovery is reading ${score} — green across the board.` };
  }
  if (score >= 34) {
    return { word: "moderate", detail: `Recovery is reading ${score} — workable, but not peak.` };
  }
  return { word: "low", detail: `Recovery is reading ${score} — systems are under-recovered.` };
}

/**
 * Build a short JARVIS-style spoken briefing from WHOOP + split protocol.
 */
export function buildJarvisBriefing(data: DashboardPayload): JarvisBriefing {
  const name = data.user?.firstName || "sir";
  const recovery = data.today.recoveryScore;
  const sleep = data.today.sleepPerformance;
  const hrv = data.today.hrvMs;
  const scheduled = data.split.today.scheduled;
  const action = data.split.today.action;
  const intensity = data.plan.intensity;
  const { word, detail } = recoveryQuality(recovery);

  const sleepBit =
    sleep != null ? ` Sleep performance ${sleep}%.` : "";
  const hrvBit = hrv != null ? ` HRV ${hrv} ms.` : "";

  const recoveryLine = `${detail}${sleepBit}${hrvBit}`;

  let verdict: JarvisBriefing["verdict"];
  let intensityLine: string;
  let statusLabel: string;

  if (action === "DEVIATE_REST" || (isStretchDay(scheduled) && intensity === "Rest")) {
    verdict = "REST";
    statusLabel = "REST PROTOCOL";
    intensityLine = isStretchDay(scheduled)
      ? "Recommendation: take today as Stretch / Mobility — no heavy lifts, no structured cardio."
      : `Recommendation: rest / mobility instead of ${scheduled}. Recovery does not support a hard session.`;
  } else if (action === "DEVIATE_LIGHT" || intensity === "Light") {
    verdict = "LIGHT";
    statusLabel = "LIGHT INTENSITY";
    intensityLine = `Recommendation: light intensity only. Cut volume ~40% on ${scheduled}.`;
  } else if (intensity === "Moderate" || (recovery != null && recovery < 70)) {
    verdict = "MODERATE";
    statusLabel = "MODERATE INTENSITY";
    intensityLine = `Recommendation: moderate intensity. Train ${scheduled} with 1–2 reps in reserve.`;
  } else {
    verdict = "GO";
    statusLabel = "FULL INTENSITY";
    intensityLine = `Recommendation: full intensity authorized. Execute ${scheduled} as planned.`;
  }

  // Day's lift — clear one-liner
  let liftLine: string;
  if (verdict === "REST" || isStretchDay(scheduled)) {
    liftLine = "Today's work: Stretch / Mobility (no primary lift).";
  } else if (scheduled.startsWith("Back & Bis")) {
    liftLine = "Today's lift: Back & Bis (+ Zone 2 cardio finisher).";
  } else if (scheduled.startsWith("Chest")) {
    liftLine = "Today's lift: Chest / Shoulders / Tris (+ Zone 2 cardio finisher).";
  } else if (scheduled.startsWith("Legs")) {
    liftLine = "Today's lift: Legs + Core (no cardio after legs).";
  } else {
    liftLine = `Today's lift: ${scheduled}.`;
  }

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return {
    greeting: `Good ${timeOfDay}, ${name}. ShankoFIT online.`,
    recoveryLine: `Recovery status: ${word}. ${recoveryLine}`,
    intensityLine,
    liftLine,
    verdict,
    statusLabel,
  };
}
