import { NextResponse } from "next/server";
import { AuthRequiredError, fetchCycles, fetchWorkouts } from "@/lib/whoop/client";

/**
 * GET /api/whoop/strain — daily strain (from cycles) + key workout summaries
 */
export async function GET() {
  try {
    const [cycles, workouts] = await Promise.all([fetchCycles(25), fetchWorkouts(10)]);
    return NextResponse.json({
      cycles: cycles.records,
      workouts: workouts.records,
      next_token: cycles.next_token,
    });
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch strain";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
