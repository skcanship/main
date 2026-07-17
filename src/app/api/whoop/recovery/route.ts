import { NextResponse } from "next/server";
import { AuthRequiredError, fetchRecoveries } from "@/lib/whoop/client";

/** GET /api/whoop/recovery — recent recovery metrics */
export async function GET() {
  try {
    const data = await fetchRecoveries(25);
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : "Failed to fetch recovery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
