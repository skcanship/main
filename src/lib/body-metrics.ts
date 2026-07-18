export type BodyMetrics = {
  heightFeet: number;
  heightInches: number;
  weightLbs: number;
};

export type WeightEntry = {
  date: string;
  weightLbs: number;
};

export const DEFAULT_BODY: BodyMetrics = {
  heightFeet: 6,
  heightInches: 0,
  weightLbs: 160,
};

const STORAGE_KEY = "ok_body_metrics_v1";

export function heightLabel(m: BodyMetrics): string {
  return `${m.heightFeet}'${m.heightInches}"`;
}

export function calcBmi(m: BodyMetrics): number {
  const totalInches = m.heightFeet * 12 + m.heightInches;
  const meters = totalInches * 0.0254;
  const kg = m.weightLbs * 0.453592;
  if (meters <= 0) return 0;
  return Math.round((kg / (meters * meters)) * 10) / 10;
}

export function loadBodyState(): { metrics: BodyMetrics; history: WeightEntry[] } {
  if (typeof window === "undefined") {
    return {
      metrics: DEFAULT_BODY,
      history: [{ date: new Date().toISOString().slice(0, 10), weightLbs: DEFAULT_BODY.weightLbs }],
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const metrics = DEFAULT_BODY;
      const history = [{ date: new Date().toISOString().slice(0, 10), weightLbs: metrics.weightLbs }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ metrics, history }));
      return { metrics, history };
    }
    const parsed = JSON.parse(raw) as { metrics: BodyMetrics; history: WeightEntry[] };
    return {
      metrics: { ...DEFAULT_BODY, ...parsed.metrics },
      history: parsed.history?.length
        ? parsed.history
        : [{ date: new Date().toISOString().slice(0, 10), weightLbs: parsed.metrics?.weightLbs ?? 160 }],
    };
  } catch {
    return {
      metrics: DEFAULT_BODY,
      history: [{ date: new Date().toISOString().slice(0, 10), weightLbs: DEFAULT_BODY.weightLbs }],
    };
  }
}

export function saveBodyState(metrics: BodyMetrics, history: WeightEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ metrics, history }));
}

export function logWeight(current: BodyMetrics, history: WeightEntry[], weightLbs: number) {
  const date = new Date().toISOString().slice(0, 10);
  const metrics = { ...current, weightLbs };
  const filtered = history.filter((h) => h.date !== date);
  const nextHistory = [...filtered, { date, weightLbs }].sort((a, b) => a.date.localeCompare(b.date));
  saveBodyState(metrics, nextHistory);
  return { metrics, history: nextHistory };
}
