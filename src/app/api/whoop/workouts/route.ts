import { NextResponse } from "next/server";
import { AuthRequiredError, fetchWorkouts } from "@/lib/whoop/client";

/** GET /api/whoop/workouts — recent workout summaries */
export async function GET() {
  try {
    const data = await fetchWorkouts(25);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch workouts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
