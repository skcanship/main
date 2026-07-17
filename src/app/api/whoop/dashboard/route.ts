import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import {
  AuthRequiredError,
  fetchCycles,
  fetchProfile,
  fetchRecoveries,
  fetchSleeps,
  fetchWorkouts,
} from "@/lib/whoop/client";
import { buildDashboardData } from "@/lib/whoop/dashboard";

/**
 * GET /api/whoop/dashboard
 * Aggregates recovery, sleep, strain, workouts + training plan recommendation.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session.tokens?.accessToken) {
      return NextResponse.json({ error: "Not connected to WHOOP" }, { status: 401 });
    }

    const [recoveries, sleeps, cycles, workouts] = await Promise.all([
      fetchRecoveries(25),
      fetchSleeps(25),
      fetchCycles(25),
      fetchWorkouts(25),
    ]);

    let profile = session.user
      ? {
          first_name: session.user.firstName,
          last_name: session.user.lastName,
          email: session.user.email,
        }
      : null;

    if (!profile) {
      try {
        const p = await fetchProfile();
        profile = {
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
        };
        session.user = {
          userId: p.user_id,
          firstName: p.first_name,
          lastName: p.last_name,
          email: p.email,
        };
        await session.save();
      } catch {
        profile = null;
      }
    }

    const payload = buildDashboardData({
      recoveries: recoveries.records,
      sleeps: sleeps.records,
      cycles: cycles.records,
      workouts: workouts.records,
      user: profile,
    });

    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Failed to build dashboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
