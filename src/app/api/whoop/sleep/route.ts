import { NextResponse } from "next/server";
import { AuthRequiredError, fetchSleeps } from "@/lib/whoop/client";

/** GET /api/whoop/sleep — recent sleep metrics */
export async function GET() {
  try {
    const data = await fetchSleeps(25);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch sleep";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
